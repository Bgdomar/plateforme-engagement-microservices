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
   */
  createDemande(formData: FormData): Observable<any> {
    // Maintenant la méthode accepte un seul paramètre (FormData)
    return this.http.post(`${this.apiUrl}/demandes`, formData);
  }




}
