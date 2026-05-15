import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface EvaluationRequest {
  commentaire: string;
  note?: number;
  valider: boolean;
}

export interface EvaluationResponse {
  id: number;
  commentaire: string;
  note: number;
  tacheId: number;
  encadrantId: number;
  dateEvaluation: string;
}

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private evaluationUrl = `${environment.apiUrl}/api/evaluations`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  evaluerTache(equipeId: number, tacheId: number, encadrantId: number, request: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(
      `${this.evaluationUrl}/equipes/${equipeId}/taches/${tacheId}?encadrantId=${encadrantId}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  getEvaluationByTache(equipeId: number, tacheId: number): Observable<EvaluationResponse | null> {
    return this.http.get<EvaluationResponse | null>(
      `${this.evaluationUrl}/equipes/${equipeId}/taches/${tacheId}`,
      { headers: this.getHeaders() }
    );
  }

  // ⭐⭐⭐ AJOUTER CETTE MÉTHODE ⭐⭐⭐
  getAllEvaluationsByTache(equipeId: number, tacheId: number): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(
      `${this.evaluationUrl}/equipes/${equipeId}/taches/${tacheId}/all`,
      { headers: this.getHeaders() }
    );
  }
}
