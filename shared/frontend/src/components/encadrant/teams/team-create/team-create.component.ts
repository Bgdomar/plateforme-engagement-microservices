import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamService, TeamRequest } from '../../../../services/team.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css']
})
export class TeamCreateComponent implements OnInit {
  stagiaires: StagiaireInfo[] = [];
  filteredStagiaires: StagiaireInfo[] = [];
  teamRequest: TeamRequest = {
    nom: '',
    sujet: '',
    membresIds: []
  };
  selectedMembers: string[] = [];
  searchTerm: string = '';
  isLoading = false;
  isSubmitting = false;
  errorMessage: string = '';

  constructor(
    private teamService: TeamService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStagiaires();
  }

  loadStagiaires(): void {
    this.isLoading = true;
    this.userProfileService.getAllStagiaires().subscribe({
      next: (data) => {
        this.stagiaires = data;
        this.filteredStagiaires = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stagiaires', err);
        this.errorMessage = 'Impossible de charger la liste des stagiaires';
        this.isLoading = false;
      }
    });
  }

  filterStagiaires(): void {
    if (!this.searchTerm) {
      this.filteredStagiaires = this.stagiaires;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStagiaires = this.stagiaires.filter(s =>
        s.nom.toLowerCase().includes(term) ||
        s.prenom.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }
  }

  onMemberSelect(event: any, userId: string): void {
    if (event.target.checked) {
      this.selectedMembers.push(userId);
    } else {
      this.selectedMembers = this.selectedMembers.filter(id => id !== userId);
    }
    this.teamRequest.membresIds = this.selectedMembers;
  }

  isMemberSelected(userId: string): boolean {
    return this.selectedMembers.includes(userId);
  }

  onSubmit(): void {
    if (!this.teamRequest.nom.trim()) {
      this.errorMessage = 'Le nom de l\'équipe est requis';
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
        this.errorMessage = err.error?.message || 'Erreur lors de la création de l\'équipe';
        this.isSubmitting = false;
      }
    });
  }
}
