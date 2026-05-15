import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MissionService, MissionRequest } from '../../../../services/mission.service';
import { EquipeService } from '../../../../services/equipe.service';
import { HeaderStagiaireComponent } from '../../header-stagiaire/header-stagiaire';

@Component({
  selector: 'app-mission-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderStagiaireComponent],
  templateUrl: './mission-edit.component.html',
  styleUrls: ['./mission-edit.component.css']
})
export class MissionEditComponent implements OnInit {
  missionId: number = 0;
  equipe: any = null;
  mission: any = null;
  missionRequest: MissionRequest = {
    titre: '',
    description: '',
    deadline: '',
    tacheIds: []
  };
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  stagiaireId: number = Number(localStorage.getItem('userId'));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionService: MissionService,
    private equipeService: EquipeService
  ) {}

  ngOnInit(): void {
    this.missionId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.missionId) {
      this.loadEquipe();
    }
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

  loadMission(): void {
    this.isLoading = true;
    this.missionService.getMissionById(this.equipe.id, this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.missionRequest = {
          titre: mission.titre,
          description: mission.description,
          deadline: mission.deadline,
          tacheIds: []
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la mission';
        this.isLoading = false;
      }
    });
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

    this.isSubmitting = true;
    this.errorMessage = '';

    this.missionService.modifierMission(this.equipe.id, this.missionId, this.stagiaireId, this.missionRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate([`/stagiaire/missions/${this.missionId}`]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la modification';
        this.isSubmitting = false;
      }
    });
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }


}
