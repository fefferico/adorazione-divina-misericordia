import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

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
  themeId: string;
  title: string;
  content: string;
  reflectionHints?: string[];
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
  private libraryUrl = 'assets/data/library.json';

  private library$ = this.http.get<Library>(this.libraryUrl).pipe(
    shareReplay(1)
  );

  getCategories(): Observable<Category[]> {
    return this.library$.pipe(map(l => l.categories));
  }

  getThemes(): Observable<Theme[]> {
    return this.library$.pipe(map(l => l.themes));
  }

  searchItems(categoryId?: string, themeId?: string, query?: string): Observable<LibraryItem[]> {
    return this.library$.pipe(
      map(lib => {
        return lib.items.filter(item => {
          const matchCategory = !categoryId || item.categoryId === categoryId;
          const matchTheme = !themeId || item.themeId === themeId;
          const matchQuery = !query ||
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase());
          return matchCategory && matchTheme && matchQuery;
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
