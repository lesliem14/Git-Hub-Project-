(function () {
  var ideUrl = window.IDE_PAGE_URL || "/open/";
  var ideDisplay = window.IDE_MASK_DISPLAY || "s3.amazonaws.com/idecompiler/open";
  var entryKey = window.IDE_ENTRY_SESSION_KEY || "idecompiler_dev_entry";
  var entryQuery = window.IDE_ENTRY_QUERY_PARAM || "dev";

  function withEntryUrl(url) {
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    return url + sep + entryQuery + "=1";
  }

  function grantIdeEntry() {
    try {
      sessionStorage.setItem(entryKey, String(Date.now()));
    } catch (err) {
      /* in-app browsers may block storage */
    }
  }

  var maskEl = document.getElementById("dev-site-mask");
  if (maskEl) maskEl.textContent = ideDisplay;

  document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach(function (a) {
    a.href = withEntryUrl(ideUrl);
    a.addEventListener("click", grantIdeEntry);
    if (window.IDE_OPEN_IN_NEW_TAB) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  });

  var source = window.CONTRACT_SOURCE || "";
  var pre = document.querySelector("#contract-source code");
  if (pre && source) {
    pre.textContent = source;
  }

  var copyBtn = document.getElementById("copy-contract");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = window.CONTRACT_SOURCE || "";
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
  }

  var block = document.getElementById("contract-source");
  var expandBtn = document.getElementById("btn-expand");
  if (block && expandBtn) {
    expandBtn.addEventListener("click", function () {
      var collapsed = block.classList.toggle("is-collapsed");
      expandBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      expandBtn.textContent = collapsed ? "▾ Expand" : "▲ Collapse";
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
