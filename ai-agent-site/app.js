(function () {
  const DEFAULT_ADDRESS = "0xb1b0b5beafdf739b3fc9ffae2be49f371c0c93cb";
  let activeAddress = DEFAULT_ADDRESS;

  function highlightSolidity(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(SPDX-License-Identifier|pragma|solidity|contract|function|external|view|returns|uint256|address|event|modifier|require|emit|payable|indexed)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(
        /\b(ArbitrageInterface|Started|Withdrawn|start|withdraw|getBalance|owner)\b/g,
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

  function truncateAddress(addr) {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function updateAddressDisplay(addr) {
    activeAddress = addr;
    document.getElementById("display-contract-addr").textContent = truncateAddress(addr);
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

  const source = window.CONTRACT_SOURCE || "";
  const pre = document.querySelector("#contract-source code");
  if (pre && source) {
    pre.innerHTML = highlightSolidity(source);
  }

  updateAddressDisplay(DEFAULT_ADDRESS);

  document.getElementById("copy-contract")?.addEventListener("click", () => {
    copyText(source);
  });

  document.getElementById("copy-contract-addr")?.addEventListener("click", () => {
    copyText(activeAddress);
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
    updateAddressDisplay(DEFAULT_ADDRESS);
    showTx();
    showToast("Contract deployed (demo)");
  });

  document.getElementById("btn-at-address")?.addEventListener("click", () => {
    const raw = (document.getElementById("load-address")?.value || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) {
      showToast("Enter a valid 0x address (42 characters)");
      return;
    }
    updateAddressDisplay(raw);
    showToast("Loaded contract at address");
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "balance") {
        const hint = document.getElementById("balance-hint");
        hint.textContent = `View balance for ${activeAddress} on Etherscan`;
        hint.hidden = false;
        return;
      }
      showTx();
      const label = action.charAt(0).toUpperCase() + action.slice(1);
      showToast(`${label} submitted (demo)`);
    });
  });

  document.getElementById("dev-site-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("deploy-panel")?.scrollIntoView({ behavior: "smooth" });
  });
})();
