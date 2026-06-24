import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { ToastService } from '../../core/services/toast.service';
import { AppointmentDto, AppointmentStatus } from '../../core/models/appointment.model';
import { DoctorListItemDto } from '../../core/models/doctor.model';
import { TableColumn, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ButtonComponent
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private toastService = inject(ToastService);

  // Layout View Control
  activeView = signal<'calendar' | 'list'>('calendar');

  // State Signals for Filters & Data
  filterDate = signal<string>(new Date().toISOString().split('T')[0]);
  filterDoctorId = signal<string>('');
  filterStatus = signal<string>('');
  
  appointments = signal<AppointmentDto[]>([]);
  doctors = signal<DoctorListItemDto[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Available Lifecycle Status Options for Filter Dropdown
  statusOptions: { value: AppointmentStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Arrived', label: 'Arrived' },
    { value: 'Completed', label: 'Completed' },
    { value: 'NoShow', label: 'No Show' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'PendingPayment', label: 'Pending Payment' }
  ];

  // Data Table Column Configurations
  columns: TableColumn[] = [
    { key: 'patientName', label: 'Patient', type: 'avatar', sortable: true },
    { key: 'doctorName', label: 'Doctor', type: 'text', sortable: true },
    { key: 'date', label: 'Date', type: 'text', sortable: true },
    { key: 'timeSlot', label: 'Time Slot', type: 'custom' },
    { key: 'mode', label: 'Mode', type: 'text' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'actions', label: 'Actions', type: 'custom' }
  ];

  /**
   * Computes the 7 dates of the active week (Monday to Sunday) based on the selected filterDate.
   */
  weekDays = computed(() => {
    const dateStr = this.filterDate();
    if (!dateStr) return [];
    
    const current = new Date(dateStr);
    const day = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the difference to the most recent Monday
    // If Sunday (0), difference to Monday is -6. Otherwise, it is 1 - day.
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStrFormatted = `${year}-${month}-${date}`;
      
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.
      const dayNum = d.getDate();
      
      days.push({
        dateStr: dateStrFormatted,
        label: dayLabel,
        dayNum: dayNum,
        isToday: dateStrFormatted === new Date().toISOString().split('T')[0]
      });
    }
    return days;
  });

  /**
   * Computes a user-friendly label representing the active week range (e.g. "Jun 22 – 28, 2026").
   */
  weekRangeLabel = computed(() => {
    const days = this.weekDays();
    if (days.length === 0) return '';
    
    const first = new Date(days[0].dateStr);
    const last = new Date(days[6].dateStr);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const firstLabel = first.toLocaleDateString('en-US', options);
    
    const year = first.getFullYear();
    if (first.getMonth() === last.getMonth()) {
      return `${firstLabel} – ${last.getDate()}, ${year}`;
    } else {
      const lastLabel = last.toLocaleDateString('en-US', options);
      return `${firstLabel} – ${lastLabel}, ${year}`;
    }
  });

  ngOnInit(): void {
    this.loadDoctors();
    this.loadAppointments();
  }

  /**
   * Switches active view between List and Calendar tabs and triggers data reload.
   */
  setView(view: 'calendar' | 'list'): void {
    this.activeView.set(view);
    this.loadAppointments();
  }

  /**
   * Fetches the list of active doctors from the server to populate the filter dropdown.
   */
  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (res) => {
        this.doctors.set(res);
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to load doctors list.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Fetches appointments. In List View, loads a single day.
   * In Calendar View, parallel-loads the 7 days of the active week and flattens them.
   */
  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const doctorParam = this.filterDoctorId();
    const statusParam = this.filterStatus();

    if (this.activeView() === 'list') {
      const dateParam = this.filterDate();
      this.appointmentService.getCalendar(
        dateParam || undefined,
        doctorParam || undefined,
        statusParam || undefined
      ).subscribe({
        next: (res) => {
          this.appointments.set(res);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || err.message || 'Failed to retrieve appointments schedule.';
          this.errorMessage.set(msg);
          this.toastService.show(msg, 'error');
        }
      });
    } else {
      const days = this.weekDays();
      if (days.length === 0) {
        this.isLoading.set(false);
        return;
      }

      // Query all 7 days of the active week in parallel
      const requests = days.map(day => 
        this.appointmentService.getCalendar(
          day.dateStr,
          doctorParam || undefined,
          statusParam || undefined
        )
      );

      forkJoin(requests).subscribe({
        next: (results) => {
          // Flatten appointments list across the entire week
          const allAppointments = results.flat();
          this.appointments.set(allAppointments);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || err.message || 'Failed to load weekly appointments.';
          this.errorMessage.set(msg);
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

  /**
   * Filter change handler.
   */
  onFilterChange(): void {
    this.loadAppointments();
  }

  /**
   * Resets filters and reloads data.
   */
  resetFilters(): void {
    this.filterDate.set(new Date().toISOString().split('T')[0]);
    this.filterDoctorId.set('');
    this.filterStatus.set('');
    this.loadAppointments();
  }

  /**
   * Shifts the active week view back by 7 days.
   */
  prevWeek(): void {
    const current = new Date(this.filterDate());
    current.setDate(current.getDate() - 7);
    this.filterDate.set(current.toISOString().split('T')[0]);
    this.loadAppointments();
  }

  /**
   * Shifts the active week view forward by 7 days.
   */
  nextWeek(): void {
    const current = new Date(this.filterDate());
    current.setDate(current.getDate() + 7);
    this.filterDate.set(current.toISOString().split('T')[0]);
    this.loadAppointments();
  }

  /**
   * Navigates the calendar and list date to today.
   */
  goToToday(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.filterDate() !== todayStr) {
      this.filterDate.set(todayStr);
      this.loadAppointments();
    }
  }

  /**
   * Retrieves and sorts the loaded appointments for a specific day of the week.
   * @param dateStr Target day date string (YYYY-MM-DD)
   */
  getAppointmentsForDay(dateStr: string): AppointmentDto[] {
    return this.appointments()
      .filter(app => app.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /**
   * Placeholder for details drawer (Phase 4).
   */
  onViewDetails(appointment: AppointmentDto): void {
    this.toastService.show(`Details for appointment #${appointment.id} (Coming in Phase 4)`, 'info');
  }
}
