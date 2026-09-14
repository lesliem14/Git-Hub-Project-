(function () {
  var q = new URLSearchParams(window.location.search);
  if (q.get("embed") === "1" || q.get("dev") === "1") {
    document.documentElement.setAttribute("data-ide-allowed", "true");
    if (q.get("embed") === "1") {
      document.documentElement.classList.add("ide-embed-mode");
    }
    return;
  }
  try {
    var key =
      typeof IDE_ENTRY_SESSION_KEY !== "undefined"
        ? IDE_ENTRY_SESSION_KEY
        : "idecompiler_dev_entry";
    if (sessionStorage.getItem(key)) {
      document.documentElement.setAttribute("data-ide-allowed", "true");
      return;
    }
  } catch (e) {
    /* ignore */
  }
  window.location.replace("../index.html");
})();
