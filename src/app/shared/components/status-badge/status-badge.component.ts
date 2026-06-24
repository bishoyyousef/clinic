import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'PendingPayment' | 'Confirmed' | 'Arrived' | 'Completed' | 'NoShow' | 'Cancelled' | string;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="classMap()">
      {{ label() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--s1) var(--s2.5);
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--r-full);
      line-height: 1;
      text-transform: capitalize;
    }
    .badge-accent {
      background-color: var(--accent-soft);
      color: var(--accent);
    }
    .badge-info {
      background-color: var(--info-soft);
      color: var(--info);
    }
    .badge-success {
      background-color: var(--success-soft);
      color: var(--success);
    }
    .badge-warning {
      background-color: var(--warning-soft);
      color: var(--warning);
    }
    .badge-danger {
      background-color: var(--danger-soft);
      color: var(--danger);
    }
    .badge-muted {
      background-color: var(--surface-2);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: BadgeType = '';

  classMap = computed(() => {
    switch (this.status) {
      case 'Confirmed':
        return 'badge-accent';
      case 'Arrived':
        return 'badge-info';
      case 'Completed':
        return 'badge-success';
      case 'NoShow':
        return 'badge-warning';
      case 'Cancelled':
        return 'badge-danger';
      case 'PendingPayment':
      default:
        return 'badge-muted';
    }
  });

  label = computed(() => {
    if (this.status === 'PendingPayment') return 'Pending Payment';
    if (this.status === 'NoShow') return 'No Show';
    return this.status || 'Unknown';
  });
}
