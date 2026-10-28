"use strict";

const {playGameRound}=require("./avalanche-game");
const {calculatePayoutCents}=require("./avalanche-betting");
const economy=require("./avalanche-economy");

function playBetRound(rng,betCents) {
  if (!Number.isSafeInteger(betCents) ||
      !economy.BET_OPTIONS_CENTS.includes(betCents)) {
    throw new Error("Invalid bet amount");
  }

  const spin=playGameRound(rng);
  const payoutCents=calculatePayoutCents(
    betCents,spin.totalWin
  );

  return {
    ...spin,
    betCents,
    payoutCents,
    netCents:payoutCents-betCents
  };
}

module.exports={playBetRound};
