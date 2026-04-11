import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { FaceAuthComponent } from '../components/face-auth/face-auth.component';
import { adminGuard, authGuard, stagiaireGuard } from '../guards/auth.guard';
import { HomeComponent } from '../components/home/home.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { ProfilStagiaireComponent } from '../components/stagiaire/profil-stagiaire/profil-stagiaire';
import { DashboardStagiaireComponent } from '../components/stagiaire/dashboard-stagiaire/dashboard-stagiaire';
import { DashboardEncadrantComponent } from '../components/encadrant/dashboard-encadrant/dashboard-encadrant';
import { DashboardAdminComponent } from '../components/admin/dashboard-admin/dashboard-admin';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'face-auth', component: FaceAuthComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'stagiaire/profil', component: ProfilStagiaireComponent, canActivate: [authGuard, stagiaireGuard] },

  // ✅ Une seule route dashboard avec enfants
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },  // /dashboard
      { path: 'stagiaire',  component: DashboardStagiaireComponent,  canActivate: [stagiaireGuard] },
      { path: 'encadrant',  component: DashboardEncadrantComponent },
      { path: 'admin',      component: DashboardAdminComponent,      canActivate: [adminGuard] },
    ]
  },

  // ✅ Wildcard TOUJOURS en dernier
  { path: '**', redirectTo: '' },
];
