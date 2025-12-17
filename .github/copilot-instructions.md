# Copilot Instructions for fleeing-5-0

## Project Overview

This is a slot machine game called "Fleeing 5-0" that features performance-optimized JavaScript code. The game displays a 6x5 grid of symbols and triggers a bonus when specific conditions are met (PRISONER on reel 1, ROBBER on reel 5, and COP in middle reels 2-4).

## Technology Stack

- **Language**: JavaScript (ES6+)
- **Build Tools**: Node.js, Webpack 5
- **Testing**: Custom Node.js test script
- **CI/CD**: GitHub Actions with Node.js 18.x, 20.x, 22.x

## Build and Test Commands

- `npm run build` - Builds the project by copying files from src/ to dist/
- `npm run webpack` - Bundles the project using Webpack in production mode
- `npm test` - Runs the test suite with test.js

## Code Conventions and Best Practices

### Performance Optimizations

This project emphasizes performance optimizations. Always maintain these patterns:

1. **DOM Element Caching**: Cache frequently accessed DOM elements in variables at the top of the file to avoid repeated `getElementById` calls.

2. **DocumentFragment Usage**: Batch DOM operations using DocumentFragment to reduce reflows and repaints when adding multiple elements.

3. **Cell Reference Caching**: Store cell elements during creation in arrays to avoid `querySelectorAll` calls later.

4. **Optimized Loop Logic**: Use single loops with early exit instead of multiple `some()` or `every()` calls when checking conditions.

5. **Spin Debouncing**: Use boolean flags (like `isSpinning`) to prevent multiple simultaneous operations.

### Code Style

- Use `const` and `let` instead of `var`
- Use template literals for string interpolation
- Keep functions focused and single-purpose
- Add comments only for complex logic or performance-related optimizations

## Project Structure

```
fleeing-5-0/
├── src/                 # Source files
│   ├── main.js          # Main game logic with performance optimizations
│   ├── index.html       # HTML structure
│   ├── style.css        # Styles
│   └── siren.mp3        # Sound effect
├── dist/                # Build output (gitignored)
├── test.js              # Test suite for game logic
├── build.js             # Build script that copies files to dist/
├── webpack.config.js    # Webpack configuration
└── package.json         # Project dependencies and scripts
```

## Key Files

- **src/main.js**: Contains the core game logic including `spin()`, `checkBonusTrigger()`, and `highlightBonusSymbols()` functions
- **test.js**: Contains unit tests for the bonus trigger logic with multiple test cases
- **build.js**: Simple build script that copies files from src/ to dist/

## Game Logic

The bonus trigger requires:
- PRISONER symbol on the leftmost reel (column 0)
- ROBBER symbol on the rightmost reel (column 4)
- COP symbol on any of the middle reels (columns 1, 2, or 3)

All three conditions must be met in at least one row to trigger the bonus.

## Testing

When modifying game logic, ensure all test cases in `test.js` pass:
- Positive case: All three conditions met
- Negative cases: Missing PRISONER, ROBBER, or COP
- Edge cases: Conditions met in different rows

Run `npm test` to verify changes don't break existing functionality.
