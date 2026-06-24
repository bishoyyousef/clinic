import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface FilterOption {
  value: any;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="filterForm" class="filter-bar">
      <div class="filter-fields">
        <div *ngFor="let field of fields" class="filter-group">
          <label [for]="field.key" class="filter-label">{{ field.label }}</label>
          
          <ng-container [ngSwitch]="field.type">
            <!-- Select dropdown -->
            <select 
              *ngSwitchCase="'select'"
              [id]="field.key"
              [formControlName]="field.key"
              class="filter-control"
            >
              <option value="">{{ field.placeholder || 'All' }}</option>
              <option *ngFor="let opt of field.options" [value]="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <!-- Date picker -->
            <input 
              *ngSwitchCase="'date'"
              type="date"
              [id]="field.key"
              [formControlName]="field.key"
              class="filter-control"
            />

            <!-- Checkbox / Toggle -->
            <div *ngSwitchCase="'boolean'" class="filter-checkbox-group">
              <input 
                type="checkbox"
                [id]="field.key"
                [formControlName]="field.key"
                class="filter-checkbox"
              />
              <label [for]="field.key" class="filter-checkbox-label">
                {{ field.placeholder || field.label }}
              </label>
            </div>

            <!-- Standard text input -->
            <input 
              *ngSwitchDefault
              type="text"
              [id]="field.key"
              [formControlName]="field.key"
              [placeholder]="field.placeholder || ''"
              class="filter-control"
            />
          </ng-container>
        </div>
      </div>

      <div class="filter-actions" *ngIf="showReset && hasActiveFilters()">
        <button type="button" class="btn-reset" (click)="onReset()">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>Reset Filters</span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--s4);
      background-color: var(--surface);
      padding: var(--s4) var(--s6);
      border: 1px solid var(--border);
      border-radius: var(--r);
      width: 100%;
    }
    .filter-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--s4);
      flex-grow: 1;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--s1-5);
    }
    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .filter-control {
      height: 38px;
      padding: 0 var(--s3);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      font-size: 0.875rem;
      background-color: var(--bg);
      color: var(--text);
      transition: all var(--dur) var(--ease);
      width: 100%;
    }
    .filter-control:focus {
      border-color: var(--accent);
      outline: none;
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .filter-checkbox-group {
      display: flex;
      align-items: center;
      height: 38px;
      gap: var(--s2);
    }
    .filter-checkbox {
      width: 16px;
      height: 16px;
      border: 1px solid var(--border);
      border-radius: 4px;
      accent-color: var(--accent);
      cursor: pointer;
    }
    .filter-checkbox-label {
      font-size: 0.875rem;
      color: var(--text);
      cursor: pointer;
      user-select: none;
    }
    .filter-actions {
      display: flex;
      align-items: center;
      height: 38px;
    }
    .btn-reset {
      display: inline-flex;
      align-items: center;
      gap: var(--s1-5);
      padding: 0 var(--s3);
      height: 38px;
      background: none;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--r-sm);
      cursor: pointer;
      transition: all var(--dur) var(--ease);
    }
    .btn-reset:hover {
      color: var(--text);
      background-color: var(--bg);
    }
    @media (max-width: 640px) {
      .filter-fields {
        grid-template-columns: 1fr;
      }
      .filter-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() fields: FilterField[] = [];
  @Input() showReset = true;
  @Input() debounce = 100; // brief debounce to avoid double-triggers on text changes

  @Output() filterChange = new EventEmitter<Record<string, any>>();

  filterForm!: FormGroup;
  private formSub?: Subscription;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const group: Record<string, FormControl> = {};
    
    this.fields.forEach(field => {
      const defaultValue = field.defaultValue !== undefined ? field.defaultValue : (field.type === 'boolean' ? false : '');
      group[field.key] = new FormControl(defaultValue);
    });

    this.filterForm = new FormGroup(group);

    this.formSub = this.filterForm.valueChanges
      .pipe(debounceTime(this.debounce))
      .subscribe(value => {
        this.filterChange.emit(this.cleanValues(value));
      });
  }

  onReset(): void {
    const resetValues: Record<string, any> = {};
    this.fields.forEach(field => {
      resetValues[field.key] = field.defaultValue !== undefined ? field.defaultValue : (field.type === 'boolean' ? false : '');
    });
    this.filterForm.reset(resetValues);
  }

  hasActiveFilters(): boolean {
    if (!this.filterForm) return false;
    const values = this.filterForm.value;
    return Object.keys(values).some(key => {
      const val = values[key];
      if (typeof val === 'boolean') return val === true;
      return val !== null && val !== undefined && val !== '';
    });
  }

  private cleanValues(values: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};
    Object.keys(values).forEach(key => {
      const val = values[key];
      // Keep boolean false/true, but omit empty strings or nulls to keep payload clean
      if (val !== null && val !== undefined && val !== '') {
        clean[key] = val;
      }
    });
    return clean;
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }
}
