from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Pattern

EMAIL_RE = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
)
# South African mobile: +27 7x / 0 7x / 8x landline variants simplified
CELL_RE = re.compile(
    r"(?<!\d)(?:\+27|0)\s?(?:6[0-9]|7[0-9]|8[0-9])\s?\d{3}\s?\d{4}(?!\d)",
)


@dataclass(frozen=True)
class ExtractedIdentifiers:
    email: str | None
    cell: str | None
    policy_number: str | None


def normalize_cell(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("27") and len(digits) == 11:
        return f"+{digits}"
    if digits.startswith("0") and len(digits) == 10:
        return f"+27{digits[1:]}"
    return raw.strip()


def extract_identifiers(text: str, policy_pattern: Pattern[str]) -> ExtractedIdentifiers:
    email_match = EMAIL_RE.search(text or "")
    cell_match = CELL_RE.search(text or "")
    policy_match = policy_pattern.search(text or "")
    return ExtractedIdentifiers(
        email=email_match.group(0).lower() if email_match else None,
        cell=normalize_cell(cell_match.group(0)) if cell_match else None,
        policy_number=policy_match.group(0).upper().replace(" ", "") if policy_match else None,
    )
