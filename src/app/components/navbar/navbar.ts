import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule, Sun, Moon, Plus, Minus, Sparkles } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  private router = inject(Router);

  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Sparkles = Sparkles;

  currentTheme = computed(() => this.themeService.theme());
  
  isDashboard = computed(() => this.router.url === '/' || this.router.url === '/dashboard');
  isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleTheme() {
    const next = this.themeService.theme() === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(next);
  }
}
