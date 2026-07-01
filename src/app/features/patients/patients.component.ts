import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { ToastService } from '../../core/services/toast.service';
import { PatientDto, NewPatientInput, PatientHistoryItemDto } from '../../core/models/patient.model';
import { TableColumn, DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchInputComponent,
    DataTableComponent,
    PaginationComponent,
    ButtonComponent,
    ModalComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InitialsPipe
  ],
  template: `
    <div class="patients-container">
      <!-- ========================================== -->
      <!-- 1. PATIENT LIST VIEW                      -->
      <!-- ========================================== -->
      <ng-container *ngIf="activeView() === 'list'">
        <div class="page-header">
          <div>
            <h1 class="page-title">Patients Directory</h1>
            <p class="page-subtitle">Search, manage, and view clinical history files of clinic patients</p>
          </div>
          <app-button (click)="openCreateModal()">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 6px;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Register Patient
          </app-button>
        </div>

        <!-- Search Toolbar -->
        <div class="toolbar-section">
          <app-search-input 
            placeholder="Search by name or phone..."
            (search)="onSearch($event)">
          </app-search-input>
        </div>

        <!-- Error Alert Banner -->
        <div class="error-banner" *ngIf="error()">
          <div class="error-content">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ error() }}</span>
          </div>
          <app-button variant="secondary" (click)="loadPatients()">Retry</app-button>
        </div>

        <!-- Loading State Spinner -->
        <div class="loading-state" *ngIf="isLoading() && patients().length === 0">
          <app-loading-spinner size="lg"></app-loading-spinner>
          <p class="loading-text">Retrieving patient directory...</p>
        </div>

        <!-- Table Container -->
        <div class="table-card" *ngIf="!error() && (patients().length > 0 || !isLoading())">
          <app-data-table
            [columns]="columns"
            [data]="paginatedData"
            [customCellTemplate]="customCell">
          </app-data-table>

          <app-pagination
            [page]="page()"
            [pageSize]="pageSize()"
            [total]="patients().length"
            (pageChange)="onPageChange($event)">
          </app-pagination>
        </div>

        <!-- Empty Directory State -->
        <div class="empty-directory" *ngIf="patients().length === 0 && !isLoading() && !error()">
          <app-empty-state
            title="No Patients Registered"
            message="No patient records match the current search criteria or directory is empty."
            icon="search"
            actionText="Register First Patient"
            (action)="openCreateModal()">
          </app-empty-state>
        </div>
      </ng-container>

      <!-- ========================================== -->
      <!-- 2. PATIENT DETAILS / HISTORY CLINIC VIEW   -->
      <!-- ========================================== -->
      <ng-container *ngIf="activeView() === 'details'">
        <!-- Detail Header with Back Button -->
        <div class="detail-header">
          <app-button variant="secondary" (click)="closeDetails()">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right: 6px;">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Directory
          </app-button>
          
          <div class="patient-summary-banner">
            <div class="patient-avatar">
              {{ selectedPatient()?.name | initials }}
            </div>
            <div class="patient-meta">
              <h2 class="patient-name">{{ selectedPatient()?.name }}</h2>
              <p class="patient-contact">
                <span><strong>Phone:</strong> {{ selectedPatient()?.phone }}</span>
                <span class="meta-divider">•</span>
                <span><strong>Email:</strong> {{ selectedPatient()?.email || 'N/A' }}</span>
              </p>
            </div>
            <div class="portal-badge">
              <span class="portal-status" [class.active]="selectedPatient()?.hasLogin">
                {{ selectedPatient()?.hasLogin ? 'Portal Access Enabled' : 'No Online Account' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Timeline Section -->
        <div class="timeline-section">
          <h3 class="timeline-title">Clinical Medical History</h3>
          
          <!-- History Loading -->
          <div class="timeline-loading" *ngIf="isHistoryLoading()">
            <app-loading-spinner size="md"></app-loading-spinner>
            <p>Loading medical timeline...</p>
          </div>

          <!-- History Empty State -->
          <app-empty-state
            *ngIf="!isHistoryLoading() && patientHistory().length === 0"
            title="No Medical History Found"
            message="This patient has no recorded consultations, diagnoses, or prescriptions in the clinic archives."
            icon="calendar">
          </app-empty-state>

          <!-- Vertical Timeline Layout -->
          <div class="timeline" *ngIf="!isHistoryLoading() && patientHistory().length > 0">
            <div class="timeline-item" *ngFor="let item of patientHistory()">
              <!-- Timeline node -->
              <div class="timeline-node">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              
              <!-- Timeline Card -->
              <div class="timeline-card">
                <div class="card-meta">
                  <span class="consult-date">{{ item.date | date:'longDate' }}</span>
                  <span class="meta-divider">•</span>
                  <span class="consult-doctor">Dr. {{ item.doctorName }}</span>
                  <span class="meta-divider">•</span>
                  <span class="consult-service">{{ item.serviceName }}</span>
                </div>

                <!-- Visit/Clinical Details -->
                <div class="card-content" *ngIf="item.visit; else noVisitDetails">
                  <div class="diagnosis-block">
                    <span class="field-label">Diagnosis:</span>
                    <span class="diagnosis-badge">{{ item.visit.diagnosis }}</span>
                  </div>
                  
                  <div class="notes-block" *ngIf="item.visit.notes">
                    <span class="field-label">Clinical Notes:</span>
                    <p class="clinical-notes">"{{ item.visit.notes }}"</p>
                  </div>

                  <!-- Prescriptions list -->
                  <div class="prescription-block" *ngIf="item.visit.prescription && item.visit.prescription.length > 0">
                    <span class="field-label">Prescribed Medications:</span>
                    <div class="prescription-grid">
                      <div class="prescription-pill" *ngFor="let rx of item.visit.prescription">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" class="pill-icon">
                          <path d="M4.5 16.5c-1.5-1.5-2.5-3.5-2.5-6s1-4.5 2.5-6 3.5-2.5 6-2.5 4.5 1 6 2.5 2.5 3.5 2.5 6-1 4.5-2.5 6-3.5 2.5-6 2.5-4.5-1-6-2.5z"></path>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span class="drug-name">{{ rx.drug }}</span>
                        <span class="drug-meta">({{ rx.dosage }} • {{ rx.duration }})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No consultation log fallback -->
                <ng-template #noVisitDetails>
                  <div class="no-visit-details">
                    <p>Appointment scheduled, but no clinical consultation records were filed by the attending doctor.</p>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ========================================== -->
      <!-- 3. PATIENT FORM MODAL (CREATE / UPDATE)   -->
      <!-- ========================================== -->
      <app-modal
        [isOpen]="isFormOpen()"
        [title]="formMode() === 'create' ? 'Register New Patient' : 'Edit Patient Profile'"
        [hasFooter]="true"
        size="md"
        (close)="closeFormModal()">
        
        <form [formGroup]="patientForm" class="modal-form" (ngSubmit)="onSubmit()" id="patientFormElement">
          <!-- Name Field -->
          <div class="form-group">
            <label for="name">Full Name <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="patientForm.get('name')?.touched && patientForm.get('name')?.invalid">
              <input 
                id="name" 
                type="text" 
                formControlName="name" 
                placeholder="Enter full name"
                autocomplete="name"
              />
            </div>
            <div class="validation-message" *ngIf="patientForm.get('name')?.touched && patientForm.get('name')?.invalid">
              Name is required.
            </div>
          </div>

          <!-- Phone Field -->
          <div class="form-group">
            <label for="phone">Phone Number <span class="required-asterisk">*</span></label>
            <div class="input-wrapper" [class.error]="patientForm.get('phone')?.touched && patientForm.get('phone')?.invalid">
              <input 
                id="phone" 
                type="text" 
                formControlName="phone" 
                placeholder="e.g. +20 100 123 4567"
                autocomplete="tel"
              />
            </div>
            <div class="validation-message" *ngIf="patientForm.get('phone')?.touched && patientForm.get('phone')?.invalid">
              Please enter a valid phone number.
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email Address <span class="text-muted">(Optional)</span></label>
            <div class="input-wrapper" [class.error]="patientForm.get('email')?.touched && patientForm.get('email')?.invalid">
              <input 
                id="email" 
                type="email" 
                formControlName="email" 
                placeholder="patient@email.com"
                autocomplete="email"
              />
            </div>
            <div class="validation-message" *ngIf="patientForm.get('email')?.touched && patientForm.get('email')?.invalid">
              Please enter a valid email address.
            </div>
          </div>
        </form>

        <!-- Modal Footer Actions -->
        <div modal-footer>
          <app-button variant="secondary" (click)="closeFormModal()" [disabled]="isSubmitting()">Cancel</app-button>
          <app-button 
            type="submit" 
            form="patientFormElement" 
            [loading]="isSubmitting()"
            [disabled]="patientForm.invalid || isSubmitting()"
          >
            {{ formMode() === 'create' ? 'Register Patient' : 'Save Changes' }}
          </app-button>
        </div>
      </app-modal>
    </div>

    <!-- Custom Data Table Cells -->
    <ng-template #customCell let-row let-column="column">
      <ng-container [ngSwitch]="column.key">
        <!-- Portal Access Badge -->
        <span *ngSwitchCase="'hasLogin'" class="portal-status-chip" [class.active]="row.hasLogin">
          {{ row.hasLogin ? 'Enabled' : 'No Access' }}
        </span>

        <!-- Row Actions -->
        <div *ngSwitchCase="'actions'" class="actions-cell">
          <app-button variant="text" (click)="onViewDetails(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            History
          </app-button>
          <app-button variant="text" (click)="openEditModal(row)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </app-button>
          <app-button variant="text" class="text-danger" (click)="onDeletePatient(row)">
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
  styles: [`
    .patients-container {
      display: flex;
      flex-direction: column;
      gap: var(--s6);
      animation: fadeIn var(--dur-lg) var(--ease);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--s4);
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .toolbar-section {
      width: 100%;
      max-width: 320px;
    }
    .error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--danger-soft);
      color: var(--danger);
      border: 1px solid var(--danger);
      border-radius: var(--r);
      padding: var(--s4) var(--s6);
      gap: var(--s4);
    }
    .error-content {
      display: flex;
      align-items: center;
      gap: var(--s3);
      font-size: 0.875rem;
      font-weight: 500;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--s12) 0;
      gap: var(--s4);
    }
    .loading-text {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .table-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .portal-status-chip {
      display: inline-flex;
      align-items: center;
      padding: var(--s1) var(--s2.5);
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--r-full);
      background-color: var(--surface-2);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .portal-status-chip.active {
      background-color: var(--success-soft);
      color: var(--success);
      border-color: transparent;
    }
    .actions-cell {
      display: flex;
      align-items: center;
      gap: var(--s2);
    }
    .text-danger {
      color: var(--danger) !important;
    }
    .text-danger:hover {
      background-color: var(--danger-soft) !important;
    }

    /* Details View Styling */
    .detail-header {
      display: flex;
      flex-direction: column;
      gap: var(--s5);
      align-items: flex-start;
    }
    .patient-summary-banner {
      display: flex;
      align-items: center;
      width: 100%;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: var(--s6);
      gap: var(--s5);
      flex-wrap: wrap;
    }
    .patient-avatar {
      width: 56px;
      height: 56px;
      background-color: var(--accent-soft);
      color: var(--accent);
      border-radius: var(--r-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .patient-meta {
      flex: 1;
      min-width: 200px;
    }
    .patient-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
    }
    .patient-contact {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: var(--s1);
      display: flex;
      flex-wrap: wrap;
      gap: var(--s2);
      align-items: center;
    }
    .meta-divider {
      color: var(--border);
      font-weight: bold;
    }
    .portal-status {
      font-size: 0.75rem;
      font-weight: 600;
      padding: var(--s1) var(--s3);
      border-radius: var(--r-full);
      background-color: var(--surface-2);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .portal-status.active {
      background-color: var(--success-soft);
      color: var(--success);
      border-color: transparent;
    }

    /* Timeline Styling */
    .timeline-section {
      display: flex;
      flex-direction: column;
      gap: var(--s5);
      margin-top: var(--s4);
    }
    .timeline-title {
      font-size: 1.125rem;
      font-weight: 650;
      color: var(--text);
    }
    .timeline-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--s10) 0;
      gap: var(--s3);
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .timeline {
      position: relative;
      padding-left: 24px;
      margin-left: 12px;
      border-left: 2px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--s8);
    }
    .timeline-item {
      position: relative;
    }
    .timeline-node {
      position: absolute;
      left: -33px;
      top: 4px;
      width: 20px;
      height: 20px;
      border-radius: var(--r-full);
      background-color: var(--surface);
      border: 2px solid var(--accent);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .timeline-node svg {
      width: 10px;
      height: 10px;
    }
    .timeline-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: var(--s5);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: var(--s3);
      transition: transform var(--dur) var(--ease);
    }
    .timeline-card:hover {
      transform: translateX(4px);
    }
    .card-meta {
      font-size: 0.8125rem;
      color: var(--text-muted);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--s2);
    }
    .consult-date {
      font-weight: 600;
      color: var(--text);
    }
    .consult-doctor {
      color: var(--accent);
      font-weight: 500;
    }
    .card-content {
      display: flex;
      flex-direction: column;
      gap: var(--s4);
      border-top: 1px solid var(--border);
      padding-top: var(--s3);
    }
    .field-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: var(--s1);
    }
    .diagnosis-badge {
      display: inline-block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      background-color: var(--surface-2);
      padding: var(--s1) var(--s3);
      border-radius: var(--r-sm);
      border: 1px solid var(--border);
    }
    .clinical-notes {
      font-size: 0.875rem;
      color: var(--text);
      line-height: 1.5;
      font-style: italic;
    }
    .prescription-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s2);
    }
    .prescription-pill {
      display: inline-flex;
      align-items: center;
      gap: var(--s1.5);
      padding: var(--s1.5) var(--s3);
      border-radius: var(--r-full);
      background-color: var(--accent-soft);
      color: var(--accent);
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .pill-icon {
      flex-shrink: 0;
    }
    .drug-name {
      font-weight: 600;
    }
    .drug-meta {
      opacity: 0.8;
      font-size: 0.75rem;
    }
    .no-visit-details {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Form Design */
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: var(--s4);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--s1.5);
    }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
    }
    .required-asterisk {
      color: var(--danger);
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .input-wrapper input {
      width: 100%;
      height: 38px;
      padding: 0 var(--s3);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      font-size: 0.875rem;
      background-color: var(--bg);
      color: var(--text);
      transition: all var(--dur) var(--ease);
    }
    .input-wrapper input:focus {
      border-color: var(--accent);
      outline: none;
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .input-wrapper.error input {
      border-color: var(--danger);
    }
    .input-wrapper.error input:focus {
      box-shadow: 0 0 0 3px var(--danger-soft);
    }
    .validation-message {
      font-size: 0.75rem;
      color: var(--danger);
      font-weight: 500;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // Router-style views
  activeView = signal<'list' | 'details'>('list');
  
  // Dynamic signals for state management
  patients = signal<PatientDto[]>([]);
  selectedPatient = signal<PatientDto | null>(null);
  patientHistory = signal<PatientHistoryItemDto[]>([]);
  
  isLoading = signal(true);
  isHistoryLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  // Table Columns Definition
  columns: TableColumn[] = [
    { key: 'name', label: 'Patient', type: 'avatar' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'hasLogin', label: 'Portal Access', type: 'custom' },
    { key: 'actions', label: 'Actions', type: 'custom' }
  ];

  // Forms configuration
  patientForm!: FormGroup;
  isFormOpen = signal(false);
  formMode = signal<'create' | 'update'>('create');
  editingPatient: PatientDto | null = null;

  // Search & Pagination State
  searchTerm = signal('');
  page = signal(1);
  pageSize = signal(5);

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();
  }

  /**
   * Initializes the patient registration reactive form.
   */
  initForm(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{6,16}$/)]],
      email: ['', [Validators.email]]
    });
  }

  /**
   * Fetches patients from the live PatientService API.
   */
  loadPatients(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.patientService.search(this.searchTerm()).subscribe({
      next: (data) => {
        this.patients.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to retrieve patient records. Please try again.';
        this.error.set(msg);
      }
    });
  }

  /**
   * Evaluates and slices the patient list for client-side pagination.
   */
  get paginatedData(): PatientDto[] {
    const data = this.patients();
    const start = (this.page() - 1) * this.pageSize();
    return data.slice(start, start + this.pageSize());
  }

  // ==========================================
  // VIEW SWITCHING / DETAILS ACTIONS
  // ==========================================

  /**
   * Switches view to show a patient's medical and history timeline.
   */
  onViewDetails(patient: PatientDto): void {
    this.selectedPatient.set(patient);
    this.activeView.set('details');
    this.isHistoryLoading.set(true);
    this.patientHistory.set([]);

    this.patientService.getHistory(patient.id).subscribe({
      next: (history) => {
        this.patientHistory.set(history || []);
        this.isHistoryLoading.set(false);
      },
      error: (err) => {
        this.isHistoryLoading.set(false);
        const msg = err.error?.message || err.message || 'Failed to fetch medical history.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  closeDetails(): void {
    this.activeView.set('list');
    this.selectedPatient.set(null);
    this.patientHistory.set([]);
  }

  // ==========================================
  // FORM / MODAL ACTIONS
  // ==========================================

  openCreateModal(): void {
    this.formMode.set('create');
    this.editingPatient = null;
    this.patientForm.reset({ name: '', phone: '', email: '' });
    this.isFormOpen.set(true);
  }

  openEditModal(patient: PatientDto): void {
    this.formMode.set('update');
    this.editingPatient = patient;
    this.patientForm.reset({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || ''
    });
    this.isFormOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormOpen.set(false);
    this.editingPatient = null;
    this.patientForm.reset();
  }

  /**
   * Handles patient registration or edit submission.
   */
  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const formVal = this.patientForm.value;
    this.isSubmitting.set(true);

    if (this.formMode() === 'create') {
      // Execute REAL POST API call
      const input: NewPatientInput = {
        name: formVal.name,
        phone: formVal.phone,
        email: formVal.email || undefined
      };

      this.patientService.create(input).subscribe({
        next: (created) => {
          this.isSubmitting.set(false);
          this.toastService.show(`Patient "${created.name}" registered successfully.`, 'success');
          this.closeFormModal();
          this.loadPatients(); // Reload list from API
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Registration failed.';
          this.toastService.show(msg, 'error');
        }
      });
    } else {
      // MOCK UPDATE: Backend does not expose a PUT endpoint for patients.
      // Update in-memory local state to simulate success.
      if (this.editingPatient) {
        const targetId = this.editingPatient.id;
        this.patients.update(list => 
          list.map(p => p.id === targetId ? { ...p, name: formVal.name, phone: formVal.phone, email: formVal.email } : p)
        );
        this.isSubmitting.set(false);
        this.toastService.show('Patient profile updated locally.', 'success');
        this.closeFormModal();
      }
    }
  }

  /**
   * MOCK DELETE: Backend does not expose a DELETE endpoint for patients.
   * Prompts and updates local state.
   */
  onDeletePatient(patient: PatientDto): void {
    if (confirm(`Are you sure you want to delete patient record "${patient.name}"?`)) {
      this.patients.update(list => list.filter(p => p.id !== patient.id));
      this.toastService.show('Patient record deleted locally.', 'success');
      this.page.set(1);
    }
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.page.set(1);
    this.loadPatients(); // Execute real query reload
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
  }

  // ==========================================
  // UTILITY HELPERS
  // ==========================================

}
