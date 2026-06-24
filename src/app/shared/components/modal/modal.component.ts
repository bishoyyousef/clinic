import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-container" [class]="'modal-' + size" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close-btn" (click)="closeModal()" aria-label="Close modal">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <div class="modal-footer" *ngIf="hasFooter">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s4);
      animation: fadeIn var(--dur) var(--ease) forwards;
    }
    .modal-container {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp var(--dur) var(--ease) forwards;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s4) var(--s6);
      border-bottom: 1px solid var(--border);
    }
    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
    }
    .modal-close-btn {
      color: var(--text-muted);
      padding: var(--s1);
      border-radius: var(--r-sm);
      transition: all var(--dur) var(--ease);
    }
    .modal-close-btn:hover {
      background-color: var(--surface-2);
      color: var(--text);
    }
    .modal-body {
      padding: var(--s6);
      overflow-y: auto;
      flex: 1;
    }
    .modal-footer {
      padding: var(--s4) var(--s6);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--s3);
      background-color: var(--surface-2);
      border-bottom-left-radius: var(--r-lg);
      border-bottom-right-radius: var(--r-lg);
    }
    .modal-sm { max-width: 400px; }
    .modal-md { max-width: 560px; }
    .modal-lg { max-width: 800px; }
    .modal-xl { max-width: 1140px; }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); }
      to { transform: translateY(0); }
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() hasFooter = false;
  @Output() close = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
