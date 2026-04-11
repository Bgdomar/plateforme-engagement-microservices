import {
  Component, ViewChild, ElementRef,
  Inject, PLATFORM_ID, ChangeDetectorRef, OnDestroy, OnInit
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FacialAIService } from '../../services/facial-ai.service';

type FacialStep = 'idle' | 'recording' | 'verifying' | 'success' | 'error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Méthode d'auth
  authMethod: 'email' | 'facial' = 'email';

  // Champs email / password
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  // États UI communs
  error: string = '';
  errorType: 'credentials' | 'pending' | 'disabled' | 'suspended' | 'other' = 'credentials';
  loading: boolean = false;
  successMessage: string = '';

  // Machine d'état faciale
  facialStep: FacialStep = 'idle';
  faceError: string = '';

  // Capture de frames
  private mediaStream: MediaStream | null = null;
  private captureInterval: ReturnType<typeof setInterval> | null = null;
  private collectedFrames: Blob[] = [];

  readonly FRAMES_TARGET = 40;
  readonly CAPTURE_INTERVAL = 100;

  captureProgress: number = 0;
  framesCollected: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private facialAI: FacialAIService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const ok = sessionStorage.getItem('inscriptionSuccess');
      const email = sessionStorage.getItem('newUserEmail');
      if (ok && email) {
        this.successMessage = '✅ Inscription réussie ! Votre compte est en attente de validation par l\'administrateur.';
        this.email = email;
        sessionStorage.removeItem('inscriptionSuccess');
        sessionStorage.removeItem('newUserEmail');
      }
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cleanupAll();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // AUTH EMAIL
  // ═══════════════════════════════════════════════════════════

  onSubmitEmail(event: Event): void {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      this.errorType = 'other';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('🔑 Role:', response.role);
        console.log('🔗 RedirectUrl:', response.redirectUrl);
        console.log('🗝️ Token:', response.token);
        this.router.navigateByUrl(response.redirectUrl);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.message || err.error?.message || 'Email ou mot de passe incorrect';
        this.error = msg;
        if (msg.includes('en attente')) this.errorType = 'pending';
        else if (msg.includes('désactivé')) this.errorType = 'disabled';
        else if (msg.includes('suspendu')) this.errorType = 'suspended';
        else if (msg.includes('incorrect')) this.errorType = 'credentials';
        else this.errorType = 'other';
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // AUTH FACIALE
  // ═══════════════════════════════════════════════════════════

  async startFacialLogin(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.faceError = '';
    this.collectedFrames = [];
    this.captureProgress = 0;
    this.framesCollected = 0;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      this.facialStep = 'recording';
      this.cdr.detectChanges();

      await this.sleep(150);
      this.attachStream(this.mediaStream);
      await this.sleep(600);
      this.startFrameCapture();

    } catch {
      this.faceError = 'Impossible d\'accéder à la caméra. Vérifiez vos permissions.';
      this.facialStep = 'error';
      this.cdr.detectChanges();
    }
  }

  private startFrameCapture(): void {
    this.captureInterval = setInterval(() => {
      const blob = this.captureFrame();
      if (blob) {
        this.collectedFrames.push(blob);
        this.framesCollected = this.collectedFrames.length;
        this.captureProgress = Math.round((this.framesCollected / this.FRAMES_TARGET) * 100);
        this.cdr.detectChanges();
      }

      if (this.collectedFrames.length >= this.FRAMES_TARGET) {
        this.stopFrameCapture();
        this.identifyFace();
      }
    }, this.CAPTURE_INTERVAL);
  }

  private stopFrameCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  private captureFrame(): Blob | null {
    const video = this.getVideo();
    const canvas = this.getCanvas();
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return this.dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.85));
  }

  private identifyFace(): void {
    this.facialStep = 'verifying';
    this.stopCamera();
    this.cdr.detectChanges();

    this.facialAI.identifyFace(this.collectedFrames).subscribe({
      next: (response) => {
        this.getFacialJwtToken(response.user_id);
      },
      error: (err) => {
        this.facialStep = 'error';
        const detail = err?.error?.detail;

        if (detail?.code === 'LIVENESS_FAILED') {
          const blinks = detail.blinks ?? 0;
          this.faceError = `Vivacité insuffisante — ${blinks} clignement(s) détecté(s) sur 2 requis. Clignez naturellement des yeux.`;
        } else if (detail?.code === 'FACE_NOT_RECOGNIZED') {
          this.faceError = 'Visage non reconnu. Votre profil biométrique est peut-être absent.';
        } else if (detail?.code === 'EMBEDDING_FAILED') {
          this.faceError = 'Aucun visage détecté. Vérifiez l\'éclairage et votre position.';
        } else {
          this.faceError = err?.message || 'Erreur lors de la vérification faciale.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  private getFacialJwtToken(userId: string): void {
    this.authService.facialLogin(userId).subscribe({
      next: (response) => {
        this.facialStep = 'success';
        this.successMessage = 'Identification réussie ! Redirection...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate([response.redirectUrl]), 2000);
      },
      error: (err) => {
        this.facialStep = 'error';
        this.faceError = err.message || 'Erreur lors de la connexion.';
        this.cdr.detectChanges();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CONTRÔLES
  // ═══════════════════════════════════════════════════════════

  cancelFacialLogin(): void {
    this.stopFrameCapture();
    this.stopCamera();
    this.facialStep = 'idle';
    this.faceError = '';
    this.collectedFrames = [];
    this.captureProgress = 0;
    this.framesCollected = 0;
    this.cdr.detectChanges();
  }

  retryFacialLogin(): void {
    this.cleanupAll();
    this.faceError = '';
    this.collectedFrames = [];
    this.captureProgress = 0;
    this.framesCollected = 0;
    this.facialStep = 'idle';
    this.cdr.detectChanges();
    setTimeout(() => this.startFacialLogin(), 200);
  }

  switchToEmail(): void {
    this.authMethod = 'email';
    this.cleanupAll();
    this.error = '';
    this.errorType = 'credentials';
    this.faceError = '';
  }

  resetForm(): void {
    this.cleanupAll();
    this.error = '';
    this.errorType = 'credentials';
    this.faceError = '';
    this.facialStep = 'idle';
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  private stopCamera(): void {
    this.mediaStream?.getTracks().forEach(t => t.stop());
    this.mediaStream = null;
    const v = this.getVideo();
    if (v) v.srcObject = null;
  }

  private cleanupAll(): void {
    this.stopFrameCapture();
    this.stopCamera();
  }

  private attachStream(stream: MediaStream): void {
    const v = this.getVideo();
    if (v) { v.srcObject = stream; v.play().catch(() => {}); }
  }

  private getVideo(): HTMLVideoElement | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.videoElement?.nativeElement ?? null;
  }

  private getCanvas(): HTMLCanvasElement | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.canvasElement?.nativeElement ?? null;
  }

  private dataURLtoBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)![1];
    const binary = atob(data);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  // Getters pour le template
  get isIdle() { return this.facialStep === 'idle'; }
  get isRecording() { return this.facialStep === 'recording'; }
  get isVerifying() { return this.facialStep === 'verifying'; }
  get isSuccess() { return this.facialStep === 'success'; }
  get isError() { return this.facialStep === 'error'; }
}
