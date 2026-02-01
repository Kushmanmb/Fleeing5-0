# Contract Verification Examples

This directory contains examples demonstrating how to use the contract verification tool.

## Files

- **SimpleStorage.sol** - A simple example smart contract
- **verify-example.js** - Example script showing programmatic verification
- **create-project.js** - Script to create a new base project with verification tools
- **setup-new-project.md** - Comprehensive guide for setting up a new project

## Quick Start: Create a New Project

To quickly scaffold a new project with all the verification tools:

```bash
# Run from the repository root
node examples/create-project.js my-base-project
cd my-base-project
npm install
```

Or manually:

```bash
mkdir my-base-project && cd my-base-project
```

Then follow the detailed guide in [setup-new-project.md](./setup-new-project.md).

## Using the Example

1. **Review the example contract:**
   ```bash
   cat examples/SimpleStorage.sol
   ```

2. **Study the verification script:**
   ```bash
   cat examples/verify-example.js
   ```

3. **Deploy your contract** (using Foundry, Hardhat, or other tools)

4. **Update the example script** with your deployment details:
   - Contract address
   - Compiler version used
   - Constructor arguments
   - Network

5. **Run the verification:**
   ```bash
   node examples/verify-example.js
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

If your contract has constructor arguments, you need to ABI-encode them. The verification tool provides a helper function:

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

## Troubleshooting

If verification fails, check:

1. **Contract address** - Make sure it's the correct deployed address
2. **Compiler version** - Must exactly match the deployment compiler
3. **Optimization settings** - Must match deployment settings (enabled/disabled and run count)
4. **Constructor arguments** - Must be correctly ABI-encoded
5. **Source code** - Must exactly match the deployed bytecode
6. **API key** - Must be valid and have sufficient requests remaining

## Additional Resources

- [Etherscan API Documentation](https://docs.etherscan.io/api-endpoints/contracts)
- [Solidity ABI Specification](https://docs.soliditylang.org/en/latest/abi-spec.html)
- [Foundry Verification Guide](https://book.getfoundry.sh/forge/deploying)
