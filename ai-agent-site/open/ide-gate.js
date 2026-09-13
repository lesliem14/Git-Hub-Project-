(function () {
  var key =
    typeof IDE_ENTRY_SESSION_KEY !== "undefined"
      ? IDE_ENTRY_SESSION_KEY
      : "idecompiler_dev_entry";
  var home = typeof GUIDE_HOME_URL !== "undefined" ? GUIDE_HOME_URL : "/";
  var param =
    typeof IDE_ENTRY_QUERY_PARAM !== "undefined"
      ? IDE_ENTRY_QUERY_PARAM
      : "dev";

  function allowed() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get(param) === "1") {
        sessionStorage.setItem(key, String(Date.now()));
        return true;
      }
      if (sessionStorage.getItem(key)) return true;
    } catch (e) {
      var q2 = new URLSearchParams(window.location.search);
      if (q2.get(param) === "1") return true;
    }
    return false;
  }

  if (!allowed()) {
    window.location.replace(home);
    return;
  }

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
})();
