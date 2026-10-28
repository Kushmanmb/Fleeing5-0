'use strict';
const cfg = require('./config');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(rng, entries, total) {
  let r = Math.floor(rng() * total);
  for (const [value, weight] of entries) {
    if (r < weight) return value;
    r -= weight;
  }
  return entries[entries.length - 1][0];
}

const SYMBOL_ENTRIES = cfg.SYMBOL_IDS.map((id) => [id, cfg.SYMBOL_WEIGHTS[id]]);
const AWARD_ENTRIES = cfg.CHAYSE_AWARDS.map((a) => [a.payout, a.weight]);
const AWARD_TOTAL = cfg.CHAYSE_AWARDS.reduce((s, a) => s + a.weight, 0);

function generateBoard(rng) {
  const board = [];
  for (let r = 0; r < cfg.ROWS; r++) {
    const row = [];
    for (let c = 0; c < cfg.COLS; c++) row.push(weightedPick(rng, SYMBOL_ENTRIES, cfg.SYMBOL_WEIGHT_TOTAL));
    board.push(row);
  }
  return board;
}

// Cross-row CHAYSE rule: vertical position does not matter.
function evaluateChayse(board) {
  const cells = [];
  let prisoner = false;
  let robber = false;
  let cop = false;
  for (let r = 0; r < board.length; r++) {
    const row = board[r];
    if (row[0] === 'prisoner') { prisoner = true; cells.push([r, 0]); }
    if (row[cfg.COLS - 1] === 'robber') { robber = true; cells.push([r, cfg.COLS - 1]); }
    for (let c = 1; c < cfg.COLS - 1; c++) {
      if (row[c] === 'cop') { cop = true; cells.push([r, c]); }
    }
  }
  return { triggered: prisoner && robber && cop, cells };
}

function evaluateWays(board) {
  const wins = [];
  let total = 0;
  for (const symbol of cfg.SYMBOL_IDS) {
    let ways = 1;
    let length = 0;
    for (let c = 0; c < cfg.COLS; c++) {
      let count = 0;
      for (let r = 0; r < board.length; r++) if (board[r][c] === symbol) count++;
      if (count === 0) break;
      ways *= count;
      length++;
    }
    if (length >= 3) {
      const win = cfg.PAYTABLE[symbol][length - 3] * ways;
      wins.push({ symbol, length, ways, win });
      total += win;
    }
  }
  return { wins, total };
}

// Plays one round deterministically from rng. Returns the Stake "book".
function playRound(rng, id) {
  const board = generateBoard(rng);
  const ways = evaluateWays(board);
  const chayse = evaluateChayse(board);
  let award = 0;
  if (chayse.triggered) award = weightedPick(rng, AWARD_ENTRIES, AWARD_TOTAL);
  const uncapped = ways.total + award;
  const payoutMultiplier = Math.min(uncapped, cfg.MAX_WIN);
  const events = [{ index: 0, type: 'reveal', gameType: 'basegame', board }];
  if (ways.wins.length) events.push({ index: events.length, type: 'winInfo', wins: ways.wins, totalWin: ways.total });
  if (chayse.triggered) {
    events.push({ index: events.length, type: 'chayseTrigger', cells: chayse.cells });
    events.push({ index: events.length, type: 'chayseAward', amount: award });
  }
  if (uncapped > cfg.MAX_WIN) events.push({ index: events.length, type: 'maxWinCap', amount: cfg.MAX_WIN });
  events.push({ index: events.length, type: 'setTotalWin', amount: payoutMultiplier });
  events.push({ index: events.length, type: 'finalWin', amount: payoutMultiplier });
  return { id, payoutMultiplier: payoutMultiplier / 100, events };
}

// Closed-form (uncapped) expected return per unit bet, in centi-x, from independent iid cells.
function analyticRtp() {
  const q = (p) => Math.pow(1 - p, cfg.ROWS);
  let ways = 0;
  for (const s of cfg.SYMBOL_IDS) {
    const p = cfg.SYMBOL_WEIGHTS[s] / cfg.SYMBOL_WEIGHT_TOTAL;
    for (let k = 3; k <= cfg.COLS; k++) {
      // E[prod of ways counts over k reels, reels k+1 empty]
      ways += cfg.PAYTABLE[s][k - 3] * Math.pow(cfg.ROWS * p, k) * (k < cfg.COLS ? q(p) : 1);
    }
  }
  const hit = (s, cells) => 1 - Math.pow(1 - cfg.SYMBOL_WEIGHTS[s] / cfg.SYMBOL_WEIGHT_TOTAL, cells);
  const triggerProbability = hit('prisoner', cfg.ROWS) * hit('robber', cfg.ROWS) * hit('cop', 3 * cfg.ROWS);
  const meanAward = cfg.CHAYSE_AWARDS.reduce((s, a) => s + a.payout * a.weight, 0) / AWARD_TOTAL;
  return {
    waysRtp: ways / 100,
    chayseTriggerProbability: triggerProbability,
    chayseRtp: (triggerProbability * meanAward) / 100,
    rtpUncapped: (ways + triggerProbability * meanAward) / 100
  };
}

module.exports = { mulberry32, generateBoard, evaluateWays, evaluateChayse, playRound, analyticRtp };
