#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python main.py sweep --dry-run
python main.py excel
python main.py report
