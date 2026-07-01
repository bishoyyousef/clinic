import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, InitialsPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  authService = inject(AuthService);
}
