require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Set up Ethereum provider
const provider = new ethers.providers.InfuraProvider('homestead', process.env.INFURA_PROJECT_ID);

// Create wallet instance
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// USDC contract details (you'll need the USDC contract address)
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2eF0b6A46FC1bC5e';
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
const lastRequestTimes = {};

app.use(express.json());

app.post('/faucet', async (req, res) => {
  const userAddress = req.body.address.toLowerCase();
  
  const now = Math.floor(Date.now() / 1000);
  
  // Check cooldown
  if (lastRequestTimes[userAddress] && now - lastRequestTimes[userAddress] < COOLDOWN) {
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
    await tx.wait();
    lastRequestTimes[userAddress] = now;
    res.json({ message: 'USDC dispensed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error dispensing USDC.' });
  }
});

app.listen(port, () => {
  console.log(`Faucet server running at http://localhost:${port}`);
});
