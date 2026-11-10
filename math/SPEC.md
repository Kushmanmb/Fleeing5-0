# Fleeing 5-0 — Stake Engine Game-Math Specification

Status: **DRAFT / NOT SUBMITTED. Real-money wagering is not enabled.** Payout values are provisional.

## Mechanics
- 5 reels × 6 rows, 13 symbols, every cell drawn independently per round (no progressives, no early cashout, rounds independent).
- **Ways win:** a symbol pays when it appears on 3, 4 or 5 adjacent reels starting at reel 1. Win = pay(symbol, reels) × product of per-reel symbol counts. No wilds/scatters.
- **CHAYSE bonus (cross-row rule):** PRISONER on reel 1 (any row) AND ROBBER on reel 5 (any row) AND COP on reel 2, 3 or 4 (any row). Award drawn from a weighted table and added to the ways win.
- **Max win:** 5000× bet (provisional); rounds are capped and a `maxWinCap` event is emitted.
- Single mode `base`, cost 1.0×. No bonus buy.

## Parameters (see `math/config.js`)
- Symbol weights (per cell, /100): cop/prisoner/robber 2, gold_badge 5, silver_badge 7, handcuffs 8, flashlight 10, marker/casings/A/K 11, Q/J 10.
- Paytable (centi-x per way, 3/4/5 reels) and CHAYSE awards (12×/24×/50×/120×/1000× at weights 50/30/14/5/1) are in `config.js`.
- CHAYSE trigger probability (analytic): ≈ 0.397 % (≈1 in 252).

## Outputs (Stake Engine format)
`npm run math:generate` (Node ≥ 22.15) writes `math/output/`: `index.json`, `lookUpTable_base_0.csv` (`id,weight,payout×100`), `books_base.jsonl.zst` (books: `{id,payoutMultiplier,events[]}`; event amounts in centi-x). `npm run math:verify` re-reads the files, recomputes each payout from its board, and recomputes exact weighted stats. The output directory is gitignored; `math/verified-stats.json` records the verified result for the default seed.

## Verified results (default seed 5050, 100,000 weight-1 books; `math/verified-stats.json`)
| Metric | Value |
|---|---|
| Table RTP (exact, integer arithmetic) | **93.76 %** |
| Closed-form RTP (uncapped; ways 82.62 % + CHAYSE 14.38 %) | 96.999 % |
| Hit frequency | 68.90 % |
| Volatility (std dev of payout, ×bet) | 4.41 (medium) |
| Max win in table / configured cap | 1000× / 5000× |

The sampled table deviates from the closed form by ≈2.3 standard errors. **Only the table RTP (93.76 %) is verified; no other RTP may be claimed.** A final weight-optimised table is required before submission.

## RGS integration (`src/rgs.js`, `src/main.js`)
authenticate → balance/config/bet levels → `play` → render RGS events → `end-round`. An active round returned by `authenticate` is re-rendered and settled (reconnect recovery). Replay mode (`replay=true&game&version&mode&event`) renders stored events. Browser code never generates outcomes. Social mode (`social=true`) swaps wording (Play Amount / Prize). Endpoint shapes were written from memory of the Stake Engine docs.

## Provisional decisions
Paytable, CHAYSE awards, 5000× cap, symbol weights, bet display, social wording.

## Approval blockers
1. Endpoint/field names, error codes, replay URL and amount units must be validated against the official Stake Engine docs and RGS (docs were unreachable here).
2. Official Math SDK was not used; output is format-compatible only. Re-generate with the SDK or pass Stake's validator.
3. Weight optimisation to a target RTP (e.g. 96 %) with a published, verified figure.
4. Official Stake.us social-language, jurisdiction and currency review; i18n only has English.
5. Real art/audio checks (`siren.mp3` is empty in repo), asset licensing, load/perf review on mobile.
6. Browser/E2E tests against Stake's sandbox; Stake's front-end package/upload format.
7. Ethereum faucet/contract tools are separate (`build.js` copies only `src/`), but the repo-root layout may need a clean game-only package.
