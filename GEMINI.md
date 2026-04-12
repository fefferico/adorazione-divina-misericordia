# 📖 Progetto: Adorazione Divina Misericordia

Benvenuto in **Adorazione Divina Misericordia**, un tool avanzato per la creazione e l'esportazione di schemi di preghiera per l'Adorazione Eucaristica, basato sui testi del Vaticano e sul Diario di Santa Faustina Kowalska.

---

## 🚀 Visione del Progetto
L'obiettivo è fornire uno strumento premium che permetta di:
1.  **Sfogliare contenuti sacri**: Testi categorizzati per tema (Misericordia, Amore, Conversione, etc.).
2.  **Costruire Adorazioni**: Un "builder" drag-and-drop per comporre una sequenza di letture, preghiere e momenti di silenzio.
3.  **Esportazione Professionale**: Generare PDF eleganti e pronti per la stampa (o visualizzazione digitale) usando `jspdf`.
4.  **Estetica Premium**: Design moderno con Angular 21, Tailwind 4 e supporto per Dark Mode dinamica.

---

## 🛠️ Tech Stack
| Tecnologia | Utilizzo |
| :--- | :--- |
| **Angular 21** | Framework Core (App Router, Signals, Standalone Components). |
| **Tailwind CSS 4** | Styling moderno e ultra-performante. |
| **Lucide Angular** | Iconografia pulita e consistente. |
| **jspdf / html2canvas** | Generazione ed esportazione di documenti PDF. |
| **Python 3** | Script di scraping (Vaticano) e pre-processing dei dati (Diario). |
| **Vitest** | Unit testing veloce e affidabile. |

---

## 📂 Struttura del Progetto
- `src/app/`
    - `components/`
        - `builder/`: Logica per la composizione della sessione di adorazione.
        - `dashboard/`: Punto d'ingresso principale e anteprima.
        - `content-picker/`: Selezione dei testi dalla libreria.
        - `navbar/`: Navigazione e toggle del tema.
    - `services/`
        - `adoration-store.ts`: Gestore dello stato della sessione (letture selezionate).
        - `content.ts`: Caricamento dei dati JSON (`library.json`, `francesco.json`).
        - `pdf-export.ts`: Motore di rendering PDF.
        - `theme.ts`: Gestione Light/Dark mode.
- `public/assets/data/`: Database statico contenente i testi (JSON).
- `scripts/`: Strumenti Python per l'aggiornamento dei contenuti.

---

## 📑 Fonti Dati
- **Vaticano**: Omeline e discorsi (estratti via `vatican_scraper_plus.py`).
- **Diario**: Estratti dal Diario di Santa Faustina Kowalska (elaborati via `process_diary.py`).
- **Papi**: Contenuti specifici (es. `francesco.json`).

---

## 🏃 Workflow di Sviluppo
- **Sviluppo Locale**: `npm start` (Angular CLI).
- **Test**: `npm test`.
- **Build**: `npm run build`.
- **Aggiornamento Dati**: Eseguire i relativi script nella cartella `scripts/` (richiedono Python 3).

---

## 📝 Note per l'Agente
- **Design Core**: Mantieni uno stile premium, ispirato alla liturgia ma con una UX moderna (glassmorphism, transizioni fluide).
- **Stato**: La sessione di adorazione corrente è salvata nello store (`adoration-store.ts`).
- **Export**: Quando modifichi il layout del modulo PDF, assicurati di testare la resa su diversi formati di visualizzazione.
- **Tailwind**: Utilizza esclusivamente Tailwind 4. Non usare `@apply` se non strettamente necessario; privilegia le utilità inline.

---

> [!TIP]
> Ogni volta che inizi un nuovo task, consulta `adoration-store.ts` per capire come vengono gestiti i dati della sessione attiva.
