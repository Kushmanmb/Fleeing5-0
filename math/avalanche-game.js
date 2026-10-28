"use strict";

const {pickMultiplier}=require("./avalanche-multipliers");


const cfg = require("./avalanche-config");
const {createDrawSymbol} = require("./avalanche-symbols");
const {playAvalancheRound} = require("./avalanche-round");
const {evaluateChayse} = require("./avalanche-chayse");
const {pickChayseAward} = require("./avalanche-chayse-awards");

function playGameRound(rng) {
  const draw = createDrawSymbol(rng);

  const initialBoard = Array.from(
    {length:cfg.ROWS},
    () => Array.from({length:cfg.COLS},draw)
  );

  // Place one regular WILD on every opening board.
  const wildIndex = Math.floor(rng() * cfg.ROWS * cfg.COLS);
  const wildRow = Math.floor(wildIndex / cfg.COLS);
  const wildCol = wildIndex % cfg.COLS;

  initialBoard[wildRow][wildCol] = "regular_wild";

  // Evaluate CHAYSE once, on the initial board.
  const chayse = evaluateChayse(initialBoard);

  const base = playAvalancheRound(initialBoard,draw);

  const bonusAward = chayse.triggered
    ? pickChayseAward(rng)
    : 0;

  // Guaranteed 1x or 2x multiplier, base game only.
  const multiplier = pickMultiplier(rng);
  const baseWin = Math.min(
    cfg.MAX_WIN, base.totalWin * multiplier
  );
  const totalWin = Math.min(
    cfg.MAX_WIN, baseWin + bonusAward
  );

  return {
    initialBoard,
    cascades:base.cascades,
    finalBoard:base.finalBoard,
    rawBaseWin:base.totalWin,
    multiplier,
    baseWin,
    chayse:{
      triggered:chayse.triggered,
      cells:chayse.cells,
      award:bonusAward,
      paid:totalWin-baseWin
    },
    totalWin,
    payoutMultiplier:totalWin/100,
    capped:totalWin>=cfg.MAX_WIN
  };
}

module.exports = {playGameRound};
