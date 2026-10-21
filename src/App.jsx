import { useState, useEffect, useCallback, useRef } from "react";
import { FEED_SCHEDULE, LIGHT_SCHEDULE, VACCINATIONS, WEIGHT_TARGETS } from "./data/schedule";
import { BV380_REFERENCE_DOCS, searchDocKnowledge, buildLocalDocAnswer } from "./data/docs";
import { diffCalendarDays, addCalendarDays, formatLongDate, formatShortDate, toDateInputValue } from "./lib/dates";
import { getFeed, getLightPlan, getWeightTarget, midpoint, formatWeightRange, phaseColor, getDayFeedSnapshot, buildFeedPlan, calcRemainingStock, daysLeftInPhase, FEED_PRICE_ESTIMATES } from "./lib/feed";
import { buildTasks, buildTelegram } from "./lib/tasks";
import { SHARED_DATA_KEY, SESSION_KEY, DEFAULT_SETTINGS, DEFAULT_TEMP, AUTH_USERS, normalizeSharedData, lsSet, INITIAL_SHARED, INITIAL_SESSION } from "./lib/storage";
import HealthTab from "./components/HealthTab";
import GreensTab from "./components/GreensTab";
import FinanceTab from "./components/FinanceTab";
import FermentTab from "./components/FermentTab";
import CagesTab, { CageHomeSection } from "./components/CagesTab";
import { SessionBlock } from "./components/TaskCard";

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState(() => (!INITIAL_SHARED.settings.setupDone ? "setup" : (INITIAL_SHARED.cages.length ? "dashboard" : "cagegate")));
  const [step,      setStep]      = useState(1);
  const [settings,  setSettings]  = useState(INITIAL_SHARED.settings);
  const [temp,      setTemp]      = useState(INITIAL_SHARED.settings);
  const [checked,   setChecked]   = useState({});
  const [tgStatus,  setTgStatus]  = useState("");
  const [now,       setNow]       = useState(new Date());
  const notifSentRef = useRef("");
  const sendDailyRef = useRef(() => {});
  const [feedLogs,  setFeedLogs]  = useState(INITIAL_SHARED.feedLogs);
  const [buyAlertDismissed, setBuyAlertDismissed] = useState(INITIAL_SHARED.buyAlertDismissed);
  const [financeEntries, setFinanceEntries] = useState(INITIAL_SHARED.finance);
  const [cages, setCages] = useState(INITIAL_SHARED.cages);
  const [authUser, setAuthUser] = useState(INITIAL_SESSION);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
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
  // Persist the normalized snapshot once on mount (also migrates legacy keys).
  useEffect(() => {
    lsSet(SHARED_DATA_KEY, INITIAL_SHARED);
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
  // Keep the latest sender in a ref so the scheduling effect below has stable deps.
  useEffect(() => { sendDailyRef.current = sendDaily; });
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

  // Schedule the daily Telegram send as a self-re-arming timer (an external
  // subscription), instead of checking the clock synchronously in an effect.
  useEffect(() => {
    if (!settings.botToken || !settings.chatId || !settings.setupDone) return undefined;
    const [h, m] = settings.notifyTime.split(":").map(Number);
    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) return undefined;

    const msUntilNext = from => {
      const target = new Date(from);
      target.setHours(h, m, 0, 0);
      if (target.getTime() <= from.getTime()) target.setDate(target.getDate() + 1);
      return target.getTime() - from.getTime();
    };

    let timer = setTimeout(function run() {
      const key = new Date().toDateString();
      if (notifSentRef.current !== key) {
        notifSentRef.current = key;
        sendDailyRef.current();
      }
      timer = setTimeout(run, msUntilNext(new Date()));
    }, msUntilNext(new Date()));

    return () => clearTimeout(timer);
  }, [settings.botToken, settings.chatId, settings.notifyTime, settings.setupDone]);

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

  if (!authUser) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a0a00,#2d1500,#1a0a00)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
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
          <HealthTab />
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
