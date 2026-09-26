const { BONUS_SYMBOL_IDS, SYMBOL_DEFINITIONS } = typeof require === "function"
  ? require("./symbols.js")
  : globalThis;

const rows = 6;
const cols = 5;
let board = [];
let cellElements = [];
let isSpinning = false;

// Cache DOM elements
const grid = document.getElementById("slot-grid");
const statusElement = document.getElementById("status");
const spinButton = document.getElementById("spin-btn");

// Preload siren sound
const siren = new Audio("siren.mp3");

function spin() {
  // Debounce: prevent multiple simultaneous spins
  if (isSpinning) return;
  isSpinning = true;

  board = [];
  cellElements = [];
  
  // Clear grid efficiently by removing children
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  
  // Use DocumentFragment to batch DOM operations
  const fragment = document.createDocumentFragment();
  
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const symbol = SYMBOL_DEFINITIONS[Math.floor(Math.random() * SYMBOL_DEFINITIONS.length)];
      row.push(symbol.id);
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.symbolId = symbol.id;
      cell.textContent = symbol.name;
      cellElements.push(cell);
      fragment.appendChild(cell);
    }
    board.push(row);
  }
  
  // Single DOM operation
  grid.appendChild(fragment);

  if (checkBonusTrigger(board)) {
    statusElement.textContent = "🚨 BONUS TRIGGERED!";
    highlightBonusSymbols();
    siren.currentTime = 0;
    siren.play();
  } else {
    statusElement.textContent = "No bonus this spin.";
  }
  
  isSpinning = false;
}

function checkBonusTrigger(board) {
  let prisonerOnReel1 = false;
  let robberOnReel5 = false;
  let copInMiddle = false;
  
  // Single loop through rows instead of multiple some() calls
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
    
    // Early exit if all conditions met
    if (prisonerOnReel1 && robberOnReel5 && copInMiddle) return true;
  }
  
  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

function highlightBonusSymbols() {
  // Use cached cell references instead of querySelectorAll
  cellElements.forEach((cell, index) => {
    const col = index % cols;
    const symbolId = cell.dataset.symbolId;
    if ((col === 0 && symbolId === BONUS_SYMBOL_IDS.left) ||
        (col === 4 && symbolId === BONUS_SYMBOL_IDS.right) ||
        ((col === 1 || col === 2 || col === 3) && symbolId === BONUS_SYMBOL_IDS.middle)) {
      cell.classList.add("highlight");
    }
  });
}

spinButton.addEventListener("click", spin);
