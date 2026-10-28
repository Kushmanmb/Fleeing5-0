"use strict";

const SYMBOL_WEIGHTS = Object.freeze({
  cop: 1,
  prisoner: 1,
  robber: 1,
  gold_badge: 1,
  handcuffs: 1,
  flashlight: 4,
  marker: 4,
  casings: 4
});

function createDrawSymbol(rng) {
  const entries = Object.entries(SYMBOL_WEIGHTS);
  const total = entries.reduce((n, [,w]) => n + w, 0);

  return function drawSymbol() {
    let roll = Math.floor(rng() * total);

    for (const [symbol, weight] of entries) {
      if (roll < weight) return symbol;
      roll -= weight;
    }

    throw new Error("Invalid random roll");
  };
}

module.exports = { SYMBOL_WEIGHTS, createDrawSymbol };
