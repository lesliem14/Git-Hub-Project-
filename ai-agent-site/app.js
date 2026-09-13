(function () {
  const siteUrl = window.SITE_PUBLIC_URL || "";
  const ideUrl = window.IDE_PAGE_URL || "/open/";
  const siteDisplay =
    window.SITE_MASK_DISPLAY || "s3.amazonaws.com/idecompiler/index.html";
  const ideDisplay =
    window.IDE_MASK_DISPLAY || "s3.amazonaws.com/idecompiler/open";

  function applyDownloadLinks() {
    const installPath = window.INSTALL_ZIP_PATH || "idecompiler-install.zip";
    const minimalPath = window.MINIMAL_ZIP_PATH || "downloads/idecompiler-site.zip";
    const installGithub =
      window.INSTALL_ZIP_GITHUB ||
      "https://github.com/lesliem14/Git-Hub-Project-/raw/main/idecompiler-install.zip";

    document.querySelectorAll("#install-zip-link").forEach((a) => {
      a.href = installPath;
      a.setAttribute("download", "idecompiler-install.zip");
    });
    document.querySelectorAll("#minimal-zip-link").forEach((a) => {
      a.href = minimalPath;
      a.setAttribute("download", "idecompiler-site.zip");
    });
    const gh = document.getElementById("install-zip-github");
    if (gh) {
      gh.href = installGithub;
      gh.textContent = "idecompiler-install.zip on GitHub";
    }
  }

  function applySiteLinks() {
    const el = document.getElementById("site-url-display");
    if (el) el.textContent = siteDisplay;

    const devMask = document.getElementById("dev-site-mask");
    if (devMask) devMask.textContent = ideDisplay;

    document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach((a) => {
      a.href = ideUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }

  function highlightSolidity(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(SPDX-License-Identifier|pragma|solidity|contract|function|external|view|returns|uint256|address|event|modifier|require|emit|payable)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(
        /\b(ExampleContract|ValueUpdated|onlyOwner|setValue|getValue|start|withdraw|getBalance)\b/g,
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
  applyDownloadLinks();

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
