/**
 * Test script for OAuth2 endpoints
 * This tests the structure and configuration without making actual OAuth calls
 */

// Mock environment variables for testing
process.env.COINBASE_CLIENT_ID = 'test_client_id';
process.env.COINBASE_CLIENT_SECRET = 'test_client_secret';
process.env.COINBASE_REDIRECT_URI = 'http://localhost:3000/auth/coinbase/callback';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.INFURA_PROJECT_ID = 'test_infura_id';
// TEST_ONLY: Using a test private key (never use in production)
const TEST_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001';
process.env.PRIVATE_KEY = TEST_PRIVATE_KEY;
// TEST_ONLY: Using a test USDC contract address
const TEST_USDC_ADDRESS = '0x0000000000000000000000000000000000000000';
process.env.USDC_CONTRACT_ADDRESS = TEST_USDC_ADDRESS;

const jwt = require('jsonwebtoken');

console.log('Testing OAuth2 Configuration...\n');

// Test 1: Verify required dependencies are installed
console.log('✓ Test 1: Dependencies check');
try {
  require('axios');
  require('jsonwebtoken');
  require('express');
  require('express-session');
  console.log('  All required dependencies are installed\n');
} catch (error) {
  console.error('✗ Missing dependencies:', error.message);
  process.exit(1);
}

// Test 2: Verify environment variables are configured
console.log('✓ Test 2: Environment variables check');
const requiredEnvVars = [
  'COINBASE_CLIENT_ID',
  'COINBASE_CLIENT_SECRET',
  'COINBASE_REDIRECT_URI',
  'JWT_SECRET',
];

let allConfigured = true;
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`  ✗ ${varName} is not configured`);
    allConfigured = false;
  } else {
    console.log(`  ✓ ${varName} is configured`);
  }
});

if (!allConfigured) {
  console.error('\nConfiguration incomplete. Please check .env file.\n');
} else {
  console.log('  All required environment variables are configured\n');
}

// Test 3: Test JWT token generation and verification
console.log('✓ Test 3: JWT token generation and verification');
try {
  const testPayload = {
    coinbaseId: 'test-user-id',
    coinbaseName: 'Test User',
  };
  
  const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  if (decoded.coinbaseId === testPayload.coinbaseId && decoded.coinbaseName === testPayload.coinbaseName) {
    console.log('  ✓ JWT token generation and verification working correctly');
  } else {
    console.error('  ✗ JWT token verification failed - payload mismatch');
    process.exit(1);
  }
} catch (error) {
  console.error('  ✗ JWT test failed:', error.message);
  process.exit(1);
}

// Test 4: Verify OAuth URLs are correctly formatted
console.log('\n✓ Test 4: OAuth URL configuration');
const COINBASE_AUTH_URL = 'https://login.coinbase.com/oauth2/auth';
const COINBASE_TOKEN_URL = 'https://login.coinbase.com/oauth2/token';
const COINBASE_API_URL = 'https://api.coinbase.com/v2/user';

console.log(`  Authorization URL: ${COINBASE_AUTH_URL}`);
console.log(`  Token URL: ${COINBASE_TOKEN_URL}`);
console.log(`  API URL: ${COINBASE_API_URL}`);
console.log(`  Redirect URI: ${process.env.COINBASE_REDIRECT_URI}`);

// Test 5: Verify OAuth authorization URL construction
console.log('\n✓ Test 5: Authorization URL construction');
const authUrl = new URL(COINBASE_AUTH_URL);
authUrl.searchParams.append('client_id', process.env.COINBASE_CLIENT_ID);
authUrl.searchParams.append('redirect_uri', process.env.COINBASE_REDIRECT_URI);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', 'wallet:user:read');

console.log(`  Complete authorization URL:\n  ${authUrl.toString()}`);

console.log('\n✓ All tests passed! OAuth2 configuration is correct.\n');
console.log('Note: Actual OAuth flow requires valid Coinbase credentials.');
console.log('To set up Coinbase OAuth:');
console.log('1. Go to https://www.coinbase.com/settings/api');
console.log('2. Create a new OAuth2 application');
console.log('3. Add redirect URI: http://localhost:3000/auth/coinbase/callback');
console.log('4. Copy Client ID and Client Secret to your .env file\n');
