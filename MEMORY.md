# Project Memory — Chicken Farm App (BV380 Farm Manager)

_Last updated: 2026-10-26_

## Profile

- React 19 + Vite 7 single-page app for managing a small BV380 layer flock (phone/desktop, Kerala conditions).
- Almost all logic lives in one file: `src/App.jsx` (~3,420 lines) — data tables, helpers, ~12 components, and a large inline `GLOBAL_CSS` string injected via `StyleInjector`.
- Auth: hardcoded client-side accounts (`admin123`/`admin123`, `guest`/`guest123`); admin edits, guest read-only. Session in `localStorage` (`bv380_session`), no expiry.
- Data: single normalized blob in `localStorage` key `bv380_shared_data` (settings, feedLogs, buyAlertDismissed, finance, cages), read once at module load into `INITIAL_SHARED`/`INITIAL_SESSION`. Legacy keys (`bv380_settings`, `bv380_feedlogs`, `bv380_buyalerts`, `bv380_finance`, `bv380_cages`) still migrate on first load; `bv380_finance` is mirrored on save.
- Telegram daily-notification: browser-side scheduler effect that self-rearms a `setTimeout` to the configured `notifyTime`, sender held in `sendDailyRef`; README notes it only works while the tab stays open.
- Deploy: `./deploy.sh` → npm install/build, copies `dist/` to `/var/www/farm/`, `nginx -t`, reload. Hardcoded `APP_ROOT=/home/clyde/chicken-farm-app`; site at `http://192.168.0.122:8080/`.

## Verification commands

- `npm run lint` (eslint .) — **passes clean, 0 errors 0 warnings** (as of 2026-10-19).
- `npm run build` — passes; single chunk ~385 kB (111 kB gzip).
- No test suite exists (no test files in repo).

## Session state (2026-10-26)

- Backlog #3 (security) implemented, decisions from user: **Cloudflare Worker** proxy for Telegram, credentials **kept as-is + documented only**:
  - New `cloudflare/` Worker (`worker.js` + `wrangler.toml` + README): `POST /send` with `{chat_id, text, parse_mode}` holds `TELEGRAM_BOT_TOKEN` as a Wrangler secret, `GET /health`, CORS via `ALLOWED_ORIGIN` var. **Not deployed** — needs `npx wrangler login` + `secret put` + `deploy`.
  - `tgProxyUrl` setting added to `DEFAULT_SETTINGS`/`DEFAULT_TEMP`; `sendTg` posts to `<proxy>/send` when set, falls back to direct `api.telegram.org` when only `botToken`+`chatId` exist; scheduler guard/deps updated for proxy-only setups (gate is `chatId`, not `botToken`).
  - Setup wizard + Settings → Telegram panels gained a Proxy URL field; README gained a "Security Notes" section stating the plaintext-credentials trade-off.
- Backlog #8 (CI workflow + atomic symlink deploy.sh) still open — scope choice was "security only".
- Verification: `npm run lint` clean, `npm run build` passes (334 kB / 97 kB gzip), Node smoke-test of the Worker handler passed (7 checks, fetch stubbed); UI seen via `npm run preview` at http://192.168.0.122:4173/.

## Session state (2026-10-19)

- Fixed all 9 lint errors + 1 warning in `src/App.jsx`; **changes are uncommitted** (`git status`: modified `src/App.jsx`, +67/-55).
  - Removed unused `HealthTab` params (`dayAge`, `nBirds`) and dead `isGrower`/`isPreLayer`/`isLayer` in `FermentTab`.
  - Moved `lsGet`/`lsSet` to module scope; empty `catch` now logs via `console.warn`.
  - Replaced localStorage-hydration effect with module-load init (`INITIAL_SHARED`/`INITIAL_SESSION`); removed `hydrated` flag/loading screen; a mount effect persists the normalized snapshot for legacy-key migration.
  - Deleted dead FinanceTab category-sync effect (the only `setFormType` site already resets `form.category`).
  - Rewrote notification effect as a self-rearming `setTimeout` at exact `notifyTime` with `notifSentRef` guard — intentional behavior change: fires at the exact minute instead of matching a 60s clock tick.
  - No eslint-disable comments or rule weakenings were used.
- Not runtime-tested in a browser (no Chrome in this environment); login → dashboard → Telegram flow rests on code analysis.

## Improvement backlog (user interested; none implemented yet)

1. Split `src/App.jsx` into `src/data/`, `src/lib/`, `src/components/`.
2. Move `GLOBAL_CSS` string into `src/index.css`/`App.css`; drop Google Fonts `@import` (breaks offline claim).
3. ~~Security: Telegram bot token~~ — done 2026-10-26 (Cloudflare Worker proxy in `cloudflare/`, deploy pending). Hardcoded/plaintext credentials intentionally kept: documented in README "Security Notes" instead.
4. Persist task checkmarks (`checked` state is in-memory only, keyed by fragile `${dayAge}_${i}` index).
5. JSON export/import backup for farm data; storage schema versioning.
6. PWA (manifest + service worker), local `Notification` API fallback, error boundary, accessibility (labels/aria/focus trap).
7. Perf: memoize derived task/feed-plan lists, `React.lazy` tab code-splitting, extract the 60s clock into `useNow()`.
8. CI (lint + build workflow); `deploy.sh` hardcoded path and non-atomic `rm -rf` copy → symlink swap.
9. `index.html`: title still `chicken-farm-app`, `vite.svg` favicon, no meta description/theme-color.
