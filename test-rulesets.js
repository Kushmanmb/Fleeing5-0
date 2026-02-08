/**
 * Test script to perform basic validation of GitHub ruleset JSON files
 * 
 * This script checks that:
 * 1. All JSON files in .github/rulesets are valid JSON
 * 2. Required top-level fields are present
 * 3. Basic structure is consistent with the expected GitHub ruleset format (not full schema validation)
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

const rulesetsDir = path.join(__dirname, '.github', 'rulesets');

// Required fields for a valid ruleset
const requiredFields = ['name', 'target', 'enforcement', 'conditions', 'rules'];

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function testRulesetFile(filePath) {
  const fileName = path.basename(filePath);
  
  log(`\nTesting: ${fileName}`, BLUE);
  
  try {
    // Test 1: Valid JSON
    const content = fs.readFileSync(filePath, 'utf8');
    let ruleset;
    
    try {
      ruleset = JSON.parse(content);
      log('  ✓ Valid JSON format', GREEN);
      testsPassed++;
    } catch (parseError) {
      log(`  ✗ Invalid JSON: ${parseError.message}`, RED);
      testsFailed++;
      return;
    }
    
    // Test 2: Required fields present
    const missingFields = requiredFields.filter(field => !(field in ruleset));
    if (missingFields.length === 0) {
      log('  ✓ All required fields present', GREEN);
      testsPassed++;
    } else {
      log(`  ✗ Missing required fields: ${missingFields.join(', ')}`, RED);
      testsFailed++;
    }
    
    // Test 3: Valid target value
    if (ruleset.target === 'branch' || ruleset.target === 'tag') {
      log(`  ✓ Valid target: ${ruleset.target}`, GREEN);
      testsPassed++;
    } else {
      log(`  ✗ Invalid target: ${ruleset.target} (expected 'branch' or 'tag')`, RED);
      testsFailed++;
    }
    
    // Test 4: Valid enforcement value
    if (ruleset.enforcement === 'active' || ruleset.enforcement === 'evaluate' || ruleset.enforcement === 'disabled') {
      log(`  ✓ Valid enforcement: ${ruleset.enforcement}`, GREEN);
      testsPassed++;
    } else {
      log(`  ✗ Invalid enforcement: ${ruleset.enforcement}`, RED);
      testsFailed++;
    }
    
    // Test 5: Rules array exists and has items
    if (Array.isArray(ruleset.rules) && ruleset.rules.length > 0) {
      log(`  ✓ Rules array contains ${ruleset.rules.length} rule(s)`, GREEN);
      testsPassed++;
    } else {
      log('  ✗ Rules array is missing or empty', RED);
      testsFailed++;
    }
    
    // Test 6: Each rule has a type
    const rulesWithoutType = ruleset.rules.filter(rule => !rule.type);
    if (rulesWithoutType.length === 0) {
      log('  ✓ All rules have a type', GREEN);
      testsPassed++;
    } else {
      log(`  ✗ ${rulesWithoutType.length} rule(s) missing type`, RED);
      testsFailed++;
    }
    
    // Test 7: Conditions structure
    if (ruleset.conditions && ruleset.conditions.ref_name) {
      log('  ✓ Valid conditions structure', GREEN);
      testsPassed++;
    } else {
      log('  ✗ Invalid or missing conditions structure', RED);
      testsFailed++;
    }
    
  } catch (error) {
    log(`  ✗ Error reading file: ${error.message}`, RED);
    testsFailed++;
  }
}

// Main execution
log('=== GitHub Rulesets Validation Test ===\n', YELLOW);

// Check if rulesets directory exists
if (!fs.existsSync(rulesetsDir)) {
  log(`Error: Rulesets directory not found at ${rulesetsDir}`, RED);
  process.exit(1);
}

// Get all JSON files in the rulesets directory
const files = fs.readdirSync(rulesetsDir)
  .filter(file => file.endsWith('.json'))
  .map(file => path.join(rulesetsDir, file));

if (files.length === 0) {
  log('Warning: No JSON files found in rulesets directory', YELLOW);
  process.exit(0);
}

log(`Found ${files.length} ruleset file(s) to test\n`, BLUE);

// Test each file
files.forEach(testRulesetFile);

// Summary
log('\n=== Test Summary ===', YELLOW);
log(`Tests Passed: ${testsPassed}`, GREEN);
log(`Tests Failed: ${testsFailed}`, testsFailed > 0 ? RED : GREEN);

const totalTests = testsPassed + testsFailed;
const successRate = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(1) : 0;
log(`Success Rate: ${successRate}%`, successRate === 100 ? GREEN : YELLOW);

// Exit with appropriate code
process.exit(testsFailed > 0 ? 1 : 0);
