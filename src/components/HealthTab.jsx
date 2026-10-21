import { useState } from "react";
import { DISEASES, SYMPTOM_CHECKLIST } from "../data/health";
function HealthTab() {
  const [mode, setMode] = useState("checker"); // checker | browse | detail
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [detailId, setDetailId] = useState(null);

  const toggleSymptom = idx => setSelectedSymptoms(p => p.includes(idx) ? p.filter(x=>x!==idx) : [...p, idx]);

  const matchedIds = selectedSymptoms.length === 0 ? [] :
    [...new Set(selectedSymptoms.flatMap(i => SYMPTOM_CHECKLIST[i].disease))];
  const matched = DISEASES.filter(d => matchedIds.includes(d.id));
  const detail = DISEASES.find(d => d.id === detailId);

  const sevColor = { critical:"#EF5350", high:"#FF8A65", medium:"#FFB74D", low:"#81C784" };
  const sevLabel = { critical:"🚨 CRITICAL", high:"⚠️ HIGH", medium:"🔶 MEDIUM", low:"🟢 LOW" };

  if (detail) return (
    <div>
      <button onClick={()=>setDetailId(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.05)", border:"none", color:"rgba(255,255,255,0.6)", padding:"8px 14px", borderRadius:20, cursor:"pointer", marginBottom:16, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>← Back</button>

      <div style={{ background:`linear-gradient(135deg,${detail.color}22,${detail.color}11)`, border:`1px solid ${detail.color}44`, borderRadius:14, padding:18, marginBottom:14 }}>
        <div style={{ fontSize:28, marginBottom:6 }}>{detail.icon}</div>
        <div style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:4 }}>{detail.name}</div>
        <div style={{ display:"inline-block", background:sevColor[detail.severity]+"22", color:sevColor[detail.severity], border:`1px solid ${sevColor[detail.severity]}44`, borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:700 }}>{sevLabel[detail.severity]}</div>
        {detail.vetNeeded && <div style={{ marginTop:8, background:"rgba(239,83,80,0.15)", border:"1px solid rgba(239,83,80,0.3)", borderRadius:8, padding:"6px 12px", fontSize:11, color:"#EF9A9A", fontWeight:600 }}>⚕️ Consult a veterinarian for this disease</div>}
      </div>

      {detail.note && <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.7 }}>💡 {detail.note}</div>}

      {[
        { title:"🔍 Symptoms", items:detail.symptoms, color:"#90CAF9" },
        { title:"⚗️ Causes", items:[detail.causes], color:"#CE93D8" },
        { title:"💊 Treatment Steps", items:detail.treatment, color:"#A5D6A7" },
        { title:"🛡️ Prevention", items:detail.prevention, color:"#80DEEA" },
        { title:"💉 Medicines (ask at local vet shop)", items:detail.medicines, color:"#FFB74D" },
      ].map(section => (
        <div key={section.title} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:14, marginBottom:12 }}>
          <div style={{ fontSize:12, fontWeight:700, color:section.color, marginBottom:10, letterSpacing:"0.5px" }}>{section.title}</div>
          {section.items.map((item, i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
              <span style={{ color:section.color, flexShrink:0, marginTop:1 }}>•</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", lineHeight:1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:700, color:"#EF9A9A", marginBottom:4 }}>🩺 Health & Disease Guide</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Symptom checker + treatment guide for BV-380</div>

      {/* Mode switcher */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["checker","🔍 Symptom Checker"],["browse","📋 Browse All"]].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:`1px solid ${mode===m?"rgba(239,83,80,0.5)":"rgba(255,255,255,0.1)"}`, background:mode===m?"rgba(239,83,80,0.15)":"rgba(255,255,255,0.03)", color:mode===m?"#EF9A9A":"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {mode === "checker" && (
        <>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:14, marginBottom:14 }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginBottom:12, fontWeight:700 }}>TICK ALL SYMPTOMS YOU SEE</div>
            {SYMPTOM_CHECKLIST.map((item, i) => (
              <div key={i} onClick={()=>toggleSymptom(i)} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}>
                <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${selectedSymptoms.includes(i)?"#EF9A9A":"rgba(255,255,255,0.2)"}`, background:selectedSymptoms.includes(i)?"rgba(239,83,80,0.3)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                  {selectedSymptoms.includes(i) && <span style={{ fontSize:13, color:"#EF9A9A" }}>✓</span>}
                </div>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.4 }}>{item.q}</span>
              </div>
            ))}
          </div>
          {selectedSymptoms.length > 0 && matched.length === 0 && (
            <div style={{ background:"rgba(46,125,50,0.12)", border:"1px solid rgba(46,125,50,0.3)", borderRadius:12, padding:14, textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>✅</div>
              <div style={{ fontSize:14, fontWeight:600, color:"#A5D6A7" }}>No specific disease matched</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4 }}>Check for stress, heat, or sudden feed change. Monitor for 24 hrs.</div>
            </div>
          )}
          {matched.length > 0 && (
            <>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:2, fontWeight:700, marginBottom:10 }}>POSSIBLE CONDITIONS ({matched.length})</div>
              {matched.map(d => (
                <div key={d.id} onClick={()=>setDetailId(d.id)} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.035)", border:`1px solid ${d.color}33`, borderRadius:12, padding:"12px 14px", marginBottom:10, cursor:"pointer" }}>
                  <span style={{ fontSize:24 }}>{d.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"white" }}>{d.name}</div>
                    <div style={{ fontSize:11, color:sevColor[d.severity], marginTop:2, fontWeight:600 }}>{sevLabel[d.severity]} {d.vetNeeded?"· See vet":""}</div>
                  </div>
                  <span style={{ fontSize:18, color:"rgba(255,255,255,0.3)" }}>›</span>
                </div>
              ))}
              <div style={{ background:"rgba(239,83,80,0.08)", border:"1px solid rgba(239,83,80,0.2)", borderRadius:10, padding:"10px 14px", fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginTop:4 }}>
                ⚠️ This is a guide, not a diagnosis. For multiple deaths or critical symptoms, always consult a poultry veterinarian immediately.
              </div>
            </>
          )}
        </>
      )}

      {mode === "browse" && (
        <>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:2, fontWeight:700, marginBottom:12 }}>ALL CONDITIONS — TAP FOR DETAILS</div>
          {DISEASES.map(d => (
            <div key={d.id} onClick={()=>setDetailId(d.id)} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.03)", border:`1px solid ${d.color}22`, borderRadius:12, padding:"12px 14px", marginBottom:8, cursor:"pointer" }}>
              <span style={{ fontSize:22 }}>{d.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"white" }}>{d.name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{d.symptoms[0]}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:sevColor[d.severity], fontWeight:700 }}>{sevLabel[d.severity]}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default HealthTab;
