#!/usr/bin/env bash
# Builds idecompiler-lovable-v7.zip — Lovable.dev (Vite build → dist/)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
BUNDLE="$ROOT/.lovable-bundle-v7"
PUBLIC="$SITE/lovable/public"
ZIP_NAME="idecompiler-lovable-v7.zip"
OUT="$ROOT/$ZIP_NAME"

# shellcheck source=build-lib-stage.sh
source "$SITE/build-lib-stage.sh"

rm -rf "$BUNDLE" "$PUBLIC"
mkdir -p "$PUBLIC/open/assets"

stage_idecompiler_site "$SITE" "$PUBLIC"

cat > "$PUBLIC/_redirects" << 'REDIR'
/open      /index.html  302
/open/     /index.html  302
/*         /index.html  200
REDIR

cp "$SITE/site-root-check.txt" "$PUBLIC/site-root-check.txt"
cp "$SITE/LOVABLE-INSTALL.txt" "$PUBLIC/LOVABLE-INSTALL.txt"

rm -rf "$BUNDLE"
mkdir -p "$BUNDLE"
cp "$SITE/lovable/package.json" "$BUNDLE/"
cp "$SITE/lovable/vite.config.js" "$BUNDLE/"
cp -r "$SITE/lovable/scripts" "$BUNDLE/"
cp "$SITE/LOVABLE-DEPLOY.md" "$BUNDLE/LOVABLE-DEPLOY.md"
cp "$SITE/LOVABLE-INSTALL.txt" "$BUNDLE/LOVABLE-INSTALL.txt"
cp -r "$PUBLIC" "$BUNDLE/public"

rm -f "$OUT" "$SITE/$ZIP_NAME" "$ROOT/download/$ZIP_NAME"
(cd "$BUNDLE" && zip -X -r "$OUT" .)
unzip -t "$OUT" >/dev/null

cp "$OUT" "$SITE/$ZIP_NAME"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/$ZIP_NAME"

rm -rf "$BUNDLE"

echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
unzip -l "$OUT" | head -22
