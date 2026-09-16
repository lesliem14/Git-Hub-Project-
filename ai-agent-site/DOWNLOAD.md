# Download bundles

| Zip | Use |
|-----|-----|
| **`eth-arbitrage-site-install.zip`** | **Recommended** — full site + all installation docs; unzip and upload to host root |
| **`eth-arbitrage-cloudflare.zip`** | Lean site only (no extra `.md` docs) for Cloudflare Pages drag-and-drop |

Build locally from `ai-agent-site/`:

```bash
bash build-install-zip.sh
```

Output:

- `../eth-arbitrage-site-install.zip`
- `eth-arbitrage-site-install.zip` (copy in this folder)
- `../download/eth-arbitrage-site-install.zip`

After upload:

- Guide: `https://YOUR-HOST/`
- IDE: `https://YOUR-HOST/?view=ide`
