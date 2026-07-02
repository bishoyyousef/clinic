import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { ToastService } from '../../core/services/toast.service';
import { AppointmentDto, AppointmentStatus } from '../../core/models/appointment.model';
import { DoctorListItemDto } from '../../core/models/doctor.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CurrencyEgpPipe } from '../../shared/pipes/currency-egp.pipe';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    ModalComponent,
    CurrencyEgpPipe,
    DataTableComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private toastService = inject(ToastService);

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

  // Table Columns Definition
  columns: TableColumn[] = [
    { key: 'time', label: 'TIME', type: 'custom' },
    { key: 'patient', label: 'PATIENT', type: 'custom' },
    { key: 'doctor', label: 'DOCTOR', type: 'custom' },
    { key: 'service', label: 'SERVICE', type: 'custom' },
    { key: 'status', label: 'STATUS', type: 'custom' },
    { key: 'payment', label: 'PAYMENT', type: 'custom' },
    { key: 'actions', label: '', type: 'custom' }
  ];

  /**
   * Computes the 7 dates of the active week (Monday to Sunday) based on the selected filterDate.
   */
  weekDays = computed(() => {
    const dateStr = this.filterDate();
    if (!dateStr) return [];

    // Parse in local timezone at noon to avoid DST midnight crossing date-shifts
    const parts = dateStr.split('-');
    const current = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);

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
   * Fetches weekly appointments parallel-querying the week using forkJoin.
   */
  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const doctorParam = this.filterDoctorId();
    const statusParam = this.filterStatus();

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
      ).pipe(
        catchError(() => of([] as AppointmentDto[])) // Robust fall-back so single-day failures don't block the week
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
        const msg = err?.error?.message || err?.message || 'Failed to load weekly appointments.';
        this.errorMessage.set(msg);
        this.toastService.show(msg, 'error');
      }
    });
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
      .filter(app => {
        if (!app.date) return false;
        return app.date === dateStr || app.date.startsWith(dateStr);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // ==========================================
  // APPOINTMENT DETAILS & LIFECYCLE ACTIONS
  // ==========================================

  /**
   * Opens the details modal and loads full data for a specific appointment.
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

  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.activeAppointment.set(null);
  }

  private executeAction(action$: Observable<void>, successMessage: string): void {
    const activeApp = this.activeAppointment();
    if (!activeApp) return;

    this.isActionLoading.set(true);
    action$.subscribe({
      next: () => {
        this.toastService.show(successMessage, 'success');
        this.loadAppointments(); // Reload background schedule

        // Reload details view
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

  onCheckIn(id: number): void {
    this.executeAction(this.appointmentService.checkIn(id), 'Patient checked in successfully.');
  }

  onMarkNoShow(id: number): void {
    this.executeAction(this.appointmentService.markNoShow(id), 'Appointment marked as No-Show.');
  }

  onMarkCashPaid(id: number): void {
    this.executeAction(this.appointmentService.markCashPaid(id), 'Cash payment recorded successfully.');
  }

  onComplete(id: number): void {
    this.executeAction(this.appointmentService.complete(id), 'Consultation completed successfully.');
  }

  onCancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      this.executeAction(this.appointmentService.cancel(id), 'Appointment cancelled successfully.');
    }
  }

  // ==========================================
  // RESCHEDULING ACTIONS & SERVICES
  // ==========================================

  openReschedule(): void {
    const app = this.activeAppointment();
    if (!app) return;

    this.rescheduleDate.set(app.date ? app.date.split('T')[0] : '');
    this.selectedSlot.set('');
    this.availableSlots.set([]);
    this.isRescheduleOpen.set(true);
    this.loadAvailableSlots();
  }

  closeReschedule(): void {
    this.isRescheduleOpen.set(false);
    this.selectedSlot.set('');
    this.availableSlots.set([]);
  }

  onRescheduleDateChange(newDate: string): void {
    this.rescheduleDate.set(newDate);
    this.loadAvailableSlots();
  }

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
