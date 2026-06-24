import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="title" size="sm" [hasFooter]="true" (close)="onCancel()">
      <div class="confirm-body">
        <div class="confirm-icon" [class.danger]="isDanger">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p class="confirm-message">{{ message }}</p>
      </div>
      <div modal-footer>
        <app-button variant="secondary" (click)="onCancel()">{{ cancelText }}</app-button>
        <app-button [variant]="isDanger ? 'danger' : 'primary'" (click)="onConfirm()">{{ confirmText }}</app-button>
      </div>
    </app-modal>
  `,
  styles: [`
    .confirm-body {
      display: flex;
      align-items: flex-start;
      gap: var(--s4);
    }
    .confirm-icon {
      flex-shrink: 0;
      color: var(--warning);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--r-full);
      background-color: var(--warning-soft);
    }
    .confirm-icon.danger {
      color: var(--danger);
      background-color: var(--danger-soft);
    }
    .confirm-message {
      font-size: 0.9375rem;
      color: var(--text);
      line-height: 1.5;
      padding-top: var(--s2);
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
