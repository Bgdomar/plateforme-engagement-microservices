import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUserService, AdminUser } from '../../../services/admin-user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit {
  user: AdminUser | null = null;
  loading = true;
  userId!: number;

  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUserService: AdminUserService
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.adminUserService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to load user', 'error');
      }
    });
  }

  getInitials(): string {
    if (!this.user) return '';
    const f = this.user.firstName?.charAt(0) || '';
    const l = this.user.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || this.user.email.charAt(0).toUpperCase();
  }

  getRoleBadge(): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      ORGANIZATION: 'bg-blue-100 text-blue-800',
      ENCADRANT: 'bg-indigo-100 text-indigo-800',
      STAGIAIRE: 'bg-teal-100 text-teal-800',
      USER: 'bg-gray-100 text-gray-800'
    };
    return map[this.user?.role || ''] || 'bg-gray-100 text-gray-800';
  }

  getStatusBadge(): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      BLOCKED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      REJECTED: 'bg-red-100 text-red-700',
      DELETED: 'bg-gray-100 text-gray-500'
    };
    return map[this.user?.status || ''] || 'bg-gray-100 text-gray-800';
  }

  editUser(): void {
    this.router.navigate(['/admin/users', this.userId, 'edit']);
  }

  blockUser(): void {
    this.adminUserService.blockUser(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.showToast('User blocked successfully', 'success');
      },
      error: () => this.showToast('Failed to block user', 'error')
    });
  }

  activateUser(): void {
    this.adminUserService.activateUser(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.showToast('User activated successfully', 'success');
      },
      error: () => this.showToast('Failed to activate user', 'error')
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
