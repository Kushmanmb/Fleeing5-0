"use strict";

const {playGameRound}=require("./avalanche-game");
const {quoteFeatureBuy}=require("./avalanche-feature-buy");
const {drawFeatureMultipliers}=
  require("./avalanche-feature-multipliers");
const {settleFeatureSpin}=
  require("./avalanche-feature-payout");
const economy=require("./avalanche-economy");

function playFeatureBuy(rng,betCents) {
  const quote=quoteFeatureBuy(betCents);
  const results=[];
  let payoutCents=0;

  for(let i=0;i<quote.spins;i++){
    const spin=playGameRound(rng);
    const multipliers=drawFeatureMultipliers(rng);

    const result=settleFeatureSpin(
      betCents,
      spin.rawBaseWin,
      spin.chayse.award,
      multipliers
    );

    const remaining=
      economy.MAX_PAYOUT_CENTS-payoutCents;

    const paidCents=Math.min(
      remaining,result.payoutCents
    );

    payoutCents+=paidCents;

    results.push({
      spin:i+1,
      multipliers,
      totalMultiplier:result.multiplier,
      payoutCents:paidCents
    });
  }

  return {
    ...quote,
    results,
    payoutCents,
    netCents:payoutCents-quote.costCents,
    capped:payoutCents>=economy.MAX_PAYOUT_CENTS
  };
}

module.exports={playFeatureBuy};
