import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TeamService, TeamResponse } from '../../../../services/team.service';
import {HeaderEncadrantComponent} from "../../header-encadrant/header-encadrant";

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderEncadrantComponent],
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css'],
})
export class TeamListComponent implements OnInit {
  teams: TeamResponse[] = [];
  isLoading = true;
  showDeleteModal = false;
  teamToDelete: TeamResponse | null = null;


  constructor(
    private teamService: TeamService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.teamService.getMyTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipes', err);
        this.isLoading = false;
      },
    });
  }

  editTeam(teamId: string): void {
    this.router.navigate([`/encadrant/teams/edit/${teamId}`]);
  }

  viewTeam(teamId: string): void {
    this.router.navigate([`/encadrant/teams/${teamId}`]);
  }

  confirmDelete(team: TeamResponse): void {
    this.teamToDelete = team;
    this.showDeleteModal = true;
  }

  deleteTeam(): void {
    if (this.teamToDelete) {
      this.teamService.deleteTeam(this.teamToDelete.id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.teamToDelete = null;
          this.loadTeams();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.showDeleteModal = false;
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.teamToDelete = null;
  }

  getMemberCount(team: TeamResponse): number {
    // Utiliser directement la longueur du tableau membres
    return team.membres?.length || 0;
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
