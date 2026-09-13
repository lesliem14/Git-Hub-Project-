#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage"
OUT="$ROOT/ai-agent-cloudflare.zip"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/assets"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

for f in index.html styles.css app.js contract.js site-config.js; do
  copy "$f"
done

for f in _redirects _headers CLOUDFLARE-UPLOAD.txt; do
  copy "$f"
done

cp "$SITE/open/index.html" "$STAGE/open/"
cp "$SITE/open/ide.css" "$STAGE/open/"
cp "$SITE/open/ide.js" "$STAGE/open/"
cp "$SITE/open/assets/icon.svg" "$STAGE/open/assets/"

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)
rm -rf "$STAGE"

echo "Created $OUT"
ls -lh "$OUT"
