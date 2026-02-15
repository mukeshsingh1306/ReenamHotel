import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from './booking-api.service';

export interface LoginRequest {
  email?: string;
  mobile?: string;
  password: string;
}

export interface SignupRequest {
  email?: string;
  mobile?: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/signup`, data).pipe(
      tap((response) => {
        if (response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setUser(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }
      }),
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, data).pipe(
      tap((response) => {
        if (response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setUser(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
