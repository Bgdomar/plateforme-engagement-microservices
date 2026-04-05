import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FaceAuthComponent } from './pages/face-auth/face-auth.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserListComponent } from './pages/admin/user-list/user-list.component';
import { UserFormComponent } from './pages/admin/user-form/user-form.component';
import { UserDetailComponent } from './pages/admin/user-detail/user-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'face-auth', component: FaceAuthComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin/users', component: UserListComponent, canActivate: [authGuard] },
  { path: 'admin/users/new', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'admin/users/:id', component: UserDetailComponent, canActivate: [authGuard] },
  { path: 'admin/users/:id/edit', component: UserFormComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
