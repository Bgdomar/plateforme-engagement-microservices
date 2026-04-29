import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'MISSION' | 'TEAM' | 'CHAT' | 'BADGE' | 'LIVRABLE' | 'SYSTEM';
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private baseUrl = `${environment.apiUrl}/api/notifications`;
  private unreadCount$ = new BehaviorSubject<number>(0);
  private notifications$ = new BehaviorSubject<NotificationDTO[]>([]);
  private pollSub: Subscription | null = null;

  public unreadCount = this.unreadCount$.asObservable();
  public notifications = this.notifications$.asObservable();

  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.baseUrl}?userId=${userId}`).pipe(
      tap(notifs => {
        this.notifications$.next(notifs);
        this.unreadCount$.next(notifs.filter(n => !n.read).length);
      })
    );
  }

  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count?userId=${userId}`).pipe(
      tap(res => this.unreadCount$.next(res.count))
    );
  }

  createNotification(req: CreateNotificationRequest): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(this.baseUrl, req);
  }

  markAsRead(notificationId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/read/${notificationId}?userId=${userId}`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/read-all?userId=${userId}`, {}).pipe(
      tap(() => {
        this.unreadCount$.next(0);
        const current = this.notifications$.value.map(n => ({ ...n, read: true }));
        this.notifications$.next(current);
      })
    );
  }

  startPolling(userId: number, intervalMs: number = 30000): void {
    this.stopPolling();
    this.getUserNotifications(userId).subscribe();
    this.pollSub = interval(intervalMs).subscribe(() => {
      this.getUserNotifications(userId).subscribe();
    });
  }

  stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'MISSION': return 'mission';
      case 'TEAM': return 'team';
      case 'CHAT': return 'chat';
      case 'BADGE': return 'badge';
      case 'LIVRABLE': return 'livrable';
      default: return 'system';
    }
  }
}
