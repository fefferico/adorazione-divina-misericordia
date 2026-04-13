import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError, from, mergeMap, tap, toArray } from 'rxjs';

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
  _searchTitle?: string;
  _searchContent?: string;
  _searchAuthor?: string;
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

  // Internal state as a Signal for maximum reactivity
  private libraryState = signal<Library>({
    categories: [],
    themes: [],
    items: []
  });

  // Expose parts of the state
  library = this.libraryState.asReadonly();
  isLoading = signal(true);

  private libraryFiles = [
    '/assets/data/library.json',
    '/assets/data/diario.json',
    '/assets/data/francesco.json',
    '/assets/data/benedict-xvi.json',
    '/assets/data/john-paul-ii.json',
    '/assets/data/john-paul-i.json',
    '/assets/data/paul-vi.json',
    '/assets/data/john-xxiii.json',
    '/assets/data/pius-xii.json',
    '/assets/data/pius-xi.json',
    '/assets/data/matteo.json',
    '/assets/data/marco.json',
    '/assets/data/luca.json',
    '/assets/data/giovanni.json',
    '/assets/data/atti.json',
    '/assets/data/lettere.json',
    '/assets/data/apocalisse.json'
  ];

  constructor() {
    this.loadAllData();
  }

  private loadAllData() {
    this.isLoading.set(true);

    // Load files sequentially or in parallel? Parallel is usually faster.
    // We use mergeMap with a concurrency limit to not choke the browser
    from(this.libraryFiles).pipe(
      mergeMap(url => this.http.get<any>(url).pipe(
        catchError(() => of({ items: [], categories: [], themes: [] })),
        tap(res => this.mergeData(res))
      ), 3), // max 3 parallel requests
      toArray()
    ).subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  private mergeData(newData: any) {
    this.libraryState.update(current => {
      const catMap = new Map(current.categories.map(c => [c.id, c]));
      const themeMap = new Map(current.themes.map(t => [t.id, t]));
      const itemMap = new Map(current.items.map(i => [i.id, i]));

      // 1. Process Categories
      if (newData.categories) {
        newData.categories.forEach((c: Category) => {
          if (!catMap.has(c.id)) catMap.set(c.id, c);
        });
      }

      // 2. Process Themes
      if (newData.themes) {
        newData.themes.forEach((t: Theme) => {
          if (!themeMap.has(t.id)) themeMap.set(t.id, t);
        });
      }

      // 3. Process Items
      if (newData.items) {
        newData.items.forEach((item: any) => {
          // Normalization
          if (!item.themeId && item.themeIds && item.themeIds.length > 0) {
            item.themeId = item.themeIds[0].toLowerCase();
          } else if (item.themeId) {
            item.themeId = item.themeId.toLowerCase();
          }

          // Author assignment
          if (item.categoryId === 'vangelo' && !item.author) {
            const title = item.title.toLowerCase();
            if (title.includes('(mt') || item.id.includes('matthew')) item.author = 'Matteo';
            else if (title.includes('(mc') || item.id.includes('mark')) item.author = 'Marco';
            else if (title.includes('(lc') || item.id.includes('luke')) item.author = 'Luca';
            else if (title.includes('(gv') || item.id.includes('john')) item.author = 'Giovanni';
          }

          // Auto-register categories/themes if missing
          if (item.categoryId && !catMap.has(item.categoryId)) {
            catMap.set(item.categoryId, {
              id: item.categoryId,
              label: item.categoryId.replace(/_/g, ' ').charAt(0).toUpperCase() + item.categoryId.replace(/_/g, ' ').slice(1),
              icon: this.getIconForCategory(item.categoryId)
            });
          }

          if (item.themeId && !themeMap.has(item.themeId)) {
            themeMap.set(item.themeId, {
              id: item.themeId,
              label: item.themeIds && item.themeIds.length > 0 ? item.themeIds[0] : item.themeId.charAt(0).toUpperCase() + item.themeId.slice(1)
            });
          }

          // Search optimization
          item._searchTitle = (item.title || '').toLowerCase();
          item._searchContent = (item.content || '').toLowerCase();
          item._searchAuthor = (item.author || '').toLowerCase();

          itemMap.set(item.id, item);
        });
      }

      return {
        categories: Array.from(catMap.values()),
        themes: Array.from(themeMap.values()),
        items: Array.from(itemMap.values())
      };
    });
  }

  private getIconForCategory(id: string): string {
    const idLower = id.toLowerCase();
    if (idLower.includes('vangelo')) return 'book-open';
    if (idLower.includes('apocalisse')) return 'sparkles';
    if (idLower.includes('atti')) return 'compass';
    if (idLower.includes('lettere')) return 'mail';
    if (idLower.includes('angelus')) return 'bell';
    if (idLower.includes('udienza')) return 'users';
    if (idLower.includes('omelia') || idLower.includes('discorso') || idLower.includes('benedict-xvi') || idLower.includes('francesco')) return 'mic';
    if (idLower.includes('enciclica') || idLower.includes('esortazione')) return 'scroll';
    if (idLower.includes('diario')) return 'heart';

    return 'scroll';
  }

  getCategories(): Observable<Category[]> {
    return from(new Promise<Category[]>(resolve => resolve(this.libraryState().categories)));
  }

  // Still providing Observables for compatibility if needed, but signal is better
  getThemes(categoryId?: string): Observable<Theme[]> {
    const lib = this.libraryState();
    if (!categoryId) return of(lib.themes);
    const themeIds = new Set(lib.items.filter(i => i.categoryId === categoryId).map(i => i.themeId).filter(t => !!t));
    return of(lib.themes.filter(t => themeIds.has(t.id)));
  }

  getAuthors(categoryId?: string): Observable<string[]> {
    const lib = this.libraryState();
    const authors = lib.items.filter(i => !categoryId || i.categoryId === categoryId).map(i => i.author).filter((a): a is string => !!a);
    return of(Array.from(new Set(authors)).sort());
  }

  getYears(categoryId?: string): Observable<string[]> {
    const lib = this.libraryState();
    const years = lib.items.filter(i => !categoryId || i.categoryId === categoryId)
      .map(i => i.publishedDate ? new Date(i.publishedDate).getFullYear().toString() : null)
      .filter((y): y is string => !!y && y !== 'NaN');
    return of(Array.from(new Set(years)).sort((a, b) => b.localeCompare(a)));
  }

  searchItems(
    categoryId?: string,
    themeId?: string,
    query?: string,
    author?: string,
    year?: string
  ): Observable<LibraryItem[]> {
    const lib = this.libraryState();
    const lowerQuery = query?.toLowerCase() || '';
    const lowerAuthor = author?.toLowerCase();
    const lowerThemeId = themeId?.toLowerCase();

    // Prepare search terms for theme enrichment
    let themeSearchTerms: string[] = [];
    if (lowerThemeId && !lowerQuery) {
      themeSearchTerms.push(lowerThemeId);
      const themeObj = lib.themes.find(t => t.id === lowerThemeId);
      if (themeObj) themeSearchTerms.push(themeObj.label.toLowerCase());
    }

    const results = lib.items.filter(item => {
      if (categoryId && item.categoryId !== categoryId) return false;
      if (lowerAuthor && item._searchAuthor !== lowerAuthor) return false;
      if (year && (!item.publishedDate || new Date(item.publishedDate).getFullYear().toString() !== year)) return false;

      let isMatch = true;
      if (lowerThemeId) {
        isMatch = item.themeId?.toLowerCase() === lowerThemeId || (item.themeIds?.map(t => t.toLowerCase()) || []).includes(lowerThemeId);
        if (!isMatch && themeSearchTerms.length > 0) {
          isMatch = themeSearchTerms.some(term => item._searchTitle?.includes(term) || item._searchContent?.includes(term));
        }
        if (!isMatch) return false;
      }

      if (lowerQuery) {
        const queryMatch = (item._searchTitle?.includes(lowerQuery) || item._searchContent?.includes(lowerQuery));
        if (!queryMatch) return false;
      }

      return true;
    });

    return of(results);
  }

  getItemById(id: string): Observable<LibraryItem | undefined> {
    return of(this.libraryState().items.find(i => i.id === id));
  }
}
