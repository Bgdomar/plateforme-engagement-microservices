import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService, TeamResponse, MembreResponse } from '../../../../services/team.service';
import { UserProfileService, StagiaireInfo } from '../../../../services/user-profile.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {
  teamId: string = '';
  team: TeamResponse | null = null;
  availableStagiaires: StagiaireInfo[] = [];
  filteredStagiaires: StagiaireInfo[] = [];
  isLoading = true;
  isAddingMember = false;
  searchTerm = '';
  selectedStagiaireId: string = '';
  showAddMemberModal = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id') || '';
    if (this.teamId) {
      this.loadTeamDetails();
      this.loadAvailableStagiaires();
    }
  }

  loadTeamDetails(): void {
    this.isLoading = true;
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (team) => {
        this.team = team;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipe', err);
        this.errorMessage = 'Impossible de charger les détails de l\'équipe';
        this.isLoading = false;
      }
    });
  }

  loadAvailableStagiaires(): void {
    this.userProfileService.getAllStagiaires().subscribe({
      next: (data) => {
        this.availableStagiaires = data;
        this.filteredStagiaires = data;
      },
      error: (err) => console.error('Erreur chargement stagiaires', err)
    });
  }

  filterStagiaires(): void {
    if (!this.searchTerm) {
      this.filteredStagiaires = this.availableStagiaires;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStagiaires = this.availableStagiaires.filter(s =>
        s.nom.toLowerCase().includes(term) ||
        s.prenom.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }
  }

  getAvailableStagiaires(): StagiaireInfo[] {
    if (!this.team) return this.filteredStagiaires;
    const memberIds = this.team.membres.map(m => m.stagiaireId);
    return this.filteredStagiaires.filter(s => !memberIds.includes(s.userId));
  }

  openAddMemberModal(): void {
    this.selectedStagiaireId = '';
    this.searchTerm = '';
    this.filteredStagiaires = this.availableStagiaires;
    this.showAddMemberModal = true;
  }

  addMember(): void {
    if (this.selectedStagiaireId) {
      this.isAddingMember = true;
      this.teamService.addMember(this.teamId, this.selectedStagiaireId).subscribe({
        next: (updatedTeam) => {
          this.team = updatedTeam;
          this.showAddMemberModal = false;
          this.isAddingMember = false;
        },
        error: (err) => {
          console.error('Erreur ajout membre', err);
          this.isAddingMember = false;
        }
      });
    }
  }

  removeMember(stagiaireId: string): void {
    if (confirm('Voulez-vous vraiment retirer ce membre de l\'équipe ?')) {
      this.teamService.removeMember(this.teamId, stagiaireId).subscribe({
        next: (updatedTeam) => {
          this.team = updatedTeam;
        },
        error: (err) => console.error('Erreur suppression membre', err)
      });
    }
  }

  editTeam(): void {
    this.router.navigate([`/encadrant/teams/edit/${this.teamId}`]);
  }

  deleteTeam(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.')) {
      this.teamService.deleteTeam(this.teamId).subscribe({
        next: () => {
          this.router.navigate(['/encadrant/teams']);
        },
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
