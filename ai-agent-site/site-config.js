/** AI Agent Guide landing URL (display / optional). */
window.SITE_PUBLIC_URL = "https://s3.amazonaws.com/idecompiler/index.html";

/**
 * Development Site — hosted compiler on the same Cloudflare Pages project.
 * Use a full URL only if the guide and IDE are on different hosts.
 */
window.IDE_PAGE_URL = "/open/";

/** Shown next to links (S3-style label). */
window.SITE_MASK_DISPLAY = "s3.amazonaws.com/idecompiler/index.html";
window.IDE_MASK_DISPLAY = "s3.amazonaws.com/idecompiler/open";

/** Full install zip (same host as guide, or GitHub raw fallback). */
window.INSTALL_ZIP_PATH = "idecompiler-install.zip";
window.INSTALL_ZIP_GITHUB =
  "https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/idecompiler-install.zip";

/** Minimal 9-file S3 bundle */
window.MINIMAL_ZIP_PATH = "downloads/idecompiler-site.zip";
window.MINIMAL_ZIP_GITHUB =
  "https://github.com/lesliem14/Git-Hub-Project-/raw/cursor/ai-agent-s3-webpage-b474/download/idecompiler-site.zip";
