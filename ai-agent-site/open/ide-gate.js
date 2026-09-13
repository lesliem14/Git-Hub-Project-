(function () {
  var key =
    typeof IDE_ENTRY_SESSION_KEY !== "undefined"
      ? IDE_ENTRY_SESSION_KEY
      : "idecompiler_dev_entry";
  var home =
    typeof GUIDE_HOME_URL !== "undefined" ? GUIDE_HOME_URL : "../index.html";
  var param =
    typeof IDE_ENTRY_QUERY_PARAM !== "undefined"
      ? IDE_ENTRY_QUERY_PARAM
      : "dev";

  function checkAllowed() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get("embed") === "1") return true;
      if (q.get(param) === "1") {
        try {
          sessionStorage.setItem(key, "1");
        } catch (e) {
          /* ignore */
        }
        return true;
      }
      if (sessionStorage.getItem(key)) return true;
    } catch (e) {
      var q2 = new URLSearchParams(window.location.search);
      if (q2.get("embed") === "1" || q2.get(param) === "1") return true;
    }
    return false;
  }

  window.IDE_ENTRY_ALLOWED = checkAllowed();

  if (!window.IDE_ENTRY_ALLOWED) {
    var target = home.indexOf("http") === 0 ? home : home.replace(/^\//, "../");
    if (home === "index.html" || home === "/") target = "../index.html";
    window.location.replace(target);
    return;
  }

  try {
    document.documentElement.setAttribute("data-ide-allowed", "true");
    if (new URLSearchParams(window.location.search).get("embed") === "1") {
      document.documentElement.classList.add("ide-embed-mode");
    }
  } catch (e) {
    /* ignore */
  }

  function cleanQuery() {
    try {
      var clean = new URL(window.location.href);
      if (clean.searchParams.get(param) === "1") {
        clean.searchParams.delete(param);
        var next =
          clean.pathname +
          (clean.search ? clean.search : "") +
          clean.hash;
        window.history.replaceState(null, "", next);
      }
    } catch (e) {
      /* ignore */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanQuery);
  } else {
    cleanQuery();
  }
})();
