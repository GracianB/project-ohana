import {drawQuimeraCreature} from './quimera-art.js';
// Four-phase Echo encounter. Locked targets, shared visible danger geometry
// and explicit recovery windows keep every stolen power readable.
import { WORLD1_ARENA, WORLD1_FLOOR, WORLD1_THEMES } from "./world1-rooms.js";
import { FUSION_STORY } from "./world1-story.js";

export const FUSION_BOSS_ID = "w1-final-quimera";
export const FUSION_BOSS = Object.freeze({ hp: 2800, w: 230, h: 290, maxShots: 90, intro: 260 });
// Umbrales de fase: 1 → 2 (70 %), 2 → 3 (45 %), 3 → 4 (20 %).
export const FUSION_PHASES = Object.freeze([0.70, 0.45, 0.20]);
// Ataques por fase (cada uno pertenece a un héroe).
export const FUSION_ATTACKS = Object.freeze({
  ola:       { hero: "kilo",    name: "Ola del ukelele",     warn: 72 },
  plasma:    { hero: "stitcho", name: "Plasma cosido",       warn: 66 },
  rayos:     { hero: "chispin", name: "Rayos en cadena",     warn: 78 },
  medusas:   { hero: "cat",     name: "Lluvia de medusas",   warn: 72 },
  embestida: { hero: "cuerno",  name: "Embestida prisma",    warn: 78 },
  aliento:   { hero: "dragon",  name: "Aliento del hogar",   warn: 78 },
  terremoto: { hero: "dino",    name: "Terremoto fósil",     warn: 78 },
  geiseres:  { hero: "frita",   name: "Géiseres de aceite",  warn: 78 },
  ruedas:    { hero: "pizza",   name: "Ruedas de pizza",     warn: 66 },
  red:       { hero: "yomi",    name: "Red neuronal",        warn: 84 }
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
  b.shotSerial=(b.shotSerial||0)+1;
  b.shots.push({ ...s, source, id:b.shotSerial });
}

function chooseAttack(e, b) {
  const pool = FUSION_PHASE_ATTACKS[e.phase];
  // A shuffled bag teaches the repertoire before repeating it. Seeded for replays.
  if(!b.deck?.length||b.deckPhase!==e.phase){
    b.deck=[...pool];b.deckPhase=e.phase;
    for(let i=b.deck.length-1;i>0;i--){const j=Math.floor(lcg(b)*(i+1));[b.deck[i],b.deck[j]]=[b.deck[j],b.deck[i]];}
    if(b.deck.at(-1)===b.last)[b.deck[0],b.deck[b.deck.length-1]]=[b.deck.at(-1),b.deck[0]];
  }
  const pick=b.deck.pop();
  b.last = pick; b.used[pick] = (b.used[pick] || 0) + 1;
  return pick;
}

function startAttack(e, b, p) {
  const id = chooseAttack(e, b);
  b.attack = id; b.mode = "warn"; b.clock = FUSION_ATTACKS[id].warn; b.warnMax=b.clock; b.step = (b.step||0)+1;
  b.aim = Math.sign(pcx(p) - (e.x + e.w / 2)) || -1; e.facing = b.aim;
  e.telegraph = true; e.teleKind = ""; e.vulnerable=false;
  b.target={x:pcx(p),y:pcy(p)};
  b.marks = [];
  const A = WORLD1_ARENA;
  if (id === "rayos") for (let i = -1; i <= 1; i++) b.marks.push(clamp(pcx(p) + i * 170 * (e.phase >= 3 ? 1.2 : 1), A.left + 40, A.right - 40));
  if (id === "geiseres") for (let i = 0; i < 4; i++) b.marks.push(clamp(pcx(p) + (i - 1.5) * 260 + (lcg(b) - .5) * 60, A.left + 60, A.right - 60));
  if(id==='medusas')for(let i=-3;i<=3;i++)b.marks.push(clamp(b.target.x+i*150,A.left+24,A.right-24));
  if(id==='terremoto')b.leapTarget=clamp(b.target.x-e.w/2,Math.max(A.left,e.x-1100),Math.min(A.right-e.w,e.x+1100));
  if(id==='embestida')b.chargeTarget=clamp(e.x+b.aim*Math.min(1200,Math.max(540,Math.abs(b.target.x-(e.x+e.w/2))+180)),A.left,A.right-e.w);
  if (id === "red") { b.marks = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.marks.push({ x: clamp(pcx(p) + Math.cos(a) * 240,A.left+20,A.right-20), y: clamp(pcy(p) + Math.sin(a) * 150,WORLD1_FLOOR-500,WORLD1_FLOOR-20) }); } }
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
  // Cambio de fase → movimiento especial cinemático (invulnerable mientras dura).
  const phase = fusionPhaseFor(e.hp, e.max);
  if (phase > e.phase && b.mode !== "special") {
    e.phase = phase;
    if (!b.announced[phase]) { b.announced[phase] = true; startSpecial(e, b, g, phase, helpers); }
  }
  updateShots(e,b,g,hurt);
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
    if (Math.abs(dx) > 360) e.x = clamp(e.x+Math.sign(dx)*3.4,A.left,A.right-e.w);
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
  b.rest = [0, 100, 92, 84, 78][e.phase];
  e.vulnerable=true;
}

function fireAttack(e, b, g, p) {
  const ex = e.x + e.w / 2, ey = WORLD1_FLOOR-160, A = WORLD1_ARENA, target=b.target||{x:pcx(p),y:pcy(p)}, col = WORLD1_THEMES[FUSION_ATTACKS[b.attack].hero].color;
  switch (b.attack) {
    case "ola": for (let i = 0; i < 3; i++) for (const d of [-1, 1]) pushShot(b, { k: "ring", x: ex, y: WORLD1_FLOOR - 22, vx: d * (4 + i * 1.2), vy: 0, r: 22, life: 165 + i * 12, delay: i * 18, dmg: 12, col }); break;
    case "plasma": for (let i = -1; i <= 1; i++) { const dx = target.x - ex, dy = target.y - ey, a = Math.atan2(dy, dx) + i * .22; pushShot(b, { k: "orb", x: ex, y: ey, vx: Math.cos(a) * 6.5, vy: Math.sin(a) * 6.5, r: 14, life: 160, dmg: 13, col }); } break;
    case "rayos": for (const x of b.marks) pushShot(b, { k: "bolt", x, y: 0, vx: 0, vy: 0, r: 34, life: 26, dmg: 18, col }); break;
    case "medusas": for (const x of b.marks) pushShot(b, { k: "jelly", x, y: WORLD1_FLOOR-440, vx: 0, vy: 3.2, r: 20, life: 145, dmg: 12, col }); break;
    case "embestida": b.mode = "charge"; b.clock = 0; b.chargeDir = b.aim; b.chargeTarget ??= clamp(e.x+b.aim*900,A.left,A.right-e.w); break;
    case "aliento": for (let i = 0; i < 8; i++) { const a = (b.aim > 0 ? 0 : Math.PI) + (i - 3.5) * .11 * b.aim; pushShot(b, { k: "fire", x: ex + b.aim * 90, y: WORLD1_FLOOR-200, vx: Math.cos(a) * (6 + i * .2), vy: Math.sin(a) * 2.2 + .6, r: 16, life: 130, delay: i * 4, dmg: 14, col }); } break;
    case "terremoto": b.mode = "leap"; b.clock = 50; b.leapTarget ??= clamp(target.x - e.w / 2, A.left, A.right - e.w); b.leapFrom = e.x; break;
    case "geiseres": for (const x of b.marks) pushShot(b, { k: "geyser", x, y: WORLD1_FLOOR, vx: 0, vy: 0, r: 34, life: 60, dmg: 16, col }); break;
    case "ruedas": for (let i = 0; i < 3; i++) pushShot(b, { k: "wheel", x: ex, y: WORLD1_FLOOR - 40, vx: b.aim * (4.5 + i * 1.3), vy: -6 - i * 2, r: 28, life: 180, delay: i * 14, dmg: 13, col, bounce: true }); break;
    case "red": for (const m of b.marks) pushShot(b, { k: "node", x: m.x, y: m.y, tx: target.x, ty: target.y, vx: 0, vy: 0, r: 16, life: 90, dmg: 15, col }); break;
  }
  if (b.mode === "attack") { b.clock = 30; }
}

function tickAttack(e, b, g, p, hurt) {
  const A = WORLD1_ARENA;
  if (b.mode === "charge") {
    const next=e.x+b.chargeDir*(e.phase>=4?15:12),end=b.chargeTarget??(b.chargeDir>0?A.right-e.w:A.left);
    e.x=clamp(b.chargeDir>0?Math.min(next,end):Math.max(next,end),A.left,A.right-e.w);
    if(rectHits(fusionChargeBounds(e),p))hurt(20,FUSION_ATTACKS.embestida.name);
    if (e.x===end||e.x<=A.left||e.x>=A.right-e.w) { g.shake = Math.max(g.shake || 0, g.reduceMotion ? 2 : 14); finishAttack(e, b); }
    return;
  }
  if (b.mode === "leap") {
    b.clock--; const k = 1 - b.clock / 50;
    e.x = b.leapFrom + (b.leapTarget - b.leapFrom) * k;
    if (b.clock <= 0) {
      g.shake = Math.max(g.shake || 0, g.reduceMotion ? 3 : 20);
      for (const d of [-1, 1]) pushShot(b, { k: "wave", x: e.x + e.w / 2, y: WORLD1_FLOOR - 18, vx: d * 7, vy: 0, r: 26, life: 140, dmg: 16, col: WORLD1_THEMES.dino.color });
      if (rectHits({x:e.x-e.w*.1,y:WORLD1_FLOOR-30,w:e.w*1.2,h:30},p)) hurt(18, FUSION_ATTACKS.terremoto.name);
      finishAttack(e, b);
    }
    return;
  }
  if (--b.clock <= 0) finishAttack(e, b);
}

// Drawing and collision consume the same dimensions. Outer glow is decoration;
// the solid outline is the complete damage footprint, including vertical reach.
export function fusionShotActive(s){
 if(s.hit||s.delay>0||s.life<=0)return false;
 return s.k==='bolt'?s.life<18:s.k==='geyser'?s.life<44:s.k==='beam'?s.life<s.liveFor:true;
}
export function fusionShotBounds(s,A=WORLD1_ARENA){
 if(s.k==='bolt')return {x:s.x-s.r,y:0,w:s.r*2,h:WORLD1_FLOOR};
 if(s.k==='geyser')return {x:s.x-s.r,y:WORLD1_FLOOR-340,w:s.r*2,h:340};
 if(s.k==='beam')return {x:A.left,y:s.band-42,w:A.right-A.left,h:44};
 const rx=s.k==='echo'?30:s.r,ry=s.k==='echo'?38:s.r;
 return {x:s.x-rx,y:s.y-ry,w:rx*2,h:ry*2};
}
export function fusionChargeBounds(e){return {x:e.x+e.w*.06,y:e.y+e.h*.45,w:e.w*.88,h:e.h*.55};}
function rectHits(a,p){return p.x<a.x+a.w&&p.x+p.w>a.x&&p.y<a.y+a.h&&p.y+p.h>a.y;}
export function fusionShotHitsPlayer(s,p,A=WORLD1_ARENA){
 if(!p||p.dead||!fusionShotActive(s))return false;
 const box=fusionShotBounds(s,A);
 if(['bolt','geyser','beam'].includes(s.k))return rectHits(box,p);
 const rx=box.w/2,ry=box.h/2;
 const dx=(Math.max(p.x,Math.min(s.x,p.x+p.w))-s.x)/Math.max(1,rx);
 const dy=(Math.max(p.y,Math.min(s.y,p.y+p.h))-s.y)/Math.max(1,ry);
 return dx*dx+dy*dy<1;
}
export function updateFusionProjectilesOnly(e,g,hurt){if(e?._fusion)updateShots(e,e._fusion,g,hurt);}
function updateShots(e, b, g, hurt) {
  const p = g.player, A = WORLD1_ARENA;
  for (const s of b.shots) {
    if (s.delay > 0) { s.delay--; continue; }
    s.life--; s.age = (s.age || 0) + 1;
    if (s.k === "node") { const k = clamp(s.age / 70, 0, 1); s.x += (s.tx - s.x) * .05 * k; s.y += (s.ty - s.y) * .05 * k; }
    else { s.x += s.vx; s.y += s.vy; }
    if (s.k === "wheel") { s.vy += .35; if (s.y > WORLD1_FLOOR - s.r) { s.y = WORLD1_FLOOR - s.r; s.vy = -Math.abs(s.vy) * .78; } }
    if (s.k === "fire") s.vy += .05;
    if (s.x < A.left - 120 || s.x > A.right + 120 || s.y>WORLD1_FLOOR+s.r+30) s.life = 0;
    if (!p || p.dead || s.hit) continue;
    const hit = fusionShotHitsPlayer(s,p,A);
    if (hit) { s.hit = s.k !== "bolt" && s.k !== "geyser" && s.k !== "beam"; hurt(s.dmg, s.source || FUSION_ATTACKS[b.attack]?.name || "QUIMERA"); if (s.k === "bolt" || s.k === "geyser" || s.k === "beam") s.life = Math.min(s.life, 1); }
  }
  b.shots = b.shots.filter((s) => s.life > 0 && !s.hit);
}

// ── Movimientos especiales con cinemática ───────────────────────────────────
function startSpecial(e, b, g, phase, helpers) {
  const sp = FUSION_SPECIALS[phase];
  b.mode = "special"; b.special = { id: sp.id, name: sp.name, line: sp.line, t: 0, length: sp.length, phase };
  b.shots = []; b.attack=null; b.target=null; b.marks=[];
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
  if (s.id === "eco" && T > 70 && T < 220 && T % 21 === 0) {
    // Diez meteoritos con el color de cada héroe; uno de cada dos sobre el jugador.
    const i = Math.floor((T - 70) / 21), hero = Object.keys(WORLD1_THEMES)[i % 10];
    const x = i % 2 ? pcx(p) : A.left + 200 + ((i * 397) % (A.right - A.left - 400));
    pushShot(b, { k: "meteor", x, y: WORLD1_FLOOR-520, vx: 0, vy: 8, r: 26, delay:48, life:Math.min(90,s.length-T-48), dmg: 14, col: WORLD1_THEMES[hero].color });
  }
  if (s.id === "erupcion") {
    // Barrido a dos alturas: primero a ras de suelo (salta), después alto (quédate abajo).
    if (T === 80) pushShot(b, { k: "beam", x: mid, y: WORLD1_FLOOR - 20, band: WORLD1_FLOOR, vx: 0, vy: 0, r: 0, life: 100, liveFor: 50, dmg: 18, col: "#ff9d4a" });
    if (T === 210) pushShot(b, { k: "beam", x: mid, y: WORLD1_FLOOR - 150, band: WORLD1_FLOOR - 130, vx: 0, vy: 0, r: 0, life: 100, liveFor: 50, dmg: 18, col: "#8fe9ff" });
    if (T > 120 && T < 330 && T % 40 === 0) pushShot(b, { k: "geyser", x: clamp(A.left + 300 + ((T * 211) % (A.right - A.left - 600)), A.left, A.right), y: WORLD1_FLOOR, vx: 0, vy: 0, r: 30, life: 72, dmg: 14, col: "#ffd65a" });
  }
  if (s.id === "rota" && T > 80 && T < 280 && T % 30 === 0) {
    // Los diez ecos se separan y cruzan la arena de uno en uno, alto o bajo.
    const i = Math.floor((T - 80) / 30), hero = Object.keys(WORLD1_THEMES)[i % 10], dir = i % 2 ? 1 : -1;
    pushShot(b, { k: "echo", hero, x: clamp(pcx(p)-dir*680,A.left+40,A.right-40), y: i % 3 === 2 ? WORLD1_FLOOR - 170 : WORLD1_FLOOR - 38, vx: dir * 10, vy: 0, r: 30, delay:42, life:Math.min(120,s.length-T-42), dmg: 15, col: WORLD1_THEMES[hero].color });
  }
  if (T >= s.length) { b.mode = "rest"; b.rest = 110; b.special = null; e.telegraph = false; g.storyLine = ""; }
}

export function fusionBossSnapshot(e) {
  if (!e?._fusionBoss) return null;
  const b = e._fusion;
  return { hp: e.hp, max: e.max, phase: e.phase, mode: b.mode, attack: b.attack, special: b.special?.id || null, shots: b.shots.length, used: { ...b.used } };
}

// ── Dibujo ──────────────────────────────────────────────────────────────────
export function drawFusionBoss(ctx, e, cam, t, reduce = false) {
  if (!e?._fusionBoss) return;
  const b = e._fusion, x = e.x - cam.x + e.w / 2, foot = e.y - cam.y + e.h;
  const tt = reduce ? 0 : t;
  const formed = b.mode === "intro" ? clamp(1 - b.clock / b.introMax, 0, 1) : 1;
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (formed < 1) drawIntroThreads(ctx, x, foot - 150, formed, tt);
  drawQuimeraCreature(ctx,e,cam,t,reduce);
  ctx.restore();
  drawFusionProjectiles(ctx, b, cam, t, reduce);
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

export function drawFusionAttackTelegraphs(c,e,cam={x:0,y:0},t=0,reduce=false){
 const b=e._fusion;if(!b||b.mode!=='warn'||!b.attack)return;
 const A=WORLD1_ARENA,col=WORLD1_THEMES[FUSION_ATTACKS[b.attack].hero].color,ox=cam.x||0,oy=cam.y||0;
 const ex=e.x+e.w/2,floor=WORLD1_FLOOR-oy,aim=b.aim||-1;
 c.save();c.lineCap='round';c.lineJoin='round';
 const zone=(x,y,w,h)=>{c.fillStyle=col;c.globalAlpha=.13;c.fillRect(x-ox,y-oy,w,h);c.globalAlpha=.85;c.strokeStyle=col;c.lineWidth=2;c.strokeRect(x-ox,y-oy,w,h);};
 const arrow=(x,y,dir)=>{c.beginPath();c.moveTo(x-dir*10,y-6);c.lineTo(x,y);c.lineTo(x-dir*10,y+6);c.stroke();};
 if(b.attack==='rayos'||b.attack==='geiseres')for(const x of b.marks||[]){
  const height=b.attack==='rayos'?WORLD1_FLOOR:340;
  zone(x-34,WORLD1_FLOOR-height,68,height);
  c.beginPath();c.ellipse(x-ox,floor-3,34,7,0,0,Math.PI*2);c.stroke();
 }
 if(b.attack==='medusas')for(const x of b.marks||[]){zone(x-20,WORLD1_FLOOR-440,40,440);c.beginPath();c.moveTo(x-ox,floor-432);c.lineTo(x-ox,floor-404);c.stroke();arrow(x-ox,floor-401,1);}
 if(b.attack==='terremoto'){
  const x=(b.leapTarget??e.x)+e.w/2;
  zone(x-e.w*.6,WORLD1_FLOOR-18,e.w*1.2,18);
  c.globalAlpha=.8;c.beginPath();c.ellipse(x-ox,floor-5,e.w*.6,13,0,0,Math.PI*2);c.stroke();
 }
 if(b.attack==='embestida'){
  const box=fusionChargeBounds(e),end=b.chargeTarget??e.x+aim*900;
  zone(Math.min(e.x,end)+e.w*.06,box.y,Math.abs(end-e.x)+box.w,box.h);
  for(let i=1;i<=3;i++)arrow(ex-ox+aim*i*75,floor-70,aim);
 }
 if(b.attack==='ola'||b.attack==='ruedas'){
  const dirs=b.attack==='ola'?[-1,1]:[aim];
  for(const dir of dirs){zone(dir>0?ex:Math.max(A.left,ex-1100),WORLD1_FLOOR-(b.attack==='ola'?44:130),Math.min(1100,dir>0?A.right-ex:ex-A.left),b.attack==='ola'?44:130);arrow(ex-ox+dir*110,floor-24,dir);}
 }
 if(b.attack==='red'){
  c.globalAlpha=.8;c.strokeStyle=col;c.lineWidth=2;c.setLineDash([7,7]);
  for(const m of b.marks||[]){c.beginPath();c.arc(m.x-ox,m.y-oy,16,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(m.x-ox,m.y-oy);c.lineTo((b.target?.x??ex)-ox,(b.target?.y??WORLD1_FLOOR-30)-oy);c.stroke();}
 }
 if(b.attack==='plasma'||b.attack==='aliento'){
  c.globalAlpha=.7;c.strokeStyle=col;c.lineWidth=2;c.setLineDash([9,8]);
  if(b.attack==='plasma')for(let i=-1;i<=1;i++){
   const target=b.target||{x:ex+aim*800,y:WORLD1_FLOOR-30};
   const angle=Math.atan2(target.y-(WORLD1_FLOOR-160),target.x-ex)+i*.22;
   c.beginPath();c.moveTo(ex-ox,WORLD1_FLOOR-160-oy);c.lineTo(ex-ox+Math.cos(angle)*1040,WORLD1_FLOOR-160-oy+Math.sin(angle)*1040);c.stroke();
  }
  else for(const i of[0,3,7]){
   const angle=(aim>0?0:Math.PI)+(i-3.5)*.11*aim,vx=Math.cos(angle)*(6+i*.2),vy=Math.sin(angle)*2.2+.6;
   c.beginPath();for(let age=0;age<=100;age+=5){const x=ex+aim*90+vx*age-ox,y=WORLD1_FLOOR-200+vy*age+.025*age*(age-1)-oy;age?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  }
 }
 c.setLineDash([]);c.restore();
}

export function drawFusionProjectiles(ctx,b,cam,t=0,reduce=false){
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(const s of b.shots||[]){
  const x=s.x-cam.x,y=s.y-cam.y,box=fusionShotBounds(s),active=fusionShotActive(s),col=s.col||'#f7c17c';
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=2;
  if(s.delay>0){
   // A locked landing lane for meteors and a travel lane for arriving echoes.
   ctx.globalAlpha=.22;
   if(s.k==='meteor')ctx.fillRect(x-s.r,WORLD1_FLOOR-460-cam.y,s.r*2,460);
   else if(s.k==='echo'){
    const end=s.x+(s.vx||0)*Math.min(s.life,130),left=Math.min(s.x,end);
    ctx.fillRect(left-cam.x,y-38,Math.abs(end-s.x)+30,76);
   }
   if(s.k==='meteor'){ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(x,WORLD1_FLOOR-cam.y-4,s.r,6,0,0,Math.PI*2);ctx.stroke();}
   continue;
  }
  if(['bolt','geyser','beam'].includes(s.k)){
   const xx=box.x-cam.x,yy=box.y-cam.y;
   ctx.globalAlpha=active?.8:.16;ctx.fillRect(xx,yy,box.w,box.h);
   ctx.globalAlpha=active?1:.75;ctx.strokeRect(xx+1,yy+1,box.w-2,box.h-2);
   if(active){
    ctx.fillStyle='#fff0cf';
    if(s.k==='beam')ctx.fillRect(xx,yy+box.h*.43,box.w,box.h*.14);
    else if(s.k==='bolt'){
     ctx.lineWidth=3;ctx.strokeStyle='#fff5d8';ctx.beginPath();
     for(let k=0;k<=12;k++){const py=yy+box.h*k/12,px=x+(k===0||k===12?0:((k%2?1:-1)*s.r*.45));k?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
    }else for(let i=0;i<3;i++)ctx.fillRect(xx+box.w*(.15+i*.27),yy+7,4,box.h-10);
   }
   continue;
  }
  ctx.globalAlpha=1;
  // Solid silhouette is exactly the circle/ellipse used for contact damage.
  ctx.beginPath();ctx.ellipse(x,y,box.w/2,box.h/2,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#12192b';ctx.lineWidth=2;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(x,y,Math.max(1,box.w/2-1),Math.max(1,box.h/2-1),0,0,Math.PI*2);ctx.clip();
  ctx.fillStyle='#fff0d4';ctx.strokeStyle='#fff0d4';ctx.lineWidth=2;
  if(s.k==='ring'||s.k==='wave'){
   ctx.beginPath();ctx.arc(x,y,s.r*.65,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.moveTo(x-s.r,y);ctx.quadraticCurveTo(x,y-s.r*.5,x+s.r,y);ctx.stroke();
  }else if(s.k==='wheel'){
   const spin=reduce?0:(s.age||0)*.13;
   for(let i=0;i<5;i++){const a=spin+i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*s.r,y+Math.sin(a)*s.r);ctx.stroke();}
  }else if(s.k==='jelly'){
   ctx.fillStyle='#27304f';ctx.fillRect(x-s.r,y+2,s.r*2,s.r);
   for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+i*6,y+3);ctx.lineTo(x+i*6,y+s.r);ctx.stroke();}
  }else if(s.k==='node'){
   ctx.strokeRect(x-7,y-7,14,14);
  }else if(s.k==='echo'){
   ctx.beginPath();ctx.moveTo(x-18,y-18);ctx.lineTo(x+18,y);ctx.lineTo(x-18,y+18);ctx.closePath();ctx.stroke();
  }else{
   ctx.beginPath();ctx.arc(x-s.r*.22,y-s.r*.22,s.r*.4,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(x-s.r*.6,y+s.r*.4);ctx.lineTo(x+s.r*.4,y-s.r*.55);ctx.stroke();
  }
  ctx.restore();
 }
 ctx.restore();
}

// Capa de pantalla: bandas negras y rótulo durante la aparición y los especiales.
export function drawFusionBossOverlay(ctx, e, W, H) {
  if (!e?._fusionBoss) return;
  const b = e._fusion;
  let title = null, line = "", k = 0;
  if (b.mode === "intro") { const p = 1 - b.clock / b.introMax; k = Math.min(1, p * 6, b.clock / 20); const i = Math.min(2, Math.floor(p * 3)); title = FUSION_STORY.intro[2]; line = FUSION_STORY.intro[i < 2 ? i : 1]; }
  else if (b.mode === "special" && b.special && b.special.t<65) { k = Math.min(1, b.special.t / 20, (b.special.length - b.special.t) / 20); if (b.special.t > 90) k = Math.min(k, .45); title = b.special.name; line = b.special.line; }
  if (!title || k <= 0) return;
  ctx.save();
  const bar = H * .12 * k; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  ctx.globalAlpha = Math.min(1, k * 1.2); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffd6f2"; ctx.font = "900 38px Outfit, sans-serif"; ctx.fillText(title, W / 2, H - bar - 54);
  ctx.fillStyle = "#fff"; ctx.font = "600 16px Outfit, sans-serif"; ctx.fillText(line, W / 2, H - bar - 22);
  ctx.restore();
}
