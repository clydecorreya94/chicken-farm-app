# Chicken Farm App

A React + Vite single-page app for managing a small chicken farm from phone or desktop.

## What It Does

- Tracks farm finance entries for income and expenses
- Shows poultry care guidance, feed planning, health schedules, and vaccination information
- Shows today and next-day feed planning so feed can be prepared in advance
- Shows projected start-of-lay timing with an expected lay date based on flock age
- Includes a dedicated `Docs` tab with official BV380-relevant reference PDFs for tropical/South Indian conditions
- Supports role-based login with an admin account and a guest read-only account
- Saves app data locally in the browser for offline-friendly use on the current device

## Login Accounts

- Admin: `admin123` / `admin123`
- Guest: `guest` / `guest123`

Admin can edit and reset data. Guest can view the UI but cannot modify records.

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
- `deploy.sh`: rebuilds the app and redeploys the production files to the nginx web root
- `public/`: static assets

## Current Notes

- Date handling was adjusted to keep `YYYY-MM-DD` values in local time instead of shifting through UTC
- The dashboard and feed views include `Tomorrow's Feed Prep` so the next day's ration can be prepared early
- The dashboard and schedule views include an expected lay date derived from the configured flock age and start date
- The `Docs` tab contains curated official Hendrix Genetics PDFs relevant to BV380-style tropical farm management
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
