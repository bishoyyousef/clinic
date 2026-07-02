# Clarity Clinic Staff Dashboard — Technical Architecture & Developer Reference

This document serves as a comprehensive developer reference manual for the Clarity Clinic Staff Dashboard frontend. It outlines the architectural foundations, folder structures, communication protocols, authentication sequences, and state management rules governed by the codebase.

---

## 1. Architectural Design Overview

The application is structured as an enterprise-grade Single Page Application (SPA) utilizing **Angular 19+** and modern clean architecture patterns. The core principles applied are:

1.  **Unidirectional Data Flow**: State modifications flow downwards, and actions trigger reactive updates back up through the pipeline.
2.  **Standalone Components**: Complete elimination of legacy `NgModule` bundles to support fine-grained dependencies, lazy-loading, and fast compile speeds.
3.  **Signals-Based Reactivity**: Replaces global change detection (Zone.js cycles) with fine-grained reactive signals tracking, allowing Angular to update only the specific DOM nodes that changed.
4.  **Decoupled Infrastructure**: Business logic, API calls, and local storage configurations are delegated to injectable services, keeping component controllers strictly focused on view binding.

---

## 2. Directory Structure & Organization

```
src/
├── app/
│   ├── core/                  # Core infrastructure (injectable singletons)
│   │   ├── config.ts          # Application constants & global keys
│   │   ├── guards/            # Functional routing protection guards
│   │   │   ├── auth.guard.ts  # Requires session login to access dashboard
│   │   │   └── role.guard.ts  # Role-based route filter (Admin, Receptionist, Doctor)
│   │   ├── interceptors/      # HTTP request/response middleware
│   │   │   ├── auth.interceptor.ts      # Automatic JWT bearer token injection
│   │   │   ├── error.interceptor.ts     # Global error catching & global notifications
│   │   │   └── language.interceptor.ts  # Selected language header sync
│   │   ├── models/            # Domain interfaces and API data types (DTOs)
│   │   └── services/          # Stateless singletons communicating with the API
│   │       ├── settings.service.ts      # Reactive Signals-driven settings & brand sync
│   │       ├── language.service.ts      # Theme direction (RTL/LTR) & locale manager
│   │       ├── auth.service.ts          # Login session state & identity manager
│   │       └── ...                      # Feature-specific services (Appointments, Doctors)
│   │
│   ├── layout/                # Container shell layouts (Sidebar, Header, Main layout)
│   │   ├── shell/             # Main authenticated application shell wrapper
│   │   ├── sidebar/           # Role-filtered reactive navigation drawer
│   │   └── header/            # Navigation breadcrumbs, locale, theme, and profile triggers
│   │
│   ├── shared/                # Global reusable components & utilities
│   │   ├── components/        # Presentational elements (Data-tables, Modals, Buttons)
│   │   └── pipes/             # Reusable formatters (Initials, CurrencyEgp)
│   │
│   └── features/              # Lazy-loaded feature modules (views)
│       ├── dashboard/         # Quick operations metrics overview
│       ├── appointments/      # List and weekly grid schedule calendars
│       ├── settings/          # Operational config panel (hotline, consultations, etc.)
│       └── ...                # Other domain pages (Staff directory, Services, Walk-in)
```

---

## 3. Component & Service Responsibility Matrix

### Core Component Structure
-   **Presentational Components (`shared/`)**: Do not interact with backend services directly. They receive data using `@Input` properties (or Signals) and notify parents of user events via `@Output` event emitters. Examples: `DataTableComponent`, `ButtonComponent`, `ModalComponent`.
-   **View/Feature Components (`features/`)**: Connect business logic to the view. They inject singleton services, handle reactive state triggers, configure forms, and pass structured parameters down to shared templates.

### Core Services
-   **`AuthService`**: Coordinates logins, stores JWT keys, verifies session integrity, and exposes the authenticated user profile as a read-only Signal.
-   **`SettingsService`**: A single source of truth managing clinic-wide rules (clinic brand name, buffer times, slots). Exposes computed Signals to let other components react immediately when settings are saved.
-   **`LanguageService`**: Dictates active locale language (`en` vs. `ar`) and updates HTML attributes (`dir="rtl"` vs. `dir="ltr"`) dynamically without page reload.
-   **`ToastService`**: Triggers success, warning, or error alert banners globally.

---

## 4. Routing & Tab Navigation Flows

Angular routing is controlled inside [app.routes.ts](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/app.routes.ts) using functional route guards.

```
[ Router Path Request ]
          │
          ├── (Unauthenticated) ──> /login
          │
          └── (Authenticated) ──> Shell Layout Shell
                       │
                 [ authGuard ] ── (Blocks anonymous session)
                       │
                 [ roleGuard ] ── (Verifies permission metadata)
                       │
                       ├── /dashboard  (Admin/Receptionist)
                       ├── /staff      (Admin Only)
                       └── /settings   (All Staff)
```

### Dynamic Tab Title Synchronization
Routes declare descriptive title metadata inside the `data` configuration object.
`HeaderComponent` subscribes to router `NavigationEnd` events, traverses the route tree to find the active leaf node's title, and synchronizes the browser tab and page header:
```
[ NavigationEvent ] ──> Resolve Active Title ──> Update pageTitle Signal ──> Sync browser tab: <Clinic Name> • <Page Title>
```

---

## 5. Security & Authentication Infrastructure

Session security uses JSON Web Tokens (JWT) combined with automated interceptors:

```
[ Outgoing Request ] ──> [ authInterceptor ] ──> Append JWT token ──> API Server
                                                                         │
[ Global UI Toast ] <── Show banner ◄── [ errorInterceptor ] <── Catch 4xx/5xx responses
```

1.  **Token Injection**: Outgoing HTTP requests pass through the `authInterceptor`, which clones the request and appends the `Authorization: Bearer <token>` header if a valid session exists.
2.  **Global Failure Interception**: The `errorInterceptor` captures incoming response exceptions.
    -   `401 Unauthorized` triggers an automatic `AuthService.logout()` redirection to `/login` to clear expired keys.
    -   `403 Forbidden`, `500 Server Error`, and validation conflicts translate into user-friendly notices via `ToastService`.

---

## 6. State Management Guidelines

Codebase state utilizes **Angular Signals** for fine-grained reactivity.
-   **Local State**: Tracked using simple signals (e.g. `isLoading = signal(false)`) defined in feature components.
-   **Global State**: Persistent and shared state is located within singleton services (like `SettingsService` or `AuthService`). These services expose read-only state signals (`asReadonly()`), preventing components from bypassing API validation rules or modifying global state directly.
-   **Computed State**: Derivative properties (like `weekDays` or specific setting properties) use `computed()` signals to automatically recalculate values when dependencies change.
