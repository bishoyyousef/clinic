import { Injectable, signal, effect } from '@angular/core';
import { THEME_KEY } from '../config';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<ThemeMode>(this.getInitialTheme());
  
  // Read-only signal exposed to components
  theme = this.themeSignal.asReadonly();

  constructor() {
    // Automatically apply theme changes to <html> and localStorage
    effect(() => {
      const currentTheme = this.themeSignal();
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem(THEME_KEY, currentTheme);
    });
  }

  toggleTheme(): void {
    this.themeSignal.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode): void {
    this.themeSignal.set(theme);
  }

  private getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Fallback to system preference if no choice is saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
