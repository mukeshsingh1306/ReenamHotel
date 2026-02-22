import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

//export const API_BASE_URL = 'http://localhost:4000';
export const API_BASE_URL = '';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'authUser';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  signup(email: string, mobile: string, password: string, name: string): Observable<any> {
    return this.http
      .post(`${API_BASE_URL}/api/auth/signup`, {
        email: email || undefined,
        mobile: mobile || undefined,
        password,
        name,
      })
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.setToken(response.token);
            this.setUser({
              name,
              email,
              mobile,
            });
            this.isLoggedInSubject.next(true);
          }
        }),
      );
  }

  login(email: string, mobile: string, password: string): Observable<any> {
    return this.http
      .post(`${API_BASE_URL}/api/auth/login`, {
        email: email || undefined,
        mobile: mobile || undefined,
        password,
      })
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.setToken(response.token);
            this.setUser(response.user);
            this.isLoggedInSubject.next(true);
          }
        }),
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
