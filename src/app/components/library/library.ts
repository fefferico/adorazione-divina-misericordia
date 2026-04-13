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

  allResults = toSignal(
    combineLatest([
      toObservable(this.selectedCategoryId),
      toObservable(this.searchQuery).pipe(
        debounceTime(300),
        startWith(''),
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
}
