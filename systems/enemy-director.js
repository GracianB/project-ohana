// PROJECT OHANA V38 · ENEMY ENCOUNTER DIRECTOR
// Deterministic room-level coordination for regular foes.
// It never mutates health/damage/hitboxes; it only assigns intent, attack permits
// and steering hints consumed by the existing per-species state machines.

import { ROOM_HARD } from "../engine/foes.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export const ENEMY_ROLES = Object.freeze({
  DIVER: "DIVER",
  SKIRMISHER: "SKIRMISHER",
  ARTILLERY: "ARTILLERY",
  BRUISER: "BRUISER",
  AMBUSHER: "AMBUSHER",
  SWARM: "SWARM",
});

const ROLE_BY_KIND = Object.freeze({
  phosquito: ENEMY_ROLES.DIVER,
  mosquito: ENEMY_ROLES.DIVER,
  gaviota: ENEMY_ROLES.DIVER,
  abeja: ENEMY_ROLES.DIVER,
  avispa: ENEMY_ROLES.DIVER,
  libelula: ENEMY_ROLES.SKIRMISHER,
  murcielago: ENEMY_ROLES.SKIRMISHER,
  pez: ENEMY_ROLES.SWARM,
  brasita: ENEMY_ROLES.SWARM,
  cucaracho: ENEMY_ROLES.BRUISER,
  cangrejo: ENEMY_ROLES.BRUISER,
  rana: ENEMY_ROLES.BRUISER,
  escoria: ENEMY_ROLES.BRUISER,
  planta: ENEMY_ROLES.ARTILLERY,
  medusa: ENEMY_ROLES.ARTILLERY,
  anguila: ENEMY_ROLES.ARTILLERY,
  ufo: ENEMY_ROLES.ARTILLERY,
  arana: ENEMY_ROLES.AMBUSHER,
});

const PROFILE = Object.freeze({
  [ENEMY_ROLES.DIVER]:      { preferred: 150, retreat: 0.18, flank: 0.46, priority: 1.20 },
  [ENEMY_ROLES.SKIRMISHER]: { preferred: 210, retreat: 0.26, flank: 0.62, priority: 1.05 },
  [ENEMY_ROLES.ARTILLERY]:  { preferred: 300, retreat: 0.38, flank: 0.32, priority: 0.90 },
  [ENEMY_ROLES.BRUISER]:    { preferred: 92,  retreat: 0.00, flank: 0.18, priority: 1.28 },
  [ENEMY_ROLES.AMBUSHER]:   { preferred: 130, retreat: 0.22, flank: 0.72, priority: 1.12 },
  [ENEMY_ROLES.SWARM]:      { preferred: 120, retreat: 0.12, flank: 0.54, priority: 0.82 },
});

const ACTIVE_FLAGS = Object.freeze([
  "diving", "darting", "charging", "pulsezap", "hopWind", "clawWind",
  "clawSnap", "dropping", "dashSwim", "lunge", "wind",
]);

export function enemyRole(kind = "") {
  return ROLE_BY_KIND[kind] || ENEMY_ROLES.SKIRMISHER;
}

export function enemyIsCommitted(e = {}) {
  if (e.telegraph) return true;
  return ACTIVE_FLAGS.some((key) => Number(e[key]) > 0);
}

function centerX(entity = {}) {
  return (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2;
}
function centerY(entity = {}) {
  return (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2;
}

function hpRatio(e = {}) {
  return clamp((Number(e.hp) || 0) / Math.max(1, Number(e.max) || 1), 0, 1);
}

function scoreCandidate(e, player, hard, tick) {
  const role = enemyRole(e.kind);
  const profile = PROFILE[role];
  const dx = centerX(player) - centerX(e);
  const dy = centerY(player) - centerY(e);
  const dist = Math.hypot(dx, dy);
  const proximity = 1 - clamp(dist / 720, 0, 1);
  const telegraphBonus = enemyIsCommitted(e) ? 4 : 0;
  const eliteBonus = e.elite ? 0.8 : 0;
  const aggroBonus = clamp(Number(e.aggro) / 100, 0, 1) * 0.9;
  const stableTie = ((Number(e.spawnIndex) || 0) % 7) * 0.001 + (Number(tick) % 11) * 0.00001;
  return telegraphBonus + profile.priority + proximity * (1.4 + hard * 0.12) + eliteBonus + aggroBonus + stableTie;
}

function attackBudget(alive, hard) {
  if (alive <= 1) return alive;
  // Early rooms teach one readable threat. Late rooms can sustain three.
  return clamp(1 + Math.floor((hard + Math.max(0, alive - 4)) / 2), 1, 3);
}

function lowHealthRetreat(e, role) {
  if (e.elite || e.kind === "escoria" || e.kind === "cucaracho") return false;
  const threshold = PROFILE[role]?.retreat || 0;
  return threshold > 0 && hpRatio(e) <= threshold;
}

function flankDirection(e, player) {
  const seed = (Number(e.spawnIndex) || 0) + String(e.kind || "").length;
  const natural = seed % 2 === 0 ? -1 : 1;
  const dx = centerX(player) - centerX(e);
  // Prefer crossing to the opposite side when already far off-axis.
  if (Math.abs(dx) > 260) return Math.sign(dx) || natural;
  return natural;
}

export function directEnemyEncounter(enemies = [], player = null, roomId = "hub", tick = 0) {
  const alive = (Array.isArray(enemies) ? enemies : []).filter((e) =>
    e && !e.boss && !e.dying && Number(e.hp) > 0
  );
  if (!player || player.dead || alive.length === 0) {
    for (const e of alive) {
      e.aiAttackPermit = false;
      e.aiIntent = "PATROL";
      e.aiPack = 0;
      e.aiThreat = 0;
    }
    return Object.freeze({ roomId, hard: ROOM_HARD[roomId] ?? 1, alive: alive.length, budget: 0, committed: 0 });
  }

  const hard = ROOM_HARD[roomId] ?? 1;
  const budget = attackBudget(alive.length, hard);
  const sorted = alive.slice().sort((a, b) =>
    scoreCandidate(b, player, hard, tick) - scoreCandidate(a, player, hard, tick)
  );

  const committed = sorted.filter(enemyIsCommitted);
  const permits = new Set(committed.slice(0, budget));
  for (const e of sorted) {
    if (permits.size >= budget) break;
    if (!permits.has(e)) permits.add(e);
  }

  for (const e of alive) {
    const role = enemyRole(e.kind);
    const profile = PROFILE[role];
    const dx = centerX(player) - centerX(e);
    const dy = centerY(player) - centerY(e);
    const dist = Math.hypot(dx, dy);
    const nearby = alive.filter((o) => o !== e && Math.hypot(centerX(o) - centerX(e), centerY(o) - centerY(e)) < 300).length;
    const retreat = lowHealthRetreat(e, role);
    const permit = permits.has(e) || enemyIsCommitted(e);
    const flank = !permit && !retreat && dist < 520 && profile.flank > 0.4;
    const tooClose = dist < profile.preferred * 0.62;

    e.aiRole = role;
    e.aiPack = nearby;
    e.aiAttackPermit = permit;
    e.aiFlankDir = flankDirection(e, player);
    e.aiPreferredRange = profile.preferred;
    e.aiThreat = clamp(
      (permit ? 0.52 : 0.18) + hard * 0.1 + (e.elite ? 0.18 : 0) + clamp(Number(e.aggro) / 100, 0, 1) * 0.18,
      0,
      1
    );

    if (retreat || (!permit && tooClose && role === ENEMY_ROLES.ARTILLERY)) e.aiIntent = "RETREAT";
    else if (flank) e.aiIntent = "FLANK";
    else if (permit && dist <= Math.max(120, profile.preferred * 1.3)) e.aiIntent = "STRIKE";
    else if (permit) e.aiIntent = "PRESS";
    else e.aiIntent = "HOLD";

    // Shared awareness: a nearby alerted foe can wake the group, without global hive mind.
    const allyAlert = alive.some((o) =>
      o !== e && Number(o.aggro) > 24 &&
      Math.hypot(centerX(o) - centerX(e), centerY(o) - centerY(e)) < 360
    );
    if (allyAlert) e.aggro = Math.max(Number(e.aggro) || 0, 42 + hard * 6);
  }

  return Object.freeze({
    roomId,
    hard,
    alive: alive.length,
    budget,
    committed: permits.size,
    attacking: alive.filter((e) => e.aiAttackPermit).map((e) => e.spawnIndex ?? -1),
  });
}

export function enemyCanCommit(e = {}) {
  return e.aiAttackPermit !== false || enemyIsCommitted(e);
}

export function enemySteering(e = {}, player = null) {
  if (!player || player.dead) return Object.freeze({ x: 0, scale: 1, intent: "PATROL" });
  const dx = centerX(player) - centerX(e);
  const dir = Math.sign(dx) || 1;
  const role = enemyRole(e.kind);
  const intent = e.aiIntent || "PRESS";

  if (intent === "RETREAT") return Object.freeze({ x: -dir, scale: role === ENEMY_ROLES.ARTILLERY ? 0.16 : 0.11, intent });
  if (intent === "FLANK") return Object.freeze({ x: Number(e.aiFlankDir) || 1, scale: 0.09, intent });
  if (intent === "PRESS") return Object.freeze({ x: dir, scale: role === ENEMY_ROLES.BRUISER ? 0.12 : 0.065, intent });
  if (intent === "STRIKE") return Object.freeze({ x: dir, scale: 0.035, intent });
  return Object.freeze({ x: 0, scale: 1, intent });
}

export function enemyDirectorSnapshot(enemies = []) {
  return Object.freeze((Array.isArray(enemies) ? enemies : []).filter((e) => e && !e.boss).map((e) => Object.freeze({
    kind: e.kind,
    role: e.aiRole || enemyRole(e.kind),
    intent: e.aiIntent || "PATROL",
    permit: e.aiAttackPermit !== false,
    threat: Math.round(clamp(e.aiThreat, 0, 1) * 100),
    pack: Math.max(0, Number(e.aiPack) || 0),
  })));
}
