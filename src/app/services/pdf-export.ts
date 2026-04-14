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

    // Date (top right)
    const today = new Date().toLocaleDateString('it-IT');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Data di creazione: ${today}`, pageWidth - margin, 12, { align: 'right' });

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

    // Sections - Filter out empty ones (no items and no hints)
    const activeSections = adoration.sections.filter(s => {
      const hasContent = (s.items || []).some(item => (item.content || '').trim().length > 0);
      const hasHints = (s.reflectionHints || []).some(hint => (hint || '').trim().length > 0);
      return hasContent || hasHints;
    });

    activeSections.forEach((section, index) => {
      // 1. Ensure space for Section Header + minimal content (approx 35mm)
      cursorY = this.requestSpace(doc, 35, cursorY, margin);

      // Section Header (Type and Title)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246); // Modern blue
      doc.text(this.getSectionTypeItalian(section.type).toUpperCase(), margin, cursorY);
      cursorY += 6;

      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text(section.title, margin, cursorY);
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
      cursorY += 12;

      const validItems = (section.items || []).filter(item => (item.content || '').trim().length > 0);
      validItems.forEach((item, itemIdx) => {
        // Optional item title
        if (item.title && item.title.trim().toLowerCase() !== section.title.trim().toLowerCase()) {
          // Ensure space for item title + at least 3 lines of content
          cursorY = this.requestSpace(doc, 15, cursorY, margin);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(51, 65, 85); // Slate 700
          doc.text(item.title, margin, cursorY);
          cursorY += 6;
        }

        const paragraphs = this.normalizeContent(item.content || ' ').split('\n\n');

        paragraphs.forEach((para, paraIdx) => {
          let currentPara = para.trim();
          if (!currentPara) return;

          // Default styles
          let fontSize = 11;
          let fontStyle = 'normal';
          let xOffset = 0;
          let textColor = [51, 65, 85] as [number, number, number];

          // Structural Markers Handling
          if (currentPara.startsWith('[[H1]]')) {
            currentPara = currentPara.replace('[[H1]]', '').trim();
            fontSize = 15; fontStyle = 'bold'; textColor = [15, 23, 42];
          } else if (currentPara.startsWith('[[H2]]')) {
            currentPara = currentPara.replace('[[H2]]', '').trim();
            fontSize = 13; fontStyle = 'bold'; textColor = [30, 41, 59];
          } else if (currentPara.startsWith('[[LI_NUM]]') || currentPara.startsWith('[[LI_BULLET]]')) {
            const isNum = currentPara.startsWith('[[LI_NUM]]');
            currentPara = currentPara.replace(isNum ? '[[LI_NUM]]' : '[[LI_BULLET]]', '').trim();
            xOffset = 6;
          } else if (currentPara.startsWith('[[QUOTE]]')) {
            currentPara = currentPara.replace('[[QUOTE]]', '').trim();
            fontStyle = 'italic';
            xOffset = 10;
            textColor = [71, 85, 105];
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.8);
          }

          doc.setFont('helvetica', fontStyle);
          doc.setFontSize(fontSize);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);

          // Handle multi-line drawing with possible inline styles
          const rawLines = doc.splitTextToSize(currentPara, contentWidth - xOffset);
          const blockHeight = rawLines.length * (fontSize * 0.55);

          // If the paragraph is short, we try to keep it together.
          // If it's long, we allow it to break between lines.
          if (blockHeight < 40) {
            cursorY = this.requestSpace(doc, blockHeight, cursorY, margin);
          }

          if (xOffset >= 10 && fontStyle === 'italic') { // Quote border start
            // We'll draw the border line by line if it breaks pages, 
            // but for now let's just draw the initial one
            doc.line(margin + 2, cursorY - 3, margin + 2, Math.min(275, cursorY + blockHeight - 2));
          }

          // Use our new styled text renderer for each line to support [[B]] and [[I]]
          rawLines.forEach((line: string, lineIdx: number) => {
            // Exact line-by-line page break check for long readings
            if (cursorY > 275) {
              doc.addPage();
              cursorY = margin;
              // If it's a quote, continue the border on the new page
              if (xOffset >= 10 && fontStyle === 'italic') {
                doc.setDrawColor(203, 213, 225);
                doc.setLineWidth(0.8);
              }
            }

            this.drawStyledLine(doc, line, margin + xOffset, cursorY, fontStyle);
            cursorY += (fontSize * 0.55);
          });

          cursorY += 2; // Paragraph spacing
        });

        cursorY += 4;
      });

      // Reflection Hints
      const validHints = (section.reflectionHints || []).filter(h => h && h.trim().length > 0);
      if (validHints.length > 0) {
        // Draw a light background for hints
        const hintsStartY = cursorY - 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('SPUNTI DI RIFLESSIONE', margin, cursorY);
        cursorY += 6;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);

        validHints.forEach(hint => {
          if (cursorY > 275) {
            doc.addPage();
            cursorY = margin;
          }
          const hintLines = doc.splitTextToSize(`• ${hint}`, contentWidth - 10);
          doc.text(hintLines, margin + 5, cursorY);
          cursorY += (hintLines.length * 5) + 2;
        });
        cursorY += 5;
      }

      cursorY += 8; // Spacing between sections
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      // doc.text(`Generato con Adorazione Builder - Pagina ${i} di ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`${adoration.title.replace(/\s+/g, '_')}.pdf`);
  }

  exportToDoc(adoration: Adoration) {
    const today = new Date().toLocaleDateString('it-IT');
    const filename = `${adoration.title.replace(/\s+/g, '_')}.doc`;

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #1e293b; }
          .date { text-align: right; color: #94a3b8; font-size: 10pt; margin-bottom: 20pt; }
          .title { text-align: center; font-size: 24pt; font-weight: bold; color: #1e293b; text-transform: uppercase; margin-bottom: 10pt; }
          .theme { text-align: center; font-size: 14pt; font-style: italic; color: #64748b; margin-bottom: 30pt; }
          .section { margin-top: 30pt; }
          .section-type { color: #3b82f6; font-weight: bold; font-size: 10pt; text-transform: uppercase; margin-bottom: 2pt; }
          .section-title { font-size: 18pt; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; margin-bottom: 10pt; }
          .item { margin-bottom: 20pt; }
          .item-title { font-weight: bold; font-size: 12pt; color: #334155; margin-bottom: 5pt; }
          .para { margin-bottom: 10pt; text-align: justify; }
          .quote { border-left: 4px solid #cbd5e1; padding-left: 15pt; font-style: italic; color: #475569; margin: 15pt 0; }
          .hints-box { margin-top: 20pt; padding: 10pt; background: #f8fafc; }
          .hints-title { color: #64748b; font-weight: bold; font-size: 10pt; text-transform: uppercase; margin-bottom: 5pt; }
          .hint { font-style: italic; color: #475569; margin-left: 10pt; margin-bottom: 2pt; }
          b { font-weight: bold; }
          i { font-style: italic; }
        </style>
      </head>
      <body>
        <div class="date">Data di creazione: ${today}</div>
        <div class="title">${adoration.title}</div>
        ${adoration.theme ? `<div class="theme">Tema: ${adoration.theme}</div>` : ''}
        
        ${this.generateDocHtml(adoration)}
        
        <div style="margin-top: 50pt; text-align: center; font-size: 8pt; color: #94a3b8;">
          Generato con Adorazione Builder
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private generateDocHtml(adoration: Adoration): string {
    const activeSections = adoration.sections.filter(s => {
      const hasContent = (s.items || []).some(item => (item.content || '').trim().length > 0);
      const hasHints = (s.reflectionHints || []).some(hint => (hint || '').trim().length > 0);
      return hasContent || hasHints;
    });

    return activeSections.map(section => {
      const type = this.getSectionTypeItalian(section.type).toUpperCase();
      const validItems = (section.items || []).filter(item => (item.content || '').trim().length > 0);
      const validHints = (section.reflectionHints || []).filter(h => h && h.trim().length > 0);

      const itemsHtml = validItems.map(item => {
        const itemTitle = (item.title && item.title.trim().toLowerCase() !== section.title.trim().toLowerCase()) 
          ? `<div class="item-title">${item.title}</div>`
          : '';

        const paragraphs = this.normalizeContent(item.content || '').split('\n\n');
        const contentHtml = paragraphs.map(p => {
          let text = p.trim();
          if (!text) return '';
          
          let className = 'para';
          if (text.startsWith('[[QUOTE]]')) {
             text = text.replace('[[QUOTE]]', '');
             className = 'quote';
          } else if (text.startsWith('[[H1]]')) {
             return `<h2 style="font-size: 16pt; color: #1e293b;">${text.replace('[[H1]]', '')}</h2>`;
          } else if (text.startsWith('[[H2]]')) {
             return `<h3 style="font-size: 14pt; color: #334155;">${text.replace('[[H2]]', '')}</h3>`;
          }

          // Replace markers with HTML
          text = text
            .replace(/\[\[B\]\]/g, '<b>')
            .replace(/\[\[\/B\]\]/g, '</b>')
            .replace(/\[\[I\]\]/g, '<i>')
            .replace(/\[\[\/I\]\]/g, '</i>');

          return `<div class="${className}">${text}</div>`;
        }).join('');

        return `
          <div class="item">
            ${itemTitle}
            ${contentHtml}
          </div>
        `;
      }).join('');

      const hintsHtml = validHints.length > 0 ? `
        <div class="hints-box">
          <div class="hints-title">Spunti di riflessione</div>
          ${validHints.map(h => `<div class="hint">• ${h}</div>`).join('')}
        </div>
      ` : '';

      return `
        <div class="section">
          <div class="section-type">${type}</div>
          <div class="section-title">${section.title}</div>
          ${itemsHtml}
          ${hintsHtml}
        </div>
      `;
    }).join('');
  }

  private normalizeContent(text: string): string {
    if (!text) return '';

    // 0. Preliminary: Handle HTML tags from WYSIWYG editor
    let content = text
      // Convert Headings to structural markers
      .replace(/<h1>(.*?)<\/h1>/gi, '\n[[H1]]$1\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '\n[[H2]]$1\n')
      // Replace breaks with newlines
      .replace(/<br\s*\/?>/gi, '\n')
      // Handle Blockquotes
      .replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, '\n[[QUOTE]]$1\n')

      // Handle Ordered Lists (Numbered)
      .replace(/<ol>([\s\S]*?)<\/ol>/gi, (match, items) => {
        let count = 1;
        // Temporary marker to avoid confusion with unordered lists
        return items.replace(/<li>(.*?)<\/li>/gi, () => `\n[[LI_NUM]]${count++}. $1`);
      })
      // Handle Unordered Lists (Bullets)
      .replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, items) => {
        return items.replace(/<li>(.*?)<\/li>/gi, '\n[[LI_BULLET]]• $1');
      })

      // Preserve Bold and Italic as markers
      .replace(/<b>(.*?)<\/b>/gi, '[[B]]$1[[/B]]')
      .replace(/<strong>(.*?)<\/strong>/gi, '[[B]]$1[[/B]]')
      .replace(/<i>(.*?)<\/i>/gi, '[[I]]$1[[/I]]')
      .replace(/<em>(.*?)<\/em>/gi, '[[I]]$1[[/I]]')

      // Close div/p tags with newlines
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')

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

      const nextLine = (lines[i + 1] || '').trim();

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

  private getSectionTypeItalian(type: string | undefined): string {
    if (!type) return 'Sezione';
    const map: Record<string, string> = {
      'reading': 'Lettura',
      'prayer': 'Preghiera',
      'reflection': 'Riflessione',
      'litany': 'Litania',
      'hymn': 'Canto',
      'psalm': 'Salmo',
      'gospel': 'Vangelo'
    };
    return map[type.toLowerCase()] || 'Sezione';
  }

  private drawStyledLine(doc: jsPDF, line: string, x: number, y: number, baseStyle: string) {
    // Regex to find our markers: [[B]], [[/B]], [[I]], [[/I]]
    const parts = line.split(/(\[\[\/?[BI]\]\])/g);
    let currentX = x;
    let isBold = baseStyle.includes('bold');
    let isItalic = baseStyle.includes('italic');

    parts.forEach(part => {
      if (!part) return;

      if (part === '[[B]]') {
        isBold = true;
      } else if (part === '[[/B]]') {
        isBold = baseStyle.includes('bold');
      } else if (part === '[[I]]') {
        isItalic = true;
      } else if (part === '[[/I]]') {
        isItalic = baseStyle.includes('italic');
      } else {
        // Actual text to draw
        const style = (isBold && isItalic) ? 'bolditalic' : (isBold ? 'bold' : (isItalic ? 'italic' : 'normal'));
        doc.setFont('helvetica', style);
        // Remove any leftover markers just in case
        const cleanText = part.replace(/\[\[\/?[BIH12QUOTELIMB]+\]\]/g, '');
        if (cleanText) {
          doc.text(cleanText, currentX, y);
          currentX += doc.getTextWidth(cleanText);
        }
      }
    });
  }

  private requestSpace(doc: jsPDF, requiredHeight: number, currentY: number, margin: number): number {
    // Only break if we are not already at the top of a page
    if (currentY > margin && currentY + requiredHeight > 275) {
      doc.addPage();
      return margin;
    }
    return currentY;
  }
}
