"use strict";

const economy = require("./avalanche-economy");

function calculatePayoutCents(betCents, winHundredths) {
  if (!Number.isSafeInteger(betCents) ||
      !economy.BET_OPTIONS_CENTS.includes(betCents)) {
    throw new Error("Invalid bet amount");
  }

  if (!Number.isSafeInteger(winHundredths) ||
      winHundredths < 0) {
    throw new Error("Invalid win amount");
  }

  const raw = betCents * winHundredths;
  if (!Number.isSafeInteger(raw)) {
    throw new Error("Payout calculation overflow");
  }

  return Math.min(
    Math.floor(raw / 100),
    economy.MAX_PAYOUT_CENTS
  );
}

module.exports = {calculatePayoutCents};
