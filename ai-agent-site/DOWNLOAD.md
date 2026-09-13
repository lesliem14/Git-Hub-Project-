# Download the site

## 9 files (S3 / simple hosting) — external folder

**Path in repo:** `download/`

| Download | Contents |
|----------|----------|
| **[`download/idecompiler-site.zip`](../download/idecompiler-site.zip)** | Folder **`idecompiler-site/`** with **9 files** only |
| **[`download/idecompiler-site/`](../download/idecompiler-site/)** | Same files unzipped (clone repo or download folder from GitHub) |

The nine files:

1. `index.html`  
2. `open.html` (S3 key: `open`)  
3. `ide.html`  
4. `styles.css`  
5. `ide.css`  
6. `app.js`  
7. `ide.js`  
8. `contract.js`  
9. `site-config.js`  

GitHub raw zip URL (branch `cursor/ai-agent-s3-webpage-b474`):

`https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/download/idecompiler-site.zip`

Unzip, then upload **all files** inside `idecompiler-site/` to your bucket. Rename `open.html` → object key **`open`**.

See **`download/README.md`** for S3 steps.

## Full Cloudflare compiler (large bundle)

Repo root **`drop-site.zip`** / **`ai-agent-site-cloudflare.zip`** includes the guide plus the full `/open/` idecompiler app (40+ files). Use that for Cloudflare Pages, not the 9-file zip.
