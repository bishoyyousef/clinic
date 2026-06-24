import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UpdateProfileRequest, ChangePasswordRequest } from '../../core/models/auth.model';
import { ButtonComponent } from '../../shared/components/button/button.component';

// Custom password match validator at the FormGroup level
const passwordMatchValidator = (group: FormGroup): { [key: string]: boolean } | null => {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  
  if (!newPassword || !confirmPassword) {
    return null;
  }
  
  if (newPassword !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  
  // If they match, clear errors on confirmPassword if it was a mismatch
  const confirmControl = group.get('confirmPassword');
  if (confirmControl?.hasError('passwordMismatch')) {
    const errors = confirmControl.errors;
    if (errors) {
      delete errors['passwordMismatch'];
      confirmControl.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
  
  return null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  template: `
    <div class="profile-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Profile Settings</h1>
          <p class="page-subtitle">Manage your personal details and account security preferences</p>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Left Column: User Summary Card -->
        <div class="summary-card">
          <div class="avatar-section">
            <div class="avatar-large">{{ getInitials(user()?.name || '') }}</div>
            <h2 class="user-name">{{ user()?.name || 'Loading...' }}</h2>
            <span class="role-badge" [class]="user()?.role?.toLowerCase() || ''">
              {{ user()?.role }}
            </span>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" class="info-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <div class="info-details">
                <span class="info-label">Email Address</span>
                <span class="info-value">{{ user()?.email || '—' }}</span>
              </div>
            </div>
            
            <div class="info-item">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" class="info-icon">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <div class="info-details">
                <span class="info-label">Phone Number</span>
                <span class="info-value">{{ user()?.phone || 'Not provided' }}</span>
              </div>
            </div>

            <div class="info-item">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" class="info-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <div class="info-details">
                <span class="info-label">Portal Status</span>
                <span class="info-value status-active">Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Form Panels -->
        <div class="forms-column">
          <!-- Profile Details Card -->
          <div class="form-card">
            <h3 class="card-title">Personal Details</h3>
            <p class="card-subtitle">Update your public profile name and contact number</p>
            
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="settings-form">
              <div class="form-group">
                <label for="displayName">Full Name <span class="required-asterisk">*</span></label>
                <div class="input-wrapper" [class.error]="profileForm.get('displayName')?.touched && profileForm.get('displayName')?.invalid">
                  <input id="displayName" type="text" formControlName="displayName" placeholder="e.g. Jane Doe" />
                </div>
                <span class="field-error" *ngIf="profileForm.get('displayName')?.touched && profileForm.get('displayName')?.hasError('required')">
                  Name is required.
                </span>
              </div>

              <div class="form-group">
                <label for="phone">Phone Number <span class="required-asterisk">*</span></label>
                <div class="input-wrapper" [class.error]="profileForm.get('phone')?.touched && profileForm.get('phone')?.invalid">
                  <input id="phone" type="text" formControlName="phone" placeholder="e.g. +20 100 123 4567" />
                </div>
                <span class="field-error" *ngIf="profileForm.get('phone')?.touched && profileForm.get('phone')?.invalid">
                  Please enter a valid phone number (6-16 digits/characters).
                </span>
              </div>

              <div class="form-actions">
                <app-button type="submit" [loading]="isUpdatingProfile()" [disabled]="profileForm.invalid || isUpdatingProfile()">
                  Save Changes
                </app-button>
              </div>
            </form>
          </div>

          <!-- Security Password Card -->
          <div class="form-card">
            <h3 class="card-title">Security & Password</h3>
            <p class="card-subtitle">Change your account password. We recommend a secure password of at least 6 characters.</p>
            
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="settings-form">
              <div class="form-group">
                <label for="currentPassword">Current Password <span class="required-asterisk">*</span></label>
                <div class="input-wrapper" [class.error]="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.invalid">
                  <input id="currentPassword" type="password" formControlName="currentPassword" placeholder="••••••••" />
                </div>
                <span class="field-error" *ngIf="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.hasError('required')">
                  Current password is required.
                </span>
              </div>

              <div class="form-group">
                <label for="newPassword">New Password <span class="required-asterisk">*</span></label>
                <div class="input-wrapper" [class.error]="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid">
                  <input id="newPassword" type="password" formControlName="newPassword" placeholder="••••••••" />
                </div>
                <span class="field-error" *ngIf="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.hasError('required')">
                  New password is required.
                </span>
                <span class="field-error" *ngIf="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.hasError('minlength')">
                  New password must be at least 6 characters.
                </span>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm New Password <span class="required-asterisk">*</span></label>
                <div class="input-wrapper" [class.error]="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.invalid">
                  <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="••••••••" />
                </div>
                <span class="field-error" *ngIf="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.hasError('required')">
                  Confirm password is required.
                </span>
                <span class="field-error" *ngIf="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  Passwords do not match.
                </span>
              </div>

              <div class="form-actions">
                <app-button type="submit" [loading]="isChangingPassword()" [disabled]="passwordForm.invalid || isChangingPassword()">
                  Update Password
                </app-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // Expose currentUser signal to template
  user = this.authService.currentUser;

  // Form group states
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Submitting States
  isUpdatingProfile = signal(false);
  isChangingPassword = signal(false);

  // Guard to ensure we patch form only once when user loads
  private hasInitializedFormValues = false;

  constructor() {
    // Reactively populate the form once the user profile loads successfully
    effect(() => {
      const currentUser = this.user();
      if (currentUser && !this.hasInitializedFormValues) {
        this.profileForm.patchValue({
          displayName: currentUser.name,
          phone: currentUser.phone
        });
        this.hasInitializedFormValues = true;
      }
    });
  }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    // Profile details form
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{6,16}$/)]]
    });

    // Password change form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile.set(true);
    const req: UpdateProfileRequest = {
      displayName: this.profileForm.value.displayName,
      phone: this.profileForm.value.phone,
      avatarUrl: this.user()?.avatarUrl || null
    };

    this.authService.updateProfile(req).subscribe({
      next: (updatedUser) => {
        this.isUpdatingProfile.set(false);
        this.toastService.show('Profile details updated successfully.', 'success');
        // Reset pristine state
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        const msg = err.error?.message || err.message || 'Failed to update profile details.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    const req: ChangePasswordRequest = {
      current: this.passwordForm.value.currentPassword,
      new: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(req).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.toastService.show('Password updated successfully.', 'success');
        this.passwordForm.reset();
        // Clear all form controls validations
        Object.keys(this.passwordForm.controls).forEach(key => {
          const control = this.passwordForm.get(key);
          control?.setErrors(null);
          control?.markAsPristine();
          control?.markAsUntouched();
        });
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        const msg = err.error?.message || err.message || 'Failed to update password. Verify current password is correct.';
        this.toastService.show(msg, 'error');
      }
    });
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
