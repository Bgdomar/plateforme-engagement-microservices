import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { FaceAuthComponent } from '../components/face-auth/face-auth.component';
import { adminGuard, authGuard, encadrantGuard, stagiaireGuard } from '../guards/auth.guard';
import { HomeComponent } from '../components/home/home.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { ProfilStagiaireComponent } from '../components/stagiaire/profil-stagiaire/profil-stagiaire';
import { DashboardStagiaireComponent } from '../components/stagiaire/dashboard-stagiaire/dashboard-stagiaire';
import { MissionsStagiaireComponent } from '../components/stagiaire/missions-stagiaire/missions-stagiaire.component';
import { DashboardEncadrantComponent } from '../components/encadrant/dashboard-encadrant/dashboard-encadrant';
import { UsersListComponent } from '../components/admin/users-list/users-list';
import { DashboardAdminComponent } from '../components/admin/dashboard-admin/dashboard-admin';

import { ProfilEncadrantComponent } from '../components/encadrant/profil-encadrant/profil-encadrant';
import { TeamListComponent } from '../components/encadrant/teams/team-list/team-list.component';
import { TeamCreateComponent } from '../components/encadrant/teams/team-create/team-create.component';
import { TeamDetailComponent } from '../components/encadrant/teams/team-detail/team-detail.component';
import { TeamEditComponent } from '../components/encadrant/teams/team-edit/team-edit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'face-auth', component: FaceAuthComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'stagiaire/profil', component: ProfilStagiaireComponent, canActivate: [authGuard, stagiaireGuard] },
  { path: 'encadrant/profil', component: ProfilEncadrantComponent, canActivate: [authGuard, encadrantGuard] },
  { path: 'encadrant/teams', component: TeamListComponent, canActivate: [authGuard, encadrantGuard] },
  { path: 'encadrant/teams/create', component: TeamCreateComponent, canActivate: [authGuard, encadrantGuard] },
  { path: 'encadrant/teams/:id', component: TeamDetailComponent, canActivate: [authGuard, encadrantGuard] },
  { path: 'encadrant/teams/edit/:id', component: TeamEditComponent, canActivate: [authGuard, encadrantGuard] },
  // Ajoutez cette route dans vos routes existantes
  {
    path: 'missions',
    component: MissionsStagiaireComponent,
    canActivate: [authGuard, stagiaireGuard]
  },
  // ✅ Une seule route dashboard avec enfants
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },  // /dashboard
      { path: 'stagiaire',  component: DashboardStagiaireComponent,  canActivate: [stagiaireGuard] },
      { path: 'encadrant',  component: DashboardEncadrantComponent },
      { path: 'admin',      component: DashboardAdminComponent,      canActivate: [adminGuard] },
      { path: 'admin/users', component: UsersListComponent, canActivate: [adminGuard] },
    ]
  },

  // ✅ Wildcard TOUJOURS en dernier
  { path: '**', redirectTo: '' },
];
