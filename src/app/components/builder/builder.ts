import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, ChevronRight, Sidebar, Save, Download, Search, Plus, Trash2, Edit3, CheckCircle, X, Sun, Moon, Minus, User, ArrowRight, ChevronDown, ChevronUp } from 'lucide-angular';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdorationStoreService, AdorationSection } from '../../services/adoration-store';
import { PdfExportService } from '../../services/pdf-export';
import { ThemeService } from '../../services/theme';
import { ContentPickerComponent } from '../content-picker/content-picker';
import { TextEditorComponent } from './text-editor/text-editor';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink, ContentPickerComponent, TextEditorComponent],
  templateUrl: './builder.html',
  styleUrl: './builder.scss'
})
export class BuilderComponent implements OnInit {
  private store = inject(AdorationStoreService);
  private pdfService = inject(PdfExportService);
  private route = inject(ActivatedRoute);
  themeService = inject(ThemeService);

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Sidebar = Sidebar;
  readonly Save = Save;
  readonly Download = Download;
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit3 = Edit3;
  readonly CheckCircle = CheckCircle;
  readonly X = X;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Minus = Minus;
  readonly User = User;
  readonly ArrowRight = ArrowRight;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;

  currentTheme = computed(() => this.themeService.theme());

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['theme']) {
        this.updateGlobalTheme(params['theme']);
      }
    });
  }

  toggleTheme() {
    const next = this.themeService.theme() === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(next);
  }

  adoration = this.store.currentAdoration;
  selectedSectionId = signal<string | null>(null);
  showPicker = signal(false);
  isSidebarCollapsed = signal(false);

  get selectedSection() {
    return this.adoration().sections.find(s => s.id === this.selectedSectionId());
  }

  selectSection(id: string) {
    this.selectedSectionId.set(id);
  }

  updateSection(updates: Partial<AdorationSection>) {
    const id = this.selectedSectionId();
    if (id) {
      this.store.updateSection(id, updates);
    }
  }

  openPicker() {
    this.showPicker.set(true);
  }

  onContentSelected(item: any) {
    const sectionId = this.selectedSectionId();
    if (sectionId) {
      const section = this.selectedSection;
      if (section) {
        const newItem = {
          id: `item_${Date.now()}`,
          title: item.title,
          content: item.content
        };
        const updatedItems = [...(section.items || []), newItem];
        this.store.updateSection(sectionId, {
          items: updatedItems,
          // Merge reflection hints if they don't exist
          reflectionHints: [...(section.reflectionHints || []), ...(item.reflectionHints || [])]
        });
      }
    }
    this.showPicker.set(false);
  }


  exportPdf() {
    this.pdfService.exportToPdf(this.adoration());
  }

  addSection() {
    const newId = `sec_${Date.now()}`;
    const newOrder = this.adoration().sections.length;
    this.store.addSection({
      id: newId,
      type: 'reading',
      title: 'Nuovo Brano',
      items: [],
      order: newOrder
    });
    this.selectedSectionId.set(newId);
  }


  removeSection(id: string) {
    this.store.removeSection(id);
    if (this.selectedSectionId() === id) {
      this.selectedSectionId.set(null);
    }
  }

  updateGlobalTheme(theme: string) {
    this.store.updateTheme(theme);
  }

  updateGlobalTitle(title: string) {
    this.store.updateTitle(title);
  }

  addManualItem() {
    const section = this.selectedSection;
    if (section) {
      const newItem = {
        id: `item_${Date.now()}`,
        title: 'Nuovo frammento',
        content: ''
      };
      const updatedItems = [...(section.items || []), newItem];
      this.updateSection({ items: updatedItems });
    }
  }

  updateItem(index: number, updates: any) {
    const section = this.selectedSection;
    if (section && section.items) {
      const items = [...section.items];
      items[index] = { ...items[index], ...updates };
      this.updateSection({ items });
    }
  }

  removeItem(index: number) {
    const section = this.selectedSection;
    if (section && section.items) {
      const items = section.items.filter((_, i) => i !== index);
      this.updateSection({ items });
    }
  }

  addHint() {
    const section = this.selectedSection;
    if (section) {
      const hints = [...(section.reflectionHints || []), ''];
      this.updateSection({ reflectionHints: hints });
    }
  }

  updateHint(index: number, value: string) {
    const section = this.selectedSection;
    if (section && section.reflectionHints) {
      const hints = [...section.reflectionHints];
      hints[index] = value;
      this.updateSection({ reflectionHints: hints });
    }
  }

  removeHint(index: number) {
    const section = this.selectedSection;
    if (section && section.reflectionHints) {
      const hints = section.reflectionHints.filter((_, i) => i !== index);
      this.updateSection({ reflectionHints: hints });
    }
  }

  expandedItems = signal<Set<string>>(new Set());

  toggleItemExpand(id: string) {
    this.expandedItems.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  isItemExpanded(id: string): boolean {
    return this.expandedItems().has(id);
  }

  shouldTruncate(content: string): boolean {
    return (content || '').split('\n').length > 12;
  }

  getSnippet(content: string): string {
    const lines = (content || '').split('\n');
    if (lines.length <= 12) return content;
    return lines.slice(0, 12).join('\n') + '\n...';
  }

  protected getSectionTypeItalianString(type: string): string {
    switch (type) {
      case 'reading':
        return 'Lettura';
      case 'prayer':
        return 'Preghiera';
      case 'reflection':
        return 'Riflessione';
      case 'litany':
        return 'Litania';
      case 'hymn':
        return 'Canto';
      case 'psalm':
        return 'Salmo';
      case 'gospel':
        return 'Vangelo';
      default:
        return 'Lettura';
    }
  }
}

