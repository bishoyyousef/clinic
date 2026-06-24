import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const toastService = inject(ToastService);
    
    const userRole = authService.role();

    // Check if the user has one of the allowed roles
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    toastService.show('Access denied. You do not have permission to view this page.', 'error');
    
    // Redirect based on current authentication state and role
    if (authService.isLoggedIn()) {
      if (userRole === 'Doctor') {
        router.navigate(['/patients']);
      } else {
        router.navigate(['/dashboard']);
      }
    } else {
      router.navigate(['/login']);
    }
    
    return false;
  };
};

