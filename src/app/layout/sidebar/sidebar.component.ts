import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string; // Will match SVG shapes
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Output() closeMobile = new EventEmitter<void>();

  // Mocking the user role as 'Admin' by default for UI shell preview
  userRole = 'Admin';

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
      path: '/profile',
      label: 'Profile',
      icon: 'profile',
      roles: ['Admin', 'Receptionist', 'Doctor']
    }
  ];

  get filteredNavItems(): NavItem[] {
    return this.navItems.filter(item => item.roles.includes(this.userRole));
  }

  onLinkClick(): void {
    if (this.mobileOpen) {
      this.closeMobile.emit();
    }
  }
}
