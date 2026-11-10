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

const $ = (id) => document.getElementById(id);
const grid = document.getElementById("slot-grid");
const statusElement = document.getElementById("status");
const spinButton = document.getElementById("spin-btn");
const balanceEl = $("balance");
const winEl = $("win");
const betSelect = $("bet-select");
const soundBtn = $("sound-btn");
const rulesDialog = $("rules-dialog");

const siren = new Audio("siren.mp3");
siren.preload = "auto";
let soundOn = true;

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
   CHAYSE BONUS CELLS (from RGS event)
================================ */

function getChayseCells(positions) {
  return positions
    .map(([row, col]) => cellElements[row * COLS + col])
    .filter(Boolean);
}

/* ================================
   HIGHLIGHT BONUS
================================ */

function highlightChayse(positions) {

  const cells = getChayseCells(positions);

  cells.forEach(cell => {
    cell.classList.add("highlight");
  });

  return cells;
}

/* ================================
   PLAY SIREN
================================ */

function playSiren() {

  if (!soundOn) {
    return;
  }

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

async function animateChayseBonus(positions) {

  const engine = animations();

  const cells = highlightChayse(positions);

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
   RGS-DRIVEN GAME FLOW
   Outcomes come only from the Stake Engine RGS.
================================ */

const params = FleeingRgs.parseParams(window.location.search);
const I18N = window.FleeingI18n;
const tr = (key) => I18N.t(params.lang, params.social, key);
const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));
const fmt = (n) => n.toFixed(2);

let client = null;
let balance = 0;
let betLevels = [];

function showError(error) {
  const message = error && error.code ? tr(error.code) : tr("generic");
  statusElement.textContent = error && message === error.code ? tr("generic") : message;
}

function setBalance(b) {
  if (b && typeof b.amount === "number") {
    balance = FleeingRgs.fromApi(b.amount);
    balanceEl.textContent = fmt(balance);
  }
}

function selectedBet() {
  return Number(betSelect.value);
}

function applyLabels() {
  $("balance-label").textContent = tr("balance");
  $("bet-label").textContent = tr("bet");
  $("win-label").textContent = tr("win");
  spinButton.textContent = tr("spin");
  $("rules-btn").textContent = tr("rules");
  $("rules-close").textContent = tr("close");
  soundBtn.textContent = `🔊 ${tr("sound")}`;
  $("rules-body").replaceChildren(
    ...I18N.rules(params.social).map((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      return p;
    })
  );
}

function boardFromEvent(event) {
  return event.board.map((row) => row.map((id) => SYMBOL_BY_ID[id]));
}

/* Renders RGS events. The multiplier shown is the RGS payout, never computed here. */
async function renderRound(events, round) {
  const bet = round && round.amount ? FleeingRgs.fromApi(round.amount) : selectedBet();
  let chayseCells = null;

  for (const event of events) {
    if (event.type === "reveal") {
      board = boardFromEvent(event);
      renderBoard();
      await animateSpin();
    } else if (event.type === "chayseTrigger") {
      chayseCells = event.cells;
    }
  }

  const multiplier = FleeingRgs.finalWinMultiplier(round);
  winEl.textContent = fmt(multiplier * bet);

  if (chayseCells) {
    statusElement.textContent = tr("chayse");
    await animateChayseBonus(chayseCells);
  } else {
    statusElement.textContent = multiplier > 0
      ? `${tr("totalWin")}: ${fmt(multiplier * bet)} (${multiplier}x)`
      : tr("noWin");
  }
}

async function spin() {
  if (isSpinning || !client) {
    return;
  }

  isSpinning = true;
  spinButton.disabled = true;
  winEl.textContent = fmt(0);
  statusElement.textContent = tr("spinning");

  try {
    const bet = selectedBet();
    FleeingRgs.validateBet(bet, authConfig, balance);
    const result = await FleeingRgs.playRound(client, bet, renderRound);
    setBalance(result.balance);
  } catch (error) {
    showError(error);
    // The round may be open on the server (e.g. end-round failed): refresh state.
    try { await initSession(); } catch (e) { /* keep error shown */ }
  }

  isSpinning = false;
  spinButton.disabled = !client;
}

let authConfig = null;

async function initSession() {
  statusElement.textContent = tr("connecting");
  const auth = await client.authenticate();
  authConfig = auth.config || {};
  setBalance(auth.balance);

  betLevels = (authConfig.betLevels || []).map(FleeingRgs.fromApi);
  betSelect.replaceChildren(
    ...betLevels.map((level) => {
      const option = document.createElement("option");
      option.value = String(level);
      option.textContent = fmt(level);
      return option;
    })
  );
  if (authConfig.defaultBetLevel) {
    betSelect.value = String(FleeingRgs.fromApi(authConfig.defaultBetLevel));
  }
  betSelect.disabled = false;

  if (auth.round && auth.round.active !== false) {
    statusElement.textContent = tr("recovering");
    const recovered = await FleeingRgs.recoverRound(client, auth, renderRound);
    if (recovered) {
      setBalance(recovered.balance);
    }
  } else {
    statusElement.textContent = tr("ready");
  }
  spinButton.disabled = false;
}

async function startReplay() {
  $("replay-banner").hidden = false;
  $("replay-banner").textContent = tr("replay");
  spinButton.disabled = true;
  const rgs = new FleeingRgs.RgsClient({ rgsUrl: params.rgsUrl, sessionID: "replay" });
  const data = await rgs.replay(params);
  const round = { state: data.state, payoutMultiplier: data.payoutMultiplier, amount: FleeingRgs.toApi(data.costMultiplier || 1) };
  await renderRound(FleeingRgs.roundEvents(round), round);
  spinButton.disabled = false;
}

async function boot() {
  applyLabels();
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.textContent = `${soundOn ? "🔊" : "🔇"} ${tr("sound")}`;
  });
  $("rules-btn").addEventListener("click", () => rulesDialog.showModal());
  $("rules-close").addEventListener("click", () => rulesDialog.close());

  if (params.replay) {
    spinButton.addEventListener("click", () => startReplay().catch(showError));
    return startReplay();
  }
  if (!params.sessionID || !params.rgsUrl) {
    statusElement.textContent = tr("errMissing");
    return;
  }
  client = new FleeingRgs.RgsClient({
    rgsUrl: params.rgsUrl,
    sessionID: params.sessionID,
    lang: params.lang,
    currency: params.currency
  });
  spinButton.addEventListener("click", spin);
  await initSession();
}

boot().catch(showError);
