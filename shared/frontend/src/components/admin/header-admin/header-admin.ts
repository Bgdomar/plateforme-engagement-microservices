import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

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
  private routerSub: Subscription | undefined;

  constructor(
    private router: Router,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isDropdownOpen = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
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
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
  }
}
