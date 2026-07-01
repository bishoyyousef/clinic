import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { StaffDto, CreateDoctorRequest, UpdateStaffRequest } from '../../core/models/admin.model';
import { TableColumn, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DataTableComponent,
    ButtonComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="doctors-container">
      <!-- 1. DOCTOR LIST VIEW -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctors & Specialists</h1>
          <p class="page-subtitle">Manage clinic medical staff profiles, portal access, and clinical schedules</p>
        </div>
        <app-button (click)="openCreateModal()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 6px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Doctor
        </app-button>
      </div>

      <!-- Temporary Credentials Banner (after creating a doctor) -->
      <div class="credentials-banner" *ngIf="tempCredentials()">
        <div class="credentials-header">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="info-icon">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3>Doctor Registered Successfully!</h3>
        </div>
        <p class="credentials-msg">Please copy the temporary login credentials below. The password will not be shown again:</p>
        <div class="credentials-details">
          <div><strong>Login Email:</strong> <code>{{ tempCredentials()?.email }}</code></div>
          <div style="margin-top: var(--s2)"><strong>Temporary Password:</strong> <code class="pwd-code">{{ tempCredentials()?.tempPassword }}</code></div>
        </div>
        <app-button variant="secondary" (click)="clearCredentials()" style="margin-top: var(--s4)">Dismiss</app-button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading() && doctors().length === 0">
        <app-loading-spinner size="lg"></app-loading-spinner>
        <p class="loading-text">Retrieving specialist records...</p>
      </div>

      <!-- Doctors Data Table -->
      <div class="table-card" *ngIf="!isLoading() && doctors().length > 0">
        <app-data-table
          [columns]="columns"
          [data]="doctors()"
          [customCellTemplate]="customCell">
        </app-data-table>
      </div>

      <!-- Empty Directory State -->
      <div class="empty-directory" *ngIf="doctors().length === 0 && !isLoading()">
        <app-empty-state
          title="No Doctors Registered"
          message="No medical specialists have been registered in the clinic database yet."
          icon="default"
          actionText="Register First Doctor"
          (action)="openCreateModal()">
        </app-empty-state>
      </div>

      <!-- 2. DOCTOR CRUD FORM MODAL -->
      <app-modal
        [isOpen]="isFormOpen()"
        [title]="formMode() === 'create' ? 'Add New Medical Specialist' : 'Edit Specialist Profile'"
        [hasFooter]="true"
        size="md"
        (close)="closeFormModal()">
        
        <form [formGroup]="doctorForm" class="modal-form" (ngSubmit)="onSubmit()" id="doctorFormElement">
          <!-- Name -->
          <div class="form-group">
            <label for="name">Doctor Full Name <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="doctorForm.get('name')?.touched && doctorForm.get('name')?.invalid">
              <input id="name" type="text" formControlName="name" placeholder="Dr. Full Name" />
            </div>
          </div>

          <!-- Email (only on create) -->
          <div class="form-group" *ngIf="formMode() === 'create'">
            <label for="email">Clinic Email <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="doctorForm.get('email')?.touched && doctorForm.get('email')?.invalid">
              <input id="email" type="email" formControlName="email" placeholder="doctorname@clinic.com" />
            </div>
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label for="phone">Phone Number <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="doctorForm.get('phone')?.touched && doctorForm.get('phone')?.invalid">
              <input id="phone" type="tel" formControlName="phone" placeholder="e.g. +20 123 456 7890" />
            </div>
          </div>

          <!-- Specialization -->
          <div class="form-group">
            <label for="specialization">Specialization <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="doctorForm.get('specialization')?.touched && doctorForm.get('specialization')?.invalid">
              <input id="specialization" type="text" formControlName="specialization" placeholder="e.g. Cardiology, Pediatrics" />
            </div>
          </div>

          <!-- Bio (Optional) -->
          <div class="form-group">
            <label for="bio">Biography <span class="text-muted">(Optional)</span></label>
            <textarea id="bio" formControlName="bio" placeholder="Brief professional background summary..." class="form-textarea"></textarea>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (click)="closeFormModal()" [disabled]="isSubmitting()">Cancel</app-button>
          <app-button type="submit" form="doctorFormElement" [loading]="isSubmitting()" [disabled]="doctorForm.invalid || isSubmitting()">
            {{ formMode() === 'create' ? 'Register Doctor' : 'Save Changes' }}
          </app-button>
        </div>
      </app-modal>
    </div>

    <!-- Custom Table Column Templates -->
    <ng-template #customCell let-row let-column="column">
      <ng-container [ngSwitch]="column.key">
        <!-- Portal Active / Status Toggle -->
        <div *ngSwitchCase="'isActive'" class="status-toggle-cell">
          <span class="portal-status-chip" [class.active]="row.isActive">
            {{ row.isActive ? 'Active' : 'Suspended' }}
          </span>
          <button class="toggle-action-btn" (click)="toggleDoctorActive(row)" [title]="row.isActive ? 'Suspend access' : 'Activate access'">
            {{ row.isActive ? 'Suspend' : 'Activate' }}
          </button>
        </div>

        <!-- Actions -->
        <div *ngSwitchCase="'actions'" class="actions-cell">
          <app-button variant="text" (click)="onViewDetails(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Schedule
          </app-button>
          <app-button variant="text" (click)="openEditModal(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </app-button>
          <app-button variant="text" class="text-danger" (click)="onDeleteDoctor(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </app-button>
        </div>
      </ng-container>
    </ng-template>
  `,
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // State Signals
  doctors = signal<StaffDto[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Temporary credentials popup storage
  tempCredentials = signal<{ email: string, tempPassword: string } | null>(null);

  // Table Columns Definition
  columns: TableColumn[] = [
    { key: 'name', label: 'Doctor', type: 'avatar' },
    { key: 'specialization', label: 'Specialization', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'isActive', label: 'Portal Access', type: 'custom' },
    { key: 'actions', label: 'Actions', type: 'custom' }
  ];

  // Forms config
  doctorForm!: FormGroup;
  isFormOpen = signal(false);
  formMode = signal<'create' | 'update'>('create');
  editingDoctor: StaffDto | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadDoctors();
  }

  /**
   * Initializes the doctor creation/edit form.
   */
  initForm(): void {
    this.doctorForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{6,16}$/)]],
      specialization: ['', [Validators.required]],
      bio: ['']
    });
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
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve specialists directory.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  /**
   * Navigates to the Availability feature page to view/edit doctor calendar.
   */
  onViewDetails(doctor: StaffDto): void {
    this.router.navigate(['/availability'], { queryParams: { doctorId: doctor.id } });
  }

  /**
   * Toggles the active portal login state of a doctor.
   */
  toggleDoctorActive(doctor: StaffDto): void {
    const newState = !doctor.isActive;
    const actionText = newState ? 'activate' : 'suspend';
    
    if (confirm(`Are you sure you want to ${actionText} portal access for Dr. ${doctor.name}?`)) {
      this.adminService.setActive(doctor.id, { isActive: newState }).subscribe({
        next: () => {
          this.doctors.update(list => 
            list.map(d => d.id === doctor.id ? { ...d, isActive: newState } : d)
          );
          this.toastService.show(`Doctor account ${newState ? 'activated' : 'suspended'}.`, 'success');
        },
        error: (err) => {
          const msg = err.error?.message || err.message || `Failed to change account status.`;
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

  // ==========================================
  // DOCTOR CRUD FORM MODAL ACTIONS
  // ==========================================

  openCreateModal(): void {
    this.formMode.set('create');
    this.editingDoctor = null;
    this.doctorForm.reset({ name: '', email: '', phone: '', specialization: '', bio: '' });
    
    this.doctorForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.doctorForm.get('email')?.updateValueAndValidity();
    
    this.isFormOpen.set(true);
  }

  openEditModal(doctor: StaffDto): void {
    this.formMode.set('update');
    this.editingDoctor = doctor;
    
    this.doctorForm.get('email')?.clearValidators();
    this.doctorForm.get('email')?.updateValueAndValidity();

    this.doctorForm.reset({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization || '',
      bio: ''
    });

    this.isFormOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormOpen.set(false);
    this.editingDoctor = null;
    this.doctorForm.reset();
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const val = this.doctorForm.value;
    this.isSubmitting.set(true);

    if (this.formMode() === 'create') {
      const req: CreateDoctorRequest = {
        name: val.name,
        email: val.email,
        phone: val.phone,
        specialization: val.specialization,
        bio: val.bio || undefined
      };

      this.adminService.addDoctor(req).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.tempCredentials.set({
            email: created.email,
            tempPassword: created.temporaryPassword
          });
          this.closeFormModal();
          this.loadDoctors();
          this.toastService.show(`Dr. ${val.name} added to staff.`, 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Registration failed.';
          this.toastService.show(msg, 'error');
        }
      });
    } else {
      if (this.editingDoctor) {
        const req: UpdateStaffRequest = {
          name: val.name,
          phone: val.phone,
          specialization: val.specialization,
          bio: val.bio || undefined
        };

        this.adminService.updateStaff(this.editingDoctor.id, req).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toastService.show(`Specialist profile saved.`, 'success');
            this.closeFormModal();
            this.loadDoctors();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const msg = err.error?.message || err.message || 'Update failed.';
            this.toastService.show(msg, 'error');
          }
        });
      }
    }
  }

  onDeleteDoctor(doctor: StaffDto): void {
    if (confirm(`Are you sure you want to delete the record for Dr. ${doctor.name}? This will remove them locally.`)) {
      this.doctors.update(list => list.filter(d => d.id !== doctor.id));
      this.toastService.show('Specialist record removed locally.', 'success');
    }
  }

  clearCredentials(): void {
    this.tempCredentials.set(null);
  }
}
