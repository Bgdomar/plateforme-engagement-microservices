// team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface TeamRequest {
  nom: string;
  sujet: string;
  encadrantId: number;
  membresIds: string[];
}

export interface MembreResponse {
  id: string;
  stagiaireId: string;  // string car vient du JSON Spring (Long sérialisé en string côté Angular)
  dateAjout: string;
}

export interface TeamResponse {
  id: string;
  nom: string;
  sujet: string;
  encadrantId: string;
  dateCreation: string;
  dateMiseAJour: string;
  membres: MembreResponse[];
}

export interface StagiaireInfo {
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  avatar: string;
  niveauEtudes: string;
  filiere: string;
  etablissement: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  // ✅ apiUrl pointe vers la BASE (environment.apiUrl), pas vers /api/equipes
  // pour pouvoir construire d'autres URLs proprement
  apiUrl = environment.apiUrl;

  private equipesUrl = `${environment.apiUrl}/api/equipes`;
  private stagiairesEquipesUrl = `${environment.apiUrl}/api/stagiaires-equipes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getStagiairesAffectesIds(): Observable<Set<string>> {
    return this.http.get<{ stagiaireIds: string[] }>(
      `${this.stagiairesEquipesUrl}/affectes`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => new Set(response.stagiaireIds))
    );
  }

  createTeam(team: TeamRequest): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(this.equipesUrl, team, { headers: this.getHeaders() });
  }

  getMyTeams(): Observable<TeamResponse[]> {
    const encadrantId = localStorage.getItem('userId');
    return this.http.get<TeamResponse[]>(
      `${this.equipesUrl}/encadrant/${encadrantId}`,
      { headers: this.getHeaders() }
    );
  }

  getTeamById(teamId: string): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.equipesUrl}/${teamId}`, { headers: this.getHeaders() });
  }

  updateTeam(teamId: string, team: TeamRequest): Observable<TeamResponse> {
    return this.http.put<TeamResponse>(`${this.equipesUrl}/${teamId}`, team, { headers: this.getHeaders() });
  }

  deleteTeam(teamId: string): Observable<void> {
    return this.http.delete<void>(`${this.equipesUrl}/${teamId}`, { headers: this.getHeaders() });
  }

  addMember(teamId: string, stagiaireId: string): Observable<MembreResponse> {
    return this.http.post<MembreResponse>(
      `${this.equipesUrl}/${teamId}/membres`,
      { stagiaireId },
      { headers: this.getHeaders() }
    );
  }

  removeMember(teamId: string, stagiaireId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.equipesUrl}/${teamId}/membres/${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ NOUVELLE MÉTHODE : récupérer les équipes d'un stagiaire
  // Correspond à GET /api/equipes/stagiaire/{stagiaireId} dans EquipeController
  getEquipesByStagiaire(stagiaireId: number): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(
      `${this.equipesUrl}/stagiaire/${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }
}
