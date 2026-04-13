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
END_YEAR = datetime.now().year

# Mapping delle categorie ai path Vatican
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
    "messages": {
        "path": f"{FRANCESCO_URL}/messages",
        "categoryId": "messaggio",
        "displayName": "Messaggi",
        "years": False,
        "special": ["pont-messages", "urbi", "lent", "food", "peace", "poveri"]
    },
    "audiences": {
        "path": f"{FRANCESCO_URL}/audiences",
        "categoryId": "udienza",
        "displayName": "Udienze",
        "years": True
    },
    "bulls": {
        "path": f"{FRANCESCO_URL}/bulls",
        "categoryId": "bolla",
        "displayName": "Bolle",
        "years": False
    },
    "apost_constitutions": {
        "path": f"{FRANCESCO_URL}/apost_constitutions",
        "categoryId": "costituzione_apostolica",
        "displayName": "Costituzioni Apostoliche",
        "years": False
    },
    "motu_proprio": {
        "path": f"{FRANCESCO_URL}/motu_proprio",
        "categoryId": "motu_proprio",
        "displayName": "Motu Proprio",
        "years": False
    },
}

# Tema dictionary - keywords per categoria
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

# Hint di riflessione per categoria
REFLECTION_HINTS_BY_CATEGORY = {
    "angelus": [
        "Cosa mi dice questa parola?",
        "Come posso vivere questa esperienza?",
        "Quale conversione mi chiede?"
    ],
    "omelia": [
        "Qual è il messaggio centrale?",
        "Come applico questo insegnamento alla mia vita?",
        "Quali atteggiamenti devo cambiare?"
    ],
    "preghiera": [
        "Come posso fare mia questa preghiera?",
        "Quali intenzioni aggiungo alle mie preghiere?",
        "Come posso preghiera con il cuore?"
    ],
    "enciclica": [
        "Qual è la visione presentata?",
        "Come contribuisco a realizzarla?",
        "Quali cambiamenti mi richiede?"
    ],
    "discorso": [
        "Quale insegnamento mi colpisce?",
        "Come posso metterlo in pratica?",
        "Chi ha bisogno di sentire questo messaggio?"
    ],
    "lettera": [
        "Qual è la chiamata diretta a me?",
        "Come rispondo a questa esortazione?",
        "Quali impegni nascono da queste parole?"
    ],
    "lettera_apostolica": [
        "Quale autorità apostolica viene esercitata?",
        "Come accolgo questo insegnamento?",
        "Quale impegno mi chiede per la Chiesa?"
    ],
    "meditazione": [
        "Quale verità emerge?",
        "Come contemplo questo mistero?",
        "Quale risposta mi chiedono queste parole?"
    ],
    "esortazione_apostolica": [
        "Quale esortazione mi raggiunge direttamente?",
        "Come accetto questa chiamata?",
        "Quale conversione mi viene proposta?"
    ],
    "messaggio": [
        "A chi è destinato questo messaggio?",
        "Quale speranza comunica?",
        "Come posso viverlo nel mio contesto?"
    ],
    "udienza": [
        "Quale insegnamento catechetico ricevo?",
        "Come approfondisco la mia comprensione?",
        "Cosa desidero meditare ancora?"
    ],
}


def clean_text(text):
    """Rimuove rumore dal testo estratto"""
    # Rimuovi copyright e crediti
    text = re.sub(r'©\s*Copyright.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dicastero per la Comunicazione.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'La Santa Sede.*?(?=\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Magisterium.*?Calendario.*?(?=\n|$)', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Rimuovi links e attributi tecnici
    text = re.sub(r'http[s]?://\S+', '', text)
    text = re.sub(r'\[.*?\]', '', text)
    
    # Elabora linee
    lines = text.split('\n')
    clean_lines = []
    nav_words = {'Français', 'English', 'Italiano', 'Português', 'Español', 'Deutsch', 'Polski', 'العربيّة', '中文', 'Latine', '×', 'Home', 'Medien', 'Media'}
    
    for line in lines:
        line = line.strip()
        if not line: 
            continue
        if len(line) < 3: 
            continue
        if line in nav_words: 
            continue
        if "La Santa Sede" in line and len(line) < 20: 
            continue
        if any(kw in line for kw in ['Magisterium', 'Calendario', 'Celebrazioni Liturgiche', 'breadcrumb']): 
            continue
        
        clean_lines.append(line)
    
    return '\n\n'.join(clean_lines)


def extract_themes(text):
    """Estrae i temi dal testo basandosi su keywords"""
    themes = []
    text_lower = text.lower()
    
    # Conta occorrenze per tema
    theme_scores = defaultdict(int)
    
    for theme, keywords in THEME_KEYWORDS.items():
        for keyword in keywords:
            count = len(re.findall(r'\b' + keyword + r'\b', text_lower))
            theme_scores[theme] += count
    
    # Prendi i temi con almeno 2 occorrenze, ordinati per frequenza
    sorted_themes = sorted(
        [(theme, score) for theme, score in theme_scores.items() if score >= 2],
        key=lambda x: x[1],
        reverse=True
    )
    
    # Restituisci i primi 3 temi o quelli più significativi
    themes = [theme for theme, score in sorted_themes[:3]]
    
    # Se nessun tema trovato, usa un tema generico per categoria
    if not themes:
        themes = ["Fede"]
    
    return themes


def generate_reflection_hints(categoryId, text):
    """Genera hint di riflessione basati sulla categoria e sul contenuto"""
    base_hints = REFLECTION_HINTS_BY_CATEGORY.get(categoryId, [
        "Cosa mi dice questa parola?",
        "Come posso vivere questa esperienza?"
    ])
    
    # Aggiungi hint specifici in base al contenuto
    additional_hints = []
    
    if re.search(r'\b(aiut|bisogn|poor|marginal)\w*', text, re.IGNORECASE):
        additional_hints.append("Chi ha bisogno di questa parola?")
    
    if re.search(r'\b(preghier|prega|adora)\w*', text, re.IGNORECASE):
        additional_hints.append("Come continuo in preghiera?")
    
    if re.search(r'\b(amore|carità|dono)\w*', text, re.IGNORECASE):
        additional_hints.append("Come testimonio questo amore?")
    
    if re.search(r'\b(speranza|fiducia|futuro)\w*', text, re.IGNORECASE):
        additional_hints.append("Quale speranza mi comunica?")
    
    return base_hints + additional_hints[:2]


def chunk_text(text, max_chars=2000):
    """Suddivide il testo in chunks mantenendo i paragrafi"""
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for p in paragraphs:
        if len(current_chunk) + len(p) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p
        else:
            if current_chunk:
                current_chunk += "\n\n" + p
            else:
                current_chunk = p
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks


def fetch_with_retry(url, max_retries=3, timeout=10):
    """Fetch con retry logic e backoff esponenziale"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                print(f"❌ Fallito dopo {max_retries} tentativi: {url}")
                return None
            wait_time = 2 ** attempt
            print(f"⚠️  Tentativo {attempt + 1} fallito, riprovo tra {wait_time}s... ({str(e)[:50]})")
            time.sleep(wait_time)
    return None


def scrape_doc(url):
    """Scrapa il contenuto da un documento Vatican"""
    response = fetch_with_retry(url)
    if not response:
        return ""
    
    try:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Selettori possibili per il contenuto
        content = (
            soup.select_one('.document-content') or
            soup.select_one('#document-content') or
            soup.select_one('.vaticanrichtext') or
            soup.select_one('.default') or
            soup.select_one('article') or
            soup.select_one('main') or
            soup.select_one('body')
        )
        
        if not content:
            return ""
        
        # Rimuovi elementi indesiderati
        for tag in content.select('.header, .footer, nav, script, style, .languages, .breadcrumb, .headerpdf, .zoom-text, .sidebar, .navigation'):
            tag.decompose()
        
        text = content.get_text(separator='\n')
        return clean_text(text)
    
    except Exception as e:
        print(f"❌ Errore nel parsing {url}: {e}")
        return ""


def get_index_links(index_url, category_info):
    """Estrae i link dagli indici annuali/mensili"""
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
            
            # Risolvi URL relativo
            full_url = urljoin(index_url, href)
            
            # Escludi indici e pagine non rilevanti
            if any(x in full_url for x in ['index.html', '.dir', 'year.dir', 'month.dir']):
                continue
            
            # Deduplicazione
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
        print(f"❌ Errore nel parsing indice {index_url}: {e}")
        return []


def build_scrape_urls():
    """Costruisce l'elenco completo di URL da scrappare"""
    urls_to_scrape = []
    
    for category_key, category_info in CATEGORIES_MAP.items():
        print(f"\n📋 Costruendo URL per: {category_info['displayName']}")
        
        if category_info.get("years"):
            # Categorie con anni
            for year in range(START_YEAR, END_YEAR + 1):
                year_url = f"{category_info['path']}/{year}.index.html"
                
                if category_info.get("months"):
                    # Se ha mesi, fetch prima l'indice anno
                    month_pages = get_index_links(year_url, category_info)
                    urls_to_scrape.extend(month_pages)
                else:
                    # Altrimenti aggiungi direttamente l'indice anno
                    links = get_index_links(year_url, category_info)
                    urls_to_scrape.extend(links)
                
                print(f"  ✓ {year}: {len([u for u in urls_to_scrape if u.get('categoryId') == category_info['categoryId']])} link trovati")
                time.sleep(0.2)  # Rate limiting
        
        elif category_info.get("special"):
            # Categorie con sottosezioni speciali (es. Messaggi)
            for special in category_info["special"]:
                special_url = f"{category_info['path']}/{special}.index.html"
                links = get_index_links(special_url, category_info)
                urls_to_scrape.extend(links)
                print(f"  ✓ {special}: {len(links)} link trovati")
                time.sleep(0.2)
        
        else:
            # Categorie senza anni
            base_url = f"{category_info['path']}.index.html"
            links = get_index_links(base_url, category_info)
            urls_to_scrape.extend(links)
            print(f"  ✓ Total: {len(links)} link trovati")
            time.sleep(0.2)
    
    print(f"\n✅ Totale URL da scrappare: {len(urls_to_scrape)}")
    return urls_to_scrape


def process_documents(urls_to_scrape, batch_size=500):
    """Processa i documenti e crea gli item per il JSON"""
    new_items = []
    processed = 0
    skipped = 0
    
    # Load existing IDs
    existing_ids = set()
    if os.path.exists(LIBRARY_PATH):
        try:
            with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
                library_data = json.load(f)
                existing_ids = set(item['id'] for item in library_data.get('items', []))
        except:
            pass
    
    print(f"\n📄 Processing {len(urls_to_scrape)} documenti...")
    
    for i, link in enumerate(urls_to_scrape):
        if i > 0 and i % 50 == 0:
            print(f"  Elaborati {i}/{len(urls_to_scrape)} documenti...")
        
        text = scrape_doc(link['url'])
        
        if len(text) < 300:
            skipped += 1
            continue
        
        # Estrai temi
        themes = extract_themes(text)
        
        # Suddividi in chunks
        chunks = chunk_text(text, max_chars=2000)
        
        for chunk_idx, chunk in enumerate(chunks):
            if len(chunk) < 150:
                continue
            
            # Genera ID stabile
            stable_id = f"{link['categoryId']}_{hashlib.md5(chunk[:100].encode()).hexdigest()[:12]}"
            
            if stable_id in existing_ids:
                continue
            
            # Seleziona il titolo
            title = link['title']
            if len(chunks) > 1:
                title = f"{title} (Parte {chunk_idx + 1})"
            
            # Genera hint di riflessione
            reflection_hints = generate_reflection_hints(link['categoryId'], chunk)
            
            item = {
                "id": stable_id,
                "categoryId": link['categoryId'],
                "themeIds": themes,
                "title": title,
                "content": chunk,
                "author": "Papa Francesco",
                "reflectionHints": reflection_hints,
                "source_url": link['url'],
                "scraped_at": datetime.now().isoformat()
            }
            
            new_items.append(item)
            existing_ids.add(stable_id)
        
        processed += 1
        time.sleep(0.1)  # Rate limiting
    
    print(f"✅ Elaborati: {processed} documenti, Skip: {skipped} (troppo corti)")
    return new_items


def merge_and_save(new_items):
    """Merge dei nuovi item con quelli esistenti e salvataggio"""
    
    # Load existing
    if os.path.exists(LIBRARY_PATH):
        try:
            with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
                library_data = json.load(f)
        except:
            library_data = {"categories": [], "items": []}
    else:
        library_data = {"categories": [], "items": []}
    
    # Merge
    existing_ids = set(item['id'] for item in library_data.get('items', []))
    added_count = 0
    
    for item in new_items:
        if item['id'] not in existing_ids:
            library_data['items'].append(item)
            added_count += 1
    
    # Aggiorna metadata
    if not library_data.get('categories'):
        library_data['categories'] = list(CATEGORIES_MAP.values())
    
    library_data['lastUpdated'] = datetime.now().isoformat()
    library_data['totalItems'] = len(library_data['items'])
    
    # Crea directory se non esiste
    os.makedirs(os.path.dirname(LIBRARY_PATH), exist_ok=True)
    
    # Salva
    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(library_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Salvato: {added_count} nuovi item")
    print(f"📊 Totale item nel database: {library_data['totalItems']}")
    print(f"📁 Salvato in: {LIBRARY_PATH}")
    
    return added_count


def main():
    """Main execution"""
    print("=" * 70)
    print("🙏 VATICAN.VA ADVANCED SCRAPER - Papa Francesco 2013-2025")
    print("=" * 70)
    
    # Step 1: Build URLs
    print("\n🔗 STEP 1: Building URL list...")
    urls_to_scrape = build_scrape_urls()
    
    # Step 2: Process documents
    print("\n📥 STEP 2: Processing documents...")
    new_items = process_documents(urls_to_scrape)
    
    # Step 3: Merge and save
    print("\n💾 STEP 3: Saving to JSON...")
    added = merge_and_save(new_items)
    
    print("\n" + "=" * 70)
    print(f"✨ Scraping completato! {added} nuovi documenti aggiunti.")
    print("=" * 70)


if __name__ == "__main__":
    main()