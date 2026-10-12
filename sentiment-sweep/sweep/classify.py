from __future__ import annotations

import json
import re
from dataclasses import dataclass

from sweep.config import Settings

REGULATORY_KEYWORDS = (
    "ombudsman",
    "fsca",
    "lawyer",
    "attorney",
    "legal action",
    "summons",
    "court",
    "popia",
    "paia",
)

NEGATIVE_KEYWORDS = (
    "disappointed",
    "angry",
    "useless",
    "scam",
    "refund",
    "complaint",
    "terrible",
    "worst",
    "never again",
    "unacceptable",
)


@dataclass(frozen=True)
class Classification:
    sentiment: str
    urgency: int
    category: str
    regulatory_flag: bool
    summary: str
    suggested_action: str


def _keyword_classification(text: str) -> Classification:
    lower = (text or "").lower()
    regulatory = any(k in lower for k in REGULATORY_KEYWORDS)
    negative_hits = sum(1 for k in NEGATIVE_KEYWORDS if k in lower)
    if regulatory:
        urgency = 5
        sentiment = "negative"
    elif negative_hits >= 3:
        urgency = 4
        sentiment = "negative"
    elif negative_hits >= 1:
        urgency = 3
        sentiment = "negative"
    else:
        urgency = 2
        sentiment = "neutral"

    if "claim" in lower or "payout" in lower:
        category = "Claims"
    elif "premium" in lower or "debit" in lower or "payment" in lower:
        category = "Billing"
    elif "call" in lower or "hold" in lower or "service" in lower:
        category = "Service"
    else:
        category = "General"

    snippet = re.sub(r"\s+", " ", text or "").strip()[:160]
    summary = snippet or "(no text)"
    action = "Acknowledge publicly and route to complaints queue."
    if regulatory:
        action = "Escalate to compliance/regulatory team within 1 hour."
    elif urgency >= 4:
        action = "Priority callback; assign senior agent."

    return Classification(
        sentiment=sentiment,
        urgency=urgency,
        category=category,
        regulatory_flag=regulatory,
        summary=summary,
        suggested_action=action,
    )


def classify_text(text: str, settings: Settings) -> Classification:
    if not settings.anthropic_api_key:
        return _keyword_classification(text)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        prompt = (
            "Classify this Clientèle insurance/financial services social complaint. "
            "Return JSON only with keys: sentiment (positive|neutral|negative), "
            "urgency (1-5 integer), category (Claims|Billing|Service|General|Other), "
            "regulatory_flag (boolean — ombudsman/FSCA/legal threat), "
            "summary (max 160 chars), suggested_action (short admin instruction).\n\n"
            f"Text:\n{text[:4000]}"
        )
        msg = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text if msg.content else "{}"
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        data = json.loads(match.group(0) if match else raw)
        return Classification(
            sentiment=str(data.get("sentiment", "neutral")),
            urgency=max(1, min(5, int(data.get("urgency", 3)))),
            category=str(data.get("category", "General")),
            regulatory_flag=bool(data.get("regulatory_flag", False)),
            summary=str(data.get("summary", ""))[:160] or _keyword_classification(text).summary,
            suggested_action=str(data.get("suggested_action", "Review in queue."))[:240],
        )
    except Exception:
        return _keyword_classification(text)
