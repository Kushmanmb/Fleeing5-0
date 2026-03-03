# Coding Guidelines

## Table of Contents
- [Introduction](#introduction)
- [Language Conventions](#language-conventions)
- [Code Patterns](#code-patterns)
- [Architectural Guidelines](#architectural-guidelines)
- [Performance Optimization](#performance-optimization)
- [Style Guide](#style-guide)
- [Testing Standards](#testing-standards)
- [Security Best Practices](#security-best-practices)
- [Documentation Standards](#documentation-standards)

## Introduction

This document outlines the coding standards and best practices for the kywmahmb project. Following these guidelines ensures code consistency, maintainability, and quality across the codebase.

### Goals
- Write clean, readable, and maintainable code
- Optimize for performance without sacrificing clarity
- Ensure code security and reliability
- Facilitate collaboration and code reviews

## Language Conventions

### JavaScript/ES6+

#### Variable Declarations
- **Use `const` by default**: Variables that won't be reassigned should use `const`
- **Use `let` for reassignment**: Only use `let` when the variable will be reassigned
- **Never use `var`**: Avoid `var` to prevent scope-related issues

```javascript
// Good
const maxRetries = 3;
let currentAttempt = 0;

// Bad
var maxRetries = 3;
var currentAttempt = 0;
```

#### Naming Conventions
- **Variables and Functions**: camelCase
- **Constants**: UPPER_CASE_SNAKE_CASE for true constants
- **Classes**: PascalCase
- **Private Properties**: prefix with underscore `_privateProp`

```javascript
// Good
const MAX_CONNECTIONS = 100;
let userCount = 0;
class UserManager {}
const _privateHelper = () => {};

// Bad
const max_connections = 100;
let UserCount = 0;
class userManager {}
```

#### String Handling
- **Use template literals** for string interpolation
- **Use single quotes** for simple strings
- **Use template literals** when including variables

```javascript
// Good
const greeting = 'Hello';
const message = `${greeting}, ${userName}!`;

// Bad
const message = greeting + ', ' + userName + '!';
```

#### Functions
- **Prefer arrow functions** for callbacks and short functions
- **Use regular functions** for methods and when `this` binding is needed
- **Keep functions small and focused**: Each function should do one thing well

```javascript
// Good - Arrow function for callback
const doubled = numbers.map(n => n * 2);

// Good - Regular function for method
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad - Too many responsibilities
function processUserDataAndSendEmailAndUpdateDatabase(user) {
  // Too much happening in one function
}
```

#### Async/Await
- **Prefer async/await** over promise chains for better readability
- **Always handle errors** in async functions

```javascript
// Good
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Less ideal
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .catch(error => {
      console.error('Failed to fetch user:', error);
      throw error;
    });
}
```

## Code Patterns

### Design Patterns

#### Module Pattern
Encapsulate related functionality in modules:

```javascript
const GameModule = (() => {
  // Private variables
  let score = 0;
  
  // Private methods
  const updateScore = (points) => {
    score += points;
  };
  
  // Public API
  return {
    getScore: () => score,
    addPoints: (points) => updateScore(points)
  };
})();
```

#### Factory Pattern
Use for creating objects:

```javascript
function createSymbol(type, value) {
  return {
    type,
    value,
    render() {
      return `<div class="${type}">${value}</div>`;
    }
  };
}
```

#### Observer Pattern
For event-driven code:

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
}
```

### Anti-Patterns to Avoid

#### Callback Hell
```javascript
// Bad - Callback hell
doSomething((result1) => {
  doSomethingElse(result1, (result2) => {
    doThirdThing(result2, (result3) => {
      // More nesting...
    });
  });
});

// Good - Use async/await
async function processSequence() {
  const result1 = await doSomething();
  const result2 = await doSomethingElse(result1);
  const result3 = await doThirdThing(result2);
  return result3;
}
```

#### Magic Numbers
```javascript
// Bad
if (user.age >= 18) {
  // Can vote
}

// Good
const VOTING_AGE = 18;
if (user.age >= VOTING_AGE) {
  // Can vote
}
```

## Architectural Guidelines

### Separation of Concerns
- Keep business logic separate from presentation
- Separate data access from business logic
- Use layers: Presentation → Business Logic → Data Access

### Single Responsibility Principle
Each module/function should have one clear purpose:

```javascript
// Good - Single responsibility
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendEmail(to, subject, body) {
  // Email sending logic
}

// Bad - Multiple responsibilities
function validateAndSendEmail(email, subject, body) {
  // Validation and sending mixed together
}
```

### Dependency Management
- Keep dependencies minimal
- Prefer standard library over external packages when practical
- Document why each dependency is needed
- Regularly audit and update dependencies

## Performance Optimization

### DOM Manipulation

#### Cache DOM References
```javascript
// Good - Cache reference
const gameGrid = document.getElementById('game-grid');
const cells = Array.from(gameGrid.children);

function updateCells() {
  cells.forEach(cell => {
    // Use cached reference
  });
}

// Bad - Repeated queries
function updateCells() {
  const grid = document.getElementById('game-grid');
  const cells = Array.from(grid.children);
  // Querying DOM on every call
}
```

#### Batch DOM Updates
```javascript
// Good - Use DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}
container.appendChild(fragment); // Single DOM update

// Bad - Multiple DOM updates
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  container.appendChild(div); // Causes reflow each time
}
```

### Loop Optimization

#### Early Exit
```javascript
// Good - Early exit
function findUser(users, id) {
  for (const user of users) {
    if (user.id === id) {
      return user; // Exit as soon as found
    }
  }
  return null;
}

// Less efficient - Checking all items
function findUser(users, id) {
  return users.filter(user => user.id === id)[0];
}
```

#### Avoid Nested Loops
```javascript
// Good - Use Map for O(n) lookup
const userMap = new Map(users.map(u => [u.id, u]));
const matches = orders.map(o => userMap.get(o.userId));

// Bad - O(n²) nested loops
const matches = orders.map(o => 
  users.find(u => u.id === o.userId)
);
```

### Memory Management
- Remove event listeners when no longer needed
- Clear intervals and timeouts
- Avoid memory leaks from closures

```javascript
// Good - Cleanup
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    this.element.addEventListener('click', this.handleClick);
  }
  
  destroy() {
    this.element.removeEventListener('click', this.handleClick);
  }
}
```

## Style Guide

### Code Formatting

#### Indentation
- Use **2 spaces** for indentation (not tabs)
- Be consistent throughout the file

#### Line Length
- Keep lines under **100 characters** when practical
- Break long lines at logical points

```javascript
// Good
const result = calculateComplexValue(
  parameter1,
  parameter2,
  parameter3
);

// Less ideal
const result = calculateComplexValue(parameter1, parameter2, parameter3, parameter4, parameter5);
```

#### Spacing
- Add space after keywords: `if (`, `for (`, `while (`
- Add space around operators: `x + y`, not `x+y`
- No space before semicolons
- Add blank lines between logical sections

```javascript
// Good
if (condition) {
  doSomething();
}

const result = x + y;

// Bad
if(condition){
  doSomething() ;
}

const result=x+y;
```

### Comments

#### When to Comment
- **Do**: Explain complex logic or algorithms
- **Do**: Document performance optimizations
- **Do**: Explain "why" not "what"
- **Don't**: State the obvious
- **Don't**: Leave commented-out code

```javascript
// Good - Explains why
// Using single loop with early exit for O(n) performance
// instead of multiple array methods which would be O(n²)
function checkBonusTrigger(grid) {
  // Implementation
}

// Bad - States the obvious
// This function adds two numbers
function add(a, b) {
  return a + b; // Return the sum
}
```

#### JSDoc Comments
Use JSDoc for functions and classes:

```javascript
/**
 * Validates user input and sanitizes data
 * @param {string} input - The user input to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxLength - Maximum allowed length
 * @returns {Object} Validation result with isValid and sanitized value
 */
function validateInput(input, options) {
  // Implementation
}
```

## Testing Standards

### Test Structure
Follow the Arrange-Act-Assert pattern:

```javascript
function testBonusTrigger() {
  // Arrange - Set up test data
  const grid = [
    ['PRISONER', 'BAR', 'COP', '7', 'ROBBER'],
    // ... more rows
  ];
  
  // Act - Execute the function
  const result = checkBonusTrigger(grid);
  
  // Assert - Verify the result
  if (!result) {
    throw new Error('Expected bonus trigger but got false');
  }
}
```

### Test Coverage
- **Unit Tests**: Test individual functions in isolation
- **Integration Tests**: Test how components work together
- **Edge Cases**: Test boundary conditions and error cases

```javascript
// Test edge cases
testEmptyGrid();
testSingleRow();
testAllSameSymbol();
testBonusInLastRow();
```

### Test Naming
Use descriptive names that explain what is being tested:

```javascript
// Good
function testBonusTriggerWithAllRequiredSymbols() {}
function testBonusTriggerMissingPrisoner() {}
function testBonusTriggerMissingRobber() {}

// Bad
function test1() {}
function test2() {}
```

## Security Best Practices

### Input Validation
Always validate and sanitize user input:

```javascript
function validateAddress(address) {
  // Check format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid address format');
  }
  return address.toLowerCase();
}
```

### Environment Variables
- Never commit secrets to version control
- Use `.env` files for sensitive data
- Add `.env` to `.gitignore`
- Provide `.env.example` as a template

### Dependencies
- Regularly audit dependencies: `npm audit`
- Keep dependencies up to date
- Remove unused dependencies
- Review dependency licenses

### Error Handling
Don't expose sensitive information in error messages:

```javascript
// Good
catch (error) {
  console.error('Operation failed');
  // Log detailed error internally
  logger.error('Detailed error:', error);
  throw new Error('Operation failed');
}

// Bad
catch (error) {
  throw new Error(`Database error: ${error.message} at ${dbConnection.host}`);
}
```

## Documentation Standards

### README Files
Every project should have a clear README with:
- Project description
- Installation instructions
- Usage examples
- API documentation
- Contributing guidelines
- License information

### Code Documentation
- Document public APIs
- Explain complex algorithms
- Include usage examples
- Keep documentation up to date with code changes

### Inline Documentation
```javascript
/**
 * Game class manages the slot machine game state and logic
 * 
 * @example
 * const game = new Game(6, 5);
 * game.spin();
 */
class Game {
  /**
   * Creates a new game instance
   * @param {number} rows - Number of rows in the grid
   * @param {number} cols - Number of columns in the grid
   */
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
  }
}
```

### Change Documentation
- Update CHANGELOG.md for significant changes
- Write clear commit messages
- Document breaking changes prominently
- Include migration guides when needed

## Best Practices Summary

### Do's ✅
- Write small, focused functions
- Use meaningful variable names
- Handle errors appropriately
- Write tests for your code
- Document complex logic
- Follow consistent code style
- Cache frequently accessed values
- Optimize performance-critical paths
- Validate user input
- Keep dependencies minimal

### Don'ts ❌
- Don't use `var`
- Don't ignore errors
- Don't commit commented-out code
- Don't hard-code sensitive data
- Don't write overly complex functions
- Don't skip tests
- Don't leave TODO comments long-term
- Don't optimize prematurely
- Don't expose sensitive data in errors
- Don't mix concerns in a single function

## Conclusion

Following these guidelines helps maintain code quality and consistency. When in doubt:
1. Keep it simple
2. Make it readable
3. Optimize when needed
4. Test thoroughly
5. Document clearly

Remember: Code is read more often than it's written. Write code for humans first, machines second.
