# Etherscan API Query Tool - Usage Examples

This document provides examples of how to use the Etherscan API query tool.

## Basic Usage

### Query an address on mainnet (default)
```bash
npm run etherscan -- 0xYourAddressHere
```

### Query with API key for higher rate limits
```bash
npm run etherscan -- 0xYourAddressHere YOUR_API_KEY
```

### Query on a testnet
```bash
npm run etherscan -- 0xYourAddressHere YOUR_API_KEY sepolia
```

## Alternative Methods

### Using Node.js directly
```bash
node etherscan-query.js 0xYourAddressHere
node etherscan-query.js 0xYourAddressHere YOUR_API_KEY sepolia
```

### Using the bash script
```bash
./ethscab 0xYourAddressHere
./ethscab 0xYourAddressHere YOUR_API_KEY sepolia
```

## Environment Variable

Instead of passing the API key as an argument, you can set it as an environment variable:

```bash
export ETHERSCAN_API_KEY=your_api_key_here
npm run etherscan -- 0xYourAddressHere
```

Or add it to your `.env` file:
```
ETHERSCAN_API_KEY=your_api_key_here
```

## Real-World Examples

### Check Vitalik Buterin's address
```bash
npm run etherscan -- 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

### Check USDC contract address on mainnet
```bash
npm run etherscan -- 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

### Check a contract on Sepolia testnet
```bash
npm run etherscan -- 0xYourSepoliaAddress YOUR_API_KEY sepolia
```

## What Data is Retrieved

The tool fetches the following information for any Ethereum address:

1. **ETH Balance** - Current balance in Wei (1 ETH = 10^18 Wei)
2. **Recent Transactions** - Last 10 normal transactions
3. **Recent Internal Transactions** - Last 10 internal transactions (contract calls)
4. **Recent ERC20 Token Transfers** - Last 10 token transfer events
5. **Recent ERC721 Token Transfers** - Last 10 NFT transfer events

## Supported Networks

- `mainnet` - Ethereum Mainnet (default)
- `sepolia` - Sepolia Testnet
- `holesky` - Holesky Testnet

## Getting an API Key

1. Visit [https://etherscan.io/](https://etherscan.io/)
2. Create an account if you don't have one
3. Go to [https://etherscan.io/myapikey](https://etherscan.io/myapikey)
4. Create a new API key
5. Use the API key in your queries

**Note**: The free tier API key has rate limits. Without an API key, you're subject to even stricter public rate limits.

## Troubleshooting

### Rate Limiting
If you see "Max rate limit reached" errors, you need to:
- Use an API key for higher limits
- Wait a few seconds between requests
- Consider upgrading to a paid Etherscan plan for higher limits

### Invalid Address
Make sure your address:
- Starts with `0x`
- Is exactly 42 characters long (0x + 40 hex characters)
- Contains only valid hex characters (0-9, a-f, A-F)

### Network Connection Issues
If you get "ENOTFOUND" or connection errors:
- Check your internet connection
- Verify the network name is correct (mainnet, sepolia, holesky)
- Try again in a few moments (Etherscan API may be temporarily unavailable)

## Advanced Usage

### Save Output to File
```bash
npm run etherscan -- 0xYourAddressHere > output.json
```

### Query Multiple Networks
```bash
# Mainnet
npm run etherscan -- 0xYourAddressHere

# Sepolia
npm run etherscan -- 0xYourAddressHere YOUR_API_KEY sepolia

# Holesky  
npm run etherscan -- 0xYourAddressHere YOUR_API_KEY holesky
```

### Use with jq for JSON Processing
```bash
npm run etherscan -- 0xYourAddressHere | jq '.result'
```
