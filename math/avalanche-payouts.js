"use strict";

const { findMatches } = require("./avalanche-engine");

// Provisional payouts in hundredths of a bet.
// These must be calibrated before submission.
const PAYTABLE = {
  cop: [10, 30, 80, 200],
  prisoner: [10, 30, 80, 200],
  robber: [10, 30, 80, 200],
  gold_badge: [8, 20, 55, 140],
  silver_badge: [8, 20, 55, 140],
  handcuffs: [8, 20, 55, 140],
  flashlight: [6, 15, 35, 95],
  marker: [6, 15, 35, 95],
  casings: [6, 15, 35, 95],
  a: [4, 10, 25, 65],
  k: [4, 10, 25, 65],
  q: [4, 10, 25, 65],
  j: [4, 10, 25, 65]
};

function calculatePayouts(board) {
  const matches = findMatches(board);

  const wins = matches.map(match => {
    const table = PAYTABLE[match.symbol];

    if (!table) {
      throw new Error(`Unknown symbol: ${match.symbol}`);
    }

    const count = match.count;
    const tier = count >= 12 ? 3
      : count >= 9 ? 2
      : count >= 7 ? 1 : 0;

    return {
      ...match,
      payout: table[tier]
    };
  });

  return {
    wins,
    totalWin: wins.reduce(
      (sum, win) => sum + win.payout, 0
    )
  };
}

module.exports = { calculatePayouts, PAYTABLE };
