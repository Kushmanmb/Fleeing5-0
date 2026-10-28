"use strict";

const { CHAYSE_AWARDS } = require("./config");

const totalWeight = CHAYSE_AWARDS.reduce(
  (sum, award) => sum + award.weight, 0
);

function pickChayseAward(rng) {
  const value = rng();

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("Invalid RNG value");
  }

  let roll = value * totalWeight;

  for (const award of CHAYSE_AWARDS) {
    if (roll < award.weight) {
      return award.payout;
    }
    roll -= award.weight;
  }

  throw new Error("Prize selection failed");
}

module.exports = { pickChayseAward };
