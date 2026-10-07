import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLogin = true;
  formData = { name: '', email: '', password: '' };
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    if (this.isLogin) {
      this.api.login({ name: this.formData.name, password: this.formData.password }).subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
          }
          localStorage.setItem('user_name', res.name);
          localStorage.setItem('user_role', res.role);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = this.formatErrorMessage(err);
        }
      });
    } else {
      this.api.register(this.formData).subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
          }
          localStorage.setItem('user_name', res.name);
          localStorage.setItem('user_role', res.role);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = this.formatErrorMessage(err);
        }
      });
    }
  }

  private formatErrorMessage(err: any): string {
    if (err.status === 0) {
      return 'Cannot connect to CRM backend server. Ensure Spring Boot is running on http://localhost:8080.';
    }
    if (err.error) {
      if (typeof err.error === 'string') {
        return err.error;
      }
      if (err.error.errors && typeof err.error.errors === 'object') {
        const fieldMsgs = Object.values(err.error.errors).join('; ');
        if (fieldMsgs) return fieldMsgs;
      }
      if (err.error.message) {
        return err.error.message;
      }
    }
    return err.message || 'An error occurred during request.';
  }
}
