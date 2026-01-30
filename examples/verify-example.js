#!/usr/bin/env node
/**
 * Example script demonstrating how to use the contract verification tool
 * 
 * This script shows how to verify a deployed contract programmatically
 * using the verify-contract.js module.
 */

require('dotenv').config();
const fs = require('fs');
const { verifyContract, encodeConstructorArgs } = require('../verify-contract.js');

async function main() {
  // Example: Verify SimpleStorage contract
  
  // Step 1: Read the contract source code
  let sourceCode;
  try {
    sourceCode = fs.readFileSync('./examples/SimpleStorage.sol', 'utf8');
  } catch (error) {
    console.error('Error: Could not read SimpleStorage.sol:', error.message);
    console.log('Make sure you are running this script from the repository root directory.');
    process.exit(1);
  }
  
  // Step 2: Encode constructor arguments
  // SimpleStorage constructor takes uint256 initialValue
  // Let's say we deployed with initialValue = 42
  const constructorArgs = encodeConstructorArgs(
    ['uint256'],  // Types
    ['42']        // Values
  );
  
  console.log('Example: Verifying SimpleStorage Contract');
  console.log('==========================================\n');
  console.log('Constructor arguments (ABI-encoded):', constructorArgs);
  console.log('\nNote: This is a demonstration. Replace the values below with your actual deployment details.\n');
  
  // Step 3: Verify the contract
  // IMPORTANT: Replace these values with your actual deployment details
  const result = await verifyContract({
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678', // Replace with your contract address
    sourceCode: sourceCode,
    contractName: 'SimpleStorage',
    compilerVersion: 'v0.8.20+commit.a1b79de6', // Must match deployment compiler
    optimizationUsed: 1,
    runs: 200,
    constructorArguments: constructorArgs,
    network: 'sepolia', // Change to your network
    apiKey: process.env.ETHERSCAN_API_KEY,
  });
  
  if (result.success) {
    console.log('\n✓ Contract verified successfully!');
    console.log('View your verified contract at:', result.explorerUrl);
  } else {
    console.error('\n✗ Verification failed:', result.error);
    console.log('\nCommon issues:');
    console.log('- Make sure the contract address is correct');
    console.log('- Ensure the compiler version matches your deployment');
    console.log('- Verify constructor arguments are correctly encoded');
    console.log('- Check that your Etherscan API key is valid');
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { main };
