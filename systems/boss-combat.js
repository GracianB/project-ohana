// ============================================================================
// OHANA · BOSS COMBAT DIRECTOR
// Diseño de combate puro. Selecciona rutinas deterministas para la Reina del
// Nido sin modificar daño, hitboxes ni física directamente.
// ============================================================================

export const BOSS_COMBAT_PROFILES = Object.freeze({
  1: Object.freeze({
    id: 1,
    name: "TERRITORIO",
    recovery: 34,
    chainGap: 8,
    patterns: Object.freeze([
      Object.freeze(["charge", "spit"]),
      Object.freeze(["spit", "charge"]),
      Object.freeze(["charge", "swoop"]),
    ]),
  }),
  2: Object.freeze({
    id: 2,
    name: "ASCENSO",
    recovery: 28,
    chainGap: 7,
    patterns: Object.freeze([
      Object.freeze(["swoop", "spit", "charge"]),
      Object.freeze(["slam", "spit", "swoop"]),
      Object.freeze(["charge", "swoop", "slam"]),
    ]),
  }),
  3: Object.freeze({
    id: 3,
    name: "APOCALIPSIS",
    recovery: 22,
    chainGap: 6,
    patterns: Object.freeze([
      Object.freeze(["swoop", "slam", "spit"]),
      Object.freeze(["slam", "charge", "spit", "swoop"]),
      Object.freeze(["spit", "swoop", "charge", "slam"]),
      Object.freeze(["charge", "spit", "swoop", "slam"]),
    ]),
  }),
});

const clampPhase = (phase) => Math.max(1, Math.min(3, Number(phase) || 1));

export function bossCombatProfile(phase = 1) {
  return BOSS_COMBAT_PROFILES[clampPhase(phase)];
}

export function chooseBossPattern(phase = 1, previous = -1, rng = () => 0, context = {}) {
  const profile = bossCombatProfile(phase);
  const patterns = profile.patterns;
  if (!patterns.length) return [];
  const distance = Math.abs(Number(context.distance) || 0);
  const vertical = Number(context.vertical) || 0;

  let preferred = null;
  if (phase === 1) {
    preferred = distance > 260 ? "charge" : "spit";
  } else if (phase === 2) {
    preferred = vertical < -70 ? "swoop" : distance < 180 ? "slam" : "swoop";
  } else {
    preferred = vertical < -70 ? "swoop" : distance < 200 ? "slam" : "charge";
  }

  const candidates = patterns
    .map((pattern, index) => ({ pattern, index }))
    .filter(({ index }) => index !== previous);

  const preferredCandidates = candidates.filter(({ pattern }) => pattern[0] === preferred);
  const pool = preferredCandidates.length ? preferredCandidates : candidates.length ? candidates : [{ pattern: patterns[0], index: 0 }];
  const raw = Number(rng());
  const safe = Number.isFinite(raw) ? Math.max(0, Math.min(0.999999, raw)) : 0;
  return pool[Math.floor(safe * pool.length)].pattern.slice();
}

export function patternLabel(pattern = []) {
  return Array.isArray(pattern) && pattern.length ? pattern.join(" → ").toUpperCase() : "";
}

export function recoveryFrames(phase = 1) {
  return bossCombatProfile(phase).recovery;
}

export function chainGap(phase = 1) {
  return bossCombatProfile(phase).chainGap;
}
