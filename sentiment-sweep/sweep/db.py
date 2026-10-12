from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


@dataclass
class ComplaintRecord:
    id: int | None
    platform: str
    external_id: str
    author_name: str | None
    author_account_id: str | None
    text: str
    source_url: str | None
    created_at: datetime
    sentiment: str | None = None
    urgency: int | None = None
    category: str | None = None
    regulatory_flag: bool = False
    email: str | None = None
    cell: str | None = None
    policy_number: str | None = None
    client_group_id: str | None = None
    link_type: str | None = None
    similarity_score: float | None = None
    seen_before: bool = False
    seen_before_handled_by: str | None = None
    seen_before_days_apart: int | None = None
    status: str = "Open"
    handled_by: str | None = None
    summary: str | None = None
    suggested_action: str | None = None
    collected_at: datetime | None = None

    @property
    def item_key(self) -> str:
        return f"{self.platform}:{self.external_id}"


class SweepDatabase:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def _init_schema(self) -> None:
        with self.connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS complaints (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    platform TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    author_name TEXT,
                    author_account_id TEXT,
                    text TEXT NOT NULL,
                    source_url TEXT,
                    created_at TEXT NOT NULL,
                    sentiment TEXT,
                    urgency INTEGER,
                    category TEXT,
                    regulatory_flag INTEGER DEFAULT 0,
                    email TEXT,
                    cell TEXT,
                    policy_number TEXT,
                    client_group_id TEXT,
                    link_type TEXT,
                    similarity_score REAL,
                    seen_before INTEGER DEFAULT 0,
                    seen_before_handled_by TEXT,
                    seen_before_days_apart INTEGER,
                    status TEXT DEFAULT 'Open',
                    handled_by TEXT,
                    summary TEXT,
                    suggested_action TEXT,
                    collected_at TEXT,
                    UNIQUE(platform, external_id)
                );
                CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
                CREATE INDEX IF NOT EXISTS idx_complaints_client ON complaints(client_group_id);
                CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(email);
                CREATE INDEX IF NOT EXISTS idx_complaints_cell ON complaints(cell);
                CREATE INDEX IF NOT EXISTS idx_complaints_policy ON complaints(policy_number);
                """
            )

    def upsert_complaint(self, record: ComplaintRecord) -> int:
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO complaints (
                    platform, external_id, author_name, author_account_id, text, source_url,
                    created_at, sentiment, urgency, category, regulatory_flag, email, cell,
                    policy_number, client_group_id, link_type, similarity_score, seen_before,
                    seen_before_handled_by, seen_before_days_apart, status, handled_by,
                    summary, suggested_action, collected_at
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(platform, external_id) DO UPDATE SET
                    author_name=excluded.author_name,
                    text=excluded.text,
                    sentiment=excluded.sentiment,
                    urgency=excluded.urgency,
                    category=excluded.category,
                    regulatory_flag=excluded.regulatory_flag,
                    email=excluded.email,
                    cell=excluded.cell,
                    policy_number=excluded.policy_number,
                    client_group_id=excluded.client_group_id,
                    link_type=excluded.link_type,
                    similarity_score=excluded.similarity_score,
                    seen_before=excluded.seen_before,
                    seen_before_handled_by=excluded.seen_before_handled_by,
                    seen_before_days_apart=excluded.seen_before_days_apart,
                    summary=excluded.summary,
                    suggested_action=excluded.suggested_action,
                    collected_at=excluded.collected_at
                """,
                (
                    record.platform,
                    record.external_id,
                    record.author_name,
                    record.author_account_id,
                    record.text,
                    record.source_url,
                    _iso(record.created_at),
                    record.sentiment,
                    record.urgency,
                    record.category,
                    1 if record.regulatory_flag else 0,
                    record.email,
                    record.cell,
                    record.policy_number,
                    record.client_group_id,
                    record.link_type,
                    record.similarity_score,
                    1 if record.seen_before else 0,
                    record.seen_before_handled_by,
                    record.seen_before_days_apart,
                    record.status,
                    record.handled_by,
                    record.summary,
                    record.suggested_action,
                    _iso(record.collected_at or utc_now()),
                ),
            )
            row = conn.execute(
                "SELECT id FROM complaints WHERE platform=? AND external_id=?",
                (record.platform, record.external_id),
            ).fetchone()
            return int(row["id"])

    def update_status(self, item_key: str, status: str, handled_by: str | None) -> bool:
        if ":" not in item_key:
            return False
        platform, external_id = item_key.split(":", 1)
        with self.connect() as conn:
            cur = conn.execute(
                """
                UPDATE complaints SET status=?, handled_by=?
                WHERE platform=? AND external_id=?
                """,
                (status, handled_by, platform, external_id),
            )
            return cur.rowcount > 0

    def list_open_complaints(self) -> list[ComplaintRecord]:
        return self._list_where("status NOT IN ('Resolved', 'Not a complaint')")

    def list_all_complaints(self) -> list[ComplaintRecord]:
        return self._list_where("1=1")

    def _list_where(self, clause: str) -> list[ComplaintRecord]:
        with self.connect() as conn:
            rows = conn.execute(
                f"SELECT * FROM complaints WHERE {clause} ORDER BY created_at ASC"
            ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def list_handled_for_repost_check(self) -> list[ComplaintRecord]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM complaints
                WHERE status IN ('Acknowledged', 'Resolved')
                ORDER BY created_at DESC
                """
            ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def _row_to_record(self, row: sqlite3.Row) -> ComplaintRecord:
        return ComplaintRecord(
            id=row["id"],
            platform=row["platform"],
            external_id=row["external_id"],
            author_name=row["author_name"],
            author_account_id=row["author_account_id"],
            text=row["text"],
            source_url=row["source_url"],
            created_at=_parse_iso(row["created_at"]) or utc_now(),
            sentiment=row["sentiment"],
            urgency=row["urgency"],
            category=row["category"],
            regulatory_flag=bool(row["regulatory_flag"]),
            email=row["email"],
            cell=row["cell"],
            policy_number=row["policy_number"],
            client_group_id=row["client_group_id"],
            link_type=row["link_type"],
            similarity_score=row["similarity_score"],
            seen_before=bool(row["seen_before"]),
            seen_before_handled_by=row["seen_before_handled_by"],
            seen_before_days_apart=row["seen_before_days_apart"],
            status=row["status"] or "Open",
            handled_by=row["handled_by"],
            summary=row["summary"],
            suggested_action=row["suggested_action"],
            collected_at=_parse_iso(row["collected_at"]),
        )

    def export_json_snapshot(self) -> str:
        records = [asdict(r) for r in self.list_all_complaints()]
        for r in records:
            r["created_at"] = _iso(r["created_at"])
            r["collected_at"] = _iso(r.get("collected_at"))
        return json.dumps(records, indent=2)
