(function () {
  function highlightSolidity(source) {
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(
        /\b(SPDX-License-Identifier|pragma|solidity|contract|function|external|view|returns|uint256|address|event|modifier|require|emit|import)\b/g,
        '<span class="kw">$1</span>'
      )
      .replace(/\b(ExampleContract|ValueUpdated|onlyOwner|setValue|getValue)\b/g, '<span class="fn">$1</span>');
  }

  function showToast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.hidden = true;
    }, 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed — select text manually");
    }
  }

  const pre = document.querySelector("#contract-source code");
  if (pre && window.EXAMPLE_CONTRACT_SOURCE) {
    pre.innerHTML = highlightSolidity(window.EXAMPLE_CONTRACT_SOURCE);
  }

  document.getElementById("copy-contract")?.addEventListener("click", () => {
    copyText(window.EXAMPLE_CONTRACT_SOURCE || "");
  });

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.getAttribute("data-copy")));
  });

  const block = document.getElementById("contract-source");
  const expandBtn = document.getElementById("btn-expand");
  expandBtn?.addEventListener("click", () => {
    const collapsed = block.classList.toggle("is-collapsed");
    const expanded = !collapsed;
    expandBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    expandBtn.textContent = expanded ? "▲ Collapse" : "▼ Expand";
  });
})();
