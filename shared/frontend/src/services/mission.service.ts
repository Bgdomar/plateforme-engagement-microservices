import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MissionRequest {
  titre: string;
  description: string;
  deadline: string;
  tacheIds: number[];
}

export interface TacheMissionResponse {
  creeParId: number;
  id: number;
  titre: string;
  description: string;
  statut: string;
  estimationJours?: number;
  priorite?: string;  // ← AJOUTER
  niveau?: string;    // ← AJOUTER
  assigneId?: number;  // ← AJOUTER
}

export interface MissionResponse {
  id: number;
  titre: string;
  description: string;
  deadline: string;
  creeParId: number;
  equipeId: number;
  taches: TacheMissionResponse[];
  dateCreation: string;
  dateMiseAJour: string;
}

@Injectable({ providedIn: 'root' })
export class MissionService {
  private missionUrl = `${environment.apiUrl}/api/missions`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ➕ Créer une mission avec tâches
  creerMission(equipeId: number, stagiaireId: number, request: MissionRequest): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(
      `${this.missionUrl}/equipes/${equipeId}?stagiaireId=${stagiaireId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // ✏️ Modifier une mission
  modifierMission(equipeId: number, missionId: number, stagiaireId: number, request: MissionRequest): Observable<MissionResponse> {
    return this.http.put<MissionResponse>(
      `${this.missionUrl}/equipes/${equipeId}/${missionId}?stagiaireId=${stagiaireId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // 🗑️ Supprimer une mission
  supprimerMission(equipeId: number, missionId: number, stagiaireId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.missionUrl}/equipes/${equipeId}/${missionId}?stagiaireId=${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }

  // 👀 Liste des missions d'une équipe
  getMissionsByEquipe(equipeId: number): Observable<MissionResponse[]> {
    return this.http.get<MissionResponse[]>(
      `${this.missionUrl}/equipes/${equipeId}`,
      { headers: this.getHeaders() }
    );
  }

  // 👀 Détail d'une mission
  getMissionById(equipeId: number, missionId: number): Observable<MissionResponse> {
    return this.http.get<MissionResponse>(
      `${this.missionUrl}/equipes/${equipeId}/${missionId}`,
      { headers: this.getHeaders() }
    );
  }

  // ➕ Ajouter des tâches à une mission existante
  ajouterTachesMission(equipeId: number, missionId: number, stagiaireId: number, tacheIds: number[]): Observable<MissionResponse> {
    return this.http.post<MissionResponse>(
      `${this.missionUrl}/equipes/${equipeId}/${missionId}/taches?stagiaireId=${stagiaireId}`,
      tacheIds,
      { headers: this.getHeaders() }
    );
  }

// Le service doit gérer le cas 204 (corps vide)
  retirerTacheMission(
    equipeId: number, missionId: number, tacheId: number, stagiaireId: number
  ): Observable<MissionResponse | null> {
    return this.http.delete<MissionResponse | null>(
      `${this.missionUrl}/equipes/${equipeId}/${missionId}/taches/${tacheId}?stagiaireId=${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }
}
