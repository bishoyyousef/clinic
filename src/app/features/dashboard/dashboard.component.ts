import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStatsDto } from '../../core/models/dashboard.model';
import { AppointmentDto } from '../../core/models/appointment.model';
import { TableColumn, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ButtonComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Loading State Overlay -->
      <div class="loading-wrapper" *ngIf="isLoading()">
        <app-loading-spinner size="lg"></app-loading-spinner>
        <p class="loading-text">Retrieving today's dashboard metrics...</p>
      </div>

      <!-- Error Handling Banner -->
      <div class="error-banner" *ngIf="error() && !isLoading()">
        <div class="error-content">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" class="error-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ error() }}</span>
        </div>
        <app-button variant="secondary" (click)="loadDashboardData()">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="margin-right: 4px;">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Retry
        </app-button>
      </div>

      <!-- Dashboard Operational Content -->
      <ng-container *ngIf="!isLoading() && !error()">
        <!-- Header Section -->
        <div class="dashboard-header">
          <h1 class="page-title">Dashboard Overview</h1>
          <p class="page-subtitle">Real-time daily clinic operational statistics and patient schedules</p>
        </div>

        <!-- 6 Premium Statistics Cards -->
        <div class="stats-grid">
          <!-- Total Appointments -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="stat-card-body">
              <div class="stat-info">
                <span class="stat-label">Total Appointments</span>
                <span class="stat-value">{{ stats()?.totalAppointments || 0 }}</span>
              </div>
              <div class="stat-icon-wrapper stat-icon-total">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Confirmed -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="stat-card-body">
              <div class="stat-info">
                <span class="stat-label">Confirmed Slots</span>
                <span class="stat-value">{{ stats()?.confirmed || 0 }}</span>
              </div>
              <div class="stat-icon-wrapper stat-icon-confirmed">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Arrived -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="stat-card-body">
              <div class="stat-info">
                <span class="stat-label">Patients Arrived</span>
                <span class="stat-value">{{ stats()?.arrived || 0 }}</span>
              </div>
              <div class="stat-icon-wrapper stat-icon-arrived">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Completed -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="stat-card-body">
              <div class="stat-info">
                <span class="stat-label">Completed Visits</span>
                <span class="stat-value">{{ stats()?.completed || 0 }}</span>
              </div>
              <div class="stat-icon-wrapper stat-icon-completed">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- No Show -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="stat-card-body">
              <div class="stat-info">
                <span class="stat-label">No-Show / Missed</span>
                <span class="stat-value">{{ stats()?.noShow || 0 }}</span>
              </div>
              <div class="stat-icon-wrapper stat-icon-noshow">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Today's Revenue -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="stat-card-body">
              <div class="stat-info">
                <span class="stat-label">Today's Revenue</span>
                <span class="stat-value revenue-value">{{ stats()?.todaysRevenue || 0 | number:'1.2-2' }} EGP</span>
              </div>
              <div class="stat-icon-wrapper stat-icon-revenue">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Today's Schedule Table Section -->
        <div class="schedule-section">
          <div class="section-header">
            <h2 class="section-title">Today's Scheduled Appointments</h2>
            <p class="section-subtitle">View and monitor daily patient check-in schedules and statuses</p>
          </div>

          <div class="table-container-card" *ngIf="appointments().length > 0; else noAppointmentsTmpl">
            <app-data-table
              [columns]="columns"
              [data]="formattedAppointments"
              [customCellTemplate]="customCell">
            </app-data-table>
          </div>

          <!-- Reusable Empty State Component -->
          <ng-template #noAppointmentsTmpl>
            <app-empty-state
              title="No Appointments Booked Today"
              message="There are no patients scheduled in the clinic calendar for today's operational hours."
              icon="calendar">
            </app-empty-state>
          </ng-template>
        </div>
      </ng-container>

      <!-- Custom Column Rendering Template -->
      <ng-template #customCell let-row let-column="column">
        <ng-container [ngSwitch]="column.key">
          <!-- Render status badge -->
          <app-status-badge *ngSwitchCase="'status'" [status]="row.status"></app-status-badge>
        </ng-container>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: var(--s8);
      animation: fadeIn var(--dur-lg) var(--ease);
    }
    .dashboard-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--danger-soft);
      color: var(--danger);
      border: 1px solid var(--danger);
      border-radius: var(--r);
      padding: var(--s4) var(--s6);
      gap: var(--s4);
    }
    .error-content {
      display: flex;
      align-items: center;
      gap: var(--s3);
      font-size: 0.875rem;
      font-weight: 500;
    }
    .error-icon {
      flex-shrink: 0;
    }
    .loading-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--s12) 0;
      gap: var(--s4);
    }
    .loading-text {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--s4);
    }
    @media (min-width: 640px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .stat-card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
      gap: var(--s1);
    }
    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.1;
    }
    .revenue-value {
      font-size: 1.5rem;
    }
    .stat-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: var(--r-full);
    }
    .stat-icon-total {
      background-color: var(--surface-2);
      color: var(--text-muted);
    }
    .stat-icon-confirmed {
      background-color: var(--accent-soft);
      color: var(--accent);
    }
    .stat-icon-arrived {
      background-color: var(--info-soft);
      color: var(--info);
    }
    .stat-icon-completed {
      background-color: var(--success-soft);
      color: var(--success);
    }
    .stat-icon-noshow {
      background-color: var(--warning-soft);
      color: var(--warning);
    }
    .stat-icon-revenue {
      background-color: var(--success-soft);
      color: var(--success);
    }
    .schedule-section {
      display: flex;
      flex-direction: column;
      gap: var(--s4);
    }
    .section-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 650;
      color: var(--text);
    }
    .section-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .table-container-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      overflow: hidden;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Signals for state management
  stats = signal<DashboardStatsDto | null>(null);
  appointments = signal<AppointmentDto[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Table Columns Definition
  columns: TableColumn[] = [
    { key: 'patientName', label: 'Patient', type: 'avatar' },
    { key: 'doctorName', label: 'Doctor', type: 'text' },
    { key: 'timeRange', label: 'Time Slot', type: 'text' },
    { key: 'serviceName', label: 'Service', type: 'text' },
    { key: 'status', label: 'Status', type: 'custom' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Loads both stats and daily appointments in parallel using forkJoin.
   */
  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      stats: this.dashboardService.getStats(),
      appointments: this.dashboardService.getTodayAppointments()
    }).subscribe({
      next: (result) => {
        this.stats.set(result.stats);
        // Ensure appointments is always an array
        this.appointments.set(result.appointments || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to load dashboard metrics. Please check your network connection and try again.';
        this.error.set(msg);
      }
    });
  }

  /**
   * Maps appointments array to format the start/end times together.
   */
  get formattedAppointments(): any[] {
    return this.appointments().map(app => ({
      ...app,
      timeRange: `${app.startTime} - ${app.endTime}`
    }));
  }
}
