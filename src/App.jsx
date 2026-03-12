import { useState, useRef } from "react";

const DEFAULT_CRITERES = [
  { id: "accroche", label: "Accroche & prise de contact", desc: "Sourire, formule de bienvenue, présentation", max: 4 },
  { id: "decouverte", label: "Phase de découverte", desc: "Questions ouvertes, écoute active, reformulation", max: 4 },
  { id: "argumentation", label: "Argumentation", desc: "CAP/SONCAS, bénéfices client, cohérence avec besoins", max: 4 },
  { id: "objections", label: "Traitement des objections", desc: "Méthode, réponse adaptée, rebond positif", max: 4 },
  { id: "conclure", label: "Conclusion & vente additionnelle", desc: "Signal d'achat détecté, closing, vente additionnelle", max: 4 },
  { id: "posture", label: "Posture & communication", desc: "Ton, regard, gestuelle, vocabulaire professionnel", max: 4 },
  { id: "roleplay", label: "Dynamisme du jeu de rôle", desc: "Naturel, fluidité, adaptation au client", max: 4 },
];

function getMentionColor(pct) {
  if (pct < 40) return "#e74c3c";
  if (pct < 60) return "#f39c12";
  if (pct < 80) return "#2ecc71";
  return "#1abc9c";
}
function getMentionLabel(pct) {
  if (pct < 40) return "Insuffisant";
  if (pct < 60) return "En cours d'acquisition";
  if (pct < 80) return "Acquis";
  return "Maîtrisé";
}

const ScoreBtn = ({ value, selected, onClick, max }) => {
  const pct = max > 0 ? value / max : 0;
  const bg = pct === 0 ? "#e74c3c" : pct <= 0.33 ? "#e67e22" : pct <= 0.66 ? "#f1c40f" : pct < 1 ? "#2ecc71" : "#1abc9c";
  return (
    <button onClick={() => onClick(value)} style={{
      width: 38, height: 38, borderRadius: "50%",
      border: selected ? "none" : "2px solid #d1c4a8",
      background: selected ? bg : "#faf8f3",
      color: selected ? "#fff" : "#8b7355",
      fontWeight: "700", fontSize: 13, cursor: "pointer",
      transition: "all 0.15s",
      transform: selected ? "scale(1.18)" : "scale(1)",
      boxShadow: selected ? "0 2px 10px rgba(0,0,0,0.18)" : "none",
      flexShrink: 0,
    }}>{value}</button>
  );
};

const DragIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
    <circle cx="5" cy="4" r="1.2" fill="#8b7355"/><circle cx="5" cy="8" r="1.2" fill="#8b7355"/><circle cx="5" cy="12" r="1.2" fill="#8b7355"/>
    <circle cx="10" cy="4" r="1.2" fill="#8b7355"/><circle cx="10" cy="8" r="1.2" fill="#8b7355"/><circle cx="10" cy="12" r="1.2" fill="#8b7355"/>
  </svg>
);

let uidCounter = 100;
const uid = () => `c${++uidCounter}`;

export default function App() {
  const [step, setStep] = useState("config");
  const [criteres, setCriteres] = useState(DEFAULT_CRITERES);
  const [editingId, setEditingId] = useState(null);
  const [newCritere, setNewCritere] = useState({ label: "", desc: "", max: 4 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [eleve, setEleve] = useState({ nom: "", prenom: "", classe: "", date: new Date().toISOString().split("T")[0], prof: "" });
  const [scores, setScores] = useState({});
  const [commentaires, setCommentaires] = useState({});
  const [pointsForts, setPointsForts] = useState("");
  const [axesAmelio, setAxesAmelio] = useState("");

  const total = criteres.reduce((acc, c) => acc + (scores[c.id] ?? 0), 0);
  const maxTotal = criteres.reduce((acc, c) => acc + c.max, 0);
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const noteSur20 = maxTotal > 0 ? Math.round((total / maxTotal) * 20 * 10) / 10 : 0;
  const mentionColor = getMentionColor(pct);
  const mentionLabel = getMentionLabel(pct);
  const allFilled = criteres.length > 0 && criteres.every((c) => scores[c.id] !== undefined);

  const addCritere = () => {
    if (!newCritere.label.trim()) return;
    const max = Math.max(1, Math.min(10, Number(newCritere.max) || 4));
    setCriteres([...criteres, { id: uid(), label: newCritere.label.trim(), desc: newCritere.desc.trim(), max }]);
    setNewCritere({ label: "", desc: "", max: 4 });
    setShowAddForm(false);
  };

  const removeCritere = (id) => {
    setCriteres(criteres.filter(c => c.id !== id));
    const s = { ...scores }; delete s[id];
    const co = { ...commentaires }; delete co[id];
    setScores(s); setCommentaires(co);
  };

  const updateCritere = (id, field, value) => {
    setCriteres(criteres.map(c => {
      if (c.id !== id) return c;
      const newVal = field === "max" ? Math.max(1, Math.min(10, Number(value) || 1)) : value;
      return { ...c, [field]: newVal };
    }));
    if (field === "max") {
      const maxVal = Math.max(1, Math.min(10, Number(value) || 1));
      if ((scores[id] ?? 0) > maxVal) setScores(prev => ({ ...prev, [id]: maxVal }));
    }
  };

  const resetAll = () => {
    setStep("config");
    setScores({}); setCommentaires({});
    setPointsForts(""); setAxesAmelio("");
    setEleve({ nom: "", prenom: "", classe: "", date: new Date().toISOString().split("T")[0], prof: "" });
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@300;400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#f5f0e8;font-family:'Source Sans 3',sans-serif}
    .page{min-height:100vh;padding:32px 16px 60px}
    .card{background:#fff;border-radius:16px;box-shadow:0 4px 30px rgba(100,80,40,.10);padding:36px;max-width:780px;margin:0 auto}
    .header{text-align:center;margin-bottom:30px}
    .badge{display:inline-block;background:#c9a84c;color:#fff;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:4px 14px;border-radius:20px;margin-bottom:10px}
    h1{font-family:'Playfair Display',serif;font-size:26px;color:#3d2e0e;line-height:1.2}
    .subtitle{color:#8b7355;font-size:14px;margin-top:6px}
    .section{margin-bottom:26px}
    .sec-title{font-family:'Playfair Display',serif;color:#c9a84c;text-transform:uppercase;letter-spacing:1px;font-size:12px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px}
    .sec-title::after{content:'';flex:1;height:1px;background:#ede8dc}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    .field label{display:block;font-size:11px;font-weight:600;color:#8b7355;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px}
    .field input,.field textarea{width:100%;background:#faf8f3;border:1.5px solid #e0d8c8;border-radius:8px;padding:10px 13px;font-family:'Source Sans 3',sans-serif;font-size:14px;color:#3d2e0e;outline:none;transition:border .2s}
    .field input:focus,.field textarea:focus{border-color:#c9a84c}
    .ccard{background:#faf8f3;border-radius:12px;padding:14px 16px;margin-bottom:10px;border:1.5px solid #ede8dc;transition:border .2s,box-shadow .2s}
    .ccard:hover{border-color:#c9a84c44;box-shadow:0 2px 12px rgba(180,130,40,.07)}
    .ccard.ed{border-color:#c9a84c;background:#fffdf5}
    .ctop{display:flex;align-items:center;gap:10px}
    .cinfo{flex:1;min-width:0}
    .clabel{font-weight:600;color:#3d2e0e;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cdesc{font-size:12px;color:#a0916e;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cbadge{background:#f0ead8;color:#a0794a;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0}
    .bico{background:none;border:none;cursor:pointer;padding:5px;border-radius:6px;color:#b0a07a;transition:all .15s;display:flex;align-items:center;justify-content:center}
    .bico:hover{background:#f0ead8;color:#c9a84c}
    .bico.del:hover{background:#fde8e8;color:#e74c3c}
    .bico.act{background:#f0ead8;color:#c9a84c}
    .iedit{margin-top:12px;padding-top:12px;border-top:1px solid #ede8dc;display:flex;flex-direction:column;gap:10px}
    .pts-row{display:flex;gap:6px;flex-wrap:wrap}
    .pt-btn{width:34px;height:34px;border-radius:7px;font-weight:700;font-size:13px;cursor:pointer;transition:all .15s}
    .add-form{background:#fffdf5;border:2px dashed #c9a84c88;border-radius:12px;padding:16px;margin-bottom:10px}
    .add-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
    .btn-add{background:none;border:2px dashed #d1c4a8;border-radius:10px;padding:12px;width:100%;color:#b0a07a;font-family:'Source Sans 3',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:8px}
    .btn-add:hover{border-color:#c9a84c;color:#c9a84c;background:#fffdf5}
    .stepper{display:flex;margin-bottom:30px;border-radius:10px;overflow:hidden;border:1.5px solid #ede8dc}
    .sbtn{flex:1;padding:12px 8px;background:#faf8f3;border:none;font-family:'Source Sans 3',sans-serif;font-size:13px;font-weight:600;color:#b0a07a;cursor:pointer;transition:all .2s;border-right:1px solid #ede8dc;display:flex;align-items:center;justify-content:center;gap:7px}
    .sbtn:last-child{border-right:none}
    .sbtn.active{background:#c9a84c;color:#fff}
    .sbtn.done{background:#f0ead8;color:#c9a84c;cursor:pointer}
    .erow{background:#faf8f3;border-radius:12px;padding:14px 16px;margin-bottom:10px;border:1.5px solid #ede8dc}
    .erow-h{display:flex;justify-content:space-between;align-items:center;gap:10px}
    .elabel{font-weight:600;color:#3d2e0e;font-size:14px}
    .edesc{font-size:12px;color:#a0916e;margin-top:2px}
    .score-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:10px}
    .shint{font-size:11px;color:#c9a84c;font-weight:600;letter-spacing:.5px;background:#fff;padding:2px 9px;border-radius:10px;border:1px solid #ede8dc}
    .cmt-input{margin-top:8px}
    .cmt-input input{font-size:12px;padding:7px 11px;background:#faf8f3;border:1.5px solid #e0d8c8;border-radius:8px;width:100%;font-family:'Source Sans 3',sans-serif;color:#3d2e0e;outline:none}
    .cmt-input input:focus{border-color:#c9a84c}
    .tbar{background:#faf8f3;border:1.5px solid #ede8dc;border-radius:12px;padding:13px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
    .btnp{background:linear-gradient(135deg,#c9a84c,#a8782e);color:#fff;border:none;border-radius:10px;padding:13px 26px;font-family:'Source Sans 3',sans-serif;font-weight:600;font-size:15px;cursor:pointer;letter-spacing:.5px;transition:all .2s}
    .btnp:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(180,130,40,.3)}
    .btnp:disabled{background:#d1c4a8;cursor:not-allowed}
    .btnp.full{width:100%}
    .btns{background:#faf8f3;color:#8b7355;border:1.5px solid #d1c4a8;border-radius:10px;padding:12px 20px;font-family:'Source Sans 3',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s}
    .btns:hover{background:#f0ead8}
    .brow{display:flex;gap:12px;margin-top:22px}
    .ncircle{width:120px;height:120px;border-radius:50%;margin:0 auto 14px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px solid}
    .nbig{font-family:'Playfair Display',serif;font-size:38px;font-weight:700;line-height:1}
    .nden{font-size:14px;opacity:.65}
    .mbadge{display:inline-block;padding:5px 18px;border-radius:20px;font-weight:700;font-size:12px;color:#fff;letter-spacing:1px;text-transform:uppercase;margin-top:6px}
    .pbar-w{background:#ede8dc;border-radius:8px;height:10px;margin:16px 0 0;overflow:hidden}
    .pbar{height:10px;border-radius:8px}
    .rrow{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0ead8;gap:10px}
    .rrow:last-child{border-bottom:none}
    .stars{display:flex;gap:3px;flex-wrap:wrap}
    .star{width:11px;height:11px;border-radius:2px}
    .star.f{background:#c9a84c}
    .star.e{background:#ede8dc}
    .sbox{background:#faf8f3;border-radius:10px;padding:14px;border-left:4px solid}
    .sbox h4{font-family:'Playfair Display',serif;font-size:13px;color:#3d2e0e;margin-bottom:5px}
    .sbox p{font-size:13px;color:#6b5c40;line-height:1.5;white-space:pre-wrap}
    .sumbox{background:#faf8f3;border-radius:10px;padding:13px 16px;border:1px solid #ede8dc;margin-bottom:22px;display:flex;gap:24px;flex-wrap:wrap}
    .sumitem .lbl{font-size:11px;color:#b0a07a;text-transform:uppercase;letter-spacing:1px;font-weight:600}
    .sumitem .val{font-size:20px;font-weight:700;color:#3d2e0e;font-family:'Playfair Display',serif}
    @media(max-width:600px){.grid2,.grid3,.add-grid{grid-template-columns:1fr}.card{padding:20px 16px}.sbtn span{display:none}}
    @media print{body{background:#fff!important}.no-print{display:none!important}.card{box-shadow:none;padding:16px;max-width:100%}.page{padding:0}@page{margin:1.5cm}}
  `;

  const PTS_OPTIONS = [1,2,3,4,5,6,8,10];
  const SCORE_HINTS = { 0:"Absent", 1:"Insuffisant", 2:"Partiel", 3:"Satisfaisant", 4:"Bien", 5:"Très bien", 6:"Excellent", 7:"Excellent", 8:"Excellent", 9:"Excellent", 10:"Parfait" };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="card">

          <div className="header">
            <div className="badge">Bac Pro MCV · Lycée - Jean-Jaures - Ausson</div>
            <h1>Évaluation — Sketch de vente</h1>
            <p className="subtitle">Grille personnalisable · Aubusson, Creuse</p>
          </div>

          {/* Stepper */}
          {step !== "result" && (
            <div className="stepper no-print">
              <button className={`sbtn ${step === "config" ? "active" : "done"}`} onClick={() => step !== "config" && setStep("config")}>
                <span>① Grille d'évaluation</span>
              </button>
              <button className={`sbtn ${step === "form" ? "active" : ""}`} disabled={step === "config"}>
                <span>② Notation élève</span>
              </button>
            </div>
          )}

          {/* ========== CONFIG ========== */}
          {step === "config" && <>
            <div className="section">
              <div className="sec-title">
                Critères
                <span style={{ color:"#b0a07a", fontWeight:400, fontSize:11, textTransform:"none", letterSpacing:0 }}>
                  {criteres.length} critère{criteres.length > 1 ? "s" : ""} · {criteres.reduce((a,c) => a+c.max, 0)} pts max
                </span>
              </div>

              {criteres.map((c) => (
                <div className={`ccard ${editingId === c.id ? "ed" : ""}`} key={c.id}>
                  <div className="ctop">
                    <DragIcon />
                    <div className="cinfo">
                      <div className="clabel">{c.label}</div>
                      {c.desc && <div className="cdesc">{c.desc}</div>}
                    </div>
                    <div className="cbadge">/ {c.max} pts</div>
                    <button className={`bico ${editingId === c.id ? "act" : ""}`} onClick={() => setEditingId(editingId === c.id ? null : c.id)} title="Modifier">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="bico del" onClick={() => removeCritere(c.id)} disabled={criteres.length <= 1} title="Supprimer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>

                  {editingId === c.id && (
                    <div className="iedit">
                      <div className="grid2">
                        <div className="field">
                          <label>Nom du critère</label>
                          <input value={c.label} onChange={e => updateCritere(c.id, "label", e.target.value)} placeholder="Ex : Argumentation" />
                        </div>
                        <div className="field">
                          <label>Description (optionnel)</label>
                          <input value={c.desc} onChange={e => updateCritere(c.id, "desc", e.target.value)} placeholder="Indicateurs observables…" />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"#8b7355", textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:8 }}>Points maximum</div>
                        <div className="pts-row">
                          {PTS_OPTIONS.map(v => (
                            <button key={v} className="pt-btn" onClick={() => updateCritere(c.id, "max", v)} style={{
                              border: c.max === v ? "none" : "1.5px solid #d1c4a8",
                              background: c.max === v ? "#c9a84c" : "#faf8f3",
                              color: c.max === v ? "#fff" : "#8b7355",
                            }}>{v}</button>
                          ))}
                          <button className="btns" style={{ padding:"6px 14px", fontSize:13 }} onClick={() => setEditingId(null)}>✓ OK</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {showAddForm ? (
                <div className="add-form">
                  <div style={{ fontSize:12, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Nouveau critère</div>
                  <div className="add-grid">
                    <div className="field">
                      <label>Nom du critère *</label>
                      <input autoFocus value={newCritere.label} onChange={e => setNewCritere({...newCritere, label: e.target.value})}
                        placeholder="Ex : Gestion du stress" onKeyDown={e => e.key === "Enter" && addCritere()} />
                    </div>
                    <div className="field">
                      <label>Description (optionnel)</label>
                      <input value={newCritere.desc} onChange={e => setNewCritere({...newCritere, desc: e.target.value})}
                        placeholder="Indicateurs observables…" onKeyDown={e => e.key === "Enter" && addCritere()} />
                    </div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, color:"#8b7355", textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:8 }}>Points maximum</div>
                    <div className="pts-row">
                      {PTS_OPTIONS.map(v => (
                        <button key={v} className="pt-btn" onClick={() => setNewCritere({...newCritere, max: v})} style={{
                          border: newCritere.max === v ? "none" : "1.5px solid #d1c4a8",
                          background: newCritere.max === v ? "#c9a84c" : "#faf8f3",
                          color: newCritere.max === v ? "#fff" : "#8b7355",
                        }}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button className="btnp" onClick={addCritere} disabled={!newCritere.label.trim()} style={{ padding:"10px 22px", fontSize:14 }}>
                      + Ajouter
                    </button>
                    <button className="btns" style={{ padding:"10px 16px", fontSize:13 }} onClick={() => { setShowAddForm(false); setNewCritere({ label:"", desc:"", max:4 }); }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-add" onClick={() => setShowAddForm(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Ajouter un critère
                </button>
              )}
            </div>

            <div className="sumbox">
              {[
                { lbl: "Critères", val: criteres.length },
                { lbl: "Points total", val: criteres.reduce((a,c)=>a+c.max,0) },
                { lbl: "Ramené sur", val: <span style={{ color:"#c9a84c" }}>20</span> },
              ].map(s => (
                <div key={s.lbl} className="sumitem"><div className="lbl">{s.lbl}</div><div className="val">{s.val}</div></div>
              ))}
            </div>

            <button className="btnp full" onClick={() => setStep("form")} disabled={criteres.length === 0}>
              Passer à la notation →
            </button>
          </>}

          {/* ========== FORM ========== */}
          {step === "form" && <>
            <div className="section">
              <div className="sec-title">Identité élève</div>
              <div className="grid3" style={{ marginBottom:12 }}>
                <div className="field"><label>Nom</label><input value={eleve.nom} onChange={e => setEleve({...eleve, nom: e.target.value})} placeholder="Dupont" /></div>
                <div className="field"><label>Prénom</label><input value={eleve.prenom} onChange={e => setEleve({...eleve, prenom: e.target.value})} placeholder="Marie" /></div>
                <div className="field"><label>Classe</label><input value={eleve.classe} onChange={e => setEleve({...eleve, classe: e.target.value})} placeholder="Bac Pro MCV 1" /></div>
              </div>
              <div className="grid2">
                <div className="field"><label>Date</label><input type="date" value={eleve.date} onChange={e => setEleve({...eleve, date: e.target.value})} /></div>
                <div className="field"><label>Évaluateur</label><input value={eleve.prof} onChange={e => setEleve({...eleve, prof: e.target.value})} placeholder="M. / Mme …" /></div>
              </div>
            </div>

            <div className="section">
              <div className="sec-title">Notation</div>
              {criteres.map((c) => {
                const s = scores[c.id];
                return (
                  <div className="erow" key={c.id}>
                    <div className="erow-h">
                      <div>
                        <div className="elabel">{c.label}</div>
                        {c.desc && <div className="edesc">{c.desc}</div>}
                      </div>
                      <div className="cbadge">/ {c.max} pts</div>
                    </div>
                    <div className="score-row">
                      {Array.from({ length: c.max + 1 }, (_, i) => i).map(v => (
                        <ScoreBtn key={v} value={v} selected={s === v} max={c.max} onClick={val => setScores({...scores, [c.id]: val})} />
                      ))}
                      {s !== undefined && <span className="shint">{SCORE_HINTS[s] || s}</span>}
                    </div>
                    <div className="cmt-input">
                      <input placeholder="Observation rapide (optionnel)…" value={commentaires[c.id] || ""} onChange={e => setCommentaires({...commentaires, [c.id]: e.target.value})} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section">
              <div className="sec-title">Synthèse qualitative</div>
              <div className="grid2">
                <div className="field"><label>Points forts</label><textarea rows={3} placeholder="Ce qui a bien fonctionné…" value={pointsForts} onChange={e => setPointsForts(e.target.value)} /></div>
                <div className="field"><label>Axes d'amélioration</label><textarea rows={3} placeholder="Ce à quoi travailler…" value={axesAmelio} onChange={e => setAxesAmelio(e.target.value)} /></div>
              </div>
            </div>

            {Object.keys(scores).length > 0 && (
              <div className="tbar">
                <span style={{ color:"#8b7355", fontSize:13 }}>
                  Score : <strong style={{ color:"#3d2e0e" }}>{total} / {maxTotal}</strong>
                  <span style={{ color:"#b0a07a", fontSize:12 }}> · {Object.keys(scores).length}/{criteres.length} critères</span>
                </span>
                <span style={{ color: mentionColor, fontWeight:700, fontSize:16 }}>{noteSur20} / 20</span>
              </div>
            )}

            <div className="brow">
              <button className="btns" onClick={() => setStep("config")}>← Modifier la grille</button>
              <button className="btnp" style={{ flex:1 }} disabled={!allFilled || !eleve.nom || !eleve.prenom} onClick={() => setStep("result")}>
                {allFilled ? "Générer la fiche →" : `Notation incomplète (${Object.keys(scores).length}/${criteres.length})`}
              </button>
            </div>
          </>}

          {/* ========== RESULT ========== */}
          {step === "result" && <>
            <div className="header" style={{ marginBottom:16 }}>
              <h1>Fiche d'évaluation</h1>
              <p className="subtitle">{eleve.prenom} {eleve.nom}{eleve.classe ? ` · ${eleve.classe}` : ""} · {new Date(eleve.date).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}</p>
              {eleve.prof && <p className="subtitle">Évaluateur : {eleve.prof}</p>}
            </div>

            <div style={{ textAlign:"center", padding:"18px 0 14px" }}>
              <div className="ncircle" style={{ borderColor: mentionColor, color: mentionColor }}>
                <span className="nbig">{noteSur20}</span>
                <span className="nden">/ 20</span>
              </div>
              <div className="mbadge" style={{ background: mentionColor }}>{mentionLabel}</div>
              <div style={{ marginTop:8, color:"#8b7355", fontSize:13 }}>{total} pts sur {maxTotal} · {Math.round(pct)}%</div>
              <div className="pbar-w"><div className="pbar" style={{ width:`${pct}%`, background: mentionColor }} /></div>
            </div>

            <div className="section">
              <div className="sec-title">Détail par critère</div>
              {criteres.map(c => {
                const s = scores[c.id] ?? 0;
                return (
                  <div key={c.id} className="rrow">
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, color:"#3d2e0e", fontSize:14 }}>{c.label}</div>
                      {commentaires[c.id] && <div style={{ fontSize:12, color:"#a0916e", marginTop:2 }}>↳ {commentaires[c.id]}</div>}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      <div className="stars">
                        {Array.from({ length: c.max }).map((_, i) => <div key={i} className={`star ${i < s ? "f" : "e"}`} />)}
                      </div>
                      <span style={{ fontWeight:700, color:"#3d2e0e", minWidth:36, textAlign:"right", fontSize:14 }}>{s}/{c.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {(pointsForts || axesAmelio) && (
              <div className="section">
                <div className="sec-title">Synthèse qualitative</div>
                <div className="grid2">
                  {pointsForts && <div className="sbox" style={{ borderLeftColor:"#2ecc71" }}><h4>✓ Points forts</h4><p>{pointsForts}</p></div>}
                  {axesAmelio && <div className="sbox" style={{ borderLeftColor:"#e67e22" }}><h4>⟳ Axes d'amélioration</h4><p>{axesAmelio}</p></div>}
                </div>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:22, paddingTop:18, borderTop:"1px solid #ede8dc" }}>
              {["Signature de l'élève", "Signature de l'enseignant"].map(s => (
                <div key={s} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#b0a07a", marginBottom:28 }}>{s}</div>
                  <div style={{ width:155, borderBottom:"1px solid #d1c4a8" }} />
                </div>
              ))}
            </div>

            <div className="brow no-print">
              <button className="btns" onClick={() => setStep("form")}>← Modifier</button>
              <button className="btns" onClick={resetAll}>↺ Nouvel élève</button>
              <button className="btnp" style={{ flex:1 }} onClick={() => window.print()}>⬇ Exporter PDF</button>
            </div>
          </>}

        </div>
      </div>
    </>
  );
}
