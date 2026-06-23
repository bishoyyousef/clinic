import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  // Mobile drawer open state managed via Signal
  mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.mobileSidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
