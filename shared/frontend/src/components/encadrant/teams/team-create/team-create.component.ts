import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamService, TeamRequest, StagiaireInfo } from '../../../../services/team.service';
import { UserProfileService } from '../../../../services/user-profile.service';
import { forkJoin } from 'rxjs';
import { HeaderEncadrantComponent } from '../../header-encadrant/header-encadrant';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css'],
})
export class TeamCreateComponent implements OnInit {
  tousLesStagiaires: StagiaireInfo[] = [];
  stagiairesDisponibles: StagiaireInfo[] = [];
  filteredStagiaires: StagiaireInfo[] = [];
  teamRequest: TeamRequest = {
    nom: '',
    sujet: '',
    encadrantId: Number(localStorage.getItem('userId')) || 0,
    membresIds: [],
  };
  selectedMembers: string[] = [];
  searchTerm: string = '';
  isLoading = false;
  isSubmitting = false;
  errorMessage: string = '';

  constructor(
    private teamService: TeamService,
    private userProfileService: UserProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStagiairesDisponibles();
  }

  loadStagiairesDisponibles(): void {
    this.isLoading = true;

    // Récupérer en parallèle : tous les stagiaires + IDs des stagiaires affectés
    forkJoin({
      tousLesStagiaires: this.userProfileService.getAllStagiaires(),
      stagiairesAffectesIds: this.teamService.getStagiairesAffectesIds(),
    }).subscribe({
      next: (result) => {
        this.tousLesStagiaires = result.tousLesStagiaires;
        const affectesIds = result.stagiairesAffectesIds;

        // Filtrer : garder uniquement les stagiaires qui ne sont PAS dans la liste des affectés
        this.stagiairesDisponibles = this.tousLesStagiaires.filter(
          (stagiaire) => !affectesIds.has(stagiaire.userId),
        );

        this.filteredStagiaires = this.stagiairesDisponibles;
        this.isLoading = false;

        console.log(
          `📊 Statistiques: ${this.tousLesStagiaires.length} stagiaires total, ${affectesIds.size} affectés, ${this.stagiairesDisponibles.length} disponibles`,
        );
      },
      error: (err) => {
        console.error('Erreur chargement stagiaires', err);
        this.errorMessage = 'Impossible de charger la liste des stagiaires disponibles';
        this.isLoading = false;
      },
    });
  }

  filterStagiaires(): void {
    if (!this.searchTerm) {
      this.filteredStagiaires = this.stagiairesDisponibles;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStagiaires = this.stagiairesDisponibles.filter(
        (s) =>
          s.nom.toLowerCase().includes(term) ||
          s.prenom.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term),
      );
    }
  }

  onMemberSelect(event: any, userId: string): void {
    if (event.target.checked) {
      this.selectedMembers.push(userId);
    } else {
      this.selectedMembers = this.selectedMembers.filter((id) => id !== userId);
    }
    this.teamRequest.membresIds = this.selectedMembers;
  }

  isMemberSelected(userId: string): boolean {
    return this.selectedMembers.includes(userId);
  }

  onSubmit(): void {
    if (!this.teamRequest.nom.trim()) {
      this.errorMessage = "Le nom de l'équipe est requis";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.teamService.createTeam(this.teamRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/encadrant/teams']);
      },
      error: (err) => {
        console.error('Erreur création équipe', err);
        this.errorMessage = err.error?.message || "Erreur lors de la création de l'équipe";
        this.isSubmitting = false;
      },
    });
  }
}
