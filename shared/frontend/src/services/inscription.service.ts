// inscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = `${environment.apiUrl}/inscriptions`;
  constructor(private http: HttpClient) {}

  /**
   * Envoyer les données complètes + visage + image de profil au backend
   * Utilise multipart/form-data pour envoyer les fichiers
   */
  createDemande(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes`, formData);
  }

  /**
   * Inscription simple sans reconnaissance faciale
   * Envoie du JSON pur (application/json)
   */
  createDemandeSimple(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes-simple`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Vérifier si l'email existe déjà
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email?email=${email}`);
  }


}
