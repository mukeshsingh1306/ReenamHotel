import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h1>Create Account</h1>
        <p class="subtitle">Join Reenam Hotel for exclusive benefits</p>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="Enter your full name"
              [class.error]="isFieldInvalid('name')"
            />
            <span *ngIf="isFieldInvalid('name')" class="error-text">
              Name is required
            </span>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="isFieldInvalid('email')"
            />
            <span *ngIf="isFieldInvalid('email')" class="error-text">
              Valid email is required
            </span>
          </div>

          <div class="form-group">
            <label for="mobile">Mobile Number</label>
            <input
              id="mobile"
              type="tel"
              formControlName="mobile"
              placeholder="Enter your mobile number"
              [class.error]="isFieldInvalid('mobile')"
            />
            <span *ngIf="isFieldInvalid('mobile')" class="error-text">
              Mobile number is required (10 digits)
            </span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password (min 6 characters)"
              [class.error]="isFieldInvalid('password')"
            />
            <span *ngIf="isFieldInvalid('password')" class="error-text">
              Password must be at least 6 characters
            </span>
          </div>

          <button type="submit" [disabled]="submitting || signupForm.invalid" class="submit-btn">
            {{ submitting ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="link-section">
          <p>
            Already have an account?
            <a routerLink="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .signup-card {
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
  `]
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm: FormGroup;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const f = this.signupForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.authService.signup(this.signupForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Signup failed. Please try again.';
      },
    });
  }
}
