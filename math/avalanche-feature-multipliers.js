"use strict";

const {FEATURE}=require("./avalanche-feature-buy");
const {pickFeatureMultiplier:pickMultiplier}=require("./avalanche-feature-weights");

function drawFeatureMultipliers(rng) {
  return Array.from(
    {length:FEATURE.MIN_MULTIPLIERS_PER_SPIN},
    ()=>pickMultiplier(rng)
  );
}

module.exports={drawFeatureMultipliers};
