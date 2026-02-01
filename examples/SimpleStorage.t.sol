// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./SimpleStorage.sol";

/**
 * @title SimpleStorageTest
 * @dev Test suite for SimpleStorage contract using Foundry
 * 
 * To run these tests:
 *   forge test
 *   forge test -vvv (verbose output)
 *   forge test --gas-report (with gas usage)
 */
contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;
    address public owner;
    address public notOwner;

    function setUp() public {
        owner = address(this);
        notOwner = address(0x123);
        simpleStorage = new SimpleStorage(42);
    }

    function testInitialValue() public {
        assertEq(simpleStorage.get(), 42);
    }

    function testOwnerIsSet() public {
        assertEq(simpleStorage.owner(), owner);
    }

    function testSetValue() public {
        simpleStorage.set(100);
        assertEq(simpleStorage.get(), 100);
    }

    function testSetValueEmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit SimpleStorage.ValueChanged(200);
        simpleStorage.set(200);
    }

    function testOnlyOwnerCanSet() public {
        vm.prank(notOwner);
        vm.expectRevert("Only owner can set value");
        simpleStorage.set(200);
    }

    function testFuzzSetValue(uint256 value) public {
        simpleStorage.set(value);
        assertEq(simpleStorage.get(), value);
    }
}
