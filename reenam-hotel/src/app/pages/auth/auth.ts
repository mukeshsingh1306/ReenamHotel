import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = true;
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    // Redirect if already logged in
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.router.navigate(['/']);
      }
    });

    this.initializeForms();
  }

  private initializeForms(): void {
    this.loginForm = this.formBuilder.group({
      emailOrMobile: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      emailOrMobile: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.loginForm.reset();
    this.signupForm.reset();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const { emailOrMobile, password } = this.loginForm.value;

    const loginRequest = {
      password,
      ...(emailOrMobile.includes('@') 
        ? { email: emailOrMobile } 
        : { mobile: emailOrMobile }),
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.error = 'Please fill in all fields correctly.';
      return;
    }

    const { name, emailOrMobile, password, confirmPassword } = this.signupForm.value;

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = null;

    const signupRequest = {
      name,
      password,
      ...(emailOrMobile.includes('@') 
        ? { email: emailOrMobile } 
        : { mobile: emailOrMobile }),
    };

    this.authService.signup(signupRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Signup failed. Please try again.';
      },
    });
  }
}
