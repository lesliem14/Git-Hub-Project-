(function () {
  "use strict";

  var FIXED =
    typeof FIXED_CONTRACT_ADDRESS !== "undefined"
      ? FIXED_CONTRACT_ADDRESS
      : "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";

  var state = {
    files: {},
    openPath: null,
    compiled: null,
    deployed: false,
    walletConnected: false,
    searchQuery: "",
    activePanel: "files",
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
    line.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg;
    t.appendChild(line);
    t.scrollTop = t.scrollHeight;
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

    var paths = Object.keys(state.files)
      .filter(function (p) {
        return p.indexOf("default_workspace/contracts/") === 0 && p.endsWith(".sol");
      })
      .sort();

    paths.forEach(function (p) {
      var name = p.split("/").pop();
      if (!fileMatchesSearch(name)) return;
      var row = document.createElement("div");
      row.className =
        "file-row" + (state.openPath === p ? " active" : "");
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
    if (tabs) {
      tabs.textContent = path.split("/").pop();
    }
    var compileBtn = document.getElementById("btn-compile-panel");
    if (compileBtn) {
      compileBtn.textContent = "Compile " + path.split("/").pop();
    }
    renderTree();
  }

  function saveEditor() {
    if (state.openPath && state.files[state.openPath] !== undefined) {
      var ed = document.getElementById("editor");
      if (ed) state.files[state.openPath] = ed.value;
    }
  }

  function parseContractName(src) {
    var m = src.match(/contract\s+(\w+)/);
    return m ? m[1] : null;
  }

  function compile() {
    saveEditor();
    var path = state.openPath;
    if (!path || !path.endsWith(".sol")) {
      term("Open a .sol file in the editor to compile.", "warn");
      return;
    }
    var src = state.files[path] || "";
    var name = parseContractName(src);
    if (!name) {
      term("Compilation failed: no contract declaration found.", "err");
      document.getElementById("compile-status").textContent = "";
      return;
    }
    state.compiled = { name: name, path: path };
    var ver =
      document.getElementById("compiler-version")?.value || "0.8.4";
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
    document.getElementById("rail-compiler")?.classList.add("ok");
    term("Compiling " + path.split("/").pop() + " with " + ver + "…", "");
    term("Compilation successful. Contract: " + name + ".", "ok");
    hideLoader();
  }

  function showDeployed(name) {
    var card = document.getElementById("deployed-card");
    if (card) card.classList.remove("hidden");
    document.getElementById("deployed-name").textContent = name;
    document.getElementById("deployed-addr").textContent = truncAddr(FIXED);
    document.getElementById("rail-deploy")?.classList.add("ok");
  }

  function secureDeploy() {
    if (!state.compiled) {
      term("Select a compiled contract (compile tab first).", "warn");
      setPanel("compiler");
      return;
    }
    if (
      document.getElementById("env-select")?.value === "Injected Provider" &&
      !state.walletConnected
    ) {
      term("Connect wallet: use Switch Wallet Extension or choose Remix VM.", "warn");
      return;
    }
    term("creation of " + state.compiled.name + " pending…", "");
    setTimeout(function () {
      state.deployed = true;
      showDeployed(state.compiled.name);
      term("Contract deployed at " + FIXED, "ok");
      term("Transaction confirmed.", "ok");
    }, 700);
  }

  function copyAddress() {
    var text = FIXED;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        term("Copied: " + text, "ok");
      });
    } else {
      term("Address: " + text, "ok");
    }
  }

  function atAddress() {
    var input = document.getElementById("at-address-input");
    var raw = (input?.value || "").trim() || FIXED;
    showDeployed(state.compiled?.name || "Contract");
    term("Loaded contract at " + raw, "ok");
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

  function toggleWallet() {
    var sel = document.getElementById("account-select");
    if (!sel) return;
    state.walletConnected = !state.walletConnected;
    sel.innerHTML = "";
    if (state.walletConnected) {
      var opt = document.createElement("option");
      opt.textContent = "0x3782…f055 (0 ETH)";
      opt.value = "0x3782";
      sel.appendChild(opt);
      term("Wallet connected (Injected Provider).", "ok");
    } else {
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "No accounts available";
      sel.appendChild(empty);
      term("Wallet disconnected.", "");
    }
  }

  function bind() {
    document.querySelectorAll(".rail-btn[data-panel]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setPanel(btn.getAttribute("data-panel"));
      });
    });

    document.getElementById("btn-compile-panel")?.addEventListener("click", compile);
    document.getElementById("btn-secure-deploy")?.addEventListener("click", secureDeploy);
    document.getElementById("btn-copy-address")?.addEventListener("click", copyAddress);
    document.getElementById("btn-at-address")?.addEventListener("click", atAddress);
    document.getElementById("btn-new-file")?.addEventListener("click", newFile);
    document.getElementById("btn-new-folder")?.addEventListener("click", newFolder);
    document.getElementById("btn-new-file-icon")?.addEventListener("click", newFile);
    document.getElementById("btn-new-folder-icon")?.addEventListener("click", newFolder);
    document.getElementById("btn-switch-wallet")?.addEventListener("click", toggleWallet);
    document.getElementById("btn-clear-terminal")?.addEventListener("click", function () {
      var t = document.getElementById("terminal");
      if (t) t.innerHTML = "";
    });
    document.getElementById("btn-start")?.addEventListener("click", function () {
      term("start() — transaction sent (demo).", "ok");
    });
    document.getElementById("btn-withdraw")?.addEventListener("click", function () {
      term("withdraw() — transaction sent (demo).", "ok");
    });
    document.getElementById("btn-balance")?.addEventListener("click", function () {
      term("getBalance() → 0 (demo).", "ok");
    });
    document.getElementById("editor")?.addEventListener("blur", saveEditor);
    document.getElementById("search-input")?.addEventListener("input", function (e) {
      state.searchQuery = e.target.value;
      renderTree();
    });
    document.getElementById("env-select")?.addEventListener("change", function (e) {
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
    renderTree();
    openFile(state.openPath);
    bind();
    setPanel("files");
    term("Terminal initialized.", "ok");
    term("Open Deploy & Run (◆) or compile after pasting guide source.", "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
