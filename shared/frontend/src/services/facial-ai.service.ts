// src/app/service/facial-ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface FacialAnalysisResponse {
  isLive: boolean;
  faceDetected: boolean;
  confidence: number;
  faceCount: number;
  bestFrameIndex: number;
  blinkCount?: number;
  message?: string;
}

export interface IdentifyFaceResponse {
  success: boolean;
  user_id: string;
  distance: number;
  blinks: number;
  message: string;
}

export interface RegisterFaceResponse {
  success: boolean;
  profil_id?: string;
  blinks?: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FacialAIService {

  private apiUrl = `${environment.apiUrl}/facial-ai`;

  constructor(private http: HttpClient) {}

  /**
   * Identifier un utilisateur par son visage UNIQUEMENT (sans email).
   * POST /facial-ai/identify
   * Le backend cherche dans toute la BDD biométrique et retourne le user_id.
   */
  identifyFace(frames: Blob[]): Observable<IdentifyFaceResponse> {
    const formData = new FormData();
    frames.forEach((frame, i) => {
      formData.append('frames', frame, `frame_${i}.jpg`);
    });
    return this.http.post<IdentifyFaceResponse>(`${this.apiUrl}/identify`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Analyser les frames pour détection de visage et vivacité
   */
  analyzeFrames(formData: FormData): Observable<FacialAnalysisResponse> {
    return this.http.post<FacialAnalysisResponse>(`${this.apiUrl}/analyze`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Enregistrer le visage (inscription)
   */
  registerFace(userId: string, frames: Blob[]): Observable<RegisterFaceResponse> {
    const formData = new FormData();
    formData.append('user_id', userId);
    frames.forEach((frame, i) => {
      formData.append('frames', frame, `frame_${i}.jpg`);
    });
    return this.http.post<RegisterFaceResponse>(`${this.apiUrl}/register`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Authentifier le visage (connexion)
   */
  authenticateFace(userId: string, frames: Blob[]): Observable<any> {
    const formData = new FormData();
    formData.append('user_id', userId);
    frames.forEach((frame, i) => {
      formData.append('frames', frame, `frame_${i}.jpg`);
    });
    return this.http.post(`${this.apiUrl}/authenticate`, formData)
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
        errorMessage = 'Impossible de se connecter au service Facial AI. Vérifiez que le serveur est démarré sur http://localhost:8000';
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
