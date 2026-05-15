import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type StatutTache = 'EN_ATTENTE' | 'A_FAIRE' | 'ASSIGNEE' | 'DEMARREE' | 'COMPLETEE' | 'VALIDEE' | 'REFAIRE';
export type NiveauTache = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCÉ';
export type PrioriteTask = 'HAUTE' | 'MOYENNE' | 'BASSE';

export interface BacklogTacheRequest {
  titre: string;
  description: string;
  niveau: NiveauTache;
  priorite: PrioriteTask;
  estimationJours?: number;  // optionnel
}

export interface BacklogTacheResponse {
  id: number;
  titre: string;
  description: string;
  niveau: NiveauTache;
  priorite: PrioriteTask;
  statut: StatutTache;        // ← ajouté
  equipeId: number;
  creeParId: number;
  creeParNom?: string;
  creeParPrenom?: string;
  missionId?: number;         // ← ajouté — null si EN_ATTENTE
  assigneId?: number;         // ← ajouté — null si pas encore assignée
  estimationJours?: number;   // ← ajouté
  dateDebut?: string;         // ← ajouté
  dateCreation: string;
  dateMiseAJour: string;
}

@Injectable({ providedIn: 'root' })
export class BacklogService {

  private backlogUrl = `${environment.apiUrl}/api/backlog`;
  private assignationUrl = `${environment.apiUrl}/api/taches`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ➕ Créer une tâche → statut EN_ATTENTE automatique
  addTache(equipeId: number, stagiaireId: number, request: BacklogTacheRequest): Observable<BacklogTacheResponse> {
    return this.http.post<BacklogTacheResponse>(
      `${this.backlogUrl}/equipes/${equipeId}/taches?stagiaireId=${stagiaireId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // ✏️ Modifier — backend bloque si statut != EN_ATTENTE
  updateTache(equipeId: number, tacheId: number, stagiaireId: number, request: BacklogTacheRequest): Observable<BacklogTacheResponse> {
    return this.http.put<BacklogTacheResponse>(
      `${this.backlogUrl}/equipes/${equipeId}/taches/${tacheId}?stagiaireId=${stagiaireId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // 🗑️ Supprimer — backend bloque si statut != EN_ATTENTE
  deleteTache(equipeId: number, tacheId: number, stagiaireId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.backlogUrl}/equipes/${equipeId}/taches/${tacheId}?stagiaireId=${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }

  // 👀 Toutes les tâches (tous statuts)
  getBacklogByEquipe(equipeId: number): Observable<BacklogTacheResponse[]> {
    return this.http.get<BacklogTacheResponse[]>(
      `${this.backlogUrl}/equipes/${equipeId}/taches`,
      { headers: this.getHeaders() }
    );
  }

  // 👀 Tâches filtrées par statut
  getTachesByStatut(equipeId: number, statut: StatutTache): Observable<BacklogTacheResponse[]> {
    return this.http.get<BacklogTacheResponse[]>(
      `${this.backlogUrl}/equipes/${equipeId}/taches/statut/${statut}`,
      { headers: this.getHeaders() }
    );
  }


  // 👀 Détail d'une tâche
  getTacheById(equipeId: number, tacheId: number): Observable<BacklogTacheResponse> {
    return this.http.get<BacklogTacheResponse>(
      `${this.backlogUrl}/equipes/${equipeId}/taches/${tacheId}`,
      { headers: this.getHeaders() }
    );
  }

  // Ajouter dans le service Backlog existant

// 📌 S'auto-assigner une tâche
  autoAssignerTache(equipeId: number, tacheId: number, stagiaireId: number): Observable<BacklogTacheResponse> {
    return this.http.post<BacklogTacheResponse>(
      `${this.assignationUrl}/equipes/${equipeId}/${tacheId}/assigner?stagiaireId=${stagiaireId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

// ❌ Annuler l'assignation
  annulerAssignationTache(equipeId: number, tacheId: number, stagiaireId: number): Observable<BacklogTacheResponse> {
    return this.http.delete<BacklogTacheResponse>(
      `${this.assignationUrl}/equipes/${equipeId}/${tacheId}/assigner?stagiaireId=${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }

// 🚀 Démarrer une tâche
  demarrerTache(equipeId: number, tacheId: number, stagiaireId: number): Observable<BacklogTacheResponse> {
    return this.http.post<BacklogTacheResponse>(
      `${this.assignationUrl}/equipes/${equipeId}/${tacheId}/demarrer?stagiaireId=${stagiaireId}`,
      {},
      { headers: this.getHeaders() }
    );
  }


  getTacheByIdForEncadrant(tacheId: number): Observable<BacklogTacheResponse> {
    return this.http.get<BacklogTacheResponse>(
      `${this.backlogUrl}/taches/${tacheId}`,
      { headers: this.getHeaders() }
    );
  }

  // 👀 Récupérer les tâches à évaluer pour un encadrant
  getTachesAEvaluer(encadrantId: number): Observable<BacklogTacheResponse[]> {
    return this.http.get<BacklogTacheResponse[]>(
      `${this.backlogUrl}/encadrant/taches-a-evaluer?encadrantId=${encadrantId}`,
      { headers: this.getHeaders() }
    );
  }

  // 🚀 Redémarrer une tâche (après REFAIRE)
  redemarrerTache(equipeId: number, tacheId: number, stagiaireId: number): Observable<BacklogTacheResponse> {
    return this.http.post<BacklogTacheResponse>(
        `${this.assignationUrl}/equipes/${equipeId}/${tacheId}/redemarrer?stagiaireId=${stagiaireId}`,
        {},
        { headers: this.getHeaders() }
    );
  }
}
