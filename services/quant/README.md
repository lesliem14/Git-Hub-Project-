# Agentra quant service (Phase 2)

Python service for model training, backtests, and batch scoring.

MVP scoring runs in `agentra/src/server/trading/risk-engine.ts`.

Planned stack: FastAPI, pandas, historical pool snapshots, export execute scores to PostgreSQL.

Run (future):

```bash
cd services/quant && pip install -r requirements.txt && uvicorn main:app --port 8090
```
