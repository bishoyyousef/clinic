import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.isLoggedIn()) {
    if (authService.currentUser()) {
      return true;
    }
    
    // Profile is not bootstrapped in memory yet (e.g., initial page refresh).
    // Wait for the profile HTTP call to complete before resolving the guard.
    return authService.loadProfile().pipe(
      map(() => true),
      catchError(() => {
        authService.logout();
        return of(false);
      })
    );
  }
  
  // If no auth token is active, redirect to login page
  router.navigate(['/login']);
  return false;
};

