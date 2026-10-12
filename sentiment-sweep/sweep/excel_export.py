from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from openpyxl.utils import get_column_letter

from sweep.config import Settings
from sweep.db import ComplaintRecord, SweepDatabase

HOW_TO_USE = [
    "1. Open social_sweep_LATEST.xlsx each hour.",
    "2. Work Priority Queue top-down (oldest first).",
    "3. Set Status: Acknowledged / Resolved / Not a complaint.",
    "4. Fill Handled By with your name.",
    "5. Save and close — the next hourly sweep imports your updates.",
    "6. Verify POSSIBLE/LIKELY client links before merging cases.",
]


def _age_hours(created: datetime) -> float:
    now = datetime.now(timezone.utc)
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return round((now - created).total_seconds() / 3600, 1)


def _sla_flag(age_h: float, settings: Settings) -> str:
    if age_h >= settings.sla_red_hours:
        return "RED"
    if age_h >= settings.sla_amber_hours:
        return "AMBER"
    return ""


def write_excel(db: SweepDatabase, settings: Settings) -> tuple[Path, Path]:
    settings.excel_output_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    stamped = settings.excel_output_dir / f"social_sweep_{ts}.xlsx"
    latest = settings.excel_output_dir / settings.latest_excel_name

    open_rows = db.list_open_complaints()
    all_rows = db.list_all_complaints()

    wb = Workbook()
    _write_priority_queue(wb.active, open_rows, settings)
    wb.active.title = "Priority Queue"

    same = wb.create_sheet("Same Client")
    _write_same_client(same, all_rows)

    seen = wb.create_sheet("Seen Before")
    _write_seen_before(seen, all_rows)

    guide = wb.create_sheet("How to use")
    for i, line in enumerate(HOW_TO_USE, start=1):
        guide.cell(row=i, column=1, value=line)

    wb.save(stamped)
    wb.save(latest)
    return stamped, latest


def _write_priority_queue(ws, rows: list[ComplaintRecord], settings: Settings) -> None:
    headers = [
        "Item Key",
        "Age (hours)",
        "SLA",
        "Platform",
        "Created (UTC)",
        "Client Group",
        "Link",
        "Email",
        "Cell",
        "Policy No.",
        "Urgency",
        "Category",
        "Regulatory",
        "Summary",
        "Suggested Action",
        "Status",
        "Handled By",
        "Source URL",
    ]
    ws.append(headers)
    header_font = Font(bold=True)
    for col in range(1, len(headers) + 1):
        ws.cell(row=1, column=col).font = header_font

    amber_fill = PatternFill("solid", fgColor="FFF4CE")
    red_fill = PatternFill("solid", fgColor="F8D7DA")

    for r in sorted(rows, key=lambda x: x.created_at):
        age = _age_hours(r.created_at)
        sla = _sla_flag(age, settings)
        row_idx = ws.max_row + 1
        ws.append(
            [
                r.item_key,
                age,
                sla,
                r.platform,
                r.created_at.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M"),
                r.client_group_id,
                r.link_type or "",
                r.email or "",
                r.cell or "",
                r.policy_number or "",
                r.urgency,
                r.category,
                "YES" if r.regulatory_flag else "",
                r.summary,
                r.suggested_action,
                r.status,
                r.handled_by or "",
                r.source_url or "",
            ]
        )
        if sla == "AMBER":
            for c in range(1, len(headers) + 1):
                ws.cell(row=row_idx, column=c).fill = amber_fill
        elif sla == "RED":
            for c in range(1, len(headers) + 1):
                ws.cell(row=row_idx, column=c).fill = red_fill

    for i, _ in enumerate(headers, start=1):
        ws.column_dimensions[get_column_letter(i)].width = 16
    ws.column_dimensions["N"].width = 40
    ws.column_dimensions["O"].width = 36


def _write_same_client(ws, rows: list[ComplaintRecord]) -> None:
    ws.append(
        ["Client Group", "Item Key", "Platform", "Link", "Score", "Author", "Summary", "Status"]
    )
    grouped = [r for r in rows if r.link_type]
    for r in sorted(grouped, key=lambda x: (x.client_group_id or "", x.created_at)):
        ws.append(
            [
                r.client_group_id,
                r.item_key,
                r.platform,
                r.link_type,
                r.similarity_score,
                r.author_name,
                r.summary,
                r.status,
            ]
        )


def _write_seen_before(ws, rows: list[ComplaintRecord]) -> None:
    ws.append(
        [
            "Item Key",
            "Platform",
            "Days Apart",
            "Prior Handled By",
            "Summary",
            "Status",
        ]
    )
    for r in rows:
        if not r.seen_before:
            continue
        ws.append(
            [
                r.item_key,
                r.platform,
                r.seen_before_days_apart,
                r.seen_before_handled_by,
                r.summary,
                r.status,
            ]
        )
