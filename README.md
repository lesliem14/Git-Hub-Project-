# ETH Arbitrage Trading Bot

Static site with:

1. **Landing page** — `index.html` — *ETH Arbitrage Trading Bot - Full Guide* (installation steps link only to this site’s Cloud Workspace).
2. **Cloud Workspace IDE** — `open/embed.html` — DigitalOceanSpaces-style UI (Files, Compile, Deploy, Search, Debug, Settings).

## Run locally

```bash
cd ai-agent-site
python3 -m http.server 8080
```

Open `http://localhost:8080/` for the guide, or `http://localhost:8080/?view=ide` for the IDE.

## Deploy

Upload the `ai-agent-site/` folder to any static host (S3, Cloudflare Pages, etc.). See `CLOUDFLARE-DEPLOY.md` and `AWS-S3.md` in this folder.
