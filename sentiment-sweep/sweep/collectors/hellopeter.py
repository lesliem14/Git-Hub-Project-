from __future__ import annotations

import email
import imaplib
import re
from datetime import datetime, timezone
from email.header import decode_header
from typing import Any

import requests

from sweep.config import Settings
from sweep.db import ComplaintRecord


def _decode_part(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    out = []
    for chunk, enc in parts:
        if isinstance(chunk, bytes):
            out.append(chunk.decode(enc or "utf-8", errors="replace"))
        else:
            out.append(chunk)
    return "".join(out)


def _parse_email_date(msg: email.message.Message) -> datetime:
    raw = msg.get("Date")
    if not raw:
        return datetime.now(timezone.utc)
    try:
        dt = email.utils.parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return datetime.now(timezone.utc)


def _extract_body(msg: email.message.Message) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode(part.get_content_charset() or "utf-8", errors="replace")
        return ""
    payload = msg.get_payload(decode=True)
    if not payload:
        return ""
    return payload.decode(msg.get_content_charset() or "utf-8", errors="replace")


def collect_hellopeter_email(settings: Settings) -> list[ComplaintRecord]:
    if not all(
        [
            settings.hellopeter_imap_host,
            settings.hellopeter_imap_user,
            settings.hellopeter_imap_password,
        ]
    ):
        return []

    mail = imaplib.IMAP4_SSL(settings.hellopeter_imap_host)
    mail.login(settings.hellopeter_imap_user, settings.hellopeter_imap_password)
    mail.select(settings.hellopeter_imap_folder)
    _, data = mail.search(None, "UNSEEN")
    ids = data[0].split() if data and data[0] else []
    records: list[ComplaintRecord] = []

    for num in ids[-50:]:
        _, msg_data = mail.fetch(num, "(RFC822)")
        if not msg_data or not msg_data[0]:
            continue
        raw = msg_data[0][1]
        msg = email.message_from_bytes(raw)
        subject = _decode_part(msg.get("Subject"))
        body = _extract_body(msg)
        text = f"{subject}\n\n{body}".strip()
        if "hello peter" not in text.lower() and "hellopeter" not in subject.lower():
            continue
        ext_id = _decode_part(msg.get("Message-ID")) or f"hp-{num.decode()}"
        records.append(
            ComplaintRecord(
                id=None,
                platform="hellopeter",
                external_id=ext_id.strip("<>"),
                author_name=None,
                author_account_id=None,
                text=text[:8000],
                source_url=None,
                created_at=_parse_email_date(msg),
            )
        )
    mail.logout()
    return records


def collect_hellopeter_api(settings: Settings) -> list[ComplaintRecord]:
    if not settings.hellopeter_api_url or not settings.hellopeter_api_key:
        return []
    resp = requests.get(
        settings.hellopeter_api_url,
        headers={"Authorization": f"Bearer {settings.hellopeter_api_key}"},
        timeout=60,
    )
    resp.raise_for_status()
    payload: Any = resp.json()
    items = payload if isinstance(payload, list) else payload.get("reviews", [])
    out: list[ComplaintRecord] = []
    for item in items:
        out.append(
            ComplaintRecord(
                id=None,
                platform="hellopeter",
                external_id=str(item.get("id")),
                author_name=item.get("author"),
                author_account_id=item.get("author_id"),
                text=str(item.get("text") or item.get("body") or ""),
                source_url=item.get("url"),
                created_at=datetime.fromisoformat(
                    str(item.get("created_at", datetime.now(timezone.utc).isoformat())).replace(
                        "Z", "+00:00"
                    )
                ),
            )
        )
    return out


def collect_hellopeter(settings: Settings) -> list[ComplaintRecord]:
    if settings.hellopeter_mode == "api":
        return collect_hellopeter_api(settings)
    return collect_hellopeter_email(settings)
