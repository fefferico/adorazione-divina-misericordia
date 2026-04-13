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

    // 0. Preliminary: Strip HTML tags if any (from the new WYSIWYG editor)
    // We replace <br> and <div> with \n first to preserve some structure
    let content = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '');

    // 1. Remove carriage returns and normalize spaces
    let clean = content.replace(/\r/g, '').replace(/[ \t]+/g, ' ');

    // 2. Protect intentional structure:
    // - Paragraphs (double newlines)
    // - List items (lines starting with -, *, or numbers)
    // - Verse-like structure (lines starting with a capital letter)
    
    // Mark double newlines
    clean = clean.replace(/\n\s*\n/g, '####PARA####');

    // For single newlines: 
    // Join them if the next character is lowercase (definitely a mid-sentence break)
    // OR if the current line doesn't end with a sentence-ending punctuation.
    // We'll use a safer approach: join lines that don't start with a "structure trigger"
    const lines = clean.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i].trim();
        if (!currentLine) continue;

        // If the NEXT line starts with structure, we must definitely keep a break after this one
        const nextLine = lines[i+1]?.trim() || '';
        const nextStartsStructure = /^[A-ZÀÈÌÒÙ0-9\-\*•]/.test(nextLine);
        const currentEndsSentence = /[.:;!?»]$/.test(currentLine);

        if (!nextStartsStructure && !currentEndsSentence && i < lines.length - 1) {
            // Join with a space
            processedLines.push(currentLine + ' ');
        } else {
            // Keep the newline (well, will join with \n later)
            processedLines.push(currentLine + '\n');
        }
    }

    clean = processedLines.join('').replace(/\n/g, ' ');

    // Restore paragraphs
    clean = clean.replace(/####PARA####/g, '\n\n');
    
    return clean.trim();
  }
}
