#!/usr/bin/env bash
# Build drag-and-drop deploy zip: unzip at web host root (index.html at top level).
set -euo pipefail
SITE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SITE/.." && pwd)"
ZIP_NAME="eth-arbitrage-site-install.zip"
OUT="$ROOT/$ZIP_NAME"
STAGE="$ROOT/.install-stage"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/assets" "$STAGE/open/project" "$STAGE/assets"

copy() {
  local src="$1"
  local dest="${2:-$1}"
  cp "$SITE/$src" "$STAGE/$dest"
}

# --- Page 1: guide ---
for f in index.html styles.css dynamic-app.js site-config.js contract-address.js contract-source.txt contract.js; do
  copy "$f"
done

# --- Hosting ---
for f in _redirects _headers; do
  copy "$f"
done

# --- Page 2: Cloud Workspace IDE ---
for f in open/embed.html open/ide.css open/ide.js open/ide-gate.js open/index.html open.html; do
  copy "$f"
done
copy "open/assets/icon.svg"
copy "open/project/bot.py"

copy "assets/icon.svg"

# --- Installation & deploy docs (included in zip) ---
for f in \
  INSTALL.txt \
  DRAG-DROP-INSTALL.txt \
  README.md \
  DOWNLOAD.md \
  FILES-REQUIRED.md \
  TWO-PAGES.md \
  AWS-S3.md \
  CLOUDFLARE-DEPLOY.md \
  CLOUDFLARE-UPLOAD.txt \
  UPLOAD-S3.txt \
  WORKERS-DEPLOY.md; do
  if [[ -f "$SITE/$f" ]]; then
    copy "$f"
  fi
done

# Optional legacy / redirect pages
for f in ide.html download.html; do
  [[ -f "$SITE/$f" ]] && copy "$f"
done

rm -f "$OUT"
(cd "$STAGE" && zip -r -9 "$OUT" .)

cp "$OUT" "$SITE/$ZIP_NAME"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/$ZIP_NAME"

# Lean Cloudflare bundle (site only, no extra docs)
bash "$SITE/build-cloudflare-zip.sh" 2>/dev/null || true

rm -rf "$STAGE"
echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
echo "Also copied to $SITE/$ZIP_NAME and $ROOT/download/$ZIP_NAME"
