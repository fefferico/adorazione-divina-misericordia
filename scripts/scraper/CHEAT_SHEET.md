# 🙏 Vatican Scraper - Cheat Sheet

## 🚀 Comandi Principali

```bash
# Scraping completo (2013-2025)
python vatican_scraper_advanced.py

# Statistiche
python vatican_scraper_utils.py stats

# Filtri
python vatican_scraper_utils.py filter --category omelia --output omelie.json
python vatican_scraper_utils.py filter --theme Misericordia --output misericordia.json
python vatican_scraper_utils.py filter --keyword "amore" --output amore.json

# Analisi
python vatican_scraper_utils.py analyze        # Analizza temi
python vatican_scraper_utils.py gaps           # Trova gap temporali
python vatican_scraper_utils.py validate       # Verifica integrità
python vatican_scraper_utils.py dedup --save   # Rimuovi duplicati

# Campioni
python vatican_scraper_utils.py sample --num 10
python vatican_scraper_utils.py sample --num 5 --category angelus

# Info
python vatican_scraper_utils.py list           # Elenca categorie
```

---

## 📝 Categorie Disponibili

| CategoryId | Nome |
|---|---|
| `angelus` | Angelus - Regina Cæli |
| `omelia` | Omelie |
| `preghiera` | Preghiere |
| `enciclica` | Encicliche |
| `discorso` | Discorsi |
| `lettera` | Lettere |
| `lettera_apostolica` | Lettere Apostoliche |
| `meditazione` | Meditazioni Quotidiane |
| `esortazione_apostolica` | Esortazioni Apostoliche |
| `messaggio` | Messaggi |
| `udienza` | Udienze |
| `bolla` | Bolle |
| `costituzione_apostolica` | Costituzioni Apostoliche |
| `motu_proprio` | Motu Proprio |

---

## 🎯 Temi Estratti Automaticamente

| Tema | Keywords |
|---|---|
| **Misericordia** | misericordia, pietà, compassione, perdono, riconciliazione |
| **Speranza** | speranza, fiducia, futuro, rinascita, resurrezione |
| **Amore** | amore, carità, dono, sacrificio, dedizione |
| **Fede** | fede, credenza, credo, dio, divino, santo |
| **Pace** | pace, conflitto, guerra, fratellanza, concordia |
| **Giustizia** | giustizia, equità, diritto, dignità, uguaglianza |
| **Poveri** | povero, povertà, bisognoso, margine, esclusione |
| **Famiglia** | famiglia, matrimonio, genitore, figlio, generazione |
| **Creato** | creato, natura, ambiente, ecologia, terra |
| **Chiesa** | chiesa, comunità, fedele, sacramento, liturgia |

---

## 📊 Struttura JSON di Output

```json
{
  "id": "categoria_abc123",
  "categoryId": "categoria",
  "themeIds": ["Tema1", "Tema2"],
  "title": "Titolo del Documento",
  "content": "Testo integrale...",
  "author": "Papa Francesco",
  "reflectionHints": ["Hint1", "Hint2", "Hint3"],
  "source_url": "https://...",
  "scraped_at": "2025-04-13T10:30:45"
}
```

---

## 🔧 Personalizzazioni Rapide

### Cambiare anni
```python
START_YEAR = 2020  # Nel file vatican_scraper_advanced.py
END_YEAR = 2025
```

### Solo alcune categorie
Commenta in `CATEGORIES_MAP`:
```python
# "angelus": { ... },  # Commentato = saltato
# "omelia": { ... },
```

### Aumentare chunk size
```python
def chunk_text(text, max_chars=3000):  # Era 2000
```

### Ridurre rate limiting
⚠️ **Non farlo!** Rispetta il server.

---

## 💻 Uso in Python

```python
import json

# Carica
with open('public/assets/data/francesco.json') as f:
    library = json.load(f)

documents = library['items']

# Filtra per categoria
omelie = [d for d in documents if d['categoryId'] == 'omelia']

# Filtra per tema
misericordia = [d for d in documents if 'Misericordia' in d['themeIds']]

# Cerca nel contenuto
risultati = [d for d in documents if 'amore' in d['content'].lower()]

# Accedi a un documento
print(documents[0]['title'])
print(documents[0]['reflectionHints'])
```

---

## 🎨 Uso in JavaScript

```javascript
// Carica
fetch('public/assets/data/francesco.json')
  .then(r => r.json())
  .then(data => {
    const docs = data.items;
    
    // Filtra categoria
    const omelie = docs.filter(d => d.categoryId === 'omelia');
    
    // Filtra tema
    const misericordia = docs.filter(d => 
      d.themeIds.includes('Misericordia')
    );
    
    // Random
    const random = docs[Math.floor(Math.random() * docs.length)];
    
    // Mostra
    console.log(random.title);
    random.reflectionHints.forEach(h => console.log('- ' + h));
  });
```

---

## 📈 Statistiche Rapide

```bash
# Numero totale
cat public/assets/data/francesco.json | grep -o '"id"' | wc -l

# Categorie uniche
python vatican_scraper_utils.py stats | grep "→"

# Controllare integrità
python vatican_scraper_utils.py validate
```

---

## 🐛 Quick Fixes

| Problema | Soluzione |
|---|---|
| Pochi documenti | Aumenta `max_chars` da 2000 a 3000 |
| Connection error | Riprova dopo 10 minuti |
| JSON corrotto | Ripristina backup e riprova |
| Script lento | Limita anni: `START_YEAR = 2023` |
| Troppi duplicati | Esegui `dedup --save` |

---

## ✅ Pre-Esecuzione

```bash
✓ pip install requests beautifulsoup4
✓ mkdir -p public/assets/data
✓ ping www.vatican.va  # Test connessione
✓ python vatican_scraper_advanced.py
```

---

## 📞 Help

```bash
# Aiuto utils
python vatican_scraper_utils.py -h

# Leggi docs
cat VATICAN_SCRAPER_DOCS.md

# Vedi esempio
cat esempio_output_francesco.json
```

---

## 🎯 Workflow Tipico

```bash
# 1. Test veloce (ultimi 2 anni)
# Modifica START_YEAR = 2023, esegui

# 2. Controlla risultati
python vatican_scraper_utils.py stats

# 3. Estrai tema specifico
python vatican_scraper_utils.py filter --theme Misericordia

# 4. Esegui completo (2013-2025)
# Modifica START_YEAR = 2013, esegui

# 5. Valida e ottimizza
python vatican_scraper_utils.py validate
python vatican_scraper_utils.py dedup --save
```

---

## 🚀 Deploy

```bash
# Build per produzione
python vatican_scraper_advanced.py

# Comprimi JSON
gzip -9 public/assets/data/francesco.json

# Upload a server
scp public/assets/data/francesco.json user@server:/app/
```

---

**Tempo stimato:** 45-90 min  
**File output:** `public/assets/data/francesco.json` (~50-100 MB)  
**Documenti:** ~4,000-6,000  
**Ultimo update:** 2025-04-13
