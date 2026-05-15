import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface LivrableRequest {
  nomFichier?: string;
  lienURL?: string;
  description?: string;
}

export interface LivrableResponse {
  id: number;
  nomFichier: string;
  lienURL: string;
  description: string;
  tacheId: number;
  stagiaireId: number;
  dateSoumission: string;
}

@Injectable({ providedIn: 'root' })
export class LivrableService {
  private livrableUrl = `${environment.apiUrl}/api/livrables`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  soumettreLivrable(
    equipeId: number,
    tacheId: number,
    stagiaireId: number,
    request: LivrableRequest,
    fichier?: File
  ): Observable<LivrableResponse> {
    const formData = new FormData();
    if (fichier) {
      formData.append('fichier', fichier);
    }
    // Envoyer les champs individuellement plutôt qu'un objet JSON
    formData.append('lienURL', request.lienURL || '');
    formData.append('description', request.description || '');
    if (request.nomFichier) {
      formData.append('nomFichier', request.nomFichier);
    }

    return this.http.post<LivrableResponse>(
      `${this.livrableUrl}/equipes/${equipeId}/taches/${tacheId}?stagiaireId=${stagiaireId}`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getLivrablesByTache(equipeId: number, tacheId: number): Observable<LivrableResponse[]> {
    return this.http.get<LivrableResponse[]>(
        `${this.livrableUrl}/equipes/${equipeId}/taches/${tacheId}`,
        { headers: this.getHeaders() }
    );
  }

  getDernierLivrable(equipeId: number, tacheId: number): Observable<LivrableResponse | null> {
    return this.http.get<LivrableResponse | null>(
        `${this.livrableUrl}/equipes/${equipeId}/taches/${tacheId}/dernier`,
        { headers: this.getHeaders() }
    );
  }

  // ✅ NOUVELLE MÉTHODE : Télécharger un fichier
  telechargerFichier(fileName: string): Observable<Blob> {
    return this.http.get(`${this.livrableUrl}/download/${fileName}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}
