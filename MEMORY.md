# Project Memory — Chicken Farm App (BV380 Farm Manager)

_Last updated: 2026-11-10_

## Profile

- React 19 + Vite 7 single-page app for managing a small BV380 layer flock (phone/desktop, Kerala conditions).
- **Split structure** (was one 3,420-line file): `src/App.jsx` (~1,420 lines, shell + shared state + a few screens), `src/components/` (Cages/Ferment/Finance/Greens/Health/TaskCard/ErrorBoundary), `src/data/` (docs, greens, health, schedule), `src/lib/` (dates, feed, storage, tasks, useNow). `GLOBAL_CSS` lives in `src/index.css`; no Google Fonts network `@import`.
- Auth: hardcoded client-side accounts (`admin123`/`admin123`, `guest`/`guest123`); admin edits, guest read-only. Session in `localStorage` (`bv380_session`), no expiry. **Accepted trade-off, documented in README "Security Notes"** — it only gates the UI.
- Data: single normalized blob in `localStorage` key `bv380_shared_data` (schemaVersion 1: settings, feedLogs, buyAlertDismissed, finance, cages, taskChecks), read once at module load into `INITIAL_SHARED`/`INITIAL_SESSION`. Legacy keys (`bv380_settings`, `bv380_feedlogs`, `bv380_buyalerts`, `bv380_finance`, `bv380_cages`) still migrate on first load; `bv380_finance` is mirrored on save. JSON export/import of the blob exists in Settings.
- Telegram daily-notification: browser-side scheduler effect that self-rearms a `setTimeout` to the configured `notifyTime` (gates on `chatId` + proxy/token), sender held in `sendDailyRef`; only works while the tab stays open. **Sends prefer the `tgProxyUrl` Cloudflare Worker** (`POST <proxy>/send`, token lives only in the Worker's `TELEGRAM_BOT_TOKEN` secret); legacy direct `api.telegram.org` call remains as fallback when only `botToken`+`chatId` are set.
- Deploy: `./deploy.sh` → npm install/build, copies `dist/` to `/var/www/farm/`, `nginx -t`, reload. Hardcoded `APP_ROOT=/home/clyde/chicken-farm-app`; site at `http://192.168.0.122:8080/`. `/var/www/farm` is root/www-data-owned — **deploy.sh needs an interactive sudo password** (cannot run unattended from a session here).
- PWA: `public/sw.js` registered in production (`src/main.jsx`), manifest + `favicon.svg`, real title/meta description/theme-color in `index.html`.

## Verification commands

- `npm run lint` (eslint .) — **clean, 0 errors 0 warnings** (as of 2026-10-26).
- `npm run build` — passes; main chunk 334 kB (97 kB gzip) + lazy tab chunks.
- No test suite in repo. Ad-hoc Worker smoke test (Node, stubbed `fetch`, 7 checks) was run once for `cloudflare/worker.js`; file was temporary and not committed.

## Session state (2026-11-10)

- Backlog **#8 (CI half)** drafted but **not committed**: `.github/workflows/ci.yml` (push to `main` + PRs, Node 22 + `npm ci` cache, `npm run lint`, `npm run build`) exists untracked on disk and was verified locally — lint exit 0, build exit 0 (334 kB main chunk, unchanged), YAML parses with one `verify` job / 5 steps. Pushing it over HTTPS with the current PAT fails: `refusing to allow a Personal Access Token to create or update workflow .github/workflows/ci.yml without workflow scope`. Unblock by adding the `workflow` scope to the token, or push over SSH (the restriction only applies to HTTPS + PAT).
- Repo was at `origin/main` = `92c32d4` at session start. Push attempts from this session fail for lack of credentials (`could not read Username for 'https://github.com'`, no helper, no `GH_TOKEN`); user pushes manually.
- Out of scope this session, still open: `deploy.sh` hardcoded `APP_ROOT` + non-atomic `rm -rf` copy → needs nginx root change under sudo and a live deploy to verify.

## Session state (2026-10-26)

- Backlog **#3 (security)** implemented — user decisions: **Cloudflare Worker** proxy for Telegram; credentials **kept as-is, documented only**.
  - New `cloudflare/` (`worker.js` + `wrangler.toml` + README): `POST /send` with `{chat_id, text, parse_mode}` → Telegram; `GET /health`; CORS via `ALLOWED_ORIGIN` var; token only via Wrangler secret. **Not deployed** — needs `npx wrangler login` + `secret put TELEGRAM_BOT_TOKEN` + `deploy` in `cloudflare/`.
  - `tgProxyUrl` in `DEFAULT_SETTINGS`/`DEFAULT_TEMP`; `sendTg` uses `<proxy>/send` when set; scheduler gate is `chatId` (proxy-only setups have no token in the browser); Proxy URL field added in setup wizard + Settings → Telegram; README gained "Security Notes".
- **Committed as `754812f` "Route Telegram sends through a Cloudflare Worker proxy"** (7 files, +204/−16). Working tree clean. **Push left to the user** (`git push` from `/home/clyde/chicken-farm-app`) — not pushed yet as of this writing.
- Verified: lint clean, build exit 0 (pipefail), full `git diff` review (one line-break glitch fixed pre-commit), no secrets in diff, Worker smoke test passed.
- UI inspected via `npm run preview -- --host 0.0.0.0 --port 4173` → http://192.168.0.122:4173/ (background PID 12301, may still be running — ask user before killing).
- Permanent deploy to :8080 not done (sudo password required).
- **Backlog #8 still open** (user chose "security only" scope): GitHub Actions lint+build workflow; `deploy.sh` atomic symlink swap instead of `rm -rf` copy.

## Session state (2026-10-19) — landed in commit `32bd1b0`

- Fixed 9 lint errors + 1 warning in `src/App.jsx` (unused params/dead code, module-scope storage helpers, module-load hydration instead of an effect, dead FinanceTab effect removed, self-rearming notification `setTimeout` with `notifSentRef` — fires at the exact `notifyTime`, not on a 60s tick). No eslint-disables or weakened rules.

## Improvement backlog — status

Done (committed): **#1** split `App.jsx` (`e4666d2`) · **#2** CSS to `index.css`, drop Google Fonts (`d71076d`) · **#4** persist task checkmarks (`45e072c`) · **#5** JSON backup + schema versioning (`050842e`) · **#7** memoized buckets, `React.lazy` tabs, `useNow()` (`bf0715a`) · **#9** index.html title/favicon/meta (`61d6473`) · **#3** Telegram token proxy + auth docs (`754812f`, Worker deploy pending).

Partially done:

6. PWA + error boundary + a11y shipped (`20004c1`); **local `Notification` API fallback not implemented**.

8. CI (lint + build workflow) — written and verified but **uncommitted** at `.github/workflows/ci.yml`, blocked on the PAT `workflow` scope; `deploy.sh` hardcoded path and non-atomic `rm -rf` copy → symlink swap still **open**.
