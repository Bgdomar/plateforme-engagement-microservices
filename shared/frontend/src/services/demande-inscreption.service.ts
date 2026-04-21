// demande-inscreption.service.ts - Version complète
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// ✅ Exporter l'enum StatutDemande
export type StatutDemande = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';

export interface DemandeInscription {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'STAGIAIRE' | 'ENCADRANT';
  statut: StatutDemande;
  dateDemande: string;
  dateTraitement?: string;
  commentaireAdmin?: string;
  niveauEtudes?: string;
  filiere?: string;
  etablissement?: string;
  departement?: string;
  specialite?: string;
  urlImage?: string;
}

export interface TraiterDemandeRequest {
  decision: 'VALIDEE' | 'REFUSEE';
  commentaire?: string;
}

export interface DeleteDemandesResponse {
  totalSupprimees: number;
  totalNonSupprimees: number;
  erreurs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DemandeInscriptionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  listerDemandes(statut?: string): Observable<DemandeInscription[]> {
    let url = `${this.apiUrl}/api/admin/inscriptions`;
    if (statut) {
      url += `?statut=${statut}`;
    }
    return this.http.get<DemandeInscription[]>(url, { headers: this.getHeaders() });
  }

  traiterDemande(id: number, request: TraiterDemandeRequest): Observable<DemandeInscription> {
    return this.http.patch<DemandeInscription>(
      `${this.apiUrl}/api/admin/inscriptions/${id}/traiter`,
      request,
      { headers: this.getHeaders() }
    );
  }

  supprimerDemandes(demandeIds: number[]): Observable<DeleteDemandesResponse> {
    return this.http.delete<DeleteDemandesResponse>(`${this.apiUrl}/api/admin/inscriptions`, {
      headers: this.getHeaders(),
      body: { demandeIds: demandeIds }
    });
  }
}
