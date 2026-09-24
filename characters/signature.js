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

// Ataque de clic / tecla H. Uno por forma (0 bebe -> 4 GOD).
export const MARKS = {
  kilo: [
    { name: "Nota", style: "arc", kind: "leaf", dmg: 16, reach: 52, cd: 26 },
    { name: "Acorde", style: "arc", kind: "leaf", dmg: 22, reach: 60, cd: 26, shots: 1 },
    { name: "Coro", style: "shot", dmg: 14, n: 3, cd: 28, color: "#ff9ab0" },
    { name: "Circulo", style: "nova", dmg: 28, r: 88, cd: 34 },
    { name: "Himno", style: "nova", dmg: 40, r: 120, cd: 32, heal: 8 },
  ],
  stitcho: [
    { name: "Zarpa", style: "arc", kind: "claws", dmg: 20, reach: 46, cd: 20 },
    { name: "Doble zarpa", style: "arc", kind: "claws", dmg: 18, reach: 58, cd: 22, kb: 1.2 },
    { name: "Plasma", style: "shot", dmg: 22, n: 1, cd: 20, color: "#5ad1ff" },
    { name: "Rafaga", style: "shot", dmg: 16, n: 3, cd: 22, color: "#5ad1ff", speed: 11 },
    { name: "Estallido", style: "nova", dmg: 36, r: 100, cd: 30 },
  ],
  chispin: [
    { name: "Chispa", style: "shot", dmg: 16, n: 1, cd: 18, color: "#ffe14a", speed: 12 },
    { name: "Latigazo", style: "arc", kind: "zap", dmg: 24, reach: 70, cd: 22 },
    { name: "Salto", style: "nova", dmg: 22, r: 70, cd: 24 },
    { name: "Rayo", style: "shot", dmg: 18, n: 3, cd: 24, color: "#fff6a0", speed: 13 },
    { name: "Tormenta", style: "nova", dmg: 34, r: 130, cd: 32 },
  ],
  cat: [
    { name: "Zarpazo", style: "arc", kind: "claws", dmg: 22, reach: 40, cd: 16 },
    { name: "Doble", style: "arc", kind: "claws", dmg: 18, reach: 48, cd: 18, kb: 0.8 },
    { name: "Giro", style: "nova", dmg: 20, r: 64, cd: 24 },
    { name: "Cazadora", style: "arc", kind: "claws", dmg: 32, reach: 62, cd: 20 },
    { name: "Nueve", style: "nova", dmg: 30, r: 110, cd: 28, heal: 4 },
  ],
  dragon: [
    { name: "Soplo", style: "shot", dmg: 18, n: 1, cd: 20, color: "#ff6a2a", speed: 8 },
    { name: "Lengua", style: "shot", dmg: 26, n: 1, cd: 22, color: "#ff8a3a", speed: 9 },
    { name: "Cono", style: "arc", kind: "fan", dmg: 28, reach: 78, cd: 24 },
    { name: "Aliento", style: "shot", dmg: 16, n: 3, cd: 26, color: "#ff4a20", speed: 8 },
    { name: "Infierno", style: "nova", dmg: 42, r: 116, cd: 34 },
  ],
  dino: [
    { name: "Mordisco", style: "arc", kind: "fan", dmg: 26, reach: 44, cd: 24, kb: 1.4 },
    { name: "Coletazo", style: "arc", kind: "fan", dmg: 22, reach: 70, cd: 26, kb: 1.7 },
    { name: "Pisoton", style: "slam", dmg: 30, reach: 80, cd: 28, kb: 1.3 },
    { name: "Rugido", style: "nova", dmg: 24, r: 96, cd: 32, kb: 1.8 },
    { name: "Temblor", style: "slam", dmg: 44, reach: 120, cd: 34, kb: 1.6 },
  ],
  frita: [
    { name: "Sal", style: "arc", kind: "fan", dmg: 14, reach: 64, cd: 16 },
    { name: "Corte", style: "arc", kind: "fan", dmg: 22, reach: 58, cd: 18 },
    { name: "Ketchup", style: "shot", dmg: 20, n: 1, cd: 22, color: "#e23b3b", speed: 7 },
    { name: "Rocion", style: "shot", dmg: 12, n: 3, cd: 22, color: "#ff5a4a", speed: 8 },
    { name: "Freidora", style: "nova", dmg: 32, r: 100, cd: 30 },
  ],
  pizza: [
    { name: "Porcion", style: "shot", dmg: 16, n: 1, cd: 18, color: "#ffb43a", speed: 8 },
    { name: "Disco", style: "shot", dmg: 22, n: 1, cd: 20, color: "#e0402a", speed: 9 },
    { name: "Queso", style: "arc", kind: "crescent", dmg: 18, reach: 66, cd: 20, kb: -0.6 },
    { name: "Horno", style: "shot", dmg: 14, n: 3, cd: 24, color: "#ff8a2a", speed: 8 },
    { name: "Familiar", style: "nova", dmg: 36, r: 124, cd: 32, heal: 6 },
  ],
};

export function markAt(id, evo) {
  const list = MARKS[id] || MARKS.kilo;
  const i = Math.max(0, Math.min(list.length - 1, Number(evo) || 0));
  return list[i];
}

