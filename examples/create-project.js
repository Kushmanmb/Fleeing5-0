#!/usr/bin/env node
/**
 * Script to create a new base project with verification tools
 * 
 * Usage:
 *   node create-project.js [project-name]
 *   node create-project.js my-base-project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get project name from command line or use default
const projectName = process.argv[2] || 'my-base-project';
const projectPath = path.resolve(projectName);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
  process.exit(1);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function info(message) {
  log(message, colors.blue);
}

// Check if directory already exists
if (fs.existsSync(projectPath)) {
  error(`Directory "${projectName}" already exists. Please choose a different name.`);
}

try {
  info('\n🚀 Creating new base project...\n');

  // Create project directory
  info(`Creating directory: ${projectName}`);
  fs.mkdirSync(projectPath, { recursive: true });
  success(`Created directory: ${projectName}`);

  // Create subdirectories
  const dirs = ['contracts', 'scripts'];
  dirs.forEach(dir => {
    const dirPath = path.join(projectPath, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    success(`Created directory: ${dir}/`);
  });

  // Create package.json
  info('\nCreating package.json...');
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'A project with smart contract verification tools',
    main: 'index.js',
    scripts: {
      deploy: 'node scripts/deploy.js',
      verify: 'node scripts/verify.js',
    },
    keywords: ['ethereum', 'smart-contracts', 'verification'],
    author: '',
    license: 'ISC',
    dependencies: {
      dotenv: '^16.3.1',
      ethers: '^5.7.2',
      express: '^4.18.2',
    },
  };
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  success('Created package.json');

  // Create .env.example
  info('\nCreating .env.example...');
  const envExample = `# Etherscan API Key (get from https://etherscan.io/myapikey)
ETHERSCAN_API_KEY=

# Infura Project ID (get from https://infura.io)
INFURA_PROJECT_ID=

# Private key for deployment (without 0x prefix)
PRIVATE_KEY=

# Optional: Token contract address for faucet
USDC_CONTRACT_ADDRESS=
`;
  fs.writeFileSync(path.join(projectPath, '.env.example'), envExample);
  success('Created .env.example');

  // Create .gitignore
  info('\nCreating .gitignore...');
  const gitignore = `# Environment variables
.env

# Node modules
node_modules/

# Build artifacts
dist/
build/
out/
artifacts/
cache/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
`;
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
  success('Created .gitignore');

  // Create sample contract
  info('\nCreating sample contract...');
  const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MyContract
 * @dev A simple contract to demonstrate deployment and verification
 */
contract MyContract {
    uint256 public value;
    address public owner;
    
    event ValueChanged(uint256 oldValue, uint256 newValue);
    
    constructor(uint256 initialValue) {
        value = initialValue;
        owner = msg.sender;
    }
    
    /**
     * @dev Set a new value
     * @param newValue The new value to set
     */
    function setValue(uint256 newValue) public {
        require(msg.sender == owner, "Only owner can set value");
        uint256 oldValue = value;
        value = newValue;
        emit ValueChanged(oldValue, newValue);
    }
    
    /**
     * @dev Get the current value
     */
    function getValue() public view returns (uint256) {
        return value;
    }
}
`;
  fs.writeFileSync(path.join(projectPath, 'contracts', 'MyContract.sol'), sampleContract);
  success('Created contracts/MyContract.sol');

  // Create deployment script
  info('\nCreating deployment script...');
  const deployScript = `require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
    console.log('\\n🚀 Deploying contract...\\n');
    
    // Check environment variables
    if (!process.env.INFURA_PROJECT_ID) {
        console.error('✗ INFURA_PROJECT_ID not set in .env file');
        process.exit(1);
    }
    
    if (!process.env.PRIVATE_KEY) {
        console.error('✗ PRIVATE_KEY not set in .env file');
        process.exit(1);
    }
    
    // Connect to network
    const network = process.env.NETWORK || 'sepolia';
    console.log(\`Connecting to \${network}...\\n\`);
    
    const provider = new ethers.providers.InfuraProvider(
        network,
        process.env.INFURA_PROJECT_ID
    );
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const balance = await wallet.getBalance();
    
    console.log(\`Deployer address: \${wallet.address}\`);
    console.log(\`Balance: \${ethers.utils.formatEther(balance)} ETH\\n\`);
    
    if (balance.eq(0)) {
        console.error('✗ Insufficient balance for deployment');
        process.exit(1);
    }
    
    // TODO: Add contract compilation and deployment
    // For now, this is a template. Use Hardhat, Foundry, or other tools for compilation
    
    console.log('\\n📝 Next steps:');
    console.log('1. Compile your contract using Hardhat, Foundry, or Remix');
    console.log('2. Update this script with contract ABI and bytecode');
    console.log('3. Deploy using: npm run deploy');
    console.log('4. Verify using: npm run verify\\n');
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
`;
  fs.writeFileSync(path.join(projectPath, 'scripts', 'deploy.js'), deployScript);
  success('Created scripts/deploy.js');

  // Copy verify-contract.js if it exists in parent directory
  const verifyContractSource = path.join(__dirname, '..', 'verify-contract.js');
  if (fs.existsSync(verifyContractSource)) {
    info('\nCopying verify-contract.js...');
    fs.copyFileSync(verifyContractSource, path.join(projectPath, 'verify-contract.js'));
    success('Copied verify-contract.js');
  } else {
    info('\n⚠️  verify-contract.js not found in parent directory');
    info('    You can download it from: https://raw.githubusercontent.com/Kushmanmb/kywmahmb/main/verify-contract.js');
  }

  // Create verification script
  info('\nCreating verification script...');
  const verifyScript = `require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Check if verify-contract.js exists
const verifyContractPath = path.join(__dirname, '..', 'verify-contract.js');
if (!fs.existsSync(verifyContractPath)) {
    console.error('✗ verify-contract.js not found!');
    console.log('\\nDownload it from:');
    console.log('https://raw.githubusercontent.com/Kushmanmb/kywmahmb/main/verify-contract.js');
    process.exit(1);
}

const { verifyContract, encodeConstructorArgs } = require(verifyContractPath);

async function main() {
    console.log('\\n🔍 Verifying contract...\\n');
    
    // Check environment variables
    if (!process.env.ETHERSCAN_API_KEY) {
        console.error('✗ ETHERSCAN_API_KEY not set in .env file');
        process.exit(1);
    }
    
    // Read contract source
    const sourceCode = fs.readFileSync('./contracts/MyContract.sol', 'utf8');
    
    // Encode constructor arguments
    // Update these to match your contract's constructor
    const constructorArgs = encodeConstructorArgs(
        ['uint256'],  // Types
        ['42']        // Values - update with your actual deployment values
    );
    
    console.log('Constructor arguments (ABI-encoded):', constructorArgs);
    console.log();
    
    // Update these values with your actual deployment details
    const contractAddress = '0x0000000000000000000000000000000000000000'; // REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESS
    const network = process.env.NETWORK || 'sepolia';
    
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.error('✗ Please update the contract address in scripts/verify.js');
        process.exit(1);
    }
    
    const result = await verifyContract({
        contractAddress: contractAddress,
        sourceCode: sourceCode,
        contractName: 'MyContract',
        compilerVersion: 'v0.8.20+commit.a1b79de6', // Update to match your compiler
        optimizationUsed: 1,
        runs: 200,
        constructorArguments: constructorArgs,
        network: network,
        apiKey: process.env.ETHERSCAN_API_KEY,
    });
    
    if (result.success) {
        console.log('\\n✓ Contract verified successfully!');
        console.log('View your verified contract at:', result.explorerUrl);
    } else {
        console.error('\\n✗ Verification failed:', result.error);
        console.log('\\nCommon issues:');
        console.log('- Ensure the contract address is correct');
        console.log('- Verify the compiler version matches deployment');
        console.log('- Check constructor arguments are correctly encoded');
        console.log('- Confirm your Etherscan API key is valid');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
`;
  fs.writeFileSync(path.join(projectPath, 'scripts', 'verify.js'), verifyScript);
  success('Created scripts/verify.js');

  // Create README
  info('\nCreating README.md...');
  const readme = `# ${projectName}

A smart contract project with verification tools.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy \`.env.example\` to \`.env\` and fill in your values:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Update \`.env\` with your:
   - Etherscan API key
   - Infura project ID
   - Private key (for deployment)

## Usage

### Deploy Contract

\`\`\`bash
npm run deploy
\`\`\`

### Verify Contract

After deployment, update the contract address in \`scripts/verify.js\` and run:

\`\`\`bash
npm run verify
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── contracts/           # Smart contracts
│   └── MyContract.sol
├── scripts/            # Deployment and verification scripts
│   ├── deploy.js
│   └── verify.js
├── verify-contract.js  # Contract verification tool
├── .env               # Environment variables (not committed)
├── .env.example       # Example environment configuration
├── .gitignore         # Git ignore rules
├── package.json       # Project dependencies
└── README.md          # This file
\`\`\`

## Next Steps

1. Customize \`contracts/MyContract.sol\` for your needs
2. Update \`scripts/deploy.js\` with your deployment logic
3. Compile and deploy your contract
4. Verify your contract on Etherscan

## Resources

- [Etherscan API](https://docs.etherscan.io/)
- [Ethers.js Docs](https://docs.ethers.org/v5/)
- [Solidity Docs](https://docs.soliditylang.org/)

## License

ISC
`;
  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
  success('Created README.md');

  // Success message
  log('\n' + '='.repeat(60), colors.green);
  success('Project created successfully!');
  log('='.repeat(60) + '\n', colors.green);

  info('Next steps:\n');
  log(`  cd ${projectName}`, colors.blue);
  log(`  npm install`, colors.blue);
  log(`  cp .env.example .env`, colors.blue);
  log(`  # Edit .env with your API keys`, colors.blue);
  log(`  npm run deploy`, colors.blue);
  log(`  npm run verify\n`, colors.blue);

  info('For more details, see the README.md file in your new project.\n');

} catch (err) {
  error(`Failed to create project: ${err.message}`);
}
