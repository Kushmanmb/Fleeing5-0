# Copilot Instructions for fleeing-5-0

## Project Overview

This is a slot machine game called "Fleeing 5-0" that features performance-optimized JavaScript code. The game displays a 6-row by 5-column grid of symbols and triggers a bonus when specific conditions are met in any row: PRISONER on the leftmost column, ROBBER on the rightmost column, and COP in any middle column.

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
- PRISONER symbol on the leftmost column (column 0)
- ROBBER symbol on the rightmost column (column 4)
- COP symbol on any of the middle columns (columns 1, 2, or 3)

All three conditions must be met in at least one row to trigger the bonus.

## Testing

When modifying game logic, ensure all test cases in `test.js` pass:
- Positive case: All three conditions met
- Negative cases: Missing PRISONER, ROBBER, or COP
- Edge cases: Conditions met in different rows

Run `npm test` to verify changes don't break existing functionality.

## Common Development Tasks

### Adding a New Symbol
1. Add the symbol name to the `symbols` array in `src/main.js`
2. Determine if the symbol affects game mechanics:
   - **Decorative symbols** (like BAR, 7, CHERRY, BELL): No logic changes needed
   - **Bonus-triggering symbols** (like PRISONER, ROBBER, COP): Update `checkBonusTrigger()` logic
3. Add corresponding tests in `test.js` if the symbol affects game mechanics
4. Run `npm test` to verify the changes

### Modifying Game Grid Size
1. Update the `rows` and `cols` constants in `src/main.js`
2. Adjust CSS grid layout in `src/style.css` if needed
3. Update bonus trigger logic in `checkBonusTrigger()` if column count changes:
   - Update `row[0]` check if leftmost column index changes
   - Update `row[4]` check to match new rightmost column index
   - Update `row[1]`, `row[2]`, `row[3]` checks if middle column indices change
4. Update all test cases in `test.js` to reflect new grid dimensions and column positions

### Performance Optimization
When optimizing code, always:
- Profile before and after changes to measure impact
- Maintain the existing optimization patterns (DOM caching, DocumentFragment, etc.)
- Test that game logic remains correct after optimization
- Document any new optimization techniques in code comments

## Dependencies

This project has minimal dependencies:
- **webpack** and **webpack-cli**: Used for bundling (development dependency only)
- No runtime dependencies - vanilla JavaScript only

When adding dependencies:
- Prefer vanilla JavaScript solutions over external libraries when possible
- Keep the bundle size small to maintain performance
- Document why the dependency is necessary
- Update package.json appropriately

## Debugging Tips

- **Game Logic Issues**: Test with the test.js script first, which provides isolated unit tests
- **DOM Issues**: Open dist/index.html in browser and use browser DevTools console
- **Performance Issues**: Use browser Performance profiler to identify bottlenecks
- **Build Issues**: Check that all files exist in src/ directory before running build
- **Test Failures**: Run tests with node test.js directly to see detailed error messages

## File Organization

- **Source files** go in `src/` directory
- **Build output** goes to `dist/` directory (gitignored)
- **Test files** stay in root directory (test.js)
- **Build scripts** stay in root directory (build.js, webpack.config.js)
