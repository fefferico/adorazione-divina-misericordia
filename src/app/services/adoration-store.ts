import { Injectable, signal } from '@angular/core';

export interface AdorationItem {
  id: string;
  title: string;
  content: string;
}

export interface AdorationSection {
  id: string;
  type: 'intro' | 'reading' | 'reflection' | 'song' | 'prayer' | 'conclusion';
  title: string;
  items: AdorationItem[];
  reflectionHints?: string[];
  order: number;
  category?: string; // e.g. 'Vangelo', 'Diario'
}


export interface Adoration {
  title: string;
  theme: string;
  sections: AdorationSection[];
}

@Injectable({
  providedIn: 'root'
})
export class AdorationStoreService {
  private _currentAdoration = signal<Adoration>({
    title: 'Nuova Adorazione',
    theme: '',
    sections: this.getDefaultSections()
  });

  currentAdoration = this._currentAdoration.asReadonly();

  updateTitle(title: string) {
    this._currentAdoration.update(a => ({ ...a, title }));
  }

  updateTheme(theme: string) {
    this._currentAdoration.update(a => ({ ...a, theme }));
  }

  updateSection(sectionId: string, updates: Partial<AdorationSection>) {
    this._currentAdoration.update(a => ({
      ...a,
      sections: a.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    }));
  }

  addSection(section: AdorationSection) {
    this._currentAdoration.update(a => ({
      ...a,
      sections: [...a.sections, section].sort((x, y) => x.order - y.order)
    }));
  }

  removeSection(id: string) {
    this._currentAdoration.update(a => ({
      ...a,
      sections: a.sections.filter(s => s.id !== id)
    }));
  }

  reset() {
    this._currentAdoration.set({
      title: 'Nuova Adorazione',
      theme: '',
      sections: this.getDefaultSections()
    });
  }

  private getDefaultSections(): AdorationSection[] {
    return [
      { id: 'sec_intro', type: 'intro', title: 'Introduzione', items: [], order: 0 },
      { id: 'sec_1', type: 'reading', title: '1° Brano: Vangelo', items: [], order: 1, category: 'vangelo' },
      { id: 'sec_2', type: 'reading', title: '2° Brano: Diario', items: [], order: 2, category: 'diario' },
      { id: 'sec_3', type: 'reading', title: '3° Brano: Enciclica', items: [], order: 3, category: 'enciclica' },
      { id: 'sec_4', type: 'reading', title: '4° Brano: Omelia/Santo', items: [], order: 4, category: 'omelia' },
      { id: 'sec_5', type: 'reading', title: '5° Brano: Atti/Lettere', items: [], order: 5, category: 'atti-lettere' },
      { id: 'sec_conclusion', type: 'conclusion', title: 'Riflessione conclusiva', items: [], order: 6 },
      { id: 'sec_thanks', type: 'prayer', title: 'Preghiera di ringraziamento', items: [], order: 7 }
    ];
  }

}
