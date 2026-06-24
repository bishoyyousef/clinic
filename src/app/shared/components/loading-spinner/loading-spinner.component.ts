import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class.spinner-overlay]="overlay">
      <svg 
        [class]="'spinner spinner-' + size" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="3"
      >
        <circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="10"></circle>
      </svg>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(1px);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    :host-context([data-theme="dark"]) .spinner-overlay {
      background-color: rgba(12, 19, 19, 0.7);
    }
    .spinner {
      color: var(--accent);
      animation: spin 0.8s linear infinite;
    }
    .spinner-sm { width: 20px; height: 20px; }
    .spinner-md { width: 36px; height: 36px; }
    .spinner-lg { width: 56px; height: 56px; }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() overlay = false;
}
