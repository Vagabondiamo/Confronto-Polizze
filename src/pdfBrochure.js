import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// STRINGA BASE64 DEL TUO LOGO
// ---------------------------------------------------------------------------
const LOGO_FUTURIA_BASE64 = "data:image/png;base64,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";
// ---------------------------------------------------------------------------
// CONFIGURAZIONE TEMI PDF
// ---------------------------------------------------------------------------
const THEMES = {
  classic: {
    navy:    [11,  37,  69],   // #0B2545
    mid:     [26,  58,  92],   // #1A3A5C
    gold:    [200, 151,  58],  // #C8973A
    lightBg: [244, 246, 249],
  },
  modern: {
    navy:    [15,  76,  92],   // Teal / Blu petrolio scuro
    mid:     [34,  112, 122],  // Petrolio medio
    gold:    [224, 159,  62],  // Oro ocra acceso
    lightBg: [240, 245, 245],
  },
  elegant: {
    navy:    [44,  53,  57],   // Grigio antracite
    mid:     [74,  85,  92],   // Lavagna medio
    gold:    [186, 142,  74],  // Oro brunito
    lightBg: [248, 247, 244],
  }
};

const sf = (doc, rgb) => doc.setFillColor(...rgb);
const sd = (doc, rgb) => doc.setDrawColor(...rgb);
const st = (doc, rgb) => doc.setTextColor(...rgb);

// ---------------------------------------------------------------------------
// MAIN — Brochure pieghevole, singola pagina orizzontale A4
// ---------------------------------------------------------------------------
export function generateBrochurePDF({ prodottoA, prodottoB, theme = "classic", tipoPolizza }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW = 297;
  const PH = 210;
  const tipoLabel = tipoPolizza?.sigla === "Altro"
    ? (tipoPolizza?.nomeLibero || "Polizza")
    : (tipoPolizza?.sigla || "Polizza");
  const tipoSpiegazione = tipoPolizza?.spiegazione?.trim() ||
    "Questo documento confronta due prodotti assicurativi voce per voce per supportare la scelta più adatta al profilo del cliente.";

  const PANELS = 3;
  const PNW = PW / PANELS;       // 99mm per pannello
  const PAD = 6;                  // Padding interno pannello
  const IW  = PNW - PAD * 2;     // Larghezza contenuto

  const xA = 0;                  // Pannello A (Sinistra)
  const xC = PNW;                // Pannello Centro
  const xB = PNW * 2;            // Pannello B (Destra)

  const C_theme = THEMES[theme] || THEMES.classic;

  const C = {
    navy:    C_theme.navy,
    mid:     C_theme.mid,
    gold:    C_theme.gold,
    white:   [255, 255, 255],
    dark:    [28,  38,  50],   // Quasi-nero per testo body
    muted:   [110, 122, 138],  // Grigio medio per testi secondari
    lightBg: C_theme.lightBg,
    warn:    [170,  55,  25],   // Rosso esclusioni
    ok:      [28,  105,  65],   // Verde coperture
  };

  // Linee di piega (tratteggiate)
  sd(doc, [180, 195, 215]);
  doc.setLineWidth(0.3);
  doc.setLineDash([2, 2]);
  doc.line(PNW,     0, PNW,     PH);
  doc.line(PNW * 2, 0, PNW * 2, PH);
  doc.setLineDash([]);

  // =========================================================================
  // PANNELLO CENTRO — Sfondo Navy, Payoff e Accenti Gold
  // =========================================================================
  drawPanelBg(doc, xC, PNW, PH, C.navy);

  const logoW = 35; 
  const logoH = 16.5; 
  const logoX = xC + (PNW - logoW) / 2;

  try {
    doc.addImage(LOGO_FUTURIA_BASE64, "PNG", logoX, 10, logoW, logoH, undefined, "FAST");
  } catch (e) {
    console.error("Errore nel caricamento del logo Base64.", e);
    st(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FUTURIA", xC + PAD, 18);
  }

  st(doc, C.gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("PROTEGGERE | CRESCERE | INVESTIRE", xC + (PNW - doc.getTextWidth("PROTEGGERE | CRESCERE | INVESTIRE")) / 2, 32);

  sf(doc, C.gold);
  doc.rect(xC + PAD, 36, IW, 0.8, "F");

  st(doc, C.white);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Confronto Polizze", xC + PAD, 46);

  st(doc, [180, 205, 230]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const sub = `${prodottoA.nome} — ${prodottoA.compagnia}\nvs\n${prodottoB.nome} — ${prodottoB.compagnia}`;
  doc.text(sub, xC + PAD, 64, { lineHeightFactor: 1.6 });

  sf(doc, C.gold);
  doc.rect(xC + PAD, 84, IW, 0.5, "F");

  st(doc, C.gold);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("COS'È UNA POLIZZA " + tipoLabel.toUpperCase() + "?", xC + PAD, 92);
  st(doc, [200, 218, 240]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const tcmText = tipoSpiegazione;
  const tcmLines = doc.splitTextToSize(tcmText, IW);
  doc.text(tcmLines, xC + PAD, 98);

  const afterTcm = 98 + tcmLines.length * 3.8 + 6;
  st(doc, C.gold);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("PERCHÉ CONFRONTARE?", xC + PAD, afterTcm);
  st(doc, [200, 218, 240]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const whyLines = doc.splitTextToSize("Ogni compagnia offre coperture complementari, massimali e condizioni diverse. Confrontare permette di scegliere il prodotto più adatto al profilo del cliente, avoiding sorprese in fase di sinistro.", IW);
  doc.text(whyLines, xC + PAD, afterTcm + 6);

  st(doc, [140, 165, 195]);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Via Pier Carlo Cadoppi 4 · 42124 Reggio Emilia", xC + PAD, PH - 14);
  doc.text("Tel. 0522 922651 · info@futuria.it", xC + PAD, PH - 10);
  doc.text("www.futuria.it", xC + PAD, PH - 6);

  // =========================================================================
  // PANNELLO A e B — Rendering Prodotti con correzione contrasti
  // =========================================================================
  drawPanelBg(doc, xA, PNW, PH, C.white);
  drawProductPanel(doc, prodottoA, xA, PAD, IW, PH, C, "A");

  drawPanelBg(doc, xB, PNW, PH, C.lightBg);
  drawProductPanel(doc, prodottoB, xB, PAD, IW, PH, C, "B");

  const fname = `Futuria_Brochure_${prodottoA.nome}_vs_${prodottoB.nome}_${new Date().toISOString().slice(0,10)}.pdf`.replace(/\s+/g, "_");
  doc.save(fname);
}

function drawProductPanel(doc, product, xStart, PAD, IW, PH, C, side) {
  const x = xStart + PAD;
  let y = 10;

  if (side === "A") {
    sf(doc, C.navy);
    doc.rect(xStart, 0, IW + PAD * 2, 22, "F");
  } else {
    sf(doc, C.mid);
    doc.rect(xStart, 0, IW + PAD * 2, 22, "F");
  }

  st(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(product.nome, x, 11);
  
  st(doc, C.gold);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(product.compagnia, x, 17);

  sf(doc, C.gold);
  doc.rect(xStart, 22, IW + PAD * 2, 0.8, "F");

  y = 33;

  const sections = [
    { title: "CAPITALE", value: product.capitaleNote },
    { title: "DURATA", value: product.durataNote },
  ];

  for (const s of sections) {
    st(doc, side === "A" ? C.navy : C.mid);
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

  y = drawSection(doc, "COPERTURE", product.coperture, x, y, IW, C, side, true);

  const excl = product.esclusioni?.slice(0, 5) || null;
  const exclFull = product.esclusioni?.length > 5
    ? [...excl, `... e altre ${product.esclusioni.length - 5} (vedi Set Informativo)`]
    : excl;
  y = drawSection(doc, "ESCLUSIONI", exclFull, x, y, IW, C, side, false);

  if (product.fiscalita && y < PH - 40) {
    st(doc, side === "A" ? C.navy : C.mid);
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

  if (product.recesso && y < PH - 30) {
    st(doc, side === "A" ? C.navy : C.mid);
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
  
  st(doc, side === "A" ? C.navy : C.mid);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(title, x, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  for (const item of items) {
    if (y > 185) break;
    const prefix = isCheck ? "✓ " : "· ";
    st(doc, isCheck ? C.ok : C.warn);
    doc.text(prefix, x, y);
    st(doc, C.dark);
    doc.text(doc.splitTextToSize(item, IW - 5), x + 5, y);
    const lh = doc.splitTextToSize(item, IW - 5).length;
    y += lh * 3.8 + 1;
  }
  return y + 4;
}

function drawPanelBg(doc, x, w, h, color) {
  sf(doc, color);
  doc.rect(x, 0, w, h, "F");
}