(function () {
  var ideDisplay = window.IDE_MASK_DISPLAY || "s3.amazonaws.com/danielcrypto-web3/open";
  var maskEl = document.getElementById("dev-site-mask");
  if (maskEl) maskEl.textContent = ideDisplay;
  var entryKey = window.IDE_ENTRY_SESSION_KEY || "idecompiler_dev_entry";
  var sourceCache = null;

  function grantIdeEntry() {
    try {
      sessionStorage.setItem(entryKey, String(Date.now()));
    } catch (err) {
      /* ignore */
    }
  }

  function openEmbeddedIde() {
    grantIdeEntry();
    var embed = document.getElementById("ide-embed");
    var frame = document.getElementById("ide-frame");
    if (!embed || !frame) return;
    if (!frame.src) {
      frame.src = "open/?dev=1&embed=1";
    }
    embed.hidden = false;
    document.body.classList.add("guide-ide-open");
    embed.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeEmbeddedIde() {
    var embed = document.getElementById("ide-embed");
    if (embed) embed.hidden = true;
    document.body.classList.remove("guide-ide-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      openEmbeddedIde();
    });
  });

  var closeBtn = document.getElementById("close-ide-embed");
  if (closeBtn) closeBtn.addEventListener("click", closeEmbeddedIde);

  function loadSource() {
    var pre = document.querySelector("#contract-source code");
    if (!pre) return;
    fetch("contract-source.txt", { cache: "no-cache" })
      .then(function (r) {
        return r.text();
      })
      .then(function (text) {
        sourceCache = text;
        window.CONTRACT_SOURCE = text;
        pre.textContent = text;
        highlightSolidity(pre);
      })
      .catch(function () {
        pre.textContent = "// Source unavailable — check contract-source.txt is deployed.";
      });
  }

  function highlightSolidity(el) {
    var raw = el.textContent;
    var html = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)$/gm, '<span class="cm">$1</span>')
      .replace(
        /\b(contract|interface|function|struct|import|pragma|returns|external|public|private|view|pure|payable|memory|calldata|using|for|if|else|return|emit|event|error|modifier|address|uint256|uint24|bytes|bool)\b/g,
        '<span class="kw">$1</span>'
      );
    el.innerHTML = html;
  }

  var copyBtn = document.getElementById("copy-contract");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = sourceCache || window.CONTRACT_SOURCE || "";
      if (!text) {
        loadSource();
        showToast("Loading source…");
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast("Copied to clipboard");
        }).catch(function () {
          showToast("Copy failed");
        });
      }
    });
  }

  function showToast(message) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.hidden = true;
    }, 2400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSource);
  } else {
    loadSource();
  }
})();
