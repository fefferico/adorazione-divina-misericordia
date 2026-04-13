import requests
from bs4 import BeautifulSoup
import json
import re
import time
import os
import hashlib
from datetime import datetime
from collections import defaultdict
from urllib.parse import urljoin

BASE_URL = "https://www.vatican.va"
FRANCESCO_URL = f"{BASE_URL}/content/francesco/it"
LIBRARY_PATH = "public/assets/data/francesco.json"
START_YEAR = 2013
END_YEAR = 2025

# Mapping semplificato
CATEGORIES = [
    ("angelus", "Angelus", "angelus"),
    ("homilies", "Omelie", "omelia"),
    ("prayers", "Preghiere", "preghiera"),
    ("encyclicals", "Encicliche", "enciclica"),
    ("speeches", "Discorsi", "discorso"),
    ("letters", "Lettere", "lettera"),
    ("apost_letters", "Lettere Apostoliche", "lettera_apostolica"),
    ("cotidie", "Meditazioni", "meditazione"),
    ("apost_exhortations", "Esortazioni", "esortazione_apostolica"),
    ("audiences", "Udienze", "udienza"),
]

THEMES = {
    "Misericordia": ["misericordia", "pietà", "compassione", "perdono"],
    "Speranza": ["speranza", "fiducia", "futuro", "rinascita"],
    "Amore": ["amore", "carità", "dono", "sacrificio"],
    "Fede": ["fede", "credenza", "dio", "divino"],
    "Pace": ["pace", "concordia", "fratellanza"],
    "Giustizia": ["giustizia", "diritto", "dignità"],
    "Poveri": ["povero", "povertà", "bisognoso"],
}

def clean_text(text):
    """Rimuove rumore dal testo"""
    text = re.sub(r'©.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dicastero.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'http[s]?://\S+', '', text)
    
    lines = [l.strip() for l in text.split('\n')]
    clean = [l for l in lines if l and len(l) > 3]
    return '\n\n'.join(clean)

def extract_themes(text):
    """Estrae temi dal testo"""
    text_lower = text.lower()
    scores = defaultdict(int)
    
    for theme, keywords in THEMES.items():
        for kw in keywords:
            scores[theme] += len(re.findall(r'\b' + kw + r'\b', text_lower))
    
    return [t for t, s in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3] if s >= 1]

def get_links(url):
    """Estrae link da una pagina indice"""
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.content, 'html.parser')
        
        links = []
        for a in soup.select('a[href*=".html"]'):
            href = a.get('href', '')
            if not href:
                continue
            
            full_url = urljoin(url, href)
            
            # Validazione URL
            if not full_url.startswith('https://www.vatican.va'):
                continue
            if 'index.html' in full_url or '.dir' in full_url:
                continue
            if len(full_url) < 40:
                continue
            
            title = a.get_text(strip=True)
            if title:
                links.append((title, full_url))
        
        return links
    except Exception as e:
        print(f"  ❌ Errore: {str(e)[:50]}")
        return []

def scrape_doc(url):
    """Scrapa un documento"""
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.content, 'html.parser')
        
        # Cerca i blocchi vaticanrichtext (spesso il primo è l'intestazione, il secondo il testo)
        text_blocks = soup.select('.text.parbase.vaticanrichtext')
        
        if len(text_blocks) >= 2:
            # Uniamo tutti i blocchi dal secondo in poi (il primo è l'header di solito)
            text = '\n\n'.join([b.get_text(separator='\n') for b in text_blocks[1:]])
        elif len(text_blocks) == 1:
            # Se ce n'è solo uno, lo prendiamo
            text = text_blocks[0].get_text(separator='\n')
        else:
            # Fallback selettori classici
            content = (
                soup.select_one('.document-content') or
                soup.select_one('#document-content') or
                soup.select_one('.vaticanrichtext') or
                soup.select_one('body')
            )
            
            if not content:
                return ""
            
            # Copia locale per non modificare soup originale se necessario
            for tag in content.select('.header, .footer, nav, script, style'):
                tag.decompose()
            
            text = content.get_text(separator='\n')
            
        return clean_text(text)
    except Exception as e:
        return ""

def main():
    print("=" * 70)
    print("🙏 VATICAN SCRAPER - Versione Semplificata")
    print("=" * 70)
    
    all_links = []
    
    for folder, display_name, cat_id in CATEGORIES:
        print(f"\n📋 {display_name}...")
        
        has_years = folder not in ['prayers', 'encyclicals', 'apost_letters', 'apost_exhortations']
        
        if has_years:
            for year in range(START_YEAR, END_YEAR + 1):
                url = f"{FRANCESCO_URL}/{folder}/{year}.index.html"
                links = get_links(url)
                for title, link_url in links:
                    all_links.append((title, link_url, cat_id))
                
                if links:
                    print(f"  ✓ {year}: {len(links)}")
                time.sleep(0.15)
        else:
            url = f"{FRANCESCO_URL}/{folder}.index.html"
            links = get_links(url)
            for title, link_url in links:
                all_links.append((title, link_url, cat_id))
            
            if links:
                print(f"  ✓ Found: {len(links)}")
            time.sleep(0.15)
    
    print(f"\n📥 Scraping {len(all_links)} documenti...")
    
    items = []
    existing_ids = set()
    
    if os.path.exists(LIBRARY_PATH):
        try:
            with open(LIBRARY_PATH) as f:
                lib = json.load(f)
                existing_ids = {i['id'] for i in lib.get('items', [])}
                items = lib.get('items', [])
        except:
            pass
    
    new_count = 0
    for idx, (title, url, cat_id) in enumerate(all_links):
        if idx % 100 == 0:
            print(f"  {idx}/{len(all_links)}...")
        
        text = scrape_doc(url)
        if len(text) < 200:
            continue
        
        themes = extract_themes(text)
        if not themes:
            themes = ["Fede"]
        
        doc_id = f"{cat_id}_{hashlib.md5(text[:100].encode()).hexdigest()[:12]}"
        
        if doc_id in existing_ids:
            continue
        
        item = {
            "id": doc_id,
            "categoryId": cat_id,
            "themeIds": themes,
            "title": title,
            "content": text[:3000],  # Limita per file size
            "author": "Papa Francesco",
            "reflectionHints": [
                "Cosa mi dice questa parola?",
                "Come posso vivere questa esperienza?"
            ],
            "source_url": url,
            "scraped_at": datetime.now().isoformat()
        }
        
        items.append(item)
        existing_ids.add(doc_id)
        new_count += 1
        time.sleep(0.05)
    
    library_data = {
        "items": items,
        "totalItems": len(items),
        "lastUpdated": datetime.now().isoformat()
    }
    
    os.makedirs(os.path.dirname(LIBRARY_PATH), exist_ok=True)
    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(library_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Completato!")
    print(f"  Documenti aggiunti: {new_count}")
    print(f"  Totale nel database: {len(items)}")
    print(f"  Salvato in: {LIBRARY_PATH}")

if __name__ == "__main__":
    main()
