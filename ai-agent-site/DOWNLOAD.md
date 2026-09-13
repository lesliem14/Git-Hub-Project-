# Download the site (zip)

Use the **repository root** archives on branch `cursor/ai-agent-s3-webpage-b474` (or your current branch):

| File | Use |
|------|-----|
| **`drop-site.zip`** | Full site for **Cloudflare Pages** upload |
| **`ai-agent-site-cloudflare.zip`** | Same contents as `drop-site.zip` (alternate name) |

## What is inside the zip

Extract once; upload **everything** in the folder to Cloudflare Pages (drag the extracted files into the project root, not only `index.html`).

Required paths:

- `index.html` — AI Agent Guide (home)
- `open/index.html` — IDE / compiler (same app as the reference idecompiler)
- `open/css/`, `open/js/`, `open/assets/` — compiler UI
- `contract.js`, `site-config.js`, `app.js`, `styles.css`
- `_redirects` — `/open` → compiler

After deploy:

- Guide: `https://<your-project>.pages.dev/`
- Compiler: `https://<your-project>.pages.dev/open/`

See **`CLOUDFLARE-DEPLOY.md`** in the zip for step-by-step upload.

## Download from GitHub

1. Open the repo on GitHub → branch **`cursor/ai-agent-s3-webpage-b474`**.
2. Download **`drop-site.zip`** from the root (click the file → **Download** or **Raw** and save).
3. Unzip:
   - **Windows:** Right-click → **Extract All**
   - **Mac/Linux:** `unzip drop-site.zip -d my-site`

The archive should be about **110 KB+** and list **40+ files** including `open/js/app.js`. If the file is only a few KB, the download failed — try again or clone the repo.

## First open of the compiler

If the file tree looks wrong, clear site data for your Pages URL once or use a private window (old `localStorage` from an earlier build).

## S3 (optional)

For AWS S3 static hosting, upload the same extracted files to the bucket root. Put `open.html` at key `open` only if you still use the legacy single-file IDE; **Cloudflare / full zip** should use the **`open/`** folder instead.
