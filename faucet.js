require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Set up Ethereum provider (using Sepolia testnet)
const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_PROJECT_ID);

// Create wallet instance
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// USDC contract details - NOTE: This must be a testnet USDC contract address
// Configure via USDC_CONTRACT_ADDRESS environment variable
if (!process.env.USDC_CONTRACT_ADDRESS) {
  console.error('ERROR: USDC_CONTRACT_ADDRESS environment variable is required');
  process.exit(1);
}
const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS;
const USDC_ABI = [
  'function transfer(address to, uint256 value) public returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
];

// Create USDC contract instance
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);

// Cooldown and limits
const COOLDOWN = 3600; // 1 hour in seconds
const DISPENSE_AMOUNT = ethers.utils.parseUnits('10', 6); // 10 USDC with 6 decimals

// In-memory store for last request times
// NOTE: This will reset on server restart and doesn't scale across multiple instances
// For production, consider using Redis or a database
const lastRequestTimes = {};

// Cache for status endpoint to reduce on-chain calls
let statusCache = null;
let statusCacheTimestamp = 0;
let statusCacheFetching = null; // Promise to prevent concurrent fetches
const STATUS_CACHE_TTL = 30; // 30 seconds cache TTL

app.use(express.json());

// GET endpoint to check faucet status
app.get('/status', async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Return cached response if within TTL
    if (statusCache && (now - statusCacheTimestamp) < STATUS_CACHE_TTL) {
      return res.json(statusCache);
    }
    
    // If another request is already fetching, wait for it
    if (statusCacheFetching) {
      await statusCacheFetching;
      // After waiting, check if cache is now available
      if (statusCache && (now - statusCacheTimestamp) < STATUS_CACHE_TTL) {
        return res.json(statusCache);
      }
    }
    
    // Create a promise for this fetch operation
    statusCacheFetching = (async () => {
      try {
        // Fetch fresh data from blockchain
        const balance = await usdcContract.balanceOf(wallet.address);
        const balanceFormatted = ethers.utils.formatUnits(balance, 6);
        
        const statusResponse = {
          faucetAddress: wallet.address,
          balance: balanceFormatted,
          dispenseAmount: ethers.utils.formatUnits(DISPENSE_AMOUNT, 6),
          cooldownSeconds: COOLDOWN,
          network: 'sepolia'
        };
        
        // Update cache
        statusCache = statusResponse;
        statusCacheTimestamp = Math.floor(Date.now() / 1000);
        
        return statusResponse;
      } finally {
        statusCacheFetching = null;
      }
    })();
    
    const statusResponse = await statusCacheFetching;
    res.json(statusResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching faucet status.' });
  }
});

app.post('/faucet', async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.address) {
      return res.status(400).json({ message: 'Address is required in request body.' });
    }

    const userAddress = req.body.address;

    // Validate Ethereum address format
    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({ message: 'Invalid Ethereum address format.' });
    }

    const normalizedAddress = userAddress.toLowerCase();
    const now = Math.floor(Date.now() / 1000);
    
    // Check cooldown
    if (lastRequestTimes[normalizedAddress] && now - lastRequestTimes[normalizedAddress] < COOLDOWN) {
      const timeRemaining = Math.ceil(COOLDOWN - (now - lastRequestTimes[normalizedAddress]));
      res.set('Retry-After', String(timeRemaining));
      return res.status(429).json({ 
        message: 'Cooldown in effect. Please try again later.',
        cooldownRemainingSeconds: timeRemaining
      });
    }

    // Check faucet balance
    const balance = await usdcContract.balanceOf(wallet.address);
    if (balance.lt(DISPENSE_AMOUNT)) {
      return res.status(500).json({ message: 'Faucet out of funds.' });
    }

    // Transfer USDC to user
    const tx = await usdcContract.transfer(userAddress, DISPENSE_AMOUNT);
    // Update cooldown timestamp immediately after transaction is sent
    // to prevent abuse if tx.wait() takes a long time or fails
    lastRequestTimes[normalizedAddress] = now;
    await tx.wait();
    
    // Invalidate status cache since balance has changed
    statusCache = null;
    
    res.json({ 
      message: 'USDC dispensed successfully!',
      transactionHash: tx.hash,
      amount: ethers.utils.formatUnits(DISPENSE_AMOUNT, 6),
      recipient: userAddress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error dispensing USDC.' });
  }
});

app.listen(port, () => {
  console.log(`Faucet server running at http://localhost:${port}`);
});
