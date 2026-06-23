import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  
  // Read-only signal exposed to components/views
  toasts = this.toastsSignal.asReadonly();
  
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000): void {
    const id = this.nextId++;
    const newToast: ToastMessage = { id, message, type, duration };
    this.toastsSignal.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  dismiss(id: number): void {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }
}
