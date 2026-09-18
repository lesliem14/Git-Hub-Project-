"""Stub quant API for Agentra — extend for production ML pipeline."""
from fastapi import FastAPI

app = FastAPI(title="Agentra Quant", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "agentra-quant-stub"}


@app.post("/score")
def score_opportunity(payload: dict):
    net = float(payload.get("expected_net_usdt", 0))
    min_p = float(payload.get("min_profit_usdt", 5))
    prob = min(0.95, max(0.05, 0.4 + net / (min_p * 5)))
    return {"execute_probability": prob, "should_execute": net >= min_p and prob >= 0.55}
