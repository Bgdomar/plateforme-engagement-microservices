import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUserService, AdminUserRequest } from '../../../services/admin-user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  isEdit = false;
  userId: number | null = null;
  loadingUser = false;
  saving = false;
  errorMessage = '';

  roles = ['ADMIN', 'ORGANIZATION', 'ENCADRANT', 'STAGIAIRE', 'USER'];
  statuses = ['ACTIVE', 'APPROVED', 'PENDING', 'BLOCKED', 'SUSPENDED'];

  form: AdminUserRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    department: '',
    address: '',
    role: '',
    status: 'ACTIVE'
  };

  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUserService: AdminUserService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.userId = +idParam;
      this.loadUser();
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    this.loadingUser = true;
    this.adminUserService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.form = {
          email: user.email,
          password: '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          position: user.position || '',
          department: user.department || '',
          address: user.address || '',
          role: user.role,
          status: user.status
        };
        this.loadingUser = false;
      },
      error: () => {
        this.loadingUser = false;
        this.errorMessage = 'Failed to load user data.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.saving = true;

    const request: AdminUserRequest = { ...this.form };
    if (this.isEdit && (!request.password || request.password.trim() === '')) {
      delete request.password;
    }

    const obs$ = this.isEdit && this.userId
      ? this.adminUserService.updateUser(this.userId, request)
      : this.adminUserService.createUser(request);

    obs$.subscribe({
      next: () => {
        this.saving = false;
        this.showToast(this.isEdit ? 'User updated successfully' : 'User created successfully', 'success');
        setTimeout(() => this.router.navigate(['/admin/users']), 1000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || err?.error?.detail || 'An error occurred. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }
}
