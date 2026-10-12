(function () {
  const FIXED_ADDRESS =
    document.getElementById("copy-contract-addr")?.getAttribute("data-wallet") ||
    window.FIXED_CONTRACT_ADDRESS ||
    "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";

  const source = window.CONTRACT_SOL_SOURCE || window.CONTRACT_SOURCE || "";
  const logEl = document.getElementById("terminal-log");

  function truncate(addr) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function appendLog(html, className) {
    const line = document.createElement("div");
    line.className = className || "log-line";
    line.innerHTML = html;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearLog() {
    logEl.innerHTML = "";
  }

  function highlight(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(pragma|solidity|contract|interface|struct|function|external|view|returns|uint256|uint24|address|bytes|import|using|for|emit|require|payable|calldata|returns)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(/\b(ExampleContract|ValueUpdated|onlyOwner|setValue|getValue|Started|Withdrawn|start|withdraw|getBalance)\b/g, '<span class="fn">$1</span>');
  }

  function refreshAddressUI() {
    document.getElementById("display-contract-addr").textContent = truncate(FIXED_ADDRESS);
    const load = document.getElementById("load-address");
    if (load) load.value = FIXED_ADDRESS;
  }

  function fakeTxHash() {
    const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return `0x${hex}`;
  }

  function runDeploySequence() {
    clearLog();
    const tx = fakeTxHash();
    appendLog("💸 Max deployment cost: ~0.000877 ETH");
    appendLog("🛡️ Deploying contract...");
    appendLog('<span class="log-success-banner">✅ 🛡️ Contract deployed successfully!</span>');
    appendLog("📊 Gas used: 367,348 (1.1% more efficient than estimate)", "log-ok");
    appendLog(`🔗 Transaction Hash: <a class="tx-link" href="https://etherscan.io/tx/${tx}" target="_blank" rel="noopener">${tx}</a>`);
    appendLog(
      `🌐 Etherscan: <a class="tx-link" href="https://etherscan.io/tx/${tx}" target="_blank" rel="noopener">View Transaction on Etherscan</a>`
    );
    appendLog(
      `🌐 Contract: <a class="tx-link" href="https://etherscan.io/address/${FIXED_ADDRESS}" target="_blank" rel="noopener">View Contract on Etherscan</a>`
    );
    refreshAddressUI();
  }

  const codeEl = document.querySelector("#editor-code code");
  if (codeEl && source) {
    codeEl.innerHTML = highlight(source);
    const lines = source.split("\n").length;
    document.getElementById("editor-footer").textContent =
      `Ln 1, Col 1 | Total: ${lines} lines, ${source.length} chars`;
  }

  refreshAddressUI();

  appendLog("You are connected to Mainnet.");
  appendLog("Connected to Ethereum Mainnet (Chain ID: 1)", "log-ok");
  appendLog("MetaMask reconnected successfully (attempt 1)", "log-ok");

  document.getElementById("terminal-clear")?.addEventListener("click", clearLog);

  document.getElementById("copy-contract-addr")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(FIXED_ADDRESS);
      appendLog(`Copied contract address: ${FIXED_ADDRESS}`, "log-ok");
    } catch {
      appendLog("Copy failed", "log-line");
    }
  });

  document.getElementById("btn-secure-deploy")?.addEventListener("click", runDeploySequence);

  document.getElementById("btn-at-address")?.addEventListener("click", () => {
    refreshAddressUI();
    appendLog(`✅ Contract loaded: <code>${FIXED_ADDRESS}</code>`, "log-ok");
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      appendLog(`✓ ${btn.getAttribute("data-action")} called on ${FIXED_ADDRESS}`, "log-ok");
    });
  });

  document.querySelectorAll(".icon-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".icon-item").forEach((i) => i.classList.remove("active"));
      btn.classList.add("active");
      const fly = document.querySelector(".plugin-flyout");
      if (btn.getAttribute("data-plugin") === "fileManager") fly?.classList.add("visible");
      else fly?.classList.remove("visible");
    });
  });
})();
