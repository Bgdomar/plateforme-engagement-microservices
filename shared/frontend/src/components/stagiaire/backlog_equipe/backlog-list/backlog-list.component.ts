import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BacklogService, BacklogTacheResponse } from '../../../../services/backlog.service';
import { EquipeService } from '../../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-backlog-list',
  standalone: true,
  imports: [CommonModule, HeaderStagiaireComponent],
  templateUrl: './backlog-list.component.html',
  styleUrls: ['./backlog-list.component.css'],
})
export class BacklogListComponent implements OnInit {
  equipe: any = null;
  taches: BacklogTacheResponse[] = [];
  isLoading = true;
  errorMessage = '';
  showDeleteModal = false;
  tacheToDelete: BacklogTacheResponse | null = null;
  stagiaireId: number = Number(localStorage.getItem('userId'));

  // Filtres
  filterPriorite: string = 'TOUTES';
  filterNiveau: string = 'TOUS';
  filterStatut: string = 'TOUS';

  // Cache des stagiaires
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  readonly statuts = [
    { value: 'TOUS', label: 'Tous' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'A_FAIRE', label: 'À faire' },
    { value: 'ASSIGNEE', label: 'Assignée' },
    { value: 'DEMARREE', label: 'Démarrée' },
    { value: 'COMPLETEE', label: 'Complétée' },
    { value: 'VALIDEE', label: 'Validée' },
    { value: 'REFAIRE', label: 'À refaire' },
  ];

  constructor(
    private backlogService: BacklogService,
    private equipeService: EquipeService,
    private userProfileService: UserProfileService,
    private router: Router,
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
          this.loadBacklog();
        } else {
          this.isLoading = false;
          this.errorMessage = "Vous n'êtes pas encore membre d'une équipe";
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre équipe';
        this.isLoading = false;
      },
    });
  }

  loadBacklog(): void {
    this.isLoading = true;
    this.backlogService.getBacklogByEquipe(this.equipe.id).subscribe({
      next: (taches) => {
        this.taches = taches;
        this.isLoading = false;

        // Charger les noms des créateurs
        const userIds = taches.map(t => t.creeParId).filter(id => id);
        if (userIds.length > 0) {
          this.loadStagiairesInfos(userIds);
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le backlog';
        this.isLoading = false;
      },
    });
  }

  get filteredTaches(): BacklogTacheResponse[] {
    let result = this.taches;

    if (this.filterStatut !== 'TOUS') {
      result = result.filter((t) => t.statut === this.filterStatut);
    }
    if (this.filterPriorite !== 'TOUTES') {
      result = result.filter((t) => t.priorite === this.filterPriorite);
    }
    if (this.filterNiveau !== 'TOUS') {
      result = result.filter((t) => t.niveau === this.filterNiveau);
    }
    return result;
  }

  // ✅ Vérifier si une tâche est modifiable/supprimable
  isEditable(tache: BacklogTacheResponse): boolean {
    return tache.statut === 'EN_ATTENTE';
  }

  editTache(tacheId: number): void {
    const tache = this.taches.find(t => t.id === tacheId);
    if (!tache || !this.isEditable(tache)) {
      this.errorMessage = 'Impossible de modifier une tâche déjà planifiée dans une mission.';
      return;
    }
    this.router.navigate([`/stagiaire/backlog/edit/${tacheId}`]);
  }

  confirmDelete(tache: BacklogTacheResponse): void {
    if (!this.isEditable(tache)) {
      this.errorMessage = 'Impossible de supprimer une tâche déjà planifiée dans une mission.';
      return;
    }
    this.tacheToDelete = tache;
    this.showDeleteModal = true;
  }

  deleteTache(): void {
    if (this.tacheToDelete) {
      this.backlogService
        .deleteTache(this.equipe.id, this.tacheToDelete.id, this.stagiaireId)
        .subscribe({
          next: () => {
            this.showDeleteModal = false;
            this.tacheToDelete = null;
            this.loadBacklog();
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
            this.showDeleteModal = false;
          },
        });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.tacheToDelete = null;
  }

  viewTache(id: number): void {
    this.router.navigate([`/stagiaire/backlog/tache/${id}`]);
  }

  goToCreate(): void {
    this.router.navigate(['/stagiaire/backlog/create']);
  }

  // ─── Helpers UI ───────────────────────────────────────────────────────────────

  getPrioriteClass(priorite: string): string {
    switch (priorite) {
      case 'HAUTE': return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE': return 'priority-low';
      default: return '';
    }
  }

  getPrioriteLabel(priorite: string): string {
    switch (priorite) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priorite;
    }
  }

  getNiveauClass(niveau: string): string {
    switch (niveau) {
      case 'AVANCÉ': return 'level-advanced';
      case 'INTERMEDIAIRE': return 'level-intermediate';
      case 'DEBUTANT': return 'level-beginner';
      default: return '';
    }
  }

  getNiveauLabel(niveau: string): string {
    switch (niveau) {
      case 'DEBUTANT': return 'Débutant';
      case 'INTERMEDIAIRE': return 'Intermédiaire';
      case 'AVANCÉ': return 'Avancé';
      default: return niveau;
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'statut-attente';
      case 'A_FAIRE': return 'statut-afaire';
      case 'ASSIGNEE': return 'statut-assignee';
      case 'DEMARREE': return 'statut-demarree';
      case 'COMPLETEE': return 'statut-completee';
      case 'VALIDEE': return 'statut-validee';
      case 'REFAIRE': return 'statut-refaire';
      default: return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'A_FAIRE': return 'À faire';
      case 'ASSIGNEE': return 'Assignée';
      case 'DEMARREE': return 'Démarrée';
      case 'COMPLETEE': return 'Complétée';
      case 'VALIDEE': return 'Validée';
      case 'REFAIRE': return 'À refaire';
      default: return statut;
    }
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
