# Fleeing 5-0

Fleeing 5-0 is a browser-based slot machine game built with vanilla JavaScript and optimized for fast DOM updates. A bonus is triggered when the board contains a `PRISONER` on the leftmost reel, a `ROBBER` on the rightmost reel, and a `COP` on one of the middle reels.

> For ownership and attribution details, see [OWNERSHIP.md](OWNERSHIP.md).

## Features

- 6x5 slot grid with randomized symbols
- Bonus detection for the PRISONER / COP / ROBBER pattern
- Performance-focused rendering with cached DOM references and batched updates
- Optional Ethereum tooling for contract verification and a testnet USDC faucet

## Getting Started

### Prerequisites

- Node.js 18.x, 20.x, or 22.x
- npm or yarn

### Installation

The game title is **Fleeing 5-0** and the repository slug is `Fleeing5-0`.

```bash
git clone https://github.com/Kushmanmb/Fleeing5-0.git
cd Fleeing5-0
npm install
```

## Available Scripts

### Build

Copy the source files into `dist/`:

```bash
npm run build
```

Create a production bundle with Webpack:

```bash
npm run webpack
```

### Test

Run the slot logic tests:

```bash
npm test
```

### Run the Game

After building, open `dist/index.html` in a browser.

For quick local development, you can also open `src/index.html` directly.

## How the Bonus Works

The bonus trigger checks each row for all of the following:

- `PRISONER` in column `0` (leftmost)
- `ROBBER` in column `4` (rightmost)
- `COP` in any middle column (`1`, `2`, or `3`)

All three conditions must appear within the same row for the bonus to trigger.

## Optional Ethereum Tooling

This repository also includes Node.js utilities for Ethereum testnet workflows.

### Contract Verification

Set an Etherscan API key in `.env`:

```bash
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

Then run:

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

### USDC Faucet Server

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in:

- `INFURA_PROJECT_ID`
- `PRIVATE_KEY`
- `USDC_CONTRACT_ADDRESS`
- `ETHERSCAN_API_KEY` (optional, only needed for verification)

```bash
npm run faucet
```

The faucet server listens on `http://localhost:3000` by default.

## Project Structure

```text
project-root/
├── src/                 # Slot game source files
├── dist/                # Build output
├── build.js             # Build script
├── faucet.js            # Testnet faucet server
├── package.json         # npm scripts and dependencies
├── test.js              # Slot logic tests
├── test-faucet.js       # Faucet tests
├── test-verify.js       # Verification tests
├── verify-contract.js   # Contract verification utility
└── webpack.config.js    # Webpack configuration
```

## Documentation

- [CODING_GUIDELINES.md](CODING_GUIDELINES.md)
- [.github/DEVELOPMENT_INFRASTRUCTURE.md](.github/DEVELOPMENT_INFRASTRUCTURE.md)
- [.github/rulesets/README.md](.github/rulesets/README.md)

## License

This project is licensed under the proprietary terms in [LICENSE](LICENSE). Authorization from kushmanmb is required before using, copying, modifying, or distributing the software.
