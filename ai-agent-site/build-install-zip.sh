#!/usr/bin/env bash
# Build idecompiler-install.zip (run from repo root or ai-agent-site parent)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/ai-agent-site"
OUT="$ROOT/idecompiler-install.zip"

cd "$SITE"
zip -r "$OUT" . -x "AWS-S3.md" -x "idecompiler-install.zip" -x "build-install-zip.sh"
cp "$OUT" "$SITE/idecompiler-install.zip"
zip -u "$OUT" idecompiler-install.zip downloads/idecompiler-site.zip

cp "$OUT" "$ROOT/drop-site.zip"
cp "$OUT" "$ROOT/ai-agent-site-cloudflare.zip"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/idecompiler-install.zip"
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
