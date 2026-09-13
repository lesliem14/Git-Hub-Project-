/**
 * Runs before app.js: seeds the file tree (matches reference UI) and loads site contract config.
 */
(function () {
  const STORAGE_KEY = "remix-files";

  const README_FALLBACK = `// This is an example code file, create a new one to get started!

/// @title ExampleContract
/// @notice This is placeholder code. Create a new file to get started!
contract ExampleContract {
    /// @notice A simple stored value to demonstrate state.
    uint256 public value;

    /// @notice The address that deployed this contract.
    address public owner;

    /// @notice Emitted whenever the stored value changes.
    event ValueUpdated(uint256 oldValue, uint256 newValue);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Update the stored value.
    /// @param newValue The new value to store.
    function setValue(uint256 newValue) external onlyOwner {
        uint256 oldValue = value;
        value = newValue;
        emit ValueUpdated(oldValue, newValue);
    }

    /// @notice Read the stored value (redundant with the public getter,
    ///         but here as an example of a view function).
    function getValue() external view returns (uint256) {
        return value;
    }
}`;

  const MEMPOOL_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Mempool {
    // Placeholder — add mempool logic in a new file or edit this one.
}
`;

  const ZELDA_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Zelda {
}
`;

  function defaultWorkspace() {
    const readme =
      (window.CONTRACT_SOURCE &&
        window.CONTRACT_SOURCE.replace(/^\/\/ SPDX-License-Identifier:.*\n/, "")) ||
      README_FALLBACK;

    return {
      "contracts/README.sol": readme,
      "contracts/Mempool.sol": MEMPOOL_SOL,
      "contracts/zelda.sol": ZELDA_SOL,
    };
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkspace()));
      return;
    }
    const parsed = JSON.parse(existing);
    if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkspace()));
      return;
    }
    const defaults = defaultWorkspace();
    let changed = false;
    Object.keys(defaults).forEach((path) => {
      if (!(path in parsed)) {
        parsed[path] = defaults[path];
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (_) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkspace()));
    } catch (__) {
      /* ignore quota errors */
    }
  }
})();
