# Deploy on [Lovable](https://lovable.dev/)

Lovable hosts **Vite** projects: `npm run build` → **`dist/`**. This repo includes a Lovable-ready folder with your static guide + IDE in **`public/`**.

## Option A — Zip import (fastest)

1. Build **`idecompiler-lovable-v7.zip`**:
   ```bash
   bash ai-agent-site/build-idecompiler-lovable-v7.sh
   ```
2. Extract the zip.
3. In Lovable: connect **GitHub** and push the extracted folder as the project root, **or** copy `package.json`, `vite.config.js`, `scripts/`, and `public/` into your Lovable project.
4. In Lovable (or locally): `npm install` then `npm run build`.
5. **Publish** from Lovable — output is **`dist/`** (same files as `public/`).

## Option B — This Git repo

Copy `ai-agent-site/lovable/*` to your Lovable app root, then run:

```bash
bash ai-agent-site/build-idecompiler-lovable-v7.sh   # refreshes public/ inside lovable/
cd ai-agent-site/lovable && npm install && npm run build
```

## URLs after publish

| Page | Path |
|------|------|
| AI Agent Guide | `/` or `/index.html` |
| IDE | `/open/embed.html?dev=1&embed=1` |

`public/_redirects` sends `/open` to the guide (Lovable hosting uses Netlify-style rules).

## Static assets

Per Lovable/Vite: files in **`public/`** are served from the site root ([docs](https://docs.lovable.dev/tips-tricks/external-deployment-hosting)). Keep paths as `./styles.css` or `/styles.css` from the guide.

## Local preview

```bash
cd ai-agent-site/lovable && npm run dev
```

Open `http://localhost:5173/`.
