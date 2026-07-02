import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { ReportsDto } from '../../core/models/reports.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyEgpPipe } from '../../shared/pipes/currency-egp.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    LoadingSpinnerComponent,
    CurrencyEgpPipe
  ],
  template: `
    <div class="reports-container">
      <!-- Header Section -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Aggregated clinic financial statistics, operational reports, and doctor utilization metrics</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading() && !reportsData()">
        <app-loading-spinner size="lg"></app-loading-spinner>
        <p class="loading-text">Aggregating clinic statistics...</p>
      </div>

      <ng-container *ngIf="!isLoading() && reportsData()">
        <!-- Summary Cards Grid -->
        <div class="summary-grid">
          <!-- Total Revenue -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="summary-card-body">
              <div class="summary-info">
                <span class="summary-label">Total Revenue</span>
                <span class="summary-value revenue-val">{{ totalRevenue | currencyEgp }}</span>
              </div>
              <div class="sum-icon revenue-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Total Bookings -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="summary-card-body">
              <div class="summary-info">
                <span class="summary-label">Total Appointments</span>
                <span class="summary-value">{{ totalAppointments }}</span>
              </div>
              <div class="sum-icon bookings-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Completed Visits -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="summary-card-body">
              <div class="summary-info">
                <span class="summary-label">Completed Visits</span>
                <span class="summary-value">{{ completedVisits }}</span>
              </div>
              <div class="sum-icon completed-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </app-card>

          <!-- No-Show Rate -->
          <app-card padding="var(--s5)" [hasFooter]="false">
            <div class="summary-card-body">
              <div class="summary-info">
                <span class="summary-label">No-Show Rate</span>
                <span class="summary-value no-show-val">{{ reportsData()?.noShowRate || 0 | number:'1.1-1' }}%</span>
              </div>
              <div class="sum-icon noshow-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Main Analytics Dashboard Layout -->
        <div class="dashboard-grid">
          <!-- Daily Revenue Trend (Vertical Bar/Column Chart) -->
          <div class="analytics-card double-width">
            <h3 class="chart-title">Daily Financial Revenue Trend</h3>
            <p class="chart-subtitle">Aggregated clinic booking invoice totals over the past week</p>
            
            <div class="chart-container">
              <div class="y-axis">
                <span>{{ maxDayRevenue | number:'1.0-0' }}</span>
                <span>{{ maxDayRevenue / 2 | number:'1.0-0' }}</span>
                <span>0</span>
              </div>
              
              <div class="columns-wrapper">
                <div class="chart-col" *ngFor="let day of reportsData()?.revenueByDay">
                  <div class="bar-wrap">
                    <div class="col-bar" 
                      [style.height.%]="(day.revenue / maxDayRevenue) * 100"
                      [title]="day.revenue | currencyEgp">
                      <!-- Tooltip popup on hover -->
                      <span class="col-tip">{{ day.revenue | currencyEgp:0:0 }}</span>
                    </div>
                  </div>
                  <span class="x-label">{{ day.date | date:'EEE d' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Appointment Status Breakdown -->
          <div class="analytics-card">
            <h3 class="chart-title">Appointment Breakdown</h3>
            <p class="chart-subtitle">Operational status distribution of patient bookings</p>
            
            <div class="stat-list">
              <div class="stat-item" *ngFor="let item of reportsData()?.appointmentsByStatus">
                <div class="stat-meta">
                  <span class="stat-label">{{ item.status }}</span>
                  <span class="stat-val text-muted">{{ item.count }} visits</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" 
                    [class]="getStatusColorClass(item.status)"
                    [style.width.%]="(item.count / totalAppointments) * 100">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Service Revenue Distribution -->
          <div class="analytics-card">
            <h3 class="chart-title">Service Value Contribution</h3>
            <p class="chart-subtitle">Top revenue-generating clinic services and treatments</p>
            
            <div class="stat-list">
              <div class="stat-item" *ngFor="let item of reportsData()?.revenueByService">
                <div class="stat-meta">
                  <span class="stat-label">{{ item.serviceName }}</span>
                  <span class="stat-val">{{ item.revenue | currencyEgp:0:0 }}</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill service-fill" 
                    [style.width.%]="(item.revenue / maxServiceRevenue) * 100">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Doctor Utilization Metrics -->
          <div class="analytics-card double-width">
            <h3 class="chart-title">Medical Specialist Utilization</h3>
            <p class="chart-subtitle">Doctor scheduling efficiency based on completed vs scheduled appointments</p>
            
            <div class="stat-list">
              <div class="stat-item" *ngFor="let doc of reportsData()?.doctorUtilization">
                <div class="stat-meta">
                  <div class="util-doc-details">
                    <span class="stat-label">Dr. {{ doc.doctorName }}</span>
                    <span class="util-doc-ratio">{{ doc.completedAppointments }} / {{ doc.appointments }} completed</span>
                  </div>
                  <span class="stat-val">{{ getUtilizationPercent(doc) | number:'1.0-0' }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill util-fill" 
                    [style.width.%]="getUtilizationPercent(doc)">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  reportsData = signal<ReportsDto | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.adminService.getReports().subscribe({
      next: (data) => {
        this.reportsData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to aggregate reports data.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  get totalRevenue(): number {
    return this.reportsData()?.revenueByDay.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
  }

  get totalAppointments(): number {
    return this.reportsData()?.appointmentsByStatus.reduce((acc, curr) => acc + curr.count, 0) || 0;
  }

  get completedVisits(): number {
    return this.reportsData()?.appointmentsByStatus.find(s => s.status === 'Completed')?.count || 0;
  }

  get maxDayRevenue(): number {
    const dayRevenues = this.reportsData()?.revenueByDay.map(d => d.revenue) || [];
    return Math.max(...dayRevenues, 1);
  }

  get maxServiceRevenue(): number {
    const serviceRevenues = this.reportsData()?.revenueByService.map(s => s.revenue) || [];
    return Math.max(...serviceRevenues, 1);
  }

  getUtilizationPercent(doc: any): number {
    if (!doc.appointments) return 0;
    return (doc.completedAppointments / doc.appointments) * 100;
  }

  getStatusColorClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'success-fill';
      case 'confirmed': return 'accent-fill';
      case 'arrived': return 'info-fill';
      case 'noshow':
      case 'missed': return 'warning-fill';
      default: return 'muted-fill';
    }
  }
}
