"use strict";

const cfg = require("./avalanche-config");

function findMatches(board) {
  if (
    board.length !== 7 ||
    board.some(row => !Array.isArray(row) || row.length !== 7)
  ) {
    throw new Error("Invalid 7x7 board");
  }

  const matches = [];
  const isWild = s => s === cfg.STICKY_WILD || s === "regular_wild";

  const symbols = [...new Set(
    board.flat().filter(s => !isWild(s))
  )];

  for (const symbol of symbols) {
    const visited = new Set();

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const start = `${r},${c}`;

        if (visited.has(start)) continue;

        if (board[r][c] !== symbol &&
            !isWild(board[r][c])) continue;

        const queue = [[r, c]];
        const positions = [];
        const wildPositions = [];

        visited.add(start);

        while (queue.length) {
          const [y, x] = queue.pop();

          if (isWild(board[y][x])) {
            wildPositions.push([y, x]);
          } else {
            positions.push([y, x]);
          }

          for (const [dy, dx] of [
            [-1, 0], [1, 0],
            [0, -1], [0, 1]
          ]) {
            const ny = y + dy;
            const nx = x + dx;
            const key = `${ny},${nx}`;

            if (ny < 0 || ny >= 7 ||
                nx < 0 || nx >= 7) continue;

            if (visited.has(key)) continue;

            if (board[ny][nx] === symbol ||
                isWild(board[ny][nx])) {
              visited.add(key);
              queue.push([ny, nx]);
            }
          }
        }

        const count =
          positions.length + wildPositions.length;

        if (count >= cfg.MIN_MATCH &&
            positions.length > 0) {
          matches.push({
            symbol,
            count,
            positions,
            wildPositions
          });
        }
      }
    }
  }

  return matches;
}

module.exports = { findMatches };
