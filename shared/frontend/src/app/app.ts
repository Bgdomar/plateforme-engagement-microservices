import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
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
      padding-top: 120px;
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
      const publicRoutes = ['/', '/login', '/register', '/face-auth'];
      this.showNavbar = publicRoutes.includes(event.urlAfterRedirects) || event.urlAfterRedirects === '';
    });
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }
}
