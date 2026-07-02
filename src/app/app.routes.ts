import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Login Route
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      )
  },

  // Authenticated Layout Shell Routes
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },
      {
        path: 'patients',
        canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor'])],
        data: { title: 'Patients' },
        loadComponent: () =>
          import('./features/patients/patients.component').then(
            (m) => m.PatientsComponent
          )
      },
      {
        path: 'doctors',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Doctors' },
        loadComponent: () =>
          import('./features/doctors/doctors.component').then(
            (m) => m.DoctorsComponent
          )
      },
      {
        path: 'availability',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Availability' },
        loadComponent: () =>
          import('./features/availability/availability.component').then(
            (m) => m.AvailabilityComponent
          )
      },
      {
        path: 'services',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Services' },
        loadComponent: () =>
          import('./features/services/services.component').then(
            (m) => m.ServicesComponent
          )
      },
      {
        path: 'appointments',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Appointments' },
        loadComponent: () =>
          import('./features/appointments/appointments.component').then(
            (m) => m.AppointmentsComponent
          )
      },
      {
        path: 'calendar',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Day calendar' },
        loadComponent: () =>
          import('./features/calendar/calendar.component').then(
            (m) => m.CalendarComponent
          )
      },
      {
        path: 'walk-in',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        data: { title: 'Walk-in' },
        loadComponent: () =>
          import('./features/walk-in/walk-in.component').then(
            (m) => m.WalkInComponent
          )
      },
      {
        path: 'settings',
        canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor'])],
        data: { title: 'Settings' },
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      },
      {
        path: 'staff',
        canActivate: [roleGuard(['Admin'])],
        data: { title: 'Staff' },
        loadComponent: () =>
          import('./features/staff/staff.component').then(
            (m) => m.StaffComponent
          )
      },
      {
        path: 'reports',
        canActivate: [roleGuard(['Admin'])],
        data: { title: 'Reports' },
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent
          )
      },
      {
        path: 'profile',
        canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor'])],
        data: { title: 'Profile' },
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      },
      // Redirect empty path to Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Fallback Catch-All Route
  {
    path: '**',
    redirectTo: 'login'
  }
];
