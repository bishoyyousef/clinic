import { Component } from '@angular/core';

@Component({
  selector: 'app-patients',
  standalone: true,
  template: `
    <div>
      <h2>Patients Directory</h2>
      <p style="color: var(--text-muted); margin-top: 0.5rem;">Placeholder for searching, listing, and creating patient records.</p>
    </div>
  `
})
export class PatientsComponent {}
