import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FacialAIService } from '../../services/facial-ai.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  // User info
  email: string = 'admin@admin.com';
  firstName: string = 'Admin';
  lastName: string = 'DXC';
  role: string = 'ADMIN';
  profileImage: string = '';

  phone: string = '';
  position: string = '';
  department: string = '';
  address: string = '';

  // API
  private apiUrl = environment.apiUrl;

  // States
  isEditingProfile: boolean = false;
  isChangingPassword: boolean = false;
  showPasswordChangeForm: boolean = false;

  // Password form
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  passwordSuccess: string = '';

  // Upload image
  imageFile: File | null = null;

  // Messages
  updateError: string = '';
  updateSuccess: string = '';
  isSaving: boolean = false;

  // Facial Recognition
  @ViewChild('facialVideo') facialVideo!: ElementRef<HTMLVideoElement>;
  hasFacialRecognition: boolean = false;
  showFacialSetup: boolean = false;
  isCameraActive: boolean = false;
  isCapturing: boolean = false;
  facialError: string = '';
  facialSuccess: string = '';
  private facialStream: MediaStream | null = null;

  constructor(
    private http: HttpClient,
    private facialAIService: FacialAIService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.checkFacialRecognitionStatus();
  }

  loadUserData(): void {
    this.http.get<any>(`${this.apiUrl}/users/profile`).subscribe({
      next: (res) => {
        this.email = res.email ?? this.email;
        this.firstName = res.firstName ?? '';
        this.lastName = res.lastName ?? '';
        this.role = res.role ?? this.role;
        this.profileImage = res.profileImageUrl ?? '';
        this.phone = res.phone ?? '';
        this.position = res.position ?? '';
        this.department = res.department ?? '';
        this.address = res.address ?? '';
      },
      error: () => {
        this.updateError = 'Erreur lors du chargement du profil.';
      }
    });
  }

  checkFacialRecognitionStatus(): void {
    // Vérifier dans localStorage si l'utilisateur a déjà activé la reconnaissance faciale
    const hasFacial = localStorage.getItem('has_facial_recognition');
    this.hasFacialRecognition = hasFacial === 'true';

    // TODO: Vérifier également avec le backend si le visage est enregistré
    // this.facialAIService.checkFaceExists(this.email).subscribe(...);
  }

  getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.updateError = '';
      this.updateSuccess = '';
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfileChanges(): void {
    this.updateError = '';
    this.updateSuccess = '';
    this.isSaving = true;

    const upload$ = this.imageFile
      ? this.uploadProfileImage(this.imageFile)
      : null;

    if (upload$) {
      upload$.subscribe({
        next: () => this.updateProfileInfo(),
        error: (err) => {
          this.isSaving = false;
          this.updateError = err?.error?.message || 'Erreur lors de l\'upload de l\'image.';
        }
      });
      return;
    }

    this.updateProfileInfo();
  }

  private uploadProfileImage(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/users/profile/image`, fd);
  }

  private updateProfileInfo(): void {
    this.http.put<any>(`${this.apiUrl}/users/profile`, {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      position: this.position,
      department: this.department,
      address: this.address
    }).subscribe({
      next: (res) => {
        if (res?.token) {
          localStorage.setItem('jwt_token', res.token);
        }
        if (res?.email) {
          localStorage.setItem('user_email', res.email);
        }
        if (res?.profileImageUrl) {
          this.profileImage = res.profileImageUrl;
        }

        this.phone = res?.phone ?? this.phone;
        this.position = res?.position ?? this.position;
        this.department = res?.department ?? this.department;
        this.address = res?.address ?? this.address;

        this.isSaving = false;
        this.isEditingProfile = false;
        this.imageFile = null;
        this.updateSuccess = 'Profil mis à jour avec succès !';
      },
      error: (err) => {
        this.isSaving = false;
        this.updateError = err?.error?.message || 'Erreur lors de la mise à jour.';
      }
    });
  }

  toggleChangePassword(): void {
    this.showPasswordChangeForm = !this.showPasswordChangeForm;
    if (!this.showPasswordChangeForm) {
      this.resetPasswordForm();
    }
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    // Validation
    if (!this.currentPassword) {
      this.passwordError = 'Veuillez entrer votre mot de passe actuel';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
      return;
    }

    // In a real app, send to API
    // For now, just simulate success
    this.isChangingPassword = true;
    setTimeout(() => {
      this.passwordSuccess = 'Mot de passe changé avec succès!';
      this.isChangingPassword = false;
      setTimeout(() => {
        this.showPasswordChangeForm = false;
        this.resetPasswordForm();
      }, 2000);
    }, 1000);
  }

  resetPasswordForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.loadUserData();
  }

  // ==================== FACIAL RECOGNITION METHODS ====================

  startFacialCamera(): void {
    this.facialError = '';
    this.facialSuccess = '';

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        this.facialStream = stream;
        this.isCameraActive = true;

        // Attendre que la vue soit mise à jour
        setTimeout(() => {
          if (this.facialVideo && this.facialVideo.nativeElement) {
            this.facialVideo.nativeElement.srcObject = stream;
          }
        }, 100);
      })
      .catch(err => {
        console.error('❌ Erreur caméra:', err);
        this.facialError = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
      });
  }

  stopFacialCamera(): void {
    if (this.facialStream) {
      this.facialStream.getTracks().forEach(track => track.stop());
      this.facialStream = null;
    }
    this.isCameraActive = false;
  }

  captureFace(): void {
    if (!this.facialVideo || !this.facialVideo.nativeElement) {
      this.facialError = 'Caméra non disponible';
      return;
    }

    this.isCapturing = true;
    this.facialError = '';

    const video = this.facialVideo.nativeElement;

    // Créer un canvas pour capturer l'image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.facialError = 'Erreur lors de la capture';
      this.isCapturing = false;
      return;
    }

    // Dessiner l'image de la vidéo
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en blob
    canvas.toBlob((blob) => {
      if (!blob) {
        this.facialError = 'Erreur lors de la conversion de l\'image';
        this.isCapturing = false;
        return;
      }

      // Enregistrer le visage
      this.registerFace(blob);
    }, 'image/jpeg', 0.9);
  }

  private registerFace(blob: Blob): void {
    const userEmail = localStorage.getItem('user_email') || this.email;

    this.facialAIService.registerFace(userEmail, blob).subscribe({
      next: (response) => {
        console.log('✅ Visage enregistré:', response);
        this.hasFacialRecognition = true;
        this.facialSuccess = 'Reconnaissance faciale activée avec succès !';
        this.isCapturing = false;
        this.stopFacialCamera();
        this.showFacialSetup = false;

        // Sauvegarder le statut dans localStorage
        localStorage.setItem('has_facial_recognition', 'true');
      },
      error: (error) => {
        console.error('❌ Erreur enregistrement visage:', error);
        this.facialError = error.message || 'Erreur lors de l\'enregistrement du visage';
        this.isCapturing = false;
      }
    });
  }

  cancelFacialSetup(): void {
    this.stopFacialCamera();
    this.showFacialSetup = false;
    this.facialError = '';
    this.facialSuccess = '';
  }

  disableFacialRecognition(): void {
    if (!confirm('Êtes-vous sûr de vouloir désactiver la reconnaissance faciale ?')) {
      return;
    }

    // TODO: Appeler l'API pour supprimer le visage
    this.hasFacialRecognition = false;
    localStorage.removeItem('has_facial_recognition');
    this.facialSuccess = 'Reconnaissance faciale désactivée';

    setTimeout(() => {
      this.facialSuccess = '';
    }, 3000);
  }
}
