// Test script for verify-contract.js
const { encodeConstructorArgs, NETWORKS, verifyContract } = require('./verify-contract.js');
const { ethers } = require('ethers');

async function runTests() {
  console.log('Testing verify-contract.js module...\n');

  let passed = 0;
  let failed = 0;

// Test 1: Check NETWORKS configuration
console.log('Test 1: NETWORKS configuration');
try {
  if (typeof NETWORKS !== 'object') {
    throw new Error('NETWORKS should be an object');
  }
  if (!NETWORKS.sepolia) {
    throw new Error('NETWORKS should include sepolia');
  }
  if (!NETWORKS.mainnet) {
    throw new Error('NETWORKS should include mainnet');
  }
  console.log('✓ NETWORKS configuration is valid');
  console.log(`  Supported networks: ${Object.keys(NETWORKS).length}`);
  passed++;
} catch (error) {
  console.error('✗ NETWORKS configuration test failed:', error.message);
  failed++;
}

// Test 2: encodeConstructorArgs with no arguments
console.log('\nTest 2: encodeConstructorArgs with no arguments');
try {
  const result = encodeConstructorArgs([], []);
  if (result !== '') {
    throw new Error(`Expected empty string, got: ${result}`);
  }
  console.log('✓ Empty constructor args encoded correctly');
  passed++;
} catch (error) {
  console.error('✗ Empty constructor args test failed:', error.message);
  failed++;
}

// Test 3: encodeConstructorArgs with address
console.log('\nTest 3: encodeConstructorArgs with address');
try {
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
  
  console.log('✓ Address constructor arg encoded correctly');
  console.log(`  Encoded: ${result.substring(0, 20)}...${result.substring(result.length - 20)}`);
  passed++;
} catch (error) {
  console.error('✗ Address constructor arg test failed:', error.message);
  failed++;
}

// Test 4: encodeConstructorArgs with uint256
console.log('\nTest 4: encodeConstructorArgs with uint256');
try {
  const result = encodeConstructorArgs(['uint256'], ['1000']);
  
  // Verify it's a valid hex string
  if (!/^[0-9a-f]+$/i.test(result)) {
    throw new Error('Result should be hex string without 0x prefix');
  }
  
  // Verify length (uint256 should be 32 bytes = 64 hex chars)
  if (result.length !== 64) {
    throw new Error(`Expected 64 chars, got ${result.length}`);
  }
  
  console.log('✓ uint256 constructor arg encoded correctly');
  console.log(`  Encoded: ${result.substring(0, 20)}...${result.substring(result.length - 20)}`);
  passed++;
} catch (error) {
  console.error('✗ uint256 constructor arg test failed:', error.message);
  failed++;
}

// Test 5: encodeConstructorArgs with multiple args
console.log('\nTest 5: encodeConstructorArgs with multiple arguments');
try {
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
  
  console.log('✓ Multiple constructor args encoded correctly');
  console.log(`  Encoded length: ${result.length} chars`);
  passed++;
} catch (error) {
  console.error('✗ Multiple constructor args test failed:', error.message);
  failed++;
}

// Test 6: encodeConstructorArgs error handling
console.log('\nTest 6: encodeConstructorArgs error handling');
try {
  try {
    encodeConstructorArgs(['address'], []); // Mismatched lengths
    throw new Error('Should have thrown error for mismatched lengths');
  } catch (error) {
    if (!error.message.includes('same length')) {
      throw error;
    }
  }
  
  console.log('✓ Error handling works correctly');
  passed++;
} catch (error) {
  console.error('✗ Error handling test failed:', error.message);
  failed++;
}

// Test 7: Verify ethers integration
console.log('\nTest 7: Verify ethers.js integration');
try {
  if (!ethers.isAddress) {
    throw new Error('ethers.isAddress not available');
  }
  if (!ethers.AbiCoder) {
    throw new Error('ethers.AbiCoder not available');
  }
  
  // Test address validation
  const validAddress = '0x1234567890123456789012345678901234567890';
  const invalidAddress = '0xinvalid';
  
  if (!ethers.isAddress(validAddress)) {
    throw new Error('Valid address not recognized');
  }
  if (ethers.isAddress(invalidAddress)) {
    throw new Error('Invalid address incorrectly validated');
  }
  
  console.log('✓ ethers.js integration working correctly');
  passed++;
} catch (error) {
  console.error('✗ ethers.js integration test failed:', error.message);
  failed++;
}

// Test 8: Validate verifyContract input validation
console.log('\nTest 8: verifyContract input validation');
try {
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
  
  console.log('✓ Input validation works correctly');
  passed++;
} catch (error) {
  console.error('✗ Input validation test failed:', error.message);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('Test Summary:');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed > 0) {
  console.log('\n✗ Some tests failed');
  process.exit(1);
} else {
  console.log('\n✓ All tests passed');
  process.exit(0);
}
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
