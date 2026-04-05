import { Component, OnDestroy, ElementRef, ViewChild, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AiService } from '../../services/ai.service';
import { AuthService } from '../../services/auth.service';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

@Component({
  selector: 'app-face-auth',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './face-auth.component.html'
})
export class FaceAuthComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  mode: 'verify' | 'register' = 'verify';
  stream: MediaStream | null = null;
  loading = false;
  cameraOn = false;
  result: { verified: boolean; message: string; success?: boolean } | null = null;
  error = '';

  // MediaPipe state
  faceDetected = false;
  faceCount = 0;
  faceConfidence = 0;
  detectionStatus = 'Initialisation...';
  private faceDetector: FaceDetector | null = null;
  private animationFrameId: number | null = null;
  private mediapipeReady = false;
  private autoVerifyTriggered = false;
  private consecutiveDetections = 0;
  private readonly AUTO_CAPTURE_THRESHOLD = 10;
  private destroyed = false;

  constructor(
    private aiService: AiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    await this.initMediaPipe();

    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    if (modeParam === 'register') {
      this.mode = 'register';
      return;
    }

    this.startCamera('verify');
  }

  skipForNow() {
    this.router.navigate(['/dashboard']);
  }

  private async initMediaPipe(): Promise<void> {
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
      console.log('MediaPipe FaceDetector initialized successfully');
    } catch (err) {
      console.error('MediaPipe init error:', err);
      this.mediapipeReady = false;
    }
  }

  async startCamera(mode: 'verify' | 'register' = 'verify') {
    this.mode = mode;
    this.autoVerifyTriggered = false;
    this.consecutiveDetections = 0;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      this.videoEl.nativeElement.srcObject = this.stream;
      await this.videoEl.nativeElement.play();
      this.cameraOn = true;
      this.result = null;
      this.error = '';
      this.faceDetected = false;
      this.detectionStatus = 'Recherche du visage...';

      // Start detection loop
      this.startDetectionLoop();
    } catch (err) {
      this.error = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
    }
  }

  private startDetectionLoop(): void {
    if (!this.mediapipeReady || !this.faceDetector) {
      // Fallback: no MediaPipe, use timeout-based approach
      this.detectionStatus = 'Détection basique (MediaPipe non disponible)';
      if (this.mode === 'verify') {
        setTimeout(() => {
          if (this.cameraOn && !this.loading && !this.result) {
            this.captureAndVerify();
          }
        }, 3000);
      }
      return;
    }

    const video = this.videoEl.nativeElement;

    const detectFrame = () => {
      if (this.destroyed || !this.cameraOn || !this.faceDetector || this.loading) return;

      // Skip detection if video has no frame data yet
      if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
        this.animationFrameId = requestAnimationFrame(detectFrame);
        return;
      }

      try {
        const detections = this.faceDetector.detectForVideo(video, performance.now());
        const overlay = this.overlayCanvas?.nativeElement;

        if (overlay && video.videoWidth) {
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
          const ctx = overlay.getContext('2d')!;
          ctx.clearRect(0, 0, overlay.width, overlay.height);

          if (detections.detections.length > 0) {
            for (const det of detections.detections) {
              const bb = det.boundingBox!;
              // Draw bounding box
              ctx.strokeStyle = detections.detections.length === 1 ? '#10b981' : '#ecc94b';
              ctx.lineWidth = 3;
              ctx.setLineDash([]);
              ctx.strokeRect(bb.originX, bb.originY, bb.width, bb.height);

              // Draw corner accents
              const cornerLen = 20;
              ctx.strokeStyle = detections.detections.length === 1 ? '#10b981' : '#ecc94b';
              ctx.lineWidth = 4;
              // Top-left
              ctx.beginPath(); ctx.moveTo(bb.originX, bb.originY + cornerLen); ctx.lineTo(bb.originX, bb.originY); ctx.lineTo(bb.originX + cornerLen, bb.originY); ctx.stroke();
              // Top-right
              ctx.beginPath(); ctx.moveTo(bb.originX + bb.width - cornerLen, bb.originY); ctx.lineTo(bb.originX + bb.width, bb.originY); ctx.lineTo(bb.originX + bb.width, bb.originY + cornerLen); ctx.stroke();
              // Bottom-left
              ctx.beginPath(); ctx.moveTo(bb.originX, bb.originY + bb.height - cornerLen); ctx.lineTo(bb.originX, bb.originY + bb.height); ctx.lineTo(bb.originX + cornerLen, bb.originY + bb.height); ctx.stroke();
              // Bottom-right
              ctx.beginPath(); ctx.moveTo(bb.originX + bb.width - cornerLen, bb.originY + bb.height); ctx.lineTo(bb.originX + bb.width, bb.originY + bb.height); ctx.lineTo(bb.originX + bb.width, bb.originY + bb.height - cornerLen); ctx.stroke();

              // Confidence label
              const conf = Math.round((det.categories?.[0]?.score ?? 0) * 100);
              ctx.fillStyle = '#10b981';
              ctx.font = 'bold 14px sans-serif';
              ctx.fillText(`${conf}%`, bb.originX + 4, bb.originY - 6);
            }
          }
        }

        // Update state in Angular zone
        this.ngZone.run(() => {
          const count = detections.detections.length;
          this.faceCount = count;
          if (count === 1) {
            this.faceDetected = true;
            this.faceConfidence = Math.round((detections.detections[0].categories?.[0]?.score ?? 0) * 100);
            this.detectionStatus = `Visage détecté (${this.faceConfidence}%)`;
            this.consecutiveDetections++;
          } else if (count > 1) {
            this.faceDetected = false;
            this.detectionStatus = `${count} visages détectés — un seul visage requis`;
            this.consecutiveDetections = 0;
          } else {
            this.faceDetected = false;
            this.detectionStatus = 'Recherche du visage...';
            this.consecutiveDetections = 0;
          }

          // Auto-capture in verify mode after stable detection
          if (this.mode === 'verify' && !this.autoVerifyTriggered && this.consecutiveDetections >= this.AUTO_CAPTURE_THRESHOLD) {
            this.autoVerifyTriggered = true;
            this.captureAndVerify();
          }
        });
        this.animationFrameId = requestAnimationFrame(detectFrame);
      } catch (e) {
        // Stop loop if detector was destroyed, otherwise retry
        if (!this.destroyed && this.cameraOn) {
          this.animationFrameId = requestAnimationFrame(detectFrame);
        }
      }
    };

    // Wait for video to be ready, then start
    if (video.readyState >= 2) {
      detectFrame();
    } else {
      video.addEventListener('loadeddata', () => detectFrame(), { once: true });
    }
  }

  captureAndRegister() {
    console.log('Capture et enregistrement du visage...');
    if (!this.faceDetected && this.mediapipeReady) {
      this.error = 'Aucun visage détecté. Placez votre visage face à la caméra.';
      return;
    }

    const blob = this.getCanvasBlob();
    if (!blob) {
      this.error = 'Impossible de capturer l\'image du canvas.';
      return;
    }

    this.loading = true;
    this.stopDetectionLoop();

    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = "Le service d'enregistrement ne répond pas. Veuillez réessayer.";
        this.startDetectionLoop();
      }
    }, 10000);

    setTimeout(() => {
      const email = this.authService.getUserEmail();
      if (!email) {
        clearTimeout(safetyTimeout);
        this.error = 'Veuillez vous connecter d\'abord pour enregistrer votre visage.';
        this.loading = false;
        this.startDetectionLoop();
        return;
      }

      this.aiService.registerFace(email, blob).subscribe({
        next: () => {
          clearTimeout(safetyTimeout);
          this.authService.markFaceRegistered().subscribe({
            next: () => {
              this.loading = false;
              this.result = { verified: true, message: 'Visage configuré avec succès !', success: true };
              this.stopCamera();
              setTimeout(() => this.router.navigate(['/dashboard']), 1200);
            },
            error: () => {
              this.loading = false;
              this.result = { verified: true, message: 'Visage configuré, mais échec de synchronisation FaceID.', success: true };
              this.stopCamera();
              setTimeout(() => this.router.navigate(['/dashboard']), 1200);
            }
          });
        },
        error: (err) => {
          clearTimeout(safetyTimeout);
          this.loading = false;
          if (err.status === 400 && err.error?.detail?.includes('Face already registered')) {
            this.authService.markFaceRegistered().subscribe({
              next: () => {
                this.result = { verified: true, message: 'Votre visage est déjà configuré dans le système.', success: true };
                this.stopCamera();
                setTimeout(() => this.router.navigate(['/dashboard']), 1200);
              },
              error: () => {
                this.result = { verified: true, message: 'Votre visage est déjà configuré dans le système.', success: true };
                this.stopCamera();
                setTimeout(() => this.router.navigate(['/dashboard']), 1200);
              }
            });
          } else if (err.status === 400 && err.error?.detail?.includes('No face detected')) {
            this.error = 'Aucun visage détecté par le serveur. Assurez-vous que votre visage est bien visible.';
            this.startDetectionLoop();
          } else {
            this.error = this.parseErrorMessage(err);
            this.startDetectionLoop();
          }
        }
      });
    }, 1000);
  }

  captureAndVerify() {
    const blob = this.getCanvasBlob();
    if (!blob) return;

    this.loading = true;
    this.stopDetectionLoop();

    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = "Le service d'identification ne répond pas. Veuillez réessayer.";
        this.startDetectionLoop();
      }
    }, 10000);

    setTimeout(() => {
      console.log('Sending FaceID identification request to AI service...');
      this.aiService.identifyFace(blob).subscribe({
        next: (idRes: any) => {
          clearTimeout(safetyTimeout);
          console.log('FaceID identification result:', idRes);
          if (idRes.identified) {
            this.authService.biometricLogin(idRes.user_email).subscribe({
              next: () => {
                this.loading = false;
                this.result = {
                  verified: true,
                  message: `Reconnu avec succès : ${idRes.user_email}`
                };
                this.stopCamera();
                setTimeout(() => this.router.navigate(['/dashboard']), 2000);
              },
              error: (authErr) => {
                this.loading = false;
                const msg = authErr.error?.message || "Erreur d'accès biométrique.";
                this.error = `Utilisateur reconnu mais : ${msg}`;
                console.error('IAM Biometric Error:', authErr);
                this.startDetectionLoop();
              }
            });
          } else {
            this.loading = false;
            this.result = { verified: false, message: 'Visage non reconnu dans la base.' };
            this.startDetectionLoop();
          }
        },
        error: (err) => {
          clearTimeout(safetyTimeout);
          this.loading = false;
          this.error = this.parseErrorMessage(err);
          this.startDetectionLoop();
        }
      });
    }, 1000);
  }

  private parseErrorMessage(err: any): string {
    const errorBody = err.error;
    if (!errorBody) return 'Une erreur inconnue est survenue.';

    if (errorBody.detail === 'Face already registered for this user') {
      return 'Votre visage est déjà enregistré dans notre système. Vous pouvez l\'utiliser pour vous connecter directement !';
    }

    if (Array.isArray(errorBody.detail)) {
      return errorBody.detail.map((d: any) => d.msg).join(', ');
    }

    return errorBody.detail || errorBody.message || 'Erreur lors de l\'opération.';
  }

  private getCanvasBlob(): Blob | null {
    const video = this.videoEl.nativeElement;
    const canvas = this.canvas.nativeElement;
    if (!video.videoWidth) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }

  private stopDetectionLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  stopCamera() {
    this.stopDetectionLoop();
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.cameraOn = false;
    this.faceDetected = false;
    this.consecutiveDetections = 0;
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stopCamera();
    if (this.faceDetector) {
      try { this.faceDetector.close(); } catch (_) {}
      this.faceDetector = null;
    }
  }
}
