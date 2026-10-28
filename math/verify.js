#!/usr/bin/env node
'use strict';
// Re-reads generated files and independently re-verifies RTP/payout consistency.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const cfg = require('./config');
const { evaluateWays, evaluateChayse } = require('./engine');
const { computeStats } = require('./stats');

function verify(dir) {
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  const mode = index.modes[0];
  const rows = fs.readFileSync(path.join(dir, mode.weights), 'utf8').trim().split('\n').map((l) => {
    const [id, weight, payout] = l.split(',').map(Number);
    return { id, weight, payout };
  });
  const books = zlib.zstdDecompressSync(fs.readFileSync(path.join(dir, mode.events)))
    .toString('utf8').trim().split('\n').map((l) => JSON.parse(l));
  if (books.length !== rows.length) throw new Error('books/lookup row count mismatch');
  books.forEach((book, i) => {
    if (book.id !== rows[i].id || Math.round(book.payoutMultiplier * 100) !== rows[i].payout) throw new Error(`lookup mismatch at id ${book.id}`);
    const board = book.events[0].board;
    const chayse = evaluateChayse(board);
    const award = (book.events.find((e) => e.type === 'chayseAward') || { amount: 0 }).amount;
    if (chayse.triggered !== book.events.some((e) => e.type === 'chayseTrigger')) throw new Error(`chayse mismatch at id ${book.id}`);
    const expected = Math.min(evaluateWays(board).total + award, cfg.MAX_WIN);
    const final = book.events[book.events.length - 1];
    if (expected !== rows[i].payout || Math.round(book.payoutMultiplier * 100) !== expected || final.type !== 'finalWin' || final.amount !== expected) throw new Error(`payout mismatch at id ${book.id}`);
    if (rows[i].payout > cfg.MAX_WIN) throw new Error(`cap exceeded at id ${book.id}`);
  });
  return computeStats(rows, mode.cost);
}

if (require.main === module) console.log(JSON.stringify(verify(path.resolve(process.argv[2] || path.join(__dirname, 'output'))), null, 2));
module.exports = { verify };
