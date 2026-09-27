const ROWS = 6;
const COLS = 5;

const SYMBOLS = [
  { id: "cop", name: "Cop", value: 10, image: "assets/symbols/cop.png" },
  { id: "prisoner", name: "Prisoner", value: 10, image: "assets/symbols/prisoner.png" },
  { id: "robber", name: "Robber", value: 10, image: "assets/symbols/robber.png" },

  { id: "gold_badge", name: "Gold Badge", value: 8, image: "assets/symbols/gold_badge.png" },
  { id: "silver_badge", name: "Silver Badge", value: 6, image: "assets/symbols/silver_badge.png" },
  { id: "handcuffs", name: "Handcuffs", value: 5, image: "assets/symbols/handcuffs.png" },

  { id: "flashlight", name: "Flashlight", value: 4, image: "assets/symbols/flashlight.png" },
  { id: "marker", name: "Marker", value: 3, image: "assets/symbols/marker.png" },
  { id: "casings", name: "Casings", value: 3, image: "assets/symbols/casings.png" },

  { id: "a", name: "A", value: 2, image: "assets/symbols/a.png" },
  { id: "k", name: "K", value: 2, image: "assets/symbols/k.png" },
  { id: "q", name: "Q", value: 2, image: "assets/symbols/q.png" },
  { id: "j", name: "J", value: 2, image: "assets/symbols/j.png" }
];

let board = [];
let cellElements = [];
let isSpinning = false;

/* ================================
   DOM
================================ */

const grid = document.getElementById("slot-grid");
const statusElement = document.getElementById("status");
const spinButton = document.getElementById("spin-btn");

const siren = new Audio("siren.mp3");
siren.preload = "auto";

/* ================================
   RANDOM SYMBOL
================================ */

function randomSymbol() {
  return SYMBOLS[
    Math.floor(Math.random() * SYMBOLS.length)
  ];
}

/* ================================
   CREATE BOARD
================================ */

function generateBoard() {
  const newBoard = [];

  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];

    for (let col = 0; col < COLS; col++) {
      currentRow.push(randomSymbol());
    }

    newBoard.push(currentRow);
  }

  return newBoard;
}

/* ================================
   RENDER BOARD
================================ */

function renderBoard() {
  grid.replaceChildren();
  cellElements = [];

  const fragment = document.createDocumentFragment();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {

      const symbol = board[row][col];

      const cell = document.createElement("div");

      cell.className = "cell";

      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.symbol = symbol.id;

      const image = document.createElement("img");

      image.src = symbol.image;
      image.alt = symbol.name;
      image.loading = "eager";

      image.onerror = () => {
        image.style.display = "none";
        cell.textContent = symbol.name;
      };

      cell.appendChild(image);

      fragment.appendChild(cell);

      cellElements.push(cell);
    }
  }

  grid.appendChild(fragment);
}

/* ================================
   FIND CELLS
================================ */

function getCellsForSymbol(symbolId) {
  return cellElements.filter(
    cell => cell.dataset.symbol === symbolId
  );
}

/* ================================
   CHAYSE BONUS
================================ */

/*
   Prisoner = reel 1
   Robber   = reel 5
   Cop      = reels 2, 3 or 4

   Vertical position does NOT matter.
*/

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

  return (
    prisonerOnReel1 &&
    robberOnReel5 &&
    copInMiddle
  );
}

/* ================================
   BONUS CELLS
================================ */

function getChayseCells() {

  const cells = [];

  cellElements.forEach(cell => {

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    const symbol = board[row][col];

    const prisoner =
      col === 0 &&
      symbol.id === "prisoner";

    const robber =
      col === 4 &&
      symbol.id === "robber";

    const cop =
      (col === 1 ||
       col === 2 ||
       col === 3) &&
      symbol.id === "cop";

    if (prisoner || robber || cop) {
      cells.push(cell);
    }
  });

  return cells;
}

/* ================================
   HIGHLIGHT BONUS
================================ */

function highlightChayse() {

  const cells = getChayseCells();

  cells.forEach(cell => {
    cell.classList.add("highlight");
  });

  return cells;
}

/* ================================
   PLAY SIREN
================================ */

function playSiren() {

  siren.currentTime = 0;

  const result = siren.play();

  if (
    result &&
    typeof result.catch === "function"
  ) {
    result.catch(() => {});
  }
}

/* ================================
   ANIMATION ENGINE
================================ */

function animations() {

  return window.FleeingAnimations || null;
}

/* ================================
   SPIN ANIMATION
================================ */

async function animateSpin() {

  const engine = animations();

  if (!engine) {
    return;
  }

  await engine.animateSpin();

  await engine.animateLanding(
    cellElements
  );
}

/* ================================
   CHAYSE ANIMATION
================================ */

async function animateChayseBonus() {

  const engine = animations();

  const cells = highlightChayse();

  playSiren();

  if (!engine) {
    return;
  }

  await engine.animateChayse(cells);

  engine.animateScreenShake();

  engine.animateParticles(cells);

  engine.animateBigWin();
}

/* ================================
   SPIN
================================ */

async function spin() {

  if (isSpinning) {
    return;
  }

  isSpinning = true;

  spinButton.disabled = true;

  statusElement.textContent =
    "Spinning...";

  board = generateBoard();

  renderBoard();

  await animateSpin();

  const chayseTriggered =
    checkChayseBonus();

  if (chayseTriggered) {

    statusElement.textContent =
      "🚨 CHAYSE BONUS TRIGGERED! 🚨";

    await animateChayseBonus();

  } else {

    statusElement.textContent =
      "No bonus this spin.";
  }

  isSpinning = false;

  spinButton.disabled = false;
}

/* ================================
   START GAME
================================ */

spinButton.addEventListener(
  "click",
  spin
);
