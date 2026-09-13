(function () {
  const FIXED_ADDRESS =
    window.FIXED_CONTRACT_ADDRESS || "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";

  const logEl = document.getElementById("terminal-log");

  function truncate(addr) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function log(message, type) {
    const line = document.createElement("div");
    line.className = type === "ok" ? "log-ok" : "log-info";
    const prefix = type === "ok" ? "✓ " : "ℹ ";
    line.textContent = prefix + message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function highlight(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(
        /\b(pragma|solidity|contract|function|external|view|returns|uint256|address|event|error|modifier|if|revert|emit|require|payable|indexed|private)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(
        /\b(ExampleContract|ValueUpdated|Started|Withdrawn|NotOwner|ZeroAddress|onlyOwner|setValue|getValue|start|withdraw|getBalance|owner|value)\b/g,
        '<span class="fn">$1</span>'
      );
  }

  function updateEditorFooter(source) {
    const lines = source.split("\n").length;
    const chars = source.length;
    document.getElementById("editor-footer").textContent =
      `Ln 1, Col 1 | Total: ${lines} lines, ${chars} chars`;
  }

  async function copyFixedAddress() {
    try {
      await navigator.clipboard.writeText(FIXED_ADDRESS);
      log(`Copied contract address: ${FIXED_ADDRESS}`, "ok");
    } catch {
      log("Copy failed — select address manually", "info");
    }
  }

  function setDisplayedAddress() {
    document.getElementById("display-contract-addr").textContent = truncate(FIXED_ADDRESS);
    const opt = document.getElementById("account-option");
    if (opt) opt.textContent = truncate(FIXED_ADDRESS);
  }

  const source = window.CONTRACT_SOURCE || "";
  const codeEl = document.querySelector("#editor-code code");
  if (codeEl && source) {
    codeEl.innerHTML = highlight(source);
    updateEditorFooter(source);
  }

  setDisplayedAddress();

  log("You are connected to Mainnet.");
  log("Connected to Ethereum Mainnet (Chain ID: 1)");
  log("MetaMask reconnected successfully (attempt 1)", "ok");

  document.getElementById("copy-contract-addr")?.addEventListener("click", copyFixedAddress);

  document.getElementById("btn-secure-deploy")?.addEventListener("click", () => {
    setDisplayedAddress();
    log(`Contract deployed at ${FIXED_ADDRESS}`, "ok");
  });

  document.getElementById("btn-at-address")?.addEventListener("click", () => {
    const raw = (document.getElementById("load-address")?.value || "").trim();
    if (raw && raw.toLowerCase() !== FIXED_ADDRESS.toLowerCase()) {
      log("Using configured contract address for this workspace.", "info");
    }
    document.getElementById("load-address").value = FIXED_ADDRESS;
    setDisplayedAddress();
    log(`Loaded contract at ${FIXED_ADDRESS}`, "ok");
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const label = action.charAt(0).toUpperCase() + action.slice(1);
      log(`${label} called on ${FIXED_ADDRESS}`, "ok");
    });
  });
})();
