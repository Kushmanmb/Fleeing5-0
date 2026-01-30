require('dotenv').config();
const https = require('https');

// Etherscan API v2 base URL
const ETHERSCAN_API_V2 = 'https://api.etherscan.io/v2/api';

// Chain ID mappings for Etherscan API v2
const CHAIN_IDS = {
  mainnet: 1,
  sepolia: 11155111,
  holesky: 17000,
};

// Network names for convenience
const NETWORKS = {
  1: 'mainnet',
  11155111: 'sepolia',
  17000: 'holesky',
};

/**
 * Query Etherscan API v2
 * 
 * @param {Object} options - Query options
 * @param {number} options.chainid - Chain ID (1 for mainnet, 11155111 for sepolia, etc.)
 * @param {string} options.module - API module (e.g., 'proxy', 'account', 'contract')
 * @param {string} options.action - API action (e.g., 'eth_blockNumber', 'eth_getBalance')
 * @param {string} options.apiKey - Etherscan API key (optional, uses env var if not provided)
 * @param {Object} options.params - Additional parameters for the API call (optional)
 * @returns {Promise<Object>} - API response
 */
async function queryEtherscan(options) {
  const {
    chainid,
    module,
    action,
    apiKey = process.env.ETHERSCAN_API_KEY,
    params = {},
  } = options;

  // Validate required parameters
  if (!chainid) {
    throw new Error('Chain ID is required');
  }
  if (!module) {
    throw new Error('Module is required');
  }
  if (!action) {
    throw new Error('Action is required');
  }
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Etherscan API key is required. Set ETHERSCAN_API_KEY environment variable.');
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    chainid: chainid.toString(),
    module,
    action,
    apikey: apiKey,
    ...params,
  });

  const url = `${ETHERSCAN_API_V2}?${queryParams.toString()}`;

  console.log(`Querying Etherscan API v2...`);
  console.log(`Chain ID: ${chainid} (${NETWORKS[chainid] || 'unknown'})`);
  console.log(`Module: ${module}`);
  console.log(`Action: ${action}`);
  // Note: API key is included in URL but not logged for security

  try {
    const response = await makeGetRequest(url);
    return response;
  } catch (error) {
    console.error('✗ Query failed:', error.message);
    throw error;
  }
}

/**
 * Get current block number for a chain
 * 
 * @param {number|string} chainId - Chain ID or network name (e.g., 1, 'mainnet', 'sepolia')
 * @param {string} apiKey - Etherscan API key (optional, uses env var if not provided)
 * @returns {Promise<Object>} - Response with block number
 */
async function getBlockNumber(chainId, apiKey = process.env.ETHERSCAN_API_KEY) {
  // Convert network name to chain ID if needed
  let numericChainId = chainId;
  if (typeof chainId === 'string') {
    numericChainId = CHAIN_IDS[chainId.toLowerCase()];
    if (!numericChainId) {
      throw new Error(`Unknown network: ${chainId}. Supported networks: ${Object.keys(CHAIN_IDS).join(', ')}`);
    }
  }

  const response = await queryEtherscan({
    chainid: numericChainId,
    module: 'proxy',
    action: 'eth_blockNumber',
    apiKey,
  });

  if (response.status === '1' && response.result) {
    // Convert hex block number to decimal
    const blockNumber = parseInt(response.result, 16);
    console.log(`✓ Current block number: ${blockNumber} (${response.result})`);
    
    return {
      success: true,
      blockNumber,
      blockNumberHex: response.result,
      chainId: numericChainId,
      network: NETWORKS[numericChainId] || 'unknown',
    };
  } else {
    throw new Error(`Failed to get block number: ${response.message || response.result}`);
  }
}

/**
 * Make HTTPS GET request
 * 
 * @param {string} url - Full URL to request
 * @returns {Promise<Object>} - Parsed JSON response
 */
function makeGetRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      // Check HTTP status code
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
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
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Etherscan API v2 Query Tool

Usage:
  node etherscan-query.js [options]

Options:
  --chainid <id>               Chain ID (1, 11155111, 17000) or network name (mainnet, sepolia, holesky)
  --module <module>            API module (default: proxy)
  --action <action>            API action (default: eth_blockNumber)
  --api-key <key>              Etherscan API key (optional, uses ETHERSCAN_API_KEY env var)

Convenience Commands:
  --block-number <network>     Get current block number for a network

Supported Networks:
  mainnet (Chain ID: 1)
  sepolia (Chain ID: 11155111)
  holesky (Chain ID: 17000)

Examples:
  # Get current block number for mainnet
  node etherscan-query.js --block-number mainnet

  # Get current block number for sepolia using chain ID
  node etherscan-query.js --chainid 11155111 --module proxy --action eth_blockNumber

  # Using curl (the original command from the problem statement)
  curl "https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken"

Environment Variables:
  ETHERSCAN_API_KEY    Etherscan API key (required if --api-key not provided)
    `);
    process.exit(0);
  }

  // Parse command line arguments
  let chainid;
  let module = 'proxy';
  let action = 'eth_blockNumber';
  let apiKey;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = args[i + 1];

    if (arg === '--block-number') {
      // Convenience command
      if (!value) {
        console.error('Error: --block-number requires a network name or chain ID');
        process.exit(1);
      }
      
      getBlockNumber(value, apiKey)
        .then((result) => {
          console.log('\nResult:', JSON.stringify(result, null, 2));
        })
        .catch((error) => {
          console.error('Error:', error.message);
          process.exit(1);
        });
      return;
    }

    if (arg === '--chainid') {
      // Accept both numeric chain IDs and network names
      if (isNaN(value)) {
        chainid = CHAIN_IDS[value.toLowerCase()];
        if (!chainid) {
          console.error(`Error: Unknown network '${value}'. Supported: ${Object.keys(CHAIN_IDS).join(', ')}`);
          process.exit(1);
        }
      } else {
        chainid = parseInt(value);
      }
      i++;
    } else if (arg === '--module') {
      module = value;
      i++;
    } else if (arg === '--action') {
      action = value;
      i++;
    } else if (arg === '--api-key') {
      apiKey = value;
      i++;
    }
  }

  // Validate required parameters
  if (!chainid) {
    console.error('Error: --chainid is required');
    process.exit(1);
  }

  // Execute query
  queryEtherscan({ chainid, module, action, apiKey })
    .then((response) => {
      console.log('\nResponse:', JSON.stringify(response, null, 2));
      
      // If it's a block number query, parse and display it
      if (action === 'eth_blockNumber' && response.result) {
        const blockNumber = parseInt(response.result, 16);
        console.log(`\nBlock Number (decimal): ${blockNumber}`);
        console.log(`Block Number (hex): ${response.result}`);
      }
    })
    .catch((error) => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

// Export for use as module
module.exports = {
  queryEtherscan,
  getBlockNumber,
  CHAIN_IDS,
  NETWORKS,
};
