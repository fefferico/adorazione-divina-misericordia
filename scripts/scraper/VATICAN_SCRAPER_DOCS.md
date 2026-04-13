# 🙏 Vatican.va Advanced Scraper - Documentazione

## 📋 Panoramica

Script Python avanzato per scrappare documenti dal portale Vatican.va di Papa Francesco (2013-2025) con estrazione automatica di temi, generazione di hint di riflessione e struttura JSON ottimizzata per app di meditazione.

---

## ✨ Caratteristiche Principali

### 1. **Copertura Completa**
- ✅ Tutte le 13 categorie di documenti
- ✅ Dal 2013 ad oggi (tutti gli anni disponibili)
- ✅ Support per strutture gerarchiche anno/mese (es. Discorsi)
- ✅ Gestione di categorie speciali (es. Messaggi con sottosezioni)

### 2. **Estrazione Intelligente di Temi**
Non assegna solo 1 tema, ma **estrae automaticamente fino a 3 temi** basandosi sulla frequenza di keyword nel testo:

**Temi supportati:**
- Misericordia (riconciliazione, perdono, pietà)
- Speranza (fiducia, futuro, rinascita)
- Amore (carità, dono, sacrificio)
- Fede (credenza, divino, santo)
- Pace (concordia, fratellanza)
- Giustizia (equità, dignità, uguaglianza)
- Poveri (marginalizzati, bisognosi)
- Famiglia (matrimonio, generazioni)
- Creato (ecologia, ambiente)
- Chiesa (comunità, liturgia, sacramenti)

**Esempio di estrazione:**
```
Testo: "Dio chiama alla misericordia e alla pace fra i popoli..."
→ Temi estratti: ["Misericordia", "Pace", "Fede"]
```

### 3. **Generazione Dinamica di Hint di Riflessione**
Crea hint personalizzati per categoria + contenuto:

```json
{
  "categoryId": "omelia",
  "reflectionHints": [
    "Qual è il messaggio centrale?",
    "Come applico questo insegnamento alla mia vita?",
    "Quali atteggiamenti devo cambiare?",
    "Chi ha bisogno di sentire questo messaggio?"
  ]
}
```

### 4. **Robustezza e Resilienza**
- Retry automatico con backoff esponenziale
- Deduplicazione intelligente tramite hash MD5
- Rate limiting per evitare sovraccarichi
- Gestione errori comprehensive

### 5. **Struttura JSON Ottimizzata**
Ogni documento diventa un item nel array con questa struttura:

```json
{
  "id": "omelia_a1b2c3d4e5f6",
  "categoryId": "omelia",
  "themeIds": ["Misericordia", "Fede", "Amore"],
  "title": "Il dono della Misericordia (Parte 1)",
  "content": "Lunghissimo contenuto testuale...",
  "author": "Papa Francesco",
  "reflectionHints": [
    "Cosa mi dice questa parola?",
    "Come posso vivere questa esperienza?"
  ],
  "source_url": "https://www.vatican.va/content/francesco/it/homilies/2023/...",
  "scraped_at": "2025-04-13T10:30:45.123456"
}
```

---

## 🗂️ Categorie Supportate

| CategoryId | Nome | Descrizione | Con Anni |
|------------|------|-------------|----------|
| `angelus` | Angelus - Regina Cæli | Messaggi domenicali | ✓ |
| `omelia` | Omelie | Celebrazioni e sacramenti | ✓ |
| `preghiera` | Preghiere | Testi di preghiera | ✗ |
| `enciclica` | Encicliche | Documenti magisteriali maggiori | ✗ |
| `discorso` | Discorsi | Allocuzioni e discorsi | ✓ (con mesi) |
| `lettera` | Lettere | Corrispondenza pontificia | ✓ |
| `lettera_apostolica` | Lettere Apostoliche | Documenti apostolici | ✗ |
| `meditazione` | Meditazioni Quotidiane | Meditazioni giornaliere (Cotidie) | ✓ |
| `esortazione_apostolica` | Esortazioni Apostoliche | Esortazioni apostoliche | ✗ |
| `messaggio` | Messaggi | Messaggi pontifici, Urbi et Orbi, etc. | ✓ (sottosezioni) |
| `udienza` | Udienze | Udienze generali | ✓ |
| `bolla` | Bolle | Documenti solenni | ✗ |
| `costituzione_apostolica` | Costituzioni Apostoliche | Norme costituzionali | ✗ |
| `motu_proprio` | Motu Proprio | Atti pontifici particolari | ✗ |

---

## 🚀 Come Usare

### Prerequisiti

```bash
pip install requests beautifulsoup4
```

### Esecuzione Completa

```bash
python vatican_scraper_advanced.py
```

**Output:**
1. Costruisce lista di ~10,000+ URL da tutte le categorie
2. Scrappa ogni documento con retry logic
3. Estrae temi automaticamente
4. Genera hint di riflessione
5. Salva in `public/assets/data/francesco.json`

**Tempo stimato:** 30-60 minuti (dipende dal numero di documenti)

---

## 🎯 Funzioni Principali

### `extract_themes(text)`
Analizza il testo e restituisce fino a 3 temi basati su keyword matching:

```python
text = "La misericordia di Dio è infinita e la pace riempie i nostri cuori..."
themes = extract_themes(text)
# → ["Misericordia", "Pace", "Fede"]
```

### `generate_reflection_hints(categoryId, text)`
Genera hint personalizzati:

```python
hints = generate_reflection_hints("omelia", "La carità ci salva...")
# → ["Qual è il messaggio centrale?", "Come testimonio questo amore?", ...]
```

### `chunk_text(text, max_chars=2000)`
Suddivide testi lunghi in porzioni mantenendo i paragrafi:

```python
chunks = chunk_text(long_text, max_chars=2000)
# → [chunk1, chunk2, chunk3, ...]
```

### `build_scrape_urls()`
Costruisce dinamicamente l'elenco completo di URL da tutte le categorie:

```python
urls = build_scrape_urls()
# → [{"title": "...", "url": "...", "categoryId": "..."}, ...]
```

---

## 📊 Struttura del JSON Finale

```json
{
  "categories": [
    {
      "path": "https://www.vatican.va/content/francesco/it/angelus",
      "categoryId": "angelus",
      "displayName": "Angelus - Regina Cæli",
      "years": true
    },
    ...
  ],
  "items": [
    {
      "id": "angelus_a1b2c3d4e5f6",
      "categoryId": "angelus",
      "themeIds": ["Speranza", "Fede"],
      "title": "La Misericordia del Padre",
      "content": "Testo integrale...",
      "author": "Papa Francesco",
      "reflectionHints": [...],
      "source_url": "https://...",
      "scraped_at": "2025-04-13T10:30:45.123456"
    },
    ...
  ],
  "lastUpdated": "2025-04-13T10:35:00.000000",
  "totalItems": 4582
}
```

---

## 🔧 Personalizzazione

### Aggiungere un Nuovo Tema

In `THEME_KEYWORDS`, aggiungi:

```python
"Guarigione": ["guarigione", "cura", "salute", "medicina", "ripresa"],
```

Poi il tema verrà estratto automaticamente da tutti i documenti.

### Modificare Hint di Riflessione

In `REFLECTION_HINTS_BY_CATEGORY`, personalizza per categoria:

```python
"omelia": [
    "Cosa mi dice questa parola?",
    "Come posso vivere questa esperienza?",
    "Quale conversione mi chiede?",
],
```

### Limitare il Range di Anni

Modifica all'inizio dello script:

```python
START_YEAR = 2020  # Ultimi 5 anni
END_YEAR = 2025
```

### Aumentare il Batch Size

```python
new_items = process_documents(urls_to_scrape, batch_size=1000)
```

---

## ⚠️ Rate Limiting e Cortesia

Lo script implementa:
- **Sleep di 0.1s** tra i documenti
- **Sleep di 0.2s** tra le categorie
- **Retry con backoff** (2, 4, 8 secondi)

**Non modificare questi valori al ribasso** per rispetto del server Vatican.

---

## 📈 Statistiche Attese

Con esecuzione completa da 2013-2025:

- **Angelus:** ~600 documenti/anno
- **Omelie:** ~150 documenti/anno
- **Discorsi:** ~200 documenti/anno
- **Messaggi:** ~100 documenti/anno
- **Altre categorie:** ~100-300 documenti totali

**Totale stimato:** 4,000-6,000 documenti

---

## 🐛 Troubleshooting

### "Failed after 3 retries"
Il server Vatican potrebbe essere temporaneamente down. Riprova dopo qualche minuto.

### Pochi documenti estratti
- Verifica la struttura URL del Vatican (potrebbe essere cambiata)
- Aumenta `max_chars` in `chunk_text()` per estrarre porzioni più grandi
- Riduci la soglia minima di `len(chunk) < 150`

### JSON corrupted o molto grande
Se il file diventa >500MB:
- Dividi per anno in file separati
- Usa database (SQLite, MongoDB) invece di JSON

### Script molto lento
Aumenta il `max_retries` timeout o riduci il rate limiting, ma **con cautela**.

---

## 🛠️ Manutenzione

### Aggiornamento Periodico
```bash
# Esegui mensile per catturare nuovi documenti
python vatican_scraper_advanced.py
```

Lo script deduplica automaticamente, quindi è sicuro rieseguire.

### Backup del JSON
```bash
cp public/assets/data/francesco.json public/assets/data/francesco.backup.json
```

---

## 📝 Note Importanti

1. **Deduplicazione:** Usa hash MD5 dei primi 100 caratteri per generare ID stabili
2. **Temi Multipli:** Ogni documento può avere 1-3 temi, non solo uno
3. **Hint Dinamici:** Gli hint si adattano sia alla categoria che al contenuto
4. **Source URL:** Ogni item conserva l'URL sorgente per verifiche future
5. **Timestamp:** Registra quando è stato estratto per tracciabilità

---

## 📚 Prossimi Step Suggeriti

1. **Frontend React:** Crea interfaccia per filtrare per categoria/tema
2. **Search Elasticsearch:** Indicizza il contenuto per ricerca full-text
3. **Daily Digest:** Cron job per inviare meditazione giornaliera
4. **Thematic Collections:** Raggruppa per tema anziché per categoria
5. **AI Summarization:** Usa Claude API per riassumere documenti lunghi

---

## ✅ Checklist Pre-Esecuzione

- [ ] Python 3.7+ installato
- [ ] `requests` e `beautifulsoup4` installati
- [ ] Directory `public/assets/data/` creata
- [ ] Connessione internet stabile
- [ ] 1-2 ore di tempo disponibile
- [ ] Backup di `francesco.json` (se esiste)

---

**Buon scraping! 🙏**
