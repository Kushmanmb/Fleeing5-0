const { queryEtherscan, getBlockNumber, CHAIN_IDS, NETWORKS } = require('./etherscan-query.js');

console.log('=== Etherscan API v2 Query Tests ===\n');

// Test counter
let passed = 0;
let failed = 0;
let skipped = 0;

/**
 * Test helper function
 */
async function runTest(name, testFn) {
  try {
    console.log(`Running: ${name}`);
    const result = await testFn();
    if (result === 'skipped') {
      console.log('⊘ SKIPPED\n');
      skipped++;
    } else {
      console.log('✓ PASSED\n');
      passed++;
    }
  } catch (error) {
    console.error(`✗ FAILED: ${error.message}\n`);
    failed++;
  }
}

/**
 * Test: Chain ID mappings
 */
async function testChainIdMappings() {
  const expectedMappings = {
    mainnet: 1,
    sepolia: 11155111,
    holesky: 17000,
  };

  for (const [network, expectedId] of Object.entries(expectedMappings)) {
    if (CHAIN_IDS[network] !== expectedId) {
      throw new Error(`Chain ID for ${network} is ${CHAIN_IDS[network]}, expected ${expectedId}`);
    }
  }

  // Check reverse mapping
  for (const [id, network] of Object.entries(NETWORKS)) {
    const numericId = parseInt(id);
    if (CHAIN_IDS[network] !== numericId) {
      throw new Error(`Reverse mapping mismatch for ${network} (${id})`);
    }
  }
}

/**
 * Test: Get block number with network name (requires API key)
 */
async function testGetBlockNumberWithNetworkName() {
  if (!process.env.ETHERSCAN_API_KEY) {
    console.log('⚠ Skipping (no API key set)');
    return 'skipped';
  }

  const result = await getBlockNumber('mainnet');
  
  if (!result.success) {
    throw new Error('Result success flag is false');
  }
  
  if (!result.blockNumber || typeof result.blockNumber !== 'number') {
    throw new Error('Block number is invalid');
  }
  
  if (result.blockNumber < 1000000) {
    throw new Error(`Block number ${result.blockNumber} seems too low for mainnet`);
  }
  
  if (!result.blockNumberHex || !result.blockNumberHex.startsWith('0x')) {
    throw new Error('Block number hex format is invalid');
  }
  
  if (result.chainId !== 1) {
    throw new Error(`Chain ID is ${result.chainId}, expected 1`);
  }
  
  if (result.network !== 'mainnet') {
    throw new Error(`Network is ${result.network}, expected mainnet`);
  }

  console.log(`  Block number: ${result.blockNumber}`);
}

/**
 * Test: Get block number with chain ID (requires API key)
 */
async function testGetBlockNumberWithChainId() {
  if (!process.env.ETHERSCAN_API_KEY) {
    console.log('⚠ Skipping (no API key set)');
    return 'skipped';
  }

  const result = await getBlockNumber(11155111); // Sepolia
  
  if (!result.success) {
    throw new Error('Result success flag is false');
  }
  
  if (!result.blockNumber || typeof result.blockNumber !== 'number') {
    throw new Error('Block number is invalid');
  }
  
  if (result.blockNumber < 1000000) {
    throw new Error(`Block number ${result.blockNumber} seems too low for sepolia`);
  }
  
  if (result.chainId !== 11155111) {
    throw new Error(`Chain ID is ${result.chainId}, expected 11155111`);
  }
  
  if (result.network !== 'sepolia') {
    throw new Error(`Network is ${result.network}, expected sepolia`);
  }

  console.log(`  Block number: ${result.blockNumber}`);
}

/**
 * Test: Query with invalid network name
 */
async function testInvalidNetworkName() {
  try {
    await getBlockNumber('invalidnetwork');
    throw new Error('Should have thrown an error for invalid network');
  } catch (error) {
    if (!error.message.includes('Unknown network')) {
      throw error;
    }
  }
}

/**
 * Test: Query without API key
 */
async function testMissingApiKey() {
  const originalApiKey = process.env.ETHERSCAN_API_KEY;
  delete process.env.ETHERSCAN_API_KEY;
  
  try {
    await getBlockNumber('mainnet');
    throw new Error('Should have thrown an error for missing API key');
  } catch (error) {
    if (!error.message.includes('API key is required')) {
      throw error;
    }
  } finally {
    if (originalApiKey !== undefined) {
      process.env.ETHERSCAN_API_KEY = originalApiKey;
    }
  }
}

/**
 * Test: Hex to decimal conversion
 */
async function testHexToDecimalConversion() {
  // Mock test without API call
  const testCases = [
    { hex: '0x1', expected: 1 },
    { hex: '0xa', expected: 10 },
    { hex: '0xff', expected: 255 },
    { hex: '0x989680', expected: 10000000 },
  ];

  for (const { hex, expected } of testCases) {
    const result = parseInt(hex, 16);
    if (result !== expected) {
      throw new Error(`Hex conversion failed: ${hex} = ${result}, expected ${expected}`);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Note: Some tests require ETHERSCAN_API_KEY environment variable\n');

  await runTest('Chain ID mappings', testChainIdMappings);
  await runTest('Hex to decimal conversion', testHexToDecimalConversion);
  await runTest('Invalid network name', testInvalidNetworkName);
  await runTest('Missing API key', testMissingApiKey);
  await runTest('Get block number with network name (mainnet)', testGetBlockNumberWithNetworkName);
  await runTest('Get block number with chain ID (sepolia)', testGetBlockNumberWithChainId);

  console.log('=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${passed + failed + skipped}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
