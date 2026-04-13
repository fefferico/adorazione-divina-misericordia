import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, forkJoin, of, catchError } from 'rxjs';

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Theme {
  id: string;
  label: string;
}

export interface LibraryItem {
  id: string;
  categoryId: string;
  themeId?: string;
  themeIds?: string[];
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  reflectionHints?: string[];
  source_url?: string;
}

export interface Library {
  categories: Category[];
  themes: Theme[];
  items: LibraryItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private libraryFiles = [
    'assets/data/library.json', 
    'assets/data/francesco.json',
    'assets/data/matteo.json',
    'assets/data/marco.json',
    'assets/data/luca.json',
    'assets/data/giovanni.json',
    'assets/data/atti.json'
  ];

  private library$ = forkJoin(
    this.libraryFiles.map(url => this.http.get<any>(url).pipe(
      catchError(() => of({ items: [], categories: [], themes: [] }))
    ))
  ).pipe(
    map(results => {
      const merged: Library = { categories: [], themes: [], items: [] };
      
      // First pass: register explicit categories and themes from library.json
      results.forEach(res => {
        if (res.categories) {
          res.categories.forEach((c: Category) => {
            if (!merged.categories.find(mc => mc.id === c.id)) {
              merged.categories.push(c);
            }
          });
        }
        if (res.themes) {
          res.themes.forEach((t: Theme) => {
            if (!merged.themes.find(mt => mt.id === t.id)) {
              merged.themes.push(t);
            }
          });
        }
      });

      // Second pass: process items and auto-register missing categories/themes
      results.forEach(res => {
        if (res.items) {
          res.items.forEach((item: any) => {
            // Normalize themeId/themeIds
            if (!item.themeId && item.themeIds && item.themeIds.length > 0) {
              item.themeId = item.themeIds[0].toLowerCase();
            } else if (item.themeId) {
              item.themeId = item.themeId.toLowerCase();
            }

            // Auto-assign author for Vangelo if missing
            if (item.categoryId === 'vangelo' && !item.author) {
              const title = item.title.toLowerCase();
              if (title.includes('(mt') || item.id.includes('matthew')) item.author = 'Matteo';
              else if (title.includes('(mc') || item.id.includes('mark')) item.author = 'Marco';
              else if (title.includes('(lc') || item.id.includes('luke')) item.author = 'Luca';
              else if (title.includes('(gv') || item.id.includes('john')) item.author = 'Giovanni';
              else item.author = 'Evangelista';
            }

            // Auto-register theme if missing
            if (item.themeId && !merged.themes.find(t => t.id === item.themeId)) {
              merged.themes.push({ 
                id: item.themeId, 
                label: item.themeIds && item.themeIds.length > 0 ? item.themeIds[0] : item.themeId.charAt(0).toUpperCase() + item.themeId.slice(1)
              });
            }

            // Auto-register category if missing
            if (item.categoryId && !merged.categories.find(c => c.id === item.categoryId)) {
              merged.categories.push({ 
                id: item.categoryId, 
                label: item.categoryId.replace(/_/g, ' ').charAt(0).toUpperCase() + item.categoryId.replace(/_/g, ' ').slice(1),
                icon: 'scroll' // default icon for new categories
              });
            }

            merged.items.push(item);
          });
        }
      });

      // Deduplicate items
      merged.items = Array.from(new Map(merged.items.map(i => [i.id, i])).values());
      
      return merged;
    }),
    shareReplay(1)
  );

  getCategories(): Observable<Category[]> {
    return this.library$.pipe(map(l => l.categories));
  }

  getThemes(): Observable<Theme[]> {
    return this.library$.pipe(map(l => l.themes));
  }

  getAuthors(categoryId?: string): Observable<string[]> {
    return this.library$.pipe(
      map(lib => {
        const authors = lib.items
          .filter(i => !categoryId || i.categoryId === categoryId)
          .map(i => i.author)
          .filter((a): a is string => !!a);
        return Array.from(new Set(authors)).sort();
      })
    );
  }

  getYears(categoryId?: string): Observable<string[]> {
    return this.library$.pipe(
      map(lib => {
        const years = lib.items
          .filter(i => !categoryId || i.categoryId === categoryId)
          .map(i => i.publishedDate ? new Date(i.publishedDate).getFullYear().toString() : null)
          .filter((y): y is string => !!y && y !== 'NaN');
        return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
      })
    );
  }

  searchItems(
    categoryId?: string, 
    themeId?: string, 
    query?: string,
    author?: string,
    year?: string
  ): Observable<LibraryItem[]> {
    return this.library$.pipe(
      map(lib => {
        return lib.items.filter(item => {
          const matchCategory = !categoryId || item.categoryId === categoryId;
          
          // Check both themeId and themeIds for matching
          let matchTheme = !themeId;
          if (themeId) {
            const normalizedThemeId = themeId.toLowerCase();
            const itemThemeId = item.themeId?.toLowerCase();
            const itemThemeIds = item.themeIds?.map(t => t.toLowerCase()) || [];
            matchTheme = itemThemeId === normalizedThemeId || itemThemeIds.includes(normalizedThemeId);
          }

          const matchAuthor = !author || item.author === author;
          const matchYear = !year || (item.publishedDate && new Date(item.publishedDate).getFullYear().toString() === year);

          const matchQuery = !query ||
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase());
            
          return matchCategory && matchTheme && matchQuery && matchAuthor && matchYear;
        });
      })
    );
  }

  getItemById(id: string): Observable<LibraryItem | undefined> {
    return this.library$.pipe(
      map(lib => lib.items.find(i => i.id === id))
    );
  }
}
