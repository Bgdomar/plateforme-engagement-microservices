import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface TeamRequest {
  nom: string;
  sujet: string;
  membresIds: string[];
}

export interface TeamResponse {
  id: string;
  nom: string;
  sujet: string;
  encadrantId: string;
  encadrantNom: string;
  encadrantPrenom: string;
  dateCreation: string;
  membres: MembreResponse[];
  nombreMembres: number;
}

export interface MembreResponse {
  id: string;
  stagiaireId: string;
  nom: string;
  prenom: string;
  email: string;
  avatar: string;
  dateAjout: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/api/teams`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createTeam(team: TeamRequest): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(this.apiUrl, team, { headers: this.getHeaders() });
  }

  getMyTeams(): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTeamById(teamId: string): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.apiUrl}/${teamId}`, { headers: this.getHeaders() });
  }

  updateTeam(teamId: string, team: TeamRequest): Observable<TeamResponse> {
    return this.http.put<TeamResponse>(`${this.apiUrl}/${teamId}`, team, { headers: this.getHeaders() });
  }

  deleteTeam(teamId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}`, { headers: this.getHeaders() });
  }

  addMember(teamId: string, stagiaireId: string): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(`${this.apiUrl}/${teamId}/members`, { stagiaireId }, { headers: this.getHeaders() });
  }

  removeMember(teamId: string, stagiaireId: string): Observable<TeamResponse> {
    return this.http.delete<TeamResponse>(`${this.apiUrl}/${teamId}/members/${stagiaireId}`, { headers: this.getHeaders() });
  }
}
