import { Injectable, signal, effect, computed } from '@angular/core';
import { LANG_KEY } from '../config';

export type LanguageCode = 'en' | 'ar';
export type LayoutDirection = 'ltr' | 'rtl';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private langSignal = signal<LanguageCode>(this.getInitialLanguage());

  // Exposed read-only signal for language
  currentLang = this.langSignal.asReadonly();
  
  // Computed signals for direction and RTL check
  isRtl = computed(() => this.langSignal() === 'ar');
  direction = computed<LayoutDirection>(() => this.langSignal() === 'ar' ? 'rtl' : 'ltr');

  constructor() {
    // Automatically apply language and direction modifications to the html element
    effect(() => {
      const lang = this.langSignal();
      const dir = this.direction();
      
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', dir);
      localStorage.setItem(LANG_KEY, lang);
    });
  }

  toggleLanguage(): void {
    this.langSignal.update(current => current === 'en' ? 'ar' : 'en');
  }

  setLanguage(lang: LanguageCode): void {
    this.langSignal.set(lang);
  }

  private getInitialLanguage(): LanguageCode {
    const saved = localStorage.getItem(LANG_KEY) as LanguageCode | null;
    if (saved === 'en' || saved === 'ar') {
      return saved;
    }
    return 'en'; // English is the default language
  }
}
