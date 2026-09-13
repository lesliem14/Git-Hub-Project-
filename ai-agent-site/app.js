(function () {
  const DEPOT_WALLET = "0xb1b0b5beafdf739b3fc9ffae2be49f371c0c93cb";
  const DEFAULT_CONTRACT_DISPLAY = "0x9A3C…0E2F";
  let loadedAddress = DEFAULT_CONTRACT_DISPLAY;

  function highlightSolidity(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(contract|function|external|view|returns|uint256|address|event|modifier|require|emit)\b/g,
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
    }, 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed — select the address manually");
    }
  }

  function truncateAddress(addr) {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function setActiveTab(name) {
    document.querySelectorAll(".tab").forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".panel").forEach((panel) => {
      const id = panel.id.replace("panel-", "");
      const on = id === name;
      panel.classList.toggle("active", on);
      panel.hidden = !on;
    });
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

  // Source code
  const pre = document.querySelector("#contract-source code");
  if (pre && window.EXAMPLE_CONTRACT_SOURCE) {
    pre.innerHTML = highlightSolidity(window.EXAMPLE_CONTRACT_SOURCE);
  }

  document.getElementById("copy-contract")?.addEventListener("click", () => {
    copyText(window.EXAMPLE_CONTRACT_SOURCE || "");
  });

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.getAttribute("data-copy")));
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.getAttribute("data-goto")));
  });

  const devLink = document.getElementById("dev-site-link");
  if (devLink) {
    devLink.href = "#";
    devLink.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("deploy");
    });
  }

  document.getElementById("btn-secure-deploy")?.addEventListener("click", () => {
    showTx();
    showToast("Deploy simulated — connect a wallet on-chain for real deploys");
  });

  document.getElementById("btn-at-address")?.addEventListener("click", () => {
    const input = document.getElementById("load-address");
    const raw = (input?.value || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) {
      showToast("Enter a valid 0x… contract address (42 characters)");
      return;
    }
    loadedAddress = raw;
    document.getElementById("display-contract-addr").textContent = truncateAddress(raw);
    showToast("Contract loaded at address");
  });

  document.getElementById("copy-contract-addr")?.addEventListener("click", () => {
    const full =
      loadedAddress.includes("…") ? "0x9A3C000000000000000000000000000000000E2F" : loadedAddress;
    copyText(full);
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "balance") {
        const hint = document.getElementById("balance-hint");
        hint.textContent = `Depot wallet balance: check ${DEPOT_WALLET} on Etherscan`;
        hint.hidden = false;
        return;
      }
      showTx();
      showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} action simulated`);
    });
  });
})();
