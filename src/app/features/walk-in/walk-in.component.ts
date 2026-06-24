import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PatientService } from '../../core/services/patient.service';
import { PatientDto } from '../../core/models/patient.model';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorListItemDto } from '../../core/models/doctor.model';
import { ServiceService } from '../../core/services/service.service';
import { ServiceDto } from '../../core/models/service.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { WalkInRequest } from '../../core/models/appointment.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-walk-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './walk-in.component.html',
  styleUrl: './walk-in.component.css'
})
export class WalkInComponent implements OnInit, OnDestroy {
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Wizard active step tracker (1 to 5)
  activeStep = signal<number>(1);

  // Step 1: Patient selection states
  patientMode = signal<'existing' | 'new'>('existing');
  searchQuery = signal<string>('');
  newPatientName = signal<string>('');
  newPatientPhone = signal<string>('');
  newPatientEmail = signal<string>('');
  
  // Real Patient selection signals
  selectedPatient = signal<PatientDto | null>(null);
  matchingPatients = signal<PatientDto[]>([]);
  isSearchingPatients = signal<boolean>(false);

  // Search RxJS stream
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Real Doctor & Service selection and lists
  doctors = signal<DoctorListItemDto[]>([]);
  services = signal<ServiceDto[]>([]);
  selectedDoctor = signal<DoctorListItemDto | null>(null);
  selectedService = signal<ServiceDto | null>(null);

  // Computed signal to dynamically filter services for the selected doctor
  walkInFilteredServices = computed(() => {
    const doc = this.selectedDoctor();
    if (!doc) return [];
    const allServices = this.services();
    const filtered = allServices.filter(s => s.doctorId === doc.id);
    return filtered.length > 0 ? filtered : doc.services || [];
  });

  // Scheduling state signals
  bookingDate = signal<string>(new Date().toISOString().split('T')[0]);
  minBookingDate = new Date().toISOString().split('T')[0];
  availableSlots = signal<string[]>([]);
  selectedSlot = signal<string>('');
  isFetchingSlots = signal<boolean>(false);

  // Submission state signals
  isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    // Wire up debounced search stream
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.isSearchingPatients.set(false);
          return of([]);
        }
        this.isSearchingPatients.set(true);
        return this.patientService.search(query).pipe(
          catchError(err => {
            const msg = err.error?.message || err.message || 'Failed to search patients.';
            this.toastService.show(msg, 'error');
            return of([]);
          })
        );
      })
    ).subscribe({
      next: (res) => {
        this.matchingPatients.set(res || []);
        this.isSearchingPatients.set(false);
      },
      error: () => {
        this.isSearchingPatients.set(false);
      }
    });

    // Load doctors and services from active API endpoints
    this.loadDoctors();
    this.loadServices();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  /**
   * Fetches all active clinic specialists.
   */
  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (res) => {
        this.doctors.set(res || []);
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to retrieve doctors list.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Fetches all active clinic services.
   */
  loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (res) => {
        this.services.set(res || []);
      },
      error: (err) => {
        console.error('Failed to pre-fetch services:', err);
      }
    });
  }

  /**
   * Triggers the debounced search stream when query changes.
   */
  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  /**
   * Triggers slot reload when walk-in booking date is changed.
   */
  onBookingDateChange(newDate: string): void {
    this.bookingDate.set(newDate);
    this.loadAvailableSlots();
  }

  /**
   * Fetches available 15-minute booking slots from the server for the selected specialist and date.
   */
  loadAvailableSlots(): void {
    const doc = this.selectedDoctor();
    const svc = this.selectedService();
    const date = this.bookingDate();
    if (!doc || !svc || !date) return;

    this.isFetchingSlots.set(true);
    this.availableSlots.set([]);
    this.selectedSlot.set('');

    this.doctorService.getSlots(doc.id, date, svc.id).subscribe({
      next: (res) => {
        this.availableSlots.set(res.slots || []);
        this.isFetchingSlots.set(false);
      },
      error: (err) => {
        this.isFetchingSlots.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve available booking slots.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Helper to check if the new patient form matches basic completeness.
   */
  isNewPatientFormValid(): boolean {
    return (
      this.newPatientName().trim().length >= 3 &&
      this.newPatientPhone().trim().length >= 5
    );
  }

  /**
   * Reactive computed signal representing whether the receptionist satisfies
   * all validation rules to continue to the next step.
   */
  canContinue = computed(() => {
    const step = this.activeStep();
    if (step === 1) {
      if (this.patientMode() === 'existing') {
        return this.selectedPatient() !== null;
      } else {
        return this.isNewPatientFormValid();
      }
    }
    if (step === 2) {
      return this.selectedDoctor() !== null;
    }
    if (step === 3) {
      return this.selectedService() !== null;
    }
    if (step === 4) {
      return this.selectedSlot() !== '';
    }
    return true;
  });

  /**
   * Navigates forward in the stepper wizard.
   */
  nextStep(): void {
    const current = this.activeStep();
    if (current < 5 && this.canContinue()) {
      const next = current + 1;
      this.activeStep.set(next);
      if (next === 4) {
        this.loadAvailableSlots();
      }
    }
  }

  /**
   * Navigates backward in the stepper wizard.
   */
  prevStep(): void {
    const current = this.activeStep();
    if (current > 1) {
      this.activeStep.set(current - 1);
    }
  }

  /**
   * Selection helpers
   */
  selectPatient(patient: PatientDto): void {
    this.selectedPatient.set(patient);
  }

  selectDoctor(doctor: DoctorListItemDto): void {
    this.selectedDoctor.set(doctor);
    this.selectedService.set(null); // Reset service selection when doctor changes
  }

  selectService(service: ServiceDto): void {
    this.selectedService.set(service);
  }

  selectSlot(slot: string): void {
    this.selectedSlot.set(slot);
  }

  /**
   * Closes the wizard and returns to the appointments dashboard page.
   */
  cancelWizard(): void {
    if (confirm('Are you sure you want to exit the walk-in booking wizard? Unsaved changes will be lost.')) {
      this.router.navigate(['/appointments']);
    }
  }

  /**
   * Submits the Walk-in booking request to the server and handles success.
   */
  confirmBooking(): void {
    const doc = this.selectedDoctor();
    const svc = this.selectedService();
    const date = this.bookingDate();
    const slot = this.selectedSlot();
    if (!doc || !svc || !date || !slot) return;

    // Construct request details
    const request: WalkInRequest = {
      doctorId: doc.id,
      serviceId: svc.id,
      date: date,
      startTime: slot,
      mode: 'InClinic'
    };

    if (this.patientMode() === 'existing') {
      const patient = this.selectedPatient();
      if (!patient) return;
      request.patientId = patient.id;
    } else {
      if (!this.isNewPatientFormValid()) {
        this.toastService.show('Please complete the patient name and phone fields.', 'warning');
        return;
      }
      request.newPatient = {
        name: this.newPatientName().trim(),
        phone: this.newPatientPhone().trim(),
        email: this.newPatientEmail().trim() || undefined
      };
    }

    this.isSubmitting.set(true);
    this.appointmentService.walkIn(request).subscribe({
      next: () => {
        this.toastService.show('Walk-in booking registered successfully.', 'success');
        this.isSubmitting.set(false);
        this.router.navigate(['/appointments']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || err.message || 'Failed to create walk-in booking.';
        this.toastService.show(msg, 'error');
      }
    });
  }
}
