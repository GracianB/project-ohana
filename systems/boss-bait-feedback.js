// ============================================================================
// OHANA · BOSS BAIT FEEDBACK
// Recoge el resultado de un CEBO y convierte esa lectura en una pequeña
// variación de ritmo. Solo afecta cadencia, nunca daño, hitboxes o física.
// ============================================================================

const TYPES = Object.freeze(["DASH", "AIRE", "DISTANCIA"]);
const clampTempo = (value) => Math.max(-2, Math.min(2, Number(value) || 0));

function validType(type) {
  return TYPES.includes(type) ? type : "";
}

export function createBossBaitFeedback() {
  return {
    active: false,
    type: "",
    attempts: 0,
    trapped: 0,
    read: 0,
    tempo: 0,
    last: "",
    lastDelta: 0,
  };
}

export function beginBossBaitFeedback(state = createBossBaitFeedback(), type = "") {
  const next = state && typeof state === "object" ? state : createBossBaitFeedback();
  const safeType = validType(type);
  if (!safeType) return next;
  next.active = true;
  next.type = safeType;
  next.last = "";
  next.lastDelta = 0;
  return next;
}

export function resolveBossBaitFeedback(
  state = createBossBaitFeedback(),
  counterResult = null,
  threatWasReal = true
) {
  const next = state && typeof state === "object" ? state : createBossBaitFeedback();
  if (!next.active) return null;

  next.active = false;
  if (!threatWasReal) {
    next.last = "neutral";
    next.lastDelta = 0;
    return Object.freeze({
      outcome: "neutral",
      type: next.type,
      tempo: next.tempo,
      delta: 0,
    });
  }

  next.attempts = (Number(next.attempts) || 0) + 1;
  const countered = !!counterResult;
  const delta = countered ? -1 : 1;
  next.tempo = clampTempo(next.tempo + delta);
  next.lastDelta = delta;

  if (countered) {
    next.read = (Number(next.read) || 0) + 1;
    next.last = "read";
  } else {
    next.trapped = (Number(next.trapped) || 0) + 1;
    next.last = "trapped";
  }

  return Object.freeze({
    outcome: next.last,
    type: next.type,
    tempo: next.tempo,
    delta,
  });
}

export function feedbackAttackDelay(baseDelay, state = {}) {
  const base = Math.max(6, Number(baseDelay) || 6);
  const tempo = clampTempo(state?.tempo);
  return Math.max(6, base - tempo * 3);
}

export function baitFeedbackLabel(state = {}) {
  if (state?.last === "read") return "CEBO LEÍDO · RITMO " + formatTempo(state?.tempo);
  if (state?.last === "trapped") return "CEBO EFICAZ · RITMO " + formatTempo(state?.tempo);
  return "";
}

function formatTempo(value) {
  const n = clampTempo(value);
  return n > 0 ? "+" + n : String(n);
}

export function baitFeedbackSnapshot(state = {}) {
  return Object.freeze({
    active: !!state?.active,
    attempts: Math.max(0, Number(state?.attempts) || 0),
    trapped: Math.max(0, Number(state?.trapped) || 0),
    read: Math.max(0, Number(state?.read) || 0),
    tempo: clampTempo(state?.tempo),
    last: ["read", "trapped", "neutral"].includes(state?.last) ? state.last : "",
  });
}
