import React, { useState, useEffect, useMemo } from "react";
import { Plus, AlertTriangle, X, Loader2, Trash2, FileDown } from "lucide-react";
import { generateBrochurePDF } from "./pdfBrochure";

// ---------------------------------------------------------------------------
// localStorage helpers (sostituisce window.storage di Claude)
// ---------------------------------------------------------------------------
const LS_KEY = "confronto_polizze_products";

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lsSave(products) {
  localStorage.setItem(LS_KEY, JSON.stringify(products));
}

// ---------------------------------------------------------------------------
// UTILITY
// ---------------------------------------------------------------------------
const fmtEUR = (n) =>
  n == null
    ? null
    : new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
      }).format(n);

function findPremio(product, profilo) {
  if (!product.premiExamples) return null;
  const { capitale, durata } = profilo;
  if (!capitale && !durata) return { rows: product.premiExamples };
  const exact = product.premiExamples.find(
    (e) =>
      (!capitale || e.capitale === Number(capitale)) &&
      (!durata || e.durata === Number(durata))
  );
  if (exact) return { rows: [exact] };
  return { rows: product.premiExamples };
}

function capitaleCompatibile(product, profilo) {
  if (!profilo.capitale || !product.capitaleMin) return null;
  return Number(profilo.capitale) >= product.capitaleMin;
}

function durataCompatibile(product, profilo) {
  if (!profilo.durata || !product.durataMax) return null;
  return Number(profilo.durata) <= product.durataMax;
}

// ---------------------------------------------------------------------------
// UI ATOMS
// ---------------------------------------------------------------------------
function Stamp({ label, tone = "pine" }) {
  const colors = { pine: "#2F5D4C", brass: "#A6792C", brick: "#8B3A2E" };
  const c = colors[tone] || colors.pine;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: 600,
        whiteSpace: "nowrap",
        border: `1.5px dashed ${c}`,
        color: c,
        fontFamily: "'IBM Plex Mono', monospace",
        background: "rgba(250,247,240,0.6)",
      }}
    >
      {label}
    </span>
  );
}

function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        fontWeight: 600,
        marginBottom: 4,
        color: "#A6792C",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
export default function ConfrontoPolizzeTool() {
  const [products, setProducts] = useState([]);
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");
  const [profilo, setProfilo] = useState({
    eta: "",
    capitale: "",
    durata: "",
    fumatore: "no",
  });
  const [consulente, setConsulente] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [newProduct, setNewProduct] = useState(emptyForm());

  function emptyForm() {
    return {
      nome: "",
      compagnia: "",
      tipoDocumento: "",
      capitaleNote: "",
      capitaleMin: "",
      durataNote: "",
      durataMax: "",
      coperture: "",
      esclusioni: "",
      fiscalita: "",
      recesso: "",
      riscatto: "",
      mancanti: "",
    };
  }

  // Carica da localStorage al mount
  useEffect(() => {
    const loaded = lsLoad();
    setProducts(loaded);
    if (loaded.length >= 1) setIdA(loaded[0].id);
    if (loaded.length >= 2) setIdB(loaded[1].id);
  }, []);

  const prodottoA = products.find((p) => p.id === idA);
  const prodottoB = products.find((p) => p.id === idB);

  function handleAddProduct(e) {
    e.preventDefault();
    setFormError("");
    if (!newProduct.nome.trim() || !newProduct.compagnia.trim()) {
      setFormError("Nome e compagnia sono obbligatori.");
      return;
    }
    setSaving(true);
    const id =
      "p-" +
      newProduct.nome.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now();
    const product = {
      id,
      nome: newProduct.nome.trim(),
      compagnia: newProduct.compagnia.trim(),
      tipoDocumento: newProduct.tipoDocumento.trim() || "Non specificato",
      capitaleMin: newProduct.capitaleMin ? Number(newProduct.capitaleMin) : null,
      capitaleNote: newProduct.capitaleNote.trim() || null,
      durataMax: newProduct.durataMax ? Number(newProduct.durataMax) : null,
      durataNote: newProduct.durataNote.trim() || null,
      premiExamples: null,
      premioProfiloRif: null,
      coperture: newProduct.coperture
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      esclusioni: newProduct.esclusioni
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      fiscalita: newProduct.fiscalita.trim() || null,
      recesso: newProduct.recesso.trim() || null,
      riscatto: newProduct.riscatto.trim() || null,
      mancanti: newProduct.mancanti
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const updated = [...products, product];
    lsSave(updated);
    setProducts(updated);
    if (!idA) setIdA(product.id);
    else if (!idB) setIdB(product.id);
    setNewProduct(emptyForm());
    setShowAddForm(false);
    setSaving(false);
  }

  function handleDelete(id) {
    if (!window.confirm("Eliminare questo prodotto dal database?")) return;
    const updated = products.filter((p) => p.id !== id);
    lsSave(updated);
    setProducts(updated);
    if (idA === id) setIdA(updated[0]?.id || "");
    if (idB === id) setIdB(updated[1]?.id || updated[0]?.id || "");
  }

  // -------------------------------------------------------------------------
  const s = styles;

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        select, input, textarea, button { font-family: 'Inter', sans-serif; }
        ul { margin: 0; padding-left: 16px; }
        li { margin-bottom: 2px; }
      `}</style>

      <div style={s.wrap}>
        {/* HEADER */}
        <div style={s.header}>
          <Eyebrow>Futuria Assicurazioni · Strumento interno</Eyebrow>
          <h1 style={s.title}>Confronto Polizze</h1>
          <p style={s.subtitle}>
            Confronta due prodotti voce per voce. I dati mancanti sono segnalati
            — vanno verificati prima di presentarli al cliente.
          </p>
        </div>

        {/* SELEZIONE */}
        {products.length >= 2 ? (
          <div style={s.grid2}>
            <ProductSelector
              label="Prodotto A"
              value={idA}
              onChange={setIdA}
              products={products}
              onDelete={handleDelete}
            />
            <ProductSelector
              label="Prodotto B"
              value={idB}
              onChange={setIdB}
              products={products}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div style={s.emptyHint}>
            Aggiungi almeno due prodotti per avviare il confronto.
          </div>
        )}

        {/* PROFILO CLIENTE */}
        <div style={s.card}>
          <Eyebrow>Profilo cliente (opzionale)</Eyebrow>
          <div style={s.grid4}>
            <LabelInput
              label="Età"
              type="number"
              value={profilo.eta}
              placeholder="35"
              onChange={(v) => setProfilo({ ...profilo, eta: v })}
            />
            <LabelInput
              label="Capitale (€)"
              type="number"
              value={profilo.capitale}
              placeholder="150000"
              onChange={(v) => setProfilo({ ...profilo, capitale: v })}
            />
            <LabelInput
              label="Durata (anni)"
              type="number"
              value={profilo.durata}
              placeholder="20"
              onChange={(v) => setProfilo({ ...profilo, durata: v })}
            />
            <div>
              <div style={s.inputLabel}>Fumatore</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["no", "sì"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setProfilo({ ...profilo, fumatore: v })}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 6,
                      border: "1px solid rgba(27,36,32,0.2)",
                      background: profilo.fumatore === v ? "#2F5D4C" : "#FFFFFF",
                      color: profilo.fumatore === v ? "#FAF7F0" : "#1B2420",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Consulente */}
          <div style={{ marginTop: 12 }}>
            <LabelInput
              label="Consulente (nome per la brochure)"
              value={consulente}
              placeholder="es. Mario Rossi"
              onChange={(v) => setConsulente(v)}
            />
          </div>
        </div>

        {/* TABELLA */}
        {prodottoA && prodottoB && (
          <ComparisonLedger
            prodottoA={prodottoA}
            prodottoB={prodottoB}
            profilo={profilo}
          />
        )}

        {/* ESPORTA PDF */}
        {prodottoA && prodottoB && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => generateBrochurePDF({ prodottoA, prodottoB, profilo, consulente })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 8,
                border: "none",
                background: "#0E2D50",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              <FileDown size={16} />
              Esporta Brochure PDF
            </button>
          </div>
        )}

        {/* AGGIUNGI PRODOTTO */}
        <div style={{ marginTop: 32 }}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={s.btnOutline}
            >
              <Plus size={15} /> Aggiungi prodotto al database
            </button>
          ) : (
            <form onSubmit={handleAddProduct} style={s.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Eyebrow>Nuovo prodotto</Eyebrow>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setFormError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(27,36,32,0.5)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={s.grid2}>
                <LabelInput label="Nome prodotto *" value={newProduct.nome} onChange={(v) => setNewProduct({ ...newProduct, nome: v })} />
                <LabelInput label="Compagnia *" value={newProduct.compagnia} onChange={(v) => setNewProduct({ ...newProduct, compagnia: v })} />
                <LabelInput label="Tipo documento" value={newProduct.tipoDocumento} placeholder="es. DIP Vita, brochure..." onChange={(v) => setNewProduct({ ...newProduct, tipoDocumento: v })} />
                <LabelInput label="Capitale (descrizione)" value={newProduct.capitaleNote} placeholder="es. Libero / Minimo 250.000 €" onChange={(v) => setNewProduct({ ...newProduct, capitaleNote: v })} />
                <LabelInput label="Capitale minimo (€)" type="number" value={newProduct.capitaleMin} placeholder="es. 250000" onChange={(v) => setNewProduct({ ...newProduct, capitaleMin: v })} />
                <LabelInput label="Durata (descrizione)" value={newProduct.durataNote} placeholder="es. Da 1 a 25 anni" onChange={(v) => setNewProduct({ ...newProduct, durataNote: v })} />
                <LabelInput label="Durata massima (anni)" type="number" value={newProduct.durataMax} placeholder="es. 25" onChange={(v) => setNewProduct({ ...newProduct, durataMax: v })} />
                <LabelInput label="Fiscalità" value={newProduct.fiscalita} onChange={(v) => setNewProduct({ ...newProduct, fiscalita: v })} />
                <LabelInput label="Recesso" value={newProduct.recesso} onChange={(v) => setNewProduct({ ...newProduct, recesso: v })} />
                <LabelInput label="Riscatto / Riduzione" value={newProduct.riscatto} onChange={(v) => setNewProduct({ ...newProduct, riscatto: v })} />
              </div>

              <LabelTextarea label="Coperture (una per riga)" value={newProduct.coperture} onChange={(v) => setNewProduct({ ...newProduct, coperture: v })} />
              <LabelTextarea label="Esclusioni (una per riga)" value={newProduct.esclusioni} onChange={(v) => setNewProduct({ ...newProduct, esclusioni: v })} />
              <LabelTextarea label="Dati mancanti / da verificare (uno per riga)" value={newProduct.mancanti} onChange={(v) => setNewProduct({ ...newProduct, mancanti: v })} />

              {formError && (
                <div style={{ color: "#8B3A2E", fontSize: 13, display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}>
                  <AlertTriangle size={14} /> {formError}
                </div>
              )}
              <button type="submit" disabled={saving} style={s.btnPrimary}>
                {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                Salva prodotto
              </button>
            </form>
          )}
        </div>

        <div style={{ marginTop: 40, fontSize: 11, color: "rgba(27,36,32,0.4)", textAlign: "center" }}>
          I dati sono salvati nel localStorage del browser · Futuria Assicurazioni
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRODUCT SELECTOR
// ---------------------------------------------------------------------------
function ProductSelector({ label, value, onChange, products, onDelete }) {
  const selected = products.find((p) => p.id === value);
  return (
    <div style={{ background: "#FAF7F0", border: "1px solid rgba(27,36,32,0.14)", borderRadius: 10, padding: 16 }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Fraunces', serif",
            color: "#1B2420",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} — {p.compagnia}
            </option>
          ))}
        </select>
        {selected && (
          <button
            onClick={() => onDelete(selected.id)}
            title="Elimina prodotto"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8B3A2E", padding: 4 }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPARISON LEDGER
// ---------------------------------------------------------------------------
function ComparisonLedger({ prodottoA, prodottoB, profilo }) {
  const capCompA = capitaleCompatibile(prodottoA, profilo);
  const capCompB = capitaleCompatibile(prodottoB, profilo);
  const durCompA = durataCompatibile(prodottoA, profilo);
  const durCompB = durataCompatibile(prodottoB, profilo);
  const premioA = findPremio(prodottoA, profilo);
  const premioB = findPremio(prodottoB, profilo);

  const rows = [
    { label: "Tipo documento", a: prodottoA.tipoDocumento, b: prodottoB.tipoDocumento },
    {
      label: "Capitale",
      a: prodottoA.capitaleNote,
      b: prodottoB.capitaleNote,
      warnA: capCompA === false ? "Capitale richiesto sotto il minimo" : null,
      warnB: capCompB === false ? "Capitale richiesto sotto il minimo" : null,
    },
    {
      label: "Durata",
      a: prodottoA.durataNote,
      b: prodottoB.durataNote,
      warnA: durCompA === false ? "Durata superiore al massimo" : null,
      warnB: durCompB === false ? "Durata superiore al massimo" : null,
    },
    {
      label: "Premio",
      a: premioA ? premioA.rows.map((r) => `${r.durata} anni · ${fmtEUR(r.capitale)}: ${fmtEUR(r.annuo)}/anno`).join("\n") : null,
      b: premioB ? premioB.rows.map((r) => `${r.durata} anni · ${fmtEUR(r.capitale)}: ${fmtEUR(r.annuo)}/anno`).join("\n") : null,
      noteA: prodottoA.premioProfiloRif ? `Rif. profilo: ${prodottoA.premioProfiloRif}` : null,
      noteB: prodottoB.premioProfiloRif ? `Rif. profilo: ${prodottoB.premioProfiloRif}` : null,
    },
    { label: "Coperture", a: prodottoA.coperture, b: prodottoB.coperture, isList: true },
    { label: "Esclusioni", a: prodottoA.esclusioni, b: prodottoB.esclusioni, isList: true },
    { label: "Fiscalità", a: prodottoA.fiscalita, b: prodottoB.fiscalita },
    { label: "Recesso", a: prodottoA.recesso, b: prodottoB.recesso },
    { label: "Riscatto / Riduzione", a: prodottoA.riscatto, b: prodottoB.riscatto },
  ];

  return (
    <div style={{ background: "#FAF7F0", border: "1px solid rgba(27,36,32,0.14)", borderRadius: 10, overflow: "hidden", marginTop: 24 }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", background: "#1B2420" }}>
        <div />
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#EDE7DA", fontSize: 15 }}>{prodottoA.nome}</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#EDE7DA", fontSize: 15 }}>{prodottoB.nome}</div>
      </div>

      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "12px 16px",
            gap: 8,
            borderBottom: i < rows.length - 1 ? "1px solid rgba(27,36,32,0.09)" : "none",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(27,36,32,0.65)", paddingTop: 2 }}>{row.label}</div>
          <RowCell value={row.a} isList={row.isList} warn={row.warnA} note={row.noteA} />
          <RowCell value={row.b} isList={row.isList} warn={row.warnB} note={row.noteB} />
        </div>
      ))}

      {/* Dati mancanti */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", gap: 8, background: "rgba(166,121,44,0.07)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(27,36,32,0.65)" }}>Dati da verificare</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {prodottoA.mancanti?.length ? prodottoA.mancanti.map((m, i) => <Stamp key={i} label={m} tone="brass" />) : <Stamp label="completo" tone="pine" />}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {prodottoB.mancanti?.length ? prodottoB.mancanti.map((m, i) => <Stamp key={i} label={m} tone="brass" />) : <Stamp label="completo" tone="pine" />}
        </div>
      </div>
    </div>
  );
}

function RowCell({ value, isList, warn, note }) {
  const isEmpty = value == null || (Array.isArray(value) && value.length === 0) || value === "";
  if (isEmpty) {
    return <div style={{ fontSize: 12, color: "rgba(27,36,32,0.35)", fontStyle: "italic" }}>N/D</div>;
  }
  return (
    <div style={{ fontSize: 12, color: "rgba(27,36,32,0.85)" }}>
      {isList ? (
        <ul>{value.map((item, i) => <li key={i}>{item}</li>)}</ul>
      ) : (
        <div style={{ whiteSpace: "pre-line" }}>{value}</div>
      )}
      {note && <div style={{ marginTop: 2, fontSize: 11, fontStyle: "italic", color: "rgba(27,36,32,0.45)" }}>{note}</div>}
      {warn && (
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#8B3A2E" }}>
          <AlertTriangle size={11} /> {warn}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FORM HELPERS
// ---------------------------------------------------------------------------
function LabelInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, color: "rgba(27,36,32,0.6)", marginBottom: 4 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: 6,
          border: "1px solid rgba(27,36,32,0.2)",
          background: "#FFFFFF",
          fontSize: 13,
          outline: "none",
        }}
      />
    </div>
  );
}

function LabelTextarea({ label, value, onChange }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "rgba(27,36,32,0.6)", marginBottom: 4 }}>{label}</div>
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: 6,
          border: "1px solid rgba(27,36,32,0.2)",
          background: "#FFFFFF",
          fontSize: 13,
          resize: "vertical",
          outline: "none",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = {
  page: {
    minHeight: "100vh",
    background: "#EDE7DA",
    color: "#1B2420",
    fontFamily: "'Inter', sans-serif",
  },
  wrap: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "40px 20px 60px",
  },
  header: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: "2px solid #1B2420",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 32,
    fontWeight: 600,
    margin: "4px 0 6px",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(27,36,32,0.65)",
    margin: 0,
  },
  card: {
    background: "#FAF7F0",
    border: "1px solid rgba(27,36,32,0.14)",
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 11,
    color: "rgba(27,36,32,0.6)",
    marginBottom: 4,
  },
  emptyHint: {
    padding: "24px 16px",
    background: "#FAF7F0",
    border: "1px dashed rgba(27,36,32,0.25)",
    borderRadius: 10,
    fontSize: 14,
    color: "rgba(27,36,32,0.55)",
    textAlign: "center",
    marginTop: 16,
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    border: "1.5px solid #2F5D4C",
    color: "#2F5D4C",
    background: "transparent",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "#2F5D4C",
    color: "#FAF7F0",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
