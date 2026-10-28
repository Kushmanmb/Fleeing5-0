"use strict";

const {FEATURE}=require("./avalanche-feature-buy");
const {WEIGHTS}=require("./avalanche-feature-weights");
const MULTIPLIERS=Object.keys(WEIGHTS).map(Number);

function combineFeatureMultipliers(values) {
  if (!Array.isArray(values) ||
      values.length < FEATURE.MIN_MULTIPLIERS_PER_SPIN) {
    throw new Error("At least 3 multipliers required");
  }

  if (!values.every(m=>MULTIPLIERS.includes(m))) {
    throw new Error("Invalid multiplier");
  }

  const total=values.reduce((sum,m)=>sum+m,0);

  if (!Number.isSafeInteger(total)) {
    throw new Error("Multiplier overflow");
  }

  return total;
}

module.exports={combineFeatureMultipliers};
