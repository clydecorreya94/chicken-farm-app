function FermentTab({ dayAge, feed }) {
  const recommended = dayAge >= 43;

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:700, color:"#80DEEA", marginBottom:4 }}>🫙 Fermented Feed Guide</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Science-backed method to boost gut health & egg production</div>

      {/* Recommendation banner */}
      <div style={{ background:recommended?"rgba(128,222,234,0.1)":"rgba(255,183,77,0.08)", border:`1px solid ${recommended?"rgba(128,222,234,0.3)":"rgba(255,183,77,0.25)"}`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:recommended?"#80DEEA":"#FFB74D", marginBottom:6 }}>
          {recommended ? "✅ Recommended for Day "+dayAge+" ("+feed.phase+" phase)" : "⏳ Not yet recommended (Day "+dayAge+")"}
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
          {recommended
            ? "Your birds are old enough for fermented feed. Best time to start is Grower phase (Day 43+). Layer phase birds benefit most for egg production."
            : "Wait until Day 43 (Grower phase). Young chicks (Day 1–42) benefit more from fresh dry starter feed. Introduce fermented feed gradually after Day 43."}
        </div>
      </div>

      {/* What is it */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#80DEEA", marginBottom:10, letterSpacing:"0.5px" }}>🔬 WHAT IS FERMENTED FEED?</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.8 }}>
          Fermented feed is your regular poultry feed soaked in water for 3 days, allowing naturally occurring lactic acid bacteria (Lactobacillus) to ferment the feed. This process:
        </div>
        {[
          "Produces lactic acid that lowers feed pH to ~4.5 — creates a natural barrier against Salmonella, E. coli, and Campylobacter",
          "Breaks down phytic acid — makes calcium, phosphorus and minerals 40% more bioavailable",
          "Increases beneficial Lactobacillus bacteria — improves gut microbiome",
          "Reduces anti-nutritional factors in the feed",
          "Improves feed conversion ratio (FCR) — birds need 10–15% less feed for same output",
          "Scientifically proven to increase egg production rate, egg shell strength, and shell weight in layers",
        ].map((p,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginTop:8, alignItems:"flex-start" }}>
            <span style={{ color:"#80DEEA", flexShrink:0 }}>•</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>{p}</span>
          </div>
        ))}
      </div>

      {/* When to use */}
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#FFB74D", marginBottom:10 }}>📅 WHEN TO USE vs NORMAL FEED</div>
        {[
          { phase:"Day 1–42 (Starter)", rec:"Normal dry feed", reason:"Young chicks need precise nutrition. Fermentation process can be inconsistent for chicks. Stick to dry crumble/mash.", icon:"❌" },
          { phase:"Day 43–120 (Grower)", rec:"Can introduce FF at 20–30%", reason:"Safe to start. Mix 20–30% fermented feed with 70–80% dry feed. Monitor droppings and appetite.", icon:"🟡" },
          { phase:"Day 121–140 (Pre-Layer)", rec:"Increase to 30–40%", reason:"Gut bacteria establishment helps prepare for laying. Improves calcium utilization when you add grit.", icon:"✅" },
          { phase:"Day 141+ (Layer)", rec:"Up to 50% of diet", reason:"Maximum benefit for egg production. Studies show improved laying rate, shell quality, and FCR. Best ROI.", icon:"⭐" },
        ].map((r,i)=>(
          <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize:18 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:"white" }}>{r.phase}</div>
              <div style={{ fontSize:12, color:r.icon==="❌"?"#EF9A9A":r.icon==="⭐"?"#FFD54F":"#A5D6A7", fontWeight:600, marginTop:2 }}>{r.rec}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:3, lineHeight:1.5 }}>{r.reason}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How to make */}
      <div style={{ background:"rgba(128,222,234,0.07)", border:"1px solid rgba(128,222,234,0.25)", borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#80DEEA", marginBottom:10 }}>🫙 HOW TO MAKE — STEP BY STEP</div>
        {[
          { step:"Day 1 — Prepare", desc:"Take a clean plastic bucket or clay pot. Add your regular poultry feed (any brand). Add clean water at 1:1.5 ratio (1 kg feed + 1.5 litres water). Mix well. Cover loosely with a cloth — do NOT seal airtight (CO2 needs to escape)." },
          { step:"Day 1–3 — Ferment", desc:"Leave at room temperature (25–35°C — ideal for Kerala). Stir once or twice daily. You will see bubbles forming after Day 1 — this is normal and good. By Day 3, feed will smell slightly sour like yogurt/buttermilk — this is correct." },
          { step:"Day 3 — Ready to feed", desc:"Smell should be pleasantly sour, NOT rotten or foul. Correct smell = yogurt or bread dough. Wrong smell = garbage or ammonia means it went bad — discard and restart." },
          { step:"How much to give", desc:"Start with 20–30% of normal daily ration as fermented feed. Mix with remaining dry feed. Gradually increase to 50% over 2 weeks. Remove any uneaten fermented feed after 4 hours — it can spoil quickly in Kerala heat." },
          { step:"Continuous rotation system", desc:"Keep 2–3 buckets going at once. Start a new bucket every day or every 2 days so you always have a fresh batch ready. Once fermenting is established, reserve 10% as 'starter culture' for next batch — speeds up fermentation." },
        ].map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
            <div style={{ background:"#0288D1", color:"white", width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:"#80DEEA", marginBottom:3 }}>{s.step}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits summary */}
      <div style={{ background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.3)", borderRadius:12, padding:14, marginBottom:12 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#A5D6A7", marginBottom:10 }}>📈 PROVEN BENEFITS (Research-backed)</div>
        {[
          "10–15% improvement in Feed Conversion Ratio (FCR) — less feed needed",
          "Increased egg laying rate in late-cycle layers (scientifically proven, PubMed)",
          "Improved eggshell strength and weight",
          "Better gut health — 50–70% reduction in Salmonella and E. coli",
          "Reduced feed cost — birds eat less for same output",
          "Lower ammonia in droppings — healthier coop air",
          "Better immune response — fewer disease outbreaks",
        ].map((b,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
            <span style={{ color:"#A5D6A7", flexShrink:0 }}>✓</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.5 }}>{b}</span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      <div style={{ background:"rgba(239,83,80,0.07)", border:"1px solid rgba(239,83,80,0.2)", borderRadius:12, padding:14 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#EF9A9A", marginBottom:10 }}>⚠️ IMPORTANT WARNINGS</div>
        {[
          "Never use a sealed airtight container — CO2 buildup can cause explosion",
          "Discard if smell is rotten or putrid — not sour. Bad fermentation = bad bacteria",
          "In Kerala summer (35°C+), fermentation happens faster — check at 2 days instead of 3",
          "Remove uneaten wet feed from coop within 4 hours in hot weather — it spoils fast",
          "Do NOT ferment medicated chick starter — antibiotics kill the beneficial bacteria",
          "Start slowly — sudden diet change causes loose droppings for 2–3 days (normal adjustment)",
        ].map((w,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
            <span style={{ color:"#EF9A9A", flexShrink:0 }}>•</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FermentTab;
