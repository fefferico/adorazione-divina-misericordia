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

# Mappa mesi italiani
MONTH_MAP = {
    'gennaio': 1, 'febbraio': 2, 'marzo': 3, 'aprile': 4,
    'maggio': 5, 'giugno': 6, 'luglio': 7, 'agosto': 8,
    'settembre': 9, 'ottobre': 10, 'novembre': 11, 'dicembre': 12,
    # Abbreviazioni
    'gen': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'mag': 5, 'giu': 6,
    'lug': 7, 'ago': 8, 'set': 9, 'ott': 10, 'nov': 11, 'dic': 12,
}

# Categorie con solo italiano
CATEGORIES_MAP = {
    "angelus": {
        "path": f"{FRANCESCO_URL}/angelus",
        "categoryId": "angelus",
        "displayName": "Angelus - Regina Cæli",
        "years": True
    },
    "homilies": {
        "path": f"{FRANCESCO_URL}/homilies",
        "categoryId": "omelia",
        "displayName": "Omelie",
        "years": True
    },
    "prayers": {
        "path": f"{FRANCESCO_URL}/prayers",
        "categoryId": "preghiera",
        "displayName": "Preghiere",
        "years": False
    },
    "encyclicals": {
        "path": f"{FRANCESCO_URL}/encyclicals",
        "categoryId": "enciclica",
        "displayName": "Encicliche",
        "years": False
    },
    "speeches": {
        "path": f"{FRANCESCO_URL}/speeches",
        "categoryId": "discorso",
        "displayName": "Discorsi",
        "years": True,
        "months": True
    },
    "letters": {
        "path": f"{FRANCESCO_URL}/letters",
        "categoryId": "lettera",
        "displayName": "Lettere",
        "years": True
    },
    "apost_letters": {
        "path": f"{FRANCESCO_URL}/apost_letters",
        "categoryId": "lettera_apostolica",
        "displayName": "Lettere Apostoliche",
        "years": False
    },
    "cotidie": {
        "path": f"{FRANCESCO_URL}/cotidie",
        "categoryId": "meditazione",
        "displayName": "Meditazioni Quotidiane",
        "years": True
    },
    "apost_exhortations": {
        "path": f"{FRANCESCO_URL}/apost_exhortations",
        "categoryId": "esortazione_apostolica",
        "displayName": "Esortazioni Apostoliche",
        "years": False
    },
    "audiences": {
        "path": f"{FRANCESCO_URL}/audiences",
        "categoryId": "udienza",
        "displayName": "Udienze",
        "years": True
    },
}

THEME_KEYWORDS = {
    "Misericordia": ["misericordia", "pietà", "compassione", "perdono", "riconciliazione"],
    "Speranza": ["speranza", "fiducia", "futuro", "rinascita", "resurrezione"],
    "Amore": ["amore", "carità", "dono", "sacrificio", "dedizione"],
    "Fede": ["fede", "credenza", "credo", "dio", "divino", "santo"],
    "Pace": ["pace", "conflitto", "guerra", "fratellanza", "concordia"],
    "Giustizia": ["giustizia", "equità", "diritto", "dignità", "uguaglianza"],
    "Poveri": ["povero", "povertà", "bisognoso", "margine", "esclusione"],
    "Famiglia": ["famiglia", "matrimonio", "genitore", "figlio", "generazione"],
    "Creato": ["creato", "natura", "ambiente", "ecologia", "terra"],
    "Chiesa": ["chiesa", "comunità", "fedele", "sacramento", "liturgia"],
}

def clean_text(text):
    """Rimuove rumore dal testo"""
    text = re.sub(r'©\s*Copyright.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dicastero per la Comunicazione.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'La Santa Sede.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'http[s]?://\S+', '', text)
    text = re.sub(r'\[.*?\]', '', text)
    
    lines = text.split('\n')
    clean_lines = []
    nav_words = {'Français', 'English', 'Italiano', 'Português', 'Español', 'Deutsch', 'Polski', '中文', 'Latine', '×'}
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
        if line in nav_words:
            continue
        clean_lines.append(line)
    
    return '\n\n'.join(clean_lines)

def extract_date(text, url):
    """
    Estrae la data di pubblicazione dal testo o URL.
    Ritorna data ISO (YYYY-MM-DD)
    """
    if not text:
        return None
    
    text_lower = text.lower()
    
    # Pattern 1: "15 maggio 2023" (italiano completo)
    months_pattern = '|'.join(MONTH_MAP.keys())
    match = re.search(rf'(\d{{1,2}})\s+({months_pattern})\s+(\d{{4}})', text_lower)
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
    
    # Pattern 3: "15/5/2023" o "15/05/2023"
    match = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', text)
    if match:
        day, month, year = match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
    
    # Pattern 4: Da URL (20230515)
    match = re.search(r'(\d{8})', url)
    if match:
        date_str = match.group(1)
        try:
            datetime.strptime(date_str, '%Y%m%d')
            return f"{date_str[0:4]}-{date_str[4:6]}-{date_str[6:8]}"
        except:
            pass
    
    # Fallback: anno dall'URL
    match = re.search(r'/(\d{4})[/.]', url)
    if match:
        year = match.group(1)
        return f"{year}-01-01"
    
    return None

def extract_themes(text):
    """Estrae temi dal testo"""
    text_lower = text.lower()
    scores = defaultdict(int)
    
    for theme, keywords in THEME_KEYWORDS.items():
        for keyword in keywords:
            count = len(re.findall(r'\b' + keyword + r'\b', text_lower))
            scores[theme] += count
    
    sorted_themes = sorted(
        [(theme, score) for theme, score in scores.items() if score >= 2],
        key=lambda x: x[1],
        reverse=True
    )
    
    return [theme for theme, score in sorted_themes[:3]] if sorted_themes else ["Fede"]

def fetch_with_retry(url, max_retries=3, timeout=10):
    """Fetch con retry logic"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                return None
            wait_time = 2 ** attempt
            time.sleep(wait_time)
    return None

def scrape_doc(url):
    """Scrapa documento e ritorna (testo, data)"""
    response = fetch_with_retry(url)
    if not response:
        return "", None
    
    try:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Cerca i blocchi vaticanrichtext
        text_blocks = soup.select('.text.parbase.vaticanrichtext')
        
        if len(text_blocks) >= 2:
            # Uniamo tutti i blocchi dal secondo in poi
            text = '\n\n'.join([b.get_text(separator='\n') for b in text_blocks[1:]])
        elif len(text_blocks) == 1:
            text = text_blocks[0].get_text(separator='\n')
        else:
            # Fallback
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
        date = extract_date(clean, url)
        
        return clean, date
    except Exception as e:
        return "", None

def get_index_links(index_url, category_info):
    """Estrae link dagli indici"""
    response = fetch_with_retry(index_url)
    if not response:
        return []
    
    try:
        soup = BeautifulSoup(response.content, 'html.parser')
        links = []
        seen = set()
        
        for a in soup.select('a[href*=".html"]'):
            href = a.get('href', '')
            title = a.get_text(strip=True)
            
            if not href or not title:
                continue
            
            full_url = urljoin(index_url, href)
            
            # Solo italiano
            if not full_url.startswith('https://www.vatican.va'):
                continue
            if '/it/' not in full_url:
                continue
            if any(x in full_url for x in ['index.html', '.dir', 'year.dir']):
                continue
            if len(full_url) < 40:
                continue
            
            if full_url in seen:
                continue
            
            seen.add(full_url)
            links.append({
                "title": title,
                "url": full_url,
                "categoryId": category_info["categoryId"]
            })
        
        return links
    except Exception as e:
        return []

def build_scrape_urls():
    """Costruisce URL da scrappare"""
    urls_to_scrape = []
    
    for category_key, category_info in CATEGORIES_MAP.items():
        print(f"\n📋 {category_info['displayName']}...")
        
        if category_info.get("years"):
            for year in range(START_YEAR, END_YEAR + 1):
                year_url = f"{category_info['path']}/{year}.index.html"
                
                if category_info.get("months"):
                    month_pages = get_index_links(year_url, category_info)
                    urls_to_scrape.extend(month_pages)
                else:
                    links = get_index_links(year_url, category_info)
                    urls_to_scrape.extend(links)
                
                count = len([u for u in urls_to_scrape if u.get('categoryId') == category_info['categoryId']])
                if links:
                    print(f"  ✓ {year}: {len(links)}")
                time.sleep(0.15)
        else:
            base_url = f"{category_info['path']}.index.html"
            links = get_index_links(base_url, category_info)
            urls_to_scrape.extend(links)
            if links:
                print(f"  ✓ Found: {len(links)}")
            time.sleep(0.15)
    
    print(f"\n✅ Totale URL: {len(urls_to_scrape)}")
    return urls_to_scrape

def process_documents(urls_to_scrape):
    """Processa i documenti"""
    new_items = []
    existing_ids = set()
    
    if os.path.exists(LIBRARY_PATH):
        try:
            with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
                library_data = json.load(f)
                existing_ids = {item['id'] for item in library_data.get('items', [])}
        except:
            pass
    
    print(f"\n📄 Processing {len(urls_to_scrape)} documenti...")
    
    for i, link in enumerate(urls_to_scrape):
        if i > 0 and i % 50 == 0:
            print(f"  {i}/{len(urls_to_scrape)}... ({len(new_items)} nuovi)")
        
        text, pub_date = scrape_doc(link['url'])
        
        if len(text) < 200:
            continue
        
        themes = extract_themes(text)
        stable_id = f"{link['categoryId']}_{hashlib.md5(text[:100].encode()).hexdigest()[:12]}"
        
        if stable_id in existing_ids:
            continue
        
        title = link['title']
        
        item = {
            "id": stable_id,
            "categoryId": link['categoryId'],
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
            "source_url": link['url'],
            "scraped_at": datetime.now().isoformat()
        }
        
        new_items.append(item)
        existing_ids.add(stable_id)
        time.sleep(0.05)
    
    return new_items

def merge_and_save(new_items):
    """Salva i dati"""
    if os.path.exists(LIBRARY_PATH):
        try:
            with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
                library_data = json.load(f)
        except:
            library_data = {"items": []}
    else:
        library_data = {"items": []}
    
    existing_ids = set(item['id'] for item in library_data.get('items', []))
    added_count = 0
    
    for item in new_items:
        if item['id'] not in existing_ids:
            library_data['items'].append(item)
            added_count += 1
    
    library_data['lastUpdated'] = datetime.now().isoformat()
    library_data['totalItems'] = len(library_data['items'])
    library_data['language'] = 'it'  # Specifico italiano
    
    os.makedirs(os.path.dirname(LIBRARY_PATH), exist_ok=True)
    
    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(library_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Completato!")
    print(f"  📄 Nuovi: {added_count}")
    print(f"  📊 Totale: {library_data['totalItems']}")
    print(f"  🌍 Lingua: Italiano")
    print(f"  📅 Con date di pubblicazione")

def main():
    print("=" * 70)
    print("🙏 VATICAN SCRAPER - ITALIANO AVANZATO (2013-2025)")
    print("=" * 70)
    
    urls = build_scrape_urls()
    new_items = process_documents(urls)
    merge_and_save(new_items)

if __name__ == "__main__":
    main()
