import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../environments/environment';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-header-encadrant',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-encadrant.html',
  styleUrls: ['./header-encadrant.css']
})
export class HeaderEncadrantComponent implements OnInit, OnDestroy {

  nom: string = 'Lambert';
  prenom: string = 'Marie';
  email: string = 'marie.lambert@dxc.com';
  userProfileImage: string = '';
  showProfileImage: boolean = false;

  points: number = 2450;
  niveau: number = 5;
  nextLevelPoints: number = 3000;
  levelProgress: number = 81;

  isDropdownOpen = false;
  isNotifOpen = false;

  notifications: Notification[] = [];
  unreadCount: number = 0;

  private routerSub: Subscription | undefined;

  constructor(
    private router: Router,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isDropdownOpen = false;
        this.isNotifOpen = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private loadUserData(): void {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${environment.apiUrl}/api/profil/${userId}`, { headers })
      .then(r => r.json())
      .then(data => {
        this.prenom = data.prenom || '';
        this.nom = data.nom || '';
        this.email = data.email || '';

        if (data.avatar) {
          this.userProfileImage = data.avatar.startsWith('http')
            ? data.avatar
            : `http://localhost:8080${data.avatar}`;
          this.showProfileImage = true;
        } else {
          this.userProfileImage = '';
          this.showProfileImage = false;
        }
        this.cdr.detectChanges();
      })
      .catch(e => console.error('Erreur chargement profil header encadrant', e));
  }

  private loadNotifications(): void {
    this.notifications = [
      { id: 1, message: 'Jean Dupont a soumis un livrable en attente de validation', time: 'Il y a 5 min', read: false },
      { id: 2, message: 'Sophie Martin a complété sa mission avec succès', time: 'Il y a 1h', read: false },
      { id: 3, message: 'Rappel: 3 livrables en attente de validation', time: 'Il y a 2h', read: true },
      { id: 4, message: 'Nouveau stagiaire ajouté à votre équipe Alpha', time: 'Il y a 1 jour', read: true },
    ];
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  onImageError(): void {
    this.showProfileImage = false;
    this.userProfileImage = '';
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isNotifOpen = false;
    this.cdr.detectChanges();
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleNotifications(): void {
    this.isNotifOpen = !this.isNotifOpen;
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
  }

  markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.unreadCount = 0;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isDropdownOpen = false;
    }
    if (!target.closest('.notif-wrapper')) {
      this.isNotifOpen = false;
    }
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
  }
}
