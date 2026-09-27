const ROWS = 6;
const COLS = 5;

const SYMBOLS = [
  { id: "cop", name: "Cop", image: "assets/symbols/cop.png" },
  { id: "prisoner", name: "Prisoner", image: "assets/symbols/prisoner.png" },
  { id: "robber", name: "Robber", image: "assets/symbols/robber.png" },
  { id: "gold_badge", name: "Gold Badge", image: "assets/symbols/gold_badge.png" },
  { id: "silver_badge", name: "Silver Badge", image: "assets/symbols/silver_badge.png" },
  { id: "handcuffs", name: "Handcuffs", image: "assets/symbols/handcuffs.png" },
  { id: "flashlight", name: "Flashlight", image: "assets/symbols/flashlight.png" },
  { id: "marker", name: "Marker", image: "assets/symbols/marker.png" },
  { id: "casings", name: "Casings", image: "assets/symbols/casings.png" },
  { id: "a", name: "A", image: "assets/symbols/a.png" },
  { id: "k", name: "K", image: "assets/symbols/k.png" },
  { id: "q", name: "Q", image: "assets/symbols/q.png" },
  { id: "j", name: "J", image: "assets/symbols/j.png" }
];

const grid = document.getElementById("slot-grid");
const spinButton = document.getElementById("spin-btn");
const status = document.getElementById("status");

let board = [];

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function generateBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, randomSymbol)
  );
}

function renderBoard() {
  grid.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((symbol, colIndex) => {
      const cell = document.createElement("div");

      cell.className = "cell";
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      cell.dataset.symbol = symbol.id;

      const image = document.createElement("img");
      image.src = symbol.image;
      image.alt = symbol.name;
      image.loading = "eager";

      cell.appendChild(image);
      grid.appendChild(cell);
    });
  });
}

function getCellsForSymbol(symbolId) {
  return Array.from(
    document.querySelectorAll(`.cell[data-symbol="${symbolId}"]`)
  );
}

function checkChayseBonus() {
  let prisonerOnReel1 = false;
  let robberOnReel5 = false;
  let copInMiddle = false;

  for (let row = 0; row < ROWS; row++) {
    if (board[row][0].id === "prisoner") {
      prisonerOnReel1 = true;
    }

    if (board[row][4].id === "robber") {
      robberOnReel5 = true;
    }

    if (
      board[row][1].id === "cop" ||
      board[row][2].id === "cop" ||
      board[row][3].id === "cop"
    ) {
      copInMiddle = true;
    }
  }

  return prisonerOnReel1 && robberOnReel5 && copInMiddle;
}

function getChayseCells() {
  const cells = [];

  for (let row = 0; row < ROWS; row++) {
    if (board[row][0].id === "prisoner") {
      cells.push(
        document.querySelector(
          `.cell[data-row="${row}"][data-col="0"]`
        )
      );
    }

    if (board[row][4].id === "robber") {
      cells.push(
        document.querySelector(
          `.cell[data-row="${row}"][data-col="4"]`
        )
      );
    }

    for (let col = 1; col <= 3; col++) {
      if (board[row][col].id === "cop") {
        cells.push(
          document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
          )
        );
      }
    }
  }

  return cells.filter(Boolean);
}

function highlightChayse() {
  getChayseCells().forEach(cell => {
    cell.classList.add("highlight");
  });
}

function clearHighlights() {
  document.querySelectorAll(".highlight").forEach(cell => {
    cell.classList.remove("highlight");
  });
}

function playSiren() {
  const audio = new Audio("siren.mp3");
  audio.volume = 0.7;

  audio.play().catch(() => {
    // Browser may block autoplay until user interaction.
  });
}

async function animateSpin() {
  if (window.FleeingAnimations) {
    await window.FleeingAnimations.animateSpin();
  }
}

async function animateChayseBonus() {
  const cells = getChayseCells();

  if (window.FleeingAnimations) {
    await window.FleeingAnimations.animateChayseSequence(
      cells.filter(cell => cell.dataset.symbol === "prisoner"),
      cells.filter(cell => cell.dataset.symbol === "robber"),
      cells.filter(cell => cell.dataset.symbol === "cop")
    );
  }
}

async function spin() {
  spinButton.disabled = true;
  status.textContent = "🚨 Spinning...";

  clearHighlights();

  board = generateBoard();
  renderBoard();

  await animateSpin();

  if (checkChayseBonus()) {
    highlightChayse();
    playSiren();

    if (window.FleeingAnimations) {
      window.FleeingAnimations.animateScreenShake();
      window.FleeingAnimations.animateBigWin();
    }

    await animateChayseBonus();

    status.textContent =
      "🚨 CHAYSE BONUS! Prisoner + Robber + Cop!";
  } else {
    status.textContent = "Spin complete.";
  }

  spinButton.disabled = false;
}

spinButton.addEventListener("click", spin);

board = generateBoard();
renderBoard();
