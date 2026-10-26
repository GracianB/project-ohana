import {drawQuimeraCreature} from './quimera-art.js';
// Four-phase final boss: combat remains deterministic; V600.1 anatomy is
// authored separately from attack physics, health and collision.
import { WORLD1_ARENA, WORLD1_FLOOR, WORLD1_THEMES } from "./world1-rooms.js";
import { FUSION_STORY } from "./world1-story.js";

export const FUSION_BOSS_ID = "w1-final-quimera";
export const FUSION_BOSS = Object.freeze({ hp: 2800, w: 230, h: 290, maxShots: 90, intro: 260 });
// Umbrales de fase: 1 → 2 (70 %), 2 → 3 (45 %), 3 → 4 (20 %).
export const FUSION_PHASES = Object.freeze([0.70, 0.45, 0.20]);
// Ataques por fase (cada uno pertenece a un héroe).
export const FUSION_ATTACKS = Object.freeze({
  ola:       { hero: "kilo",    name: "Ola del ukelele",     warn: 40 },
  plasma:    { hero: "stitcho", name: "Plasma cosido",       warn: 34 },
  rayos:     { hero: "chispin", name: "Rayos en cadena",     warn: 55 },
  medusas:   { hero: "cat",     name: "Lluvia de medusas",   warn: 40 },
  embestida: { hero: "cuerno",  name: "Embestida prisma",    warn: 50 },
  aliento:   { hero: "dragon",  name: "Aliento del hogar",   warn: 42 },
  terremoto: { hero: "dino",    name: "Terremoto fósil",     warn: 48 },
  geiseres:  { hero: "frita",   name: "Géiseres de aceite",  warn: 56 },
  ruedas:    { hero: "pizza",   name: "Ruedas de pizza",     warn: 36 },
  red:       { hero: "yomi",    name: "Red neuronal",        warn: 60 }
});
export const FUSION_PHASE_ATTACKS = Object.freeze({
  1: ["ola", "plasma", "rayos"],
  2: ["ola", "plasma", "rayos", "medusas", "embestida", "aliento"],
  3: ["rayos", "medusas", "embestida", "aliento", "terremoto", "geiseres", "ruedas"],
  4: ["plasma", "rayos", "aliento", "terremoto", "geiseres", "ruedas", "red", "medusas", "embestida", "ola"]
});
export const FUSION_SPECIALS = Object.freeze({
  2: { id: "eco",      name: FUSION_STORY.phases[2].name, line: FUSION_STORY.phases[2].line, length: 330 },
  3: { id: "erupcion", name: FUSION_STORY.phases[3].name, line: FUSION_STORY.phases[3].line, length: 360 },
  4: { id: "rota",     name: FUSION_STORY.phases[4].name, line: FUSION_STORY.phases[4].line, length: 420 }
});

function lcg(b) { b.seed = (Math.imul(b.seed >>> 0, 1664525) + 1013904223) >>> 0; return b.seed / 4294967296; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pcx = (p) => p.x + p.w / 2, pcy = (p) => p.y + p.h / 2;

export function createFusionBoss(seed = 467) {
  const A = WORLD1_ARENA, B = FUSION_BOSS;
  const x = Math.round((A.left + A.right) / 2 + 600);
  return {
    x, y: WORLD1_FLOOR - B.h, w: B.w, h: B.h, vx: 0, vy: 0,
    hp: B.hp, max: B.hp, kind: "boss", color: "#ffd6f2",
    boss: true, _fusionBoss: true, bossName: "QUIMERA OHANA", maxPhase: 4,
    phase: 1, facing: -1, contactDmg: 0, telegraph: false, teleKind: "",
    dying: 0, dyingMax: 150, invuln: 0, flash: 0, roomId: "w1-final",
    _campaignOriginal: true, spawnIndex: 999, _encounterSaveId: FUSION_BOSS_ID,
    _fusion: { seed: seed >>> 0, mode: "intro", clock: B.intro, introMax: B.intro, attack: null, step: 0, rest: 0, special: null, shots: [], hover: 0, last: "", announced: { 2: false, 3: false, 4: false }, combo: 0, aim: -1, tick: 0, used: {} }
  };
}

export function fusionPhaseFor(hp, max) {
  const k = hp / Math.max(1, max);
  return k > FUSION_PHASES[0] ? 1 : k > FUSION_PHASES[1] ? 2 : k > FUSION_PHASES[2] ? 3 : 4;
}

function pushShot(b, s) {
  if (b.shots.length >= FUSION_BOSS.maxShots) return;
  // A projectile keeps its source after the boss returns to rest or starts
  // another attack. The HUD/damage label must describe the projectile that hit.
  const source = b.mode === "special"
    ? b.special?.name || "QUIMERA OHANA"
    : FUSION_ATTACKS[b.attack]?.name || "QUIMERA OHANA";
  b.shots.push({ ...s, source });
}

function chooseAttack(e, b) {
  const pool = FUSION_PHASE_ATTACKS[e.phase];
  let pick = pool[Math.floor(lcg(b) * pool.length)];
  if (pick === b.last) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  b.last = pick; b.used[pick] = (b.used[pick] || 0) + 1;
  return pick;
}

function startAttack(e, b, p) {
  const id = chooseAttack(e, b);
  b.attack = id; b.mode = "warn"; b.clock = Math.round(FUSION_ATTACKS[id].warn * (e.phase >= 4 ? .75 : 1)); b.step = 0;
  b.aim = Math.sign(pcx(p) - (e.x + e.w / 2)) || -1; e.facing = b.aim;
  e.telegraph = true; e.teleKind = "";
  b.marks = [];
  const A = WORLD1_ARENA;
  if (id === "rayos") for (let i = -1; i <= 1; i++) b.marks.push(clamp(pcx(p) + i * 170 * (e.phase >= 3 ? 1.2 : 1), A.left + 40, A.right - 40));
  if (id === "geiseres") for (let i = 0; i < 4; i++) b.marks.push(clamp(pcx(p) + (i - 1.5) * 260 + (lcg(b) - .5) * 60, A.left + 60, A.right - 60));
  if (id === "red") { b.marks = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.marks.push({ x: pcx(p) + Math.cos(a) * 240, y: pcy(p) + Math.sin(a) * 150 }); } }
}

export function updateFusionBoss(e, g, helpers = {}) {
  if (!e?._fusionBoss) return false;
  const b = e._fusion, p = g.player, hurt = helpers.hurtPlayer || (() => {}), A = WORLD1_ARENA;
  b.tick++;
  if (e.flash > 0) e.flash--;
  e.vx = 0; e.vy = 0;
  // Do not inflict one last projectile hit after the killing blow.
  // The boss director handles its defeat animation in the following tick.
  if (e.hp <= 0) { b.shots.length = 0; return true; }
  if (!p || p.dead) return true;
  updateShots(e, b, g, hurt);
  // Cambio de fase → movimiento especial cinemático (invulnerable mientras dura).
  const phase = fusionPhaseFor(e.hp, e.max);
  if (phase > e.phase && b.mode !== "special") {
    e.phase = phase;
    if (!b.announced[phase]) { b.announced[phase] = true; startSpecial(e, b, g, phase, helpers); }
  }
  if (b.mode === "intro" || b.mode === "special") e.invuln = Math.max(e.invuln || 0, 2);
  e.vulnerable = b.mode === "rest";
  b.hover = Math.sin(b.tick * .04) * 8;
  e.x = clamp(e.x, A.left, A.right - e.w);
  e.y = WORLD1_FLOOR - e.h + (b.mode === "leap" ? -Math.sin(Math.PI * clamp(b.clock / 50, 0, 1)) * 260 : 0);
  if (b.mode === "intro") {
    if (--b.clock <= 0) { b.mode = "rest"; b.rest = 40; e.telegraph = false; helpers.showBossMessage?.("QUIMERA OHANA", "Diez voces en un solo cuerpo. Golpéala entre ataques: cada fase libera un movimiento especial."); }
    return true;
  }
  if (b.mode === "special") { updateSpecial(e, b, g, hurt, helpers); return true; }
  if (b.mode === "rest") {
    e.telegraph = false;
    // Se recoloca despacio hacia el jugador, sin arrollarlo.
    const dx = pcx(p) - (e.x + e.w / 2);
    if (Math.abs(dx) > 420) e.x += Math.sign(dx) * (e.phase >= 3 ? 2.6 : 1.8);
    e.facing = Math.sign(dx) || e.facing;
    if (--b.rest <= 0) startAttack(e, b, p);
    return true;
  }
  if (b.mode === "warn") { if (--b.clock <= 0) { b.mode = "attack"; b.clock = 0; e.telegraph = false; fireAttack(e, b, g, p); } return true; }
  if (b.mode === "attack" || b.mode === "leap" || b.mode === "charge") { tickAttack(e, b, g, p, hurt); return true; }
  return true;
}

function finishAttack(e, b) {
  b.mode = "rest"; b.attack = null;
  // En fase 4 encadena dos ataques de cada tres.
  b.combo = (b.combo + 1) % 3;
  b.rest = e.phase >= 4 && b.combo ? 22 : [0, 70, 58, 48, 40][e.phase];
}

function fireAttack(e, b, g, p) {
  const ex = e.x + e.w / 2, ey = e.y + e.h * .35, A = WORLD1_ARENA, col = WORLD1_THEMES[FUSION_ATTACKS[b.attack].hero].color;
  switch (b.attack) {
    case "ola": for (let i = 0; i < 3; i++) for (const d of [-1, 1]) pushShot(b, { k: "ring", x: ex, y: WORLD1_FLOOR - 30, vx: d * (4 + i * 1.2), vy: 0, r: 22, life: 200 + i * 20, delay: i * 18, dmg: 12, col }); break;
    case "plasma": for (let i = -1; i <= 1; i++) { const dx = pcx(p) - ex, dy = pcy(p) - ey, a = Math.atan2(dy, dx) + i * .22; pushShot(b, { k: "orb", x: ex, y: ey, vx: Math.cos(a) * 6.5, vy: Math.sin(a) * 6.5, r: 14, life: 160, dmg: 13, col }); } break;
    case "rayos": for (const x of b.marks) pushShot(b, { k: "bolt", x, y: 0, vx: 0, vy: 0, r: 34, life: 26, dmg: 18, col }); break;
    case "medusas": for (let i = 0; i < 7; i++) pushShot(b, { k: "jelly", x: clamp(pcx(p) + (i - 3) * 150, A.left, A.right), y: 120 - i * 40, vx: 0, vy: 2.4, r: 20, life: 520, dmg: 12, col }); break;
    case "embestida": b.mode = "charge"; b.clock = 0; b.chargeDir = b.aim; break;
    case "aliento": for (let i = 0; i < 8; i++) { const a = (b.aim > 0 ? 0 : Math.PI) + (i - 3.5) * .11 * b.aim; pushShot(b, { k: "fire", x: ex + b.aim * 90, y: e.y + e.h * .3, vx: Math.cos(a) * (6 + i * .2), vy: Math.sin(a) * 2.2 + .6, r: 16, life: 130, delay: i * 4, dmg: 14, col }); } break;
    case "terremoto": b.mode = "leap"; b.clock = 50; b.leapTarget = clamp(pcx(p) - e.w / 2, A.left, A.right - e.w); b.leapFrom = e.x; break;
    case "geiseres": for (const x of b.marks) pushShot(b, { k: "geyser", x, y: WORLD1_FLOOR, vx: 0, vy: 0, r: 34, life: 60, dmg: 16, col }); break;
    case "ruedas": for (let i = 0; i < 3; i++) pushShot(b, { k: "wheel", x: ex, y: WORLD1_FLOOR - 40, vx: b.aim * (4.5 + i * 1.3), vy: -6 - i * 2, r: 28, life: 320, delay: i * 14, dmg: 13, col, bounce: true }); break;
    case "red": for (const m of b.marks) pushShot(b, { k: "node", x: m.x, y: m.y, tx: pcx(p), ty: pcy(p), vx: 0, vy: 0, r: 16, life: 90, dmg: 15, col }); break;
  }
  if (b.mode === "attack") { b.clock = 30; }
}

function tickAttack(e, b, g, p, hurt) {
  const A = WORLD1_ARENA;
  if (b.mode === "charge") {
    e.x += b.chargeDir * (e.phase >= 4 ? 15 : 12);
    if (Math.abs(pcx(p) - (e.x + e.w / 2)) < e.w * .45 && p.y + p.h > e.y + e.h * .45) hurt(20, "EMBESTIDA");
    if (e.x <= A.left || e.x >= A.right - e.w) { g.shake = Math.max(g.shake || 0, g.reduceMotion ? 2 : 14); finishAttack(e, b); }
    return;
  }
  if (b.mode === "leap") {
    b.clock--; const k = 1 - b.clock / 50;
    e.x = b.leapFrom + (b.leapTarget - b.leapFrom) * k;
    if (b.clock <= 0) {
      g.shake = Math.max(g.shake || 0, g.reduceMotion ? 3 : 20);
      for (const d of [-1, 1]) pushShot(b, { k: "wave", x: e.x + e.w / 2, y: WORLD1_FLOOR - 18, vx: d * 7, vy: 0, r: 26, life: 140, dmg: 16, col: WORLD1_THEMES.dino.color });
      if (Math.abs(pcx(p) - (e.x + e.w / 2)) < e.w * .6 && p.grounded) hurt(18, "TERREMOTO");
      finishAttack(e, b);
    }
    return;
  }
  if (--b.clock <= 0) finishAttack(e, b);
}

function updateShots(e, b, g, hurt) {
  const p = g.player, A = WORLD1_ARENA;
  for (const s of b.shots) {
    if (s.delay > 0) { s.delay--; continue; }
    s.life--; s.age = (s.age || 0) + 1;
    if (s.k === "node") { const k = clamp(s.age / 70, 0, 1); s.x += (s.tx - s.x) * .05 * k; s.y += (s.ty - s.y) * .05 * k; }
    else { s.x += s.vx; s.y += s.vy; }
    if (s.k === "wheel") { s.vy += .35; if (s.y > WORLD1_FLOOR - s.r) { s.y = WORLD1_FLOOR - s.r; s.vy = -Math.abs(s.vy) * .78; } }
    if (s.k === "fire") s.vy += .05;
    if (s.x < A.left - 300 || s.x > A.right + 300) s.life = 0;
    if (!p || p.dead || s.hit) continue;
    let hit = false;
    if (s.k === "bolt") hit = s.life < 18 && Math.abs(pcx(p) - s.x) < s.r;
    else if (s.k === "geyser") hit = s.life < 44 && Math.abs(pcx(p) - s.x) < s.r && p.y + p.h > WORLD1_FLOOR - 340;
    else if (s.k === "wave" || s.k === "ring") hit = Math.abs(pcx(p) - s.x) < s.r && p.y + p.h > WORLD1_FLOOR - (s.k === "wave" ? 30 : 46);
    else if (s.k === "beam") hit = s.life < s.liveFor && Math.abs((p.y + p.h - s.band) ) < 40 && p.x + p.w > A.left;
    else if (s.k === "echo") hit = Math.abs(pcx(p) - s.x) < 36 && Math.abs(pcy(p) - s.y) < 40;
    else hit = Math.hypot(pcx(p) - s.x, pcy(p) - s.y) < s.r + Math.min(p.w, p.h) * .45;
    if (hit) { s.hit = s.k !== "bolt" && s.k !== "geyser" && s.k !== "beam"; hurt(s.dmg, s.source || FUSION_ATTACKS[b.attack]?.name || "QUIMERA"); if (s.k === "bolt" || s.k === "geyser" || s.k === "beam") s.life = Math.min(s.life, 1); }
  }
  b.shots = b.shots.filter((s) => s.life > 0 && !s.hit);
}

// ── Movimientos especiales con cinemática ───────────────────────────────────
function startSpecial(e, b, g, phase, helpers) {
  const sp = FUSION_SPECIALS[phase];
  b.mode = "special"; b.special = { id: sp.id, name: sp.name, line: sp.line, t: 0, length: g.reduceMotion ? Math.round(sp.length * .7) : sp.length, phase };
  b.shots = b.shots.filter((s) => s.k !== "beam");
  e.telegraph = true;
  g.flash = Math.max(g.flash || 0, g.reduceMotion ? 3 : 14); g.flashColor = "#fff0f8";
  g.shake = Math.max(g.shake || 0, g.reduceMotion ? 0 : 10);
  g.storyLine = sp.line;
  helpers.showBossMessage?.(sp.name, sp.line);
  helpers.beep?.("alert");
  g.onFusionSpecial?.(sp.id, phase);
}

function updateSpecial(e, b, g, hurt, helpers) {
  const s = b.special, A = WORLD1_ARENA, p = g.player;
  s.t++;
  const T = s.t, mid = (A.left + A.right) / 2;
  if (s.id === "eco" && T > 70 && T < 280 && T % 21 === 0) {
    // Diez meteoritos con el color de cada héroe; uno de cada dos sobre el jugador.
    const i = Math.floor((T - 70) / 21), hero = Object.keys(WORLD1_THEMES)[i % 10];
    const x = i % 2 ? pcx(p) : A.left + 200 + ((i * 397) % (A.right - A.left - 400));
    pushShot(b, { k: "meteor", x, y: -60, vx: 0, vy: 9, r: 26, life: 150, dmg: 14, col: WORLD1_THEMES[hero].color });
  }
  if (s.id === "erupcion") {
    // Barrido a dos alturas: primero a ras de suelo (salta), después alto (quédate abajo).
    if (T === 80) pushShot(b, { k: "beam", x: mid, y: WORLD1_FLOOR - 20, band: WORLD1_FLOOR, vx: 0, vy: 0, r: 0, life: 100, liveFor: 50, dmg: 18, col: "#ff9d4a" });
    if (T === 210) pushShot(b, { k: "beam", x: mid, y: WORLD1_FLOOR - 150, band: WORLD1_FLOOR - 130, vx: 0, vy: 0, r: 0, life: 100, liveFor: 50, dmg: 18, col: "#8fe9ff" });
    if (T > 120 && T < 330 && T % 40 === 0) pushShot(b, { k: "geyser", x: clamp(A.left + 300 + ((T * 211) % (A.right - A.left - 600)), A.left, A.right), y: WORLD1_FLOOR, vx: 0, vy: 0, r: 30, life: 60, dmg: 14, col: "#ffd65a" });
  }
  if (s.id === "rota" && T > 80 && T < 380 && T % 30 === 0) {
    // Los diez ecos se separan y cruzan la arena de uno en uno, alto o bajo.
    const i = Math.floor((T - 80) / 30), hero = Object.keys(WORLD1_THEMES)[i % 10], dir = i % 2 ? 1 : -1;
    pushShot(b, { k: "echo", hero, x: dir > 0 ? A.left - 120 : A.right + 120, y: i % 3 === 2 ? WORLD1_FLOOR - 170 : WORLD1_FLOOR - 30, vx: dir * 13, vy: 0, r: 30, life: 220, dmg: 15, col: WORLD1_THEMES[hero].color });
  }
  if (T >= s.length) { b.mode = "rest"; b.rest = 50; b.special = null; e.telegraph = false; g.storyLine = ""; }
}

export function fusionBossSnapshot(e) {
  if (!e?._fusionBoss) return null;
  const b = e._fusion;
  return { hp: e.hp, max: e.max, phase: e.phase, mode: b.mode, attack: b.attack, special: b.special?.id || null, shots: b.shots.length, used: { ...b.used } };
}

// ── Dibujo ──────────────────────────────────────────────────────────────────
export function drawFusionBoss(ctx, e, cam, t, reduce = false) {
  if (!e?._fusionBoss) return;
  const b = e._fusion, x = e.x - cam.x + e.w / 2, foot = e.y - cam.y + e.h, f = e.facing || -1;
  const tt = reduce ? 0 : t, breathe = reduce ? 0 : Math.sin(tt * .05) * 4, hov = reduce ? 0 : b.hover * .4;
  const formed = b.mode === "intro" ? clamp(1 - b.clock / b.introMax, 0, 1) : 1;
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (formed < 1) drawIntroThreads(ctx, x, foot - 150, formed, tt);
  ctx.globalAlpha *= formed;
  drawQuimeraCreature(ctx,e,cam,t,reduce);
  const hy=foot-340;
  // Aviso del ataque (icono del héroe + nombre) sobre la cabeza.
  if (b.mode === "warn" && b.attack) {
    const atk = FUSION_ATTACKS[b.attack], col = WORLD1_THEMES[atk.hero].color;
    ctx.fillStyle = "rgba(8,8,18,.8)"; ctx.fillRect(x - 110, hy - 190, 220, 30); ctx.fillStyle = col; ctx.font = "800 15px Outfit, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("¡" + atk.name.toUpperCase() + "!", x, hy - 175);
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = .6;
    for (const m of b.marks || []) { if (typeof m === "number") { const mx = m - cam.x; ctx.beginPath(); ctx.moveTo(mx, foot - 4); ctx.lineTo(mx, foot - 420); ctx.stroke(); ctx.beginPath(); ctx.ellipse(mx, foot - 4, 34, 8, 0, 0, Math.PI * 2); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(m.x - cam.x, m.y - cam.y, 18, 0, Math.PI * 2); ctx.stroke(); } }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  drawShots(ctx, b, cam, t, reduce);
}

function drawIntroThreads(ctx, x, y, k, t) {
  // Diez hilos de color convergen y cosen el cuerpo de la Quimera.
  Object.keys(WORLD1_THEMES).forEach((hero, i) => {
    const a = i / 10 * Math.PI * 2, R = 520 * (1 - k) + 40;
    ctx.strokeStyle = WORLD1_THEMES[hero].color; ctx.lineWidth = 3; ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R * .6); ctx.quadraticCurveTo(x + Math.cos(a + 1) * R * .5, y + Math.sin(a + 1) * R * .3, x, y); ctx.stroke();
    ctx.fillStyle = WORLD1_THEMES[hero].color; ctx.beginPath(); ctx.arc(x + Math.cos(a) * R, y + Math.sin(a) * R * .6, 10, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawShots(ctx, b, cam, t, reduce) {
  ctx.save(); ctx.lineCap = "round";
  for (const s of b.shots) {
    if (s.delay > 0) continue;
    const x = s.x - cam.x, y = s.y - cam.y;
    ctx.fillStyle = s.col; ctx.strokeStyle = s.col;
    switch (s.k) {
      case "ring": ctx.lineWidth = 5; ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(x, y, s.r, s.r * 1.2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.font = "700 18px sans-serif"; ctx.textAlign = "center"; ctx.fillText("♪", x, y + 6); break;
      case "orb": case "fire": case "meteor": ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(x - s.vx * 2, y - s.vy * 2, s.r * 1.3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x - s.r * .3, y - s.r * .3, s.r * .35, 0, Math.PI * 2); ctx.fill(); break;
      case "bolt": { ctx.globalAlpha = s.life < 18 ? 1 : .4; ctx.lineWidth = s.life < 18 ? 10 : 3; ctx.beginPath(); ctx.moveTo(x, -cam.y); for (let k = 1; k <= 10; k++) ctx.lineTo(x + ((k * 53) % 40) - 20, y + k * (WORLD1_FLOOR / 10)); ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); break; }
      case "jelly": ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(x, y, s.r, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 8, y); ctx.lineTo(x + k * 8 + (reduce ? 0 : Math.sin(t * .1 + k) * 4), y + 24); ctx.stroke(); } break;
      case "geyser": { const h = s.life < 44 ? 340 : 30; ctx.globalAlpha = s.life < 44 ? .85 : .5; ctx.fillRect(x - s.r * .6, y - h, s.r * 1.2, h); ctx.fillStyle = "#fff6c8"; ctx.fillRect(x - 6, y - h, 12, h); break; }
      case "wave": ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(x - s.r, y + 18); ctx.lineTo(x, y - 22); ctx.lineTo(x + s.r, y + 18); ctx.closePath(); ctx.fill(); break;
      case "wheel": { ctx.save(); ctx.translate(x, y); ctx.rotate((s.age || 0) * .2 * Math.sign(s.vx || 1)); ctx.fillStyle = "#ffd36a"; ctx.beginPath(); ctx.arc(0, 0, s.r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#a8552e"; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#e0463a"; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 1.6) * 14, Math.sin(k * 1.6) * 14, 5, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); break; }
      case "node": ctx.lineWidth = 2; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(s.tx - cam.x, s.ty - cam.y); ctx.stroke(); break;
      case "beam": { const on = s.life < s.liveFor, by = s.band - cam.y - 20; ctx.globalAlpha = on ? .8 : .25; ctx.fillRect(WORLD1_ARENA.left - cam.x, by - (on ? 22 : 4), WORLD1_ARENA.right - WORLD1_ARENA.left, on ? 44 : 8); if (on) { ctx.fillStyle = "#fff"; ctx.fillRect(WORLD1_ARENA.left - cam.x, by - 6, WORLD1_ARENA.right - WORLD1_ARENA.left, 12); } break; }
      case "echo": ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(x, y, 30, 38, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .4; ctx.fillRect(x - Math.sign(s.vx) * 90, y - 10, Math.sign(s.vx) * 60, 20); break;
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// Capa de pantalla: bandas negras y rótulo durante la aparición y los especiales.
export function drawFusionBossOverlay(ctx, e, W, H) {
  if (!e?._fusionBoss) return;
  const b = e._fusion;
  let title = null, line = "", k = 0;
  if (b.mode === "intro") { const p = 1 - b.clock / b.introMax; k = Math.min(1, p * 6, b.clock / 20); const i = Math.min(2, Math.floor(p * 3)); title = FUSION_STORY.intro[2]; line = FUSION_STORY.intro[i < 2 ? i : 1]; }
  else if (b.mode === "special" && b.special) { k = Math.min(1, b.special.t / 20, (b.special.length - b.special.t) / 20); if (b.special.t > 90) k = Math.min(k, .45); title = b.special.name; line = b.special.line; }
  if (!title || k <= 0) return;
  ctx.save();
  const bar = H * .12 * k; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  ctx.globalAlpha = Math.min(1, k * 1.2); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffd6f2"; ctx.font = "900 38px Outfit, sans-serif"; ctx.fillText(title, W / 2, H - bar - 54);
  ctx.fillStyle = "#fff"; ctx.font = "600 16px Outfit, sans-serif"; ctx.fillText(line, W / 2, H - bar - 22);
  ctx.restore();
}
