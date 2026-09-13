(function () {
  const ideUrl = window.IDE_PAGE_URL || "/open/";
  const siteDisplay = window.SITE_MASK_DISPLAY || "s3.amazonaws.com/idecompiler/index.html";
  const ideDisplay = window.IDE_MASK_DISPLAY || "s3.amazonaws.com/idecompiler/open";

  document.getElementById("site-url-display")?.textContent = siteDisplay;
  document.getElementById("dev-site-mask")?.textContent = ideDisplay;

  document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach((a) => {
    a.href = ideUrl;
    if (window.IDE_OPEN_IN_NEW_TAB) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  });

  const source = window.CONTRACT_SOURCE || "";
  const pre = document.querySelector("#contract-source code");
  if (pre && source) {
    pre.textContent = source;
  }

  document.getElementById("copy-contract")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(source);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  });

  const block = document.getElementById("contract-source");
  const expandBtn = document.getElementById("btn-expand");
  expandBtn?.addEventListener("click", () => {
    const collapsed = block.classList.toggle("is-collapsed");
    expandBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    expandBtn.textContent = collapsed ? "▼ Expand" : "▲ Collapse";
  });

  function showToast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.hidden = true; }, 2400);
  }
})();
