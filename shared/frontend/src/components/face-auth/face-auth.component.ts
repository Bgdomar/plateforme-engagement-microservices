import { Component, OnDestroy, ElementRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FacialAIService, IdentifyFaceResponse, RegisterFaceResponse } from '../../services/facial-ai.service';
import { AuthService } from '../../services/auth.service';

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

  // États pour la capture
  private captureFramesList: Blob[] = [];
  private captureTimeout: ReturnType<typeof setTimeout> | null = null;
  protected isCapturing = false;

  // Configuration de capture — identique au register
  private readonly FRAMES_TO_CAPTURE = 30;
  private readonly CAPTURE_DURATION_MS = 3000;
  private readonly MIN_BLINKS_REQUIRED = 2;

  captureProgress = 0;
  framesCollected = 0;

  // Détection de visage locale (sans appel API en boucle)
  faceDetected = false;
  faceCount = 0;
  faceConfidence = 0;
  detectionStatus = 'Recherche du visage...';

  constructor(
    private facialAI: FacialAIService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    this.mode = modeParam === 'register' ? 'register' : 'verify';

    if (this.mode === 'verify') {
      setTimeout(() => this.startCamera('verify'), 500);
    }
  }

  skipForNow() {
    this.router.navigate(['/dashboard']);
  }

  // ═══════════════════════════════════════════════════════════
  // GESTION CAMÉRA
  // ═══════════════════════════════════════════════════════════

  async startCamera(mode: 'verify' | 'register' = 'verify') {
    this.mode = mode;
    this.error = '';
    this.result = null;
    this.captureFramesList = [];
    this.captureProgress = 0;
    this.framesCollected = 0;
    this.isCapturing = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });

      this.videoEl.nativeElement.srcObject = this.stream;
      await this.videoEl.nativeElement.play();
      this.cameraOn = true;

      // ✅ Même logique que register : on simule la détection avec un délai,
      // sans aucun appel API en boucle
      this.startFaceDetection();

    } catch (err) {
      this.error = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
      console.error('Camera error:', err);
    }
    this.cdr.detectChanges();
  }

  stopCamera() {
    this.stopCapture();

    if (this.captureTimeout) {
      clearTimeout(this.captureTimeout);
      this.captureTimeout = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoEl?.nativeElement) {
      this.videoEl.nativeElement.srcObject = null;
    }

    this.cameraOn = false;
    this.faceDetected = false;
    this.detectionStatus = 'Caméra arrêtée';
    this.cdr.detectChanges();
  }

  // ═══════════════════════════════════════════════════════════
  // DÉTECTION DE VISAGE — SANS APPEL API EN BOUCLE
  // Même logique que le RegisterComponent : délai fixe de 2s
  // ═══════════════════════════════════════════════════════════

  private startFaceDetection(): void {
    this.detectionStatus = 'Caméra activée. Positionnez votre visage...';
    this.faceDetected = false;
    this.cdr.detectChanges();

    // ✅ Attendre 2 secondes (le temps que l'utilisateur se positionne),
    // puis déclencher la capture automatiquement — pas d'appel API ici
    this.captureTimeout = setTimeout(() => {
      if (this.cameraOn && !this.isCapturing && !this.loading && !this.result) {
        this.faceDetected = true;
        this.detectionStatus = 'Visage détecté — Démarrage de la capture...';
        this.cdr.detectChanges();

        // En mode verify, la capture démarre automatiquement
        if (this.mode === 'verify') {
          setTimeout(() => this.startAutoCapture(), 500);
        }
      }
    }, 2000);
  }

  // ═══════════════════════════════════════════════════════════
  // CAPTURE DE FRAMES — Même logique que register
  // ═══════════════════════════════════════════════════════════

  private startAutoCapture(): void {
    if (this.isCapturing || this.loading || this.faceCaptured) return;
    this.startFrameCapture();
  }

  // Propriété interne pour éviter double capture
  private get faceCaptured(): boolean {
    return !!this.result;
  }

  startFrameCapture(): void {
    if (this.isCapturing || this.loading) return;

    this.isCapturing = true;
    this.captureFramesList = [];
    this.captureProgress = 0;
    this.framesCollected = 0;
    this.detectionStatus = 'Capture en cours... Clignez naturellement des yeux';
    this.cdr.detectChanges();

    const frameInterval = this.CAPTURE_DURATION_MS / this.FRAMES_TO_CAPTURE;
    let frameIndex = 0;

    const captureFrame = () => {
      if (!this.isCapturing || !!this.result) return;

      const frame = this.captureCurrentFrame();
      if (frame) {
        this.captureFramesList.push(frame);
        this.framesCollected = this.captureFramesList.length;
        this.captureProgress = Math.round((frameIndex + 1) / this.FRAMES_TO_CAPTURE * 100);
        this.cdr.detectChanges();
      }

      frameIndex++;

      if (frameIndex < this.FRAMES_TO_CAPTURE) {
        setTimeout(captureFrame, frameInterval);
      } else {
        this.onCaptureComplete();
      }
    };

    captureFrame();
  }

  private onCaptureComplete(): void {
    console.log('✅ Capture terminée:', this.captureFramesList.length, 'frames');
    this.isCapturing = false;
    this.cdr.detectChanges();

    if (this.mode === 'register') {
      this.registerFace();
    } else {
      this.verifyFace();
    }
  }

  private stopCapture(): void {
    this.isCapturing = false;
    this.captureProgress = 0;
    this.framesCollected = 0;
  }

  private captureCurrentFrame(): Blob | null {
    const video = this.videoEl?.nativeElement;
    const canvasEl = this.canvas?.nativeElement;

    if (!video || !canvasEl || !video.videoWidth || video.readyState < 2) return null;

    canvasEl.width = video.videoWidth;
    canvasEl.height = video.videoHeight;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvasEl.width, canvasEl.height);

    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.9);
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }

  // ═══════════════════════════════════════════════════════════
  // ENREGISTREMENT FACIAL
  // ═══════════════════════════════════════════════════════════

  registerFace(): void {
    this.loading = true;
    this.detectionStatus = 'Analyse de vivacité et enregistrement...';
    this.cdr.detectChanges();

    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'Utilisateur non identifié. Veuillez vous reconnecter.';
      this.loading = false;
      this.stopCamera();
      this.cdr.detectChanges();
      return;
    }

    // Utiliser la frame du milieu pour l'enregistrement
    const bestFrame = this.captureFramesList[Math.floor(this.captureFramesList.length / 2)];
    this.facialAI.registerFace(userId, bestFrame).subscribe({
      next: (response: RegisterFaceResponse) => {
        this.loading = false;

        this.result = {
          verified: true,
          message: response.message || 'Visage enregistré avec succès !'
        };
        this.stopCamera();
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = this.parseErrorMessage(err);
        this.restartCamera();
        this.cdr.detectChanges();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // VÉRIFICATION FACIALE
  // ═══════════════════════════════════════════════════════════

  verifyFace(): void {
    this.loading = true;
    this.detectionStatus = 'Analyse de vivacité et identification...';
    this.cdr.detectChanges();

    // Utiliser la frame du milieu pour l'identification
    const bestFrame = this.captureFramesList[Math.floor(this.captureFramesList.length / 2)];
    this.facialAI.identifyFace(bestFrame).subscribe({
      next: (response: IdentifyFaceResponse) => {
        this.loading = false;

        if (response.identified && response.user_email) {
          this.authService.facialLogin(response.user_email).subscribe({
            next: (loginResponse) => {
              this.result = {
                verified: true,
                message: 'Identification réussie ! Bienvenue.'
              };
              this.stopCamera();
              setTimeout(() => this.router.navigate([loginResponse.redirectUrl]), 2000);
              this.cdr.detectChanges();
            },
            error: (authErr) => {
              this.error = authErr.message || 'Erreur lors de la connexion';
              this.restartCamera();
              this.cdr.detectChanges();
            }
          });
        } else {
          this.error = response.message || 'Visage non reconnu. Veuillez réessayer.';
          this.restartCamera();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = this.parseErrorMessage(err);
        this.restartCamera();
        this.cdr.detectChanges();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIONS UTILISATEUR
  // ═══════════════════════════════════════════════════════════

  captureAndRegister(): void {
    if (!this.faceDetected) {
      this.error = 'Attendez la détection du visage.';
      return;
    }
    this.startFrameCapture();
  }

  captureAndVerify(): void {
    if (!this.faceDetected) {
      this.error = 'Attendez la détection du visage.';
      return;
    }
    this.startFrameCapture();
  }

  retry(): void {
    this.error = '';
    this.result = null;
    this.captureFramesList = [];
    this.captureProgress = 0;
    this.framesCollected = 0;
    this.faceDetected = false;
    this.startCamera(this.mode);
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  private restartCamera(): void {
    // Redémarre la caméra après une erreur, sans relancer la boucle infinie
    this.captureFramesList = [];
    this.faceDetected = false;
    this.isCapturing = false;
    this.startFaceDetection();
  }

  private parseErrorMessage(err: any): string {
    const errorBody = err.error;
    if (!errorBody) return 'Une erreur inconnue est survenue.';
    if (errorBody.detail) {
      if (typeof errorBody.detail === 'string') return errorBody.detail;
      if (errorBody.detail.message) return errorBody.detail.message;
    }
    if (errorBody.message) return errorBody.message;
    return err.message || 'Erreur lors de l\'opération.';
  }

  ngOnDestroy() {
    this.stopCapture();
    this.stopCamera();
    if (this.captureTimeout) {
      clearTimeout(this.captureTimeout);
    }
  }
}
