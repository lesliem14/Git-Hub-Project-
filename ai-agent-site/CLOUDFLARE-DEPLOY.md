# Deploy on Cloudflare Pages

Upload the **entire** `ai-agent-site` folder as your Pages project root (not only `open/`).

## URLs after deploy

| Page | URL |
|------|-----|
| AI Agent Guide (home) | `https://<your-project>.pages.dev/` |
| IDE (via guide) | **Development Site → Click Here** (overlay or `open/embed.html?dev=1&embed=1`) |

The `_redirects` file sends `/open` and `/open/` to `/` (guide). Do not expect `/open/` to show the IDE directly.

**Zip for upload:** `idecompiler-cloudflare-v6.zip` at the repo root (run `ai-agent-site/build-cloudflare-zip.sh`).

## What you get

- **Guide** (`index.html`) — masked S3-style labels in the UI; **Development Site** opens your hosted compiler at `/open/`.
- **Compiler** (`open/`) — Full static port of the public idecompiler app (CodeMirror, file explorer, compile/deploy, terminal, wallet UI). VM deploy uses the **fixed** address from `contract.js` when copying after deploy (`0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb`). First visit seeds `contracts/README.sol`, `Mempool.sol`, and `zelda.sol` like the reference workspace.

## Steps

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Drag the contents of `ai-agent-site` (include `css/`, `js/`, `open/`, `assets/`, `_redirects`, `index.html`, etc.).
3. Deploy, then open `/open/` and test **Secure Deploy** and **Copy Address**.

## Optional: custom domain

Point a domain to Pages if you want a branded URL. The browser address bar cannot show `s3.amazonaws.com` unless you control that bucket or domain; `site-config.js` only masks display text on the guide.

## Zip bundle

From the repo root, `drop-site.zip` contains the same files for manual upload.
