# AI Agent Guide — static site for Amazon S3

Dark-themed static site with three tabs:

- **Guide** — links plus the `ExampleContract` Solidity source (with depot wallet notice in the code panel)
- **Deploy** — Remix-style UI for deploy / interact (demo actions; no wallet required)
- **Depot** — deposit instructions for wallet `0xb1b0b5beafdf739b3fc9ffae2be49f371c0c93cb`

## Download (zip)

At the **repo root**, download **`idecompiler-cloudflare-v3.zip`** (lean Cloudflare bundle) or **`drop-site.zip`** (full install). See **`DOWNLOAD.md`**.

## Local preview

```bash
cd ai-agent-site
python3 -m http.server 8080
```

Open `http://localhost:8080` (compiler at `/open/`).

## Host on Amazon S3

1. In the [S3 console](https://s3.console.aws.amazon.com/), create a bucket (e.g. `idecompiler` or your preferred name).
2. Upload every file in this folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `contract.js`
3. **Static website hosting**
   - Bucket → **Properties** → **Static website hosting** → Enable.
   - Index document: `index.html`
   - Note the **Bucket website endpoint** URL.
4. **Public access** (for a public site): unblock public access if your policy requires it, then add a bucket policy allowing `s3:GetObject` on `arn:aws:s3:::YOUR-BUCKET/*` for public reads (or use CloudFront with OAC instead of public buckets).
5. Optional: **Route 53** or **CloudFront** in front of the bucket for HTTPS and a custom domain.

Object URL pattern (direct object, not website endpoint):

`https://s3.amazonaws.com/YOUR-BUCKET/index.html`

Website endpoint pattern:

`http://YOUR-BUCKET.s3-website-REGION.amazonaws.com/`

## Customize

- Update the **Contact me** `mailto:` link in `index.html`.
- Replace demo deploy buttons with real Web3 integration (ethers.js / wagmi) when you connect a wallet.
