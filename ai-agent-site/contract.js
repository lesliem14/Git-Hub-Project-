window.CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ExampleContract
/// @notice Minimal secure storage contract with owner-only updates.
contract ExampleContract {
    uint256 private _value;
    address private _owner;

    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event Started(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);

    error NotOwner();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != _owner) revert NotOwner();
        _;
    }

    constructor() {
        if (msg.sender == address(0)) revert ZeroAddress();
        _owner = msg.sender;
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function value() external view returns (uint256) {
        return _value;
    }

    function setValue(uint256 newValue) external onlyOwner {
        uint256 oldValue = _value;
        _value = newValue;
        emit ValueUpdated(oldValue, newValue);
    }

    function getValue() external view returns (uint256) {
        return _value;
    }

    function start() external payable {
        emit Started(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        (bool ok, ) = _owner.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Withdrawn(_owner, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
`;

/** Fixed contract address shown and copied in the IDE — never auto-generated. */
window.FIXED_CONTRACT_ADDRESS = "0xb1b0b5bEaFdF739b3Fc9FFae2BE49F371C0c93cb";
