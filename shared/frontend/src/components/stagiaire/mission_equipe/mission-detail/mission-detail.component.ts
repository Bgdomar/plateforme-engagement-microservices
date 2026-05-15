import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MissionService, MissionResponse } from '../../../../services/mission.service';
import { BacklogService, BacklogTacheResponse } from '../../../../services/backlog.service';
import { LivrableService, LivrableRequest, LivrableResponse } from '../../../../services/livrable.service';
import { EquipeService } from '../../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderStagiaireComponent],
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.css']
})
export class MissionDetailComponent implements OnInit {
  missionId: number = 0;
  equipe: any = null;
  mission: MissionResponse | null = null;
  tachesDisponibles: BacklogTacheResponse[] = [];
  selectedTacheIds: Set<number> = new Set();
  isLoading = true;
  isAddingTaches = false;
  errorMessage = '';
  successMessage = '';
  showDeleteModal = false;
  tacheToRemove: any = null;
  stagiaireId: number = Number(localStorage.getItem('userId'));

  // Gestion des actions sur les tâches
  selectedTache: any = null;
  showTacheModal = false;
  modalMode: 'assigner' | 'annuler' | 'demarrer' | 'soumettre' | 'redemarrer' = 'assigner';
  livrablesMap: Map<number, LivrableResponse | null> = new Map();

  // Cache des informations stagiaire
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  // Formulaire de soumission
  soumissionForm = {
    lienURL: '',
    description: '',
    fichier: null as File | null
  };
  isSubmitting = false;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private missionService: MissionService,
      private backlogService: BacklogService,
      private livrableService: LivrableService,
      private equipeService: EquipeService,
      private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.missionId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.missionId) {
      this.loadEquipe();
    }
  }

  // Récupérer le nom complet d'un stagiaire
  getStagiaireNom(stagiaireId: number | undefined): string {
    if (!stagiaireId) return 'Non assigné';
    const stagiaire = this.stagiairesMap.get(stagiaireId);
    if (stagiaire) {
      return `${stagiaire.prenom} ${stagiaire.nom}`;
    }
    return `Stagiaire #${stagiaireId}`;
  }

  // Récupérer les informations d'un stagiaire
  getStagiaireInfo(stagiaireId: number | undefined): StagiaireInfo | null {
    if (!stagiaireId) return null;
    return this.stagiairesMap.get(stagiaireId) || null;
  }

  // Charger les informations des stagiaires en lot
  loadStagiairesInfos(userIds: number[]): void {
    const uniqueIds = [...new Set(userIds.filter(id => id && !this.stagiairesMap.has(id)))];
    uniqueIds.forEach(userId => {
      this.userProfileService.getStagiaireInfo(userId.toString()).subscribe({
        next: (stagiaireInfo) => {
          this.stagiairesMap.set(userId, stagiaireInfo);
        },
        error: () => {
          // En cas d'erreur, créer une entrée par défaut
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

  loadMission(): void {
    this.isLoading = true;
    this.missionService.getMissionById(this.equipe.id, this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.isLoading = false;
        this.loadTachesDisponibles();
        this.loadAllLivrables();

        // Charger les informations des stagiaires associés
        const stagiaireIds: number[] = [];
        mission.taches.forEach(tache => {
          if (tache.assigneId) stagiaireIds.push(tache.assigneId);
          if (tache.creeParId) stagiaireIds.push(tache.creeParId);
        });
        if (mission.creeParId) stagiaireIds.push(mission.creeParId);
        if (stagiaireIds.length > 0) {
          this.loadStagiairesInfos(stagiaireIds);
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la mission';
        this.isLoading = false;
      }
    });
  }

  loadEquipe(): void {
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.equipe = equipes[0];
          this.loadMission();
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

  loadTachesDisponibles(): void {
    this.backlogService.getBacklogByEquipe(this.equipe.id).subscribe({
      next: (taches) => {
        const missionTacheIds = this.mission?.taches.map(t => t.id) || [];
        this.tachesDisponibles = taches.filter(t =>
            t.statut === 'EN_ATTENTE' && !missionTacheIds.includes(t.id)
        );
      },
      error: () => {
        console.error('Impossible de charger les tâches disponibles');
      }
    });
  }

  loadAllLivrables(): void {
    if (!this.mission) return;
    this.mission.taches.forEach(tache => {
      this.livrableService.getDernierLivrable(this.equipe.id, tache.id).subscribe({
        next: (livrable) => {
          this.livrablesMap.set(tache.id, livrable);
        },
        error: () => {
          this.livrablesMap.set(tache.id, null);
        }
      });
    });
  }

  getDernierLivrable(tacheId: number): LivrableResponse | null {
    return this.livrablesMap.get(tacheId) || null;
  }

  // ✅ Vérifier si une tâche peut être retirée (pas démarrée)
  canRemoveTache(tache: any): boolean {
    return tache.statut === 'A_FAIRE';
  }

  // ✅ Vérifier si la mission peut être modifiée
  canEditMission(): boolean {
    return !this.mission?.taches.some(t =>
        t.statut === 'DEMARREE' ||
        t.statut === 'COMPLETEE' ||
        t.statut === 'VALIDEE'
    );
  }

  // ✅ Vérifier si la mission peut être supprimée
  canDeleteMission(): boolean {
    return !this.mission?.taches.some(t =>
        t.statut === 'DEMARREE' ||
        t.statut === 'COMPLETEE' ||
        t.statut === 'VALIDEE'
    );
  }

  // ✅ Vérifier si le stagiaire peut s'auto-assigner
  canAutoAssigner(tache: any): boolean {
    return tache.statut === 'A_FAIRE' && tache.assigneId === null;
  }

  // ✅ Vérifier si le stagiaire peut annuler l'assignation
  canAnnulerAssignation(tache: any): boolean {
    return tache.statut === 'ASSIGNEE' && tache.assigneId === this.stagiaireId;
  }

  // ✅ Vérifier si le stagiaire peut démarrer
  canDemarrer(tache: any): boolean {
    return tache.statut === 'ASSIGNEE' && tache.assigneId === this.stagiaireId;
  }

  // ✅ Vérifier si le stagiaire peut soumettre (DEMARREE seulement)
  canSoumettre(tache: any): boolean {
    return tache.statut === 'DEMARREE' && tache.assigneId === this.stagiaireId;
  }

  // ✅ Vérifier si le stagiaire peut redémarrer (REFAIRE)
  canRedemarrer(tache: any): boolean {
    return tache.statut === 'REFAIRE' && tache.assigneId === this.stagiaireId;
  }

  // Actions sur les tâches
  openAssignerModal(tache: any): void {
    this.selectedTache = tache;
    this.modalMode = 'assigner';
    this.showTacheModal = true;
  }

  openAnnulerModal(tache: any): void {
    this.selectedTache = tache;
    this.modalMode = 'annuler';
    this.showTacheModal = true;
  }

  openDemarrerModal(tache: any): void {
    this.selectedTache = tache;
    this.modalMode = 'demarrer';
    this.showTacheModal = true;
  }

  openSoumettreModal(tache: any): void {
    this.selectedTache = tache;
    this.modalMode = 'soumettre';
    this.soumissionForm = { lienURL: '', description: '', fichier: null };
    this.showTacheModal = true;
  }

  openRedemarrerModal(tache: any): void {
    this.selectedTache = tache;
    this.modalMode = 'redemarrer';
    this.showTacheModal = true;
  }

  confirmerAssigner(): void {
    this.backlogService.autoAssignerTache(this.equipe.id, this.selectedTache.id, this.stagiaireId).subscribe({
      next: () => {
        this.showTacheModal = false;
        this.loadMission();
        this.successMessage = '✅ Tâche assignée avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'assignation';
        this.showTacheModal = false;
      }
    });
  }

  confirmerAnnuler(): void {
    this.backlogService.annulerAssignationTache(this.equipe.id, this.selectedTache.id, this.stagiaireId).subscribe({
      next: () => {
        this.showTacheModal = false;
        this.loadMission();
        this.successMessage = '✅ Assignation annulée avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'annulation';
        this.showTacheModal = false;
      }
    });
  }

  confirmerDemarrer(): void {
    this.backlogService.demarrerTache(this.equipe.id, this.selectedTache.id, this.stagiaireId).subscribe({
      next: () => {
        this.showTacheModal = false;
        this.loadMission();
        this.successMessage = '🚀 Tâche démarrée ! Bon courage !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du démarrage';
        this.showTacheModal = false;
      }
    });
  }

  confirmerRedemarrer(): void {
    this.backlogService.redemarrerTache(this.equipe.id, this.selectedTache.id, this.stagiaireId).subscribe({
      next: () => {
        this.showTacheModal = false;
        this.loadMission();
        this.successMessage = '🔄 Tâche redémarrée ! Vous pouvez maintenant soumettre un nouveau livrable.';
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du redémarrage';
        this.showTacheModal = false;
      }
    });
  }

  onFileSelected(event: any): void {
    this.soumissionForm.fichier = event.target.files[0];
  }

  confirmerSoumettre(): void {
    if (!this.soumissionForm.lienURL && !this.soumissionForm.fichier) {
      this.errorMessage = 'Veuillez fournir un lien ou un fichier';
      return;
    }

    this.isSubmitting = true;
    const request: LivrableRequest = {
      lienURL: this.soumissionForm.lienURL,
      description: this.soumissionForm.description,
      nomFichier: this.soumissionForm.fichier?.name
    };

    this.livrableService.soumettreLivrable(
        this.equipe.id,
        this.selectedTache.id,
        this.stagiaireId,
        request,
        this.soumissionForm.fichier || undefined
    ).subscribe({
      next: () => {
        this.showTacheModal = false;
        this.loadMission();
        this.isSubmitting = false;
        this.successMessage = '📤 Livrable soumis avec succès ! En attente d\'évaluation.';
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la soumission';
        this.isSubmitting = false;
      }
    });
  }

  toggleTacheSelection(tacheId: number): void {
    if (this.selectedTacheIds.has(tacheId)) {
      this.selectedTacheIds.delete(tacheId);
    } else {
      this.selectedTacheIds.add(tacheId);
    }
  }

  isSelected(tacheId: number): boolean {
    return this.selectedTacheIds.has(tacheId);
  }

  selectAll(): void {
    this.tachesDisponibles.forEach(tache => {
      this.selectedTacheIds.add(tache.id);
    });
  }

  deselectAll(): void {
    this.selectedTacheIds.clear();
  }

  ajouterTaches(): void {
    if (this.selectedTacheIds.size === 0) {
      this.errorMessage = 'Sélectionnez au moins une tâche';
      return;
    }

    this.isAddingTaches = true;
    const tacheIds = Array.from(this.selectedTacheIds);

    this.missionService.ajouterTachesMission(this.equipe.id, this.missionId, this.stagiaireId, tacheIds).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.selectedTacheIds.clear();
        this.loadTachesDisponibles();
        this.isAddingTaches = false;
        this.successMessage = `${tacheIds.length} tâche(s) ajoutée(s) avec succès`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout des tâches';
        this.isAddingTaches = false;
      }
    });
  }

  confirmRemoveTache(tache: any): void {
    if (!this.canRemoveTache(tache)) {
      this.errorMessage = 'Impossible de retirer une tâche déjà démarrée';
      return;
    }
    this.tacheToRemove = tache;
    this.showDeleteModal = true;
  }

  retirerTache(): void {
    if (this.tacheToRemove) {
      this.missionService.retirerTacheMission(
          this.equipe.id, this.missionId, this.tacheToRemove.id, this.stagiaireId
      ).subscribe({
        next: (mission) => {
          this.showDeleteModal = false;
          this.tacheToRemove = null;

          if (mission === null) {
            this.router.navigate(['/stagiaire/missions']);
          } else {
            this.mission = mission;
            this.loadMission();
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors du retrait de la tâche';
          this.showDeleteModal = false;
        }
      });
    }
  }

  cancelRemove(): void {
    this.showDeleteModal = false;
    this.tacheToRemove = null;
  }

  editMission(): void {
    this.router.navigate([`/stagiaire/missions/edit/${this.missionId}`]);
  }

  deleteMission(): void {
    if (!this.canDeleteMission()) {
      this.errorMessage = 'Impossible de supprimer cette mission car certaines tâches sont déjà démarrées';
      return;
    }

    this.missionService.supprimerMission(this.equipe.id, this.missionId, this.stagiaireId).subscribe({
      next: () => {
        this.router.navigate(['/stagiaire/missions']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stagiaire/missions']);
  }

  getProgress(): number {
    if (!this.mission || this.mission.taches.length === 0) return 0;
    const completedCount = this.mission.taches.filter(t =>
        t.statut === 'COMPLETEE' || t.statut === 'VALIDEE'
    ).length;
    return (completedCount / this.mission.taches.length) * 100;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'A_FAIRE': 'À faire',
      'ASSIGNEE': 'Assignée',
      'DEMARREE': 'Démarrée',
      'COMPLETEE': 'Complétée',
      'VALIDEE': 'Validée ✅',
      'REFAIRE': 'À refaire 🔄'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'status-attente';
      case 'A_FAIRE': return 'status-afaire';
      case 'ASSIGNEE': return 'status-assignee';
      case 'DEMARREE': return 'status-demarree';
      case 'COMPLETEE': return 'status-completee';
      case 'VALIDEE': return 'status-validee';
      case 'REFAIRE': return 'status-refaire';
      default: return '';
    }
  }

  getFormattedDate(date: string): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDeadlineClass(): string {
    if (!this.mission) return '';
    const today = new Date();
    const deadlineDate = new Date(this.mission.deadline);
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate < today) return 'deadline-expired';
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'deadline-urgent';
    return 'deadline-ok';
  }

  getPrioriteClass(priorite: string | undefined): string {
    if (!priorite) return '';
    switch (priorite) {
      case 'HAUTE': return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE': return 'priority-low';
      default: return '';
    }
  }

  getPrioriteLabel(priorite: string | undefined): string {
    if (!priorite) return 'Non définie';
    switch (priorite) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priorite;
    }
  }

  getNiveauLabel(niveau: string | undefined): string {
    if (!niveau) return 'Non défini';
    switch (niveau) {
      case 'DEBUTANT': return 'Débutant';
      case 'INTERMEDIAIRE': return 'Intermédiaire';
      case 'AVANCÉ': return 'Avancé';
      default: return niveau;
    }
  }

  telechargerFichier(fileName: string): void {
    this.livrableService.telechargerFichier(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement:', err);
        this.errorMessage = 'Erreur lors du téléchargement du fichier';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
