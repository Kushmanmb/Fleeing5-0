// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @dev A simple contract for storing and retrieving a value
 * This is an example contract for demonstration purposes
 */
contract SimpleStorage {
    uint256 private storedValue;
    address public owner;
    
    event ValueChanged(uint256 newValue);
    
    constructor(uint256 initialValue) {
        storedValue = initialValue;
        owner = msg.sender;
    }
    
    function set(uint256 value) public {
        require(msg.sender == owner, "Only owner can set value");
        storedValue = value;
        emit ValueChanged(value);
    }
    
    function get() public view returns (uint256) {
        return storedValue;
    }
}
