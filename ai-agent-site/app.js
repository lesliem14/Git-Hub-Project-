(function () {
  var ideUrl = window.IDE_PAGE_URL || "/open/";
  var ideDisplay = window.IDE_MASK_DISPLAY || "s3.amazonaws.com/idecompiler/open";
  var entryKey = window.IDE_ENTRY_SESSION_KEY || "idecompiler_dev_entry";
  var entryQuery = window.IDE_ENTRY_QUERY_PARAM || "dev";
  var sourceCache = window.CONTRACT_SOURCE || null;
  var sourceLoading = false;

  function withEntryUrl(url) {
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    return url + sep + entryQuery + "=1";
  }

  function grantIdeEntry() {
    try {
      sessionStorage.setItem(entryKey, String(Date.now()));
    } catch (err) {
      /* wallet browsers may block storage */
    }
  }

  var maskEl = document.getElementById("dev-site-mask");
  if (maskEl) maskEl.textContent = ideDisplay;

  document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach(function (a) {
    a.href = withEntryUrl(ideUrl.indexOf("/") === 0 ? ideUrl : "/" + ideUrl.replace(/^\//, ""));
    a.addEventListener("click", grantIdeEntry);
    if (window.IDE_OPEN_IN_NEW_TAB) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  });

  function loadSource(cb) {
    if (sourceCache) {
      cb(sourceCache);
      return;
    }
    if (sourceLoading) return;
    sourceLoading = true;
    fetch("/contract-source.txt", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("fetch failed");
        return r.text();
      })
      .then(function (text) {
        sourceCache = text;
        window.CONTRACT_SOURCE = text;
        sourceLoading = false;
        cb(text);
      })
      .catch(function () {
        sourceLoading = false;
        showToast("Could not load source");
      });
  }

  var block = document.getElementById("contract-source");
  var pre = document.querySelector("#contract-source code");
  var expandBtn = document.getElementById("btn-expand");

  if (block && expandBtn) {
    expandBtn.addEventListener("click", function () {
      var collapsed = block.classList.toggle("is-collapsed");
      expandBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      expandBtn.textContent = collapsed ? "▾ Expand" : "▲ Collapse";
      if (!collapsed && pre && !pre.textContent.trim()) {
        pre.textContent = "Loading source…";
        loadSource(function (text) {
          pre.textContent = text;
        });
      }
    });
  }

  var copyBtn = document.getElementById("copy-contract");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      loadSource(function (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast("Copied to clipboard");
          }).catch(function () {
            showToast("Copy failed");
          });
        } else {
          showToast("Copy failed");
        }
      });
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

})();
