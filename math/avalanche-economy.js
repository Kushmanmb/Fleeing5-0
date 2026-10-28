"use strict";

const ECONOMY = Object.freeze({
  MIN_BET_CENTS: 10,
  MAX_BET_CENTS: 20000,
  MAX_PAYOUT_CENTS: 320499200,

  BET_OPTIONS_CENTS: Object.freeze([
    10, 20, 25, 50, 75,
    100, 150, 200, 250, 500,
    1000, 2000, 5000, 10000, 20000
  ]),

  MULTIPLIERS: Object.freeze([
    1, 2, 5, 10, 25,
    50, 250, 500, 5000, 10000
  ])
});

module.exports = ECONOMY;
