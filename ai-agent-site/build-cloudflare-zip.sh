#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage"
OUT="$ROOT/idecompiler-cloudflare-v6.zip"
WORKER_PUBLIC="$SITE/cloudflare/public"

rm -rf "$STAGE" "$WORKER_PUBLIC"
mkdir -p "$STAGE/open/assets" "$WORKER_PUBLIC/open/assets"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

for f in index.html styles.css app.js contract-address.js contract-source.txt site-config.js; do
  copy "$f"
done

cp "$SITE/index.html" "$STAGE/404.html"

for f in _redirects _headers CLOUDFLARE-UPLOAD.txt; do
  copy "$f"
done

cp "$SITE/open/index.html" "$STAGE/open/"
cp "$SITE/open/embed.html" "$STAGE/open/"
cp "$SITE/open/ide.css" "$STAGE/open/"
cp "$SITE/open/ide.js" "$STAGE/open/"
cp "$SITE/open/ide-gate.js" "$STAGE/open/"
cp "$SITE/open/assets/icon.svg" "$STAGE/open/assets/"

python3 << PY
from pathlib import Path
import shutil
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

shutil_cmd() {
  cp -a "$STAGE/." "$WORKER_PUBLIC/"
}
shutil_cmd

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)
rm -rf "$STAGE"

cp "$OUT" "$SITE/idecompiler-cloudflare-v6.zip"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/idecompiler-cloudflare-v6.zip"

echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
echo "Workers static assets: $WORKER_PUBLIC (use cloudflare/wrangler.toml)"
unzip -l "$OUT" | head -28
