import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { CurrencyEgpPipe } from '../../pipes/currency-egp.pipe';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'avatar' | 'currency' | 'custom';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, InitialsPipe, CurrencyEgpPipe],
  template: `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              *ngFor="let col of columns" 
              [class.sortable]="col.sortable"
              (click)="onSort(col)"
            >
              <div class="th-content">
                <span>{{ col.label }}</span>
                <span class="sort-icon" *ngIf="col.sortable && sortKey === col.key">
                  <svg *ngIf="sortDirection === 'asc'" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                  <svg *ngIf="sortDirection === 'desc'" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; let i = index">
            <td *ngFor="let col of columns">
              <!-- Cell rendering based on defined column type -->
              <ng-container [ngSwitch]="col.type">
                <!-- Avatar cells -->
                <div *ngSwitchCase="'avatar'" class="avatar-cell">
                  <div class="avatar-circle">{{ row[col.key] | initials }}</div>
                  <span class="avatar-name">{{ row[col.key] }}</span>
                </div>
                <!-- EGP Currency cells -->
                <span *ngSwitchCase="'currency'" class="currency-text">
                  {{ row[col.key] | currencyEgp }}
                </span>
                <!-- Custom injected template cells -->
                <ng-container *ngSwitchCase="'custom'">
                  <ng-container *ngTemplateOutlet="customCellTemplate; context: { $implicit: row, column: col }"></ng-container>
                </ng-container>
                <!-- Standard text cells -->
                <span *ngDefault>{{ row[col.key] }}</span>
              </ng-container>
            </td>
          </tr>
          <!-- Empty data state row -->
          <tr *ngIf="data.length === 0">
            <td [attr.colspan]="columns.length" class="empty-cell">
              No records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--r);
      background-color: var(--surface);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    [dir="rtl"] .data-table {
      text-align: right;
    }
    .data-table th, .data-table td {
      padding: var(--s4) var(--s6);
      font-size: 0.875rem;
    }
    .data-table th {
      background-color: var(--surface-2);
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border);
      user-select: none;
    }
    .data-table th.sortable {
      cursor: pointer;
    }
    .data-table th.sortable:hover {
      color: var(--text);
      background-color: var(--border);
    }
    .th-content {
      display: flex;
      align-items: center;
      gap: var(--s2);
    }
    .sort-icon {
      display: flex;
      align-items: center;
      color: var(--accent);
    }
    .data-table td {
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    .data-table tr:last-child td {
      border-bottom: none;
    }
    .data-table tr:hover td {
      background-color: var(--bg);
    }
    .avatar-cell {
      display: flex;
      align-items: center;
      gap: var(--s3);
    }
    .avatar-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--r-full);
      background-color: var(--accent-soft);
      color: var(--accent);
      font-weight: 600;
      font-size: 0.75rem;
    }
    .avatar-name {
      font-weight: 500;
    }
    .currency-text {
      font-weight: 600;
    }
    .empty-cell {
      text-align: center;
      color: var(--text-muted);
      padding: var(--s8) 0;
    }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() sortKey = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() customCellTemplate: any;

  @Output() sortChange = new EventEmitter<{ key: string, direction: 'asc' | 'desc' }>();

  onSort(column: TableColumn): void {
    if (!column.sortable) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (this.sortKey === column.key) {
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    this.sortChange.emit({ key: column.key, direction });
  }

}
