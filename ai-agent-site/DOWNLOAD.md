# Installation zip (download)

## Full install — recommended

Download **`idecompiler-install.zip`** from the **repository root** (same branch as this project).

| File | Size | Use |
|------|------|-----|
| **`idecompiler-install.zip`** | ~116 KB | **Complete install** — guide + full IDE at `/open/` |
| `drop-site.zip` | Same as above | Alias |
| `ai-agent-site-cloudflare.zip` | Same as above | Alias |

Also in folder **`download/`**: `download/idecompiler-install.zip` (copy of the same archive).

### GitHub direct link

`https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/idecompiler-install.zip`

(Replace branch name if yours differs.)

### Install steps

1. Download **`idecompiler-install.zip`**.
2. Unzip into a folder, e.g. `my-site`:
   - Windows: right-click → **Extract All**
   - Mac/Linux: `unzip idecompiler-install.zip -d my-site`
3. Upload **all extracted files** to your host:
   - **Cloudflare Pages / Workers** — drag the whole folder into **Upload assets**
   - **Amazon S3** — upload every object to the bucket prefix (see `UPLOAD-S3.txt`)
4. Open:
   - Guide: `https://<your-host>/`
   - IDE: `https://<your-host>/open/`

Included docs inside the zip:

- **`CLOUDFLARE-DEPLOY.md`** — Cloudflare Pages
- **`WORKERS-DEPLOY.md`** — Workers.dev `/open` URL
- **`README.md`** — overview

You should see **46 files** in the zip, including `open/index.html` and `open/js/app.js`.

---

## Small bundle (9 files only)

For minimal S3 hosting **without** the full left-panel IDE, use **`download/idecompiler-site.zip`** (9 files in folder `idecompiler-site/`). See **`download/README.md`**.

That zip does **not** include the full compiler; use **`idecompiler-install.zip`** for Workers and full IDE functionality.
