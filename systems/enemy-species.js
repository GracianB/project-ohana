// PROJECT OHANA V42 · ENEMY SPECIES EVOLUTION
// Species identity, deterministic world variants and local inter-species relations.
// This layer may influence tactical priority, spacing and steering only.
// It must never mutate health, damage, hitboxes or simulation RNG.

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export const SPECIES_PROFILES = Object.freeze({
  phosquito: Object.freeze({ family:"spore", signature:"FISSION", glyph:"split", color:"#75e8b8", priority:0.14, range:0.92, flank:0.12, hold:0.025, variants:["ESPORA","AGUJA","GEMELA"] }),
  mosquito: Object.freeze({ family:"raptor", signature:"BLOOD_DIVE", glyph:"fang", color:"#ff725d", priority:0.18, range:0.86, flank:0.18, hold:0.040, variants:["RASANTE","HEMATITA","CAZADOR"] }),
  gaviota: Object.freeze({ family:"raptor", signature:"WIND_CUT", glyph:"wing", color:"#d8edff", priority:0.13, range:0.90, flank:0.22, hold:0.050, variants:["BRISA","TAJO","ALBATROS"] }),
  abeja: Object.freeze({ family:"hive", signature:"LANCER", glyph:"sting", color:"#ffe45e", priority:0.16, range:0.88, flank:0.15, hold:0.045, variants:["OBRERA","LANZA","REINA"] }),
  avispa: Object.freeze({ family:"hive", signature:"LANCER", glyph:"sting", color:"#ffd14a", priority:0.17, range:0.86, flank:0.17, hold:0.045, variants:["OBRERA","LANZA","REINA"] }),
  libelula: Object.freeze({ family:"hive", signature:"FEINT", glyph:"dart", color:"#62ffc2", priority:0.10, range:1.06, flank:0.24, hold:0.060, variants:["ESPEJO","FINTA","VECTOR"] }),
  murcielago: Object.freeze({ family:"night", signature:"SONAR", glyph:"sonar", color:"#bd83ff", priority:0.12, range:1.02, flank:0.26, hold:0.050, variants:["ECO","UMBRA","NOCTURNO"] }),
  pez: Object.freeze({ family:"school", signature:"FLASH", glyph:"school", color:"#59c8ff", priority:-0.02, range:0.88, flank:0.10, hold:0.035, variants:["ALEVIN","DESTELLO","BANCO"] }),
  brasita: Object.freeze({ family:"ember", signature:"IGNITE", glyph:"ember", color:"#ff8d32", priority:0.05, range:0.82, flank:0.08, hold:0.050, variants:["CHISPA","ASCAL","BRASA"] }),
  cucaracho: Object.freeze({ family:"carapace", signature:"ANCHOR", glyph:"shell", color:"#b47b48", priority:0.20, range:0.78, flank:-0.08, hold:0.015, variants:["CAPARAZON","MURO","TITAN"] }),
  cangrejo: Object.freeze({ family:"carapace", signature:"GUARD", glyph:"claw", color:"#ff995d", priority:0.16, range:0.82, flank:-0.04, hold:0.012, variants:["PINZA","BASTION","CORAZA"] }),
  rana: Object.freeze({ family:"bog", signature:"LEAP", glyph:"leap", color:"#7df06c", priority:0.14, range:0.90, flank:0.05, hold:0.025, variants:["MUELLE","SALTO","TORRENTE"] }),
  escoria: Object.freeze({ family:"ember", signature:"RAM", glyph:"forge", color:"#ff5d28", priority:0.22, range:0.75, flank:-0.10, hold:0.020, variants:["YUNQUE","FISURA","FORJA"] }),
  planta: Object.freeze({ family:"root", signature:"COVER", glyph:"root", color:"#ef6b68", priority:0.08, range:1.18, flank:-0.08, hold:0.000, variants:["RAIZ","ESPINA","CORONA"] }),
  medusa: Object.freeze({ family:"abyss", signature:"PULSE", glyph:"pulse", color:"#ff9adc", priority:0.10, range:1.12, flank:0.04, hold:0.020, variants:["VELO","PULSO","ABISAL"] }),
  anguila: Object.freeze({ family:"abyss", signature:"ARC", glyph:"arc", color:"#59f2e4", priority:0.12, range:1.08, flank:0.12, hold:0.035, variants:["CABLE","ARCO","VOLTA"] }),
  ufo: Object.freeze({ family:"void", signature:"RELAY", glyph:"relay", color:"#8eeaff", priority:0.10, range:1.22, flank:0.08, hold:0.040, variants:["SONDA","NODO","INTERCEPTOR"] }),
  arana: Object.freeze({ family:"night", signature:"WEB", glyph:"web", color:"#d08b75", priority:0.16, range:0.92, flank:0.28, hold:0.000, variants:["HILO","TRAMPA","TEJEDORA"] }),
});

const FALLBACK = Object.freeze({
  family:"wild", signature:"ADAPT", glyph:"dot", color:"#d8e8ff",
  priority:0, range:1, flank:0, hold:0.02, variants:["NATIVA","ADAPTADA","ALFA"]
});

export const SPECIES_RELATIONS = Object.freeze({
  PACK:"PACK",
  FLUSH:"FLUSH",
  SCREEN:"SCREEN",
  TRAP:"TRAP",
  RELAY:"RELAY",
  PINCER:"PINCER",
  NONE:"NONE",
});

const ROLE_PAIR = Object.freeze({
  "ARTILLERY|DIVER": SPECIES_RELATIONS.FLUSH,
  "BRUISER|SWARM": SPECIES_RELATIONS.SCREEN,
  "AMBUSHER|SKIRMISHER": SPECIES_RELATIONS.TRAP,
  "ARTILLERY|SKIRMISHER": SPECIES_RELATIONS.RELAY,
  "AMBUSHER|BRUISER": SPECIES_RELATIONS.PINCER,
});

function stableHash(value = "") {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function speciesProfile(kind = "") {
  return SPECIES_PROFILES[kind] || FALLBACK;
}

export function speciesVariant(kind = "", roomId = "hub", spawnIndex = 0) {
  const profile = speciesProfile(kind);
  const seed = stableHash(kind + ":" + roomId) + Math.max(0, Number(spawnIndex) || 0);
  const index = seed % profile.variants.length;
  const mode = ["HUNTER","SENTINEL","CATALYST"][index % 3];
  return Object.freeze({ index, name:profile.variants[index], mode });
}

function relationFor(a, b, roleOf) {
  const pa = speciesProfile(a.kind);
  const pb = speciesProfile(b.kind);
  if (pa.family === pb.family && pa.family !== "wild") return SPECIES_RELATIONS.PACK;
  const ra = roleOf(a.kind);
  const rb = roleOf(b.kind);
  const key = [ra, rb].sort().join("|");
  return ROLE_PAIR[key] || SPECIES_RELATIONS.NONE;
}

function centerX(entity = {}) {
  return (Number(entity.x) || 0) + (Number(entity.w) || 0) / 2;
}
function centerY(entity = {}) {
  return (Number(entity.y) || 0) + (Number(entity.h) || 0) / 2;
}

function relationWeight(relation) {
  if (relation === SPECIES_RELATIONS.FLUSH) return 6;
  if (relation === SPECIES_RELATIONS.TRAP) return 5;
  if (relation === SPECIES_RELATIONS.PINCER) return 4;
  if (relation === SPECIES_RELATIONS.SCREEN) return 3;
  if (relation === SPECIES_RELATIONS.RELAY) return 2;
  if (relation === SPECIES_RELATIONS.PACK) return 1;
  return 0;
}

export function prepareSpeciesEvolution(enemies = [], roomId = "hub", tick = 0, roleOf = () => "SKIRMISHER") {
  const alive = (Array.isArray(enemies) ? enemies : []).filter((e) =>
    e && !e.boss && !e.dying && Number(e.hp) > 0
  );
  const beat = Math.floor(Math.max(0, Number(tick) || 0) / 72);

  for (const e of alive) {
    const profile = speciesProfile(e.kind);
    const variant = speciesVariant(e.kind, roomId, e.spawnIndex);
    e.aiSpeciesFamily = profile.family;
    e.aiSpeciesSignature = profile.signature;
    e.aiSpeciesGlyph = profile.glyph;
    e.aiSpeciesColor = profile.color;
    e.aiSpeciesVariant = variant.name;
    e.aiSpeciesMode = variant.mode;
    e.aiSpeciesRelation = SPECIES_RELATIONS.NONE;
    e.aiSpeciesPartner = -1;
    e.aiSpeciesBeat = beat;
  }

  for (const e of alive) {
    let best = null;
    let bestScore = -1;
    for (const other of alive) {
      if (other === e) continue;
      const dist = Math.hypot(centerX(other) - centerX(e), centerY(other) - centerY(e));
      if (dist > 420) continue;
      const relation = relationFor(e, other, roleOf);
      const score = relationWeight(relation) * 1000 - dist;
      if (score > bestScore) {
        bestScore = score;
        best = { other, relation };
      }
    }
    if (best && best.relation !== SPECIES_RELATIONS.NONE) {
      e.aiSpeciesRelation = best.relation;
      e.aiSpeciesPartner = Number(best.other.spawnIndex) || 0;
    }
  }

  return speciesSnapshot(alive);
}

export function speciesPriority(e = {}, role = "") {
  const profile = speciesProfile(e.kind);
  let value = profile.priority;
  if (e.aiSpeciesMode === "HUNTER") value += 0.12;
  else if (e.aiSpeciesMode === "SENTINEL") value += 0.04;
  else if (e.aiSpeciesMode === "CATALYST") value += 0.08;

  const relation = e.aiSpeciesRelation;
  if (relation === SPECIES_RELATIONS.FLUSH && (role === "DIVER" || role === "ARTILLERY")) value += 0.12;
  else if (relation === SPECIES_RELATIONS.SCREEN && role === "BRUISER") value += 0.10;
  else if (relation === SPECIES_RELATIONS.TRAP && role === "AMBUSHER") value += 0.11;
  else if (relation === SPECIES_RELATIONS.PINCER && role === "BRUISER") value += 0.08;
  else if (relation === SPECIES_RELATIONS.RELAY && role === "ARTILLERY") value += 0.07;
  else if (relation === SPECIES_RELATIONS.PACK) value += 0.04;
  return clamp(value, -0.25, 0.55);
}

export function speciesPreferredRange(e = {}, basePreferred = 160) {
  const profile = speciesProfile(e.kind);
  let mult = profile.range;
  if (e.aiSpeciesMode === "HUNTER") mult *= 0.94;
  else if (e.aiSpeciesMode === "SENTINEL") mult *= 1.08;
  else if (e.aiSpeciesMode === "CATALYST") mult *= 1.02;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.RELAY) mult *= 1.06;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.SCREEN) mult *= 0.94;
  return clamp((Number(basePreferred) || 160) * mult, 68, 420);
}

export function speciesFlankBias(e = {}, baseFlank = 0) {
  const profile = speciesProfile(e.kind);
  let value = (Number(baseFlank) || 0) + profile.flank;
  if (e.aiSpeciesMode === "HUNTER") value += 0.12;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.FLUSH) value += 0.18;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.TRAP) value += 0.16;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.PINCER) value += 0.12;
  return clamp(value, 0, 0.95);
}

export function speciesFlankDirection(e = {}, fallback = 1) {
  const relation = e.aiSpeciesRelation;
  const slot = Math.max(0, Number(e.spawnIndex) || 0);
  const partner = Math.max(0, Number(e.aiSpeciesPartner) || 0);
  const beat = Math.max(0, Number(e.aiSpeciesBeat) || 0);
  if (relation === SPECIES_RELATIONS.FLUSH || relation === SPECIES_RELATIONS.TRAP || relation === SPECIES_RELATIONS.PINCER) {
    return (slot + partner + beat) % 2 === 0 ? -1 : 1;
  }
  if (relation === SPECIES_RELATIONS.PACK) return (slot + beat) % 2 === 0 ? -1 : 1;
  return Number(fallback) < 0 ? -1 : 1;
}

export function speciesHoldSteering(e = {}, player = null) {
  if (!player || e.aiAttackPermit !== false) return 0;
  const profile = speciesProfile(e.kind);
  if (!profile.hold) return 0;
  const playerX = centerX(player);
  const enemyX = centerX(e);
  const toward = Math.sign(playerX - enemyX) || 1;
  const side = (Math.max(0, Number(e.spawnIndex) || 0) + Math.max(0, Number(e.aiSpeciesBeat) || 0)) % 2 === 0 ? -1 : 1;
  let scale = profile.hold;

  if (e.aiSpeciesMode === "HUNTER") scale *= 1.25;
  else if (e.aiSpeciesMode === "SENTINEL") scale *= 0.72;
  else if (e.aiSpeciesMode === "CATALYST") scale *= 1.05;

  if (e.aiSpeciesRelation === SPECIES_RELATIONS.RELAY) return -toward * scale;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.SCREEN) return toward * scale * 0.75;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.FLUSH) return side * scale * 1.35;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.TRAP) return -side * scale * 1.2;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.PINCER) return side * scale * 1.15;
  if (e.aiSpeciesRelation === SPECIES_RELATIONS.PACK) return side * scale;
  return side * scale * 0.7;
}

export function speciesSnapshot(enemies = []) {
  return Object.freeze((Array.isArray(enemies) ? enemies : [])
    .filter((e) => e && !e.boss)
    .map((e) => Object.freeze({
      kind:e.kind,
      family:e.aiSpeciesFamily || speciesProfile(e.kind).family,
      signature:e.aiSpeciesSignature || speciesProfile(e.kind).signature,
      variant:e.aiSpeciesVariant || "",
      mode:e.aiSpeciesMode || "",
      relation:e.aiSpeciesRelation || SPECIES_RELATIONS.NONE,
      partner:Number.isFinite(Number(e.aiSpeciesPartner)) ? Number(e.aiSpeciesPartner) : -1,
    })));
}
