window.EXAMPLE_CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// This is an example code file, create a new one to get started!

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
}
`;
