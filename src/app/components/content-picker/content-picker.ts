import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, combineLatest, debounceTime, startWith, map, tap } from 'rxjs';
import { LucideAngularModule, X, Search, Filter, BookOpen, Heart, Scroll, Mic, Mail, Music, Plus, Bell, Users, MessageSquare, FileText, User, Calendar } from 'lucide-angular';
import { ContentService, LibraryItem, Category, Theme } from '../../services/content';

@Component({
  selector: 'app-content-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './content-picker.html',
  styleUrls: ['./content-picker.css']
})
export class ContentPickerComponent implements OnInit {
  private contentService = inject(ContentService);

  readonly X = X;
  readonly Search = Search;
  readonly Filter = Filter;
  readonly Plus = Plus;
  readonly User = User;
  readonly Calendar = Calendar;

  // Icon mapping
  icons: Record<string, any> = {
    'book-open': BookOpen,
    'heart': Heart,
    'scroll': Scroll,
    'mic': Mic,
    'mail': Mail,
    'music': Music,
    'angelus': Bell,
    'udienza': Users,
    'discorso': MessageSquare,
    'meditazione': BookOpen,
    'lettera': Mail,
    'lettera_apostolica': Scroll,
    'esortazione_apostolica': Scroll,
    'enciclica': Scroll
  };

  @Input() categoryFilter?: string;
  @Output() onSelect = new EventEmitter<LibraryItem>();
  @Output() onClose = new EventEmitter<void>();

  // Base state
  selectedCategoryId = signal<string | null>(null);
  selectedThemeId = signal<string | null>(null);
  selectedAuthor = signal<string | null>(null);
  selectedYear = signal<string | null>(null);
  searchQuery = signal('');

  // Reactive Data
  categories = toSignal(this.contentService.getCategories(), { initialValue: [] });
  
  // Themes reactive to category
  themes = toSignal(
    toObservable(this.selectedCategoryId).pipe(
      switchMap(catId => this.contentService.getThemes(catId || undefined))
    ),
    { initialValue: [] }
  );

  // Authors reactive to category
  authors = toSignal(
    toObservable(this.selectedCategoryId).pipe(
      switchMap(catId => this.contentService.getAuthors(catId || undefined))
    ),
    { initialValue: [] }
  );

  // Years reactive to category
  years = toSignal(
    toObservable(this.selectedCategoryId).pipe(
      switchMap(catId => this.contentService.getYears(catId || undefined))
    ),
    { initialValue: [] }
  );

  // Search Results
  results = toSignal(
    combineLatest([
      toObservable(this.selectedCategoryId),
      toObservable(this.selectedThemeId),
      toObservable(this.searchQuery).pipe(debounceTime(300), startWith('')),
      toObservable(this.selectedAuthor),
      toObservable(this.selectedYear)
    ]).pipe(
      switchMap(([cat, theme, query, author, year]) => 
        this.contentService.searchItems(cat || undefined, theme || undefined, query, author || undefined, year || undefined)
      )
    ),
    { initialValue: [] }
  );

  ngOnInit() {
    // Auto-select category if provided as input
    if (this.categoryFilter) {
      this.selectedCategoryId.set(this.categoryFilter);
    }
  }

  selectCategory(id: string | null) {
    this.selectedCategoryId.set(id);
    this.selectedThemeId.set(null);
    this.selectedAuthor.set(null);
    this.selectedYear.set(null);
    this.searchQuery.set('');
  }

  selectTheme(id: string | null) {
    this.selectedThemeId.set(this.selectedThemeId() === id ? null : id);
  }

  selectAuthor(author: string | null) {
    this.selectedAuthor.set(this.selectedAuthor() === author ? null : author);
  }

  selectYear(year: string | null) {
    this.selectedYear.set(this.selectedYear() === year ? null : year);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  selectItem(item: LibraryItem) {
    this.onSelect.emit(item);
  }

  close() {
    this.onClose.emit();
  }
}
