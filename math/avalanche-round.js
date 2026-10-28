"use strict";

const cfg = require("./avalanche-config");
const { calculatePayouts } = require("./avalanche-payouts");
const { applyGravity } = require("./avalanche-gravity");

function playAvalancheRound(initialBoard, drawSymbol) {
  let board = initialBoard.map(row => [...row]);
  let totalWin = 0;
  let capped = false;
  const cascades = [];

  while (true) {
    const result = calculatePayouts(board);

    if (result.wins.length === 0) break;

    if (cascades.length >= cfg.MAX_CASCADES) {
      throw new Error("Cascade safety limit exceeded");
    }

    const remaining = cfg.MAX_WIN - totalWin;
    const paid = Math.min(result.totalWin, remaining);

    cascades.push({
      board: board.map(row => [...row]),
      wins: result.wins,
      payout: paid
    });

    totalWin += paid;

    if (totalWin >= cfg.MAX_WIN) {
      capped = true;
      break;
    }

    board = applyGravity(board, result.wins, drawSymbol);

    // Sticky wilds expire after 3 paid cascades.
    if (cascades.length >= cfg.STICKY_WILD_MAX_CASCADES) {
      board = board.map(row => row.map(symbol =>
        symbol === cfg.STICKY_WILD ? drawSymbol() : symbol
      ));
    }
  }

  return {
    cascades,
    finalBoard: board,
    totalWin,
    payoutMultiplier: totalWin / 100,
    capped
  };
}

module.exports = { playAvalancheRound };
