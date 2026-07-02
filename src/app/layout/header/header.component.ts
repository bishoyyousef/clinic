import { Component, Output, EventEmitter, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, InitialsPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  private titleService = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  pageTitle = signal<string>('Dashboard');

  constructor() {
    // Dynamic tab title updating reactively whenever branding OR page route changes
    effect(() => {
      const clinic = this.settingsService.clinicName();
      const page = this.pageTitle();
      this.titleService.setTitle(`${clinic} • ${page}`);
    });
  }

  ngOnInit(): void {
    // Initial resolution on component creation
    this.updateTitle();

    // Listen to routing changes to update titles
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle(): void {
    const title = this.getLeafRouteTitle(this.activatedRoute);
    this.pageTitle.set(title);
  }

  private getLeafRouteTitle(route: ActivatedRoute): string {
    let active = route;
    while (active.firstChild) {
      active = active.firstChild;
    }
    return active.snapshot.data['title'] || 'Dashboard';
  }
}
