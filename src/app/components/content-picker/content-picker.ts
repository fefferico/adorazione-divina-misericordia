import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Search, Filter, BookOpen, Heart, Scroll, Mic, Mail, Music, Plus, Bell, Users, MessageSquare, User, Calendar, Loader2, Sparkles, Compass, ChevronDown, ChevronUp } from 'lucide-angular';
import { ContentService, LibraryItem } from '../../services/content';

@Component({
  selector: 'app-content-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './content-picker.html',
  styleUrl: './content-picker.scss'
})
export class ContentPickerComponent implements OnInit {
  private contentService = inject(ContentService);

  readonly X = X;
  readonly Search = Search;
  readonly Filter = Filter;
  readonly Plus = Plus;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly Loader2 = Loader2;

  // Icon mapping
  icons: Record<string, any> = {
    'book-open': BookOpen,
    'heart': Heart,
    'scroll': Scroll,
    'mic': Mic,
    'mail': Mail,
    'music': Music,
    'bell': Bell,
    'users': Users,
    'message-square': MessageSquare,
    'sparkles': Sparkles,
    'compass': Compass,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp
  };

  categoryPlurals: Record<string, string> = {
    'vangelo': 'Vangeli',
    'atti': 'Atti degli Apostoli',
    'lettere': 'Lettere (Epistole)',
    'apocalisse': 'Apocalisse',
    'omelia': 'Omelie',
    'discorso': 'Discorsi',
    'angelus': 'Angelus',
    'meditazione': 'Meditazioni',
    'lettera': 'Lettere',
    'lettera_apostolica': 'Lettere Apostoliche',
    'esortazione_apostolica': 'Esortazioni Apostoliche',
    'enciclica': 'Encicliche',
    'diario': 'Diario',
    'benedict-xvi': 'Benedetto XVI',
    'francesco': 'Papa Francesco',
    'canto': 'Canti',
    'preghiera': 'Preghiere',
    'riflessione': 'Riflessioni',

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
  debouncedQuery = signal(''); // Query to be used for searching
  resultsLimit = signal(50);

  // Expose global loading state
  isLoading = this.contentService.isLoading;

  constructor() {
    // Implement manual debounce for the search query to avoid heavy re-computations
    let timeout: any;
    effect(() => {
      const query = this.searchQuery();
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.debouncedQuery.set(query);
      }, 300);
    }, { allowSignalWrites: true });
  }

  // Reactive Data directly from ContentService signals
  categories = computed(() => this.contentService.library().categories);

  // Themes reactive to library data AND selected category
  themes = computed(() => {
    const lib = this.contentService.library();
    const catId = this.selectedCategoryId();
    if (!catId) return lib.themes;
    const themeIds = new Set(lib.items.filter(i => i.categoryId === catId).map(i => i.themeId).filter(t => !!t));
    return lib.themes.filter(t => themeIds.has(t.id));
  });

  // Authors reactive to library data AND category
  authors = computed(() => {
    const lib = this.contentService.library();
    const catId = this.selectedCategoryId();
    const authors = lib.items.filter(i => !catId || i.categoryId === catId).map(i => i.author).filter((a): a is string => !!a);
    return Array.from(new Set(authors)).sort();
  });

  // Years reactive to library data AND category
  years = computed(() => {
    const lib = this.contentService.library();
    const catId = this.selectedCategoryId();
    const years = lib.items.filter(i => !catId || i.categoryId === catId)
      .map(i => i.publishedDate ? new Date(i.publishedDate).getFullYear().toString() : null)
      .filter((y): y is string => !!y && y !== 'NaN');
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  });

  // CORE SEARCH LOGIC - Entirely reactive to signals!
  // This will update automatically when filters change OR when library data loads in background.
  allResults = computed(() => {
    const lib = this.contentService.library();
    const catId = this.selectedCategoryId();
    const themeId = this.selectedThemeId();
    const query = this.debouncedQuery().toLowerCase();
    const author = this.selectedAuthor()?.toLowerCase();
    const year = this.selectedYear();

    // If we have theme search terms
    let themeSearchTerms: string[] = [];
    if (themeId && !query) {
      themeSearchTerms.push(themeId);
      const themeObj = lib.themes.find(t => t.id === themeId);
      if (themeObj) themeSearchTerms.push(themeObj.label.toLowerCase());
    }

    // Single pass filter (most efficient)
    return lib.items.filter(item => {
      if (catId && item.categoryId !== catId) return false;
      if (author && item._searchAuthor !== author) return false;
      if (year && (!item.publishedDate || new Date(item.publishedDate).getFullYear().toString() !== year)) return false;

      let isMatch = true;
      if (themeId) {
        isMatch = item.themeId?.toLowerCase() === themeId || (item.themeIds?.map(t => t.toLowerCase()) || []).includes(themeId);
        if (!isMatch && themeSearchTerms.length > 0) {
          isMatch = themeSearchTerms.some(term => item._searchTitle?.includes(term) || item._searchContent?.includes(term));
        }
        if (!isMatch) return false;
      }

      if (query) {
        if (!(item._searchTitle?.includes(query) || item._searchContent?.includes(query))) return false;
      }

      return true;
    });
  });

  // Computed signals for view
  visibleResults = computed(() => this.allResults().slice(0, this.resultsLimit()));
  hasMore = computed(() => this.allResults().length > this.resultsLimit());
  totalCount = computed(() => this.allResults().length);

  ngOnInit() {
    if (this.categoryFilter) {
      this.selectedCategoryId.set(this.categoryFilter);
    }
  }

  selectCategory(id: string | null) {
    this.selectedCategoryId.set(id);
    this.selectedThemeId.set(null);
    this.selectedAuthor.set(null);
    this.selectedYear.set(null);
    this.resultsLimit.set(30);
  }

  selectTheme(id: string | null) {
    this.selectedThemeId.set(this.selectedThemeId() === id ? null : id);
    this.resultsLimit.set(30);
  }

  selectAuthor(author: string | null) {
    this.selectedAuthor.set(this.selectedAuthor() === author ? null : author);
    this.resultsLimit.set(30);
  }

  selectYear(year: string | null) {
    this.selectedYear.set(this.selectedYear() === year ? null : year);
    this.resultsLimit.set(30);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  expandedItems = signal<Set<string>>(new Set());

  toggleExpand(id: string, event: Event) {
    event.stopPropagation();
    this.expandedItems.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedItems().has(id);
  }

  getItemDisplayContent(item: LibraryItem): { text: string; isTruncated: boolean; isExpanded: boolean } {
    const isExpanded = this.isExpanded(item.id);
    if (isExpanded) {
      return { text: item.content, isTruncated: false, isExpanded: true };
    }

    const query = this.debouncedQuery().toLowerCase() || this.selectedThemeId()?.toLowerCase() || '';
    const lines = item.content.split('\n');

    // If text is short, no truncation needed
    if (lines.length <= 12) {
      return { text: item.content, isTruncated: false, isExpanded: false };
    }

    // Attempt to find a match to center the snippet
    let matchIndex = -1;
    if (query) {
      matchIndex = lines.findIndex(line => line.toLowerCase().includes(query));
    }

    let start = 0;
    let end = 12;

    if (matchIndex !== -1) {
      start = Math.max(0, matchIndex - 6);
      end = Math.min(lines.length, matchIndex + 7);
      
      // Adjust if snippet is less than planned size
      if (end - start < 12) {
        if (start === 0) end = Math.min(lines.length, 12);
        else if (end === lines.length) start = Math.max(0, lines.length - 12);
      }
    }

    let snippet = lines.slice(start, end).join('\n');
    const isActuallyTruncated = start > 0 || end < lines.length;

    if (start > 0) snippet = '...\n' + snippet;
    if (end < lines.length) snippet = snippet + '\n...';

    return {
      text: snippet,
      isTruncated: isActuallyTruncated,
      isExpanded: false
    };
  }

  getHighlightedSegments(text: string): { text: string, highlight: boolean }[] {
    const query = this.debouncedQuery().trim();
    if (!query || query.length < 2) return [{ text, highlight: false }];

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map(part => ({
      text: part,
      highlight: part.toLowerCase() === query.toLowerCase()
    }));
  }

  selectItem(item: LibraryItem) {
    // ALWAYS emit the FULL content regardless of what's displayed in the picker's snippet
    this.onSelect.emit(item);
  }

  loadMore() {
    this.resultsLimit.update(l => l + 30);
  }

  close() {
    this.onClose.emit();
  }

  getCategoryLabel(id: string, originalLabel: string): string {
    return this.categoryPlurals[id] || originalLabel;
  }

  getAuthorCategory(): string {
    switch (this.selectedCategoryId()) {
      case 'vangelo':
      case 'atti':
        return 'Evangelista';
      case 'diario':
        return 'Santa';
      case 'lettere':
      case 'apocalisse':
        return 'Apostolo';
      case 'omelia':
      case 'discorso':
      case 'angelus':
      case 'benedict-xvi':
      case 'francesco':
        return 'Pontefice';
      case 'dottore':
        return 'Dottore della Chiesa';
      default:
        return 'Autore';
    }
  }
}
