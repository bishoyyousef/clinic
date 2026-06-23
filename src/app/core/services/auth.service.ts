import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config';
import { LoginRequest, AuthResponse, UserDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signal state management
  private tokenSignal = signal<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  currentUser = signal<UserDto | null>(null);

  // Read-only signals exposed to layout/guards
  token = this.tokenSignal.asReadonly();
  isLoggedIn = computed(() => !!this.tokenSignal());
  role = computed(() => this.currentUser()?.role);

  constructor() {
    // Bootstrap user profile details on load if token is already present
    if (this.tokenSignal()) {
      this.loadProfile().subscribe({
        error: () => this.logout() // Clear session if token is invalid or expired
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        this.currentUser.set(response.user);
        localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      })
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  loadProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${API_BASE_URL}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }
}
