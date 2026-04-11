import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface LoginResponse {
  token: string;
  role: string;
  userId: string;
  email: string;
  redirectUrl: string;
}

export interface ErrorResponse {
  message: string;
  status?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, motDePasse })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('email', response.email);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur côté serveur
      if (error.status === 401) {
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = 'Email ou mot de passe incorrect';
        }
      } else if (error.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }
    }

    console.error('Erreur de connexion:', errorMessage);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  /**
   * Connexion par reconnaissance faciale.
   * Appelé après validation réussie par le service Python.
   * Le backend Spring Boot vérifie que l'userId existe et retourne un token JWT.
   */
  facialLogin(userId: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/facial-login`, { userId })
      .pipe(
        tap(response => {
          localStorage.setItem('token',  response.token);
          localStorage.setItem('role',   response.role);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('email',  response.email);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMINISTRATEUR';
  }

  isStagiaire(): boolean {
    return this.getRole() === 'STAGIAIRE';
  }

  isEncadrant(): boolean {
    return this.getRole() === 'ENCADRANT';
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  getUserEmail() {
    return localStorage.getItem('email');
  }
}
