# 🚀 Guida di Installazione e Setup

## 📦 Cosa Hai Ricevuto

```
vatican_scraper_advanced.py       ← Script principale
vatican_scraper_utils.py          ← Utilità di analisi
config_vatican_scraper.py         ← Configurazione
VATICAN_SCRAPER_DOCS.md           ← Documentazione completa
CHEAT_SHEET.md                    ← Comandi rapidi
README.md                         ← Overview
esempio_output_francesco.json     ← Esempio di output
SETUP.md                          ← Questo file
```

---

## 💾 Installation on Windows

### Step 1: Installa Python
1. Scarica Python 3.9+ da: https://www.python.org/downloads/
2. **IMPORTANTE:** Spunta "Add Python to PATH" durante l'installazione
3. Verifica l'installazione:
   ```bash
   python --version
   pip --version
   ```

### Step 2: Crea una cartella per il progetto
```bash
mkdir vatican_scraper
cd vatican_scraper
```

### Step 3: Copia i file
Copia tutti i file Python (.py) nella cartella `vatican_scraper`

### Step 4: Installa le dipendenze
```bash
pip install requests beautifulsoup4
```

### Step 5: Crea la directory di output
```bash
mkdir -p public\assets\data
```

### Step 6: Esegui lo scraper
```bash
python vatican_scraper_advanced.py
```

**Tempo:** 45-90 minuti

---

## 🍎 Installation on macOS

### Step 1: Verifica Python
```bash
python3 --version  # Dovrebbe essere 3.9+
```

Se non hai Python:
```bash
# Con Homebrew
brew install python3

# Oppure scarica da https://www.python.org/downloads/
```

### Step 2: Setup Progetto
```bash
mkdir vatican_scraper
cd vatican_scraper

# Copia i file .py qui
```

### Step 3: Installa dipendenze
```bash
pip3 install requests beautifulsoup4
```

### Step 4: Crea output directory
```bash
mkdir -p public/assets/data
```

### Step 5: Esegui
```bash
python3 vatican_scraper_advanced.py
```

---

## 🐧 Installation on Linux (Ubuntu/Debian)

### Step 1: Installa Python e pip
```bash
sudo apt update
sudo apt install python3 python3-pip

python3 --version  # Verifica
```

### Step 2: Setup Progetto
```bash
mkdir vatican_scraper
cd vatican_scraper

# Copia i file .py qui
```

### Step 3: Installa dipendenze
```bash
pip3 install requests beautifulsoup4
```

### Step 4: Crea output directory
```bash
mkdir -p public/assets/data
```

### Step 5: Esegui
```bash
python3 vatican_scraper_advanced.py
```

---

## 🆘 Troubleshooting Installazione

### "Python is not recognized"
**Windows:** 
- Reinstalla Python e **SPUNTA** "Add Python to PATH"
- Riavvia il PC
- Apri PowerShell nuovo
- Riprova

**macOS/Linux:**
```bash
which python3  # Dovrebbe mostrare un path
```

### "pip not found"
```bash
python3 -m pip install requests beautifulsoup4
```

### "Permission denied"
**Linux/macOS:**
```bash
pip3 install --user requests beautifulsoup4
```

### "Cannot open file 'vatican_scraper_advanced.py'"
```bash
# Assicurati di essere nella directory corretta
pwd  # macOS/Linux
cd   # Windows PowerShell

# Poi:
python3 vatican_scraper_advanced.py
```

### Connection errors
- Verifica la connessione internet
- Controlla firewall/VPN
- Riprova dopo 5 minuti

---

## ✅ Verifica Installazione

### Controlla dipendenze
```bash
python3 -c "import requests; print('✓ requests')"
python3 -c "import bs4; print('✓ beautifulsoup4')"
```

### Verifica file
```bash
# Windows PowerShell
dir *.py

# macOS/Linux
ls -la *.py
```

Output atteso:
```
vatican_scraper_advanced.py
vatican_scraper_utils.py
config_vatican_scraper.py
```

### Verifica directory
```bash
# Windows
mkdir public\assets\data

# macOS/Linux
mkdir -p public/assets/data
```

---

## 🚀 First Run - Test Rapido

### Opzione 1: Test veloce (10 minuti)
```bash
# Modifica vatican_scraper_advanced.py
# Cambia: START_YEAR = 2024 (invece di 2013)
# Esegui:
python3 vatican_scraper_advanced.py
```

### Opzione 2: Test completo (45-90 minuti)
```bash
python3 vatican_scraper_advanced.py
```

### Verifica Risultati
```bash
# Vedere i file creati
# Windows: dir public\assets\data
# macOS/Linux: ls -la public/assets/data

# Vedere statistiche
python3 vatican_scraper_utils.py stats
```

---

## 📊 Se tutto funziona

Dovresti vedere:

1. **Console output:**
   ```
   ============================================================
   🙏 VATICAN.VA ADVANCED SCRAPER - Papa Francesco 2013-2025
   ============================================================
   
   🔗 STEP 1: Building URL list...
   📋 Costruendo URL per: Angelus - Regina Cæli
   ✓ 2024: 25 link trovati
   ...
   ```

2. **File creato:**
   - Windows: `public\assets\data\francesco.json`
   - macOS/Linux: `public/assets/data/francesco.json`

3. **File size:** 50-100 MB (normale)

---

## 🔧 Configurazione Personalizzata

### Limitate gli anni (per test)
Modifica `vatican_scraper_advanced.py`:
```python
START_YEAR = 2023  # Ultimi 2 anni
END_YEAR = 2025
```

### Solo alcune categorie
Commenta in `CATEGORIES_MAP`:
```python
# Commenta le categorie che non vuoi
CATEGORIES_MAP = {
    # "angelus": { ... },  # ← Commentato, saltato
    "homilies": { ... },   # ← Eseguito
    # "prayers": { ... },
    ...
}
```

### Aumentare dimensione chunk
```python
# Circa riga 400
max_chars=3000  # Era 2000
```

---

## 🌐 Connessione Internet

### Se sei dietro a VPN/Proxy
Modifica `vatican_scraper_advanced.py`:
```python
# Aggiungi dopo gli import
import os

os.environ['HTTP_PROXY'] = 'http://proxy.url:8080'
os.environ['HTTPS_PROXY'] = 'https://proxy.url:8080'
```

### Se Vatican.va è lento
Aumenta i delay:
```python
time.sleep(0.5)  # Era 0.1
```

---

## 💾 Backup e Gestione File

### Fare backup
```bash
# Windows
copy public\assets\data\francesco.json public\assets\data\francesco.backup.json

# macOS/Linux
cp public/assets/data/francesco.json public/assets/data/francesco.backup.json
```

### Comprimere il file (se troppo grande)
```bash
# Windows - Installa 7-Zip o usa PowerShell
Compress-Archive -Path public\assets\data\francesco.json

# macOS/Linux
gzip public/assets/data/francesco.json
```

### Spostare il file
```bash
# Copia su server web (es. Apache)
# Windows
copy public\assets\data\francesco.json C:\xampp\htdocs\

# Linux
cp public/assets/data/francesco.json /var/www/html/
```

---

## 📱 Usa i Dati su un'App

### React.js
```javascript
import { useEffect, useState } from 'react';

function App() {
  const [docs, setDocs] = useState([]);
  
  useEffect(() => {
    fetch('public/assets/data/francesco.json')
      .then(r => r.json())
      .then(data => setDocs(data.items));
  }, []);
  
  return <div>{docs.length} documenti caricati</div>;
}
```

### Node.js Backend
```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/assets/data/francesco.json', 'utf-8'));
console.log(data.items.length);
```

### Python Flask
```python
import json

with open('public/assets/data/francesco.json') as f:
    documents = json.load(f)['items']

@app.route('/api/documents')
def get_docs():
    return jsonify(documents)
```

---

## 🎯 Prossimi Step

1. ✅ Installa Python e dipendenze
2. ✅ Esegui test rapido (START_YEAR = 2024)
3. ✅ Verifica i risultati con `stats`
4. ✅ Esegui completo (START_YEAR = 2013)
5. ✅ Integra in tua app

---

## 📞 Support

Se hai problemi:

1. **Leggi README.md** - Overview completo
2. **Leggi VATICAN_SCRAPER_DOCS.md** - Documentazione dettagliata
3. **Leggi CHEAT_SHEET.md** - Comandi rapidi
4. **Vedi TROUBLESHOOTING** nel README

---

## ✨ Tips & Tricks

### Esecuzione in background (Linux/macOS)
```bash
nohup python3 vatican_scraper_advanced.py > output.log &
```

### Monitorare lo scraper
```bash
tail -f output.log  # Vedi in tempo reale
```

### Schedulare aggiornamenti (Linux cron)
```bash
# Apri crontab
crontab -e

# Aggiungi (aggiorna ogni domenica alle 3 AM)
0 3 * * 0 cd /home/user/vatican_scraper && python3 vatican_scraper_advanced.py
```

### Testare un singolo URL
```python
from vatican_scraper_advanced import scrape_doc
text = scrape_doc('https://www.vatican.va/...')
print(text[:500])
```

---

## 🎓 Imparare Dai Dati

### Analizzare i temi estratti
```bash
python3 vatican_scraper_utils.py analyze
```

### Trovare documenti su tema specifico
```bash
python3 vatican_scraper_utils.py filter --theme Misericordia --output misericordia.json
```

### Cercare una keyword
```bash
python3 vatican_scraper_utils.py filter --keyword "amore" --output amore.json
```

---

**Buon lavoro! 🙏**

Versione: 1.0  
Data: 2025-04-13
