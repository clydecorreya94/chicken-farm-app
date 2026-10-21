function TaskCard({ t, globalIdx, dayAge, checked, onToggle, readOnly }) {
  const done = !!checked[`${dayAge}_${globalIdx}`];
  const priColor = { urgent:"#EF9A9A", high:"#FFB74D", medium:"rgba(255,255,255,0.5)", low:"rgba(255,255,255,0.25)" }[t.priority] || "#fff";
  const priBg    = { urgent:"rgba(239,83,80,0.12)", high:"rgba(255,183,77,0.08)", medium:"transparent", low:"transparent" }[t.priority] || "transparent";
  return (
    <div onClick={() => !readOnly && onToggle(globalIdx)}
      role={readOnly ? undefined : "checkbox"}
      aria-checked={done}
      aria-label={t.task}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={readOnly ? undefined : e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(globalIdx); } }}
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

export { TaskCard, SessionBlock };
