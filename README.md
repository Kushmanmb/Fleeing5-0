# kywmahmb

A slot machine game with performance optimizations and Ethereum testnet integration.

> **Note**: For ownership and attribution information, see [OWNERSHIP.md](OWNERSHIP.md)

## Documentation

- 📋 [Coding Guidelines](CODING_GUIDELINES.md) - Comprehensive coding standards and best practices
- 🏗️ [Development Infrastructure](.github/DEVELOPMENT_INFRASTRUCTURE.md) - CI/CD, templates, and tooling guide
- 📝 [Configuration Templates](.github/) - Templates for roles, communication, and guidelines

## Getting Started

### Prerequisites

- Node.js (version 18.x, 20.x, or 22.x)
- npm or yarn package manager
- Foundry (for smart contract development and deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kushmanmb/kywmahmb.git
```

2. Navigate to the project directory:
```bash
cd kywmahmb
```

3. Install dependencies:
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

4. (Optional) Install Foundry for smart contract development:
```bash
# Run the setup script
./setup-foundry.sh

# Or install manually
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Building the Project

Build the project to create distribution files:
```bash
# Using npm
npm run build

# Or using yarn
yarn build
```

This will copy all necessary files from `src/` to `dist/` directory.

Alternatively, you can use Webpack to bundle the project:
```bash
# Using npm
npm run webpack

# Or using yarn
yarn webpack
```

### Running the Game

After building, open `dist/index.html` in a web browser to play the game.

For development, you can also open `src/index.html` directly in a web browser.

### Running Tests

Run the test suite to verify game logic:
```bash
# Using npm
npm test

# Or using yarn
yarn test
```

## Smart Contract Development with Foundry

This project includes Solidity smart contracts and supports Foundry for development and testing.

### Installing Foundry

Foundry is a fast, portable, and modular toolkit for Ethereum application development. To install:

**Option 1: Use the setup script (recommended)**
```bash
./setup-foundry.sh
```

**Option 2: Manual installation**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

After installation, verify with:
```bash
forge --version
cast --version
anvil --version
```

### Working with Smart Contracts

The repository includes example contracts in the `examples/` directory. Foundry configuration is provided in `foundry.toml`.

**Compile contracts:**
```bash
forge build
```

**Run contract tests:**
```bash
forge test
```

**Deploy a contract:**
```bash
forge create examples/SimpleStorage.sol:SimpleStorage \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args 42
```

**Verify on Etherscan:**
```bash
# Using Foundry
forge verify-contract <CONTRACT_ADDRESS> \
  examples/SimpleStorage.sol:SimpleStorage \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Or using the built-in verification tool
npm run verify -- --address <CONTRACT_ADDRESS> \
  --source ./examples/SimpleStorage.sol \
  --name SimpleStorage \
  --compiler v0.8.20+commit.a1b79de6 \
  --network sepolia
```

For more examples, see the [examples/README.md](examples/README.md) file.

## Contract Verification

This repository includes a contract verification tool that allows you to verify smart contracts on Etherscan and other block explorers.

### Prerequisites

- Etherscan API key (get one from [https://etherscan.io/myapikey](https://etherscan.io/myapikey))
- Contract source code
- Deployment details (compiler version, optimization settings, constructor arguments)

### Setup

Add your Etherscan API key to the `.env` file:
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Usage

Verify a deployed contract:
```bash
npm run verify -- \
  --address 0x1234567890abcdef1234567890abcdef12345678 \
  --source ./contracts/MyContract.sol \
  --name MyContract \
  --compiler v0.8.20+commit.a1b79de6 \
  --network sepolia \
  --optimization 1 \
  --runs 200
```

### Command Line Options

- `--address` - Contract address (required)
- `--source` - Path to source code file (required)
- `--name` - Contract name (required)
- `--compiler` - Solidity compiler version (required)
- `--network` - Network name (default: sepolia)
- `--optimization` - Optimization enabled: 0 or 1 (default: 1)
- `--runs` - Number of optimization runs (default: 200)
- `--constructor-args` - ABI-encoded constructor arguments (optional)
- `--api-key` - Etherscan API key (optional, uses ETHERSCAN_API_KEY env var)

### Supported Networks

- Ethereum: `mainnet`, `sepolia`, `holesky`
- Polygon: `polygon`, `amoy`
- Arbitrum: `arbitrum`
- Optimism: `optimism`
- BSC: `bsc`, `bscTestnet`

### Example with Constructor Arguments

If your contract has constructor arguments, you'll need to ABI-encode them. The verification tool includes a helper function:

```javascript
const { encodeConstructorArgs } = require('./verify-contract.js');

// For a constructor like: constructor(address _owner, uint256 _value)
const encoded = encodeConstructorArgs(
  ['address', 'uint256'],
  ['0x1234...', '1000000000000000000']
);

console.log(encoded); // Use this value for --constructor-args
```

### Programmatic Usage

You can also use the verification tool as a module in your Node.js scripts:

```javascript
const { verifyContract } = require('./verify-contract.js');

const result = await verifyContract({
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  sourceCode: fs.readFileSync('./contracts/MyContract.sol', 'utf8'),
  contractName: 'MyContract',
  compilerVersion: 'v0.8.20+commit.a1b79de6',
  optimizationUsed: 1,
  runs: 200,
  network: 'sepolia',
  apiKey: process.env.ETHERSCAN_API_KEY,
});

if (result.success) {
  console.log('Verified!', result.explorerUrl);
} else {
  console.error('Failed:', result.error);
}
```

## Etherscan API v2 Queries

This repository includes a tool for querying Etherscan API v2, which allows you to retrieve blockchain data such as block numbers, account balances, and more.

### Prerequisites

- Etherscan API key (get one from [https://etherscan.io/myapikey](https://etherscan.io/myapikey))

### Setup

Add your Etherscan API key to the `.env` file:
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Getting Current Block Number

The most common use case is getting the current block number for a chain:

```bash
# Get current block number for mainnet
npm run etherscan:block -- mainnet

# Get current block number for sepolia
npm run etherscan:block -- sepolia

# Get current block number for holesky
npm run etherscan:block -- holesky
```

### Advanced Queries

For more advanced queries, use the full query interface:

```bash
# Get block number using chain ID
node etherscan-query.js --chainid 1 --module proxy --action eth_blockNumber

# Query with custom API key
node etherscan-query.js --chainid 11155111 --module proxy --action eth_blockNumber --api-key YOUR_API_KEY
```

### Supported Networks

- **Mainnet** (Chain ID: 1)
- **Sepolia** (Chain ID: 11155111)
- **Holesky** (Chain ID: 17000)

### Using cURL (Direct API Access)

You can also query the Etherscan API v2 directly using cURL:

```bash
# Get current block number for mainnet
curl "https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken"

# Response format:
# {"status":"1","message":"OK","result":"0x..."}
```

The result is returned in hexadecimal format. To convert to decimal:
```bash
# Example: 0x1234567 = 19088743
echo $((0x1234567))
```

### Programmatic Usage

You can also use the query tool as a module in your Node.js scripts:

```javascript
const { getBlockNumber, queryEtherscan } = require('./etherscan-query.js');

// Get block number for a network
const result = await getBlockNumber('mainnet');
console.log(`Current block: ${result.blockNumber}`);

// Advanced query
const response = await queryEtherscan({
  chainid: 1,
  module: 'proxy',
  action: 'eth_blockNumber',
  apiKey: process.env.ETHERSCAN_API_KEY,
});
console.log(response);
```

For more examples and detailed usage, see [ETHERSCAN_EXAMPLES.md](ETHERSCAN_EXAMPLES.md).

## USDC Faucet Server

This repository also includes a USDC faucet server for dispensing USDC tokens on Ethereum testnet.

### Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your `.env` file with:
   - `INFURA_PROJECT_ID`: Your Infura project ID
   - `PRIVATE_KEY`: Private key of the wallet that will dispense USDC
   - `USDC_CONTRACT_ADDRESS`: Address of the USDC contract on your testnet (Sepolia, Goerli, etc.)
   - `ETHERSCAN_API_KEY`: Your Etherscan API key for contract verification (optional, only needed if using verification feature)

### Running the Faucet

Start the faucet server:
```bash
npm run faucet
```

The server will run at `http://localhost:3000`.

### API Endpoints

**POST /faucet**

Request USDC tokens from the faucet.

Request body:
```json
{
  "address": "0x..."
}
```

Response (success):
```json
{
  "message": "USDC dispensed successfully!"
}
```

Responses (error):
- `400`: Invalid or missing address
- `429`: Cooldown in effect (48 hour between requests)
- `500`: Faucet out of funds or transfer error

### Faucet Configuration

- **Network**: Sepolia testnet (configurable via Infura)
- **Dispense Amount**: 1 USDC per request
- **Cooldown**: 12 hour between requests per address
- **USDC Contract**: Configurable via `USDC_CONTRACT_ADDRESS` environment variable

## Performance Improvements

The code has been optimized with the following improvements:

1. **DOM Element Caching** - Frequently accessed DOM elements are cached to avoid repeated `getElementById` calls
2. **DocumentFragment Usage** - DOM operations are batched using DocumentFragment to reduce reflows and repaints
3. **Cell Reference Caching** - Cell elements are stored during creation to avoid `querySelectorAll` calls
4. **Optimized Loop Logic** - Single loop in `checkBonusTrigger` instead of multiple `some()` calls with early exit
5. **Spin Debouncing** - Prevents multiple simultaneous spins with `isSpinning` flag

## Project Structure

```
fleeing-5-0/
├── src/                 # Source files
│   ├── main.js          # Main game logic
│   ├── index.html       # HTML structure
│   ├── style.css        # Styles
│   └── siren.mp3        # Sound effect
├── dist/                # Build output (generated)
├── faucet.js            # USDC faucet server
├── test.js              # Test suite
├── build.js             # Build script
├── webpack.config.js    # Webpack configuration
└── package.json         # Project dependencies
```

## Development

To work on the project:

1. Make changes to files in the `src/` directory
2. Build the project with `npm run build`
3. Run tests with `npm test` to verify functionality
4. Open `dist/index.html` in a browser to test the game

## CI/CD Workflows

This repository uses GitHub Actions for continuous integration and deployment:

- **Node.js CI**: Runs tests and builds on Node.js versions 18.x, 20.x, and 22.x
- **Webpack Build**: Builds the project using Webpack
- **GitHub Pages**: Automatically deploys the game to GitHub Pages on push to main branch

The game is available online at: [https://kushmanmb.github.io/kywmahmb/](https://kushmanmb.github.io/kywmahmb/)

## Ownership

For information about project ownership, component attribution, and licensing, please see [OWNERSHIP.md](OWNERSHIP.md).

Code ownership is managed through the [CODEOWNERS](CODEOWNERS) file.
