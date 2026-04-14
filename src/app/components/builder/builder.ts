import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, ChevronRight, Sidebar, Save, Download, Search, Plus, Trash2, Edit3, CheckCircle, X, Sun, Moon, Minus, User, ArrowRight, ChevronDown, FileText, ChevronUp, GripVertical } from 'lucide-angular';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AdorationStoreService, AdorationSection } from '../../services/adoration-store';
import { PdfExportService } from '../../services/pdf-export';
import { ThemeService } from '../../services/theme';
import { ContentPickerComponent } from '../content-picker/content-picker';
import { TextEditorComponent } from './text-editor/text-editor';
import { ContentService } from '../../services/content';
import { ConfirmModalComponent, LongSection } from '../ui/confirm-modal/confirm-modal';

interface PendingExport {
  type: 'pdf' | 'doc';
  sections: LongSection[];
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink, ContentPickerComponent, TextEditorComponent, ConfirmModalComponent, DragDropModule],
  templateUrl: './builder.html',
  styleUrl: './builder.scss'
})
export class BuilderComponent implements OnInit {
  private store = inject(AdorationStoreService);
  private pdfService = inject(PdfExportService);
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
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
  readonly FileText = FileText;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly GripVertical = GripVertical;

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
  pendingExport = signal<PendingExport | null>(null);

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
          libraryId: item.id,
          title: item.title,
          content: item.content,
          author: item.author
        };
        const updatedItems = [...(section.items || []), newItem];
        this.store.updateSection(sectionId, {
          items: updatedItems,
          // Merge reflection hints if they don't exist
          reflectionHints: [...(section.reflectionHints || []), ...(item.reflectionHints || [])].slice(0, 5)
        });
      }
    }
    this.showPicker.set(false);
  }


  exportPdf() {
    this.checkLengthAndExport('pdf');
  }

  exportDoc() {
    this.checkLengthAndExport('doc');
  }

  private checkLengthAndExport(type: 'pdf' | 'doc') {
    const adoration = this.adoration();
    let tooLongSections: LongSection[] = [];

    adoration.sections.forEach(s => {
      // Calculate total lines across all items in section
      const lineCount = (s.items || []).reduce((acc, item) => {
        const lines = (item.content || '').split('\n').filter(l => l.trim().length > 0).length;
        return acc + lines;
      }, 0);

      if (lineCount > 30) {
        tooLongSections.push({
          id: s.id,
          title: s.title,
          lineCount: lineCount
        });
      }
    });

    if (tooLongSections.length > 0) {
      this.pendingExport.set({ type, sections: tooLongSections });
      return;
    }

    this.executeExport(type);
  }

  private executeExport(type: 'pdf' | 'doc') {
    const adoration = this.adoration();

    // pulisci l'adorazione corrente da eventuali diciture da "interfaccia" come ad esempio "continua nel builder"
    const cleanedAdoration = {
      ...adoration,
      sections: adoration.sections.map(s => ({
        ...s,
        items: s.items.map(i => ({
          ...i,
          content: i.content.replace('... (continua nel builder)', '')
        }))
      }))
    };

    if (type === 'pdf') {
      this.pdfService.exportToPdf(cleanedAdoration);
    } else {
      this.pdfService.exportToDoc(cleanedAdoration);
    }
    this.pendingExport.set(null);
  }

  onModalConfirm() {
    const pending = this.pendingExport();
    if (pending) {
      this.executeExport(pending.type);
    }
  }

  onModalCancel() {
    this.pendingExport.set(null);
  }

  onModalReview(sectionId: string) {
    this.selectSection(sectionId);
    this.pendingExport.set(null);
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

  updateItem(index: number, updates: any, sectionId?: string) {
    const id = sectionId || this.selectedSectionId();
    if (!id) return;

    const sections = this.adoration().sections;
    const section = sections.find(s => s.id === id);
    
    if (section && section.items && section.items[index]) {
      const items = [...section.items];
      items[index] = { ...items[index], ...updates };
      this.store.updateSection(id, { items });
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
    // Recupero dinamico del testo completo se l'elemento proviene dalla dashboard ed è troncato
    const currentSection = this.selectedSection;
    if (currentSection) {
      const itemIndex = currentSection.items.findIndex(i => i.id === id);
      const item = currentSection.items[itemIndex];
      
      if (item && item.libraryId && item.content.includes('... (continua nel builder)')) {
        this.contentService.getItemById(item.libraryId).subscribe(original => {
          if (original) {
            this.updateItem(itemIndex, { content: original.content }, currentSection.id);
          }
        });
      }
    }

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

  onSectionDrop(event: CdkDragDrop<AdorationSection[]>) {
    this.store.moveSection(event.previousIndex, event.currentIndex);
  }

  onItemDrop(event: CdkDragDrop<any[]>) {
    const sectionId = this.selectedSectionId();
    if (sectionId) {
      this.store.moveItem(sectionId, event.previousIndex, event.currentIndex);
    }
  }

  shouldTruncate(content: string, type?: string): boolean {
    if (type === 'song' || type === 'hymn') return false;
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

