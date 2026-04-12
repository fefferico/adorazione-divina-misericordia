import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Save, Download, Search, Plus, Trash2, Edit3, CheckCircle, X } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { AdorationStoreService, AdorationSection } from '../../services/adoration-store';
import { PdfExportService } from '../../services/pdf-export';
import { ContentPickerComponent } from '../content-picker/content-picker';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink, ContentPickerComponent],
  templateUrl: './builder.html',
  styleUrls: ['./builder.css']
})
export class BuilderComponent {
  private store = inject(AdorationStoreService);
  private pdfService = inject(PdfExportService);

  readonly ChevronLeft = ChevronLeft;
  readonly Save = Save;
  readonly Download = Download;
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit3 = Edit3;
  readonly CheckCircle = CheckCircle;
  readonly X = X;

  adoration = this.store.currentAdoration;
  selectedSectionId = signal<string | null>(null);
  showPicker = signal(false);

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
      this.store.updateSection(sectionId, {
        content: item.content,
        reflectionHints: item.reflectionHints,
        title: item.title // Optionally overwrite title
      });
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
      content: '',
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
}
