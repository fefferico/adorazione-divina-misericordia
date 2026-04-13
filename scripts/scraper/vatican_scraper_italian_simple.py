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
FRANCESCO_URL = f"{BASE_URL}/content/francesco/it"  # SOLO ITALIANO
LIBRARY_PATH = "public/assets/data/francesco.json"
START_YEAR = 2013
END_YEAR = 2025

# Pattern per estrarre date da testi italiani
MONTH_MAP = {
    'gennaio': 1, 'febbraio': 2, 'marzo': 3, 'aprile': 4,
    'maggio': 5, 'giugno': 6, 'luglio': 7, 'agosto': 8,
    'settembre': 9, 'ottobre': 10, 'novembre': 11, 'dicembre': 12
}

# Categorie
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

# Temi
THEMES = {
    "Misericordia": ["misericordia", "pietà", "compassione", "perdono", "riconciliazione"],
    "Speranza": ["speranza", "fiducia", "futuro", "rinascita", "resurrezione"],
    "Amore": ["amore", "carità", "dono", "sacrificio", "dedizione"],
    "Fede": ["fede", "credenza", "dio", "divino", "santo"],
    "Pace": ["pace", "concordia", "fratellanza", "conflitto"],
    "Giustizia": ["giustizia", "diritto", "dignità", "equità"],
    "Poveri": ["povero", "povertà", "bisognoso", "margine"],
}

def clean_text(text):
    """Rimuove rumore dal testo"""
    text = re.sub(r'©.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dicastero.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'http[s]?://\S+', '', text)
    
    lines = [l.strip() for l in text.split('\n')]
    clean = [l for l in lines if l and len(l) > 3]
    return '\n\n'.join(clean)

def extract_date(text, url):
    """
    Estrae la data di pubblicazione dal testo del documento o dall'URL.
    Ritorna data in formato ISO (YYYY-MM-DD) o None
    """
    if not text:
        return None
    
    text_lower = text.lower()
    
    # Pattern 1: "15 maggio 2023" (italiano completo)
    match = re.search(r'(\d{1,2})\s+(' + '|'.join(MONTH_MAP.keys()) + r')\s+(\d{4})', text_lower)
    if match:
        day, month_name, year = match.groups()
        month = MONTH_MAP.get(month_name)
        if month:
            try:
                return f"{year}-{month:02d}-{int(day):02d}"
            except:
                pass
    
    # Pattern 2: "2023-05-15" (ISO)
    match = re.search(r'(\d{4})-(\d{2})-(\d{2})', text)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month}-{day}"
    
    # Pattern 3: "15/05/2023" (europeo)
    match = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', text)
    if match:
        day, month, year = match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
    
    # Pattern 4: URL con data (es. 20230515)
    url_match = re.search(r'(\d{8})', url)
    if url_match:
        date_str = url_match.group(1)
        try:
            # Verifica che sia una data valida
            datetime.strptime(date_str, '%Y%m%d')
            return f"{date_str[0:4]}-{date_str[4:6]}-{date_str[6:8]}"
        except:
            pass
    
    # Estrai almeno l'anno dall'URL come fallback
    year_match = re.search(r'/(\d{4})[/.]', url)
    if year_match:
        year = year_match.group(1)
        return f"{year}-01-01"
    
    return None

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
            if '/it/' not in full_url:  # Solo italiano
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
        return []

def scrape_doc(url):
    """Scrapa un documento e ritorna (testo, data)"""
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.content, 'html.parser')
        
        content = (
            soup.select_one('.document-content') or
            soup.select_one('#document-content') or
            soup.select_one('.vaticanrichtext') or
            soup.select_one('body')
        )
        
        if not content:
            return "", None
        
        for tag in content.select('.header, .footer, nav, script, style'):
            tag.decompose()
        
        text = content.get_text(separator='\n')
        clean = clean_text(text)
        
        # Estrai data
        date = extract_date(clean, url)
        
        return clean, date
    except Exception as e:
        return "", None

def main():
    print("=" * 70)
    print("🙏 VATICAN SCRAPER - SOLO ITALIANO - Con Data")
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
    
    print(f"\n📥 Scraping {len(all_links)} documenti con date...")
    
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
        if idx % 100 == 0 and idx > 0:
            print(f"  {idx}/{len(all_links)}... ({new_count} nuovi)")
        
        text, pub_date = scrape_doc(url)
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
            "content": text,
            "author": "Papa Francesco",
            "publishedDate": pub_date,  # ← NUOVO
            "reflectionHints": [
                "Cosa mi dice questa parola?",
                "Come posso vivere questa esperienza?",
                "Quale conversione mi propone?"
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
        "lastUpdated": datetime.now().isoformat(),
        "language": "it"  # Specifico che è solo italiano
    }
    
    os.makedirs(os.path.dirname(LIBRARY_PATH), exist_ok=True)
    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(library_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Completato!")
    print(f"  📄 Documenti aggiunti: {new_count}")
    print(f"  📊 Totale nel database: {len(items)}")
    print(f"  🌍 Lingua: Italiano")
    print(f"  📁 Salvato in: {LIBRARY_PATH}")

if __name__ == "__main__":
    main()
