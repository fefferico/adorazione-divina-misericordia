import requests
from bs4 import BeautifulSoup
import json
import re
import time
import os

BASE_URL = "https://www.vatican.va"
FRANCESCO_URL = f"{BASE_URL}/content/francesco/it"
LIBRARY_PATH = "public/assets/data/francesco.json"

def clean_text(text):
    # Remove noise
    text = re.sub(r'©\s*Copyright.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dicastero per la Comunicazione.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'La Santa Sede.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Magisterium.*Calendario.*', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    lines = text.split('\n')
    clean_lines = []
    # common navigation words that appear alone on a line
    nav_words = {'Français', 'English', 'Italiano', 'Português', 'Español', 'Deutsch', 'Polski', 'العربيّة', '中文', 'Latine', '×'}
    
    for line in lines:
        line = line.strip()
        if not line: continue
        if len(line) < 3: continue
        if line in nav_words: continue
        if "La Santa Sede" in line and len(line) < 20: continue
        if any(keyword in line for keyword in ['Magisterium', 'Calendario', 'Celebrazioni Liturgiche']): continue
        
        clean_lines.append(line)
        
    return '\n\n'.join(clean_lines)


def chunk_text(text, max_chars=1000):
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for p in paragraphs:
        if len(current_chunk) + len(p) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p
        else:
            current_chunk += "\n\n" + p
            
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

def get_links_recursive(url, depth=1):
    if depth > 2: return []
    print(f"Fetching: {url} (depth {depth})")
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        links = []
        for a in soup.select('a[href*=".html"]'):
            href = a['href']
            title = a.get_text(strip=True)
            
            if href.startswith('/'): href = BASE_URL + href
            elif not href.startswith('http'): 
                # Relative to current path
                base_path = url.rsplit('/', 1)[0]
                href = f"{base_path}/{href}"

            if 'content/francesco/it/' not in href: continue
            if any(x in href for x in ['index.html', 'year.dir']):
                # Don't recurse into everything, only if it looks promising
                if depth < 2:
                    links.extend(get_links_recursive(href, depth + 1))
            else:
                if any(x in href for x in ['encyclicals', 'homilies', 'angelus']):
                    links.append({"title": title, "url": href})
        
        return links
    except Exception as e:
        print(f"Error recursive {url}: {e}")
        return []

def scrape_doc(url):
    print(f"Scraping doc: {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Modern Vatican site uses .vaticanrichtext, .document-content, or #document-content
        content = (
            soup.select_one('.document-content') or 
            soup.select_one('#document-content') or 
            soup.select_one('.vaticanrichtext') or
            soup.select_one('.default') or
            soup.select_one('body')
        )
        
        if not content: return ""
            
        # Clean up specific elements
        for tag in content.select('.header, .footer, nav, script, style, .languages, .breadcrumb, .headerpdf, .zoom-text'):
            tag.decompose()
            
        text = content.get_text(separator='\n')
        return clean_text(text)

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""

def main():
    start_urls = [
        f"{FRANCESCO_URL}/homilies.index.html",
        f"{FRANCESCO_URL}/encyclicals.index.html",
        f"{FRANCESCO_URL}/angelus.index.html"
    ]
    
    all_links = []
    seen_urls = set()
    
    for url in start_urls:
        links = get_links_recursive(url)
        for l in links:
            if l['url'] not in seen_urls:
                all_links.append(l)
                seen_urls.add(l['url'])
                
    import hashlib
    print(f"Found {len(all_links)} total candidate links.")
    
    new_items = []
    # Increase limit to 100 for substantial population
    for link in all_links[:100]:
        text = scrape_doc(link['url'])
        if len(text) < 200: continue
        
        chunks = chunk_text(text)
        category = "enciclica"
        if "homilies" in link['url']: category = "omelia"
        elif "angelus" in link['url']: category = "omelia"
        
        for i, chunk in enumerate(chunks):
            if len(chunk) < 100: continue
            
            theme = "Misericordia"
            if "Speranza" in chunk: theme = "Speranza"
            elif "Amore" in chunk: theme = "Amore"
            elif "Carità" in chunk: theme = "Carità"
            
            # Stable ID using MD5 hash of first 100 chars
            stable_id = f"vatican-{hashlib.md5(chunk[:100].encode()).hexdigest()[:12]}"
            
            new_items.append({
                "id": stable_id,
                "category": category,
                "title": f"{link['title']} (Estratto {i+1})",
                "content": chunk,
                "author": "Papa Francesco",
                "theme": theme
            })
        time.sleep(0.3)

    # Load and Merge
    if os.path.exists(LIBRARY_PATH):
        with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
            library_data = json.load(f)
            library_items = library_data.get("items", [])
    else:
        library_data = {"categories": [], "items": []}
        library_items = []
        
    existing_ids = set(item['id'] for item in library_items)
    added = 0
    for item in new_items:
        if item['id'] not in existing_ids:
            library_items.append(item)
            added += 1
            existing_ids.add(item['id'])
            
    library_data["items"] = library_items
            
    with open(LIBRARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(library_data, f, ensure_ascii=False, indent=2)
    
    print(f"Added {added} new high-quality items. Total: {len(library_items)}")

if __name__ == "__main__":
    main()
