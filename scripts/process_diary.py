import json
import re
import os

def parse_diary(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    entries = []
    
    # Split by double newlines and clean up.
    segments = re.split(r'\n\s*\n', content)
    
    for seg in segments:
        seg = seg.strip()
        if not seg or len(seg) < 50: # Skip very short snippets or headers
            continue
            
        # If it looks like a page number or footer, skip
        if re.match(r'^\d+$', seg) or "DIO E LE ANIME" in seg:
            continue
            
        entries.append({
            "id": f"diario_{len(entries) + 1}",
            "categoryId": "diario",
            "themeId": "misericordia",
            "title": f"Diario - Paragrafo {len(entries) + 1}",
            "content": seg,
            "reflectionHints": [
                "Cosa mi dice Gesù in questo brano?",
                "Come posso vivere la misericordia oggi?"
            ]
        })
        
    return entries

def main():
    diary_text_path = "/home/fefferico/.gemini/antigravity/brain/feb5a3e3-477b-4c3a-bf02-427481042e5a/scratch/diario.txt"
    library_path = "/home/fefferico/projects/adorazione-divina-misericordia/public/assets/data/library.json"
    
    if not os.path.exists(diary_text_path):
        print(f"Error: {diary_text_path} not found")
        return
        
    diary_entries = parse_diary(diary_text_path)
    print(f"Parsed {len(diary_entries)} entries from Diary")
    
    # Load existing library
    with open(library_path, 'r', encoding='utf-8') as f:
        library_data = json.load(f)
    
    # Remove existing tiny diary entries and add full ones
    items = [item for item in library_data['items'] if item['categoryId'] != 'diario']
    items.extend(diary_entries)
    
    library_data['items'] = items
    
    # Save back
    with open(library_path, 'w', encoding='utf-8') as f:
        json.dump(library_data, f, indent=2, ensure_ascii=False)
        
    print(f"Updated {library_path} with full Diary content")

if __name__ == "__main__":
    main()
