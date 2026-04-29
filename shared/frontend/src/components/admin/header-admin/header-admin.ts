import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../../services/notification.service';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-admin.html',
  styleUrls: ['./header-admin.css']
})
export class HeaderAdminComponent implements OnInit, OnDestroy {

  nom: string = 'Administrateur';
  prenom: string = 'Système';
  email: string = 'admin@dxc.com';

  isDropdownOpen = false;
  isNotifOpen = false;
  notifications: NotificationDTO[] = [];
  unreadCount: number = 0;

  private routerSub: Subscription | undefined;
  private notifSub: Subscription | undefined;

  constructor(
    private router: Router,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
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
    this.notifSub?.unsubscribe();
    this.notificationService.stopPolling();
  }

  private loadNotifications(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const uid = Number(userId);
    this.notificationService.startPolling(uid, 30000);
    this.notifSub = this.notificationService.notifications.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
      this.cdr.detectChanges();
    });
  }

  getTimeAgo(dateStr: string): string {
    return this.notificationService.getTimeAgo(dateStr);
  }

  toggleNotifications(): void {
    this.isNotifOpen = !this.isNotifOpen;
    this.isDropdownOpen = false;
    this.cdr.detectChanges();
  }

  markAllRead(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.notificationService.markAllAsRead(Number(userId)).subscribe(() => {
      this.cdr.detectChanges();
    });
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
