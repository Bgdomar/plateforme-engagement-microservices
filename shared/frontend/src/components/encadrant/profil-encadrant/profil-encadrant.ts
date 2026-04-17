import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {HeaderEncadrantComponent} from "../header-encadrant/header-encadrant";

interface ProfilResponse {
  userId:        string;
  nom:           string;
  prenom:        string;
  email:         string;
  avatar:        string | null;
  typeCompte:    string;
  niveauEtudes:  string | null;
  filiere:       string | null;
  etablissement: string | null;
  departement:   string | null;
  specialite:    string | null;
}

@Component({
  selector: 'app-profil-encadrant',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderEncadrantComponent],
  templateUrl: './profil-encadrant.html',
  styleUrls: ['./profil-encadrant.css'],
})
export class ProfilEncadrantComponent implements OnInit {
  activeTab: string = 'equipes';

  // Données affichage
  prenom: string = '';
  nom: string = '';
  displayName: string = '';
  initiales: string = '';
  email: string = '';
  typeCompte: string = '';

  // Champs formulaire
  inpPrenom: string = '';
  inpNom: string = '';

  // Champs Encadrant
  inpDepartement: string = '';
  inpSpecialite: string = '';

  // Stats
  statsStagiairesEncadres: number = 0;
  statsMissionsValidees: number = 0;
  statsEquipes: number = 0;

  // Photo
  currentPhoto: string | null = null;
  pendingPhoto: string | null = null;
  modalOpen: boolean = false;

  // Notifications
  notifInApp: boolean = true;
  notifEmail: boolean = true;

  // État
  isLoading: boolean = true;
  loadError: string = '';

  // Toast
  toastMsg: string = '';
  toastVisible: boolean = false;
  private toastTimer: any;
  pendingFile: File | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // Vérifier si on est dans le navigateur
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.loadUserProfile();
    }
  }

  get isStagiaire(): boolean {
    return this.typeCompte === 'STAGIAIRE';
  }
  get isEncadrant(): boolean {
    return this.typeCompte === 'ENCADRANT';
  }

  private loadUserProfile(): void {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      this.loadError = 'Session introuvable. Veuillez vous reconnecter.';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<ProfilResponse>(`${environment.apiUrl}/api/profil/${userId}`, { headers })
      .subscribe({
        next: (data) => {
          this.mapProfilToView(data);
          this.loadStats();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement profil:', err);
          this.loadError = 'Impossible de charger le profil.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private loadStats(): void {
    // Stats mockées pour le développement
    this.statsStagiairesEncadres = 8;
    this.statsMissionsValidees = 12;
    this.statsEquipes = 3;
    this.cdr.detectChanges();
  }

  private mapProfilToView(data: ProfilResponse): void {
    this.typeCompte = data.typeCompte ?? '';
    this.prenom = data.prenom ?? '';
    this.nom = data.nom ?? '';
    this.email = data.email ?? '';
    this.displayName = `${this.prenom} ${this.nom}`.trim();
    this.initiales = this.buildInitiales(this.prenom, this.nom);

    if (data.avatar) {
      this.currentPhoto = data.avatar.startsWith('http')
        ? data.avatar
        : `http://localhost:8080${data.avatar}`;
    } else {
      this.currentPhoto = null;
    }

    this.inpPrenom = this.prenom;
    this.inpNom = this.nom;

    if (this.isEncadrant) {
      this.inpDepartement = data.departement ?? '';
      this.inpSpecialite = data.specialite ?? '';
    }
  }

  private buildInitiales(prenom: string, nom: string): string {
    const p = prenom?.trim()[0] ?? '';
    const n = nom?.trim()[0] ?? '';
    return (p + n).toUpperCase();
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  openPhotoModal(): void {
    this.pendingPhoto = this.currentPhoto;
    this.pendingFile = null;
    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.pendingPhoto = null;
    this.pendingFile = null;
    this.modalOpen = false;
    this.cdr.detectChanges();
  }

  outsideClose(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  onFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.pendingFile = input.files[0];
      this.readFile(input.files[0]);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.pendingFile = file;
      this.readFile(file);
    }
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.pendingPhoto = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  applyPhoto(): void {
    if (!this.pendingFile) {
      this.closeModal();
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    const formData = new FormData();
    formData.append('file', this.pendingFile);

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http
      .post<ProfilResponse>(`${environment.apiUrl}/api/profil/${userId}/avatar`, formData, {
        headers,
      })
      .subscribe({
        next: (data) => {
          this.currentPhoto = data.avatar
            ? data.avatar.startsWith('http')
              ? data.avatar
              : `http://localhost:8080${data.avatar}`
            : null;
          this.pendingFile = null;
          this.pendingPhoto = null;
          this.modalOpen = false;
          this.cdr.detectChanges();
          this.showToast('Photo de profil mise à jour !');
        },
        error: () => this.showToast("Erreur lors de l'upload."),
      });
  }

  removePhoto(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http
      .delete<ProfilResponse>(`${environment.apiUrl}/api/profil/${userId}/avatar`, { headers })
      .subscribe({
        next: () => {
          this.currentPhoto = null;
          this.pendingPhoto = null;
          this.pendingFile = null;
          this.modalOpen = false;
          this.cdr.detectChanges();
          this.showToast('Photo supprimée.');
        },
        error: () => this.showToast('Erreur lors de la suppression.'),
      });
  }

  saveSettings(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      this.showToast('Session expirée.');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const payload: any = {
      prenom: this.inpPrenom.trim() || this.prenom,
      nom: this.inpNom.trim() || this.nom,
    };

    if (this.isEncadrant) {
      payload['departement'] = this.inpDepartement.trim();
      payload['specialite'] = this.inpSpecialite.trim();
    }

    this.http
      .put<ProfilResponse>(`${environment.apiUrl}/api/profil/${userId}`, payload, { headers })
      .subscribe({
        next: (data) => {
          this.mapProfilToView(data);
          this.cdr.detectChanges();
          this.showToast('Modifications enregistrées !');
        },
        error: () => this.showToast('Erreur lors de la sauvegarde.'),
      });
  }

  saveNotifications(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const payload = { notifInApp: this.notifInApp, notifEmail: this.notifEmail };

    this.http
      .put<any>(`${environment.apiUrl}/api/profil/${userId}/notifications`, payload, { headers })
      .subscribe({
        next: () => this.showToast('Préférences de notifications enregistrées !'),
        error: () => this.showToast('Erreur lors de la sauvegarde des notifications.'),
      });
  }

  showToast(msg: string): void {
    this.toastMsg = '✓ ' + msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
