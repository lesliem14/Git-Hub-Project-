# Deploy on Cloudflare Pages

Upload the **entire** `ai-agent-site` folder as your Pages project root (not only `open/`).

## URLs after deploy

| Page | URL |
|------|-----|
| AI Agent Guide (home) | `https://<your-project>.pages.dev/` |
| IDE / Compiler | `https://<your-project>.pages.dev/open/` |

The `_redirects` file maps `/open` and `/open/` to `open/index.html`.

## What you get

- **Guide** (`index.html`) — masked S3-style labels in the UI; **Development Site** opens your hosted compiler at `/open/`.
- **Compiler** (`open/index.html`) — Remix-style UI using the same CSS layout as the public idecompiler reference, with a **fixed** contract address on **Copy Address** (`0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb`).

## Steps

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Drag the contents of `ai-agent-site` (include `css/`, `js/`, `open/`, `assets/`, `_redirects`, `index.html`, etc.).
3. Deploy, then open `/open/` and test **Secure Deploy** and **Copy Address**.

## Optional: custom domain

Point a domain to Pages if you want a branded URL. The browser address bar cannot show `s3.amazonaws.com` unless you control that bucket or domain; `site-config.js` only masks display text on the guide.

## Zip bundle

From the repo root, `drop-site.zip` contains the same files for manual upload.
