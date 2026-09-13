/**
 * TWO PAGES (same host after you deploy the full install zip):
 *
 * PAGE 1 — AI Agent Guide (home)
 *   URL:  /  or  /index.html
 *   File: index.html — Solidity source, Copy, full text guide, downloads
 *
 * PAGE 2 — Development Site / IDE compiler
 *   URL:  /open/  (full Remix-style IDE: file explorer, Solidity compiler,
 *         Deploy & Run on the LEFT, Secure Deploy, new contracts, etc.)
 *   File: open/index.html (+ open/css, open/js)
 *
 * The guide “Development Site → Click Here” links use IDE_PAGE_URL below.
 * Masked labels (S3-style) are display-only in the UI.
 */

/** Page 1 — guide (optional public URL for display). */
window.SITE_PUBLIC_URL = "https://s3.amazonaws.com/idecompiler/index.html";

/** Page 2 — IDE compiler (only via “Development Site → Click Here” on page 1). */
window.IDE_PAGE_URL = "/open/";

/** Open IDE in a new tab when false, same tab after the guide (recommended). */
window.IDE_OPEN_IN_NEW_TAB = false;

/** Shown next to links on page 1 (labels only). */
window.SITE_MASK_DISPLAY = "s3.amazonaws.com/idecompiler/index.html";
window.IDE_MASK_DISPLAY = "s3.amazonaws.com/idecompiler/open";

/** Cloudflare Pages — lean zip (index.html at root; both pages). */
window.CLOUDFLARE_ZIP_PATH = "cloudflare-pages.zip";
window.CLOUDFLARE_ZIP_GITHUB =
  "https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/cloudflare-pages.zip";

/** Full install zip (same host as guide, or GitHub raw fallback). */
window.INSTALL_ZIP_PATH = "idecompiler-install.zip";
window.INSTALL_ZIP_GITHUB =
  "https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/idecompiler-install.zip";

/** Minimal 9-file S3 bundle (page 1 + legacy compiler — not the full IDE). */
window.MINIMAL_ZIP_PATH = "downloads/idecompiler-site.zip";
window.MINIMAL_ZIP_GITHUB =
  "https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/download/idecompiler-site.zip";
