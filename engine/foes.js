// ============================================================================
// FOES · fábrica de enemigos (extraído de game.js, sin cambio de comportamiento)
// ============================================================================

export function isAirFoe(e) {
  return e.kind === "phosquito" || e.kind === "mosquito" || e.kind === "medusa"
    || e.kind === "pez" || e.kind === "libelula" || e.kind === "avispa" || e.kind === "abeja"
    || e.kind === "anguila" || e.kind === "gaviota" || e.kind === "murcielago"
    || e.kind === "brasita" || e.kind === "ufo"
    || (e.kind === "cucaracho" && e.evo >= 2)
    || (e.boss && e.airborne);
}

export function applyElite(e) {
  if (!e || e.elite) return e;
  e.elite = true;
  e.hp = Math.round(e.hp * 1.75);
  e.max = e.hp;
  e.w = Math.round(e.w * 1.1);
  e.h = Math.round(e.h * 1.1);
  e.color = e.color || "#ffd24a";
  e.eliteTint = "#ffd24a";
  return e;
}
