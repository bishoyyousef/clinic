import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { FilterBarComponent, FilterField } from '../../shared/components/filter-bar/filter-bar.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    FilterBarComponent,
    DataTableComponent,
    PaginationComponent,
    StatusBadgeComponent,
    ButtonComponent
  ],
  template: `
    <div class="patients-page">
      <!-- Header Area -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Patients Directory</h1>
          <p class="page-subtitle">Manage, filter, and view patient health records</p>
        </div>
        <app-button (click)="onCreateDemo()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 6px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Patient
        </app-button>
      </div>

      <!-- Toolbar with Search & Dynamic Filter Bar -->
      <div class="toolbar-section">
        <div class="search-box">
          <app-search-input 
            placeholder="Search by name or email..."
            (search)="onSearch($event)">
          </app-search-input>
        </div>

        <div class="filters-box">
          <app-filter-bar 
            [fields]="filterFields"
            (filterChange)="onFilterChange($event)">
          </app-filter-bar>
        </div>
      </div>

      <!-- Main Data Card -->
      <div class="table-card">
        <app-data-table
          [columns]="columns"
          [data]="paginatedData"
          [sortKey]="sortKey"
          [sortDirection]="sortDirection"
          [customCellTemplate]="customCell"
          (sortChange)="onSortChange($event)">
        </app-data-table>

        <app-pagination
          [page]="page"
          [pageSize]="pageSize"
          [total]="filteredData.length"
          (pageChange)="onPageChange($event)">
        </app-pagination>
      </div>
    </div>

    <!-- Custom Cell Projection Template -->
    <ng-template #customCell let-row let-column="column">
      <ng-container [ngSwitch]="column.key">
        <!-- Render status with the shared StatusBadge component -->
        <app-status-badge *ngSwitchCase="'status'" [status]="row.status"></app-status-badge>
        
        <!-- Action Buttons -->
        <div *ngSwitchCase="'actions'" class="actions-cell">
          <app-button variant="text" (click)="onViewPatient(row)">View</app-button>
          <app-button variant="text" class="text-danger" (click)="onDeletePatient(row)">Delete</app-button>
        </div>
      </ng-container>
    </ng-template>
  `,
  styles: [`
    .patients-page {
      display: flex;
      flex-direction: column;
      gap: var(--s6);
      animation: fadeIn var(--dur-lg) var(--ease);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--s4);
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .toolbar-section {
      display: flex;
      flex-direction: column;
      gap: var(--s4);
      width: 100%;
    }
    .search-box {
      width: 100%;
    }
    .filters-box {
      flex-grow: 1;
      width: 100%;
    }
    @media (min-width: 1024px) {
      .toolbar-section {
        flex-direction: row;
        align-items: flex-end;
      }
      .search-box {
        max-width: 320px;
      }
    }
    .table-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .actions-cell {
      display: flex;
      align-items: center;
      gap: var(--s1);
    }
    .text-danger {
      color: var(--danger) !important;
    }
    .text-danger:hover {
      background-color: var(--danger-soft) !important;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PatientsComponent {
  // Column definitions for DataTable
  columns: TableColumn[] = [
    { key: 'name', label: 'Patient', type: 'avatar', sortable: true },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'fees', label: 'Consultation Fee', type: 'currency', sortable: true },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'actions', label: 'Actions', type: 'custom' }
  ];

  // Filter field configurations for FilterBar
  filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'PendingPayment', label: 'Pending Payment' },
        { value: 'NoShow', label: 'No Show' }
      ],
      placeholder: 'All Statuses'
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ],
      placeholder: 'All Genders'
    }
  ];

  // In-memory mock patient list
  patients: any[] = [
    { id: 1, name: 'Amr Khalil', email: 'amr.khalil@gmail.com', phone: '+20 100 123 4567', fees: 450, status: 'Completed', gender: 'Male' },
    { id: 2, name: 'Sara Ahmed', email: 'sara.ahmed@outlook.com', phone: '+20 111 234 5678', fees: 300, status: 'Confirmed', gender: 'Female' },
    { id: 3, name: 'Mohamed Aly', email: 'mohamed.aly@yahoo.com', phone: '+20 122 345 6789', fees: 500, status: 'PendingPayment', gender: 'Male' },
    { id: 4, name: 'Nour El-Din', email: 'nour.eldin@gmail.com', phone: '+20 109 876 5432', fees: 350, status: 'NoShow', gender: 'Male' },
    { id: 5, name: 'Yasmine Sabry', email: 'yasmine.sabry@hotmail.com', phone: '+20 101 234 5678', fees: 600, status: 'Completed', gender: 'Female' },
    { id: 6, name: 'Kareem Fahmy', email: 'kareem.fahmy@gmail.com', phone: '+20 102 345 6789', fees: 400, status: 'Cancelled', gender: 'Male' },
    { id: 7, name: 'Hoda El-Shaarawy', email: 'hoda.shaarawy@gmail.com', phone: '+20 110 555 4444', fees: 300, status: 'Confirmed', gender: 'Female' },
    { id: 8, name: 'Tarek Lotfy', email: 'tarek.lotfy@outlook.com', phone: '+20 120 444 3333', fees: 450, status: 'Completed', gender: 'Male' },
    { id: 9, name: 'Rania Youssef', email: 'rania.youssef@yahoo.com', phone: '+20 125 333 2222', fees: 500, status: 'PendingPayment', gender: 'Female' },
    { id: 10, name: 'Ahmed Hezi', email: 'ahmed.hezi@gmail.com', phone: '+20 106 222 1111', fees: 350, status: 'NoShow', gender: 'Male' },
    { id: 11, name: 'Mai Selim', email: 'mai.selim@hotmail.com', phone: '+20 107 111 0000', fees: 400, status: 'Confirmed', gender: 'Female' },
    { id: 12, name: 'Sherif Moneer', email: 'sherif.moneer@gmail.com', phone: '+20 108 000 9999', fees: 600, status: 'Completed', gender: 'Male' }
  ];

  // State management properties
  searchTerm = '';
  activeFilters: Record<string, any> = {};
  sortKey = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 5;

  // Filtered and sorted data helper
  get filteredData(): any[] {
    let result = [...this.patients];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.email.toLowerCase().includes(term) ||
        p.phone.includes(term)
      );
    }

    // Apply active drop-down filters
    Object.keys(this.activeFilters).forEach(key => {
      const val = this.activeFilters[key];
      if (val) {
        result = result.filter(p => p[key] === val);
      }
    });

    // Apply column sorting
    if (this.sortKey) {
      result.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        
        let comparison = 0;
        if (typeof valA === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number') {
          comparison = valA - valB;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }

  // Get current page slice of data
  get paginatedData(): any[] {
    const data = this.filteredData;
    const start = (this.page - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  // Handle debounced search event
  onSearch(term: string): void {
    this.searchTerm = term;
    this.page = 1; // Reset to page 1 on search
  }

  // Handle debounced filter changes
  onFilterChange(filters: Record<string, any>): void {
    this.activeFilters = filters;
    this.page = 1; // Reset to page 1 on filter change
  }

  // Handle column sorting toggle
  onSortChange(event: { key: string, direction: 'asc' | 'desc' }): void {
    this.sortKey = event.key;
    this.sortDirection = event.direction;
  }

  // Handle page change click
  onPageChange(newPage: number): void {
    this.page = newPage;
  }

  onCreateDemo(): void {
    alert('Mock Action: Create Patient modal/form would open here.');
  }

  onViewPatient(patient: any): void {
    alert(`Mock Action: Opening health records profile for ${patient.name}`);
  }

  onDeletePatient(patient: any): void {
    if (confirm(`Are you sure you want to delete patient "${patient.name}"?`)) {
      this.patients = this.patients.filter(p => p.id !== patient.id);
      this.page = 1; // Reset to page 1
    }
  }
}
