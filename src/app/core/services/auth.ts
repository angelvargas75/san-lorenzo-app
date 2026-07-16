import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  UserRole,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'sanLorenzoToken';
  private readonly expirationKey = 'sanLorenzoTokenExpiration';
  private readonly userKey = 'sanLorenzoCurrentUser';

  constructor(private readonly http: HttpClient) {}

  login(
    request: LoginRequest,
    remember: boolean,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap((response) => {
          this.saveSession(response, remember);
        }),
      );
  }

  logout(): void {
    this.clearStorage(localStorage);
    this.clearStorage(sessionStorage);
  }

  getToken(): string | null {
    return this.readValue(this.tokenKey);
  }

  getCurrentUser(): CurrentUser | null {
    const storedUser = this.readValue(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as CurrentUser;
    } catch {
      this.logout();
      return null;
    }
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this.getRole() === role;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const expiration = this.readValue(this.expirationKey);

    if (!token || !expiration) {
      return false;
    }

    const expirationDate = new Date(expiration);

    if (
      Number.isNaN(expirationDate.getTime()) ||
      expirationDate.getTime() <= Date.now()
    ) {
      this.logout();
      return false;
    }

    return true;
  }

  getHomeRoute(role: UserRole | null = this.getRole()): string {
    switch (role) {
      case 'Student':
        return '/alumno';

      case 'Teacher':
        return '/docente';

      case 'Coordinator':
        return '/coordinador';

      default:
        return '/login';
    }
  }

  private saveSession(
    response: LoginResponse,
    remember: boolean,
  ): void {
    this.logout();

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem(this.tokenKey, response.token);
    storage.setItem(this.expirationKey, response.expiresAt);
    storage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private readValue(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  private clearStorage(storage: Storage): void {
    storage.removeItem(this.tokenKey);
    storage.removeItem(this.expirationKey);
    storage.removeItem(this.userKey);
  }
}
