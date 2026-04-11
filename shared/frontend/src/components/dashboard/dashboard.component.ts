import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LogoComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  activeTab = 'profile';
  userRole = '';
  userEmail = '';
  firstName = '';
  lastName = '';
  updateSuccess = '';
  updateError = '';
  users: any[] = [];
  saveLoading = false;

  // Team Management
  teams: any[] = [];
  availableStagiaires: any[] = [];
  newTeamName = '';
  newTeamDescription = '';
  selectedTeamId: number | null = null;
  teamMembers: any[] = [];

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.userEmail = this.authService.getUserEmail() || '';
    this.userRole = this.authService.getRole() || 'USER';

    this.loadProfile();
    if (this.userRole === 'ADMIN') {
      this.loadUsers();
    }
    if (this.userRole === 'ORGANIZATION') {
      this.loadTeams();
      this.loadAvailableStagiaires();
      this.loadAllMissions();
    }
    if (this.userRole === 'USER') {
      this.loadMyMissions();
    }
  }

  // Mission Management
  allMissions: any[] = [];
  myMissions: any[] = [];
  newMission = { title: '', description: '', teamId: null, deadline: '' };

  loadAllMissions() {
    this.http.get<any[]>(`${environment.apiUrl}/api/v1/missions`).subscribe({
      next: (res) => this.allMissions = res,
      error: (err) => {
        // Fallback or handle 404/Empty
        this.allMissions = [];
      }
    });
  }

  loadMyMissions() {
    this.http.get<any>(`${environment.apiUrl}/users/me`).subscribe(profile => {
      if (profile.team) {
        this.http.get<any[]>(`${environment.apiUrl}/api/v1/missions/team/${profile.team.id}`).subscribe(res => {
          this.myMissions = res;
        });
      }
    });
  }

  createMission() {
    this.http.post(`${environment.apiUrl}/api/v1/missions`, this.newMission).subscribe({
      next: () => {
        this.newMission = { title: '', description: '', teamId: null, deadline: '' };
        this.loadAllMissions();
      },
      error: (err) => alert('Erreur lors de la création de la mission')
    });
  }

  updateMissionStatus(missionId: number, status: string) {
    this.http.patch(`${environment.apiUrl}/api/v1/missions/${missionId}/status`, { status }).subscribe({
      next: () => {
        if (this.userRole === 'USER') this.loadMyMissions();
        else this.loadAllMissions();
      }
    });
  }

  loadTeams() {
    this.http.get<any[]>(`${environment.apiUrl}/teams/my`).subscribe({
      next: (res) => this.teams = res,
      error: (err) => console.error('Erreur chargement équipes', err)
    });
  }

  loadAvailableStagiaires() {
    this.http.get<any[]>(`${environment.apiUrl}/teams/available-stagiaires`).subscribe({
      next: (res) => this.availableStagiaires = res,
      error: (err) => console.error('Erreur chargement stagiaires disponibles', err)
    });
  }

  createTeam() {
    if (!this.newTeamName) return;
    this.http.post(`${environment.apiUrl}/teams`, {
      name: this.newTeamName,
      description: this.newTeamDescription
    }).subscribe({
      next: () => {
        this.newTeamName = '';
        this.newTeamDescription = '';
        this.loadTeams();
        this.loadAvailableStagiaires();
      },
      error: (err) => alert('Erreur lors de la création de l\'équipe')
    });
  }

  addMemberToTeam(teamId: number, userId: number) {
    if (!teamId || Number.isNaN(teamId) || teamId <= 0) {
      alert("Veuillez sélectionner une équipe valide.");
      return;
    }
    this.http.post(`${environment.apiUrl}/teams/${teamId}/members`, { userIds: [userId] }).subscribe({
      next: () => {
        this.loadTeams();
        this.loadAvailableStagiaires();
      },
      error: (err) => alert('Erreur lors de l\'ajout du membre')
    });
  }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/users/me`).subscribe({
      next: (res) => {
        this.firstName = res.firstName;
        this.lastName = res.lastName;
      }
    });
  }

  loadUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/users/pending`).subscribe({
      next: (res) => this.users = res,
      error: (err) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  approveUser(id: number) {
    this.http.post(`${environment.apiUrl}/admin/users/${id}/approve`, {}).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert('Erreur lors de l\'approbation')
    });
  }

  rejectUser(id: number) {
    this.http.post(`${environment.apiUrl}/admin/users/${id}/reject`, {}).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert('Erreur lors du rejet')
    });
  }

  deleteUser(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.http.delete(`${environment.apiUrl}/admin/users/${id}`).subscribe({
        next: () => this.loadUsers(),
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  saveProfile() {
    this.updateSuccess = '';
    this.updateError = '';
    this.saveLoading = true;
    this.http.put<any>(`${environment.apiUrl}/users/me`, {
      firstName: this.firstName,
      lastName: this.lastName
    }).subscribe({
      next: () => {
        this.saveLoading = false;
        this.updateSuccess = 'Profil mis à jour avec succès !';
      },
      error: () => {
        this.saveLoading = false;
        this.updateError = 'Erreur lors de la mise à jour.';
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
