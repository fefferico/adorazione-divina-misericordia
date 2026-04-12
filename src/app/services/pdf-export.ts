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
      doc.setTextColor(0, 0, 0);

      const lines = doc.splitTextToSize(section.content || ' ', contentWidth);
      doc.text(lines, margin, cursorY);
      cursorY += (lines.length * 5) + 5;

      // Reflection Hints
      if (section.reflectionHints && section.reflectionHints.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        section.reflectionHints.forEach(hint => {
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
}
