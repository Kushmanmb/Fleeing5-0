# kywmahmb

A slot machine game with performance optimizations.

## Getting Started

### Prerequisites

- Node.js (version 18.x, 20.x, or 22.x)
- npm (comes with Node.js)

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
npm install
```

### Building the Project

Build the project to create distribution files:
```bash
npm run build
```

This will copy all necessary files from `src/` to `dist/` directory.

Alternatively, you can use Webpack to bundle the project:
```bash
npm run webpack
```

### Running the Game

After building, open `dist/index.html` in a web browser to play the game.

For development, you can also open `src/index.html` directly in a web browser.

### Running Tests

Run the test suite to verify game logic:
```bash
npm test
```

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

This project uses GitHub Actions for continuous integration and deployment. The following workflows are configured:

### Node.js CI
Runs on every push and pull request to the `main` branch.
- Tests the project on Node.js versions 18.x, 20.x, and 22.x
- Installs dependencies, builds the project, and runs tests
- Uploads build artifacts for the Node.js 20.x build

### Webpack Build
Runs on every push and pull request to the `main` branch.
- Builds the project using Webpack across multiple Node.js versions
- Uploads webpack bundle artifacts for the Node.js 20.x build

### Code Quality
Runs on every push and pull request to the `main` branch.
- Checks JavaScript files for syntax errors
- Validates JSON configuration files
- Runs security audits with `npm audit`
- Checks for outdated dependencies

### Release
Triggered when a version tag (e.g., `v1.0.0`) is pushed.
- Runs tests and builds the project
- Creates a distribution archive
- Generates a changelog from git commits
- Creates a GitHub release with the built artifacts

### Dependabot
Automatically checks for dependency updates:
- npm dependencies: Weekly on Mondays
- GitHub Actions: Monthly
- Creates pull requests for outdated dependencies

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request using our PR template

### Reporting Issues

- Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template for bugs
- Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template for new features
- For questions, use [GitHub Discussions](https://github.com/Kushmanmb/kywmahmb/discussions)

### Code Style

- Follow existing code conventions
- Maintain performance optimizations (DOM caching, DocumentFragment usage, etc.)
- Add tests for new features
- Update documentation as needed

## Git Configuration

This project uses:
- `.gitattributes` for consistent line endings and binary file handling
- `.gitignore` for excluding build artifacts, dependencies, and IDE files
- Dependabot for automated dependency updates
