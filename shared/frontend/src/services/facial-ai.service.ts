// src/app/service/facial-ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface FacialAnalysisResponse {
  verified: boolean;
  user_email?: string;
  message: string;
}

export interface IdentifyFaceResponse {
  identified: boolean;
  user_email?: string;
  message: string;
  distance?: number;
}

export interface RegisterFaceResponse {
  message: string;
  user_email: string;
}

@Injectable({ providedIn: 'root' })
export class FacialAIService {

  private apiBaseUrl = environment.facialAiUrl;
  private apiUrl = `${this.apiBaseUrl}/api/v1/faces`;

  constructor(private http: HttpClient) {}

  /**
   * Identifier un utilisateur par son visage UNIQUEMENT (sans email).
   * POST /api/v1/faces/identify
   * Le backend cherche dans toute la BDD biométrique et retourne le user_email.
   */
  identifyFace(file: Blob): Observable<IdentifyFaceResponse> {
    const formData = new FormData();
    formData.append('file', file, 'face.jpg');
    return this.http.post<IdentifyFaceResponse>(`${this.apiUrl}/identify`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Vérifier le visage d'un utilisateur spécifique
   * POST /api/v1/faces/verify
   */
  verifyFace(userEmail: string, file: Blob): Observable<FacialAnalysisResponse> {
    const formData = new FormData();
    formData.append('user_email', userEmail);
    formData.append('file', file, 'face.jpg');
    return this.http.post<FacialAnalysisResponse>(`${this.apiUrl}/verify`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Enregistrer le visage (inscription)
   * POST /api/v1/faces/register
   */
  registerFace(userEmail: string, file: Blob): Observable<RegisterFaceResponse> {
    const formData = new FormData();
    formData.append('user_email', userEmail);
    formData.append('file', file, 'face.jpg');
    return this.http.post<RegisterFaceResponse>(`${this.apiUrl}/register`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erreur de connexion au service Facial AI';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = `Impossible de se connecter au service Facial AI. Vérifiez que le serveur est démarré sur ${this.apiBaseUrl}`;
      } else if (error.status === 422) {
        errorMessage = error.error.detail?.message || 'Erreur d\'analyse faciale';
      } else {
        errorMessage = `Code ${error.status}: ${error.message}`;
      }
    }

    console.error('❌ Facial AI Error:', errorMessage);
    return throwError(() => ({ error: error.error, message: errorMessage }));
  }
}
