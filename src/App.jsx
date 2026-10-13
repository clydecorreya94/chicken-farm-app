import { useState, useEffect, useCallback } from "react";

// ─── Responsive CSS ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: #0a0500; color: #f0e8d8; display:block; min-height:100vh; -webkit-font-smoothing: antialiased; }
  #root { width: 100%; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(232,119,34,0.3); border-radius: 2px; }

  .app-shell { display: flex; flex-direction: column; min-height: 100vh; }
  .app-topbar { background: linear-gradient(135deg,#E87722,#BF5500); padding: 12px 20px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow: 0 2px 20px rgba(232,119,34,0.35); }
  .app-body { display: flex; flex: 1; min-height: 0; }
  .app-sidebar { display: none; }
  .app-content { flex: 1; padding: 16px 16px 80px; max-width: 100%; overflow-x: hidden; }
  .app-bottomnav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; padding-bottom: env(safe-area-inset-bottom); background: rgba(10,5,0,0.97); border-top: 1px solid rgba(232,119,34,0.2); z-index: 100; backdrop-filter: blur(16px); }
  .app-bottomnav-item { flex: 1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 9px 4px 11px; cursor:pointer; border:none; background:transparent; color: rgba(255,255,255,0.35); font-family:'DM Sans',sans-serif; transition: color 0.2s; gap:3px; }
  .app-bottomnav-item.active { color: #E87722; }
  .app-bottomnav-item .nav-icon { font-size: 22px; line-height:1; }
  .app-bottomnav-item .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

  @media (min-width: 768px) {
    .app-topbar { padding: 14px 28px; }
    .app-body { flex-direction: row; align-items: flex-start; }
    .app-sidebar { display: flex; flex-direction: column; width: 220px; min-height: calc(100vh - 56px); background: rgba(255,255,255,0.02); border-right: 1px solid rgba(232,119,34,0.12); padding: 20px 10px; position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto; flex-shrink: 0; }
    .sidebar-logo { padding: 8px 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 12px; }
    .sidebar-logo .sl-birds { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 3px; }
    .app-sidebar-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; cursor:pointer; border:none; background:transparent; color:rgba(255,255,255,0.45); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; width:100%; text-align:left; transition: all 0.15s; margin-bottom:2px; }
    .app-sidebar-item:hover { background:rgba(232,119,34,0.08); color:rgba(255,255,255,0.8); }
    .app-sidebar-item.active { background:rgba(232,119,34,0.15); color:#FFB74D; font-weight:600; }
    .app-sidebar-item .s-icon { font-size:17px; width:22px; text-align:center; }
    .app-content { padding: 28px 32px 40px; max-width: 860px; }
    .app-bottomnav { display: none; }
  }

  @media (min-width: 1200px) {
    .app-content { max-width: 1000px; }
    .app-sidebar { width: 240px; }
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
  .auto-grid-2 { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .auto-grid-3 { display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  @media (max-width: 480px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } .auto-grid-2, .auto-grid-3 { grid-template-columns: 1fr; } }
  @media (min-width: 481px) and (max-width: 640px) { .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; } }

  .card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; margin-bottom: 14px; }
  .card-header { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }

  .stat-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 10px; text-align:center; }
  .stat-chip .val { font-size: 20px; font-weight: 700; line-height: 1.1; }
  .stat-chip .lbl { font-size: 10px; color: rgba(255,255,255,0.38); margin-top: 3px; font-weight: 500; }

  .fm-input { width:100%; padding:10px 14px; border-radius:8px; border:1px solid rgba(232,119,34,0.3); background:rgba(255,255,255,0.05); color:white; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition: border-color 0.15s, background 0.15s; }
  .fm-input:focus { border-color: rgba(232,119,34,0.65); background: rgba(255,255,255,0.07); }
  .fm-input.mono-input { font-family: 'DM Mono', monospace; font-size: 13px; }

  .btn-primary { width:100%; padding:13px; background:linear-gradient(135deg,#E87722,#BF5500); color:white; border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition: opacity 0.15s; letter-spacing: 0.3px; }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost { width:100%; padding:11px; background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.1); border-radius:10px; font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; transition: background 0.15s; }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); }

  .section-label { font-size:11px; color:rgba(255,255,255,0.32); font-weight:700; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:10px; }

  .alert-red    { background:rgba(239,83,80,0.1);   border:1px solid rgba(239,83,80,0.38);  border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .alert-green  { background:rgba(46,125,50,0.1);   border:1px solid rgba(46,125,50,0.38);  border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .alert-blue   { background:rgba(25,118,210,0.09); border:1px solid rgba(25,118,210,0.32); border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .alert-amber  { background:rgba(255,183,77,0.09); border:1px solid rgba(255,183,77,0.28); border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .alert-purple { background:rgba(147,112,219,0.09);border:1px solid rgba(147,112,219,0.32);border-radius:12px; padding:14px 16px; margin-bottom:14px; }

  .prog-track { background:rgba(255,255,255,0.07); border-radius:6px; height:6px; overflow:hidden; }
  .prog-fill  { height:100%; border-radius:6px; transition: width 0.4s ease; }

  @media (min-width: 900px) {
    .dash-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
    .dash-full { grid-column: 1 / -1; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Feed schedule for the app's current BV380 programme.
const FEED_SCHEDULE = [
  { minDay:1,   maxDay:7,   phase:"Pre-Starter", feedType:"Pre-Starter Crumble",          proteinPct:"22–24%", gramsPerBird:[10,12],   waterMl:[200,220],  freq:"4–5x daily", brands:"Suguna Pre-Starter, Godrej Chick Starter, Venky's Super Start",           notes:"Add glucose 5g/litre on Day 1 only. Dip each chick's beak in water on arrival." },
  { minDay:8,   maxDay:14,  phase:"Starter",     feedType:"Chick Starter Mash",           proteinPct:"20–22%", gramsPerBird:[16,18],   waterMl:[220,260],  freq:"3–4x daily", brands:"Suguna Starter, RCM Starter Mash, Godrej Broiler Starter, Venky's Starter", notes:"Plain clean water only. Never cold water. Check every 2 hrs." },
  { minDay:15,  maxDay:21,  phase:"Starter",     feedType:"Chick Starter Mash",           proteinPct:"20–22%", gramsPerBird:[24,26],   waterMl:[240,280],  freq:"3–4x daily", brands:"Suguna Starter, RCM Starter Mash, Godrej Broiler Starter, Venky's Starter", notes:"Plain clean water only. Never cold water. Check every 2 hrs." },
  { minDay:22,  maxDay:28,  phase:"Starter",     feedType:"Chick Starter / Early Grower", proteinPct:"19–20%", gramsPerBird:[31,33],   waterMl:[280,320],  freq:"3x daily",   brands:"Suguna Starter, Kerafed Grower, RCM Grower Mash",                          notes:"Start giving grit from Week 3. Remove sick birds immediately." },
  { minDay:29,  maxDay:35,  phase:"Starter",     feedType:"Chick Starter / Early Grower", proteinPct:"19–20%", gramsPerBird:[36,38],   waterMl:[300,340],  freq:"3x daily",   brands:"Suguna Starter, Kerafed Grower, RCM Grower Mash",                          notes:"Start giving grit from Week 3. Remove sick birds immediately." },
  { minDay:36,  maxDay:42,  phase:"Starter",     feedType:"Chick Starter / Early Grower", proteinPct:"19–20%", gramsPerBird:[41,43],   waterMl:[320,360],  freq:"3x daily",   brands:"Suguna Starter, Kerafed Grower, RCM Grower Mash",                          notes:"Start giving grit from Week 3. Remove sick birds immediately." },
  { minDay:43,  maxDay:49,  phase:"Grower I",    feedType:"Grower Mash",                  proteinPct:"16–18%", gramsPerBird:[45,47],   waterMl:[340,380],  freq:"2x daily",   brands:"Suguna Grower, Godrej Grower, Kerafed Grower, Venky's Grower, RCM Grower", notes:"Transition from starter over 5-7 days. Mix 50/50 first week." },
  { minDay:50,  maxDay:56,  phase:"Grower I",    feedType:"Grower Mash",                  proteinPct:"16–18%", gramsPerBird:[49,51],   waterMl:[350,390],  freq:"2x daily",   brands:"Suguna Grower, Godrej Grower, Kerafed Grower, Venky's Grower, RCM Grower", notes:"Keep the feed change gradual if birds are still finishing starter feed." },
  { minDay:57,  maxDay:63,  phase:"Grower I",    feedType:"Grower Mash",                  proteinPct:"16–18%", gramsPerBird:[53,55],   waterMl:[360,400],  freq:"2x daily",   brands:"Suguna Grower, Godrej Grower, Kerafed Grower, Venky's Grower, RCM Grower", notes:"Keep feeders empty for a short midday period to maintain appetite." },
  { minDay:64,  maxDay:70,  phase:"Grower I",    feedType:"Grower Mash",                  proteinPct:"16–18%", gramsPerBird:[57,59],   waterMl:[370,410],  freq:"2x daily",   brands:"Suguna Grower, Godrej Grower, Kerafed Grower, Venky's Grower, RCM Grower", notes:"Keep feeders empty for a short midday period to maintain appetite." },
  { minDay:71,  maxDay:77,  phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[60,62],   waterMl:[380,420],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:78,  maxDay:84,  phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[63,65],   waterMl:[390,430],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:85,  maxDay:91,  phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[66,68],   waterMl:[400,440],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:92,  maxDay:98,  phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[69,71],   waterMl:[410,450],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:99,  maxDay:105, phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[72,74],   waterMl:[420,460],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:106, maxDay:112, phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[75,77],   waterMl:[430,470],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:113, maxDay:120, phase:"Grower II",   feedType:"Developer / Grower Feed",      proteinPct:"15–16%", gramsPerBird:[79,81],   waterMl:[440,480],  freq:"2x daily",   brands:"Suguna Developer, RCM Developer, Godrej Developer, Venky's Developer",    notes:"Do NOT give layer feed yet — high calcium damages kidneys." },
  { minDay:121, maxDay:140, phase:"Pre-Layer",   feedType:"Pre-Layer Mash",               proteinPct:"17–18%", gramsPerBird:[85,87],   waterMl:[450,500],  freq:"2x daily",   brands:"Suguna Pre-Layer, Godrej Pre-Layer, RCM Pre-Layer, Venky's Pullet Feed",  notes:"Start calcium grit now. Set up nest boxes before Day 130." },
  { minDay:141, maxDay:999, phase:"Layer",       feedType:"Layer Mash / Pellets",         proteinPct:"16–17%", gramsPerBird:[110,120], waterMl:[500,1000], freq:"2x daily",   brands:"Suguna Layer, Kerafed Layer, Venky's Layer, RCM Layer Pellets",           notes:"16 hrs light/day. Calcium grit free access always." },
];

const LIGHT_SCHEDULE = [
  { minDay:1,   maxDay:7,   weekLabel:"Week 1",        totalHours:"24:00", morning:"Continuous light",               evening:"No dark period",                  action:"Keep brooder lights ON continuously for the full first week.", note:"BV380 guide: full light in week 1 helps chicks recover from transport stress and find feed/water quickly." },
  { minDay:8,   maxDay:42,  weekLabel:"Weeks 2–6",     totalHours:"20:00", morning:"Turn ON at 11:30 PM",            evening:"Turn OFF at 7:30 PM",            action:"Give a 4-hour dark period daily from 7:30 PM to 11:30 PM.", note:"Official BV380 rearing guide: 20 hours light, 4 hours darkness." },
  { minDay:43,  maxDay:105, weekLabel:"Weeks 7–15",    totalHours:"14:00", morning:"5:30 AM to sunrise",            evening:"Sunset to 7:30 PM",              action:"Use short artificial light only around natural daylight to keep total light near 14 hours.", note:"This is the BV380 grower programme for open-sided Indian houses." },
  { minDay:106, maxDay:112, weekLabel:"Week 16",       totalHours:"15:00", morning:"4:30 AM to sunrise",            evening:"Sunset to 7:30 PM",              action:"Start photo-stimulation at the beginning of week 16.", note:"BV380 guide says first stimulation must add at least 1 hour." },
  { minDay:113, maxDay:119, weekLabel:"Week 17",       totalHours:"15:30", morning:"4:00 AM to sunrise",            evening:"Sunset to 7:30 PM",              action:"Increase light by another 30 minutes in week 17.", note:"Do not reduce light once you start stimulation." },
  { minDay:120, maxDay:140, weekLabel:"Weeks 18–20",   totalHours:"16:00", morning:"4:00 AM to sunrise",            evening:"Sunset to 8:00 PM",              action:"Maintain full light programme until start of lay.", note:"This is the full BV380 pre-lay schedule for reaching 16 hours total light." },
  { minDay:141, maxDay:999, weekLabel:"Layer Phase",   totalHours:"16:00", morning:"4:00 AM to sunrise",            evening:"Sunset to 8:00 PM",              action:"Keep the same 16-hour lighting consistently during lay.", note:"Never reduce light hours in production." },
];

const VACCINATIONS = [
  {
    day: 1,
    vaccine: "Marek's Disease Vaccine",
    disease: "Marek's Disease",
    method: "Hatchery injection",
    brands: "Given at hatchery — confirm with seller",
    vialSize: "1000-dose vial (hatchery handles this)",
    buyQty: "Done at hatchery — ask seller for proof",
    dosePerBird: "0.2ml per chick (subcutaneous injection)",
    waterRequired: "N/A — injection only",
    prepSteps: [
      "This is done at the hatchery before you receive the chicks.",
      "Ask the seller for vaccination certificate or written confirmation.",
      "Check chicks for any limping or paralysis within 2 weeks — signs vaccine was missed.",
    ],
    servingSteps: [
      "No action needed from you for Day 1 Marek's.",
      "Simply confirm with your chick supplier before buying.",
    ],
    beforeVax: ["Confirm hatchery did it — no home action needed."],
    afterCare: ["Watch for limping or leg weakness in weeks 2–4. Call vet if seen."],
    storage: "Hatchery stored at 2–8°C. Not your concern.",
    color: "#FF8F00",
  },
  {
    day: 45,
    vaccine: "Lasota F-Strain (Newcastle Disease)",
    disease: "Newcastle Disease (Ranikhet)",
    method: "Eye drop OR Drinking water",
    brands: "Nobilis ND Clone 30, Cevac New L (Ceva), Izovac ND (Intas), ICAR-NRC ND F Strain",
    vialSize: "Available in 100-dose, 500-dose, 1000-dose vials",
    buyQty: "For 10 birds: buy 1 × 100-dose vial (use minimum, discard rest within 1 hour)",
    dosePerBird: "Eye drop: 1 drop (0.03ml) per eye per bird. Water: 1 dose per bird in diluted water.",
    waterRequired: "Water method: 1 litre of clean water per 100 birds. For 10 birds = 100ml water.",
    prepSteps: [
      "Withhold water from birds for 2 hours BEFORE vaccination so they are thirsty.",
      "Dissolve vaccine vial contents in cool, clean water. Never use chlorinated tap water — use boiled-cooled or RO water.",
      "Add a pinch of skimmed milk powder (5g per litre) to water — this stabilises the live vaccine.",
      "Mix gently — do NOT shake vigorously.",
      "Use the vaccine solution within 1 hour of mixing. Discard leftover.",
    ],
    servingSteps: [
      "Eye Drop Method (recommended for 10 birds): Hold each bird gently. Using the dropper, place 1 drop in each eye. Wait for the bird to blink and absorb it before releasing.",
      "Water Method: Pour vaccine water into clean drinkers. Ensure all birds drink within 1 hour. Remove drinkers once done.",
      "Do NOT feed or give plain water for 1 hour after water vaccination — let birds only drink vaccine water.",
      "Vaccinate in early morning or evening — never in peak afternoon heat.",
    ],
    beforeVax: [
      "Withhold water 2 hours before.",
      "Clean all drinkers thoroughly — no soap residue or chlorine.",
      "Have the vaccine ready from refrigerator — use within 30 min of taking out.",
      "Do NOT vaccinate sick birds — treat first, vaccinate later.",
    ],
    afterCare: [
      "Birds may show mild sneezing or nasal discharge for 2–3 days — this is normal (live vaccine reaction).",
      "Give Vitamin B-Complex in water next day to reduce stress.",
      "Do NOT use antibiotics for 3 days before or after vaccination.",
      "Record vaccination date in your farm diary.",
    ],
    storage: "Store at 2–8°C (refrigerator). Do NOT freeze. Use within 1 hour of reconstitution.",
    color: "#1565C0",
  },
  {
    day: 60,
    vaccine: "IBD Gumboro Vaccine (Booster)",
    disease: "Infectious Bursal Disease (Gumboro)",
    method: "Drinking water",
    brands: "Nobilis Gumboro D78, Cevac IBD L, TAD IBD Vac, ICAR IBD Vaccine",
    vialSize: "Available in 100-dose, 500-dose, 1000-dose vials",
    buyQty: "For 10 birds: buy 1 × 100-dose vial. Use minimum dose, discard rest within 1 hour.",
    dosePerBird: "1 dose per bird in drinking water. For 10 birds = 10 doses from vial.",
    waterRequired: "1 litre of clean water per 100 birds. For 10 birds = 100ml clean water.",
    prepSteps: [
      "Withhold water from birds for 2–3 hours before vaccination.",
      "Use boiled-cooled or RO water — never chlorinated tap water.",
      "Add 5g skimmed milk powder per litre of water (vaccine stabiliser).",
      "Dissolve the vial contents into the prepared water. Mix gently.",
      "Use within 1 hour of preparation — live vaccine loses potency fast.",
    ],
    servingSteps: [
      "Pour vaccine water into thoroughly cleaned drinkers.",
      "Ensure every bird has access to a drinker — no crowding.",
      "All birds should drink the vaccine water within 1–2 hours.",
      "Remove drinkers once all birds have drunk. Give fresh water after 2 hours.",
      "Shade the drinkers — sunlight destroys live vaccines quickly.",
    ],
    beforeVax: [
      "Withhold water 2–3 hours before.",
      "Clean and rinse all drinkers with plain water (no disinfectant).",
      "Do NOT vaccinate if birds show diarrhoea or are lethargic — treat first.",
      "Check birds are healthy and active before vaccinating.",
    ],
    afterCare: [
      "Give Vitamin B-Complex + Electrolytes in water the next day.",
      "Birds may appear slightly lethargic for 1–2 days — normal reaction.",
      "Avoid any stress (handling, moving) for 2 days after vaccination.",
      "No antibiotics 3 days before or after.",
    ],
    storage: "Store at 2–8°C. Use within 1 hour of mixing. Discard unused portion.",
    color: "#00695C",
  },
  {
    day: 70,
    vaccine: "Lasota Booster (ND Booster)",
    disease: "Newcastle Disease (Ranikhet) — Booster",
    method: "Drinking water",
    brands: "Nobilis ND Clone 30, Cevac New L, Izovac ND — same brand as Day 45",
    vialSize: "100-dose or 500-dose vial",
    buyQty: "For 10 birds: 1 × 100-dose vial. Same as Day 45 purchase.",
    dosePerBird: "1 dose per bird. For 10 birds = 10 doses in 100ml water.",
    waterRequired: "100ml clean water for 10 birds (boiled-cooled or RO).",
    prepSteps: [
      "Same preparation as Day 45 Lasota vaccination.",
      "Withhold water 2 hours before.",
      "Use RO or boiled-cooled water + 5g skimmed milk powder per litre.",
      "Dissolve vial in water. Use within 1 hour.",
    ],
    servingSteps: [
      "Same as Day 45 — drinking water method preferred at this age.",
      "Place vaccine water in clean shaded drinkers.",
      "All birds must drink within 1–2 hours.",
      "Can also do eye drop method (1 drop per eye per bird) if you prefer.",
    ],
    beforeVax: [
      "Withhold water 2 hours before.",
      "Birds should be healthy and active.",
      "Clean drinkers with plain water only.",
    ],
    afterCare: [
      "Mild sneezing for 2–3 days is normal.",
      "Give Vitamin B-Complex next day.",
      "Record in farm diary.",
    ],
    storage: "Store at 2–8°C. Use within 1 hour of opening.",
    color: "#1565C0",
  },
  {
    day: 90,
    vaccine: "Fowl Pox Vaccine",
    disease: "Fowl Pox",
    method: "Wing web stab / prick method",
    brands: "Nobilis Pox, ICAR Fowl Pox Vaccine (Govt.), Cevac POXINE",
    vialSize: "100-dose or 1000-dose vials with bifurcated needle included",
    buyQty: "For 10 birds: 1 × 100-dose vial. The kit includes a bifurcated stabbing needle.",
    dosePerBird: "1 stab in the wing web membrane. No liquid dose — the needle picks up the vaccine by capillary action.",
    waterRequired: "N/A — no water needed. This is a skin-stab method.",
    prepSteps: [
      "Reconstitute the vaccine vial with the diluent provided in the pack (usually 10–20ml).",
      "Dip the bifurcated (forked) needle into the vaccine vial — the fork holds a tiny amount of vaccine.",
      "Do NOT use an injection syringe for this — only the bifurcated needle provided.",
      "Keep the vial on ice during the vaccination session.",
    ],
    servingSteps: [
      "Hold the bird and stretch one wing gently to expose the thin web of skin between wing bones.",
      "The wing web is the thin, featherless triangular skin between the wing joints — do NOT stab the bone or vein.",
      "Stab the bifurcated needle through the wing web in one quick motion.",
      "Do this for each bird. Dip needle back into vaccine between each bird.",
      "After 7–10 days, check the wing web — a small scab or blister should form. This confirms vaccine took.",
      "If no reaction after 10 days, re-vaccinate that bird.",
    ],
    beforeVax: [
      "Do NOT vaccinate birds already showing pox lesions (scabs on face/comb) — isolate them, vaccinate healthy birds only.",
      "Ensure needle is not bent — replace if damaged.",
      "Keep vaccine vial cool throughout the session.",
    ],
    afterCare: [
      "Check wing webs after 7–10 days for scab formation (take reaction).",
      "Small scab = successful vaccination. No scab = redo.",
      "Do NOT apply any antiseptic to the wing web after stabbing.",
      "Mild swelling at stab site is normal for 2–3 days.",
    ],
    storage: "Store at 2–8°C. Use within 2 hours of reconstitution.",
    color: "#6A1B9A",
  },
  {
    day: 120,
    vaccine: "ND R2B / Mukteswar (Newcastle Killed)",
    disease: "Newcastle Disease — Strong Booster before laying",
    method: "Intramuscular injection (IM) — into breast or thigh muscle",
    brands: "Mukteswar ND Vaccine (ICAR Govt.), Nobilis ND Ma5+Clone30, Rajasthan ND R2B",
    vialSize: "50-dose or 100-dose vials. Comes as ready-to-use suspension.",
    buyQty: "For 10 birds: 1 × 50-dose vial. Each dose = 0.5ml. For 10 birds = 5ml total.",
    dosePerBird: "0.5ml per bird — intramuscular injection into breast or thigh muscle.",
    waterRequired: "N/A — injection only. You need: 1ml syringe, 23-gauge needle.",
    prepSteps: [
      "Shake the vial gently before use — the oil-based vaccine separates on standing.",
      "Draw 0.5ml into a clean 1ml syringe fitted with a 23-gauge x 1/2 inch needle.",
      "Keep the vial at room temperature (not cold) — cold oil vaccine causes lumps under skin.",
      "Prepare one syringe per 5–10 birds. Change needle if it becomes blunt.",
    ],
    servingSteps: [
      "Hold bird firmly with helper or restrain between your knees.",
      "Breast muscle injection: Insert needle at 45° angle into the left breast muscle (away from the keel bone). Inject 0.5ml slowly.",
      "Thigh muscle injection (alternative): Insert needle into the outer thigh muscle. Avoid the inner thigh (blood vessels).",
      "Withdraw needle quickly. Gently massage the injection site for 3–5 seconds.",
      "Do NOT inject into the keel bone, neck, or wing — breast or thigh muscle only.",
      "Use a fresh needle if it becomes blunt — a blunt needle causes pain and swelling.",
    ],
    beforeVax: [
      "Collect all 10 birds into a confined space before starting.",
      "Have syringes, needles, and cotton ready.",
      "This is an oil-adjuvant vaccine — reactions (swelling) at site are normal and harmless.",
      "Do NOT vaccinate sick or underweight birds.",
    ],
    afterCare: [
      "Birds may be sore and less active for 1–2 days — completely normal.",
      "A small lump at injection site is normal for oil vaccines — disappears in 1–2 weeks.",
      "Give Vitamin B-Complex + Electrolytes next day.",
      "This is the most important vaccine before egg laying — do NOT skip.",
    ],
    storage: "Store at 2–8°C. Do NOT freeze (oil vaccines break down when frozen). Shake well before use.",
    color: "#B71C1C",
  },
];

const DEWORMING = [
  { day:60,  note:"First deworming",   products:"Piperazine (Pipzine, Piperazine Citrate)" },
  { day:120, note:"Second deworming",  products:"Fenbendazole (Fencare, Panacur Vet)" },
  { day:180, note:"Routine deworming", products:"Levamisole (Levavet) or Wormout Gel" },
];

const WEIGHT_TARGETS = [
  { day:7,   grams:[59,62] },    { day:14,  grams:[117,123] },
  { day:21,  grams:[171,179] },  { day:28,  grams:[239,251] },
  { day:35,  grams:[332,349] },  { day:42,  grams:[429,451] },
  { day:49,  grams:[527,554] },  { day:56,  grams:[614,646] },
  { day:63,  grams:[702,738] },  { day:70,  grams:[790,830] },
  { day:77,  grams:[878,923] },  { day:84,  grams:[975,1025] },
  { day:91,  grams:[1068,1122] },{ day:98,  grams:[1151,1210] },
  { day:105, grams:[1233,1297] },{ day:112, grams:[1316,1384] },
  { day:119, grams:[1389,1461] },{ day:126, grams:[1463,1538] },
];

const FEED_TRANSITIONS = [43, 71, 121, 141];

const BV380_REFERENCE_DOCS = [
  {
    title: "Hot & Tropical Climates Guide",
    type: "PDF",
    note: "Best official fit for South Indian farm conditions including heat, ventilation, water, and light management.",
    url: "https://layinghens.hendrix-genetics.com/documents/2034/Management_Guide_Hot_and_Tropical_Climate_EN_4.pdf",
    source: "Official Hendrix Genetics guide",
  },
  {
    title: "Tropical Rearing Tips",
    type: "PDF",
    note: "Focused practical paper for rearing pullets under hot and tropical conditions.",
    url: "https://layinghens.hendrix-genetics.com/documents/974/Tips_and_Tricks_for_Rearing_Poultry_in_Hot_and_Tropical_Climates_EN.pdf",
    source: "Official Hendrix Genetics paper",
  },
  {
    title: "Optimal Chick Start",
    type: "PDF",
    note: "Direct chick-start guidance for feed, water, density, light, temperature, and humidity during early brooding.",
    url: "https://layinghens.hendrix-genetics.com/documents/2020/HGL_Layer_Vision_29_October_2023_EN.pdf",
    source: "Official Hendrix Genetics paper",
  },
  {
    title: "Nutrition Guide 2025",
    type: "PDF",
    note: "Useful for feed formulation and nutrient targets when adjusting the BV380 feeding programme.",
    url: "https://layinghens.hendrix-genetics.com/documents/2396/Nutrition_Guide_2025_vs2.pdf",
    source: "Official Hendrix Genetics guide",
  },
  {
    title: "Preparing the Long-Life Layer",
    type: "PDF",
    note: "Supporting paper for pullet growth, bodyweight targets, and the transition into lay.",
    url: "https://layinghens.hendrix-genetics.com/documents/1260/Preparing_the_long-life_Layer.pdf",
    source: "Official Hendrix Genetics paper",
  },
];

const BV380_DOC_KNOWLEDGE = [
  {
    id: "doc-hot-climate-water",
    title: "Hot Climate Water Management",
    source: "Hot & Tropical Climates Guide",
    tags: ["heat", "summer", "water", "kerala", "tropical", "drinkers", "electrolytes"],
    text: "In hot and tropical conditions, birds must have cool clean water available at all times. Increase drinker checks during afternoon heat, keep water shaded, and use electrolyte or vitamin support after heat stress. Wet litter, stale water, and poor drinker hygiene quickly worsen disease pressure in humid Kerala-style weather.",
  },
  {
    id: "doc-hot-climate-ventilation",
    title: "Ventilation And Housing",
    source: "Hot & Tropical Climates Guide",
    tags: ["housing", "ventilation", "humidity", "ammonia", "kerala", "rain"],
    text: "Tropical layer housing must prioritize airflow, dry litter, and low ammonia. Open-sided houses need strong cross ventilation, protection from rain splash, and frequent replacement of damp litter patches. Heat and humidity together reduce feed intake and increase stress, so crowding and poor airflow should be avoided.",
  },
  {
    id: "doc-tropical-rearing-chick",
    title: "Chick Brooding In Tropical Conditions",
    source: "Tropical Rearing Tips",
    tags: ["chick", "brooding", "brooder", "temperature", "humidity", "starter"],
    text: "Early chick management in tropical conditions depends on correct brooder temperature, dry bedding, fast access to feed and water, and frequent observation. Chicks that huddle are too cold, chicks far from the heat source may be too hot, and uneven spread suggests setup problems. The first week should focus on stable temperature, hydration, and easy feed access.",
  },
  {
    id: "doc-optimal-chick-start",
    title: "Optimal Chick Start",
    source: "Optimal Chick Start",
    tags: ["chick", "start", "feed", "water", "light", "placement"],
    text: "A strong chick start requires immediate placement with feed and water already ready, bright enough light for chicks to find resources, and close monitoring in the first days. Early intake drives later bodyweight and uniformity. Poor chick start cannot be fully recovered later, so the first days are critical for future laying performance.",
  },
  {
    id: "doc-feed-phases",
    title: "BV380 Feed Phases",
    source: "Embedded Farm Programme",
    tags: ["feed", "phase", "starter", "grower", "pre-layer", "layer"],
    text: "The current BV380 programme in this app uses pre-starter on days 1 to 7, starter through day 42, grower I through day 70, grower II through day 120, pre-layer through day 140, and layer feed from day 141 onward. Feed changes should be gradual across transition weeks to avoid intake drops and gut upset.",
  },
  {
    id: "doc-grower-calcium",
    title: "Do Not Start Layer Feed Too Early",
    source: "Embedded Farm Programme",
    tags: ["calcium", "grower", "pre-layer", "kidney", "layer feed"],
    text: "Developer or grower feed should continue until the pre-layer window because high-calcium layer feed given too early can damage kidneys and reduce long-term pullet development. Pre-layer feed and calcium grit should be introduced close to point of lay, not in mid-grower stage.",
  },
  {
    id: "doc-lighting-to-lay",
    title: "Lighting For Transition To Lay",
    source: "Embedded Farm Programme + Long-Life Layer Paper",
    tags: ["light", "lay", "pre-lay", "photo stimulation", "hours"],
    text: "The flock should remain around 14 hours of light during grower weeks, then be stepped up during weeks 16 to 20 until 16 hours total light is reached before lay. Once production starts, light hours should not be reduced. Sudden drops in light can harm laying consistency.",
  },
  {
    id: "doc-lay-readiness",
    title: "Preparing For Start Of Lay",
    source: "Preparing the Long-Life Layer",
    tags: ["lay", "bodyweight", "uniformity", "nest boxes", "pre-layer"],
    text: "Good lay performance depends on pullets reaching target bodyweight, maintaining uniformity, and moving into lay without stress. Before expected lay, nest boxes, calcium access, and light programme should already be ready. Birds that are underweight or uneven at this stage often show weaker early production.",
  },
  {
    id: "doc-weight-targets",
    title: "Bodyweight Tracking",
    source: "Embedded Farm Programme",
    tags: ["weight", "bodyweight", "uniformity", "growth"],
    text: "The app includes staged BV380 weight targets from week 1 through week 18. Random sample weighing is useful for checking whether the flock is on track. If birds are below expected target ranges, feed quality, intake, water access, and health status should be reviewed early rather than waiting until lay.",
  },
  {
    id: "doc-feed-tomorrow",
    title: "Prepare Feed One Day Early",
    source: "Operational Planning Rule",
    tags: ["tomorrow", "prep", "feed planning", "mixing", "purchase"],
    text: "For farm operations, next-day feed should be prepared or planned one day early, especially near phase changes. When tomorrow starts a new phase, the correct feed bag, mixing ratio, and water plan should be ready today so there is no morning delay.",
  },
  {
    id: "doc-vaccination-practice",
    title: "Vaccination And Stress Control",
    source: "Embedded Farm Programme",
    tags: ["vaccination", "stress", "water", "brooding", "health"],
    text: "Vaccination works best when birds are healthy, hydrated, and not under strong heat stress. Drinkers used for live vaccine should be clean and free from chlorine residues. Avoid unnecessary stress before and after vaccination and follow the age schedule consistently.",
  },
  {
    id: "doc-nutrition",
    title: "Nutrition Priorities",
    source: "Nutrition Guide 2025",
    tags: ["nutrition", "protein", "energy", "amino acids", "layer", "grower"],
    text: "Nutrition should match the flock stage. Starter phases require higher protein support, grower phases focus on controlled development, and pre-layer plus layer phases need balanced calcium, phosphorus, and production nutrients. In hot weather, intake may fall, so feed quality and nutrient density matter more.",
  },
];

function tokenizeForSearch(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function searchDocKnowledge(query, limit = 5) {
  const qTokens = tokenizeForSearch(query);
  if (!qTokens.length) return [];
  return BV380_DOC_KNOWLEDGE.map(chunk => {
    const haystack = `${chunk.title} ${chunk.source} ${chunk.text} ${chunk.tags.join(" ")}`.toLowerCase();
    let score = 0;
    qTokens.forEach(token => {
      if (chunk.tags.some(tag => tag.includes(token))) score += 4;
      if (chunk.title.toLowerCase().includes(token)) score += 3;
      if (chunk.source.toLowerCase().includes(token)) score += 2;
      if (haystack.includes(token)) score += 1;
    });
    return { ...chunk, score };
  })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildLocalDocAnswer(question, sources) {
  if (!sources.length) {
    return "I could not find a matching answer in the built-in BV380 knowledge base.";
  }
  const q = question.toLowerCase();
  const top = sources.slice(0, 3);
  const primary = top[0];

  const extractSentences = text => String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean);

  const firstUsefulSentence = text => extractSentences(text)[0] || String(text || "");

  const classifyQuestion = () => {
    if (/(weight|body ?weight|uniform|growth|track)/.test(q)) return "weight";
    if (/(chick|brood|brooder|first week|placement|start)/.test(q)) return "chick";
    if (/(heat|tropical|summer|humidity|monsoon|ventilation|kerala)/.test(q)) return "climate";
    if (/(lay|egg|pre-?lay|nest|calcium|light)/.test(q)) return "lay";
    if (/(feed|starter|grower|layer feed|pre-layer|nutrition)/.test(q)) return "feed";
    if (/(vaccine|vaccination|stress|disease|health)/.test(q)) return "health";
    return "general";
  };

  const type = classifyQuestion();
  const answerLineByType = {
    weight: "Bodyweight tracking should be used as an early warning tool, not only as a record. The flock should be weighed in random samples and compared against the staged BV380 target ranges so action can be taken before lay.",
    chick: "Early chick management has the biggest long-term effect on later bodyweight and laying performance. Feed, water, temperature, and observation must all be right from the first days.",
    climate: "In Kerala-like tropical conditions, heat, humidity, stale water, and poor airflow are major operational risks. Water management and ventilation should be treated as daily priorities.",
    lay: "As the flock approaches lay, bodyweight, uniformity, calcium access, nest preparation, and the light programme need to be ready together. Weak preparation at this stage usually shows up as weaker early production.",
    feed: "Feed decisions should follow the flock stage closely. Phase changes should be gradual, and feed quality matters more when intake is reduced by heat or stress.",
    health: "Health and stress control work best when birds are hydrated, feed intake is stable, and routine handling is calm. Preventive steps matter more than recovery after stress.",
    general: firstUsefulSentence(primary.text),
  };

  const actionLines = [];
  if (type === "weight") {
    actionLines.push("Weigh a small random sample of birds regularly and compare it with the app's target range.");
    actionLines.push("If birds are below target, review feed intake, water access, feed quality, and health immediately.");
    actionLines.push("Do not wait until laying starts to correct poor growth or poor uniformity.");
  } else if (type === "chick") {
    actionLines.push("Prepare feed and water before chicks are placed.");
    actionLines.push("Watch chick spread under the brooder to judge temperature and comfort.");
    actionLines.push("Treat the first week as critical because weak intake early is hard to recover later.");
  } else if (type === "climate") {
    actionLines.push("Check drinkers more often in afternoon heat and keep water cool and clean.");
    actionLines.push("Keep airflow strong, reduce damp litter, and prevent ammonia buildup.");
    actionLines.push("Treat humidity plus heat as a combined risk, especially during monsoon or hot summer days.");
  } else if (type === "lay") {
    actionLines.push("Before expected lay, confirm target bodyweight, nest readiness, calcium access, and light schedule.");
    actionLines.push("Avoid reducing light hours once production is approaching or active.");
    actionLines.push("Underweight or uneven pullets should be corrected before lay rather than after production starts.");
  } else if (type === "feed") {
    actionLines.push("Use the flock stage to decide whether starter, grower, pre-layer, or layer feed is appropriate.");
    actionLines.push("Handle feed transitions gradually to avoid intake drops or gut upset.");
    actionLines.push("Do not start high-calcium layer feed too early in grower birds.");
  } else if (type === "health") {
    actionLines.push("Keep birds hydrated and calm before any vaccination or stressful handling.");
    actionLines.push("Use clean water systems and avoid avoidable heat stress around health events.");
    actionLines.push("Follow the age schedule consistently and intervene early when birds are off feed or weak.");
  } else {
    top.forEach(source => actionLines.push(firstUsefulSentence(source.text)));
  }

  const whyLines = top.map((source, idx) => `[${idx + 1}] ${firstUsefulSentence(source.text)}`);
  const sourceLine = `Sources used: ${top.map((source, idx) => `[${idx + 1}] ${source.title}`).join(", ")}`;

  return [
    `Answer`,
    answerLineByType[type],
    ``,
    `What To Do`,
    ...actionLines.map(line => `- ${line}`),
    ``,
    `Why`,
    ...whyLines.map(line => `- ${line}`),
    ``,
    sourceLine,
  ].join("\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFeed(day) {
  return FEED_SCHEDULE.find(f => day >= f.minDay && day <= f.maxDay) || FEED_SCHEDULE[FEED_SCHEDULE.length - 1];
}
function getLightPlan(day) {
  return LIGHT_SCHEDULE.find(l => day >= l.minDay && day <= l.maxDay) || LIGHT_SCHEDULE[LIGHT_SCHEDULE.length - 1];
}
function getPrevFeed(day) {
  const t = FEED_TRANSITIONS.find(td => day >= td && day <= td + 6);
  if (!t) return null;
  return FEED_SCHEDULE.find(f => (t-1) >= f.minDay && (t-1) <= f.maxDay);
}
function midpoint(range) {
  return Math.round((range[0] + range[1]) / 2);
}
function getWeightTarget(day) {
  if (!WEIGHT_TARGETS.length) return null;
  if (day <= WEIGHT_TARGETS[0].day) return WEIGHT_TARGETS[0].grams;
  const last = WEIGHT_TARGETS[WEIGHT_TARGETS.length - 1];
  if (day >= last.day) return last.grams;
  for (let i = 1; i < WEIGHT_TARGETS.length; i += 1) {
    const prev = WEIGHT_TARGETS[i - 1];
    const next = WEIGHT_TARGETS[i];
    if (day === next.day) return next.grams;
    if (day > prev.day && day < next.day) {
      const ratio = (day - prev.day) / (next.day - prev.day);
      return [
        Math.round(prev.grams[0] + (next.grams[0] - prev.grams[0]) * ratio),
        Math.round(prev.grams[1] + (next.grams[1] - prev.grams[1]) * ratio),
      ];
    }
  }
  return last.grams;
}
function formatWeightRange(range) {
  return range ? `${range[0]}–${range[1]}g` : "N/A";
}
function isTransitionWeek(day) { return FEED_TRANSITIONS.some(t => day >= t && day <= t+6); }
function transitionRatio(day) {
  const t = FEED_TRANSITIONS.find(td => day >= td && day <= td+6);
  if (!t) return null;
  const d = day - t;
  if (d <= 1) return "75% old + 25% new";
  if (d <= 3) return "50% old + 50% new";
  if (d <= 5) return "25% old + 75% new";
  return "100% new feed";
}

function getSessions(dayAge, totalG) {
  if (dayAge <= 7) {
    const s = Math.round(totalG / 5);
    return [
      { time:"Morning",        icon:"🌅", label:"1st feed (6:00 AM)",  grams:s },
      { time:"Mid-Morning",    icon:"🌤️", label:"2nd feed (9:00 AM)",  grams:s },
      { time:"Afternoon",      icon:"☀️", label:"3rd feed (12:00 PM)", grams:s },
      { time:"Late-Afternoon", icon:"🌇", label:"4th feed (3:00 PM)",  grams:s },
      { time:"Evening",        icon:"🌆", label:"5th feed (6:00 PM)",  grams:totalG - s*4 },
    ];
  }
  if (dayAge <= 21) {
    const s = Math.round(totalG / 4);
    return [
      { time:"Morning",     icon:"🌅", label:"1st feed (6:30 AM)",  grams:s },
      { time:"Mid-Morning", icon:"🌤️", label:"2nd feed (10:00 AM)", grams:s },
      { time:"Afternoon",   icon:"☀️", label:"3rd feed (2:00 PM)",  grams:s },
      { time:"Evening",     icon:"🌆", label:"4th feed (6:00 PM)",  grams:totalG - s*3 },
    ];
  }
  if (dayAge <= 42) {
    const s = Math.round(totalG / 3);
    return [
      { time:"Morning",   icon:"🌅", label:"1st feed (7:00 AM)",  grams:s },
      { time:"Afternoon", icon:"☀️", label:"2nd feed (12:30 PM)", grams:s },
      { time:"Evening",   icon:"🌆", label:"3rd feed (5:30 PM)",  grams:totalG - s*2 },
    ];
  }
  return [
    { time:"Morning", icon:"🌅", label:"Morning feed (7:00 AM)", grams:Math.round(totalG * 0.6) },
    { time:"Evening", icon:"🌆", label:"Evening feed (4:30 PM)", grams:Math.round(totalG * 0.4) },
  ];
}

function buildTasks(dayAge, numBirds) {
  const feed    = getFeed(dayAge);
  const lightPlan = getLightPlan(dayAge);
  const totalG  = Math.round(((feed.gramsPerBird[0]+feed.gramsPerBird[1])/2)*numBirds);
  const totalWL = Math.round(((feed.waterMl[0]+feed.waterMl[1])/2)*numBirds/1000*10)/10;
  const sessions = getSessions(dayAge, totalG);
  const pb      = n => Math.round(n/numBirds);
  const isTrans = isTransitionWeek(dayAge);
  const tRatio  = transitionRatio(dayAge);
  const prevF   = getPrevFeed(dayAge);
  const tasks   = [];

  if (dayAge <= 7) {
    tasks.push({
      time: "Pre-Dawn",
      icon: "💡",
      priority: "high",
      task: "Keep brooder light ON for full 24 hours",
      detail: `${lightPlan.weekLabel} · ${lightPlan.totalHours} total light. ${lightPlan.note}`,
    });
  } else if (dayAge <= 42) {
    tasks.push({
      time: "Pre-Dawn",
      icon: "💡",
      priority: "medium",
      task: "Turn ON brooder lights at 11:30 PM",
      detail: `${lightPlan.weekLabel} · ${lightPlan.totalHours} total light. Keep chicks in darkness only from 7:30 PM to 11:30 PM.`,
    });
  } else if (dayAge >= 43) {
    tasks.push({
      time: "Pre-Dawn",
      icon: "💡",
      priority: dayAge >= 120 ? "high" : "medium",
      task: `Morning light: ${lightPlan.morning}`,
      detail: `${lightPlan.weekLabel} · ${lightPlan.totalHours} total light. ${lightPlan.note}`,
    });
  }

  // MORNING
  const ms = sessions[0];
  tasks.push({ time:"Morning", icon:"🌅", priority:"high",   task:"Refill & clean all drinkers" });
  tasks.push({ time:"Morning", icon:"🌾", priority:"high",   task:`${ms.label} — ${ms.grams}g total (${pb(ms.grams)}g/bird)`, detail:`${feed.feedType} | ${feed.freq} | Brands: ${feed.brands}` });
  if (isTrans && prevF)
    tasks.push({ time:"Morning", icon:"🔄", priority:"urgent", task:`FEED TRANSITION WEEK — Mix: ${tRatio}`, detail:`Switching: ${prevF.feedType} → ${feed.feedType}` });
  tasks.push({ time:"Morning", icon:"👁️", priority:"medium", task:"Health check — observe each bird for 5 min", detail:"Watch: droopy posture, ruffled feathers, pale comb, green/bloody droppings = call vet" });
  tasks.push({ time:"Morning", icon:"💧", priority:"high",   task:`Provide ${totalWL}L total water for ${numBirds} birds` });
  if (dayAge === 1)
    tasks.push({ time:"Morning", icon:"⭐", priority:"urgent", task:"Day 1 — Add glucose to water: 5g per litre", detail:"Dip each chick's beak in water gently to teach drinking" });
  if (dayAge % 7 === 0)
    tasks.push({ time:"Morning", icon:"💊", priority:"medium", task:"Weekly: Add Vitamin AD3E to drinking water", detail:"1ml/litre. Brands: Vimeral (Virbac), Adrovet, Vitablend AD3E" });
  if (dayAge % 14 === 0)
    tasks.push({ time:"Morning", icon:"💊", priority:"medium", task:"Bi-weekly: Add Liver Tonic (Sorbitol) to water", detail:"Brands: Hepasule (Virbac), Sorbitol Plus, Livfit Vet" });
  if (dayAge % 7 === 2 || dayAge % 7 === 5)
    tasks.push({ time:"Morning", icon:"🦠", priority:"low",    task:"Probiotic day — mix in morning feed", detail:"Brands: Probitek (Kemin), Gutpro, Protexin Poultry" });
  const vax = VACCINATIONS.find(v => v.day === dayAge);
  if (vax)
    tasks.push({ time:"Morning", icon:"💉", priority:"urgent", task:`VACCINATION TODAY: ${vax.vaccine}`, detail:`Disease: ${vax.disease} | Method: ${vax.method} | Buy: ${vax.buyQty} | Dose: ${vax.dosePerBird} — Go to Schedule tab for full prep guide` });
  const dew = DEWORMING.find(d => d.day === dayAge);
  if (dew)
    tasks.push({ time:"Morning", icon:"🩺", priority:"urgent", task:`DEWORMING TODAY: ${dew.note}`, detail:`Products: ${dew.products}` });
  const wt = WEIGHT_TARGETS.find(w => w.day === dayAge);
  if (wt)
    tasks.push({ time:"Morning", icon:"⚖️", priority:"medium", task:"Weight check day! Weigh 5 random birds", detail:`Target: ${wt.grams[0]}–${wt.grams[1]}g. Below target = increase feed 10g/bird/day.` });
  if (dayAge % 3 === 0)
    tasks.push({ time:"Morning", icon:"🪹", priority:"medium", task:"Check litter — replace wet/damp patches", detail:"Kerala humidity: wet litter = ammonia = respiratory disease." });
  if (dayAge >= 130)
    tasks.push({ time:"Morning", icon:"🥚", priority:"high",   task:"Collect eggs (morning round)", detail:"Note count in farm diary." });

  // MID-MORNING (Day 1–21)
  if (dayAge <= 21 && sessions.length >= 4) {
    const s = sessions[1];
    tasks.push({ time:"Mid-Morning", icon:s.icon, priority:"high",   task:`${s.label} — ${s.grams}g total (${pb(s.grams)}g/bird)`, detail:"Refill feeders. Observe birds while feeding." });
    tasks.push({ time:"Mid-Morning", icon:"💧",   priority:"medium", task:"Check & top up water — never let it run out" });
  }

  // AFTERNOON (Day 1–42)
  if (dayAge <= 42) {
    const afIdx = dayAge <= 21 ? 2 : 1;
    const afs = sessions[afIdx];
    if (afs) {
      tasks.push({ time:"Afternoon", icon:afs.icon, priority:"high",   task:`${afs.label} — ${afs.grams}g total (${pb(afs.grams)}g/bird)`, detail:"Small frequent meals critical at this age. Remove uneaten feed after 20 min." });
      tasks.push({ time:"Afternoon", icon:"💧",     priority:"high",   task:"Refill all drinkers — fresh water every time", detail:"Kerala afternoon heat: chicks dehydrate fast. Fresh water at every feed." });
      tasks.push({ time:"Afternoon", icon:"👁️",     priority:"medium", task:"Quick health scan — look for lethargic or hunched birds" });
    }
  }

  // LATE-AFTERNOON (Day 1–7 only)
  if (dayAge <= 7 && sessions.length === 5) {
    const s = sessions[3];
    tasks.push({ time:"Late-Afternoon", icon:s.icon, priority:"high",   task:`${s.label} — ${s.grams}g total (${pb(s.grams)}g/bird)`, detail:"Very young chicks need feeds every 3 hrs. Never let feeders stay empty." });
    tasks.push({ time:"Late-Afternoon", icon:"🌡️",   priority:"high",   task:"Check brooder temperature", detail:`Day ${dayAge} target: 32–35°C. Spread evenly = perfect. Huddling = too cold.` });
  }

  // EVENING
  const ls = sessions[sessions.length - 1];
  tasks.push({ time:"Evening", icon:"🌆", priority:"high",   task:`${ls.label} — ${ls.grams}g total (${pb(ls.grams)}g/bird)`, detail:dayAge <= 42 ? "Last feed. Remove uneaten feed after 30 min — prevents mould." : "Evening feed. Remove leftover before next morning." });
  tasks.push({ time:"Evening", icon:"💧", priority:"high",   task:"Refill water for overnight" });
  if (dayAge >= 130)
    tasks.push({ time:"Evening", icon:"🥚", priority:"high",   task:"Collect eggs (evening round)", detail:"Collect twice daily — reduces breakage and egg-eating habit." });
  if (dayAge <= 42) {
    tasks.push({
      time: "Evening",
      icon: "🔌",
      priority: "medium",
      task: "Turn OFF brooder lights at 7:30 PM",
      detail: `${lightPlan.weekLabel} dark period starts now and ends at 11:30 PM.`,
    });
  }
  if (dayAge >= 43) {
    tasks.push({
      time: "Evening",
      icon: "💡",
      priority: dayAge >= 120 ? "high" : "medium",
      task: `Evening light: ${lightPlan.evening}`,
      detail: `${lightPlan.action} Use a timer switch so the total light stays consistent every day.`,
    });
  }
  if (dayAge <= 7)
    tasks.push({ time:"Evening", icon:"🌡️", priority:"high",   task:"Check brooder heat before night", detail:"Chicks cannot regulate temperature at night." });
  tasks.push({ time:"Evening", icon:"📓", priority:"low",    task:"Update farm diary — feed used, water, any observations" });
  tasks.push({ time:"Evening", icon:"🔒", priority:"medium", task:"Secure shed — close vents against predators & rain" });

  return tasks;
}

function buildTelegram(dayAge, numBirds, tasks, feed) {
  const totalG  = Math.round(((feed.gramsPerBird[0]+feed.gramsPerBird[1])/2)*numBirds);
  const totalWL = Math.round(((feed.waterMl[0]+feed.waterMl[1])/2)*numBirds/1000*10)/10;
  const sessions = getSessions(dayAge, totalG);
  const urgent  = tasks.filter(t => t.priority === "urgent");
  const daysToLay = Math.max(0, 141 - dayAge);
  const expectedLayDate = addCalendarDays(new Date(), 141 - dayAge);
  const tomorrow = getDayFeedSnapshot(dayAge + 1, numBirds);
  let m = `🐔 *BV-380 Daily Farm Update*\n`;
  m += `📅 Day ${dayAge} | Phase: *${feed.phase}*\n`;
  m += `🌾 *${feed.feedType}* | ${feed.freq}\n`;
  m += `📦 Total Feed: *${totalG}g* in *${sessions.length} sessions*\n`;
  m += `💧 Total Water: *${totalWL}L*\n\n`;
  m += dayAge >= 141
    ? `🥚 *Lay status:* Active since *${formatLongDate(expectedLayDate)}*\n`
    : `🥚 *Expected lay date:* *${formatLongDate(expectedLayDate)}* (in ${daysToLay} days)\n`;
  m += `📦 *Tomorrow prep:* ${tomorrow.feed.feedType} · ${tomorrow.totalG}g · ${tomorrow.totalWL}L water\n\n`;
  m += `🍽️ *FEED SESSIONS:*\n`;
  sessions.forEach(s => { m += `• ${s.icon} ${s.label}: *${s.grams}g* (${Math.round(s.grams/numBirds)}g/bird)\n`; });
  if (urgent.length) { m += `\n🚨 *URGENT TODAY:*\n`; urgent.forEach(t => { m += `• ${t.icon} ${t.task}\n`; }); }
  [["🌙 PRE-DAWN (5:00 AM)","Pre-Dawn"],["🌅 MORNING","Morning"],["🌤️ MID-MORNING","Mid-Morning"],["☀️ AFTERNOON","Afternoon"],["🌇 LATE-AFTERNOON","Late-Afternoon"],["🌆 EVENING","Evening"]].forEach(([label, time]) => {
    const list = tasks.filter(t => t.time === time && t.priority !== "urgent");
    if (list.length) { m += `\n${label}:\n`; list.forEach(t => { m += `• ${t.icon} ${t.task}\n`; }); }
  });
  const nv = VACCINATIONS.find(v => v.day > dayAge);
  if (nv) m += `\n💉 Next vax: Day ${nv.day} — ${nv.vaccine} (in ${nv.day-dayAge} days)`;
  m += `\n\n_Kerala Clyde's BV380 Farm Manager 🌴_`;
  return m;
}

function phaseColor(phase) {
  return { "Pre-Starter":"#FF8F00","Starter":"#F4511E","Grower I":"#43A047","Grower II":"#00897B","Pre-Layer":"#1E88E5","Layer":"#6A1B9A" }[phase] || "#E87722";
}

const DAY_MS = 86400000;

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day), 12);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateInputValue(value = new Date()) {
  const date = parseDateValue(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(value) {
  const date = parseDateValue(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffCalendarDays(later, earlier) {
  const left = startOfLocalDay(later);
  const right = startOfLocalDay(earlier);
  if (!left || !right) return 0;
  return Math.floor((left - right) / DAY_MS);
}

function formatShortDate(value, locale = "en-IN") {
  const date = parseDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function formatLongDate(value, locale = "en-IN") {
  const date = parseDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function addCalendarDays(value, days) {
  const date = startOfLocalDay(value);
  if (!date) return null;
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const SHARED_DATA_KEY = "bv380_shared_data";
const SESSION_KEY = "bv380_session";
const DEFAULT_SETTINGS = {
  numBirds:10,
  chickenAge:25,
  botToken:"",
  chatId:"",
  notifyTime:"08:00",
  setupDone:false,
  startDate:null,
};
const DEFAULT_TEMP = {
  numBirds:10,
  chickenAge:25,
  botToken:"",
  chatId:"",
  notifyTime:"08:00",
};
const AUTH_USERS = {
  admin123: { username: "admin123", password: "admin123", role: "admin", label: "Admin" },
  guest: { username: "guest", password: "guest123", role: "guest", label: "Guest" },
};

function normalizeCage(raw, index) {
  return {
    id: (raw && raw.id) || `cage_${index + 1}`,
    chicks: Math.max(0, Math.round(Number(raw?.chicks) || 0)),
    age: Math.max(0, Math.round(Number(raw?.age) || 0)),
    ageAsOf: typeof raw?.ageAsOf === "string" && raw.ageAsOf ? raw.ageAsOf : toDateInputValue(),
  };
}

function normalizeSharedData(raw) {
  return {
    settings: { ...DEFAULT_SETTINGS, ...(raw?.settings || {}) },
    feedLogs: Array.isArray(raw?.feedLogs) ? raw.feedLogs : [],
    buyAlertDismissed: raw?.buyAlertDismissed && typeof raw.buyAlertDismissed === "object" ? raw.buyAlertDismissed : {},
    finance: Array.isArray(raw?.finance) ? raw.finance : [],
    cages: Array.isArray(raw?.cages) ? raw.cages.map(normalizeCage) : [],
  };
}

function loadSharedData(read) {
  const shared = read(SHARED_DATA_KEY);
  if (shared) return normalizeSharedData(shared);
  return normalizeSharedData({
    settings: read("bv380_settings") || DEFAULT_SETTINGS,
    feedLogs: read("bv380_feedlogs") || [],
    buyAlertDismissed: read("bv380_buyalerts") || {},
    finance: read("bv380_finance") || [],
    cages: read("bv380_cages") || [],
  });
}

// ─── Feed Store Helpers ───────────────────────────────────────────────────────

// Kerala market price estimates per kg (INR) — user can override
const FEED_PRICE_ESTIMATES = {
  "Pre-Starter": 52,
  "Starter":     46,
  "Grower I":    40,
  "Grower II":   38,
  "Pre-Layer":   42,
  "Layer":       36,
};

// How many days left in current phase from a given day
function daysLeftInPhase(day) {
  const f = getFeed(day);
  return Math.max(0, f.maxDay - day);
}

// Get daily feed consumption in kg for a given day + bird count
function dailyFeedKg(day, numBirds) {
  const f = getFeed(day);
  const avgG = (f.gramsPerBird[0] + f.gramsPerBird[1]) / 2;
  return (avgG * numBirds) / 1000;
}

function totalFeedKgForDayRange(fromDay, toDay, numBirds) {
  if (toDay < fromDay) return 0;
  let total = 0;
  for (let day = fromDay; day <= toDay; day += 1) {
    total += dailyFeedKg(day, numBirds);
  }
  return total;
}

function getDayFeedSnapshot(day, numBirds) {
  const feed = getFeed(day);
  const totalG = Math.round(((feed.gramsPerBird[0] + feed.gramsPerBird[1]) / 2) * numBirds);
  const totalWL = Math.round(((feed.waterMl[0] + feed.waterMl[1]) / 2) * numBirds / 1000 * 10) / 10;
  const sessions = getSessions(day, totalG);
  return { day, feed, totalG, totalWL, sessions };
}

// Build a phase-by-phase feed plan from current day
function buildFeedPlan(fromDay, numBirds, daysAhead = 60) {
  const plan = [];
  let d = fromDay;
  const endDay = fromDay + daysAhead;
  while (d <= endDay) {
    const f = getFeed(d);
    const phaseEnd = Math.min(f.maxDay === 999 ? endDay : f.maxDay, endDay);
    const phaseDays = phaseEnd - d + 1;
    const totalKg = totalFeedKgForDayRange(d, phaseEnd, numBirds);
    const dailyKg = phaseDays > 0 ? totalKg / phaseDays : 0;
    const pricePerKg = FEED_PRICE_ESTIMATES[f.phase] || 40;
    // Recommend buying in practical bag sizes (25kg or 50kg bags)
    const bagSize = 25;
    const bagsNeeded = Math.ceil(totalKg / bagSize);
    const smartKg = bagsNeeded * bagSize; // round up to bag size
    plan.push({
      phase: f.phase,
      feedType: f.feedType,
      fromDay: d,
      toDay: phaseEnd,
      phaseDays,
      dailyKg: Math.round(dailyKg * 100) / 100,
      totalKg: Math.round(totalKg * 10) / 10,
      smartKg,
      bagsNeeded,
      bagSize,
      pricePerKg,
      estimatedCost: Math.round(smartKg * pricePerKg),
      phaseTransitionDay: f.maxDay < 999 ? f.maxDay + 1 : null,
      warning: f.maxDay < 999 && (f.maxDay - d) <= 10 ? `⚠️ Feed changes to ${getFeed(f.maxDay+1).feedType} on Day ${f.maxDay+1} — buy only what you need for ${phaseDays} days` : null,
    });
    d = phaseEnd + 1;
    if (d > endDay) break;
  }
  return plan;
}

// Calculate remaining stock from logs for current phase
function calcRemainingStock(feedLogs, currentDay, numBirds) {
  const currentFeed = getFeed(currentDay);
  // Only sum logs for the current phase
  const relevantLogs = feedLogs.filter(l => l.phase === currentFeed.phase && !l.dismissed);
  const totalBought = relevantLogs.reduce((s, l) => s + (l.kg || 0), 0);
  const dailyKg = dailyFeedKg(currentDay, numBirds);
  // Estimate how much consumed since purchase
  const consumed = relevantLogs.reduce((s, l) => {
    const daysSince = Math.max(0, diffCalendarDays(new Date(), l.date));
    if (daysSince <= 0) return s;
    const purchaseDayAge = Math.max(1, currentDay - daysSince);
    const consumedKg = totalFeedKgForDayRange(purchaseDayAge, currentDay - 1, numBirds);
    return s + Math.min(l.kg, consumedKg);
  }, 0);
  const remaining = Math.max(0, totalBought - consumed);
  const daysRemaining = dailyKg > 0 ? Math.floor(remaining / dailyKg) : 0;
  return { totalBought, consumed: Math.round(consumed * 10) / 10, remaining: Math.round(remaining * 10) / 10, daysRemaining, dailyKg };
}


// ═══════════════════════════════════════════════════════════════════════════
// 🩺  HEALTH DATA
// ═══════════════════════════════════════════════════════════════════════════
const DISEASES = [
  {
    id:"crd", name:"CRD / Mycoplasma", icon:"😮‍💨", color:"#90CAF9",
    symptoms:["Nasal discharge / mucus from nostrils","Wheezing, rattling, gurgling sounds when breathing","Swollen face or eyes (sinusitis)","Reduced feed intake, dull and lethargic","Coughing, sneezing continuously","Drop in egg production"],
    causes:"Mycoplasma gallisepticum bacteria. Spreads via contaminated air, water, equipment. Stress, overcrowding, poor ventilation trigger outbreaks.",
    treatment:["Tylosin (Tylan) in water: 500mg/litre for 5 days — most effective for Mycoplasma","Enrofloxacin (Baytril) 10mg/kg body weight for 5 days — broad spectrum","Doxycycline (available as Doxyvet) in water for 5–7 days","Add electrolyte + vitamin C supplement to boost immunity","Isolate sick birds immediately","Improve ventilation — remove ammonia buildup"],
    prevention:["Vaccinate with MG bacterin if available","Never mix birds of different ages","Disinfect drinkers daily with potassium permanganate","Keep litter dry — wet litter causes respiratory infections"],
    medicines:["Tylosin (Tylan Soluble) — veterinary pharmacies","Enrofloxacin (Baytril/Quintas) — prescription needed","Doxycycline (Doxyvet, Dox-O-Sol)","Vitamin C + Electrolyte powder (Rehydion, Electral-Vet)"],
    severity:"medium", vetNeeded:false,
    note:"Most common disease in Kerala backyard flocks. Stress after rains triggers outbreaks. Keep coop dry."
  },
  {
    id:"ranikhet", name:"Ranikhet / Newcastle Disease (ND)", icon:"⚠️", color:"#EF9A9A",
    symptoms:["Sudden deaths — multiple birds in 1–2 days","Twisting of neck, walking in circles (nervous form)","Greenish watery diarrhoea","Gasping for breath, gurgling","Swollen eyes and face","Complete stop in egg laying","Blue or purple discoloration of comb"],
    causes:"Newcastle Disease Virus (NDV). Highly contagious. Spreads through droppings, contaminated water, wild birds, clothing of visitors. Mortality up to 100% in unvaccinated flocks.",
    treatment:["NO CURE — prevention by vaccination is the only solution","Supportive care: electrolytes + vitamins in water","Isolate and cull severely affected birds to stop spread","Antibiotic (Amoxicillin) to prevent secondary bacterial infections","Notify nearby poultry farmers immediately","Disinfect entire coop with Virkon S or bleach solution"],
    prevention:["Day 5–7: Lasota F strain vaccine (eye drops) ✅ Already in your schedule","Day 70: Lasota booster ✅ Already in your schedule","Day 120: R2B/Mukteswar ✅ Already in your schedule","Never allow visitors into coop without foot dip","Burn/bury all dead birds — do NOT throw in open"],
    medicines:["No antiviral medicine available — vaccination is only protection","Amoxicillin (Amoxysol) for secondary infection prevention","Electral-Vet or ORS + glucose for supportive care","Virkon S disinfectant for coop"],
    severity:"critical", vetNeeded:true,
    note:"Most dangerous disease for Kerala poultry. Your vaccination schedule already covers this. Stay on schedule!"
  },
  {
    id:"gumboro", name:"Gumboro / IBD (Infectious Bursal Disease)", icon:"🫁", color:"#CE93D8",
    symptoms:["Watery white or yellowish diarrhoea","Birds look depressed, sitting hunched","Ruffled feathers, shivering","Loss of appetite suddenly","Picking at their own vent area","Increased mortality at 3–6 weeks age","Birds look 'sleepy' with eyes half closed"],
    causes:"IBD virus attacks the Bursa of Fabricius (immune organ). Most dangerous at 3–6 weeks age. Spreads through contaminated litter, droppings, water, feed equipment.",
    treatment:["No specific antiviral cure","Vitamin + electrolyte supplementation immediately","Glucose 5g per litre of water for energy","Vitamin AD3E supplement to boost recovery","Anti-stress supplement (B-complex)","Remove wet litter, keep coop clean and dry","Mild cases recover in 1 week with good supportive care"],
    prevention:["Day 10–14: IBD vaccine ✅ Already in your schedule","Day 24–28: IBD booster ✅ Already in your schedule","Strict biosecurity at 3–6 week age","Thorough cleaning and disinfection between batches"],
    medicines:["No specific medicine","Vita Plus or Aminovit (Vitamin + Amino acid supplement)","Glucose powder (Glucolin or plain sugar as emergency)","AD3E vitamin supplement","Electral-Vet for rehydration"],
    severity:"high", vetNeeded:false,
    note:"Covered by your Day 10 & Day 24 vaccination. Main risk is in chicks 3–6 weeks. After vaccination window passes, risk drops significantly."
  },
  {
    id:"coccidiosis", name:"Coccidiosis", icon:"🔴", color:"#FF8A65",
    symptoms:["Bloody or dark reddish-brown droppings","Pale comb and wattles (anaemia)","Diarrhoea, watery stools","Birds sitting in corners, hunched","Loss of appetite, severe weight loss","Ruffled feathers, drooping wings","Sudden death in young birds (3–8 weeks)"],
    causes:"Eimeria protozoan parasite. Lives in wet, dirty litter. Young birds (2–8 weeks) most vulnerable. Warm humid Kerala climate accelerates spread. Overcrowding worsens it.",
    treatment:["Amprolium (Coxistac/Ampro) in water for 5–7 days — first choice","Sulpha-TMP (Sulphadimethoxine + TMP) in water for 5 days","Toltrazuril (Baycox) — single dose, highly effective","After treatment: give Vitamin K for 3 days to stop bleeding","Give ADE vitamins for recovery","Remove and replace wet litter immediately"],
    prevention:["Keep litter DRY — the single most important prevention","Raise feed and water containers to reduce contamination","Gradual exposure to litter at young age builds immunity","Amprolium can be used preventively in high-risk periods","Allow dust bathing — natural behaviour reduces stress"],
    medicines:["Amprolium 20% (Coxistac, Amprovine) — water soluble","Sulphadimethoxine (Sulfadim) — water soluble","Toltrazuril (Baycox 2.5%) — most effective, single dose","Vitamin K injection or powder (AquaMephyton, Koagulant-K)","Vitamin ADE supplement after recovery"],
    severity:"high", vetNeeded:false,
    note:"Most common killer of chicks aged 2–8 weeks in Kerala. Wet litter = coccidiosis. Check litter every day. Dry litter = healthy birds."
  },
  {
    id:"fowlpox", name:"Fowl Pox", icon:"🔵", color:"#80DEEA",
    symptoms:["Wart-like scabs/bumps on comb, wattles, face, eyelids","Yellow sores inside the mouth or throat (wet pox)","Difficulty eating or swallowing","Eyes partially closed due to swelling","Reduced egg production","Weight loss and lethargy","Slow spreading — takes weeks to go through flock"],
    causes:"Fowl pox virus. Two forms: Dry pox (skin) and Wet pox (inside throat — more dangerous). Spreads through biting insects (mosquitoes) and direct contact with infected birds.",
    treatment:["No specific antiviral treatment","Apply iodine or betadine gently on skin lesions","For wet pox: carefully remove lesions from mouth with forceps, apply iodine","Antibiotic to prevent secondary infection (Oxytetracycline)","Vitamin A supplement — essential for healing mouth/eye lesions","Soft feed or mash if bird has difficulty swallowing","Isolate affected birds"],
    prevention:["Day 90: Fowl Pox vaccine (wing web stab) ✅ Already in your schedule","Control mosquitoes — use coil/net at night","Screen coop openings to prevent insect entry","Good overall management and nutrition"],
    medicines:["Betadine/Povidone iodine (topical on lesions)","Oxytetracycline (Terramycin, Oxybold) for secondary infections","Vitamin A supplement (Rovimix A)","ADE injection for severe cases (veterinarian)"],
    severity:"medium", vetNeeded:false,
    note:"Covered by your Day 90 vaccine. If pox appears despite vaccination, check if vaccine was stored correctly (must be cold chain)."
  },
  {
    id:"cholera", name:"Fowl Cholera", icon:"💛", color:"#FFF176",
    symptoms:["Sudden unexpected deaths (acute form)","Yellowish or greenish diarrhoea","Rapid breathing, open-beak breathing","Blue-purple discoloration of comb","Swollen joints (chronic form)","Swollen wattles, hot and painful","Mucus discharge from nose and mouth"],
    causes:"Pasteurella multocida bacteria. Spreads through contaminated water, soil, wild birds, rodents. Stress, wet conditions, and poor sanitation are risk factors.",
    treatment:["Sulpha drugs + TMP combination in water for 5–7 days","Enrofloxacin (10mg/kg) for 5 days — highly effective","Ampicillin injection for severe acute cases (vet)","Remove and safely dispose of dead birds immediately","Disinfect water containers and coop with Virkon S","Improve drainage around coop area"],
    prevention:["Keep rodents away from coop — they are major carriers","Good drainage — standing water near coop is a risk","Killed bacterin vaccine available — consult local vet","Do not bring new birds without quarantine period of 10 days"],
    medicines:["Sulpha-TMP (Sulfatrim, Trimetho-Sulpha) in water","Enrofloxacin (Enrox, Baytril) in water","Ampicillin injection — veterinarian only","Virkon S disinfectant for environment"],
    severity:"high", vetNeeded:true,
    note:"More common in wet Kerala conditions. Check drainage around coop. Dead birds must be buried 2 feet deep or burned — never left in open."
  },
  {
    id:"worms", name:"Internal Worms / Parasites", icon:"🪱", color:"#A5D6A7",
    symptoms:["Gradual weight loss despite eating well","Pale comb (anaemia from blood-sucking worms)","Watery diarrhoea","Reduced egg production in layers","Worms visible in droppings (roundworms look like spaghetti)","Dull, rough, dry feathers","Birds look thin and weak"],
    causes:"Roundworms (Ascaridia), Tapeworms, Cecal worms (Heterakis). Spread through contaminated soil and droppings. Earthworms and insects carry tapeworm eggs.",
    treatment:["Piperazine citrate in water for 1–2 days — for roundworms","Albendazole (Albomar, Valbazen) 10mg/kg single dose — broad spectrum","Fenbendazole (Safeguard) 5mg/kg for 5 days","After deworming: give ADE vitamins for recovery","Repeat deworming after 3 weeks","Papaya seeds (1–2 seeds per bird) — natural anthelmintic — grind and mix in feed"],
    prevention:["Deworm every 3 months as routine","Keep coop floor clean and dry","Rotate grazing areas if free range","Papaya seeds regularly as supplement"],
    medicines:["Piperazine citrate powder (Piperazin, Pip-Worm) — safe and cheap","Albendazole (Albomar Bolus, Valbazen) — ask for poultry dose","Fenbendazole (Safeguard, Panacur)","Levamisole HCl (Nilzan, Levacide) — injectable, vet"],
    severity:"low", vetNeeded:false,
    note:"Routine deworming every 90 days is essential in Kerala's humid climate. Papaya seeds are a proven natural dewormer — always available locally."
  },
  {
    id:"mites_lice", name:"Mites & Lice (Ectoparasites)", icon:"🐛", color:"#BCAAA4",
    symptoms:["Birds scratching and preening excessively","Feather loss especially around vent, neck, and wings","Pale comb — anaemia from blood loss (red mites)","Restless at night, not sleeping (red mites feed at night)","Tiny bugs visible on feathers or skin","Dark specks in coop corners and perches (mite eggs/droppings)","Reduced egg production"],
    causes:"Red mite (Dermanyssus gallinae) hides in coop cracks during day, feeds at night. Lice (Mallophaga) live permanently on bird. Spreads through new birds, wild birds, contaminated equipment.",
    treatment:["Dust birds with Sevin (Carbaryl) powder — safe and effective","Pyrethrin-based spray on birds and coop","Deltamethrin (Butox) — dilute and spray entire coop","Clean and spray all perches, nest boxes, coop corners","Repeat treatment after 7–10 days (to kill eggs that hatch)","Wood ash bath — provide a dust bath area with wood ash"],
    prevention:["Provide dust bath area always — birds self-treat by dust bathing","Inspect birds weekly for lice/mites","Check perches and cracks for red mites at night","Add neem leaves to nest boxes — natural repellent","Garlic in water (1 clove per litre) has some evidence for mite prevention"],
    medicines:["Sevin 5% dust (Carbaryl) — for birds and coop","Deltamethrin (Butox EC) — dilute 1ml in 1 litre water","Permethrin spray (Ectokill, Parastar) — for coop","Ivermectin (Ivomec) drops on skin — veterinarian recommended dose"],
    severity:"low", vetNeeded:false,
    note:"Very common in Kerala monsoon season. Wood ash dust bath is free, always available, and works well. Neem leaves in coop corners help repel insects."
  },
  {
    id:"eggdrop", name:"Egg Drop / Poor Production", icon:"🥚", color:"#FFB74D",
    symptoms:["Sudden drop in egg production","Soft-shelled or shell-less eggs","Pale or discoloured yolks","Rough or thin eggshells","Misshapen eggs","Birds appear otherwise healthy"],
    causes:"Multiple causes: insufficient calcium (most common), nutritional deficiency, stress, lighting insufficient (<16hrs), disease (ND, IBD), heat stress, sudden feed change, or not yet on layer feed.",
    treatment:["Check calcium: add oyster shell or limestone grit free access","Ensure 16 hours light per day (your app already tracks this)","Check you have switched to Layer feed at Day 141+","Vitamin AD3E supplement for 7–10 days","Reduce stress — avoid sudden changes, loud noises","Check for ND or IBD — diseases cause egg drop"],
    prevention:["Always have calcium grit freely available","Maintain 16 hour lighting from Day 112","Switch to Layer feed on time (Day 141)","Avoid sudden feed brand changes"],
    medicines:["Calcium grit / Oyster shell — always free access","Vitamin AD3E (Rovimix, AD3E powder)","Calcium + Vitamin D3 supplement (CalD3 Vet)","Shell-rite or Shell-Grit supplement"],
    severity:"low", vetNeeded:false,
    note:"99% of egg drop issues in backyard flocks are from insufficient calcium or insufficient light. Check these two things first before assuming disease."
  },
];

const SYMPTOM_CHECKLIST = [
  { q:"Are birds dying suddenly (1 or more per day)?", disease:["ranikhet","cholera"] },
  { q:"Twisting of neck, walking in circles?", disease:["ranikhet"] },
  { q:"Bloody or dark red droppings?", disease:["coccidiosis"] },
  { q:"Nasal discharge, rattling/wheezing sound?", disease:["crd"] },
  { q:"Watery white/yellow diarrhoea in chicks 3–6 weeks?", disease:["gumboro","coccidiosis"] },
  { q:"Wart-like bumps on face/comb/wattles?", disease:["fowlpox"] },
  { q:"Worms visible in droppings?", disease:["worms"] },
  { q:"Birds scratching, feather loss around vent?", disease:["mites_lice"] },
  { q:"Sudden drop in egg production or soft shells?", disease:["eggdrop","ranikhet","crd"] },
  { q:"Pale comb + gradual weight loss?", disease:["worms","mites_lice","coccidiosis"] },
];

function HealthTab({ dayAge, nBirds }) {
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

// ═══════════════════════════════════════════════════════════════════════════
// 🌿  GREENS DATA
// ═══════════════════════════════════════════════════════════════════════════
const SAFE_GREENS = [
  {
    name:"Banana Stem (Trunk core)", icon:"🍌", benefit:"Hydration, fibre, potassium, Vitamin B6. Reduces Salmonella risk. Old-time Kerala remedy. Helps digestion.",
    howToFeed:"Chop inner soft core into small pieces. Feed occasionally — once or twice a week as supplement. Very high water content — chickens love it in summer.",
    frequency:"1–2x per week", qty:`Handful per ${10} birds`, season:"Year round (chop after harvest)", local:true, medicinal:false
  },
  {
    name:"Banana Leaves", icon:"🍌", benefit:"Rich in polyphenols, antioxidants. Good as occasional fodder. Also useful as a litter liner.",
    howToFeed:"Tear or chop fresh leaves. Spread on coop floor as enrichment — chickens will peck at them.",
    frequency:"Occasional", qty:"A few leaves", season:"Year round", local:true, medicinal:false
  },
  {
    name:"Papaya Leaves (Unripe fruit & seeds)", icon:"🥭", benefit:"Natural dewormer (papain enzyme). Anticoccidial properties. Antibacterial. Antifungal. Boosts immunity. UNRIPE fruit/seeds have the highest benefit.",
    howToFeed:"Fresh papaya leaves: chop and mix with feed (small amounts). Unripe papaya: cut and offer directly. Seeds: grind 1–2 seeds per bird into feed weekly as dewormer.",
    frequency:"Leaves: 2–3x per week. Seeds: weekly as dewormer", qty:"2–3 leaves or half an unripe fruit for 10 birds", season:"Year round in Kerala", local:true, medicinal:true
  },
  {
    name:"Moringa / Drumstick Leaves (Muringa)", icon:"🌿", benefit:"Extremely nutritious — protein, calcium, iron, Vitamin A, C, E. Improves egg yolk colour. Boosts immunity. Called 'miracle tree'. Well studied in poultry nutrition.",
    howToFeed:"Fresh or dried leaves. Mix into feed or hang bunches in coop for pecking. Can replace 5% of normal feed by weight.",
    frequency:"Daily if available", qty:"Small handful per day for 10 birds", season:"Year round in Kerala", local:true, medicinal:true
  },
  {
    name:"Spinach / Cheera (Amaranthus)", icon:"🥬", benefit:"Iron, calcium, Vitamins A, C, K. Improves egg production. Feed in moderation — oxalic acid in large amounts binds calcium.",
    howToFeed:"Fresh leaves, raw. Do NOT cook. Small amounts mixed with regular feed.",
    frequency:"2–3x per week (moderation!)", qty:"Small handful", season:"Year round, grows easily", local:true, medicinal:false
  },
  {
    name:"Sweet Potato Leaves", icon:"🍠", benefit:"High protein (the leaves, not the tuber). Rich in antioxidants. Good digestibility. Very common in Kerala gardens.",
    howToFeed:"Chop fresh leaves and mix with feed. Chickens enjoy them.",
    frequency:"3–4x per week", qty:"Generous handful", season:"Year round in Kerala", local:true, medicinal:false
  },
  {
    name:"Neem Leaves (Veppu)", icon:"🌿", benefit:"Natural antiparasitic, antibacterial, antiviral. Helps prevent worms and external parasites. Bitter — use in small amounts. Boosts immunity.",
    howToFeed:"Add a few fresh neem leaves to coop as scatter — birds will selectively peck. Can also make neem leaf water (boil 10 leaves in 1L water, cool, add to drinker 1x per week).",
    frequency:"Once a week (small amount)", qty:"5–10 leaves", season:"Year round", local:true, medicinal:true
  },
  {
    name:"Turmeric / Manjal (leaf or powder)", icon:"🟡", benefit:"Anti-inflammatory, antibacterial, antiviral. Improves gut health. Brightens egg yolks. Well studied in poultry — reduces ammonia in droppings.",
    howToFeed:"1/4 teaspoon turmeric powder per kg of feed. Or add fresh turmeric leaves chopped into feed occasionally.",
    frequency:"Daily in feed (powder) or 2x week (fresh leaf)", qty:"1/4 tsp powder per kg feed", season:"Year round", local:true, medicinal:true
  },
  {
    name:"Ginger / Inji", icon:"🫚", benefit:"Natural antibiotic, anti-inflammatory. Helps respiratory health. Especially useful during monsoon when CRD risk rises.",
    howToFeed:"Grate fresh ginger, add to water (1 small piece per litre). Or dry and powder — add tiny pinch per bird to feed.",
    frequency:"Once a week in water or feed", qty:"1 small piece per litre of water", season:"Year round", local:true, medicinal:true
  },
  {
    name:"Curry Leaves / Kariveppu", icon:"🌿", benefit:"Rich in calcium, phosphorus, iron. Antimicrobial. Stimulates digestion. Natural deodoriser — reduces coop smell.",
    howToFeed:"Scatter fresh leaves in coop or mix with feed. Chickens peck selectively.",
    frequency:"2–3x per week", qty:"Small bunch", season:"Year round in Kerala", local:true, medicinal:false
  },
  {
    name:"Pumpkin / Mathanga (fruit and seeds)", icon:"🎃", benefit:"Natural dewormer (pumpkin seeds — cucurbitacin compound). High in Vitamin A. Improves immune function and egg yolk colour.",
    howToFeed:"Cut pumpkin in half — chickens peck freely. Seeds can be ground and mixed into feed for deworming.",
    frequency:"1–2x per week", qty:"Half a medium pumpkin for 10 birds", season:"Year round, very common in Kerala", local:true, medicinal:true
  },
  {
    name:"Hibiscus Leaves & Flowers (Chembarathi)", icon:"🌺", benefit:"Rich in Vitamin C. Antioxidant. Reduces heat stress. Very common in Kerala compounds.",
    howToFeed:"Fresh flowers and leaves — just scatter or chop and add to feed.",
    frequency:"2–3x per week", qty:"4–5 flowers/leaves", season:"Year round", local:true, medicinal:false
  },
  {
    name:"Lemongrass / Inchi Pula", icon:"🌾", benefit:"Antibacterial, antifungal. Repels insects. Excellent for respiratory health. Can reduce mosquitoes near coop.",
    howToFeed:"Crush a few stalks and place in coop corners. Can steep in water for drinker (1–2 stalks per litre, let cool).",
    frequency:"Once a week in water, constant in coop", qty:"2–3 stalks", season:"Year round", local:true, medicinal:true
  },
];

const UNSAFE_GREENS = [
  { name:"Avocado leaves/skin/seed", icon:"🥑", reason:"Contains persin — highly toxic, causes heart failure in birds. The flesh is safe but never leaves, skin, or seed." },
  { name:"Raw beans (uncooked)", icon:"🫘", reason:"Hemagglutinin toxin causes red blood cell clumping. ALWAYS cook beans before feeding. Even a few raw kidney beans can kill." },
  { name:"Onion / Shallot / Ulli", icon:"🧅", reason:"Sulfur compounds cause hemolytic anaemia. Also makes eggs taste of onion. Avoid completely." },
  { name:"Nightshade plants (tomato/potato leaves, brinjal leaves)", icon:"🍅", reason:"Solanine toxin in leaves and stems. Fruit is safe but green parts are toxic. Keep chickens away from tomato/potato garden areas." },
  { name:"Rhubarb leaves", icon:"🌿", reason:"Very high oxalic acid — causes kidney failure. Not common in Kerala but worth knowing." },
  { name:"Raw potato / potato peel", icon:"🥔", reason:"Solanine in raw potato and especially green potato skin. Cooked potato is fine." },
  { name:"Castor bean / Amanakku", icon:"☠️", reason:"Ricin is one of the most toxic natural substances known. Even small amounts are fatal. Very common in Kerala — keep chickens far away from castor plants." },
  { name:"Oleander / Arali", icon:"🌸", reason:"All parts are highly toxic. Contains cardiac glycosides that cause heart failure. Very common ornamental plant in Kerala — fence off or remove from coop area." },
  { name:"Croton / Crotton plant", icon:"🍃", reason:"Toxic diterpenoids cause severe gastrointestinal damage and liver failure." },
  { name:"Mango leaves (in large amounts)", icon:"🥭", reason:"Fine as occasional scatter but high tannin content in large amounts causes digestive upset. Don't overfeed." },
  { name:"Coffee / Caffeine (coffee grounds)", icon:"☕", reason:"Caffeine is toxic to poultry. Never add coffee grounds to feed or litter." },
  { name:"Chocolate / Cocoa", icon:"🍫", reason:"Theobromine is toxic — can cause cardiac arrhythmia and death." },
];

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

// ═══════════════════════════════════════════════════════════════════════════
// 💰  FINANCE TAB
// ═══════════════════════════════════════════════════════════════════════════
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

  useEffect(() => {
    setForm(current => {
      if (activeCategories.includes(current.category)) return current;
      return { ...current, category: getDefaultCategory(formType) };
    });
  }, [activeCategories, formType]);

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

// ═══════════════════════════════════════════════════════════════════════════
// 🫙  FERMENTED FEED TAB
// ═══════════════════════════════════════════════════════════════════════════
function FermentTab({ dayAge, feed }) {
  const isGrower = dayAge >= 43;
  const isPreLayer = dayAge >= 121;
  const isLayer = dayAge >= 141;
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


// ═══════════════════════════════════════════════════════════════════════════
// 🐔  CAGES TAB — per-cage chick log + daily feed requirement
// ═══════════════════════════════════════════════════════════════════════════
function cageCurrentAge(cage, now) {
  const base = Math.max(0, Math.round(Number(cage?.age) || 0));
  const asOf = parseDateValue(cage?.ageAsOf);
  if (!asOf) return base;
  return Math.max(0, base + diffCalendarDays(now, asOf));
}

function buildCageRows(cages, now) {
  return (cages || []).map((cage, idx) => {
    const chicks = Math.max(0, Math.round(Number(cage.chicks) || 0));
    const age = cageCurrentAge(cage, now);
    const ready = chicks > 0 && age > 0;
    return {
      cage, idx, chicks, age, ready,
      snap: ready ? getDayFeedSnapshot(age, chicks) : null,
      tmr:  ready ? getDayFeedSnapshot(age + 1, chicks) : null,
    };
  });
}

function CageCard({ row, editing, today, now, onEdit }) {
  const { cage, idx, chicks, age, ready, snap, tmr } = row;
  const fpc      = ready ? phaseColor(snap.feed.phase) : "rgba(255,255,255,0.2)";
  const trans    = ready && isTransitionWeek(age);
  const prevFeed = trans ? getPrevFeed(age) : null;
  const ref      = now || new Date();
  const dateLabel = ref.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
  const wRange   = ready ? getWeightTarget(age) : null;
  const daysToLay = Math.max(0, 141 - age);
  const layDate   = addCalendarDays(ref, 141 - age);
  const nextVax   = VACCINATIONS.filter(v => v.day > age)[0] || null;
  const waterPerBird = ready ? Math.round((getFeed(age).waterMl[0] + getFeed(age).waterMl[1]) / 2) : 0;
  return (
    <div style={{ background:ready ? `${fpc}11` : "rgba(255,255,255,0.03)", border:`1px solid ${ready ? `${fpc}55` : "rgba(255,255,255,0.08)"}`, borderRadius:12, padding:16, marginBottom:12 }}>
      {/* Hero-style header — today, day, date, phase */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:12 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14, fontWeight:700, color:"white" }}>🏠 Cage {idx + 1}</span>
            <span style={{ fontSize:9, letterSpacing:2, color:"rgba(255,255,255,0.45)" }}>TODAY</span>
          </div>
          <div style={{ fontSize:30, fontWeight:800, color:"white", lineHeight:1.1, marginTop:2, fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.5px" }}>{ready ? `Day ${age}` : "Day —"}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:2 }}>{dateLabel}</div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ background:ready ? fpc : "rgba(255,255,255,0.1)", borderRadius:20, padding:"4px 12px", fontSize:10, fontWeight:700, color:"white", display:"inline-block" }}>{ready ? snap.feed.phase : "NOT SET"}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:6 }}>🐔 {chicks} birds{ready ? ` · ${snap.sessions.length}x feeds` : ""}</div>
        </div>
      </div>

      {editing ? (
        <div className="auto-grid-2" style={{ marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Chicks in cage {idx + 1}</div>
            <input type="number" min={0} value={cage.chicks ?? 0}
              onChange={e => onEdit(idx, { chicks: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              className="fm-input" />
          </div>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Age today (days)</div>
            <input type="number" min={0} value={age}
              onChange={e => onEdit(idx, { age: Math.max(0, parseInt(e.target.value, 10) || 0), ageAsOf: today })}
              className="fm-input" />
          </div>
        </div>
      ) : (
        <div className="auto-grid-2" style={{ marginBottom:12 }}>
          <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 12px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1 }}>CHICKS</div>
            <div style={{ fontSize:15, fontWeight:700, color:"white", marginTop:2 }}>🐔 {chicks}</div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 12px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1 }}>AGE TODAY</div>
            <div style={{ fontSize:15, fontWeight:700, color:"white", marginTop:2 }}>📅 Day {age}</div>
          </div>
        </div>
      )}

      {!ready && (
        <div style={{ background:"rgba(255,183,77,0.08)", borderRadius:8, padding:"10px 12px", fontSize:12, color:"rgba(255,255,255,0.6)" }}>
          {editing ? "Enter a chick count and age to calculate this cage's feed." : "Set this cage's chick count and age from the Cages tab."}
        </div>
      )}

      {/* Per-cage summary — total feed, water, days to lay, weight */}
      {ready && (
        <div className="auto-grid-2" style={{ marginBottom:10 }}>
          {[
            { icon:"🌾", label:"Total Feed", value:`${snap.totalG}g`, sub:`${(snap.totalG/1000).toFixed(2)}kg` },
            { icon:"💧", label:"Water", value:`${snap.totalWL}L`, sub:`${waterPerBird}ml/bird` },
            { icon:"🥚", label:age >= 141 ? "Egg Day" : "To Lay", value:age >= 141 ? "Active" : `${daysToLay}d`, sub:age >= 141 ? `Started ${formatLongDate(layDate)}` : formatLongDate(layDate) },
            { icon:"⚖️", label:"Avg Weight", value:wRange ? `${midpoint(wRange)}g` : "—", sub:formatWeightRange(wRange) },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 8px", textAlign:"center" }}>
              <div style={{ fontSize:14 }}>{s.icon}</div>
              <div style={{ fontSize:15, fontWeight:800, color:"#FFB74D", marginTop:2 }}>{s.value}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{s.label}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per-cage upcoming vaccination */}
      {ready && (
        <div style={{ background:"rgba(30,136,229,0.1)", border:"1px solid rgba(30,136,229,0.3)", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
          <div style={{ fontSize:9, color:"#90CAF9", fontWeight:700, letterSpacing:1 }}>💉 UPCOMING VACCINATION</div>
          {nextVax ? (
            <>
              <div style={{ fontSize:12, fontWeight:700, color:"white", marginTop:3 }}>{nextVax.vaccine}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Day {nextVax.day} — in <b style={{ color:"#90CAF9" }}>{nextVax.day - age} days</b> · {nextVax.disease}</div>
            </>
          ) : (
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:3 }}>✅ All scheduled vaccinations are done for this cage</div>
          )}
        </div>
      )}

      {ready && (
        <>
          <div style={{ background:"rgba(0,0,0,0.28)", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"#FFB74D" }}>{snap.feed.feedType}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Day {age} · {snap.feed.proteinPct} protein · {snap.feed.freq}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:26, fontWeight:800, color:"white", lineHeight:1 }}>{snap.totalG}g</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>feed today ({chicks} chicks)</div>
              </div>
            </div>
            <div className="auto-grid-3" style={{ gap:6, marginTop:10 }}>
              {[[`${snap.feed.gramsPerBird[0]}–${snap.feed.gramsPerBird[1]}g`,"per bird"],[`${snap.totalWL}L`,"water today"],[`${snap.sessions.length}x`,"feeds per day"]].map(([v,k]) => (
                <div key={k} style={{ background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"6px 4px", textAlign:"center" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#FFB74D" }}>{v}</div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:1, marginBottom:4 }}>SPLIT BY FEED SESSION</div>
              {snap.sessions.map((s, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i < snap.sessions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{s.icon} {s.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#FFB74D" }}>{s.grams}g</span>
                </div>
              ))}
            </div>
          </div>

          {trans && prevFeed && (
            <div style={{ background:"rgba(239,83,80,0.1)", border:"1px solid rgba(239,83,80,0.3)", borderRadius:8, padding:"8px 10px", marginBottom:8, fontSize:11, color:"#EF9A9A", lineHeight:1.6 }}>
              🔄 Feed transition week — mix: {transitionRatio(age)} ({prevFeed.feedType} → {snap.feed.feedType})
            </div>
          )}

          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px", marginBottom:8, lineHeight:1.6 }}>
            📦 <b style={{ color:"#90CAF9" }}>Tomorrow:</b> {tmr.feed.feedType} · {tmr.totalG}g total
            {tmr.feed.phase !== snap.feed.phase && <span style={{ color:"#FFB74D" }}> — phase changes to {tmr.feed.phase}!</span>}
          </div>

          {snap.feed.notes && <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>💡 {snap.feed.notes}</div>}
        </>
      )}
    </div>
  );
}

function CageTotalsPanel({ rows }) {
  const readyRows    = rows.filter(r => r.ready);
  const totalChicks  = rows.reduce((s, r) => s + r.chicks, 0);
  const totalFeedG   = readyRows.reduce((s, r) => s + r.snap.totalG, 0);
  const feedTypeTotals = {};
  readyRows.forEach(r => {
    const key = r.snap.feed.feedType;
    feedTypeTotals[key] = (feedTypeTotals[key] || 0) + r.snap.totalG;
  });
  if (!rows.length) return null;
  return (
    <div style={{ background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.35)", borderRadius:12, padding:16, marginBottom:14 }}>
      <div style={{ fontSize:11, color:"#A5D6A7", fontWeight:700, letterSpacing:2, marginBottom:12 }}>📋 TOTAL FEED NEEDED TODAY — ALL CAGES</div>
      <div className="auto-grid-3" style={{ marginBottom:12 }}>
        {[[`${rows.length}`,"cages"],[`${totalChicks}`,"chicks total"],[`${totalFeedG}g`,`≈ ${(totalFeedG / 1000).toFixed(2)}kg`]].map(([v,k]) => (
          <div key={k} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#A5D6A7" }}>{v}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginBottom:6 }}>FEED BY TYPE (BUY / PREP)</div>
      {Object.keys(feedTypeTotals).length === 0 && (
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>Enter chick counts and ages to see the combined feed requirement.</div>
      )}
      {Object.entries(feedTypeTotals).map(([ft, g]) => (
        <div key={ft} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{ft}</span>
          <span style={{ fontSize:14, fontWeight:800, color:"#FFB74D" }}>{g}g</span>
        </div>
      ))}
    </div>
  );
}

function CageHomeSection({ cages, now, onOpenCages }) {
  const rows = buildCageRows(cages, now);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:12, color:"#FFB74D", fontWeight:700, letterSpacing:2 }}>🏠 CAGES — TODAY'S FEED</div>
        <button onClick={onOpenCages} style={{ background:"rgba(255,183,77,0.12)", border:"1px solid rgba(255,183,77,0.3)", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#FFB74D", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✏️ Edit cages</button>
      </div>
      {rows.length === 0 ? (
        <div style={{ background:"rgba(255,183,77,0.07)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:12, padding:"18px", textAlign:"center" }}>
          <div style={{ fontSize:26, marginBottom:6 }}>🏠</div>
          <div style={{ fontSize:13, fontWeight:700, color:"#FFB74D", marginBottom:4 }}>No cages set up yet</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginBottom:12, lineHeight:1.6 }}>Select your cages, chick counts, and ages to see each cage's daily feed right here on the home screen.</div>
          <button onClick={onOpenCages} style={{ padding:"10px 18px", background:"linear-gradient(135deg,#E87722,#BF5500)", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>➕ Set Up Cages</button>
        </div>
      ) : (
        <>
          {rows.map(row => <CageCard key={row.cage.id} row={row} editing={false} now={now} />)}
          <CageTotalsPanel rows={rows} />
        </>
      )}
    </div>
  );
}

function CagesTab({ cages, onSave, readOnly, now }) {
  const today = toDateInputValue(now);

  const setCount = rawCount => {
    const count = Math.max(0, Math.min(24, parseInt(rawCount, 10) || 0));
    if (count === cages.length) return;
    if (count < cages.length && !window.confirm(`Remove ${cages.length - count} cage(s) and their saved entries?`)) return;
    const next = Array.from({ length: count }, (_, i) => cages[i] || { id:`cage_${i + 1}_${Date.now()}`, chicks:10, age:25, ageAsOf:today });
    onSave(next);
  };

  const updateCage = (idx, patch) => onSave(cages.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const rows = buildCageRows(cages, now);

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:700, color:"#FFB74D", marginBottom:4 }}>🐔 Cage Feed Planner</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Log chick count and age for every cage — each cage gets its own daily feed plan in grams</div>

      {/* Number of cages */}
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16, marginBottom:14 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>NUMBER OF CAGES IN USE</div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <input type="number" min={1} max={24} value={cages.length || ""} placeholder="0" disabled={readOnly}
            onChange={e => setCount(e.target.value)}
            style={{ width:86, padding:"9px 12px", borderRadius:8, border:"1px solid rgba(232,119,34,0.4)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:15, fontWeight:700, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" }} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[1,2,3,4,5,6,8].map(n => (
              <button key={n} onClick={() => setCount(n)} disabled={readOnly}
                style={{ width:38, height:36, borderRadius:8, border:`1px solid ${cages.length === n ? "rgba(232,119,34,0.7)" : "rgba(255,255,255,0.12)"}`, background:cages.length === n ? "rgba(232,119,34,0.2)" : "rgba(255,255,255,0.04)", color:cages.length === n ? "#FFB74D" : "rgba(255,255,255,0.6)", fontSize:13, fontWeight:700, cursor:readOnly ? "not-allowed" : "pointer", opacity:readOnly ? 0.5 : 1, fontFamily:"'DM Sans',sans-serif" }}>{n}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:10 }}>💾 Saves automatically on this device · Ages advance by themselves each day</div>
      </div>

      {/* Empty state */}
      {cages.length === 0 && (
        <div style={{ background:"rgba(255,183,77,0.07)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:12, padding:"24px 18px", textAlign:"center" }}>
          <div style={{ fontSize:30, marginBottom:8 }}>🏠</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#FFB74D", marginBottom:6 }}>No cages logged yet</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.7 }}>Choose how many cages you are using above (for example 4), then enter the chick count and age for each cage.</div>
        </div>
      )}

      {/* Per-cage cards */}
      {rows.map(row => (
        <CageCard key={row.cage.id} row={row} editing={!readOnly} today={today} now={now} onEdit={updateCage} />
      ))}

      {/* All-cage total */}
      {rows.length > 0 && <CageTotalsPanel rows={rows} />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TaskCard({ t, globalIdx, dayAge, checked, onToggle, readOnly }) {
  const done = !!checked[`${dayAge}_${globalIdx}`];
  const priColor = { urgent:"#EF9A9A", high:"#FFB74D", medium:"rgba(255,255,255,0.5)", low:"rgba(255,255,255,0.25)" }[t.priority] || "#fff";
  const priBg    = { urgent:"rgba(239,83,80,0.12)", high:"rgba(255,183,77,0.08)", medium:"transparent", low:"transparent" }[t.priority] || "transparent";
  return (
    <div onClick={() => !readOnly && onToggle(globalIdx)}
      style={{ background: done ? "rgba(255,255,255,0.015)" : priBg, border:`1px solid ${done?"rgba(255,255,255,0.05)":t.priority==="urgent"?"rgba(239,83,80,0.3)":t.priority==="high"?"rgba(255,183,77,0.15)":"rgba(255,255,255,0.07)"}`, borderRadius:10, padding:"11px 13px", marginBottom:6, cursor:readOnly?"default":"pointer", opacity:done?0.4:1, transition:"all 0.15s", display:"flex", gap:10, alignItems:"flex-start" }}>
      <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${done?"#E87722":priColor}`, background:done?"#E87722":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all 0.15s" }}>
        {done && <span style={{ fontSize:12, color:"white", fontWeight:"bold" }}>✓</span>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:done?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.9)", textDecoration:done?"line-through":"none", fontWeight:t.priority==="urgent"?600:400, lineHeight:1.4 }}>{t.icon} {t.task}</div>
        {t.detail && !done && <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4, lineHeight:1.5 }}>{t.detail}</div>}
      </div>
      {(t.priority==="urgent"||t.priority==="high") && !done && (
        <div style={{ fontSize:9, color:priColor, textTransform:"uppercase", fontWeight:700, flexShrink:0, letterSpacing:"0.5px", marginTop:3 }}>{t.priority}</div>
      )}
    </div>
  );
}

function SessionBlock({ label, color, tasks, startIdx, dayAge, checked, onToggle, readOnly }) {
  if (!tasks.length) return null;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, color, fontWeight:"bold", letterSpacing:2, marginBottom:8, textTransform:"uppercase" }}>{label}</div>
      {tasks.map((t, i) => (
        <TaskCard key={i} t={t} globalIdx={startIdx + i} dayAge={dayAge} checked={checked} onToggle={onToggle} readOnly={readOnly} />
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState("setup");
  const [step,      setStep]      = useState(1);
  const [settings,  setSettings]  = useState(DEFAULT_SETTINGS);
  const [temp,      setTemp]      = useState(DEFAULT_TEMP);
  const [checked,   setChecked]   = useState({});
  const [tgStatus,  setTgStatus]  = useState("");
  const [now,       setNow]       = useState(new Date());
  const [notifSent, setNotifSent] = useState("");
  const [feedLogs,  setFeedLogs]  = useState([]);
  const [buyAlertDismissed, setBuyAlertDismissed] = useState({});
  const [financeEntries, setFinanceEntries] = useState([]);
  const [cages, setCages] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  // Feed tab states — must be at top level (React rules)
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [showCalc,       setShowCalc]       = useState(false);
  const [newLog,         setNewLog]         = useState({ kg:"", pricePerKg:40, date:toDateInputValue() });
  const [calcDays,       setCalcDays]       = useState(20);
  const [calcTargetDate, setCalcTargetDate] = useState("");
  const [docsQuery,      setDocsQuery]      = useState("");
  const [docsMessages,   setDocsMessages]   = useState([
    {
      role: "assistant",
      text: "Ask about BV380 chick start, tropical climate management, feeding, bodyweight, or transition to lay. Answers are grounded only in the built-in BV380 document knowledge base.",
      sources: [],
    },
  ]);
  const [docsError,      setDocsError]      = useState("");

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);

  // ── localStorage helpers (works on any real browser/server) ──
  const lsGet = key => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  useEffect(() => {
    const shared = loadSharedData(lsGet);
    const session = lsGet(SESSION_KEY);
    setSettings(shared.settings);
    setTemp(shared.settings);
    setFeedLogs(shared.feedLogs);
    setBuyAlertDismissed(shared.buyAlertDismissed);
    setFinanceEntries(shared.finance);
    setCages(shared.cages);
    lsSet(SHARED_DATA_KEY, shared);
    if (session?.username && AUTH_USERS[session.username]) {
      const user = AUTH_USERS[session.username];
      setAuthUser({ username: user.username, role: user.role, label: user.label });
    }
    setScreen(!shared.settings?.setupDone ? "setup" : (shared.cages.length ? "dashboard" : "cagegate"));
    setHydrated(true);
  }, []);

  const persistAll = useCallback(next => {
    lsSet(SHARED_DATA_KEY, normalizeSharedData(next));
  }, []);

  const saveFeedLogs = logs => {
    setFeedLogs(logs);
    persistAll({ settings, feedLogs: logs, buyAlertDismissed, finance: financeEntries, cages });
  };
  const saveBuyAlerts = obj => {
    setBuyAlertDismissed(obj);
    persistAll({ settings, feedLogs, buyAlertDismissed: obj, finance: financeEntries, cages });
  };
  const saveFinanceEntries = list => {
    setFinanceEntries(list);
    lsSet("bv380_finance", list);
    persistAll({ settings, feedLogs, buyAlertDismissed, finance: list, cages });
  };
  const saveCages = list => {
    setCages(list);
    persistAll({ settings, feedLogs, buyAlertDismissed, finance: financeEntries, cages: list });
  };
  const persist = useCallback(s => {
    setSettings(s);
    persistAll({ settings: s, feedLogs, buyAlertDismissed, finance: financeEntries, cages });
  }, [feedLogs, buyAlertDismissed, financeEntries, cages, persistAll]);
  const canEdit = authUser?.role === "admin";
  const readOnly = !canEdit;

  const handleReset = () => {
    if (!canEdit) return;
    if (!window.confirm("Reset all farm data? This cannot be undone.")) return;
    localStorage.removeItem(SHARED_DATA_KEY);
    localStorage.removeItem("bv380_settings");
    localStorage.removeItem("bv380_feedlogs");
    localStorage.removeItem("bv380_buyalerts");
    localStorage.removeItem("bv380_finance");
    localStorage.removeItem("bv380_cages");
    setSettings(DEFAULT_SETTINGS);
    setTemp(DEFAULT_TEMP);
    setFeedLogs([]);
    setBuyAlertDismissed({});
    setFinanceEntries([]);
    setCages([]);
    setScreen("setup"); setStep(1);
  };

  const dayAge = (() => {
    if (!settings.startDate) return settings.chickenAge || 25;
    return (settings.chickenAge || 25) + diffCalendarDays(now, settings.startDate);
  })();

  const feedSnapshot = getDayFeedSnapshot(dayAge, settings.numBirds || 10);
  const tomorrowSnapshot = getDayFeedSnapshot(dayAge + 1, settings.numBirds || 10);
  const feed     = feedSnapshot.feed;
  const lightPlan = getLightPlan(dayAge);
  const nBirds   = settings.numBirds || 10;
  const weightRange = getWeightTarget(dayAge);
  const avgWeight = midpoint(weightRange);
  const totalG   = feedSnapshot.totalG;
  const totalWL  = feedSnapshot.totalWL;
  const sessions = feedSnapshot.sessions;
  const tasks    = buildTasks(dayAge, nBirds);
  const pc       = phaseColor(feed.phase);
  const daysToLay = Math.max(0, 141 - dayAge);
  const layDateOffset = 141 - dayAge;
  const expectedLayDate = addCalendarDays(now, layDateOffset);
  const tomorrowPhaseChange = tomorrowSnapshot.feed.phase !== feed.phase;

  const byTime = t => tasks.filter(tk => tk.time === t);
  const pdT = byTime("Pre-Dawn");
  const mT  = byTime("Morning");
  const mmT = byTime("Mid-Morning");
  const aT  = byTime("Afternoon");
  const laT = byTime("Late-Afternoon");
  const eT  = byTime("Evening");
  const urgT = tasks.filter(t => t.priority === "urgent");

  // Compute global start indices for each session block
  const pdStart = 0;
  const mmStart = pdT.length + mT.length;
  const aStart  = mmStart + mmT.length;
  const laStart = aStart  + aT.length;
  const eStart  = laStart + laT.length;

  const done  = tasks.filter((_, i) => checked[`${dayAge}_${i}`]).length;
  const prog  = tasks.length ? Math.round((done/tasks.length)*100) : 0;
  const toggle = i => {
    if (readOnly) return;
    setChecked(p => ({ ...p, [`${dayAge}_${i}`]: !p[`${dayAge}_${i}`] }));
  };

  const sendTg = async msg => {
    if (readOnly) return;
    if (!settings.botToken || !settings.chatId) { setTgStatus("❌ Bot token or Chat ID missing. Go to Settings."); return; }
    setTgStatus("⏳ Sending...");
    try {
      const r = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ chat_id:settings.chatId, text:msg, parse_mode:"Markdown" }) });
      const d = await r.json();
      setTgStatus(d.ok ? "✅ Sent!" : `❌ ${d.description}`);
    } catch { setTgStatus("❌ Network error — works fine on your Ubuntu server."); }
  };

  const sendDaily = () => sendTg(buildTelegram(dayAge, nBirds, tasks, feed));
  const sendTest  = () => sendTg(`✅ *BV-380 Farm Bot Connected!*\n\nFarm tracker running.\n🐔 ${settings.numBirds} birds | Day ${dayAge}\n⏰ Daily at ${settings.notifyTime}\n\n_Kerala Clyde's BV380 Farm Manager 🌴_`);

  const askDocsAssistant = async () => {
    const question = docsQuery.trim();
    if (!question) return;
    const sources = searchDocKnowledge(question, 5);
    setDocsError("");
    setDocsMessages(prev => [...prev, { role: "user", text: question, sources: [] }]);
    setDocsQuery("");

    if (!sources.length) {
      setDocsMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "I could not find a matching section in the built-in BV380 document knowledge base. Add more PDF-derived notes or ask about chick start, tropical climate, feed phases, bodyweight, lighting, vaccination, or lay preparation.",
          sources: [],
        },
      ]);
      return;
    }

    setDocsMessages(prev => [
      ...prev,
      {
        role: "assistant",
        text: `${buildLocalDocAnswer(question, sources)}\n\nMode: local document mode.`,
        sources,
      },
    ]);
  };

  useEffect(() => {
    if (!settings.botToken || !settings.chatId || !settings.setupDone) return;
    const [h,m] = settings.notifyTime.split(":").map(Number);
    const key = now.toDateString();
    if (now.getHours()===h && now.getMinutes()===m && notifSent !== key) { setNotifSent(key); sendDaily(); }
  }, [now]);

  const saveS = patch => { const s = {...settings, ...patch}; setSettings(s); persist(s); };
  const finishSetup = () => { const s = {...temp, setupDone:true, startDate:toDateInputValue()}; setSettings(s); persist(s); setScreen(cages.length ? "dashboard" : "cagegate"); };
  const handleLogin = () => {
    const username = authForm.username.trim();
    const user = AUTH_USERS[username];
    if (!user || user.password !== authForm.password) {
      setAuthError("Invalid username or password.");
      return;
    }
    setAuthUser({ username: user.username, role: user.role, label: user.label });
    lsSet(SESSION_KEY, { username: user.username, role: user.role });
    setAuthError("");
    setAuthForm({ username, password: "" });
    setScreen(!settings.setupDone ? "setup" : (cages.length ? "dashboard" : "cagegate"));
  };
  const handleLogout = () => {
    setAuthUser(null);
    setAuthForm({ username: "", password: "" });
    setAuthError("");
    localStorage.removeItem(SESSION_KEY);
  };

  const [selectedVax, setSelectedVax] = useState(null);

  if (!hydrated) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0500", color:"rgba(255,255,255,0.7)", fontFamily:"'DM Sans',sans-serif" }}>
        <StyleInjector />
        Loading farm data...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#2d1500,#1a0a00)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
        <StyleInjector />
        <div style={{ width:"100%", maxWidth:420, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,119,34,0.3)", borderRadius:20, overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#E87722,#BF5500)", padding:"28px 28px 22px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🔐</div>
            <div style={{ fontSize:22, fontWeight:700, color:"white" }}>Farm Login</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:6 }}>Admin can edit data. Guest can only view.</div>
          </div>
          <div style={{ padding:"22px 28px 28px" }}>
            <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:12, color:"rgba(255,255,255,0.72)", lineHeight:1.7 }}>
              Admin: <b style={{ color:"#FFB74D" }}>admin123 / admin123</b><br/>
              Guest: <b style={{ color:"#A5D6A7" }}>guest / guest123</b><br/>
              Shared data is common inside this app storage on the current device/browser.
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:6 }}>Username</div>
              <input type="text" value={authForm.username} onChange={e=>setAuthForm(f=>({...f, username:e.target.value}))}
                style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(232,119,34,0.4)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:6 }}>Password</div>
              <input type="password" value={authForm.password} onChange={e=>setAuthForm(f=>({...f, password:e.target.value}))} onKeyDown={e=>{ if (e.key === "Enter") handleLogin(); }}
                style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(232,119,34,0.4)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            {authError && <div style={{ color:"#EF9A9A", fontSize:12, marginBottom:12 }}>{authError}</div>}
            <button onClick={handleLogin} style={{ width:"100%", padding:12, background:"#E87722", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:"bold", cursor:"pointer" }}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  if (authUser.role === "guest" && !settings.setupDone) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0500", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
        <StyleInjector />
        <div style={{ width:"100%", maxWidth:480, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:18, padding:24 }}>
          <div style={{ fontSize:18, fontWeight:700, color:"#FFB74D", marginBottom:10 }}>Guest access is view-only</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.7, marginBottom:16 }}>
            No shared farm data has been set up yet. Log in as <b style={{ color:"#FFB74D" }}>admin123</b> to configure the farm first, then guest can view the same records.
          </div>
          <button onClick={handleLogout} className="btn-ghost">Log Out</button>
        </div>
      </div>
    );
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (screen === "setup") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#2d1500,#1a0a00)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <StyleInjector />
      <div style={{ width:"100%", maxWidth:480, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,119,34,0.3)", borderRadius:20, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(135deg,#E87722,#BF5500)", padding:"32px 32px 24px", textAlign:"center" }}>
          <div style={{ fontSize:52, marginBottom:8 }}>🐔</div>
          <div style={{ fontSize:24, fontWeight:700, color:"white", letterSpacing:"-0.5px" }}>Clyde's BV380 Farm Manager</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:5 }}>Kerala Poultry Tracker</div>
        </div>
        <div style={{ display:"flex", padding:"16px 24px 0", gap:4 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:step>=s?"#E87722":"rgba(255,255,255,0.1)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:"bold", border:step===s?"2px solid #FFB74D":"none" }}>{s}</div>
              <div style={{ fontSize:10, color:step>=s?"#FFB74D":"rgba(255,255,255,0.3)", marginTop:4 }}>{["Flock","Telegram","Confirm"][s-1]}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"20px 32px 28px" }}>
          {step === 1 && (
            <div>
              <div style={{ color:"#FFB74D", fontSize:15, fontWeight:"bold", marginBottom:16 }}>🐣 Tell me about your flock</div>
              {[{label:"Number of Birds",key:"numBirds",type:"number",ph:"10"},{label:"Current Age of Birds (days)",key:"chickenAge",type:"number",ph:"25"},{label:"Daily Notification Time",key:"notifyTime",type:"time"}].map(f => (
                <div key={f.key} style={{ marginBottom:14 }}>
                  <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:6 }}>{f.label}</div>
                  <input type={f.type} placeholder={f.ph} value={temp[f.key]} onChange={e => setTemp(p=>({...p,[f.key]:f.type==="number"?parseInt(e.target.value)||0:e.target.value}))}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(232,119,34,0.4)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                </div>
              ))}
              <button onClick={()=>setStep(2)} style={{ width:"100%", padding:12, background:"#E87722", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:"bold", cursor:"pointer" }}>Next: Telegram →</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ color:"#FFB74D", fontSize:15, fontWeight:"bold", marginBottom:8 }}>📱 Telegram Setup</div>
              <div style={{ background:"rgba(255,183,77,0.1)", border:"1px solid rgba(255,183,77,0.3)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                {["Open Telegram → search @BotFather","Send /newbot → choose a name","Copy the API token","Search @userinfobot → send any msg → copy Chat ID","Paste both below 👇"].map((s,i)=>(
                  <div key={i} style={{ color:"rgba(255,255,255,0.75)", fontSize:11.5, marginBottom:4, display:"flex", gap:8 }}>
                    <span style={{ color:"#E87722", fontWeight:"bold", minWidth:16 }}>{i+1}.</span>{s}
                  </div>
                ))}
              </div>
              {[{label:"Bot Token",key:"botToken",ph:"123456:ABCdef..."},{label:"Chat ID",key:"chatId",ph:"123456789"}].map(f=>(
                <div key={f.key} style={{ marginBottom:14 }}>
                  <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginBottom:6 }}>{f.label}</div>
                  <input type="text" placeholder={f.ph} value={temp[f.key]} onChange={e=>setTemp(p=>({...p,[f.key]:e.target.value}))}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(232,119,34,0.4)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }} />
                </div>
              ))}
              {tgStatus && <div style={{ color:tgStatus.startsWith("✅")?"#81C784":"#EF9A9A", fontSize:12, marginBottom:10 }}>{tgStatus}</div>}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{saveS(temp);sendTest();}} style={{ flex:1, padding:10, background:"rgba(255,255,255,0.08)", color:"#FFB74D", border:"1px solid rgba(255,183,77,0.3)", borderRadius:8, cursor:"pointer", fontSize:13 }}>🧪 Test</button>
                <button onClick={()=>setStep(3)} style={{ flex:1, padding:10, background:"#E87722", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:"bold" }}>Next →</button>
              </div>
              <button onClick={()=>setStep(3)} style={{ width:"100%", padding:8, background:"transparent", color:"rgba(255,255,255,0.4)", border:"none", cursor:"pointer", fontSize:12, marginTop:8 }}>Skip for now</button>
            </div>
          )}
          {step === 3 && (
            <div>
              <div style={{ color:"#FFB74D", fontSize:15, fontWeight:"bold", marginBottom:16 }}>✅ Ready to start!</div>
              {[["🐔 Birds",`${temp.numBirds} BV-380 hens`],["📅 Age",`Day ${temp.chickenAge}`],["🌾 Feed",getFeed(temp.chickenAge||25).feedType],["⏰ Alert",`${temp.notifyTime} IST daily`],["📱 Telegram",temp.botToken&&temp.chatId?"✅ Configured":"⚠️ Not set"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color:"rgba(255,255,255,0.6)", fontSize:13 }}>{k}</span>
                  <span style={{ color:"white", fontSize:13, fontWeight:"bold" }}>{v}</span>
                </div>
              ))}
              <button onClick={finishSetup} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#E87722,#BF5500)", color:"white", border:"none", borderRadius:10, fontSize:16, fontWeight:"bold", cursor:"pointer", marginTop:20 }}>🚀 Start Tracking!</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── MAIN ───────────────────────────────────────────────────────────────────
  // ── CAGE SELECT — shown right after login, before the home screen ─────────
  if (screen === "cagegate") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#2d1500,#1a0a00)", padding:"28px 16px", fontFamily:"'DM Sans',sans-serif" }}>
      <StyleInjector />
      <div style={{ width:"100%", maxWidth:560, margin:"0 auto" }}>
        <div style={{ background:"linear-gradient(135deg,#E87722,#BF5500)", padding:"24px 24px 20px", borderRadius:"18px 18px 0 0", textAlign:"center" }}>
          <div style={{ fontSize:44, marginBottom:6 }}>🏠</div>
          <div style={{ fontSize:22, fontWeight:700, color:"white" }}>Select Your Cages</div>
          <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.8)", marginTop:6 }}>Log how many cages you run, the chicks in each, and how many days old they are — then continue to your home screen.</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(232,119,34,0.3)", borderTop:"none", borderRadius:"0 0 18px 18px", padding:20 }}>
          <CagesTab cages={cages} onSave={saveCages} readOnly={readOnly} now={now} />
          {cages.length === 0 && (
            <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:10, padding:"10px 12px", marginBottom:12, fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.6 }}>
              👆 Choose the number of cages, then set the chick count and age for each cage.
            </div>
          )}
          <button onClick={() => setScreen("dashboard")} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#E87722,#BF5500)", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:"0.3px", fontFamily:"'DM Sans',sans-serif" }}>
            🏠 Continue to Home →
          </button>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:10, lineHeight:1.6 }}>
            {cages.length > 0 ? `✅ ${cages.length} cage(s) saved — change them anytime from the Cages tab.` : "You can continue without cages and set them up later."}
          </div>
        </div>
      </div>
    </div>
  );

  const NAV = [["dashboard","🏠","Home"],["cages","🐔","Cages"],["feed","🛒","Feed"],["health","🩺","Health"],["greens","🌿","Greens"],["finance","💰","Finance"],["ferment","🫙","Ferment"],["docs","📚","Docs"],["schedule","📅","Schedule"],["settings","⚙️","Settings"]];

  return (
    <div className="app-shell">
      <StyleInjector />
      {/* Top bar */}
      <div className="app-topbar">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:26 }}>🐔</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.3px" }}>Clyde's BV380 Farm Manager</div>
            <div style={{ fontSize:10, opacity:0.7 }}>Day {dayAge} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})} IST</div>
          </div>
        </div>
        {/* Desktop top-right quick info */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ background:authUser.role==="admin"?"rgba(46,125,50,0.22)":"rgba(255,183,77,0.16)", borderRadius:20, padding:"5px 12px", fontSize:11, fontWeight:700, color:authUser.role==="admin"?"#A5D6A7":"#FFB74D" }}>
            {authUser.role === "admin" ? "ADMIN" : "GUEST"}
          </div>
          <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600 }}>
            🐔 {nBirds} birds · {feed.phase}
          </div>
          <button onClick={handleLogout} style={{ background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"5px 12px", color:"white", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Log Out
          </button>
        </div>
      </div>

      <div className="app-body">
        {/* Sidebar — desktop only */}
        <nav className="app-sidebar">
          <div className="sidebar-logo">
            <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>Kerala Poultry</div>
            <div className="sl-birds">🐔 {nBirds} birds · Day {dayAge}</div>
          </div>
          {NAV.map(([s,icon,label])=>(
            <button key={s} className={`app-sidebar-item${screen===s?" active":""}`} onClick={()=>setScreen(s)}>
              <span className="s-icon">{icon}</span> {label}
            </button>
          ))}
          <div style={{ marginTop:16, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", padding:"0 14px", lineHeight:1.8 }}>
              <div style={{ color:"rgba(255,255,255,0.4)", fontWeight:600, marginBottom:4 }}>Today's Feed</div>
              <div>{feed.feedType}</div>
              <div>{Math.round(((feed.gramsPerBird[0]+feed.gramsPerBird[1])/2)*nBirds)}g total</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontWeight:600, marginTop:12, marginBottom:4 }}>Tomorrow Prep</div>
              <div>{tomorrowSnapshot.feed.feedType}</div>
              <div>{tomorrowSnapshot.totalG}g total</div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="app-content">

        {readOnly && (
          <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
            Guest mode is active. You can view the farm dashboard and all shared records, but only the admin account can change data.
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {screen === "dashboard" && (
          <>
            {/* Cage info — every cage's feed plan on the home screen */}
            <CageHomeSection cages={cages} now={now} onOpenCages={() => setScreen("cages")} />

            {/* Feed stock alert on dashboard */}
            {(()=>{
              const st = calcRemainingStock(feedLogs, dayAge, nBirds);
              if (st.totalBought > 0 && st.daysRemaining <= 5 && !buyAlertDismissed[`${getFeed(dayAge).phase}_${dayAge}`]) {
                return (
                  <div onClick={()=>setScreen("feed")} style={{ background:"rgba(239,83,80,0.12)", border:"1px solid rgba(239,83,80,0.4)", borderRadius:10, padding:"10px 14px", marginBottom:12, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:"bold", color:"#EF9A9A" }}>🚨 Low Feed Stock — {st.daysRemaining} days left!</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Tap to view buy suggestion →</div>
                    </div>
                    <span style={{ fontSize:20 }}>🛒</span>
                  </div>
                );
              }
              return null;
            })()}
            {/* Common strip — flock-wide info shared by every cage (below the cage cards) */}
            <div style={{ background:`linear-gradient(135deg,${pc}22,${pc}11)`, border:`1px solid ${pc}44`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", letterSpacing:2 }}>COMMON — ALL CAGES</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>Day {dayAge} · {now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
                </div>
                <div style={{ background:pc, borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:"bold", color:"white" }}>{feed.phase}</div>
              </div>
              <div className="auto-grid-3" style={{ marginBottom:12 }}>
                {[
                  { icon:"🐔", value:`${nBirds}`, label:"birds (flock)" },
                  { icon:"🌾", value:`${totalG}g`, label:"total feed/day" },
                  { icon:"💧", value:`${totalWL}L`, label:"total water/day" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                    <div style={{ fontSize:13 }}>{s.icon}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#FFB74D", marginTop:2 }}>{s.value}</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Tasks completed today</span>
                <span style={{ fontSize:11, color:"#FFB74D", fontWeight:"bold" }}>{done}/{tasks.length}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:4, height:6, overflow:"hidden" }}>
                <div style={{ background:`linear-gradient(90deg,${pc},#FFB74D)`, width:`${prog}%`, height:"100%", borderRadius:4, transition:"width 0.5s" }} />
              </div>
            </div>

            {/* Urgent */}
            {urgT.length > 0 && (
              <div style={{ background:"rgba(198,40,40,0.15)", border:"1px solid rgba(198,40,40,0.4)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color:"#EF9A9A", marginBottom:10 }}>🚨 URGENT TODAY</div>
                {urgT.map((t,i)=>(
                  <div key={i} style={{ marginBottom:8 }}>
                    <div style={{ fontSize:13, color:"#FFCDD2", fontWeight:"bold" }}>{t.icon} {t.task}</div>
                    {t.detail && <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:3, marginLeft:24 }}>{t.detail}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Feed card */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${pc}33`, borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#FFB74D", fontWeight:"bold", marginBottom:12, letterSpacing:1 }}>🌾 TODAY'S FEED DETAILS</div>
              <div className="auto-grid-2" style={{ marginBottom:12 }}>
                {[["Feed Type",feed.feedType],["Per Bird/Day",`${feed.gramsPerBird[0]}–${feed.gramsPerBird[1]}g`],["Avg Body Weight",`${avgWeight}g`],[`Weight Range`,formatWeightRange(weightRange)],[`Total (${nBirds} birds)`,`${totalG}g`],["Protein",feed.proteinPct],["Frequency",feed.freq],["Sessions",`${sessions.length}x per day`]].map(([k,v])=>(
                  <div key={k}><div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{k}</div><div style={{ fontSize:13, color:"white", fontWeight:"bold" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ background:"rgba(255,183,77,0.07)", borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ fontSize:10, color:"#FFB74D", fontWeight:"bold", marginBottom:8, letterSpacing:1 }}>🍽️ FEED SPLIT BY SESSION</div>
                {sessions.map((s,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:6, marginBottom:i<sessions.length-1?6:0, borderBottom:i<sessions.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize:13, color:"#FFB74D", fontWeight:"bold" }}>{s.grams}g <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:"normal" }}>({Math.round(s.grams/nBirds)}g/bird)</span></span>
                  </div>
                ))}
              </div>
              <div style={{ padding:"8px 10px", background:"rgba(255,183,77,0.08)", borderRadius:8, fontSize:11, color:"rgba(255,255,255,0.6)" }}><b style={{ color:"#FFB74D" }}>Brands:</b> {feed.brands}</div>
              {feed.notes && <div style={{ marginTop:8, padding:"8px 10px", background:"rgba(255,255,255,0.04)", borderRadius:8, fontSize:11, color:"rgba(255,255,255,0.5)" }}>💡 {feed.notes}</div>}
            </div>

            <div style={{ background:"rgba(30,136,229,0.08)", border:"1px solid rgba(30,136,229,0.28)", borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#90CAF9", fontWeight:"bold", marginBottom:12, letterSpacing:1 }}>📦 TOMORROW'S FEED PREP</div>
              <div className="auto-grid-2" style={{ marginBottom:12 }}>
                {[["Day",`Day ${tomorrowSnapshot.day}`],["Feed Type",tomorrowSnapshot.feed.feedType],["Per Bird/Day",`${tomorrowSnapshot.feed.gramsPerBird[0]}–${tomorrowSnapshot.feed.gramsPerBird[1]}g`],[`Total (${nBirds} birds)`,`${tomorrowSnapshot.totalG}g`],["Water Total",`${tomorrowSnapshot.totalWL}L`],["Sessions",`${tomorrowSnapshot.sessions.length}x per day`]].map(([k,v])=>(
                  <div key={k}><div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{k}</div><div style={{ fontSize:13, color:"white", fontWeight:"bold" }}>{v}</div></div>
                ))}
              </div>
              {tomorrowPhaseChange && (
                <div style={{ marginBottom:10, padding:"8px 10px", background:"rgba(255,183,77,0.12)", borderRadius:8, fontSize:11, color:"#FFB74D" }}>
                  ⚡ Tomorrow changes phase from <b>{feed.phase}</b> to <b>{tomorrowSnapshot.feed.phase}</b>. Prepare <b>{tomorrowSnapshot.feed.feedType}</b> today.
                </div>
              )}
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:"#90CAF9", fontWeight:"bold", marginBottom:8, letterSpacing:1 }}>🍽️ TOMORROW'S FEED SPLIT</div>
                {tomorrowSnapshot.sessions.map((s,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:6, marginBottom:i<tomorrowSnapshot.sessions.length-1?6:0, borderBottom:i<tomorrowSnapshot.sessions.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize:13, color:"#90CAF9", fontWeight:"bold" }}>{s.grams}g <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:"normal" }}>({Math.round(s.grams/nBirds)}g/bird)</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task sections — each rendered independently */}

            {/* Pre-Dawn lighting — only shown for Day 112+ */}
            {pdT.length > 0 && (
              <>
                <div style={{ background:"linear-gradient(135deg,rgba(25,25,60,0.8),rgba(40,30,80,0.6))", border:"1px solid rgba(147,112,219,0.4)", borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ fontSize:11, color:"#B39DDB", fontWeight:"bold", letterSpacing:2 }}>🌙 PRE-DAWN LIGHTING</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", background:"rgba(147,112,219,0.15)", padding:"3px 10px", borderRadius:20 }}>{lightPlan.totalHours}</div>
                  </div>
                  <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginBottom:8, letterSpacing:1 }}>CURRENT BV380 LIGHT PLAN</div>
                    <div className="auto-grid-2" style={{ gap:8 }}>
                      <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>Stage</div><div style={{ fontSize:12, color:"white", fontWeight:"bold" }}>{lightPlan.weekLabel}</div></div>
                      <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>Total Light</div><div style={{ fontSize:12, color:"white", fontWeight:"bold" }}>{lightPlan.totalHours}</div></div>
                      <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>Morning</div><div style={{ fontSize:12, color:"white", fontWeight:"bold" }}>{lightPlan.morning}</div></div>
                      <div><div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>Evening</div><div style={{ fontSize:12, color:"white", fontWeight:"bold" }}>{lightPlan.evening}</div></div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:6 }}>
                    <span style={{ color:"#B39DDB", fontWeight:"bold" }}>BV380 rule:</span> {lightPlan.action}
                  </div>
                  <div style={{ fontSize:11, color:"#EF9A9A" }}>⚠️ {lightPlan.note}</div>
                </div>
                <SessionBlock label="🌙 PRE-DAWN TASKS" color="#B39DDB" tasks={pdT} startIdx={pdStart} dayAge={dayAge} checked={checked} onToggle={toggle} readOnly={readOnly} />
              </>
            )}

            <SessionBlock label="🌅 MORNING TASKS"        color="#FFB74D" tasks={mT}  startIdx={pdT.length}          dayAge={dayAge} checked={checked} onToggle={toggle} readOnly={readOnly} />
            <SessionBlock label="🌤️ MID-MORNING TASKS"   color="#FFA726" tasks={mmT} startIdx={mmStart}             dayAge={dayAge} checked={checked} onToggle={toggle} readOnly={readOnly} />
            <SessionBlock label="☀️ AFTERNOON TASKS"      color="#FB8C00" tasks={aT}  startIdx={aStart}              dayAge={dayAge} checked={checked} onToggle={toggle} readOnly={readOnly} />
            <SessionBlock label="🌇 LATE-AFTERNOON TASKS" color="#F57C00" tasks={laT} startIdx={laStart}             dayAge={dayAge} checked={checked} onToggle={toggle} readOnly={readOnly} />
            <SessionBlock label="🌆 EVENING TASKS"        color="#E65100" tasks={eT}  startIdx={eStart}              dayAge={dayAge} checked={checked} onToggle={toggle} readOnly={readOnly} />

            {/* Next vax */}
            {VACCINATIONS.filter(v=>v.day>dayAge)[0] && (
              <div style={{ background:"rgba(30,136,229,0.1)", border:"1px solid rgba(30,136,229,0.3)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                <div style={{ fontSize:12, color:"#90CAF9", fontWeight:"bold", marginBottom:8 }}>💉 UPCOMING VACCINATION</div>
                <div style={{ fontSize:14, color:"white", fontWeight:"bold" }}>{VACCINATIONS.filter(v=>v.day>dayAge)[0].vaccine}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4 }}>Day {VACCINATIONS.filter(v=>v.day>dayAge)[0].day} — in <b style={{ color:"#90CAF9" }}>{VACCINATIONS.filter(v=>v.day>dayAge)[0].day-dayAge} days</b> · {VACCINATIONS.filter(v=>v.day>dayAge)[0].disease}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:4 }}>{VACCINATIONS.filter(v=>v.day>dayAge)[0].brands}</div>
              </div>
            )}

            <button onClick={sendDaily} disabled={readOnly} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#0088cc,#006699)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:"bold", cursor:readOnly?"not-allowed":"pointer", marginBottom:8, opacity:readOnly?0.65:1 }}>
              📱 Send Today's Update to Telegram
            </button>
            {tgStatus && <div style={{ textAlign:"center", fontSize:12, color:tgStatus.startsWith("✅")?"#81C784":"#EF9A9A", marginBottom:16 }}>{tgStatus}</div>}
          </>
        )}

        {/* ── FEED STORE ── */}
        {screen === "feed" && (() => {
          const stock        = calcRemainingStock(feedLogs, dayAge, nBirds);
          const plan60       = buildFeedPlan(dayAge, nBirds, 60);
          const currentPhase = getFeed(dayAge).phase;
          const daysLeft     = daysLeftInPhase(dayAge);
          const needBuyAlert = stock.daysRemaining <= 5 && stock.totalBought > 0 && !buyAlertDismissed[`${currentPhase}_${dayAge}`];
          const smartPlan    = plan60[0];
          const stockPct     = smartPlan ? Math.min(100, Math.round((stock.remaining / smartPlan.totalKg) * 100)) : 0;
          const stockColor   = stock.daysRemaining <= 3 ? "#EF5350" : stock.daysRemaining <= 7 ? "#FFB74D" : "#81C784";

          const addLog = async () => {
            if (readOnly) return;
            if (!newLog.kg || parseFloat(newLog.kg) <= 0) return;
            const log = { id:Date.now(), date:newLog.date, feedType:getFeed(dayAge).feedType, phase:currentPhase, kg:parseFloat(newLog.kg), pricePerKg:parseFloat(newLog.pricePerKg)||40, totalCost:Math.round(parseFloat(newLog.kg)*(parseFloat(newLog.pricePerKg)||40)) };
            saveFeedLogs([...feedLogs, log]);
            setShowAddForm(false);
            setNewLog({ kg:"", pricePerKg:FEED_PRICE_ESTIMATES[currentPhase]||40, date:toDateInputValue() });
          };
          const deleteLog    = async id => { if (readOnly) return; saveFeedLogs(feedLogs.filter(l=>l.id!==id)); };
          const dismissAlert = async () => { if (readOnly) return; const u={...buyAlertDismissed,[`${currentPhase}_${dayAge}`]:true}; saveBuyAlerts(u); };

          const calcEstimate = () => {
            let targetDays = parseInt(calcDays)||20;
            if (calcTargetDate) {
              const diff = diffCalendarDays(calcTargetDate, now);
              if (diff > 0) targetDays = diff;
            }
            return buildFeedPlan(dayAge, nBirds, targetDays);
          };

          return (
            <>
              <div style={{ fontSize:16, fontWeight:"bold", color:"#81C784", marginBottom:4 }}>🛒 Feed Store Manager</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Track purchases · Estimate stock · Get smart buy alerts</div>

              {/* Buy Alert */}
              {needBuyAlert && (
                <div style={{ background:"rgba(239,83,80,0.15)", border:"1px solid rgba(239,83,80,0.5)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:"bold", color:"#EF9A9A", marginBottom:6 }}>🚨 TIME TO BUY FEED!</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginBottom:4 }}>
                        Only <b style={{ color:"#EF9A9A" }}>{stock.daysRemaining} days</b> of {currentPhase} feed remaining.
                        {daysLeft <= 10 && ` Phase changes in ${daysLeft} days — buy carefully!`}
                      </div>
                      {smartPlan && <div style={{ fontSize:12, color:"#FFB74D" }}>💡 Buy <b>{smartPlan.smartKg}kg</b> ({smartPlan.bagsNeeded}×{smartPlan.bagSize}kg bags) · Est. ₹{smartPlan.estimatedCost.toLocaleString("en-IN")}</div>}
                    </div>
                    <button onClick={dismissAlert} disabled={readOnly} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.5)", padding:"4px 10px", borderRadius:8, cursor:readOnly?"not-allowed":"pointer", fontSize:11, flexShrink:0, marginLeft:8, opacity:readOnly?0.55:1 }}>Dismiss</button>
                  </div>
                </div>
              )}

              <div style={{ background:"rgba(30,136,229,0.08)", border:"1px solid rgba(30,136,229,0.28)", borderRadius:12, padding:16, marginBottom:16 }}>
                <div style={{ fontSize:11, color:"#90CAF9", fontWeight:"bold", letterSpacing:2, marginBottom:10 }}>📦 TOMORROW'S FEED PREP</div>
                <div style={{ fontSize:13, color:"white", marginBottom:10 }}>
                  Prepare for <b>Day {tomorrowSnapshot.day}</b> with <b>{tomorrowSnapshot.feed.feedType}</b>.
                </div>
                <div className="auto-grid-2" style={{ marginBottom:10 }}>
                  {[
                    ["Phase", tomorrowSnapshot.feed.phase],
                    ["Per bird/day", `${tomorrowSnapshot.feed.gramsPerBird[0]}–${tomorrowSnapshot.feed.gramsPerBird[1]}g`],
                    ["Total feed", `${tomorrowSnapshot.totalG}g`],
                    ["Water total", `${tomorrowSnapshot.totalWL}L`],
                  ].map(([k,v])=>(
                    <div key={k} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:"bold", color:"white" }}>{v}</div>
                    </div>
                  ))}
                </div>
                {tomorrowPhaseChange && (
                  <div style={{ marginBottom:10, padding:"8px 10px", background:"rgba(255,183,77,0.1)", borderRadius:8, fontSize:11, color:"#FFB74D" }}>
                    Tomorrow is a phase switch: <b>{feed.phase}</b> ends today, and <b>{tomorrowSnapshot.feed.phase}</b> starts tomorrow.
                  </div>
                )}
                <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"10px 12px" }}>
                  {tomorrowSnapshot.sessions.map((s,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:6, marginBottom:i<tomorrowSnapshot.sessions.length-1?6:0, borderBottom:i<tomorrowSnapshot.sessions.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>{s.icon} {s.label}</span>
                      <span style={{ fontSize:13, color:"#90CAF9", fontWeight:"bold" }}>{s.grams}g</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${stockColor}44`, borderRadius:12, padding:16, marginBottom:16 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>📦 CURRENT STOCK — {currentPhase} Phase</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div><div style={{ fontSize:28, fontWeight:"bold", color:stockColor }}>{stock.remaining}kg</div><div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>estimated remaining</div></div>
                  <div style={{ textAlign:"right" }}><div style={{ fontSize:22, fontWeight:"bold", color:stockColor }}>{stock.daysRemaining}d</div><div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>days left</div></div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:4, height:8, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ background:`linear-gradient(90deg,${stockColor},${stockColor}88)`, width:`${stockPct}%`, height:"100%", borderRadius:4 }} />
                </div>
                <div className="auto-grid-3">
                  {[["Daily use",`${stock.dailyKg}kg`],["Total bought",`${stock.totalBought}kg`],["Consumed",`~${stock.consumed}kg`]].map(([k,v])=>(
                    <div key={k} style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:"bold", color:"white" }}>{v}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{k}</div></div>
                  ))}
                </div>
                {daysLeft > 0 && daysLeft < 999 && (
                  <div style={{ marginTop:10, padding:"8px 10px", background:"rgba(255,183,77,0.1)", borderRadius:8, fontSize:11, color:"#FFB74D" }}>
                    ⚡ Phase ends in <b>{daysLeft} days</b> (Day {getFeed(dayAge).maxDay}). Switch to <b>{getFeed(getFeed(dayAge).maxDay+1).feedType}</b> after that.
                  </div>
                )}
              </div>

              {/* Smart Buy Suggestion */}
              {smartPlan && (
                <div style={{ background:"rgba(46,125,50,0.12)", border:"1px solid rgba(46,125,50,0.4)", borderRadius:12, padding:16, marginBottom:16 }}>
                  <div style={{ fontSize:11, color:"#A5D6A7", fontWeight:"bold", letterSpacing:2, marginBottom:10 }}>💡 SMART BUY SUGGESTION</div>
                  <div style={{ fontSize:13, color:"white", marginBottom:8 }}>For remaining <b style={{ color:"#A5D6A7" }}>{smartPlan.phaseDays} days</b> of {currentPhase} phase:</div>
                  <div className="auto-grid-2" style={{ marginBottom:10 }}>
                    {[["Exact need",`${smartPlan.totalKg}kg`],["Buy (bag size)",`${smartPlan.smartKg}kg`],["Bags to buy",`${smartPlan.bagsNeeded} × ${smartPlan.bagSize}kg`],["Est. cost",`₹${smartPlan.estimatedCost.toLocaleString("en-IN")}`]].map(([k,v])=>(
                      <div key={k} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{k}</div>
                        <div style={{ fontSize:14, fontWeight:"bold", color:"#A5D6A7" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {smartPlan.warning && <div style={{ fontSize:11, color:"#FFB74D", background:"rgba(255,183,77,0.1)", borderRadius:8, padding:"8px 10px" }}>{smartPlan.warning}</div>}
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:8 }}>Price estimate: ₹{smartPlan.pricePerKg}/kg (Kerala market). Use Calculator to adjust.</div>
                </div>
              )}

              {/* Add Purchase */}
              <button onClick={()=>{ if (readOnly) return; setShowAddForm(f=>!f); }} disabled={readOnly} style={{ width:"100%", padding:12, background:"linear-gradient(135deg,#2E7D32,#1B5E20)", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:"bold", cursor:readOnly?"not-allowed":"pointer", marginBottom:10, opacity:readOnly?0.65:1 }}>
                {showAddForm ? "✕ Cancel" : "➕ Log New Feed Purchase"}
              </button>
              {showAddForm && (
                <div style={{ background:"rgba(46,125,50,0.1)", border:"1px solid rgba(46,125,50,0.3)", borderRadius:12, padding:16, marginBottom:16 }}>
                  <div style={{ fontSize:12, color:"#A5D6A7", fontWeight:"bold", marginBottom:12 }}>📝 Record Feed Purchase</div>
                  <div style={{ background:"rgba(255,183,77,0.08)", borderRadius:8, padding:"8px 10px", marginBottom:12, fontSize:11, color:"#FFB74D" }}>
                    Logging for: <b>{getFeed(dayAge).feedType}</b> ({currentPhase} · Day {dayAge})
                  </div>
                  {[{label:"Date of Purchase",key:"date",type:"date"},{label:"Amount Bought (kg)",key:"kg",type:"number",ph:"25"},{label:"Price per kg (₹)",key:"pricePerKg",type:"number",ph:"40"}].map(f=>(
                    <div key={f.key} style={{ marginBottom:12 }}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>{f.label}</div>
                      <input type={f.type} placeholder={f.ph} value={newLog[f.key]} onChange={e=>setNewLog(p=>({...p,[f.key]:e.target.value}))} disabled={readOnly}
                        style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(46,125,50,0.4)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                    </div>
                  ))}
                  {newLog.kg && (
                    <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:12, color:"rgba(255,255,255,0.7)" }}>
                      Total cost: <b style={{ color:"#FFB74D" }}>₹{Math.round((parseFloat(newLog.kg)||0)*(parseFloat(newLog.pricePerKg)||40)).toLocaleString("en-IN")}</b>
                      {" · "}Lasts ~<b style={{ color:"#A5D6A7" }}>{stock.dailyKg>0?Math.floor((parseFloat(newLog.kg)||0)/stock.dailyKg):0} days</b>
                    </div>
                  )}
                  <button onClick={addLog} disabled={readOnly} style={{ width:"100%", padding:12, background:"#2E7D32", color:"white", border:"none", borderRadius:8, fontSize:14, fontWeight:"bold", cursor:readOnly?"not-allowed":"pointer", opacity:readOnly?0.65:1 }}>✅ Save Purchase</button>
                </div>
              )}

              {/* Purchase History */}
              {feedLogs.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>📋 PURCHASE HISTORY</div>
                  {[...feedLogs].reverse().map(log=>(
                    <div key={log.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, color:"white", fontWeight:"bold" }}>{log.kg}kg {log.feedType}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:2 }}>
                          {formatShortDate(log.date)} · ₹{log.pricePerKg}/kg · Total ₹{log.totalCost?.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:1 }}>{log.phase} phase</div>
                      </div>
                      <button onClick={()=>deleteLog(log.id)} disabled={readOnly} style={{ background:"rgba(239,83,80,0.15)", border:"1px solid rgba(239,83,80,0.3)", color:"#EF9A9A", padding:"4px 10px", borderRadius:6, cursor:readOnly?"not-allowed":"pointer", fontSize:11, flexShrink:0, opacity:readOnly?0.55:1 }}>🗑️</button>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textAlign:"right" }}>
                    Total spent: ₹{feedLogs.reduce((s,l)=>s+(l.totalCost||0),0).toLocaleString("en-IN")}
                  </div>
                </div>
              )}

              {/* Calculator */}
              <button onClick={()=>setShowCalc(f=>!f)} style={{ width:"100%", padding:12, background:"rgba(25,118,210,0.2)", color:"#90CAF9", border:"1px solid rgba(25,118,210,0.4)", borderRadius:10, fontSize:13, fontWeight:"bold", cursor:"pointer", marginBottom:10 }}>
                {showCalc ? "✕ Close Calculator" : "🧮 Feed Cost Calculator"}
              </button>
              {showCalc && (()=>{
                const estimate  = calcEstimate();
                const totalKg   = estimate.reduce((s,p)=>s+p.smartKg,0);
                const totalCost = estimate.reduce((s,p)=>s+p.estimatedCost,0);
                return (
                  <div style={{ background:"rgba(25,118,210,0.08)", border:"1px solid rgba(25,118,210,0.3)", borderRadius:12, padding:16, marginBottom:16 }}>
                    <div style={{ fontSize:12, color:"#90CAF9", fontWeight:"bold", marginBottom:12 }}>🧮 FEED COST CALCULATOR</div>
                    <div className="auto-grid-2" style={{ marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Calculate for (days)</div>
                        <input type="number" value={calcDays} onChange={e=>{setCalcDays(e.target.value);setCalcTargetDate("");}}
                          style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid rgba(25,118,210,0.3)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Or pick a target date</div>
                        <input type="date" value={calcTargetDate} onChange={e=>{setCalcTargetDate(e.target.value);setCalcDays("");}}
                          style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid rgba(25,118,210,0.3)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                      </div>
                    </div>
                    <div style={{ background:"rgba(25,118,210,0.12)", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>Total feed needed</span>
                        <span style={{ fontSize:14, fontWeight:"bold", color:"#90CAF9" }}>{totalKg}kg</span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>Estimated total cost</span>
                        <span style={{ fontSize:16, fontWeight:"bold", color:"#FFB74D" }}>₹{totalCost.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1, marginBottom:8 }}>PHASE-WISE BREAKDOWN</div>
                    {estimate.map((p,i)=>(
                      <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${phaseColor(p.phase)}33`, borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                          <div>
                            <div style={{ fontSize:12, fontWeight:"bold", color:"white" }}>{p.feedType}</div>
                            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Day {p.fromDay}–{p.toDay} · {p.phaseDays} days</div>
                          </div>
                          <div style={{ background:phaseColor(p.phase), borderRadius:8, padding:"2px 8px", fontSize:9, fontWeight:"bold", color:"white" }}>{p.phase}</div>
                        </div>
                        <div className="auto-grid-3" style={{ gap:6, marginBottom:p.warning?6:0 }}>
                          {[[`${p.dailyKg}kg/day`,"Daily use"],[`${p.smartKg}kg (${p.bagsNeeded}×${p.bagSize}kg)`,"Buy"],[`₹${p.estimatedCost.toLocaleString("en-IN")}`,`@ ₹${p.pricePerKg}/kg`]].map(([v,k])=>(
                            <div key={k} style={{ textAlign:"center", background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 4px" }}>
                              <div style={{ fontSize:11, fontWeight:"bold", color:"#FFB74D" }}>{v}</div>
                              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>{k}</div>
                            </div>
                          ))}
                        </div>
                        {p.warning && <div style={{ fontSize:10, color:"#FFB74D", background:"rgba(255,183,77,0.08)", borderRadius:6, padding:"6px 8px" }}>{p.warning}</div>}
                      </div>
                    ))}
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:4 }}>💡 Prices are Kerala market estimates. Actual may vary ±5–10%.</div>
                  </div>
                );
              })()}

              {/* 60-Day Roadmap */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>🗺️ 60-DAY FEED ROADMAP</div>
                {buildFeedPlan(dayAge, nBirds, 60).map((p,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                    <div style={{ width:3, borderRadius:2, background:phaseColor(p.phase), alignSelf:"stretch", flexShrink:0 }} />
                    <div style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"10px 12px", border:`1px solid ${phaseColor(p.phase)}22` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:"bold", color:"white" }}>{p.feedType}</span>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Day {p.fromDay}→{p.toDay}</span>
                      </div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>
                        {p.phaseDays} days · {p.smartKg}kg ({p.bagsNeeded}×{p.bagSize}kg bag) · <span style={{ color:"#FFB74D" }}>₹{p.estimatedCost.toLocaleString("en-IN")}</span>
                      </div>
                      {p.phaseTransitionDay && p.toDay < dayAge+60 && (
                        <div style={{ fontSize:10, color:"#90CAF9", marginTop:4 }}>→ Switches to {getFeed(p.phaseTransitionDay).feedType} on Day {p.phaseTransitionDay}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {screen === "docs" && (
          <>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#A5D6A7", marginBottom:4 }}>📚 BV380 Documents</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:16 }}>Official PDFs curated for BV380-style flocks in hot and tropical South Indian farm conditions.</div>

            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#A5D6A7", fontWeight:"bold", marginBottom:8 }}>What This Tab Contains</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>
                No official document found was labeled specifically as “BV380 South India”. These are the closest official Hendrix Genetics references for tropical BV380 management, chick start, nutrition, and transition to lay.
              </div>
            </div>

            {BV380_REFERENCE_DOCS.map(doc => (
              <div key={doc.title} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16, marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                      <div style={{ fontSize:14, color:"white", fontWeight:"bold" }}>{doc.title}</div>
                      <div style={{ background:"rgba(30,136,229,0.18)", borderRadius:999, padding:"2px 8px", fontSize:9, color:"#90CAF9", fontWeight:"bold" }}>{doc.type}</div>
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.68)", lineHeight:1.7, marginBottom:6 }}>{doc.note}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Source: {doc.source}</div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ background:"rgba(255,183,77,0.12)", border:"1px solid rgba(255,183,77,0.3)", borderRadius:8, padding:"8px 12px", color:"#FFB74D", fontSize:11, fontWeight:"bold", textDecoration:"none", whiteSpace:"nowrap", flexShrink:0 }}>
                    Open PDF
                  </a>
                </div>
              </div>
            ))}

            <div style={{ background:"rgba(25,118,210,0.08)", border:"1px solid rgba(25,118,210,0.28)", borderRadius:12, padding:16, marginTop:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, color:"#90CAF9", fontWeight:"bold" }}>🤖 BV380 Docs Assistant</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:4 }}>Answers are grounded in the built-in BV380 document knowledge base without internet search.</div>
                </div>
                <div style={{ fontSize:10, color:"#FFB74D", background:"rgba(255,183,77,0.12)", borderRadius:999, padding:"4px 10px", fontWeight:"bold", whiteSpace:"nowrap" }}>
                  Local Mode
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:12, marginBottom:12 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:8, letterSpacing:1 }}>GOOD QUESTIONS</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
                  • How should I manage BV380 chicks in Kerala heat during the first week?<br/>
                  • What should I prepare before the flock reaches lay?<br/>
                  • Why should layer feed not be started too early?<br/>
                  • What are the key ventilation priorities during monsoon humidity?
                </div>
              </div>

              <div style={{ maxHeight:420, overflowY:"auto", marginBottom:12, paddingRight:4 }}>
                {docsMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom:10, display:"flex", justifyContent:msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth:"92%", background:msg.role === "user" ? "rgba(232,119,34,0.18)" : "rgba(255,255,255,0.05)", border:`1px solid ${msg.role === "user" ? "rgba(232,119,34,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"12px 14px" }}>
                      <div style={{ fontSize:10, color:msg.role === "user" ? "#FFB74D" : "#90CAF9", fontWeight:"bold", marginBottom:6, letterSpacing:1 }}>
                        {msg.role === "user" ? "YOU" : "BV380 DOCS AI"}
                      </div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.82)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{msg.text}</div>
                      {msg.sources?.length > 0 && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:6, letterSpacing:1 }}>RETRIEVED SOURCES</div>
                          {msg.sources.map(source => (
                            <div key={source.id} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 10px", marginBottom:6 }}>
                              <div style={{ fontSize:10, color:"#A5D6A7", fontWeight:"bold" }}>{source.title}</div>
                              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{source.source}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:10 }}>
                <textarea
                  value={docsQuery}
                  onChange={e => setDocsQuery(e.target.value)}
                  placeholder="Ask a BV380 question based on the document knowledge base..."
                  rows={4}
                  style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(25,118,210,0.35)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:13, outline:"none", boxSizing:"border-box", resize:"vertical", fontFamily:"'DM Sans',sans-serif" }}
                />
              </div>
              {docsError && <div style={{ fontSize:11, color:"#EF9A9A", marginBottom:10 }}>{docsError}</div>}
              <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                <button onClick={askDocsAssistant} style={{ flex:1, padding:12, background:"linear-gradient(135deg,#1E88E5,#1565C0)", color:"white", border:"none", borderRadius:10, fontSize:13, fontWeight:"bold", cursor:"pointer" }}>
                  Ask BV380 AI
                </button>
                <button onClick={() => { setDocsMessages([{ role:"assistant", text:"Ask about BV380 chick start, tropical climate management, feeding, bodyweight, or transition to lay. Answers are grounded only in the built-in BV380 document knowledge base.", sources:[] }]); setDocsError(""); setDocsQuery(""); }} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.72)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, fontSize:12, cursor:"pointer" }}>
                  Clear
                </button>
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", lineHeight:1.6 }}>
                The assistant does not search the internet. It retrieves the closest matching BV380 knowledge chunks stored in this app and either answers locally or sends only that context to the configured Docs backend.
              </div>
            </div>
          </>
        )}

        {/* ── SCHEDULE ── */}
        {screen === "schedule" && (
          <>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#FFB74D", marginBottom:16 }}>📅 Full Schedule Overview</div>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16, marginBottom:20 }}>
              <div style={{ fontSize:12, color:"#FFB74D", fontWeight:"bold", letterSpacing:1, marginBottom:12 }}>🥚 LAY FORECAST</div>
              <div className="auto-grid-2" style={{ marginBottom:10 }}>
                {[
                  ["Current age", `Day ${dayAge}`],
                  ["Days to lay", dayAge >= 141 ? "Started" : `${daysToLay} days`],
                  ["Expected lay date", formatLongDate(expectedLayDate)],
                  ["Tomorrow feed", tomorrowSnapshot.feed.feedType],
                ].map(([k,v])=>(
                  <div key={k} style={{ background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{k}</div>
                    <div style={{ fontSize:13, color:"white", fontWeight:"bold" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.7 }}>
                {dayAge >= 141
                  ? `The flock is already in lay phase. Based on the current age record, laying should have started around ${formatLongDate(expectedLayDate)}.`
                  : `Based on the current age record, laying is expected around ${formatLongDate(expectedLayDate)}. Use tomorrow's feed preview to prepare in advance as the flock approaches lay.`}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>BV380 LIGHTING PROGRAMME</div>
              {LIGHT_SCHEDULE.filter(l => l.minDay <= 141).map((l,i)=>{
                const active = dayAge >= l.minDay && dayAge <= l.maxDay;
                const past = dayAge > l.maxDay;
                return (
                  <div key={i} style={{ background:active?"rgba(147,112,219,0.14)":past?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)", border:`1px solid ${active?"rgba(147,112,219,0.45)":"rgba(255,255,255,0.08)"}`, borderRadius:10, padding:"12px 14px", marginBottom:8, opacity:past?0.55:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ fontSize:13, fontWeight:"bold", color:active?"#B39DDB":"white" }}>{active?"▶ ":""}Day {l.minDay}–{l.maxDay}</div>
                      <div style={{ background:"rgba(147,112,219,0.22)", borderRadius:10, padding:"2px 10px", fontSize:10, fontWeight:"bold", color:"#D1C4E9" }}>{l.totalHours}</div>
                    </div>
                    <div style={{ fontSize:12, color:"white", fontWeight:"bold", marginBottom:4 }}>{l.weekLabel}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>Morning: {l.morning}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>Evening: {l.evening}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:6 }}>{l.note}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>FEED PHASES</div>
              {FEED_SCHEDULE.map((f,i)=>{
                const active = dayAge>=f.minDay&&dayAge<=f.maxDay, past=dayAge>f.maxDay, fpc=phaseColor(f.phase);
                return (
                  <div key={i} style={{ background:active?`${fpc}22`:past?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)", border:`1px solid ${active?fpc:"rgba(255,255,255,0.08)"}`, borderRadius:10, padding:"12px 14px", marginBottom:8, opacity:past?0.5:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ fontSize:13, fontWeight:"bold", color:active?"#FFB74D":"white" }}>{active?"▶ ":""}Day {f.minDay}–{f.maxDay===999?"onwards":f.maxDay}</div>
                      <div style={{ background:fpc, borderRadius:10, padding:"2px 10px", fontSize:10, fontWeight:"bold", color:"white" }}>{f.phase}</div>
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}><b>{f.feedType}</b> · {f.gramsPerBird[0]}–{f.gramsPerBird[1]}g/bird · {f.freq}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:4 }}>Protein: {f.proteinPct} · Water: {f.waterMl[0]}–{f.waterMl[1]}ml/bird</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>BV380 WEIGHT TARGETS</div>
              {WEIGHT_TARGETS.map((w,i)=>{
                const active = dayAge <= w.day && (i === 0 || dayAge > WEIGHT_TARGETS[i - 1].day);
                const past = dayAge > w.day;
                const avg = midpoint(w.grams);
                return (
                  <div key={w.day} style={{ background:active?"rgba(255,183,77,0.12)":past?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)", border:`1px solid ${active?"rgba(255,183,77,0.45)":"rgba(255,255,255,0.08)"}`, borderRadius:10, padding:"12px 14px", marginBottom:8, opacity:past?0.55:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ fontSize:13, fontWeight:"bold", color:active?"#FFB74D":"white" }}>{active?"▶ ":""}Day {w.day}</div>
                      <div style={{ fontSize:11, color:"#90CAF9", fontWeight:"bold" }}>Avg {avg}g</div>
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)" }}>Expected bodyweight: <b style={{ color:"white" }}>{formatWeightRange(w.grams)}</b></div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:10 }}>VACCINATION TIMELINE — tap any vaccine for full details</div>
              {VACCINATIONS.map((v,i)=>{
                const isDone = dayAge>v.day, isToday = dayAge===v.day, isSoon = v.day>dayAge&&v.day-dayAge<=14;
                const statusColor = isDone?"#81C784":isToday?"#EF5350":isSoon?"#FFB74D":"rgba(255,255,255,0.3)";
                return (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:isDone?"rgba(129,199,132,0.2)":isToday?"rgba(239,83,80,0.2)":isSoon?"rgba(255,183,77,0.2)":"rgba(255,255,255,0.08)", border:`2px solid ${statusColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>
                        {isDone?"✓":isToday?"!":"💉"}
                      </div>
                      {i<VACCINATIONS.length-1 && <div style={{ width:1, height:30, background:"rgba(255,255,255,0.08)", marginTop:4 }} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <div onClick={()=>setSelectedVax(v)} style={{ background:isToday?"rgba(239,83,80,0.1)":isDone?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)", border:`1px solid ${isToday?"rgba(239,83,80,0.4)":isDone?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.1)"}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all 0.2s", opacity:isDone?0.6:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:"bold", color:isToday?"#EF9A9A":isDone?"rgba(255,255,255,0.5)":"white" }}>Day {v.day} — {v.vaccine}</div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{v.disease}</div>
                          </div>
                          {!isDone && <div style={{ fontSize:10, color:statusColor, fontWeight:"bold", flexShrink:0, marginLeft:8 }}>{isToday?"TODAY":isSoon?`in ${v.day-dayAge}d`:`in ${v.day-dayAge}d`}</div>}
                          {isDone && <div style={{ fontSize:10, color:"#81C784", fontWeight:"bold" }}>✓ Done</div>}
                        </div>
                        <div className="auto-grid-2" style={{ gap:6 }}>
                          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 8px" }}>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>METHOD</div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{v.method}</div>
                          </div>
                          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 8px" }}>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>DOSE/BIRD</div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{v.dosePerBird.split("—")[0].split(".")[0]}</div>
                          </div>
                          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"6px 8px", gridColumn:"1/-1" }}>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:2 }}>BUY QUANTITY (for {nBirds} birds)</div>
                            <div style={{ fontSize:11, color:"#FFB74D", fontWeight:"bold" }}>{v.buyQty}</div>
                          </div>
                        </div>
                        <div style={{ marginTop:8, fontSize:10, color:"rgba(255,255,255,0.35)", textAlign:"center" }}>👆 Tap for full preparation & serving guide</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SETTINGS ── */}
        {screen === "settings" && (
          <>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#FFB74D", marginBottom:16 }}>⚙️ Farm Settings</div>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:12 }}>FLOCK INFO</div>
              {[{label:"Number of Birds",key:"numBirds",type:"number"},{label:"Notification Time (IST)",key:"notifyTime",type:"time"}].map(f=>(
                <div key={f.key} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>{f.label}</div>
                  <input type={f.type} value={settings[f.key]} disabled={readOnly} onChange={async e=>{ const v=f.type==="number"?parseInt(e.target.value)||0:e.target.value; await saveS({[f.key]:v}); }}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(232,119,34,0.3)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(0,136,204,0.08)", border:"1px solid rgba(0,136,204,0.3)", borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:12, color:"#90CAF9", letterSpacing:2 }}>📱 TELEGRAM</div>
                {settings.botToken && settings.chatId && <div style={{ fontSize:11, color:"#81C784", background:"rgba(46,125,50,0.2)", padding:"2px 10px", borderRadius:10 }}>✅ Saved</div>}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:12 }}>Credentials are saved automatically as you type — you only need to enter these once.</div>
              {[{label:"Bot Token",key:"botToken",ph:"123456:ABCdef..."},{label:"Chat ID",key:"chatId",ph:"123456789"}].map(f=>(
                <div key={f.key} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>{f.label}</div>
                  <input type="text" placeholder={f.ph} value={settings[f.key]||""} disabled={readOnly} onChange={async e=>{ await saveS({[f.key]:e.target.value}); setTemp(p=>({...p,[f.key]:e.target.value})); }}
                    style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${settings[f.key]?"rgba(46,125,50,0.5)":"rgba(0,136,204,0.3)"}`, background:"rgba(255,255,255,0.05)", color:"white", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }} />
                </div>
              ))}
              <button onClick={sendTest} disabled={readOnly} style={{ width:"100%", padding:10, background:"rgba(0,136,204,0.2)", color:"#90CAF9", border:"1px solid rgba(0,136,204,0.4)", borderRadius:8, cursor:readOnly?"not-allowed":"pointer", fontSize:13, opacity:readOnly?0.65:1 }}>🧪 Test Connection</button>
              {tgStatus && <div style={{ textAlign:"center", fontSize:12, color:tgStatus.startsWith("✅")?"#81C784":"#EF9A9A", marginTop:8 }}>{tgStatus}</div>}
            </div>
            <button onClick={sendDaily} disabled={readOnly} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#0088cc,#005f8f)", color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:"bold", cursor:readOnly?"not-allowed":"pointer", marginBottom:10, opacity:readOnly?0.65:1 }}>📤 Send Today's Update Now</button>
            {/* Update flock date */}
            <div style={{ background:"rgba(255,183,77,0.07)", border:"1px solid rgba(255,183,77,0.25)", borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:12, color:"#FFB74D", fontWeight:700, marginBottom:6 }}>📅 Update Tracking Date</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:12, lineHeight:1.7 }}>
                If you want to correct the start date or bird age without clearing any other data, update here and save.
              </div>
              <div className="auto-grid-2" style={{ marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Bird age when you started (days)</div>
                  <input type="number" value={settings.chickenAge||""} disabled={readOnly} onChange={e=>saveS({chickenAge:parseInt(e.target.value)||0})}
                    className="fm-input" style={{ padding:"9px 12px" }} />
                </div>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Date you started tracking</div>
                  <input type="date" value={toDateInputValue(settings.startDate)} disabled={readOnly}
                    onChange={e=>saveS({startDate:e.target.value})}
                    className="fm-input" style={{ padding:"9px 12px" }} />
                </div>
              </div>
              <div style={{ fontSize:12, color:"#A5D6A7", background:"rgba(46,125,50,0.15)", borderRadius:8, padding:"8px 12px" }}>
                ✅ Current calculated age: <b>Day {dayAge}</b>
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ background:"rgba(239,83,80,0.07)", border:"1px solid rgba(239,83,80,0.25)", borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:12, color:"#EF9A9A", fontWeight:700, marginBottom:6 }}>⚠️ Danger Zone</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:12, lineHeight:1.7 }}>
                Full reset clears all settings, Telegram credentials, feed logs, purchase history, and cage entries. Use only if starting fresh with new birds.
              </div>
              <button onClick={handleReset} disabled={readOnly} style={{ width:"100%", padding:12, background:"rgba(239,83,80,0.15)", color:"#EF9A9A", border:"1px solid rgba(239,83,80,0.4)", borderRadius:10, fontSize:13, fontWeight:700, cursor:readOnly?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:readOnly?0.55:1 }}>
                🗑️ Reset All Data & Start Fresh
              </button>
            </div>
            <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.2)", borderRadius:12, padding:14, marginTop:16 }}>
              <div style={{ fontSize:12, color:"#FFB74D", fontWeight:"bold", marginBottom:8 }}>ℹ️ How Notifications Work</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>
                • Bot Token &amp; Chat ID are saved permanently to your device<br/>
                • App auto-sends at your set time every day<br/>
                • <b style={{ color:"rgba(255,255,255,0.7)" }}>Keep this tab open</b> for browser auto-send to work<br/>
                • The Node.js bot on your Ubuntu server sends 24/7 independently<br/>
                • Press "Send Today's Update" anytime to send manually
              </div>
            </div>
          </>
        )}


        {/* ══════════════════════════════════════════════════════════════
            🩺  HEALTH TAB
        ══════════════════════════════════════════════════════════════ */}
        {screen === "health" && (
          <HealthTab dayAge={dayAge} nBirds={nBirds} />
        )}

        {/* ══════════════════════════════════════════════════════════════
            🌿  GREENS TAB
        ══════════════════════════════════════════════════════════════ */}
        {screen === "greens" && (
          <GreensTab />
        )}

        {/* ══════════════════════════════════════════════════════════════
            💰  FINANCE TAB
        ══════════════════════════════════════════════════════════════ */}
        {screen === "finance" && (
          <FinanceTab entries={financeEntries} onSave={saveFinanceEntries} readOnly={readOnly} />
        )}

        {/* ══════════════════════════════════════════════════════════════
            🫙  FERMENTED FEED TAB
        ══════════════════════════════════════════════════════════════ */}
        {screen === "ferment" && (
          <FermentTab dayAge={dayAge} feed={feed} />
        )}

        {/* ══════════════════════════════════════════════════════════════
            🐔  CAGES TAB
        ══════════════════════════════════════════════════════════════ */}
        {screen === "cages" && (
          <CagesTab cages={cages} onSave={saveCages} readOnly={readOnly} now={now} />
        )}

        {/* ── VACCINE DETAIL MODAL ── */}
      {selectedVax && (
        <div onClick={()=>setSelectedVax(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"0" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#1a0a00", border:`1px solid ${selectedVax.color}55`, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:680, maxHeight:"88vh", overflowY:"auto", padding:"0 0 32px 0" }}>
            {/* Modal header */}
            <div style={{ background:`linear-gradient(135deg,${selectedVax.color},${selectedVax.color}99)`, padding:"20px 20px 16px", borderRadius:"20px 20px 0 0", position:"sticky", top:0, zIndex:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", letterSpacing:2, marginBottom:4 }}>DAY {selectedVax.day} VACCINATION</div>
                  <div style={{ fontSize:17, fontWeight:"bold", color:"white", lineHeight:1.3 }}>{selectedVax.vaccine}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)", marginTop:4 }}>Protection: {selectedVax.disease}</div>
                </div>
                <button onClick={()=>setSelectedVax(null)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:16, flexShrink:0 }}>✕</button>
              </div>
            </div>

            <div style={{ padding:"16px 20px" }}>

              {/* Buy quantity highlight */}
              <div style={{ background:`${selectedVax.color}22`, border:`1px solid ${selectedVax.color}55`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1, marginBottom:6 }}>🛒 WHAT TO BUY — for {nBirds} birds</div>
                <div style={{ fontSize:15, color:"#FFB74D", fontWeight:"bold", marginBottom:4 }}>{selectedVax.buyQty}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>Vial size: {selectedVax.vialSize}</div>
              </div>

              {/* Quick info grid */}
              <div className="auto-grid-2" style={{ marginBottom:16 }}>
                {[
                  ["💉 Method",       selectedVax.method],
                  ["🐔 Dose/Bird",    selectedVax.dosePerBird],
                  ["💧 Water Needed", selectedVax.waterRequired],
                  ["🧊 Storage",      selectedVax.storage],
                ].map(([k,v])=>(
                  <div key={k} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:11, color:"white", lineHeight:1.4 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Brands */}
              <div style={{ background:"rgba(255,183,77,0.08)", border:"1px solid rgba(255,183,77,0.2)", borderRadius:10, padding:"10px 12px", marginBottom:16 }}>
                <div style={{ fontSize:10, color:"#FFB74D", fontWeight:"bold", marginBottom:4 }}>🏪 BRANDS AVAILABLE IN KERALA</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{selectedVax.brands}</div>
              </div>

              {/* Before vaccination */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:"#EF9A9A", fontWeight:"bold", marginBottom:8 }}>⚠️ BEFORE VACCINATION</div>
                {selectedVax.beforeVax.map((s,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                    <span style={{ color:"#EF9A9A", fontSize:12, flexShrink:0, marginTop:1 }}>{i+1}.</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Prep steps */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:"#90CAF9", fontWeight:"bold", marginBottom:8 }}>🧪 PREPARATION STEPS</div>
                {selectedVax.prepSteps.map((s,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start", background:"rgba(30,136,229,0.07)", borderRadius:8, padding:"8px 10px" }}>
                    <span style={{ background:"#1E88E5", color:"white", fontSize:10, fontWeight:"bold", width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", lineHeight:1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Serving steps */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, color:"#A5D6A7", fontWeight:"bold", marginBottom:8 }}>✅ HOW TO GIVE IT (Step by Step)</div>
                {selectedVax.servingSteps.map((s,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start", background:"rgba(46,125,50,0.1)", borderRadius:8, padding:"8px 10px" }}>
                    <span style={{ background:"#2E7D32", color:"white", fontSize:10, fontWeight:"bold", width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.8)", lineHeight:1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* After care */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:"#CE93D8", fontWeight:"bold", marginBottom:8 }}>🩺 AFTER CARE</div>
                {selectedVax.afterCare.map((s,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                    <span style={{ color:"#CE93D8", fontSize:14, flexShrink:0 }}>•</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              <button onClick={()=>setSelectedVax(null)} style={{ width:"100%", padding:14, background:`linear-gradient(135deg,${selectedVax.color},${selectedVax.color}99)`, color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:"bold", cursor:"pointer" }}>
                Got it — Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>{/* end app-body */}

    {/* Bottom nav — mobile only */}
    <nav className="app-bottomnav">
      {NAV.map(([s,icon,label])=>(
        <button key={s} className={`app-bottomnav-item${screen===s?" active":""}`} onClick={()=>setScreen(s)}>
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  </div>
  );
}
