#!/usr/bin/env node
// Tests for the Stake Engine math engine, generated files and RGS client.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const cfg = require('./math/config');
const engine = require('./math/engine');
const { computeStats } = require('./math/stats');
const rgs = require('./src/rgs');
const i18n = require('./src/i18n');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
// alternating symbol sets per reel parity so the filler board never forms a 3-reel run
const filler = (r, c) => (c % 2 ? ['j', 'casings', 'marker'] : ['a', 'k', 'q'])[r % 3];
const emptyBoard = () => Array.from({ length: cfg.ROWS }, (_, r) => Array.from({ length: cfg.COLS }, (_, c) => filler(r, c)));

test('config: weights total 100 and paytable covers all symbols', () => {
  assert.strictEqual(Object.values(cfg.SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0), cfg.SYMBOL_WEIGHT_TOTAL);
  cfg.SYMBOL_IDS.forEach((s) => assert.strictEqual(cfg.PAYTABLE[s].length, 3));
});
test('normal win: 3 reels of flashlight with 2 ways on reel 2', () => {
  const b = emptyBoard();
  b[0][0] = 'flashlight'; b[0][1] = 'flashlight'; b[1][1] = 'flashlight'; b[0][2] = 'flashlight';
  const w = engine.evaluateWays(b).wins.find((x) => x.symbol === 'flashlight');
  assert.deepStrictEqual([w.length, w.ways, w.win], [3, 2, cfg.PAYTABLE.flashlight[0] * 2]);
});
test('losing round: no 3-reel run pays nothing', () => {
  const b = emptyBoard();
  b[0][0] = 'flashlight'; b[0][1] = 'flashlight'; b[0][3] = 'flashlight';
  assert.strictEqual(engine.evaluateWays(b).total, 0);
});
test('CHAYSE triggers across different rows', () => {
  const b = emptyBoard();
  b[0][0] = 'prisoner'; b[5][4] = 'robber'; b[3][2] = 'cop';
  assert.strictEqual(engine.evaluateChayse(b).triggered, true);
});
test('CHAYSE does not trigger: cop outside middle, or missing symbol', () => {
  const b = emptyBoard();
  b[0][0] = 'prisoner'; b[5][4] = 'robber'; b[3][0] = 'cop'; b[2][4] = 'cop';
  assert.strictEqual(engine.evaluateChayse(b).triggered, false);
  b[3][2] = 'cop'; b[0][0] = 'a';
  assert.strictEqual(engine.evaluateChayse(b).triggered, false);
});
test('engine is deterministic for a seed', () => {
  const a = engine.playRound(engine.mulberry32(7), 1);
  const b = engine.playRound(engine.mulberry32(7), 1);
  assert.deepStrictEqual(a, b);
});
test('max-win cap is applied and reported', () => {
  const original = cfg.MAX_WIN;
  cfg.MAX_WIN = 10;
  try {
    let capped = null;
    const rng = engine.mulberry32(1);
    for (let i = 0; i < 2000 && !capped; i++) {
      const book = engine.playRound(rng, i);
      if (book.events.some((e) => e.type === 'maxWinCap')) capped = book;
    }
    assert.ok(capped, 'expected a capped round');
    assert.strictEqual(capped.payoutMultiplier, 0.1);
  } finally { cfg.MAX_WIN = original; }
});
test('RTP/stat math is exact on a known table', () => {
  const s = computeStats([{ weight: 3, payout: 0 }, { weight: 1, payout: 400 }]);
  assert.strictEqual(s.rtp, 1);
  assert.strictEqual(s.hitFrequency, 0.25);
  assert.strictEqual(s.maxWinMultiplier, 4);
});

let generated;
const zstd = typeof zlib.zstdCompressSync === 'function';
if (zstd) {
  test('generated files: format, payout consistency, verified stats', () => {
    const { generate } = require('./math/generate');
    const { verify } = require('./math/verify');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f50-'));
    const report = generate(dir, 20000);
    const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
    assert.deepStrictEqual(Object.keys(index.modes[0]).sort(), ['cost', 'events', 'name', 'weights']);
    assert.ok(index.modes[0].events.endsWith('.jsonl.zst'));
    const stats = verify(dir);
    assert.strictEqual(stats.rtp, report.rtp);
    assert.ok(stats.maxWinMultiplier <= cfg.MAX_WIN / 100);
    // sampled-table RTP must be within 5 standard errors of the closed-form value
    const se = stats.volatilityStdDev / Math.sqrt(stats.rows);
    assert.ok(Math.abs(stats.rtp - report.analytic.rtpUncapped) < 5 * se, `rtp ${stats.rtp} vs ${report.analytic.rtpUncapped}`);
    generated = dir;
  });
  test('committed verified-stats.json matches regenerated default tables', () => {
    const { generate } = require('./math/generate');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f50d-'));
    const report = generate(dir);
    const committed = JSON.parse(fs.readFileSync(path.join(__dirname, 'math/verified-stats.json'), 'utf8'));
    assert.strictEqual(committed.rtp, report.rtp);
  });
}

// ---- RGS integration with a fake fetch ----
function fakeRgs(handlers, calls = []) {
  return async (url, opts) => {
    const p = url.replace('https://rgs.test', '');
    calls.push(p);
    const h = handlers[p];
    const r = typeof h === 'function' ? h(opts && opts.body && JSON.parse(opts.body)) : h;
    return { ok: !r.status || r.status < 400, status: r.status || 200, json: async () => r.body };
  };
}
const mkClient = (handlers, calls) => new rgs.RgsClient({ rgsUrl: 'rgs.test', sessionID: 's1', fetchImpl: fakeRgs(handlers, calls) });
const winRound = { amount: 1000000, payoutMultiplier: 2.5, active: true, state: [{ type: 'reveal', board: emptyBoard() }, { type: 'finalWin', amount: 250 }] };

test('RGS: play -> render -> end-round settles and returns balance', async () => {
  const calls = [];
  const c = mkClient({
    '/wallet/play': (b) => { assert.strictEqual(b.amount, 1000000); return { body: { balance: { amount: 9000000 }, round: winRound } }; },
    '/wallet/end-round': { body: { balance: { amount: 11500000 } } }
  }, calls);
  let rendered = 0;
  const res = await rgs.playRound(c, 1, async () => { rendered++; });
  assert.deepStrictEqual(calls, ['/wallet/play', '/wallet/end-round']);
  assert.strictEqual(rendered, 1);
  assert.strictEqual(res.balance.amount, 11500000);
  assert.strictEqual(rgs.finalWinMultiplier(winRound), 2.5);
});
test('RGS: round still ended when rendering throws', async () => {
  const calls = [];
  const c = mkClient({ '/wallet/play': { body: { round: winRound } }, '/wallet/end-round': { body: { balance: { amount: 1 } } } }, calls);
  await assert.rejects(rgs.playRound(c, 1, async () => { throw new Error('anim'); }), /anim/);
  assert.ok(calls.includes('/wallet/end-round'));
});
test('RGS errors: insufficient balance, expired session, network, bad response', async () => {
  const c = mkClient({ '/wallet/play': { status: 400, body: { error: 'ERR_IPB', message: 'no funds' } }, '/wallet/authenticate': { status: 401, body: { error: 'ERR_IS' } } });
  await assert.rejects(c.play(1), (e) => e.code === 'ERR_IPB');
  await assert.rejects(c.authenticate(), (e) => e.code === 'ERR_IS');
  const n = new rgs.RgsClient({ rgsUrl: 'rgs.test', sessionID: 's', fetchImpl: async () => { throw new Error('x'); } });
  await assert.rejects(n.balance(), (e) => e.code === 'ERR_NETWORK');
  await assert.rejects(mkClient({ '/wallet/balance': { body: null } }).balance(), (e) => e.code === 'ERR_BAD_RESPONSE');
  assert.throws(() => new rgs.RgsClient({}), (e) => e.code === 'ERR_MISSING_PARAMS');
});
test('RGS: bet validation (levels, balance)', () => {
  const config = { betLevels: [100000, 1000000] };
  rgs.validateBet(1, config, 5);
  assert.throws(() => rgs.validateBet(0.5, config, 5), (e) => e.code === 'ERR_BET_INVALID');
  assert.throws(() => rgs.validateBet(1, config, 0.5), (e) => e.code === 'ERR_IPB');
});
test('RGS: reconnect recovery settles an active round; ignores none', async () => {
  const calls = [];
  const c = mkClient({ '/wallet/end-round': { body: { balance: { amount: 42 } } } }, calls);
  const auth = { balance: { amount: 1 }, round: winRound };
  const rec = await rgs.recoverRound(c, auth, async () => {});
  assert.strictEqual(rec.balance.amount, 42);
  assert.strictEqual(await rgs.recoverRound(c, { round: null }, async () => {}), null);
  assert.strictEqual(await rgs.recoverRound(c, { round: { ...winRound, active: false } }, async () => {}), null);
  assert.strictEqual(calls.length, 1);
});
test('RGS: replay request and URL params', async () => {
  const calls = [];
  const c = mkClient({ '/bet/replay/g/1/base/7': { body: { payoutMultiplier: 1, state: [] } } }, calls);
  await c.replay({ game: 'g', version: '1', mode: 'base', event: '7' });
  assert.deepStrictEqual(calls, ['/bet/replay/g/1/base/7']);
  const p = rgs.parseParams('?sessionID=a&rgs_url=r&lang=es&social=true&replay=true');
  assert.deepStrictEqual([p.sessionID, p.rgsUrl, p.lang, p.social, p.replay], ['a', 'r', 'es', true, true]);
});
test('social mode text avoids real-money wording', () => {
  const social = ['bet', 'win', 'spin'].map((k) => i18n.t('en', true, k)).join(' ') + i18n.rules(true).join(' ');
  assert.ok(!/\b(bet|win|wager|cash|money|jackpot)\b/i.test(social), social);
  assert.strictEqual(i18n.t('xx', false, 'bet'), 'BET');
});
test('client bundle has no browser-side outcome generation', () => {
  const main = fs.readFileSync(path.join(__dirname, 'src/main.js'), 'utf8');
  assert.ok(!/Math\.random/.test(main));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of tests) {
    try { await fn(); console.log(`✓ ${name}`); } catch (e) { failed++; console.log(`✗ ${name}\n  ${e.message}`); }
  }
  if (!zstd) console.log('⚠ zstd tests skipped (Node >= 22.15 required)');
  console.log(`\n${tests.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
