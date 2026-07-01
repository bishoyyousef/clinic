import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DoctorService } from '../../core/services/doctor.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { StaffDto } from '../../core/models/admin.model';
import { DoctorDetailsDto, AvailabilityWindowDto, BlockedDateDto } from '../../core/models/doctor.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InitialsPipe
  ],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.css'
})
export class AvailabilityComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Selector list and active states
  doctors = signal<StaffDto[]>([]);
  selectedDoctorId = signal<string>('');
  selectedDoctor = signal<StaffDto | null>(null);
  doctorDetails = signal<DoctorDetailsDto | null>(null);
  doctorAvailability = signal<AvailabilityWindowDto[]>([]);
  blockedDates = signal<BlockedDateDto[]>([]);

  isLoading = signal(true);
  isDetailsLoading = signal(false);
  isSubmitting = signal(false);

  // Availability Extensions State Signals
  isBlockedDatesLoading = signal(false);
  newBlockDate = signal('');
  slotCheckDate = signal('');
  slotCheckServiceId = signal<number | null>(null);
  checkedSlots = signal<string[]>([]);
  isCheckingSlots = signal(false);

  // Availability editor state
  isAvailabilityFormOpen = signal(false);
  scheduleState: Record<number, { active: boolean, startTime: string, endTime: string }> = {};

  // Days of the week lookup helper
  weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  ngOnInit(): void {
    this.initScheduleState();
    this.loadDoctors();
  }

  /**
   * Initializes a default schedule configuration state for the editor.
   */
  initScheduleState(): void {
    for (let i = 0; i < 7; i++) {
      this.scheduleState[i] = {
        active: false,
        startTime: '09:00',
        endTime: '17:00'
      };
    }
  }

  /**
   * Fetches all clinic staff members and filters locally to show Doctors.
   */
  loadDoctors(): void {
    this.isLoading.set(true);
    this.adminService.getStaff().subscribe({
      next: (staff) => {
        const list = (staff || []).filter(s => s.role.toLowerCase() === 'doctor');
        this.doctors.set(list);
        this.isLoading.set(false);

        // React to route query parameters
        this.route.queryParams.subscribe(params => {
          const docId = params['doctorId'];
          if (docId) {
            this.selectedDoctorId.set(docId);
            this.loadDoctorDetails(docId);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve specialists directory.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Triggers when the user manual selects a doctor in the dropdown.
   */
  onDoctorSelect(doctorId: string): void {
    if (!doctorId) return;
    this.selectedDoctorId.set(doctorId);
    
    // Update route parameter (silently or triggers sub)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { doctorId },
      queryParamsHandling: 'merge'
    });

    this.loadDoctorDetails(doctorId);
  }

  /**
   * Navigates to a doctor's detailed profile and availability grid.
   */
  loadDoctorDetails(doctorId: string): void {
    const doctorObj = this.doctors().find(d => d.id === doctorId);
    if (!doctorObj) return;

    this.selectedDoctor.set(doctorObj);
    this.isDetailsLoading.set(true);
    this.doctorDetails.set(null);
    this.doctorAvailability.set([]);
    this.blockedDates.set([]);
    this.newBlockDate.set('');
    this.slotCheckDate.set(this.getTodayDateString());
    this.slotCheckServiceId.set(null);
    this.checkedSlots.set([]);

    // Fetch doctor details, availability schedule, and blocked dates in parallel
    forkJoin({
      details: this.doctorService.getById(doctorId),
      availability: this.doctorService.getAvailability(doctorId),
      blockedDates: this.doctorService.getBlockedDates(doctorId)
    }).subscribe({
      next: (res) => {
        this.doctorDetails.set(res.details);
        this.doctorAvailability.set(res.availability || []);
        this.blockedDates.set(res.blockedDates || []);
        this.isDetailsLoading.set(false);

        // Auto-select first service if available to check slots right away
        if (res.details.services && res.details.services.length > 0) {
          this.slotCheckServiceId.set(res.details.services[0].id);
          this.loadCheckedSlots();
        }
      },
      error: (err) => {
        this.isDetailsLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to fetch profile details.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Helper to retrieve availability slots for a specific day of the week.
   */
  getDayWindows(dayOfWeek: number): AvailabilityWindowDto[] {
    return this.doctorAvailability().filter(w => w.dayOfWeek === dayOfWeek);
  }

  // ==========================================
  // BLOCKED DATES ACTIONS
  // ==========================================

  onBlockDate(): void {
    const doc = this.selectedDoctor();
    const date = this.newBlockDate();
    if (!doc || !date) return;

    this.isBlockedDatesLoading.set(true);
    this.doctorService.blockDate(doc.id, { date }).subscribe({
      next: (block) => {
        this.blockedDates.update(list => [...list, block]);
        this.newBlockDate.set('');
        this.isBlockedDatesLoading.set(false);
        this.toastService.show('Date blocked successfully.', 'success');
      },
      error: (err) => {
        this.isBlockedDatesLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to block date.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  onUnblockDate(block: BlockedDateDto): void {
    const doc = this.selectedDoctor();
    if (!doc) return;

    if (confirm(`Unblock calendar date ${block.date}?`)) {
      this.isBlockedDatesLoading.set(true);
      this.doctorService.unblockDate(doc.id, block.date).subscribe({
        next: () => {
          this.blockedDates.update(list => list.filter(b => b.date !== block.date));
          this.isBlockedDatesLoading.set(false);
          this.toastService.show('Date unblocked successfully.', 'success');
        },
        error: (err) => {
          this.isBlockedDatesLoading.set(false);
          const msg = err.error?.message || err.message || 'Failed to unblock date.';
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

  // ==========================================
  // LIVE SLOTS CHECKER ACTIONS
  // ==========================================

  loadCheckedSlots(): void {
    const doc = this.selectedDoctor();
    const svcId = this.slotCheckServiceId();
    const date = this.slotCheckDate();
    if (!doc || !svcId || !date) return;

    this.isCheckingSlots.set(true);
    this.checkedSlots.set([]);

    this.doctorService.getSlots(doc.id, date, svcId).subscribe({
      next: (res) => {
        this.checkedSlots.set(res.slots || []);
        this.isCheckingSlots.set(false);
      },
      error: (err) => {
        this.isCheckingSlots.set(false);
        const msg = err.error?.message || err.message || 'Failed to query live slots.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  // ==========================================
  // CONFIGURE AVAILABILITY MODAL ACTIONS
  // ==========================================

  openAvailabilityModal(): void {
    const activeSchedule = this.doctorAvailability();
    
    // Map current active availability windows to internal schedule state
    this.initScheduleState();
    
    activeSchedule.forEach(window => {
      this.scheduleState[window.dayOfWeek] = {
        active: true,
        startTime: window.startTime.substring(0, 5),
        endTime: window.endTime.substring(0, 5)
      };
    });

    this.isAvailabilityFormOpen.set(true);
  }

  closeAvailabilityModal(): void {
    this.isAvailabilityFormOpen.set(false);
  }

  toggleDayActive(dayOfWeek: number): void {
    if (this.scheduleState[dayOfWeek]) {
      this.scheduleState[dayOfWeek].active = !this.scheduleState[dayOfWeek].active;
    }
  }

  saveAvailability(): void {
    const doc = this.selectedDoctor();
    if (!doc) return;

    const payload: AvailabilityWindowDto[] = [];
    
    for (let i = 0; i < 7; i++) {
      const state = this.scheduleState[i];
      if (state.active) {
        payload.push({
          dayOfWeek: i,
          startTime: `${state.startTime}:00`,
          endTime: `${state.endTime}:00`
        });
      }
    }

    this.isSubmitting.set(true);
    this.doctorService.setAvailability(doc.id, payload).subscribe({
      next: () => {
        this.doctorAvailability.set(payload);
        this.isSubmitting.set(false);
        this.closeAvailabilityModal();
        this.toastService.show('Weekly availability schedule saved.', 'success');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || err.message || 'Failed to update schedule.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  // ==========================================
  // UTILITY INITIALS HELPERS
  // ==========================================

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
