// Telegram send proxy for the BV380 Farm Manager.
//
// The bot token lives only in this Worker's TELEGRAM_BOT_TOKEN secret, so the
// browser bundle and localStorage never contain it. The app POSTs
// { chat_id, text, parse_mode } to `${WORKER_URL}/send` and gets Telegram's
// JSON response back (with CORS enabled for the farm app origin).

const TELEGRAM_API = "https://api.telegram.org";

function corsHeaders(env) {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN || "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

function json(env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(env),
    },
  });
}

async function handleSend(request, env) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return json(
      env,
      { ok: false, description: "TELEGRAM_BOT_TOKEN secret is not set. Run: npx wrangler secret put TELEGRAM_BOT_TOKEN" },
      500,
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(env, { ok: false, description: "Request body must be a JSON object." }, 400);
  }

  const { chat_id, text, parse_mode } = payload || {};
  if (!chat_id || typeof text !== "string" || !text.trim()) {
    return json(env, { ok: false, description: "Both chat_id and text are required." }, 400);
  }

  const body = { chat_id, text };
  if (parse_mode) body.parse_mode = parse_mode;

  let upstream;
  try {
    upstream = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return json(env, { ok: false, description: `Could not reach Telegram: ${err.message}` }, 502);
  }

  const data = await upstream.json().catch(() => null);
  if (!data) {
    return json(env, { ok: false, description: `Telegram returned HTTP ${upstream.status}` }, 502);
  }
  return json(env, data, upstream.ok ? 200 : 502);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json(env, { ok: true, service: "bv380-telegram-proxy" });
    }

    if (request.method === "POST" && (url.pathname === "/send" || url.pathname === "/sendMessage")) {
      return handleSend(request, env);
    }

    return json(env, { ok: false, description: "Not found. Use POST /send with { chat_id, text, parse_mode }." }, 404);
  },
};