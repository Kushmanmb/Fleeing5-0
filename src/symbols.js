const SYMBOLS = Object.freeze({
  cop: Object.freeze({
    id: "cop",
    name: "Cop",
    value: 10,
    type: "premium",
    image: "assets/symbols/cop.png"
  }),
  prisoner: Object.freeze({
    id: "prisoner",
    name: "Prisoner",
    value: 10,
    type: "premium",
    image: "assets/symbols/prisoner.png"
  }),
  robber: Object.freeze({
    id: "robber",
    name: "Robber",
    value: 10,
    type: "premium",
    image: "assets/symbols/robber.png"
  }),
  gold_badge: Object.freeze({
    id: "gold_badge",
    name: "Gold Badge",
    value: 8,
    type: "premium",
    image: "assets/symbols/gold_badge.png"
  }),
  silver_badge: Object.freeze({
    id: "silver_badge",
    name: "Silver Badge",
    value: 6,
    type: "premium",
    image: "assets/symbols/silver_badge.png"
  }),
  handcuffs: Object.freeze({
    id: "handcuffs",
    name: "Handcuffs",
    value: 5,
    type: "premium",
    image: "assets/symbols/handcuffs.png"
  }),
  flashlight: Object.freeze({
    id: "flashlight",
    name: "Flashlight",
    value: 4,
    type: "standard",
    image: "assets/symbols/flashlight.png"
  }),
  marker: Object.freeze({
    id: "marker",
    name: "Marker",
    value: 3,
    type: "standard",
    image: "assets/symbols/marker.png"
  }),
  casings: Object.freeze({
    id: "casings",
    name: "Casings",
    value: 3,
    type: "standard",
    image: "assets/symbols/casings.png"
  }),
  a: Object.freeze({
    id: "a",
    name: "A",
    value: 2,
    type: "card",
    image: "assets/symbols/a.png"
  })
});

const SYMBOL_IDS = Object.freeze(Object.keys(SYMBOLS));
const SYMBOL_DEFINITIONS = Object.freeze(SYMBOL_IDS.map((symbolId) => SYMBOLS[symbolId]));
const BONUS_SYMBOL_IDS = Object.freeze({
  left: SYMBOLS.prisoner.id,
  middle: SYMBOLS.cop.id,
  right: SYMBOLS.robber.id
});

if (typeof window !== "undefined") {
  window.SYMBOLS = SYMBOLS;
  window.SYMBOL_IDS = SYMBOL_IDS;
  window.SYMBOL_DEFINITIONS = SYMBOL_DEFINITIONS;
  window.BONUS_SYMBOL_IDS = BONUS_SYMBOL_IDS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SYMBOLS,
    SYMBOL_IDS,
    SYMBOL_DEFINITIONS,
    BONUS_SYMBOL_IDS
  };
}
