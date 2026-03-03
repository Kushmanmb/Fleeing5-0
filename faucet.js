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
const COOLDOWN = 43200; // 12 hours in seconds (12 * 3600)
const DISPENSE_AMOUNT = ethers.utils.parseUnits('10', 6); // 10 USDC with 6 decimals

// In-memory store for last request times
// NOTE: This will reset on server restart and doesn't scale across multiple instances
// For production, consider using Redis or a database
const lastRequestTimes = {};

app.use(express.json());

app.post('/faucet', async (req, res) => {
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
    return res.status(429).json({ message: 'Cooldown in effect. Please try again later.' });
  }

  // Check faucet balance
  const balance = await usdcContract.balanceOf(wallet.address);
  if (balance.lt(DISPENSE_AMOUNT)) {
    return res.status(500).json({ message: 'Faucet out of funds.' });
  }

  // Transfer USDC to user
  try {
    const tx = await usdcContract.transfer(userAddress, DISPENSE_AMOUNT);
    // Update cooldown timestamp immediately after transaction is sent
    // to prevent abuse if tx.wait() takes a long time or fails
    lastRequestTimes[normalizedAddress] = now;
    await tx.wait();
    res.json({ message: 'USDC dispensed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error dispensing USDC.' });
  }
});

app.listen(port, () => {
  console.log(`Faucet server running at http://localhost:${port}`);
});
