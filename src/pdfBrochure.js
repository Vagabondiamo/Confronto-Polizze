import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// FUTURIA BRAND
// ---------------------------------------------------------------------------
const C = {
  navy:    [14,  45,  80],
  teal:    [0,   110, 130],
  gold:    [194, 148,  46],
  white:   [255, 255, 255],
  dark:    [22,  32,  45],
  muted:   [100, 115, 130],
  lightBg: [240, 245, 252],
  rowAlt:  [232, 240, 252],
  warn:    [180,  60,  30],
  ok:      [30,  110,  70],
  divider: [200, 212, 228],
};

const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

// ---------------------------------------------------------------------------
// MAIN — brochure pieghevole, singola pagina orizzontale A4
// Layout: [Pannello A | Pannello CENTRO | Pannello B]
// ---------------------------------------------------------------------------
export function generateBrochurePDF({ prodottoA, prodottoB }) {
  // A4 landscape
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW = 297;
  const PH = 210;

  // 3 pannelli uguali con margini interni
  const PANELS = 3;
  const PNW = PW / PANELS;       // 99mm per pannello
  const PAD = 6;                  // padding interno pannello
  const IW  = PNW - PAD * 2;     // larghezza contenuto

  const xA = 0;                  // inizio pannello A (sinistra)
  const xC = PNW;                // inizio pannello Centro
  const xB = PNW * 2;            // inizio pannello B (destra)

  // linee di piega (tratteggiate)
  sd(doc, [180, 195, 215]);
  doc.setLineWidth(0.3);
  doc.setLineDash([2, 2]);
  doc.line(PNW,     0, PNW,     PH);
  doc.line(PNW * 2, 0, PNW * 2, PH);
  doc.setLineDash([]);

  // =========================================================================
  // PANNELLO CENTRO — intestazione Futuria + intro confronto
  // =========================================================================
  drawPanelBg(doc, xC, PNW, PH, C.navy);

  // Logo / nome brand
  st(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FUTURIA", xC + PAD, 22);

  st(doc, C.gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("PROTEGGERE | CRESCERE | INVESTIRE", xC + PAD, 29);

  // Linea oro
  sf(doc, C.gold);
  doc.rect(xC + PAD, 32, IW, 0.8, "F");

  // Titolo brochure
  st(doc, C.white);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Confronto", xC + PAD, 42);
  doc.text("Polizze TCM", xC + PAD, 50);

  // Sottotitolo
  st(doc, [180, 205, 230]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const sub = `${prodottoA.nome} — ${prodottoA.compagnia}\nvs\n${prodottoB.nome} — ${prodottoB.compagnia}`;
  doc.text(sub, xC + PAD, 62, { lineHeightFactor: 1.6 });

  // Linea divisore
  sf(doc, C.gold);
  doc.rect(xC + PAD, 80, IW, 0.5, "F");

  // Cos'è una TCM
  st(doc, C.gold);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("COS'È UNA POLIZZA TCM?", xC + PAD, 88);
  st(doc, [200, 218, 240]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const tcmText = "La Temporanea Caso Morte (TCM) è una polizza vita che garantisce ai beneficiari " +
    "il pagamento di un capitale in caso di decesso dell'assicurato durante il periodo di copertura. " +
    "È lo strumento più diretto per proteggere economicamente le persone care.";
  const tcmLines = doc.splitTextToSize(tcmText, IW);
  doc.text(tcmLines, xC + PAD, 94);

  // Perché confrontare
  const afterTcm = 94 + tcmLines.length * 3.8 + 6;
  st(doc, C.gold);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("PERCHÉ CONFRONTARE?", xC + PAD, afterTcm);
  st(doc, [200, 218, 240]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const whyLines = doc.splitTextToSize(
    "Ogni compagnia offre coperture complementari, massimali e condizioni diverse. " +
    "Confrontare permette di scegliere il prodotto più adatto al profilo del cliente, " +
    "evitando sorprese in fase di sinistro.", IW);
  doc.text(whyLines, xC + PAD, afterTcm + 6);

  // Footer pannello centro
  st(doc, [140, 165, 195]);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Via Pier Carlo Cadoppi 4 · 42124 Reggio Emilia", xC + PAD, PH - 14);
  doc.text("Tel. 0522 922651 · info@futuria.it", xC + PAD, PH - 10);
  doc.text("www.futuria.it", xC + PAD, PH - 6);

  // =========================================================================
  // PANNELLO A — prodotto A (sfondo bianco)
  // =========================================================================
  drawPanelBg(doc, xA, PNW, PH, C.white);
  drawProductPanel(doc, prodottoA, xA, PAD, IW, PH, C, "A");

  // =========================================================================
  // PANNELLO B — prodotto B (sfondo chiarissimo)
  // =========================================================================
  drawPanelBg(doc, xB, PNW, PH, C.lightBg);
  drawProductPanel(doc, prodottoB, xB, PAD, IW, PH, C, "B");

  // =========================================================================
  // SALVA
  // =========================================================================
  const fname = `Futuria_Brochure_${prodottoA.nome}_vs_${prodottoB.nome}_${new Date().toISOString().slice(0,10)}.pdf`
    .replace(/\s+/g, "_");
  doc.save(fname);
}

// ---------------------------------------------------------------------------
// Disegna un pannello prodotto
// ---------------------------------------------------------------------------
function drawProductPanel(doc, product, xStart, PAD, IW, PH, C, side) {
  const x = xStart + PAD;
  let y = 10;

  // Header colorato
  sf(doc, side === "A" ? C.teal : C.navy);
  doc.rect(xStart, 0, IW + PAD * 2, 22, "F");

  st(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(product.nome, x, 10);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  st(doc, side === "A" ? [200, 235, 240] : [180, 205, 230]);
  doc.text(product.compagnia, x, 16);

  sf(doc, C.gold);
  doc.rect(xStart, 22, IW + PAD * 2, 0.8, "F");

  y = 30;

  // Sezioni
  const sections = [
    { title: "CAPITALE", value: product.capitaleNote },
    { title: "DURATA", value: product.durataNote },
  ];

  for (const s of sections) {
    st(doc, side === "A" ? C.teal : C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(s.title, x, y);
    y += 4;
    st(doc, s.value ? C.dark : C.muted);
    doc.setFont("helvetica", s.value ? "normal" : "italic");
    doc.setFontSize(7.5);
    const lines = doc.splitTextToSize(s.value || "Non disponibile", IW);
    doc.text(lines, x, y);
    y += lines.length * 3.8 + 5;
  }

  // Coperture
  y = drawSection(doc, "COPERTURE", product.coperture, x, y, IW, C, side, true);

  // Esclusioni principali (max 5)
  const excl = product.esclusioni?.slice(0, 5) || null;
  const exclFull = product.esclusioni?.length > 5
    ? [...excl, `... e altre ${product.esclusioni.length - 5} (vedi Set Informativo)`]
    : excl;
  y = drawSection(doc, "ESCLUSIONI", exclFull, x, y, IW, C, side, false);

  // Fiscalità
  if (product.fiscalita && y < PH - 40) {
    st(doc, side === "A" ? C.teal : C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("FISCALITÀ", x, y);
    y += 4;
    st(doc, C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const lines = doc.splitTextToSize(product.fiscalita, IW);
    doc.text(lines, x, y);
    y += lines.length * 3.5 + 5;
  }

  // Recesso
  if (product.recesso && y < PH - 30) {
    st(doc, side === "A" ? C.teal : C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("RECESSO", x, y);
    y += 4;
    st(doc, C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const lines = doc.splitTextToSize(product.recesso, IW);
    doc.text(lines, x, y);
    y += lines.length * 3.5 + 5;
  }

  // Dati mancanti in fondo
  if (product.mancanti?.length && y < PH - 20) {
    sf(doc, [255, 248, 225]);
    sd(doc, C.gold);
    doc.setLineWidth(0.3);
    const boxH = Math.min(product.mancanti.length * 4 + 10, PH - y - 10);
    doc.roundedRect(xStart + 3, y, IW + PAD * 2 - 6, boxH, 2, 2, "FD");
    st(doc, C.gold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("DA VERIFICARE", x, y + 6);
    st(doc, [140, 100, 20]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    product.mancanti.slice(0, Math.floor((boxH - 12) / 4)).forEach((m, i) => {
      doc.text(`· ${m}`, x, y + 12 + i * 4);
    });
  }
}

function drawSection(doc, title, items, x, y, IW, C, side, isCheck) {
  if (!items || items.length === 0) return y;
  const color = side === "A" ? C.teal : C.navy;
  st(doc, color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(title, x, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  for (const item of items) {
    if (y > 185) break;
    const prefix = isCheck ? "✓ " : "· ";
    st(doc, isCheck ? [30, 110, 70] : [130, 60, 30]);
    const lines = doc.splitTextToSize(prefix + item, IW);
    st(doc, C.dark);
    doc.text(doc.splitTextToSize(item, IW - 5), x + 5, y);
    st(doc, isCheck ? [30, 110, 70] : [130, 60, 30]);
    doc.text(prefix, x, y);
    const lh = doc.splitTextToSize(item, IW - 5).length;
    y += lh * 3.8 + 1;
  }
  return y + 4;
}

function drawPanelBg(doc, x, w, h, color) {
  sf(doc, color);
  doc.rect(x, 0, w, h, "F");
}
