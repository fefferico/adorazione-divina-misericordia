import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Sparkles, BookOpen, Plus, Search, Sun, Moon, Minus } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  themeService = inject(ThemeService);

  readonly Sparkles = Sparkles;
  readonly BookOpen = BookOpen;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Minus = Minus;

  currentTheme = computed(() => this.themeService.theme());

  quickThemes = [
    { name: 'Misericordia', color: 'text-accent-crimson' },
    { name: 'Creato', color: 'text-green-600' },
    { name: 'Eucaristia', color: 'text-accent-gold-dark' },
    { name: 'Perdono', color: 'text-primary-500' }
  ];

  toggleTheme() {
    const next = this.themeService.theme() === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(next);
  }
}
