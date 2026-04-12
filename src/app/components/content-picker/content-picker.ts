import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Search, Filter, BookOpen, Heart, Scroll, Mic, Mail, Music, Plus } from 'lucide-angular';
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

  // Icon mapping
  icons: Record<string, any> = {
    'book-open': BookOpen,
    'heart': Heart,
    'scroll': Scroll,
    'mic': Mic,
    'mail': Mail,
    'music': Music
  };

  @Input() categoryFilter?: string;
  @Output() onSelect = new EventEmitter<LibraryItem>();
  @Output() onClose = new EventEmitter<void>();

  categories = signal<Category[]>([]);
  themes = signal<Theme[]>([]);
  results = signal<LibraryItem[]>([]);

  selectedCategoryId = signal<string | null>(null);
  selectedThemeId = signal<string | null>(null);
  searchQuery = signal('');

  ngOnInit() {
    this.contentService.getCategories().subscribe(c => this.categories.set(c));
    this.contentService.getThemes().subscribe(t => this.themes.set(t));

    // Auto-select category if provided
    if (this.categoryFilter) {
      this.selectedCategoryId.set(this.categoryFilter);
    }

    this.performSearch();
  }

  performSearch() {
    this.contentService.searchItems(
      this.selectedCategoryId() || undefined,
      this.selectedThemeId() || undefined,
      this.searchQuery()
    ).subscribe(items => this.results.set(items));
  }

  selectCategory(id: string | null) {
    this.selectedCategoryId.set(id);
    this.performSearch();
  }

  selectTheme(id: string | null) {
    this.selectedThemeId.set(id);
    this.performSearch();
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.performSearch();
  }

  selectItem(item: LibraryItem) {
    this.onSelect.emit(item);
  }

  close() {
    this.onClose.emit();
  }
}
