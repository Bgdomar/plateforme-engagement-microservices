import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MissionService, MissionResponse } from '../../../../services/mission.service';
import { EquipeService } from '../../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, HeaderStagiaireComponent],
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.css']
})
export class MissionListComponent implements OnInit {
  equipe: any = null;
  missions: MissionResponse[] = [];
  isLoading = true;
  errorMessage = '';
  showDeleteModal = false;
  missionToDelete: MissionResponse | null = null;
  stagiaireId: number = Number(localStorage.getItem('userId'));

  // Cache des stagiaires
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  constructor(
    private missionService: MissionService,
    private equipeService: EquipeService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipe();
  }

  getStagiaireNom(stagiaireId: number | undefined): string {
    if (!stagiaireId) return 'Inconnu';
    const stagiaire = this.stagiairesMap.get(stagiaireId);
    if (stagiaire) {
      return `${stagiaire.prenom} ${stagiaire.nom}`;
    }
    return `Stagiaire #${stagiaireId}`;
  }

  loadStagiairesInfos(userIds: number[]): void {
    const uniqueIds = [...new Set(userIds.filter(id => id && !this.stagiairesMap.has(id)))];
    uniqueIds.forEach(userId => {
      this.userProfileService.getStagiaireInfo(userId.toString()).subscribe({
        next: (stagiaireInfo) => {
          this.stagiairesMap.set(userId, stagiaireInfo);
        },
        error: () => {
          this.stagiairesMap.set(userId, {
            userId: userId.toString(),
            nom: `Stagiaire #${userId}`,
            prenom: '',
            email: '',
            avatar: '',
            niveauEtudes: '',
            filiere: '',
            etablissement: ''
          } as StagiaireInfo);
        }
      });
    });
  }

  loadEquipe(): void {
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.equipe = equipes[0];
          this.loadMissions();
        } else {
          this.errorMessage = "Vous n'êtes pas encore membre d'une équipe";
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre équipe';
        this.isLoading = false;
      }
    });
  }

  loadMissions(): void {
    this.isLoading = true;
    this.missionService.getMissionsByEquipe(this.equipe.id).subscribe({
      next: (missions) => {
        this.missions = missions;
        this.isLoading = false;

        const stagiaireIds = missions.map(m => m.creeParId).filter(id => id);
        if (stagiaireIds.length > 0) {
          this.loadStagiairesInfos(stagiaireIds);
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les missions';
        this.isLoading = false;
      }
    });
  }

  // ✅ Vérifier si une mission peut être supprimée (aucune tâche démarrée)
  canDeleteMission(mission: MissionResponse): boolean {
    return !mission.taches.some(tache =>
      tache.statut === 'DEMARREE' ||
      tache.statut === 'COMPLETEE' ||
      tache.statut === 'VALIDEE'
    );
  }

  confirmDelete(mission: MissionResponse): void {
    if (!this.canDeleteMission(mission)) {
      this.errorMessage = 'Impossible de supprimer cette mission car certaines tâches sont déjà démarrées.';
      return;
    }
    this.missionToDelete = mission;
    this.showDeleteModal = true;
  }

  deleteMission(): void {
    if (this.missionToDelete) {
      this.missionService.supprimerMission(this.equipe.id, this.missionToDelete.id, this.stagiaireId).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.missionToDelete = null;
          this.loadMissions();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
          this.showDeleteModal = false;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.missionToDelete = null;
  }

  viewMission(id: number): void {
    this.router.navigate([`/stagiaire/missions/${id}`]);
  }

  goToCreate(): void {
    this.router.navigate(['/stagiaire/missions/create']);
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getDeadlineClass(deadline: string): string {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate < today) return 'deadline-expired';
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'deadline-urgent';
    return 'deadline-ok';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'A_FAIRE': 'À faire',
      'ASSIGNEE': 'Assignée',
      'DEMARREE': 'Démarrée',
      'COMPLETEE': 'Complétée',
      'VALIDEE': 'Validée',
      'REFAIRE': 'À refaire'
    };
    return labels[statut] || statut;
  }

  getProgress(mission: MissionResponse): number {
    if (!mission.taches || mission.taches.length === 0) return 0;
    const completedCount = mission.taches.filter(t =>
      t.statut === 'COMPLETEE' || t.statut === 'VALIDEE'
    ).length;
    return (completedCount / mission.taches.length) * 100;
  }
}
