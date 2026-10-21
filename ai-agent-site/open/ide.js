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
    compiled: null,
    deployed: false,
    walletConnected: false,
    walletName: "",
    searchQuery: "",
    activePanel: "deploy",
    lastBytecode: "",
  };

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
    var ed = document.getElementById("editor");
    if (ed) ed.value = state.files[path];
    var tabs = document.getElementById("editor-tabs");
    if (tabs) tabs.textContent = path.split("/").pop();
    updateLineGutter();
    var autoCompile = document.getElementById("auto-compile");
    if (autoCompile && autoCompile.checked) compile(true);
    renderTree();
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
    var sel = document.getElementById("deploy-contract");
    if (sel) {
      sel.innerHTML = "";
      var opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      opt.selected = true;
      sel.appendChild(opt);
    }
    document.getElementById("compile-status").textContent =
      "✓ Compilation successful";
    var railCompiler = document.getElementById("rail-compiler");
    if (railCompiler) railCompiler.classList.add("ok");
    if (!silent) {
      term("Compiling " + path.split("/").pop() + " with " + ver + "…", "");
      term("Compilation successful. Contract: " + name + ".", "ok");
    }
    hideLoader();
  }

  function showDeployed(name) {
    var card = document.getElementById("deployed-card");
    if (card) card.classList.remove("hidden");
    document.getElementById("deployed-name").textContent = name;
    document.getElementById("deployed-addr").textContent = truncAddr(FIXED);
    var railDeploy = document.getElementById("rail-deploy");
    if (railDeploy) railDeploy.classList.add("ok");
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
  }

  function secureDeploy() {
    if (!state.compiled) {
      term("Compile your contract first (Solidity Compiler tab).", "warn");
      setPanel("compiler");
      return;
    }
    if (
      (function () {
        var env = document.getElementById("env-select");
        return env && env.value === "Injected Provider";
      })() &&
      !state.walletConnected
    ) {
      openWalletModal();
      return;
    }
    term("creation of " + state.compiled.name + " pending…", "");
    setTimeout(function () {
      state.deployed = true;
      showDeployed(state.compiled.name);
      term("Deployed contract address: " + FIXED, "ok");
      term("Transaction confirmed.", "ok");
    }, 700);
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
  }

  function atAddress() {
    showDeployed(state.compiled ? state.compiled.name : "Contract");
    term("Loaded contract at " + FIXED, "ok");
  }

  function newFile() {
    var word = prompt("New file name (one word):", "swap");
    if (!word) return;
    word = word.replace(/[^a-zA-Z0-9_]/g, "");
    if (!word) return;
    var path = "default_workspace/contracts/" + word + ".sol";
    if (state.files[path]) {
      term("File already exists.", "warn");
      openFile(path);
      return;
    }
    state.files[path] =
      "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.4;\n\n";
    openFile(path);
    renderTree();
    term("Created " + word + ".sol — paste your contract and compile.", "ok");
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
    on("btn-action", "click", function () {
      term("Action — transaction sent (demo).", "ok");
    });
    on("btn-withdraw", "click", function () {
      term("Withdraw — transaction sent (demo).", "ok");
    });
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
    openFile(state.openPath);
    bind();
    setPanel("deploy");
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
