import { Component, ElementRef, ViewChild, forwardRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Bold, Italic, List, ListOrdered, Trash2, Heading1, Heading2, Quote } from 'lucide-angular';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 focus-within:border-primary-500/50 transition-all shadow-sm">
      <!-- Toolbar -->
      <div class="flex items-center gap-1 p-1.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-800 mr-1">
          <button (click)="editor?.chain()?.focus()?.toggleBold()?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('bold')"
            [class.dark:bg-slate-800]="editor?.isActive('bold')"
            [class.text-primary-600]="editor?.isActive('bold')"
            [class.shadow-sm]="editor?.isActive('bold')"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="Bold" class="w-4 h-4"></lucide-icon>
          </button>
          <button (click)="editor?.chain()?.focus()?.toggleItalic()?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('italic')"
            [class.dark:bg-slate-800]="editor?.isActive('italic')"
            [class.text-primary-600]="editor?.isActive('italic')"
            [class.shadow-sm]="editor?.isActive('italic')"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="Italic" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <div class="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-800 mr-1">
          <button (click)="editor?.chain()?.focus()?.toggleHeading({ level: 1 })?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('heading', { level: 1 })"
            [class.dark:bg-slate-800]="editor?.isActive('heading', { level: 1 })"
            [class.text-primary-600]="editor?.isActive('heading', { level: 1 })"
            [class.shadow-sm]="editor?.isActive('heading', { level: 1 })"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="Heading1" class="w-4 h-4"></lucide-icon>
          </button>
          <button (click)="editor?.chain()?.focus()?.toggleHeading({ level: 2 })?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('heading', { level: 2 })"
            [class.dark:bg-slate-800]="editor?.isActive('heading', { level: 2 })"
            [class.text-primary-600]="editor?.isActive('heading', { level: 2 })"
            [class.shadow-sm]="editor?.isActive('heading', { level: 2 })"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="Heading2" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <div class="flex items-center gap-0.5 px-1">
          <button (click)="editor?.chain()?.focus()?.toggleBulletList()?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('bulletList')"
            [class.dark:bg-slate-800]="editor?.isActive('bulletList')"
            [class.text-primary-600]="editor?.isActive('bulletList')"
            [class.shadow-sm]="editor?.isActive('bulletList')"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="List" class="w-4 h-4"></lucide-icon>
          </button>
          <button (click)="editor?.chain()?.focus()?.toggleOrderedList()?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('orderedList')"
            [class.dark:bg-slate-800]="editor?.isActive('orderedList')"
            [class.text-primary-600]="editor?.isActive('orderedList')"
            [class.shadow-sm]="editor?.isActive('orderedList')"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="ListOrdered" class="w-4 h-4"></lucide-icon>
          </button>
          <button (click)="editor?.chain()?.focus()?.toggleBlockquote()?.run()" 
            type="button" 
            [class.bg-white]="editor?.isActive('blockquote')"
            [class.dark:bg-slate-800]="editor?.isActive('blockquote')"
            [class.text-primary-600]="editor?.isActive('blockquote')"
            [class.shadow-sm]="editor?.isActive('blockquote')"
            class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-400">
            <lucide-icon [name]="Quote" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <div class="flex-1"></div>
        
        <button (click)="editor?.chain()?.focus()?.clearNodes()?.unsetAllMarks()?.run()" 
          type="button" 
          title="Pulisci formattazione"
          class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-all">
          <lucide-icon [name]="Trash2" class="w-4 h-4"></lucide-icon>
        </button>
      </div>

      <!-- Editor Content -->
      <div #editorElement class="flex-1 p-6 min-h-[400px] outline-none prose prose-slate dark:prose-invert max-w-none overflow-y-auto custom-editor"></div>
    </div>

  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextEditorComponent), multi: true }
  ]
})
export class TextEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {

  // Icone
  readonly Bold = Bold; readonly Italic = Italic; readonly List = List;
  readonly ListOrdered = ListOrdered; readonly Trash2 = Trash2;
  readonly Heading1 = Heading1; readonly Heading2 = Heading2; 
  readonly Quote = Quote;



  @ViewChild('editorElement') editorElement!: ElementRef;
  editor: Editor | undefined;

  private initialValue: string = '';
  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  ngAfterViewInit() {
    this.editor = new Editor({
      element: this.editorElement.nativeElement,
      extensions: [StarterKit],
      onUpdate: ({ editor }) => {
        this.onChange(editor.getHTML());
      },
    });

    // Se il valore era stato impostato da Angular prima dell'inizializzazione
    if (this.initialValue) {
      this.editor.commands.setContent(this.initialValue);
    }
  }

  writeValue(value: string): void {
    this.initialValue = value || '';
    if (this.editor) {
      // Evita di resettare il cursore se il contenuto è lo stesso
      if (this.editor.getHTML() !== this.initialValue) {
        this.editor.commands.setContent(this.initialValue);
      }
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  ngOnDestroy() {
    this.editor?.destroy();
  }
}