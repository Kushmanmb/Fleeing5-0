#!/usr/bin/env node
// Simple test script to verify the JavaScript logic

const { BONUS_SYMBOL_IDS, SYMBOL_IDS } = require('./src/symbols.js');
const rows = 6;
const cols = 5;
const fillerSymbols = SYMBOL_IDS.filter((symbolId) => !Object.values(BONUS_SYMBOL_IDS).includes(symbolId));

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

if (Object.values(BONUS_SYMBOL_IDS).every((symbolId) => SYMBOL_IDS.includes(symbolId))) {
  console.log('✓ Test 0a: Bonus symbol ids are part of the shared symbol catalog');
  passed++;
} else {
  console.log('✗ Test 0a: FAILED - Bonus symbol ids must be present in the shared catalog');
  failed++;
}

if (fillerSymbols.length >= 4 && fillerSymbols.every((symbolId) => SYMBOL_IDS.includes(symbolId))) {
  console.log('✓ Test 0b: Non-bonus filler symbols are valid shared symbol ids');
  passed++;
} else {
  console.log('✗ Test 0b: FAILED - Need at least four valid non-bonus shared symbol ids');
  failed++;
}

const [filler1, filler2, filler3, filler4] = fillerSymbols;

const generatedBoard = generateBoard();
const generatedBoardUsesSharedIds = generatedBoard.length === rows &&
  generatedBoard.every((row) => row.length === cols && row.every((symbolId) => SYMBOL_IDS.includes(symbolId)));

if (generatedBoardUsesSharedIds) {
  console.log('✓ Test 0c: Generated boards use only shared catalog symbol ids');
  passed++;
} else {
  console.log('✗ Test 0c: FAILED - Generated boards must contain only shared catalog symbol ids');
  failed++;
}

// Test case 1: Should trigger bonus
const testBoard1 = [
  [BONUS_SYMBOL_IDS.left, filler1, BONUS_SYMBOL_IDS.middle, filler4, BONUS_SYMBOL_IDS.right],
  [filler4, filler2, filler3, filler1, filler4],
  [filler2, filler1, filler4, filler2, filler3],
  [filler3, filler4, filler2, filler1, filler2],
  [filler2, filler3, filler4, filler4, filler1],
  [filler4, filler3, filler2, filler2, filler4]
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
  [filler1, filler1, BONUS_SYMBOL_IDS.middle, filler4, BONUS_SYMBOL_IDS.right],
  [filler4, filler2, filler3, filler1, filler4],
  [filler2, filler1, filler4, filler2, filler3],
  [filler3, filler4, filler2, filler1, filler2],
  [filler2, filler3, filler4, filler4, filler1],
  [filler4, filler3, filler2, filler2, filler4]
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
  [BONUS_SYMBOL_IDS.left, filler1, BONUS_SYMBOL_IDS.middle, filler4, filler4],
  [filler4, filler2, filler3, filler1, filler4],
  [filler2, filler1, filler4, filler2, filler3],
  [filler3, filler4, filler2, filler1, filler2],
  [filler2, filler3, filler4, filler4, filler1],
  [filler4, filler3, filler2, filler2, filler4]
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
  [BONUS_SYMBOL_IDS.left, filler1, filler2, filler4, BONUS_SYMBOL_IDS.right],
  [filler4, filler2, filler3, filler1, filler4],
  [filler2, filler1, filler4, filler2, filler3],
  [filler3, filler4, filler2, filler1, filler2],
  [filler2, filler3, filler4, filler4, filler1],
  [filler4, filler3, filler2, filler2, filler4]
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
  [filler1, filler2, filler3, filler4, filler4],
  [filler4, filler2, filler3, filler1, filler4],
  [filler2, filler1, filler4, filler2, filler3],
  [filler3, filler4, filler2, filler1, filler2],
  [filler2, filler3, filler4, filler4, filler1],
  [BONUS_SYMBOL_IDS.left, filler3, BONUS_SYMBOL_IDS.middle, filler2, BONUS_SYMBOL_IDS.right]
];
if (checkBonusTrigger(testBoard5)) {
  console.log('✓ Test 5: Bonus trigger with all conditions in last row');
  passed++;
} else {
  console.log('✗ Test 5: FAILED - Should trigger with all conditions');
  failed++;
}

// Test case 6: Should trigger with symbols split across rows
const testBoard6 = [
  [BONUS_SYMBOL_IDS.left, filler1, filler2, filler4, filler4],
  [filler4, filler2, BONUS_SYMBOL_IDS.middle, filler1, filler4],
  [filler2, filler1, filler4, filler2, BONUS_SYMBOL_IDS.right],
  [filler3, filler4, filler2, filler1, filler2],
  [filler2, filler3, filler4, filler4, filler1],
  [filler4, filler3, filler2, filler2, filler4]
];
if (checkBonusTrigger(testBoard6)) {
  console.log('✓ Test 6: Bonus trigger with qualifying symbols across different rows');
  passed++;
} else {
  console.log('✗ Test 6: FAILED - Should trigger when qualifying symbols are split across rows');
  failed++;
}

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

console.log('All tests passed!');
