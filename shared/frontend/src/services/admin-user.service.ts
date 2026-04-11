import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  department: string;
  address: string;
  profileImageUrl: string;
  role: string;
  status: string;
  active: boolean;
  faceRegistered: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPage {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AdminUserRequest {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  department?: string;
  address?: string;
  role?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {

  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Observable<AdminUserPage> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    return this.http.get<AdminUserPage>(this.apiUrl, { params: httpParams });
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  createUser(request: AdminUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.apiUrl, request);
  }

  updateUser(id: number, request: AdminUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}`, request);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  blockUser(id: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}/block`, {});
  }

  activateUser(id: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}/activate`, {});
  }
}
