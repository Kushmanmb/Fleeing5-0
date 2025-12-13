const symbols = ["PRISONER", "ROBBER", "COP", "BAR", "7", "CHERRY", "BELL"];

const rows = 6;
const cols = 5;
let board = [];
let cellElements = [];

// Preload siren sound
const siren = new Audio("siren.mp3");

function spin() {
  board = [];
  cellElements = [];
  const grid = document.getElementById("slot-grid");
  grid.innerHTML = "";
  
  // Use DocumentFragment to batch DOM updates
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
  
  // Single DOM operation instead of 30
  grid.appendChild(fragment);

  if (checkBonusTrigger(board)) {
    document.getElementById("status").textContent = "🚨 BONUS TRIGGERED!";
    highlightBonusSymbols();
    siren.currentTime = 0;
    siren.play();
  } else {
    document.getElementById("status").textContent = "No bonus this spin.";
  }
}

function checkBonusTrigger(board) {
  // Single pass through board instead of three separate iterations
  let prisonerOnReel1 = false;
  let robberOnReel5 = false;
  let copInMiddle = false;
  
  for (let r = 0; r < rows; r++) {
    if (board[r][0] === "PRISONER") prisonerOnReel1 = true;
    if (board[r][4] === "ROBBER") robberOnReel5 = true;
    if (board[r][1] === "COP" || board[r][2] === "COP" || board[r][3] === "COP") copInMiddle = true;
    
    // Early exit if all conditions met
    if (prisonerOnReel1 && robberOnReel5 && copInMiddle) break;
  }
  
  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

function highlightBonusSymbols() {
  // Use stored cell references instead of querySelectorAll
  cellElements.forEach((cell, index) => {
    const col = index % cols;
    const text = cell.textContent;
    if ((col === 0 && text === "PRISONER") ||
        (col === 4 && text === "ROBBER") ||
        ([1, 2, 3].includes(col) && text === "COP")) {
      cell.classList.add("highlight");
    }
  });
}

document.getElementById("spin-btn").addEventListener("click", spin);