require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Coinbase OAuth2 configuration
const COINBASE_AUTH_URL = 'https://login.coinbase.com/oauth2/auth';
const COINBASE_TOKEN_URL = 'https://login.coinbase.com/oauth2/token';
const COINBASE_API_URL = 'https://api.coinbase.com/v2/user';

// Validate OAuth2 configuration
if (!process.env.COINBASE_CLIENT_ID || !process.env.COINBASE_CLIENT_SECRET) {
  console.error('ERROR: COINBASE_CLIENT_ID and COINBASE_CLIENT_SECRET environment variables are required');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}
if (!process.env.COINBASE_REDIRECT_URI) {
  console.error('ERROR: COINBASE_REDIRECT_URI environment variable is required');
  process.exit(1);
}

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

app.use(express.json());

// Middleware to verify JWT token
const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please obtain a token via OAuth2 flow.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// OAuth2 authorization endpoint - starts the OAuth flow
app.get('/auth/coinbase/start', (req, res) => {
  const authUrl = new URL(COINBASE_AUTH_URL);
  authUrl.searchParams.append('client_id', process.env.COINBASE_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', process.env.COINBASE_REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'wallet:user:read');
  
  res.redirect(authUrl.toString());
});

// OAuth2 callback endpoint - handles the authorization code
app.get('/auth/coinbase/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.status(400).json({ message: `OAuth error: ${error}` });
  }
  
  if (!code) {
    return res.status(400).json({ message: 'Authorization code is missing.' });
  }
  
  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(COINBASE_TOKEN_URL, {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.COINBASE_CLIENT_ID,
      client_secret: process.env.COINBASE_CLIENT_SECRET,
      redirect_uri: process.env.COINBASE_REDIRECT_URI,
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user information from Coinbase
    const userResponse = await axios.get(COINBASE_API_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    const coinbaseUser = userResponse.data.data;
    
    // Create JWT token for our application
    const jwtToken = jwt.sign(
      {
        coinbaseId: coinbaseUser.id,
        coinbaseName: coinbaseUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return the JWT token to the client
    res.json({
      message: 'Authentication successful!',
      token: jwtToken,
      user: {
        id: coinbaseUser.id,
        name: coinbaseUser.name,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to complete OAuth authentication.' });
  }
});

app.post('/faucet', verifyAuth, async (req, res) => {
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
  
  // Check cooldown based on Coinbase user ID (prevent abuse across multiple addresses)
  const userKey = req.user.coinbaseId;
  if (lastRequestTimes[userKey] && now - lastRequestTimes[userKey] < COOLDOWN) {
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
    lastRequestTimes[userKey] = now;
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
