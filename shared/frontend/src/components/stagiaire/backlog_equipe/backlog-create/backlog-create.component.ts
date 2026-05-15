import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BacklogService, BacklogTacheRequest } from '../../../../services/backlog.service';
import { EquipeService } from '../../../../services/equipe.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-backlog-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderStagiaireComponent],
  templateUrl: './backlog-create.component.html',
  styleUrls: ['./backlog-create.component.css']
})
export class BacklogCreateComponent implements OnInit {
  equipe: any = null;
  tacheRequest: BacklogTacheRequest = {
    titre: '',
    description: '',
    niveau: 'DEBUTANT',
    priorite: 'MOYENNE',
    estimationJours: undefined   // ← ajouté
  };
  isSubmitting = false;
  errorMessage = '';
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
    private backlogService: BacklogService,
    private equipeService: EquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipe();
  }

  loadEquipe(): void {
    this.equipeService.getEquipesByStagiaire(this.stagiaireId).subscribe({
      next: (equipes) => {
        if (equipes && equipes.length > 0) {
          this.equipe = equipes[0];
        } else {
          this.errorMessage = "Vous n'êtes pas encore membre d'une équipe";
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre équipe';
      }
    });
  }

  onSubmit(): void {
    if (!this.tacheRequest.titre.trim()) {
      this.errorMessage = 'Le titre de la tâche est requis';
      return;
    }
    if (!this.tacheRequest.description?.trim()) {
      this.errorMessage = 'La description de la tâche est requise';
      return;
    }
    if (!this.equipe) {
      this.errorMessage = 'Aucune équipe trouvée';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.backlogService.addTache(this.equipe.id, this.stagiaireId, this.tacheRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/stagiaire/backlog']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la création de la tâche';
        this.isSubmitting = false;
      }
    });
  }
}
