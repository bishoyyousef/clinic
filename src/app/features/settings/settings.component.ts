import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

const DEFAULT_SETTINGS = {
  clinicName: 'Clarity Clinic',
  supportEmail: 'support@clarityclinic.com',
  hotline: '19999',
  address: '15 El-Nasr St, Maadi, Cairo, Egypt',
  defaultConsultationFee: 450,
  bufferTime: '10',
  slotDuration: '30',
  enableSmsReminders: true,
  enableEmailReceipts: true,
  enableAutoCancel: false,
  language: 'en',
  weekStartDay: '0' // Sunday
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  settingsForm!: FormGroup;
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  /**
   * Initializes the settings form group with validations.
   */
  initForm(): void {
    this.settingsForm = this.fb.group({
      clinicName: ['', [Validators.required]],
      supportEmail: ['', [Validators.required, Validators.email]],
      hotline: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{3,16}$/)]],
      address: ['', [Validators.required]],
      defaultConsultationFee: [450, [Validators.required, Validators.min(0)]],
      bufferTime: ['10', [Validators.required]],
      slotDuration: ['30', [Validators.required]],
      enableSmsReminders: [true],
      enableEmailReceipts: [true],
      enableAutoCancel: [false],
      language: ['en', [Validators.required]],
      weekStartDay: ['0', [Validators.required]]
    });
  }

  /**
   * Loads configurations from localStorage, falling back to DEFAULT_SETTINGS.
   */
  loadSettings(): void {
    try {
      const stored = localStorage.getItem('clinic_global_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settingsForm.patchValue({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        this.settingsForm.patchValue(DEFAULT_SETTINGS);
      }
    } catch (e) {
      this.settingsForm.patchValue(DEFAULT_SETTINGS);
    }
  }

  /**
   * Saves settings to localStorage.
   */
  onSave(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate database write delay for premium feedback
    setTimeout(() => {
      try {
        localStorage.setItem('clinic_global_settings', JSON.stringify(this.settingsForm.value));
        this.toastService.show('Clinic configuration settings updated successfully.', 'success');
      } catch (err) {
        this.toastService.show('Failed to save settings to local storage.', 'error');
      } finally {
        this.isSubmitting.set(false);
      }
    }, 600);
  }
}
