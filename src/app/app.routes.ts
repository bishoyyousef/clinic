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
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },
      {
        path: 'patients',
        canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor'])],
        loadComponent: () =>
          import('./features/patients/patients.component').then(
            (m) => m.PatientsComponent
          )
      },
      {
        path: 'doctors',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        loadComponent: () =>
          import('./features/doctors/doctors.component').then(
            (m) => m.DoctorsComponent
          )
      },
      {
        path: 'services',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        loadComponent: () =>
          import('./features/services/services.component').then(
            (m) => m.ServicesComponent
          )
      },
      {
        path: 'appointments',
        canActivate: [roleGuard(['Admin', 'Receptionist'])],
        loadComponent: () =>
          import('./features/appointments/appointments.component').then(
            (m) => m.AppointmentsComponent
          )
      },
      {
        path: 'settings',
        canActivate: [roleGuard(['Admin', 'Receptionist', 'Doctor'])],
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent
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
