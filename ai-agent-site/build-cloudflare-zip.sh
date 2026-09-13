#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage"
OUT="$ROOT/idecompiler-cloudflare-v4.zip"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/assets"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

for f in index.html styles.css app.js contract-address.js contract-source.txt site-config.js; do
  copy "$f"
done

for f in _redirects _headers CLOUDFLARE-UPLOAD.txt; do
  copy "$f"
done

cp "$SITE/open/index.html" "$STAGE/open/"
cp "$SITE/open/ide.css" "$STAGE/open/"
cp "$SITE/open/ide.js" "$STAGE/open/"
cp "$SITE/open/ide-gate.js" "$STAGE/open/"
cp "$SITE/open/assets/icon.svg" "$STAGE/open/assets/"

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)
rm -rf "$STAGE"

cp "$OUT" "$SITE/idecompiler-cloudflare-v4.zip"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/idecompiler-cloudflare-v4.zip"

echo "Created $OUT"
ls -lh "$OUT"
unzip -l "$OUT"
