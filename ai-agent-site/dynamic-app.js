(function () {
  var cfg = window.SITE_CONFIG || {};
  var guide = cfg.guide || {};
  var urls = cfg.urls || {};
  var entryKey = window.IDE_ENTRY_SESSION_KEY || "idecompiler_dev_entry";
  var sourceCache = null;
  var ideFrameStarted = false;
  var ideFrameReady = false;
  var currentView = "guide";
  var transitionMs = 320;

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
    return "open/embed.html?dev=1&embed=1";
  }

  function setLoading(on) {
    var el = document.getElementById("ide-embed-loading");
    if (!el) return;
    if (on) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
  }

  function preloadIdeFrame() {
    if (ideFrameStarted) return;
    var frame = document.getElementById("ide-frame");
    if (!frame) return;
    ideFrameStarted = true;
    setLoading(true);
    frame.addEventListener("load", onFrameLoad);
    frame.src = ideFrameUrl();
  }

  function onFrameLoad() {
    ideFrameReady = true;
    setLoading(false);
    var frame = document.getElementById("ide-frame");
    if (frame) frame.classList.add("is-ready");
  }

  function setView(view, animate) {
    var isIde = view === "ide";
    if (currentView === view && animate !== true) return;
    currentView = view;

    var guideEl = document.getElementById("guide-main");
    var embed = document.getElementById("ide-embed");

    document.documentElement.classList.toggle("boot-ide", isIde);
    document.body.classList.toggle("guide-ide-open", isIde);

    if (isIde) {
      grantIdeEntry();
      preloadIdeFrame();
      if (!ideFrameReady) setLoading(true);
      if (embed) {
        embed.setAttribute("aria-hidden", "false");
        requestAnimationFrame(function () {
          embed.classList.add("is-active");
        });
      }
      if (guideEl) guideEl.classList.add("is-hidden");
    } else {
      if (embed) {
        embed.classList.remove("is-active");
        embed.setAttribute("aria-hidden", "true");
      }
      if (guideEl) {
        guideEl.classList.remove("is-hidden");
      }
    }

    document.title = isIde ? "IDE — idecompiler" : guide.title || "AI Agent Guide";
  }

  function navigateToIde(push) {
    setView("ide");
    var url = new URL(window.location.href);
    url.searchParams.set("view", "ide");
    url.searchParams.delete("dev");
    url.searchParams.delete("embed");
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

    var zip = document.getElementById("zip-download");
    if (zip && guide.zipName) {
      zip.href = guide.zipName;
      zip.download = guide.zipName;
      zip.textContent = guide.zipName;
    }

    var list = document.getElementById("guide-steps");
    if (list && cfg.guideSteps && cfg.guideSteps.length) {
      list.innerHTML = "";
      cfg.guideSteps.forEach(function (step, i) {
        var li = document.createElement("li");
        if (i === 0) {
          li.innerHTML =
            "👉 " +
            step +
            ' <a href="' +
            (urls.metamask || "https://metamask.io/download") +
            '" target="_blank" rel="noopener noreferrer">' +
            (urls.metamask || "https://metamask.io/download") +
            "</a>";
        } else if (i === 1) {
          li.innerHTML =
            '👉 Head over to the <a href="?view=ide" class="dev-site-inline">development site</a>';
        } else {
          var ver = guide.compilerVersion || "0.8.4";
          li.textContent = "👉 " + step.replace("0.8.4", ver);
        }
        list.appendChild(li);
      });
    }
  }

  function bindDevLinks() {
    document.querySelectorAll(".dev-site-inline, #dev-site-link").forEach(function (a) {
      a.href = "?view=ide";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        navigateToIde();
      });
      a.addEventListener("mouseenter", preloadIdeFrame, { once: true });
      a.addEventListener("focus", preloadIdeFrame, { once: true });
    });
  }

  function resolveInitialView() {
    if (qs("view") === "ide") return "ide";
    if (qs("dev") === "1" || qs("embed") === "1") return "ide";
    var path = window.location.pathname.replace(/\/$/, "");
    if (path.endsWith("/open") || path.endsWith("/open/index.html")) return "ide";
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
      setView(resolveInitialView(), true);
    });

    window.addEventListener("message", function (ev) {
      if (ev.data && ev.data.type === "idecompiler-ready") {
        ideFrameReady = true;
        setLoading(false);
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

  function init() {
    applyConfig();
    bindDevLinks();
    bindUi();
    loadSource();

    var view = resolveInitialView();
    setView(view, true);

    if (view === "ide") {
      var url = new URL(window.location.href);
      if (!url.searchParams.get("view")) {
        url.searchParams.set("view", "ide");
        history.replaceState({ view: "ide" }, "", url.pathname + "?" + url.searchParams.toString());
      }
    } else {
      window.setTimeout(preloadIdeFrame, 1200);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
