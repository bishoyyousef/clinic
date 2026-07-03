# Routing & Navigation Guide

This document describes the routing architecture, lazy-loading structures, page title integrations, and navigation configuration of the Clarity Clinic Staff Dashboard.

---

## 1. Routing Architecture

The project routing is defined in [`app.routes.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/app.routes.ts). It splits routes into two main categories:
1. **Public View**: The Login screen (`/login`), which bypasses authentication.
2. **Authenticated Shell**: Protected paths wrapped inside the `ShellComponent` layout.

```
/ (Root)
│
├── /login ──────────────> Public Login Page (No guards)
│
└── / (Protected Shell) ──> ShellComponent (Header + Sidebar Layout)
    │
    ├── /dashboard ──────> Dashboard Summary Widgets
    ├── /calendar ───────> Single-Day Operations Table
    ├── /appointments ───> Paged Bookings Search Directory
    ├── /walk-in ────────> Receptionist Walk-in Wizard
    ├── /patients ───────> Patients Directory
    ├── /doctors ────────> Doctor Staff Directory
    └── /settings ───────> Clinic Configuration Form
```

---

## 2. Lazy Loading Feature Components

To achieve rapid initial load times and smaller polyfill bundles, every feature page is loaded dynamically using Angular's `loadComponent` API:

```typescript
{
  path: 'calendar',
  canActivate: [roleGuard(['Admin', 'Receptionist'])],
  data: { title: 'Day calendar' },
  loadComponent: () =>
    import('./features/calendar/calendar.component').then(
      (m) => m.CalendarComponent
    )
}
```

---

## 3. Dynamic Page Titles

Page titles are configured inside the route's `data` dictionary (e.g. `data: { title: 'Day calendar' }`).
- **Resolution**: An Angular service or router event listener in the root component monitors successful navigation, reads the `title` property from the active route's data object, and updates the browser title.

---

## 4. Navigation Links Management

Sidebar links are declared inside the `sidebar.component.ts` array `navItems`:
- **Structure**:
  ```typescript
  {
    path: '/calendar',
    label: 'Day calendar',
    icon: 'calendar',
    roles: ['Admin', 'Receptionist']
  }
  ```
- **Dynamic Render**: The `SidebarComponent` uses an `AuthService` filter query to only display menu items matching the current user's role, ensuring a clean and authorized workspace.

---

## 5. Developer Onboarding Notes

> [!WARNING]
> **Use Absolute Redirect Paths**: When setting up redirects (e.g., in fallback routes `path: '**'`), always use absolute path targets to avoid nested directory traversal routing loops.
> **Register Component Exports**: When creating a new feature page, make sure the component is declared as `export class MyNewComponent` (not default export), so the lazy import resolver can load it correctly.
