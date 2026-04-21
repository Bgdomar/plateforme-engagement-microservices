// services/mission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MissionRequest {
  titre: string;
  description: string;
  deadline: string;
  niveau: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  membreEquipeId: number;  // ← number au lieu de string
}
export interface MissionResponse {
  id: number;
  titre: string;
  description: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  deadline: string;
  niveau: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  dateCreation: string;
  dateDebut: string | null;
  dateMiseAJour: string;   // ← était string
  membreEquipeId: number;  // ← était string
  stagiaireId: number;     // ← était string
  equipeId: number;
  livrables: LivrableResponse[];
  evaluation: EvaluationResponse | null;
}

export interface LivrableResponse {
  id: string;
  nomFichier: string;
  lienURL: string;
  description: string;
  dateSoumission: string;
}

export interface EvaluationResponse {
  id: string;
  commentaire: string;
  pointsAttribues: number;
  dateEvaluation: string;
  evaluateurId: string;
}

@Injectable({
  providedIn: 'root',
})
export class MissionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Créer une mission
  createMission(request: MissionRequest): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(`${this.apiUrl}/api/missions`, request, {
      headers: this.getHeaders(),
    });
  }

  // Modifier une mission
  updateMission(missionId: number, request: MissionRequest): Observable<MissionResponse> {
    return this.http.put<MissionResponse>(`${this.apiUrl}/api/missions/${missionId}`, request, {
      headers: this.getHeaders(),
    });
  }

  // Supprimer une mission
  deleteMission(missionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/missions/${missionId}`, {
      headers: this.getHeaders(),
    });
  }

  // Démarrer une mission
  demarrerMission(missionId: number, stagiaireId: number): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(
      `${this.apiUrl}/api/missions/${missionId}/demarrer?stagiaireId=${stagiaireId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Terminer une mission
  terminerMission(missionId: number, stagiaireId: number): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(
      `${this.apiUrl}/api/missions/${missionId}/terminer?stagiaireId=${stagiaireId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Annuler une mission
  annulerMission(missionId: number, stagiaireId: number): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(
      `${this.apiUrl}/api/missions/${missionId}/annuler?stagiaireId=${stagiaireId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Consulter une mission par ID
  getMissionById(missionId: number): Observable<MissionResponse> {
    return this.http.get<MissionResponse>(`${this.apiUrl}/api/missions/${missionId}`, {
      headers: this.getHeaders(),
    });
  }

  // Consulter mes missions (stagiaire connecté)
  getMesMissions(stagiaireId: number): Observable<MissionResponse[]> {
    return this.http.get<MissionResponse[]>(
        `${this.apiUrl}/api/missions/mes-missions?stagiaireId=${stagiaireId}`,
        { headers: this.getHeaders() }
    );
  }
}
