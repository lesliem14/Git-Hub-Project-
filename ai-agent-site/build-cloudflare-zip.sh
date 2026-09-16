#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.cloudflare-stage"
OUT="$ROOT/eth-arbitrage-cloudflare.zip"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/assets" "$STAGE/open/project"

copy() { cp "$SITE/$1" "$STAGE/$1"; }

for f in index.html styles.css dynamic-app.js contract-address.js contract-source.txt site-config.js; do
  copy "$f"
done

for f in _redirects _headers; do
  copy "$f"
done

cp "$SITE/open/index.html" "$STAGE/open/"
cp "$SITE/open/embed.html" "$STAGE/open/"
cp "$SITE/open/ide.css" "$STAGE/open/"
cp "$SITE/open/ide.js" "$STAGE/open/"
cp "$SITE/open/ide-gate.js" "$STAGE/open/"
cp "$SITE/open/assets/icon.svg" "$STAGE/open/assets/"
cp "$SITE/open/project/bot.py" "$STAGE/open/project/bot.py"

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)
rm -rf "$STAGE"

cp "$OUT" "$SITE/eth-arbitrage-cloudflare.zip"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/eth-arbitrage-cloudflare.zip"

echo "Created $OUT"
ls -lh "$OUT"
