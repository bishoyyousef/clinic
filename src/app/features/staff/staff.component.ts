import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { StaffDto, CreateDoctorRequest, CreateReceptionistRequest } from '../../core/models/admin.model';
import { TableColumn, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DataTableComponent,
    ButtonComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InitialsPipe
  ],
  template: `
    <div class="staff-container">
      <!-- Header Section -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Staff Management</h1>
          <p class="page-subtitle">Manage clinic medical specialists and receptionists portal access</p>
        </div>
        <app-button (click)="openCreateModal()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 6px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Staff Member
        </app-button>
      </div>

      <!-- Temporary Credentials Banner -->
      <div class="cred-banner" *ngIf="tempCredentials()">
        <div class="cred-header">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="info-icon">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3>Staff Registered Successfully!</h3>
        </div>
        <p class="cred-msg">Please copy the temporary login credentials below. The password will not be shown again:</p>
        <div class="cred-details">
          <div><strong>Login Email:</strong> <code>{{ tempCredentials()?.email }}</code></div>
          <div style="margin-top: 8px;"><strong>Temporary Password:</strong> <code class="pwd-code">{{ tempCredentials()?.tempPassword }}</code></div>
        </div>
        <app-button variant="secondary" (click)="clearCredentials()" style="margin-top: 16px;">Dismiss</app-button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading() && staffList().length === 0">
        <app-loading-spinner size="lg"></app-loading-spinner>
        <p class="loading-text">Retrieving clinic staff roster...</p>
      </div>

      <!-- Staff Data Table -->
      <div class="table-card" *ngIf="!isLoading() && staffList().length > 0">
        <app-data-table
          [columns]="columns"
          [data]="staffList()"
          [customCellTemplate]="customCell">
        </app-data-table>
      </div>

      <!-- Empty State -->
      <div class="empty-directory" *ngIf="staffList().length === 0 && !isLoading()">
        <app-empty-state
          title="No Staff Registered"
          message="No clinic doctors or receptionists have been added to the registry yet."
          icon="default"
          actionText="Register First Member"
          (action)="openCreateModal()">
        </app-empty-state>
      </div>

      <!-- Add Staff Modal -->
      <app-modal
        [isOpen]="isFormOpen()"
        title="Register Clinic Staff Member"
        [hasFooter]="true"
        size="md"
        (close)="closeFormModal()">
        
        <form [formGroup]="staffForm" class="modal-form" (ngSubmit)="onSubmit()" id="staffFormElement">
          <!-- Role Selection -->
          <div class="form-group">
            <label>Staff Role <span class="required-asterisk">*</span></label>
            <div class="role-selector-grid">
              <label class="role-option" [class.selected]="staffForm.get('role')?.value === 'Doctor'">
                <input type="radio" formControlName="role" value="Doctor" />
                <span>Doctor / Specialist</span>
              </label>
              <label class="role-option" [class.selected]="staffForm.get('role')?.value === 'Receptionist'">
                <input type="radio" formControlName="role" value="Receptionist" />
                <span>Receptionist</span>
              </label>
            </div>
          </div>

          <!-- Name -->
          <div class="form-group">
            <label for="name">Full Name <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="staffForm.get('name')?.touched && staffForm.get('name')?.invalid">
              <input id="name" type="text" formControlName="name" placeholder="e.g. Jane Doe" />
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Clinic Email <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="staffForm.get('email')?.touched && staffForm.get('email')?.invalid">
              <input id="email" type="email" formControlName="email" placeholder="e.g. janedoe@clinic.com" />
            </div>
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label for="phone">Phone Number <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="staffForm.get('phone')?.touched && staffForm.get('phone')?.invalid">
              <input id="phone" type="text" formControlName="phone" placeholder="e.g. +20 100 123 4567" />
            </div>
          </div>

          <!-- Doctor Specific Fields -->
          <ng-container *ngIf="staffForm.get('role')?.value === 'Doctor'">
            <!-- Specialization -->
            <div class="form-group">
              <label for="specialization">Medical Specialization <span class="required-asterisk">*</span></label>
              <div class="input-wrapper" [class.error]="staffForm.get('specialization')?.touched && staffForm.get('specialization')?.invalid">
                <input id="specialization" type="text" formControlName="specialization" placeholder="e.g. Cardiology, Pediatrics" />
              </div>
            </div>

            <!-- Bio -->
            <div class="form-group">
              <label for="bio">Biography <span class="text-muted">(Optional)</span></label>
              <textarea id="bio" formControlName="bio" placeholder="Brief professional profile summary..." class="form-textarea"></textarea>
            </div>
          </ng-container>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (click)="closeFormModal()" [disabled]="isSubmitting()">Cancel</app-button>
          <app-button type="submit" form="staffFormElement" [loading]="isSubmitting()" [disabled]="staffForm.invalid || isSubmitting()">
            Register Account
          </app-button>
        </div>
      </app-modal>
    </div>

    <!-- Custom Table Column Templates -->
    <ng-template #customCell let-row let-column="column">
      <ng-container [ngSwitch]="column.key">
        <!-- Name (Avatar representation) -->
        <div *ngSwitchCase="'name'" class="staff-avatar-cell">
          <div class="staff-avatar-circle">{{ row.name | initials }}</div>
          <div class="staff-name-details">
            <span class="staff-name-text">{{ row.name }}</span>
            <span class="staff-spec-text" *ngIf="row.role === 'Doctor'">{{ row.specialization }}</span>
          </div>
        </div>

        <!-- Role Badge -->
        <div *ngSwitchCase="'role'">
          <span class="role-badge" [class.doctor]="row.role === 'Doctor'" [class.receptionist]="row.role === 'Receptionist'">
            {{ row.role }}
          </span>
        </div>

        <!-- Account Status Toggle -->
        <div *ngSwitchCase="'isActive'" class="status-toggle-cell">
          <span class="portal-status-chip" [class.active]="row.isActive">
            {{ row.isActive ? 'Active' : 'Suspended' }}
          </span>
          <button class="toggle-action-btn" (click)="toggleActive(row)" [title]="row.isActive ? 'Suspend access' : 'Activate access'">
            {{ row.isActive ? 'Suspend' : 'Activate' }}
          </button>
        </div>
      </ng-container>
    </ng-template>
  `,
  styleUrl: './staff.component.css'
})
export class StaffComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // State Signals
  staffList = signal<StaffDto[]>([]);
  isLoading = signal(true);
  isFormOpen = signal(false);
  isSubmitting = signal(false);
  tempCredentials = signal<{ email: string, tempPassword: string } | null>(null);

  // Table Columns
  columns: TableColumn[] = [
    { key: 'name', label: 'Staff Member', type: 'custom' },
    { key: 'role', label: 'Role', type: 'custom' },
    { key: 'email', label: 'Email Address', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'isActive', label: 'Portal Status', type: 'custom' }
  ];

  staffForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadStaff();
  }

  initForm(): void {
    this.staffForm = this.fb.group({
      role: ['Doctor', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{6,16}$/)]],
      specialization: ['', [Validators.required]],
      bio: ['']
    });

    // Listen to role changes to adjust validators dynamically
    this.staffForm.get('role')?.valueChanges.subscribe(role => {
      const specControl = this.staffForm.get('specialization');
      if (role === 'Doctor') {
        specControl?.setValidators([Validators.required]);
      } else {
        specControl?.clearValidators();
      }
      specControl?.updateValueAndValidity();
    });
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.adminService.getStaff().subscribe({
      next: (data) => {
        this.staffList.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve staff roster.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  openCreateModal(): void {
    this.staffForm.reset({
      role: 'Doctor',
      name: '',
      email: '',
      phone: '',
      specialization: '',
      bio: ''
    });
    this.isFormOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormOpen.set(false);
    this.staffForm.reset();
  }

  clearCredentials(): void {
    this.tempCredentials.set(null);
  }

  toggleActive(staff: StaffDto): void {
    const newState = !staff.isActive;
    const actionText = newState ? 'activate' : 'suspend';
    
    if (confirm(`Are you sure you want to ${actionText} access for ${staff.name}?`)) {
      this.adminService.setActive(staff.id, { isActive: newState }).subscribe({
        next: () => {
          this.staffList.update(list => 
            list.map(s => s.id === staff.id ? { ...s, isActive: newState } : s)
          );
          this.toastService.show(`Staff account access ${newState ? 'activated' : 'suspended'} successfully.`, 'success');
        },
        error: (err) => {
          const msg = err.error?.message || err.message || 'Failed to update account access status.';
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const val = this.staffForm.value;
    this.isSubmitting.set(true);

    if (val.role === 'Doctor') {
      const req: CreateDoctorRequest = {
        name: val.name,
        email: val.email,
        phone: val.phone,
        specialization: val.specialization,
        bio: val.bio || undefined
      };

      this.adminService.addDoctor(req).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.tempCredentials.set({
            email: res.email,
            tempPassword: res.temporaryPassword
          });
          this.closeFormModal();
          this.loadStaff();
          this.toastService.show(`Dr. ${val.name} registered successfully.`, 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Registration failed.';
          this.toastService.show(msg, 'error');
        }
      });
    } else {
      const req: CreateReceptionistRequest = {
        name: val.name,
        email: val.email,
        phone: val.phone
      };

      this.adminService.addReceptionist(req).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.tempCredentials.set({
            email: res.email,
            tempPassword: res.temporaryPassword
          });
          this.closeFormModal();
          this.loadStaff();
          this.toastService.show(`Receptionist ${val.name} registered successfully.`, 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Registration failed.';
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

}
