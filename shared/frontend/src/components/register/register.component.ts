// src/components/signup/signup.component.ts - Version corrigée
import { Component, ViewChild, ElementRef, Inject, PLATFORM_ID, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { InscriptionService } from '../../services/inscription.service';
import { FacialAIService } from '../../services/facial-ai.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Étape actuelle
  currentStep = 1;

  // Type de compte
  userType: 'stagiaire' | 'encadrant' = 'stagiaire';

  // Champs communs
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Champs stagiaire
  niveauEtudes = '';
  filiere = '';
  etablissement = '';

  // Champs encadrant
  departement = '';
  poste = '';

  // UI States
  error = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  emailVerified = false;

  // État de vérification email
  waitingForVerification = false;
  verificationCheckInterval: any = null;
  verificationTimeout: any = null;
  resendDisabled = false;
  resendCountdown = 60;

  // Facial recognition
  showCamera = false;
  faceCaptured = false;
  capturedImageUrl: string | null = null;
  capturedImageBlob: Blob | null = null;

  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;
  profileImageName: string = '';

  // Pour stocker l'utilisateur Firebase
  private firebaseUser: any = null;

  // Pour la capture en continu
  private videoStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private captureFramesList: Blob[] = [];  // 👈 Renommé pour éviter conflit
  private readonly FRAMES_TO_CAPTURE = 30;
  private readonly CAPTURE_DURATION_MS = 3000;
  private detectionInterval: any = null;

  isCapturing = false;
  captureProgress = 0;
  faceDetected = false;
  capturedFrames: Blob[] = [];  // ← ajouter en haut de la classe

  constructor(
    private router: Router,
    private firebaseAuth: FirebaseAuthService,
    private inscriptionService: InscriptionService,
    private facialAIService: FacialAIService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkUserStatus();
    }
  }

  ngOnDestroy() {
    this.stopEmailVerificationCheck();
    this.stopCamera();
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }

  private async checkUserStatus(): Promise<void> {
    const user = this.firebaseAuth.getCurrentUser();
    if (user && user.emailVerified && this.currentStep === 3 && this.waitingForVerification) {
      this.onEmailVerified();
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      this.cdr.detectChanges();
    } else if (this.currentStep === 2) {
      if (this.validateStep2()) {
        this.currentStep = 3;
        this.cdr.detectChanges();
      }
    } else if (this.currentStep === 3) {
      if (this.validateStep3()) {
        this.createFirebaseAccountAndSendEmail();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.cdr.detectChanges();
      if (this.currentStep === 3) {
        this.stopEmailVerificationCheck();
        this.waitingForVerification = false;
      }
    }
  }

  goToStep4(): void {
    console.log('👉 Utilisateur clique sur Continuer vers étape 4');
    this.currentStep = 4;
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  private validateStep2(): boolean {
    if (!this.nom || !this.prenom) {
      this.error = 'Veuillez remplir votre nom et prénom';
      return false;
    }

    if (this.userType === 'stagiaire') {
      if (!this.niveauEtudes || !this.filiere || !this.etablissement) {
        this.error = 'Veuillez remplir tous les champs du stagiaire';
        return false;
      }
    } else {
      if (!this.departement || !this.poste) {
        this.error = 'Veuillez remplir tous les champs de l\'encadrant';
        return false;
      }
    }

    this.error = '';
    return true;
  }

  private validateStep3(): boolean {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir l\'email et le mot de passe';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return false;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Veuillez entrer une adresse email valide';
      return false;
    }

    this.error = '';
    return true;
  }

  async createFirebaseAccountAndSendEmail(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    try {
      const userCredential = await this.firebaseAuth.register(this.email, this.password);
      this.firebaseUser = userCredential.user;

      this.successMessage = '✅ Un email de vérification a été envoyé à ' + this.email +
        '. Veuillez vérifier votre boîte mail pour continuer l\'inscription.';

      this.waitingForVerification = true;
      this.cdr.detectChanges();
      this.startEmailVerificationCheck();

    } catch (err: any) {
      console.error('❌ Erreur création compte Firebase:', err);
      this.error = err.message || 'Erreur lors de la création du compte';
      this.waitingForVerification = false;
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  startEmailVerificationCheck(): void {
    console.log('🔍 Démarrage de la vérification email pour:', this.email);

    this.verificationCheckInterval = setInterval(async () => {
      if (!isPlatformBrowser(this.platformId)) return;

      try {
        const user = this.firebaseAuth.getCurrentUser();
        if (user) {
          await user.reload();
          console.log('📧 Statut email vérifié:', user.emailVerified);

          if (user.emailVerified && !this.emailVerified) {
            console.log('✅ Email vérifié avec succès!');
            this.emailVerified = true;
            this.onEmailVerified();
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification:', err);
      }
    }, 2000);

    this.verificationTimeout = setTimeout(() => {
      if (!this.emailVerified && this.waitingForVerification) {
        console.log('⏰ Timeout de vérification email');
        this.stopEmailVerificationCheck();
        this.error = '⏰ La vérification email a expiré (10 minutes). Veuillez cliquer sur "Renvoyer l\'email" pour réessayer.';
        this.waitingForVerification = false;
        this.cdr.detectChanges();
      }
    }, 600000);
  }

  stopEmailVerificationCheck(): void {
    if (this.verificationCheckInterval) {
      clearInterval(this.verificationCheckInterval);
      this.verificationCheckInterval = null;
    }
    if (this.verificationTimeout) {
      clearTimeout(this.verificationTimeout);
      this.verificationTimeout = null;
    }
  }

  onEmailVerified(): void {
    console.log('🎉 Email vérifié');
    this.stopEmailVerificationCheck();
    this.waitingForVerification = false;
    this.successMessage = '✅ Email vérifié avec succès ! Cliquez sur "Continuer" pour enregistrer votre visage.';
    this.cdr.detectChanges();
  }

  async resendVerificationEmail(): Promise<void> {
    if (this.resendDisabled) return;

    this.resendDisabled = true;
    this.error = '';
    this.successMessage = '';

    try {
      await this.firebaseAuth.resendVerificationEmail();
      this.successMessage = '📧 Un nouvel email de vérification a été envoyé !';
      this.cdr.detectChanges();
      this.startEmailVerificationCheck();

      let countdown = 60;
      const interval = setInterval(() => {
        countdown--;
        this.resendCountdown = countdown;
        this.cdr.detectChanges();
        if (countdown <= 0) {
          clearInterval(interval);
          this.resendDisabled = false;
          this.resendCountdown = 60;
          this.cdr.detectChanges();
        }
      }, 1000);

    } catch (err: any) {
      console.error('Erreur renvoi email:', err);
      this.error = err.message || 'Erreur lors de l\'envoi de l\'email';
      this.resendDisabled = false;
      this.cdr.detectChanges();
    }
  }

  onProfileImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
      this.error = 'Format non supporté. Veuillez choisir une image JPG ou PNG.';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.error = 'L\'image ne doit pas dépasser 2MB';
      return;
    }

    this.profileImageFile = file;
    this.profileImageName = file.name;
    this.error = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profileImagePreview = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
    this.profileImageName = '';
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  activateCamera(): void {
    console.log('🔘 Activation de la caméra...');
    this.showCamera = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.startCameraWithId();
    }, 200);
  }

  async startCameraWithId(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('🎥 Démarrage de la caméra...');
    const videoEl = document.getElementById('cameraVideo') as HTMLVideoElement;

    if (!videoEl) {
      console.error('❌ Élément vidéo non trouvé!');
      this.error = 'Erreur technique: élément vidéo non trouvé.';
      this.cdr.detectChanges();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });

      if (videoEl.srcObject) {
        const oldStream = videoEl.srcObject as MediaStream;
        oldStream.getTracks().forEach(track => track.stop());
      }

      videoEl.srcObject = stream;

      videoEl.onloadedmetadata = () => {
        console.log('🎬 Vidéo chargée');
        videoEl.play();
        this.startFaceDetection();
        this.cdr.detectChanges();
      };

    } catch (err) {
      console.error('❌ Erreur accès caméra:', err);
      this.error = 'Impossible d\'accéder à la caméra.';
      this.cdr.detectChanges();
    }
  }

  startFaceDetection(): void {
    console.log('🎯 Détection de visage - capture dans 2 secondes');
    setTimeout(() => {
      if (this.showCamera && !this.faceCaptured && !this.isCapturing) {
        console.log('✅ Démarrage de la capture automatique');
        this.faceDetected = true;
        this.cdr.detectChanges();
        this.startAutoCapture();
      }
    }, 2000);
  }

  startAutoCapture(): void {
    if (this.isCapturing || this.faceCaptured) return;

    console.log('🎬 DÉMARRAGE CAPTURE');
    this.isCapturing = true;
    this.captureFramesList = [];

    if (!isPlatformBrowser(this.platformId)) return;
    const videoEl = document.getElementById('cameraVideo') as HTMLVideoElement;
    const canvasEl = document.getElementById('captureCanvas') as HTMLCanvasElement;

    if (!videoEl || !canvasEl) return;

    const frameInterval = this.CAPTURE_DURATION_MS / this.FRAMES_TO_CAPTURE;
    let frameIndex = 0;

    const captureFrame = () => {
      if (!this.isCapturing || this.faceCaptured) return;

      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      const context = canvasEl.getContext('2d');
      context?.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

      canvasEl.toBlob((blob) => {
        if (blob) {
          this.captureFramesList.push(blob);
        }
        frameIndex++;
        this.captureProgress = Math.round((frameIndex / this.FRAMES_TO_CAPTURE) * 100);
        this.cdr.detectChanges();

        if (frameIndex < this.FRAMES_TO_CAPTURE) {
          setTimeout(captureFrame, frameInterval);
        } else {
          this.onCaptureComplete();
        }
      }, 'image/jpeg', 0.9);
    };

    captureFrame();
  }

  onCaptureComplete(): void {
    console.log('✅ CAPTURE TERMINÉE, frames:', this.captureFramesList.length);
    this.isCapturing = false;
    this.capturedFrames = [...this.captureFramesList];
    this.sendFramesToFacialAI();
  }

  async sendFramesToFacialAI(): Promise<void> {
    console.log('🌐 APPEL FACIAL AI SERVICE -', this.captureFramesList.length, 'frames');
    this.loading = true;

    try {
      const formData = new FormData();
      this.captureFramesList.forEach((frame, index) => {
        formData.append('frames', frame, `frame_${index}.jpg`);
      });


      const response = await this.facialAIService.analyzeFrames(formData).toPromise();
      console.log('📊 Réponse Facial AI:', response);

      if (response && response.isLive && response.faceDetected) {
        const bestFrameIndex = response.bestFrameIndex || Math.floor(this.captureFramesList.length / 2);
        const bestFrame = this.captureFramesList[bestFrameIndex];
        this.capturedImageBlob = bestFrame;
        this.capturedImageUrl = URL.createObjectURL(bestFrame);
        this.faceCaptured = true;
        this.stopCamera();

        this.successMessage = `✅ Visage enregistré avec succès! (${response.blinkCount || 0} clignements)`;
        this.cdr.detectChanges();
      } else {
        this.error = response?.message || '⚠️ Visage non détecté ou photo/vidéo détectée';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.error = '';
          this.startAutoCapture();
        }, 3000);
      }

    } catch (err: any) {
      console.error('❌ Erreur analyse faciale:', err);
      this.error = err.message || 'Erreur de connexion au service Facial AI';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  stopCamera(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    // ✅ Vérifier qu'on est bien dans le navigateur avant d'accéder au DOM
    if (isPlatformBrowser(this.platformId)) {
      const videoEl = document.getElementById('cameraVideo') as HTMLVideoElement;
      if (videoEl) {
        videoEl.srcObject = null;
      }
    }

    this.showCamera = false;
    this.isCapturing = false;
    this.faceDetected = false;
    this.captureProgress = 0;
    this.captureFramesList = [];
    this.cdr.detectChanges();
  }

  retakePhoto(): void {
    this.faceCaptured = false;
    if (this.capturedImageUrl) {
      URL.revokeObjectURL(this.capturedImageUrl);
      this.capturedImageUrl = null;
    }
    this.capturedImageBlob = null;
    this.startCameraWithId();
  }

// Dans confirmFaceAndSubmit() - supprimez cette partie
// ── NOUVEAU: Upload de l'image de profil ──────────
// if (this.profileImageFile && iamResponse?.userId) {
//   console.log('📸 Upload de l\'image de profil...');
//   try {
//     const avatarResponse = await this.inscriptionService
//       .uploadAvatar(iamResponse.userId, this.profileImageFile)
//       .toPromise();
//     console.log('✅ Avatar uploadé:', avatarResponse);
//   } catch (avatarErr) {
//     console.warn('⚠️ Erreur upload avatar:', avatarErr);
//   }
// }

// Version corrigée - un seul appel
// Ajouter cette méthode dans RegisterComponent

  /**
   * Skip l'étape faciale (optionnel)
   * Soumet l'inscription sans enregistrement biométrique
   */
  skipFacialStep(): void {
    console.log('⏭️ Utilisateur a choisi de passer l\'étape faciale');
    this.submitRegistrationWithoutFacial();
  }

  /**
   * Soumet l'inscription sans données biométriques
   */
  private async submitRegistrationWithoutFacial(): Promise<void> {
      this.loading = true;
      this.error = '';

      try {
          const data = {
              nom: this.nom,
              prenom: this.prenom,
              email: this.email,
              motDePasse: this.password,
              typeCompte: this.userType.toUpperCase(),
              // ❌ avatarUrl: this.profileImagePreview || null,  // ← SUPPRIMER
              ...(this.userType.toLowerCase() === 'stagiaire' ? {
                  niveauEtudes: this.niveauEtudes,
                  filiere: this.filiere,
                  etablissement: this.etablissement
              } : {
                  departement: this.departement,
                  specialite: this.poste
              })
          };

          const formData = new FormData();
          formData.append(
              'data',
              new Blob([JSON.stringify(data)], { type: 'application/json' })
          );

          // ✅ Image de profil comme fichier
          if (this.profileImageFile) {
              formData.append('profileImage', this.profileImageFile, this.profileImageFile.name);
          }

          console.log('📤 Envoi IAM Service (sans facial)...');
          await this.inscriptionService.createDemande(formData).toPromise();

          alert('✅ Inscription envoyée ! Votre compte sera activé par l\'administrateur.');
          this.router.navigate(['/login']);

      } catch (err: any) {
          console.error('❌ Erreur inscription:', err);
          this.error = err.error?.message || 'Erreur lors de l\'inscription';
      } finally {
          this.loading = false;
      }
  }

// Modifier confirmFaceAndSubmit() pour qu'elle envoie aussi avatarUrl
// Dans register.component.ts - confirmFaceAndSubmit() corrigée
    async confirmFaceAndSubmit(): Promise<void> {
        if (!this.capturedImageBlob) {
            this.error = 'Veuillez capturer votre visage';
            return;
        }

        this.loading = true;
        this.error = '';

        try {
            // ⚠️ NE PAS inclure avatarUrl dans le JSON - on va l'envoyer comme fichier
            const data = {
                nom: this.nom,
                prenom: this.prenom,
                email: this.email,
                motDePasse: this.password,
                typeCompte: this.userType.toUpperCase(),
                // ❌ avatarUrl: this.profileImagePreview || null,  // ← SUPPRIMER
                // Les champs spécifiques au rôle
                ...(this.userType.toLowerCase() === 'stagiaire' ? {
                    niveauEtudes: this.niveauEtudes,
                    filiere: this.filiere,
                    etablissement: this.etablissement
                } : {
                    departement: this.departement,
                    specialite: this.poste
                })
            };

            const formData = new FormData();

            // Ajouter les données JSON
            formData.append(
                'data',
                new Blob([JSON.stringify(data)], { type: 'application/json' })
            );

            // ✅ Ajouter la photo faciale (pour la reconnaissance)
            formData.append('photo', this.capturedImageBlob, 'face.jpg');

            // ✅ Ajouter l'image de profil (avatar) comme fichier séparé
            if (this.profileImageFile) {
                formData.append('profileImage', this.profileImageFile, this.profileImageFile.name);
            }

            console.log('📤 Envoi IAM Service...');
            const iamResponse: any = await this.inscriptionService.createDemande(formData).toPromise();

            console.log('✅ IAM OK:', iamResponse);

            const userId = iamResponse?.userId;

            // Enregistrement facial
            if (userId && this.capturedFrames && this.capturedFrames.length > 0) {
                console.log('🧠 Stockage embedding pour userId:', userId);
                try {
                    const facialResponse = await this.facialAIService
                        .registerFace(userId, this.capturedFrames)
                        .toPromise();
                    console.log('✅ Embedding stocké:', facialResponse);
                } catch (facialErr: any) {
                    console.warn('⚠️ Embedding non stocké (non bloquant):', facialErr);
                }
            }

            alert('✅ Inscription envoyée ! Votre compte sera activé par l\'administrateur.');
            this.router.navigate(['/login']);

        } catch (err: any) {
            console.error('❌ Erreur inscription:', err);
            this.error = err.error?.message || 'Erreur lors de l\'inscription';
        } finally {
            this.loading = false;
        }
    }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.currentStep === 4 && this.faceCaptured) {
      this.confirmFaceAndSubmit();
    }
  }
}
