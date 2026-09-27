# Ownership and Attribution

## Project Ownership

This project is owned and maintained by **kushmanmb** (GitHub: @Kushmanmb).

## Repository Information

- **Repository**: [Kushmanmb/kywmahmb](https://github.com/Kushmanmb/kywmahmb)
- **Original Name**: fleeing-5-0
- **License**: Proprietary - Authorization Required (see LICENSE file)
- **Author**: kushmanmb

## Component Ownership

### Slot Machine Game
The core slot machine game ("Fleeing 5-0") is an original creation by kushmanmb, featuring:
- Performance-optimized JavaScript code
- Interactive game logic with bonus triggers
- Sound effects and visual feedback

### Ethereum Components

#### USDC Faucet Server
- **File**: `faucet.js`
- **Owner**: kushmanmb
- **Purpose**: Dispenses USDC tokens on Ethereum testnet (Sepolia)
- **Technology**: 
  - Express.js server
  - ethers.js v5 for Ethereum interaction
  - Infura provider for blockchain connectivity

**Note**: This faucet is designed for testnet use only. The smart contracts it interacts with are on Ethereum testnets, not mainnet.

#### Etherscan Integration
- **File**: `ethscab` (shell script)
- **Owner**: kushmanmb
- **Purpose**: Etherscan API query template for blockchain data retrieval
- **Note**: This is a curl command template for interacting with Etherscan API v2

## Third-Party Dependencies

This project uses the following third-party libraries:

### Production Dependencies
- **ethers** (v5.7.2): Ethereum wallet and contract interaction
- **express** (v4.18.2): Web server framework
- **dotenv** (v16.3.1): Environment variable management

### Development Dependencies
- **webpack** (v5.89.0): Module bundler
- **webpack-cli** (v5.1.4): Webpack command-line interface

## External Services

### Ethereum Network
- **Network**: Sepolia Testnet
- **Provider**: Infura (requires API key)
- **Contract**: USDC token contract (testnet version)

### APIs Used
- **Etherscan API**: For blockchain data queries

## Contributing

All contributions to this project are subject to review and approval by the project owner. 

**Important**: This project is under a proprietary license that requires authorization from kushmanmb for use. By contributing, you agree that:
- Your contributions will be subject to the same proprietary license terms
- You have the right to contribute the code
- kushmanmb retains all rights to the project and contributions

For authorization to use or contribute to this project, please contact kushmanmb through GitHub.

## Contact

For questions about ownership, licensing, or contributions, please contact the project owner through GitHub.

## Disclaimer

This project includes components that interact with Ethereum blockchain testnets. The ownership documented here refers to the codebase and its original implementations, not to any blockchain addresses, smart contracts deployed by users, or tokens transferred through the faucet.

The term "ethereum.org" or similar references in this documentation refer to the Ethereum blockchain technology and ecosystem, which is an open-source, decentralized platform. This project is not affiliated with or endorsed by the Ethereum Foundation.
