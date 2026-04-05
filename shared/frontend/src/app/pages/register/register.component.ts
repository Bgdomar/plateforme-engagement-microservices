import { Component, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AiService } from '../../services/ai.service';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy {
  currentStep = 1;

  // Fields
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'USER';
  educationLevel = '';
  school = '';
  educationLevels = [
    { value: 'Bac+2', label: 'Bac+2', icon: '2' },
    { value: 'Bac+3', label: 'Bac+3', icon: '3' },
    { value: 'Bac+4', label: 'Bac+4', icon: '4' },
    { value: 'Bac+5', label: 'Bac+5', icon: '5' },
    { value: 'Doctorat', label: 'Doctorat', icon: 'D' }
  ];
  birthDate = '';
  birthDay = '';
  birthMonth = '';
  birthYear = '';

  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];
  years: number[] = [];

  constructor(
    private authService: AuthService,
    private aiService: AiService,
    private router: Router,
    private ngZone: NgZone
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 16; y >= currentYear - 60; y--) {
      this.years.push(y);
    }
  }

  updateBirthDate(): void {
    if (this.birthDay && this.birthMonth && this.birthYear) {
      const day = this.birthDay.toString().padStart(2, '0');
      this.birthDate = `${this.birthYear}-${this.birthMonth}-${day}`;
    } else {
      this.birthDate = '';
    }
  }

  // UI state
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  showConfirmPassword = false;

  // Face capture state
  showCamera = false;
  faceCaptured = false;
  capturedImageUrl: string | null = null;
  capturedImageBlob: Blob | null = null;
  faceDetected = false;
  faceConfidence = 0;
  detectionStatus = '';

  // MediaPipe state
  private faceDetector: FaceDetector | null = null;
  private animationFrameId: number | null = null;
  private mediapipeReady = false;


  ngOnDestroy(): void {
    this.stopCamera();
    this.faceDetector?.close();
  }

  private async initMediaPipe(): Promise<void> {
    if (this.mediapipeReady) return;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      this.faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5
      });
      this.mediapipeReady = true;
    } catch (err) {
      console.error('MediaPipe init error:', err);
      this.mediapipeReady = false;
    }
  }

  // ── Step navigation ──────────────────────────────────

  nextStep(): void {
    this.error = '';
    if (this.currentStep === 1) {
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (this.validateStep2()) {
        this.currentStep = 3;
      }
    }
  }

  prevStep(): void {
    this.error = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFormSubmit(event: Event): void {
    event.preventDefault();
  }

  // ── Validation ──────────────────────────────────

  private validateStep2(): boolean {
    if (!this.firstName || !this.lastName) {
      this.error = 'Veuillez remplir votre prénom et nom';
      return false;
    }
    if (this.role === 'USER') {
      if (!this.school || !this.educationLevel || !this.birthDate) {
        this.error = 'Veuillez remplir tous les champs du stagiaire';
        return false;
      }
    }
    return true;
  }

  private validateStep3(): boolean {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir l\'email et le mot de passe';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Veuillez entrer une adresse email valide';
      return false;
    }
    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return false;
    }
    return true;
  }

  // ── Step 3: Submit registration ──────────────────────────────────

  submitRegistration(): void {
    this.error = '';
    this.success = '';
    if (!this.validateStep3()) return;

    this.loading = true;
    console.log('[Register] Submitting registration...');

    const payload: any = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.role
    };

    if (this.role === 'USER') {
      payload.educationLevel = this.educationLevel;
      payload.school = this.school;
      payload.birthDate = this.birthDate;
    }

    // Safety timeout: reset loading after 15s if no response
    const safetyTimer = setTimeout(() => {
      if (this.loading) {
        console.warn('[Register] Safety timeout reached - resetting loading state');
        this.ngZone.run(() => {
          this.loading = false;
          this.error = 'La requête a pris trop de temps. Veuillez réessayer.';
        });
      }
    }, 15000);

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        clearTimeout(safetyTimer);
        console.log('[Register] Success response:', res);
        this.ngZone.run(() => {
          this.loading = false;
          if (this.authService.isLoggedIn()) {
            this.success = 'Compte créé avec succès !';
            this.currentStep = 4;
          } else {
            this.success = 'Compte créé ! Redirection vers la connexion...';
            setTimeout(() => this.router.navigate(['/login']), 2500);
          }
        });
      },
      error: (err) => {
        clearTimeout(safetyTimer);
        console.error('[Register] Error response:', err);
        this.ngZone.run(() => {
          this.loading = false;
          const msg = err.error?.message || '';
          if (msg.includes('Email already exists') || msg.includes('already exists')) {
            this.error = 'Cet email est déjà utilisé. Veuillez en choisir un autre ou vous connecter.';
          } else {
            this.error = msg || 'Une erreur est survenue lors de la création du compte.';
          }
        });
      }
    });
  }

  // ── Step 4: Camera & face registration ──────────────────────────────────

  async activateCamera(): Promise<void> {
    this.showCamera = true;
    this.faceDetected = false;
    this.detectionStatus = 'Initialisation...';

    await this.initMediaPipe();

    setTimeout(() => this.startCameraStream(), 200);
  }

  private async startCameraStream(): Promise<void> {
    const videoEl = document.getElementById('cameraVideo') as HTMLVideoElement;
    if (!videoEl) {
      this.error = 'Élément vidéo non trouvé.';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      videoEl.srcObject = stream;
      await videoEl.play();

      this.startDetectionLoop(videoEl);
    } catch {
      this.error = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
      this.showCamera = false;
    }
  }

  private startDetectionLoop(videoEl: HTMLVideoElement): void {
    if (!this.mediapipeReady || !this.faceDetector) {
      this.detectionStatus = 'Détection basique';
      this.faceDetected = true;
      return;
    }

    this.detectionStatus = 'Recherche du visage...';

    const detectFrame = () => {
      if (!this.showCamera || this.faceCaptured || !this.faceDetector) return;

      // Skip detection if video has no frame data yet
      if (!videoEl.videoWidth || !videoEl.videoHeight || videoEl.readyState < 2) {
        requestAnimationFrame(detectFrame);
        return;
      }

      try {
        const detections = this.faceDetector.detectForVideo(videoEl, performance.now());

        // Draw overlay
        const overlay = document.getElementById('registerOverlay') as HTMLCanvasElement;
        if (overlay && videoEl.videoWidth) {
          overlay.width = videoEl.videoWidth;
          overlay.height = videoEl.videoHeight;
          const ctx = overlay.getContext('2d')!;
          ctx.clearRect(0, 0, overlay.width, overlay.height);

          if (detections.detections.length > 0) {
            for (const det of detections.detections) {
              const bb = det.boundingBox!;
              const color = detections.detections.length === 1 ? '#10b981' : '#ecc94b';
              ctx.strokeStyle = color;
              ctx.lineWidth = 3;
              ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);

              // Corner accents
              const cl = 20;
              ctx.lineWidth = 4;
              ctx.beginPath(); ctx.moveTo(bb.originX, bb.originY + cl); ctx.lineTo(bb.originX, bb.originY); ctx.lineTo(bb.originX + cl, bb.originY); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(bb.originX + bb.width - cl, bb.originY); ctx.lineTo(bb.originX + bb.width, bb.originY); ctx.lineTo(bb.originX + bb.width, bb.originY + cl); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(bb.originX, bb.originY + bb.height - cl); ctx.lineTo(bb.originX, bb.originY + bb.height); ctx.lineTo(bb.originX + cl, bb.originY + bb.height); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(bb.originX + bb.width - cl, bb.originY + bb.height); ctx.lineTo(bb.originX + bb.width, bb.originY + bb.height); ctx.lineTo(bb.originX + bb.width, bb.originY + bb.height - cl); ctx.stroke();

              const conf = Math.round((det.categories?.[0]?.score ?? 0) * 100);
              ctx.fillStyle = color;
              ctx.font = 'bold 14px sans-serif';
              ctx.fillText(`${conf}%`, bb.originX + 4, bb.originY - 6);
            }
          }
        }

        this.ngZone.run(() => {
          const count = detections.detections.length;
          if (count === 1) {
            this.faceDetected = true;
            this.faceConfidence = Math.round((detections.detections[0].categories?.[0]?.score ?? 0) * 100);
            this.detectionStatus = `Visage détecté (${this.faceConfidence}%)`;
          } else if (count > 1) {
            this.faceDetected = false;
            this.detectionStatus = `${count} visages — un seul requis`;
          } else {
            this.faceDetected = false;
            this.detectionStatus = 'Recherche du visage...';
          }
        });
      } catch {
        // Ignore frame errors
      }

      this.animationFrameId = requestAnimationFrame(detectFrame);
    };

    if (videoEl.readyState >= 2) {
      detectFrame();
    } else {
      videoEl.addEventListener('loadeddata', () => detectFrame(), { once: true });
    }
  }

  private stopDetectionLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  capturePhoto(): void {
    if (!this.faceDetected && this.mediapipeReady) {
      this.error = 'Aucun visage détecté. Placez votre visage face à la caméra.';
      return;
    }

    const videoEl = document.getElementById('cameraVideo') as HTMLVideoElement;
    const canvasEl = document.getElementById('captureCanvas') as HTMLCanvasElement;
    if (!videoEl || !canvasEl) return;

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const ctx = canvasEl.getContext('2d');
    ctx?.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    canvasEl.toBlob((blob) => {
      if (blob) {
        this.capturedImageBlob = blob;
        this.capturedImageUrl = URL.createObjectURL(blob);
        this.faceCaptured = true;
        this.stopDetectionLoop();
        this.stopCameraStream();
      }
    }, 'image/jpeg', 0.9);
  }

  retakePhoto(): void {
    this.faceCaptured = false;
    if (this.capturedImageUrl) {
      URL.revokeObjectURL(this.capturedImageUrl);
      this.capturedImageUrl = null;
    }
    this.capturedImageBlob = null;
    this.activateCamera();
  }

  stopCamera(): void {
    this.stopDetectionLoop();
    this.stopCameraStream();
    this.showCamera = false;
    this.faceDetected = false;
  }

  private stopCameraStream(): void {
    const videoEl = document.getElementById('cameraVideo') as HTMLVideoElement;
    if (videoEl?.srcObject) {
      (videoEl.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoEl.srcObject = null;
    }
  }

  confirmFaceRegistration(): void {
    if (!this.capturedImageBlob) {
      this.error = 'Veuillez capturer votre visage';
      return;
    }

    const email = this.authService.getUserEmail();
    if (!email) {
      this.error = 'Session expirée. Veuillez vous reconnecter.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.aiService.registerFace(email, this.capturedImageBlob).subscribe({
      next: () => {
        this.authService.markFaceRegistered().subscribe({
          next: () => {
            this.loading = false;
            this.success = 'Visage enregistré avec succès !';
            setTimeout(() => this.router.navigate(['/dashboard']), 1200);
          },
          error: () => {
            this.loading = false;
            this.success = 'Visage enregistré !';
            setTimeout(() => this.router.navigate(['/dashboard']), 1200);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400 && err.error?.detail?.includes('Face already registered')) {
          this.authService.markFaceRegistered().subscribe();
          this.success = 'Votre visage est déjà configuré.';
          setTimeout(() => this.router.navigate(['/dashboard']), 1200);
        } else if (err.status === 400 && err.error?.detail?.includes('No face detected')) {
          this.error = 'Aucun visage détecté. Assurez-vous que votre visage est bien visible.';
        } else {
          this.error = 'Erreur lors de l\'enregistrement facial. Réessayez ou passez cette étape.';
        }
      }
    });
  }

  skipFaceRegistration(): void {
    this.router.navigate(['/dashboard']);
  }
}
