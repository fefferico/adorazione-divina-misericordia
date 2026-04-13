import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Sparkles, BookOpen, Plus, Search, Sun, Moon, Minus, Heart, Leaf, RefreshCcw, Wind, Tent, Shield, ArrowRight } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme';
import { AdorationStoreService } from '../../services/adoration-store';
import { ContentService } from '../../services/content';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  themeService = inject(ThemeService);
  private store = inject(AdorationStoreService);
  private contentService = inject(ContentService);
  private router = inject(Router);

  readonly Sparkles = Sparkles;
  readonly BookOpen = BookOpen;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Minus = Minus;
  readonly Heart = Heart;
  readonly Leaf = Leaf;
  readonly RefreshCcw = RefreshCcw;
  readonly Wind = Wind;
  readonly Tent = Tent;
  readonly Shield = Shield;
  readonly ArrowRight = ArrowRight;

  icons: any = { Heart, Leaf, Sun, RefreshCcw, Wind, Tent, BookOpen, Shield, ArrowRight };

  currentTheme = computed(() => this.themeService.theme());

  quickThemes = [
    { name: 'Misericordia', color: 'text-red-600', icon: 'Heart', desc: 'Sorgente di perdono' },
    { name: 'Creato', color: 'text-green-600', icon: 'Leaf', desc: 'Il volto di Dio' },
    { name: 'Eucaristia', color: 'text-amber-600', icon: 'Sun', desc: 'Pane della vita' },
    { name: 'Perdono', color: 'text-indigo-600', icon: 'RefreshCcw', desc: 'Nuovo inizio' },
    { name: 'Pace', color: 'text-blue-600', icon: 'Wind', desc: 'Dono dall\'alto' },
    { name: 'Famiglia', color: 'text-pink-600', icon: 'Tent', desc: 'Culla dell\'amore' },
    { name: 'Parola', color: 'text-amber-700', icon: 'BookOpen', desc: 'Luce ai miei passi' },
    { name: 'Sacro Cuore', color: 'text-rose-700', icon: 'Shield', desc: 'Rifugio sicuro' }
  ];

  toggleTheme() {
    const next = this.themeService.theme() === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(next);
  }

  startNewAdoration() {
    this.store.reset();
    this.router.navigate(['/builder']);
  }

  goToBuilder(themeName: string) {
    // 1. Find the actual theme ID if possible, otherwise use the name
    const themeId = themeName.toLowerCase();

    this.contentService.searchItems(undefined, themeId).subscribe(items => {
      // 1. Reset and initialize the adoration first
      this.store.reset();
      this.store.updateTheme(themeName);
      this.store.updateTitle(`Adorazione: ${themeName}`);

      if (items.length === 0) {
        console.warn('No items found for theme:', themeId);
        this.router.navigate(['/builder']);
        return;
      }

      // 2. Map existing sections to thematic items
      const currentAdoration = this.store.currentAdoration();
      const usedIds = new Set<string>();
      
      currentAdoration.sections.forEach(section => {
        if (section.category) {
          // Filter items that match the section's target category and haven't been used yet
          let matchingItems = items.filter(item => 
            item.categoryId.toLowerCase() === section.category?.toLowerCase() &&
            !usedIds.has(item.id)
          );

          // Fallback if no specific category match, pick something else thematic
          if (matchingItems.length === 0) {
             matchingItems = items.filter(item => !usedIds.has(item.id));
          }

          if (matchingItems.length > 0) {
            // Pick 1-2 random fragments for variety
            const count = (section.category === 'diario' || section.category === 'omelia') ? 1 : 1; 
            const shuffled = [...matchingItems].sort(() => 0.5 - Math.random());
            const selectedSet = shuffled.slice(0, count);

            const adorationItems = selectedSet.map(selected => {
              usedIds.add(selected.id);
              return {
                id: selected.id,
                title: selected.title,
                content: selected.content
              };
            });

            // Merge reflection hints from all selected items
            const hints = selectedSet.reduce((acc, curr) => [...acc, ...(curr.reflectionHints || [])], [] as string[]);

            this.store.updateSection(section.id, {
              items: adorationItems,
              reflectionHints: Array.from(new Set(hints)).slice(0, 3) // max 3 hints
            });
          }
        }
      });

      // 3. Navigate to the builder
      this.router.navigate(['/builder']);
    });
  }
}
