import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Bold, Italic, List, ListOrdered, Type, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 focus-within:border-primary-500 transition-all">
      <!-- Toolbar -->
      <div class="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button (click)="exec('bold')" type="button" class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Grassetto">
          <lucide-icon [name]="Bold" class="w-4 h-4"></lucide-icon>
        </button>
        <button (click)="exec('italic')" type="button" class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Corsivo">
          <lucide-icon [name]="Italic" class="w-4 h-4"></lucide-icon>
        </button>
        <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button (click)="exec('insertUnorderedList')" type="button" class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Elenco puntato">
          <lucide-icon [name]="List" class="w-4 h-4"></lucide-icon>
        </button>
        <button (click)="exec('insertOrderedList')" type="button" class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Elenco numerato">
          <lucide-icon [name]="ListOrdered" class="w-4 h-4"></lucide-icon>
        </button>
        <div class="flex-1"></div>
        <button (click)="exec('removeFormat')" type="button" class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-300 transition-colors" title="Pulisci formattazione">
          <lucide-icon [name]="Trash2" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      <!-- Editor Content -->
      <div 
        #editor
        contenteditable="true"
        (input)="onInput()"
        (blur)="onBlur()"
        class="flex-1 p-4 min-h-[400px] outline-none text-lg leading-relaxed text-slate-600 dark:text-slate-200 prose prose-slate dark:prose-invert max-w-none overflow-y-auto"
        placeholder="Scrivi qui il contenuto..."
      ></div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true
    }
  ]
})
export class TextEditorComponent implements ControlValueAccessor {
  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Inserisci testo...';
  
  readonly Bold = Bold;
  readonly Italic = Italic;
  readonly List = List;
  readonly ListOrdered = ListOrdered;
  readonly Type = Type;
  readonly Trash2 = Trash2;

  private value = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  exec(command: string, value: string = '') {
    document.execCommand(command, false, value);
    this.onInput();
    this.editorElement.nativeElement.focus();
  }

  onInput() {
    const html = this.editorElement.nativeElement.innerHTML;
    this.value = html;
    this.onChange(html);
  }

  onBlur() {
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value || '';
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = this.value;
    } else {
      // Small fallback if view not yet initialized
      setTimeout(() => {
        if (this.editorElement) this.editorElement.nativeElement.innerHTML = this.value;
      }, 0);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
