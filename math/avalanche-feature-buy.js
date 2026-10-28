"use strict";

const economy = require("./avalanche-economy");

const FEATURE = Object.freeze({
  SPINS: 10,
  COST_MULTIPLIER: 150,
  MIN_MULTIPLIERS_PER_SPIN: 3
});

function quoteFeatureBuy(betCents) {
  if (!Number.isSafeInteger(betCents) ||
      !economy.BET_OPTIONS_CENTS.includes(betCents)) {
    throw new Error("Invalid feature bet");
  }

  return {
    betCents,
    costCents: betCents * FEATURE.COST_MULTIPLIER,
    spins: FEATURE.SPINS,
    multipliersPerSpin: FEATURE.MIN_MULTIPLIERS_PER_SPIN
  };
}

module.exports = {FEATURE, quoteFeatureBuy};
