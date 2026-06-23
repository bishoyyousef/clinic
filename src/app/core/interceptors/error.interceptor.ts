import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { ApiError } from '../models/api-error.model';
import { AUTH_TOKEN_KEY } from '../config';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      
      // Parse structured backend ApiError response if available
      if (error.error && typeof error.error === 'object') {
        const apiError = error.error as ApiError;
        errorMessage = apiError.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      switch (error.status) {
        case 400:
          toastService.show(errorMessage, 'warning');
          break;
        case 401:
          toastService.show('Session expired. Please log in again.', 'error');
          localStorage.removeItem(AUTH_TOKEN_KEY);
          // Optional: trigger navigation/logout event if user has a router setup
          break;
        case 403:
          toastService.show('Access denied. You do not have permission.', 'error');
          break;
        case 404:
          toastService.show(errorMessage || 'Requested resource not found.', 'info');
          break;
        case 409:
          toastService.show(errorMessage || 'Conflict error occurred.', 'warning');
          break;
        case 500:
        default:
          toastService.show('Server error. Please try again later.', 'error');
          break;
      }

      return throwError(() => error);
    })
  );
};
