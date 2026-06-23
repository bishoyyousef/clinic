import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div style="padding: 2rem; max-width: 400px; margin: 5rem auto; text-align: center; border: 1px solid var(--border); border-radius: var(--r); background-color: var(--surface);">
      <h1>Login Page Placeholder</h1>
      <p style="color: var(--text-muted); margin-top: 1rem;">This is a public page outside the shell.</p>
    </div>
  `
})
export class LoginComponent {}
