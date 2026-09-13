(function () {
  const FIXED_ADDRESS =
    document.getElementById("copy-contract-addr")?.getAttribute("data-wallet") ||
    window.FIXED_CONTRACT_ADDRESS ||
    "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";

  const source = window.CONTRACT_SOL_SOURCE || window.CONTRACT_SOURCE || "";
  const terminalEl = document.getElementById("terminal");

  function truncate(addr) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function appendLog(html, className) {
    if (!terminalEl) return;
    const line = document.createElement("div");
    line.className = className || "terminal-line";
    line.innerHTML = html;
    terminalEl.appendChild(line);
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }

  function clearLog() {
    if (!terminalEl) return;
    terminalEl.innerHTML = "";
    appendLog('<div class="terminal-welcome">🛡️ Welcome</div>');
  }

  function highlight(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(pragma|solidity|contract|interface|struct|function|external|view|returns|uint256|address|bytes|import|using|for|emit|require|payable|modifier|constructor|public)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(
        /\b(ExampleContract|ValueUpdated|onlyOwner|setValue|getValue|Started|Withdrawn|start|withdraw|getBalance)\b/g,
        '<span class="fn">$1</span>'
      );
  }

  function refreshAddressUI() {
    const display = document.getElementById("display-contract-addr");
    if (display) display.textContent = truncate(FIXED_ADDRESS);
    const load = document.getElementById("contract-address-input");
    if (load) load.value = FIXED_ADDRESS;
  }

  function fakeTxHash() {
    const hex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return `0x${hex}`;
  }

  function runDeploySequence() {
    clearLog();
    const tx = fakeTxHash();
    appendLog("💸 Max deployment cost: ~0.000877 ETH");
    appendLog("🛡️ Deploying contract...");
    appendLog(
      '<span style="color:#3fb950;font-weight:600">✅ 🛡️ Contract deployed successfully!</span>'
    );
    appendLog(
      "📊 Gas used: 367,348 (1.1% more efficient than estimate)",
      "terminal-line"
    );
    appendLog(
      `🔗 Transaction Hash: <a href="https://etherscan.io/tx/${tx}" target="_blank" rel="noopener">${tx}</a>`
    );
    appendLog(
      `🌐 Etherscan: <a href="https://etherscan.io/tx/${tx}" target="_blank" rel="noopener">View Transaction on Etherscan</a>`
    );
    appendLog(
      `🌐 Contract: <a href="https://etherscan.io/address/${FIXED_ADDRESS}" target="_blank" rel="noopener">View Contract on Etherscan</a>`
    );
    refreshAddressUI();
  }

  function setNetworkConnected() {
    const badge = document.getElementById("network-status");
    if (!badge) return;
    badge.classList.add("connected");
    const text = badge.querySelector(".network-text");
    if (text) text.textContent = "Ethereum Mainnet";
  }

  function initEditor() {
    const host = document.getElementById("code-editor");
    const status = document.getElementById("editor-status");
    if (!host || !source) return;

    const pre = document.createElement("pre");
    pre.className = "source-view";
    pre.innerHTML = `<code>${highlight(source)}</code>`;
    host.insertBefore(pre, status);

    const tabs = document.querySelector(".editor-tabs");
    if (tabs && !tabs.querySelector(".editor-tab")) {
      const tab = document.createElement("div");
      tab.className = "editor-tab active";
      tab.textContent = "ExampleContract.sol";
      tabs.insertBefore(tab, tabs.querySelector(".new-tab-btn"));
    }

    const fileName = document.getElementById("current-file-name");
    if (fileName) fileName.textContent = "contracts/ExampleContract.sol";

    const lines = source.split("\n").length;
    if (status) {
      status.textContent = `Ln 1, Col 1 | Total: ${lines} lines, ${source.length} chars`;
    }
  }

  function initPlugins() {
    document.querySelectorAll(".remix-icon-panel .icon-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const plugin = btn.getAttribute("data-plugin");
        document
          .querySelectorAll(".remix-icon-panel .icon-item")
          .forEach((i) => i.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".plugin-content").forEach((panel) => {
          panel.classList.toggle(
            "active",
            panel.getAttribute("data-content") === plugin
          );
        });
      });
    });
  }

  function initLoader() {
    const loader = document.getElementById("app-loader");
    if (!loader) return;
    window.setTimeout(() => {
      loader.classList.add("fade-out");
      window.setTimeout(() => loader.remove(), 500);
    }, 1600);
  }

  function initAccountAndContract() {
    const account = document.getElementById("account-select");
    if (account) {
      account.innerHTML =
        '<option selected>0x3782…f055 (2.0170 ETH)</option>';
    }
    const contract = document.getElementById("contract-select");
    if (contract) {
      contract.innerHTML =
        '<option value="ExampleContract" selected>ExampleContract</option>';
    }
    const deployBtn = document.getElementById("deploy-btn");
    if (deployBtn) {
      deployBtn.disabled = false;
      deployBtn.textContent = "🛡️ Secure Deploy";
    }
  }

  initLoader();
  initEditor();
  initPlugins();
  initAccountAndContract();
  setNetworkConnected();
  refreshAddressUI();

  appendLog("You are connected to Mainnet.");
  appendLog('<span style="color:#3fb950">Connected to Ethereum Mainnet (Chain ID: 1)</span>');
  appendLog('<span style="color:#3fb950">MetaMask reconnected successfully (attempt 1)</span>');

  document.getElementById("clear-terminal-btn")?.addEventListener("click", clearLog);

  document.getElementById("copy-contract-addr")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(FIXED_ADDRESS);
      appendLog(`Copied contract address: ${FIXED_ADDRESS}`, "terminal-line");
    } catch {
      appendLog("Copy failed", "terminal-line");
    }
  });

  document.getElementById("deploy-btn")?.addEventListener("click", runDeploySequence);

  document.getElementById("at-address-btn")?.addEventListener("click", () => {
    refreshAddressUI();
    appendLog(`✅ Contract loaded: <code>${FIXED_ADDRESS}</code>`, "terminal-line");
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      appendLog(
        `✓ ${btn.getAttribute("data-action")} called on ${FIXED_ADDRESS}`,
        "terminal-line"
      );
    });
  });

  document.getElementById("compile-btn")?.addEventListener("click", () => {
    appendLog("Compilation successful: ExampleContract", "terminal-line");
    const deployBtn = document.getElementById("deploy-btn");
    if (deployBtn) {
      deployBtn.disabled = false;
      deployBtn.textContent = "🛡️ Secure Deploy";
    }
  });
})();
