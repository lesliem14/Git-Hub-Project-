#!/usr/bin/env bash
# Builds idecompiler-cloudflare-v7.zip — flat root (index.html at top) for Windows/Mac unzip.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage-v7"
ZIP_NAME="idecompiler-cloudflare-v7.zip"
OUT="$ROOT/$ZIP_NAME"
WORKER_PUBLIC="$SITE/cloudflare/public"

rm -rf "$STAGE" "$WORKER_PUBLIC"
mkdir -p "$STAGE/open/assets" "$WORKER_PUBLIC/open/assets"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

cat > "$STAGE/OPEN-THIS-FIRST.txt" << 'TXT'
IDE Compiler — deploy bundle (v7)
=================================

1. RIGHT-CLICK this zip → Extract All (Windows) or double-click (Mac).
2. Open the extracted folder. You must see index.html and the open folder together.
3. Upload those files to Netlify / Vercel / Cloudflare (not the .zip file itself).

Home page: index.html
IDE: open/embed.html?dev=1&embed=1
TXT

for f in index.html styles.css app.js contract-address.js contract-source.txt site-config.js; do
  copy "$f"
done

cp "$SITE/index.html" "$STAGE/404.html"

for f in _redirects _headers netlify.toml vercel.json CLOUDFLARE-UPLOAD.txt VERCEL-DEPLOY.md NETLIFY-DROP.txt; do
  if [[ -f "$SITE/$f" ]]; then
    copy "$f"
  fi
done

cp "$SITE/open/index.html" "$STAGE/open/"
cp "$SITE/open/embed.html" "$STAGE/open/"
cp "$SITE/open/ide.css" "$STAGE/open/"
cp "$SITE/open/ide.js" "$STAGE/open/"
cp "$SITE/open/ide-gate.js" "$STAGE/open/"
cp "$SITE/open/assets/icon.svg" "$STAGE/open/assets/"

python3 << PY
from pathlib import Path
site = Path("$SITE")
stage = Path("$STAGE")
css = (site / "open/ide.css").read_text()
needle = '<link rel="stylesheet" href="ide.css" />'
inline = '<style id="ide-theme">\n' + css + '\n</style>'
html = (site / "open/embed.html").read_text()
if needle not in html:
    raise SystemExit("embed.html missing css link")
(stage / "open/embed.html").write_text(html.replace(needle, inline, 1))
PY

cp -a "$STAGE/." "$WORKER_PUBLIC/"

rm -f "$OUT" "$SITE/$ZIP_NAME" "$ROOT/download/$ZIP_NAME"
# -X: omit Unix extra fields (better compatibility with Windows Explorer)
(cd "$STAGE" && zip -X -r "$OUT" .)
unzip -t "$OUT" >/dev/null

cp "$OUT" "$SITE/$ZIP_NAME"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/$ZIP_NAME"

rm -rf "$STAGE"

echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
echo "Test: unzip -l $ZIP_NAME | head"
unzip -l "$OUT" | head -25
