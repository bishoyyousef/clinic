import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [style.padding]="padding">
      <div class="card-header" *ngIf="title || subtitle">
        <h3 class="card-title" *ngIf="title">{{ title }}</h3>
        <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .card-header {
      margin-bottom: var(--s4);
    }
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
    }
    .card-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: var(--s1);
    }
    .card-content {
      flex: 1;
    }
    .card-footer {
      margin-top: var(--s5);
      padding-top: var(--s4);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--s3);
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding = 'var(--s6)';
  @Input() hasFooter = false;
}
