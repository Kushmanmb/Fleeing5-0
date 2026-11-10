/* Stake Engine RGS client. Outcomes come ONLY from the RGS; the browser never generates them.
   UMD: browser global FleeingRgs, or require() in Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FleeingRgs = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  const API_MULTIPLIER = 1000000; // RGS amounts are integers in 1e-6 currency units
  const BOOK_AMOUNT_DIVISOR = 100; // book event amounts are in hundredths of a bet multiplier

  class RgsError extends Error {
    constructor(code, message, status) {
      super(message || code);
      this.name = 'RgsError';
      this.code = code;
      this.status = status;
    }
  }

  function parseParams(search) {
    const p = new URLSearchParams(search);
    return {
      sessionID: p.get('sessionID'),
      rgsUrl: p.get('rgs_url'),
      lang: p.get('lang') || 'en',
      currency: p.get('currency'),
      device: p.get('device') || 'mobile',
      social: p.get('social') === 'true',
      replay: p.get('replay') === 'true',
      game: p.get('game'),
      version: p.get('version'),
      mode: p.get('mode') || 'base',
      event: p.get('event')
    };
  }

  const toApi = (amount) => Math.round(amount * API_MULTIPLIER);
  const fromApi = (amount) => amount / API_MULTIPLIER;

  class RgsClient {
    constructor({ rgsUrl, sessionID, lang = 'en', currency, fetchImpl }) {
      if (!rgsUrl || !sessionID) throw new RgsError('ERR_MISSING_PARAMS', 'Missing sessionID or rgs_url');
      this.base = (/^https?:\/\//.test(rgsUrl) ? rgsUrl : `https://${rgsUrl}`).replace(/\/$/, '');
      this.sessionID = sessionID;
      this.lang = lang;
      this.currency = currency;
      this.fetch = fetchImpl || ((...a) => fetch(...a));
    }

    async request(path, { method = 'POST', body } = {}) {
      let res;
      try {
        res = await this.fetch(`${this.base}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body)
        });
      } catch (e) {
        throw new RgsError('ERR_NETWORK', 'Network error', 0);
      }
      let data = null;
      try { data = await res.json(); } catch (e) { /* non-JSON */ }
      if (!res.ok || (data && data.error)) {
        const code = (data && (data.error || data.code)) || `HTTP_${res.status}`;
        throw new RgsError(code, (data && data.message) || code, res.status);
      }
      if (data === null) throw new RgsError('ERR_BAD_RESPONSE', 'Invalid RGS response', res.status);
      return data;
    }

    authenticate() {
      return this.request('/wallet/authenticate', { body: { sessionID: this.sessionID, language: this.lang } });
    }
    balance() {
      return this.request('/wallet/balance', { body: { sessionID: this.sessionID } });
    }
    play(amount, mode = 'base') {
      return this.request('/wallet/play', {
        body: { sessionID: this.sessionID, amount: toApi(amount), mode, currency: this.currency }
      });
    }
    endRound() {
      return this.request('/wallet/end-round', { body: { sessionID: this.sessionID } });
    }
    replay({ game, version, mode, event }) {
      return this.request(`/bet/replay/${encodeURIComponent(game)}/${encodeURIComponent(version)}/${encodeURIComponent(mode)}/${encodeURIComponent(event)}`, { method: 'GET' });
    }
  }

  function validateBet(amount, config, balance) {
    const levels = (config && config.betLevels) ? config.betLevels.map(fromApi) : null;
    if (!(amount > 0)) throw new RgsError('ERR_BET_INVALID', 'Invalid bet');
    if (levels && !levels.some((l) => Math.abs(l - amount) < 1e-9)) throw new RgsError('ERR_BET_INVALID', 'Bet not allowed');
    if (balance !== undefined && amount > balance) throw new RgsError('ERR_IPB', 'Insufficient balance');
  }

  function roundEvents(round) {
    return (round && (round.state || round.events)) || [];
  }

  /* Plays one round: play -> render -> end-round. The round is always ended after rendering so a
     failed animation cannot leave a round open; if end-round fails the next authenticate() reports
     the open round and recoverRound() settles it. */
  async function playRound(client, amount, render, mode = 'base') {
    const res = await client.play(amount, mode);
    const round = res.round;
    if (!round) throw new RgsError('ERR_BAD_RESPONSE', 'Missing round');
    try {
      await render(roundEvents(round), round);
    } finally {
      const end = await client.endRound();
      res.balance = end.balance || res.balance;
    }
    return { round, balance: res.balance };
  }

  /* Reconnect: if authenticate() returned an active round, re-render it and settle it. */
  async function recoverRound(client, authResponse, render) {
    const round = authResponse && authResponse.round;
    if (!round || round.active === false || !roundEvents(round).length) return null;
    try {
      await render(roundEvents(round), round);
    } finally {
      const end = await client.endRound();
      authResponse.balance = end.balance || authResponse.balance;
    }
    return { round, balance: authResponse.balance };
  }

  function finalWinMultiplier(round) {
    if (typeof round.payoutMultiplier === 'number') return round.payoutMultiplier;
    const events = roundEvents(round);
    const fin = events.filter((e) => e.type === 'finalWin').pop();
    return fin ? fin.amount / BOOK_AMOUNT_DIVISOR : 0;
  }

  return { API_MULTIPLIER, RgsError, RgsClient, parseParams, toApi, fromApi, validateBet, playRound, recoverRound, roundEvents, finalWinMultiplier };
}));
