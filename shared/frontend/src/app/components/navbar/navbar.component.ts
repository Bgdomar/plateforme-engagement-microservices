import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  userName: string | null = null;
  userEmail: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_data');
    this.isAuthenticated = !!token;
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.userName = userData.firstName + ' ' + userData.lastName;
        this.userEmail = userData.email;
      } catch (e) {
        this.isAuthenticated = false;
      }
    }
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register';
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
    this.isAuthenticated = false;
    this.closeUserMenu();
    this.router.navigate(['/']);
  }

  getInitials(): string {
    if (this.userName) {
      return this.userName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return '?';
  }
}
