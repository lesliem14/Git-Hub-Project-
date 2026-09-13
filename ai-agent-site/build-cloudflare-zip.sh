#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage"
OUT="$ROOT/cloudflare-pages.zip"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/css" "$STAGE/open/js" "$STAGE/open/assets"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

for f in index.html styles.css app.js contract.js site-config.js; do
  copy "$f"
done

for f in _redirects _headers CLOUDFLARE-UPLOAD.txt; do
  copy "$f"
done

cp "$SITE/open/index.html" "$STAGE/open/"
cp "$SITE/open/assets/icon.svg" "$STAGE/open/assets/"
cp "$SITE/open/css/"*.css "$STAGE/open/css/"
cp "$SITE/open/js/"*.js "$STAGE/open/js/"

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)

echo "Created $OUT"
ls -lh "$OUT"
unzip -l "$OUT" | wc -l
