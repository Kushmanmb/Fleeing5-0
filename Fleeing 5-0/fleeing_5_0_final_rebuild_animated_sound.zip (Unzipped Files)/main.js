const symbols = ["PRISONER", "ROBBER", "COP", "BAR", "7", "CHERRY", "BELL"];

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
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      row.push(symbol);
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.textContent = symbol;
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
    if (row[0] === "PRISONER") prisonerOnReel1 = true;
    if (row[4] === "ROBBER") robberOnReel5 = true;
    if (row[1] === "COP" || row[2] === "COP" || row[3] === "COP") copInMiddle = true;
    
    // Early exit if all conditions met
    if (prisonerOnReel1 && robberOnReel5 && copInMiddle) return true;
  }
  
  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

function highlightBonusSymbols() {
  // Use cached cell references instead of querySelectorAll
  cellElements.forEach((cell, index) => {
    const col = index % cols;
    const text = cell.textContent;
    if ((col === 0 && text === "PRISONER") ||
        (col === 4 && text === "ROBBER") ||
        ((col === 1 || col === 2 || col === 3) && text === "COP")) {
      cell.classList.add("highlight");
    }
  });
}

spinButton.addEventListener("click", spin);
