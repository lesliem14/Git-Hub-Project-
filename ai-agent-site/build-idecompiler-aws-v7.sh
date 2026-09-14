#!/usr/bin/env bash
# Builds idecompiler-aws-v7.zip — static site for Amazon S3 (or S3 + CloudFront).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$ROOT/.aws-stage-v7"
ZIP_NAME="idecompiler-aws-v7.zip"
OUT="$ROOT/$ZIP_NAME"

# shellcheck source=build-lib-stage.sh
source "$SITE/build-lib-stage.sh"

rm -rf "$STAGE"
mkdir -p "$STAGE/open/assets"

cat > "$STAGE/OPEN-THIS-FIRST.txt" << 'TXT'
IDE Compiler — AWS S3 bundle (v7)
=================================

1. Extract this zip (Extract All on Windows).
2. Upload the extracted files to your S3 bucket keeping the same layout:
      index.html, styles.css, app.js, open/, … at the BUCKET ROOT (or site prefix).

3. Set object content types (see AWS-DEPLOY.txt).

Guide:  index.html  or  https://s3.amazonaws.com/YOUR-BUCKET/index.html
IDE:    open/embed.html?dev=1&embed=1

Do not upload the .zip file as a single object.
TXT

cp "$SITE/AWS-DEPLOY.txt" "$STAGE/AWS-DEPLOY.txt"
cp "$SITE/amplify.yml" "$STAGE/amplify.yml"
cp "$SITE/site-root-check.txt" "$STAGE/site-root-check.txt"
stage_idecompiler_site "$SITE" "$STAGE"

rm -f "$OUT" "$SITE/$ZIP_NAME" "$ROOT/download/$ZIP_NAME"
(cd "$STAGE" && zip -X -r "$OUT" .)
unzip -t "$OUT" >/dev/null

cp "$OUT" "$SITE/$ZIP_NAME"
mkdir -p "$ROOT/download"
cp "$OUT" "$ROOT/download/$ZIP_NAME"

rm -rf "$STAGE"

echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
unzip -l "$OUT" | head -22
