# Cloudflare Workers / Pages — full IDE at `/open`

Your IDE URL should load the **full** app under `open/` (left sidebar: File Explorer, Solidity Compiler, Deploy & Run).

## Do not upload only the 9-file zip

The small `download/idecompiler-site.zip` is for simple S3 hosting. For  
`https://….workers.dev/open` you need **`drop-site.zip`** (or the whole `ai-agent-site` folder).

## Upload checklist

1. Unzip **`drop-site.zip`** at the project root.
2. Confirm these exist:
   - `open/index.html`
   - `open/js/app.js`, `compiler.js`, `metamask.js`, …
   - `open/css/layout.css`, `components.css`, …
   - `_redirects` with `/open` → `open/index.html`
3. Deploy all files to Workers static assets or Cloudflare Pages.
4. Open `/open/` (or `/open` with redirects).

## Tabs (left icon rail)

| Icon | Panel (left sidebar) |
|------|----------------------|
| File | **File Explorer** — New File / New Folder, create deployable `.sol` contracts |
| Solidity | **Solidity Compiler** — Compile, then deploy |
| Ethereum | **Deploy & Run Transactions** — Injected Provider, **Secure Deploy**, Copy Address |

Colors and fonts come from the bundled `open/css/*` (unchanged).

## Legacy `open.html`

Root `open.html` redirects to `open/index.html`. Prefer linking to `/open/`.
