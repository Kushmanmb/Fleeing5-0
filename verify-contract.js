require('dotenv').config();
const https = require('https');
const { ethers } = require('ethers');

// Network configurations
const NETWORKS = {
  mainnet: 'https://api.etherscan.io/api',
  sepolia: 'https://api-sepolia.etherscan.io/api',
  holesky: 'https://api-holesky.etherscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
  amoy: 'https://api-amoy.polygonscan.com/api',
  arbitrum: 'https://api.arbiscan.io/api',
  optimism: 'https://api-optimistic.etherscan.io/api',
  bsc: 'https://api.bscscan.com/api',
  bscTestnet: 'https://api-testnet.bscscan.com/api',
};

/**
 * Verify a smart contract on Etherscan-based block explorers
 * 
 * @param {Object} options - Verification options
 * @param {string} options.contractAddress - The deployed contract address
 * @param {string} options.sourceCode - The Solidity source code
 * @param {string} options.contractName - The contract name (e.g., "MyContract")
 * @param {string} options.compilerVersion - The compiler version (e.g., "v0.8.20+commit.a1b79de6")
 * @param {number} options.optimizationUsed - 0 or 1 (whether optimization was enabled)
 * @param {number} options.runs - Number of optimization runs (default: 200)
 * @param {string} options.constructorArguments - ABI-encoded constructor arguments (optional)
 * @param {string} options.network - Network name (default: 'sepolia')
 * @param {string} options.apiKey - Etherscan API key (optional, uses env var if not provided)
 * @returns {Promise<Object>} - Verification result
 */
async function verifyContract(options) {
  const {
    contractAddress,
    sourceCode,
    contractName,
    compilerVersion,
    optimizationUsed = 1,
    runs = 200,
    constructorArguments = '',
    network = 'sepolia',
    apiKey = process.env.ETHERSCAN_API_KEY,
  } = options;

  // Validate required parameters
  if (!contractAddress) {
    throw new Error('Contract address is required');
  }
  if (!ethers.isAddress(contractAddress)) {
    throw new Error('Invalid contract address format');
  }
  if (!sourceCode) {
    throw new Error('Source code is required');
  }
  if (!contractName) {
    throw new Error('Contract name is required');
  }
  if (!compilerVersion) {
    throw new Error('Compiler version is required');
  }
  if (!apiKey) {
    throw new Error('Etherscan API key is required. Set ETHERSCAN_API_KEY environment variable.');
  }
  
  // Validate optimization settings
  if (optimizationUsed !== 0 && optimizationUsed !== 1) {
    throw new Error('optimizationUsed must be 0 (disabled) or 1 (enabled)');
  }
  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error('runs must be a positive integer (typically 1-200)');
  }

  const apiUrl = NETWORKS[network];
  if (!apiUrl) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(NETWORKS).join(', ')}`);
  }

  console.log(`Verifying contract ${contractAddress} on ${network}...`);
  console.log(`Contract name: ${contractName}`);
  console.log(`Compiler version: ${compilerVersion}`);
  console.log(`Optimization: ${optimizationUsed ? 'enabled' : 'disabled'} (runs: ${runs})`);

  // Prepare verification request data
  const postData = new URLSearchParams({
    apikey: apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: contractName,
    compilerversion: compilerVersion,
    optimizationUsed: optimizationUsed.toString(),
    runs: runs.toString(),
    // Note: Etherscan API intentionally uses the misspelling "constructorArguements"
    // (with 'ue' instead of 'u'). This is not a typo in our code - it's required by the API.
    // See: https://docs.etherscan.io/api-endpoints/contracts#verify-source-code
    constructorArguements: constructorArguments,
  }).toString();

  // Submit verification request
  try {
    const submitResult = await makeRequest(apiUrl, postData);
    
    if (submitResult.status !== '1') {
      throw new Error(`Verification submission failed: ${submitResult.result}`);
    }

    const guid = submitResult.result;
    console.log(`Verification submitted. GUID: ${guid}`);
    console.log('Waiting for verification result...');

    // Poll for verification status
    const verificationResult = await pollVerificationStatus(apiUrl, apiKey, guid);
    
    if (verificationResult.status === '1') {
      console.log('✓ Contract verified successfully!');
      console.log(`View on explorer: ${getExplorerUrl(network, contractAddress)}`);
      return {
        success: true,
        message: 'Contract verified successfully',
        explorerUrl: getExplorerUrl(network, contractAddress),
      };
    } else {
      throw new Error(`Verification failed: ${verificationResult.result}`);
    }
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Make HTTPS POST request to Etherscan API
 */
function makeRequest(url, postData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Poll Etherscan API for verification status
 */
async function pollVerificationStatus(apiUrl, apiKey, guid, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between polls

    const statusUrl = `${apiUrl}?module=contract&action=checkverifystatus&guid=${guid}&apikey=${apiKey}`;
    
    try {
      const response = await new Promise((resolve, reject) => {
        https.get(statusUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error(`Failed to parse response: ${data}`));
            }
          });
        }).on('error', reject);
      });

      // Check if verification is complete (success or failure)
      if (response.result !== 'Pending in queue') {
        return response;
      }

      console.log(`Attempt ${i + 1}/${maxAttempts}: Still pending...`);
    } catch (error) {
      console.error(`Error checking status: ${error.message}`);
    }
  }

  throw new Error('Verification timed out. Check status manually on the explorer.');
}

/**
 * Get explorer URL for a contract address
 */
function getExplorerUrl(network, address) {
  const explorers = {
    mainnet: 'https://etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    holesky: 'https://holesky.etherscan.io',
    polygon: 'https://polygonscan.com',
    amoy: 'https://amoy.polygonscan.com',
    arbitrum: 'https://arbiscan.io',
    optimism: 'https://optimistic.etherscan.io',
    bsc: 'https://bscscan.com',
    bscTestnet: 'https://testnet.bscscan.com',
  };

  const explorerBase = explorers[network] || 'https://etherscan.io';
  return `${explorerBase}/address/${address}#code`;
}

/**
 * Encode constructor arguments for verification
 * 
 * @param {Array} types - Array of Solidity types (e.g., ['address', 'uint256'])
 * @param {Array} values - Array of values matching the types
 * @returns {string} - ABI-encoded constructor arguments (without 0x prefix)
 */
function encodeConstructorArgs(types, values) {
  if (types.length !== values.length) {
    throw new Error('Types and values arrays must have the same length');
  }
  
  if (types.length === 0) {
    return '';
  }

  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
  // Remove '0x' prefix as Etherscan expects it without
  return encoded.slice(2);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Contract Verification Tool

Usage:
  node verify-contract.js [options]

Options:
  --address <address>          Contract address (required)
  --source <file>              Path to source code file (required)
  --name <name>                Contract name (required)
  --compiler <version>         Compiler version, e.g., v0.8.20+commit.a1b79de6 (required)
  --network <network>          Network name (default: sepolia)
  --optimization <0|1>         Optimization enabled (default: 1)
  --runs <number>              Optimization runs (default: 200)
  --constructor-args <args>    Constructor arguments (ABI-encoded, optional)
  --api-key <key>              Etherscan API key (optional, uses ETHERSCAN_API_KEY env var)

Supported networks:
  ${Object.keys(NETWORKS).join(', ')}

Example:
  node verify-contract.js \\
    --address 0x1234567890abcdef1234567890abcdef12345678 \\
    --source ./contracts/MyContract.sol \\
    --name MyContract \\
    --compiler v0.8.20+commit.a1b79de6 \\
    --network sepolia \\
    --optimization 1 \\
    --runs 200

Environment Variables:
  ETHERSCAN_API_KEY    Etherscan API key (required if --api-key not provided)
    `);
    process.exit(0);
  }

  // Parse command line arguments
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    // Validate that value exists for this flag
    if (value === undefined || value.startsWith('--')) {
      console.error(`Error: Missing value for --${key}`);
      process.exit(1);
    }
    
    switch (key) {
      case 'address':
        options.contractAddress = value;
        break;
      case 'source':
        try {
          options.sourceCode = require('fs').readFileSync(value, 'utf8');
        } catch (error) {
          console.error(`Error: Could not read source file '${value}': ${error.message}`);
          process.exit(1);
        }
        break;
      case 'name':
        options.contractName = value;
        break;
      case 'compiler':
        options.compilerVersion = value;
        break;
      case 'network':
        options.network = value;
        break;
      case 'optimization':
        options.optimizationUsed = parseInt(value);
        break;
      case 'runs':
        options.runs = parseInt(value);
        break;
      case 'constructor-args':
        options.constructorArguments = value;
        break;
      case 'api-key':
        options.apiKey = value;
        break;
    }
  }

  // Run verification
  verifyContract(options)
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

// Export for use as module
module.exports = {
  verifyContract,
  encodeConstructorArgs,
  NETWORKS,
};
