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

## Full IDE on Cloudflare Workers (`/open`)

For `https://….workers.dev/open` you **must** use repo root **`drop-site.zip`** (includes `open/` folder, left-side Deploy & Run, compiler, file explorer). The 9-file zip is not enough.

See **`ai-agent-site/WORKERS-DEPLOY.md`** in the full bundle.
