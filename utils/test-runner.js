/**
 * Shared test runner utility for consistent test execution across all test files
 * Provides a simple test framework with consistent output formatting
 */

class TestRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Run a single test case
   * @param {string} name - Test name/description
   * @param {Function} testFn - Test function (can be async)
   */
  async test(name, testFn) {
    try {
      await testFn();
      console.log(`✓ ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`✗ ${name}: ${error.message}`);
      this.failed++;
    }
  }

  /**
   * Print test summary and exit with appropriate code
   */
  summary() {
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary:');
    console.log(`  Passed: ${this.passed}`);
    console.log(`  Failed: ${this.failed}`);
    console.log(`  Total:  ${this.passed + this.failed}`);

    if (this.failed > 0) {
      console.log('\n✗ Some tests failed');
      process.exit(1);
    } else {
      console.log('\n✓ All tests passed');
      process.exit(0);
    }
  }

  /**
   * Start the test suite
   */
  start() {
    console.log(`${this.suiteName}\n`);
  }
}

/**
 * Create a new test runner instance
 * @param {string} suiteName - Name of the test suite
 * @returns {TestRunner} Test runner instance
 */
function createTestRunner(suiteName) {
  return new TestRunner(suiteName);
}

module.exports = { createTestRunner, TestRunner };
