// Cómo pega y cómo sale cada personaje. El arte ya los distingue; esto, el tacto.
export const SIGNATURE = {
  kilo:    { reach: 6, dmg: -6, kb: 1.35, kind: "leaf", dash: 12, iframe: 8, hop: -1.4 },
  stitcho: { reach: 2, dmg: 2, kb: 1.05, kind: "claws", dash: 18, iframe: 12 },
  chispin: { reach: 8, dmg: 2, kb: 0.85, kind: "zap", dash: 15, iframe: 8, spark: true },
  cat:     { reach: -8, dmg: 4, kb: 0.9, kind: "claws", dash: 14, iframe: 10, air: 1.35 },
  dragon:  { reach: 16, dmg: 4, kb: 1.15, kind: "fan", dash: 13, iframe: 8, fire: true },
  dino:    { reach: 8, dmg: 10, kb: 1.6, kind: "fan", dash: 10, iframe: 6, heavy: true, ram: true },
  frita:   { reach: 12, dmg: 0, kb: 1, kind: "fan", dash: 14, iframe: 8, low: true },
  pizza:   { reach: 0, dmg: 2, kb: 1.25, kind: "crescent", dash: 13, iframe: 8, hop: -3.2 },
};

export function signature(id) {
  return SIGNATURE[id] || SIGNATURE.kilo;
}
