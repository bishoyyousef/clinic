import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div>
      <h2>Dashboard Overview</h2>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">Placeholder for today's clinic metrics and charts.</p>
    </div>
  `
})
export class DashboardComponent {}
