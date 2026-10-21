import { useState } from "react";
import { SAFE_GREENS, UNSAFE_GREENS } from "../data/greens";
function GreensTab() {
  const [view, setView] = useState("safe"); // safe | unsafe
  const [expanded, setExpanded] = useState(null);
  const toggle = id => setExpanded(e => e === id ? null : id);

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:700, color:"#A5D6A7", marginBottom:4 }}>🌿 Green Feeds Guide</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Plants available in Kerala to feed or avoid</div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["safe","✅ Safe & Beneficial"],["unsafe","❌ Avoid / Toxic"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:`1px solid ${view===v?(v==="safe"?"rgba(165,214,167,0.5)":"rgba(239,83,80,0.5)"):"rgba(255,255,255,0.1)"}`, background:view===v?(v==="safe"?"rgba(165,214,167,0.12)":"rgba(239,83,80,0.12)"):"rgba(255,255,255,0.03)", color:view===v?(v==="safe"?"#A5D6A7":"#EF9A9A"):"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {view === "safe" && (
        <>
          <div style={{ background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>
            💡 <b style={{color:"#A5D6A7"}}>These are supplements</b>, not replacements for regular feed. Keep treats to max 10% of total diet. Most are freely available in Kerala compounds and cost nothing.
          </div>
          {SAFE_GREENS.map((g, i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${expanded===i?"rgba(165,214,167,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:12, marginBottom:8, overflow:"hidden" }}>
              <div onClick={()=>toggle(i)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", cursor:"pointer" }}>
                <span style={{ fontSize:20 }}>{g.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"white" }}>{g.name}</div>
                  <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                    {g.local && <span style={{ fontSize:9, background:"rgba(46,125,50,0.2)", color:"#A5D6A7", padding:"1px 7px", borderRadius:8, fontWeight:700 }}>KERALA LOCAL</span>}
                    {g.medicinal && <span style={{ fontSize:9, background:"rgba(147,112,219,0.2)", color:"#CE93D8", padding:"1px 7px", borderRadius:8, fontWeight:700 }}>MEDICINAL</span>}
                    <span style={{ fontSize:9, background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.4)", padding:"1px 7px", borderRadius:8 }}>{g.frequency}</span>
                  </div>
                </div>
                <span style={{ color:"rgba(255,255,255,0.3)", fontSize:18 }}>{expanded===i?"∨":"›"}</span>
              </div>
              {expanded===i && (
                <div style={{ padding:"0 14px 14px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:10, marginBottom:10, lineHeight:1.7 }}>🌟 {g.benefit}</div>
                  <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:700, marginBottom:6, letterSpacing:"1px" }}>HOW TO FEED</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.7 }}>{g.howToFeed}</div>
                    <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                      <div style={{ background:"rgba(255,183,77,0.1)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#FFB74D" }}>📅 {g.frequency}</div>
                      <div style={{ background:"rgba(25,118,210,0.1)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#90CAF9" }}>⚖️ {g.qty}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {view === "unsafe" && (
        <>
          <div style={{ background:"rgba(239,83,80,0.08)", border:"1px solid rgba(239,83,80,0.25)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>
            ⚠️ <b style={{color:"#EF9A9A"}}>Never feed these</b> to your birds. Some are extremely toxic even in small amounts. In Kerala, <b style={{color:"#EF9A9A"}}>castor beans and oleander</b> are the highest risks as they grow wild everywhere.
          </div>
          {UNSAFE_GREENS.map((g, i) => (
            <div key={i} style={{ display:"flex", gap:12, background:"rgba(239,83,80,0.06)", border:"1px solid rgba(239,83,80,0.2)", borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{g.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#EF9A9A", marginBottom:4 }}>{g.name}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>{g.reason}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default GreensTab;
