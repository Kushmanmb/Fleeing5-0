# fleeing-5-0

A slot machine game with performance optimizations.

## Performance Improvements

The code has been optimized with the following improvements:

1. **DOM Element Caching** - Frequently accessed DOM elements are cached to avoid repeated `getElementById` calls
2. **DocumentFragment Usage** - DOM operations are batched using DocumentFragment to reduce reflows and repaints
3. **Cell Reference Caching** - Cell elements are stored during creation to avoid `querySelectorAll` calls
4. **Optimized Loop Logic** - Single loop in `checkBonusTrigger` instead of multiple `some()` calls with early exit
5. **Spin Debouncing** - Prevents multiple simultaneous spins with `isSpinning` flag

## How to Run

Open `index.html` in a web browser to play the game.