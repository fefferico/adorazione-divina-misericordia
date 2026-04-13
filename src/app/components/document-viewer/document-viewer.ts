import { Component, inject, signal, Input, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, User, BookOpen, Share2, Printer, Heart } from 'lucide-angular';
import { ContentService, LibraryItem } from '../../services/content';
import { ThemeService } from '../../services/theme';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './document-viewer.html',
  styleUrl: './document-viewer.scss'
})
export class DocumentViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  themeService = inject(ThemeService);

  readonly ArrowLeft = ArrowLeft;
  readonly Calendar = Calendar;
  readonly User = User;
  readonly BookOpen = BookOpen;
  readonly Share2 = Share2;
  readonly Printer = Printer;
  readonly Heart = Heart;

  document = signal<LibraryItem | null>(null);

  paragraphs = computed(() => {
    const content = this.document()?.content;
    if (!content) return [];
    // Split by double newlines but keep single newlines as line breaks
    return content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  });

  ngOnInit() {
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.contentService.getItemById(id))
    ).subscribe(doc => {
      this.document.set(doc || null);
      // Scroll to top when document opens
      window.scrollTo(0, 0);
    });
  }

  print() {
    window.print();
  }

  share() {
    if (navigator.share) {
      navigator.share({
        title: this.document()?.title,
        text: this.document()?.content.substring(0, 100) + '...',
        url: window.location.href
      });
    }
  }
}
