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
  yomi:    { reach: 10, dmg: 4, kb: 1.15, kind: "fan", dash: 12, iframe: 8 },
  cuerno:  { reach: 6, dmg: 0, kb: 1.05, kind: "leaf", dash: 14, iframe: 8, hop: -2 },
};

export function signature(id) {
  return SIGNATURE[id] || SIGNATURE.kilo;
}

// H es siempre un golpe cercano. La forma solo pega un poco más fuerte y un poco más lejos.
// El disparo y el área se quedan en J K L, para que el nivel no dependa del botón básico.
const HITS = {
  kilo:    { name: "Nota", kind: "leaf", color: "#ff9ab0" },
  stitcho: { name: "Zarpa", kind: "claws", color: "#7eb6ff" },
  chispin: { name: "Chispa", kind: "zap", color: "#ffe14a" },
  cat:     { name: "Zarpazo", kind: "claws", color: "#ffb6e4" },
  dragon:  { name: "Garra", kind: "fan", color: "#ff6a2a" },
  dino:    { name: "Mordisco", kind: "fan", color: "#8ee07a" },
  frita:   { name: "Corte", kind: "fan", color: "#f0b43a" },
  pizza:   { name: "Porcion", kind: "crescent", color: "#ffb43a" },
  yomi:    { name: "Fauces", kind: "fan", color: "#ff4466" },
  cuerno:  { name: "Toque", kind: "leaf", color: "#f2c1ff" },
};

export const DIFFICULTY = {
  kilo: 1, pizza: 1, cat: 1, cuerno: 1,
  chispin: 2, stitcho: 2, dragon: 2,
  dino: 3, frita: 3, yomi: 3,
};

export function difficulty(id) {
  return DIFFICULTY[id] || 2;
}

export function markAt(id, evo) {
  const base = HITS[id] || HITS.kilo;
  const i = Math.max(0, Math.min(4, Number(evo) || 0));
  return {
    name: base.name,
    kind: base.kind,
    color: base.color,
    style: "arc",
    dmg: 20 + i * 4,
    reach: 64 + i * 3,
    kb: id === "dino" ? 1.2 : 1,
  };
}


