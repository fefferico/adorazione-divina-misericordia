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
  imports: [CommonModule, LucideAngularModule],
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
    const themeId = themeName.toLowerCase();

    // Fetch thematic items and all songs to have a fallback
    this.contentService.searchItems(undefined, themeId).subscribe(thematicItems => {
      this.contentService.searchItems('canto').subscribe(allSongs => {
        const items = [...thematicItems];
        // Add songs that are not already in thematicItems
        const thematicSongIds = new Set(thematicItems.filter(i => i.categoryId === 'canto').map(i => i.id));
        allSongs.forEach(song => {
          if (!thematicSongIds.has(song.id)) {
            items.push(song);
          }
        });

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
            let matchingItems = items.filter(item => {
              const isUnused = !usedIds.has(item.id);
              if (!isUnused) return false;

              // Handle multi-category match for "atti-lettere"
              if (section.category === 'atti-lettere') {
                return item.categoryId === 'atti' || item.categoryId === 'lettere';
              }
              
              return item.categoryId.toLowerCase() === section.category?.toLowerCase();
            });

            // Fallback if no specific category match, pick something else thematic (but avoid cross-picking songs/readings)
            if (matchingItems.length === 0 && section.category !== 'canti') {
               matchingItems = items.filter(item => !usedIds.has(item.id) && item.categoryId !== 'canto');
            }

            if (matchingItems.length > 0) {
              const shuffled = [...matchingItems].sort(() => 0.5 - Math.random());
              const selected = shuffled[0];

              usedIds.add(selected.id);
              
              this.store.updateSection(section.id, {
                items: [{
                  id: selected.id,
                  title: selected.title,
                  content: selected.content
                }],
                reflectionHints: (selected.reflectionHints || []).slice(0, 3)
              });
            }
          }
        });

        // 3. Navigate to the builder
        this.router.navigate(['/builder']);
      });
    });
  }
}
