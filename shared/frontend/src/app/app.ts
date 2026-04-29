import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <div [class.content-with-navbar]="showNavbar">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .content-with-navbar {
      padding-top: 72px;
    }
  `]
})
export class App implements OnInit {
  title = 'frontend';
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      const hasOwnHeader = url === '/' || url === '' ||
        url.startsWith('/dashboard') ||
        url.startsWith('/stagiaire') ||
        url.startsWith('/encadrant') ||
        url.startsWith('/missions') ||
        url.startsWith('/chat');
      this.showNavbar = !hasOwnHeader;
    });
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }
}
