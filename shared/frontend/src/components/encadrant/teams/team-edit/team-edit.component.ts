import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TeamService, TeamRequest, TeamResponse } from '../../../../services/team.service';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.css'],
})
export class TeamEditComponent implements OnInit {
  teamId: string = '';
  team: TeamResponse | null = null;
  teamRequest: TeamRequest = {
    nom: '',
    sujet: '',
    encadrantId: 0, // ← AJOUTER CETTE LIGNE
    membresIds: [],
  };
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
  ) {}

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id') || '';
    if (this.teamId) {
      this.loadTeam();
    }
  }

  loadTeam(): void {
    this.isLoading = true;
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (team) => {
        this.team = team;
        this.teamRequest = {
          nom: team.nom,
          sujet: team.sujet || '',
          encadrantId: Number(team.encadrantId),
          membresIds: team.membres.map((m) => m.stagiaireId),
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipe', err);
        this.errorMessage = "Impossible de charger l'équipe";
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (!this.teamRequest.nom.trim()) {
      this.errorMessage = "Le nom de l'équipe est requis";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.teamService.updateTeam(this.teamId, this.teamRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate([`/encadrant/teams/${this.teamId}`]);
      },
      error: (err) => {
        console.error('Erreur mise à jour', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.isSubmitting = false;
      },
    });
  }
}
