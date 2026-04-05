import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('jwt_token', res.token);
          localStorage.setItem('user_email', res.email);
          localStorage.setItem('user_role', res.role);
        }
      })
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('jwt_token', res.token);
          localStorage.setItem('user_email', res.email);
          localStorage.setItem('user_role', res.role);
        }
      })
    );
  }

  biometricLogin(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/biometric-login`, { email }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('jwt_token', res.token);
          localStorage.setItem('user_email', res.email);
          localStorage.setItem('user_role', res.role);
        }
      })
    );
  }

  markFaceRegistered(): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/me/face-registered`, {});
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }
}
