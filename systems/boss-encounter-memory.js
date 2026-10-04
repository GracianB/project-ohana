// ============================================================================
// OHANA · BOSS ENCOUNTER MEMORY
// Memoria corta del encuentro. Resume cómo respondió el jugador y orienta
// únicamente la forma de la siguiente rutina: CORTA, LARGA o neutral.
// No modifica daño, hitboxes, física ni RNG.
// ============================================================================

const OUTCOMES = Object.freeze(["counter_clean", "counter_failed", "bait_read", "bait_trapped"]);
const clampMomentum = (value) => Math.max(-2, Math.min(2, Number(value) || 0));
const normalizeOutcome = (value) => OUTCOMES.includes(value) ? value : "";

export function createBossEncounterMemory() {
  return {
    history: [],
    momentum: 0,
    lastOutcome: "",
    clean: 0,
    failed: 0,
    baitRead: 0,
    baitTrapped: 0,
    ticks: 0,
  };
}

export function observeBossEncounter(state = createBossEncounterMemory(), event = {}) {
  const next = state && typeof state === "object" ? state : createBossEncounterMemory();
  const outcome = normalizeOutcome(event?.outcome);
  if (!outcome) {
    next.ticks = (Number(next.ticks) || 0) + 1;
    return next;
  }

  const deltaByOutcome = {
    counter_clean: -0.45,
    counter_failed: 0.55,
    bait_read: -0.65,
    bait_trapped: 0.7,
  };

  next.momentum = clampMomentum(clampMomentum(next.momentum) * 0.88 + deltaByOutcome[outcome]);
  next.lastOutcome = outcome;

  if (outcome === "counter_clean") next.clean = (Number(next.clean) || 0) + 1;
  if (outcome === "counter_failed") next.failed = (Number(next.failed) || 0) + 1;
  if (outcome === "bait_read") next.baitRead = (Number(next.baitRead) || 0) + 1;
  if (outcome === "bait_trapped") next.baitTrapped = (Number(next.baitTrapped) || 0) + 1;

  const history = Array.isArray(next.history) ? next.history.slice(-7) : [];
  history.push({ outcome, type: String(event?.type || "") });
  next.history = history;
  next.ticks = (Number(next.ticks) || 0) + 1;
  return next;
}

export function encounterPreference(state = {}) {
  const momentum = clampMomentum(state?.momentum);
  if (momentum >= 0.9) return "LONG";
  if (momentum <= -0.9) return "SHORT";
  return null;
}

export function encounterLabel(state = {}) {
  const momentum = clampMomentum(state?.momentum);
  if (momentum >= 1.4) return "MEMORIA · PRESIÓN +";
  if (momentum >= 0.9) return "RITMO · ACELERA";
  if (momentum <= -1.4) return "MEMORIA · LECTURA +";
  if (momentum <= -0.9) return "RITMO · RESPIRA";
  return "MEMORIA NEUTRA";
}

export function encounterSnapshot(state = {}) {
  return Object.freeze({
    history: Array.isArray(state?.history) ? state.history.slice(-8) : [],
    momentum: Math.round(clampMomentum(state?.momentum) * 100) / 100,
    preference: encounterPreference(state),
    clean: Math.max(0, Number(state?.clean) || 0),
    failed: Math.max(0, Number(state?.failed) || 0),
    baitRead: Math.max(0, Number(state?.baitRead) || 0),
    baitTrapped: Math.max(0, Number(state?.baitTrapped) || 0),
  });
}
