# Shared Components System Reference

This document describes the shared UI components of the Clarity Clinic Staff Dashboard, detailing their input/output contracts, template customization hooks, and implementation examples.

---

## 1. Overview of Shared System

Shared components are presentation-only, layout-agnostic components located in `src/app/shared/components/`. They are designed to receive configuration inputs and emit user actions, promoting visual consistency and code reusability.

---

## 2. Core Shared Components

### 1. Data Table Component (`<app-data-table>`)
- **Location**: `src/app/shared/components/data-table/`
- **Purpose**: Displays tabular records with header sorting and custom cell template injections.
- **Inputs**:
  - `columns: TableColumn[]`: Column structure definitions containing key labels and rendering formats.
  - `data: any[]`: Data rows list.
  - `sortKey: string`: Initial column sorting target.
  - `sortDirection: 'asc' | 'desc'`: Sorting order toggle.
  - `customCellTemplate: TemplateRef<any>`: Handle for injecting custom template structures for cells marked as `type: 'custom'`.
- **Outputs**:
  - `sortChange: EventEmitter<{ key: string; direction: 'asc' | 'desc' }>`
- **Example Usage**:
  ```html
  <app-data-table
    [columns]="columns"
    [data]="appointments()"
    [customCellTemplate]="cellTemplate"
  >
    <ng-template #cellTemplate let-row="row" let-column="column">
      <span *ngIf="column.key === 'time'">{{ row.startTime }}</span>
    </ng-template>
  </app-data-table>
  ```

---

### 2. Modal Component (`<app-modal>`)
- **Location**: `src/app/shared/components/modal/`
- **Purpose**: Floating screen overlays wrapping stepper wizards or details forms.
- **Inputs**:
  - `isOpen: boolean`: Triggers visibility.
  - `title: string`: Header text.
  - `size: 'sm' | 'md' | 'lg'`: Window sizing.
  - `hasFooter: boolean`: Optional toggle to render action slots at the bottom.
- **Outputs**:
  - `close: EventEmitter<void>`: Emits when clicking the close (X) button or backdrop overlay.
- **Example Usage**:
  ```html
  <app-modal [isOpen]="isOpen()" title="Confirm Details" (close)="onClose()">
    <p>Do you want to check in this patient?</p>
    <div modal-footer>
      <app-button variant="secondary" (click)="onClose()">Cancel</app-button>
      <app-button (click)="onConfirm()">Confirm</app-button>
    </div>
  </app-modal>
  ```

---

### 3. Button Component (`<app-button>`)
- **Location**: `src/app/shared/components/button/`
- **Purpose**: Primary, secondary, and text actions with built-in loading states and layouts.
- **Inputs**:
  - `type: 'button' | 'submit'`: Native button behavior.
  - `variant: 'primary' | 'secondary' | 'danger' | 'text'`: Styles.
  - `size: 'sm' | 'md' | 'lg'`: Dimensions.
  - `loading: boolean`: Renders a loading spinner inside the button and disables interaction.
  - `disabled: boolean`: Disables interactions.
- **Example Usage**:
  ```html
  <app-button [loading]="isSubmitting()" variant="primary">
    Register Patient
  </app-button>
  ```

---

### 4. Status Badge Component (`<app-status-badge>`)
- **Location**: `src/app/shared/components/status-badge/`
- **Purpose**: Formats status categories into colored badges (e.g. Completed, Cancelled, Confirmed, NoShow).
- **Inputs**:
  - `status: string`: Category keyword.

---

## 3. Developer Onboarding Notes

> [!IMPORTANT]
> **Use Custom Cells Wisely**: For custom rendering in tables (e.g. actions buttons, status badges, profile links), specify `type: 'custom'` in the columns array and use the custom template context.
> **Inherit Global Styles**: Shared components utilize global CSS design tokens (`var(--accent)`, `var(--surface)`, `var(--r)`). Do not hardcode HEX or RGB values inside them.
