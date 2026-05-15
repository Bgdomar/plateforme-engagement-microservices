// equipe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MembreEquipeResponse {
  id: number;
  stagiaireId: number;
  stagiaireNom?: string;
  stagiairePrenom?: string;
  stagiaireEmail?: string;
  dateAjout: string;
}

export interface EquipeResponse {
  id: number;
  nom: string;
  sujetId: number;
  sujetTitre: string;
  encadrantId: number;
  statut: 'ACTIVE' | 'COMPLET';
  nbMembres: number;
  dateCreation: string;
  dateMiseAJour: string;
  membres: MembreEquipeResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = environment.apiUrl;
  private equipesUrl = `${environment.apiUrl}/api/equipes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * 📋 Consulter les équipes d'un encadrant
   */
  getEquipesByEncadrant(encadrantId: number): Observable<EquipeResponse[]> {
    return this.http.get<EquipeResponse[]>(
      `${this.equipesUrl}/encadrant/${encadrantId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 📋 Consulter l'équipe d'un stagiaire
   */
  getEquipesByStagiaire(stagiaireId: number): Observable<EquipeResponse[]> {
    return this.http.get<EquipeResponse[]>(
      `${this.equipesUrl}/stagiaire/${stagiaireId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 📋 Détail d'une équipe
   */
  getEquipeById(equipeId: number): Observable<EquipeResponse> {
    return this.http.get<EquipeResponse>(
      `${this.equipesUrl}/${equipeId}`,
      { headers: this.getHeaders() }
    );
  }
}
