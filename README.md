# Confronto Polizze — Futuria Assicurazioni

Strumento interno per confrontare due prodotti assicurativi voce per voce.
Disponibile online su [confronto-polizze.vercel.app](https://confronto-polizze.vercel.app).

---

## Requisiti

- Node.js 18 o superiore (`node -v` per verificare)
- npm (incluso con Node.js)

---

## Avvio in locale

```bash
cd confronto-polizze
npm install       # solo la prima volta
npm run dev
```

Apri il browser su `http://localhost:5173`.

---

## Funzionalità

**Gestione prodotti**
I prodotti assicurativi si aggiungono tramite il form nel sito. Per ogni prodotto si possono specificare: nome, compagnia, tipo documento, capitale, durata, coperture, esclusioni, fiscalità, recesso, riscatto e dati mancanti da verificare. I prodotti salvati si possono modificare o eliminare in qualsiasi momento.

**Tipo di prodotto**
Prima di avviare il confronto si seleziona il tipo di polizza (TCM, Unit Linked, Vita Intera, LTC, Malattia Grave o personalizzato) e si inserisce una spiegazione destinata al cliente. Questi dati vengono riportati nella brochure PDF.

**Tabella comparativa**
Con due prodotti selezionati il sito genera automaticamente una tabella voce per voce. Se il profilo cliente è compilato (età, capitale, durata, fumatore), la tabella segnala eventuali incompatibilità — ad esempio un capitale richiesto inferiore al minimo di un prodotto.

**Brochure PDF**
Il pulsante "Esporta Brochure PDF" genera una singola pagina A4 orizzontale in formato trifold, pronta da stampare e consegnare al cliente. Il PDF include il logo Futuria, i dati dei due prodotti a confronto, la spiegazione del tipo di polizza e i dati eventualmente mancanti da verificare.

---

## Database

I dati vengono salvati nel `localStorage` del browser — ogni utente ha il proprio archivio locale, indipendente dagli altri. I dati persistono finché non si pulisce la cache del browser.

Chiavi utilizzate:
- `confronto_polizze_products` — elenco prodotti
- `confronto_polizze_tipo` — tipo polizza e spiegazione

**Azzerare il database (dalla console del browser, F12):**
```js
localStorage.removeItem('confronto_polizze_products')
localStorage.removeItem('confronto_polizze_tipo')
```

**Esportare i prodotti salvati:**
```js
copy(localStorage.getItem('confronto_polizze_products'))
```

**Importare prodotti (incolla il JSON tra le virgolette):**
```js
localStorage.setItem('confronto_polizze_products', '...')
```

---

## Build per produzione

```bash
npm run build
```

I file statici vengono generati nella cartella `dist/` e possono essere deployati su qualsiasi hosting statico. Il progetto è già configurato per Vercel — ogni push su `main` aggiorna automaticamente il sito se il repository è collegato.

---

## Struttura del progetto

```
src/
  App.jsx          — interfaccia principale, logica di stato, localStorage
  pdfBrochure.js   — generazione brochure PDF con jsPDF
  index.css        — Tailwind base
  main.jsx         — entry point React
```

[Account Telegram](https://t.me/vagabodiamo)