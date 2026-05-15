// subject.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface SubjectRequest {
  titre: string;
  description: string;
  encadrantId: number;
}

export interface SubjectResponse {
  id: number;
  titre: string;
  description: string;
  encadrantId: number;
  statut: 'OUVERT' | 'FERMÉ';
  dateCreation: string;
  dateMiseAJour: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = environment.apiUrl;
  private sujetsUrl = `${environment.apiUrl}/api/sujets`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * 📝 PUBLIER un nouveau sujet
   * POST /api/sujets
   * Le statut est automatiquement OUVERT
   */
  createSubject(request: SubjectRequest): Observable<SubjectResponse> {
    return this.http.post<SubjectResponse>(this.sujetsUrl, request, { headers: this.getHeaders() });
  }

  /**
   * ✏️ MODIFIER un sujet existant
   * PUT /api/sujets/{id}
   */
  updateSubject(subjectId: number, request: SubjectRequest): Observable<SubjectResponse> {
    return this.http.put<SubjectResponse>(`${this.sujetsUrl}/${subjectId}`, request, { headers: this.getHeaders() });
  }

  /**
   * 🗑️ SUPPRIMER un sujet
   * DELETE /api/sujets/{id}?encadrantId=...
   */
  deleteSubject(subjectId: number, encadrantId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.sujetsUrl}/${subjectId}?encadrantId=${encadrantId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 🔄 CHANGER le statut d'un sujet (OUVERT ↔ FERMÉ)
   * PATCH /api/sujets/{id}/statut?statut=...&encadrantId=...
   */
  changerStatut(subjectId: number, statut: 'OUVERT' | 'FERMÉ', encadrantId: number): Observable<SubjectResponse> {
    return this.http.patch<SubjectResponse>(
      `${this.sujetsUrl}/${subjectId}/statut?statut=${statut}&encadrantId=${encadrantId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 📋 CONSULTER mes sujets (encadrant connecté)
   * GET /api/sujets/encadrant/mes-sujets?encadrantId=...
   */
  getMySubjects(encadrantId: number): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(
      `${this.sujetsUrl}/encadrant/mes-sujets?encadrantId=${encadrantId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * 🔍 CONSULTER un sujet par son ID
   * GET /api/sujets/{id}
   */
  getSubjectById(subjectId: number): Observable<SubjectResponse> {
    return this.http.get<SubjectResponse>(`${this.sujetsUrl}/${subjectId}`, { headers: this.getHeaders() });
  }

  /**
   * 📋 CONSULTER tous les sujets OUVERTs (pour les stagiaires)
   * GET /api/sujets/ouverts
   */
  getAvailableSubjects(): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(`${this.sujetsUrl}/ouverts`, { headers: this.getHeaders() });
  }

  /**
   * 📋 CONSULTER tous les sujets d'un encadrant (pour admin)
   * GET /api/sujets/encadrant/{encadrantId}
   */
  getSubjectsByEncadrant(encadrantId: number): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(
      `${this.sujetsUrl}/encadrant/${encadrantId}`,
      { headers: this.getHeaders() }
    );
  }
}
