// ============================================================================
// OHANA · BOSS ADAPTIVE BAIT
// Convierte una repetición defensiva en un señuelo de un solo uso.
// Devuelve únicamente rutinas que ya existen en BOSS_COMBAT_PROFILES.
// No modifica daño, hitboxes, física ni RNG.
// ============================================================================

export const BAIT_PATTERNS = Object.freeze({
  1: Object.freeze({
    DASH: Object.freeze(["spit", "charge"]),
    AIRE: Object.freeze(["charge", "swoop"]),
    DISTANCIA: Object.freeze(["charge", "spit"]),
  }),
  2: Object.freeze({
    DASH: Object.freeze(["slam", "spit", "swoop"]),
    AIRE: Object.freeze(["charge", "swoop", "slam"]),
    DISTANCIA: Object.freeze(["swoop", "spit", "charge"]),
  }),
  3: Object.freeze({
    DASH: Object.freeze(["slam", "charge", "spit", "swoop"]),
    AIRE: Object.freeze(["charge", "spit", "swoop", "slam"]),
    DISTANCIA: Object.freeze(["spit", "swoop", "charge", "slam"]),
  }),
});

function validType(type) {
  return ["DASH", "AIRE", "DISTANCIA"].includes(type) ? type : "";
}

export function createBossBait() {
  return {
    armed: false,
    type: "",
    uses: 0,
    lastPattern: "",
  };
}

export function armBossBait(state = createBossBait(), adaptation = {}) {
  const next = state && typeof state === "object" ? state : createBossBait();
  const type = validType(adaptation?.target);
  const repeat = Number(adaptation?.repeat) || 0;
  const consumed = !!adaptation?.baitConsumed;
  if (!next.armed && !consumed && type && repeat >= 2) {
    next.armed = true;
    next.type = type;
  }
  return next;
}

export function consumeBossBait(state = createBossBait(), phase = 1) {
  const next = state && typeof state === "object" ? state : createBossBait();
  if (!next.armed) return null;
  const p = Math.max(1, Math.min(3, Number(phase) || 1));
  const pattern = BAIT_PATTERNS[p]?.[validType(next.type)] || null;
  if (!pattern) {
    next.armed = false;
    next.type = "";
    return null;
  }
  next.armed = false;
  next.uses = (Number(next.uses) || 0) + 1;
  next.lastPattern = pattern.join(">");
  return pattern.slice();
}

export function baitLabel(state = {}) {
  return state?.armed ? "CEBO ARMADO · " + (state.type || "RESPUESTA") : "CEBO INACTIVO";
}

export function baitSnapshot(state = {}) {
  return Object.freeze({
    armed: !!state?.armed,
    type: validType(state?.type),
    uses: Math.max(0, Number(state?.uses) || 0),
    lastPattern: String(state?.lastPattern || ""),
  });
}
