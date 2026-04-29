import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  userName: string | null = null;
  userEmail: string | null = null;
  userRole: string = '';
  profileRoute: string = '/profile';
  private currentUrl = '/';
  private routeSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }
    this.checkAuthStatus();

    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;
      this.isMobileMenuOpen = false;
      this.isUserMenuOpen = false;
      this.checkAuthStatus();
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_data');
    this.isAuthenticated = !!token;

    if (user) {
      try {
        const userData = JSON.parse(user);
        this.userName = (userData.firstName || '') + ' ' + (userData.lastName || '');
        this.userEmail = userData.email || '';
        const role = (userData.typeCompte || userData.role || '').toUpperCase();
        if (role.includes('ADMIN')) {
          this.userRole = 'Administrateur';
          this.profileRoute = '/profile';
        } else if (role.includes('ENCADRANT')) {
          this.userRole = 'Encadrant';
          this.profileRoute = '/encadrant/profil';
        } else {
          this.userRole = 'Stagiaire';
          this.profileRoute = '/stagiaire/profil';
        }
      } catch (e) {
        this.isAuthenticated = false;
      }
    }
  }

  isActive(path: string): boolean {
    if (path === '/') return this.currentUrl === '/' || this.currentUrl === '';
    return this.currentUrl.startsWith(path);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('userId');
    this.isAuthenticated = false;
    this.userName = null;
    this.userEmail = null;
    this.userRole = '';
    this.closeUserMenu();
    this.router.navigate(['/']);
  }

  getInitials(): string {
    if (this.userName) {
      return this.userName.trim().split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return '?';
  }
}
