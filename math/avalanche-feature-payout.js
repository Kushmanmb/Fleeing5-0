"use strict";

const economy=require("./avalanche-economy");
const {combineFeatureMultipliers}=
  require("./avalanche-feature-combine");

function settleFeatureSpin(
  betCents,rawBaseWin,chayseAward,multipliers
) {
  if(!Number.isSafeInteger(betCents) ||
     !economy.BET_OPTIONS_CENTS.includes(betCents)) {
    throw new Error("Invalid bet");
  }

  if(![rawBaseWin,chayseAward].every(
    n=>Number.isSafeInteger(n) && n>=0
  )) {
    throw new Error("Invalid win");
  }

  const multiplier=combineFeatureMultipliers(multipliers);

  const totalWin=
    BigInt(rawBaseWin)*BigInt(multiplier)+
    BigInt(chayseAward);

  const gross=BigInt(betCents)*totalWin/100n;
  const cap=BigInt(economy.MAX_PAYOUT_CENTS);

  return {
    multiplier,
    payoutCents:Number(gross>cap?cap:gross),
    capped:gross>=cap
  };
}

module.exports={settleFeatureSpin};
