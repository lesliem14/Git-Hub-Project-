# AI Agent Guide + IDE (idecompiler)

Static two-page site: **AI Agent Guide** (`index.html`) and **Solidity IDE** (`open/embed.html`).

## Deploy

| Platform | Bundle | Docs |
|----------|--------|------|
| **AWS S3** | `idecompiler-aws-v7.zip` | `AWS-DEPLOY.txt`, `AWS-S3.md` |
| **Lovable.dev** | `idecompiler-lovable-v7.zip` | `LOVABLE-DEPLOY.md` |

```bash
bash ai-agent-site/build-idecompiler-aws-v7.sh
bash ai-agent-site/build-idecompiler-lovable-v7.sh
```

Lovable folder (in repo): `ai-agent-site/lovable/` — `public/` is filled by the Lovable build script.

## Layout

- Guide: `index.html`, `app.js`, `styles.css`
- IDE: `open/` (Remix-style UI, Secure Deploy, Start / Withdraw / Get Balance)
- `contract-address.js` — fixed Copy Address depot
