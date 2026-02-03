#!/usr/bin/env node
/**
 * Etherscan API Query Tool
 * Fetches comprehensive blockchain data for a given Ethereum address
 */

require('dotenv').config();
const https = require('https');

// Network configurations
const NETWORKS = {
  mainnet: 'https://api.etherscan.io/api',
  sepolia: 'https://api-sepolia.etherscan.io/api',
  holesky: 'https://api-holesky.etherscan.io/api',
};

// Parse command line arguments
const args = process.argv.slice(2);
const address = args[0];
const apiKey = args[1] || process.env.ETHERSCAN_API_KEY || '';
const network = args[2] || 'mainnet';

// Show help if requested
if (!address || address === '-h' || address === '--help' || address === 'help') {
  console.log(`
Etherscan API Query Tool

Usage: node etherscan-query.js <address> [api_key] [network]

Parameters:
  address  - Ethereum address to query (required)
  api_key  - Etherscan API key (optional, uses ETHERSCAN_API_KEY env var)
  network  - Network: mainnet, sepolia, holesky (default: mainnet)

Examples:
  node etherscan-query.js 0x1234567890123456789012345678901234567890
  node etherscan-query.js 0x1234567890123456789012345678901234567890 YOUR_API_KEY
  node etherscan-query.js 0x1234567890123456789012345678901234567890 YOUR_API_KEY sepolia

Environment Variables:
  ETHERSCAN_API_KEY - API key for Etherscan (optional)

This tool queries the following data for an address:
  - ETH Balance
  - Recent Normal Transactions
  - Recent Internal Transactions
  - Recent ERC20 Token Transfers
  - Recent ERC721 Token Transfers (NFTs)
  `);
  process.exit(0);
}

// Validate network
const apiUrl = NETWORKS[network];
if (!apiUrl) {
  console.error(`Error: Unsupported network '${network}'`);
  console.error(`Supported networks: ${Object.keys(NETWORKS).join(', ')}`);
  process.exit(1);
}

// Validate address format
if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
  console.error('Error: Invalid Ethereum address format');
  console.error('Address must be 42 characters starting with 0x');
  process.exit(1);
}

console.log('==========================================');
console.log('Etherscan API Query for Address');
console.log('==========================================');
console.log(`Network: ${network}`);
console.log(`Address: ${address}`);
if (!apiKey) {
  console.log('\nWarning: No API key provided. Using public rate limits.');
  console.log('For higher rate limits, provide an API key or set ETHERSCAN_API_KEY.\n');
}
console.log('');

/**
 * Make an HTTPS GET request to the API
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Query API endpoint and display results
 */
async function queryEndpoint(module, action, extraParams = '', title) {
  console.log('----------------------------------------');
  console.log(title);
  console.log('----------------------------------------');
  
  const apiKeyParam = apiKey ? `&apikey=${apiKey}` : '';
  const url = `${apiUrl}?module=${module}&action=${action}&address=${address}${extraParams}${apiKeyParam}`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.status === '1') {
      // Success
      const result = response.result;
      
      if (Array.isArray(result)) {
        if (result.length === 0) {
          console.log('No data found');
        } else {
          console.log(`Found ${result.length} record(s):\n`);
          console.log(JSON.stringify(result, null, 2));
        }
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else if (response.status === '0' && response.message === 'No transactions found') {
      console.log('No transactions found');
    } else {
      console.log(`API returned: ${response.message || response.result || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  try {
    // 1. Get ETH Balance
    await queryEndpoint('account', 'balance', '&tag=latest', '1. ETH Balance');
    
    // 2. Get Normal Transactions (last 10)
    await queryEndpoint(
      'account',
      'txlist',
      '&startblock=0&endblock=99999999&page=1&offset=10&sort=desc',
      '2. Recent Transactions (Last 10)'
    );
    
    // 3. Get Internal Transactions (last 10)
    await queryEndpoint(
      'account',
      'txlistinternal',
      '&startblock=0&endblock=99999999&page=1&offset=10&sort=desc',
      '3. Recent Internal Transactions (Last 10)'
    );
    
    // 4. Get ERC20 Token Transfer Events (last 10)
    await queryEndpoint(
      'account',
      'tokentx',
      '&startblock=0&endblock=99999999&page=1&offset=10&sort=desc',
      '4. Recent ERC20 Token Transfers (Last 10)'
    );
    
    // 5. Get ERC721 Token Transfer Events (last 10)
    await queryEndpoint(
      'account',
      'tokennfttx',
      '&startblock=0&endblock=99999999&page=1&offset=10&sort=desc',
      '5. Recent ERC721 Token Transfers (Last 10)'
    );
    
    console.log('==========================================');
    console.log('Query Complete');
    console.log('==========================================');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
