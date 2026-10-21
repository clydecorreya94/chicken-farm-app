# Project Memory — Chicken Farm App (BV380 Farm Manager)

_Last updated: 2026-10-19_

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
3. Security: hardcoded/plaintext credentials; Telegram bot token stored in `localStorage` and called directly from browser (exposable) — proxy via backend.
4. Persist task checkmarks (`checked` state is in-memory only, keyed by fragile `${dayAge}_${i}` index).
5. JSON export/import backup for farm data; storage schema versioning.
6. PWA (manifest + service worker), local `Notification` API fallback, error boundary, accessibility (labels/aria/focus trap).
7. Perf: memoize derived task/feed-plan lists, `React.lazy` tab code-splitting, extract the 60s clock into `useNow()`.
8. CI (lint + build workflow); `deploy.sh` hardcoded path and non-atomic `rm -rf` copy → symlink swap.
9. `index.html`: title still `chicken-farm-app`, `vite.svg` favicon, no meta description/theme-color.
