import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'Teacher' | 'Student' | 'Coordinator';

export interface CurrentUser {
  id: number;
  email: string;
  role: Role;
  fullName: string;
  teacherId: number | null;
  studentId: number | null;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: CurrentUser;
}

const TOKEN_KEY = 'sl.token';
const USER_KEY = 'sl.user';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<CurrentUser | null>(readStoredUser());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._user.asReadonly();
  readonly role = computed(() => this._user()?.role ?? null);
  readonly isLoggedIn = computed(() => this._token() !== null);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res.token, res.user)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  /** Ruta inicial según el rol devuelto por el backend. */
  homePath(): string {
    switch (this._user()?.role) {
      case 'Teacher':
        return '/docente';
      case 'Student':
        return '/alumno';
      case 'Coordinator':
        return '/coordinador';
      default:
        return '/login';
    }
  }

  private setSession(token: string, user: CurrentUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }
}

function readStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}
