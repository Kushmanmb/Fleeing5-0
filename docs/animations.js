const FLEEING_ANIMATION = {
  spinMs: 650,
  winMs: 520,
  chayseMs: 1400
};

function getAllCells() {
  return Array.from(document.querySelectorAll(".cell"));
}

function animateCells(cells, className, duration) {
  if (!cells || cells.length === 0) {
    return Promise.resolve();
  }

  cells.forEach(cell => {
    cell.classList.remove(className);
    void cell.offsetWidth;
    cell.classList.add(className);
  });

  return new Promise(resolve => {
    setTimeout(() => {
      cells.forEach(cell => {
        cell.classList.remove(className);
      });
      resolve();
    }, duration);
  });
}

function animateSpin() {
  return animateCells(
    getAllCells(),
    "anim-spin",
    FLEEING_ANIMATION.spinMs
  );
}

function animateWin(cells = []) {
  return animateCells(
    cells,
    "anim-win",
    FLEEING_ANIMATION.winMs
  );
}

function animateChayse(cells = []) {
  return animateCells(
    cells,
    "anim-chayse",
    FLEEING_ANIMATION.chayseMs
  );
}

async function animateChayseSequence(
  prisonerCells = [],
  robberCells = [],
  copCells = []
) {
  await animateChayse(prisonerCells);
  await animateChayse(robberCells);
  await animateChayse(copCells);

  await animateChayse([
    ...prisonerCells,
    ...robberCells,
    ...copCells
  ]);
}

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

window.FleeingAnimations = {
  animateSpin,
  animateWin,
  animateChayse,
  animateChayseSequence,
  animateScreenShake,
  animateBigWin,
  getAllCells,
  timings: FLEEING_ANIMATION
};
