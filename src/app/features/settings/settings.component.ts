import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div>
      <h2>Settings & Profile</h2>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">Placeholder for clinic constants and user preferences.</p>
    </div>
  `
})
export class SettingsComponent {}
