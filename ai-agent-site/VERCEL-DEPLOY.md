# Deploy on Vercel (free)

This folder is a **static site** — no build step. `vercel.json` replaces Cloudflare `_redirects` / `_headers`.

## Option A — GitHub (recommended)

1. Push this repo to GitHub.
2. [Vercel](https://vercel.com/new) → **Import** the repository.
3. **Root Directory:** `ai-agent-site` (required if the repo is not only this site).
4. **Framework Preset:** Other  
   **Build Command:** leave empty  
   **Output Directory:** leave empty (files deploy from root of `ai-agent-site`).
5. Deploy. Your URL will be `https://<project>.vercel.app/`.

## Option B — Vercel CLI

```bash
cd ai-agent-site
npx vercel          # preview
npx vercel --prod   # production
```

## Option C — Upload zip

Run `./build-idecompiler-cloudflare-v7.sh` from this folder. The zip includes `vercel.json`. Unzip and run `npx vercel --prod` from that folder, or import via Git.

## After deploy — check these URLs

| URL | Expected |
|-----|----------|
| `/` | AI Agent Guide |
| `/open/` | Redirects to `/` (guide) |
| `open/embed.html?dev=1&embed=1` | IDE (full page) |
| Guide → **Development Site → Click Here** | IDE overlay |

## Notes

- `_redirects` and `_headers` are for Cloudflare/Netlify; **Vercel uses `vercel.json` only** (already included).
- Do not add `_routes.json` (Cloudflare Functions only).
- Masked `s3.amazonaws.com/...` text in the UI is cosmetic; the browser bar shows your `*.vercel.app` or custom domain.
