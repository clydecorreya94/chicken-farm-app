import { useState } from "react";
import { toDateInputValue } from "../lib/dates";
const EXPENSE_CATEGORIES = ["Chicks/Birds","Feed","Medicines/Vaccines","Supplements","Equipment/Tools","Coop/Housing","Electricity","Labour","Miscellaneous"];
const INCOME_CATEGORIES = ["Egg Sales","Bird Sales","Manure","Other"];

function FinanceTab({ entries, onSave, readOnly }) {
  const getDefaultCategory = type => (type === "expense" ? EXPENSE_CATEGORIES[1] : INCOME_CATEGORIES[0]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("expense"); // expense | income
  const [form, setForm] = useState({ date: toDateInputValue(), category: getDefaultCategory("expense"), desc:"", amount:"" });
  const [view, setView] = useState("summary"); // summary | log
  const [notice, setNotice] = useState("");
  const amountValue = Number.parseFloat(String(form.amount).trim());
  const activeCategories = formType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const canSave = !readOnly && !!form.date && Number.isFinite(amountValue) && amountValue > 0;

  const addEntry = event => {
    event?.preventDefault();
    if (readOnly) return;
    if (!canSave) return;
    const entry = {
      ...form,
      date: form.date || toDateInputValue(),
      category: activeCategories.includes(form.category) ? form.category : getDefaultCategory(formType),
      type: formType,
      amount: amountValue,
      id: Date.now(),
    };
    onSave([entry, ...entries]);
    setForm({ date: toDateInputValue(), category: getDefaultCategory(formType), desc:"", amount:"" });
    setShowForm(false);
    setView("log");
    setNotice(`${formType === "expense" ? "Expense" : "Income"} saved.`);
  };

  const deleteEntry = id => {
    if (readOnly) return;
    onSave(entries.filter(e => e.id !== id));
  };

  const resetFinance = () => {
    if (readOnly) return;
    if (!window.confirm("Reset ALL finance data? This cannot be undone.")) return;
    onSave([]);
    setNotice("Finance data cleared.");
  };

  const totalExpense = entries.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount, 0);
  const totalIncome  = entries.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount, 0);
  const profit = totalIncome - totalExpense;

  const byCat = EXPENSE_CATEGORIES.map(cat => ({
    cat, total: entries.filter(e=>e.type==="expense"&&e.category===cat).reduce((s,e)=>s+e.amount,0)
  })).filter(x=>x.total>0).sort((a,b)=>b.total-a.total);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:"#FFD54F", marginBottom:4 }}>💰 Farm Finance Tracker</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Track expenses, income & profitability</div>
        </div>
        <button onClick={resetFinance} disabled={readOnly} style={{ background:"rgba(239,83,80,0.1)", border:"1px solid rgba(239,83,80,0.3)", color:readOnly?"rgba(239,154,154,0.45)":"#EF9A9A", borderRadius:8, padding:"5px 10px", fontSize:11, cursor:readOnly?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, opacity:readOnly?0.6:1 }}>Reset</button>
      </div>

      {readOnly && (
        <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
          Guest mode is read-only. You can view finance data, but only the admin account can add, edit, or reset it.
        </div>
      )}

      {!readOnly && notice && (
        <div style={{ background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#A5D6A7", lineHeight:1.6 }}>
          {notice}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom:14 }}>
        {[
          { label:"Total Spent", val:`₹${totalExpense.toLocaleString("en-IN")}`, color:"#EF9A9A" },
          { label:"Total Income", val:`₹${totalIncome.toLocaleString("en-IN")}`, color:"#A5D6A7" },
          { label:profit>=0?"Profit":"Loss", val:`₹${Math.abs(profit).toLocaleString("en-IN")}`, color:profit>=0?"#FFD54F":"#EF5350" },
        ].map(c => (
          <div key={c.label} className="stat-chip" style={{ borderColor: c.color+"33" }}>
            <div className="val" style={{ color: c.color, fontSize:16 }}>{c.val}</div>
            <div className="lbl">{c.label}</div>
          </div>
        ))}
      </div>

      {profit < 0 && totalExpense > 0 && (
        <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>
          📊 You need <b style={{color:"#FFD54F"}}>₹{Math.abs(profit).toLocaleString("en-IN")}</b> more income to break even. Log egg sales and bird sales regularly to track progress.
        </div>
      )}

      {/* View switcher */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["summary","📊 Summary"],["log","📋 All Entries"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{ flex:1, padding:"8px 0", borderRadius:10, border:`1px solid ${view===v?"rgba(255,213,79,0.4)":"rgba(255,255,255,0.1)"}`, background:view===v?"rgba(255,213,79,0.1)":"rgba(255,255,255,0.03)", color:view===v?"#FFD54F":"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {/* Add entry button */}
      {!showForm && (
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[["expense","➕ Add Expense"],["income","➕ Add Income"]].map(([t,l])=>(
            <button key={t} type="button" onClick={()=>{ if (readOnly) return; setNotice(""); setFormType(t); setForm({ date: toDateInputValue(), category: getDefaultCategory(t), desc:"", amount:"" }); setShowForm(true); }} disabled={readOnly} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${t==="expense"?"rgba(239,83,80,0.3)":"rgba(165,214,167,0.3)"}`, background:t==="expense"?"rgba(239,83,80,0.08)":"rgba(46,125,50,0.08)", color:readOnly?"rgba(255,255,255,0.35)":t==="expense"?"#EF9A9A":"#A5D6A7", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:readOnly?"not-allowed":"pointer", opacity:readOnly?0.65:1 }}>{l}</button>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={addEntry} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${formType==="expense"?"rgba(239,83,80,0.3)":"rgba(165,214,167,0.3)"}`, borderRadius:12, padding:16, marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:formType==="expense"?"#EF9A9A":"#A5D6A7", marginBottom:12 }}>{formType==="expense"?"💸 New Expense":"💵 New Income"}</div>
          <div className="auto-grid-2" style={{ marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>Date</div>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} disabled={readOnly} className="fm-input" style={{ fontSize:12 }} />
            </div>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>Amount (₹)</div>
              <input type="number" placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} disabled={readOnly} className="fm-input" style={{ fontSize:14, fontWeight:700 }} />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>Category</div>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} disabled={readOnly} className="fm-input" style={{ fontSize:13 }}>
              {activeCategories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>Note (optional)</div>
            <input type="text" placeholder="e.g. 25kg Suguna Layer feed" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} disabled={readOnly} className="fm-input" style={{ fontSize:13 }} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button type="submit" disabled={!canSave} style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none", background:formType==="expense"?"rgba(239,83,80,0.8)":"rgba(46,125,50,0.8)", color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:canSave?"pointer":"not-allowed", opacity:canSave?1:0.65 }}>Save</button>
            <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost" style={{ flex:1, padding:"11px 0" }}>Cancel</button>
          </div>
        </form>
      )}

      {view === "summary" && byCat.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:2, marginBottom:12 }}>EXPENSE BREAKDOWN</div>
          {byCat.map(({cat,total}) => (
            <div key={cat} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{cat}</span>
                <span style={{ fontSize:12, fontWeight:600, color:"#EF9A9A" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width:`${(total/totalExpense*100).toFixed(0)}%`, background:"rgba(239,83,80,0.6)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "summary" && entries.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:2, marginBottom:12 }}>RECENT ENTRIES</div>
          {entries.slice(0, 3).map(e => (
            <div key={e.id} style={{ display:"flex", justifyContent:"space-between", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, color:"white", fontWeight:600 }}>{e.type==="expense"?"Expense":"Income"} · {e.category}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{e.desc || e.date}</div>
              </div>
              <div style={{ fontSize:12, color:e.type==="expense"?"#EF9A9A":"#A5D6A7", fontWeight:700, flexShrink:0 }}>₹{e.amount.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
      )}

      {view === "log" && (
        <>
          {entries.length === 0 && <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,0.3)", fontSize:13 }}>No entries yet. Add your first expense or income above.</div>}
          {entries.map(e => (
            <div key={e.id} style={{ display:"flex", gap:10, alignItems:"center", background:"rgba(255,255,255,0.03)", border:`1px solid ${e.type==="expense"?"rgba(239,83,80,0.15)":"rgba(165,214,167,0.15)"}`, borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
              <div style={{ fontSize:20 }}>{e.type==="expense"?"💸":"💵"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"white" }}>₹{e.amount.toLocaleString("en-IN")}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{e.date}</span>
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{e.category}{e.desc?" — "+e.desc:""}</div>
              </div>
              <button onClick={()=>deleteEntry(e.id)} disabled={readOnly} style={{ background:"none", border:"none", color:readOnly?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.2)", cursor:readOnly?"not-allowed":"pointer", fontSize:16, padding:"4px" }}>✕</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default FinanceTab;
