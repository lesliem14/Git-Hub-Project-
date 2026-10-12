FROM python:3.12-slim-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL -o /usr/local/bin/supercronic \
        https://github.com/aptible/supercronic/releases/download/v0.2.33/supercronic-linux-amd64 \
    && chmod +x /usr/local/bin/supercronic

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN groupadd --gid 1000 sweep \
    && useradd --uid 1000 --gid sweep --create-home sweep \
    && mkdir -p /app/data /app/output /var/log \
    && touch /var/log/sweep.log \
    && chown -R sweep:sweep /app /var/log

USER sweep

ENV PYTHONUNBUFFERED=1 \
    DATABASE_PATH=/app/data/sweep.db \
    EXCEL_OUTPUT_DIR=/app/output

HEALTHCHECK --interval=5m --timeout=60s --start-period=30s --retries=3 \
    CMD ["python", "main.py", "sweep", "--dry-run"]

CMD ["supercronic", "/app/deploy/crontab"]
