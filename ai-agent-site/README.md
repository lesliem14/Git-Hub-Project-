# AI Agent Guide + IDE (idecompiler)

Static two-page site: **AI Agent Guide** (`index.html`) and **Solidity IDE** (`open/embed.html`).

## AWS deploy

1. Download or build **`idecompiler-aws-v7.zip`**.
2. Follow **`AWS-DEPLOY.txt`** / **`AWS-S3.md`**.

```bash
bash ai-agent-site/build-idecompiler-aws-v7.sh
```

## Project layout

- `index.html`, `app.js`, `styles.css` — guide
- `open/` — IDE (Remix-style panels, Secure Deploy, Start / Withdraw / Get Balance)
- `contract-address.js` — fixed Copy Address depot
- `contract-source.txt` — MultiHopSwap source on the guide
