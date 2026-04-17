import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface StagiaireInfo {
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  avatar: string;
  niveauEtudes: string;
  filiere: string;
  etablissement: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllStagiaires(): Observable<StagiaireInfo[]> {
    return this.http.get<StagiaireInfo[]>(`${environment.apiUrl}/api/profil/stagiaires/all`, { headers: this.getHeaders() });
  }

  getStagiaireInfo(userId: string): Observable<StagiaireInfo> {
    return this.http.get<StagiaireInfo>(`${environment.apiUrl}/api/profil/stagiaires/${userId}`, { headers: this.getHeaders() });
  }
}
