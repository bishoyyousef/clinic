import { Injectable, signal, computed } from '@angular/core';
import { ClinicSettings } from '../models/settings.model';

const SETTINGS_KEY = 'clinic_global_settings';

const DEFAULT_SETTINGS: ClinicSettings = {
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

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSignal = signal<ClinicSettings>(this.loadInitialSettings());

  // Exposed read-only settings state
  settings = this.settingsSignal.asReadonly();

  // Computed properties for easy and direct templates binding
  clinicName = computed(() => this.settings().clinicName);
  defaultConsultationFee = computed(() => this.settings().defaultConsultationFee);
  slotDuration = computed(() => this.settings().slotDuration);
  bufferTime = computed(() => this.settings().bufferTime);
  weekStartDay = computed(() => this.settings().weekStartDay);
  language = computed(() => this.settings().language);

  /**
   * Updates clinic global configurations and stores them in localStorage.
   */
  updateSettings(newSettings: ClinicSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to persist global settings to localStorage', e);
    }
    this.settingsSignal.set(newSettings);
  }

  /**
   * Reads settings from localStorage, falling back to DEFAULT_SETTINGS on failure or absence.
   */
  private loadInitialSettings(): ClinicSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stored settings, falling back to defaults', e);
    }
    return DEFAULT_SETTINGS;
  }
}
