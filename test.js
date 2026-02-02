#!/usr/bin/env node
// Simple test script to verify the JavaScript logic

const { createTestRunner } = require('./utils/test-runner');
const { checkBonusTrigger } = require('./utils/game-logic');

async function runTests() {
  const runner = createTestRunner('Running tests...');
  
  runner.start();
  
  // Test case 1: Should trigger bonus
  await runner.test('Test 1: Bonus trigger detection (positive case)', () => {
    const testBoard1 = [
      ["PRISONER", "BAR", "COP", "7", "ROBBER"],
      ["7", "CHERRY", "BELL", "BAR", "7"],
      ["CHERRY", "BAR", "7", "CHERRY", "BELL"],
      ["BELL", "7", "CHERRY", "BAR", "7"],
      ["BAR", "CHERRY", "BELL", "7", "CHERRY"],
      ["7", "BELL", "BAR", "CHERRY", "7"]
    ];
    if (!checkBonusTrigger(testBoard1)) {
      throw new Error('Should trigger bonus');
    }
  });
  
  // Test case 2: Should not trigger (no PRISONER)
  await runner.test('Test 2: No trigger without PRISONER', () => {
    const testBoard2 = [
      ["BAR", "BAR", "COP", "7", "ROBBER"],
      ["7", "CHERRY", "BELL", "BAR", "7"],
      ["CHERRY", "BAR", "7", "CHERRY", "BELL"],
      ["BELL", "7", "CHERRY", "BAR", "7"],
      ["BAR", "CHERRY", "BELL", "7", "CHERRY"],
      ["7", "BELL", "BAR", "CHERRY", "7"]
    ];
    if (checkBonusTrigger(testBoard2)) {
      throw new Error('Should not trigger without PRISONER');
    }
  });
  
  // Test case 3: Should not trigger (no ROBBER)
  await runner.test('Test 3: No trigger without ROBBER', () => {
    const testBoard3 = [
      ["PRISONER", "BAR", "COP", "7", "7"],
      ["7", "CHERRY", "BELL", "BAR", "7"],
      ["CHERRY", "BAR", "7", "CHERRY", "BELL"],
      ["BELL", "7", "CHERRY", "BAR", "7"],
      ["BAR", "CHERRY", "BELL", "7", "CHERRY"],
      ["7", "BELL", "BAR", "CHERRY", "7"]
    ];
    if (checkBonusTrigger(testBoard3)) {
      throw new Error('Should not trigger without ROBBER');
    }
  });
  
  // Test case 4: Should not trigger (no COP in middle)
  await runner.test('Test 4: No trigger without COP in middle', () => {
    const testBoard4 = [
      ["PRISONER", "BAR", "BAR", "7", "ROBBER"],
      ["7", "CHERRY", "BELL", "BAR", "7"],
      ["CHERRY", "BAR", "7", "CHERRY", "BELL"],
      ["BELL", "7", "CHERRY", "BAR", "7"],
      ["BAR", "CHERRY", "BELL", "7", "CHERRY"],
      ["7", "BELL", "BAR", "CHERRY", "7"]
    ];
    if (checkBonusTrigger(testBoard4)) {
      throw new Error('Should not trigger without COP');
    }
  });
  
  // Test case 5: Should trigger with all conditions in last row
  await runner.test('Test 5: Bonus trigger with all conditions in last row', () => {
    const testBoard5 = [
      ["BAR", "BAR", "BAR", "7", "7"],
      ["7", "CHERRY", "BELL", "BAR", "7"],
      ["CHERRY", "BAR", "7", "CHERRY", "BELL"],
      ["BELL", "7", "CHERRY", "BAR", "7"],
      ["BAR", "CHERRY", "BELL", "7", "CHERRY"],
      ["PRISONER", "BELL", "COP", "CHERRY", "ROBBER"]
    ];
    if (!checkBonusTrigger(testBoard5)) {
      throw new Error('Should trigger with all conditions');
    }
  });
  
  runner.summary();
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
