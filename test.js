#!/usr/bin/env node
// Simple test script to verify the JavaScript logic

const { BONUS_SYMBOL_IDS, SYMBOL_IDS } = require('./src/symbols.js');
const rows = 6;
const cols = 5;

// Mock function to generate board
function generateBoard() {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const symbol = SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
      row.push(symbol);
    }
    board.push(row);
  }
  return board;
}

// Optimized checkBonusTrigger function
function checkBonusTrigger(board) {
  let prisonerOnReel1 = false;
  let robberOnReel5 = false;
  let copInMiddle = false;
  
  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    if (row[0] === BONUS_SYMBOL_IDS.left) prisonerOnReel1 = true;
    if (row[4] === BONUS_SYMBOL_IDS.right) robberOnReel5 = true;
    if (
      row[1] === BONUS_SYMBOL_IDS.middle ||
      row[2] === BONUS_SYMBOL_IDS.middle ||
      row[3] === BONUS_SYMBOL_IDS.middle
    ) {
      copInMiddle = true;
    }
    
    if (prisonerOnReel1 && robberOnReel5 && copInMiddle) return true;
  }
  
  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

// Test cases
console.log('Running tests...\n');

let passed = 0;
let failed = 0;

// Test case 1: Should trigger bonus
const testBoard1 = [
  ["prisoner", "gold_badge", "cop", "a", "robber"],
  ["a", "marker", "flashlight", "gold_badge", "a"],
  ["casings", "gold_badge", "a", "marker", "flashlight"],
  ["flashlight", "a", "casings", "gold_badge", "marker"],
  ["marker", "casings", "flashlight", "a", "gold_badge"],
  ["a", "flashlight", "marker", "casings", "a"]
];
if (checkBonusTrigger(testBoard1)) {
  console.log('✓ Test 1: Bonus trigger detection (positive case)');
  passed++;
} else {
  console.log('✗ Test 1: FAILED - Should trigger bonus');
  failed++;
}

// Test case 2: Should not trigger (no PRISONER)
const testBoard2 = [
  ["gold_badge", "gold_badge", "cop", "a", "robber"],
  ["a", "marker", "flashlight", "gold_badge", "a"],
  ["casings", "gold_badge", "a", "marker", "flashlight"],
  ["flashlight", "a", "casings", "gold_badge", "marker"],
  ["marker", "casings", "flashlight", "a", "gold_badge"],
  ["a", "flashlight", "marker", "casings", "a"]
];
if (!checkBonusTrigger(testBoard2)) {
  console.log('✓ Test 2: No trigger without PRISONER');
  passed++;
} else {
  console.log('✗ Test 2: FAILED - Should not trigger without PRISONER');
  failed++;
}

// Test case 3: Should not trigger (no ROBBER)
const testBoard3 = [
  ["prisoner", "gold_badge", "cop", "a", "a"],
  ["a", "marker", "flashlight", "gold_badge", "a"],
  ["casings", "gold_badge", "a", "marker", "flashlight"],
  ["flashlight", "a", "casings", "gold_badge", "marker"],
  ["marker", "casings", "flashlight", "a", "gold_badge"],
  ["a", "flashlight", "marker", "casings", "a"]
];
if (!checkBonusTrigger(testBoard3)) {
  console.log('✓ Test 3: No trigger without ROBBER');
  passed++;
} else {
  console.log('✗ Test 3: FAILED - Should not trigger without ROBBER');
  failed++;
}

// Test case 4: Should not trigger (no COP in middle)
const testBoard4 = [
  ["prisoner", "gold_badge", "marker", "a", "robber"],
  ["a", "marker", "flashlight", "gold_badge", "a"],
  ["casings", "gold_badge", "a", "marker", "flashlight"],
  ["flashlight", "a", "casings", "gold_badge", "marker"],
  ["marker", "casings", "flashlight", "a", "gold_badge"],
  ["a", "flashlight", "marker", "casings", "a"]
];
if (!checkBonusTrigger(testBoard4)) {
  console.log('✓ Test 4: No trigger without COP in middle');
  passed++;
} else {
  console.log('✗ Test 4: FAILED - Should not trigger without COP');
  failed++;
}

// Test case 5: Should trigger with all conditions in last row
const testBoard5 = [
  ["gold_badge", "marker", "flashlight", "a", "a"],
  ["a", "marker", "flashlight", "gold_badge", "a"],
  ["casings", "gold_badge", "a", "marker", "flashlight"],
  ["flashlight", "a", "casings", "gold_badge", "marker"],
  ["marker", "casings", "flashlight", "a", "gold_badge"],
  ["prisoner", "flashlight", "cop", "marker", "robber"]
];
if (checkBonusTrigger(testBoard5)) {
  console.log('✓ Test 5: Bonus trigger with all conditions in last row');
  passed++;
} else {
  console.log('✗ Test 5: FAILED - Should trigger with all conditions');
  failed++;
}

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

console.log('All tests passed!');
