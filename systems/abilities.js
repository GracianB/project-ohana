// ============================================================================
// HABILIDADES · 10 personajes × 3 (J/K/L)
// Cada habilidad tiene una mecánica propia. Las entidades especiales (notas que
// rebotan, charcos, nubes, espíritus, géiseres…) viven en FX (este módulo) con su
// propio update/draw: updateAbilityFx(game) y drawAbilityFx(ctx, game, t).
// systems/passives.js ya los llama desde Passives.afterMove / Passives.draw.
// ============================================================================
import { vfxSprite } from "../characters/sprites.js";
import { drawCharacter } from "../characters/draw.js";
import { ROSTER } from "../characters/roster.js";
import { sfx } from "../engine/audio.js";
import { damageEnemy, healPlayer, addPlayerXp, addScore, addCombo } from "./mutations.js";
import { MAX_RUNTIME_GHOSTS, MAX_RUNTIME_PROJECTILES, pushRuntime } from "./runtime.js";

// cd en ms (se reduce con la forma: cd / (1 + evo*0.12)). J corto, K medio, L largo.
export const ABILITY_DEFS = {
  // Kilo
  ukulele: { name: "Nota saltarina", key: "J", cd: 520, color: "#ffb347", desc: "Nota musical que rebota 3 veces en el suelo." },
  hula: { name: "Giro hula", key: "K", cd: 2100, color: "#ff5ad5", desc: "Giro que refleja proyectiles y te hace flotar." },
  ohana: { name: "Anillo Ohana", key: "L", cd: 6200, color: "#ffd36a", desc: "Espíritus que curan y dañan a todo lo que hay en pantalla." },
  // Stitcho
  plasma: { name: "Ráfaga plasma", key: "J", cd: 600, color: "#5ad1ff", desc: "Tres disparos rápidos de plasma." },
  rollo: { name: "Bola rodante", key: "K", cd: 1900, color: "#2f6bff", desc: "Rueda atravesando enemigos." },
  caos: { name: "Modo caos", key: "L", cd: 5600, color: "#8f7bff", desc: "Rebota por toda la sala arrollándolo todo." },
  // Chispín
  chain: { name: "Rayo en cadena", key: "J", cd: 650, color: "#ffe14a", desc: "Rayo que salta entre hasta 4 enemigos." },
  blink: { name: "Chispazo", key: "K", cd: 1700, color: "#fff3a0", desc: "Teletransporte corto que deja una estela eléctrica." },
  storm: { name: "Nube tormenta", key: "L", cd: 6000, color: "#9cf", desc: "Nube que persigue enemigos lanzando rayos." },
  // Michi
  yarn: { name: "Ovillo bumerán", key: "J", cd: 600, color: "#ff8ad4", desc: "Ovillo que va y vuelve atravesando enemigos." },
  purr: { name: "Ronroneo", key: "K", cd: 2400, color: "#ffb6e4", desc: "Onda grande que duerme a lo que alcanza y te cura." },
  ninetails: { name: "Nueve colas", key: "L", cd: 6000, color: "#b78bff", desc: "9 colas brillantes que serpentean y persiguen." },
  // Dragón
  breath: { name: "Llamarada", key: "J", cd: 750, color: "#ff6a2a", desc: "Cono de fuego continuo a corta distancia." },
  gust: { name: "Aletazo", key: "K", cd: 1800, color: "#bfefff", desc: "Ráfaga que empuja enemigos y te impulsa arriba." },
  meteor: { name: "Lluvia de meteoros", key: "L", cd: 6500, color: "#ff4a20", desc: "Meteoritos de fuego caen del cielo." },
  // Dino
  bite: { name: "Mordisco", key: "J", cd: 700, color: "#e8ffe0", desc: "Mordisco demoledor y huesos a distancia; evoluciona en abanico." },
  charge: { name: "Embestida", key: "K", cd: 2200, color: "#4cbf56", desc: "Carga blindada: invulnerable mientras dura." },
  quake: { name: "Terremoto", key: "L", cd: 6000, color: "#c8a060", desc: "Onda por el suelo que lanza por los aires." },
  // Frita
  salt: { name: "Escopetazo de sal", key: "J", cd: 600, color: "#fff3c0", desc: "Abanico de granos de sal a corta distancia." },
  ketchup: { name: "Charco kétchup", key: "K", cd: 2000, color: "#e23b3b", desc: "Charco que ralentiza y daña con el tiempo." },
  fryer: { name: "Géiseres de aceite", key: "L", cd: 6000, color: "#ffd36a", desc: "Columnas de aceite hirviendo brotan en fila." },
  // Pizza
  pepperoni: { name: "Disco pepperoni", key: "J", cd: 620, color: "#e0402a", desc: "Disco que rebota en paredes y suelo." },
  cheese: { name: "Hilo de queso", key: "K", cd: 1600, color: "#ffd84a", desc: "Te engancha a un enemigo o a la plataforma de arriba." },
  oven: { name: "Horno total", key: "L", cd: 6500, color: "#ff8a2a", desc: "Ola de calor y lluvia de porciones." },
  ofuda: { name: "Ofuda", key: "J", cd: 560, color: "#f2e6c8", desc: "Talismán de papel que se clava y estalla." },
  sleeve: { name: "Manga", key: "K", cd: 1800, color: "#6a3cff", desc: "La manga aspira a los enemigos hacia la máscara." },
  maw: { name: "Fauces", key: "L", cd: 5800, color: "#ff2244", desc: "La máscara se abre y muerde todo lo que tiene delante." },
  gleam: { name: "Brillo", key: "J", cd: 480, color: "#ffe9a8", desc: "Estrella recta que atraviesa a varios." },
  gallop: { name: "Galope", key: "K", cd: 1600, color: "#f2c1ff", desc: "Embiste con el cuerno y no se para." },
  rainbow: { name: "Arco", key: "L", cd: 5600, color: "#fff6c8", desc: "Siete estrellas rectas, una de cada color." },
};

const FLOW_KEYS = ["H", "J", "K", "L", "U"];
const FLOW_WINDOW = 180;

export function registerCombatAction(game, key, id = "") {
  const p = game?.player;
  if (!p) return Object.freeze({ distinct: 0, combo: 0, multiplier: 1, assist: false, label: "" });
  const now = Number.isFinite(Number(game.t)) ? Number(game.t) : 0;
  const normalized = String(key || "").toUpperCase();
  if (!FLOW_KEYS.includes(normalized)) return Object.freeze({ distinct: 0, combo: 0, multiplier: 1, assist: false, label: "" });
  const chain = Array.isArray(p._combatChain) ? p._combatChain.filter((item) => now - item.t <= FLOW_WINDOW) : [];
  const last = chain[chain.length - 1];
  const previous = last?.key || "";
  if (!last || last.key !== normalized || now - last.t > 16) chain.push({ key: normalized, id: String(id || ""), t: now });
  while (chain.length > 6) chain.shift();
  p._combatChain = chain;
  const recent = chain.slice(-5);
  const distinct = new Set(recent.map((item) => item.key)).size;
  const combo = Math.max(0, Number(game.combo) || 0);
  const multiplier = Math.min(1.38, 1 + Math.max(0, distinct - 1) * 0.055 + Math.min(combo, 20) * 0.006);
  const assist = normalized === "U" && (distinct >= 4 || combo >= 10);
  const label = distinct >= 5 ? "OHANA FLOW" : distinct >= 4 ? "FUSIÓN" : distinct >= 3 ? "CADENA" : distinct >= 2 ? "ENLACE" : "";
  game._combatFlow = { distinct, combo, multiplier, assist, label, keys: recent.map((item) => item.key), t: now };
  if (label) {
    p._flowT = 72;
    p._flowLabel = label;
    p._flowPower = Math.min(1.18, multiplier);
    p._flowPowerT = 96;
  }
  return Object.freeze({ distinct, combo, multiplier, assist, label, previous });
}

function currentFlow(game, p) {
  const now = Number.isFinite(Number(game?.t)) ? Number(game.t) : 0;
  const chain = Array.isArray(p?._combatChain) ? p._combatChain.filter((item) => now - item.t <= FLOW_WINDOW) : [];
  const distinct = new Set(chain.slice(-5).map((item) => item.key)).size;
  const combo = Math.max(0, Number(game?.combo) || 0);
  return Object.freeze({
    distinct,
    combo,
    multiplier: Math.min(1.38, 1 + Math.max(0, distinct - 1) * 0.055 + Math.min(combo, 20) * 0.006),
    assist: distinct >= 4 || combo >= 10,
    label: distinct >= 5 ? "OHANA FLOW" : distinct >= 4 ? "FUSIÓN" : distinct >= 3 ? "CADENA" : distinct >= 2 ? "ENLACE" : ""
  });
}

const SIGNATURE_LINKS = Object.freeze({
  kilo:    { name: "SERENATA HULA", color: "#ffd36a" },
  stitcho: { name: "PLASMA ROLL", color: "#67ddff" },
  chispin: { name: "CADENA RELÁMPAGO", color: "#ffe14a" },
  cat:     { name: "OVILLO SOMBRA", color: "#ffb6e4" },
  dragon:  { name: "ALIENTO ASCENDENTE", color: "#ff8a3a" },
  dino:    { name: "MORDISCO EN CARGA", color: "#c8f04a" },
  frita:   { name: "SALSA TURBO", color: "#ffd36a" },
  pizza:   { name: "PEPPERONI ELÁSTICO", color: "#ff8a2a" },
  yomi:    { name: "OFUDA SOMBRA", color: "#ff2244" },
  cuerno:  { name: "BRILLO DE CARGA", color: "#fff6c8" },
});

function applySignatureLink(game, p, flow, key) {
  if (!p || flow?.previous !== "J" || key !== "K") return null;
  const link = SIGNATURE_LINKS[p.id];
  if (!link) return null;

  if (p.id === "kilo") {
    healPlayer(p, 8);
    S.hover = Math.max(S.hover || 0, 28);
    armor(p, 8);
  } else if (p.id === "stitcho") {
    S.roll = Math.max(S.roll || 0, 58);
    armor(p, 12);
  } else if (p.id === "chispin") {
    p.invuln = Math.max(p.invuln || 0, 18);
    p._specialSpeedT = Math.max(p._specialSpeedT || 0, 54);
  } else if (p.id === "cat") {
    p.invuln = Math.max(p.invuln || 0, 18);
    p._specialShadowT = Math.max(p._specialShadowT || 0, 72);
  } else if (p.id === "dragon") {
    p._specialFlightT = Math.max(p._specialFlightT || 0, 96);
  } else if (p.id === "dino") {
    S.charge = Math.max(S.charge || 0, 72);
    armor(p, 10);
  } else if (p.id === "frita") {
    p._specialSpeedT = Math.max(p._specialSpeedT || 0, 96);
    p.invuln = Math.max(p.invuln || 0, 12);
  } else if (p.id === "pizza") {
    p._specialBounceT = Math.max(p._specialBounceT || 0, 100);
    armor(p, 10);
  } else if (p.id === "yomi") {
    p._specialGhostT = Math.max(p._specialGhostT || 0, 90);
    p.invuln = Math.max(p.invuln || 0, 14);
  } else if (p.id === "cuerno") {
    S.gallop = Math.max(S.gallop || 0, 70);
    S.gallopFace = p.facing || 1;
    p._specialAuroraT = Math.max(p._specialAuroraT || 0, 72);
  }

  p._specialT = Math.max(Number(p._specialT) || 0, 110);
  p._flowPower = Math.max(Number(p._flowPower) || 1, 1.14);
  p._flowPowerT = Math.max(Number(p._flowPowerT) || 0, 110);
  game.nums?.add(cx(p), p.y - 32, link.name, link.color, true);
  game.fx?.emit(cx(p), cy(p), { color: link.color, count: 14, size: 3, star: true, speed: 3.2, life: 16 });
  game._signatureLink = { id: p.id, name: link.name, t: Number(game.t) || 0 };
  return link;
}


export function useAbility(game, index) {
  const p = game?.player;
  if (!p || p.dead || !Number.isInteger(index) || index < 0 || index > 3) return false;
  const supreme = index === 3 ? SUPREME[p.id] : null;
  const id = supreme ? supreme.id : p.abilities && p.abilities[index];
  const def = supreme || ABILITY_DEFS[id];
  if (!def) return false;
  const fn = CASTERS[id];
  if (index !== 3 && typeof fn !== "function") return false;
  const baseCd = Number(def.cd);
  if (!Number.isFinite(baseCd) || baseCd <= 0) return false;
  const now = abilityNow(game);
  p.cds = p.cds || {};
  p.cdDur = p.cdDur || {};
  const currentUntil = Number(p.cds[id]);
  if (Number.isFinite(currentUntil) && currentUntil > now) return false;

  const key = FLOW_KEYS[index + 1];
  const preFlow = currentFlow(game, p);
  const evo = clamp(Number(p.evo) || 0, 0, 4);
  const chainCd = index < 3
    ? Math.max(0.82, 1 - Math.max(0, preFlow.distinct - 1) * 0.035)
    : (preFlow.distinct >= 4 || preFlow.combo >= 10 ? 0.82 : 1);
  const dur = baseCd / (1 + evo * 0.12) * chainCd;
  p.cds[id] = now + dur;
  p.cdDur[id] = dur;
  game.lastAbilityId = id;
  game.lastAbilitySlot = index;
  syncState(p);
  p._cast = { slot: index, t: Number.isFinite(Number(game.t)) ? Number(game.t) : 0, id, form: evo };
  sfx(id);
  game.fx?.emit(cx(p) + (p.facing || 1) * 16, cy(p), { color: def.color, count: index === 3 ? 28 : 10, size: index === 3 ? 4 : 3, star: true, speed: index === 3 ? 3.8 : 2.8, life: 14 });

  if (index === 2) {
    game.ult = { t: 46, color: def.color, name: def.name };
    game.flashColor = def.color;
    game.flash = Math.max(game.flash || 0, 14);
    game.shake = Math.min(18, (game.shake || 0) + 7);
    game.hitstop = Math.min(5, Math.max(game.hitstop || 0, 5));
  }

  if (S.pull && id !== "cheese") S.pull = null;
  const flow = registerCombatAction(game, key, id);
  const signatureLink = index < 3 ? applySignatureLink(game, p, flow, key) : null;

  if (index === 3) castSupreme(game, p, flow);
  else fn(game, p, evo);
  if (signatureLink) game._combatFlow = { ...game._combatFlow, signature: signatureLink.name };

  if (flow.label && index < 3) {
    game.nums?.add(cx(p), p.y - 22, flow.label, def.color || p.color || "#fff6c8");
  }
  trimAbilityProjectiles(game);
  return true;
}

const SPECIALS = Object.freeze({
  kilo:    { flight: true,  name: "Vuelo solar", text: "Vuelo libre: WASD controla el aire durante unos segundos." },
  stitcho: { phase: true,   name: "Costura fantasma", text: "Cruza el peligro con intangibilidad breve." },
  chispin: { boltDash: true,name: "Rayo veloz", text: "Impulso eléctrico horizontal con invulnerabilidad." },
  cat:     { shadow: true,  name: "Paso sombra", text: "Desaparece y reaparece con invulnerabilidad." },
  dragon:  { flight: true,  name: "Vuelo celestial", text: "Vuelo libre: WASD controla el aire durante unos segundos." },
  dino:    { titan: true,   name: "Modo coloso", text: "Armadura y pisotón reforzado durante unos segundos." },
  frita:   { turbo: true,   name: "Centella", text: "Velocidad extrema e inmunidad breve." },
  pizza:   { bounce: true,  name: "Rebote volcánico", text: "Escudo y rebotes potenciados durante unos segundos." },
  yomi:    { ghost: true,   name: "Paso del abismo", text: "Forma espectral: atraviesa peligros durante unos segundos." },
  cuerno:  { aurora: true,  name: "Manto aurora", text: "Escudo luminoso y salto mejorado durante unos segundos." },
});

const SUPREME = Object.freeze({
  kilo:    { id: "solar", name: "OHANA SOLAR", key: "U", cd: 9000, color: "#ffd36a", special: "Vuelo solar", ally: "stitcho" },
  stitcho: { id: "bang", name: "SINGULARIDAD COSIDA", key: "U", cd: 9000, color: "#8f7bff", special: "Costura fantasma", ally: "chispin" },
  chispin: { id: "boltgod", name: "TORMENTA ABSOLUTA", key: "U", cd: 9000, color: "#ffe14a", special: "Rayo veloz", ally: "cat" },
  cat:     { id: "eclipse", name: "ECLIPSE DE NUEVE VIDAS", key: "U", cd: 9000, color: "#ffb6e4", special: "Paso sombra", ally: "dragon" },
  dragon:  { id: "nova", name: "SUPERNOVA CELESTE", key: "U", cd: 9000, color: "#ff4a20", special: "Vuelo celestial", ally: "dino" },
  dino:    { id: "impact", name: "EXTINCIÓN", key: "U", cd: 9000, color: "#c8f04a", special: "Modo coloso", ally: "frita" },
  frita:   { id: "frygod", name: "FREIDORA APOCALIPSIS", key: "U", cd: 9000, color: "#ffd36a", special: "Centella", ally: "pizza" },
  pizza:   { id: "ovenking", name: "HORNO REAL", key: "U", cd: 9000, color: "#ff8a2a", special: "Rebote volcánico", ally: "yomi" },
  yomi:    { id: "devour", name: "PUERTA DEL ABISMO", key: "U", cd: 9000, color: "#ff2244", special: "Paso del abismo", ally: "cuerno" },
  cuerno:  { id: "aurora", name: "AURORA OHANA", key: "U", cd: 9000, color: "#fff6c8", special: "Manto aurora", ally: "kilo" },
});

export function supremeOf(id) {
  return SUPREME[id] || SUPREME.kilo;
}

export function specialOf(id) {
  return SPECIALS[id] || SPECIALS.kilo;
}

export const SUPREME_IDENTITY = Object.freeze({
  kilo:    { kind: "bloom",   line: "NADIE SE QUEDA ATRÁS", text: "El sol llama a toda la familia." },
  stitcho: { kind: "rift",    line: "TODO CAOS TIENE COSTURA", text: "Cose el espacio y arrastra el combate al centro." },
  chispin: { kind: "chain",   line: "NO HAY DONDE ESCONDERSE", text: "La tormenta marca y persigue cada blanco." },
  cat:     { kind: "eclipse", line: "NUEVE VIDAS. UNA SOMBRA.", text: "El mundo se apaga y las sombras cazan." },
  dragon:  { kind: "nova",    line: "EL CIELO TAMBIÉN LUCHA", text: "El vuelo abre una lluvia de estrellas de fuego." },
  dino:    { kind: "quake",   line: "ANTES DEL MIEDO, EL RUGIDO", text: "La tierra se rompe bajo cada paso." },
  frita:   { kind: "crisp",   line: "TODO AL PUNTO", text: "Aceite, velocidad y una cocina absolutamente irresponsable." },
  pizza:   { kind: "volcano", line: "ABRID EL HORNO", text: "El escenario entero se convierte en una pizzería volcánica." },
  yomi:    { kind: "maw",     line: "EL ABISMO TIENE HAMBRE", text: "La grieta atrae, marca y ejecuta a los débiles." },
  cuerno:  { kind: "aurora",  line: "CORRE HACIA LA LUZ", text: "Aurora, escudo y una estampida de color." },
});

function activateSpecial(game, p, { launch = true } = {}) {
  const s = specialOf(p.id);
  const T = 210;
  p._specialT = T;
  p._specialId = p.id;
  p._specialFlightT = s.flight ? T : 0;
  p._specialArmorT = s.phase || s.boltDash || s.shadow || s.titan || s.turbo || s.bounce || s.ghost || s.aurora ? T : 0;
  p._specialSpeedT = s.turbo ? T : 0;
  p._specialBounceT = s.bounce ? T : 0;
  p._specialGhostT = s.ghost ? T : 0;
  p._specialShadowT = s.shadow ? T : 0;
  p._specialTitanT = s.titan ? T : 0;
  p._specialAuroraT = s.aurora ? T : 0;

  if (s.flight) {
    if (launch) {
      p.vy = -1;
      p.grounded = false;
    }
    game.nums.add(cx(p), p.y - 18, s.name, "#fff6c8", true);
  } else if (s.boltDash) {
    if (launch) {
      p.vx = (p.facing || 1) * Math.max(14, p.speed * 3.4);
      p.vy = -1.5;
    }
  } else if (s.shadow) {
    p.invuln = Math.max(p.invuln || 0, 80);
    if (launch) p.x += (p.facing || 1) * 56;
  } else if (s.titan) {
    p.invuln = Math.max(p.invuln || 0, 60);
    if (launch) p.vy = -5;
  } else if (s.turbo) {
    if (launch) p.vx = (p.facing || 1) * Math.max(12, p.speed * 2.8);
  } else if (s.aurora) {
    p.invuln = Math.max(p.invuln || 0, 80);
    if (launch) p.vy = -p.jumpPower * 1.2;
  }

  game._specialPulse = { id: p.id, t: 36, color: SUPREME[p.id]?.color || p.color || "#fff" };
}

function emitSupremeEvent(game, p, def, identity, flow) {
  if (typeof dispatchEvent !== "function" || typeof CustomEvent !== "function") return;
  const ally = flow.assist ? (SUPREME[p.id]?.ally || "") : "";
  try {
    dispatchEvent(new CustomEvent("ohana-supreme", { detail: {
      id: p.id,
      evo: Number(p.evo || 0),
      hero: p.name || p.id,
      name: def.name,
      color: def.color,
      kind: identity.kind,
      line: identity.line,
      text: identity.text,
      multiplier: Number(flow.multiplier.toFixed(2)),
      flow: flow.label || "",
      combo: flow.combo,
      assist: ally
    }}));
  } catch (_) {}
}

function summonAssist(game, p, allyId, damage, color) {
  const ally = ROSTER.find((item) => item.id === allyId);
  if (!ally) return;
  add({
    kind: "assist",
    heroId: ally.id,
    heroName: ally.name,
    color: ally.color || color || "#fff",
    x: cx(p) - (p.facing || 1) * 90,
    y: p.y - 24,
    facing: p.facing || 1,
    life: 96,
    max: 96,
    next: 10,
    strikes: 0,
    dmg: Math.max(12, damage),
  });
  game._assist = { heroId: ally.id, heroName: ally.name, t: 96 };
  game.nums?.add(cx(p), p.y - 36, "OHANA ASSIST · " + ally.name, ally.color || "#fff6c8", true);
}

function castSupreme(game, p, flow = currentFlow(game, p)) {
  activateSpecial(game, p, { launch: false });
  const def = SUPREME[p.id] || SUPREME.kilo;
  const identity = SUPREME_IDENTITY[p.id] || SUPREME_IDENTITY.kilo;
  const evo = clamp(Number(p.evo) || 0, 0, 4);
  const power = Math.max(1, Number(flow?.multiplier) || 1);
  const dmg = (70 + evo * 14) * pw(p) * power;
  const enemies = (game.enemies || []).filter(canHit);

  emitSupremeEvent(game, p, def, identity, flow);

  if (p.id === "kilo") {
    for (const e of enemies) hitEnemy(game, e, dmg * 0.72, { kx: Math.sign(cx(e) - cx(p)) * 5, ky: -8, stun: 28, color: def.color, crit: true });
    healPlayer(p, p.maxHealth * 0.32);
    p.invuln = Math.max(p.invuln || 0, 90);
  } else if (p.id === "stitcho") {
    const tx = cx(p), ty = cy(p);
    for (const e of enemies) {
      const dx = tx - cx(e), dy = ty - cy(e);
      const d = Math.hypot(dx, dy) || 1;
      hitEnemy(game, e, dmg * 0.82, { kx: (dx / d) * 14, ky: (dy / d) * 9 - 5, stun: 60, color: def.color, crit: true });
      e._stitchedT = Math.max(e._stitchedT || 0, 120);
    }
  } else if (p.id === "chispin") {
    const ordered = enemies.slice().sort((a,b) =>
      Math.hypot(cx(a)-cx(p),cy(a)-cy(p)) - Math.hypot(cx(b)-cx(p),cy(b)-cy(p))
    ).slice(0, 8);
    ordered.forEach((e,i) => {
      hitEnemy(game, e, dmg * Math.max(0.48, 1 - i * 0.07), { kx: 0, ky: -4, stun: 36, color: def.color, crit: i < 3 });
      e._stormMarkedT = Math.max(e._stormMarkedT || 0, 150);
    });
  } else if (p.id === "cat") {
    for (const e of enemies) {
      hitEnemy(game, e, dmg * 0.86, { kx: 0, ky: -2, stun: 78, color: def.color, crit: true });
      e._eclipseT = 130;
      e.vx *= 0.16;
      e.vy *= 0.16;
    }
    p.invuln = Math.max(p.invuln || 0, 80);
    p._shadowCloneT = 150;
  } else if (p.id === "dragon") {
    for (const e of enemies) hitEnemy(game, e, dmg * 1.08, { kx: Math.sign(cx(e)-cx(p)) * 16, ky: -12, stun: 44, color: def.color, crit: true });
    game.shake = Math.min(28, (game.shake || 0) + 16);
    p._specialFlightT = Math.max(p._specialFlightT || 0, 260);
  } else if (p.id === "dino") {
    for (const e of enemies) hitEnemy(game, e, dmg * 1.06, { kx: Math.sign(cx(e)-cx(p)) * 22, ky: -16, stun: 68, color: def.color, crit: true });
    game.shake = Math.min(30, (game.shake || 0) + 20);
    p._specialTitanT = Math.max(p._specialTitanT || 0, 260);
    p._specialArmorT = Math.max(p._specialArmorT || 0, 260);
  } else if (p.id === "frita") {
    for (const e of enemies) hitEnemy(game, e, dmg * 0.66, { kx: Math.sign(cx(e)-cx(p)) * 4, ky: -10, stun: 38, color: def.color, crit: true });
    healPlayer(p, p.maxHealth * 0.18);
    p._fryGodT = 180;
    p._specialSpeedT = Math.max(p._specialSpeedT || 0, 260);
  } else if (p.id === "pizza") {
    for (const e of enemies) hitEnemy(game, e, dmg * 0.86, { kx: Math.sign(cx(e)-cx(p)) * 10, ky: -13, stun: 52, color: def.color, crit: true });
    p._ovenKingT = 180;
    addScore(game, enemies.length * 8);
    p._specialBounceT = Math.max(p._specialBounceT || 0, 260);
  } else if (p.id === "yomi") {
    for (const e of enemies) {
      const hp = Number(e.hp ?? e.health ?? 9999);
      const maxHp = Number(e.maxHp ?? e.maxHealth ?? hp);
      const finisher = hp <= maxHp * 0.34;
      hitEnemy(game, e, finisher ? hp + 9999 : dmg * 1.18, {
        kx: Math.sign(cx(e)-cx(p)) * 5,
        ky: -5,
        stun: finisher ? 90 : 58,
        color: def.color,
        crit: true
      });
      e._abyssMarkT = Math.max(e._abyssMarkT || 0, 150);
    }
    p._specialGhostT = Math.max(p._specialGhostT || 0, 260);
  } else if (p.id === "cuerno") {
    for (const e of enemies) hitEnemy(game, e, dmg * 0.76, { kx: Math.sign(cx(e)-cx(p)) * 7, ky: -8, stun: 42, color: def.color, crit: true });
    healPlayer(p, p.maxHealth * 0.16);
    addPlayerXp(p, 24 + enemies.length * 4);
    p._specialAuroraT = Math.max(p._specialAuroraT || 0, 260);
    p._specialArmorT = Math.max(p._specialArmorT || 0, 220);
  }

  add({
    kind: "supremeField",
    mode: p.id,
    x: cx(p),
    y: cy(p),
    life: p.id === "yomi" ? 170 : 150,
    max: p.id === "yomi" ? 170 : 150,
    pulse: 0,
    dmg: dmg * 0.18,
    color: def.color,
    name: def.name,
    hit: new Set(),
  });
  add({ kind: "supreme", x: cx(p), y: cy(p), life: 72, max: 72, color: def.color, name: def.name, identity: identity.kind });

  if (flow.assist && def.ally) summonAssist(game, p, def.ally, dmg * 0.34, def.color);

  game.ult = { t: 96, color: def.color, name: def.name, identity: identity.kind, flow: flow.label || "", assist: flow.assist ? def.ally : "" };
  game.flashColor = def.color;
  game.flash = Math.max(game.flash || 0, 20);
  game.shake = Math.min(26, (game.shake || 0) + 12);
  game.hitstop = Math.min(8, Math.max(game.hitstop || 0, 6));
  game._specialName = specialOf(p.id).name;
  game._supremeFlow = flow;
}

// ---------------------------------------------------------------------------
// Estado de movimiento de habilidades (un solo jugador)
// ---------------------------------------------------------------------------
const FIXED_DT_MS = 1000 / 60;
const MAX_FX = 96;
const MAX_ABILITY_PROJECTILES = 96;

function abilityNow(game) {
  const tick = Number(game?.t);
  return Number.isFinite(tick) ? tick * FIXED_DT_MS : 0;
}

function gameRand(game) {
  const source = typeof game?.rng === "function" ? game.rng : null;
  if (!source) return 0.5;
  const value = Number(source.call(game));
  return Number.isFinite(value) ? Math.max(0, Math.min(0.999999999, value)) : 0.5;
}

function deterministicUnit(seed) {
  const value = Math.sin(Number(seed) * 12.9898) * 43758.5453123;
  return value - Math.floor(value);
}

const FX = [];
const S = { p: null, hover: 0, roll: 0, caos: 0, cvx: 0, charge: 0, pull: null, gallop: 0, gallopFace: 1 };

function syncState(p) {
  if (S.p === p) return;
  if (S.p) {
    S.p._abilMove = null;
    S.p._armorT = 0;
  }
  S.p = p;
  S.hover = 0; S.roll = 0; S.caos = 0; S.cvx = 0; S.charge = 0; S.pull = null; S.gallop = 0; S.gallopFace = 1;
  FX.length = 0;
}

export function clearAbilityFx() {
  FX.length = 0;
  S.hover = 0; S.roll = 0; S.caos = 0; S.cvx = 0; S.charge = 0; S.pull = null; S.gallop = 0; S.gallopFace = 1;
  if (S.p) {
    S.p._abilMove = null;
    S.p._armorT = 0;
    S.p._combatChain = [];
    S.p._flowT = 0;
    S.p._flowPowerT = 0;
    S.p._flowPower = 1;
  }
}

/** Llamado antes de la gravedad (Passives.update). Aplica los movimientos forzados. */
export function abilityPreMove(game, input) {
  const p = game?.player;
  if (!p) return;
  if (p.dead) {
    clearAbilityFx();
    return;
  }
  syncState(p);
  if ((p._flowT || 0) > 0) p._flowT--;
  if ((p._flowPowerT || 0) > 0) p._flowPowerT--;
  else p._flowPower = 1;
  const specialT = Number(p._specialT) || 0;
  if (specialT > 0) {
    p._specialT = specialT - 1;
    if ((p._specialArmorT || 0) > 0) p._specialArmorT--;
    if ((p._specialSpeedT || 0) > 0) p._specialSpeedT--;
    if ((p._specialBounceT || 0) > 0) p._specialBounceT--;
    if ((p._specialGhostT || 0) > 0) p._specialGhostT--;
    if ((p._specialShadowT || 0) > 0) p._specialShadowT--;
    if ((p._specialTitanT || 0) > 0) p._specialTitanT--;
    if ((p._specialAuroraT || 0) > 0) p._specialAuroraT--;
    if ((p._specialArmorT || 0) > 0) armor(p, 2);
    if (p._specialSpeedT > 0) {
      const ix = input?.right ? 1 : input?.left ? -1 : 0;
      if (ix) {
        p.facing = ix;
        const target = ix * Math.max(p.speed * 1.75, 8);
        p.vx += (target - p.vx) * 0.55;
      } else {
        p.vx *= 0.82;
        if (Math.abs(p.vx) < 0.05) p.vx = 0;
      }
    }
    if (p._specialFlightT > 0) {
      p._specialFlightT--;
      p.grounded = false;
      const ix = input?.right ? 1 : input?.left ? -1 : 0;
      const iy = input?.jump ? -1 : input?.drop ? 1 : 0;
      p.vx += (ix * p.speed * 0.9 - p.vx) * 0.35;
      p.vy += (iy * p.speed * 0.85 - p.vy) * 0.35;
      p.vy = clamp(p.vy, -8, 8);
      p._pmove = "special-flight";
      if ((input?.t || 0) % 4 === 0) game.fx.emit(cx(p) - (p.facing || 1) * 10, cy(p), { color: "#fff2a8", count: 3, size: 2.8, speed: 1.4, life: 16, star: true });
    }
  }
  if (S.hover > 0) {
    S.hover--;
    p.vy = Math.min(p.vy, -0.42);
  }
  if (S.roll > 0) {
    S.roll--;
    p.vx = p.facing * Math.max(9, p.speed * 2.1);
    armor(p, 2);
  }
  if (S.charge > 0) {
    S.charge--;
    p.vx = p.facing * Math.max(11, p.speed * 2.4);
    armor(p, 2);
  }
  if (S.gallop > 0) {
    S.gallop--;
    const face = S.gallopFace || p.facing || 1;
    p.facing = face;
    p.vx = face * Math.max(15, p.speed * 2.8);
    if (p.grounded) p.vy = Math.min(p.vy || 0, -0.4);
    armor(p, 2);
  }
  if (S.caos > 0) {
    S.caos--;
    const W = game.worldW || 1600;
    if (p.x < 34) S.cvx = Math.abs(S.cvx);
    if (p.x > W - p.w - 34) S.cvx = -Math.abs(S.cvx);
    if (input && input.left && S.cvx > 0 && S.caos % 10 === 0) S.cvx *= -1;
    if (input && input.right && S.cvx < 0 && S.caos % 10 === 0) S.cvx *= -1;
    p.vx = S.cvx;
    p.facing = Math.sign(S.cvx) || 1;
    if (p.grounded) {
      p.vy = -10.5;
      game.shake = Math.min(14, (game.shake || 0) + 4);
      game.fx.emit(cx(p), p.y + p.h, { color: "#8f7bff", count: 8, size: 3, up: 1.4, speed: 3 });
    }
    if (p.y < 40 && p.vy < 0) p.vy = Math.abs(p.vy) * 0.8;
    armor(p, 2);
  }
  if (S.pull) {
    const pl = S.pull;
    pl.t--;
    let tx, ty;
    if (pl.e) {
      if (!alive(pl.e)) { S.pull = null; return; }
      tx = cx(pl.e); ty = cy(pl.e);
    } else { tx = pl.ax; ty = pl.ay - p.h / 2 - 14; }
    const dx = tx - cx(p), dy = ty - cy(p);
    const d = Math.hypot(dx, dy) || 1;
    const sp = Math.min(11.5, 4.8 + d * 0.075);
    const steer = input?.right === input?.left ? 0 : input?.right ? 2.8 : -2.8;
    p.vx = clamp((dx / d) * Math.min(sp, d) + steer, -13, 13);
    p.vy = clamp((dy / d) * Math.min(sp, d) - 0.35, -12, 12);
    if (Math.abs(dx) > 4) p.facing = Math.sign(dx);
    if (pl.e) {
      const e = pl.e;
      if (d < Math.max(e.w, e.h) / 2 + p.w / 2 + 6 || pl.t <= 0) {
        if (d < 90) hitEnemy(game, e, 20 * pw(p), { kx: p.facing * 9, ky: -6, stun: 40, color: "#ffd84a", shake: 6 });
        p.vy = -7.5;
        p.vx = -p.facing * 3;
        armor(p, 10);
        S.pull = null;
      }
    } else if (d < 16 || pl.t <= 0) {
      p.vy = Math.min(p.vy, -3);
      S.pull = null;
    }
  }
}

/** Llamado cada frame tras mover al jugador (Passives.afterMove). */
export function updateAbilityFx(game) {
  const p = game.player;
  if (!p) return;
  syncState(p);
  // contacto de habilidades de cuerpo (rollo, caos, embestida)
  if (S.roll > 0) bodyHits(game, p, 18, { kx: 10, ky: -6, stun: 24, color: "#5ad1ff", cd: 20 });
  if (S.caos > 0) {
    bodyHits(game, p, 16, { kx: 8, ky: -7, stun: 26, color: "#b8a8ff", cd: 14 });
    if ((game.t & 1) === 0) pushRuntime(game.ghosts, { x: p.x, y: p.y, w: p.w, h: p.h, life: 10, color: "#8f7bff" }, MAX_RUNTIME_GHOSTS);
  }
  if (S.charge > 0) {
    bodyHits(game, p, 26, { kx: 15, ky: -8, stun: 34, color: "#c8f04a", cd: 30, shake: 7 });
    if ((game.t % 3) === 0) game.fx.emit(cx(p) - p.facing * p.w * 0.6, p.y + p.h, { color: "#d8c7a4", count: 3, size: 3, up: 0.6, speed: 1.6 });
  }
  if (S.gallop > 0) {
    const face = S.gallopFace || p.facing || 1;
    const reach = p.w + 36;
    const box = { x: face > 0 ? p.x + p.w * 0.2 : p.x - 36, y: p.y - 8, w: reach, h: p.h + 12 };
    for (const e of game.enemies) {
      if (!canHit(e) || !aabb(box, e) || (e._abHitT || 0) > game.t) continue;
      e._abHitT = game.t + 10;
      hitEnemy(game, e, 24 * pw(p), { kx: face * 14, ky: -6, stun: 18, color: "#ffe9a8", shake: 5 });
    }
    if ((game.t % 2) === 0) pushRuntime(game.ghosts, { x: p.x, y: p.y, w: p.w, h: p.h, life: 8, color: "#f7e7ff" }, MAX_RUNTIME_GHOSTS);
  }
  p._abilMove = S.caos > 0 ? "chaos" : S.gallop > 0 ? "gallop" : S.roll > 0 ? "roll" : S.charge > 0 ? "charge" : S.hover > 0 ? "float" : S.pull ? "swing" : null;
  const updateCount = FX.length;
  for (let i = 0; i < updateCount; i++) {
    const f = FX[i];
    f.age = (f.age || 0) + 1;
    const keep = UPD[f.kind] ? UPD[f.kind](game, f, p) : false;
    if (!keep) f.dead = true;
  }
  let w = 0;
  for (let i = 0; i < updateCount; i++) if (!FX[i].dead) FX[w++] = FX[i];
  for (let i = updateCount; i < FX.length; i++) FX[w++] = FX[i];
  FX.length = w;
  trimAbilityProjectiles(game);
}

export function drawAbilityFx(ctx, game, t) {
  const p = game.player;
  if (!p) return;
  if (p.dead) { if (FX.length) clearAbilityFx(); return; }
  const cam = game.cam;
  for (const f of FX) {
    const d = DRW[f.kind];
    if (!d) continue;
    ctx.save();
    d(ctx, f, cam, t, game, p);
    ctx.restore();
  }
  // Auras de movimiento
  if (S.roll > 0 || S.caos > 0) drawBallAura(ctx, p, cam, t, S.caos > 0 ? "#8f7bff" : "#2f6bff");
  if (S.charge > 0) drawChargeShield(ctx, p, cam, t);
  drawCastSignature(ctx, p, cam, t);
}

function drawCastSignature(ctx, p, cam, t) {
  const cast = p._cast;
  if (!cast || t - cast.t > 28) return;
  const k = 1 - (t - cast.t) / 28;
  const x = p.x + p.w / 2 - cam.x;
  const y = p.y + p.h * 0.4 - cam.y;
  const face = p.facing || 1;
  const color = p.color || "#fff6c8";
  const slot = cast.slot | 0;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.85 * k;
  ctx.strokeStyle = color;
  ctx.lineWidth = slot === 3 ? 7 : slot === 2 ? 6 : slot === 1 ? 4 : 2.5;
  ctx.beginPath();
  if (slot === 0) ctx.arc(x + face * 18, y, 16 + (1 - k) * 20, -0.8, 0.8);
  else if (slot === 1) ctx.arc(x, y, 22 + (1 - k) * 36, 0, Math.PI * 2);
  else if (slot === 2) ctx.arc(x, y, 34 + (1 - k) * 70, 0, Math.PI * 2);
  else {
    ctx.arc(x, y, 48 + (1 - k) * 96, 0, Math.PI * 2);
    ctx.moveTo(x + 28, y);
    ctx.arc(x, y, 28 + (1 - k) * 52, 0, Math.PI * 2);
  }
  ctx.stroke();
  if (slot === 3) {
    ctx.globalAlpha = 0.55 * k;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6 + t * 0.03;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 34, y + Math.sin(a) * 34);
      ctx.lineTo(x + Math.cos(a) * (72 + (1-k)*44), y + Math.sin(a) * (72 + (1-k)*44));
      ctx.stroke();
    }
  }
  if (p.id === "stitcho") {
    ctx.strokeStyle = slot === 2 ? "#b38cff" : "#67ddff";
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = Math.min(.86, .34 + k * .52);
    const count = slot === 0 ? 3 : slot === 1 ? 5 : 7;
    const span = 22 + slot * 9;
    for (let i=0;i<count;i++) {
      const yy = y + (i-(count-1)/2) * 8;
      const xx = x + face * (18 + (i%2)*5);
      ctx.beginPath();
      ctx.moveTo(xx-face*span*.55,yy-3);
      ctx.lineTo(xx-face*span*.12,yy+2);
      ctx.lineTo(xx+face*span*.34,yy-2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const AIR = new Set(["phosquito", "mosquito", "medusa", "pez", "libelula", "avispa", "abeja", "anguila", "gaviota", "murcielago", "brasita", "ufo"]);
function cx(o) { return o.x + o.w / 2; }
function cy(o) { return o.y + o.h / 2; }
function clamp(v, a, b) {
  const n = Number(v);
  if (!Number.isFinite(n)) return a;
  return n < a ? a : n > b ? b : n;
}
function pw(p) {
  const form = 1 + (Number(p.evo) || 0) * 0.35;
  const flow = (p._flowPowerT || 0) > 0 ? clamp(Number(p._flowPower) || 1, 1, 1.18) : 1;
  return form * flow;
}
function alive(e) { return !!e && !e.dying && e.hp > 0; }
function canHit(e) { return alive(e) && !(e.invuln > 0); }
function isAir(e) { return AIR.has(e.kind) || (e.kind === "cucaracho" && e.evo >= 2) || (e.boss && e.airborne); }
function armor(p, n) {
  const frames = Number(n);
  if (!p || !Number.isFinite(frames) || frames <= 0) return;
  p._armorT = Math.max(Number.isFinite(p._armorT) ? p._armorT : 0, frames);
}
function validRect(o) {
  return !!o && Number.isFinite(Number(o.x)) && Number.isFinite(Number(o.y)) &&
    Number.isFinite(Number(o.w)) && Number.isFinite(Number(o.h)) &&
    Number(o.w) >= 0 && Number(o.h) >= 0;
}
function circleHit(x, y, r, e) {
  if (!validRect(e) || !Number.isFinite(Number(x)) || !Number.isFinite(Number(y)) || !Number.isFinite(Number(r)) || Number(r) < 0) return false;
  const nx = clamp(x, e.x, e.x + e.w), ny = clamp(y, e.y, e.y + e.h);
  return (x - nx) * (x - nx) + (y - ny) * (y - ny) <= r * r;
}
function aabb(a, b) {
  if (!validRect(a) || !validRect(b)) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function viewW() { const c = typeof document !== "undefined" && document.getElementById("game"); return (c && c.width) || 1280; }
function viewH() { const c = typeof document !== "undefined" && document.getElementById("game"); return (c && c.height) || 720; }
function inView(g, e) {
  const m = 40;
  return e.x + e.w > g.cam.x - m && e.x < g.cam.x + viewW() + m && e.y + e.h > g.cam.y - m && e.y < g.cam.y + viewH() + m;
}
function crossTop(g, x, y0, y1) {
  let best = null;
  for (const pl of g.platforms) {
    if (x >= pl.x && x <= pl.x + pl.w && y0 <= pl.y + 2 && y1 >= pl.y && (best === null || pl.y < best)) best = pl.y;
  }
  return best;
}
function solidAt(g, x, y) {
  for (const pl of g.platforms) if (x > pl.x && x < pl.x + pl.w && y > pl.y + 4 && y < pl.y + pl.h) return pl;
  return null;
}
function groundBelow(g, x, y) {
  let best = null;
  for (const pl of g.platforms) if (x >= pl.x && x <= pl.x + pl.w && pl.y >= y && (best === null || pl.y < best)) best = pl.y;
  return best;
}
function groundNear(g, x, y, tol) {
  let best = null, bd = 1e9;
  for (const pl of g.platforms) {
    if (x < pl.x || x > pl.x + pl.w) continue;
    const d = Math.abs(pl.y - y);
    if (d < bd && d <= tol) { bd = d; best = pl.y; }
  }
  return best;
}
function onGround(g, e) {
  const feet = e.y + e.h;
  for (const pl of g.platforms) if (e.x + e.w > pl.x && e.x < pl.x + pl.w && Math.abs(feet - pl.y) < 12) return true;
  return false;
}
function nearestEnemy(g, x, y, range, skip, preferDir) {
  let best = null, bd = range;
  for (const e of g.enemies) {
    if (!canHit(e) || (skip && skip.has(e))) continue;
    let d = Math.hypot(cx(e) - x, cy(e) - y);
    if (preferDir && Math.sign(cx(e) - x) !== preferDir) d += 110;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

export function hitEnemy(g, e, dmg, o = {}) {
  if (!canHit(e)) return false;
  let d = Number(dmg);
  if (!Number.isFinite(d)) return false;
  if (e.boss) d *= 0.55;
  d = Math.max(1, Math.round(d));
  damageEnemy(e, d);
  e.flash = Math.max(e.flash || 0, 14);
  
  if (e.boss) {
    if (o.kx) e.vx = (e.vx || 0) + clamp(o.kx, -8, 8) * 0.08;
  } else {
    if (o.kx) e.vx = clamp(o.kx, -16, 16);
    if (o.ky) e.vy = Math.min(e.vy || 0, o.ky);
  }
  
  if (o.stun != null) e.stun = Math.max(e.stun || 0, e.boss ? Math.min(6, o.stun) : o.stun);
  
  const crit = !!o.crit || d >= 40;
  if (o.nums !== false) g.nums.add(cx(e) - 4, e.y, crit ? d + "!" : "" + d, crit ? "#ffe66a" : (o.color || "#ffe66a"), crit);
  
  addCombo(g, 1);
  g.comboT = 480;
  addScore(g, 10 * g.combo);
  g.fx.emit(cx(e), cy(e), { color: o.color || "#fff", count: o.parts ?? (crit ? 14 : 8), size: crit ? 4 : 3, up: 1.2, star: !!crit });
  
  if (g.player) addPlayerXp(g.player, Number.isFinite(o.xp) ? o.xp : 2);
  g.shake = Math.min(18, (g.shake || 0) + (o.shake ?? 3) + (crit ? 4 : 0));
  
  // Modificación: Permitir que stop sea reasignado
  let stop = crit ? 9 : (d >= 18 ? 4 : 0);
  
  // Los jefes encajan decenas de golpes en un solo combate.
  // Limitamos el hitstop a un máximo de 2 fotogramas para no ralentizar el juego.
  if (e.boss) stop = Math.min(2, stop);
  
  if (o.hitstop === 0) stop = 0;
  else if (o.hitstop != null) stop = o.hitstop;
  if (stop) {
    const frames = g.reduceMotion ? Math.max(1, Math.ceil(stop * 0.35)) : stop;
    // Cap duro: varios proyectiles no deben congelar el juego
    g.hitstop = Math.min(5, Math.max(g.hitstop || 0, frames));
  }
  return true;
}

function bodyHits(g, p, base, o) {
  const box = { x: p.x - 6, y: p.y - 4, w: p.w + 12, h: p.h + 8 };
  for (const e of g.enemies) {
    if (!canHit(e) || !aabb(box, e)) continue;
    if ((e._abHitT || 0) > g.t) continue;
    e._abHitT = g.t + (o.cd || 20);
    const dir = Math.sign(cx(e) - cx(p)) || p.facing;
    hitEnemy(g, e, base * pw(p), { kx: dir * o.kx, ky: o.ky, stun: o.stun, color: o.color, shake: o.shake ?? 4 });
  }
}

function hand(p) { return { x: cx(p) + p.facing * (p.w * 0.45), y: p.y + p.h * 0.4 }; }
function add(f) {
  if (!f || typeof f.kind !== "string") return null;
  FX.push(f);
  if (FX.length > MAX_FX) FX.splice(0, FX.length - MAX_FX);
  return f;
}

function trimAbilityProjectiles(game) {
  const list = game?.projectiles;
  if (!Array.isArray(list)) return;
  let owned = 0;
  for (const pr of list) if (pr?.owner === "player") owned++;
  if (owned <= MAX_ABILITY_PROJECTILES) return;
  for (let i = 0; i < list.length && owned > MAX_ABILITY_PROJECTILES;) {
    if (list[i]?.owner === "player") {
      list.splice(i, 1);
      owned--;
    } else {
      i++;
    }
  }
}
function boom(g, x, y, color, n, extra) {
  g.fx.emit(x, y, Object.assign({ color, count: n || 10, size: 4, up: 1.2, speed: 3.2 }, extra || {}));
}
function glow(ctx, x, y, r, color, a) {
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = a == null ? 0.5 : a;
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
function zig(ctx, x1, y1, x2, y2, jit, segs, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const u = i / segs, j = (deterministicUnit(x1 * 0.17 + y1 * 0.31 + x2 * 0.53 + y2 * 0.79 + i * 1.37) - 0.5) * jit;
    ctx.lineTo(x1 + dx * u + nx * j, y1 + dy * u + ny * j);
  }
  ctx.lineTo(x2, y2);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = color; ctx.lineWidth = width * 2.4; ctx.globalAlpha = 0.35; ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = width; ctx.stroke();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(1, width * 0.4); ctx.stroke();
}

// ---------------------------------------------------------------------------
// CASTERS
// ---------------------------------------------------------------------------
const CASTERS = {
  // ======================= KILO =======================
  ukulele(g, p, evo) {
    const h = hand(p);
    const n = evo >= 4 ? 3 : evo >= 2 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      add({ kind: "note", x: h.x, y: h.y, vx: (6.4 + i * 1.4) * p.facing, vy: -3.2 - i * 1.2, r: 14 + evo, bounces: 0, maxB: 3, life: 220, hit: new Set(), dmg: (16 + evo * 2) * pw(p), color: ["#ffb347", "#ffd36a", "#ff7a3a"][i], rot: 0, home: evo >= 4 });
    }
    boom(g, h.x, h.y, "#ffb347", 8, { star: true });
  },
  hula(g, p, evo) {
    S.hover = 60;
    if (p.vy > 0) p.vy = -2;
    add({
      kind: "hula",
      life: 60,
      age: 0,
      r: 46 + evo * 6,
      dmg: 9 * pw(p),
      heal: evo >= 3 ? 3 : 0,
      hit: new Set(),
      pulse: 0,
      evo,
    });
    boom(g, cx(p), cy(p), "#ff5ad5", 12, { star: true });
  },
  ohana(g, p, evo) {
    const god = evo >= 4;
    const heal = 20 + evo * 8;
    healPlayer(p, heal);
    g.nums.add(cx(p), p.y - 10, "+" + heal, "#6f6", true);
    const R = Math.hypot(viewW(), viewH());
    add({ kind: "ohana", x: cx(p), y: cy(p), r: 0, max: R, life: 44, hit: new Set(), n: 10 + evo * 2, dmg: (30 + evo * 4) * pw(p), lifesteal: god ? 5 : 0 });
    g.flash = Math.max(g.flash || 0, god ? 10 : 6);
    g.flashColor = "#ffe9a0";
    g.shake = Math.min(18, (g.shake || 0) + (god ? 8 : 6));
    if (god) g.hitstop = Math.min(5, Math.max(g.hitstop || 0, 3));
    boom(g, cx(p), cy(p), "#ffd36a", god ? 14 : 10, { star: true, up: 2 });
  },

  // ======================= STITCHO =======================
  plasma(g, p, evo) {
    add({ kind: "burst", n: evo >= 3 ? 4 : 3, i: 0, gap: 5, next: 0 });
  },
  rollo(g, p, evo) {
    S.roll = 40 + evo * 4;
    armor(p, 6);
    boom(g, cx(p), p.y + p.h, "#5ad1ff", 10);
  },
  caos(g, p, evo) {
    S.caos = 120 + evo * 10;
    S.cvx = p.facing * (10 + evo * 0.6);
    p.vy = -9;
    armor(p, 6);
    g.shake = Math.min(18, (g.shake || 0) + 6);
    boom(g, cx(p), cy(p), "#8f7bff", 10, { star: true });
  },

  // ======================= CHISPÍN =======================
  chain(g, p, evo) {
    const h = hand(p);
    const pts = [{ x: h.x, y: h.y }];
    const hit = new Set();
    const maxN = evo >= 3 ? 5 : 4;
    let from = { x: h.x, y: h.y };
    let dmg = (22 + evo * 2) * pw(p);
    for (let i = 0; i < maxN; i++) {
      const e = nearestEnemy(g, from.x, from.y, i === 0 ? 300 + evo * 20 : 210 + evo * 15, hit, i === 0 ? p.facing : 0);
      if (!e) break;
      hit.add(e);
      pts.push({ x: cx(e), y: cy(e) });
      hitEnemy(g, e, dmg, { kx: Math.sign(cx(e) - from.x) * 4, ky: -2, stun: 22, color: "#ffe14a" });
      from = { x: cx(e), y: cy(e) };
      dmg *= 0.85;
    }
    if (pts.length === 1) pts.push({ x: h.x + p.facing * 150, y: h.y + (deterministicUnit((g.t || 0) * 0.91 + h.x * 0.07 + h.y * 0.013) - 0.5) * 20 });
    add({ kind: "chain", pts, life: 18 });
    boom(g, h.x, h.y, "#ffe14a", 8, { star: true });
  },
  blink(g, p, evo) {
    const W = g.worldW || 1600;
    const x0 = p.x, y0 = p.y;
    const dist = 150 + evo * 18;
    let nx = clamp(p.x + p.facing * dist, 30, W - p.w - 30);
    const direction = Math.sign(nx - x0);
    const steps = Math.ceil(Math.abs(nx - x0) / 8);
    for (let i = 0; i < steps; i++) {
      if (!g.platforms.some((pl) => aabb({ x: nx, y: y0, w: p.w, h: p.h }, pl))) break;
      nx -= direction * Math.min(8, Math.abs(nx - x0));
    }
    p.x = nx;
    const pl = solidAt(g, cx(p), p.y + p.h - 2) || solidAt(g, cx(p), cy(p));
    if (pl) { p.y = pl.y - p.h; p.vy = 0; }
    p.invuln = Math.max(p.invuln || 0, 12);
    for (let i = 0; i < 4; i++) {
      const u = i / 4;
      pushRuntime(g.ghosts, { x: x0 + (p.x - x0) * u, y: y0 + (p.y - y0) * u, w: p.w, h: p.h, life: 10 + i * 2, color: "#ffe14a" }, MAX_RUNTIME_GHOSTS);
    }
    add({ kind: "trail", x1: x0 + p.w / 2, y1: y0 + p.h / 2, x2: cx(p), y2: cy(p), life: 42, hit: new Set(), dmg: (22 + evo * 2) * pw(p) });
    boom(g, x0 + p.w / 2, y0 + p.h / 2, "#fff3a0", 10, { star: true });
    boom(g, cx(p), cy(p), "#ffe14a", 10, { star: true });
  },
  storm(g, p, evo) {
    add({ kind: "storm", x: cx(p), y: p.y - 140, life: 180 + evo * 20, next: 12, bolts: [], dmg: (20 + evo * 2) * pw(p), vx: 0 });
    boom(g, cx(p), p.y - 60, "#9cf", 10);
  },

  // ======================= MICHI =======================
  yarn(g, p, evo) {
    const h = hand(p);
    add({ kind: "yarn", x: h.x, y: h.y, vx: (12 + evo) * p.facing, vy: 0, out: true, life: 130, hitA: new Set(), hitB: new Set(), r: 10 + evo, dmg: (15 + evo * 2) * pw(p), rot: 0 });
  },
  purr(g, p, evo) {
    const R = 320 + evo * 70;
    const heal = 8 + evo * 4;
    const stun = 200 + evo * 30;
    p.health = Math.min(p.maxHealth, p.health + heal);
    g.nums.add(cx(p), p.y - 10, "+" + heal, "#6f6");
    const slept = [];
    add({ kind: "purr", life: 72, max: 72, R, hit: new Set(), slept, dmg: 6 * pw(p), stun, evo });
    boom(g, cx(p), cy(p), "#ffb6e4", 16, { star: true });
  },
  ninetails(g, p, evo) {
    const targets = g.enemies.filter(canHit).sort((a, b) => Math.hypot(cx(a) - cx(p), cy(a) - cy(p)) - Math.hypot(cx(b) - cx(p), cy(b) - cy(p)));
    for (let i = 0; i < 9; i++) {
      const fan = -1.25 + (i / 8) * 2.5;
      const a = p.facing > 0 ? fan : Math.PI - fan;
      const sp = 10 + (i % 3) * 1.8 + evo * 0.35;
      add({
        kind: "wisp", x: cx(p) - p.facing * 6, y: cy(p) - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 230, target: targets.length ? targets[i % targets.length] : null, dmg: (13 + evo * 2) * pw(p),
        color: i % 3 === 0 ? "#d7b0ff" : i % 3 === 1 ? "#ff7ad4" : "#b6f0ff", trail: [], delay: i * 1.2, idx: i, tail: true,
      });
    }
    g.shake = Math.min(18, (g.shake || 0) + 6);
    boom(g, cx(p), cy(p), "#b78bff", 18, { star: true, up: 3 });
  },

  // ======================= DRAGÓN =======================
  breath(g, p, evo) {
    add({ kind: "breath", life: 30 + evo * 4, max: 30 + evo * 4, len: 110 + evo * 22, dmg: 6 * pw(p) });
  },
  gust(g, p, evo) {
    p.vy = evo >= 4 ? -11.5 : -9.5;
    p._jumpHeld = true;
    const f = p.facing;
    for (const e of g.enemies) {
      if (!canHit(e)) continue;
      const dx = (cx(e) - cx(p)) * f, dy = cy(e) - cy(p);
      if (dx > -50 && dx < 230 + evo * 20 && Math.abs(dy) < 110) {
        hitEnemy(g, e, 8 * pw(p), { kx: f * 14, ky: -5, stun: 36, color: "#bfefff", xp: 1 });
      }
    }
    for (const pr of g.projectiles) {
      if (pr.owner === "player") continue;
      const dx = (pr.x - cx(p)) * f;
      if (dx > -40 && dx < 240 && Math.abs(pr.y - cy(p)) < 120) { pr.life = 0; boom(g, pr.x, pr.y, "#fff", 4); }
    }
    add({ kind: "gust", x: cx(p), y: cy(p), f, life: 24 });
    for (let i = 0; i < 3; i++) g.fx.emit(cx(p), p.y + p.h, { color: "#dff6ff", count: 4, size: 2.4, angle: Math.PI / 2, spread: 1.4, speed: 3 });
  },
  meteor(g, p, evo) {
    add({ kind: "shower", n: 6 + evo, i: 0, next: 0, f: p.facing, dmg: (26 + evo * 3) * pw(p), r: 64 + evo * 6 });
    g.shake = Math.min(18, (g.shake || 0) + 4);
  },

  // ======================= DINO =======================
  bite(g, p, evo) {
    const reach = 42 + evo * 9;
    const box = { x: p.facing > 0 ? p.x + p.w - 4 : p.x - reach + 4, y: p.y - 6, w: reach, h: p.h + 12 };
    let any = false;
    for (const e of g.enemies) {
      if (canHit(e) && aabb(box, e)) {
        any = hitEnemy(g, e, (34 + evo * 4) * pw(p), { kx: p.facing * 15, ky: -7, stun: 32, color: "#e8ffe0", shake: 8, crit: true }) || any;
      }
    }
    if (any) { g.shake = Math.min(18, (g.shake || 0) + 4); p.vx -= p.facing * 3; }
    const shots = evo >= 4 ? 3 : evo >= 2 ? 2 : 1;
    const speed = 11 + evo * 0.7;
    const mouthX = cx(p) + p.facing * p.w * 0.58;
    const mouthY = p.y + p.h * 0.38;
    for (let i = 0; i < shots; i++) {
      const angle = (i - (shots - 1) / 2) * 0.16;
      pushRuntime(g.projectiles, {
        x: mouthX - 10, y: mouthY - 7,
        vx: Math.cos(angle) * speed * p.facing, vy: Math.sin(angle) * speed,
        w: 20 + evo * 1.5, h: 14 + evo,
        life: 44 + evo * 5, dmg: (6 + evo * 1.5) / shots,
        color: evo >= 4 ? "#e8fdff" : "#e8ffe0", shape: "bone", owner: "player", trail: true,
      }, MAX_RUNTIME_PROJECTILES);
    }
    add({ kind: "jaws", life: 14, size: 26 + evo * 6, reach });
  },
  charge(g, p, evo) {
    S.charge = 32 + evo * 3;
    armor(p, 8);
    g.shake = Math.min(18, (g.shake || 0) + 4);
    boom(g, cx(p), p.y + p.h, "#d8c7a4", 10);
  },
  quake(g, p, evo) {
    const oy = p.grounded ? p.y + p.h : (groundBelow(g, cx(p), p.y + p.h - 4) ?? p.y + p.h);
    add({
      kind: "quake", ox: cx(p), oy, life: 90, speed: 9, maxD: 520 + evo * 60, hit: new Set(), dmg: (24 + evo * 3) * pw(p),
      fronts: [{ x: cx(p), y: oy, dir: 1, on: true }, { x: cx(p), y: oy, dir: -1, on: true }], spikes: [],
    });
    g.shake = Math.min(20, (g.shake || 0) + 10);
    boom(g, cx(p), oy, "#c8a060", 10, { up: 2 });
  },

  // ======================= FRITA =======================
  salt(g, p, evo) {
    const h = hand(p);
    const n = 5 + (evo >= 2 ? 2 : 0) + (evo >= 4 ? 2 : 0);
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1) - 0.5) * 0.8 + (gameRand(g) - 0.5) * 0.08;
      const sp = 10 + gameRand(g) * 3;
      pushRuntime(g.projectiles, {
        x: h.x - 4, y: h.y - 4, vx: Math.cos(a) * sp * p.facing, vy: Math.sin(a) * sp,
        w: 8, h: 8, life: 14 + (gameRand(g) * 5 | 0), dmg: 6, color: "#fff8e0", shape: "salt", spin: true, rot: gameRand(g) * 6, owner: "player", trail: false,
      }, MAX_RUNTIME_PROJECTILES);
    }
    add({ kind: "muzzle", life: 8, color: "#fff3c0" });
    p.vx -= p.facing * 2.5;
  },
  ketchup(g, p, evo) {
    const h = hand(p);
    add({ kind: "blob", x: h.x, y: h.y, vx: (6 + evo * 0.4) * p.facing, vy: -6, r: 8 + evo, life: 120, w: 90 + evo * 16, plife: 240 + evo * 30, dmg: 4 * pw(p) });
    boom(g, h.x, h.y, "#e23b3b", 6);
  },
  fryer(g, p, evo) {
    const n = 4 + evo;
    for (let i = 0; i < n; i++) {
      const x = cx(p) + p.facing * (70 + i * 62);
      const top = groundNear(g, x, p.y + p.h, 140);
      if (top === null) continue;
      add({ kind: "geyser", x, y: top, delay: i * 6, warn: 12, up: 24, H: 150 + evo * 15, hit: new Set(), dmg: (30 + evo * 3) * pw(p) });
    }
    g.shake = Math.min(18, (g.shake || 0) + 3);
  },

  // ======================= PIZZA =======================
  pepperoni(g, p, evo) {
    const h = hand(p);
    add({ kind: "disc", x: h.x, y: h.y, vx: (9 + evo * 0.6) * p.facing, vy: -1.5, r: 11 + evo, bounces: 0, maxB: 7 + evo, life: 180, dmg: (14 + evo * 2) * pw(p), rot: 0 });
    boom(g, h.x, h.y, "#e0402a", 6);
  },
  cheese(g, p, evo) {
    const e = nearestEnemy(g, cx(p), cy(p), 280 + evo * 20, null, p.facing);
    if (e) {
      S.pull = { e, t: 16, maxT: 16 };
      add({ kind: "cheese", e, life: 22, ax: cx(e), ay: cy(e) });
      boom(g, cx(e), cy(e), "#ffd84a", 8);
      return;
    }
    let best = null;
    for (const pl of g.platforms) {
      if (pl.y >= p.y - 16 || pl.y < p.y - 300) continue;
      if (pl.x + pl.w < cx(p) - 150 || pl.x > cx(p) + 150) continue;
      if (!best || pl.y > best.y) best = pl;
    }
    if (best) {
      const ax = clamp(cx(p) + p.facing * 40, best.x + 12, best.x + best.w - 12);
      S.pull = { ax, ay: best.y, t: 26 };
      add({ kind: "cheese", life: 30, ax, ay: best.y });
    } else {
      add({ kind: "cheese", life: 14, ax: cx(p) + p.facing * 120, ay: p.y - 60, miss: true });
    }
  },
  oven(g, p, evo) {
    const x = cx(p);
    const y = cy(p);

    add({
      kind: "heat",
      life: 38,
      R: 220 + evo * 28,
      r: 0,
      hit: new Set(),
      dmg: (24 + evo * 4) * pw(p),
    });

    add({
      kind: "slices",
      n: 10 + evo * 3,
      i: 0,
      next: 4,
      x,
      dmg: (18 + evo * 3) * pw(p),
    });

    g.flash = Math.max(g.flash || 0, 12);
    g.flashColor = "#ff9a42";
    g.shake = Math.min(18, (g.shake || 0) + 8);

    boom(g, x, y, "#ffb347", 22, {
      star: true,
      up: 2.8,
      speed: 4.2,
      size: 5,
    });
  },

  ofuda(g, p, evo) {
    const h = hand(p);
    add({
      kind: "ofuda", x: h.x, y: h.y,
      vx: (8 + evo) * p.facing, vy: -0.4,
      life: 90, stuck: 0, dmg: (18 + evo * 3) * pw(p),
    });
    boom(g, h.x, h.y, "#f2e6c8", 6);
  },
  sleeve(g, p, evo) {
    add({ kind: "sleeve", life: 18, evo, face: p.facing || 1 });
    boom(g, cx(p), cy(p), "#6a3cff", 8);
  },
  maw(g, p, evo) {
    add({ kind: "maw", life: 16, max: 16, evo, face: p.facing || 1, hit: new Set(), dmg: (36 + evo * 6) * pw(p) });
    g.flash = Math.max(g.flash || 0, 8);
    g.flashColor = "#ff2244";
    g.shake = Math.min(18, (g.shake || 0) + 8);
  },

  // ======================= CUERNO =======================
  gleam(g, p, evo) {
    const face = p.facing || 1;
    const y = p.y + p.h * 0.28;
    pushRuntime(g.projectiles, {
      x: cx(p) + face * (p.w * 0.4), y,
      vx: (16 + evo) * face, vy: 0,
      w: 26, h: 16, life: 40, dmg: 18, color: "#ffe9a8",
      shape: "orb", owner: "player", trail: true, pierce: 3,
    }, MAX_RUNTIME_PROJECTILES);
    p._thrust = 4;
    p._thrustFace = face;
    boom(g, cx(p) + face * 16, y, "#ffe9a8", 8, { star: true });
  },
  gallop(g, p, evo) {
    S.gallop = 16 + evo * 2;
    S.gallopFace = p.facing || 1;
    p.vy = Math.min(p.vy, -3.4);
    armor(p, 18);
    g.shake = Math.min(12, (g.shake || 0) + 4);
    boom(g, cx(p), cy(p), "#f2c1ff", 10, { star: true });
  },
  rainbow(g, p, evo) {
    const face = p.facing || 1;
    const colors = ["#ff8ad4", "#ffb15a", "#ffe14a", "#8ee07a", "#7ec8ff", "#c9b6ff", "#fff6c8"];
    const y = p.y + p.h * 0.3;
    for (let i = 0; i < colors.length; i++) {
      const spread = (i - 3) * 0.38;
      pushRuntime(g.projectiles, {
        x: cx(p) + face * (p.w * 0.45),
        y: y + spread * 8,
        vx: face * (13 + evo * 0.35),
        vy: spread,
        w: 16, h: 16, life: 52, dmg: 11, color: colors[i],
        shape: "orb", owner: "player", trail: true, pierce: 4,
      }, MAX_RUNTIME_PROJECTILES);
    }
    const reach = 78 + evo * 8;
    const box = { x: face > 0 ? p.x + p.w - 8 : p.x - reach, y: p.y - 10, w: reach, h: p.h + 18 };
    for (const e of g.enemies) {
      if (!canHit(e) || !aabb(box, e)) continue;
      hitEnemy(g, e, (30 + evo * 4) * pw(p), { kx: face * 12, ky: -5, stun: 16, color: "#fff6c8", shake: 6 });
    }
    g.flash = Math.max(g.flash || 0, 8);
    g.flashColor = "#fff6ff";
    g.hitstop = Math.max(g.hitstop || 0, 6);
    boom(g, cx(p) + face * 20, y, "#fff6c8", 14, { star: true });
  },
};

// ============================================================================
// ACTUALIZADORES DE ENTIDADES (UPD)
// ============================================================================
const UPD = {
  supremeField(g, f, p) {
    f.life--;
    f.pulse = (f.pulse || 0) + 1;
    f.x = cx(p);
    f.y = cy(p);
    const mode = f.mode;
    const pulseEvery = mode === "chispin" ? 12 : mode === "dragon" ? 18 : mode === "frita" ? 18 : 26;

    if (mode === "stitcho") {
      for (const e of g.enemies) {
        if (!canHit(e) || e.boss) continue;
        const dx = f.x - cx(e), dy = f.y - cy(e), d = Math.hypot(dx, dy) || 1;
        if (d < 520) {
          e.vx = clamp((e.vx || 0) + (dx / d) * 0.7, -10, 10);
          e.vy = clamp((e.vy || 0) + (dy / d) * 0.35, -10, 10);
        }
      }
    } else if (mode === "yomi") {
      for (const e of g.enemies) {
        if (!canHit(e) || e.boss) continue;
        const dx = f.x - cx(e), dy = f.y - cy(e), d = Math.hypot(dx, dy) || 1;
        if (d < 600) {
          e.vx = clamp((e.vx || 0) + (dx / d) * 0.42, -8, 8);
          e.vy = clamp((e.vy || 0) + (dy / d) * 0.2, -8, 8);
        }
      }
    }

    if (f.pulse % pulseEvery === 0) {
      if (mode === "kilo") {
        healPlayer(p, Math.max(2, p.maxHealth * 0.025));
        for (const e of g.enemies) if (canHit(e) && Math.hypot(cx(e)-f.x,cy(e)-f.y) < 260) {
          hitEnemy(g,e,f.dmg,{kx:Math.sign(cx(e)-f.x)*4,ky:-5,stun:18,color:f.color,hitstop:1});
        }
      } else if (mode === "stitcho") {
        for (const e of g.enemies) if (canHit(e) && Math.hypot(cx(e)-f.x,cy(e)-f.y) < 330) {
          hitEnemy(g,e,f.dmg*0.9,{kx:Math.sign(f.x-cx(e))*8,ky:-4,stun:34,color:f.color,hitstop:1});
        }
      } else if (mode === "chispin") {
        const targets = g.enemies.filter(canHit).sort((a,b)=>Math.hypot(cx(a)-f.x,cy(a)-f.y)-Math.hypot(cx(b)-f.x,cy(b)-f.y)).slice(0,3);
        for (const e of targets) hitEnemy(g,e,f.dmg*0.85,{ky:-4,stun:22,color:f.color,crit:f.pulse%36===0,hitstop:1});
      } else if (mode === "cat") {
        const targets = g.enemies.filter(canHit).slice(0,4);
        for (const e of targets) {
          hitEnemy(g,e,f.dmg*0.72,{kx:0,ky:-2,stun:36,color:f.color,hitstop:1});
          if (!e.boss) { e.vx *= 0.35; e.vy *= 0.35; }
        }
      } else if (mode === "dragon") {
        const target = nearestEnemy(g,f.x,f.y,900,null,0);
        const tx = target ? cx(target) : f.x + (p.facing||1) * 180;
        add({kind:"meteor",x:tx-(p.facing||1)*120,y:(g.cam.y||0)-50,vx:(p.facing||1)*2.8,vy:11.5,r:15,dmg:f.dmg*1.35,R:72,life:150,rot:0});
      } else if (mode === "dino") {
        if (p.grounded) {
          for (const e of g.enemies) if (canHit(e) && Math.abs(cx(e)-f.x)<360 && Math.abs((e.y+e.h)-(p.y+p.h))<90) {
            hitEnemy(g,e,f.dmg*1.05,{kx:Math.sign(cx(e)-f.x)*10,ky:-12,stun:38,color:f.color,hitstop:1});
          }
          g.shake=Math.min(18,(g.shake||0)+5);
        }
      } else if (mode === "frita") {
        const targets = g.enemies.filter(canHit).slice(0,5);
        for (const e of targets) {
          hitEnemy(g,e,f.dmg*0.8,{kx:Math.sign(cx(e)-f.x)*3,ky:-8,stun:20,color:f.color,hitstop:1});
          e._friedT=Math.max(e._friedT||0,80);
        }
      } else if (mode === "pizza") {
        for (const e of g.enemies) if (canHit(e) && Math.hypot(cx(e)-f.x,cy(e)-f.y)<430) {
          hitEnemy(g,e,f.dmg*0.82,{kx:Math.sign(cx(e)-f.x)*9,ky:-10,stun:24,color:f.color,hitstop:1});
        }
        p.vy=Math.min(p.vy||0,-2.5);
      } else if (mode === "yomi") {
        for (const e of g.enemies) if (canHit(e) && Math.hypot(cx(e)-f.x,cy(e)-f.y)<390) {
          const hp=Number(e.hp||0), max=Number(e.max||e.maxHp||e.maxHealth||hp||1);
          const execute=hp>0&&hp<=max*0.22;
          hitEnemy(g,e,execute?hp+9999:f.dmg*0.9,{kx:0,ky:-3,stun:44,color:f.color,crit:execute,hitstop:1});
        }
      } else if (mode === "cuerno") {
        healPlayer(p,Math.max(2,p.maxHealth*0.018));
        p.invuln=Math.max(p.invuln||0,10);
        for (const e of g.enemies) if (canHit(e) && Math.hypot(cx(e)-f.x,cy(e)-f.y)<320) {
          hitEnemy(g,e,f.dmg*0.76,{kx:Math.sign(cx(e)-f.x)*7,ky:-7,stun:24,color:f.color,hitstop:1});
        }
      }
      boom(g,f.x,f.y,f.color,mode==="dragon"?8:5,{star:true,up:1.2,speed:2.4});
    }
    return f.life>0;
  },
  assist(g, f, p) {
    f.life--;
    const age=f.max-f.life;
    const target=nearestEnemy(g,f.x,f.y,900,null,0);
    const baseX=cx(p)-(p.facing||1)*54;
    const baseY=p.y-18;
    if(target){
      const dx=cx(target)-f.x,dy=cy(target)-f.y,d=Math.hypot(dx,dy)||1;
      const rush=(age%24)>8&&(age%24)<17;
      const sp=rush?14:6.5;
      f.x+=((dx/d)*sp);
      f.y+=((dy/d)*sp);
      f.facing=Math.sign(dx)||f.facing||1;
    } else {
      f.x+=(baseX-f.x)*0.12;
      f.y+=(baseY-f.y)*0.12;
    }
    if(--f.next<=0&&f.strikes<3){
      f.next=24;
      const e=nearestEnemy(g,f.x,f.y,180,null,0);
      if(e){
        f.strikes++;
        hitEnemy(g,e,f.dmg,{kx:(f.facing||1)*8,ky:-6,stun:22,color:f.color,crit:f.strikes===3,hitstop:1});
        boom(g,cx(e),cy(e),f.color,7,{star:true,speed:3});
      }
    }
    if(g._assist) g._assist.t=Math.max(0,f.life);
    return f.life>0;
  },
  hula(g, f, p) {
    f.life--;
    f.pulse = (Number(f.pulse) || 0) + 1;
    const rad = f.r + Math.sin(f.pulse * 0.22) * 5;

    // El giro es también un escudo activo: cualquier proyectil hostil que entra
    // en el aro se devuelve al emisor. Se marca una ventana corta para impedir
    // que el mismo proyectil rebote varias veces mientras sigue dentro del aro.
    for (const pr of g.projectiles) {
      if (!pr || pr.life <= 0 || pr.owner === "player" || pr._hulaReflectUntil > (g.t || 0)) continue;
      const px = pr.x + (pr.w || 0) / 2;
      const py = pr.y + (pr.h || 0) / 2;
      const rr = rad + Math.max(pr.w || 0, pr.h || 0) / 2 + 8;
      if (Math.hypot(px - cx(p), py - cy(p)) > rr) continue;

      const speed = Math.hypot(pr.vx || 0, pr.vy || 0) || 7;
      if ((pr.vx || 0) === 0 && (pr.vy || 0) === 0) {
        pr.vx = (p.facing || 1) * speed;
        pr.vy = 0;
      } else {
        pr.vx = -(pr.vx || 0);
        pr.vy = -(pr.vy || 0);
      }
      pr.owner = "player";
      pr.reflected = true;
      pr._hulaReflectUntil = (g.t || 0) + 8;
      if (pr.hit && typeof pr.hit.clear === "function") pr.hit.clear();
      boom(g, px, py, "#ff5ad5", 5, { star: true, up: 0.4, speed: 2.5 });
    }

    if (f.pulse % 8 === 0) {
      f.hit.clear();
      for (const e of g.enemies) {
        if (!canHit(e) || f.hit.has(e)) continue;
        if (Math.hypot(cx(e) - cx(p), cy(e) - cy(p)) > rad + Math.max(e.w, e.h) / 2) continue;
        f.hit.add(e);
        hitEnemy(g, e, f.dmg, {
          kx: Math.sign(cx(e) - cx(p)) * 7 || p.facing,
          ky: -5,
          stun: 20,
          color: "#ff5ad5",
          shake: 2,
          xp: 1,
        });
        if (f.heal && p.health < p.maxHealth) {
          p.health = Math.min(p.maxHealth, p.health + f.heal);
          g.nums.add(cx(p), p.y - 18, "+" + f.heal, "#7de87a");
        }
      }
      boom(g, cx(p), cy(p), "#ff8adf", 5, { star: true, up: 1 });
    }
    armor(p, 2);
    return f.life > 0;
  },
    note(g, f) {
      f.life--;
      f.vy += 0.38;
      if (f.home) {
        const e = nearestEnemy(g, f.x, f.y, 260, f.hit);
        if (e) {
          const dx = cx(e) - f.x, dy = cy(e) - f.y, d = Math.hypot(dx, dy) || 1;
          f.vx += (dx / d) * 0.45;
          f.vy += (dy / d) * 0.3;
          const sp = Math.hypot(f.vx, f.vy), maxSp = 11;
          if (sp > maxSp) { f.vx *= maxSp / sp; f.vy *= maxSp / sp; }
        }
      }
      f.rot = Math.sin(f.age * 0.25) * 0.35;
      const y0 = f.y + f.r;
      f.x += f.vx; f.y += f.vy;
      if (f.vy > 0) {
        const top = crossTop(g, f.x, y0, f.y + f.r);
        if (top !== null) {
          f.y = top - f.r;
          f.bounces++;
          f.hit.clear();
          boom(g, f.x, top, f.color, 6, { up: 0.8, speed: 2 });
          add({ kind: "ripple", x: f.x, y: top, life: 14, color: f.color });
          if (f.bounces > f.maxB) { boom(g, f.x, f.y, f.color, 10, { star: true }); return false; }
          f.vy = -7.4;
        }
      }
      for (const e of g.enemies) {
        if (!f.hit.has(e) && canHit(e) && circleHit(f.x, f.y, f.r, e)) {
          f.hit.add(e);
          hitEnemy(g, e, f.dmg, { kx: Math.sign(f.vx) * 6, ky: -3, stun: 16, color: f.color, hitstop: 1, shake: 2 });
        }
      }
   return f.life > 0;
   },
 
  ohana(g, f, p) {
    f.life--;
    f.x = cx(p); f.y = cy(p);
    f.r = Math.min(f.max, f.r + f.max / 30);
    for (const e of g.enemies) {
      if (f.hit.has(e) || !canHit(e) || !inView(g, e)) continue;
      if (Math.hypot(cx(e) - f.x, cy(e) - f.y) < f.r) {
        f.hit.add(e);
        hitEnemy(g, e, f.dmg, { kx: Math.sign(cx(e) - f.x) * 6, ky: -5, stun: 30, color: "#ffd36a", crit: true });
        boom(g, cx(e), cy(e), "#fff1b0", 8, { star: true, up: 2 });
        if (f.lifesteal && p.health < p.maxHealth) {
          p.health = Math.min(p.maxHealth, p.health + f.lifesteal);
          g.nums.add(cx(p), p.y - 18, "+" + f.lifesteal, "#7de87a");
        }
      }
    }
    return f.life > 0;
  },
  burst(g, f, p) {
    if (f.next-- > 0) return true;
    const h = hand(p);
    const k = f.i - (f.n - 1) / 2;
    pushRuntime(g.projectiles, {
      x: h.x - 9, y: h.y - 5 + k * 3, vx: 14 * p.facing, vy: k * 0.35,
      w: 20, h: 10, life: 42, dmg: 9, color: f.i % 2 ? "#9ef0ff" : "#5ad1ff", shape: "bolt", owner: "player", trail: true,
    }, MAX_RUNTIME_PROJECTILES);
    g.fx.emit(h.x, h.y, { color: "#9ef0ff", count: 4, size: 2.5, angle: p.facing > 0 ? 0 : Math.PI, spread: 0.8, speed: 3, star: true });
    p.vx -= p.facing * 0.8;
    f.i++;
    f.next = f.gap;
    return f.i < f.n;
  },
  chain(g, f) { return --f.life > 0; },
  trail(g, f) {
    f.life--;
    const minx = Math.min(f.x1, f.x2) - 10, maxx = Math.max(f.x1, f.x2) + 10;
    for (const e of g.enemies) {
      if (f.hit.has(e) || !canHit(e)) continue;
      const ex = cx(e);
      if (ex + e.w / 2 < minx || ex - e.w / 2 > maxx) continue;
      const u = clamp((ex - f.x1) / ((f.x2 - f.x1) || 1), 0, 1);
      const ly = f.y1 + (f.y2 - f.y1) * u;
      if (Math.abs(cy(e) - ly) < 30 + e.h / 2) {
        f.hit.add(e);
        hitEnemy(g, e, f.dmg, { ky: -4, stun: 40, color: "#ffe14a" });
      }
    }
    if (f.age % 3 === 0) {
      const u = deterministicUnit(f.age * 3.17 + f.x1 * 0.17 + f.y1 * 0.31 + f.x2 * 0.53 + f.y2 * 0.79);
      g.fx.emit(f.x1 + (f.x2 - f.x1) * u, f.y1 + (f.y2 - f.y1) * u, { color: "#ffe14a", count: 2, size: 2, speed: 2, life: 10, star: true });
    }
    return f.life > 0;
  },
  storm(g, f, p) {
    f.life--;
    const e = nearestEnemy(g, f.x, f.y + 140, 700, null, 0);
    const tx = e ? cx(e) : cx(p) + p.facing * 120;
    const ty = Math.max((g.cam.y || 0) + 50, (e ? e.y : p.y) - 150);
    f.vx = f.vx * 0.9 + clamp(tx - f.x, -60, 60) * 0.012;
    f.x += f.vx;
    f.y += (ty - f.y) * 0.05;
    for (const b of f.bolts) b.life--;
    f.bolts = f.bolts.filter((b) => b.life > 0);
    if (--f.next <= 0 && f.life > 8) {
      f.next = 20;
      const bx = f.x + (gameRand(g) - 0.5) * 30;
      let by = groundBelow(g, bx, f.y + 20);
      if (by === null) by = f.y + 400;
      let struck = false;
      for (const en of g.enemies) {
        if (!canHit(en)) continue;
        if (Math.abs(cx(en) - bx) < 28 + en.w / 2 && en.y + en.h > f.y && en.y < by) {
          hitEnemy(g, en, f.dmg, { ky: -3, stun: 26, color: "#9cf" });
          struck = true;
        }
      }
      f.bolts.push({ x: bx, y1: f.y + 16, y2: by, life: 10 });
      g.fx.emit(bx, by, { color: "#fff6a0", count: 8, size: 3, up: 1.6, speed: 3, star: true });
      g.shake = Math.min(16, (g.shake || 0) + (struck ? 5 : 2));
    }
    return f.life > 0;
  },
  yarn(g, f, p) {
    f.life--;
    f.rot += f.vx * 0.05 + 0.1;
    if (f.out) {
      f.x += f.vx;
      f.vx *= 0.915;
      if (f.age >= 22 || Math.abs(f.vx) < 1.4) f.out = false;
    } else {
      const dx = cx(p) - f.x, dy = cy(p) - f.y, d = Math.hypot(dx, dy) || 1;
      const sp = Math.min(15, 4 + (f.age - 22) * 0.6);
      f.vx = (dx / d) * sp; f.vy = (dy / d) * sp;
      f.x += f.vx; f.y += f.vy;
      if (d < 22) { boom(g, f.x, f.y, "#ff8ad4", 6, { star: true }); return false; }
    }
    const set = f.out ? f.hitA : f.hitB;
    for (const e of g.enemies) {
      if (set.has(e) || !canHit(e) || !circleHit(f.x, f.y, f.r + 2, e)) continue;
      set.add(e);
      hitEnemy(g, e, f.dmg, { kx: Math.sign(f.vx || 1) * 7, ky: -3, stun: 18, color: "#ff8ad4" });
    }
    return f.life > 0;
  },
  purr(g, f, p) {
    f.life--;
    const u = 1 - f.life / (f.max || 72);
    const rad = Math.min(f.R, 36 + u * f.R);
    for (const e of g.enemies) {
      if (f.hit.has(e) || !canHit(e)) continue;
      if (Math.hypot(cx(e) - cx(p), cy(e) - cy(p)) > rad) continue;
      f.hit.add(e);
      const st = e.boss ? 40 + f.evo * 8 : f.stun;
      hitEnemy(g, e, f.dmg, { stun: st, color: "#ffb6e4", shake: 0, xp: 1, parts: 6 });
      if (!e.boss) { e.vx = 0; e.telegraph = false; }
      e._sleepUntil = (g.t || 0) + st;
      f.slept.push(e);
      if (!f._zzz) {
        f._zzz = true;
        add({ kind: "zzz", list: f.slept, life: f.stun });
      }
    }
    return f.life > 0;
  },
  zzz(g, f) {
    f.life--;
    f.list = f.list.filter((e) => alive(e) && (e._sleepUntil || 0) > g.t);
    return f.life > 0 && f.list.length > 0;
  },
  wisp(g, f, p) {
    f.life--;
    f.trail.push({ x: f.x, y: f.y });
    const trailMax = f.tail ? 30 : 8;
    if (f.trail.length > trailMax) f.trail.shift();
    if (f.delay > 0) {
      f.delay--;
      f.vx *= f.tail ? 0.985 : 0.95;
      f.vy *= f.tail ? 0.985 : 0.95;
    } else {
      if (!alive(f.target)) f.target = nearestEnemy(g, f.x, f.y, 1100, null, 0);
      let tx, ty;
      if (f.target) { tx = cx(f.target); ty = cy(f.target); }
      else {
        const a = f.age * 0.11 + f.idx * 0.7;
        tx = cx(p) + Math.cos(a) * (f.tail ? 140 : 60);
        ty = cy(p) - 20 + Math.sin(a * 1.3) * (f.tail ? 70 : 30);
      }
      const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy) || 1;
      const sp = f.target ? (f.tail ? 14.5 : 9.5) : (f.tail ? 7 : 4);
      const steer = f.tail ? 0.075 : 0.14;
      f.vx += ((dx / d) * sp - f.vx) * steer;
      f.vy += ((dy / d) * sp - f.vy) * steer;
    }
    if (f.tail) {
      const ang = Math.atan2(f.vy, f.vx);
      const wob = Math.sin(f.age * 0.55 + f.idx * 1.3) * (f.delay > 0 ? 1.6 : 5.2);
      f.vx += Math.cos(ang + Math.PI / 2) * wob * 0.22;
      f.vy += Math.sin(ang + Math.PI / 2) * wob * 0.22;
    }
    f.x += f.vx; f.y += f.vy;
    if (f.delay <= 0) {
      for (const e of g.enemies) {
        if (canHit(e) && circleHit(f.x, f.y, 10, e)) {
          hitEnemy(g, e, f.dmg, { kx: Math.sign(f.vx) * 5, ky: -3, stun: 18, color: f.color });
          boom(g, f.x, f.y, f.color, 8, { star: true });
          return false;
        }
      }
    }
    if (f.life <= 0) boom(g, f.x, f.y, f.color, 4);
    return f.life > 0;
  },
  breath(g, f, p) {
    f.life--;
    const o = hand(p);
    f.x = o.x; f.y = o.y - p.h * 0.05; f.f = p.facing;
    if (f.age % 5 === 1) {
      for (const e of g.enemies) {
        if (!canHit(e)) continue;
        const dx = (cx(e) - f.x) * f.f, dy = cy(e) - f.y;
        if (dx > -e.w / 2 && dx < f.len + e.w / 2 && Math.abs(dy) < 16 + dx * 0.42 + e.h / 2) {
          hitEnemy(g, e, f.dmg, { kx: f.f * 3, stun: 12, color: "#ff8a3a", xp: f.age < 6 ? 2 : 0, shake: 1, parts: 5 });
        }
      }
    }
    if (f.age % 2 === 0) {
      const n0 = deterministicUnit(f.age * 2.13 + f.len * 0.017);
      const n1 = deterministicUnit(f.age * 3.71 + f.x * 0.011);
      const n2 = deterministicUnit(f.age * 5.23 + f.y * 0.013);
      g.fx.emit(f.x + f.f * f.len * (0.6 + n0 * 0.4), f.y + (n1 - 0.5) * 30, { color: n2 < 0.5 ? "#ffb347" : "#666", count: 1, size: 3, up: 1, speed: 1, life: 16 });
    }
    return f.life > 0;
  },
  gust(g, f) { return --f.life > 0; },
  shower(g, f, p) {
    if (f.next-- > 0) return true;
    f.next = 7;
    const cands = g.enemies.filter((e) => canHit(e) && inView(g, e));
    let tx;
    if (cands.length) { const e = cands[f.i % cands.length]; tx = cx(e) + (gameRand(g) - 0.5) * 30; }
    else tx = cx(p) + f.f * (80 + gameRand(g) * 420);
    const dir = f.f;
    add({ kind: "meteor", x: tx - dir * 150, y: (g.cam.y || 0) - 60, vx: dir * 3.2, vy: 10.5, r: 11 + gameRand(g) * 5, dmg: f.dmg, R: f.r, life: 160, rot: gameRand(g) * 6 });
    f.i++;
    return f.i < f.n;
  },
  meteor(g, f) {
    f.life--;
    f.rot += 0.12;
    const y0 = f.y;
    f.x += f.vx; f.y += f.vy;
    let hitNow = false;
    const top = crossTop(g, f.x, y0 + f.r * 0.5, f.y + f.r * 0.5);
    if (top !== null) { f.y = top - f.r * 0.5; hitNow = true; }
    if (!hitNow) for (const e of g.enemies) if (canHit(e) && circleHit(f.x, f.y, f.r, e)) { hitNow = true; break; }
    if (f.age % 2 === 0) { const n = deterministicUnit(f.age * 4.17 + f.x * 0.009 + f.y * 0.007); g.fx.emit(f.x, f.y, { color: n < 0.5 ? "#ff6a2a" : "#ffd36a", count: 2, size: 3, speed: 0.8, life: 14, gravity: -0.02 }); }
    if (hitNow) {
      for (const e of g.enemies) {
        if (canHit(e) && Math.hypot(cx(e) - f.x, cy(e) - f.y) < f.R + Math.max(e.w, e.h) / 2) {
          hitEnemy(g, e, f.dmg, { kx: Math.sign(cx(e) - f.x) * 8, ky: -6, stun: 24, color: "#ff6a2a" });
        }
      }
      add({ kind: "blast", x: f.x, y: f.y, R: f.R, life: 16, color: "#ff6a2a" });
      boom(g, f.x, f.y, "#ff6a2a", 10, { up: 2, speed: 4 });
      boom(g, f.x, f.y, "#ffe36a", 8, { star: true, up: 2.4 });
      g.shake = Math.min(20, (g.shake || 0) + 6);
      return false;
    }
    return f.life > 0 && f.y < (g.worldH || 900) + 60;
  },
  blast(g, f) { return --f.life > 0; },
  jaws(g, f) { return --f.life > 0; },
  quake(g, f) {
    f.life--;
    for (const fr of f.fronts) {
      if (!fr.on) continue;
      fr.x += fr.dir * f.speed;
      if (Math.abs(fr.x - f.ox) > f.maxD || fr.x < 0 || fr.x > (g.worldW || 1600)) { fr.on = false; continue; }
      const top = groundNear(g, fr.x, fr.y, 70);
      if (top === null) { fr.on = false; boom(g, fr.x, fr.y, "#c8a060", 6); continue; }
      fr.y = top;
      const n0 = deterministicUnit(fr.x * 0.041 + f.age * 1.73); const n1 = deterministicUnit(fr.x * 0.083 + f.age * 2.91); f.spikes.push({ x: fr.x, y: top, life: 26, h: 16 + n0 * 16, lean: (n1 - 0.5) * 0.4 });
      if (f.age % 2 === 0) g.fx.emit(fr.x, top, { color: "#b89060", count: 2, size: 3, up: 1.6, speed: 1.6, life: 18 });
      for (const e of g.enemies) {
        if (f.hit.has(e) || !canHit(e) || isAir(e) || !onGround(g, e)) continue;
        if (Math.abs(cx(e) - fr.x) < 26 + e.w / 2 && Math.abs(e.y + e.h - top) < 18) {
          f.hit.add(e);
          hitEnemy(g, e, f.dmg, { kx: fr.dir * 3, ky: -11, stun: 45, color: "#e8c080", shake: 5 });
        }
      }
    }
    for (const s of f.spikes) s.life--;
    f.spikes = f.spikes.filter((s) => s.life > 0);
    if (f.fronts.some((fr) => fr.on)) g.shake = Math.max(g.shake || 0, 4);
    return f.life > 0 && (f.spikes.length > 0 || f.fronts.some((fr) => fr.on));
  },
  muzzle(g, f) { return --f.life > 0; },
  blob(g, f) {
    f.life--;
    const y0 = f.y + f.r;
    f.vy += 0.42;
    f.x += f.vx; f.y += f.vy;
    let top = f.vy > 0 ? crossTop(g, f.x, y0, f.y + f.r) : null;
    if (top === null) {
      for (const e of g.enemies) {
        if (canHit(e) && circleHit(f.x, f.y, f.r, e)) {
          hitEnemy(g, e, f.dmg * 2, { kx: Math.sign(f.vx) * 3, stun: 20, color: "#e23b3b" });
          top = groundBelow(g, f.x, e.y + e.h - 4);
          if (top === null) { boom(g, f.x, f.y, "#e23b3b", 10); return false; }
          break;
        }
      }
    }
    if (top !== null) {
      add({ kind: "puddle", x: f.x, y: top, w: f.w, life: f.plife, max: f.plife, dmg: f.dmg, grow: 0 });
      boom(g, f.x, top, "#e23b3b", 10, { up: 1.6 });
      return false;
    }
    if (f.age % 2 === 0) g.fx.emit(f.x, f.y, { color: "#b81f1f", count: 1, size: 2.2, speed: 0.3, life: 10 });
    return f.life > 0 && f.y < (g.worldH || 900) + 40;
  },
  puddle(g, f) {
    f.life--;
    f.grow = Math.min(1, f.grow + 0.12);
    const half = (f.w / 2) * f.grow;
    for (const e of g.enemies) {
      if (!canHit(e)) continue;
      if (cx(e) + e.w / 2 < f.x - half || cx(e) - e.w / 2 > f.x + half) continue;
      if (Math.abs(e.y + e.h - f.y) > 16) continue;
      if (!e.boss) { e.stun = Math.max(e.stun || 0, 7); e.vx *= 0.6; }
      if ((e._puddleT || 0) <= g.t) {
        e._puddleT = g.t + 20;
        hitEnemy(g, e, f.dmg, { stun: 8, color: "#ff6a6a", xp: 0, shake: 0, parts: 3 });
      }
      if (f.age % 6 === 0) g.fx.emit(cx(e), f.y, { color: "#e23b3b", count: 1, size: 2.4, up: 1, speed: 0.6, life: 14 });
    }
    return f.life > 0;
  },
  geyser(g, f) {
    if (f.delay > 0) { f.delay--; return true; }
    if (f.warn > 0) {
      f.warn--;
      if (f.warn % 3 === 0) { const n = deterministicUnit(f.x * 0.057 + f.warn * 2.31); g.fx.emit(f.x + (n - 0.5) * 24, f.y, { color: "#c89020", count: 2, size: 2.4, up: 0.8, speed: 0.6, life: 12 }); }
      if (f.warn === 0) { g.shake = Math.min(16, (g.shake || 0) + 3); boom(g, f.x, f.y, "#ffd36a", 10, { up: 3, speed: 3 }); }
      return true;
    }
    f.up--;
    const k = f.up / 24;
    f.h = f.H * Math.sin(Math.min(1, (1 - k) * 3) * Math.PI / 2) * (k > 0.25 ? 1 : k / 0.25);
    const box = { x: f.x - 18, y: f.y - f.h, w: 36, h: f.h };
    for (const e of g.enemies) {
      if (f.hit.has(e) || !canHit(e) || !aabb(box, e)) continue;
      f.hit.add(e);
      hitEnemy(g, e, f.dmg, { kx: (gameRand(g) - 0.5) * 4, ky: -10, stun: 30, color: "#ffd36a" });
    }
    if (f.up % 2 === 0) { const n = deterministicUnit(f.x * 0.031 + f.up * 2.17); g.fx.emit(f.x, f.y - f.h, { color: n < 0.5 ? "#ffd36a" : "#fff0b0", count: 2, size: 3, up: 2, speed: 2, life: 18, gravity: 0.2 }); }
    return f.up > 0;
  },
  disc(g, f) {
    f.life--;
    f.rot += f.vx * 0.06;
    f.vy += 0.2;
    const W = g.worldW || 1600;
    // horizontal
    f.x += f.vx;
    if (solidAt(g, f.x + Math.sign(f.vx) * f.r, f.y) || f.x < f.r || f.x > W - f.r) {
      f.x -= f.vx; f.vx = -f.vx; f.bounces++;
      boom(g, f.x, f.y, "#ffcf6a", 5);
    }
    const y0 = f.y + f.r;
    f.y += f.vy;
    if (f.vy > 0) {
      const top = crossTop(g, f.x, y0, f.y + f.r);
      if (top !== null) { f.y = top - f.r; f.vy = -Math.max(5.2, Math.abs(f.vy) * 0.85); f.bounces++; boom(g, f.x, top, "#ffcf6a", 4, { up: 0.6 }); }
    } else if (solidAt(g, f.x, f.y - f.r) || f.y < f.r + (g.cam.y || 0) - 200) {
      f.vy = Math.abs(f.vy); f.bounces++;
    }
    for (const e of g.enemies) {
      if (!canHit(e) || (e._discT || 0) > g.t || !circleHit(f.x, f.y, f.r, e)) continue;
      e._discT = g.t + 18;
      hitEnemy(g, e, f.dmg, { kx: Math.sign(f.vx) * 6, ky: -3, stun: 18, color: "#e0402a" });
    }
    if (f.bounces > f.maxB) { boom(g, f.x, f.y, "#e0402a", 10, { star: true }); return false; }
    return f.life > 0 && f.y < (g.worldH || 900) + 40;
  },
  cheese(g, f) {
    f.life--;
    if (f.e) { if (alive(f.e)) { f.ax = cx(f.e); f.ay = cy(f.e); } }
    if (!f.miss && !S.pull && f.life > 6) f.life = 6;
    return f.life > 0;
  },
  heat(g, f, p) {
    f.life--;
    f.x = cx(p); f.y = cy(p);
    f.r = f.R * Math.min(1, f.age / 18);
    for (const e of g.enemies) {
      if (f.hit.has(e) || !canHit(e)) continue;
      if (Math.hypot(cx(e) - f.x, cy(e) - f.y) < f.r + Math.max(e.w, e.h) / 2) {
        f.hit.add(e);
        hitEnemy(g, e, f.dmg, { kx: Math.sign(cx(e) - f.x) * 9, ky: -5, stun: 24, color: "#ff8a2a" });
      }
    }
    return f.life > 0;
  },
  slices(g, f, p) {
    if (f.next-- > 0) return true;
    f.next = 5;
    const x = f.x + (gameRand(g) * 2 - 1) * 320;
    add({ kind: "slice", x, y: (g.cam.y || 0) - 30 - gameRand(g) * 60, vx: (gameRand(g) - 0.5) * 1.5, vy: 4 + gameRand(g) * 2, rot: gameRand(g) * 6, spin: (gameRand(g) - 0.5) * 0.3, dmg: f.dmg, life: 200 });
    f.i++;
    return f.i < f.n;
  },
  slice(g, f) {
    f.life--;
    f.rot += f.spin;
    const y0 = f.y + 8;
    f.vy = Math.min(12, f.vy + 0.25);
    f.x += f.vx; f.y += f.vy;
    let done = false;
    for (const e of g.enemies) {
      if (canHit(e) && circleHit(f.x, f.y, 14, e)) {
        hitEnemy(g, e, f.dmg, { ky: -4, stun: 18, color: "#ffcf4a" });
        done = true; break;
      }
    }
    if (!done && crossTop(g, f.x, y0, f.y + 8) !== null) {
      for (const e of g.enemies) if (canHit(e) && Math.hypot(cx(e) - f.x, cy(e) - f.y) < 40) hitEnemy(g, e, f.dmg * 0.5, { ky: -3, stun: 10, color: "#ffcf4a", xp: 1 });
      done = true;
    }
    if (done) { boom(g, f.x, f.y, "#ffcf4a", 8, { up: 1.6 }); boom(g, f.x, f.y, "#e0402a", 4); return false; }
    return f.life > 0 && f.y < (g.worldH || 900) + 40;
  },
  ofuda(g, f) {
    f.life--;
    if (!f.stuck) {
      f.x += f.vx;
      f.y += f.vy;
      for (const e of g.enemies) {
        if (canHit(e) && circleHit(f.x, f.y, 14, e)) {
          f.stuck = 16;
          const direction = Math.sign(f.vx) || 1;
          f.vx = 0;
          f.vy = 0;
          hitEnemy(g, e, f.dmg * 0.45, { kx: direction * 2, ky: -1, stun: 10, color: "#f2e6c8" });
          break;
        }
      }
      const floor = f.vy >= 0 ? crossTop(g, f.x, f.y - f.vy, f.y) : null;
      const wall = solidAt(g, f.x, f.y);
      const outside = f.x < 0 || f.x > (g.worldW || 1600) || f.y > (g.worldH || 900);
      if (!f.stuck && (floor !== null || wall || outside)) {
        f.stuck = 16;
        f.vx = 0;
        f.vy = 0;
      }
    }
    if (!f.stuck && f.life <= 0) f.stuck = 1;
    if (f.stuck && --f.stuck <= 0) {
      for (const e of g.enemies) {
        if (canHit(e) && Math.hypot(cx(e) - f.x, cy(e) - f.y) < 72) {
          hitEnemy(g, e, f.dmg, { kx: Math.sign(cx(e) - f.x) || 1, ky: -4, stun: 16, color: "#ff4466" });
        }
      }
      boom(g, f.x, f.y, "#ff4466", 12, { star: true });
      return false;
    }
    return f.stuck > 0 || f.life > 0;
  },
  sleeve(g, f, p) {
    f.life--;
    const x = cx(p), y = cy(p);
    for (const e of g.enemies) {
      if (!canHit(e)) continue;
      const dx = x - cx(e), dy = y - cy(e);
      const dist = Math.hypot(dx, dy);
      if (dist > 210 || dist < 8) continue;
      if (Math.sign(-dx) !== (p.facing || 1) && Math.abs(dx) > 24) continue;
      e.vx += (dx / dist) * 2.1;
      e.vy += (dy / dist) * 0.8;
    }
    return f.life > 0;
  },
  maw(g, f, p) {
    f.life--;
    if (f.life === f.max - 1) {
      for (const e of g.enemies) {
        if (!canHit(e) || f.hit.has(e)) continue;
        const dx = cx(e) - cx(p);
        const dy = cy(e) - cy(p);
        if (Math.sign(dx || f.face) !== f.face && Math.abs(dx) > 16) continue;
        if (Math.abs(dx) < 120 && Math.abs(dy) < 54) {
          f.hit.add(e);
          hitEnemy(g, e, f.dmg, { kx: f.face * 8, ky: -3, stun: 20, color: "#ff2244" });
        }
      }
    }
    return f.life > 0;
  },
};

// ---------------------------------------------------------------------------
// DRAW de entidades
// ---------------------------------------------------------------------------
function drawNoteGlyph(ctx, s, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(60,20,0,.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-3 * s, 6 * s, 6.5 * s, 4.8 * s, -0.45, 0, TAU);
  ctx.fill(); ctx.stroke();
  ctx.fillRect(2.4 * s, -13 * s, 2.8 * s, 19 * s);
  ctx.beginPath();
  ctx.moveTo(5.2 * s, -13 * s);
  ctx.quadraticCurveTo(15 * s, -9 * s, 11 * s, 0);
  ctx.quadraticCurveTo(11 * s, -6 * s, 5.2 * s, -7 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.beginPath();
  ctx.ellipse(-5 * s, 4.6 * s, 2.2 * s, 1.4 * s, -0.45, 0, TAU);
  ctx.fill();
}

function drawBallAura(ctx, p, cam, t, color) {
  const x = cx(p) - cam.x, y = cy(p) - cam.y;
  const r = Math.max(p.w, p.h) * 0.62 + 4;
  ctx.save();
  glow(ctx, x, y, r * 1.8, color, 0.45);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;
  const a0 = t * 0.45 * p.facing;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y, r, a0 + i * 2.09, a0 + i * 2.09 + 1.2);
    ctx.stroke();
  }
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r - 3, a0 + 1, a0 + 1.9);
  ctx.stroke();
  // estelas de velocidad
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#dff4ff";
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    const yy = y + i * r * 0.5;
    ctx.beginPath();
    ctx.moveTo(x - p.facing * (r + 4), yy);
    ctx.lineTo(x - p.facing * (r + 18 + (t * 7 + i * 13) % 14), yy);
    ctx.stroke();
  }
  // Stitcho no deja una estela genérica: "cose" el recorrido.
  if (p.id === "stitcho") {
    ctx.globalAlpha = .70;
    ctx.strokeStyle = color === "#8f7bff" ? "#d8b7ff" : "#9cf6ff";
    ctx.lineWidth = 1.8;
    for (let i=0;i<6;i++) {
      const xx = x - p.facing * (r + 12 + i * 13);
      const yy = y + Math.sin(t*.20+i)*r*.36;
      ctx.beginPath();
      ctx.moveTo(xx-p.facing*6,yy-3);
      ctx.lineTo(xx,yy+2);
      ctx.lineTo(xx+p.facing*6,yy-2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawChargeShield(ctx, p, cam, t) {
  const f = p.facing;
  const x = cx(p) - cam.x + f * (p.w * 0.55), y = cy(p) - cam.y;
  const h = p.h * 0.75 + 8;
  ctx.save();
  glow(ctx, x, y, h, "#c8f04a", 0.35);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(76,191,86,.35)";
  ctx.strokeStyle = "#c8f04a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - f * 4, y - h);
  ctx.quadraticCurveTo(x + f * (18 + Math.sin(t * 0.6) * 2), y, x - f * 4, y + h);
  ctx.quadraticCurveTo(x + f * 6, y, x - f * 4, y - h);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const yy = y - h * 0.5 + i * h * 0.5;
    ctx.beginPath();
    ctx.moveTo(x - f * 30, yy);
    ctx.lineTo(x - f * (46 + (t * 9 + i * 7) % 18), yy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCloud(ctx, x, y, s, t) {
  const puffs = [[-30, 4, 18], [-12, -8, 22], [10, -10, 24], [30, 2, 18], [0, 8, 20], [-22, 10, 14], [22, 10, 14]];
  ctx.fillStyle = "rgba(20,24,40,.35)";
  for (const [px, py, r] of puffs) { ctx.beginPath(); ctx.arc(x + px * s + 3, y + py * s + 5, r * s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = "#5a6178";
  for (const [px, py, r] of puffs) { ctx.beginPath(); ctx.arc(x + px * s, y + py * s + Math.sin(t * 0.08 + px) * 1.5, r * s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = "#8b93ad";
  for (const [px, py, r] of puffs.slice(1, 4)) { ctx.beginPath(); ctx.arc(x + px * s - 3, y + py * s - 4, r * s * 0.65, 0, TAU); ctx.fill(); }
}

function drawWisp(ctx, f, cam, t) {
  const x = f.x - cam.x, y = f.y - cam.y;
  const pts = f.trail || [];
  if (f.tail && pts.length > 1) {
    const ribbon = (width, color, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0].x - cam.x, pts[0].y - cam.y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x - cam.x, pts[i].y - cam.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ribbon(26, f.color, 0.28);
    ribbon(12, "#fff6ff", 0.55);
    ribbon(5, f.color, 0.95);
    for (let i = 0; i < pts.length; i += 2) {
      const k = (i + 1) / pts.length;
      const wob = Math.sin(t * 0.6 + i + f.idx) * (1 - k) * 3;
      ctx.globalAlpha = 0.25 + k * 0.7;
      ctx.fillStyle = i % 4 === 0 ? "#fff" : f.color;
      ctx.beginPath();
      ctx.arc(pts[i].x - cam.x + wob, pts[i].y - cam.y, 1.4 + k * 3.2, 0, TAU);
      ctx.fill();
    }
    const pulse = 22 + Math.sin(t * 0.45 + f.idx) * 6;
    glow(ctx, x, y, pulse, f.color, 0.9);
    glow(ctx, x, y, pulse * 0.45, "#fff", 0.8);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(f.vy, f.vx) + Math.PI / 2);
    const flick = Math.sin(t * 0.5 + f.idx) * 3;
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(9, 2, 0, 20 + flick);
    ctx.quadraticCurveTo(-9, 2, 0, -12);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, -1, 3.2, 5, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < pts.length; i++) {
    const tr = pts[i];
    const k = (i + 1) / pts.length;
    ctx.globalAlpha = k * 0.45;
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(tr.x - cam.x, tr.y - cam.y, 3 + k * 6, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  glow(ctx, x, y, 20, f.color, 0.7);
  ctx.globalCompositeOperation = "source-over";
  const a = Math.atan2(f.vy, f.vx);
  ctx.translate(x, y);
  ctx.rotate(a + Math.PI / 2);
  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(8, 0, 0, 16 + Math.sin(t * 0.5 + f.idx) * 3);
  ctx.quadraticCurveTo(-8, 0, 0, -10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 3.5, 5, 0, 0, TAU);
  ctx.fill();
}

function drawSlice(ctx, s) {
  ctx.fillStyle = "#c98a3a";
  ctx.beginPath();
  ctx.moveTo(-12 * s, -9 * s); ctx.lineTo(12 * s, -9 * s); ctx.lineTo(0, 14 * s); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd84a";
  ctx.beginPath();
  ctx.moveTo(-10 * s, -5 * s); ctx.lineTo(10 * s, -5 * s); ctx.lineTo(0, 12 * s); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e0402a";
  for (const [px, py] of [[-4, -1], [4, 0], [0, 6]]) { ctx.beginPath(); ctx.arc(px * s, py * s, 2.4 * s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = "#a8662a";
  ctx.fillRect(-12 * s, -11 * s, 24 * s, 4 * s);
}

const DRW = {
  supremeField(ctx, f, cam, t, g, p) {
    const x=f.x-cam.x,y=f.y-cam.y;
    const u=1-f.life/f.max;
    const fade=Math.min(1,f.life/18,Math.max(.15,u*4));
    const pulse=.72+.28*Math.sin(t*.12);
    const R=110+Math.sin(t*.07)*12;
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha=.16*fade;
    const grd=ctx.createRadialGradient(x,y,8,x,y,R*1.35);
    grd.addColorStop(0,f.color);
    grd.addColorStop(.48,"rgba(255,255,255,.08)");
    grd.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,R*1.35,0,TAU);ctx.fill();
    ctx.globalAlpha=.68*fade;
    ctx.strokeStyle=f.color;ctx.lineWidth=2.2;
    ctx.beginPath();ctx.arc(x,y,R*pulse,0,TAU);ctx.stroke();

    if(f.mode==="kilo"){
      for(let i=0;i<8;i++){const a=i*TAU/8+t*.018;const rr=R*.78;ctx.save();ctx.translate(x+Math.cos(a)*rr,y+Math.sin(a)*rr);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,5,14,0,0,TAU);ctx.stroke();ctx.restore();}
    }else if(f.mode==="stitcho"){
      ctx.setLineDash([12,8]);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x,y,R*(.5+i*.22),t*.02+i,-t*.025+i+Math.PI*1.3);ctx.stroke();}ctx.setLineDash([]);
    }else if(f.mode==="chispin"){
      for(let i=0;i<6;i++){const a=i*TAU/6+t*.028;const orbit=R*(.61+.07*Math.sin(t*.065+i));const nx=x+Math.cos(a)*orbit,ny=y+Math.sin(a)*orbit*.72;ctx.globalAlpha=(.38+.28*Math.sin(t*.09+i)**2)*fade;ctx.strokeStyle=i%2?"#bd83ff":"#fff5a3";ctx.lineWidth=i%2?2.2:1.6;ctx.beginPath();ctx.arc(nx,ny,3.2+(i%3),0,TAU);ctx.stroke();if(i%2===0)zig(ctx,x,y,nx,ny,8,4,"#fff5a3",2);zig(ctx,nx,ny,x+Math.cos(a)*R*1.13,y+Math.sin(a)*R*.82,8,3,f.color,1.5);}ctx.globalAlpha=.26*fade;ctx.strokeStyle="#bd83ff";ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,R*.70,R*.49,-.08,0,TAU);ctx.stroke();
    }else if(f.mode==="cat"){
      ctx.fillStyle="rgba(2,3,12,.72)";ctx.globalAlpha=.5*fade;ctx.beginPath();ctx.arc(x,y,R*.62,0,TAU);ctx.fill();ctx.globalAlpha=.8*fade;ctx.strokeStyle="#ffb6e4";ctx.beginPath();ctx.arc(x+R*.18,y-R*.08,R*.56,.4,5.6);ctx.stroke();for(let i=0;i<9;i++){const a=i*TAU/9+t*.013;const rr=R*(.5+.13*Math.sin(t*.025+i));const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.7;ctx.globalAlpha=(.25+.26*Math.sin(t*.06+i)**2)*fade;ctx.strokeStyle=i%2?"#e0bdff":"#ffe5a0";ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(px-4,py-3);ctx.lineTo(px,py+2);ctx.lineTo(px+4,py-3);ctx.stroke();}ctx.globalAlpha=.55*fade;ctx.strokeStyle="#d6b0ff";ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,R*.77,R*.46,t*.004,0,TAU);ctx.stroke();
    }else if(f.mode==="dragon"){
      for(let i=0;i<7;i++){const a=i*TAU/7+t*.025;const rr=R*(.45+(i%2)*.3);ctx.fillStyle=i%2?"#fff3b0":f.color;ctx.globalAlpha=.55*fade;ctx.beginPath();ctx.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,3+(i%3),0,TAU);ctx.fill();}
    }else if(f.mode==="dino"){
      ctx.globalAlpha=.6*fade;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(x+i*28,y+42);ctx.lineTo(x+i*32,y+42-(22+((i*i+3)%4)*8));ctx.stroke();}
    }else if(f.mode==="frita"){
      ctx.globalAlpha=.55*fade;for(let i=-4;i<=4;i++){const xx=x+i*22;ctx.beginPath();ctx.moveTo(xx,y+34);ctx.quadraticCurveTo(xx+8*Math.sin(t*.1+i),y-34,xx,y-72);ctx.stroke();}
    }else if(f.mode==="pizza"){
      ctx.globalAlpha=.65*fade;ctx.beginPath();ctx.moveTo(x,y-R*.75);ctx.lineTo(x+R*.7,y+R*.48);ctx.lineTo(x-R*.7,y+R*.48);ctx.closePath();ctx.stroke();for(let i=0;i<5;i++){const a=i*TAU/5+t*.015;ctx.beginPath();ctx.arc(x+Math.cos(a)*R*.42,y+Math.sin(a)*R*.34,6,0,TAU);ctx.stroke();}
    }else if(f.mode==="yomi"){
      ctx.globalAlpha=.72*fade;ctx.beginPath();ctx.moveTo(x-R*.78,y);ctx.quadraticCurveTo(x,y-R*.62,x+R*.78,y);ctx.quadraticCurveTo(x,y+R*.62,x-R*.78,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,R*.14,0,TAU);ctx.fillStyle=f.color;ctx.fill();
    }else if(f.mode==="cuerno"){
      const cols=["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"];for(let i=0;i<4;i++){ctx.strokeStyle=cols[i];ctx.globalAlpha=.55*fade;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y+24,R*(.48+i*.12),Math.PI*1.08,Math.PI*1.92);ctx.stroke();}
    }
    ctx.restore();
  },
  assist(ctx, f, cam, t) {
    const def=ROSTER.find((item)=>item.id===f.heroId);
    if(!def)return;
    const age=f.max-f.life;
    const alpha=Math.min(1,age/10,f.life/14)*.78;
    const x=f.x-cam.x,y=f.y-cam.y;
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    glow(ctx,x,y+18,52,f.color,alpha*.28);
    ctx.globalCompositeOperation="source-over";
    ctx.globalAlpha=alpha;
    const form=(def.forms&&def.forms[4])||{};
    const dummy={
      ...def,id:def.id,evo:4,color:form.color||def.color,
      x:-16,y:-38,w:32,h:38,facing:f.facing||1,grounded:false,
      vx:(f.facing||1)*3,vy:0,melee:(age%24>9&&age%24<18)?8:0,
      visualScale:1.12,invuln:1
    };
    ctx.translate(x,y+38);
    drawCharacter(ctx,dummy,{x:0,y:0},t*1.3);
    ctx.globalAlpha=alpha*.55;
    ctx.strokeStyle=f.color;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(0,-22,34+Math.sin(t*.15)*4,0,TAU);ctx.stroke();
    ctx.restore();
  },
  note(ctx, f, cam) {
    const x = f.x - cam.x, y = f.y - cam.y;
    glow(ctx, x, y, f.r * 2.2, f.color, 0.55);
    ctx.translate(x, y);
    ctx.rotate(f.rot);
    drawNoteGlyph(ctx, f.r / 11, f.color);
  },
  ripple(ctx, f, cam) {
    const k = 1 - f.life / 14;
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(f.x - cam.x, f.y - cam.y, 6 + k * 26, 2 + k * 6, 0, 0, TAU);
    ctx.stroke();
  },
  hula(ctx, f, cam, t, g, p) {
    const x = cx(p) - cam.x, y = cy(p) - cam.y;
    const k = Math.min(1, f.life / 10);
    ctx.globalAlpha = 0.25 * k;
    ctx.fillStyle = "#ff5ad5";
    ctx.beginPath(); ctx.ellipse(x, y, f.r, f.r * 0.8, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.9 * k;
    ctx.strokeStyle = "#ffb3ee";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, f.r, f.r * 0.8, 0, 0, TAU); ctx.stroke();
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + t * 0.35;
      const px = x + Math.cos(a) * f.r, py = y + Math.sin(a) * f.r * 0.8;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = i % 2 ? "#7de87a" : "#ff5ad5";
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 10, 0, 0, TAU);
      ctx.fill();
      if (i % 2 === 0) { ctx.fillStyle = "#fff36a"; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
  },
  supreme(ctx, f, cam, t) {
    const x = f.x - cam.x, y = f.y - cam.y;
    const k = f.life / f.max;
    const r = (1 - k) * 300;
    const name = f.name || "";
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = Math.min(1, k * 1.2);
    ctx.strokeStyle = f.color;
    ctx.fillStyle = f.color;
    ctx.lineWidth = 8 * k + 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    if (f.identity === "bloom") {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, 10, 22, a, 0, TAU);
        ctx.stroke();
      }
    } else if (f.identity === "rift") {
      for (let i = 0; i < 6; i++) ctx.strokeRect(x - r + i * 20, y - r * 0.2, 14, r * 0.4);
    } else if (f.identity === "chain") {
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x - r * 0.2, y - 30);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x + r, y - 20);
      ctx.stroke();
    } else if (f.identity === "eclipse") {
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0.4, 5.4);
      ctx.stroke();
    } else if (f.identity === "nova") {
      ctx.beginPath();
      ctx.arc(x, y, r * 0.35, 0, TAU);
      ctx.fill();
    } else if (f.identity === "quake") {
      ctx.beginPath();
      ctx.ellipse(x, y + 20, r, 18, 0, 0, TAU);
      ctx.stroke();
    } else if (f.identity === "crisp") {
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(x - r + i * (r * 2 / 8), y + 10);
        ctx.lineTo(x - r + i * (r * 2 / 8), y - 40 - (i % 2) * 16);
        ctx.stroke();
      }
    } else if (f.identity === "volcano") {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.7, y + 20);
      ctx.lineTo(x - r * 0.5, y + 20);
      ctx.closePath();
      ctx.stroke();
    } else if (f.identity === "maw") {
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y);
      ctx.lineTo(x, y - 30);
      ctx.lineTo(x + r * 0.6, y);
      ctx.lineTo(x, y + 30);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y - 10, r * 0.8, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.font = "800 22px Outfit,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, x, y - r - 16);
  },
  ohana(ctx, f, cam, t) {
    const x = f.x - cam.x, y = f.y - cam.y;
    const k = f.life / 44;
    ctx.globalAlpha = 0.18 * k;
    ctx.fillStyle = "#ffe9a0";
    ctx.beginPath(); ctx.arc(x, y, f.r, 0, TAU); ctx.fill();
    ctx.globalAlpha = Math.min(1, k * 1.6);
    ctx.strokeStyle = "#ffd36a";
    ctx.lineWidth = 10 * k + 2;
    ctx.beginPath(); ctx.arc(x, y, f.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, f.r - 6), 0, TAU); ctx.stroke();
    for (let i = 0; i < f.n; i++) {
      const a = (i / f.n) * TAU + t * 0.03;
      const px = x + Math.cos(a) * f.r, py = y + Math.sin(a) * f.r;
      glow(ctx, px, py, 22, "#fff4c0", 0.7 * k);
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.fillStyle = "#fffbe8";
      ctx.beginPath();
      ctx.arc(px, py - 4, 8, Math.PI, 0);
      ctx.lineTo(px + 8, py + 6);
      for (let j = 0; j < 3; j++) ctx.quadraticCurveTo(px + 8 - j * 5.3 - 2.6, py + 11 + Math.sin(t * 0.3 + j + i) * 2, px + 8 - (j + 1) * 5.3, py + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a3a20";
      ctx.beginPath(); ctx.arc(px - 3, py - 4, 1.4, 0, TAU); ctx.arc(px + 3, py - 4, 1.4, 0, TAU); ctx.fill();
    }
  },
  chain(ctx, f, cam) {
    const k = f.life / 18;
    ctx.globalAlpha = Math.max(0.2, k);
    for (let i = 0; i < f.pts.length - 1; i++) {
      const a = f.pts[i], b = f.pts[i + 1];
      zig(ctx, a.x - cam.x, a.y - cam.y, b.x - cam.x, b.y - cam.y, 22, 8, "#ffe14a", 3.2 * k + 1);
      glow(ctx, b.x - cam.x, b.y - cam.y, 26, "#fff6a0", 0.6 * k);
    }
  },
  trail(ctx, f, cam, t) {
    const k = f.life / 42;
    ctx.globalAlpha = k;
    zig(ctx, f.x1 - cam.x, f.y1 - cam.y, f.x2 - cam.x, f.y2 - cam.y, 16, 10, "#ffe14a", 2.4);
    zig(ctx, f.x1 - cam.x, f.y1 - cam.y + 8, f.x2 - cam.x, f.y2 - cam.y + 8, 12, 8, "#7ecbff", 1.4);
  },
  storm(ctx, f, cam, t) {
    const x = f.x - cam.x, y = f.y - cam.y;
    const fade = Math.min(1, f.life / 15);
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "rgba(160,200,255,.55)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const rx = x - 34 + ((i * 37 + t * 3) % 68), ry = y + 18 + ((t * 9 + i * 23) % 70);
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 8); ctx.stroke();
    }
    for (const b of f.bolts) {
      ctx.globalAlpha = fade * (b.life / 10);
      zig(ctx, b.x - cam.x, b.y1 - cam.y, b.x - cam.x, b.y2 - cam.y, 26, 9, "#ffe14a", 3.5);
    }
    ctx.globalAlpha = fade;
    drawCloud(ctx, x, y, 1, t);
    if (f.next < 5) { glow(ctx, x, y + 8, 40, "#fff6a0", 0.5); }
    ctx.fillStyle = "#ffe14a";
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 2); ctx.lineTo(x + 5, y - 2); ctx.lineTo(x, y + 6); ctx.lineTo(x + 6, y + 6); ctx.lineTo(x - 4, y + 18); ctx.lineTo(x - 1, y + 9); ctx.lineTo(x - 6, y + 9);
    ctx.closePath(); ctx.fill();
  },
  yarn(ctx, f, cam, t, g, p) {
    const h = hand(p);
    const x = f.x - cam.x, y = f.y - cam.y;
    const hx = h.x - cam.x, hy = h.y - cam.y;
    ctx.strokeStyle = "#ffb6e4";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.quadraticCurveTo((hx + x) / 2, Math.max(hy, y) + 18, x, y);
    ctx.stroke();
    glow(ctx, x, y, f.r * 2, "#ff8ad4", 0.4);
    ctx.translate(x, y);
    ctx.rotate(f.rot);
    ctx.fillStyle = "#ff8ad4";
    ctx.beginPath(); ctx.arc(0, 0, f.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#c2408f";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, f.r * 0.9, f.r * 0.35, i * 1.05, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.beginPath(); ctx.arc(-f.r * 0.35, -f.r * 0.35, f.r * 0.25, 0, TAU); ctx.fill();
  },
  purr(ctx, f, cam, t, g, p) {
    const x = cx(p) - cam.x, y = cy(p) - cam.y;
    const u = 1 - f.life / (f.max || 72);
    const rad = Math.min(f.R, 36 + u * f.R);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.18 * (1 - u * 0.35);
    ctx.fillStyle = "#ffb6e4";
    ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fff";
    ctx.beginPath(); ctx.arc(x, y, Math.max(1, rad), 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ff8ad4";
    ctx.beginPath(); ctx.arc(x, y, Math.max(1, rad * 0.62), 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#ffd0ee";
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + t * 0.04;
      const hx = x + Math.cos(a) * rad * 0.92;
      const hy = y + Math.sin(a) * rad * 0.92;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 5);
      ctx.bezierCurveTo(hx - 8, hy - 2, hx - 5, hy - 9, hx, hy - 3);
      ctx.bezierCurveTo(hx + 5, hy - 9, hx + 8, hy - 2, hx, hy + 5);
      ctx.fill();
    }
    ctx.restore();
  },
  zzz(ctx, f, cam, t) {
    ctx.font = "800 14px Outfit,sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(60,20,60,.7)";
    ctx.fillStyle = "#ffd0ee";
    for (const e of f.list) {
      const x = cx(e) - cam.x, y = e.y - cam.y - 8;
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.02 + i / 3) % 1);
        ctx.globalAlpha = Math.sin(ph * Math.PI);
        const zx = x + 6 + ph * 14 + Math.sin(ph * 6) * 3, zy = y - ph * 26;
        ctx.font = "800 " + (10 + ph * 8 | 0) + "px Outfit,sans-serif";
        ctx.strokeText("z", zx, zy);
        ctx.fillText("z", zx, zy);
      }
    }
  },
  wisp: drawWisp,
  breath(ctx, f, cam, t) {
    if (f.x == null) return;
    const x = f.x - cam.x, y = f.y - cam.y;
    const k = Math.min(1, f.life / 6, f.age / 3);
    ctx.globalCompositeOperation = "lighter";
    const n = 16;
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      const px = x + f.f * u * f.len;
      const py = y + Math.sin(t * 0.7 + i * 1.3) * u * 9;
      const r = 5 + u * (18 + f.len * 0.08);
      ctx.globalAlpha = (0.55 - u * 0.3) * k;
      ctx.fillStyle = u < 0.25 ? "#fff3b0" : u < 0.55 ? "#ffb347" : u < 0.8 ? "#ff6a2a" : "#d8301a";
      ctx.beginPath();
      const jitter = 0.85 + 0.3 * deterministicUnit(f.age * 3.17 + i * 7.13 + f.len * 0.019);
      ctx.arc(px, py, r * jitter, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  },
  gust(ctx, f, cam, t) {
    const k = 1 - f.life / 24;
    const x = f.x - cam.x, y = f.y - cam.y;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const d = 30 + k * 180 + i * 34;
      ctx.globalAlpha = (1 - k) * (1 - i * 0.2);
      ctx.strokeStyle = i === 1 ? "#fff" : "#bfefff";
      ctx.lineWidth = 5 - i;
      ctx.beginPath();
      ctx.arc(x + f.f * (d - 40), y, 40 + i * 10, f.f > 0 ? -0.8 : Math.PI - 0.8, f.f > 0 ? 0.8 : Math.PI + 0.8);
      ctx.stroke();
      ctx.beginPath();
      const sx = x + f.f * d * 0.8, sy = y - 20 + i * 20;
      ctx.arc(sx, sy, 8, 0, TAU * 0.75);
      ctx.stroke();
    }
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = "#dff6ff";
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 8, y + 20 + k * 20);
      ctx.lineTo(x + i * 10, y + 40 + k * 50);
      ctx.stroke();
    }
  },
  meteor(ctx, f, cam) {
    const x = f.x - cam.x, y = f.y - cam.y;
    const len = 60;
    const d = Math.hypot(f.vx, f.vy) || 1;
    const gx = x - (f.vx / d) * len, gy = y - (f.vy / d) * len;
    const gr = ctx.createLinearGradient(gx, gy, x, y);
    gr.addColorStop(0, "rgba(255,80,20,0)");
    gr.addColorStop(1, "rgba(255,200,80,.95)");
    ctx.strokeStyle = gr;
    ctx.lineCap = "round";
    ctx.lineWidth = f.r * 1.6;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(x, y); ctx.stroke();
    glow(ctx, x, y, f.r * 3, "#ff8a2a", 0.7);
    ctx.translate(x, y);
    ctx.rotate(f.rot);
    ctx.fillStyle = "#5a2a1a";
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU, rr = f.r * (0.8 + ((i * 37) % 5) / 12);
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#ffb347";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-f.r * 0.4, -f.r * 0.2); ctx.lineTo(f.r * 0.1, f.r * 0.2); ctx.lineTo(f.r * 0.4, -f.r * 0.1); ctx.stroke();
  },
  blast(ctx, f, cam) {
    const k = 1 - f.life / 16;
    const x = f.x - cam.x, y = f.y - cam.y;
    glow(ctx, x, y, f.R * (0.6 + k * 0.6), "#ffb347", 0.8 * (1 - k));
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 6 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(x, y, f.R * (0.3 + k * 0.8), 0, TAU); ctx.stroke();
  },
  quake(ctx, f, cam) {
    for (const s of f.spikes) {
      const u = s.life / 26;
      const hh = s.h * Math.sin(Math.min(1, (1 - u) * 4) * Math.PI / 2) * Math.min(1, u * 3);
      const x = s.x - cam.x, y = s.y - cam.y;
      ctx.fillStyle = "#8a6238";
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 2);
      ctx.lineTo(x + s.lean * hh, y - hh);
      ctx.lineTo(x + 8, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#c8a060";
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + s.lean * hh, y - hh);
      ctx.lineTo(x + 1, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(40,20,5,.8)";
    ctx.lineWidth = 2;
    for (const fr of f.fronts) {
      const x0 = f.ox - cam.x, x1 = fr.x - cam.x, y = fr.y - cam.y + 3;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      const n = Math.max(1, Math.abs(x1 - x0) / 18 | 0);
      for (let i = 1; i <= n; i++) ctx.lineTo(x0 + (x1 - x0) * (i / n), y + ((i * 7) % 5) - 2);
      ctx.stroke();
      if (fr.on) glow(ctx, x1, y - 6, 28, "#ffe0a0", 0.5);
    }
  },
  muzzle(ctx, f, cam, t, g, p) {
    const h = hand(p);
    const k = f.life / 8;
    const x = h.x - cam.x, y = h.y - cam.y;
    ctx.translate(x, y);
    ctx.scale(p.facing, 1);
    ctx.globalAlpha = k;
    ctx.fillStyle = "rgba(255,248,224,.55)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 60 * (1.2 - k * 0.4), -0.42, 0.42);
    ctx.closePath();
    ctx.fill();
    glow(ctx, 6, 0, 18, "#ffffff", k);
  },
  blob(ctx, f, cam) {
    const x = f.x - cam.x, y = f.y - cam.y;
    ctx.fillStyle = "#d42020";
    ctx.beginPath();
    ctx.ellipse(x, y, f.r * 1.05, f.r * (1 + Math.min(0.4, Math.abs(f.vy) * 0.03)), Math.atan2(f.vy, f.vx), 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath(); ctx.arc(x - f.r * 0.35, y - f.r * 0.35, f.r * 0.3, 0, TAU); ctx.fill();
  },
  puddle(ctx, f, cam, t) {
    const half = (f.w / 2) * f.grow;
    const fade = Math.min(1, f.life / 30);
    const x = f.x - cam.x, y = f.y - cam.y + 1;
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#a01414";
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      ctx.lineTo(x - half + u * half * 2, y - 5 - Math.sin(u * Math.PI) * 5 - Math.sin(t * 0.1 + i * 1.7) * 1.2);
    }
    ctx.lineTo(x + half, y + 3);
    ctx.lineTo(x - half, y + 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e23b3b";
    ctx.beginPath(); ctx.ellipse(x, y - 4, half * 0.85, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.beginPath(); ctx.ellipse(x - half * 0.35, y - 6, half * 0.22, 1.5, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.03 + i * 0.37) % 1;
      const bx = x + Math.sin(i * 12.9) * half * 0.7;
      ctx.globalAlpha = fade * (1 - ph);
      ctx.strokeStyle = "#ff7a7a";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(bx, y - 6 - ph * 4, 1.5 + ph * 3, 0, TAU); ctx.stroke();
    }
  },
  geyser(ctx, f, cam, t) {
    const x = f.x - cam.x, y = f.y - cam.y;
    if (f.delay > 0) return;
    if (f.warn > 0) {
      ctx.fillStyle = "rgba(90,60,10,.7)";
      ctx.beginPath(); ctx.ellipse(x, y, 16 + (12 - f.warn), 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ffd36a";
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - 8 + i * 8, y - 2 - ((t + i * 5) % 6), 2, 0, TAU); ctx.fill(); }
      return;
    }
    const h = f.h || 0;
    if (h < 2) return;
    const gr = ctx.createLinearGradient(0, y - h, 0, y);
    gr.addColorStop(0, "rgba(255,245,190,.95)");
    gr.addColorStop(0.4, "rgba(255,211,106,.9)");
    gr.addColorStop(1, "rgba(200,130,20,.9)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(x - 12 - Math.sin(t * 0.5 + u * 6) * 3 - (1 - u) * 6, y - u * h); }
    ctx.quadraticCurveTo(x, y - h - 16, x + 12, y - h);
    for (let i = 8; i >= 0; i--) { const u = i / 8; ctx.lineTo(x + 12 + Math.sin(t * 0.5 + u * 6 + 1) * 3 + (1 - u) * 6, y - u * h); }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(x - 4, y - h + 6, 3, h - 10);
    glow(ctx, x, y - h, 30, "#fff0b0", 0.5);
    ctx.fillStyle = "#ffd36a";
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.5;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * 20, y - h + Math.sin(a) * 14 - ((t * 2 + i * 7) % 10), 3, 0, TAU); ctx.fill();
    }
  },
  disc(ctx, f, cam) {
    const x = f.x - cam.x, y = f.y - cam.y;
    glow(ctx, x, y, f.r * 1.8, "#ff7a4a", 0.35);
    ctx.translate(x, y);
    ctx.rotate(f.rot);
    ctx.fillStyle = "#8e1f12";
    ctx.beginPath(); ctx.arc(0, 0, f.r, 0, TAU); ctx.fill();
    ctx.fillStyle = "#e0402a";
    ctx.beginPath(); ctx.arc(0, 0, f.r * 0.86, 0, TAU); ctx.fill();
    ctx.fillStyle = "#a82818";
    for (const [a, rr] of [[0.3, 0.45], [2.2, 0.5], [4.1, 0.4], [5.4, 0.2], [1.2, 0.15]]) {
      ctx.beginPath(); ctx.arc(Math.cos(a) * f.r * rr, Math.sin(a) * f.r * rr, f.r * 0.14, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.beginPath(); ctx.ellipse(-f.r * 0.3, -f.r * 0.4, f.r * 0.35, f.r * 0.15, -0.5, 0, TAU); ctx.fill();
  },
  cheese(ctx, f, cam, t, g, p) {
    const h = hand(p);
    const x0 = h.x - cam.x, y0 = h.y - cam.y;
    let x1 = f.ax - cam.x, y1 = f.ay - cam.y;
    if (f.miss) { const k = 1 - f.life / 14; x1 = x0 + (x1 - x0) * Math.sin(k * Math.PI); y1 = y0 + (y1 - y0) * Math.sin(k * Math.PI); }
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + 14 + Math.sin(t * 0.4) * 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#c89a1a";
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
    ctx.strokeStyle = "#ffd84a";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = "#fff3a0";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#ffd84a";
    for (let i = 1; i < 4; i++) {
      const u = i / 4;
      const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1;
      const by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
      ctx.beginPath(); ctx.ellipse(bx, by + 5 + ((t + i * 4) % 8) * 0.6, 2.2, 3.2, 0, 0, TAU); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x1, y1, 6, 0, TAU); ctx.fill();
  },
  heat(ctx, f, cam, t) {
    const x = Number.isFinite(f.x) ? f.x - cam.x : -cam.x;
    const y = Number.isFinite(f.y) ? f.y - cam.y : -cam.y;
    const life = Number.isFinite(f.life) ? f.life : 0;
    const maxLife = Number.isFinite(f.maxLife) && f.maxLife > 0 ? f.maxLife : 38;
    const k = Math.max(0, Math.min(1, life / maxLife));
    const rawR = Number.isFinite(f.r) ? f.r : 0;
    const R = Number.isFinite(f.R) ? Math.max(0, f.R) : 0;
    const radius = Math.max(1, rawR || R * Math.min(1, (Number.isFinite(f.age) ? f.age : 0) / 18));
    const gr = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    gr.addColorStop(0, "rgba(255,200,90,0)");
    gr.addColorStop(0.75, "rgba(255,140,40," + 0.25 * k + ")");
    gr.addColorStop(1, "rgba(255,90,20," + 0.5 * k + ")");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill();
    ctx.globalAlpha = k;
    ctx.strokeStyle = "#ffcf6a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * TAU;
      const rr = radius + Math.sin(a * 8 + t * 0.6) * 5;
      if (i === 0) ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.stroke();
  },
  slice(ctx, f, cam) {
    ctx.translate(f.x - cam.x, f.y - cam.y);
    ctx.rotate(f.rot);
    drawSlice(ctx, 1);
  },
  ofuda(ctx, f, cam) {
    ctx.save();
    ctx.translate(f.x - cam.x, f.y - cam.y);
    ctx.rotate(f.stuck ? 0.2 : Math.atan2(f.vy, f.vx || 1));
    ctx.fillStyle = "#f4ead2";
    ctx.fillRect(-8, -12, 16, 24);
    ctx.strokeStyle = "#c23a3a";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-8, -12, 16, 24);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.stroke();
    ctx.restore();
  },
  sleeve(ctx, f, cam, t, g, p) {
    if (!p) return;
    const x = cx(p) - cam.x, y = cy(p) - cam.y;
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#b9a6ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 40 + (18 - f.life) * 6, (p.facing || 1) > 0 ? -0.8 : Math.PI - 0.8, (p.facing || 1) > 0 ? 0.8 : Math.PI + 0.8);
    ctx.stroke();
    ctx.globalAlpha = 1;
  },
  maw(ctx, f, cam, t, g, p) {
    if (!p) return;
    const x = cx(p) - cam.x + (f.face || 1) * 36;
    const y = cy(p) - cam.y;
    const k = 1 - f.life / f.max;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#1a0410";
    ctx.beginPath();
    ctx.ellipse(x, y, 18 + k * 28, 10 + k * 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff4466";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  },
  jaws(ctx, f, cam, t, g, p) {
    if (!p) return;
    const k = Math.min(1, 1 - f.life / 14);
    const snap = Math.sin(k * Math.PI);
    const gap = 5 + snap * (f.size || 28);
    const reach = f.reach || 48;
    const x = cx(p) - cam.x + (p.facing || 1) * (p.w * 0.72);
    const y = p.y + p.h * 0.4 - cam.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(p.facing || 1, 1);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#24140c";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(reach * 0.85, -gap);
    ctx.lineTo(reach * 0.85, gap);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8ee07a";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(2, -3);
    ctx.lineTo(reach * 0.8, -gap);
    ctx.moveTo(2, 3);
    ctx.lineTo(reach * 0.8, gap);
    ctx.stroke();
    ctx.fillStyle = "#f4fff0";
    for (let i = 0; i < 3; i++) {
      const tx = reach * (0.35 + i * 0.16);
      ctx.beginPath();
      ctx.moveTo(tx, -gap * 0.82);
      ctx.lineTo(tx + 6, -gap * 0.35);
      ctx.lineTo(tx - 3, -gap * 0.45);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx, gap * 0.82);
      ctx.lineTo(tx + 6, gap * 0.35);
      ctx.lineTo(tx - 3, gap * 0.45);
      ctx.fill();
    }
    ctx.restore();
  },
};

// ---------------------------------------------------------------------------
// Dibujo de proyectiles/cortes/rayos genéricos (usados por game.js)
// ---------------------------------------------------------------------------
export function drawProjectile(ctx, pr, cam, t) {
  const x = pr.x - cam.x + pr.w / 2;
  const y = pr.y - cam.y + pr.h / 2;
  ctx.save();
  if ((pr.vx || pr.vy) && pr.shape !== "salt") {
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = pr.color || "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - (pr.vx || 0) * 3.4, y - (pr.vy || 0) * 3.4);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.translate(x, y);
  const ang = Math.atan2(pr.vy || 0, pr.vx || 1);
  if (pr.spin) ctx.rotate(t * 0.22 + (pr.rot || 0));
  else ctx.rotate(ang);
  ctx.fillStyle = pr.color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.4;
  const shape = pr.shape || "orb";
  const w = pr.w;
  const h = pr.h;
  if (shape === "salt") {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(0, 0, w, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = pr.color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "rgba(160,140,100,.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w / 3, h / 3);
    ctx.restore();
    return;
  }
  const vfxName = shape === "flame" ? "vfx-flame" : shape === "note" ? "vfx-note" : null;
  const vfx = vfxName ? vfxSprite(vfxName) : null;
  if (vfx) {
    const s = Math.max(w, h) * 2.1;
    ctx.drawImage(vfx, -s / 2, -s / 2, s, s);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(w, h) * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (shape === "note") {
    drawNoteGlyph(ctx, 1, pr.color);
  } else if (shape === "bone") {
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h * 0.16);
    ctx.bezierCurveTo(-w * 0.62, -h * 0.52, -w * 0.64, -h * 0.08, -w * 0.34, 0);
    ctx.lineTo(w * 0.34, 0);
    ctx.bezierCurveTo(w * 0.64, -h * 0.08, w * 0.62, -h * 0.52, w * 0.28, -h * 0.16);
    ctx.lineTo(w * 0.28, h * 0.16);
    ctx.bezierCurveTo(w * 0.62, h * 0.52, w * 0.64, h * 0.08, w * 0.34, 0);
    ctx.lineTo(-w * 0.34, 0);
    ctx.bezierCurveTo(-w * 0.64, h * 0.08, -w * 0.62, h * 0.52, -w * 0.28, h * 0.16);
    ctx.closePath();
    ctx.fillStyle = pr.color || "#e8ffe0";
    ctx.strokeStyle = "#53634a";
    ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-w * 0.18, -h * 0.04); ctx.lineTo(w * 0.2, -h * 0.04); ctx.stroke();
  } else if (shape === "bolt") {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w / 4, 0);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-w / 6, 0);
    ctx.lineTo(w / 3, -h / 5);
    ctx.lineTo(w / 8, 0);
    ctx.lineTo(w / 3, h / 5);
    ctx.fill();
  } else if (shape === "zap") {
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = pr.color;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(-w / 6, -h / 2);
    ctx.lineTo(w / 8, h / 3);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (shape === "flame") {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(0, -h, w / 2, 0);
    ctx.quadraticCurveTo(0, h * 0.55, -w / 2, 0);
    ctx.fill();
    ctx.fillStyle = "#ffe36a";
    ctx.beginPath();
    ctx.moveTo(-w / 5, 0);
    ctx.quadraticCurveTo(0, -h * 0.45, w / 4, 0);
    ctx.fill();
  } else if (shape === "ring") {
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.strokeStyle = pr.color;
    ctx.stroke();
    ctx.fillStyle = pr.color;
    for (let i = 0; i < 6; i++) {
      const a = i * (Math.PI / 3) + t * 0.1;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * w / 2, Math.sin(a) * w / 2, 2.4, 4, a, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (shape === "claw") {
    ctx.lineCap = "round";
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = pr.color;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-8, i * 7);
      ctx.quadraticCurveTo(4, i * 3, 14, i * 8);
      ctx.stroke();
    }
  } else if (shape === "yarn") {
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, w / 3, 0, Math.PI * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1, -1, w / 5, 0.4, Math.PI * 1.8);
    ctx.stroke();
  } else if (shape === "heart") {
    ctx.beginPath();
    ctx.moveTo(0, h / 3);
    ctx.bezierCurveTo(-w / 2, -h / 6, -w / 3, -h / 2, 0, -h / 6);
    ctx.bezierCurveTo(w / 3, -h / 2, w / 2, -h / 6, 0, h / 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(-w / 6, -h / 8, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "leaf") {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(0, -h, w / 2, 0);
    ctx.quadraticCurveTo(0, h, -w / 2, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.beginPath();
    ctx.moveTo(-w / 4, 0);
    ctx.lineTo(w / 4, 0);
    ctx.stroke();
  } else if (shape === "crescent") {
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, -0.9, 0.9);
    ctx.arc(6, 0, w / 3, 1.1, -1.1, true);
    ctx.closePath();
    ctx.fill();
  } else if (shape === "wind") {
    ctx.lineWidth = 3;
    ctx.strokeStyle = pr.color;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, -0.8, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-4, 2, w / 3, -0.6, 0.6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(5, w / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(-2, -2, Math.max(2, w / 5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(2, Math.min(w, h) * 0.18), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function swingArc(ctx, r, a0, a1, width, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(8, r), a0, a1);
  ctx.stroke();
  ctx.restore();
}

export function drawSlash(ctx, s, cam) {
  const k = Math.max(0.001, s.life / s.max);
  const open = 1 - k;
  const fade = k < 0.28 ? k / 0.28 : 1;
  const x = s.x - cam.x;
  const y = s.y - cam.y;
  const reach = Math.max(58, (s.w || 72) * 1.28);
  const kind = s.kind || "slice";
  const col = s.color || "#fff";
  const a0 = -1.2;
  const a1 = a0 + Math.max(0.35, open) * 2.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s.facing || 1, 1);

  if (kind === "claws") {
    for (let i = 0; i < 3; i++) {
      const rr = reach * (0.58 + i * 0.16);
      swingArc(ctx, rr, a0, a1, 9 - i, col, 0.28 * fade);
      swingArc(ctx, rr, a0, a1, 3.4, "#f7fbff", 0.95 * fade);
    }
  } else if (kind === "spark") {
    swingArc(ctx, reach * 0.82, a0, a1, 14, col, 0.22 * fade);
    ctx.save();
    ctx.globalAlpha = 0.95 * fade;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const ang = a0 + (a1 - a0) * u;
      const jag = (i % 2 ? 1 : -1) * reach * 0.14;
      const px = Math.cos(ang) * (reach * 0.74) + Math.cos(ang + 1.2) * jag;
      const py = Math.sin(ang) * (reach * 0.74) + Math.sin(ang + 1.2) * jag;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = "#fffbe8";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  } else if (kind === "paw") {
    swingArc(ctx, reach * 0.8, a0, a1, 18, col, 0.32 * fade);
    swingArc(ctx, reach * 0.8, a0, a1, 7, "#fff", 0.92 * fade);
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.rotate(a1);
      ctx.translate(reach * 0.8, i * 9);
      ctx.globalAlpha = fade;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 3.4, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (kind === "flame") {
    swingArc(ctx, reach * 0.72, a0, a1, 20, "#ff5a1f", 0.34 * fade);
    swingArc(ctx, reach * 0.72, a0, a1, 8, "#ffe14a", 0.95 * fade);
    for (let i = 1; i <= 5; i++) {
      const ang = a0 + (a1 - a0) * (i / 5);
      ctx.save();
      ctx.translate(Math.cos(ang) * reach * 0.72, Math.sin(ang) * reach * 0.72);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.9 * fade;
      ctx.fillStyle = i % 2 ? "#ff7a32" : "#fff0a0";
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.quadraticCurveTo(10, -9, 18, 0);
      ctx.quadraticCurveTo(10, 8, -2, 0);
      ctx.fill();
      ctx.restore();
    }
  } else if (kind === "bite") {
    const snap = 1 - open;
    const gap = 0.12 + snap * 0.9;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#2a120c";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(reach * 0.7, -gap * reach * 0.4);
    ctx.lineTo(reach * 0.7, gap * reach * 0.4);
    ctx.closePath();
    ctx.fill();
    const jaw = (sign) => {
      ctx.beginPath();
      ctx.moveTo(6, sign * 3);
      ctx.lineTo(reach * 0.82, sign * (4 + gap * reach * 0.36));
      ctx.quadraticCurveTo(reach * 0.5, sign * (gap * reach * 0.12), reach * 0.2, sign * 2);
      ctx.closePath();
      ctx.fillStyle = "#3f8f3a";
      ctx.fill();
      ctx.strokeStyle = "#1d4a22";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#f4fff0";
      for (let i = 0; i < 4; i++) {
        const u = 0.32 + i * 0.14;
        const px = reach * 0.78 * u;
        const py = sign * (3 + gap * reach * 0.32 * u);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 7, py + sign * 8);
        ctx.lineTo(px - 4, py + sign * 2);
        ctx.fill();
      }
    };
    jaw(-1);
    jaw(1);
    ctx.restore();
  } else if (kind === "slice") {
    const len = reach * (0.32 + open * 0.72);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(0, 6);
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(len, -2);
    ctx.lineTo(len + 14, 0);
    ctx.lineTo(len, 2);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e23b3b";
    ctx.fillRect(8, -2.2, Math.max(8, len * 0.7), 4.4);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) ctx.fillRect(14 + i * (len / 6), (i % 2 ? 5 : -8), 3, 3);
    ctx.restore();
  } else if (kind === "wedge") {
    const len = reach * (0.42 + open * 0.55);
    ctx.save();
    ctx.globalAlpha = 0.96 * fade;
    ctx.rotate(-0.2 + open * 0.4);
    ctx.fillStyle = "#c45a12";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, len, -0.48, 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd36a";
    ctx.beginPath();
    ctx.moveTo(len * 0.16, 0);
    ctx.arc(0, 0, len * 0.82, -0.36, 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe9a8";
    ctx.beginPath();
    ctx.moveTo(len * 0.28, 0);
    ctx.arc(0, 0, len * 0.62, -0.28, 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e23b3d";
    ctx.beginPath();
    ctx.arc(len * 0.5, -len * 0.08, 5.5, 0, Math.PI * 2);
    ctx.arc(len * 0.66, len * 0.1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffe9a8";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(len * 0.72, len * 0.16);
    ctx.quadraticCurveTo(len * 0.64, len * 0.36, len * 0.76, len * 0.3 + open * 10);
    ctx.stroke();
    ctx.restore();
  } else if (kind === "fang") {
    const snap = 1 - open;
    const gap = 7 + snap * 24;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#14040c";
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(reach * 0.72, -gap);
    ctx.lineTo(reach * 0.72, gap);
    ctx.closePath();
    ctx.fill();
    const fang = (sign) => {
      ctx.fillStyle = "#ff4466";
      ctx.beginPath();
      ctx.moveTo(6, sign * 2);
      ctx.lineTo(reach * 0.5, sign * gap);
      ctx.lineTo(reach * 0.86, sign * gap * 0.12);
      ctx.lineTo(reach * 0.38, sign * 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff4f0";
      ctx.beginPath();
      ctx.moveTo(reach * 0.48, sign * gap * 0.82);
      ctx.lineTo(reach * 0.74, sign * gap * 0.18);
      ctx.lineTo(reach * 0.42, sign * gap * 0.12);
      ctx.fill();
    };
    fang(-1);
    fang(1);
    ctx.restore();
  } else if (kind === "fan") {
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#ff6a2a";
    for (let i = 0; i < 4; i++) {
      const ang = a0 + (a1 - a0) * (0.2 + i * 0.2);
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(Math.cos(ang) * reach * 0.6, Math.sin(ang) * reach * 0.6, Math.cos(ang) * reach, Math.sin(ang) * reach);
      ctx.quadraticCurveTo(Math.cos(ang) * reach * 0.7, Math.sin(ang) * reach * 0.4, 8, 0);
      ctx.fill();
    }
    ctx.restore();
  } else if (kind === "zap") {
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "#ffe14a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.lineTo(reach * 0.4, -16);
    ctx.lineTo(reach * 0.45, 2);
    ctx.lineTo(reach * 0.9, 8);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  } else if (kind === "leaf") {
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#7dce6a";
    ctx.strokeStyle = "#245522";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ang = a0 + (a1 - a0) * (0.3 + i * 0.25);
      ctx.beginPath();
      ctx.ellipse(Math.cos(ang) * reach * 0.7, Math.sin(ang) * reach * 0.7, 8, 16, ang, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  } else if (kind === "poke") {
    const len = reach * (0.28 + open * 0.78);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = col;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.strokeStyle = "#fffef6";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff6c8";
    ctx.beginPath();
    ctx.moveTo(len + 12, 0);
    ctx.lineTo(len - 4, -7);
    ctx.lineTo(len - 4, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    swingArc(ctx, reach * 0.8, a0, a1, 14, col, 0.3 * fade);
    swingArc(ctx, reach * 0.8, a0, a1, 4.5, "#fff", fade);
    ctx.save();
    ctx.translate(Math.cos(a1) * reach * 0.8, Math.sin(a1) * reach * 0.8);
    ctx.rotate(a1);
    ctx.globalAlpha = fade;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(0, 5, 9, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(7, 2);
    ctx.lineTo(7, -18);
    ctx.quadraticCurveTo(20, -20, 18, -6);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 0.45 * fade;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(reach * 0.45, 0, 10 + open * 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawBolt(ctx, b, cam, t) {
  const x1 = b.x1 - cam.x;
  const y1 = b.y1 - cam.y;
  const x2 = b.x2 - cam.x;
  const y2 = b.y2 - cam.y;
  const k = b.life / 14;
  const seed = ((b.x1 || 0) * 13 + (b.y1 || 0) * 7 + (b.life || 0) * 17) | 0;
  ctx.save();
  ctx.globalAlpha = Math.max(0.3, Math.min(1, k));
  ctx.lineWidth = 5 * Math.min(1, k);
  ctx.strokeStyle = "#fffde0";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segs = 7;
  for (let i = 1; i <= segs; i++) {
    const u = i / segs;
    const n = Math.sin(seed * 0.17 + i * 2.3);
    const j = (i < segs ? n : 0) * 9;
    ctx.lineTo(x1 + (x2 - x1) * u + j, y1 + (y2 - y1) * u - j * 0.6);
  }
  ctx.stroke();
  ctx.strokeStyle = "#7ecbff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}