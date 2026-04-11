import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserData();
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
}
