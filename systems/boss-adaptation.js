// ============================================================================
// OHANA · BOSS ADAPTIVE ENCOUNTER
// Memoria corta de respuestas defensivas del jugador.
// Solo orienta la selección de patrones autorizados: no toca daño, hitboxes,
// física ni RNG. La adaptación caduca y no conoce entradas futuras.
// ============================================================================

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const clampScore = (value) => Math.max(0, Math.min(4, Number(value) || 0));

export const ADAPTATION_TYPES = Object.freeze({
  DASH: "DASH",
  AIR: "AIRE",
  SPACE: "DISTANCIA",
});

const ATTACK_PREFERENCES = Object.freeze({
  1: Object.freeze({ DASH: "spit", AIRE: "charge", DISTANCIA: "charge" }),
  2: Object.freeze({ DASH: "slam", AIRE: "charge", DISTANCIA: "swoop" }),
  3: Object.freeze({ DASH: "slam", AIRE: "charge", DISTANCIA: "swoop" }),
});

export function createBossAdaptation() {
  return {
    pressure: { DASH: 0, AIRE: 0, DISTANCIA: 0 },
    recent: [],
    lastType: "",
    repeat: 0,
    target: "",
    level: 0,
    successfulReads: 0,
    baitArmed: false,
    ticks: 0,
  };
}

function normalizeType(type) {
  return Object.values(ADAPTATION_TYPES).includes(type) ? type : "";
}

function dominantType(pressure) {
  const entries = Object.entries(pressure || {});
  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return {
    type: entries[0]?.[0] || "",
    score: Number(entries[0]?.[1]) || 0,
    runnerUp: Number(entries[1]?.[1]) || 0,
  };
}

export function observeBossAdaptation(state = createBossAdaptation(), event = {}) {
  const next = state && typeof state === "object" ? state : createBossAdaptation();
  const pressure = next.pressure && typeof next.pressure === "object"
    ? next.pressure
    : { DASH: 0, AIRE: 0, DISTANCIA: 0 };

  for (const type of Object.values(ADAPTATION_TYPES)) {
    pressure[type] = clampScore((Number(pressure[type]) || 0) * 0.84);
  }

  const type = normalizeType(event?.type);
  const outcome = event?.outcome || "";
  if (type && outcome === "success") {
    const previousType = next.lastType;
    pressure[type] = clampScore(pressure[type] + 1.15);
    next.successfulReads = (Number(next.successfulReads) || 0) + 1;
    next.recent = Array.isArray(next.recent) ? next.recent.slice(-5) : [];
    next.recent.push(type);
    next.repeat = previousType === type ? Math.max(1, Number(next.repeat) || 0) + 1 : 1;
    next.lastType = type;
  } else if (outcome === "reset") {
    next.repeat = 0;
    next.lastType = "";
    next.recent = Array.isArray(next.recent) ? next.recent.slice(-5) : [];
  }

  const dominant = dominantType(pressure);
  const clearLead = dominant.score - dominant.runnerUp >= 0.65;
  const repeated = dominant.type && Number(next.repeat) >= 2;
  next.target = dominant.type && dominant.score >= 1.55 && (clearLead || repeated)
    ? dominant.type
    : "";
  next.level = next.target ? Math.max(1, Math.min(3, Math.ceil(dominant.score))) : 0;
  next.baitArmed = !!next.target && Number(next.repeat) >= 2 && !next.baitConsumed;
  next.ticks = (Number(next.ticks) || 0) + 1;
  next.pressure = pressure;
  return next;
}

export function adaptiveAttackPreference(phase = 1, state = {}, hpRatio = 1) {
  const p = Math.max(1, Math.min(3, Number(phase) || 1));
  const hp = clamp01(hpRatio);
  if (p === 3 && hp <= 0.22) return "charge";
  const type = normalizeType(state?.target);
  if (!type) return null;
  return ATTACK_PREFERENCES[p]?.[type] || null;
}

export function adaptationLabel(state = {}, hpRatio = 1) {
  if (Number(hpRatio) <= 0.22) return "ADAPTACIÓN · FINAL";
  const target = normalizeType(state?.target);
  if (!target) return "ADAPTACIÓN NEUTRA";
  const level = Math.max(1, Math.min(3, Number(state?.level) || 1));
  const bait = Number(state?.repeat) >= 2 ? " · CEBO" : "";
  return "ADAPTA " + target + " · " + level + bait;
}

export function adaptationSnapshot(state = {}) {
  return Object.freeze({
    dash: Math.round(clampScore(state?.pressure?.DASH) * 25),
    air: Math.round(clampScore(state?.pressure?.AIRE) * 25),
    space: Math.round(clampScore(state?.pressure?.DISTANCIA) * 25),
    target: normalizeType(state?.target),
    level: Math.max(0, Math.min(3, Number(state?.level) || 0)),
    repeat: Math.max(0, Number(state?.repeat) || 0),
  });
}
