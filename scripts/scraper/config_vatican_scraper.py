# Vatican Scraper - Configuration File
# Personalizza questi valori secondo le tue esigenze

# ============================================================
# ANNI E DATE
# ============================================================

# Anno di inizio scraping (inclusivo)
START_YEAR = 2013

# Anno di fine scraping (inclusivo)
# Usa: datetime.now().year per l'anno corrente
END_YEAR = 2025

# ============================================================
# PERCORSI E OUTPUT
# ============================================================

# Percorso dove salvare il JSON
LIBRARY_PATH = "public/assets/data/francesco.json"

# Crea la directory se non esiste
CREATE_DIRS = True

# Backup automatico del JSON precedente
AUTO_BACKUP = True
BACKUP_SUFFIX = ".backup"

# ============================================================
# DIMENSIONI E CHUNKING
# ============================================================

# Dimensione massima di ogni chunk (caratteri)
# Ridurrai per estratti più brevi, aumenta per contenuti più lunghi
MAX_CHUNK_SIZE = 2000

# Lunghezza minima di un chunk per essere incluso
MIN_CHUNK_LENGTH = 150

# Lunghezza minima di un documento completo per essere processato
MIN_DOC_LENGTH = 300

# ============================================================
# RATE LIMITING E RETRY
# ============================================================

# Delay tra le richieste (secondi)
DELAY_BETWEEN_REQUESTS = 0.1

# Delay tra le categorie (secondi)
DELAY_BETWEEN_CATEGORIES = 0.2

# Numero massimo di tentativi per richiesta
MAX_RETRIES = 3

# Timeout per ogni richiesta (secondi)
REQUEST_TIMEOUT = 10

# ============================================================
# LIMITI DI SCRAPING
# ============================================================

# Numero massimo di documenti da processare (0 = illimitato)
MAX_DOCUMENTS = 0

# Numero massimo di chunk da estrarre per documento
MAX_CHUNKS_PER_DOC = 10

# Abilita scraping solo di categorie specifiche (lista vuota = tutte)
# Esempio: ["angelus", "homilies", "prayers"]
ENABLED_CATEGORIES = []

# ============================================================
# ESTRAZIONE TEMI
# ============================================================

# Numero massimo di temi da estrarre per documento
MAX_THEMES = 3

# Occorrenze minime di una keyword per contare come tema
MIN_THEME_OCCURRENCES = 2

# Temi personalizzati - Aggiungi qui nuovi temi e keywords
CUSTOM_THEMES = {
    # Formato: "Nome Tema": ["keyword1", "keyword2", "keyword3", ...]
    # Le keywords sono cercate case-insensitive
    
    # Temi di default (da non modificare, sono nel codice principale)
    # "Misericordia": ["misericordia", "pietà", "compassione", "perdono"],
    # "Speranza": ["speranza", "fiducia", "futuro"],
    # ... etc
}

# ============================================================
# HINT DI RIFLESSIONE
# ============================================================

# Abilita generazione automatica di hint
GENERATE_HINTS = True

# Numero massimo di hint per documento
MAX_HINTS = 5

# Hint generici di fallback se nessuno specifico
FALLBACK_HINTS = [
    "Cosa mi dice questa parola?",
    "Come posso vivere questa esperienza?",
    "Quale conversione mi viene proposta?"
]

# ============================================================
# PULIZIA TESTO
# ============================================================

# Rimuovi URL dai testi estratti
REMOVE_URLS = True

# Rimuovi tag HTML rimasti
REMOVE_HTML = True

# Rimuovi copyright e crediti
REMOVE_COPYRIGHT = True

# ============================================================
# LOGGING E DEBUG
# ============================================================

# Livello di verbosità
# 0 = silenzioso
# 1 = normale (default)
# 2 = verbose
# 3 = debug
VERBOSITY = 1

# Salva log su file
SAVE_LOG = False
LOG_FILE = "vatican_scraper.log"

# Stampa statistiche dettagliate
PRINT_STATS = True

# ============================================================
# VALIDAZIONE
# ============================================================

# Verifica l'integrità del JSON dopo il salvataggio
VALIDATE_JSON = True

# Numero massimo di item per il salvataggio (0 = illimitato)
# Usa per limitare la dimensione file durante test
MAX_ITEMS = 0

# ============================================================
# PROXY E HEADERS
# ============================================================

# Usa proxy (lascia vuoto se non necessario)
PROXY_URL = ""

# User-Agent customizzato
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Headers customizzati
CUSTOM_HEADERS = {
    # "Authorization": "Bearer token",
    # "Referer": "https://www.vatican.va/",
}

# ============================================================
# DATABASE ALTERNATIVO (Futura Espansione)
# ============================================================

# Tipo di storage: "json" o "sqlite" o "mongodb"
STORAGE_TYPE = "json"

# Se STORAGE_TYPE = "sqlite"
SQLITE_DB = "vatican_documents.db"

# Se STORAGE_TYPE = "mongodb"
MONGODB_URI = "mongodb://localhost:27017/"
MONGODB_DB = "vatican"
MONGODB_COLLECTION = "documents"

# ============================================================
# ESECUZIONE PROGRAMMATA
# ============================================================

# Abilita scraping periodico (con APScheduler)
ENABLE_SCHEDULER = False

# Frequenza di aggiornamento: "daily", "weekly", "monthly"
SCHEDULE_FREQUENCY = "weekly"

# Ora del giorno per l'aggiornamento (formato 24h)
SCHEDULE_TIME = "03:00"  # 3:00 AM

# ============================================================
# NOTIFICHE
# ============================================================

# Invia email al completamento
SEND_EMAIL_ON_COMPLETE = False

# Email destinatario
EMAIL_TO = ""

# Email mittente
EMAIL_FROM = ""

# SMTP server
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_PASSWORD = ""

# ============================================================
# FILTRI AVANZATI
# ============================================================

# Includi solo documenti con questi temi
# Lascia vuoto per includerli tutti
REQUIRED_THEMES = []

# Escludi documenti che contengono queste parole
EXCLUDED_KEYWORDS = [
    # "placeholder", "da cancellare"
]

# ============================================================
# PERFORMANCE
# ============================================================

# Usa threading per richieste parallele (sperimentale)
USE_THREADING = False
NUM_THREADS = 4

# Memcache per deduplicazione
USE_CACHE = True
CACHE_SIZE = 10000

# ============================================================
# NOTE
# ============================================================

"""
ISTRUZIONI DI UTILIZZO:

1. Modifica i valori come desiderato
2. Salva il file come 'config.py'
3. Nel script principale, importa:
   
   from config import *
   
4. Usa le costanti ovunque nello script:
   
   for year in range(START_YEAR, END_YEAR + 1):
       ...

ESEMPIO DI PERSONALIZZAZIONE:

# Scrapa solo ultimi 3 anni
START_YEAR = 2023

# Con chunk più piccoli
MAX_CHUNK_SIZE = 1500

# Solo queste categorie
ENABLED_CATEGORIES = ["angelus", "homilies", "prayers"]

# Massimo 500 documenti per il testing
MAX_DOCUMENTS = 500

"""
