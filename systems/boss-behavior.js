// ============================================================================
// OHANA · BOSS PLAYER READ
// Memoria ligera y determinista del comportamiento del jugador.
// Solo produce señales para el director de combate. No toca daño, hitboxes,
// física ni RNG.
// ============================================================================

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const smooth = (value, signal, retention = 0.86) =>
  clamp01((Number(value) || 0) * retention + (signal ? 1 : 0) * (1 - retention));

export const BOSS_READS = Object.freeze({
  NEUTRAL: "NEUTRO",
  DASH: "DASH",
  AIR: "AIRE",
  AGGRESSIVE: "AGRESIVO",
});

export function createBossBehavior() {
  return {
    dash: 0,
    air: 0,
    aggressive: 0,
    movement: 0,
    comboPeak: 0,
    ticks: 0,
    tag: BOSS_READS.NEUTRAL,
  };
}

export function observeBossBehavior(state = createBossBehavior(), player = {}, game = {}) {
  const next = state && typeof state === "object" ? state : createBossBehavior();
  const combo = Math.max(0, Number(game?.combo) || 0);
  const activeSlash = Array.isArray(game?.slashes) && game.slashes.some((slash) => Number(slash?.life) > 0);
  const dashing = Number(player?._dashGo) > 0 || Number(player?.dashBuf) > 0;
  const airborne = player?.grounded === false || Number(player?.vy) < -1.8 || (Number.isFinite(Number(player?.jumps)) && Number.isFinite(Number(player?.maxJumps)) && Number(player.jumps) < Number(player.maxJumps));
  const aggressive = combo >= 4 || activeSlash;

  next.dash = smooth(next.dash, dashing, 0.82);
  next.air = smooth(next.air, airborne, 0.88);
  next.aggressive = smooth(next.aggressive, aggressive, 0.9);
  next.movement = clamp01((Number(next.movement) || 0) * 0.92 + Math.min(1, Math.abs(Number(player?.vx) || 0) / 7) * 0.08);
  next.comboPeak = Math.max(Number(next.comboPeak) || 0, combo);
  next.ticks = (Number(next.ticks) || 0) + 1;

  if (next.dash >= 0.34) next.tag = BOSS_READS.DASH;
  else if (next.air >= 0.48) next.tag = BOSS_READS.AIR;
  else if (next.aggressive >= 0.42) next.tag = BOSS_READS.AGGRESSIVE;
  else next.tag = BOSS_READS.NEUTRAL;

  return next;
}

export function bossBehaviorTag(state = {}) {
  return state?.tag || BOSS_READS.NEUTRAL;
}

export function reactiveAttackPreference(phase = 1, state = {}, hpRatio = 1) {
  const p = Math.max(1, Math.min(3, Number(phase) || 1));
  const tag = bossBehaviorTag(state);
  const hp = clamp01(hpRatio);

  if (p === 3 && hp <= 0.22) return "charge";

  if (p === 1) {
    if (tag === BOSS_READS.DASH) return "spit";
    if (tag === BOSS_READS.AIR) return "charge";
    if (tag === BOSS_READS.AGGRESSIVE) return "spit";
  }

  if (p === 2) {
    if (tag === BOSS_READS.DASH) return "slam";
    if (tag === BOSS_READS.AIR) return "swoop";
    if (tag === BOSS_READS.AGGRESSIVE) return "charge";
  }

  if (p === 3) {
    if (tag === BOSS_READS.DASH) return "spit";
    if (tag === BOSS_READS.AIR) return "swoop";
    if (tag === BOSS_READS.AGGRESSIVE) return "slam";
  }

  return null;
}

export function behaviorLabel(state = {}, hpRatio = 1) {
  const tag = bossBehaviorTag(state);
  if (Number(hpRatio) <= 0.22) return tag === BOSS_READS.NEUTRAL ? "DESESPERACIÓN" : "DESESPERACIÓN · " + tag;
  return {
    [BOSS_READS.DASH]: "LEE DASH",
    [BOSS_READS.AIR]: "LEE AIRE",
    [BOSS_READS.AGGRESSIVE]: "LEE PRESIÓN",
    [BOSS_READS.NEUTRAL]: "LEE NEUTRO",
  }[tag] || "LEE NEUTRO";
}

export function behaviorSnapshot(state = {}) {
  return Object.freeze({
    dash: Math.round(clamp01(state.dash) * 100),
    air: Math.round(clamp01(state.air) * 100),
    aggressive: Math.round(clamp01(state.aggressive) * 100),
    tag: bossBehaviorTag(state),
  });
}
