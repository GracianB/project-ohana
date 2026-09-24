// ============================================================================
// HABILIDADES · 8 personajes × 3 (J/K/L)
// Cada habilidad tiene una mecánica propia. Las entidades especiales (notas que
// rebotan, charcos, nubes, espíritus, géiseres…) viven en FX (este módulo) con su
// propio update/draw: updateAbilityFx(game) y drawAbilityFx(ctx, game, t).
// systems/passives.js ya los llama desde Passives.afterMove / Passives.draw.
// ============================================================================
import { vfxSprite } from "../characters/sprites.js";
import { sfx } from "../engine/audio.js";
import { showNotification } from "./notify.js";

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
  purr: { name: "Ronroneo", key: "K", cd: 2400, color: "#ffb6e4", desc: "Duerme a los enemigos cercanos y te cura un poco." },
  ninetails: { name: "Nueve colas", key: "L", cd: 6000, color: "#b78bff", desc: "9 espíritus de cola que persiguen enemigos." },
  // Dragón
  breath: { name: "Llamarada", key: "J", cd: 750, color: "#ff6a2a", desc: "Cono de fuego continuo a corta distancia." },
  gust: { name: "Aletazo", key: "K", cd: 1800, color: "#bfefff", desc: "Ráfaga que empuja enemigos y te impulsa arriba." },
  meteor: { name: "Lluvia de meteoros", key: "L", cd: 6500, color: "#ff4a20", desc: "Meteoritos de fuego caen del cielo." },
  // Dino
  bite: { name: "Mordisco", key: "J", cd: 700, color: "#e8ffe0", desc: "Mordisco corto, muy fuerte y con gran retroceso." },
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
};

export function useAbility(game, index) {
  const p = game.player;
  if (!p || p.dead) return;
  const id = p.abilities && p.abilities[index];
  const def = ABILITY_DEFS[id];
  if (!def) return;
  const now = performance.now();
  p.cds = p.cds || {};
  p.cdDur = p.cdDur || {};
  if ((p.cds[id] || 0) > now) return;
  const dur = def.cd / (1 + (Number(p.evo) || 0) * 0.12);
  p.cds[id] = now + dur;
  p.cdDur[id] = dur;
  syncState(p);
  p._cast = { slot: index, t: game.t || 0 };
  sfx(id);
  if (index === 2) {
    game.ult = { t: 46, color: def.color, name: def.name };
    game.flashColor = def.color;
    game.flash = Math.max(game.flash || 0, 14);
    game.shake = Math.min(18, (game.shake || 0) + 7);
    game.hitstop = Math.max(game.hitstop || 0, 8);
    showNotification(def.name, def.desc, "sala");
  }
  const fn = CASTERS[id];
  if (fn) fn(game, p, Number(p.evo) || 0);
}

// ---------------------------------------------------------------------------
// Estado de movimiento de habilidades (un solo jugador)
// ---------------------------------------------------------------------------
const FX = [];
const S = { p: null, hover: 0, roll: 0, caos: 0, cvx: 0, charge: 0, pull: null };

function syncState(p) {
  if (S.p === p) return;
  S.p = p; S.hover = 0; S.roll = 0; S.caos = 0; S.charge = 0; S.pull = null;
  FX.length = 0;
}

export function clearAbilityFx() {
  FX.length = 0;
  S.hover = 0; S.roll = 0; S.caos = 0; S.charge = 0; S.pull = null;
  if (S.p) S.p._abilMove = null;
}

/** Llamado antes de la gravedad (Passives.update). Aplica los movimientos forzados. */
export function abilityPreMove(game, input) {
  const p = game.player;
  if (!p) return;
  syncState(p);
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
    const sp = 15;
    p.vx = (dx / d) * Math.min(sp, d);
    p.vy = (dy / d) * Math.min(sp, d) - 0.52;
    if (dx !== 0) p.facing = Math.sign(dx);
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
    if ((game.t & 1) === 0) game.ghosts.push({ x: p.x, y: p.y, w: p.w, h: p.h, life: 10, color: "#8f7bff" });
  }
  if (S.charge > 0) {
    bodyHits(game, p, 26, { kx: 15, ky: -8, stun: 34, color: "#c8f04a", cd: 30, shake: 7 });
    if ((game.t % 3) === 0) game.fx.emit(cx(p) - p.facing * p.w * 0.6, p.y + p.h, { color: "#d8c7a4", count: 3, size: 3, up: 0.6, speed: 1.6 });
  }
  p._abilMove = S.roll > 0 || S.caos > 0 ? "roll" : S.charge > 0 ? "charge" : S.hover > 0 ? "float" : S.pull ? "swing" : null;
  for (let i = 0; i < FX.length; i++) {
    const f = FX[i];
    f.age = (f.age || 0) + 1;
    const keep = UPD[f.kind] ? UPD[f.kind](game, f, p) : false;
    if (!keep) f.dead = true;
  }
  let w = 0;
  for (let i = 0; i < FX.length; i++) if (!FX[i].dead) FX[w++] = FX[i];
  FX.length = w;
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const AIR = new Set(["phosquito", "mosquito", "medusa", "pez", "libelula", "avispa", "abeja", "anguila", "gaviota", "murcielago", "brasita", "ufo"]);
function cx(o) { return o.x + o.w / 2; }
function cy(o) { return o.y + o.h / 2; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function pw(p) { return 1 + (Number(p.evo) || 0) * 0.35; }
function alive(e) { return !!e && !e.dying && e.hp > 0; }
function canHit(e) { return alive(e) && !(e.invuln > 0); }
function isAir(e) { return AIR.has(e.kind) || (e.kind === "cucaracho" && e.evo >= 2) || (e.boss && e.airborne); }
function armor(p, n) { p._armorT = Math.max(p._armorT || 0, n); }
function circleHit(x, y, r, e) {
  const nx = clamp(x, e.x, e.x + e.w), ny = clamp(y, e.y, e.y + e.h);
  return (x - nx) * (x - nx) + (y - ny) * (y - ny) <= r * r;
}
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
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
  let d = dmg;
  if (e.boss) d *= 0.55;
  d = Math.max(1, Math.round(d));
  e.hp -= d;
  e.flash = Math.max(e.flash || 0, 14);
  if (e.boss) {
    if (o.kx) e.vx = (e.vx || 0) + clamp(o.kx, -8, 8) * 0.08;
  } else {
    if (o.kx) e.vx = clamp(o.kx, -16, 16);
    if (o.ky) e.vy = Math.min(e.vy || 0, o.ky);
  }
  if (o.stun != null) e.stun = Math.max(e.stun || 0, e.boss ? Math.min(6, o.stun) : o.stun);
  if (o.nums !== false) g.nums.add(cx(e) - 4, e.y, "" + d, o.color || "#ffe66a", d >= 40 || !!o.crit);
  g.combo = (g.combo || 0) + 1;
  g.comboT = 210;
  g.score = (g.score || 0) + 10 * g.combo;
  g.fx.emit(cx(e), cy(e), { color: o.color || "#fff", count: o.parts ?? 8, size: 3, up: 1.2 });
  if (g.player) g.player.xp = (g.player.xp || 0) + (o.xp ?? 2);
  g.shake = Math.min(18, (g.shake || 0) + (o.shake ?? 3));
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
function add(f) { FX.push(f); return f; }
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
    const u = i / segs, j = (Math.random() - 0.5) * jit;
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
      add({ kind: "note", x: h.x, y: h.y, vx: (6.4 + i * 1.4) * p.facing, vy: -3.2 - i * 1.2, r: 11 + evo, bounces: 0, maxB: 3, life: 220, hit: new Set(), dmg: (16 + evo * 2) * pw(p), color: ["#ffb347", "#ffd36a", "#ff7a3a"][i], rot: 0 });
    }
    boom(g, h.x, h.y, "#ffb347", 8, { star: true });
  },
  hula(g, p, evo) {
    S.hover = 60;
    if (p.vy > 0) p.vy = -2;
    add({ kind: "hula", life: 60, r: 46 + evo * 6, dmg: 7 * pw(p) });
    boom(g, cx(p), cy(p), "#ff5ad5", 12, { star: true });
  },
  ohana(g, p, evo) {
    const heal = 20 + evo * 8;
    p.health = Math.min(p.maxHealth, p.health + heal);
    g.nums.add(cx(p), p.y - 10, "+" + heal, "#6f6", true);
    const R = Math.hypot(viewW(), viewH());
    add({ kind: "ohana", x: cx(p), y: cy(p), r: 0, max: R, life: 44, hit: new Set(), n: 10 + evo * 2, dmg: (30 + evo * 4) * pw(p) });
    g.flash = Math.max(g.flash || 0, 6);
    g.flashColor = "#ffe9a0";
    g.shake = Math.min(18, (g.shake || 0) + 6);
    boom(g, cx(p), cy(p), "#ffd36a", 10, { star: true, up: 2 });
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
    if (pts.length === 1) pts.push({ x: h.x + p.facing * 150, y: h.y + (Math.random() - 0.5) * 20 });
    add({ kind: "chain", pts, life: 18 });
    boom(g, h.x, h.y, "#ffe14a", 8, { star: true });
  },
  blink(g, p, evo) {
    const W = g.worldW || 1600;
    const x0 = p.x, y0 = p.y;
    const dist = 150 + evo * 18;
    const nx = clamp(p.x + p.facing * dist, 30, W - p.w - 30);
    p.x = nx;
    const pl = solidAt(g, cx(p), p.y + p.h - 2) || solidAt(g, cx(p), cy(p));
    if (pl) { p.y = pl.y - p.h; p.vy = 0; }
    p.invuln = Math.max(p.invuln || 0, 12);
    for (let i = 0; i < 4; i++) {
      const u = i / 4;
      g.ghosts.push({ x: x0 + (p.x - x0) * u, y: y0 + (p.y - y0) * u, w: p.w, h: p.h, life: 10 + i * 2, color: "#ffe14a" });
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
    const R = 150 + evo * 18;
    const heal = 6 + evo * 3;
    p.health = Math.min(p.maxHealth, p.health + heal);
    g.nums.add(cx(p), p.y - 10, "+" + heal, "#6f6");
    const slept = [];
    for (const e of g.enemies) {
      if (!canHit(e)) continue;
      if (Math.hypot(cx(e) - cx(p), cy(e) - cy(p)) > R) continue;
      const st = 150 + evo * 20;
      hitEnemy(g, e, 4 * pw(p), { stun: st, color: "#ffb6e4", shake: 0, xp: 1, parts: 4 });
      if (!e.boss) { e.vx = 0; e.telegraph = false; }
      e._sleepUntil = (g.t || 0) + (e.boss ? 20 : st);
      slept.push(e);
    }
    add({ kind: "purr", life: 40, R });
    if (slept.length) add({ kind: "zzz", list: slept, life: 150 + evo * 20 });
    boom(g, cx(p), cy(p), "#ffb6e4", 10, { star: true });
  },
  ninetails(g, p, evo) {
    const targets = g.enemies.filter(canHit).sort((a, b) => Math.hypot(cx(a) - cx(p), cy(a) - cy(p)) - Math.hypot(cx(b) - cx(p), cy(b) - cy(p)));
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 - p.facing * (0.3 + (i / 8) * 2.2) * 1;
      const sp = 3.5 + (i % 3) * 0.6;
      add({
        kind: "wisp", x: cx(p) - p.facing * 8, y: cy(p), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 170, target: targets.length ? targets[i % targets.length] : null, dmg: (13 + evo * 2) * pw(p),
        color: i % 3 === 0 ? "#b78bff" : i % 3 === 1 ? "#ff8ad4" : "#9ae0ff", trail: [], delay: 10 + i * 2, idx: i,
      });
    }
    g.shake = Math.min(18, (g.shake || 0) + 4);
    boom(g, cx(p), cy(p), "#b78bff", 10, { star: true, up: 2 });
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
      const a = (i / (n - 1) - 0.5) * 0.8 + (Math.random() - 0.5) * 0.08;
      const sp = 10 + Math.random() * 3;
      g.projectiles.push({
        x: h.x - 4, y: h.y - 4, vx: Math.cos(a) * sp * p.facing, vy: Math.sin(a) * sp,
        w: 8, h: 8, life: 14 + (Math.random() * 5 | 0), dmg: 6, color: "#fff8e0", shape: "salt", spin: true, rot: Math.random() * 6, owner: "player", trail: false,
      });
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
      S.pull = { e, t: 20 };
      add({ kind: "cheese", e, life: 26, ax: cx(e), ay: cy(e) });
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
    add({ kind: "heat", life: 26, R: 170 + evo * 20, hit: new Set(), dmg: (20 + evo * 3) * pw(p) });
    add({ kind: "slices", n: 6 + evo * 2, i: 0, next: 8, x: cx(p), dmg: (16 + evo * 2) * pw(p) });
    g.flash = Math.max(g.flash || 0, 5);
    g.flashColor = "#ffb060";
    g.shake = Math.min(18, (g.shake || 0) + 6);
  },
};

// ---------------------------------------------------------------------------
// UPDATE de entidades
// ---------------------------------------------------------------------------
const UPD = {
  note(g, f) {
    f.life--;
    f.vy += 0.38;
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
        hitEnemy(g, e, f.dmg, { kx: Math.sign(f.vx) * 6, ky: -3, stun: 16, color: f.color });
      }
    }
    if (f.age % 3 === 0) g.fx.emit(f.x, f.y, { color: f.color, count: 1, size: 2, speed: 0.4, life: 12, gravity: 0 });
    return f.life > 0 && f.x > -40 && f.x < (g.worldW || 1600) + 40 && f.y < (g.worldH || 900) + 40;
  },
  ripple(g, f) { return --f.life > 0; },
  hula(g, f, p) {
    f.life--;
    const x = cx(p), y = cy(p);
    for (const pr of g.projectiles) {
      if (pr.owner === "player") continue;
      const px = pr.x + pr.w / 2, py = pr.y + pr.h / 2;
      if (Math.hypot(px - x, py - y) < f.r + 12) {
        const dx = px - x, dy = py - y, d = Math.hypot(dx, dy) || 1;
        const sp = Math.max(6, Math.hypot(pr.vx || 0, pr.vy || 0) * 1.8);
        pr.owner = "player"; pr.vx = (dx / d) * sp; pr.vy = (dy / d) * sp;
        pr.dmg = 12; pr.color = "#ff5ad5"; pr.life = 70; pr.shape = "heart"; pr.w = Math.max(pr.w, 14); pr.h = Math.max(pr.h, 14);
        g.nums.add(px, py - 8, "¡REFLEJO!", "#ff9ae6");
        boom(g, px, py, "#ff5ad5", 8, { star: true });
      }
    }
    for (const e of g.enemies) {
      if (!canHit(e) || (e._abHitT || 0) > g.t) continue;
      if (Math.hypot(cx(e) - x, cy(e) - y) < f.r + Math.max(e.w, e.h) / 2) {
        e._abHitT = g.t + 12;
        hitEnemy(g, e, f.dmg, { kx: Math.sign(cx(e) - x) * 7, ky: -3, stun: 14, color: "#ff5ad5", xp: 1 });
      }
    }
    if (f.age % 4 === 0) g.fx.emit(x + Math.cos(f.age * 0.5) * f.r, y + Math.sin(f.age * 0.5) * f.r * 0.5, { color: f.age % 8 ? "#ff5ad5" : "#7de87a", count: 1, size: 3, speed: 0.6, life: 16 });
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
      }
    }
    return f.life > 0;
  },
  burst(g, f, p) {
    if (f.next-- > 0) return true;
    const h = hand(p);
    const k = f.i - (f.n - 1) / 2;
    g.projectiles.push({
      x: h.x - 9, y: h.y - 5 + k * 3, vx: 14 * p.facing, vy: k * 0.35,
      w: 20, h: 10, life: 42, dmg: 9, color: f.i % 2 ? "#9ef0ff" : "#5ad1ff", shape: "bolt", owner: "player", trail: true,
    });
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
      const u = Math.random();
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
      const bx = f.x + (Math.random() - 0.5) * 30;
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
  purr(g, f) { return --f.life > 0; },
  zzz(g, f) {
    f.life--;
    f.list = f.list.filter((e) => alive(e) && (e._sleepUntil || 0) > g.t);
    return f.life > 0 && f.list.length > 0;
  },
  wisp(g, f, p) {
    f.life--;
    f.trail.push({ x: f.x, y: f.y });
    if (f.trail.length > 8) f.trail.shift();
    if (f.delay > 0) {
      f.delay--;
      f.vx *= 0.95; f.vy *= 0.95;
    } else {
      if (!alive(f.target)) f.target = nearestEnemy(g, f.x, f.y, 900, null, 0);
      let tx, ty;
      if (f.target) { tx = cx(f.target); ty = cy(f.target); }
      else {
        const a = f.age * 0.08 + f.idx * 0.7;
        tx = cx(p) + Math.cos(a) * 60; ty = cy(p) - 30 + Math.sin(a) * 30;
      }
      const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy) || 1;
      const sp = f.target ? 9.5 : 4;
      f.vx += ((dx / d) * sp - f.vx) * 0.14;
      f.vy += ((dy / d) * sp - f.vy) * 0.14;
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
    if (f.age % 2 === 0) g.fx.emit(f.x + f.f * f.len * (0.6 + Math.random() * 0.4), f.y + (Math.random() - 0.5) * 30, { color: Math.random() < 0.5 ? "#ffb347" : "#666", count: 1, size: 3, up: 1, speed: 1, life: 16 });
    return f.life > 0;
  },
  gust(g, f) { return --f.life > 0; },
  shower(g, f, p) {
    if (f.next-- > 0) return true;
    f.next = 7;
    const cands = g.enemies.filter((e) => canHit(e) && inView(g, e));
    let tx;
    if (cands.length) { const e = cands[f.i % cands.length]; tx = cx(e) + (Math.random() - 0.5) * 30; }
    else tx = cx(p) + f.f * (80 + Math.random() * 420);
    const dir = f.f;
    add({ kind: "meteor", x: tx - dir * 150, y: (g.cam.y || 0) - 60, vx: dir * 3.2, vy: 10.5, r: 11 + Math.random() * 5, dmg: f.dmg, R: f.r, life: 160, rot: Math.random() * 6 });
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
    if (f.age % 2 === 0) g.fx.emit(f.x, f.y, { color: Math.random() < 0.5 ? "#ff6a2a" : "#ffd36a", count: 2, size: 3, speed: 0.8, life: 14, gravity: -0.02 });
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
      f.spikes.push({ x: fr.x, y: top, life: 26, h: 16 + Math.random() * 16, lean: (Math.random() - 0.5) * 0.4 });
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
      if (f.warn % 3 === 0) g.fx.emit(f.x + (Math.random() - 0.5) * 24, f.y, { color: "#c89020", count: 2, size: 2.4, up: 0.8, speed: 0.6, life: 12 });
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
      hitEnemy(g, e, f.dmg, { kx: (Math.random() - 0.5) * 4, ky: -10, stun: 30, color: "#ffd36a" });
    }
    if (f.up % 2 === 0) g.fx.emit(f.x, f.y - f.h, { color: Math.random() < 0.5 ? "#ffd36a" : "#fff0b0", count: 2, size: 3, up: 2, speed: 2, life: 18, gravity: 0.2 });
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
    const x = f.x + (Math.random() * 2 - 1) * 320;
    add({ kind: "slice", x, y: (g.cam.y || 0) - 30 - Math.random() * 60, vx: (Math.random() - 0.5) * 1.5, vy: 4 + Math.random() * 2, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3, dmg: f.dmg, life: 200 });
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
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < f.trail.length; i++) {
    const tr = f.trail[i];
    const k = (i + 1) / f.trail.length;
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
    const k = 1 - f.life / 40;
    for (let i = 0; i < 3; i++) {
      const u = Math.min(1, k * 1.4 - i * 0.18);
      if (u <= 0) continue;
      ctx.globalAlpha = (1 - u) * 0.9;
      ctx.strokeStyle = i === 1 ? "#fff" : "#ffb6e4";
      ctx.lineWidth = 4 - i;
      ctx.beginPath(); ctx.arc(x, y, f.R * u, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = "#ff8ad4";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + k * 2;
      const hx = x + Math.cos(a) * f.R * k * 0.7, hy = y + Math.sin(a) * f.R * k * 0.7;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 4);
      ctx.bezierCurveTo(hx - 7, hy - 2, hx - 4, hy - 7, hx, hy - 3);
      ctx.bezierCurveTo(hx + 4, hy - 7, hx + 7, hy - 2, hx, hy + 4);
      ctx.fill();
    }
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
      ctx.arc(px, py, r * (0.85 + Math.random() * 0.3), 0, TAU);
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
  jaws(ctx, f, cam, t, g, p) {
    const k = f.life / 14;
    const open = k > 0.55 ? (k - 0.55) / 0.45 : 0;
    const x = cx(p) - cam.x + p.facing * (p.w / 2 + f.reach * 0.55), y = p.y + p.h * 0.45 - cam.y;
    const s = f.size;
    ctx.translate(x, y);
    ctx.scale(p.facing, 1);
    ctx.globalAlpha = Math.min(1, k * 2.5);
    if (open === 0) glow(ctx, 0, 0, s * 1.4, "#ffffff", 0.5 * k);
    for (const side of [-1, 1]) {
      const off = side * (4 + open * s * 0.7);
      ctx.fillStyle = "#e8ffe0";
      ctx.strokeStyle = "#2d6a30";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, off);
      ctx.quadraticCurveTo(0, off + side * s * 0.6, s * 0.8, off);
      for (let i = 4; i >= 0; i--) {
        const tx = -s * 0.8 + (i / 4) * s * 1.6;
        ctx.lineTo(tx + s * 0.2, off);
        ctx.lineTo(tx, off - side * s * 0.28);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    if (open === 0 && f.life > 4) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9); ctx.lineTo(Math.cos(a) * s * 1.3, Math.sin(a) * s * 1.3); ctx.stroke();
      }
    }
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
    const x = f.x - cam.x, y = f.y - cam.y;
    const k = f.life / 26;
    const gr = ctx.createRadialGradient(x, y, f.r * 0.2, x, y, Math.max(1, f.r));
    gr.addColorStop(0, "rgba(255,200,90,0)");
    gr.addColorStop(0.75, "rgba(255,140,40," + 0.25 * k + ")");
    gr.addColorStop(1, "rgba(255,90,20," + 0.5 * k + ")");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y, Math.max(1, f.r), 0, TAU); ctx.fill();
    ctx.globalAlpha = k;
    ctx.strokeStyle = "#ffcf6a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * TAU;
      const rr = f.r + Math.sin(a * 8 + t * 0.6) * 5;
      if (i === 0) ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.stroke();
  },
  slice(ctx, f, cam) {
    ctx.translate(f.x - cam.x, f.y - cam.y);
    ctx.rotate(f.rot);
    drawSlice(ctx, 1);
  },
};

// ---------------------------------------------------------------------------
// Dibujo de proyectiles/cortes/rayos genéricos (usados por game.js)
// ---------------------------------------------------------------------------
export function drawProjectile(ctx, pr, cam, t) {
  const x = pr.x - cam.x + pr.w / 2;
  const y = pr.y - cam.y + pr.h / 2;
  ctx.save();
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
  const vfxName = shape === "flame" ? "vfx-flame" : shape === "note" ? "vfx-note" : (shape === "claw" || shape === "crescent" || shape === "slash") ? "vfx-slash" : null;
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
  ctx.restore();
}

export function drawSlash(ctx, s, cam) {
  const k = s.life / s.max;
  const x = s.x - cam.x;
  const y = s.y - cam.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s.facing || 1, 1);
  const slashImg = vfxSprite("vfx-slash");
  if (slashImg) {
    const size = (s.w || 42) * 2.4 * (1.1 - k * 0.15);
    ctx.globalAlpha = Math.min(1, k * 1.3);
    ctx.drawImage(slashImg, 0, -size / 2, size, size);
    ctx.restore();
    return;
  }
  ctx.globalAlpha = Math.min(1, k * 1.4);
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineCap = "round";
  const r = (s.w || 42) * (1.25 - k * 0.2);
  ctx.save();
  ctx.globalAlpha = 0.22 * k;
  ctx.beginPath();
  ctx.arc(8, 0, r * 1.05, -1.2, 1);
  ctx.lineTo(8, 0);
  ctx.fill();
  ctx.restore();
  if (s.kind === "claws") {
    ctx.lineWidth = 3.2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(8, i * 10, r, -0.9, 0.7);
      ctx.stroke();
    }
  } else if (s.kind === "zap") {
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(4, -r * 0.7);
    ctx.lineTo(r * 0.4, -r * 0.15);
    ctx.lineTo(r * 0.15, r * 0.1);
    ctx.lineTo(r, r * 0.55);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (s.kind === "fan") {
    ctx.globalAlpha = k * 0.85;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.quadraticCurveTo(r * 0.5, i * 10, r, i * 14);
      ctx.lineTo(r * 0.6, i * 6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (s.kind === "leaf") {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(6, 0, r, -1.1, 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.55, -8, 5, 9, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.7, 10, 4, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(6, 2, r, -1.05, 0.85);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(8, 2, r * 0.72, -0.9, 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBolt(ctx, b, cam, t) {
  const x1 = b.x1 - cam.x;
  const y1 = b.y1 - cam.y;
  const x2 = b.x2 - cam.x;
  const y2 = b.y2 - cam.y;
  const k = b.life / 14;
  ctx.save();
  ctx.globalAlpha = Math.max(0.3, Math.min(1, k));
  ctx.strokeStyle = "#fffde0";
  ctx.lineWidth = 5 * Math.min(1, k);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segs = 7;
  for (let i = 1; i <= segs; i++) {
    const u = i / segs;
    const jx = (Math.random() - 0.5) * 18 * (i < segs ? 1 : 0);
    const jy = (Math.random() - 0.5) * 18 * (i < segs ? 1 : 0);
    ctx.lineTo(x1 + (x2 - x1) * u + jx, y1 + (y2 - y1) * u + jy);
  }
  ctx.stroke();
  ctx.strokeStyle = "#7ecbff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}
