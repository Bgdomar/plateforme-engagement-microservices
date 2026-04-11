import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type StatutDemande = 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
export type RoleDemande = 'STAGIAIRE' | 'ENCADRANT' | 'ADMINISTRATEUR';

export interface DemandeInscription {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: RoleDemande;
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
  decision: 'VALIDEE' | 'REFUSEE';  // ← corriger ici
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class DemandeInscriptionService {

  private readonly base = `${environment.apiUrl}/api/admin/inscriptions`;

  constructor(private http: HttpClient) {}

  /** Récupère toutes les demandes, filtrables par statut */
  listerDemandes(statut?: StatutDemande): Observable<DemandeInscription[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get<DemandeInscription[]>(this.base, { params });
  }

  /** Approuve ou rejette une demande */
  traiterDemande(id: string, body: TraiterDemandeRequest): Observable<DemandeInscription> {
    return this.http.patch<DemandeInscription>(`${this.base}/${id}/traiter`, body);
  }
}
