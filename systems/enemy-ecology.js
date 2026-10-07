// PROJECT OHANA V41 · ENEMY ECOLOGY
// Deterministic biome identity layered on top of the V38 encounter director.
// This module never mutates health, damage or hitboxes.

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export const ENEMY_ECOLOGY = Object.freeze({
  hub: Object.freeze({
    id:"garden", formation:"RING", label:"CORO DEL CLARO", color:"#ffe66a",
    cadence:108, budget:0, range:1.00,
    roleBias:Object.freeze({ SWARM:0.20, SKIRMISHER:0.10, BRUISER:-0.05 })
  }),
  beach: Object.freeze({
    id:"tide", formation:"TIDE", label:"MAREA", color:"#7ee7ff",
    cadence:84, budget:0, range:0.94,
    roleBias:Object.freeze({ DIVER:0.38, BRUISER:0.18, ARTILLERY:-0.18 })
  }),
  jungle: Object.freeze({
    id:"canopy", formation:"CANOPY", label:"DOSSEL", color:"#91f0b4",
    cadence:96, budget:0, range:0.98,
    roleBias:Object.freeze({ AMBUSHER:0.42, DIVER:0.24, BRUISER:0.12 })
  }),
  cave: Object.freeze({
    id:"echo", formation:"ECHO", label:"ECO", color:"#c8b6ff",
    cadence:120, budget:0, range:1.08,
    roleBias:Object.freeze({ AMBUSHER:0.48, SKIRMISHER:0.22, ARTILLERY:0.08 })
  }),
  lab: Object.freeze({
    id:"circuit", formation:"CIRCUIT", label:"CIRCUITO", color:"#ffe14a",
    cadence:72, budget:0, range:1.12,
    roleBias:Object.freeze({ ARTILLERY:0.64, SKIRMISHER:0.18, DIVER:-0.16 })
  }),
  ridge: Object.freeze({
    id:"gale", formation:"GALE", label:"VENDAVAL", color:"#fff6c8",
    cadence:78, budget:0, range:1.02,
    roleBias:Object.freeze({ SKIRMISHER:0.38, DIVER:0.30, AMBUSHER:0.08 })
  }),
  space: Object.freeze({
    id:"orbit", formation:"ORBIT", label:"ÓRBITA", color:"#9fd7ff",
    cadence:90, budget:0, range:1.18,
    roleBias:Object.freeze({ ARTILLERY:0.46, SKIRMISHER:0.24, SWARM:0.08 })
  }),
  reef: Object.freeze({
    id:"school", formation:"SCHOOL", label:"CARDUMEN", color:"#78f2dc",
    cadence:66, budget:0, range:0.92,
    roleBias:Object.freeze({ SWARM:0.56, ARTILLERY:0.24, BRUISER:0.06 })
  }),
  volcano: Object.freeze({
    id:"furnace", formation:"FURNACE", label:"HORNO", color:"#ff7a32",
    cadence:60, budget:1, range:0.88,
    roleBias:Object.freeze({ BRUISER:0.54, SWARM:0.36, ARTILLERY:-0.12 })
  }),
  boss: Object.freeze({
    id:"nest", formation:"NEST", label:"NIDO", color:"#ff5a7a",
    cadence:54, budget:0, range:1.00,
    roleBias:Object.freeze({})
  }),
});

export function ecologyForRoom(roomId = "hub") {
  return ENEMY_ECOLOGY[roomId] || ENEMY_ECOLOGY.hub;
}

export function ecologyPriority(roomId, role) {
  const ecology = ecologyForRoom(roomId);
  return Number(ecology.roleBias?.[role]) || 0;
}

export function ecologyBudget(roomId) {
  return clamp(ecologyForRoom(roomId).budget, 0, 1);
}

export function ecologyPreferredRange(roomId, role, basePreferred) {
  const ecology = ecologyForRoom(roomId);
  let multiplier = ecology.range;
  if (ecology.formation === "CIRCUIT" && role === "ARTILLERY") multiplier += 0.10;
  if (ecology.formation === "FURNACE" && role === "BRUISER") multiplier -= 0.08;
  if (ecology.formation === "SCHOOL" && role === "SWARM") multiplier -= 0.06;
  return clamp((Number(basePreferred) || 160) * multiplier, 72, 380);
}

export function ecologyFlankBias(roomId, role, baseFlank) {
  const formation = ecologyForRoom(roomId).formation;
  let bonus = 0;
  if (formation === "TIDE" && role === "DIVER") bonus = 0.18;
  else if (formation === "CANOPY" && role === "AMBUSHER") bonus = 0.20;
  else if (formation === "ECHO" && role === "AMBUSHER") bonus = 0.14;
  else if (formation === "GALE" && role === "SKIRMISHER") bonus = 0.16;
  else if (formation === "ORBIT" && role !== "BRUISER") bonus = 0.12;
  return clamp((Number(baseFlank) || 0) + bonus, 0, 0.92);
}

export function ecologyFlankDirection(roomId, e = {}, tick = 0, fallback = 1) {
  const ecology = ecologyForRoom(roomId);
  const slot = Math.abs(Number(e.spawnIndex) || 0) % 6;
  const beat = Math.floor(Math.max(0, Number(tick) || 0) / ecology.cadence);
  const alternating = (slot + beat) % 2 === 0 ? -1 : 1;
  if (ecology.formation === "GALE") return beat % 2 === 0 ? 1 : -1;
  if (ecology.formation === "SCHOOL") return slot < 3 ? -1 : 1;
  if (ecology.formation === "ORBIT" || ecology.formation === "TIDE" || ecology.formation === "ECHO") return alternating;
  return Number(fallback) < 0 ? -1 : 1;
}

export function applyEnemyEcology(e = {}, roomId = "hub", role = "SKIRMISHER", tick = 0, permit = false) {
  const ecology = ecologyForRoom(roomId);
  const slot = Math.abs(Number(e.spawnIndex) || 0) % 6;
  const beat = Math.floor(Math.max(0, Number(tick) || 0) / ecology.cadence);
  const phase = (slot + beat) % 4;
  const pulse = phase / 3;

  e.aiBiome = ecology.id;
  e.aiFormation = ecology.formation;
  e.aiFormationSlot = slot;
  e.aiEcoColor = ecology.color;
  e.aiEcoPulse = pulse;
  e.aiEcoLabel = ecology.label;
  e.aiEcoPressure = clamp(
    0.16 + ecologyPriority(roomId, role) * 0.42 + (permit ? 0.34 : 0.08) + (ecology.budget ? 0.12 : 0),
    0,
    1
  );
  return ecology;
}

export function ecologyHoldSteering(e = {}, player = null) {
  if (!player || e.aiAttackPermit !== false) return 0;
  const formation = String(e.aiFormation || "");
  const slot = Math.abs(Number(e.aiFormationSlot) || 0);
  const playerX = (Number(player.x) || 0) + (Number(player.w) || 0) / 2;
  const enemyX = (Number(e.x) || 0) + (Number(e.w) || 0) / 2;
  const toward = Math.sign(playerX - enemyX) || 1;
  const side = slot % 2 === 0 ? -1 : 1;

  if (formation === "ORBIT") return side * 0.055;
  if (formation === "TIDE") return side * 0.045;
  if (formation === "SCHOOL") return toward * 0.038;
  if (formation === "CIRCUIT") return -toward * 0.032;
  if (formation === "GALE") return side * 0.050;
  if (formation === "ECHO") return -toward * 0.022;
  if (formation === "CANOPY") return side * 0.026;
  if (formation === "FURNACE") return toward * 0.030;
  return 0;
}

export function ecologySnapshot(enemies = []) {
  return Object.freeze((Array.isArray(enemies) ? enemies : [])
    .filter((e) => e && !e.boss)
    .map((e) => Object.freeze({
      kind:e.kind,
      biome:e.aiBiome || "",
      formation:e.aiFormation || "",
      slot:Math.max(0, Number(e.aiFormationSlot) || 0),
      pressure:Math.round(clamp(e.aiEcoPressure, 0, 1) * 100),
    })));
}
