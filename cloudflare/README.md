# BV380 Telegram Proxy (Cloudflare Worker)

Holds the Telegram bot token **server-side** so it never appears in the app
bundle or in browser `localStorage`. The app calls this Worker instead of
`api.telegram.org` directly.

## Deploy

```bash
cd cloudflare

# One-time: log in to your Cloudflare account
npx wrangler login

# Put the bot token from @BotFather in as an encrypted secret
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Deploy
npx wrangler deploy
```

Wrangler prints the Worker URL, e.g. `https://bv380-telegram-proxy.<account>.workers.dev`.

## Configure the app

1. Open the app → **Settings → 📱 TELEGRAM**
2. Paste the Worker URL into **Proxy URL** (no trailing slash needed)
3. Enter the **Chat ID** as before
4. The bot token field can be left empty once the proxy is configured — it is
   only used as a legacy direct-send fallback when no proxy URL is set
5. Click **🧪 Test Connection**

Optionally lock CORS down in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGIN = "http://192.168.0.122:8080"
```

then redeploy.

## Endpoints

| Method | Path       | Body                                   | Response                  |
| ------ | ---------- | -------------------------------------- | ------------------------- |
| GET    | `/health`  | —                                      | `{ ok: true, service }`   |
| POST   | `/send`    | `{ chat_id, text, parse_mode? }`       | Telegram's `sendMessage` JSON |
| OPTIONS | any      | —                                      | CORS preflight (204)      |

Errors return `{ ok: false, description }` with a non-2xx status, so the app's
status line shows the reason.

## Rotate the token

If the token was ever entered into the app (it lives in `localStorage` there),
revoke it with @BotFather (`/revoke`), issue a new one, and put the new token
in the Worker secret only.