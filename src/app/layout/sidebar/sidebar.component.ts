import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

interface NavItem {
  path: string;
  label: string;
  icon: string; // Will match SVG shapes
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, InitialsPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  authService = inject(AuthService);

  navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      roles: ['Admin', 'Receptionist']
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: 'calendar',
      roles: ['Admin', 'Receptionist']
    },
    {
      path: '/walk-in',
      label: 'Walk-in Booking',
      icon: 'walk-in',
      roles: ['Admin', 'Receptionist']
    },
    {
      path: '/patients',
      label: 'Patients',
      icon: 'patients',
      roles: ['Admin', 'Receptionist']
    },
    {
      path: '/services',
      label: 'Services',
      icon: 'services',
      roles: ['Admin', 'Receptionist']
    },
    {
      path: '/availability',
      label: 'Availability',
      icon: 'availability',
      roles: ['Admin', 'Receptionist']
    },
    {
      path: '/staff',
      label: 'Staff Management',
      icon: 'staff',
      roles: ['Admin']
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: 'reports',
      roles: ['Admin']
    },
    {
      path: '/settings',
      label: 'Clinic Settings',
      icon: 'settings',
      roles: ['Admin', 'Receptionist', 'Doctor']
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: 'profile',
      roles: ['Admin', 'Receptionist', 'Doctor']
    }
  ];

  get filteredNavItems(): NavItem[] {
    const role = this.authService.role();
    return this.navItems.filter(item => role && item.roles.includes(role));
  }

  onLinkClick(): void {
    if (this.mobileOpen) {
      this.closeMobile.emit();
    }
  }
}
