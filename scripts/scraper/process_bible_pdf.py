import pdfplumber
import json
import re

def process_bible_pdf(pdf_path):
    # Page ranges based on TOC (approximate, adjusted by inspection)
    book_configs = [
        {"name": "Matteo", "title": "Vangelo secondo Matteo", "author": "Matteo", "start_page": 2, "end_page": 34},
        {"name": "Marco", "title": "Vangelo secondo Marco", "author": "Marco", "start_page": 35, "end_page": 55},
        {"name": "Luca", "title": "Vangelo secondo Luca", "author": "Luca", "start_page": 56, "end_page": 90},
        {"name": "Giovanni", "title": "Vangelo secondo Giovanni", "author": "Giovanni", "start_page": 91, "end_page": 117},
        {"name": "Atti", "title": "Atti degli Apostoli", "author": "Luca", "start_page": 118, "end_page": 152}
    ]

    with pdfplumber.open(pdf_path) as pdf:
        for config in book_configs:
            book_items = []
            current_chapter = None
            current_content = []
            
            # Process pages for this book
            for p_idx in range(config["start_page"]-1, config["end_page"]):
                if p_idx >= len(pdf.pages): break
                page = pdf.pages[p_idx]
                text = page.extract_text()
                if not text: continue
                
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    # Skip noise
                    if "Bibbia CEI 2008" in line: continue
                    if line == config["name"]: continue # Skip header line
                    
                    # Detect Chapter start: "N 1" at start of line
                    # Or just a large number if it's the only thing? 
                    # The snippet showed "3 1", "4 1"
                    ch_match = re.match(r'^(\d+)\s+1(\s|$)', line)
                    if ch_match:
                        new_chapter = ch_match.group(1)
                        if current_chapter is not None:
                            book_items.append(create_item(config, current_chapter, current_content))
                        current_chapter = new_chapter
                        current_content = [line[ch_match.end():]]
                    else:
                        if current_chapter is not None:
                            current_content.append(line)
            
            # Save last chapter
            if current_chapter is not None:
                book_items.append(create_item(config, current_chapter, current_content))
            
            # Output JSON
            filename = f"{config['name'].lower()}.json"
            output_path = f"../../public/assets/data/{filename}"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump({"items": book_items}, f, ensure_ascii=False, indent=2)
            print(f"Generated {output_path} with {len(book_items)} chapters.")

def create_item(config, chapter, content_lines):
    full_text = " ".join(content_lines)
    # Remove verse numbers (standalone or mid-text)
    # Verse numbers in this PDF can be standalone on a line or preceded by spaces
    full_text = re.sub(r'\s*\d+\s+', ' ', full_text)
    # Clean multiple spaces
    full_text = re.sub(r'\s+', ' ', full_text).strip()
    
    return {
        "id": f"bibbia_{config['name'].lower()}_{chapter}",
        "categoryId": "vangelo" if config['name'] != "Atti" else "lettura",
        "themeIds": ["Fede", "Misericordia"],
        "title": f"{config['title']} - Cap. {chapter}",
        "content": full_text,
        "author": config['author'],
        "reflectionHints": [
            "Cosa mi dice questa parola oggi?",
            "Come posso vivere questo insegnamento nella mia vita?"
        ]
    }

if __name__ == "__main__":
    process_bible_pdf("nt01-vangeli-atti-apostoli.pdf")
