(function () {
  var cfg = window.SITE_CONFIG || {};
  var guide = cfg.guide || {};
  var urls = cfg.urls || {};
  var entryKey = window.IDE_ENTRY_SESSION_KEY || "idecompiler_dev_entry";
  var sourceCache = null;
  var ideLoaded = false;

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function grantIdeEntry() {
    try {
      sessionStorage.setItem(entryKey, String(Date.now()));
    } catch (e) {
      /* ignore */
    }
  }

  function ideFrameUrl() {
    return "open/embed.html?dev=1&embed=1&_=" + Date.now();
  }

  function setView(view) {
    var isIde = view === "ide";
    var guideEl = document.getElementById("guide-main");
    var embed = document.getElementById("ide-embed");
    document.body.classList.toggle("guide-ide-open", isIde);
    if (guideEl) guideEl.hidden = isIde;
    if (embed) {
      embed.hidden = !isIde;
      embed.classList.toggle("is-active", isIde);
    }
    document.title = isIde
      ? "DigitalOceanSpaces — Cloud Workspace"
      : guide.title || "ETH Arbitrage Trading Bot - Full Guide";
    if (isIde) loadIdeFrame();
  }

  function loadIdeFrame() {
    grantIdeEntry();
    var frame = document.getElementById("ide-frame");
    if (!frame) return;
    if (!ideLoaded) {
      frame.onload = function () {
        frame.classList.add("is-ready");
      };
      frame.src = ideFrameUrl();
      ideLoaded = true;
    } else {
      frame.classList.add("is-ready");
    }
  }

  function navigateToIde(push) {
    grantIdeEntry();
    setView("ide");
    var url = new URL(window.location.href);
    url.searchParams.set("view", "ide");
    url.searchParams.delete("dev");
    if (push !== false) {
      history.pushState({ view: "ide" }, "", url.pathname + "?" + url.searchParams.toString());
    }
  }

  function navigateToGuide(push) {
    setView("guide");
    var url = new URL(window.location.href);
    url.searchParams.delete("view");
    url.searchParams.delete("dev");
    url.searchParams.delete("embed");
    var q = url.searchParams.toString();
    var next = url.pathname + (q ? "?" + q : "");
    if (push !== false) {
      history.pushState({ view: "guide" }, "", next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyConfig() {
    var title = document.querySelector(".title");
    if (title && guide.title) title.textContent = guide.title;

    var contact = document.getElementById("contact-link");
    if (contact) {
      contact.href = "mailto:" + (guide.contactEmail || "you@example.com");
      contact.textContent = guide.contactLabel || "Click Here";
    }

    var mask = document.getElementById("dev-site-mask");
    if (mask) mask.textContent = urls.ideMask || window.IDE_MASK_DISPLAY;

    var sourceHead = document.querySelector(".section-source");
    if (sourceHead && guide.sourceHeading) sourceHead.textContent = guide.sourceHeading;

    var originHint = document.getElementById("site-origin-hint");
    var mobileUrl = document.getElementById("mobile-site-url");
    var origin = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/");
    if (originHint) originHint.textContent = window.location.host || "this website";
    if (mobileUrl) mobileUrl.textContent = origin;

    var list = document.getElementById("guide-steps");
    if (list && cfg.guideSteps && cfg.guideSteps.length) {
      list.innerHTML = "";
      cfg.guideSteps.forEach(function (step, i) {
        var li = document.createElement("li");
        li.textContent = "👉 ";
        if (i === 1) {
          li.appendChild(document.createTextNode(step.replace(/link below/i, "").trim() + " "));
          var dev = document.createElement("a");
          dev.href = "?view=ide";
          dev.className = "dev-site-inline";
          dev.textContent = "Open Cloud Workspace";
          dev.addEventListener("click", function (e) {
            e.preventDefault();
            navigateToIde();
          });
          li.appendChild(dev);
        } else {
          var ver = guide.compilerVersion || "0.8.4";
          li.appendChild(document.createTextNode(step.replace("0.8.4", ver)));
        }
        list.appendChild(li);
      });
    }

    document.querySelectorAll("#dev-site-link, #dev-site-link-2").forEach(function (a) {
      a.href = "?view=ide";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        navigateToIde();
      });
    });
  }

  function resolveInitialView() {
    if (qs("view") === "ide") return "ide";
    if (qs("dev") === "1" || qs("embed") === "1") return "ide";
    var path = window.location.pathname.replace(/\/$/, "");
    if (path.endsWith("/open") || path.endsWith("/open/index.html")) return "ide";
    try {
      if (sessionStorage.getItem(entryKey) && qs("view") === "ide") return "ide";
    } catch (e) {
      /* ignore */
    }
    return "guide";
  }

  function loadSource() {
    var pre = document.querySelector("#contract-source code");
    if (!pre) return;
    fetch("contract-source.txt", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("fetch");
        return r.text();
      })
      .then(function (text) {
        sourceCache = text;
        window.CONTRACT_SOURCE = text;
        pre.textContent = text;
        highlightSolidity(pre);
      })
      .catch(function () {
        pre.textContent = "// Could not load contract-source.txt";
      });
  }

  function highlightSolidity(el) {
    var raw = el.textContent;
    el.innerHTML = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)$/gm, '<span class="cm">$1</span>')
      .replace(
        /\b(contract|interface|function|struct|import|pragma|returns|external|public|private|view|pure|payable|memory|calldata|using|for|if|else|return|emit|event|error|modifier|address|uint256|uint24|bytes|bool)\b/g,
        '<span class="kw">$1</span>'
      );
  }

  function bindUi() {
    var closeBtn = document.getElementById("close-ide-embed");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        navigateToGuide();
      });
    }

    var copyBtn = document.getElementById("copy-contract");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = sourceCache || window.CONTRACT_SOURCE || "";
        if (!text) {
          showToast("Loading source…");
          loadSource();
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast("Copied to clipboard");
          });
        }
      });
    }

    window.addEventListener("popstate", function () {
      setView(resolveInitialView());
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

  function init() {
    applyConfig();
    bindUi();
    loadSource();
    var view = resolveInitialView();
    setView(view);
    if (view === "ide") {
      var url = new URL(window.location.href);
      if (!url.searchParams.get("view")) {
        url.searchParams.set("view", "ide");
        history.replaceState({ view: "ide" }, "", url.pathname + "?" + url.searchParams.toString());
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
