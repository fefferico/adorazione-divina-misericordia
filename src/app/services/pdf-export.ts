import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Adoration } from './adoration-store';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  async exportToPdf(adoration: Adoration) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let cursorY = margin;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Deep blue-gray
    doc.text(adoration.title.toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 12;

    // Theme
    if (adoration.theme) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(14);
      doc.setTextColor(127, 140, 141);
      doc.text(`Tema: ${adoration.theme}`, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 15;
    }

    // Horizontal Line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 10;

    // Sections
    adoration.sections.forEach((section, index) => {
      // Check for page break
      if (cursorY > 260) {
        doc.addPage();
        cursorY = margin;
      }

      // Section Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185); // Professional blue
      doc.text(section.title, margin, cursorY);
      cursorY += 7;

      // Section Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);

      (section.items || []).forEach((item, itemIdx) => {
        // Optional item title if it's not the same as section title or generic
        if (item.title && item.title !== section.title && (section.items.length > 1)) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(item.title, margin, cursorY);
          cursorY += 5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
        }

        const paragraphs = this.normalizeContent(item.content || ' ').split('\n\n');
        
        paragraphs.forEach((para, paraIdx) => {
          const lines = doc.splitTextToSize(para.trim(), contentWidth);
          const blockHeight = lines.length * 5.5;

          // Handle page break before starting a paragraph
          if (cursorY + blockHeight > 275) {
            doc.addPage();
            cursorY = margin;
          }

          doc.text(lines, margin, cursorY);
          cursorY += blockHeight + (paraIdx < paragraphs.length - 1 ? 5 : 0);
        });

        cursorY += 6; // Spacing after item
      });


      // Reflection Hints
      const validHints = (section.reflectionHints || []).filter(h => h && h.trim().length > 0);
      if (validHints.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        validHints.forEach(hint => {
          if (cursorY > 275) {
            doc.addPage();
            cursorY = margin;
          }
          const hintLines = doc.splitTextToSize(`• ${hint}`, contentWidth - 5);
          doc.text(hintLines, margin + 5, cursorY);
          cursorY += (hintLines.length * 4) + 2;
        });
        cursorY += 5;
      }

      cursorY += 5; // Spacing between sections
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generato con Adorazione Builder - Pagina ${i} di ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`${adoration.title.replace(/\s+/g, '_')}.pdf`);
  }

  private normalizeContent(text: string): string {
    if (!text) return '';

    // 0. Preliminary: Handle HTML tags from WYSIWYG editor
    let content = text
      // Replace breaks with newlines
      .replace(/<br\s*\/?>/gi, '\n')
      // Close div/p tags with newlines
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      // Treat list items as lines with bullets
      .replace(/<li>/gi, '\n• ')
      .replace(/<\/li>/gi, '')
      // Strip remaining tags
      .replace(/<[^>]+>/g, '');

    // 1. Remove carriage returns and normalize non-breaking spaces etc
    let clean = content
      .replace(/\r/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ');

    // 2. Multi-stage structural cleaning:
    // First, mark what are DEFINITELY intended paragraph breaks (double newlines or more)
    clean = clean.replace(/\n\s*\n+/g, '####PARA####');

    // For remaining single newlines, we use a balanced joining logic:
    // We join lines if:
    // - Next line starts with lowercase
    // - OR Current line doesn't end with a "strong" terminator (. ! ? » :)
    // - AND it's not a list item (starts with •)
    const lines = clean.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const nextLine = (lines[i+1] || '').trim();
        
        // Don't join if current is a bullet
        const isBullet = line.startsWith('•');
        // Don't join if next starts with uppercase OR a bullet OR a number (likely new section)
        const nextStartsStructure = /^[A-ZÀÈÌÒÙ0-9\-\*•]/.test(nextLine);
        // Don't join if current ends with strong punctuation
        const currentEndsSentence = /[.!?»:]$/.test(line);

        if (!isBullet && !nextStartsStructure && !currentEndsSentence && i < lines.length - 1) {
            processedLines.push(line + ' ');
        } else {
            processedLines.push(line + '\n');
        }
    }

    clean = processedLines.join('').replace(/\n/g, ' ');

    // 3. Restore intended paragraphs
    clean = clean.replace(/####PARA####/g, '\n\n');
    
    return clean.trim();
  }
}
