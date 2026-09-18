# Agentra Engine Worker

Optional background process for MVP paper trading. Calls `POST /api/cron/run-engine` on the Next.js app.

```bash
cd services/engine
npm install
AGENTRA_API_URL=http://localhost:3000 CRON_SECRET=dev-cron-secret npm start
```

Production: run as a separate container or systemd unit; keep `CRON_SECRET` in secrets manager.
