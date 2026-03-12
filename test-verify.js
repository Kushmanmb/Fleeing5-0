// Test script for verify-contract.js
const { encodeConstructorArgs, NETWORKS, verifyContract } = require('./verify-contract.js');
const { ethers } = require('ethers');
const { createTestRunner } = require('./utils/test-runner');

async function runTests() {
  const runner = createTestRunner('Testing verify-contract.js module...');
  runner.start();

  // Test 1: Check NETWORKS configuration
  await runner.test('Test 1: NETWORKS configuration', () => {
    if (typeof NETWORKS !== 'object') {
      throw new Error('NETWORKS should be an object');
    }
    if (!NETWORKS.sepolia) {
      throw new Error('NETWORKS should include sepolia');
    }
    if (!NETWORKS.mainnet) {
      throw new Error('NETWORKS should include mainnet');
    }
    console.log(`  Supported networks: ${Object.keys(NETWORKS).length}`);
  });

  // Test 2: encodeConstructorArgs with no arguments
  await runner.test('Test 2: encodeConstructorArgs with no arguments', () => {
    const result = encodeConstructorArgs([], []);
    if (result !== '') {
      throw new Error(`Expected empty string, got: ${result}`);
    }
  });

  // Test 3: encodeConstructorArgs with address
  await runner.test('Test 3: encodeConstructorArgs with address', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';
    const result = encodeConstructorArgs(['address'], [testAddress]);
    
    // Verify it's a valid hex string without 0x prefix
    if (!/^[0-9a-f]+$/i.test(result)) {
      throw new Error('Result should be hex string without 0x prefix');
    }
    
    // Verify length (address should be 32 bytes = 64 hex chars)
    if (result.length !== 64) {
      throw new Error(`Expected 64 chars, got ${result.length}`);
    }
    
    console.log(`  Encoded: ${result.substring(0, 20)}...${result.substring(result.length - 20)}`);
  });

  // Test 4: encodeConstructorArgs with uint256
  await runner.test('Test 4: encodeConstructorArgs with uint256', () => {
    const result = encodeConstructorArgs(['uint256'], ['1000']);
    
    // Verify it's a valid hex string
    if (!/^[0-9a-f]+$/i.test(result)) {
      throw new Error('Result should be hex string without 0x prefix');
    }
    
    // Verify length (uint256 should be 32 bytes = 64 hex chars)
    if (result.length !== 64) {
      throw new Error(`Expected 64 chars, got ${result.length}`);
    }
    
    console.log(`  Encoded: ${result.substring(0, 20)}...${result.substring(result.length - 20)}`);
  });

  // Test 5: encodeConstructorArgs with multiple args
  await runner.test('Test 5: encodeConstructorArgs with multiple arguments', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';
    const result = encodeConstructorArgs(
      ['address', 'uint256', 'string'],
      [testAddress, '1000', 'Hello World']
    );
    
    // Verify it's a valid hex string
    if (!/^[0-9a-f]+$/i.test(result)) {
      throw new Error('Result should be hex string without 0x prefix');
    }
    
    // Multiple args will be longer
    if (result.length < 64) {
      throw new Error('Multiple args should result in longer encoding');
    }
    
    console.log(`  Encoded length: ${result.length} chars`);
  });

  // Test 6: encodeConstructorArgs error handling
  await runner.test('Test 6: encodeConstructorArgs error handling', () => {
    try {
      encodeConstructorArgs(['address'], []); // Mismatched lengths
      throw new Error('Should have thrown error for mismatched lengths');
    } catch (error) {
      if (!error.message.includes('same length')) {
        throw error;
      }
    }
  });

  // Test 7: Verify ethers integration
  await runner.test('Test 7: Verify ethers.js integration', () => {
    if (!ethers.utils) {
      throw new Error('ethers.utils not available');
    }
    if (!ethers.utils.isAddress) {
      throw new Error('ethers.utils.isAddress not available');
    }
    if (!ethers.utils.defaultAbiCoder) {
      throw new Error('ethers.utils.defaultAbiCoder not available');
    }
    
    // Test address validation
    const validAddress = '0x1234567890123456789012345678901234567890';
    const invalidAddress = '0xinvalid';
    
    if (!ethers.utils.isAddress(validAddress)) {
      throw new Error('Valid address not recognized');
    }
    if (ethers.utils.isAddress(invalidAddress)) {
      throw new Error('Invalid address incorrectly validated');
    }
  });

  // Test 8: Validate verifyContract input validation
  await runner.test('Test 8: verifyContract input validation', async () => {
    // Test invalid optimization value
    let errorCaught = false;
    try {
      await verifyContract({
        contractAddress: '0x1234567890123456789012345678901234567890',
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: 'v0.8.20',
        optimizationUsed: 2, // Invalid - should be 0 or 1
        apiKey: 'test',
      });
    } catch (error) {
      if (error.message.includes('optimizationUsed must be 0')) {
        errorCaught = true;
      }
    }
    
    if (!errorCaught) {
      throw new Error('Should have caught invalid optimizationUsed value');
    }
    
    // Test invalid runs value
    errorCaught = false;
    try {
      await verifyContract({
        contractAddress: '0x1234567890123456789012345678901234567890',
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: 'v0.8.20',
        runs: -1, // Invalid - should be positive
        apiKey: 'test',
      });
    } catch (error) {
      if (error.message.includes('runs must be a positive integer')) {
        errorCaught = true;
      }
    }
    
    if (!errorCaught) {
      throw new Error('Should have caught invalid runs value');
    }
  });

  runner.summary();
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
