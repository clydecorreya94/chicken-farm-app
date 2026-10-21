// Cage management: per-cage chick log + daily feed requirement.
import { parseDateValue, diffCalendarDays, toDateInputValue, addCalendarDays, formatLongDate } from "../lib/dates";
import { getDayFeedSnapshot, phaseColor, isTransitionWeek, getPrevFeed, getWeightTarget, transitionRatio, getFeed, midpoint, formatWeightRange } from "../lib/feed";
import { VACCINATIONS } from "../data/schedule";
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

export { CageHomeSection };
export default CagesTab;
