from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from openpyxl import load_workbook

from sweep.config import Settings
from sweep.db import SweepDatabase

VALID_STATUSES = {"Acknowledged", "Resolved", "Not a complaint", "Open"}


def _find_latest_workbook(output_dir: Path, latest_name: str) -> Path | None:
    latest = output_dir / latest_name
    if latest.exists():
        return latest
    candidates = sorted(output_dir.glob("social_sweep_*.xlsx"), reverse=True)
    return candidates[0] if candidates else None


def import_admin_updates(db: SweepDatabase, settings: Settings) -> int:
    """Read Status / Handled By from the latest Excel (admin loop)."""
    path = _find_latest_workbook(settings.excel_output_dir, settings.latest_excel_name)
    if not path:
        return 0

    mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    if datetime.now(timezone.utc) - mtime > timedelta(hours=36):
        # Stale file — still import but admins may have stopped updating
        pass

    wb = load_workbook(path, read_only=True, data_only=True)
    if "Priority Queue" not in wb.sheetnames:
        wb.close()
        return 0

    ws = wb["Priority Queue"]
    headers = [str(c.value).strip() if c.value else "" for c in next(ws.iter_rows(min_row=1, max_row=1))]
    try:
        key_idx = headers.index("Item Key")
        status_idx = headers.index("Status")
        handled_idx = headers.index("Handled By")
    except ValueError:
        wb.close()
        return 0

    updated = 0
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row or len(row) <= max(key_idx, status_idx, handled_idx):
            continue
        item_key = row[key_idx]
        status = row[status_idx]
        handled_by = row[handled_idx]
        if not item_key or not status:
            continue
        status_str = str(status).strip()
        if status_str not in VALID_STATUSES:
            continue
        handled_str = str(handled_by).strip() if handled_by else None
        if db.update_status(str(item_key), status_str, handled_str or None):
            updated += 1

    wb.close()
    return updated
