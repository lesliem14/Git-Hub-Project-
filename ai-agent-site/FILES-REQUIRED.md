# Files required for drag-and-drop deploy

Upload **everything** from **`eth-arbitrage-site-install.zip`** (after unzip) to your host root.

## Page 1 — ETH Arbitrage Trading Bot - Full Guide (`/`)

| File | Required |
|------|----------|
| `index.html` | **Yes** |
| `styles.css` | **Yes** |
| `dynamic-app.js` | **Yes** — guide + IDE embed |
| `site-config.js` | **Yes** — guide steps (on-site links only) |
| `contract-address.js` | **Yes** — gateway address |
| `contract-source.txt` | **Yes** — Solidity panel on guide |

## Page 2 — DigitalOceanSpaces Cloud Workspace (`/open/`)

| File | Required |
|------|----------|
| `open/embed.html` | **Yes** — IDE shell |
| `open/ide.css` | **Yes** |
| `open/ide.js` | **Yes** — tabs, compile, deploy, wallet |
| `open/ide-gate.js` | **Yes** |
| `open/index.html` | **Yes** — redirects to guide `?view=ide` |
| `open/project/bot.py` | **Yes** — editor content |
| `open/assets/icon.svg` | **Yes** |

## Hosting helpers

| File | Required |
|------|----------|
| `_redirects` | **Yes** on Cloudflare Pages |
| `_headers` | Optional security headers |

## CDN (internet required in browser)

- `ethers` v6 loads from jsDelivr in `open/embed.html`.

## Documentation (optional on server; included in zip for you)

`INSTALL.txt`, `DRAG-DROP-INSTALL.txt`, `README.md`, `DOWNLOAD.md`, deploy `*.md` / `*.txt` files.

## Not used for this build

Legacy `open/js/*`, root `app.js`, old `idecompiler-*` bundles — omit unless you keep them for archive.
