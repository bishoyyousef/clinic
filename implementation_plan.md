# Clarity Clinic — Angular Staff Dashboard: Full Analysis & Implementation Plan

## 1. Figma Design Analysis

> [!NOTE]
> The Figma file at `https://www.figma.com/design/vnjKAkzJlJGbwLD1fnWcE8/Clinic-design` cannot be directly parsed via URL (requires Figma API token or manual inspection). The analysis below is derived from the **live deployed staff website**, the **API documentation**, and the **system overview page** which together reveal the complete UI structure.

### 1.1 Identified Pages (by Role)

| # | Page | Route (suggested) | Roles |
|---|------|-------------------|-------|
| 1 | **Login** | `/login` | All staff |
| 2 | **Dashboard** (Home) | `/dashboard` | Admin, Receptionist |
| 3 | **Day Calendar** | `/calendar` | Admin, Receptionist |
| 4 | **Walk-in Booking** | `/walk-in` | Admin, Receptionist |
| 5 | **Patients List** | `/patients` | Admin, Receptionist |
| 6 | **Services Management** | `/services` | Admin, Receptionist |
| 7 | **Doctor Availability** | `/availability` | Admin, Receptionist |
| 8 | **Staff Management** | `/staff` | Admin only |
| 9 | **Reports** | `/reports` | Admin only |
| 10 | **Doctor Schedule** (My Schedule) | `/schedule` | Doctor only |
| 11 | **Visit Details / Complete** | `/schedule/:appointmentId` | Doctor only |
| 12 | **Patient History** | `/patients/:id/history` | Doctor only |
| 13 | **Profile / Settings** | `/profile` | All staff |

### 1.2 Reusable UI Components

| Component | Used In | Description |
|-----------|---------|-------------|
| `SidebarComponent` | Shell layout | Role-based navigation sidebar |
| `HeaderComponent` | Shell layout | Top bar with user info, theme toggle, language toggle |
| `StatCardComponent` | Dashboard | Metric cards (total appointments, confirmed, arrived, etc.) |
| `DataTableComponent` | Calendar, Patients, Staff, Services | Reusable sortable/filterable table |
| `StatusBadgeComponent` | Calendar, Schedule | Color-coded appointment status chips |
| `AppointmentCardComponent` | Calendar, Schedule | Appointment row/card with actions |
| `ModalComponent` | Multiple | Reusable modal dialog wrapper |
| `ConfirmDialogComponent` | Multiple | Confirmation modal (delete, cancel, etc.) |
| `DatePickerComponent` | Calendar, Walk-in, Availability | Date selection |
| `TimeSlotGridComponent` | Walk-in, Availability | Visual grid of 15-min time slots |
| `SearchInputComponent` | Patients, Staff, Doctors list | Debounced search input |
| `PaginationComponent` | Patients, Staff, Doctors list | Page navigation |
| `LoadingSpinnerComponent` | Multiple | Loading state indicator |
| `EmptyStateComponent` | Multiple | No-data placeholder |
| `ToastComponent` | Global | Success/error notification toasts |
| `FormFieldComponent` | Forms | Wrapper with label + validation messages |
| `RoleChipComponent` | Staff list | Role indicator badge |
| `AvatarComponent` | Header, Staff list | User avatar with fallback initials |

### 1.3 Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header (logo, breadcrumb, lang toggle, theme, user)│
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │           Main Content Area              │
│ (nav)    │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

- **Login page**: Full-screen, no sidebar/header
- **Authenticated pages**: Shell layout with sidebar + header + content
- **Sidebar**: Collapsible, role-based menu items
- **Responsive**: Sidebar collapses to hamburger on mobile (< 1000px)

### 1.4 Tables / Forms / Modals / Cards

**Tables:**
- Day Calendar appointments table (filterable by doctor, status)
- Staff list table (with activate/deactivate toggle)
- Patients list table (searchable)
- Services list table (with edit/delete actions)
- Doctor schedule table (doctor view)

**Forms:**
- Login form (email, password)
- Add Doctor form (name, email, phone, specialization, bio, photo)
- Add Receptionist form (name, email, phone)
- Edit Staff form
- Create/Edit Service form (name, duration, price, doctor)
- Walk-in Booking form (patient selection/creation, doctor, service, date, slot)
- Create Patient form (name, phone, email)
- Visit form (diagnosis, notes, prescription items)
- Set Availability form (day-of-week, start time, end time)
- Block Date form
- Profile edit form
- Change Password form

**Modals:**
- Add/Edit Doctor modal
- Add/Edit Receptionist modal
- Add/Edit Service modal
- Walk-in booking flow modal
- Create patient modal
- Visit details / Complete visit modal
- Reschedule appointment modal
- Confirm action dialogs (cancel, no-show, delete, deactivate)
- Credentials display modal (after creating staff)

**Cards:**
- Dashboard stat cards (today's appointments, confirmed, arrived, completed, no-show, revenue)
- Report cards (charts for revenue by day, revenue by service, appointments by status)

### 1.5 Responsive Behavior

From the existing staff website CSS variables and media queries:

- **Desktop (> 1000px)**: Full sidebar + content layout
- **Tablet (600–1000px)**: Sidebar becomes overlay/drawer with hamburger toggle + backdrop
- **Mobile (< 600px)**: Compact padding, stacked cards, single-column grids
- **RTL support**: `--rtl-flip: 1` CSS variable, `dir="rtl"` on `<html>` for Arabic
- **Reduced motion**: `prefers-reduced-motion` media query honored

---

## 2. Existing Staff Website Analysis

### 2.1 Technology Stack (from deployed site)

| Aspect | Detail |
|--------|--------|
| Framework | **Angular 20** (standalone components + signals) |
| Title | `Clarity Clinic — Staff` |
| Base href | `/staff/` |
| API config | `window.__CLINIC_API__ = "/api"` (proxied in production) |
| Font | **Public Sans** (Latin), **Cairo** (Arabic) |
| Theme | CSS custom properties, light mode default |
| RTL | `--rtl-flip: 1` variable system |

### 2.2 Design System (from CSS variables)

```css
/* Typography */
--font-latin: "Public Sans", system-ui, sans-serif;
--font-arabic: "Cairo", system-ui, sans-serif;

/* Spacing Scale (4px base) */
--s1: 4px → --s12: 80px

/* Border Radii */
--r-sm: 6px; --r: 10px; --r-lg: 14px; --r-full: 999px;

/* Animation */
--ease: cubic-bezier(.32, .72, .3, 1);
--dur: .18s; --dur-lg: .28s;

/* Color Palette (Light) */
--bg: #F7FAFA;          --surface: #FFFFFF;
--surface-2: #F1F6F5;   --border: #E4ECEC;
--text: #13201F;         --muted: #5F716F;
--accent: #0E9488;       --accent-hover: #0B7A70;
--accent-soft: #E3F4F2;  --on-accent: #FFFFFF;
--success: #2F9E6B;      --warning: #C9852B;
--danger: #CF4636;
```

### 2.3 Dashboard Sections (Staff Roles)

**Admin sees:**
- Dashboard (stats overview)
- Day Calendar (all doctors)
- Staff Management (add/edit doctors, receptionists, activate/deactivate)
- Services Management (CRUD)
- Doctor Availability & Blocked Dates
- Patients list
- Reports (charts: revenue, appointments by status, doctor utilization, no-show rate)
- Walk-in booking
- Profile & Settings

**Receptionist sees:**
- Dashboard (stats overview)
- Day Calendar (all doctors)
- Services Management (CRUD)
- Doctor Availability & Blocked Dates
- Patients list (create + search)
- Walk-in booking
- Check-in / No-show / Cash-paid actions
- Reschedule
- Profile & Settings

**Doctor sees:**
- My Schedule (today's appointments)
- Visit Details (complete visit, write diagnosis + prescription)
- Patient History
- Profile & Settings

### 2.4 User Flows

**Flow A — Receptionist checks in a patient:**
1. Log in as Receptionist
2. Open Day Calendar → see today's confirmed appointments
3. Click "Check In" on an appointment → status becomes `Arrived`
4. (Optional) Mark cash-paid if patient pays cash

**Flow B — Receptionist books a walk-in:**
1. Open Walk-in Booking
2. Search existing patient or create new
3. Select doctor, service, date
4. See available time slots
5. Pick a slot → appointment confirmed immediately

**Flow C — Doctor completes a visit:**
1. Log in as Doctor
2. Open My Schedule → see `Arrived` patients
3. Click on an appointment
4. Write diagnosis, notes, prescription
5. Complete visit → status becomes `Completed`

**Flow D — Admin manages staff:**
1. Log in as Admin
2. Open Staff Management
3. Add new Doctor (fill form) → credentials displayed
4. Add new Receptionist
5. Activate/deactivate staff members

---

## 3. API Documentation Analysis

### 3.1 All 44 Endpoints Grouped by Feature

#### 🔐 Auth (5 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/register` | Anonymous | Patient signup |
| `POST` | `/api/auth/login` | Anonymous | Authenticate → JWT |
| `GET` | `/api/auth/me` | Authenticated | Current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update own profile |
| `PUT` | `/api/auth/password` | Authenticated | Change password |

#### 👨‍⚕️ Doctors & Slots (8 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/doctors` | Anonymous | Paged doctor search |
| `GET` | `/api/doctors/{id}` | Anonymous | Doctor detail |
| `GET` | `/api/doctors/{id}/slots` | Anonymous | Available slots (query: date, serviceId) |
| `GET` | `/api/doctors/{id}/availability` | Admin · Recep | Read weekly availability |
| `PUT` | `/api/doctors/{id}/availability` | Admin · Recep | Set weekly availability |
| `GET` | `/api/doctors/{id}/blocked-dates` | Admin · Recep | List blocked days |
| `POST` | `/api/doctors/{id}/blocked-dates` | Admin · Recep | Block a date |
| `DELETE` | `/api/doctors/{id}/blocked-dates/{date}` | Admin · Recep | Unblock a date |

#### 🏥 Services (4 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/services` | Anonymous | List services |
| `POST` | `/api/services` | Admin · Recep | Create a service |
| `PUT` | `/api/services/{id}` | Admin · Recep | Update a service |
| `DELETE` | `/api/services/{id}` | Admin · Recep | Delete a service |

#### 📋 Appointments — Patient (5 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/appointments` | Patient | Book an appointment |
| `GET` | `/api/me/appointments` | Patient | My appointments |
| `GET` | `/api/me/prescriptions` | Patient | My prescriptions |
| `GET` | `/api/appointments/{id}` | Authenticated | Appointment detail |
| `PUT` | `/api/appointments/{id}/cancel` | Authenticated | Cancel (frees slot) |

#### 🖥️ Appointments — Front Desk (6 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/appointments` | Admin · Recep | Day calendar (query: date, doctorId, status) |
| `POST` | `/api/appointments/walk-in` | Admin · Recep | Book a walk-in |
| `PUT` | `/api/appointments/{id}/reschedule` | Admin · Recep | Move to another slot |
| `PUT` | `/api/appointments/{id}/arrived` | Admin · Recep | Check in → Arrived |
| `PUT` | `/api/appointments/{id}/no-show` | Admin · Recep | Mark no-show |
| `PUT` | `/api/appointments/{id}/cash-paid` | Admin · Recep | Record cash payment |

#### 🩺 Doctor — Clinical (5 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `PUT` | `/api/appointments/{id}/complete` | Doctor | Complete the visit |
| `POST` | `/api/appointments/{id}/visit` | Doctor | Record visit + prescription |
| `PUT` | `/api/visits/{id}` | Doctor | Update a visit |
| `GET` | `/api/doctor/schedule` | Doctor | My schedule |
| `GET` | `/api/patients/{id}/history` | Doctor | Patient history |

#### 👥 Patients (2 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/patients` | Admin · Recep | Create a patient record |
| `GET` | `/api/patients` | Admin · Recep | List / search patients |

#### ⚙️ Admin (6 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/admin/staff` | Admin | List staff |
| `POST` | `/api/admin/doctors` | Admin | Add a doctor |
| `POST` | `/api/admin/receptionists` | Admin | Add a receptionist |
| `PUT` | `/api/admin/staff/{id}` | Admin | Update staff member |
| `PUT` | `/api/admin/staff/{id}/active` | Admin | Activate / deactivate |
| `GET` | `/api/admin/reports` | Admin | Clinic reports |

#### 📊 Dashboard (1 endpoint)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/dashboard/stats` | Admin · Recep | Dashboard statistics |

#### 💳 Payments (2 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/payments/webhook` | Anonymous | Payment provider webhook |
| `POST` | `/api/payments/mock/pay` | Anonymous | Mock pay (dev/demo) |

### 3.2 Suggested Angular Services

| Service | Responsibility | Endpoints Used |
|---------|---------------|----------------|
| `AuthService` | Login, logout, token management, current user, profile, password | Auth (5) |
| `DoctorService` | Doctor list, detail, slots, availability, blocked dates | Doctors & Slots (8) |
| `ServiceService` | CRUD clinic services | Services (4) |
| `AppointmentService` | Day calendar, walk-in, check-in, no-show, cash-paid, reschedule, cancel, detail | Front Desk (6) + Patient (2 shared) |
| `PatientService` | Patient CRUD, search, history | Patients (2) + Doctor history (1) |
| `AdminService` | Staff management, reports | Admin (6) |
| `DashboardService` | Dashboard stats | Dashboard (1) |

### 3.3 TypeScript Interfaces/Models

```typescript
// ── Auth ──
interface LoginRequest { email: string; password: string; }
interface RegisterRequest { displayName: string; email: string; phone: string; password: string; }
interface AuthResponse { token: string; user: UserDto; }
interface UpdateProfileRequest { displayName: string; phone: string; avatarUrl?: string | null; }
interface ChangePasswordRequest { current: string; new: string; }

interface UserDto {
  id: string; name: string; email: string; phone: string;
  role: 'Patient' | 'Doctor' | 'Receptionist' | 'Admin';
  isActive: boolean; avatarUrl?: string | null;
}

// ── Doctors ──
interface DoctorListItemDto {
  id: string; displayName: string; specialization: string;
  photoUrl?: string; bio?: string; services: ServiceDto[];
  rating: number; reviewCount: number; yearsExperience: number;
}
interface DoctorListItemDtoPagedResult {
  items: DoctorListItemDto[]; page: number; pageSize: number; total: number;
}
interface DoctorDetailsDto extends DoctorListItemDto {
  nearestAvailableDates: string[];
}
interface SlotsResponse { date: string; slots: string[]; }

// ── Availability ──
interface AvailabilityWindowDto { dayOfWeek: number; startTime: string; endTime: string; }
interface BlockedDateDto { date: string; reason?: string; }
interface BlockDateRequest { date: string; }

// ── Services ──
interface ServiceDto {
  id: number; name: string; durationMinutes: number;
  price: number; doctorId?: string; doctorName?: string;
}
interface CreateServiceRequest { name: string; durationMinutes: number; price: number; doctorId: string; }
interface UpdateServiceRequest { name: string; durationMinutes: number; price: number; }

// ── Appointments ──
type AppointmentStatus = 'PendingPayment' | 'Confirmed' | 'Arrived' | 'Completed' | 'NoShow' | 'Cancelled';
type AppointmentMode = 'Online' | 'InClinic';
type PaymentMethod = 'Online' | 'Cash';

interface AppointmentDto {
  id: number; doctorId: string; doctorName: string;
  patientId: number; patientName: string;
  serviceId: number; serviceName: string;
  date: string; startTime: string; endTime: string;
  status: AppointmentStatus; mode: AppointmentMode;
  meetingLink?: string; payment?: PaymentDto;
  visit?: VisitDto; createdAt: string;
}
interface CreateAppointmentRequest {
  doctorId: string; serviceId: number; date: string;
  startTime: string; mode: AppointmentMode; paymentMethod: PaymentMethod;
}
interface BookingResponse { appointment: AppointmentDto; payment?: PaymentInitDto; }
interface WalkInRequest {
  patientId?: number; newPatient?: NewPatientInput;
  doctorId: string; serviceId: number; date: string;
  startTime: string; mode?: string;
}
interface RescheduleRequest { date: string; startTime: string; }

// ── Patients ──
interface PatientDto { id: number; name: string; phone: string; email?: string; hasLogin: boolean; }
interface NewPatientInput { name: string; phone: string; email?: string; }
interface PatientHistoryItemDto {
  appointmentId: number; date: string; doctorName: string;
  serviceName: string; visit?: VisitDto;
}

// ── Visits ──
interface VisitDto {
  id: number; appointmentId: number; diagnosis: string;
  notes?: string; createdAt: string; editableUntil?: string;
  isEditable: boolean; prescription: PrescriptionItemDto[];
}
interface CreateVisitRequest {
  diagnosis: string; notes?: string; prescription: PrescriptionItemDto[];
}
interface PrescriptionItemDto { drug: string; dosage: string; duration: string; }

// ── Payments ──
interface PaymentDto {
  id: number; amount: number; method: string;
  status: string; transactionRef?: string; paidAt?: string;
}
interface PaymentInitDto { id: number; checkoutUrl: string; }

// ── Admin ──
interface StaffDto {
  id: string; name: string; email: string; phone: string;
  role: string; isActive: boolean; specialization?: string;
}
interface CreateDoctorRequest {
  name: string; email: string; phone: string;
  specialization: string; bio?: string; photoUrl?: string;
}
interface CreateReceptionistRequest { name: string; email: string; phone: string; }
interface UpdateStaffRequest {
  name: string; phone: string; specialization?: string;
  bio?: string; photoUrl?: string;
}
interface SetActiveRequest { isActive: boolean; }
interface CreatedStaffResponse { id: string; email: string; temporaryPassword: string; }

// ── Dashboard ──
interface DashboardStatsDto {
  totalAppointments: number; confirmed: number; arrived: number;
  completed: number; noShow: number; todaysRevenue: number;
}

// ── Reports ──
interface ReportsDto {
  appointmentsByStatus: StatusCountDto[]; revenueByDay: RevenueByDayDto[];
  revenueByService: RevenueByServiceDto[]; noShowRate: number;
  doctorUtilization: DoctorUtilizationDto[];
}
interface StatusCountDto { status: string; count: number; }
interface RevenueByDayDto { date: string; revenue: number; }
interface RevenueByServiceDto { serviceName: string; revenue: number; }
interface DoctorUtilizationDto { doctorName: string; appointments: number; completedAppointments: number; }

// ── Common ──
interface ApiError { error: string; message: string; details?: string[]; }
```

---

## 4. Angular Architecture Recommendation

### 4.1 Folder Structure

```
staff-dashboard/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── config.ts                  # API base URL, constants
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── doctor.service.ts
│   │   │   │   ├── service.service.ts
│   │   │   │   ├── appointment.service.ts
│   │   │   │   ├── patient.service.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   ├── theme.service.ts
│   │   │   │   └── i18n.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts     # Attach JWT
│   │   │   │   ├── language.interceptor.ts  # Attach Accept-Language
│   │   │   │   └── error.interceptor.ts     # Global error handling
│   │   │   └── models/
│   │   │       ├── auth.model.ts
│   │   │       ├── doctor.model.ts
│   │   │       ├── appointment.model.ts
│   │   │       ├── patient.model.ts
│   │   │       ├── service.model.ts
│   │   │       ├── admin.model.ts
│   │   │       ├── dashboard.model.ts
│   │   │       └── api-error.model.ts
│   │   │
│   │   ├── shared/                         # Reusable UI components
│   │   │   ├── components/
│   │   │   │   ├── data-table/
│   │   │   │   ├── stat-card/
│   │   │   │   ├── status-badge/
│   │   │   │   ├── modal/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── search-input/
│   │   │   │   ├── pagination/
│   │   │   │   ├── time-slot-grid/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── toast/
│   │   │   │   ├── form-field/
│   │   │   │   ├── avatar/
│   │   │   │   └── role-chip/
│   │   │   ├── directives/
│   │   │   │   └── click-outside.directive.ts
│   │   │   └── pipes/
│   │   │       ├── translate.pipe.ts
│   │   │       ├── currency-egp.pipe.ts
│   │   │       └── relative-time.pipe.ts
│   │   │
│   │   ├── layout/                         # Shell layout
│   │   │   ├── shell/
│   │   │   │   └── shell.component.ts      # Sidebar + header + <router-outlet>
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.component.ts
│   │   │   └── header/
│   │   │       └── header.component.ts
│   │   │
│   │   ├── features/                       # Feature pages (lazy-loaded routes)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── login.component.ts
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── dashboard.routes.ts
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── calendar.component.ts
│   │   │   │   ├── appointment-actions/     # check-in, no-show, cash-paid, cancel
│   │   │   │   ├── reschedule-modal/
│   │   │   │   └── calendar.routes.ts
│   │   │   │
│   │   │   ├── walk-in/
│   │   │   │   ├── walk-in.component.ts
│   │   │   │   ├── patient-selector/
│   │   │   │   ├── slot-picker/
│   │   │   │   └── walk-in.routes.ts
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   ├── patient-list/
│   │   │   │   ├── patient-form/
│   │   │   │   ├── patient-history/
│   │   │   │   └── patients.routes.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── service-list/
│   │   │   │   ├── service-form/
│   │   │   │   └── services.routes.ts
│   │   │   │
│   │   │   ├── availability/
│   │   │   │   ├── availability.component.ts
│   │   │   │   ├── blocked-dates/
│   │   │   │   └── availability.routes.ts
│   │   │   │
│   │   │   ├── staff/                      # Admin only
│   │   │   │   ├── staff-list/
│   │   │   │   ├── doctor-form/
│   │   │   │   ├── receptionist-form/
│   │   │   │   ├── credentials-modal/
│   │   │   │   └── staff.routes.ts
│   │   │   │
│   │   │   ├── reports/                    # Admin only
│   │   │   │   ├── reports.component.ts
│   │   │   │   ├── charts/                 # Chart sub-components
│   │   │   │   └── reports.routes.ts
│   │   │   │
│   │   │   ├── schedule/                   # Doctor only
│   │   │   │   ├── schedule.component.ts
│   │   │   │   ├── visit-form/
│   │   │   │   └── schedule.routes.ts
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── profile.component.ts
│   │   │       └── profile.routes.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts                   # provideRouter, provideHttpClient, etc.
│   │   └── app.routes.ts                   # Top-level routes
│   │
│   ├── assets/
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   └── ar.json
│   │   └── icons/
│   │
│   ├── styles/
│   │   ├── _variables.css                  # Design tokens
│   │   ├── _reset.css
│   │   ├── _typography.css
│   │   └── global.css
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
└── tsconfig.json
```

### 4.2 Architecture Decisions

#### Standalone Components (No NgModules)
Angular 20 — all components, directives, and pipes are **standalone**. No `NgModule` declarations. Use `provideRouter`, `provideHttpClient`, etc. in `app.config.ts`.

#### Signals-Based State Management
Use **Angular Signals** for reactive state — no external state management library needed:

- `AuthService` → `signal<UserDto | null>` for current user, `computed()` for role checks
- `ThemeService` → `signal<'light' | 'dark'>` persisted to localStorage
- `I18nService` → `signal<'en' | 'ar'>` persisted to localStorage
- Feature-level signals in components using `resource()` or `rxResource()` for API data fetching

#### Routing Strategy
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component') },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // Admin + Receptionist
      { path: 'dashboard', loadComponent: ..., canActivate: [roleGuard(['Admin', 'Receptionist'])] },
      { path: 'calendar', loadComponent: ..., canActivate: [roleGuard(['Admin', 'Receptionist'])] },
      { path: 'walk-in', loadComponent: ..., canActivate: [roleGuard(['Admin', 'Receptionist'])] },
      { path: 'patients', loadComponent: ..., canActivate: [roleGuard(['Admin', 'Receptionist'])] },
      { path: 'services', loadComponent: ..., canActivate: [roleGuard(['Admin', 'Receptionist'])] },
      { path: 'availability', loadComponent: ..., canActivate: [roleGuard(['Admin', 'Receptionist'])] },
      
      // Admin only
      { path: 'staff', loadComponent: ..., canActivate: [roleGuard(['Admin'])] },
      { path: 'reports', loadComponent: ..., canActivate: [roleGuard(['Admin'])] },
      
      // Doctor only
      { path: 'schedule', loadComponent: ..., canActivate: [roleGuard(['Doctor'])] },
      { path: 'patients/:id/history', loadComponent: ..., canActivate: [roleGuard(['Doctor'])] },
      
      // All staff
      { path: 'profile', loadComponent: ... },
      
      // Default redirect based on role
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
```

#### HTTP Interceptors
Three functional interceptors chained via `withInterceptors()`:
1. **`authInterceptor`** — Attaches `Authorization: Bearer <token>` from stored JWT
2. **`languageInterceptor`** — Attaches `Accept-Language: en|ar` from i18n signal
3. **`errorInterceptor`** — Catches 401 (redirect to login), 403, 409, 500 → shows toast

#### Cross-Cutting Concerns
- **i18n**: JSON files (`en.json`, `ar.json`) loaded at startup; `translate` pipe + `I18nService.t()` method
- **RTL**: Toggle `dir` attribute on `<html>` + `--rtl-flip` CSS variable
- **Theming**: Toggle `data-theme` attribute; CSS variables handle all colors
- **Responsive**: CSS media queries + sidebar collapse signal

---

## 5. Implementation Plan

### Phase 1: Project Foundation (Days 1-2)

> [!IMPORTANT]
> This phase must be completed first — everything else depends on it.

- [ ] Initialize Angular 20 project with standalone configuration
- [ ] Set up design system: CSS variables, typography, reset, global styles (matching existing deployed site)
- [ ] Configure `app.config.ts` with `provideRouter`, `provideHttpClient(withInterceptors(...))`
- [ ] Create all TypeScript model interfaces (`core/models/`)
- [ ] Implement `core/config.ts` (API base URL)
- [ ] Set up i18n: `I18nService`, translation JSON files, `translate` pipe
- [ ] Set up theming: `ThemeService`, CSS custom properties, `data-theme` toggle
- [ ] Set up RTL: `dir` attribute toggling based on language

---

### Phase 2: Auth & Layout (Days 3-4)

> Depends on: Phase 1

- [ ] Implement `AuthService` (login, logout, token storage, `me()`, profile, password)
- [ ] Implement `authInterceptor`, `languageInterceptor`, `errorInterceptor`
- [ ] Create `authGuard` and `roleGuard`
- [ ] Build **Login page** (form, validation, error handling)
- [ ] Build **Shell layout** (sidebar + header + router-outlet)
- [ ] Build **Sidebar** (role-based menu, active route highlighting, collapse behavior)
- [ ] Build **Header** (user info, language toggle, theme toggle, logout)
- [ ] Set up route configuration with lazy loading
- [ ] Role-based redirect on login (Admin/Recep → dashboard, Doctor → schedule)

---

### Phase 3: Shared Components (Day 5)

> Depends on: Phase 2

- [ ] `DataTableComponent` (columns config, sorting, row actions)
- [ ] `StatCardComponent` (icon, label, value, accent color)
- [ ] `StatusBadgeComponent` (status → color mapping)
- [ ] `ModalComponent` (overlay, close on escape/backdrop)
- [ ] `ConfirmDialogComponent`
- [ ] `SearchInputComponent` (debounced)
- [ ] `PaginationComponent`
- [ ] `TimeSlotGridComponent` (visual 15-min slot picker)
- [ ] `LoadingSpinnerComponent`
- [ ] `EmptyStateComponent`
- [ ] `ToastComponent` (success/error/warning notifications)
- [ ] `FormFieldComponent` (label + error messages)

---

### Phase 4: Dashboard & Calendar (Days 6-7)

> Depends on: Phase 3

- [ ] Implement `DashboardService` → `GET /api/dashboard/stats`
- [ ] Build **Dashboard page** (stat cards grid: total, confirmed, arrived, completed, no-show, revenue)
- [ ] Implement `AppointmentService` → `GET /api/appointments` (day calendar)
- [ ] Build **Day Calendar page** (date picker, doctor filter, status filter, appointments table)
- [ ] Implement appointment status actions: check-in, no-show, cash-paid, cancel
- [ ] Build action buttons with confirmation dialogs

---

### Phase 5: Walk-in Booking & Patients (Days 8-9)

> Depends on: Phase 4

- [ ] Implement `PatientService` → create, search
- [ ] Implement `DoctorService` → list, slots
- [ ] Build **Patients List page** (search, create patient modal)
- [ ] Build **Walk-in Booking page**:
  - Patient selector (search existing / create new)
  - Doctor selector
  - Service selector
  - Date picker
  - Slot grid (real-time from API)
  - Booking confirmation
- [ ] Build **Reschedule modal** (date + slot picker)

---

### Phase 6: Services & Availability (Days 10-11)

> Depends on: Phase 3

- [ ] Implement `ServiceService` → CRUD
- [ ] Build **Services Management page** (table, add/edit/delete modals)
- [ ] Implement `DoctorService` → availability, blocked dates
- [ ] Build **Doctor Availability page**:
  - Weekly availability editor (day-of-week, start/end time)
  - Blocked dates calendar (add/remove)

---

### Phase 7: Staff Management — Admin (Day 12)

> Depends on: Phase 3

- [ ] Implement `AdminService` → staff list, add doctor/receptionist, update, activate/deactivate
- [ ] Build **Staff Management page** (table with role chips, active/inactive toggle)
- [ ] Build **Add Doctor modal** (form with specialization, bio, photo)
- [ ] Build **Add Receptionist modal** (form)
- [ ] Build **Credentials Display modal** (shown after creation with temp password)
- [ ] Build **Edit Staff modal**

---

### Phase 8: Doctor Features (Days 13-14)

> Depends on: Phase 3

- [ ] Implement `DoctorService` → `GET /api/doctor/schedule`
- [ ] Build **My Schedule page** (today's appointments for logged-in doctor, date selector)
- [ ] Build **Visit Form** (diagnosis, notes, prescription items – dynamic form array)
- [ ] Implement complete visit flow: record visit → complete appointment
- [ ] Implement `PatientService` → `GET /api/patients/{id}/history`
- [ ] Build **Patient History page** (past visits with prescriptions)

---

### Phase 9: Reports — Admin (Day 15)

> Depends on: Phase 3

- [ ] Implement `AdminService` → `GET /api/admin/reports`
- [ ] Build **Reports page** with charts:
  - Appointments by status (pie/donut chart)
  - Revenue by day (line/bar chart)
  - Revenue by service (bar chart)
  - Doctor utilization (bar chart)
  - No-show rate (single metric card)
- [ ] Use lightweight charting: Canvas-based (e.g., Chart.js) or SVG-based

---

### Phase 10: Profile & Polish (Day 16)

> Depends on: Phase 2

- [ ] Build **Profile page** (edit name, phone, avatar)
- [ ] Build **Change Password section**
- [ ] Final responsive testing (desktop, tablet, mobile)
- [ ] RTL testing with Arabic translations
- [ ] Dark mode testing
- [ ] Error state testing (API down, 409 conflicts, validation errors)
- [ ] Loading state polish (skeletons vs spinners)
- [ ] Accessibility review (focus management, ARIA labels, keyboard navigation)

---

## Open Questions

> [!IMPORTANT]
> **Figma access**: I cannot programmatically parse the Figma design file. Could you:
> 1. Share screenshots of key pages (especially dashboard, calendar, walk-in booking, doctor schedule), or
> 2. Provide a Figma access token so I can use the Figma API, or
> 3. Confirm that I should replicate the **already-deployed staff website** design at `https://clinic.kaessam.codes/staff`?

> [!IMPORTANT]
> **Charting library**: For the Reports page, do you have a preference for a charting library? Options:
> - **Chart.js** (lightweight, Canvas-based)
> - **ngx-charts** (Angular-native, SVG)
> - **Custom SVG** (no dependency, hand-built)

> [!IMPORTANT]
> **Deployment target**: The existing site at `/staff/` uses `<base href="/staff/">`. Should the Angular app be built with this same base href for deployment behind the same reverse proxy, or will it be deployed standalone on a different path/domain?

> [!IMPORTANT]
> **Existing code**: The deployed staff dashboard already has Angular 20 code running at `clinic.kaessam.codes/staff`. Is there an **existing codebase** I should build upon (a Git repo), or am I building this from scratch?
