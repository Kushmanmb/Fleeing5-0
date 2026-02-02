/**
 * Shared game logic for the slot machine
 * Contains core functions used in both the main game and tests
 * Works in both Node.js and browser environments
 */

const symbols = ["PRISONER", "ROBBER", "COP", "BAR", "7", "CHERRY", "BELL"];
const rows = 6;
const cols = 5;

/**
 * Check if the bonus should be triggered based on the board state
 * Bonus triggers when:
 * - PRISONER symbol on the leftmost column (reel 1)
 * - ROBBER symbol on the rightmost column (reel 5)
 * - COP symbol on any of the middle columns (reels 2, 3, or 4)
 * 
 * @param {Array<Array<string>>} board - The game board (2D array of symbols)
 * @returns {boolean} - True if bonus should trigger, false otherwise
 */
function checkBonusTrigger(board) {
  let prisonerOnReel1 = false;
  let robberOnReel5 = false;
  let copInMiddle = false;
  
  // Single loop through rows instead of multiple some() calls
  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    if (row[0] === "PRISONER") prisonerOnReel1 = true;
    if (row[4] === "ROBBER") robberOnReel5 = true;
    if (row[1] === "COP" || row[2] === "COP" || row[3] === "COP") copInMiddle = true;
    
    // Early exit if all conditions met
    if (prisonerOnReel1 && robberOnReel5 && copInMiddle) return true;
  }
  
  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    symbols,
    rows,
    cols,
    checkBonusTrigger,
  };
}
