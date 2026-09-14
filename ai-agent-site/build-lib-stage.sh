# shellcheck shell=bash
# Shared staging for deploy zips — source from build-*.sh scripts.
stage_idecompiler_site() {
  local SITE="$1"
  local STAGE="$2"

  mkdir -p "$STAGE/open/assets"

  local copy
  copy() { cp "$SITE/$1" "$STAGE/$1"; }

  for f in index.html styles.css app.js contract-address.js contract-source.txt site-config.js; do
    copy "$f"
  done

  cp "$SITE/index.html" "$STAGE/404.html"

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
html = (site / "open/embed.html").read_text()
if needle not in html:
    raise SystemExit("embed.html missing css link")
(stage / "open/embed.html").write_text(html.replace(needle, inline, 1))
PY
}
