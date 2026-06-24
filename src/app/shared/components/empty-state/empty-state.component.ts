import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <ng-container [ngSwitch]="icon">
          <!-- Calendar/Schedule icon -->
          <svg *ngSwitchCase="'calendar'" viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <!-- Search/Filter icon -->
          <svg *ngSwitchCase="'search'" viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <!-- Generic Inbox/Box icon -->
          <svg *ngDefault viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
          </svg>
        </ng-container>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <div class="empty-action" *ngIf="actionText">
        <app-button (click)="onAction()">{{ actionText }}</app-button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--s12) var(--s6);
      background-color: var(--surface);
      border: 1px dashed var(--border);
      border-radius: var(--r);
    }
    .empty-icon {
      color: var(--text-muted);
      margin-bottom: var(--s4);
      opacity: 0.6;
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: var(--s2);
    }
    .empty-message {
      font-size: 0.875rem;
      color: var(--text-muted);
      max-width: 320px;
      line-height: 1.5;
    }
    .empty-action {
      margin-top: var(--s6);
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No data available';
  @Input() message = 'There is currently no information to show in this view.';
  @Input() icon = 'default';
  @Input() actionText?: string;
  
  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
