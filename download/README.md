# External download — 9-file site bundle

Download **`idecompiler-site.zip`** from this folder (GitHub: open `download/idecompiler-site.zip` → **Download**).

## Contents (folder `idecompiler-site/`)

| File | Purpose |
|------|---------|
| `index.html` | AI Agent Guide (home) |
| `open.html` | Compiler UI — upload to S3 as object key **`open`** (no `.html`) |
| `ide.html` | Same compiler (optional duplicate) |
| `styles.css` | Guide styles |
| `ide.css` | Compiler styles |
| `app.js` | Guide logic |
| `ide.js` | Compiler logic (fixed Copy Address) |
| `contract.js` | ExampleContract source + fixed address |
| `site-config.js` | URLs and masked labels |

## S3 upload

Upload all files to the **same bucket prefix** (e.g. bucket `idecompiler`):

- `open.html` → rename key to **`open`**
- Everything else keeps its filename

See `idecompiler-site/UPLOAD-S3.txt` inside the zip (copied from project docs).

## Full Cloudflare compiler

For the full idecompiler clone (`/open/` with all JS/CSS), use repo root **`drop-site.zip`** instead (larger bundle).
