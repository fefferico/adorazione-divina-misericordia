import subprocess
import os
import re
import json

def extract_raw_text(pdf_path):
    num_pages = 219
    width = 421 # Half of A4 landscape width (842/2)
    height = 595 # A4 height
    
    full_text_parts = []
    
    for page in range(1, num_pages + 1):
        # Left half
        cmd_left = [
            "pdftotext", "-f", str(page), "-l", str(page),
            "-x", "0", "-y", "0", "-W", str(width), "-H", str(height),
            pdf_path, "-"
        ]
        left_text = subprocess.check_output(cmd_left).decode("utf-8").strip()
        
        # Right half
        cmd_right = [
            "pdftotext", "-f", str(page), "-l", str(page),
            "-x", str(width), "-y", "0", "-W", str(width), "-H", str(height),
            pdf_path, "-"
        ]
        right_text = subprocess.check_output(cmd_right).decode("utf-8").strip()
        
        # Simple deduplication per part (if pdftotext glitches)
        if left_text:
            full_text_parts.append(left_text)
        if right_text:
            full_text_parts.append(right_text)
            
    return full_text_parts

def clean_part(part_text):
    # Remove form feeds
    part_text = part_text.replace('\x0c', '')
    
    lines = part_text.splitlines()
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        # Skip isolated page numbers
        if re.match(r'^\d+$', line):
            continue
        # Skip headers
        if line in ["DIO E LE ANIME", "DIO E ANIME", "DIARIO DI SANTA FAUSTINA"]:
            continue
        if "I/O Error: Couldn't open text file" in line: # Safety
            continue
            
        cleaned_lines.append(line)
    
    # Semantic joining of lines within the part
    joined = ""
    for i, line in enumerate(cleaned_lines):
        if not line:
            joined += "\n\n"
            continue
        
        joined += line
        if i < len(cleaned_lines) - 1:
            next_line = cleaned_lines[i+1]
            # If current line doesn't end with a "clause terminator"
            if not re.search(r'[.!?»"]$', line):
                joined += " "
            else:
                # Even if ends with period, join if next line starts with lowercase
                if next_line and next_line[0].islower():
                    joined += " "
                else:
                    joined += "\n"
        else:
            joined += "\n"
    return joined

def parse_entries(full_text):
    # Markers: 
    # 1. Dates: 10.1.37. or 25.IV.1936.
    # 2. Numbered paragraphs: 123. (at start of line)
    
    roman = r'(?:I{1,3}|IV|V|VI{1,3}|IX|X|XI|XII|[0-9]{1,2})'
    # Date pattern: dd.mm.yy. or dd.mm.yyyy. or dd.mm.
    date_regex = rf'\d{{1,2}}\.{roman}\.(?:\d{{2,4}}\.)?'
    # Paragraph number pattern: 123.
    para_regex = r'\d+\.'
    
    entry_marker = rf'(\b(?:{date_regex}|{para_regex})\s+)'
    
    parts = re.split(entry_marker, full_text)
    
    entries = []
    seen_content = set()
    
    # First part might be a preamble
    if len(parts) > 0 and parts[0].strip():
        entries.append({
            "id": "diario_pre",
            "categoryId": "diario",
            "themeId": "misericordia",
            "title": "Diario - Introduzione",
            "content": parts[0].strip(),
            "reflectionHints": ["Cosa mi dice Gesù oggi?", "Come posso vivere la misericordia?"]
        })

    for i in range(1, len(parts), 2):
        marker = parts[i].strip()
        content = parts[i+1].strip()
        
        if len(content) < 30: continue
        
        # De-duplicate
        content_hash = content[:100] # Good enough for long text
        if content_hash in seen_content:
            continue
        seen_content.add(content_hash)
        
        entries.append({
            "id": f"diario_{len(entries) + 1}",
            "categoryId": "diario",
            "themeId": "misericordia",
            "title": f"Diario - {marker}",
            "content": content,
            "reflectionHints": [
                "Cosa mi dice Gesù in questo brano?",
                "Come posso vivere la misericordia oggi?"
            ]
        })
    
    return entries

def main():
    pdf_path = "/home/fefferico/projects/adorazione-divina-misericordia/static/diario-della-divina-misericordia.pdf"
    diario_path = "/home/fefferico/projects/adorazione-divina-misericordia/public/assets/data/diario.json"
    
    if not os.path.exists(pdf_path):
        print("PDF not found!")
        return

    print("Extracting text halves...")
    parts = extract_raw_text(pdf_path)
    
    print("Cleaning and joining text...")
    cleaned_parts = [clean_part(p) for p in parts]
    full_text = "\n".join(cleaned_parts)
    
    # Save debug
    with open("diario_debug.txt", "w", encoding="utf-8") as f:
        f.write(full_text)
        
    print("Parsing entries...")
    entries = parse_entries(full_text)
    print(f"Total valid entries: {len(entries)}")
    
    # Save to diario.json
    diario_data = {
        "categories": [
            {
                "id": "diario",
                "label": "Diario di S. Faustina",
                "icon": "heart"
            }
        ],
        "items": entries
    }
    
    with open(diario_path, 'w', encoding='utf-8') as f:
        json.dump(diario_data, f, indent=2, ensure_ascii=False)
        
    print(f"Done! Saved to {diario_path}")

if __name__ == "__main__":
    main()
