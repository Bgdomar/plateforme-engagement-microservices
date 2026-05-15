import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BacklogService, BacklogTacheResponse } from '../../../../services/backlog.service';
import { EvaluationService, EvaluationRequest, EvaluationResponse } from '../../../../services/evaluation.service';
import { LivrableService, LivrableResponse } from '../../../../services/livrable.service';
import { EquipeService } from '../../../../services/equipe.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-evaluation-tache',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderEncadrantComponent],
  templateUrl: './evaluation-tache.component.html',
  styleUrls: ['./evaluation-tache.component.css']
})
export class EvaluationTacheComponent implements OnInit {
  tacheId: number = 0;
  equipe: any = null;
  tache: BacklogTacheResponse | null = null;
  livrables: LivrableResponse[] = [];
  evaluationExistante: EvaluationResponse | null = null;
  toutesEvaluations: EvaluationResponse[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  encadrantId: number = Number(localStorage.getItem('userId'));

  evaluationChoice: 'valider' | 'refaire' = 'valider';

  evaluationForm: EvaluationRequest = {
    commentaire: '',
    note: 60,
    valider: true
  };
  isSubmitting = false;

  // Cache des stagiaires
  stagiairesMap: Map<number, StagiaireInfo> = new Map();

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private backlogService: BacklogService,
      private evaluationService: EvaluationService,
      private livrableService: LivrableService,
      private equipeService: EquipeService,
      private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('🔍 ID de la tâche:', id);
      this.tacheId = Number(id);

      if (this.tacheId && !isNaN(this.tacheId) && this.tacheId > 0) {
        this.loadTache();
      } else {
        this.errorMessage = 'ID de tâche invalide';
        this.isLoading = false;
      }
    });
  }

  getStagiaireNom(stagiaireId: number | undefined): string {
    if (!stagiaireId) return 'Non assigné';
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

  loadTache(): void {
    this.isLoading = true;
    console.log('📡 Appel getTacheByIdForEncadrant pour la tâche:', this.tacheId);

    this.backlogService.getTacheByIdForEncadrant(this.tacheId).subscribe({
      next: (tacheData) => {
        console.log('✅ Tâche reçue:', tacheData);
        this.tache = tacheData;

        if (tacheData.assigneId) {
          this.loadStagiairesInfos([tacheData.assigneId]);
        }
        if (tacheData.creeParId) {
          this.loadStagiairesInfos([tacheData.creeParId]);
        }

        if (tacheData && tacheData.equipeId) {
          this.loadEquipeDetails(tacheData.equipeId);
        } else {
          console.error('❌ Tâche sans equipeId');
          this.errorMessage = 'La tâche n\'est pas associée à une équipe';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement tâche:', err);
        this.errorMessage = err.error?.message || 'Impossible de charger la tâche';
        this.isLoading = false;
      }
    });
  }

  loadEquipeDetails(equipeId: number): void {
    console.log('📡 Appel getEquipeById pour:', equipeId);

    this.equipeService.getEquipeById(equipeId).subscribe({
      next: (equipeData) => {
        console.log('✅ Équipe reçue:', equipeData);
        this.equipe = equipeData;
        this.loadLivrables();
        this.loadAllEvaluations();
      },
      error: (err) => {
        console.error('❌ Erreur chargement équipe:', err);
        this.errorMessage = 'Impossible de charger les détails de l\'équipe';
        this.isLoading = false;
      }
    });
  }

  loadLivrables(): void {
    console.log('📡 Appel getLivrablesByTache - equipeId:', this.tache!.equipeId, 'tacheId:', this.tacheId);

    this.livrableService.getLivrablesByTache(this.tache!.equipeId, this.tacheId).subscribe({
      next: (livrables) => {
        console.log('✅ Livrables reçus:', livrables);
        this.livrables = livrables;
      },
      error: (err) => {
        console.error('❌ Erreur chargement livrables:', err);
        this.livrables = [];
      }
    });
  }

  loadAllEvaluations(): void {
    console.log(
      '📡 Appel getAllEvaluationsByTache - equipeId:',
      this.tache!.equipeId,
      'tacheId:',
      this.tacheId,
    );

    forkJoin({
      derniere: this.evaluationService.getEvaluationByTache(this.tache!.equipeId, this.tacheId),
      toutes: this.evaluationService.getAllEvaluationsByTache(this.tache!.equipeId, this.tacheId)
    }).subscribe({
      next: ({ derniere, toutes }) => {
        console.log('✅ Dernière évaluation:', derniere);
        console.log('✅ Toutes les évaluations:', toutes);
        this.evaluationExistante = derniere;
        this.toutesEvaluations = toutes || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.log('ℹ️ Pas d\'évaluation existante');
        this.evaluationExistante = null;
        this.toutesEvaluations = [];
        this.isLoading = false;
      }
    });
  }

  getDernierLivrable(): LivrableResponse | null {
    if (this.livrables.length === 0) return null;
    return this.livrables[this.livrables.length - 1];
  }

  canSubmit(): boolean {
    if (this.evaluationChoice === 'valider') {
      return this.evaluationForm.note !== null && this.evaluationForm.note !== undefined;
    } else {
      return !!this.evaluationForm.commentaire && this.evaluationForm.commentaire.trim().length > 0;
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

  onSubmit(): void {
    if (!this.canSubmit()) {
      if (this.evaluationChoice === 'valider') {
        this.errorMessage = 'Veuillez saisir une note pour valider la tâche';
      } else {
        this.errorMessage = 'Veuillez saisir un commentaire expliquant pourquoi la tâche doit être refaite';
      }
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: EvaluationRequest = {
      commentaire: this.evaluationForm.commentaire,
      note: this.evaluationChoice === 'valider' ? (this.evaluationForm.note ?? 0) : undefined,
      valider: this.evaluationChoice === 'valider'
    };

    this.evaluationService.evaluerTache(this.tache!.equipeId, this.tacheId, this.encadrantId, request).subscribe({
      next: (evaluation) => {
        this.evaluationExistante = evaluation;
        this.isSubmitting = false;

        if (this.evaluationChoice === 'valider') {
          this.successMessage = `✅ Tâche validée avec succès ! Note: ${evaluation.note}/100`;
        } else {
          this.successMessage = '🔄 Tâche marquée comme "À refaire". Le stagiaire devra soumettre un nouveau livrable.';
        }

        setTimeout(() => this.successMessage = '', 5000);

        // Recharger les données
        this.backlogService.getTacheByIdForEncadrant(this.tacheId).subscribe({
          next: (tacheData) => {
            this.tache = tacheData;
          }
        });
        this.loadLivrables();
        this.loadAllEvaluations();
        this.evaluationForm.commentaire = '';
        if (this.evaluationChoice === 'refaire') {
          this.evaluationForm.note = 60;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'évaluation';
        setTimeout(() => this.errorMessage = '', 3000);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/encadrant/evaluations']);
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

  getNoteColor(note: number): string {
    if (note >= 80) return 'note-excellent';
    if (note >= 60) return 'note-good';
    if (note >= 40) return 'note-average';
    return 'note-bad';
  }

  getNoteLabel(note: number): string {
    if (note >= 80) return 'Excellent';
    if (note >= 60) return 'Très bien';
    if (note >= 40) return 'Moyen';
    return 'Insuffisant';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'A_FAIRE': 'À faire',
      'ASSIGNEE': 'Assignée',
      'DEMARREE': 'Démarrée',
      'COMPLETEE': 'Complétée (en attente validation)',
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

  getPrioriteLabel(priorite: string): string {
    switch (priorite) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priorite;
    }
  }

  getPrioriteClass(priorite: string): string {
    switch (priorite) {
      case 'HAUTE': return 'priority-high';
      case 'MOYENNE': return 'priority-medium';
      case 'BASSE': return 'priority-low';
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

  isReevaluation(): boolean {
    return this.toutesEvaluations.length > 0 &&
        this.toutesEvaluations[this.toutesEvaluations.length - 1]?.note === null &&
        this.tache?.statut === 'COMPLETEE';
  }
}
