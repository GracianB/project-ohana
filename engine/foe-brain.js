// PROJECT OHANA V38 · shared foe brain.
// The room director assigns strategic intent; this module converts perception
// into a compact mode consumed by species-specific movement/attack code.

const FLY = new Set(["mosquito", "phosquito", "gaviota", "murcielago", "libelula", "abeja", "avispa", "brasita", "ufo"]);
const GROUND = new Set(["cangrejo", "escoria", "planta", "arana"]);
const ARTILLERY = new Set(["planta", "medusa", "anguila", "ufo"]);
const AMBUSH = new Set(["arana", "murcielago"]);

const SIGHT = Object.freeze({
  planta: 440,
  medusa: 390,
  anguila: 420,
  ufo: 520,
  arana: 300,
  murcielago: 360,
  gaviota: 430,
  abeja: 380,
  avispa: 380,
  libelula: 410,
  mosquito: 350,
  phosquito: 340,
  cangrejo: 280,
  rana: 300,
  escoria: 330,
  cucaracho: 310,
  pez: 300,
  brasita: 330,
});

const STRIKE_RANGE = Object.freeze({
  planta: 360,
  medusa: 275,
  anguila: 315,
  ufo: 420,
  arana: 150,
  murcielago: 135,
  gaviota: 150,
  abeja: 125,
  avispa: 125,
  libelula: 145,
  mosquito: 120,
  phosquito: 125,
  cangrejo: 115,
  rana: 135,
  escoria: 105,
  cucaracho: 110,
  pez: 125,
  brasita: 120,
});

export function sense(e, player) {
  const ex = (e.x || 0) + (e.w || 0) / 2;
  const ey = (e.y || 0) + (e.h || 0) / 2;
  if (!player || player.dead) return {
    dx: 0, dy: 1, dist: 9999, see: false, near: false, over: false,
    sameLevel: false, behind: false,
  };

  const px = player.x + (player.w || 0) / 2;
  const py = player.y + (player.h || 0) / 2;
  const dx = px - ex;
  const dy = py - ey;
  const dist = Math.hypot(dx, dy) || 0.001;
  const sight = Number(e.sight) || SIGHT[e.kind] || 320;
  const verticalTolerance = FLY.has(e.kind) ? 260 : ARTILLERY.has(e.kind) ? 220 : 170;
  const strike = Number(e.strikeRange) || STRIKE_RANGE[e.kind] || 110;
  const facing = Math.sign(Number(e.vx) || Number(e.facing) || 1) || 1;

  return {
    dx,
    dy,
    dist,
    see: dist < sight && Math.abs(dy) < verticalTolerance,
    near: dist < strike && Math.abs(dy) < (FLY.has(e.kind) ? 120 : 84),
    over: Math.abs(dx) < 72 && dy > 36,
    sameLevel: Math.abs(dy) < 74,
    behind: Math.sign(dx || 1) !== facing && Math.abs(dx) > 42,
  };
}

export function think(e, s, pack = 0) {
  const intent = String(e.aiIntent || "");
  const hardAlert = e.elite ? 124 : 108;

  if (s.see) e.aggro = hardAlert;
  else if (pack > 0) e.aggro = Math.max(e.aggro || 0, 48 + Math.min(24, pack * 6));
  else e.aggro = Math.max(0, (e.aggro || 0) - (AMBUSH.has(e.kind) ? 0.55 : 1));

  if (!(e.aggro > 0)) return "patrol";

  if (intent === "RETREAT") return "retreat";
  if (intent === "FLANK") return "flank";
  if (intent === "HOLD") return "hold";

  if (GROUND.has(e.kind) && Math.abs(s.dy) > 90) return "hold";

  if (ARTILLERY.has(e.kind)) {
    if (s.near) return "retreat";
    return (intent === "STRIKE" || (s.see && s.dist < (e.aiPreferredRange || 320) * 1.25)) ? "strike" : "hold";
  }

  if (FLY.has(e.kind)) {
    if (intent === "STRIKE") return "strike";
    if (s.over || s.near) return "strike";
    return "hover";
  }

  if (intent === "STRIKE") return "strike";
  if (intent === "PRESS") return s.near ? "strike" : "chase";
  return s.near ? "strike" : "chase";
}
