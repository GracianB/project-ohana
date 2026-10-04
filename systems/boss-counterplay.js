// ============================================================================
// OHANA · BOSS COUNTERPLAY
// Convierte una defensa limpia en una respuesta jugable:
// DASH, AIRE o DISTANCIA -> recompensa -> racha -> BREAK.
// No altera daño ni hitboxes.
// ============================================================================

const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));

export const COUNTERPLAY_TYPES = Object.freeze({
  DASH: "DASH",
  AIR: "AIRE",
  SPACE: "DISTANCIA",
});

const DANGER_RADIUS = Object.freeze({
  charge: 250,
  swoop: 230,
  slam: 190,
  spit: 340,
});

export function createBossCounterplay() {
  return {
    active: null,
    streak: 0,
    bestStreak: 0,
    total: 0,
    lastType: "",
    lastReward: 0,
  };
}

export function startBossThreat(state = createBossCounterplay(), boss = {}, player = {}, health = 0, kind = "charge") {
  const next = state && typeof state === "object" ? state : createBossCounterplay();
  const bx = Number(boss.x) + Number(boss.w || 0) / 2;
  const by = Number(boss.y) + Number(boss.h || 0) / 2;
  const px = Number(player.x) + Number(player.w || 0) / 2;
  const py = Number(player.y) + Number(player.h || 0) / 2;
  const distance = Math.hypot(px - bx, py - by);
  const danger = DANGER_RADIUS[kind] || DANGER_RADIUS.charge;

  next.active = {
    kind,
    phase: clamp(boss.phase, 1, 3),
    danger,
    initialDistance: distance,
    initialInDanger: distance <= danger,
    startX: Number(player.x) || 0,
    startY: Number(player.y) || 0,
    startHealth: Number(health) || 0,
    age: 0,
    escaped: false,
    type: "",
  };
  return next;
}

export function observeBossThreat(state = createBossCounterplay(), boss = {}, player = {}, health = 0) {
  const next = state;
  const threat = next?.active;
  if (!threat) return next;

  threat.age++;
  if (!threat.initialInDanger || threat.escaped || threat.age < 2) return next;

  const bx = Number(boss.x) + Number(boss.w || 0) / 2;
  const by = Number(boss.y) + Number(boss.h || 0) / 2;
  const px = Number(player.x) + Number(player.w || 0) / 2;
  const py = Number(player.y) + Number(player.h || 0) / 2;
  const distance = Math.hypot(px - bx, py - by);
  const dashing = Number(player?._dashGo) > 0;
  const airborne = player?.grounded === false || Number(player?.vy) < -1.8;

  if (dashing && distance <= threat.danger + 90) {
    threat.escaped = true;
    threat.type = COUNTERPLAY_TYPES.DASH;
  } else if (airborne && ["charge", "swoop", "slam"].includes(threat.kind)) {
    threat.escaped = true;
    threat.type = COUNTERPLAY_TYPES.AIR;
  } else if (distance >= threat.danger * 1.25 && Math.abs(Number(player.x) - threat.startX) > 55) {
    threat.escaped = true;
    threat.type = COUNTERPLAY_TYPES.SPACE;
  }

  // Si recibió daño, no permitimos convertir un escape parcial en una esquiva limpia.
  if (Number(health) < threat.startHealth) {
    threat.escaped = false;
    threat.type = "";
  }

  return next;
}

export function resolveBossThreat(state = createBossCounterplay(), player = {}, health = 0) {
  const next = state;
  const threat = next?.active;
  if (!threat) return null;

  next.active = null;
  if (!threat.initialInDanger || !threat.escaped || Number(health) < threat.startHealth) {
    next.streak = 0;
    return null;
  }

  next.streak = clamp(next.streak + 1, 0, 3);
  next.bestStreak = Math.max(Number(next.bestStreak) || 0, next.streak);
  next.total = (Number(next.total) || 0) + 1;
  next.lastType = threat.type || COUNTERPLAY_TYPES.SPACE;
  const phase = clamp(threat.phase, 1, 3);
  const reward = 15 + phase * 10 + next.streak * 5;
  next.lastReward = reward;

  return Object.freeze({
    type: next.lastType,
    streak: next.streak,
    reward,
    break: next.streak >= 3,
    openBonus: next.streak >= 3 ? 8 + phase * 2 : 0,
    kind: threat.kind,
    phase,
  });
}

export function counterplayLabel(result = null) {
  if (!result) return "";
  if (result.break) return "BREAK";
  return result.type === COUNTERPLAY_TYPES.DASH ? "ESQUIVA DASH" :
    result.type === COUNTERPLAY_TYPES.AIR ? "ESQUIVA AIRE" : "ESQUIVA";
}
