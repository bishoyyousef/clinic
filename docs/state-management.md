# State Management Guide

This document describes the state management architecture of the Clarity Clinic Staff Dashboard, detailing the use of Angular Signals, computed signals, stateful singleton services, and local component states.

---

## 1. State Management Philosophy

The application uses **Angular Signals** for reactive state tracking. This provides:
- **Fine-Grained Reactivity**: Only components that consume specific updated signals are re-rendered, bypassing global digest cycles.
- **No Heavy External Stores**: State logic is kept simple and readable within Angular services, avoiding the boilerplate of NgRx or Akita.
- **Declarative Computations**: Derived values are computed automatically, ensuring the UI remains in sync with the source of truth.

---

## 2. Stateful Singleton Services

Global application configurations are stored inside stateful services. These services expose state read-only via Signals and provide public methods to update them:

### `SettingsService`
- **Managed States**:
  - `clinicName`: Dynamic string representing the clinic header branding.
  - `consultationFee`: Price value for standard walk-in consultations.
  - `isDarkTheme`: Boolean indicating system visual preference.
- **Implementation**: Reads initial values from `localStorage` to ensure setting persistence across reloads.
- **Update Method**: Writes changes to backend configurations and updates local Signals in the success pipeline.

### `AuthService`
- **Managed States**:
  - `currentUser`: Decoded details of the authenticated staff member.
  - `isAuthenticated`: Derived computed boolean check.

---

## 3. Local Component States

For views requiring isolated variables (such as query inputs and filters), components define local Signals:

### `CalendarComponent`
- **Signals**:
  - `filterDate`: Selected operating date target (`YYYY-MM-DD`).
  - `filterDoctorId`: Selected doctor specialist GUID filter.
  - `appointments`: Array list of loaded records for the filtered criteria.
- **Derived Computations**:
  - **`selectedDateLabel`**: Automatically formats the active filter date into a readable string (e.g. `Thursday, July 2, 2026`) in local timezone.

---

## 4. Derived Computations & Effects

```typescript
// Example of derived computed signal in SettingsService
public clinicInitials = computed(() => {
  const name = this.clinicName();
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : 'CC';
});
```

---

## 5. Developer Onboarding Notes

> [!TIP]
> **Use Computed Signals for UI Transformations**: Do not call formatter functions directly inside HTML template expressions (e.g. `{{ format(date) }}`). Instead, define a `computed` signal in the component TypeScript class and bind it in the template. This prevents the formatter function from running on every change detection cycle.
> **Signal Mutability Rules**: Always use `.set()` or `.update()` to change a signal's value. Never modify array or object properties inside a signal directly (e.g. do not call `this.appointments().push(newApp)`).
