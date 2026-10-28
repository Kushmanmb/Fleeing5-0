"use strict";

const economy = require("./avalanche-economy");

// PROVISIONAL weights: not yet RTP-calibrated.
const WEIGHTS = Object.freeze({
  1: 550000,
  2: 375000,
  5: 60000,
  10: 11500,
  25: 2500,
  50: 700,
  250: 180,
  500: 80,
  5000: 35,
  10000: 5
});

const entries = Object.entries(WEIGHTS)
  .map(([m,w]) => [Number(m),w]);

const total = entries.reduce((s,[,w]) => s+w,0);

function pickMultiplier(rng) {
  const value = rng();

  if (!Number.isFinite(value) ||
      value < 0 || value >= 1) {
    throw new Error("Invalid RNG");
  }

  let roll = Math.floor(value*total);

  for(const [multiplier,weight] of entries){
    if(roll < weight) return multiplier;
    roll -= weight;
  }

  throw new Error("Multiplier selection failed");
}

if(total !== 1000000 ||
   entries.length !== economy.MULTIPLIERS.length ||
   entries.some(([m])=>!economy.MULTIPLIERS.includes(m))){
  throw new Error("Invalid multiplier configuration");
}

module.exports = {WEIGHTS,pickMultiplier};
