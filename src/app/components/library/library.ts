import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Book, User, Calendar, ChevronRight, FileText, Heart, Scroll, Mic, Mail, Music, Bell, Users, MessageSquare } from 'lucide-angular';
import { ContentService, LibraryItem, Category, Theme } from '../../services/content';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, combineLatest, debounceTime, startWith, map } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.scss'
})
export class LibraryComponent {
  private contentService = inject(ContentService);

  readonly Search = Search;
  readonly Book = Book;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly ChevronRight = ChevronRight;

  icons: Record<string, any> = {
    'book-open': Book,
    'heart': Heart,
    'scroll': Scroll,
    'mic': Mic,
    'mail': Mail,
    'music': Music,
    'angelus': Bell,
    'udienza': Users,
    'discorso': MessageSquare,
    'meditazione': Book,
    'lettera': Mail,
    'lettera_apostolica': Scroll,
    'esortazione_apostolica': Scroll,
    'enciclica': Scroll,
    'vangelo': Book,
    'atti': FileText,
    'lettere': Mail,
    'apocalisse': Scroll
  };

  selectedCategoryId = signal<string | null>(null);
  searchQuery = signal('');
  visibleLimit = signal(24);

  categories = toSignal(this.contentService.getCategories(), { initialValue: [] });

  debouncedSearchQuery = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      startWith('')
    ),
    { initialValue: '' }
  );

  allResults = toSignal(
    combineLatest([
      toObservable(this.selectedCategoryId),
      toObservable(this.debouncedSearchQuery).pipe(
        // Reset limit when search or category changes
        map(q => { this.visibleLimit.set(24); return q; })
      )
    ]).pipe(
      switchMap(([cat, query]) =>
        this.contentService.searchItems(cat || undefined, undefined, query)
      )
    ),
    { initialValue: [] }
  );

  visibleResults = computed(() => this.allResults().slice(0, this.visibleLimit()));
  hasMore = computed(() => this.allResults().length > this.visibleLimit());

  loadMore() {
    this.visibleLimit.update(l => l + 24);
  }

  selectCategory(id: string | null) {
    this.selectedCategoryId.set(this.selectedCategoryId() === id ? null : id);
  }

  getIconForCategory(categoryId: string): any {
    return this.icons[categoryId] || Book;
  }

  getHighlightedSegments(text: string): { text: string, highlight: boolean }[] {
    const query = this.debouncedSearchQuery().trim();
    if (!query || query.length < 2) return [{ text, highlight: false }];

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map(part => ({
      text: part,
      highlight: part.toLowerCase() === query.toLowerCase()
    }));
  }

  getItemSnippet(item: LibraryItem): string {
    const query = this.debouncedSearchQuery().toLowerCase();
    const content = item.content;

    // Split content into sentences
    const sentenceMatches = [...content.matchAll(/.*?[.!?](\s+|$)/gs)];
    const sentences = sentenceMatches.map(m => m[0].trim());

    if (!query) {
      // Return first 3 sentences for a rich preview
      return sentences.slice(0, 3).join(' ') + (sentences.length > 3 ? ' ...' : '');
    }

    const lowerContent = content.toLowerCase();
    const matchIndex = sentences.findIndex(s => s.toLowerCase().includes(query));

    if (matchIndex === -1) {
      // If query is found but not exactly centered in a sentence yet (split issues)
      // Fallback to searching in string
      const strMatchIndex = lowerContent.indexOf(query);
      if (strMatchIndex !== -1) {
        return content.slice(Math.max(0, strMatchIndex - 100), Math.min(content.length, strMatchIndex + 200)).trim() + ' ...';
      }
      return sentences.slice(0, 3).join(' ') + (sentences.length > 3 ? ' ...' : '');
    }

    // Show 3 sentences: previous, current (with match), and next
    let start = Math.max(0, matchIndex - 1);
    let end = Math.min(sentences.length, matchIndex + 2);

    // Padding if we have more available
    if (end - start < 3) {
      if (start === 0) end = Math.min(sentences.length, 3);
      else if (end === sentences.length) start = Math.max(0, sentences.length - 3);
    }

    let snippet = sentences.slice(start, end).join(' ');
    
    if (start > 0) snippet = '... ' + snippet;
    if (end < sentences.length) snippet = snippet + ' ...';
    
    return snippet;
  }
}
