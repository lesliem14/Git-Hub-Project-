# Make the site look like the AWS reference on S3

Your reference URL is shaped like:

`https://s3.amazonaws.com/BUCKET_NAME/open`

That usually means files live under the **`open/`** prefix (or a single object named `open`). This project uses **four files** (`index.html`, `styles.css`, `app.js`, `contract.js`), so use a **folder** on S3.

## Steps

### 1. Upload files

In the S3 console, open your bucket and create a **folder** named `open` (or use an existing one).

Upload these four files **into** `open/` (same level as each other):

- `index.html`
- `styles.css`
- `app.js`
- `contract.js`

After upload, keys should look like:

- `open/index.html`
- `open/styles.css`
- `open/app.js`
- `open/contract.js`

### 2. Set correct content types (important)

For each object → **Properties** → **Content type**:

| Object | Content type |
|--------|----------------|
| `index.html` | `text/html` |
| `styles.css` | `text/css` |
| `app.js`, `contract.js` | `application/javascript` |

If types are wrong, the page may show plain text or load without styling.

### 3. Public access

Either:

- **Static website hosting** on the bucket (index: `index.html`), with a bucket policy allowing public `s3:GetObject`, **or**
- **CloudFront** in front of the bucket (recommended for HTTPS).

Objects must be readable by browsers (policy or CloudFront OAC).

### 4. Open the site

**Website endpoint (if enabled):**

`http://YOUR-BUCKET.s3-website-REGION.amazonaws.com/open/`

**Object-style URL (if public):**

`https://s3.amazonaws.com/YOUR-BUCKET/open/index.html`

Use the URL that ends with **`/open/`** or **`/open/index.html`** so relative links to CSS/JS work.

### 5. If it still looks wrong

- **Unstyled page (black text, no orange title):** `styles.css` is missing or not in the same `open/` folder as `index.html`.
- **No code in the box:** `contract.js` missing or blocked; check browser dev tools → Network.
- **Old version showing:** S3 → object → **Actions → Create CloudFront invalidation** (if using CloudFront), or hard-refresh the browser (Ctrl+Shift+R).

## Match the reference layout

The updated `index.html` is a **single scrollable page** (no tabs): orange **AI Agent Guide** title, contact/dev links, **SOLIDITY** code panel with **Expand**, then **Full Text Guide** and **Mobile Users** — same structure as the live reference page.
