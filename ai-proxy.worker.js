/**
 * Codeloop AI proxy — Cloudflare Worker
 * ------------------------------------------------------------------
 * Forwards the tutor's requests to the Anthropic API while keeping your
 * API key on the server (never in the public web page). Free tier is
 * plenty for a personal learning site.
 *
 * SETUP (about 5 minutes):
 *   1. Make a free account at https://dash.cloudflare.com
 *   2. Workers & Pages  →  Create  →  Create Worker  →  give it a name
 *      (e.g. codeloop-ai)  →  Deploy.
 *   3. Edit code  →  paste this whole file over the default code  →  Deploy.
 *   4. Worker  →  Settings  →  Variables and Secrets  →  Add:
 *          Type:  Secret
 *          Name:  ANTHROPIC_API_KEY
 *          Value: your key from https://console.anthropic.com  (starts sk-ant-)
 *      Save and re-Deploy.
 *   5. Copy the Worker URL (https://codeloop-ai.YOURNAME.workers.dev) and
 *      paste it into AI_PROXY_URL near the top of index.html's script.
 *
 * Note: using the API consumes Anthropic credits. The cap below limits the
 * damage if the URL is ever abused, but for a public site you may also want
 * to set ALLOWED_ORIGIN to your exact site address.
 */

const ALLOWED_ORIGIN = "*"; // e.g. "https://yourname.github.io" to lock it down
const MODEL_ALLOWLIST = ["claude-sonnet-4-20250514"]; // only models you permit
const MAX_TOKENS_CAP = 1024;

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Use POST" }, 405);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "Server is missing the ANTHROPIC_API_KEY secret" }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    // Guardrails so a leaked URL can't be abused into a big bill.
    if (body.model && !MODEL_ALLOWLIST.includes(body.model)) {
      body.model = MODEL_ALLOWLIST[0];
    }
    body.max_tokens = Math.min(Number(body.max_tokens) || 1000, MAX_TOKENS_CAP);

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, "content-type": "application/json" },
    });
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
