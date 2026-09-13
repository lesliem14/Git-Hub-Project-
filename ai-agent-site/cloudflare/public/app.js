(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var guide = cfg.guide || {};
  var urls = cfg.urls || {};
  var entryKey = window.IDE_ENTRY_SESSION_KEY || "idecompiler_dev_entry";
  var ideSrc = "open/embed.html?dev=1&embed=1";
  var sourceCache = null;
  var ideOpen = false;

  function grantEntry() {
    try {
      sessionStorage.setItem(entryKey, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function openIde(e) {
    if (e && e.preventDefault) e.preventDefault();
    grantEntry();
    var embed = document.getElementById("ide-embed");
    var frame = document.getElementById("ide-frame");
    if (!embed || !frame) {
      window.location.href = ideSrc;
      return;
    }
    if (!ideOpen) {
      frame.src = ideSrc;
      ideOpen = true;
    }
    embed.classList.add("is-active");
    embed.setAttribute("aria-hidden", "false");
    document.body.classList.add("guide-ide-open");
    document.getElementById("guide-main").classList.add("is-hidden");
  }

  function closeIde() {
    var embed = document.getElementById("ide-embed");
    if (embed) {
      embed.classList.remove("is-active");
      embed.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("guide-ide-open");
    var main = document.getElementById("guide-main");
    if (main) main.classList.remove("is-hidden");
  }

  function applyConfig() {
    if (guide.title) {
      var t = document.querySelector(".title");
      if (t) t.textContent = guide.title;
    }
    var contact = document.getElementById("contact-link");
    if (contact && guide.contactEmail) {
      contact.href = "mailto:" + guide.contactEmail;
    }
    if (guide.contactLabel && contact) contact.textContent = guide.contactLabel;
    var mask = document.getElementById("dev-site-mask");
    if (mask) mask.textContent = urls.ideMask || mask.textContent;
    var zip = document.getElementById("zip-download");
    if (zip && guide.zipName) {
      zip.href = guide.zipName;
      zip.download = guide.zipName;
      zip.textContent = guide.zipName;
    }
  }

  function loadSource() {
    var pre = document.querySelector("#contract-source code");
    if (!pre) return;
    var done = false;
    var timer = setTimeout(function () {
      if (!done && pre.textContent.indexOf("Loading") >= 0) {
        pre.textContent = "// Open Expand or Copy after page loads.";
      }
    }, 8000);
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var fetchOpts = ctrl ? { signal: ctrl.signal } : {};
    if (ctrl) {
      setTimeout(function () {
        try {
          ctrl.abort();
        } catch (e) {
          /* ignore */
        }
      }, 6000);
    }
    fetch("contract-source.txt", fetchOpts)
      .then(function (r) {
        if (!r.ok) throw new Error("missing");
        return r.text();
      })
      .then(function (text) {
        done = true;
        clearTimeout(timer);
        sourceCache = text;
        window.CONTRACT_SOURCE = text;
        pre.textContent = text;
      })
      .catch(function () {
        done = true;
        clearTimeout(timer);
        pre.textContent = "// contract-source.txt not found on server.";
      });
  }

  function bind() {
    document.querySelectorAll("#dev-site-link, .js-open-ide").forEach(function (a) {
      a.addEventListener("click", openIde);
    });
    var close = document.getElementById("close-ide-embed");
    if (close) close.addEventListener("click", closeIde);
    var copy = document.getElementById("copy-contract");
    if (copy) {
      copy.addEventListener("click", function () {
        var text = sourceCache || window.CONTRACT_SOURCE || "";
        if (!text || text.indexOf("//") === 0 && text.length < 80) {
          loadSource();
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        }
      });
    }
  }

  function maybeOpenFromQuery() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get("view") === "ide") {
        requestAnimationFrame(function () {
          openIde();
        });
      }
    } catch (e) {
      /* ignore */
    }
  }

  applyConfig();
  bind();
  loadSource();
  maybeOpenFromQuery();
})();
