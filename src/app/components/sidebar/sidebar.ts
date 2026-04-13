import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationStart } from '@angular/router';
import { LucideAngularModule, Home, Edit3, Book, Settings, ChevronLeft, ChevronRight, Menu, X } from 'lucide-angular';
import { ThemeService } from '../../services/theme';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  themeService = inject(ThemeService);
  private router = inject(Router);

  isCollapsed = signal(true);
  isMobileOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isMobileOpen.set(false);
    });
  }

  readonly Home = Home;
  readonly Edit3 = Edit3;
  readonly Book = Book;
  readonly Settings = Settings;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Menu = Menu;
  readonly X = X;

  currentTheme = computed(() => this.themeService.theme());

  menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/builder', icon: Edit3, label: 'Costruttore' },
    { path: '/library', icon: Book, label: 'Biblioteca' }
  ];

  toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
