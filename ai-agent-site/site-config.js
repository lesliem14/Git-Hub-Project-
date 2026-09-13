/**
 * AI Agent Guide (landing page) URL after upload.
 * Example: index.html at bucket root → https://s3.amazonaws.com/idecompiler/index.html
 */
window.SITE_PUBLIC_URL = "https://s3.amazonaws.com/idecompiler/index.html";

/**
 * Development Site / compiler (Deploy & Run UI).
 * Upload open.html to S3 with object key exactly: open
 * Content-Type: text/html
 */
window.IDE_PAGE_URL = "https://s3.amazonaws.com/idecompiler/open";
