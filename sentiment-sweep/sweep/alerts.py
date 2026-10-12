from __future__ import annotations

import smtplib
from email.mime.text import MIMEText

import requests

from sweep.config import Settings
from sweep.db import ComplaintRecord


def _mask(text: str | None) -> str:
    if not text:
        return ""
    t = text.strip()
    if len(t) <= 4:
        return "***"
    return f"{t[:2]}…{t[-2:]}"


def should_alert(record: ComplaintRecord) -> bool:
    if record.regulatory_flag:
        return True
    if record.seen_before:
        return True
    if record.urgency is not None and record.urgency >= 4:
        return True
    return False


def build_alert_body(record: ComplaintRecord) -> str:
    return (
        f"Social sweep alert\n"
        f"Platform: {record.platform}\n"
        f"Urgency: {record.urgency}\n"
        f"Category: {record.category}\n"
        f"Regulatory: {'yes' if record.regulatory_flag else 'no'}\n"
        f"Seen before: {'yes' if record.seen_before else 'no'}\n"
        f"Client group: {_mask(record.client_group_id)}\n"
        f"Email/cell/policy: {_mask(record.email)} / {_mask(record.cell)} / {_mask(record.policy_number)}\n"
        f"Summary: {record.summary}\n"
        f"Suggested: {record.suggested_action}\n"
        f"Item: {_mask(record.item_key)}"
    )


def send_alerts(records: list[ComplaintRecord], settings: Settings) -> int:
    sent = 0
    for record in records:
        if not should_alert(record):
            continue
        body = build_alert_body(record)
        if settings.teams_webhook_url:
            requests.post(
                settings.teams_webhook_url,
                json={"text": body},
                timeout=30,
            ).raise_for_status()
            sent += 1
        if settings.alert_smtp_host and settings.alert_email_to:
            msg = MIMEText(body)
            msg["Subject"] = f"[Social Sweep] Urgency {record.urgency} — {record.category}"
            msg["From"] = settings.alert_smtp_user or settings.alert_email_to
            msg["To"] = settings.alert_email_to
            with smtplib.SMTP(settings.alert_smtp_host, settings.alert_smtp_port) as smtp:
                if settings.alert_smtp_user:
                    smtp.starttls()
                    smtp.login(settings.alert_smtp_user, settings.alert_smtp_password)
                smtp.send_message(msg)
            sent += 1
    return sent
