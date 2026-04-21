import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HeaderStagiaireComponent } from '../header-stagiaire/header-stagiaire';
import { environment } from '../../../environments/environment';

interface Mission {
  id: number;
  titre: string;
  statut: string;
  progression: number;
  deadline: string;
}

interface Activity {
  type: 'mission' | 'badge' | 'points';
  title: string;
  time: string;
  points?: number;
}

@Component({
  selector: 'app-dashboard-stagiaire',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderStagiaireComponent],
  templateUrl: './dashboard-stagiaire.html',
  styleUrls: ['./dashboard-stagiaire.css']
})
export class DashboardStagiaireComponent implements OnInit {
  // User info
  stagiaireInfo = {
    nom: '',
    prenom: '',
    email: '',
    avatar: null as string | null,
    etablissement: '',
    filiere: '',
    promotion: '2024'
  };

  // Missions
  missions: Mission[] = [];

  // Points
  points = {
    total: 0,
    badges: 0,
    classement: 0
  };

  // Calculated stats
  get completedMissions(): number {
    return this.missions.filter(m => m.statut === 'Terminé').length;
  }

  get inProgressMissions(): number {
    return this.missions.filter(m => m.statut === 'En cours').length;
  }

  get activeMissions(): Mission[] {
    return this.missions.filter(m => m.statut !== 'Terminé').slice(0, 3);
  }

  // Level system
  currentLevel = 1;
  nextLevelPoints = 500;
  levelProgressPercentage = 0;
  levelProgressMessage = '';

  // Next badge
  nextBadge = {
    icon: '🏆',
    name: 'Première mission',
    progress: 0,
    current: 0,
    target: 1
  };

  // Recent activities
  recentActivities: Activity[] = [];

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
      this.loadMissions();
      this.calculateLevelProgress();
      this.generateMockActivities();
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
          this.stagiaireInfo = {
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            avatar: data.avatar || null,
            etablissement: data.etablissement || '',
            filiere: data.filiere || '',
            promotion: '2024'
          };
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur chargement profil:', err);
          // Utiliser les données du localStorage comme fallback
          const savedEmail = localStorage.getItem('user_email');
          if (savedEmail) {
            this.stagiaireInfo.email = savedEmail;
          }
          this.isLoading = false;
        }
      });
  }

  private loadMissions(): void {
    // TODO: Charger depuis l'API
    // Pour l'instant, données de démonstration
    this.missions = [
      { id: 1, titre: 'Développement Frontend Angular', statut: 'En cours', progression: 65, deadline: '2024-12-15' },
      { id: 2, titre: 'Intégration API Backend', statut: 'En cours', progression: 40, deadline: '2024-12-20' },
      { id: 3, titre: 'Tests Unitaires Jasmine', statut: 'Terminé', progression: 100, deadline: '2024-12-10' },
      { id: 4, titre: 'Documentation Technique', statut: 'À faire', progression: 0, deadline: '2024-12-25' }
    ];

    // Simuler des points basés sur les missions
    this.points = {
      total: this.completedMissions * 250 + this.inProgressMissions * 100,
      badges: this.completedMissions,
      classement: 3
    };
  }

  private calculateLevelProgress(): void {
    const pointsPerLevel = 500;
    this.currentLevel = Math.floor(this.points.total / pointsPerLevel) + 1;
    this.nextLevelPoints = this.currentLevel * pointsPerLevel;
    const currentLevelPoints = (this.currentLevel - 1) * pointsPerLevel;
    const pointsInCurrentLevel = this.points.total - currentLevelPoints;
    this.levelProgressPercentage = (pointsInCurrentLevel / pointsPerLevel) * 100;

    const pointsNeeded = this.nextLevelPoints - this.points.total;
    this.levelProgressMessage = `Plus que ${pointsNeeded} points pour passer au niveau ${this.currentLevel + 1}`;

    // Update next badge progress
    this.nextBadge.current = this.completedMissions;
    this.nextBadge.progress = Math.min((this.completedMissions / this.nextBadge.target) * 100, 100);
  }

  private generateMockActivities(): void {
    this.recentActivities = [
      { type: 'mission', title: 'Mission "Tests Unitaires" terminée', time: 'Il y a 2 heures', points: 250 },
      { type: 'badge', title: 'Badge "Première mission" obtenu', time: 'Il y a 1 jour' },
      { type: 'points', title: 'Points bonus de connexion', time: 'Il y a 2 jours', points: 50 },
      { type: 'mission', title: 'Nouvelle mission assignée', time: 'Il y a 3 jours' }
    ];
  }

  getInitials(): string {
    const first = this.stagiaireInfo.prenom?.charAt(0) || '';
    const last = this.stagiaireInfo.nom?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'En cours': 'en-cours',
      'À faire': 'a-faire',
      'Terminé': 'termine',
      'En révision': 'en-revision'
    };
    return map[status] || 'en-cours';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  goToMissions(): void {
    this.router.navigate(['/missions']);
  }

  logout(): void {
    this.authService.logout();
  }
}
