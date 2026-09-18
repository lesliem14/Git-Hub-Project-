#!/usr/bin/env bash
# Back-compat wrapper — prefer: cd agentra && npm run demo:smoke
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$SCRIPT_DIR/../agentra/scripts/demo-smoke.sh"
