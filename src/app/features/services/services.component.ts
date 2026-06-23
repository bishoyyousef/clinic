import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  template: `
    <div>
      <h2>Clinic Services</h2>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">Placeholder for treatment descriptions, pricing, and durations.</p>
    </div>
  `
})
export class ServicesComponent {}
