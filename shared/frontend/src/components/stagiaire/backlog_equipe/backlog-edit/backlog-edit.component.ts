import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BacklogService, BacklogTacheRequest, BacklogTacheResponse } from '../../../../services/backlog.service';
import { EquipeService } from '../../../../services/equipe.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-backlog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderStagiaireComponent],
  templateUrl: './backlog-edit.component.html',
  styleUrls: ['./backlog-edit.component.css']
})
export class BacklogEditComponent implements OnInit {
  tacheId: number = 0;
  equipe: any = null;
  tache: BacklogTacheResponse | null = null;
  tacheRequest: BacklogTacheRequest = {
    titre: '',
    description: '',
    niveau: 'DEBUTANT',
    priorite: 'MOYENNE',
    estimationJours: undefined
  };
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  // ✅ Indique si la tâche est encore modifiable
  isEditable = false;
  stagiaireId: number = Number(localStorage.getItem('userId'));

  niveaux = [
    { value: 'DEBUTANT',      label: 'Débutant' },
    { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
    { value: 'AVANCÉ',        label: 'Avancé' }
  ];

  priorites = [
    { value: 'HAUTE',   label: 'Haute' },
    { value: 'MOYENNE', label: 'Moyenne' },
    { value: 'BASSE',   label: 'Basse' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backlogService: BacklogService,
    private equipeService: EquipeService
  ) {}

  ngOnInit(): void {
    this.tacheId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.tacheId) {
      this.loadEquipe();
    }
  }

  loadEquipe(): void {
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.equipe = equipes[0];
          this.loadTache();
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

  loadTache(): void {
    this.isLoading = true;
    this.backlogService.getTacheById(this.equipe.id, this.tacheId).subscribe({
      next: (tache) => {
        this.tache = tache;

        // ✅ Vérifier si la tâche est encore modifiable
        this.isEditable = tache.statut === 'EN_ATTENTE';

        if (!this.isEditable) {
          this.errorMessage = `Cette tâche ne peut plus être modifiée (statut: ${tache.statut}).`;
        }

        this.tacheRequest = {
          titre: tache.titre,
          description: tache.description,
          niveau: tache.niveau,
          priorite: tache.priorite,
          estimationJours: tache.estimationJours
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la tâche';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.isEditable) {
      this.errorMessage = 'Cette tâche ne peut plus être modifiée.';
      return;
    }
    if (!this.tacheRequest.titre.trim()) {
      this.errorMessage = 'Le titre de la tâche est requis';
      return;
    }
    if (!this.tacheRequest.description?.trim()) {
      this.errorMessage = 'La description de la tâche est requise';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.backlogService.updateTache(this.equipe.id, this.tacheId, this.stagiaireId, this.tacheRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/stagiaire/backlog']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.isSubmitting = false;
      }
    });
  }
}
