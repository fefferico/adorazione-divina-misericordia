import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<Theme>(this.getInitialTheme());
  fontSizeMultiplier = signal<number>(this.getInitialFontSize());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      const multiplier = this.fontSizeMultiplier();
      
      this.applyTheme(currentTheme);
      this.applyFontSize(multiplier);
      
      localStorage.setItem('theme', currentTheme);
      localStorage.setItem('font-size', multiplier.toString());
    });
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
  }

  incrementFontSize() {
    this.fontSizeMultiplier.update(m => Math.min(m + 0.1, 1.5));
  }

  decrementFontSize() {
    this.fontSizeMultiplier.update(m => Math.max(m - 0.1, 0.8));
  }

  resetFontSize() {
    this.fontSizeMultiplier.set(1.0);
  }

  private getInitialTheme(): Theme {
    return (localStorage.getItem('theme') as Theme) || 'system';
  }

  private getInitialFontSize(): number {
    return parseFloat(localStorage.getItem('font-size') || '1.0');
  }

  private applyTheme(theme: Theme) {
    let isDark = false;
    if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = theme === 'dark';
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private applyFontSize(multiplier: number) {
    document.documentElement.style.setProperty('--app-font-multiplier', multiplier.toString());
    // Apply globally to base font size
    document.documentElement.style.fontSize = `${16 * multiplier}px`;
  }
}
