# Clarity Clinic — Staff Dashboard: Focused Implementation Plan

> My scope: Build the Angular staff dashboard UI and integrate with the existing API.
> Not building: Backend, Patient App, or infrastructure.

---

## Step 1 — Project Setup & Foundation

**Goal:** Initialize Angular 20 project, set up strict TypeScript, configure the design system (CSS tokens matching the deployed site), configure i18n/theming/RTL infrastructure, and define all TypeScript models.

### Files to Create

```
staff-dashboard/
├── src/
│   ├── main.ts
│   ├── index.html                          ← <base href="/staff/">, font imports, theme script
│   │
│   ├── styles/
│   │   ├── _variables.css                  ← All CSS custom properties from deployed site
│   │   ├── _reset.css                      ← Box-sizing, margin reset, antialiased text
│   │   ├── _typography.css                 ← Public Sans / Cairo font-face, type scale
│   │   └── styles.css                      ← Imports above + global body/link/focus styles
│   │
│   ├── assets/
│   │   └── i18n/
│   │       ├── en.json                     ← English UI strings
│   │       └── ar.json                     ← Arabic UI strings
│   │
│   ├── app/
│   │   ├── app.component.ts                ← Root <router-outlet>, minimal
│   │   ├── app.config.ts                   ← provideRouter, provideHttpClient(withInterceptors)
│   │   ├── app.routes.ts                   ← Top-level route definitions (placeholder, filled in Step 3)
│   │   │
│   │   └── core/
│   │       ├── config.ts                   ← API_BASE_URL, constants
│   │       │
│   │       └── models/
│   │           ├── user.model.ts           ← UserDto, LoginRequest, AuthResponse, UpdateProfileRequest, ChangePasswordRequest
│   │           ├── doctor.model.ts         ← DoctorListItemDto, DoctorDetailsDto, DoctorListItemDtoPagedResult, SlotsResponse, AvailabilityWindowDto, BlockedDateDto
│   │           ├── appointment.model.ts    ← AppointmentDto, AppointmentStatus, AppointmentMode, CreateAppointmentRequest, BookingResponse, WalkInRequest, RescheduleRequest
│   │           ├── service.model.ts        ← ServiceDto, CreateServiceRequest, UpdateServiceRequest
│   │           ├── patient.model.ts        ← PatientDto, NewPatientInput, PatientHistoryItemDto
│   │           ├── admin.model.ts          ← StaffDto, CreateDoctorRequest, CreateReceptionistRequest, UpdateStaffRequest, SetActiveRequest, CreatedStaffResponse
│   │           ├── dashboard.model.ts      ← DashboardStatsDto
│   │           ├── reports.model.ts        ← ReportsDto, StatusCountDto, RevenueByDayDto, RevenueByServiceDto, DoctorUtilizationDto
│   │           ├── visit.model.ts          ← VisitDto, CreateVisitRequest, PrescriptionItemDto
│   │           ├── payment.model.ts        ← PaymentDto, PaymentInitDto
│   │           └── api-error.model.ts      ← ApiError
│   │
│   ├── angular.json
│   ├── tsconfig.json                       ← strict: true, strictTemplates: true
│   └── package.json
```

### What This Step Produces
- A running Angular 20 app with `ng serve --port 4321`
- All **35+ TypeScript interfaces** defined and importable — the single source of truth for the API contract
- The **design system** as CSS custom properties matching the deployed site:
  - Colors: `--accent: #0E9488`, `--bg: #F7FAFA`, `--surface: #FFFFFF`, etc.
  - Spacing scale: `--s1` through `--s12`
  - Border radii: `--r-sm: 6px`, `--r: 10px`, `--r-lg: 14px`, `--r-full: 999px`
  - Typography: `--fs-body: 1rem`, `--fs-h1: 2rem`, etc.
  - Transitions: `--ease`, `--dur: .18s`, `--dur-lg: .28s`
- i18n JSON files with key/value pairs (can start minimal, grow later)
- `config.ts` pointing to `https://api.clinic.kaessam.codes/api` (configurable)

### Implementation Order
1. `ng new` with standalone, skip tests for now, set strict mode
2. `angular.json` — set port 4321, configure `baseHref: "/staff/"`
3. CSS files (`_variables.css` → `_reset.css` → `_typography.css` → `styles.css`)
4. `index.html` — base href, font links, theme-init script
5. All model files in `core/models/`
6. `config.ts`
7. `app.config.ts` with `provideRouter([])` and `provideHttpClient()`
8. i18n JSON stubs
9. Verify `ng serve` runs clean

---

## Step 2 — Shell Layout (Sidebar + Header + Content Area)

**Goal:** Build the authenticated shell: a sidebar with role-based navigation, a top header with user info/theme/language toggles, and a `<router-outlet>` content area.

### Files to Create

```
app/
├── layout/
│   ├── shell/
│   │   ├── shell.component.ts              ← Container: sidebar + header + <router-outlet>
│   │   └── shell.component.css
│   ├── sidebar/
│   │   ├── sidebar.component.ts            ← Role-based nav links, collapsible, active route highlight
│   │   └── sidebar.component.css
│   └── header/
│       ├── header.component.ts             ← User avatar, name, language toggle, theme toggle, logout
│       └── header.component.css
│
├── core/
│   └── services/
│       ├── theme.service.ts                ← signal<'light' | 'dark'>, persists to localStorage, toggles data-theme on <html>
│       └── i18n.service.ts                 ← signal<'en' | 'ar'>, persists to localStorage, toggles dir="rtl" on <html>, loads JSON translations
```

### Component Details

**`ShellComponent`** (standalone)
- Template: sidebar on the left, header on top, `<router-outlet>` as main content
- CSS Grid or Flexbox layout:
  ```
  [Sidebar 260px] [Header + Content fill]
  ```
- Receives sidebar collapse state as a signal
- Responsive: sidebar becomes overlay drawer below 1000px

**`SidebarComponent`** (standalone)
- Inputs: `role` (from auth), `collapsed` signal
- Shows different nav items per role:
  - **Admin**: Dashboard, Calendar, Walk-in, Patients, Services, Availability, Staff, Reports, Profile
  - **Receptionist**: Dashboard, Calendar, Walk-in, Patients, Services, Availability, Profile
  - **Doctor**: My Schedule, Profile
- Active route highlighting using `routerLinkActive`
- Clinic logo + brand at top
- Collapse/expand toggle

**`HeaderComponent`** (standalone)
- Shows current user name + avatar (from `AuthService`)
- Language toggle button (EN ↔ AR)
- Theme toggle button (☀ ↔ 🌙)
- Logout button
- Mobile hamburger button (shows/hides sidebar overlay)

**`ThemeService`**
- `theme = signal<'light' | 'dark'>('light')`
- On init: read from `localStorage`, fall back to `prefers-color-scheme`
- `toggle()`: flip the signal, update `document.documentElement.dataset.theme`, persist

**`I18nService`**
- `lang = signal<'en' | 'ar'>('en')`
- `dir = computed(() => this.lang() === 'ar' ? 'rtl' : 'ltr')`
- `toggle()`: flip lang, update `<html dir>` and `<html lang>`, persist
- `t(key: string): string` — look up from loaded JSON
- Loads `assets/i18n/{lang}.json` on switch

### Implementation Order
1. `ThemeService` → `I18nService` (no UI dependency)
2. `HeaderComponent` (can test standalone)
3. `SidebarComponent` (can test standalone with mock role)
4. `ShellComponent` (assembles header + sidebar + router-outlet)
5. Wire `ShellComponent` into routes as the parent wrapper

---

## Step 3 — Routing & Auth

**Goal:** Set up the full routing tree with lazy-loaded feature routes, auth guard, role guard, JWT interceptor, language interceptor, and error interceptor.

### Files to Create

```
app/
├── app.routes.ts                           ← Complete route tree (updated)
│
├── core/
│   ├── services/
│   │   └── auth.service.ts                 ← login(), logout(), me(), token storage, currentUser signal, role checks
│   │
│   ├── guards/
│   │   ├── auth.guard.ts                   ← Functional guard: redirects to /login if no token
│   │   └── role.guard.ts                   ← Functional guard factory: roleGuard(['Admin', 'Receptionist'])
│   │
│   └── interceptors/
│       ├── auth.interceptor.ts             ← Attaches Authorization: Bearer <token>
│       ├── language.interceptor.ts          ← Attaches Accept-Language: en|ar from I18nService
│       └── error.interceptor.ts            ← Catches 401 → redirect to login, 4xx/5xx → toast notification
│
├── features/
│   └── auth/
│       ├── login/
│       │   ├── login.component.ts          ← Full-screen login form, no shell layout
│       │   └── login.component.css
│       └── auth.routes.ts
```

### Route Tree

```typescript
// app.routes.ts
[
  { path: 'login', loadComponent: () => LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // Admin + Receptionist
      { path: 'dashboard',    loadComponent: ..., canActivate: [roleGuard(['Admin','Receptionist'])] },
      { path: 'calendar',     loadComponent: ..., canActivate: [roleGuard(['Admin','Receptionist'])] },
      { path: 'walk-in',      loadComponent: ..., canActivate: [roleGuard(['Admin','Receptionist'])] },
      { path: 'patients',     loadComponent: ..., canActivate: [roleGuard(['Admin','Receptionist'])] },
      { path: 'services',     loadComponent: ..., canActivate: [roleGuard(['Admin','Receptionist'])] },
      { path: 'availability', loadComponent: ..., canActivate: [roleGuard(['Admin','Receptionist'])] },

      // Admin only
      { path: 'staff',        loadComponent: ..., canActivate: [roleGuard(['Admin'])] },
      { path: 'reports',      loadComponent: ..., canActivate: [roleGuard(['Admin'])] },

      // Doctor only
      { path: 'schedule',     loadComponent: ..., canActivate: [roleGuard(['Doctor'])] },
      { path: 'patients/:id/history', loadComponent: ..., canActivate: [roleGuard(['Doctor'])] },

      // All staff
      { path: 'profile',      loadComponent: ... },

      // Default: redirect based on role
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
]
```

### `AuthService` Details
- `token = signal<string | null>(null)` — read from `localStorage` on init
- `currentUser = signal<UserDto | null>(null)`
- `isLoggedIn = computed(() => !!this.token())`
- `role = computed(() => this.currentUser()?.role)`
- `login(req: LoginRequest): Observable<AuthResponse>` — calls `POST /api/auth/login`, stores token + user
- `logout()` — clears token + user, navigates to `/login`
- `loadProfile()` — calls `GET /api/auth/me`, updates `currentUser`
- Role-based default route: Admin/Receptionist → `/dashboard`, Doctor → `/schedule`

### `LoginComponent` Details
- Full-screen (no sidebar/header — outside `ShellComponent`)
- Email + password form with reactive forms + validation
- Error display (wrong credentials)
- On success: store token, fetch `/auth/me`, redirect to role-appropriate page

### Interceptors
- **`authInterceptor`**: If token exists, clone request and add `Authorization: Bearer {token}`
- **`languageInterceptor`**: Add `Accept-Language: {lang}` header from `I18nService.lang()`
- **`errorInterceptor`**: 
  - `401` → `AuthService.logout()` (token expired)
  - `403` → show "Access denied" toast
  - `409` → show conflict message (slot taken)
  - `400` → show validation error details
  - `500` → show generic error toast

### Implementation Order
1. `AuthService` (core logic, token management)
2. `auth.interceptor.ts` → `language.interceptor.ts` → `error.interceptor.ts`
3. Update `app.config.ts` with `withInterceptors([authInterceptor, languageInterceptor, errorInterceptor])`
4. `auth.guard.ts` → `role.guard.ts`
5. `LoginComponent` (full page)
6. Complete `app.routes.ts` with all routes (feature components as empty placeholders initially)
7. Test: login → see shell → sidebar shows role-appropriate links

---

## Step 4 — Shared / Reusable UI Components

**Goal:** Build all reusable UI components that feature pages will consume. These are role-agnostic building blocks.

### Files to Create

```
app/shared/
├── components/
│   ├── stat-card/
│   │   ├── stat-card.component.ts          ← Inputs: label, value, icon, accentColor
│   │   └── stat-card.component.css
│   │
│   ├── status-badge/
│   │   ├── status-badge.component.ts       ← Input: status (AppointmentStatus) → colored chip
│   │   └── status-badge.component.css
│   │
│   ├── data-table/
│   │   ├── data-table.component.ts         ← Inputs: columns config, rows data, row actions
│   │   └── data-table.component.css
│   │
│   ├── modal/
│   │   ├── modal.component.ts              ← Overlay wrapper, close on Escape/backdrop, content projection
│   │   └── modal.component.css
│   │
│   ├── confirm-dialog/
│   │   ├── confirm-dialog.component.ts     ← Title, message, confirm/cancel buttons, danger variant
│   │   └── confirm-dialog.component.css
│   │
│   ├── search-input/
│   │   ├── search-input.component.ts       ← Debounced (300ms) search with clear button
│   │   └── search-input.component.css
│   │
│   ├── pagination/
│   │   ├── pagination.component.ts         ← Inputs: page, pageSize, total → Output: pageChange
│   │   └── pagination.component.css
│   │
│   ├── time-slot-grid/
│   │   ├── time-slot-grid.component.ts     ← Input: slots string[] → Output: slotSelected
│   │   └── time-slot-grid.component.css
│   │
│   ├── loading-spinner/
│   │   ├── loading-spinner.component.ts    ← Simple CSS spinner, optional size input
│   │   └── loading-spinner.component.css
│   │
│   ├── empty-state/
│   │   ├── empty-state.component.ts        ← Icon + message + optional action button
│   │   └── empty-state.component.css
│   │
│   ├── toast/
│   │   ├── toast.component.ts              ← Auto-dismiss notification, success/error/warning variants
│   │   ├── toast.component.css
│   │   └── toast.service.ts                ← Injectable: show(message, type, duration)
│   │
│   ├── form-field/
│   │   ├── form-field.component.ts         ← Label + content projection + validation error display
│   │   └── form-field.component.css
│   │
│   ├── avatar/
│   │   ├── avatar.component.ts             ← Input: name, photoUrl → shows image or initials fallback
│   │   └── avatar.component.css
│   │
│   └── role-chip/
│       ├── role-chip.component.ts          ← Input: role string → colored badge
│       └── role-chip.component.css
│
├── directives/
│   └── click-outside.directive.ts          ← Emits when user clicks outside host element (for dropdowns)
│
└── pipes/
    ├── translate.pipe.ts                   ← {{ 'key' | translate }} using I18nService
    └── currency-egp.pipe.ts               ← Formats number as "300 EGP"
```

### Component Specifications

| Component | Key Inputs | Key Outputs | Notes |
|-----------|-----------|-------------|-------|
| `StatCard` | `label`, `value`, `icon`, `color` | — | Dashboard metric cards |
| `StatusBadge` | `status: AppointmentStatus` | — | Maps status → color + label |
| `DataTable` | `columns: Column[]`, `data: T[]`, `loading` | `rowAction(event)` | Generic, configurable columns |
| `Modal` | `open: boolean`, `title` | `closed` | `<ng-content>` for body |
| `ConfirmDialog` | `title`, `message`, `confirmText`, `danger` | `confirmed`, `cancelled` | Built on Modal |
| `SearchInput` | `placeholder` | `searchChange(query)` | 300ms debounce |
| `Pagination` | `page`, `pageSize`, `total` | `pageChange(page)` | Shows page info + prev/next |
| `TimeSlotGrid` | `slots: string[]`, `selectedSlot` | `slotSelected(time)` | Grid of 15-min slots |
| `LoadingSpinner` | `size: 'sm' \| 'md' \| 'lg'` | — | CSS-only spinner |
| `EmptyState` | `icon`, `message`, `actionLabel` | `actionClick` | No-data placeholder |
| `Toast` | — | — | Driven by `ToastService` |
| `FormField` | `label`, `error`, `required` | — | Wraps form controls |
| `Avatar` | `name`, `photoUrl`, `size` | — | Image or initials |
| `RoleChip` | `role: string` | — | Admin=teal, Doctor=blue, etc. |

### Implementation Order
1. `LoadingSpinner` → `EmptyState` (simplest, no dependencies)
2. `ToastService` + `ToastComponent` (needed by interceptors)
3. `Modal` → `ConfirmDialog` (modal is a dependency)
4. `FormField` (needed by all forms)
5. `StatusBadge` → `RoleChip` → `Avatar` (small, self-contained)
6. `StatCard` (needed by Dashboard)
7. `SearchInput` → `Pagination` → `DataTable` (table ecosystem)
8. `TimeSlotGrid` (needed by Walk-in and Reschedule)
9. Pipes: `TranslatePipe` → `CurrencyEgpPipe`
10. `ClickOutsideDirective`

---

## Step 5 — Dashboard Page

**Goal:** Build the first real feature page — the Dashboard with stat cards showing today's clinic metrics.

### Files to Create

```
app/
├── core/
│   └── services/
│       └── dashboard.service.ts            ← GET /api/dashboard/stats
│
├── features/
│   └── dashboard/
│       ├── dashboard.component.ts          ← Grid of StatCards, fetches stats on init
│       ├── dashboard.component.css
│       └── dashboard.routes.ts
```

### `DashboardService`
- `getStats(): Observable<DashboardStatsDto>` → `GET /api/dashboard/stats`

### `DashboardComponent`
- On init: call `DashboardService.getStats()`
- Renders 6 `StatCard` components in a responsive grid:
  1. **Total Appointments** (totalAppointments)
  2. **Confirmed** (confirmed) — accent color
  3. **Arrived** (arrived) — info color
  4. **Completed** (completed) — success color
  5. **No-Show** (noShow) — danger color
  6. **Today's Revenue** (todaysRevenue) — formatted as EGP
- Loading state: skeleton/spinner
- Error state: toast + retry
- Access: Admin, Receptionist only

### Implementation Order
1. `DashboardService`
2. `DashboardComponent` (uses `StatCard`, `LoadingSpinner`)
3. `dashboard.routes.ts`
4. Wire into `app.routes.ts`
5. Test with live API: login as `admin@clinic.local` / `Admin#123`

---

## Step 6 — API Services Layer

**Goal:** Build all remaining Angular services that call the backend API. Each service is a thin HTTP wrapper — one service per API domain.

### Files to Create

```
app/core/services/
├── auth.service.ts                         ← (already built in Step 3)
├── dashboard.service.ts                    ← (already built in Step 5)
├── doctor.service.ts                       ← Doctors list, detail, slots, availability, blocked dates
├── service.service.ts                      ← CRUD clinic services
├── appointment.service.ts                  ← Day calendar, walk-in, status actions, reschedule, cancel
├── patient.service.ts                      ← Create, search, patient history
└── admin.service.ts                        ← Staff list, add doctor/receptionist, update, activate/deactivate, reports
```

### Service → Endpoint Mapping

**`DoctorService`** (8 endpoints)
```
getAll(params?)            → GET    /api/doctors
getById(id)                → GET    /api/doctors/{id}
getSlots(id, date, svcId)  → GET    /api/doctors/{id}/slots?date=&serviceId=
getAvailability(id)        → GET    /api/doctors/{id}/availability
setAvailability(id, body)  → PUT    /api/doctors/{id}/availability
getBlockedDates(id)        → GET    /api/doctors/{id}/blocked-dates
blockDate(id, body)        → POST   /api/doctors/{id}/blocked-dates
unblockDate(id, date)      → DELETE /api/doctors/{id}/blocked-dates/{date}
```

**`ServiceService`** (4 endpoints)
```
getAll()                   → GET    /api/services
create(body)               → POST   /api/services
update(id, body)           → PUT    /api/services/{id}
delete(id)                 → DELETE /api/services/{id}
```

**`AppointmentService`** (8 endpoints)
```
getCalendar(date?, doctorId?, status?) → GET /api/appointments
getById(id)                → GET    /api/appointments/{id}
cancel(id)                 → PUT    /api/appointments/{id}/cancel
walkIn(body)               → POST   /api/appointments/walk-in
reschedule(id, body)       → PUT    /api/appointments/{id}/reschedule
checkIn(id)                → PUT    /api/appointments/{id}/arrived
markNoShow(id)             → PUT    /api/appointments/{id}/no-show
markCashPaid(id)           → PUT    /api/appointments/{id}/cash-paid
```

**`PatientService`** (3 endpoints)
```
search(query?)             → GET    /api/patients
create(body)               → POST   /api/patients
getHistory(id)             → GET    /api/patients/{id}/history
```

**`AdminService`** (6 endpoints)
```
getStaff()                 → GET    /api/admin/staff
addDoctor(body)            → POST   /api/admin/doctors
addReceptionist(body)      → POST   /api/admin/receptionists
updateStaff(id, body)      → PUT    /api/admin/staff/{id}
setActive(id, body)        → PUT    /api/admin/staff/{id}/active
getReports()               → GET    /api/admin/reports
```

### Implementation Order
1. `DoctorService` (used by Calendar, Walk-in, Availability)
2. `ServiceService` (used by Services page, Walk-in)
3. `AppointmentService` (used by Calendar, Walk-in)
4. `PatientService` (used by Patients page, Walk-in, Doctor history)
5. `AdminService` (used by Staff page, Reports)

---

## Step 7 — Feature Pages

**Goal:** Build all remaining feature pages. Each page is a standalone component under `features/`. Build in this order — each page builds on previous services and shared components.

### 7A. Day Calendar (depends on: `AppointmentService`, `DoctorService`)

```
features/calendar/
├── calendar.component.ts                   ← Date picker + doctor filter + status filter + appointments table
├── calendar.component.css
├── components/
│   ├── appointment-row/
│   │   ├── appointment-row.component.ts    ← Single appointment row with action buttons
│   │   └── appointment-row.component.css
│   └── reschedule-modal/
│       ├── reschedule-modal.component.ts   ← Date + slot picker → reschedule
│       └── reschedule-modal.component.css
└── calendar.routes.ts
```

**Features:**
- Filter by date (defaults to today), doctor, status
- Table showing: time, patient, doctor, service, status, actions
- Actions per row (based on status):
  - Confirmed → Check-in, No-show, Cancel, Reschedule
  - Arrived → No-show
  - PendingPayment → Cancel
- Reschedule opens a modal with date + slot picker
- Confirm dialog before destructive actions

---

### 7B. Walk-in Booking (depends on: `AppointmentService`, `DoctorService`, `PatientService`, `ServiceService`)

```
features/walk-in/
├── walk-in.component.ts                    ← Multi-step walk-in booking flow
├── walk-in.component.css
├── components/
│   ├── patient-selector/
│   │   ├── patient-selector.component.ts   ← Search existing patient OR create new
│   │   └── patient-selector.component.css
│   └── create-patient-modal/
│       ├── create-patient-modal.component.ts
│       └── create-patient-modal.component.css
└── walk-in.routes.ts
```

**Flow:**
1. Select or create patient
2. Select doctor → select service
3. Pick date → see available slots grid
4. Pick slot → confirm booking
5. Success: show appointment details

---

### 7C. Patients (depends on: `PatientService`)

```
features/patients/
├── patient-list/
│   ├── patient-list.component.ts           ← Search + table + create modal
│   └── patient-list.component.css
├── patient-form/
│   ├── patient-form.component.ts           ← Create patient modal form
│   └── patient-form.component.css
└── patients.routes.ts
```

---

### 7D. Services Management (depends on: `ServiceService`, `DoctorService`)

```
features/services/
├── service-list/
│   ├── service-list.component.ts           ← Table + add/edit/delete
│   └── service-list.component.css
├── service-form/
│   ├── service-form.component.ts           ← Modal form: name, duration, price, doctor
│   └── service-form.component.css
└── services.routes.ts
```

---

### 7E. Doctor Availability (depends on: `DoctorService`)

```
features/availability/
├── availability.component.ts               ← Doctor selector + weekly schedule editor + blocked dates
├── availability.component.css
├── components/
│   ├── weekly-schedule/
│   │   ├── weekly-schedule.component.ts    ← Day-of-week rows with start/end time inputs
│   │   └── weekly-schedule.component.css
│   └── blocked-dates/
│       ├── blocked-dates.component.ts      ← List of blocked dates + add/remove
│       └── blocked-dates.component.css
└── availability.routes.ts
```

---

### 7F. Staff Management — Admin only (depends on: `AdminService`)

```
features/staff/
├── staff-list/
│   ├── staff-list.component.ts             ← Table: name, email, role, active toggle
│   └── staff-list.component.css
├── doctor-form/
│   ├── doctor-form.component.ts            ← Add doctor modal: name, email, phone, specialization, bio
│   └── doctor-form.component.css
├── receptionist-form/
│   ├── receptionist-form.component.ts      ← Add receptionist modal: name, email, phone
│   └── receptionist-form.component.css
├── credentials-modal/
│   ├── credentials-modal.component.ts      ← Shows generated email + temp password after creation
│   └── credentials-modal.component.css
└── staff.routes.ts
```

---

### 7G. Doctor Schedule — Doctor only (depends on: `AppointmentService`, `PatientService`)

```
features/schedule/
├── schedule.component.ts                   ← Doctor's own appointments for today (filterable by date)
├── schedule.component.css
├── components/
│   ├── visit-form/
│   │   ├── visit-form.component.ts         ← Diagnosis + notes + prescription items (dynamic FormArray)
│   │   └── visit-form.component.css
│   └── patient-history/
│       ├── patient-history.component.ts    ← Past visits for a patient
│       └── patient-history.component.css
└── schedule.routes.ts
```

**Doctor endpoints used:**
- `GET /api/doctor/schedule` — my today's appointments
- `POST /api/appointments/{id}/visit` — record visit + prescription
- `PUT /api/appointments/{id}/complete` — mark completed
- `PUT /api/visits/{id}` — edit visit (within editable window)
- `GET /api/patients/{id}/history` — patient's past visits

---

### 7H. Reports — Admin only (depends on: `AdminService`)

```
features/reports/
├── reports.component.ts                    ← Charts + metrics dashboard
├── reports.component.css
└── reports.routes.ts
```

> [!NOTE]
> **Charting library will be decided before this step.** Options: Chart.js, ngx-charts, or custom SVG.

**Data displayed:**
- Appointments by status (pie/donut chart)
- Revenue by day (line chart — last 30 days)
- Revenue by service (bar chart)
- Doctor utilization (bar chart)
- No-show rate (single metric)

---

### 7I. Profile (depends on: `AuthService`)

```
features/profile/
├── profile.component.ts                    ← Edit name, phone, avatar + change password section
├── profile.component.css
└── profile.routes.ts
```

---

### Feature Pages — Build Order

| Order | Feature | Depends on Services | Complexity |
|-------|---------|-------------------|------------|
| 1 | **Dashboard** (already done in Step 5) | DashboardService | Low |
| 2 | **Calendar** | AppointmentService, DoctorService | High |
| 3 | **Patients** | PatientService | Low |
| 4 | **Services** | ServiceService, DoctorService | Medium |
| 5 | **Walk-in** | AppointmentService, DoctorService, PatientService, ServiceService | High |
| 6 | **Availability** | DoctorService | Medium |
| 7 | **Staff** | AdminService | Medium |
| 8 | **Doctor Schedule** | AppointmentService, PatientService | High |
| 9 | **Profile** | AuthService | Low |
| 10 | **Reports** | AdminService | Medium (pending chart library) |

---

## Full File Count Summary

| Category | Files | Description |
|----------|-------|-------------|
| **Core/Models** | 11 | TypeScript interfaces for all API types |
| **Core/Services** | 9 | Auth, Dashboard, Doctor, Service, Appointment, Patient, Admin, Theme, I18n |
| **Core/Guards** | 2 | authGuard, roleGuard |
| **Core/Interceptors** | 3 | auth, language, error |
| **Layout** | 3 components | Shell, Sidebar, Header |
| **Shared Components** | 14 | StatCard, StatusBadge, DataTable, Modal, ConfirmDialog, SearchInput, Pagination, TimeSlotGrid, LoadingSpinner, EmptyState, Toast, FormField, Avatar, RoleChip |
| **Shared Pipes** | 2 | translate, currencyEgp |
| **Shared Directives** | 1 | clickOutside |
| **Feature Pages** | ~20 components | Login, Dashboard, Calendar, Walk-in, Patients, Services, Availability, Staff, Schedule, Reports, Profile |
| **Config/Setup** | 5 | app.config, app.routes, config, styles, index.html |
| **Total** | **~70 files** | |

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| **Design source** | Replicate the deployed staff website at `clinic.kaessam.codes/staff` exactly, with possibility of modification later |
| **Charting library** | To be decided before Reports implementation |
| **Base href** | `<base href="/staff/">` for now, can be changed later |
| **Codebase** | Build from scratch — no existing repo |
