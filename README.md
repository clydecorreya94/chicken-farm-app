# Chicken Farm App

A React + Vite single-page app for managing a small chicken farm from phone or desktop.

## What It Does

- Tracks farm finance entries for income and expenses
- Shows poultry care guidance, feed planning, health schedules, and vaccination information
- Shows today and next-day feed planning so feed can be prepared in advance
- Tracks multiple cages: log how many cages are in use and the chick count + age for each cage, and get the exact daily feed (in grams, feed type, water, and session split) calculated per cage plus a combined all-cage total
- Right after login a "Select Your Cages" screen appears until cages are set up, and from then on the home screen itself shows every cage's chick count, day age, feed type, and total grams for today (editable any time from the Cages tab)
- Each cage card carries its own daily summary instead of a separate dashboard card: TODAY header with the cage's day and date, phase chip, total feed, water, days to lay, average weight, and the next vaccination for that cage's age — the flock-wide items (shared day, total feed/water, task progress) stay in one strip below the cage cards
- Shows projected start-of-lay timing with an expected lay date based on flock age
- Includes a dedicated `Docs` tab with official BV380-relevant reference PDFs for tropical/South Indian conditions
- Supports role-based login with an admin account and a guest read-only account
- Saves app data locally in the browser for offline-friendly use on the current device

## Login Accounts

- Admin: `admin123` / `admin123`
- Guest: `guest` / `guest123`

Admin can edit and reset data. Guest can view the UI but cannot modify records.

## Security Notes

These are known, accepted trade-offs of the current no-backend design (LAN-only deployment):

- **Login accounts are client-side and stored in plaintext in the source.** There is no server to validate them, so they only gate the UI — anyone with the bundle can read them. Treat the app as a single-user tool behind your LAN, not as real authentication.
- **The Telegram bot token should never live in the browser.** Configure a **Proxy URL** in Settings → 📱 Telegram pointing at the Cloudflare Worker in `cloudflare/`; it holds the token as an encrypted secret and exposes only `POST /send`. See `cloudflare/README.md` to deploy it.
- **Legacy fallback:** if only a Bot Token is set (no proxy), the app calls `api.telegram.org` directly and the token sits in `localStorage`. Rotate the token with @BotFather if it was ever entered on a shared device.
- All farm data stays in this browser's `localStorage`; nothing is sent anywhere except Telegram messages.

## Important Storage Limitation

This app currently stores data in browser `localStorage`.

That means:

- data is tied to the current browser/device
- different phones, browsers, or app containers will not automatically share the same records
- cross-device sync will require a backend or cloud database in a future version

## Tech Stack

- React 19
- Vite 7
- Plain React state with browser `localStorage`

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `src/App.jsx`: main application logic, UI, shared state, auth gate, and finance flow
- `src/main.jsx`: app entry point
- `cloudflare/`: Cloudflare Worker that proxies Telegram sends so the bot token stays server-side
- `deploy.sh`: rebuilds the app and redeploys the production files to the nginx web root
- `public/`: static assets

## Current Notes

- Date handling was adjusted to keep `YYYY-MM-DD` values in local time instead of shifting through UTC
- The dashboard and feed views include `Tomorrow's Feed Prep` so the next day's ration can be prepared early
- Feed planning and feed-store stock usage are calculated from the exact day-by-day schedule, so changes across day boundaries like Day 49 to Day 50 use the correct ration instead of reusing one average rate
- The `Cages` tab stores cage entries in the shared app data (`bv380_shared_data`), and each cage's age advances automatically day by day from the age you logged
- The dashboard and schedule views include an expected lay date derived from the configured flock age and start date
- The `Docs` tab contains curated official Hendrix Genetics PDFs relevant to BV380-style tropical farm management
- The `Docs` tab includes a document-grounded assistant that runs in local document mode
- Finance entries are stored in the shared app data object and also mirrored to the legacy `bv380_finance` key for compatibility
- The finance tracker is intended to allow admin users to add income and expense entries and show them in the log immediately after save

## Deployment

If you are deploying to the existing nginx setup used in prior sessions:

```bash
cd /home/clyde/chicken-farm-app
./deploy.sh
```

The script runs:

- `npm install`
- `npm run build`
- copies `dist/` into `/var/www/farm/`
- validates nginx config
- reloads nginx

If the script is not executable yet, run:

```bash
chmod +x /home/clyde/chicken-farm-app/deploy.sh
```

After any code change, rerun the same script so the latest `dist/` files replace the old site files served by nginx.

Then open:

```text
http://192.168.0.122:8080/
```
