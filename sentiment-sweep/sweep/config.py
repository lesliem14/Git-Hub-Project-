from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    meta_page_token: str
    meta_page_id: str
    meta_ig_user_id: str
    hellopeter_mode: str
    hellopeter_imap_host: str
    hellopeter_imap_user: str
    hellopeter_imap_password: str
    hellopeter_imap_folder: str
    hellopeter_api_url: str
    hellopeter_api_key: str
    policy_regex: re.Pattern[str]
    excel_output_dir: Path
    anthropic_api_key: str
    anthropic_model: str
    teams_webhook_url: str
    alert_smtp_host: str
    alert_smtp_port: int
    alert_smtp_user: str
    alert_smtp_password: str
    alert_email_to: str
    similarity_threshold: float
    sla_amber_hours: float
    sla_red_hours: float
    database_path: Path
    latest_excel_name: str
    skip_persist: bool

    @classmethod
    def load(cls) -> Settings:
        policy = os.getenv(
            "POLICY_REGEX",
            r"(?i)\b(?:POL|CLT)[-\s]?\d{6,12}\b",
        )
        return cls(
            meta_page_token=os.getenv("META_PAGE_ACCESS_TOKEN", "").strip(),
            meta_page_id=os.getenv("META_PAGE_ID", "").strip(),
            meta_ig_user_id=os.getenv("META_IG_USER_ID", "").strip(),
            hellopeter_mode=os.getenv("HELLOPETER_MODE", "email").strip().lower(),
            hellopeter_imap_host=os.getenv("HELLOPETER_IMAP_HOST", "").strip(),
            hellopeter_imap_user=os.getenv("HELLOPETER_IMAP_USER", "").strip(),
            hellopeter_imap_password=os.getenv("HELLOPETER_IMAP_PASSWORD", "").strip(),
            hellopeter_imap_folder=os.getenv("HELLOPETER_IMAP_FOLDER", "INBOX").strip(),
            hellopeter_api_url=os.getenv("HELLOPETER_API_URL", "").strip(),
            hellopeter_api_key=os.getenv("HELLOPETER_API_KEY", "").strip(),
            policy_regex=re.compile(policy),
            excel_output_dir=Path(os.getenv("EXCEL_OUTPUT_DIR", "./output")),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", "").strip(),
            anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
            teams_webhook_url=os.getenv("TEAMS_WEBHOOK_URL", "").strip(),
            alert_smtp_host=os.getenv("ALERT_SMTP_HOST", "").strip(),
            alert_smtp_port=int(os.getenv("ALERT_SMTP_PORT", "587")),
            alert_smtp_user=os.getenv("ALERT_SMTP_USER", "").strip(),
            alert_smtp_password=os.getenv("ALERT_SMTP_PASSWORD", "").strip(),
            alert_email_to=os.getenv("ALERT_EMAIL_TO", "").strip(),
            similarity_threshold=float(os.getenv("SIMILARITY_THRESHOLD", "0.55")),
            sla_amber_hours=float(os.getenv("SLA_AMBER_HOURS", "24")),
            sla_red_hours=float(os.getenv("SLA_RED_HOURS", "72")),
            database_path=Path(os.getenv("DATABASE_PATH", "./data/sweep.db")),
            latest_excel_name=os.getenv("LATEST_EXCEL_NAME", "social_sweep_LATEST.xlsx"),
            skip_persist=_bool("SWEEP_SKIP_PERSIST", False),
        )

    def meta_configured(self) -> bool:
        return bool(self.meta_page_token and self.meta_page_id)
