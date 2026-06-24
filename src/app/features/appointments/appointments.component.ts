import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
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
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DataTableComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ButtonComponent,
    ModalComponent
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

  // Details Modal/Drawer State Signals
  isDetailsOpen = signal<boolean>(false);
  isLoadingDetails = signal<boolean>(false);
  isActionLoading = signal<boolean>(false);
  activeAppointment = signal<AppointmentDto | null>(null);

  // Rescheduling Sub-Modal State Signals
  isRescheduleOpen = signal<boolean>(false);
  isFetchingSlots = signal<boolean>(false);
  rescheduleDate = signal<string>('');
  availableSlots = signal<string[]>([]);
  selectedSlot = signal<string>('');
  minRescheduleDate = new Date().toISOString().split('T')[0];

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
      
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
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
   * Computes a user-friendly label representing the active week range.
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
   * Fetches the list of active doctors from the server.
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
   * Fetches appointments. List view queries single date. Calendar view parallel-queries the week.
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

      const requests = days.map(day => 
        this.appointmentService.getCalendar(
          day.dateStr,
          doctorParam || undefined,
          statusParam || undefined
        )
      );

      forkJoin(requests).subscribe({
        next: (results) => {
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
   * Shifts active week back 7 days.
   */
  prevWeek(): void {
    const current = new Date(this.filterDate());
    current.setDate(current.getDate() - 7);
    this.filterDate.set(current.toISOString().split('T')[0]);
    this.loadAppointments();
  }

  /**
   * Shifts active week forward 7 days.
   */
  nextWeek(): void {
    const current = new Date(this.filterDate());
    current.setDate(current.getDate() + 7);
    this.filterDate.set(current.toISOString().split('T')[0]);
    this.loadAppointments();
  }

  /**
   * Navigates active date to today.
   */
  goToToday(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.filterDate() !== todayStr) {
      this.filterDate.set(todayStr);
      this.loadAppointments();
    }
  }

  /**
   * Retrieves and sorts appointments for a specific date.
   */
  getAppointmentsForDay(dateStr: string): AppointmentDto[] {
    return this.appointments()
      .filter(app => app.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // ==========================================
  // APPOINTMENT DETAILS & LIFECYCLE ACTIONS
  // ==========================================

  /**
   * Opens the details modal and loads full data for a specific appointment.
   * @param appointment Appointment summary object
   */
  onViewDetails(appointment: AppointmentDto): void {
    this.activeAppointment.set(null);
    this.isDetailsOpen.set(true);
    this.isLoadingDetails.set(true);

    this.appointmentService.getById(appointment.id).subscribe({
      next: (res) => {
        this.activeAppointment.set(res);
        this.isLoadingDetails.set(false);
      },
      error: (err) => {
        this.isLoadingDetails.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve appointment details.';
        this.toastService.show(msg, 'error');
        this.closeDetails();
      }
    });
  }

  /**
   * Closes the details modal.
   */
  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.activeAppointment.set(null);
  }

  /**
   * Unified action execution helper. Handles loading state, list reloads, detail refreshes, and toasts.
   */
  private executeAction(action$: Observable<void>, successMessage: string): void {
    const activeApp = this.activeAppointment();
    if (!activeApp) return;

    this.isActionLoading.set(true);
    action$.subscribe({
      next: () => {
        this.toastService.show(successMessage, 'success');
        this.loadAppointments(); // Reload background schedule

        // Reload the details view
        this.appointmentService.getById(activeApp.id).subscribe({
          next: (updated) => {
            this.activeAppointment.set(updated);
            this.isActionLoading.set(false);
          },
          error: () => {
            this.isActionLoading.set(false);
          }
        });
      },
      error: (err) => {
        this.isActionLoading.set(false);
        const msg = err.error?.message || err.message || 'Action execution failed.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Transitions appointment status to 'Arrived'.
   */
  onCheckIn(id: number): void {
    this.executeAction(this.appointmentService.checkIn(id), 'Patient checked in successfully.');
  }

  /**
   * Transitions appointment status to 'NoShow'.
   */
  onMarkNoShow(id: number): void {
    this.executeAction(this.appointmentService.markNoShow(id), 'Appointment marked as No-Show.');
  }

  /**
   * Records cash payment, updating payment status to Paid.
   */
  onMarkCashPaid(id: number): void {
    this.executeAction(this.appointmentService.markCashPaid(id), 'Cash payment recorded successfully.');
  }

  /**
   * Completes the consultation and transitions status to 'Completed'.
   */
  onComplete(id: number): void {
    this.executeAction(this.appointmentService.complete(id), 'Consultation completed successfully.');
  }

  /**
   * Cancels the appointment, transitioning status to 'Cancelled'.
   */
  onCancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      this.executeAction(this.appointmentService.cancel(id), 'Appointment cancelled successfully.');
    }
  }

  // ==========================================
  // RESCHEDULING ACTIONS & SERVICES
  // ==========================================

  /**
   * Prepares and opens the rescheduling sub-modal.
   */
  openReschedule(): void {
    const app = this.activeAppointment();
    if (!app) return;

    this.rescheduleDate.set(app.date); // Default to current date
    this.selectedSlot.set('');
    this.availableSlots.set([]);
    this.isRescheduleOpen.set(true);
    this.loadAvailableSlots(); // Pre-fetch slots for current date
  }

  /**
   * Closes the rescheduling modal.
   */
  closeReschedule(): void {
    this.isRescheduleOpen.set(false);
    this.selectedSlot.set('');
    this.availableSlots.set([]);
  }

  /**
   * Triggers slot reload when date is changed.
   */
  onRescheduleDateChange(newDate: string): void {
    this.rescheduleDate.set(newDate);
    this.loadAvailableSlots();
  }

  /**
   * Fetches available 15-minute slots for the assigned doctor, date, and service.
   */
  loadAvailableSlots(): void {
    const app = this.activeAppointment();
    const date = this.rescheduleDate();
    if (!app || !date) return;

    this.isFetchingSlots.set(true);
    this.availableSlots.set([]);
    this.selectedSlot.set('');

    this.doctorService.getSlots(app.doctorId, date, app.serviceId).subscribe({
      next: (res) => {
        this.availableSlots.set(res.slots || []);
        this.isFetchingSlots.set(false);
      },
      error: (err) => {
        this.isFetchingSlots.set(false);
        const msg = err.error?.message || err.message || 'Failed to fetch available specialist slots.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Confirms and saves the rescheduled appointment time slot.
   */
  onConfirmReschedule(): void {
    const app = this.activeAppointment();
    const date = this.rescheduleDate();
    const slot = this.selectedSlot();
    if (!app || !date || !slot) return;

    this.isActionLoading.set(true);
    this.appointmentService.reschedule(app.id, { date, startTime: slot }).subscribe({
      next: () => {
        this.toastService.show('Appointment rescheduled successfully.', 'success');
        this.closeReschedule();
        this.loadAppointments(); // Reload background schedule

        // Reload the details view to show updated time
        this.appointmentService.getById(app.id).subscribe({
          next: (updated) => {
            this.activeAppointment.set(updated);
            this.isActionLoading.set(false);
          },
          error: () => {
            this.isActionLoading.set(false);
          }
        });
      },
      error: (err) => {
        this.isActionLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to reschedule appointment.';
        this.toastService.show(msg, 'error');
      }
    });
  }
}
