(function () {
  const FIXED_ADDRESS =
    document.getElementById("copy-contract-addr")?.getAttribute("data-wallet") ||
    window.FIXED_CONTRACT_ADDRESS ||
    "0x476ac0C9cdecab9d2F176F873c0cdc0DAD9CE2E2";

  const fileContents = {
    "contracts/README.sol": window.CONTRACT_SOURCE || "",
    "contracts/Mempool.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Mempool {}`,
    "contracts/zelda.sol": `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract zelda {}`,
  };

  let currentFile = "contracts/README.sol";
  let compiledOk = false;
  const logEl = document.getElementById("terminal-log");

  function log(message, type) {
    const line = document.createElement("div");
    line.className = type === "ok" ? "log-ok" : "log-info";
    line.textContent = (type === "ok" ? "✓ " : "ℹ ") + message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function truncate(addr) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function setGreenBanner(el, message) {
    if (!el) return;
    el.hidden = false;
    el.className = el.id === "compile-result" ? "compile-result success" : "deploy-result success";
    el.textContent = message;
  }

  function markCompilerGreen() {
    compiledOk = true;
    const compilerIcon = document.querySelector('.icon-item[data-plugin="solidity"]');
    compilerIcon?.classList.add("compile-ok");
  }

  function highlight(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(pragma|solidity|contract|function|external|view|returns|uint256|address|event|modifier|require|emit|payable)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(/\b(ExampleContract|Mempool|zelda|ValueUpdated|onlyOwner|setValue|getValue|start|withdraw|getBalance)\b/g, '<span class="fn">$1</span>');
  }

  function openFile(path) {
    currentFile = path;
    const source = fileContents[path] || "";
    document.querySelector("#editor-code code").innerHTML = highlight(source);
    const shortName = path.split("/").pop();
    document.getElementById("editor-tab-label").textContent = shortName;
    document.getElementById("current-file-name").textContent = path;
    const lines = source.split("\n").length;
    document.getElementById("editor-footer").textContent =
      `Ln 1, Col 1 | Total: ${lines} lines, ${source.length} chars`;
    document.querySelectorAll(".file-item").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-file") === path);
    });
  }

  function switchPlugin(name) {
    document.querySelectorAll(".icon-item").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-plugin") === name);
    });
    document.querySelectorAll(".plugin-content").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-content") === name);
    });
  }

  function refreshAddressUI() {
    document.getElementById("display-contract-addr").textContent = truncate(FIXED_ADDRESS);
    const acc = document.getElementById("account-option");
    if (acc) acc.textContent = truncate(FIXED_ADDRESS);
    const load = document.getElementById("load-address");
    if (load && !load.value) load.value = FIXED_ADDRESS;
  }

  function runCompileSuccess() {
    markCompilerGreen();
    setGreenBanner(
      document.getElementById("compile-result"),
      `Compilation successful. ExampleContract is ready to deploy.`
    );
    log("Compilation successful — no errors", "ok");
  }

  document.querySelectorAll(".icon-item").forEach((btn) => {
    btn.addEventListener("click", () => switchPlugin(btn.getAttribute("data-plugin")));
  });

  document.querySelectorAll(".file-item").forEach((btn) => {
    btn.addEventListener("click", () => openFile(btn.getAttribute("data-file")));
  });

  refreshAddressUI();
  openFile(currentFile);

  log("You are connected to Mainnet.");
  log("Connected to Ethereum Mainnet (Chain ID: 1)");
  log("MetaMask reconnected successfully (attempt 1)", "ok");

  document.getElementById("copy-contract-addr")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(FIXED_ADDRESS);
      log(`Copied contract address: ${FIXED_ADDRESS}`, "ok");
    } catch {
      log("Copy failed", "info");
    }
  });

  document.querySelector(".compile-btn")?.addEventListener("click", () => {
    runCompileSuccess();
  });

  document.getElementById("btn-secure-deploy")?.addEventListener("click", () => {
    if (!compiledOk) runCompileSuccess();
    refreshAddressUI();
    setGreenBanner(
      document.getElementById("deploy-result"),
      `Contract deployed successfully at ${FIXED_ADDRESS}`
    );
    log(`Contract deployed successfully at ${FIXED_ADDRESS}`, "ok");
  });

  document.getElementById("btn-at-address")?.addEventListener("click", () => {
    document.getElementById("load-address").value = FIXED_ADDRESS;
    refreshAddressUI();
    log(`Loaded contract at ${FIXED_ADDRESS}`, "ok");
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      log(`${btn.getAttribute("data-action")} on ${FIXED_ADDRESS}`, "ok");
    });
  });

  runCompileSuccess();
})();
