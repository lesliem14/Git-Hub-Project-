# Files you need for both webpages

Upload **everything** from **`idecompiler-install.zip`** (unzipped) to your host.  
That zip is the complete list — you do not need any other repo folders.

Below is what each file does. Items marked **required** must be present or a page will break.

---

## Page 1 — AI Agent Guide (`/`)

| File | Required |
|------|----------|
| `index.html` | **Yes** — main guide page |
| `styles.css` | **Yes** — guide styling |
| `app.js` | **Yes** — links, Copy, expand |
| `contract.js` | **Yes** — Solidity source + fixed contract address |
| `site-config.js` | **Yes** — Development Site → `/open/`, masked URLs |

**Optional on page 1:** `download.html`, `assets/icon.svg`, `idecompiler-install.zip`, `downloads/idecompiler-site.zip` (only if you want download buttons on the live site).

---

## Page 2 — IDE compiler (`/open/`)

| File | Required |
|------|----------|
| `open/index.html` | **Yes** — IDE shell |
| `open/css/layout.css` | **Yes** |
| `open/css/editor.css` | **Yes** |
| `open/css/terminal.css` | **Yes** |
| `open/css/components.css` | **Yes** |
| `open/css/mobile.css` | **Yes** |
| `open/css/modern-theme.css` | **Yes** |
| `open/assets/icon.svg` | **Yes** |
| `open/js/app.js` | **Yes** — file explorer, new file/folder |
| `open/js/editor.js` | **Yes** — CodeMirror editor |
| `open/js/compiler.js` | **Yes** — compile & deploy |
| `open/js/metamask.js` | **Yes** — wallet & deploy UI |
| `open/js/terminal.js` | **Yes** |
| `open/js/search.js` | **Yes** — search tab |
| `open/js/debugger.js` | **Yes** — debugger tab |
| `open/js/settings.js` | **Yes** — settings tab |
| `open/js/mobile.js` | **Yes** |
| `open/js/mobile-onboarding.js` | **Yes** |
| `open/js/host-bootstrap.js` | **Yes** — default workspace files |
| `open/js/host-enhancements.js` | **Yes** — demo account, new contract template |
| `contract.js` (at site root) | **Yes** — loaded as `../contract.js` from IDE |

**CDN (internet required):** CodeMirror and Web3 load from cdnjs in `open/index.html` (no local files needed for those).

---

## Shared / hosting

| File | Required |
|------|----------|
| `_redirects` | **Yes** on Cloudflare Pages/Workers — maps `/` and `/open/` |
| `contract.js` | **Yes** — shared by guide and IDE |

---

## Not required for the two webpages

You can omit these; they are redirects, docs, or old copies:

| File | Why optional |
|------|----------------|
| `ide.html`, `open.html` | Redirect to `open/` ( `_redirects` does the same) |
| `ide.css`, `ide.js` | Old single-file IDE (not used if you use `/open/`) |
| `css/` at site root | Duplicate; IDE uses `open/css/` only |
| `README.md`, `DOWNLOAD.md`, `TWO-PAGES.md`, `INSTALL.txt`, `CLOUDFLARE-DEPLOY.md`, `WORKERS-DEPLOY.md`, `UPLOAD-S3.txt` | Documentation only |
| `build-install-zip.sh` | Build script for maintainers |
| `idecompiler-install.zip` | Only for letting visitors download the bundle from page 1 |

---

## Quick check after upload

1. Open `https://YOUR-HOST/` → AI Agent Guide with Solidity box.  
2. Click **Development Site → Click Here** → IDE at `/open/`.  
3. In IDE: File Explorer, Solidity Compiler, Deploy & Run on the **left**.  

If step 2 is a blank page or unstyled, the **`open/`** folder (or `contract.js` at root) is missing.

---

## One download = everything

**`idecompiler-install.zip`** contains all **required** files above.  
Do **not** use **`idecompiler-site.zip`** (9 files) for both pages — it does not include the full `open/` IDE.
