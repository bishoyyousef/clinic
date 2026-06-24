import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled || loading" 
      [class]="'btn btn-' + variant"
      [class.loading]="loading"
    >
      <svg *ngIf="loading" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="10"></circle>
      </svg>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s2);
      padding: 10px 16px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--r-sm);
      transition: all var(--dur) var(--ease);
      cursor: pointer;
      border: 1px solid transparent;
      line-height: 1.25;
      text-align: center;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-primary {
      background-color: var(--accent);
      color: var(--on-accent);
    }
    .btn-primary:hover:not(:disabled) {
      background-color: var(--accent-hover);
    }
    .btn-secondary {
      background-color: var(--surface-2);
      color: var(--text);
      border-color: var(--border);
    }
    .btn-secondary:hover:not(:disabled) {
      background-color: var(--border);
    }
    .btn-danger {
      background-color: var(--danger);
      color: var(--on-accent);
    }
    .btn-danger:hover:not(:disabled) {
      background-color: #b93c2e;
    }
    .btn-text {
      background-color: transparent;
      color: var(--text-muted);
      padding: var(--s2) var(--s3);
    }
    .btn-text:hover:not(:disabled) {
      color: var(--text);
      background-color: var(--surface-2);
    }
    .spinner {
      width: 16px;
      height: 16px;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'text' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
}
