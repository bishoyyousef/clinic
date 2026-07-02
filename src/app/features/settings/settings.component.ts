import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { SettingsService } from '../../core/services/settings.service';
import { LanguageService } from '../../core/services/language.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

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
  private settingsService = inject(SettingsService);
  private languageService = inject(LanguageService);

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
   * Loads configurations from the reactive settings service.
   */
  loadSettings(): void {
    const current = this.settingsService.settings();
    this.settingsForm.patchValue(current);
  }

  /**
   * Saves settings to the SettingsService.
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
        const formValue = this.settingsForm.value;
        this.settingsService.updateSettings(formValue);
        
        // Immediately sync selected language with LanguageService if it changed
        const currentLang = formValue.language;
        if (currentLang === 'en' || currentLang === 'ar') {
          this.languageService.setLanguage(currentLang);
        }
        
        this.toastService.show('Clinic configuration settings updated successfully.', 'success');
      } catch (err) {
        this.toastService.show('Failed to save clinic settings.', 'error');
      } finally {
        this.isSubmitting.set(false);
      }
    }, 600);
  }
}

