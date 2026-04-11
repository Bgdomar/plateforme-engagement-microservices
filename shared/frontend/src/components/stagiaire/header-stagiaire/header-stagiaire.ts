import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import {environment} from '../../../environments/environment';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-header-stagiaire',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-stagiaire.html',
  styleUrls: ['./header-stagiaire.css']
})
export class HeaderStagiaireComponent implements OnInit, OnDestroy {

  nom: string = 'Dupont';
  prenom: string = 'Jean';
  email: string = 'jean.dupont@dxc.com';
  userProfileImage: string = '';
  showProfileImage: boolean = false;

  points: number = 1250;
  niveau: number = 3;
  nextLevelPoints: number = 1500;
  levelProgress: number = 83;

  isDropdownOpen = false;
  isNotifOpen = false;

  notifications: Notification[] = [];
  unreadCount: number = 0;

  private routerSub: Subscription | undefined;

  // ✅ Injection de ChangeDetectorRef
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
    const token  = localStorage.getItem('token');
    if (!userId || !token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${environment.apiUrl}/api/profil/${userId}`, { headers })
      .then(r => r.json())
      .then(data => {
        this.prenom = data.prenom || '';
        this.nom    = data.nom    || '';
        this.email  = data.email  || '';

        if (data.avatar) {
          // Construire l'URL absolue si c'est un chemin relatif
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
      .catch(e => console.error('Erreur chargement profil header', e));
  }

  private loadNotifications(): void {
    this.notifications = [
      { id: 1, message: 'Votre livrable a ete valide avec 18/20 !', time: 'Il y a 10 min', read: false },
      { id: 2, message: 'Nouveau badge debloque : Premiere mission', time: 'Il y a 1h', read: false },
      { id: 3, message: "Vous avez ete ajoute a l'equipe Alpha", time: 'Il y a 3h', read: true },
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
    // ✅ Forcer Angular à mettre à jour le DOM
    this.cdr.detectChanges();
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleNotifications(): void {
    this.isNotifOpen = !this.isNotifOpen;
    this.isDropdownOpen = false;
    // ✅ Forcer Angular à mettre à jour le DOM
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
    // ✅ Forcer la mise à jour après chaque click document
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
  }
}
