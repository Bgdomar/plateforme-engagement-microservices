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
import { DashboardEncadrantComponent } from '../components/encadrant/dashboard-encadrant/dashboard-encadrant';
import { UsersListComponent } from '../components/admin/users-list/users-list';
import { DashboardAdminComponent } from '../components/admin/dashboard-admin/dashboard-admin';

// Équipes (Encadrant - consultation uniquement)
import { EquipeListComponent } from '../components/encadrant/equipes/equipe-list/equipe-list.component';
import { EquipeDetailComponent } from '../components/encadrant/equipes/equipe-detail/equipe-detail.component';

import {SubjectListComponent} from  '../components/encadrant/subjects/subject-list/subject-list.component';
import  {SubjectCreateComponent} from '../components/encadrant/subjects/subject-create/subject-create.component';
import {SubjectDetailComponent} from  '../components/encadrant/subjects/subject-detail/subject-detail.component';
import {SubjectEditComponent} from  '../components/encadrant/subjects/subject-edit/subject-edit.component'

// Stagiaire
import { SujetsDisponiblesComponent } from '../components/stagiaire/sujets-disponibles/sujets-disponibles.component';
import { MonEquipeComponent } from '../components/stagiaire/mon-equipe/mon-equipe.component';

import { BacklogListComponent } from '../components/stagiaire/backlog_equipe/backlog-list/backlog-list.component';
import { BacklogCreateComponent } from '../components/stagiaire/backlog_equipe/backlog-create/backlog-create.component';
import { BacklogEditComponent } from '../components/stagiaire/backlog_equipe/backlog-edit/backlog-edit.component';
import { BacklogDetailComponent } from '../components/stagiaire/backlog_equipe/backlog-detail/backlog-detail.component';

import { MissionListComponent } from '../components/stagiaire/mission_equipe/mission-list/mission-list.component';
import { MissionCreateComponent } from '../components/stagiaire/mission_equipe/mission-create/mission-create.component';
import { MissionDetailComponent } from '../components/stagiaire/mission_equipe/mission-detail/mission-detail.component';
import { MissionEditComponent } from '../components/stagiaire/mission_equipe/mission-edit/mission-edit.component';
import { EvaluationTacheComponent } from '../components/encadrant/tache/evaluation-tache/evaluation-tache.component';
import  {TachesEvaluationListComponent} from '../components/encadrant/tache/taches-evaluation-list/taches-evaluation-list.component'
import { ChatComponent } from '../components/chat/chat.component';

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
      { path: 'admin/users', component: UsersListComponent, canActivate: [adminGuard] },
    ]
  },

  {
    path: 'encadrant/subjects',
    component: SubjectListComponent,
    canActivate: [authGuard, encadrantGuard]
  },
  {
    path: 'encadrant/subjects/create',
    component: SubjectCreateComponent,
    canActivate: [authGuard, encadrantGuard]
  },
  {
    path: 'encadrant/subjects/:id',
    component: SubjectDetailComponent,
    canActivate: [authGuard, encadrantGuard]
  },
  {
    path: 'encadrant/subjects/edit/:id',
    component: SubjectEditComponent,
    canActivate: [authGuard, encadrantGuard]
  },

  {
    path: 'encadrant/equipes',
    component: EquipeListComponent,
    canActivate: [authGuard, encadrantGuard]
  },
  {
    path: 'encadrant/equipes/:id',
    component: EquipeDetailComponent,
    canActivate: [authGuard, encadrantGuard]
  },

  {
    path: 'encadrant/evaluation',
    component: TachesEvaluationListComponent,
    canActivate: [authGuard, encadrantGuard]
  },
  {
    path: 'encadrant/evaluation/tache/:id',
    component: EvaluationTacheComponent,
    canActivate: [authGuard, encadrantGuard]
  },

  // ==================== STAGIAIRE ====================
  {
    path: 'stagiaire/sujets',
    component: SujetsDisponiblesComponent,
    canActivate: [authGuard, stagiaireGuard]
  },
  {
    path: 'stagiaire/mon-equipe',
    component: MonEquipeComponent,
    canActivate: [authGuard, stagiaireGuard]
  },
  {
    path: 'stagiaire/equipe/:id',
    component: EquipeDetailComponent,
    canActivate: [authGuard, stagiaireGuard]
  },

  // Backlog (Stagiaire)
  {
    path: 'stagiaire/backlog',
    component: BacklogListComponent,
    canActivate: [authGuard, stagiaireGuard]
  },
  {
    path: 'stagiaire/backlog/create',
    component: BacklogCreateComponent,
    canActivate: [authGuard, stagiaireGuard]
  },
  {
    path: 'stagiaire/backlog/edit/:id',
    component: BacklogEditComponent,
    canActivate: [authGuard, stagiaireGuard]
  },
  {
    path: 'stagiaire/backlog/tache/:id',
    component: BacklogDetailComponent,
    canActivate: [authGuard, stagiaireGuard]
  },

  { path: 'stagiaire/missions', component: MissionListComponent },
  { path: 'stagiaire/missions/create', component: MissionCreateComponent },
  { path: 'stagiaire/missions/:id', component: MissionDetailComponent },
  { path: 'stagiaire/missions/edit/:id', component: MissionEditComponent },


  // Chat routes
  { path: 'chat/stagiaire', component: ChatComponent, canActivate: [authGuard, stagiaireGuard] },
  { path: 'chat/encadrant', component: ChatComponent, canActivate: [authGuard, encadrantGuard] },

  // ✅ Wildcard TOUJOURS en dernier
  { path: '**', redirectTo: '' },
];
