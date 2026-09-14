# Deploy on Amazon S3

Use **`idecompiler-aws-v7.zip`** (build with `bash ai-agent-site/build-idecompiler-aws-v7.sh`).

## Quick steps

1. Extract the zip.
2. Upload all files to the bucket root (keep the `open/` folder).
3. Set **Content-Type** on each object (see `AWS-DEPLOY.txt`).
4. Enable **public read** (bucket policy) or serve via **CloudFront**.
5. Open `index.html` — **AI Agent Guide**; use **Development Site** for the IDE.

## URLs

| Page | Path |
|------|------|
| Guide | `index.html` |
| IDE | `open/embed.html?dev=1&embed=1` |

`site-config.js` shows masked `s3.amazonaws.com/...` labels in the UI; your real URL is your bucket or CloudFront domain.

## Two-page flow

- Page 1: guide at `/` (`index.html`).
- Page 2: IDE via overlay or direct `open/embed.html` (not a separate host).
