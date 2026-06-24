import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Layout View Control (defaults to list for Phase 2)
  activeView = signal<'calendar' | 'list'>('list');

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

  ngOnInit(): void {
    this.loadDoctors();
    this.loadAppointments();
  }

  /**
   * Switches active view between List and Calendar tabs.
   */
  setView(view: 'calendar' | 'list'): void {
    this.activeView.set(view);
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
   * Fetches the appointments from the server based on active filters (date, doctor, status).
   */
  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const dateParam = this.filterDate();
    const doctorParam = this.filterDoctorId();
    const statusParam = this.filterStatus();

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
  }

  /**
   * Triggered when any filter input changes.
   */
  onFilterChange(): void {
    this.loadAppointments();
  }

  /**
   * Resets all filters to their default states and reloads the schedule.
   */
  resetFilters(): void {
    this.filterDate.set(new Date().toISOString().split('T')[0]);
    this.filterDoctorId.set('');
    this.filterStatus.set('');
    this.loadAppointments();
  }

  /**
   * Placeholder for viewing appointment details drawer (to be implemented in Phase 4).
   * @param appointment Target appointment Dto
   */
  onViewDetails(appointment: AppointmentDto): void {
    this.toastService.show(`Details for appointment #${appointment.id} (Coming in Phase 4)`, 'info');
  }
}
