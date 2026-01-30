# Etherscan API v2 Query Examples

This document provides examples of using the Etherscan API v2 query tool.

## Prerequisites

Before running any queries, you need an Etherscan API key:
1. Go to [https://etherscan.io/myapikey](https://etherscan.io/myapikey)
2. Create an account or log in
3. Generate an API key
4. Add it to your `.env` file or pass it via `--api-key` flag

## Quick Start

### Using npm scripts (Recommended)

```bash
# Set your API key in .env file
echo "ETHERSCAN_API_KEY=your_api_key_here" > .env

# Get current block number for mainnet
npm run etherscan:block -- mainnet

# Get current block number for sepolia testnet
npm run etherscan:block -- sepolia
```

### Using the command line directly

```bash
# Get block number for mainnet
node etherscan-query.js --block-number mainnet

# Get block number using chain ID
node etherscan-query.js --chainid 1 --module proxy --action eth_blockNumber

# Pass API key via command line
node etherscan-query.js --chainid 1 --module proxy --action eth_blockNumber --api-key YOUR_KEY
```

### Using cURL (Direct API Access)

The original problem statement command:

```bash
curl "https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_blockNumber&apikey=YourApiKeyToken"
```

Response format:
```json
{
  "status": "1",
  "message": "OK",
  "result": "0x1234567"
}
```

The `result` field contains the block number in hexadecimal format. To convert to decimal:

```bash
# Using bash
echo $((0x1234567))

# Using node
node -e "console.log(parseInt('0x1234567', 16))"
```

## Supported Networks

| Network | Chain ID | Usage |
|---------|----------|-------|
| Mainnet | 1        | `--chainid 1` or `--block-number mainnet` |
| Sepolia | 11155111 | `--chainid 11155111` or `--block-number sepolia` |
| Holesky | 17000    | `--chainid 17000` or `--block-number holesky` |

## Advanced Examples

### Get block number for all networks

```bash
for network in mainnet sepolia holesky; do
  echo "=== $network ==="
  npm run etherscan:block -- $network
  echo ""
done
```

### Use in a Node.js script

```javascript
require('dotenv').config();
const { getBlockNumber } = require('./etherscan-query.js');

async function checkAllNetworks() {
  const networks = ['mainnet', 'sepolia', 'holesky'];
  
  for (const network of networks) {
    try {
      const result = await getBlockNumber(network);
      console.log(`${network}: Block ${result.blockNumber}`);
    } catch (error) {
      console.error(`${network}: Error - ${error.message}`);
    }
  }
}

checkAllNetworks();
```

### Use with custom parameters

```javascript
const { queryEtherscan } = require('./etherscan-query.js');

// Get block number
const blockResult = await queryEtherscan({
  chainid: 1,
  module: 'proxy',
  action: 'eth_blockNumber',
  apiKey: process.env.ETHERSCAN_API_KEY,
});

console.log('Block number (hex):', blockResult.result);
console.log('Block number (decimal):', parseInt(blockResult.result, 16));
```

## Testing

Run the test suite:

```bash
# Run all etherscan tests
npm run test:etherscan
```

Tests include:
- Chain ID mapping validation
- Hex to decimal conversion
- Error handling (invalid networks, missing API key)
- API calls with real data (when API key is set)

## Troubleshooting

### "API key is required" error

Make sure you have set your API key:
```bash
# Option 1: Environment variable
export ETHERSCAN_API_KEY=your_key_here

# Option 2: .env file
echo "ETHERSCAN_API_KEY=your_key_here" > .env

# Option 3: Command line flag
node etherscan-query.js --chainid 1 --module proxy --action eth_blockNumber --api-key your_key_here
```

### "Unknown network" error

Make sure you're using a supported network name:
- `mainnet` (not `ethereum` or `eth`)
- `sepolia` (not `sepoliaTestnet`)
- `holesky`

Or use the numeric chain ID directly:
```bash
node etherscan-query.js --chainid 1 --module proxy --action eth_blockNumber
```

### Rate limiting

Etherscan API has rate limits. Free tier typically allows:
- 5 calls/second
- 100,000 calls/day

If you hit the rate limit, you'll see an error. Wait a moment and try again.

## Additional Resources

- [Etherscan API Documentation](https://docs.etherscan.io/)
- [Etherscan API v2 Endpoints](https://docs.etherscan.io/api-endpoints)
- [Get Your API Key](https://etherscan.io/myapikey)
