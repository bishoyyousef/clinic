import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ServiceService } from '../../core/services/service.service';
import { DoctorService } from '../../core/services/doctor.service';
import { ToastService } from '../../core/services/toast.service';
import { ServiceDto, CreateServiceRequest, UpdateServiceRequest } from '../../core/models/service.model';
import { DoctorListItemDto } from '../../core/models/doctor.model';
import { TableColumn, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-services',
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
    <div class="services-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Clinic Services</h1>
          <p class="page-subtitle">Manage clinic medical services, durations, pricing, and doctor assignments</p>
        </div>
        <app-button (click)="openCreateModal()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 6px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Service
        </app-button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading() && services().length === 0">
        <app-loading-spinner size="lg"></app-loading-spinner>
        <p class="loading-text">Retrieving clinic services...</p>
      </div>

      <!-- Services Data Table -->
      <div class="table-card" *ngIf="!isLoading() && services().length > 0">
        <app-data-table
          [columns]="columns"
          [data]="services()"
          [customCellTemplate]="customCell">
        </app-data-table>
      </div>

      <!-- Empty State -->
      <div class="empty-directory" *ngIf="services().length === 0 && !isLoading()">
        <app-empty-state
          title="No Services Offered"
          message="No clinic services or treatments have been added to the database yet."
          icon="default"
          actionText="Add First Service"
          (action)="openCreateModal()">
        </app-empty-state>
      </div>

      <!-- Add/Edit Modal -->
      <app-modal
        [isOpen]="isFormOpen()"
        [title]="formMode() === 'create' ? 'Add New Clinic Service' : 'Edit Service Details'"
        [hasFooter]="true"
        size="md"
        (close)="closeFormModal()">
        
        <form [formGroup]="serviceForm" class="modal-form" (ngSubmit)="onSubmit()" id="serviceFormElement">
          <!-- Name -->
          <div class="form-group">
            <label for="name">Service Name <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="serviceForm.get('name')?.touched && serviceForm.get('name')?.invalid">
              <input id="name" type="text" formControlName="name" placeholder="e.g. Dental Consultation, Cardiology Screening" />
            </div>
          </div>

          <div class="form-row">
            <!-- Duration -->
            <div class="form-group">
              <label for="durationMinutes">Duration <span class="required-asterisk">*</span></label>
              <div class="input-wrapper suffix-padding" [class.error]="serviceForm.get('durationMinutes')?.touched && serviceForm.get('durationMinutes')?.invalid">
                <input id="durationMinutes" type="number" formControlName="durationMinutes" placeholder="15" />
                <span class="input-suffix">mins</span>
              </div>
            </div>

            <!-- Price -->
            <div class="form-group">
              <label for="price">Price <span class="required-asterisk">*</span></label>
              <div class="input-wrapper suffix-padding" [class.error]="serviceForm.get('price')?.touched && serviceForm.get('price')?.invalid">
                <input id="price" type="number" formControlName="price" placeholder="500" />
                <span class="input-suffix">EGP</span>
              </div>
            </div>
          </div>

          <!-- Doctor Selection (Only shown on create) -->
          <div class="form-group" *ngIf="formMode() === 'create'">
            <label for="doctorId">Assigned Specialist <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="serviceForm.get('doctorId')?.touched && serviceForm.get('doctorId')?.invalid">
              <select id="doctorId" formControlName="doctorId">
                <option value="" disabled selected>Select a medical specialist...</option>
                <option *ngFor="let doc of doctors()" [value]="doc.id">
                  Dr. {{ doc.displayName }} ({{ doc.specialization }})
                </option>
              </select>
            </div>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (click)="closeFormModal()" [disabled]="isSubmitting()">Cancel</app-button>
          <app-button type="submit" form="serviceFormElement" [loading]="isSubmitting()" [disabled]="serviceForm.invalid || isSubmitting()">
            {{ formMode() === 'create' ? 'Create Service' : 'Save Changes' }}
          </app-button>
        </div>
      </app-modal>
    </div>

    <!-- Custom Table Column Templates -->
    <ng-template #customCell let-row let-column="column">
      <ng-container [ngSwitch]="column.key">
        <!-- Assigned Specialist -->
        <div *ngSwitchCase="'doctorName'">
          <span class="specialist-badge">
            <span class="specialist-avatar">{{ getInitials(row.doctorName || '') }}</span>
            Dr. {{ row.doctorName || 'Unassigned' }}
          </span>
        </div>

        <!-- Duration -->
        <div *ngSwitchCase="'durationMinutes'">
          <span class="duration-pill">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" class="duration-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ row.durationMinutes }} mins
          </span>
        </div>

        <!-- Actions -->
        <div *ngSwitchCase="'actions'" class="actions-cell">
          <app-button variant="text" (click)="openEditModal(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </app-button>
          <app-button variant="text" class="text-danger" (click)="onDeleteService(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
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
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private doctorService = inject(DoctorService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // State Signals
  services = signal<ServiceDto[]>([]);
  doctors = signal<DoctorListItemDto[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Table Columns Definition
  columns: TableColumn[] = [
    { key: 'name', label: 'Service / Treatment', type: 'text' },
    { key: 'doctorName', label: 'Assigned Specialist', type: 'custom' },
    { key: 'durationMinutes', label: 'Duration', type: 'custom' },
    { key: 'price', label: 'Price (EGP)', type: 'currency' },
    { key: 'actions', label: 'Actions', type: 'custom' }
  ];

  // Forms config
  serviceForm!: FormGroup;
  isFormOpen = signal(false);
  formMode = signal<'create' | 'update'>('create');
  editingService: ServiceDto | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required]],
      durationMinutes: ['', [Validators.required, Validators.min(5)]],
      price: ['', [Validators.required, Validators.min(0)]],
      doctorId: ['', [Validators.required]]
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    forkJoin({
      services: this.serviceService.getAll(),
      doctors: this.doctorService.getAll()
    }).subscribe({
      next: (res) => {
        this.services.set(res.services || []);
        this.doctors.set(res.doctors || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve clinic services and specialists.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  openCreateModal(): void {
    this.formMode.set('create');
    this.editingService = null;
    this.serviceForm.get('doctorId')?.setValidators([Validators.required]);
    this.serviceForm.get('doctorId')?.updateValueAndValidity();
    
    this.serviceForm.reset({
      name: '',
      durationMinutes: 15,
      price: '',
      doctorId: ''
    });
    this.isFormOpen.set(true);
  }

  openEditModal(service: ServiceDto): void {
    this.formMode.set('update');
    this.editingService = service;
    this.serviceForm.get('doctorId')?.clearValidators();
    this.serviceForm.get('doctorId')?.updateValueAndValidity();

    this.serviceForm.reset({
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
      doctorId: service.doctorId || ''
    });
    this.isFormOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormOpen.set(false);
    this.editingService = null;
    this.serviceForm.reset();
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const val = this.serviceForm.value;
    this.isSubmitting.set(true);

    if (this.formMode() === 'create') {
      const req: CreateServiceRequest = {
        name: val.name,
        durationMinutes: Number(val.durationMinutes),
        price: Number(val.price),
        doctorId: val.doctorId
      };

      this.serviceService.create(req).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.closeFormModal();
          this.loadData();
          this.toastService.show(`Service "${created.name}" created successfully.`, 'success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Failed to create service.';
          this.toastService.show(msg, 'error');
        }
      });
    } else {
      if (this.editingService) {
        const req: UpdateServiceRequest = {
          name: val.name,
          durationMinutes: Number(val.durationMinutes),
          price: Number(val.price)
        };

        this.serviceService.update(this.editingService.id, req).subscribe({
          next: (updated) => {
            this.isSubmitting.set(false);
            this.closeFormModal();
            this.loadData();
            this.toastService.show(`Service "${updated.name}" updated successfully.`, 'success');
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const msg = err.error?.message || err.message || 'Failed to update service.';
            this.toastService.show(msg, 'error');
          }
        });
      }
    }
  }

  onDeleteService(service: ServiceDto): void {
    if (confirm(`Are you sure you want to delete the service "${service.name}"?`)) {
      this.serviceService.delete(service.id).subscribe({
        next: () => {
          this.loadData();
          this.toastService.show(`Service "${service.name}" deleted successfully.`, 'success');
        },
        error: (err) => {
          const msg = err.error?.message || err.message || 'Failed to delete service.';
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}
