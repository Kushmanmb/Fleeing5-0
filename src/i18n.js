/* UI text. Social mode (Stake.us) avoids real-money wording. UMD like rgs.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FleeingI18n = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  const TEXT = {
    en: {
      real: { bet: 'BET', win: 'WIN', balance: 'BALANCE', spin: 'SPIN', totalWin: 'Total win', currency: '' },
      social: { bet: 'PLAY AMOUNT', win: 'PRIZE', balance: 'BALANCE', spin: 'PLAY', totalWin: 'Total prize', currency: '' },
      common: {
        ready: 'Ready to play.', spinning: 'Spinning...', noWin: 'No win this round.', chayse: '🚨 CHAYSE BONUS TRIGGERED! 🚨',
        rules: 'Rules', close: 'Close', sound: 'Sound', replay: 'REPLAY',
        recovering: 'Restoring your previous round...', connecting: 'Connecting...',
        errMissing: 'This game must be launched from the platform.',
        ERR_IPB: 'Insufficient balance.', ERR_IS: 'Session expired. Please reload.', ERR_ATE: 'Session expired. Please reload.',
        ERR_NETWORK: 'Connection problem. Please try again.', ERR_BET_INVALID: 'Invalid amount selected.', generic: 'Something went wrong. Please try again.'
      }
    }
  };
  const RULES = {
    real: ['5 reels x 6 rows. Wins pay left to right on adjacent reels starting at reel 1, 3 or more reels, and multiply by the number of ways.',
      'CHAYSE BONUS: a Prisoner on reel 1, a Robber on reel 5 and a Cop on reel 2, 3 or 4 (any rows) trigger a bonus award.',
      'Maximum win is capped at 5000x the bet. Each round is independent. Malfunction voids all pays and plays.'],
    social: ['5 reels x 6 rows. Prizes pay left to right on adjacent reels starting at reel 1, 3 or more reels, and multiply by the number of ways.',
      'CHAYSE BONUS: a Prisoner on reel 1, a Robber on reel 5 and a Cop on reel 2, 3 or 4 (any rows) trigger a bonus prize.',
      'Maximum prize is capped at 5000x the play amount. Each round is independent. Malfunction voids all prizes and plays.']
  };
  function t(lang, social, key) {
    const set = TEXT[lang] || TEXT.en;
    const mode = social ? 'social' : 'real';
    return (set[mode] && set[mode][key]) || set.common[key] || TEXT.en.common[key] || key;
  }
  function rules(social) { return social ? RULES.social : RULES.real; }
  return { t, rules, TEXT };
}));
