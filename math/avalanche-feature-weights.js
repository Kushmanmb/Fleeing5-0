"use strict";

// Provisional feature-only weights.
const WEIGHTS = Object.freeze({
  10: 366700,
  15: 170000,
  25: 80000,
  50: 265000,
  100: 100300,
  250: 12000,
  500: 4000,
  1000: 1800,
  5000: 150,
  10000: 50
});

const entries = Object.entries(WEIGHTS)
  .map(([m,w]) => [Number(m),w]);

const total = entries.reduce(
  (sum,[,weight]) => sum+weight,0
);

if(total !== 1000000) {
  throw new Error("Invalid feature weights");
}

function pickFeatureMultiplier(rng) {
  const value = rng();

  if(!Number.isFinite(value) ||
     value < 0 || value >= 1) {
    throw new Error("Invalid RNG");
  }

  let roll = Math.floor(value*total);

  for(const [multiplier,weight] of entries) {
    if(roll < weight) return multiplier;
    roll -= weight;
  }

  throw new Error("Selection failed");
}

module.exports = {WEIGHTS,pickFeatureMultiplier};
