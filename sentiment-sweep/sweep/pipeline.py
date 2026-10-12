from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sweep.admin_import import import_admin_updates
from sweep.alerts import send_alerts
from sweep.classify import classify_text
from sweep.collectors import collect_hellopeter, collect_meta
from sweep.config import Settings
from sweep.db import ComplaintRecord, SweepDatabase, utc_now
from sweep.excel_export import write_excel
from sweep.extract import extract_identifiers
from sweep.matching import assign_client_group, detect_seen_before


@dataclass
class SweepResult:
    imported_admin_rows: int
    collected: int
    persisted: int
    alerts_sent: int
    excel_latest: str | None
    excel_stamped: str | None
    dry_run: bool


def run_sweep(settings: Settings, *, dry_run: bool = False) -> SweepResult:
    db = SweepDatabase(settings.database_path)
    imported = 0 if dry_run else import_admin_updates(db, settings)

    since = datetime.now(timezone.utc) - timedelta(hours=2)
    incoming: list[ComplaintRecord] = []
    incoming.extend(collect_meta(settings, since=since))
    incoming.extend(collect_hellopeter(settings))

    existing = db.list_all_complaints()
    handled = db.list_handled_for_repost_check()
    persisted = 0
    processed: list[ComplaintRecord] = []

    for raw in incoming:
        ids = extract_identifiers(raw.text, settings.policy_regex)
        classification = classify_text(raw.text, settings)
        record = ComplaintRecord(
            id=raw.id,
            platform=raw.platform,
            external_id=raw.external_id,
            author_name=raw.author_name,
            author_account_id=raw.author_account_id,
            text=raw.text,
            source_url=raw.source_url,
            created_at=raw.created_at,
            email=ids.email,
            cell=ids.cell,
            policy_number=ids.policy_number,
            sentiment=classification.sentiment,
            urgency=classification.urgency,
            category=classification.category,
            regulatory_flag=classification.regulatory_flag,
            summary=classification.summary,
            suggested_action=classification.suggested_action,
            collected_at=utc_now(),
        )
        link = assign_client_group(record, existing + processed, settings)
        record.client_group_id = link.client_group_id
        record.link_type = link.link_type
        record.similarity_score = link.similarity_score

        seen, handled_by, days = detect_seen_before(record, handled, settings)
        record.seen_before = seen
        record.seen_before_handled_by = handled_by
        record.seen_before_days_apart = days

        processed.append(record)
        if dry_run or settings.skip_persist:
            continue
        db.upsert_complaint(record)
        persisted += 1
        existing.append(record)

    alerts_sent = 0
    stamped_path = None
    latest_path = None
    if not dry_run and not settings.skip_persist:
        alerts_sent = send_alerts(processed, settings)
        stamped_path, latest_path = write_excel(db, settings)

    return SweepResult(
        imported_admin_rows=imported,
        collected=len(incoming),
        persisted=persisted,
        alerts_sent=alerts_sent,
        excel_latest=str(latest_path) if latest_path else None,
        excel_stamped=str(stamped_path) if stamped_path else None,
        dry_run=dry_run,
    )


def rebuild_excel(settings: Settings) -> tuple[str, str]:
    db = SweepDatabase(settings.database_path)
    stamped, latest = write_excel(db, settings)
    return str(stamped), str(latest)


def weekly_report(settings: Settings) -> tuple[str, str]:
    import csv

    db = SweepDatabase(settings.database_path)
    rows = db.list_all_complaints()
    settings.excel_output_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d")
    csv_path = settings.excel_output_dir / f"weekly_report_{ts}.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "item_key",
                "platform",
                "status",
                "urgency",
                "category",
                "regulatory",
                "seen_before",
                "created_at",
            ]
        )
        for r in rows:
            writer.writerow(
                [
                    r.item_key,
                    r.platform,
                    r.status,
                    r.urgency,
                    r.category,
                    r.regulatory_flag,
                    r.seen_before,
                    r.created_at.isoformat(),
                ]
            )
    summary_path = settings.excel_output_dir / f"weekly_summary_{ts}.txt"
    open_count = sum(1 for r in rows if r.status not in ("Resolved", "Not a complaint"))
    regulatory = sum(1 for r in rows if r.regulatory_flag)
    seen = sum(1 for r in rows if r.seen_before)
    summary_path.write_text(
        "\n".join(
            [
                "Clientèle Social Complaints Sweep — weekly summary",
                f"Total records: {len(rows)}",
                f"Open queue: {open_count}",
                f"Regulatory flagged: {regulatory}",
                f"Seen-before reposts: {seen}",
                f"CSV: {csv_path.name}",
            ]
        ),
        encoding="utf-8",
    )
    return str(summary_path), str(csv_path)
