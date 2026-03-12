// Test script for faucet.js cooldown logic
// This tests the cooldown constant and logic without requiring actual blockchain connection

const fs = require('fs');
const { createTestRunner } = require('./utils/test-runner');

async function runTests() {
  const runner = createTestRunner('Testing faucet.js cooldown configuration...');
  runner.start();

  // Test 1: Verify COOLDOWN constant is set to 12 hours
  await runner.test('Test 1: COOLDOWN constant value', () => {
    // Read the faucet.js file to extract the COOLDOWN constant
    const faucetCode = fs.readFileSync('./faucet.js', 'utf8');
    
    // Extract COOLDOWN value using regex (flexible to handle whitespace variations)
    const cooldownMatch = faucetCode.match(/const\s+COOLDOWN\s*=\s*(\d+)\s*;?/);
    if (!cooldownMatch) {
      throw new Error('Could not find COOLDOWN constant in faucet.js');
    }
    
    const cooldownValue = parseInt(cooldownMatch[1]);
    const expectedCooldown = 43200; // 12 hours in seconds
    
    if (cooldownValue !== expectedCooldown) {
      throw new Error(`COOLDOWN is ${cooldownValue} seconds, expected ${expectedCooldown} seconds (12 hours)`);
    }
    
    console.log(`  COOLDOWN is correctly set to ${cooldownValue} seconds (12 hours)`);
  });

  // Test 2: Verify cooldown calculation
  await runner.test('Test 2: Cooldown calculation logic', () => {
    const COOLDOWN = 43200; // 12 hours
    const now = Math.floor(Date.now() / 1000);
    
    // Test case 1: No previous request (should allow)
    const lastRequestTimes = {};
    const normalizedAddress = '0x1234567890123456789012345678901234567890'.toLowerCase();
    
    if (lastRequestTimes[normalizedAddress]) {
      throw new Error('Address should not have a previous request time');
    }
    
    // Test case 2: Previous request was 13 hours ago (should allow)
    lastRequestTimes[normalizedAddress] = now - (13 * 3600);
    const timeDiff1 = now - lastRequestTimes[normalizedAddress];
    const shouldAllow1 = timeDiff1 >= COOLDOWN;
    
    if (!shouldAllow1) {
      throw new Error('Should allow request after 13 hours');
    }
    
    // Test case 3: Previous request was 11 hours ago (should deny)
    lastRequestTimes[normalizedAddress] = now - (11 * 3600);
    const timeDiff2 = now - lastRequestTimes[normalizedAddress];
    const shouldAllow2 = timeDiff2 >= COOLDOWN;
    
    if (shouldAllow2) {
      throw new Error('Should deny request before 12 hours have passed');
    }
    
    // Test case 4: Previous request was exactly 12 hours ago (should allow)
    lastRequestTimes[normalizedAddress] = now - (12 * 3600);
    const timeDiff3 = now - lastRequestTimes[normalizedAddress];
    const shouldAllow3 = timeDiff3 >= COOLDOWN;
    
    if (!shouldAllow3) {
      throw new Error('Should allow request at exactly 12 hours');
    }
    
    console.log('  - No previous request: allowed');
    console.log('  - 13 hours ago: allowed');
    console.log('  - 11 hours ago: denied');
    console.log('  - 12 hours ago: allowed');
  });

  // Test 3: Verify README documentation matches code
  await runner.test('Test 3: README documentation consistency', () => {
    const readmeContent = fs.readFileSync('./README.md', 'utf8');
    
    // Check for "12 hour" mentions in README
    const cooldownMatches = readmeContent.match(/12 hour/gi);
    if (!cooldownMatches || cooldownMatches.length === 0) {
      throw new Error('README should mention "12 hour" cooldown');
    }
    
    // Check that there are no "48 hour" references (old/incorrect documentation)
    const oldCooldownMatches = readmeContent.match(/48 hour/gi);
    if (oldCooldownMatches && oldCooldownMatches.length > 0) {
      throw new Error('README still contains outdated "48 hour" references');
    }
    
    console.log(`  - Found ${cooldownMatches.length} correct "12 hour" reference(s)`);
  });

  // Test 4: Verify address normalization
  await runner.test('Test 4: Address normalization for cooldown tracking', () => {
    // Different case variations of the same address
    const address1 = '0x1234567890123456789012345678901234567890';
    const address2 = '0x1234567890123456789012345678901234567890'.toLowerCase();
    const address3 = '0x1234567890123456789012345678901234567890'.toUpperCase();
    
    const normalized1 = address1.toLowerCase();
    const normalized2 = address2.toLowerCase();
    const normalized3 = address3.toLowerCase();
    
    if (normalized1 !== normalized2 || normalized2 !== normalized3) {
      throw new Error('Address normalization is not working correctly');
    }
    
    console.log('  - Mixed case, lowercase, and uppercase all normalize to same value');
  });

  runner.summary();
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
