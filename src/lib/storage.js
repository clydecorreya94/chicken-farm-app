// localStorage keys, defaults, auth users, and module-load hydration.
import { toDateInputValue } from "./dates";
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

// ── localStorage helpers (module scope so first render can hydrate synchronously) ──
const lsGet = key => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (err) {
    console.warn(`Could not read "${key}" from localStorage:`, err);
    return null;
  }
};
const lsSet = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Could not write "${key}" to localStorage:`, err);
  }
};

// Hydrate once at module load (client-only app) instead of in a render effect.
const INITIAL_SHARED = loadSharedData(lsGet);
const INITIAL_SESSION = (() => {
  const session = lsGet(SESSION_KEY);
  const user = session?.username ? AUTH_USERS[session.username] : null;
  return user ? { username: user.username, role: user.role, label: user.label } : null;
})();

export { SHARED_DATA_KEY, SESSION_KEY, DEFAULT_SETTINGS, DEFAULT_TEMP, AUTH_USERS, normalizeSharedData, loadSharedData, lsGet, lsSet, INITIAL_SHARED, INITIAL_SESSION };
