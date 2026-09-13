window.CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title ArbitrageInterface
contract ArbitrageInterface {
    address public owner;

    event Started(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function start() external payable {
        emit Started(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        uint256 bal = address(this).balance;
        payable(owner).transfer(bal);
        emit Withdrawn(owner, bal);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
`;
