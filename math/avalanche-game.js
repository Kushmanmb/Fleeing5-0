"use strict";

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

  // Evaluate CHAYSE once, on the initial board.
  const chayse = evaluateChayse(initialBoard);

  const base = playAvalancheRound(initialBoard,draw);

  const bonusAward = chayse.triggered
    ? pickChayseAward(rng)
    : 0;

  const totalWin = Math.min(
    cfg.MAX_WIN,
    base.totalWin + bonusAward
  );

  return {
    initialBoard,
    cascades:base.cascades,
    finalBoard:base.finalBoard,
    baseWin:base.totalWin,
    chayse:{
      triggered:chayse.triggered,
      cells:chayse.cells,
      award:bonusAward,
      paid:totalWin-base.totalWin
    },
    totalWin,
    payoutMultiplier:totalWin/100,
    capped:totalWin>=cfg.MAX_WIN
  };
}

module.exports = {playGameRound};
