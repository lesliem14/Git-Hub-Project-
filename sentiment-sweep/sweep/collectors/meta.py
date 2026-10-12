from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import requests

from sweep.config import Settings
from sweep.db import ComplaintRecord

GRAPH = "https://graph.facebook.com/v21.0"


def _parse_time(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    try:
        if value.isdigit():
            return datetime.fromtimestamp(int(value), tz=timezone.utc)
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime.now(timezone.utc)


def _get(url: str, params: dict[str, Any]) -> dict[str, Any]:
    resp = requests.get(url, params=params, timeout=60)
    resp.raise_for_status()
    return resp.json()


def collect_meta(settings: Settings, since: datetime | None = None) -> list[ComplaintRecord]:
    if not settings.meta_configured():
        return []

    token = settings.meta_page_token
    page_id = settings.meta_page_id
    out: list[ComplaintRecord] = []

    posts = _get(
        f"{GRAPH}/{page_id}/feed",
        {
            "access_token": token,
            "fields": "id,created_time,permalink_url",
            "limit": 25,
        },
    ).get("data", [])

    for post in posts:
        post_id = post["id"]
        comments = _get(
            f"{GRAPH}/{post_id}/comments",
            {
                "access_token": token,
                "fields": "id,message,created_time,from",
                "limit": 100,
                "filter": "stream",
            },
        ).get("data", [])
        for c in comments:
            created = _parse_time(c.get("created_time"))
            if since and created < since:
                continue
            author = c.get("from") or {}
            out.append(
                ComplaintRecord(
                    id=None,
                    platform="facebook",
                    external_id=str(c["id"]),
                    author_name=author.get("name"),
                    author_account_id=author.get("id"),
                    text=c.get("message") or "",
                    source_url=post.get("permalink_url"),
                    created_at=created,
                )
            )

    if settings.meta_ig_user_id:
        media = _get(
            f"{GRAPH}/{settings.meta_ig_user_id}/media",
            {
                "access_token": token,
                "fields": "id,caption,timestamp,permalink",
                "limit": 25,
            },
        ).get("data", [])
        for item in media:
            media_id = item["id"]
            ig_comments = _get(
                f"{GRAPH}/{media_id}/comments",
                {
                    "access_token": token,
                    "fields": "id,text,timestamp,username",
                    "limit": 100,
                },
            ).get("data", [])
            for c in ig_comments:
                created = _parse_time(c.get("timestamp"))
                if since and created < since:
                    continue
                out.append(
                    ComplaintRecord(
                        id=None,
                        platform="instagram",
                        external_id=str(c["id"]),
                        author_name=c.get("username"),
                        author_account_id=c.get("username"),
                        text=c.get("text") or "",
                        source_url=item.get("permalink"),
                        created_at=created,
                    )
                )

    # Messenger / IG DMs require pages_messaging — best-effort conversations list
    try:
        convos = _get(
            f"{GRAPH}/{page_id}/conversations",
            {
                "access_token": token,
                "fields": "id,updated_time",
                "limit": 15,
            },
        ).get("data", [])
        for convo in convos:
            messages = _get(
                f"{GRAPH}/{convo['id']}/messages",
                {
                    "access_token": token,
                    "fields": "id,message,created_time,from",
                    "limit": 20,
                },
            ).get("data", [])
            for m in messages:
                if not m.get("message"):
                    continue
                created = _parse_time(m.get("created_time"))
                if since and created < since:
                    continue
                author = m.get("from") or {}
                platform = "messenger"
                if author.get("id") == settings.meta_ig_user_id:
                    continue
                out.append(
                    ComplaintRecord(
                        id=None,
                        platform=platform,
                        external_id=str(m["id"]),
                        author_name=author.get("name") or author.get("email"),
                        author_account_id=author.get("id"),
                        text=m.get("message") or "",
                        source_url=None,
                        created_at=created,
                    )
                )
    except requests.HTTPError:
        pass

    return out
