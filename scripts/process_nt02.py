import pdfplumber
import json
import re

def clean_text(text):
    if not text: return ""
    text = re.sub(r'Bibbia CEI 2008 \d+', '', text)
    return text.strip()

# Mapping books to authors
author_map = {
    "Lettera ai Romani": "Paolo",
    "Prima lettera ai Corinzi": "Paolo",
    "Seconda lettera ai Corinzi": "Paolo",
    "Lettera ai Gàlati": "Paolo",
    "Lettera agli Efesini": "Paolo",
    "Lettera ai Filippesi": "Paolo",
    "Lettera ai Colossesi": "Paolo",
    "Prima lettera ai Tessalonicesi": "Paolo",
    "Seconda lettera ai Tessalonicesi": "Paolo",
    "Prima lettera a Timòteo": "Paolo",
    "Seconda lettera a Timòteo": "Paolo",
    "Lettera a Tito": "Paolo",
    "Lettera a Filèmone": "Paolo",
    "Lettera agli Ebrei": "Paolo (attr.)",
    "Lettera di Giacomo": "Giacomo",
    "Prima lettera di Pietro": "Pietro",
    "Seconda lettera di Pietro": "Pietro",
    "Prima lettera di Giovanni": "Giovanni",
    "Seconda lettera di Giovanni": "Giovanni",
    "Terza lettera di Giovanni": "Giovanni",
    "Lettera di Giuda": "Giuda",
    "Libro dell’Apocalisse": "Giovanni"
}

books = list(author_map.keys())

def extract_content(pdf_path):
    all_items = []
    current_book = ""
    current_chapter = 0
    current_content = []
    
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages[1:]:
            text = page.extract_text()
            if text: full_text += text + "\n"
                
    lines = full_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line: continue
        
        found_book = False
        for b in books:
            if line == b:
                if current_book and current_content and current_chapter > 0:
                    author = author_map.get(current_book, "Bibbia")
                    all_items.append({
                        "id": f"bibbia_{current_book.lower().replace(' ', '_')}_{current_chapter}",
                        "categoryId": "lettere" if "Apocalisse" not in current_book else "apocalisse",
                        "themeIds": ["Fede", "Misericordia"],
                        "title": f"{current_book} - Capitolo {current_chapter}",
                        "author": author,
                        "content": " ".join(current_content),
                        "reflectionHints": ["Cosa mi dice oggi questo brano?"]
                    })
                current_book = b
                current_chapter = 0
                current_content = []
                found_book = True
                break
        if found_book: continue
        
        ch_match = re.match(r'^(\d+)\s+1([^\d].*)?$', line)
        if ch_match:
            if current_book and current_content and current_chapter > 0:
                author = author_map.get(current_book, "Bibbia")
                all_items.append({
                    "id": f"bibbia_{current_book.lower().replace(' ', '_')}_{current_chapter}",
                    "categoryId": "lettere" if "Apocalisse" not in current_book else "apocalisse",
                    "themeIds": ["Fede", "Misericordia"],
                    "title": f"{current_book} - Capitolo {current_chapter}",
                    "author": author,
                    "content": " ".join(current_content),
                    "reflectionHints": ["Cosa mi dice oggi questo brano?"]
                })
            current_chapter = int(ch_match.group(1))
            remaining = ch_match.group(2) if ch_match.group(2) else ""
            current_content = [remaining.strip()] if remaining.strip() else []
        elif current_book:
            cleaned = re.sub(r'^\d+\s*', '', line)
            cleaned = re.sub(r'(\s)\d+([A-Z])', r'\1\2', cleaned)
            cleaned = re.sub(r'(\s)\d+(\s)', r'\1', cleaned)
            if cleaned: current_content.append(cleaned)

    if current_book and current_content and current_chapter > 0:
        author = author_map.get(current_book, "Bibbia")
        all_items.append({
            "id": f"bibbia_{current_book.lower().replace(' ', '_')}_{current_chapter}",
            "categoryId": "lettere" if "Apocalisse" not in current_book else "apocalisse",
            "themeIds": ["Fede", "Misericordia"],
            "title": f"{current_book} - Capitolo {current_chapter}",
            "author": author,
            "content": " ".join(current_content),
            "reflectionHints": ["Cosa mi dice oggi questo brano?"]
        })
    return all_items

if __name__ == "__main__":
    pdf_file = "scripts/scraper/nt02-lettere-apocalisse.pdf"
    all_data = extract_content(pdf_file)
    lettere = [i for i in all_data if i["categoryId"] == "lettere"]
    apocalisse = [i for i in all_data if i["categoryId"] == "apocalisse"]
    
    with open("public/assets/data/lettere.json", "w", encoding="utf-8") as f:
        json.dump({"items": lettere}, f, indent=2, ensure_ascii=False)
    with open("public/assets/data/apocalisse.json", "w", encoding="utf-8") as f:
        json.dump({"items": apocalisse}, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(lettere)} letters and {len(apocalisse)} apocalypse chapters with authors.")
