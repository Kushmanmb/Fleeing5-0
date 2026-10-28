"use strict";

const {playBetRound}=require("./avalanche-settlement");
const {playFeatureBuy}=require("./avalanche-feature-round");
const {mulberry32}=require("./engine");

const BET=500;
const REGULAR_SPINS=1500000;
const FEATURE_BUYS=150000;

function test(name,count,seed,play,interval){
  const rng=mulberry32(seed);
  let paid=0,cost=0,wins=0,capped=0,biggest=0;

  console.log("Starting",name);

  for(let i=1;i<=count;i++){
    const r=play(rng);
    const price=r.costCents??BET;

    paid+=r.payoutCents;
    cost+=price;

    if(r.payoutCents>0) wins++;
    if(r.capped) capped++;

    biggest=Math.max(biggest,r.payoutCents);

    if(i%interval===0){
      console.log(name,i+"/"+count,
        "RTP:",(paid/cost*100).toFixed(2)+"%");
    }
  }

  return {
    mode:name,
    plays:count,
    totalWagered:"$"+(cost/100).toFixed(2),
    RTP:(paid/cost*100).toFixed(3)+"%",
    winRate:(wins/count*100).toFixed(2)+"%",
    biggestPayout:"$"+(biggest/100).toFixed(2),
    cappedOutcomes:capped
  };
}

const start=Date.now();

try{
  const regular=test(
    "REGULAR",REGULAR_SPINS,Number(process.env.REGULAR_SEED || 2026),
    rng=>playBetRound(rng,BET),250000
  );

  const feature=test(
    "FEATURE",FEATURE_BUYS,Number(process.env.FEATURE_SEED || 2027),
    rng=>playFeatureBuy(rng,BET),25000
  );

  console.log("\n===== FINAL RESULTS =====");
  console.log("Base bet: $5");
  console.log("Feature cost: $750");
  console.log("Feature spins: 1,500,000");
  console.log(regular);
  console.log(feature);
  console.log("Target RTP: 96%");
  console.log("Elapsed minutes:",
    ((Date.now()-start)/60000).toFixed(1));
  console.log("AUDIT COMPLETE");
}catch(err){
  console.error("AUDIT FAILED:",err);
  process.exitCode=1;
}
