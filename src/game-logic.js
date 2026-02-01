/**
 * Shared game logic for the Fleeing 5-0 slot machine
 */

/**
 * Check if the bonus should be triggered based on the board state
 * 
 * Bonus triggers when all three conditions are met:
 * - PRISONER symbol on the leftmost column (column 0)
 * - ROBBER symbol on the rightmost column (column 4)
 * - COP symbol in any middle column (columns 1, 2, or 3)
 * 
 * @param {Array<Array<string>>} board - The game board (6x5 grid of symbols)
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

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkBonusTrigger };
}
