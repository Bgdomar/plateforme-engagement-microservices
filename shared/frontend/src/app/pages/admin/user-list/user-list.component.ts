import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUserService, AdminUser } from '../../../services/admin-user.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  Math = Math;

  users: AdminUser[] = [];
  loading = true;

  // Filters
  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'createdAt';
  sortDir = 'desc';

  // Enums
  roles = ['ADMIN', 'ORGANIZATION', 'ENCADRANT', 'STAGIAIRE', 'USER'];
  statuses = ['ACTIVE', 'APPROVED', 'PENDING', 'BLOCKED', 'SUSPENDED', 'REJECTED'];

  // Confirmation dialog
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction = '';
  confirmUserId: number | null = null;

  // Toast
  toast: { message: string; type: 'success' | 'error' } | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private adminUserService: AdminUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.adminUserService.getUsers({
      search: this.searchTerm || undefined,
      role: this.filterRole || undefined,
      status: this.filterStatus || undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir
    }).subscribe({
      next: (page) => {
        this.users = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to load users', 'error');
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.currentPage = 0;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getInitials(user: AdminUser): string {
    const f = user.firstName?.charAt(0) || '';
    const l = user.lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || user.email.charAt(0).toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      ORGANIZATION: 'bg-blue-100 text-blue-800',
      ENCADRANT: 'bg-indigo-100 text-indigo-800',
      STAGIAIRE: 'bg-teal-100 text-teal-800',
      USER: 'bg-gray-100 text-gray-800'
    };
    return map[role] || 'bg-gray-100 text-gray-800';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      BLOCKED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      REJECTED: 'bg-red-100 text-red-700',
      DELETED: 'bg-gray-100 text-gray-500'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  // Navigation
  openCreateForm(): void {
    this.router.navigate(['/admin/users/new']);
  }

  editUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id, 'edit']);
  }

  viewUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  // Confirmation dialogs
  confirmDelete(user: AdminUser): void {
    this.confirmTitle = 'Delete User';
    this.confirmMessage = `Are you sure you want to delete "${user.firstName} ${user.lastName}" (${user.email})? This action is a soft delete.`;
    this.confirmAction = 'delete';
    this.confirmUserId = user.id;
    this.showConfirm = true;
  }

  confirmBlock(user: AdminUser): void {
    this.confirmTitle = 'Block User';
    this.confirmMessage = `Are you sure you want to block "${user.firstName} ${user.lastName}"? They will not be able to log in.`;
    this.confirmAction = 'block';
    this.confirmUserId = user.id;
    this.showConfirm = true;
  }

  confirmActivate(user: AdminUser): void {
    this.confirmTitle = 'Activate User';
    this.confirmMessage = `Are you sure you want to activate "${user.firstName} ${user.lastName}"?`;
    this.confirmAction = 'activate';
    this.confirmUserId = user.id;
    this.showConfirm = true;
  }

  executeConfirmAction(): void {
    if (!this.confirmUserId) return;
    this.showConfirm = false;

    const actions: Record<string, () => void> = {
      delete: () => {
        this.adminUserService.deleteUser(this.confirmUserId!).subscribe({
          next: () => { this.showToast('User deleted successfully', 'success'); this.loadUsers(); },
          error: () => this.showToast('Failed to delete user', 'error')
        });
      },
      block: () => {
        this.adminUserService.blockUser(this.confirmUserId!).subscribe({
          next: () => { this.showToast('User blocked successfully', 'success'); this.loadUsers(); },
          error: () => this.showToast('Failed to block user', 'error')
        });
      },
      activate: () => {
        this.adminUserService.activateUser(this.confirmUserId!).subscribe({
          next: () => { this.showToast('User activated successfully', 'success'); this.loadUsers(); },
          error: () => this.showToast('Failed to activate user', 'error')
        });
      }
    };

    actions[this.confirmAction]?.();
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }
}
