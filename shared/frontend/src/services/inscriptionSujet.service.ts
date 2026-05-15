// inscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { EquipeResponse } from './equipe.service';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
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
   * 🎯 Inscrire un stagiaire à un sujet (création/affectation auto équipe)
   */
  inscrireStagiaire(sujetId: number, stagiaireId: number): Observable<EquipeResponse> {
    return this.http.post<EquipeResponse>(
      `${this.equipesUrl}/inscrire?sujetId=${sujetId}&stagiaireId=${stagiaireId}`,
      null,
      { headers: this.getHeaders() }
    );
  }
}
