import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container" [class.no-info]="!showInfo">
      <div class="pagination-info" *ngIf="showInfo">
        Showing 
        <span class="font-semibold">{{ total === 0 ? 0 : startItem }}</span> 
        to 
        <span class="font-semibold">{{ endItem }}</span> 
        of 
        <span class="font-semibold">{{ total }}</span> 
        entries
      </div>

      <div class="pagination-controls">
        <!-- Previous Button -->
        <button 
          class="page-btn nav-btn" 
          [disabled]="page <= 1" 
          (click)="onPageClick(page - 1)"
          aria-label="Previous page"
        >
          <svg class="chevron-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span class="nav-text" *ngIf="prevLabel">{{ prevLabel }}</span>
        </button>

        <!-- Page Numbers -->
        <ng-container *ngFor="let p of pages">
          <button 
            *ngIf="isNumber(p); else ellipsisTmpl"
            class="page-btn" 
            [class.active]="p === page"
            (click)="onPageClick(toNumber(p))"
          >
            {{ p }}
          </button>
          <ng-template #ellipsisTmpl>
            <span class="ellipsis">...</span>
          </ng-template>
        </ng-container>

        <!-- Next Button -->
        <button 
          class="page-btn nav-btn" 
          [disabled]="page >= totalPages" 
          (click)="onPageClick(page + 1)"
          aria-label="Next page"
        >
          <span class="nav-text" *ngIf="nextLabel">{{ nextLabel }}</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--s4) var(--s6);
      background-color: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom-left-radius: var(--r);
      border-bottom-right-radius: var(--r);
      flex-wrap: wrap;
      gap: var(--s4);
    }
    .pagination-container.no-info {
      justify-content: center;
    }
    .pagination-info {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .font-semibold {
      font-weight: 600;
      color: var(--text);
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: var(--s1-5, 6px);
    }
    .page-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 var(--s2);
      border: 1px solid var(--border);
      background-color: var(--surface);
      color: var(--text);
      border-radius: var(--r-sm);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--dur) var(--ease);
      user-select: none;
    }
    .page-btn:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
      background-color: var(--accent-soft);
    }
    .page-btn.active {
      background-color: var(--accent);
      border-color: var(--accent);
      color: #ffffff;
      font-weight: 600;
    }
    .page-btn:disabled {
      color: var(--text-muted);
      background-color: var(--bg);
      border-color: var(--border);
      cursor: not-allowed;
      opacity: 0.6;
    }
    .nav-btn {
      gap: var(--s1-5);
    }
    .chevron-icon {
      transition: transform var(--dur) var(--ease);
    }
    [dir="rtl"] .chevron-icon {
      transform: rotate(180deg);
    }
    .ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      color: var(--text-muted);
      font-size: 0.875rem;
      user-select: none;
    }
    @media (max-width: 640px) {
      .pagination-container {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .nav-text {
        display: none;
      }
    }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() showInfo = true;
  @Input() prevLabel = 'Previous';
  @Input() nextLabel = 'Next';

  @Output() pageChange = new EventEmitter<number>();

  totalPages = 1;
  startItem = 0;
  endItem = 0;
  pages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    
    // Ensure current page doesn't exceed totalPages
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    if (this.page < 1) {
      this.page = 1;
    }

    this.startItem = (this.page - 1) * this.pageSize + 1;
    this.endItem = Math.min(this.page * this.pageSize, this.total);
    
    this.pages = this.generatePageNumbers();
  }

  generatePageNumbers(): (number | string)[] {
    const current = this.page;
    const total = this.totalPages;
    const neighbors = 1; // Number of pages to show around current page

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pageNumbers: (number | string)[] = [];
    pageNumbers.push(1);

    const start = Math.max(2, current - neighbors);
    const end = Math.min(total - 1, current + neighbors);

    if (start > 2) {
      pageNumbers.push('...');
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (end < total - 1) {
      pageNumbers.push('...');
    }

    pageNumbers.push(total);
    return pageNumbers;
  }

  onPageClick(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.page) {
      this.pageChange.emit(newPage);
    }
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }

  toNumber(val: any): number {
    return Number(val);
  }
}
