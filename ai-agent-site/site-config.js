/**
 * Real hosting (Cloudflare Worker) — links open here.
 */
window.SITE_ACTUAL_URL = "https://shrill-flower-ef42.danielcrypto960.workers.dev/";
window.IDE_ACTUAL_URL = "https://shrill-flower-ef42.danielcrypto960.workers.dev/ide.html";

/**
 * Shown in the UI as “Site URL” / link labels (S3-style mask).
 * Does not change the browser address bar on amazonaws.com unless you own that domain.
 */
window.SITE_MASK_DISPLAY = "s3.amazonaws.com/idecompiler/index.html";
window.IDE_MASK_DISPLAY = "s3.amazonaws.com/idecompiler/open";
