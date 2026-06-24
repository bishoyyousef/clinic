import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'avatar avatar-' + size" [title]="name">
      <img 
        *ngIf="photoUrl && !hasError()" 
        [src]="photoUrl" 
        [alt]="name" 
        (error)="onImageError()"
        class="avatar-img"
      />
      <span *ngIf="!photoUrl || hasError()" class="avatar-initials">
        {{ initials() }}
      </span>
    </div>
  `,
  styles: [`
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--r-full);
      background-color: var(--accent);
      color: var(--on-accent);
      font-weight: 600;
      overflow: hidden;
      flex-shrink: 0;
      user-select: none;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-initials {
      text-transform: uppercase;
      line-height: 1;
    }
    .avatar-sm {
      width: 28px;
      height: 28px;
      font-size: 0.75rem;
    }
    .avatar-md {
      width: 40px;
      height: 40px;
      font-size: 0.9375rem;
    }
    .avatar-lg {
      width: 64px;
      height: 64px;
      font-size: 1.5rem;
    }
  `]
})
export class AvatarComponent {
  @Input() name = '';
  @Input() photoUrl?: string | null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  hasError = signal(false);

  initials = computed(() => {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  });

  onImageError(): void {
    this.hasError.set(true);
  }
}
