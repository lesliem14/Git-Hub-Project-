/**
 * UX aligned with production IDE: demo account, left-panel deploy, new-contract templates.
 */
(function () {
  window.getNewSolidityContractTemplate = function (contractName) {
    const safe = contractName.replace(/[^a-zA-Z0-9_]/g, "") || "NewContract";
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title ${safe}
contract ${safe} {
    address public owner;

    event Deployed(address deployer);

    constructor() {
        owner = msg.sender;
        emit Deployed(msg.sender);
    }

    function start() external payable {}

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
`;
  };

  const DEMO_ACCOUNT_LABEL = "0x3782…f055 (2.0170 ETH)";

  function ensureDemoAccount() {
    const env = document.getElementById("environment-select");
    if (env && env.value !== "injected") return;

    const accountSelect = document.getElementById("account-select");
    if (!accountSelect) return;

    if (typeof userAccount !== "undefined" && userAccount) return;

    if (
      accountSelect.options.length === 0 ||
      accountSelect.options[0].value === "" ||
      accountSelect.options[0].textContent.includes("No accounts")
    ) {
      accountSelect.innerHTML = `<option value="demo" selected>${DEMO_ACCOUNT_LABEL}</option>`;
    }

    if (typeof updateDeployButton === "function") {
      updateDeployButton();
    }
  }

  function wirePluginRail() {
    document.querySelectorAll(".remix-icon-panel .icon-item").forEach((item) => {
      item.addEventListener("click", () => {
        const plugin = item.getAttribute("data-plugin");
        if (plugin === "udapp" && typeof updateDeployButton === "function") {
          setTimeout(updateDeployButton, 50);
        }
        if (plugin === "solidity" && typeof compileContract === "function" && window.codeEditor) {
          setTimeout(() => {
            try {
              compileContract();
            } catch (_) {
              /* compile when file ready */
            }
          }, 100);
        }
      });
    });
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      ensureDemoAccount();
      wirePluginRail();
      if (typeof handleEnvironmentChange === "function") {
        handleEnvironmentChange();
      }
      ensureDemoAccount();
    }, 2800);
  });

  const envSelect = document.getElementById("environment-select");
  if (envSelect) {
    envSelect.addEventListener("change", () => {
      setTimeout(ensureDemoAccount, 100);
    });
  }
})();
