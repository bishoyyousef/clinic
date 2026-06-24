import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="search-wrapper">
      <span class="search-icon">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
      <input 
        type="text" 
        [formControl]="searchControl" 
        [placeholder]="placeholder" 
        class="search-input"
      />
      <button 
        *ngIf="searchControl.value" 
        class="clear-btn" 
        (click)="onClear()" 
        aria-label="Clear search"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 320px;
    }
    .search-input {
      width: 100%;
      padding: var(--s2) var(--s8) var(--s2) var(--s9);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      font-size: 0.875rem;
      background-color: var(--surface);
      color: var(--text);
      transition: all var(--dur) var(--ease);
    }
    [dir="rtl"] .search-input {
      padding: var(--s2) var(--s9) var(--s2) var(--s8);
    }
    .search-input:focus {
      border-color: var(--accent);
      outline: none;
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .search-icon {
      position: absolute;
      left: var(--s3);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      pointer-events: none;
    }
    [dir="rtl"] .search-icon {
      left: auto;
      right: var(--s3);
    }
    .clear-btn {
      position: absolute;
      right: var(--s3);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      transition: color var(--dur) var(--ease);
    }
    [dir="rtl"] .clear-btn {
      right: auto;
      left: var(--s3);
    }
    .clear-btn:hover {
      color: var(--text);
    }
  `]
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounce = 300;
  
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('');
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.searchControl.valueChanges.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.emit(value || '');
    });
  }

  onClear(): void {
    this.searchControl.setValue('');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
