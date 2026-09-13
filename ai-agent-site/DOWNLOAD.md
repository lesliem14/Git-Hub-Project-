# Download the site files

If a zip from the agent artifacts will not open, use one of these options.

## Option A — Download individual files (always works)

From GitHub, open each file in `ai-agent-site/` and use **Raw** → Save As:

- `index.html`
- `styles.css`
- `app.js`
- `contract.js`

Upload all four to the same S3 bucket folder.

## Option B — Archives in this repo

At the repository root (same branch as this folder):

- `ai-agent-site-aws-upload.zip` — uncompressed zip (best compatibility)
- `ai-agent-site-aws-upload.tar.gz` — use on Mac/Linux: `tar -xzf ai-agent-site-aws-upload.tar.gz`

## Option C — Unzip tips

- **Windows:** Right-click the zip → **Extract All**
- **Mac:** Double-click, or in Terminal: `unzip ai-agent-site-aws-upload.zip -d my-site`
- If the file is very small (~1 KB) or opens as text in a browser, the download failed — re-download or use Option A.

After extract, you should see exactly four files with no subfolder required.
