#!/usr/bin/env node
'use strict';
// Generates Stake Engine compatible math files (index.json, lookup CSV, .jsonl.zst books).
// Requires Node >= 22.15 for built-in zstd. Usage: node math/generate.js [outDir]
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const cfg = require('./config');
const { mulberry32, playRound } = require('./engine');
const { fullReport } = require('./stats');

function generate(outDir, count = cfg.BOOK_COUNT, seed = cfg.SEED) {
  if (typeof zlib.zstdCompressSync !== 'function') throw new Error('zlib.zstdCompressSync unavailable (Node >= 22.15 required)');
  fs.mkdirSync(outDir, { recursive: true });
  const rng = mulberry32(seed);
  const csv = [];
  const jsonl = [];
  const rows = [];
  for (let id = 1; id <= count; id++) {
    const book = playRound(rng, id);
    const payout = Math.round(book.payoutMultiplier * 100);
    csv.push(`${id},1,${payout}`);
    jsonl.push(JSON.stringify(book));
    rows.push({ weight: 1, payout });
  }
  const eventsFile = `books_${cfg.MODE}.jsonl.zst`;
  const weightsFile = `lookUpTable_${cfg.MODE}_0.csv`;
  fs.writeFileSync(path.join(outDir, eventsFile), zlib.zstdCompressSync(Buffer.from(jsonl.join('\n') + '\n')));
  fs.writeFileSync(path.join(outDir, weightsFile), csv.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({
    modes: [{ name: cfg.MODE, cost: cfg.COST, events: eventsFile, weights: weightsFile }]
  }, null, 2) + '\n');
  const report = fullReport(rows);
  report.seed = seed;
  fs.writeFileSync(path.join(outDir, 'stats.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) {
  const out = path.resolve(process.argv[2] || path.join(__dirname, 'output'));
  console.log(JSON.stringify(generate(out), null, 2));
}
module.exports = { generate };
