/*
 * FLEEING 5-0
 * Full Symbol Animation Engine
 */

const FLEEING_ANIMATION = {
  spinMs: 650,
  landingMs: 280,
  winMs: 520,
  removeMs: 360,
  cascadeMs: 420,
  multiplierMs: 700,
  chayseMs: 1400,
  freeSpinMs: 900
};

function getCell(row, col) {
  return document.querySelector(
    `.cell[data-row="${row}"][data-col="${col}"]`
  );
}

function getAllCells() {
  return Array.from(document.querySelectorAll(".cell"));
}

function animateCells(cells, className, duration) {
  if (!cells || cells.length === 0) {
    return Promise.resolve();
  }

  cells.forEach((cell) => {
    cell.classList.remove(className);

    // Restart CSS animation.
    void cell.offsetWidth;

    cell.classList.add(className);
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      cells.forEach((cell) => {
        cell.classList.remove(className);
      });

      resolve();
    }, duration);
  });
}

/*
 * REEL SPIN
 */

function animateSpin() {
  return animateCells(
    getAllCells(),
    "anim-spin",
    FLEEING_ANIMATION.spinMs
  );
}

/*
 * SYMBOL LANDING
 */

function animateLanding(cells = []) {
  return animateCells(
    cells,
    "anim-land",
    FLEEING_ANIMATION.landingMs
  );
}

/*
 * WINNING SYMBOLS
 */

function animateWin(cells = []) {
  return animateCells(
    cells,
    "anim-win",
    FLEEING_ANIMATION.winMs
  );
}

/*
 * SYMBOL REMOVAL
 *
 * Used when a winning cluster disappears.
 */

function animateRemove(cells = []) {
  return animateCells(
    cells,
    "anim-remove",
    FLEEING_ANIMATION.removeMs
  );
}

/*
 * CASCADE
 *
 * Used when symbols fall into empty spaces.
 */

function animateCascade(cells = []) {
  return animateCells(
    cells,
    "anim-cascade",
    FLEEING_ANIMATION.cascadeMs
  );
}

/*
 * MULTIPLIER
 *
 * Example:
 * animateMultiplier(cells, 25)
 *
 * Produces a 25× animation.
 */

function animateMultiplier(cells = [], multiplier = 1) {
  cells.forEach((cell) => {
    cell.dataset.multiplier = `${multiplier}×`;
  });

  return animateCells(
    cells,
    "anim-multiplier",
    FLEEING_ANIMATION.multiplierMs
  );
}

/*
 * CHAYSE BONUS
 *
 * Prisoner + Robber + Cop.
 */

function animateChayse(cells = []) {
  return animateCells(
    cells,
    "anim-chayse",
    FLEEING_ANIMATION.chayseMs
  );
}

/*
 * BONUS SYMBOLS
 *
 * Automatically finds the highlighted
 * Cop / Robber / Prisoner symbols.
 */

function animateBonusSymbols() {
  const cells = Array.from(
    document.querySelectorAll(".highlight")
  );

  return animateChayse(cells);
}

/*
 * COP ACTION
 */

function animateCop(cells = []) {
  return animateCells(
    cells,
    "anim-cop",
    900
  );
}

/*
 * ROBBER ACTION
 */

function animateRobber(cells = []) {
  return animateCells(
    cells,
    "anim-robber",
    900
  );
}

/*
 * PRISONER ACTION
 */

function animatePrisoner(cells = []) {
  return animateCells(
    cells,
    "anim-prisoner",
    900
  );
}

/*
 * BADGE / FREE-SPIN TRIGGER
 */

function animateBadge(cells = []) {
  return animateCells(
    cells,
    "anim-badge",
    FLEEING_ANIMATION.freeSpinMs
  );
}

/*
 * 250× MAX MULTIPLIER
 */

function animateMaxMultiplier(cells = []) {
  return animateMultiplier(cells, 250);
}

/*
 * FULL WIN SEQUENCE
 *
 * win → remove → cascade
 */

async function animateWinSequence(
  winningCells = [],
  fallingCells = []
) {
  await animateWin(winningCells);

  await animateRemove(winningCells);

  await animateCascade(fallingCells);
}

/*
 * FULL CHAYSE SEQUENCE
 */

async function animateChayseSequence(
  prisonerCells = [],
  robberCells = [],
  copCells = []
) {
  await animatePrisoner(prisonerCells);

  await animateRobber(robberCells);

  await animateCop(copCells);

  await animateChayse([
    ...prisonerCells,
    ...robberCells,
    ...copCells
  ]);
}

/*
 * FREE-SPIN SEQUENCE
 */

async function animateFreeSpinTrigger(
  badgeCells = []
) {
  await animateBadge(badgeCells);

  badgeCells.forEach((cell) => {
    cell.classList.add("anim-free-spins");
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      badgeCells.forEach((cell) => {
        cell.classList.remove("anim-free-spins");
      });

      resolve();
    }, 1000);
  });
}

/*
 * SCREEN SHAKE
 */

function animateScreenShake() {
  const game = document.querySelector("#slot-grid");

  if (!game) return;

  game.classList.remove("screen-shake");

  void game.offsetWidth;

  game.classList.add("screen-shake");

  setTimeout(() => {
    game.classList.remove("screen-shake");
  }, 500);
}

/*
 * BIG WIN
 */

function animateBigWin() {
  const game = document.querySelector("#slot-grid");

  if (!game) return;

  game.classList.remove("big-win");

  void game.offsetWidth;

  game.classList.add("big-win");

  setTimeout(() => {
    game.classList.remove("big-win");
  }, 1500);
}

/*
 * PARTICLE EFFECT
 */

function createParticles(cell, amount = 12) {
  if (!cell) return;

  const rect = cell.getBoundingClientRect();

  for (let i = 0; i < amount; i++) {
    const particle = document.createElement("span");

    particle.className = "win-particle";

    particle.style.left =
      `${rect.left + rect.width / 2}px`;

    particle.style.top =
      `${rect.top + rect.height / 2}px`;

    particle.style.setProperty(
      "--particle-x",
      `${Math.random() * 120 - 60}px`
    );

    particle.style.setProperty(
      "--particle-y",
      `${Math.random() * 120 - 60}px`
    );

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 900);
  }
}

/*
 * CREATE PARTICLES FOR A WIN
 */

function animateParticles(cells = []) {
  cells.forEach((cell) => {
    createParticles(cell);
  });
}

/*
 * EXPORT ANIMATION ENGINE
 *
 * main.js can access everything through:
 *
 * FleeingAnimations.animateSpin()
 */

window.FleeingAnimations = {
  animateSpin,
  animateLanding,
  animateWin,
  animateRemove,
  animateCascade,
  animateMultiplier,
  animateChayse,
  animateBonusSymbols,

  animateCop,
  animateRobber,
  animatePrisoner,
  animateBadge,

  animateMaxMultiplier,

  animateWinSequence,
  animateChayseSequence,
  animateFreeSpinTrigger,

  animateScreenShake,
  animateBigWin,
  animateParticles,

  getCell,
  getAllCells,

  timings: FLEEING_ANIMATION
};
