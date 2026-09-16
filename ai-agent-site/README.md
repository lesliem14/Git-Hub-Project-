# ETH Arbitrage Trading Bot — static site

## Drag-and-drop zip (recommended)

Build or download **`eth-arbitrage-site-install.zip`** — contains the full website plus installation docs (`INSTALL.txt`, `DRAG-DROP-INSTALL.txt`, deploy guides).

```bash
cd ai-agent-site
bash build-install-zip.sh
```

Outputs:

| Location | File |
|----------|------|
| Repo root | `eth-arbitrage-site-install.zip` |
| This folder | `eth-arbitrage-site-install.zip` |
| `download/` | copy for mirrors |

**Deploy:** unzip → upload all files to host root → open `/` (guide) or `/?view=ide` (Cloud Workspace).

Lean bundle (no extra `.md` files): **`eth-arbitrage-cloudflare.zip`**

See **`DOWNLOAD.md`** and **`DRAG-DROP-INSTALL.txt`**.

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`
