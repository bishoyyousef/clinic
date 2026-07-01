# Clarity Clinic - Frontend Technical Implementation Guide

Welcome to the technical implementation guide for the Clarity Clinic Staff Dashboard. This document is designed to serve as a comprehensive handover manual for new team members, beginner Angular developers, and senior engineers alike. It explains what was built, how it is structured, the design patterns used, and the reasoning behind architectural decisions.

---

## 1. Project Overview

### What the Project Is
The **Clarity Clinic Staff Dashboard** is a premium, high-fidelity web application built for clinic administrators, receptionists, and medical specialists. It serves as a unified command center to manage clinic operations, patient records, staff directories, appointment scheduling, walk-in bookings, doctor availabilities, and operational analytics.

### Scope of Implementation
The application is fully functional and integrates with a live backend API (`https://api.clinic.kaessam.codes/api`). The core pillars implemented include:
*   **Authentication & Session Management**: Secure portal access with JWT credentials, automatic header injection, and role-based route protection.
*   **Operational Scheduling (Calendar & Appointments)**: A weekly calendar board mapping appointments per specialist, supporting statuses like Checked-In, Completed, No-Show, and Cancelled.
*   **Walk-in Booking Wizard**: A 5-step stepper interface that handles patient lookup (existing) or registration (new), specialist assignment, service selection, time slot query, and final checkout.
*   **Staff Portal Directory**: A management board for registering specialists/receptionists, tracking details, issuing temporary access keys, and toggling portal access.
*   **Analytics & Financial Reports**: High-fidelity operational summaries featuring custom CSS visualizations of daily revenue columns, service value contributions, and doctor utilization rates.
*   **Profile & Security Settings**: Self-service profile editing and password changing with matches validation.

### Technologies & Design Patterns Chosen

#### 1. Angular Standalone Components
*   **Why**: Standalone components eliminate the need for complex, heavy `NgModule` declarations. Each component declares its own imports, which simplifies dependency management, enhances modularity, and enables more efficient tree-shaking.
*   **Project Context**: Every major view—such as [`staff.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/staff/staff.component.ts), [`reports.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/reports/reports.component.ts), and [`profile.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/profile/profile.component.ts)—is declared as a standalone component importing only the specific dependencies it requires (e.g., `CommonModule`, `ReactiveFormsModule`).

#### 2. Angular Signals (State Management)
*   **Why**: Signals represent the modern, reactive reactivity model in Angular. Instead of executing heavy, global change detection cycles (Zone.js), Signals allow the framework to track precisely where values are used and update the DOM in a granular fashion.
*   **Project Context**: We use Signals to manage UI states (e.g., `isLoading = signal(false)`), filter inputs (e.g., `filterDoctorId = signal('')`), and computed properties (e.g., `weekDays = computed(() => { ... })` in [`appointments.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/appointments/appointments.component.ts)).

#### 3. Angular Dependency Injection (DI)
*   **Why**: DI decouples components from their service dependencies. By using `inject(ServiceClass)` inside standalone components, we make them modular, testable, and maintainable.
*   **Project Context**: Services like `AuthService`, `AdminService`, and `ToastService` are injected reactively using the modern `inject()` token instead of verbose constructor declarations.

#### 4. Component-Scoped Services
*   **Why**: Services encapsulate the business logic and API communication. Components act purely as the "view controllers," keeping their TypeScript files clean and focused on binding data to templates.
*   **Project Context**: The [`appointment.service.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/services/appointment.service.ts) manages operations like `getCalendar()`, `walkIn()`, and `reschedule()`, exposing clean, strongly-typed RxJS `Observable` streams to the components.

#### 5. HTTP Interceptors
*   **Why**: Interceptors act as a central middleware pipeline for outgoing requests and incoming responses. We use them to inject Authorization tokens automatically and catch HTTP errors globally, avoiding duplicate boilerplate code across services.
*   **Project Context**: [`auth.interceptor.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/interceptors/auth.interceptor.ts) automatically appends JWT tokens to all requests, while [`error.interceptor.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/interceptors/error.interceptor.ts) handles token expirations, access denials, and backend server errors globally.

#### 6. Custom Vanilla CSS with Design Tokens
*   **Why**: To deliver a premium, glassmorphism-inspired dark and light theme, we avoided generic utility frameworks. We built a custom design system utilizing CSS Custom Properties (variables) for harmonious spacing scales, color palettes, and transition curves.
*   **Project Context**: Visual aesthetics are governed by design tokens in [`variables.css`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/styles/variables.css), enabling smooth theme switches and unified styles across all custom dashboards.

---

## 2. Complete Project Structure Explanation

```
src/
├── app/
│   ├── core/                  # Core infrastructure (Singletons, Services, Guards, Models)
│   │   ├── config.ts          # Application-wide configurations and constants
│   │   ├── guards/            # Navigation guards for route access control
│   │   │   ├── auth.guard.ts  # Verifies session status before route entry
│   │   │   └── role.guard.ts  # Enforces role-based permissions (Admin, Receptionist, Doctor)
│   │   ├── interceptors/      # HTTP request and response middleware
│   │   │   ├── auth.interceptor.ts    # Appends JWT Bearer tokens to headers
│   │   │   ├── error.interceptor.ts   # Catches HTTP errors and shows Toast notifications
│   │   │   └── language.interceptor.ts# Appends language preferences to requests
│   │   ├── models/            # Strongly-typed TypeScript interfaces matching API DTOs
│   │   │   ├── auth.model.ts          # Interfaces for LoginRequest, UserDto, and tokens
│   │   │   ├── admin.model.ts         # Interfaces for StaffDto and registration requests
│   │   │   ├── doctor.model.ts        # Interfaces for DoctorListItemDto and slot responses
│   │   │   ├── appointment.model.ts   # Interfaces for AppointmentDto and walk-in requests
│   │   │   ├── patient.model.ts       # Interfaces for PatientDto and search requests
│   │   │   ├── service.model.ts       # Interfaces for ServiceDto and service requests
│   │   │   └── reports.model.ts       # Interfaces for ReportsDto and charts data
│   │   └── services/          # API communication services (Injectable Singletons)
│   │       ├── auth.service.ts        # Handles user login, profile retrieval, and updates
│   │       ├── admin.service.ts       # Roster management and reports analytics queries
│   │       ├── doctor.service.ts      # Querying slots, schedules, and blocking dates
│   │       ├── appointment.service.ts # Rescheduling, walk-ins, check-ins, and payments
│   │       ├── patient.service.ts     # CRUD operations for patients and directories
│   │       ├── service.service.ts     # Services registry CRUD operations
│   │       └── toast.service.ts       # Global toast messaging system using Signals
│   ├── layout/                # Global shell and navigation layouts
│   │   ├── shell/             # ShellComponent: contains sidebar, header, and router-outlet
│   │   └── sidebar/           # SidebarComponent: maps routes to links, checks user roles
│   ├── shared/                # Global reusable presentational UI components
│   │   └── components/        # Reusable buttons, cards, modals, data tables, loaders
│   └── features/              # Lazy-loaded feature modules (Views)
│       ├── appointments/      # Weekly calendar board and scheduling lists
│       ├── auth/              # Login portal and credentials validation
│       ├── dashboard/         # Landing dashboard containing quick summaries
│       ├── doctors/           # Doctor rosters and weekly availability editors
│       ├── patients/          # Patient directories and medical history
│       ├── profile/           # User profile editing and password resets
│       ├── reports/           # Financial reporting and operational charts
│       ├── services/          # Medical treatments and services CRUD
│       ├── staff/             # Portal directory for registering clinic staff
│       └── walk-in/           # 5-step walk-in booking wizard
└── styles/                    # Global design token stylesheets
    ├── variables.css          # Color tokens, spacing scale, border radii, transitions
    └── global.css             # Resets, global fonts, scrollbars, and shared layouts
```

### Folder Purpose and Rules

*   **`core/`**: Contains the application's engine. Any service, guard, or interceptor that must exist as a singleton throughout the app belongs here. Feature components must never declare private instances of these services; they must use Angular's DI.
    *   *`core/guards/`*: Protects routing paths. For example, [`role.guard.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/guards/role.guard.ts) reads user claims to block unauthorized portal access.
    *   *`core/interceptors/`*: Intercepts and alters network requests and responses. For example, [`auth.interceptor.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/interceptors/auth.interceptor.ts) automatically injects authorization tokens, while [`error.interceptor.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/interceptors/error.interceptor.ts) handles token expirations, access denials, and backend server errors globally.
    *   *`core/models/`*: Ensures type safety. Holds contracts representing JSON payloads exchanged with the backend.
    *   *`core/services/`*: Houses stateless singletons communicating with endpoints.
*   **`shared/`**: Contains presentational components. These components have no knowledge of business logic, feature states, or API routes. They receive data through `@Input` (or signals) and emit actions through `@Output`. For example, `DataTableComponent` simply renders whatever rows and columns are passed to it.
*   **`features/`**: Houses the views. Each folder represents a unique routing page. Components inside features connect the `core` services with the `shared` components. They are lazy-loaded to optimize the initial bundle size.

---

## 3. Architecture Flow

The application implements a strict unidirectional data flow and clean separation of concerns, moving from the user interface down to the network layer, and back up to trigger granular UI renders.

```
[ User Action: Click Button ]
             ↓
[ Component (View Controller) ] ──(Trigger Action)──> [ State Signal (isLoading = true) ]
             ↓
[ Core Service Method ]
             ↓
[ HttpInterceptor (Attach Token) ]
             ↓
[ HttpClient (HTTP request) ] ──────> [ Live Backend API ]
                                            │
[ UI Signal Update ] <──(Set Signal)── [ Response DTO Model ] <── (JSON Response) ┘
             ↓
[ Granular DOM Render (isLoading = false) ]
```

### Detailed Execution Flow (Example: Patient Search)
1.  **Route Loading**: The router navigates to `/walk-in` and lazy-loads the `WalkInComponent`.
2.  **User Input**: The user types a name in the search bar. The template captures the keystroke and calls `onSearchQueryChange(query)`.
3.  **Service Request**: The query is pushed into an RxJS `Subject` that debounces input. The stream switches to call `PatientService.search(query)`.
4.  **Network Transport**: Angular's `HttpClient` triggers a `GET` request. The `authInterceptor` intercepts the request and appends the `Authorization: Bearer <token>` header.
5.  **API Resolution**: The backend API processes the query and returns a JSON array of matching patients.
6.  **Type Validation**: The response is mapped and typed against the `PatientDto` model interface.
7.  **Signal Update**: The component's `matchingPatients` Signal is set with the returned array: `matchingPatients.set(res)`.
8.  **Granular Render**: Because the HTML template reads the `matchingPatients()` Signal inside an `*ngFor` loop, Angular updates only that specific portion of the DOM, hiding the loading spinner and rendering the patient cards.

---

## 4. File-by-File Explanation

### Core Architecture & Routing

#### 1. [`app.routes.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/app.routes.ts)
*   **Role**: Contains the central routing dictionary.
*   **Content**: Registers lazy-loaded feature paths under the authenticated `ShellComponent` layout.
*   **Key Concept**: Lazy loading. Paths like `/staff` and `/reports` are guarded by `roleGuard(['Admin'])`. The newly added `/calendar` and `/availability` paths are registered here to load `AppointmentsComponent` and `DoctorsComponent`.
*   **Imports/Exports**: Imports guards (`authGuard`, `roleGuard`). Exported as `routes: Routes` and consumed by `app.config.ts`.

#### 2. [`auth.interceptor.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/interceptors/auth.interceptor.ts)
*   **Role**: HTTP outgoing middleware.
*   **Content**: Clones HTTP requests and appends the Bearer token.
*   **Key Function**: `authInterceptor: HttpInterceptorFn`.
*   **Imported By**: Registered globally in `app.config.ts`.

#### 3. [`error.interceptor.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/interceptors/error.interceptor.ts)
*   **Role**: HTTP incoming response middleware.
*   **Content**: Globally catches HTTP failure codes and triggers user-facing notifications.
*   **Key Concept**: Parses structured `ApiError` responses. A `401 Unauthorized` automatically wipes the local token and redirects to `/login`. Other errors (400, 403, 404, 500) trigger corresponding `ToastService` notices.

#### 4. [`auth.service.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/core/services/auth.service.ts)
*   **Role**: Session state manager.
*   **Content**: Handles login, logout, and self-profile updates.
*   **Important Functions**:
    *   `updateProfile(request: UpdateProfileRequest)`: `PUT` to `/api/auth/profile`. Updates the local `currentUser` signal.
    *   `changePassword(request: ChangePasswordRequest)`: `PUT` to `/api/auth/password`.

---

### Features & Layout Components

#### 5. [`staff.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/staff/staff.component.ts)
*   **Role**: Controller for the staff directory view at `/staff`.
*   **Responsibilities**:
    *   **TypeScript**: Manages staff state signals (`staffList`, `isLoading`, `isFormOpen`, `tempCredentials`). Instantiates a `FormGroup` with dynamic validators (e.g., `specialization` is required only if role is `Doctor`). Calls `AdminService` to register members, toggle active flags, and clear credential states.
    *   **HTML**: Renders the page header, integrates the reusable `DataTableComponent`, and embeds a `ModalComponent` containing the reactive form.
    *   **CSS**: Styled by `staff.component.css`. Handles role-specific badges, grid margins, and modal forms.

#### 6. [`reports.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/reports/reports.component.ts)
*   **Role**: Controller for the analytics dashboard at `/reports`.
*   **Responsibilities**:
    *   **TypeScript**: Queries `AdminService.getReports()` on initialization. Uses computed getters (`totalRevenue`, `maxDayRevenue`) to process financial arrays for the UI.
    *   **HTML**: Binds operational card values and draws pure-CSS graphics (charts).
    *   **CSS**: Styled by `reports.component.css`. Defines column heights, horizontal progress bar alignments, and hover tooltips.

#### 7. [`profile.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/profile/profile.component.ts)
*   **Role**: User settings panel at `/profile`.
*   **Responsibilities**:
    *   **TypeScript**: Pre-fills fields from `AuthService.currentUser()` reactively using an Angular `effect()`. Defines a custom `passwordMatchValidator` for the password modification form.
    *   **HTML**: Renders a two-column layout. The left column shows a user card with initials; the right column renders the personal details and password forms.
    *   **CSS**: Scoped styling in `profile.component.css` handles the split layout grid and input card borders.

---

## 5. Website → Code Mapping

Understanding how user actions in the browser map directly to execution blocks in the codebase is essential for debugging.

```
[ User Clicks "Add Staff Member" ]
             ↓
[ staff.component.html: (click)="openCreateModal()" ]
             ↓
[ staff.component.ts: openCreateModal() ]
             ↓
[ staffForm.reset() & isFormOpen.set(true) ]
             ↓
[ staff.component.html: <app-modal [isOpen]="isFormOpen()"> renders form ]
```

### Detailed Event Sequences

#### 1. User Logs In
*   **Website**: User types email/password on `/login` and clicks "Login".
*   **Code**:
    1.  `LoginComponent.html` captures inputs and submits via `(ngSubmit)="onSubmit()"`.
    2.  `LoginComponent.ts` intercepts the event, validates the reactive form, and calls `AuthService.login({ email, password })`.
    3.  `AuthService.ts` executes a `POST` request to `/api/auth/login`.
    4.  The request goes through `HttpClient`, gets caught by `authInterceptor`, and hits the backend.
    5.  On success, `AuthService` stores the JWT token in `localStorage`, sets `currentUser` Signal, and calls `Router.navigate(['/dashboard'])`.

#### 2. Opening the Calendar View
*   **Website**: User clicks "Calendar" in the sidebar.
*   **Code**:
    1.  `SidebarComponent` captures link click, triggering `RouterLink` to `/calendar`.
    2.  `app.routes.ts` matches `/calendar` path and lazy-loads `AppointmentsComponent`.
    3.  `AppointmentsComponent.ngOnInit()` fires.
    4.  Calls `loadDoctors()` and `loadAppointments()`.
    5.  In calendar view, `loadAppointments()` computes the weekly array of dates using `weekDays()` Signal, maps them to 7 concurrent HTTP requests, and executes them in parallel via `forkJoin`.

#### 3. Searching Patients in Walk-in Wizard
*   **Website**: User types in the search input on step 1 of Walk-in Booking.
*   **Code**:
    1.  `WalkInComponent.html` captures input with `(ngModelChange)="onSearchQueryChange($event)"`.
    2.  `onSearchQueryChange()` pushes the query string into `searchSubject` (an RxJS Subject).
    3.  The subject debounces inputs by 300ms, filters out duplicates, and switches the stream to call `PatientService.search(query)`.
    4.  The returned patient list updates the `matchingPatients` Signal, which automatically renders search result cards in the template.

#### 4. Registering a New Staff Member
*   **Website**: User completes the registration form and clicks "Register Account".
*   **Code**:
    1.  `StaffComponent.onSubmit()` validates form controls.
    2.  Sets `isSubmitting` Signal to `true`.
    3.  Depending on the role, calls `AdminService.addDoctor` or `addReceptionist`.
    4.  API returns the created staff details and a temporary password.
    5.  `tempCredentials` Signal is set, which renders the temporary credentials warning banner.
    6.  `loadStaff()` is invoked in the background to reload the data table.

---

## 6. Code → Website Reflection

This section explains what happens internally in the codebase when a method is executed, and how it translates to the user's browser experience.

### 1. `AdminService.getReports()`
*   **Internal Execution**: Sends a `GET` request to `/api/admin/reports`.
*   **Data Returned**: A `ReportsDto` containing revenue trends, status counts, service revenues, and doctor utilization rates.
*   **User Reflection**:
    1.  The user sees a loading spinner overlay.
    2.  Once completed, the spinner hides, and the summary statistics cards (e.g., Total Revenue, Completed Visits) animate into view.
    3.  The daily financial column graph draws vertical bars with heights matching their percentage values.
    4.  Specialist utilization rates render progress bars indicating scheduling efficiency.

### 2. `AuthService.changePassword(request)`
*   **Internal Execution**: Sends a `PUT` request to `/api/auth/password` carrying the current and new passwords.
*   **User Reflection**:
    1.  The "Update Password" button shows a loading spinner and is disabled to prevent double submissions.
    2.  If the current password is incorrect, the error interceptor captures the API error, throws it, and a red error toast is displayed.
    3.  On success, a green success toast appears, the password form is reset, and all validation error states are cleared.

---

## 7. Important Angular Concepts Used (Beginner's Tutorial)

### 1. Standalone Components
*   **The Problem**: Traditional Angular required declaring components in `NgModule` files. This led to large modules that were difficult to manage, made lazy loading complex, and increased bundle sizes.
*   **The Solution**: Standalone components do not belong to any module. They declare their own dependencies directly in their `@Component` decorator.
*   **Code Example** (from [`profile.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/profile/profile.component.ts)):
    ```typescript
    @Component({
      selector: 'app-profile',
      standalone: true,
      imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
      template: `
        <div class="profile-container">
          <h1 class="page-title">Profile Settings</h1>
          <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
            <!-- Name Input -->
            <input formControlName="displayName" />
            <app-button type="submit">Save Changes</app-button>
          </form>
        </div>
      `,
      styleUrl: './profile.component.css'
    })
    export class ProfileComponent {}
    ```

### 2. Angular Signals
*   **The Problem**: Zone.js change detection checked the entire component tree for updates when any event occurred, which could impact performance in complex UIs.
*   **The Solution**: Signals provide a reactive wrapper around state values. They notify Angular exactly which templates read their values, allowing the framework to update only the corresponding parts of the DOM.
*   **Code Example** (from [`reports.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/reports/reports.component.ts)):
    ```typescript
    // Declare a signal inside the component
    isLoading = signal<boolean>(true);
    reportsData = signal<ReportsDto | null>(null);

    loadReports(): void {
      this.isLoading.set(true); // Setting the signal value
      this.adminService.getReports().subscribe({
        next: (data) => {
          this.reportsData.set(data);
          this.isLoading.set(false); // Granular DOM updates are triggered here
        }
      });
    }
    ```

### 3. Dependency Injection (DI)
*   **The Problem**: Creating instances of services manually (e.g., `const service = new AuthService()`) couples classes tightly, makes mock testing difficult, and violates the singleton pattern.
*   **The Solution**: Angular's DI framework instantiates and delivers singletons automatically.
*   **Code Example** (from [`walk-in.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/walk-in/walk-in.component.ts)):
    ```typescript
    export class WalkInComponent implements OnInit {
      // Inject services cleanly using the inject() function
      private patientService = inject(PatientService);
      private doctorService = inject(DoctorService);
      
      ngOnInit() {
        this.doctorService.getAll().subscribe(res => { ... });
      }
    }
    ```

### 4. Lazy Loading & Route Guards
*   **The Problem**: Loading all features during initial page load increases the bundle size, slowing down the application's startup. Additionally, unauthorized users could access restricted pages by typing URLs directly.
*   **The Solution**: Lazy loading loads feature chunks only when the user navigates to them. Route guards intercept navigation to verify authentication and role permissions.
*   **Code Example** (from [`app.routes.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/app.routes.ts)):
    ```typescript
    {
      path: 'staff',
      canActivate: [roleGuard(['Admin'])], // Guard prevents unauthorized roles
      loadComponent: () => 
        import('./features/staff/staff.component').then(
          (m) => m.StaffComponent
        ) // Lazy-loads staff chunk only on route entry
    }
    ```

### 5. Reactive Forms
*   **The Problem**: Template-driven forms put validation logic in the HTML, making it difficult to write unit tests, handle dynamic validation, or track pristine/dirty states cleanly.
*   **The Solution**: Reactive forms declare the form model explicitly in TypeScript, providing programmatic access to values, validators, and statuses.
*   **Code Example** (from [`staff.component.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/features/staff/staff.component.ts)):
    ```typescript
    this.staffForm = this.fb.group({
      role: ['Doctor', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{6,16}$/)]],
      specialization: ['', [Validators.required]]
    });
    ```

---

## 8. Team Handover Section (What the Next Developer Needs to Know)

Welcome to the Clarity Clinic team! Here is what you need to know to get up to speed quickly and maintain the codebase effectively.

### 1. Core Files to Study First
Before writing any code, review these foundational files:
1.  **[`variables.css`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/styles/variables.css)**: Understand the theme tokens. Never use hardcoded colors (like `#000` or `red`) in component CSS; always use variables like `var(--surface)` or `var(--accent)`.
2.  **[`global.css`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/styles/global.css)**: Review the shared layout utility classes (`.page-header`, `.page-title`, `.page-subtitle`, `.loading-state`). Always reuse these classes instead of writing new CSS for page headers.
3.  **[`app.routes.ts`](file:///c:/Users/hp/Desktop/frontend%20projects/clinic/src/app/app.routes.ts)**: Study the routing structure and how guards are applied.

### 2. Common Design Patterns
*   **Reactive Forms**: Use Angular's `FormBuilder` to construct forms. Perform all validations (e.g., email pattern, phone pattern, required fields) in TypeScript, and display user-friendly error messages using conditional `*ngIf` checks in the template.
*   **State Signals**: Use Signals for all local UI states (e.g., toggling forms, tracking loading states, managing search results).
*   **Shared UI Components**: Before building a button, modal, or table, check the `/shared` folder. Use the existing components (`<app-button>`, `<app-modal>`, `<app-data-table>`) to keep the UI consistent.

### 3. Mistakes to Avoid
*   ❌ **Do not import `HttpClientModule` in standalone components**. HTTP utilities are configured globally in `app.config.ts`.
*   ❌ **Do not bypass the proxy in development**. Never use absolute URLs (like `https://api.clinic...`) inside services. Always use relative URLs (like `${API_BASE_URL}/appointments`). The dev server proxy configured in `proxy.conf.json` handles routing requests to the target API server automatically, preventing CORS errors.
*   ❌ **Do not write duplicate keyframe animations**. Keyframe animations like `@keyframes fadeIn` are defined globally in `global.css` and can be used directly in component stylesheets.

---

## 9. Development Workflow: How to Add a New Feature

Follow this step-by-step workflow when extending the Clarity Clinic application:

```
[ Step 1: Create Folder ] ──> [ Step 2: Create DTO Models ] ──> [ Step 3: Create Service ]
                                                                          │
[ Step 6: Register Route ] <── [ Step 5: Style View ] <── [ Step 4: Create Component ]
```

### Detailed Workflow Steps

#### Step 1: Create the Feature Folder
Create a new subdirectory under `src/app/features/` (e.g., `features/inventory`).

#### Step 2: Create DTO Model Interfaces
Define the data structures returned by the API inside a new model file under `src/app/core/models/` (e.g., `core/models/inventory.model.ts`):
```typescript
export interface InventoryItemDto {
  id: number;
  itemName: string;
  quantity: number;
}
```

#### Step 3: Create the Injectable Service
Create a service under `src/app/core/services/` to handle API communication:
```typescript
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  getItems(): Observable<InventoryItemDto[]> {
    return this.http.get<InventoryItemDto[]>(`${API_BASE_URL}/inventory`);
  }
}
```

#### Step 4: Create the Standalone Component
Create the component file (e.g., `inventory.component.ts`):
*   Set `standalone: true`.
*   Inject the new service in the constructor or via `inject(InventoryService)`.
*   Declare state Signals to hold the data and manage loading states.
*   Implement `ngOnInit` to call the service and populate the Signals.

#### Step 5: Add Component Styles
Write component-specific styles in the CSS stylesheet (e.g., `inventory.component.css`):
*   Ensure the file is optimized and stays under the **4.00 kB** budget.
*   Reuse global utility classes from `global.css`.

#### Step 6: Register the Route
Add the new path to the lazy-loaded children array in `app.routes.ts`:
```typescript
{
  path: 'inventory',
  canActivate: [roleGuard(['Admin'])],
  loadComponent: () => import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
}
```

---

## 10. Current Implementation Status

### Core Infrastructure
*   [x] JWT Authentication & Local Session Storage
*   [x] Global Auth Token Header Injection (`authInterceptor`)
*   [x] Global HTTP Error Interception & User Notification (`errorInterceptor`)
*   [x] Standardised Global Theme Variables & Reset Styles

### Feature Modules
*   [x] **Staff Management Portal**: Roster loading, receptionist/doctor creation, account suspension toggle, temporary credential display.
*   [x] **Reports & Analytics Dashboard**: Summary statistics cards, daily financial column charts, service contribution progress bars, doctor utilization ratios.
*   [x] **Profile & Security Settings**: Pre-filled profile details form, custom password mismatch validators.
*   [x] **Walk-in Booking Wizard**: 5-step stepper interface, existing patient lookup, new patient registration, doctor/service selectors, availability slot checkers, final appointment submissions.
*   [x] **Appointments & Calendar Board**: Weekly scheduling columns, calendar navigation controls, status workflows.
*   [x] **Services Management Board**: Services listing, creation, modification, and deletion.

---

*This guide serves as the official design document and implementation manual for Clarity Clinic's frontend architecture. Ensure all future additions align with these established patterns.*
