# 🙏 Vatican Scraper - Guida Completa

## 🎯 Scegli la Tua Versione

### Opzione 1: SOLO ITALIANO (Consigliato ⭐)

**Perché scegliere?**
- ✅ 70% più veloce
- ✅ Con date di pubblicazione
- ✅ Dati più puliti
- ✅ Meno errori

**File:**
- `vatican_scraper_italian_simple.py` (30-60 min)
- `vatican_scraper_italian_advanced.py` (45-90 min)

```bash
python vatican_scraper_italian_simple.py
```

**Risultato:** 1,000-3,000 documenti italiani con date ✅

---

### Opzione 2: MULTILINGUE (Originale)

**Perché scegliere?**
- ✅ Tutte le lingue disponibili
- ✅ Più documenti (4,000-6,000)
- ✅ Temi avanzati

**File:**
- `vatican_scraper_simple.py` (30-60 min)
- `vatican_scraper_advanced.py` (45-90 min)

```bash
python vatican_scraper_simple.py
```

**Risultato:** 4,000-6,000 documenti multilingue

---

## 📊 Confronto

| Aspetto | ITALIANO | MULTILINGUE |
|---------|----------|-------------|
| Velocità | ⚡⚡⚡ 30-60 min | ⚡ 45-90 min |
| Documenti | 1,000-3,000 | 4,000-6,000 |
| Con date | ✅ | ❌ |
| Lingue | 🇮🇹 Solo IT | 🌍 7+ lingue |
| Per app meditazione | ✅ Perfetto | ✅ Va bene |

---

## 🚀 Quick Start

### Passo 1: Installa
```bash
pip install requests beautifulsoup4
mkdir -p public/assets/data
```

### Passo 2: Scegli

**Se vuoi solo italiano con date:**
```bash
python vatican_scraper_italian_simple.py
```

**Se vuoi tutte le lingue:**
```bash
python vatican_scraper_simple.py
```

### Passo 3: Aspetta
- Versione italiana: 30-60 minuti ☕
- Versione multilingue: 45-90 minuti ☕☕

### Passo 4: Risultati
```bash
python vatican_scraper_utils.py stats
```

---

## 📌 Dettagli Importanti

### Versione ITALIANA

**Cosa scarica:**
- URL: `https://www.vatican.va/content/francesco/it/*`
- Lingua: Solo italiano
- Categorie: 10 principali

**Struttura JSON:**
```json
{
  "id": "omelia_abc123",
  "categoryId": "omelia",
  "themeIds": ["Misericordia", "Fede"],
  "title": "Titolo documento",
  "content": "Testo...",
  "author": "Papa Francesco",
  "publishedDate": "2023-05-15",  ← NUOVO
  "reflectionHints": [...],
  "source_url": "https://...",
  "scraped_at": "2025-04-13T..."
}
```

**Data di pubblicazione:**
- Estratta da testo (es. "15 maggio 2023")
- O da URL (es. "20230515")
- Formato: `YYYY-MM-DD` (ISO)

---

### Versione MULTILINGUE

**Cosa scarica:**
- URL: `https://www.vatican.va/content/francesco/*` (tutte le lingue)
- Lingue: 🇮🇹 🇬🇧 🇫🇷 🇪🇸 🇩🇪 e altre
- Categorie: 14 categorie

**Struttura JSON:**
```json
{
  "id": "omelia_abc123",
  "categoryId": "omelia",
  "themeIds": ["Misericordia", "Fede"],
  "title": "Titolo documento",
  "content": "Testo...",
  "author": "Papa Francesco",
  // Senza publishedDate (non estratta nelle versioni multilingue)
  "reflectionHints": [...],
  "source_url": "https://...",
  "scraped_at": "2025-04-13T..."
}
```

---

## 📁 File Disponibili

### Script Principali
```
vatican_scraper_italian_simple.py      ← NUOVO ⭐ Versione italiana semplice
vatican_scraper_italian_advanced.py    ← NUOVO ⭐ Versione italiana avanzata
vatican_scraper_simple.py              ← Versione multilingue semplice
vatican_scraper_advanced.py            ← Versione multilingue avanzata
vatican_scraper_utils.py               ← Utilities (per tutte le versioni)
config_vatican_scraper.py              ← Configurazione
```

### Documentazione
```
README_ITALIAN.md              ← NUOVO ⭐ Guida versione italiana
README.md                      ← Guida versione multilingue
QUICK_FIX.md                   ← Risoluzione problemi
SETUP.md                       ← Setup tecnico
VATICAN_SCRAPER_DOCS.md        ← Documentazione completa
TROUBLESHOOTING.md             ← Debug
CHEAT_SHEET.md                 ← Comandi rapidi
INDEX.md                       ← Indice navigazione
```

---

## 🎯 Consiglio Personale

Per una **app di meditazione in italiano**, scelgo:

```bash
# 1. Versione italiana semplice (primo tentativo)
python vatican_scraper_italian_simple.py

# 2. Analizza risultati
python vatican_scraper_utils.py stats

# 3. Se soddisfatto, rimani con questa
# 4. Se vuoi più documenti, riprova versione avanzata
python vatican_scraper_italian_advanced.py
```

**Vantaggi:**
- ✅ Data di pubblicazione (filtri temporali)
- ✅ Solo italiano (no lingue inutili)
- ✅ 30-60 minuti (veloce!)
- ✅ 1,000-3,000 documenti (qualità>quantità)

---

## 💻 Comandi Comuni

### Versione italiana
```bash
python vatican_scraper_italian_simple.py
python vatican_scraper_italian_advanced.py
```

### Versione multilingue
```bash
python vatican_scraper_simple.py
python vatican_scraper_advanced.py
```

### Utilità (funziona con entrambe)
```bash
# Statistiche
python vatican_scraper_utils.py stats

# Filtra per tema
python vatican_scraper_utils.py filter --theme Misericordia

# Filtra per categoria
python vatican_scraper_utils.py filter --category omelia

# Valida
python vatican_scraper_utils.py validate

# Cerca keyword
python vatican_scraper_utils.py filter --keyword "amore"

# Analizza temi
python vatican_scraper_utils.py analyze
```

---

## 🔍 Filtrare per Data (Solo ITALIANO)

```python
import json
from datetime import datetime

with open('public/assets/data/francesco.json') as f:
    docs = json.load(f)['items']

# Documenti dell'ultimo mese
from datetime import timedelta
last_month = datetime.now() - timedelta(days=30)
recent = [d for d in docs 
          if d.get('publishedDate') and 
          d['publishedDate'] > last_month.isoformat()]

print(f"Documenti ultimo mese: {len(recent)}")

# Ordina per data (più recente prima)
sorted_docs = sorted(docs, 
                    key=lambda x: x.get('publishedDate') or '0000-01-01',
                    reverse=True)

for doc in sorted_docs[:5]:
    print(f"{doc['publishedDate']}: {doc['title']}")
```

---

## 🎨 Integrare nella App

### React
```javascript
import { useEffect, useState } from 'react';

function MeditationApp() {
  const [docs, setDocs] = useState([]);
  
  useEffect(() => {
    fetch('public/assets/data/francesco.json')
      .then(r => r.json())
      .then(data => {
        // Ordina per data (più recente)
        const sorted = data.items.sort((a, b) => 
          (b.publishedDate || '0000-01-01').localeCompare(
            a.publishedDate || '0000-01-01'
          )
        );
        setDocs(sorted);
      });
  }, []);
  
  return (
    <div>
      {docs.map(doc => (
        <div key={doc.id}>
          <h2>{doc.title}</h2>
          <p>📅 {doc.publishedDate}</p>
          <p>🎯 {doc.themeIds.join(', ')}</p>
          <p>{doc.content.substring(0, 200)}...</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ⚠️ Cosa Scegliere?

| Situazione | Scelta |
|-----------|--------|
| "Voglio solo italiano" | `vatican_scraper_italian_simple.py` ⭐ |
| "Voglio date di pubblicazione" | `vatican_scraper_italian_simple.py` ⭐ |
| "Voglio il massimo di documenti" | `vatican_scraper_advanced.py` |
| "Voglio tutte le lingue" | `vatican_scraper_advanced.py` |
| "Ho fretta (< 1 ora)" | `vatican_scraper_italian_simple.py` ⭐ |
| "Non ho fretta, voglio tutto" | `vatican_scraper_advanced.py` |

---

## ✅ Timeline Tipico

### Versione ITALIANA
```
T+0:   Leggi README_ITALIAN.md        (5 min)
T+5:   Installa dipendenze             (2 min)
T+7:   Esegui script                   (30-60 min)
T+67:  Analizza risultati              (5 min)
T+72:  JSON pronto per app! ✅
```

### Versione MULTILINGUE
```
T+0:   Leggi README.md                 (10 min)
T+10:  Installa dipendenze             (2 min)
T+12:  Esegui script                   (45-90 min)
T+102: Analizza risultati              (5 min)
T+107: JSON pronto per app! ✅
```

---

## 🎉 Inizia Ora!

**Scegli la tua versione:**

```bash
# CONSIGLIATO: Solo italiano con date
python vatican_scraper_italian_simple.py

# ALTERNATIVA: Tutte le lingue
python vatican_scraper_simple.py
```

Quindi:
```bash
python vatican_scraper_utils.py stats
```

---

## 📞 Aiuto

- Script italiano → Leggi [README_ITALIAN.md](README_ITALIAN.md)
- Script multilingue → Leggi [README.md](README.md)
- Problemi → Leggi [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Comandi rapidi → Vedi [CHEAT_SHEET.md](CHEAT_SHEET.md)

---

**Versione:** 2.0  
**Data:** 2025-04-13  
**Novità:** Script italiano con date di pubblicazione ⭐
