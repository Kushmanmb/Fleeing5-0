# Setting Up a New Base Project

This guide walks you through creating a new base project that uses the contract verification and faucet tools from this repository.

## Quick Start

To create a new project with the verification tools:

```bash
mkdir my-base-project && cd my-base-project
npm init -y
npm install dotenv ethers express
```

## Project Structure

Your new project should have the following structure:

```
my-base-project/
├── .env                    # Environment variables
├── .env.example           # Example environment configuration
├── contracts/             # Your smart contracts
├── scripts/               # Deployment and utility scripts
├── package.json           # Project dependencies
└── README.md             # Project documentation
```

## Step-by-Step Setup

### 1. Create Project Directory

```bash
mkdir my-base-project
cd my-base-project
```

### 2. Initialize Node.js Project

```bash
npm init -y
```

### 3. Install Dependencies

```bash
npm install dotenv ethers@^5.7.2 express
```

### 4. Copy Verification Tools

Copy the verification tool from this repository:

```bash
# If you cloned kywmahmb repository
cp /path/to/kywmahmb/verify-contract.js ./
```

Or download it directly:

```bash
curl -O https://raw.githubusercontent.com/Kushmanmb/kywmahmb/main/verify-contract.js
```

### 5. Set Up Environment Variables

Create a `.env` file:

```bash
# .env
ETHERSCAN_API_KEY=your_etherscan_api_key_here
INFURA_PROJECT_ID=your_infura_project_id_here
PRIVATE_KEY=your_private_key_here
```

Create a `.env.example` file:

```bash
# .env.example
ETHERSCAN_API_KEY=
INFURA_PROJECT_ID=
PRIVATE_KEY=
```

### 6. Create Contracts Directory

```bash
mkdir contracts
```

### 7. Create a Sample Contract

Create `contracts/MyContract.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    uint256 public value;
    
    constructor(uint256 initialValue) {
        value = initialValue;
    }
    
    function setValue(uint256 newValue) public {
        value = newValue;
    }
}
```

### 8. Create Deployment Script

Create `scripts/deploy.js`:

```javascript
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
    // Connect to network
    const provider = new ethers.providers.InfuraProvider(
        'sepolia',
        process.env.INFURA_PROJECT_ID
    );
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Read contract source
    const source = fs.readFileSync('./contracts/MyContract.sol', 'utf8');
    
    // TODO: Add compilation and deployment logic
    console.log('Deploy your contract here');
}

main().catch(console.error);
```

### 9. Create Verification Script

Create `scripts/verify.js`:

```javascript
require('dotenv').config();
const fs = require('fs');
const { verifyContract, encodeConstructorArgs } = require('../verify-contract.js');

async function main() {
    const sourceCode = fs.readFileSync('./contracts/MyContract.sol', 'utf8');
    
    // Encode constructor arguments
    const constructorArgs = encodeConstructorArgs(
        ['uint256'],  // Types
        ['42']        // Values - update with your actual values
    );
    
    const result = await verifyContract({
        contractAddress: '0xYourContractAddress', // Update this
        sourceCode: sourceCode,
        contractName: 'MyContract',
        compilerVersion: 'v0.8.20+commit.a1b79de6', // Update to match deployment
        optimizationUsed: 1,
        runs: 200,
        constructorArguments: constructorArgs,
        network: 'sepolia',
        apiKey: process.env.ETHERSCAN_API_KEY,
    });
    
    if (result.success) {
        console.log('✓ Contract verified!');
        console.log('View at:', result.explorerUrl);
    } else {
        console.error('✗ Verification failed:', result.error);
    }
}

main().catch(console.error);
```

### 10. Update package.json

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "deploy": "node scripts/deploy.js",
    "verify": "node scripts/verify.js"
  }
}
```

## Usage

### Deploy Your Contract

```bash
npm run deploy
```

### Verify Your Contract

After deployment, update the contract address in `scripts/verify.js` and run:

```bash
npm run verify
```

### Command Line Verification

You can also verify directly from the command line:

```bash
node verify-contract.js \
  --address 0xYourContractAddress \
  --source ./contracts/MyContract.sol \
  --name MyContract \
  --compiler v0.8.20+commit.a1b79de6 \
  --network sepolia \
  --optimization 1 \
  --runs 200
```

## Optional: Setting Up a Faucet

If you want to run a token faucet for your project:

### 1. Copy Faucet Script

```bash
cp /path/to/kywmahmb/faucet.js ./
```

### 2. Add Faucet Configuration to .env

```bash
# Add to .env
USDC_CONTRACT_ADDRESS=your_token_contract_address
```

### 3. Add Faucet Script to package.json

```json
{
  "scripts": {
    "faucet": "node faucet.js"
  }
}
```

### 4. Run the Faucet

```bash
npm run faucet
```

The faucet will be available at `http://localhost:3000`.

## Best Practices

1. **Never commit `.env`** - Add it to `.gitignore`
2. **Use `.env.example`** - Document required environment variables
3. **Test on testnet first** - Always test on Sepolia or other testnets
4. **Verify compiler version** - Must exactly match deployment
5. **Keep private keys secure** - Never share or commit them

## Troubleshooting

### Verification Fails

- Check that the compiler version matches exactly
- Verify optimization settings match deployment
- Ensure constructor arguments are correctly encoded
- Confirm the contract address is correct

### Deployment Issues

- Ensure you have enough ETH for gas
- Check that your private key is correct
- Verify network connectivity
- Confirm Infura project ID is valid

## Additional Resources

- [Etherscan Verification API](https://docs.etherscan.io/api-endpoints/contracts)
- [Ethers.js Documentation](https://docs.ethers.org/v5/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## Need Help?

See the [examples directory](./README.md) for more examples and detailed guides.
