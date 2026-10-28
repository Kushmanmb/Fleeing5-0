# Fleeing 5-0

Fleeing 5-0 is a browser-based slot machine game built with vanilla JavaScript and optimized for fast DOM updates. A bonus is triggered when the board contains a `PRISONER` on the leftmost reel, a `ROBBER` on the rightmost reel, and a `COP` on one of the middle reels.

> For ownership and attribution details, see [OWNERSHIP.md](OWNERSHIP.md).

## Features

- 6x5 slot grid with randomized symbols
- Shared symbol catalog with ids, values, types, and image metadata
- Bonus detection for the PRISONER / COP / ROBBER pattern
- Performance-focused rendering with cached DOM references and batched updates
- Optional Ethereum tooling for contract verification and a testnet USDC faucet

## Getting Started

### Prerequisites

- Node.js 18.x, 20.x, or 22.x
- npm or yarn

### Installation

The game title is **Fleeing 5-0** and the GitHub repository slug is `Fleeing5-0`.

```bash
git clone https://github.com/Kushmanmb/Fleeing5-0.git fleeing-5-0
cd fleeing-5-0
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

After `npm run build`, open `dist/index.html` in a browser.

For quick source-only browser checks without rebuilding, you can also open `src/index.html` directly.

## How the Bonus Works

The CHAYSE bonus triggers when all of the following appear anywhere on the board:

- `PRISONER` in column `0` (leftmost), in any row
- `ROBBER` in column `4` (rightmost), in any row
- `COP` in any middle column (`1`, `2`, or `3`), in any row

The symbols may be in different rows (vertical position does not matter). Outcomes are produced by the Stake Engine RGS; see [math/SPEC.md](math/SPEC.md) for the game math, generated-file workflow (`npm run math:generate`), RGS integration and approval blockers.

## Optional Ethereum Tooling

This repository also includes Node.js utilities for Ethereum testnet workflows.

### Contract Verification

The verification utility is implemented in the repository root as `verify-contract.js`. The `--source` argument should point to your contract source file.

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

This starts the local faucet API. Send a `POST` request to `/faucet` with a JSON body containing an `address` field to request tokens.

The Sepolia testnet USDC faucet enforces a **12 hour cooldown** per address.

## Documentation

- [CODING_GUIDELINES.md](CODING_GUIDELINES.md)
- [OWNERSHIP.md](OWNERSHIP.md)
- [CODEOWNERS](CODEOWNERS)
- [.github/DEVELOPMENT_INFRASTRUCTURE.md](.github/DEVELOPMENT_INFRASTRUCTURE.md)
- [.github/rulesets/README.md](.github/rulesets/README.md)

## License

This project is licensed under the proprietary terms in [LICENSE](LICENSE). Authorization from kushmanmb is required before using, copying, modifying, or distributing the software.
