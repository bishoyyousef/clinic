import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent {
  // Layout View Control
  activeView = signal<'calendar' | 'list'>('calendar');

  /**
   * Switches between Calendar and List views.
   * @param view Target view type
   */
  setView(view: 'calendar' | 'list'): void {
    this.activeView.set(view);
  }
}
