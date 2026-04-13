import { Injectable, signal } from '@angular/core';

export interface AdorationItem {
  id: string;
  title: string;
  content: string;
  author?: string;
}

export interface AdorationSection {
  id: string;
  type: 'intro' | 'reading' | 'reflection' | 'song' | 'hymn' | 'prayer' | 'conclusion';
  title: string;
  items: AdorationItem[];
  reflectionHints?: string[];
  order: number;
  category?: string; // e.g. 'vangelo', 'diario'
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
      { id: 'sec_song_1', type: 'song', title: 'Canto', items: [], order: 2, category: 'canto' },
      { id: 'sec_2', type: 'reading', title: '2° Brano: Diario', items: [], order: 3, category: 'diario' },
      { id: 'sec_song_2', type: 'song', title: 'Canto', items: [], order: 4, category: 'canto' },
      { id: 'sec_3', type: 'reading', title: '3° Brano: Enciclica', items: [], order: 5, category: 'enciclica' },
      { id: 'sec_song_3', type: 'song', title: 'Canto', items: [], order: 6, category: 'canto' },
      { id: 'sec_4', type: 'reading', title: '3° Brano: Omelia/Santo', items: [], order: 7, category: 'omelia' },
      { id: 'sec_song_4', type: 'song', title: 'Canto', items: [], order: 8, category: 'canto' },
      { id: 'sec_5', type: 'reading', title: '4° Brano: Atti/Lettere', items: [], order: 9, category: 'atti-lettere' },
      { id: 'sec_song_5', type: 'song', title: 'Canto', items: [], order: 10, category: 'canto' },
      { id: 'sec_conclusion', type: 'conclusion', title: 'Riflessione conclusiva', items: [], order: 11 },
      { id: 'sec_song_6', type: 'song', title: 'Canto', items: [], order: 12, category: 'canto' },
      { id: 'sec_thanks', type: 'prayer', title: 'Preghiera di ringraziamento', items: [], order: 13 }
    ];
  }

}
