'use strict';
const cfg = require('./config');
const { analyticRtp } = require('./engine');

// Exact weighted statistics from (weight, payout-in-centi-x) rows. Integer sums use BigInt.
function computeStats(rows, cost = cfg.COST) {
  let totalWeight = 0n;
  let weightedPayout = 0n;
  let weightedSquares = 0n;
  let hitWeight = 0n;
  let maxPayout = 0;
  let maxWinWeight = 0n;
  for (const { weight, payout } of rows) {
    const w = BigInt(weight);
    const p = BigInt(payout);
    totalWeight += w;
    weightedPayout += w * p;
    weightedSquares += w * p * p;
    if (payout > 0) hitWeight += w;
    if (payout > maxPayout) maxPayout = payout;
  }
  for (const { weight, payout } of rows) if (payout === maxPayout) maxWinWeight += BigInt(weight);
  if (totalWeight === 0n) throw new Error('empty lookup table');
  const tw = Number(totalWeight);
  const mean = Number(weightedPayout) / tw / 100; // x bet
  const variance = Number(weightedSquares) / tw / 10000 - mean * mean;
  return {
    rows: rows.length,
    totalWeight: tw,
    rtp: mean / cost,
    hitFrequency: Number(hitWeight) / tw,
    volatilityStdDev: Math.sqrt(Math.max(variance, 0)),
    maxWinMultiplier: maxPayout / 100,
    maxWinCapMultiplier: cfg.MAX_WIN / 100,
    maxWinProbability: Number(maxWinWeight) / tw
  };
}

function volatilityLabel(sd) {
  return sd < 4 ? 'low' : sd < 8 ? 'medium' : sd < 15 ? 'high' : 'very high';
}

function fullReport(rows) {
  const stats = computeStats(rows);
  return { ...stats, volatilityLabel: volatilityLabel(stats.volatilityStdDev), analytic: analyticRtp() };
}

module.exports = { computeStats, fullReport, volatilityLabel };
