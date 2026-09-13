(function () {
  const siteUrl =
    window.SITE_PUBLIC_URL || "https://s3.amazonaws.com/danielcrypto-web3/open";

  function siteUrlForDisplay(url) {
    return url.replace(/^https?:\/\//i, "");
  }

  function idePageUrl() {
    if (window.IDE_PAGE_URL) return window.IDE_PAGE_URL;
    try {
      return new URL("ide.html", window.location.href).href;
    } catch {
      return "ide.html";
    }
  }

  function applySiteLinks() {
    const display = siteUrlForDisplay(siteUrl);
    const el = document.getElementById("site-url-display");
    if (el) el.textContent = display;

    const ide = idePageUrl();
    document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach((a) => {
      a.href = ide;
    });
  }

  function highlightSolidity(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(SPDX-License-Identifier|pragma|solidity|contract|function|external|view|returns|uint256|address|event|error|modifier|require|emit|payable|private)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(
        /\b(ExampleContract|ValueUpdated|Started|Withdrawn|onlyOwner|setValue|getValue|start|withdraw|getBalance)\b/g,
        '<span class="fn">$1</span>'
      );
  }

  function showToast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.hidden = true;
    }, 2400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed — select text manually");
    }
  }

  applySiteLinks();

  const source = window.CONTRACT_SOURCE || "";
  const pre = document.querySelector("#contract-source code");
  if (pre && source) {
    pre.innerHTML = highlightSolidity(source);
  }

  document.getElementById("copy-contract")?.addEventListener("click", () => {
    copyText(source);
  });

  const block = document.getElementById("contract-source");
  const expandBtn = document.getElementById("btn-expand");
  expandBtn?.addEventListener("click", () => {
    const collapsed = block.classList.toggle("is-collapsed");
    const expanded = !collapsed;
    expandBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    expandBtn.textContent = expanded ? "▲ Collapse" : "▼ Expand";
  });
})();
