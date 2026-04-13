# 🙏 Vatican.va Advanced Scraper - Quick Start Guide

## 📦 Cosa Hai Ricevuto

```
vatican_scraper_advanced.py     ← Script principale (USALO QUESTO!)
config_vatican_scraper.py       ← File di configurazione
vatican_scraper_utils.py        ← Tool di analisi e utilità
VATICAN_SCRAPER_DOCS.md         ← Documentazione completa
README.md                       ← Questo file
```

---

## ⚡ Quick Start (5 minuti)

### Step 1: Installa le dipendenze
```bash
pip install requests beautifulsoup4
```

### Step 2: Crea la directory di output
```bash
mkdir -p public/assets/data
```

### Step 3: Esegui lo scraper
```bash
python vatican_scraper_advanced.py
```

**Tempo stimato:** 45-90 minuti a seconda della velocità internet

### Step 4: Verifica il risultato
```bash
python vatican_scraper_utils.py stats
```

---

## 🎯 Utilizzo Principale

### Scraper Completo (da 2013-2025)
```bash
python vatican_scraper_advanced.py
```

Output: `public/assets/data/francesco.json` con ~4,000-6,000 documenti

### Analizzare i Dati Estratti
```bash
# Statistiche generali
python vatican_scraper_utils.py stats

# Filtrare per categoria
python vatican_scraper_utils.py filter --category omelia --output omelie.json

# Filtrare per tema
python vatican_scraper_utils.py filter --theme Misericordia --output misericordia.json

# Cercare keyword
python vatican_scraper_utils.py filter --keyword "amore" --output amore.json

# Mostra campioni
python vatican_scraper_utils.py sample --num 10 --category angelus

# Analizza temi
python vatican_scraper_utils.py analyze

# Verifica integrità
python vatican_scraper_utils.py validate
```

---

## 📊 Cosa Contiene il JSON

Ogni documento nel JSON ha questa struttura:

```json
{
  "id": "omelia_abc123def456",
  "categoryId": "omelia",
  "themeIds": ["Misericordia", "Fede", "Amore"],
  "title": "Il dono della Misericordia",
  "content": "Lunghissimo testo del documento...",
  "author": "Papa Francesco",
  "reflectionHints": [
    "Cosa mi dice questa parola?",
    "Come posso vivere questa esperienza?",
    "Quale conversione mi chiede?",
    "Chi ha bisogno di sentire questo messaggio?"
  ],
  "source_url": "https://www.vatican.va/content/francesco/it/homilies/2023/...",
  "scraped_at": "2025-04-13T10:30:45.123456"
}
```

---

## 🔧 Personalizzazione

### Cambiere i Range di Anni

Apri `vatican_scraper_advanced.py` e modifica:

```python
START_YEAR = 2020  # Invece di 2013
END_YEAR = 2025
```

### Scrappare Solo Alcune Categorie

Modifica `CATEGORIES_MAP` nel file principale (commenta le categorie che non ti servono).

### Aumentare/Diminuire Dimensione Chunk

```python
def chunk_text(text, max_chars=1500):  # Era 2000, ora 1500
```

### Disabilitare Delay (SCONSIGLIATO!)

⚠️ **Non farlo!** Il delay è importante per rispettare il server Vatican.

---

## 📈 Statistiche Attese

Con esecuzione completa da 2013-2025:

| Categoria | Documenti | Temi |
|-----------|-----------|------|
| Angelus | 600/anno | 2-3 |
| Omelie | 150/anno | 2-3 |
| Discorsi | 200/anno | 2-3 |
| Messaggi | 100/anno | 2-3 |
| Altre | 100-300 tot | 1-2 |

**Totale stimato:** 4,000-6,000 documenti

---

## 🎨 Per Un'App di Meditazione

Il JSON è pronto per un frontend React/Vue:

```javascript
// Filtro per categoria
const omelie = documents.filter(d => d.categoryId === 'omelia');

// Filtro per tema
const misericordia = documents.filter(d => d.themeIds.includes('Misericordia'));

// Combinato
const meditazioni_su_misericordia = documents.filter(d => 
  d.categoryId === 'meditazione' && 
  d.themeIds.includes('Misericordia')
);

// Mostra hint per riflessione
meditazioni_su_misericordia.forEach(doc => {
  console.log(`Titolo: ${doc.title}`);
  console.log(`Rifletti su:`);
  doc.reflectionHints.forEach(hint => console.log(`  - ${hint}`));
});
```

---

## 🐛 Troubleshooting

### "Connection error" o "Failed after 3 retries"
**Soluzione:** Il server Vatican potrebbe essere momentaneamente down. Riprova dopo 5-10 minuti.

### Pochi documenti estratti
**Soluzione:** 
- Verifica di avere 2-3 ore libere (non interrompere)
- Aumenta `max_chars` in `chunk_text()` da 2000 a 3000
- Riduci il filtro `len(chunk) < 150` a `< 100`

### JSON file molto grande (>500MB)
**Soluzione:**
- Dividi per anno in file separati
- Usa SQLite: `STORAGE_TYPE = "sqlite"` in config
- Comprimi con gzip

### Script molto lento
**Soluzione:**
- Non usare altre app contemporaneamente
- Aumenta `MAX_RETRIES` potrebbe peggiorare
- Verifica latenza internet: `ping www.vatican.va`

---

## 💡 Idee per l'App

### 1. **Daily Meditation**
```python
# Seleziona random un documento che non hai letto oggi
import random
daily = random.choice(documents)
```

### 2. **Thematic Collections**
```python
# Raggruppa per tema
from collections import defaultdict
by_theme = defaultdict(list)
for doc in documents:
    for theme in doc['themeIds']:
        by_theme[theme].append(doc)
```

### 3. **Search Full-Text**
```python
# Trova documenti che contengono una parola
def search(query):
    return [d for d in documents if query.lower() in d['content'].lower()]
```

### 4. **Reading Progress**
```python
# Traccia quali documenti hai già letto
read_ids = set(stored_read_ids)
unread = [d for d in documents if d['id'] not in read_ids]
```

### 5. **Tema del Mese**
```python
# Es. Aprile = tema "Misericordia"
monthly_themes = {
    4: 'Misericordia',  # Aprile
    5: 'Pace',          # Maggio
    6: 'Famiglia',      # Giugno
}
```

---

## 📚 Altre Risorse

- **Documentazione Completa:** `VATICAN_SCRAPER_DOCS.md`
- **Config File:** `config_vatican_scraper.py`
- **Utilities:** `python vatican_scraper_utils.py --help`
- **API Vatican:** https://www.vatican.va/

---

## ✅ Checklist Pre-Esecuzione

- [ ] Python 3.7+ installato
- [ ] `pip install requests beautifulsoup4`
- [ ] Directory `public/assets/data/` creata
- [ ] Connessione internet stabile (non WiFi instabile)
- [ ] 1-2 ore di tempo disponibile (non interrompere)
- [ ] Backup di dati precedenti (se esiste)
- [ ] Spazio disco disponibile (~100MB per JSON)

---

## 🎓 Esempi di Utilizzo

### Esempio 1: Estrai tutti i documenti su Misericordia
```bash
python vatican_scraper_utils.py filter --theme Misericordia --output misericordia.json
```

### Esempio 2: Analizza solo le Omelie degli ultimi 2 anni
```bash
# Modifica START_YEAR = 2023 nel file, poi esegui
python vatican_scraper_advanced.py
```

### Esempio 3: Verifica se ci sono problemi
```bash
python vatican_scraper_utils.py validate
```

### Esempio 4: Vedi un campione di Omelie
```bash
python vatican_scraper_utils.py sample --num 3 --category omelia
```

---

## 🚀 Prossimi Step

1. **Test locale:** Esegui con `START_YEAR = 2024` per testare
2. **Visualizzazione:** Crea interfaccia React per mostrare i documenti
3. **Database:** Passa a SQLite per performance migliori
4. **API:** Crea un backend Express/FastAPI per servire i dati
5. **Deploy:** Pubblica su Vercel/Heroku

---

## 📞 Supporto

In caso di problemi:

1. Leggi `VATICAN_SCRAPER_DOCS.md`
2. Controlla il Troubleshooting sopra
3. Verifica la connessione internet
4. Riprova lo scraper da capo

---

## 📜 Note Legali

- ✅ Lo scraping del Vatican.va è legale per uso personale
- ✅ I testi sono di dominio pubblico (Magisterium)
- ⚠️ Non distribuire senza attribuzione
- ⚠️ Rispetta il rate limiting (0.1-0.2s tra richieste)

---

## 🎉 Buon Lavoro!

Questo scraper è stato creato per aiutarti a costruire un'**app meravigliosa di meditazione e riflessione**.

Non esitare a personalizzare il codice secondo le tue esigenze!

**Bene a te nel tuo progetto! 🙏**

---

**Versione:** 1.0  
**Data:** 2025-04-13  
**Ultimo Update:** 2025-04-13
