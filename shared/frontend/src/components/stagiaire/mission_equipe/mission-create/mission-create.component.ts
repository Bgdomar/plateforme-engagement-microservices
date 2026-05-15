import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MissionService, MissionRequest } from '../../../../services/mission.service';
import { BacklogService, BacklogTacheResponse } from '../../../../services/backlog.service';
import { EquipeService } from '../../../../services/equipe.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-mission-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderStagiaireComponent],
  templateUrl: './mission-create.component.html',
  styleUrls: ['./mission-create.component.css']
})
export class MissionCreateComponent implements OnInit {
  equipe: any = null;
  tachesDisponibles: BacklogTacheResponse[] = [];
  selectedTacheIds: Set<number> = new Set();

  missionRequest: MissionRequest = {
    titre: '',
    description: '',
    deadline: '',
    tacheIds: []
  };

  isSubmitting = false;
  errorMessage = '';
  stagiaireId: number = Number(localStorage.getItem('userId'));

  niveaux = [
    { value: 'DEBUTANT', label: 'Débutant' },
    { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
    { value: 'AVANCÉ', label: 'Avancé' }
  ];

  priorites = [
    { value: 'HAUTE', label: 'Haute' },
    { value: 'MOYENNE', label: 'Moyenne' },
    { value: 'BASSE', label: 'Basse' }
  ];

  constructor(
    private missionService: MissionService,
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
          this.loadTachesDisponibles();
        } else {
          this.errorMessage = "Vous n'êtes pas encore membre d'une équipe";
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger votre équipe';
      }
    });
  }

  loadTachesDisponibles(): void {
    this.backlogService.getBacklogByEquipe(this.equipe.id).subscribe({
      next: (taches) => {
        this.tachesDisponibles = taches.filter(t => t.statut === 'EN_ATTENTE');
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les tâches disponibles';
      }
    });
  }

  toggleTacheSelection(tacheId: number): void {
    if (this.selectedTacheIds.has(tacheId)) {
      this.selectedTacheIds.delete(tacheId);
    } else {
      this.selectedTacheIds.add(tacheId);
    }
    this.missionRequest.tacheIds = Array.from(this.selectedTacheIds);
  }

  isSelected(tacheId: number): boolean {
    return this.selectedTacheIds.has(tacheId);
  }

  selectAll(): void {
    this.tachesDisponibles.forEach(t => {
      this.selectedTacheIds.add(t.id);
    });
    this.missionRequest.tacheIds = Array.from(this.selectedTacheIds);
  }

  deselectAll(): void {
    this.selectedTacheIds.clear();
    this.missionRequest.tacheIds = [];
  }

  onSubmit(): void {
    if (!this.missionRequest.titre.trim()) {
      this.errorMessage = 'Le titre de la mission est requis';
      return;
    }
    if (!this.missionRequest.deadline) {
      this.errorMessage = 'La deadline est requise';
      return;
    }
    if (this.missionRequest.tacheIds.length === 0) {
      this.errorMessage = 'Sélectionnez au moins une tâche';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.missionService.creerMission(this.equipe.id, this.stagiaireId, this.missionRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/stagiaire/missions']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la création de la mission';
        this.isSubmitting = false;
      }
    });
  }

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

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
