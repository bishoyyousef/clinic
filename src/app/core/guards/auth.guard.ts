import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AUTH_TOKEN_KEY } from '../config';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (token) {
    return true;
  }
  
  // If no auth token is found, redirect to public login page
  router.navigate(['/login']);
  return false;
};
