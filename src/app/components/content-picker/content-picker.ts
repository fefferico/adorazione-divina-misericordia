import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  categories = signal<Category[]>([]);
  themes = signal<Theme[]>([]);
  authors = signal<string[]>([]);
  years = signal<string[]>([]);
  results = signal<LibraryItem[]>([]);

  selectedCategoryId = signal<string | null>(null);
  selectedThemeId = signal<string | null>(null);
  selectedAuthor = signal<string | null>(null);
  selectedYear = signal<string | null>(null);
  searchQuery = signal('');

  ngOnInit() {
    this.contentService.getCategories().subscribe((c: Category[]) => this.categories.set(c));
    this.contentService.getThemes().subscribe((t: Theme[]) => this.themes.set(t));
    
    // Auto-select category if provided
    if (this.categoryFilter) {
      this.selectedCategoryId.set(this.categoryFilter);
    }

    const initialCat = this.selectedCategoryId();
    this.contentService.getAuthors(initialCat || undefined).subscribe((a: string[]) => this.authors.set(a));
    this.contentService.getYears(initialCat || undefined).subscribe((y: string[]) => this.years.set(y));

    this.performSearch();
  }

  performSearch() {
    this.contentService.searchItems(
      this.selectedCategoryId() || undefined,
      this.selectedThemeId() || undefined,
      this.searchQuery(),
      this.selectedAuthor() || undefined,
      this.selectedYear() || undefined
    ).subscribe((items: LibraryItem[]) => this.results.set(items));
  }

  selectCategory(id: string | null) {
    this.selectedCategoryId.set(id);
    this.selectedAuthor.set(null);
    this.selectedYear.set(null);
    
    // Refresh coherent filters
    this.contentService.getAuthors(id || undefined).subscribe((a: string[]) => this.authors.set(a));
    this.contentService.getYears(id || undefined).subscribe((y: string[]) => this.years.set(y));
    
    this.performSearch();
  }

  selectTheme(id: string | null) {
    this.selectedThemeId.set(this.selectedThemeId() === id ? null : id);
    this.performSearch();
  }

  selectAuthor(author: string | null) {
    this.selectedAuthor.set(this.selectedAuthor() === author ? null : author);
    this.performSearch();
  }

  selectYear(year: string | null) {
    this.selectedYear.set(this.selectedYear() === year ? null : year);
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
