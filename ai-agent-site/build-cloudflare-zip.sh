#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage"
OUT="$ROOT/idecompiler-cloudflare-v4.zip"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/assets"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

for f in index.html styles.css dynamic-app.js contract-address.js contract-source.txt site-config.js; do
  copy "$f"
done

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
site = Path("$SITE")
stage = Path("$STAGE")
css = (site / "open/ide.css").read_text()
needle = '<link rel="stylesheet" href="ide.css" />'
inline = '<style id="ide-theme">\n' + css + '\n</style>'
for name in ("embed.html",):
    html = (site / "open" / name).read_text()
    if needle not in html:
        raise SystemExit(f"open/{name} missing ide.css link marker")
    (stage / "open" / name).write_text(html.replace(needle, inline, 1))
PY

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)
rm -rf "$STAGE"

cp "$OUT" "$SITE/idecompiler-cloudflare-v4.zip"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/idecompiler-cloudflare-v4.zip"

echo "Created $OUT"
ls -lh "$OUT"
