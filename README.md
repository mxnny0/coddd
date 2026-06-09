# Codeloop — publish guide

A free, interactive learn-to-code site (Python + HTML) with a live editor,
auto-checked challenges, and an AI tutor. This guide gets it online.

## 1. Put it on GitHub Pages

1. Sign in at https://github.com → click **+** (top right) → **New repository**.
2. Name it (e.g. `codeloop`), set **Public**, click **Create repository**.
3. **Add file → Upload files**, drag in **`index.html`**, then **Commit changes**.
4. **Settings → Pages** → under **Source** choose **Deploy from a branch** →
   branch **main**, folder **/ (root)** → **Save**.
5. Wait ~1 minute. Your site is live at:
   `https://YOURNAME.github.io/codeloop/`

That's the whole site. Lessons, the code editor, in-browser Python, the live
HTML preview, auto-checking, XP, and saved progress all work as soon as it's up.

## 2. Turn on the AI tutor (optional)

The tutor needs to reach Anthropic's API with a secret key. A key can never go
in `index.html` (the page is public). Instead, deploy the tiny proxy:

1. Open **`ai-proxy.worker.js`** and follow the SETUP comment at the top —
   it walks you through creating a free Cloudflare Worker, pasting the code,
   and adding your `ANTHROPIC_API_KEY` as a secret.
2. Copy the Worker URL it gives you
   (e.g. `https://codeloop-ai.yourname.workers.dev`).
3. In `index.html`, find `const AI_PROXY_URL = "";` near the top of the script
   and set it to your Worker URL:
   `const AI_PROXY_URL = "https://codeloop-ai.yourname.workers.dev";`
4. Re-upload `index.html` to your repo (**Add file → Upload files**, commit).

Without this step everything else still works — the tutor button just shows a
"couldn't reach the tutor" message.

## Notes

- An internet connection is required at runtime (Python, the editor, and fonts
  load from public CDNs).
- Using the AI tutor consumes Anthropic API credits from your account. The
  Worker caps response size and locks the model to limit costs; you can also set
  `ALLOWED_ORIGIN` in the Worker to your exact site address.
- Progress is saved per-browser via `localStorage`. Clearing site data resets it.
- Want a custom domain? In **Settings → Pages → Custom domain**, add it and set
  the DNS records your domain provider asks for. HTTPS is provided automatically.
