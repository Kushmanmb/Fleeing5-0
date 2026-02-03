#!/usr/bin/env node
/**
 * Test suite for etherscan-query.js
 * Tests the Etherscan API query tool functionality
 */

const { spawn } = require('child_process');
const path = require('path');

// Test configuration
const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address for testing
const INVALID_ADDRESS = '0xinvalid';
const SHORT_ADDRESS = '0x1234';
const SCRIPT_PATH = path.join(__dirname, 'etherscan-query.js');

let passed = 0;
let failed = 0;

/**
 * Run the etherscan-query script with given arguments
 */
function runScript(args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [SCRIPT_PATH, ...args]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', (error) => {
      reject(error);
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      proc.kill();
      reject(new Error('Script execution timed out'));
    }, 15000); // 15 second timeout
  });
}

/**
 * Test helper function
 */
async function test(name, testFn) {
  try {
    await testFn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log('Running Etherscan Query Tool Tests...\n');

  // Test 1: Help flag works
  await test('Help flag displays usage information', async () => {
    const result = await runScript(['--help']);
    if (result.code !== 0) {
      throw new Error(`Expected exit code 0, got ${result.code}`);
    }
    if (!result.stdout.includes('Usage:')) {
      throw new Error('Help output does not contain usage information');
    }
    if (!result.stdout.includes('Etherscan API Query Tool')) {
      throw new Error('Help output does not contain tool name');
    }
  });

  // Test 2: No arguments shows error
  await test('No arguments shows error message', async () => {
    const result = await runScript([]);
    if (result.code !== 0) {
      throw new Error(`Expected exit code 0, got ${result.code}`);
    }
    if (!result.stdout.includes('Usage:')) {
      throw new Error('Error message should include usage');
    }
  });

  // Test 3: Invalid address format is rejected
  await test('Invalid address format is rejected', async () => {
    const result = await runScript([INVALID_ADDRESS]);
    if (result.code !== 1) {
      throw new Error(`Expected exit code 1 for invalid address, got ${result.code}`);
    }
    if (!result.stderr.includes('Invalid Ethereum address format')) {
      throw new Error('Should show invalid address error');
    }
  });

  // Test 4: Short address is rejected
  await test('Short address is rejected', async () => {
    const result = await runScript([SHORT_ADDRESS]);
    if (result.code !== 1) {
      throw new Error(`Expected exit code 1 for short address, got ${result.code}`);
    }
    if (!result.stderr.includes('Invalid Ethereum address format')) {
      throw new Error('Should show invalid address error');
    }
  });

  // Test 5: Invalid network is rejected
  await test('Invalid network name is rejected', async () => {
    const result = await runScript([TEST_ADDRESS, '', 'invalidnet']);
    if (result.code !== 1) {
      throw new Error(`Expected exit code 1 for invalid network, got ${result.code}`);
    }
    if (!result.stderr.includes('Unsupported network')) {
      throw new Error('Should show unsupported network error');
    }
  });

  // Test 6: Valid address format is accepted
  await test('Valid address format is accepted', async () => {
    const result = await runScript([TEST_ADDRESS]);
    // Script may exit with 0 even if API calls fail due to rate limiting
    // So we just check that it starts properly
    if (!result.stdout.includes('Etherscan API Query for Address')) {
      throw new Error('Should show query header for valid address');
    }
    if (!result.stdout.includes(TEST_ADDRESS)) {
      throw new Error('Should display the queried address');
    }
  });

  // Test 7: Supported networks are accepted
  await test('Supported network names are accepted', async () => {
    const networks = ['mainnet', 'sepolia', 'holesky'];
    for (const network of networks) {
      const result = await runScript([TEST_ADDRESS, '', network]);
      if (!result.stdout.includes(`Network: ${network}`)) {
        throw new Error(`Should accept network: ${network}`);
      }
    }
  });

  // Test 8: Script recognizes when no API key is provided
  await test('Script warns when no API key is provided', async () => {
    // Ensure ETHERSCAN_API_KEY is not set for this test
    const originalKey = process.env.ETHERSCAN_API_KEY;
    delete process.env.ETHERSCAN_API_KEY;
    
    const result = await runScript([TEST_ADDRESS]);
    
    // Restore original key
    if (originalKey) {
      process.env.ETHERSCAN_API_KEY = originalKey;
    }
    
    if (!result.stdout.includes('Warning: No API key provided')) {
      throw new Error('Should warn when no API key is provided');
    }
  });

  // Summary
  console.log('\n==========================================');
  console.log(`Tests completed: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('==========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
