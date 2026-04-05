import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  authMethod: 'email' | 'facial' = 'email';
  showPassword = false;
  loading = false;
  error = '';
  errorType: 'credentials' | 'pending' | 'disabled' | 'suspended' | 'other' = 'credentials';

  constructor(private authService: AuthService, private router: Router) {}

  resetForm() {
    this.error = '';
    this.errorType = 'credentials';
    this.loading = false;
  }

  onSubmitEmail(event?: Event) {
    event?.preventDefault();
    this.resetForm();
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Email ou mot de passe incorrect.';
        this.error = msg;
        if (msg.includes('en attente')) this.errorType = 'pending';
        else if (msg.includes('désactiv')) this.errorType = 'disabled';
        else if (msg.includes('suspend')) this.errorType = 'suspended';
        else if (msg.includes('incorrect')) this.errorType = 'credentials';
        else this.errorType = 'other';
      }
    });
  }
}
