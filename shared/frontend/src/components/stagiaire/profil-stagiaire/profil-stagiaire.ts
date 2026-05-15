import {
  Component,
  ChangeDetectorRef,
  OnInit,
  Inject,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HeaderStagiaireComponent } from '../header-stagiaire/header-stagiaire';
import { FacialAIService } from '../../../services/facial-ai.service';

interface ProfilResponse {
  userId:        string;
  nom:           string;
  prenom:        string;
  email:         string;
  avatar:        string | null;
  typeCompte:    string;           // 'STAGIAIRE' | 'ENCADRANT'
  // Stagiaire
  niveauEtudes:  string | null;
  filiere:       string | null;
  etablissement: string | null;
  // Encadrant
  departement:   string | null;
  specialite:    string | null;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderStagiaireComponent],
  templateUrl: './profil-stagiaire.html',
  styleUrls: ['./profil-stagiaire.css'],
})
export class ProfilStagiaireComponent implements OnInit {
  activeTab: string = 'missions';

  // ── Données affichage ─────────────────────────────────────────
  prenom: string = '';
  nom: string = '';
  displayName: string = '';
  initiales: string = '';
  email: string = '';
  typeCompte: string = ''; // 'STAGIAIRE' | 'ENCADRANT'

  // ── Champs formulaire communs ─────────────────────────────────
  inpPrenom: string = '';
  inpNom: string = '';

  // ── Champs Stagiaire ──────────────────────────────────────────
  inpNiveau: string = '';
  inpEtab: string = '';
  inpFiliere: string = '';

  // ── Champs Encadrant ──────────────────────────────────────────
  inpDepartement: string = '';
  inpSpecialite: string = '';

  // ── Photo ─────────────────────────────────────────────────────
  currentPhoto: string | null = null;
  pendingPhoto: string | null = null;
  modalOpen: boolean = false;

  // ── Notifications ─────────────────────────────────────────────
  notifInApp: boolean = true;
  notifEmail: boolean = true;

  // ── État chargement ───────────────────────────────────────────
  isLoading: boolean = true;
  loadError: string = '';

  // ── Toast ─────────────────────────────────────────────────────
  toastMsg: string = '';
  toastVisible: boolean = false;
  private toastTimer: any;
  pendingFile: File | null = null;

  // Reconnaissance faciale
  @ViewChild('facialVideo') facialVideo!: ElementRef<HTMLVideoElement>;
  hasFacialRecognition: boolean = false;
  showFacialSetup: boolean = false;
  isCameraActive: boolean = false;
  isCapturing: boolean = false;
  facialError: string = '';
  facialSuccess: string = '';
  captureProgress: number = 0;       // 0-100 pour la barre de progression
  captureStatus: string = '';        // message affiché pendant la capture
  private facialStream: MediaStream | null = null;
  private captureInterval: any = null;

  // Constantes de capture
  private readonly FRAMES_REQUIRED = 30;   // 30 frames ~ 3 secondes à 10fps
  private readonly CAPTURE_FPS     = 10;   // interval = 100ms


  constructor(
      private cdr: ChangeDetectorRef,
      private http: HttpClient,
      private facialAIService: FacialAIService,
      @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────

  get isStagiaire(): boolean {
    return this.typeCompte === 'STAGIAIRE';
  }
  get isEncadrant(): boolean {
    return this.typeCompte === 'ENCADRANT';
  }

  get roleLabel(): string {
    return this.isStagiaire ? 'Stagiaire' : this.isEncadrant ? 'Encadrant' : '';
  }

  // ── Chargement profil ─────────────────────────────────────────

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
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erreur chargement profil :', err);
            this.loadError = 'Impossible de charger le profil. Veuillez réessayer.';
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
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

    if (this.isStagiaire) {
      this.inpNiveau = data.niveauEtudes ?? '';
      this.inpEtab = data.etablissement ?? '';
      this.inpFiliere = data.filiere ?? '';
    } else if (this.isEncadrant) {
      this.inpDepartement = data.departement ?? '';
      this.inpSpecialite = data.specialite ?? '';
    }
  }

  private buildInitiales(prenom: string, nom: string): string {
    const p = prenom?.trim()[0] ?? '';
    const n = nom?.trim()[0] ?? '';
    return (p + n).toUpperCase();
  }

  // ── Navigation onglets ────────────────────────────────────────

  setTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  // ── Photo ─────────────────────────────────────────────────────

  // ✅ FIX : appel cdr.detectChanges() immédiatement pour ouvrir le modal sans délai
  openPhotoModal(): void {
    this.pendingPhoto = this.currentPhoto;
    this.pendingFile = null;
    this.modalOpen = true;
    this.cdr.detectChanges(); // ← force l'affichage immédiat du modal
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

  // ✅ FIX : appel cdr.detectChanges() dans le callback FileReader
  //    (le callback s'exécute hors de la zone Angular → sans ça, la preview
  //     n'apparaît pas tant qu'un autre événement ne force pas un re-render)
  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.pendingPhoto = e.target?.result as string;
      this.cdr.detectChanges(); // ← indispensable : callback hors zone Angular
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
            this.syncInitiales();
            this.modalOpen = false;
            this.cdr.detectChanges();
            this.showToast('Photo supprimée.');
          },
          error: () => this.showToast('Erreur lors de la suppression.'),
        });
  }

  private syncInitiales(): void {
    if (!this.currentPhoto) this.initiales = this.buildInitiales(this.prenom, this.nom);
  }

  // ── Sauvegarde paramètres ─────────────────────────────────────

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

    if (this.isStagiaire) {
      payload['niveauEtudes'] = this.inpNiveau.trim();
      payload['etablissement'] = this.inpEtab.trim();
      payload['filiere'] = this.inpFiliere.trim();
    } else if (this.isEncadrant) {
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
          error: (err) => {
            console.error('Erreur sauvegarde :', err);
            this.showToast('Erreur lors de la sauvegarde.');
          },
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

  // ── Toast ─────────────────────────────────────────────────────

  showToast(msg: string): void {
    this.toastMsg = '✓ ' + msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  startFacialCamera(): void {
    this.facialError   = '';
    this.facialSuccess = '';
    this.captureStatus = '';
    this.captureProgress = 0;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    })
        .then(stream => {
          this.facialStream = stream;
          this.isCameraActive = true;
          this.cdr.detectChanges();
          // Petit délai pour que le DOM affiche la balise <video> avant srcObject
          setTimeout(() => {
            if (this.facialVideo?.nativeElement) {
              this.facialVideo.nativeElement.srcObject = stream;
            }
          }, 150);
        })
        .catch(err => {
          console.error('❌ Erreur caméra:', err);
          this.facialError = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
          this.cdr.detectChanges();
        });
  }

  stopFacialCamera(): void {
    // Stopper un éventuel intervalle de capture en cours
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    if (this.facialStream) {
      this.facialStream.getTracks().forEach(track => track.stop());
      this.facialStream = null;
    }
    this.isCameraActive   = false;
    this.isCapturing      = false;
    this.captureProgress  = 0;
    this.captureStatus    = '';
  }

  /**
   * Lance l'acquisition de FRAMES_REQUIRED frames à CAPTURE_FPS.
   * Le backend exige >= 20 frames avec 2 clignements détectés (liveness).
   */
  captureFace(): void {
    if (!this.facialVideo?.nativeElement) {
      this.facialError = 'Caméra non disponible';
      return;
    }

    const video = this.facialVideo.nativeElement;
    if (video.readyState < 2) {
      this.facialError = 'La caméra n\'est pas encore prête. Patientez un instant.';
      return;
    }

    this.isCapturing     = true;
    this.facialError     = '';
    this.facialSuccess   = '';
    this.captureProgress = 0;
    this.captureStatus   = 'Clignez des yeux naturellement…';
    this.cdr.detectChanges();

    const frames: Blob[] = [];
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;

    const captureOneFrame = (): Promise<Blob | null> =>
        new Promise(resolve => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
        });

    const intervalMs = Math.round(1000 / this.CAPTURE_FPS);

    this.captureInterval = setInterval(async () => {
      const blob = await captureOneFrame();
      if (blob) {
        frames.push(blob);
        this.captureProgress = Math.round((frames.length / this.FRAMES_REQUIRED) * 100);
        this.captureStatus   =
            frames.length < this.FRAMES_REQUIRED
                ? `Capture… ${frames.length}/${this.FRAMES_REQUIRED} — clignez des yeux`
                : 'Envoi au serveur…';
        this.cdr.detectChanges();
      }

      if (frames.length >= this.FRAMES_REQUIRED) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
        this.sendFramesToBackend(frames);
      }
    }, intervalMs);
  }

  /** Envoie les frames au backend via registerFace (POST /facial-ai/register) */
  private sendFramesToBackend(frames: Blob[]): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.facialError  = 'Session introuvable. Veuillez vous reconnecter.';
      this.isCapturing  = false;
      this.cdr.detectChanges();
      return;
    }

    console.log(`📤 Envoi de ${frames.length} frames pour userId=${userId}`);

    this.facialAIService.registerFace(userId, frames).subscribe({
      next: (response) => {
        console.log('✅ Visage enregistré:', response);
        this.hasFacialRecognition = true;
        this.facialSuccess  = `Reconnaissance faciale activée ! (${response.blinks ?? '?'} clignement(s) détecté(s))`;
        this.isCapturing    = false;
        this.captureProgress = 100;
        this.stopFacialCamera();
        this.showFacialSetup = false;
        localStorage.setItem('has_facial_recognition', 'true');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur enregistrement visage:', error);
        const detail = error?.error?.detail;
        if (detail?.code === 'LIVENESS_FAILED') {
          this.facialError = `Vivacité insuffisante — ${detail.blinks ?? 0} clignement(s) détecté(s). Réessayez en clignant normalement.`;
        } else if (detail?.code === 'EMBEDDING_FAILED') {
          this.facialError = 'Aucun visage clair détecté. Améliorez l\'éclairage et recentrez votre visage.';
        } else {
          this.facialError = error.message || 'Erreur lors de l\'enregistrement du visage.';
        }
        this.isCapturing     = false;
        this.captureProgress = 0;
        this.captureStatus   = '';
        this.cdr.detectChanges();
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
    this.hasFacialRecognition = false;
    localStorage.removeItem('has_facial_recognition');
    this.facialSuccess = 'Reconnaissance faciale désactivée';
    this.showToast('Reconnaissance faciale désactivée');
    setTimeout(() => this.facialSuccess = '', 3000);
  }

}
