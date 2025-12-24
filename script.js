const symbols = ["PRISONER", "ROBBER", "COP", "BAR", "7", "CHERRY", "BELL"];

const rows = 6;
const cols = 5;
let board = [];

// Preload siren sound
const siren = new Audio("siren.mp3");

function spin() {
  board = [];
  const grid = document.getElementById("slot-grid");
  grid.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      row.push(symbol);
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.textContent = symbol;
      grid.appendChild(cell);
    }
    board.push(row);
  }

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
  let prisonerOnReel1 = board.some(row => row[0] === "PRISONER");
  let robberOnReel5   = board.some(row => row[4] === "ROBBER");
  let copInMiddle     = board.some(row => row[1] === "COP" || 
                                         row[2] === "COP" || 
                                         row[3] === "COP");
  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

function highlightBonusSymbols() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    const col = index % cols;
    const text = cell.textContent;
    if ((col === 0 && text === "PRISONER") ||
        (col === 4 && text === "ROBBER") ||
        ((col === 1 || col === 2 || col === 3) && text === "COP")) {
      cell.classList.add("highlight");
    }
  });
}

document.getElementById("spin-btn").addEventListener("click", spin);
