import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Login</h1>
        <p class="subtitle">Sign in to your Reenam Hotel account</p>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="emailMobile">Email or Mobile</label>
            <input
              id="emailMobile"
              type="text"
              formControlName="emailMobile"
              placeholder="Enter email or mobile number"
              [class.error]="isFieldInvalid('emailMobile')"
            />
            <span *ngIf="isFieldInvalid('emailMobile')" class="error-text">
              Email or mobile is required
            </span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="isFieldInvalid('password')"
            />
            <span *ngIf="isFieldInvalid('password')" class="error-text">
              Password is required
            </span>
          </div>

          <button type="submit" [disabled]="submitting || loginForm.invalid" class="submit-btn">
            {{ submitting ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="link-section">
          <p>
            Don't have an account?
            <a routerLink="/signup">Sign up here</a>
          </p>
        </div>

        <div class="test-credentials">
          <p><strong>Test Credentials:</strong></p>
          <p>Email: test@reenam.com</p>
          <p>Password: test@123</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    h1 {
      margin: 0 0 10px;
      color: #333;
      font-size: 28px;
    }

    .subtitle {
      color: #666;
      margin: 0 0 30px;
      font-size: 14px;
    }

    .error-message {
      background-color: #fee;
      color: #c00;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input.error {
      border-color: #c00;
    }

    .error-text {
      color: #c00;
      font-size: 12px;
      margin-top: 4px;
    }

    .submit-btn {
      padding: 12px;
      background-color: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #5568d3;
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .link-section {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }

    .link-section a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .link-section a:hover {
      text-decoration: underline;
    }

    .test-credentials {
      margin-top: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 6px;
      font-size: 12px;
      color: #666;
    }

    .test-credentials p {
      margin: 4px 0;
    }

    .test-credentials strong {
      color: #333;
    }
  `]
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      emailMobile: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const f = this.loginForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const { emailMobile, password } = this.loginForm.value;
    const loginData: any = { password };

    if (emailMobile.includes('@')) {
      loginData.email = emailMobile;
    } else {
      loginData.mobile = emailMobile;
    }

    this.authService.login(loginData).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        this.router.navigate([returnUrl || '/']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
