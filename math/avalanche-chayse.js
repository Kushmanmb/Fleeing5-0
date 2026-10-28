"use strict";

const cfg = require("./avalanche-config");

function evaluateChayse(board) {
  if (!Array.isArray(board) ||
      board.length !== cfg.ROWS ||
      board.some(row =>
        !Array.isArray(row) ||
        row.length !== cfg.COLS)) {
    throw new Error("Invalid board");
  }

  const pairRow = board.findIndex(row =>
    row[0] === "prisoner" &&
    row[6] === "robber"
  );

  if (pairRow < 0) {
    return {triggered:false,cells:[]};
  }

  for (let r=0;r<7;r++) {
    for (let c=1;c<6;c++) {
      if (board[r][c] === "cop") {
        return {
          triggered:true,
          cells:[[pairRow,0],[pairRow,6],[r,c]]
        };
      }
    }
  }

  return {triggered:false,cells:[]};
}

module.exports = {evaluateChayse};
