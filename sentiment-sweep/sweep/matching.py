from __future__ import annotations

import difflib
import hashlib
import re
from dataclasses import dataclass

from sweep.config import Settings
from sweep.db import ComplaintRecord


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def _name_key(name: str | None) -> str | None:
    if not name:
        return None
    cleaned = re.sub(r"[^a-z\s]", "", name.lower()).strip()
    return cleaned or None


def text_similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, _normalize_text(a), _normalize_text(b)).ratio()


@dataclass(frozen=True)
class LinkResult:
    client_group_id: str
    link_type: str | None
    similarity_score: float | None


def assign_client_group(
    record: ComplaintRecord,
    existing: list[ComplaintRecord],
    settings: Settings,
) -> LinkResult:
    """Link to prior items: CONFIRMED > LIKELY > POSSIBLE."""
    for other in existing:
        if other.id == record.id:
            continue
        if record.email and other.email and record.email == other.email:
            gid = other.client_group_id or _new_group_id(record)
            return LinkResult(gid, "CONFIRMED", 1.0)
        if record.cell and other.cell and record.cell == other.cell:
            gid = other.client_group_id or _new_group_id(record)
            return LinkResult(gid, "CONFIRMED", 1.0)
        if record.policy_number and other.policy_number and record.policy_number == other.policy_number:
            gid = other.client_group_id or _new_group_id(record)
            return LinkResult(gid, "CONFIRMED", 1.0)

    record_name = _name_key(record.author_name)
    record_acct = record.author_account_id
    for other in existing:
        if other.id == record.id:
            continue
        if record_acct and other.author_account_id and record_acct == other.author_account_id:
            gid = other.client_group_id or _new_group_id(record)
            return LinkResult(gid, "LIKELY", 0.85)
        if record_name and _name_key(other.author_name) == record_name:
            gid = other.client_group_id or _new_group_id(record)
            return LinkResult(gid, "LIKELY", 0.75)

    best_score = 0.0
    best_other: ComplaintRecord | None = None
    for other in existing:
        if other.id == record.id:
            continue
        score = text_similarity(record.text, other.text)
        if score > best_score:
            best_score = score
            best_other = other

    if best_other and best_score >= settings.similarity_threshold:
        gid = best_other.client_group_id or _new_group_id(record)
        return LinkResult(gid, "POSSIBLE", round(best_score, 3))

    return LinkResult(_new_group_id(record), None, None)


def _new_group_id(record: ComplaintRecord) -> str:
    seed = f"{record.platform}:{record.external_id}:{record.email}:{record.cell}"
    digest = hashlib.sha256(seed.encode()).hexdigest()[:12]
    return f"cg_{digest}"


def detect_seen_before(
    record: ComplaintRecord,
    handled: list[ComplaintRecord],
    settings: Settings,
) -> tuple[bool, str | None, int | None]:
    for prior in handled:
        if prior.platform == record.platform and prior.external_id == record.external_id:
            continue
        sim = text_similarity(record.text, prior.text)
        same_client = (
            record.client_group_id
            and prior.client_group_id
            and record.client_group_id == prior.client_group_id
        )
        if sim >= max(settings.similarity_threshold, 0.7) or (
            same_client and sim >= 0.45
        ):
            days = abs((record.created_at - prior.created_at).days)
            return True, prior.handled_by, days
    return False, None, None
