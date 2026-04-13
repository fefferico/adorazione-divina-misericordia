# ⚡ QUICK FIX - Soluzione Immediata

## Il Problema Che Hai Visto

```
⚠️  Tentativo 1 fallito, riprovo tra 1s... (404 Client Error: Not Found for url: https://www.v)
❌ Fallito dopo 3 tentativi: https://www.vatican.va/content/francesco/it/angelus/2026.index.html
```

## ✅ La Soluzione (Scegli Una)

### **OPZIONE 1: Versione Semplificata (CONSIGLIATO)**

```bash
python vatican_scraper_simple.py
```

**Vantaggi:**
- ✅ Salta automaticamente URL malformati
- ✅ Non cerca anno 2026 (non esiste)
- ✅ Più veloce (30-60 minuti)
- ✅ Meno errori di parsing

**Tempo:** 30-60 minuti

---

### **OPZIONE 2: Versione Avanzata (Aggiornata)**

```bash
python vatican_scraper_advanced.py
```

**È stata aggiornata con:**
- ✅ Validazione URL (scarta `https://www.v`)
- ✅ Limite a anno 2025 (non 2026)
- ✅ Check rapido degli anni disponibili
- ✅ Gestione migliore degli errori

**Tempo:** 45-90 minuti

---

## 🎯 Quale Usare?

```
┌─────────────────────────────────────────┐
│ Primo tentativo?                        │
│ → Usa vatican_scraper_simple.py          │
│                                         │
│ Vuoi temi/hint completi?                │
│ → Usa vatican_scraper_advanced.py        │
└─────────────────────────────────────────┘
```

---

## 🚀 Comandi Pronti All'Uso

### Test Rapido (10 minuti)
```bash
# Modifica nel file:
START_YEAR = 2024
END_YEAR = 2025

# Poi esegui
python vatican_scraper_simple.py
```

### Versione Completa (1-2 ore)
```bash
# Mantieni:
START_YEAR = 2013
END_YEAR = 2025

# Esegui
python vatican_scraper_advanced.py
```

---

## 📊 Verifica Risultati

```bash
# Dopo l'esecuzione, controlla:
python vatican_scraper_utils.py stats

# Dovresti vedere:
# 📈 Totale documenti: 2000+
# 📚 Documenti per Categoria: ...
# 🎯 Utilizzo dei Temi: ...
```

---

## 🔄 Se Vuoi Ricominciare

```bash
# Backup del vecchio file (opzionale)
mv public/assets/data/francesco.json public/assets/data/francesco.backup.json

# Ricomincia da zero
rm public/assets/data/francesco.json

# Esegui di nuovo
python vatican_scraper_simple.py
```

---

## ⚙️ Personalizzazioni Rapide

### Solo Ultimi 3 Anni
```python
# Nel file, cambia:
START_YEAR = 2022  # Era 2013
END_YEAR = 2025
```

### Solo Omelie e Angelus
```python
# Modifica CATEGORIES (versione simple):
CATEGORIES = [
    ("angelus", "Angelus", "angelus"),
    ("homilies", "Omelie", "omelia"),
    # Commenta le altre
]
```

### Chunk Size Minore
```python
# Nel file, cambia:
"content": text[:2000],  # Era 3000
```

---

## 💡 Consigli

1. **Connessione stabile:**
   - Non usare WiFi instabile
   - Spegni VPN se possibile
   - Chiudi download/stream

2. **Lascia libero il PC:**
   - Il processo impiega 30-90 minuti
   - Puoi usare il PC normalmente
   - Se lo chiudi, riavvia lo script

3. **Controlla progresso:**
   ```bash
   # In un'altra finestra/tab
   ls -lh public/assets/data/francesco.json
   ```

---

## 📞 Se Ancora Non Funziona

1. **Prova connessione:**
   ```bash
   curl https://www.vatican.va
   # Dovrebbe rispondere con HTML
   ```

2. **Verifica Python:**
   ```bash
   python --version
   pip list | grep requests
   ```

3. **Usa versione più semplice:**
   ```bash
   python vatican_scraper_simple.py
   ```

4. **Rileggi TROUBLESHOOTING.md**

---

## ✨ Fast Track

```bash
# Comando unico (quick start)
mkdir -p public/assets/data && \
pip install requests beautifulsoup4 && \
python vatican_scraper_simple.py
```

---

**Pronto? Esegui: `python vatican_scraper_simple.py` 🚀**

(Se non funziona, leggi TROUBLESHOOTING.md)

---

Aggiornamento: 2025-04-13
