'use strict';
// Fleeing 5-0 game-math configuration (single source of truth).
// All payouts are integers in hundredths of a bet multiplier ("centi-x"): 100 = 1.00x.
// Paytable and bonus awards are PROVISIONAL until approved by Stake Engine math review.

const ROWS = 6;
const COLS = 5;
const SYMBOL_IDS = [
  'cop', 'prisoner', 'robber', 'gold_badge', 'silver_badge', 'handcuffs',
  'flashlight', 'marker', 'casings', 'a', 'k', 'q', 'j'
];
// Symbol weights per cell (identical on every reel). Total must be 100.
const SYMBOL_WEIGHTS = {
  cop: 2, prisoner: 2, robber: 2, gold_badge: 5, silver_badge: 7, handcuffs: 8,
  flashlight: 10, marker: 11, casings: 11, a: 11, k: 11, q: 10, j: 10
};
// Ways-to-win (adjacent reels from reel 1, 3+ reels), pay per way in centi-x for 3/4/5 reels.
const PAYTABLE = {
  cop: [47, 156, 624],
  prisoner: [47, 156, 624],
  robber: [47, 156, 624],
  gold_badge: [39, 117, 468],
  silver_badge: [23, 78, 312],
  handcuffs: [16, 55, 234],
  flashlight: [8, 31, 117],
  marker: [6, 23, 78],
  casings: [6, 23, 78],
  a: [4, 16, 47],
  k: [4, 16, 47],
  q: [4, 16, 47],
  j: [4, 16, 47]
};
// CHAYSE bonus: PRISONER on reel 1, ROBBER on reel 5, COP on reel 2/3/4, any rows.
// Award (centi-x) is drawn from this weighted table and added to the ways win.
const CHAYSE_AWARDS = [
  { payout: 1200, weight: 50 },
  { payout: 2400, weight: 30 },
  { payout: 5000, weight: 14 },
  { payout: 12000, weight: 5 },
  { payout: 100000, weight: 1 }
];
const MAX_WIN = 500000; // 5000.00x cap (provisional)
const COST = 1.0;
const MODE = 'base';
const BOOK_COUNT = 100000;
const SEED = 5050;
const SYMBOL_WEIGHT_TOTAL = 100;

module.exports = {
  ROWS, COLS, SYMBOL_IDS, SYMBOL_WEIGHTS, PAYTABLE, CHAYSE_AWARDS,
  MAX_WIN, COST, MODE, BOOK_COUNT, SEED, SYMBOL_WEIGHT_TOTAL
};
