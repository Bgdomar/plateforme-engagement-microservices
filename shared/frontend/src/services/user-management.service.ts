// user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface UserInfo {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  avatarUrl: string;
  typeCompte: 'STAGIAIRE' | 'ENCADRANT' | 'ADMINISTRATEUR';
  statut: 'ACTIF' | 'SUSPENDU' | 'DESACTIVE' | 'EN_ATTENTE';
  dateCreation: string;
  derniereConnexion: string;
  niveauEtudes?: string;
  filiere?: string;
  etablissement?: string;
  departement?: string;
  specialite?: string;
}

export interface UpdateStatutRequest {
  statut: 'ACTIF' | 'SUSPENDU' | 'DESACTIVE';
  motif?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(`${environment.apiUrl}/api/admin/inscriptions/users`, { headers: this.getHeaders() });
  }

  updateUserStatut(userId: number, request: UpdateStatutRequest): Observable<UserInfo> {
    return this.http.patch<UserInfo>(`${environment.apiUrl}/api/admin/inscriptions/users/${userId}/statut`, request, { headers: this.getHeaders() });
  }
}
