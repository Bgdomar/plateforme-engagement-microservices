import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HeaderEncadrantComponent } from '../header-encadrant/header-encadrant';
import { environment } from '../../../environments/environment';

interface Stagiaire {
  id: number;
  nom: string;
  promotion: string;
  missionsEnCours: number;
  progressionMoyenne: number;
}

interface Livrable {
  id: number;
  titre: string;
  stagiaire: string;
  dateLimite: string;
}

@Component({
  selector: 'app-dashboard-encadrant',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderEncadrantComponent],
  templateUrl: './dashboard-encadrant.html',
  styleUrls: ['./dashboard-encadrant.css'],
})
export class DashboardEncadrantComponent implements OnInit {
  encadrantInfo = {
    nom: '',
    prenom: '',
    email: '',
    departement: '',
    stagiairesEncadres: 0,
  };

  stagiaires: Stagiaire[] = [];
  livrablesAttente: Livrable[] = [];

  // Calculated stats
  get completedMissionsCount(): number {
    return Math.floor(this.stagiaires.length * 1.5);
  }

  get totalMissions(): number {
    return this.stagiaires.reduce((acc, s) => acc + s.missionsEnCours, 0) + this.completedMissionsCount;
  }

  get averageProgress(): number {
    if (this.stagiaires.length === 0) return 0;
    const total = this.stagiaires.reduce((acc, s) => acc + s.progressionMoyenne, 0);
    return Math.round(total / this.stagiaires.length);
  }

  // Loading state
  isLoading = true;

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserData();
      this.loadStagiaires();
      this.loadLivrables();
    }
  }

  private loadUserData(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${environment.apiUrl}/api/profil/${userId}`, { headers })
      .subscribe({
        next: (data) => {
          this.encadrantInfo = {
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            departement: data.departement || 'Développement',
            stagiairesEncadres: 0
          };
        },
        error: (err) => {
          console.error('Erreur chargement profil:', err);
          const savedEmail = localStorage.getItem('user_email');
          if (savedEmail) {
            this.encadrantInfo.email = savedEmail;
          }
        }
      });
  }

  private loadStagiaires(): void {
    // TODO: Charger depuis l'API
    // Pour l'instant, données de démonstration
    this.stagiaires = [
      { id: 1, nom: 'Jean Dupont', promotion: '2024', missionsEnCours: 2, progressionMoyenne: 75 },
      { id: 2, nom: 'Sophie Martin', promotion: '2024', missionsEnCours: 3, progressionMoyenne: 45 },
      { id: 3, nom: 'Lucas Bernard', promotion: '2024', missionsEnCours: 1, progressionMoyenne: 90 },
      { id: 4, nom: 'Emma Petit', promotion: '2024', missionsEnCours: 2, progressionMoyenne: 60 },
    ];
    this.encadrantInfo.stagiairesEncadres = this.stagiaires.length;
    this.isLoading = false;
  }

  private loadLivrables(): void {
    // TODO: Charger depuis l'API
    this.livrablesAttente = [
      { id: 1, titre: "Rapport d'activité", stagiaire: 'Jean Dupont', dateLimite: '2024-12-20' },
      { id: 2, titre: 'Présentation finale', stagiaire: 'Sophie Martin', dateLimite: '2024-12-22' },
      { id: 3, titre: 'Documentation technique', stagiaire: 'Lucas Bernard', dateLimite: '2024-12-18' },
    ];
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  goToStagiaires(): void {
    this.router.navigate(['/stagiaires']);
  }

  goToLivrables(): void {
    this.router.navigate(['/livrables']);
  }

  goToMissions(): void {
    this.router.navigate(['/missions-encadrant']);
  }

  validerLivrable(id: number): void {
    console.log('Validation du livrable:', id);
    // TODO: Appeler l'API pour valider
    this.livrablesAttente = this.livrablesAttente.filter(l => l.id !== id);
  }

  rejeterLivrable(id: number): void {
    console.log('Rejet du livrable:', id);
    // TODO: Appeler l'API pour rejeter
    this.livrablesAttente = this.livrablesAttente.filter(l => l.id !== id);
  }

  logout(): void {
    this.authService.logout();
  }
}
