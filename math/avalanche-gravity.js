"use strict";

const cfg = require("./avalanche-config");

function applyGravity(board, matches, drawSymbol) {
  const removed = new Set(
    matches.flatMap(m =>
      [
        ...m.positions,
        ...(m.wildPositions || []).filter(
          ([r, c]) => board[r][c] === "regular_wild"
        )
      ].map(([r, c]) => `${r},${c}`)
    )
  );

  const next = board.map(row => [...row]);

  for (let c = 0; c < cfg.COLS; c++) {
    let bottom = cfg.ROWS - 1;

    for (let r = cfg.ROWS - 1; r >= -1; r--) {
      if (r === -1 || board[r][c] === cfg.STICKY_WILD) {
        const top = r + 1;
        const survivors = [];

        for (let y = top; y <= bottom; y++) {
          if (!removed.has(`${y},${c}`)) {
            survivors.push(board[y][c]);
          }
        }

        for (let y = bottom; y >= top; y--) {
          next[y][c] = survivors.length
            ? survivors.pop()
            : drawSymbol();
        }

        bottom = r - 1;
      }
    }
  }

  return next;
}

module.exports = { applyGravity };
