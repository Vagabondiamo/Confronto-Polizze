# Confronto Polizze TCM · Futuria Assicurazioni

Strumento interno per il confronto comparativo tra prodotti assicurativi TCM.

## Requisiti

- Node.js 18 o superiore (verifica con `node -v`)
- npm (incluso con Node.js)

## Installazione e avvio

```bash
# 1. Entra nella cartella del progetto
cd confronto-polizze

# 2. Installa le dipendenze (solo la prima volta)
npm install

# 3. Avvia in locale
npm run dev
```

Poi apri il browser su: **http://localhost:5173**

## Database

I dati delle polizze vengono salvati nel **localStorage** del browser.
Rimangono disponibili finché non si cancella la cache del browser.

La chiave localStorage usata è: `confronto_polizze_products`

Per esportare/importare i dati manualmente, dalla console del browser:
```js
// Esporta
copy(localStorage.getItem('confronto_polizze_products'))

// Importa (incolla il JSON tra le virgolette)
localStorage.setItem('confronto_polizze_products', '...')
```

## Build per produzione

```bash
npm run build
```

I file statici finali vengono generati nella cartella `dist/`.

## Esportazione PDF

Dopo aver selezionato due prodotti clicca **Esporta Brochure PDF** (in basso a destra della tabella).

Il PDF generato include:
- Copertina con header Futuria (colori navy/oro del brand)
- Profilo cliente se compilato
- Tabella comparativa completa voce per voce
- Box dati mancanti / da verificare
- Footer con contatti Futuria su ogni pagina

Il file viene scaricato automaticamente con nome:
`Futuria_Confronto_ProdottoA_vs_ProdottoB_YYYY-MM-DD.pdf`

La libreria usata è **jsPDF** (già inclusa in `package.json`).
