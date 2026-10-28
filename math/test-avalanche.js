"use strict";

const assert=require("node:assert/strict");
const {mulberry32}=require("./engine");
const {playFeatureBuy}=require("./avalanche-feature-round");
const {quoteFeatureBuy}=require("./avalanche-feature-buy");
const {calculatePayoutCents}=require("./avalanche-betting");
const economy=require("./avalanche-economy");

assert.equal(quoteFeatureBuy(10).costCents,1500);
assert.equal(quoteFeatureBuy(20).costCents,3000);
assert.equal(quoteFeatureBuy(20000).costCents,3000000);

assert.equal(
  calculatePayoutCents(20000,2000000),
  economy.MAX_PAYOUT_CENTS
);

const rng=mulberry32(2026);

for(let i=0;i<100;i++){
  const result=playFeatureBuy(rng,10);

  assert.equal(result.spins,10);
  assert.equal(result.results.length,10);
  assert.equal(result.costCents,1500);

  for(const spin of result.results){
    assert.equal(spin.multipliers.length,3);
    assert.ok(spin.multipliers.every(m=>m>=10));
    assert.equal(
      spin.totalMultiplier,
      spin.multipliers.reduce((a,b)=>a+b,0)
    );
  }

  assert.equal(
    result.payoutCents,
    result.results.reduce((s,r)=>s+r.payoutCents,0)
  );

  assert.ok(
    result.payoutCents<=economy.MAX_PAYOUT_CENTS
  );
}

console.log("PASS: 100 complete Feature Buys");
console.log("PASS: 10 spins and 3 multipliers each");
console.log("PASS: 150x pricing and additive multipliers");
console.log("PASS: Maximum payout enforced");
