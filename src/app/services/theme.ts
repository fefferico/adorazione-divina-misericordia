import { Injectable, signal, effect, inject, Renderer2, RendererFactory2 } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  theme = signal<Theme>(this.getInitialTheme());
  fontSizeMultiplier = signal<number>(this.getInitialFontSize());

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
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

    const html = document.documentElement;
    const body = document.body;

    if (isDark) {
      this.renderer.addClass(html, 'dark');
      this.renderer.addClass(body, 'dark');
      this.renderer.setAttribute(html, 'data-theme', 'dark');
      this.renderer.setAttribute(body, 'data-theme', 'dark');
    } else {
      this.renderer.removeClass(html, 'dark');
      this.renderer.removeClass(body, 'dark');
      this.renderer.setAttribute(html, 'data-theme', 'light');
      this.renderer.setAttribute(body, 'data-theme', 'light');
    }
    
    // Debug log
    console.log(`[ThemeService] Applied ${theme} theme. effective isDark: ${isDark}`);
    console.log(`[ThemeService] HTML classes: ${html.className}`);
  }

  private applyFontSize(multiplier: number) {
    document.documentElement.style.setProperty('--app-font-multiplier', multiplier.toString());
    document.documentElement.style.fontSize = `${16 * multiplier}px`;
  }
}
