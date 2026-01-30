# Contract Verification Examples

This directory contains examples demonstrating how to use the contract verification tool.

## Files

- **SimpleStorage.sol** - A simple example smart contract
- **verify-example.js** - Example script showing programmatic verification

## Using the Example

### Prerequisites

Before working with the examples, make sure you have:
- Node.js and npm installed
- Foundry installed (see main [README.md](../README.md) or run `../setup-foundry.sh`)
- An Etherscan API key (from [https://etherscan.io/myapikey](https://etherscan.io/myapikey))
- A testnet RPC URL (from [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/))

### Step-by-Step Guide

1. **Install Foundry (if not already installed):**
   ```bash
   # From the project root
   ./setup-foundry.sh
   
   # Or manually
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Review the example contract:**
   ```bash
   cat examples/SimpleStorage.sol
   ```

3. **Compile the contract with Foundry:**
   ```bash
   forge build
   ```

4. **Deploy the contract using Foundry:**
   ```bash
   forge create examples/SimpleStorage.sol:SimpleStorage \
     --rpc-url https://sepolia.infura.io/v3/$INFURA_PROJECT_ID \
     --private-key $PRIVATE_KEY \
     --constructor-args 42
   ```
   
   Save the deployed contract address for verification.

5. **Verify the contract:**
   
   **Option A: Using Foundry's built-in verification:**
   ```bash
   forge verify-contract <CONTRACT_ADDRESS> \
     examples/SimpleStorage.sol:SimpleStorage \
     --chain-id 11155111 \
     --constructor-args $(cast abi-encode "constructor(uint256)" 42) \
     --etherscan-api-key $ETHERSCAN_API_KEY
   ```
   
   **Option B: Using this project's verification tool:**
   ```bash
   npm run verify -- \
     --address <CONTRACT_ADDRESS> \
     --source ./examples/SimpleStorage.sol \
     --name SimpleStorage \
     --compiler v0.8.20+commit.a1b79de6 \
     --network sepolia \
     --optimization 1 \
     --runs 200 \
     --constructor-args <encoded-args>
   ```

6. **Study the verification script:**
   ```bash
   cat examples/verify-example.js
   ```

## Command Line Verification

Alternatively, you can verify contracts directly from the command line:

```bash
npm run verify -- \
  --address 0xYourContractAddress \
  --source ./examples/SimpleStorage.sol \
  --name SimpleStorage \
  --compiler v0.8.20+commit.a1b79de6 \
  --network sepolia \
  --optimization 1 \
  --runs 200 \
  --constructor-args <ABI-encoded-args>
```

## Getting Constructor Arguments

If your contract has constructor arguments, you need to ABI-encode them.

**Using Foundry's Cast:**
```bash
# For SimpleStorage(uint256 initialValue)
cast abi-encode "constructor(uint256)" 42
```

**Using this project's helper function:**
```javascript
const { encodeConstructorArgs } = require('./verify-contract.js');

// For SimpleStorage(uint256 initialValue)
const encoded = encodeConstructorArgs(['uint256'], ['42']);
console.log(encoded); // Use this for --constructor-args
```

## Finding the Compiler Version

To find the exact compiler version used during deployment:

- **Foundry:** Check `foundry.toml` or build artifacts in `out/`
- **Hardhat:** Check `hardhat.config.js` or build artifacts in `artifacts/`
- **Remix:** Check the compiler version in the Remix sidebar

The format should be like: `v0.8.20+commit.a1b79de6`

## Testing with Foundry

Foundry provides powerful testing capabilities for your smart contracts. Here's how to write and run tests:

### Creating a Test File

Create a test file in the `examples/` directory (e.g., `SimpleStorage.t.sol`):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;
    address public owner;

    function setUp() public {
        owner = address(this);
        simpleStorage = new SimpleStorage(42);
    }

    function testInitialValue() public {
        assertEq(simpleStorage.get(), 42);
    }

    function testSetValue() public {
        simpleStorage.set(100);
        assertEq(simpleStorage.get(), 100);
    }

    function testOnlyOwnerCanSet() public {
        vm.prank(address(0x123));
        vm.expectRevert("Only owner can set value");
        simpleStorage.set(200);
    }
}
```

### Running Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testInitialValue

# Run with gas report
forge test --gas-report
```

### Using Anvil (Local Testnet)

Start a local Ethereum node for testing:

```bash
# Start Anvil
anvil

# Deploy to local network
forge create examples/SimpleStorage.sol:SimpleStorage \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --constructor-args 42
```

## Troubleshooting

If verification fails, check:

1. **Contract address** - Make sure it's the correct deployed address
2. **Compiler version** - Must exactly match the deployment compiler
3. **Optimization settings** - Must match deployment settings (enabled/disabled and run count)
4. **Constructor arguments** - Must be correctly ABI-encoded
5. **Source code** - Must exactly match the deployed bytecode
6. **API key** - Must be valid and have sufficient requests remaining

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/) - Complete Foundry documentation
- [Foundry GitHub](https://github.com/foundry-rs/foundry) - Source code and issues
- [Etherscan API Documentation](https://docs.etherscan.io/api-endpoints/contracts)
- [Solidity ABI Specification](https://docs.soliditylang.org/en/latest/abi-spec.html)
- [Foundry Verification Guide](https://book.getfoundry.sh/forge/deploying)
