import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, X, ArrowRight } from 'lucide-angular';

export interface LongSection {
  id: string;
  title: string;
  lineCount: number;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <!-- Backdrop with glass effect -->
      <div 
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" 
        (click)="onCancel()"
        aria-hidden="true"></div>
      
      <!-- Modal Content with Premium Animation -->
      <div 
        class="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transform transition-all border border-slate-200/50 dark:border-slate-800 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 ease-out">
        
        <!-- Premium Header -->
        <div class="p-8 border-b border-slate-100 dark:border-slate-900/50 flex items-start gap-6">
          <div class="p-4 bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-3xl shadow-inner group transition-transform hover:scale-105 duration-300">
            <lucide-icon [name]="AlertTriangle" class="w-8 h-8"></lucide-icon>
          </div>
          <div class="flex-1 space-y-1">
            <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {{ title() }}
            </h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              {{ message() }}
            </p>
          </div>
          <button 
            (click)="onCancel()" 
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:rotate-90">
            <lucide-icon [name]="X" class="w-6 h-6"></lucide-icon>
          </button>
        </div>
        
        <!-- Scrollable Sections List with Glassmorphism -->
        <div class="p-8 max-h-[45vh] overflow-y-auto space-y-4 custom-scrollbar">
          @for (section of longSections(); track section.id) {
            <div class="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900/20 rounded-[1.75rem] border border-slate-100 dark:border-slate-800/50 flex items-center justify-between group transition-all duration-300 hover:shadow-lg hover:border-primary-200/30 dark:hover:border-primary-900/30">
              <div class="space-y-1 pr-4">
                <div class="text-[15px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {{ section.title }}
                </div>
                <div class="inline-flex items-center px-2 py-0.5 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                  {{ section.lineCount }} righe
                </div>
              </div>
              <button 
                (click)="onReview(section.id)" 
                class="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-primary-600 dark:hover:bg-primary-600 text-slate-700 dark:text-slate-200 hover:text-white rounded-[1.25rem] text-[13px] font-black transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-primary-600 shadow-sm active:scale-95 group/btn">
                <span>Revisiona</span>
                <lucide-icon [name]="ArrowRight" class="w-4 h-4 transition-transform group-hover/btn:translate-x-1"></lucide-icon>
              </button>
            </div>
          }
        </div>
        
        <!-- Footer with Elevated Actions -->
        <div class="p-8 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col sm:flex-row gap-4">
          <button 
            (click)="onCancel()" 
            class="flex-1 py-4 px-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-3xl font-extrabold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-200 transition-all duration-300 active:scale-[0.98]">
            Annulla
          </button>
          <button 
            (click)="onConfirm()" 
            class="flex-[1.5] py-4 px-8 bg-slate-900 dark:bg-primary-600 text-white rounded-3xl font-extrabold text-sm hover:bg-black dark:hover:bg-primary-500 transition-all duration-300 shadow-[0_12px_24px_-8px_rgba(59,130,246,0.3)] hover:shadow-[0_16px_32px_-8px_rgba(59,130,246,0.5)] active:scale-[0.98]">
            Esporta Tutto
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #1e293b;
    }
  `]
})
export class ConfirmModalComponent {
  title = input('Attenzione');
  message = input('Sono presenti sezioni che superano le 30 righe.');
  longSections = input<LongSection[]>([]);
  
  cancel = output<void>();
  confirm = output<void>();
  review = output<string>();

  readonly AlertTriangle = AlertTriangle;
  readonly X = X;
  readonly ArrowRight = ArrowRight;

  onCancel() { this.cancel.emit(); }
  onConfirm() { this.confirm.emit(); }
  onReview(id: string) { this.review.emit(id); }
}
