// V372 · IA de los bichos de Stitcho: abeja, libélula, araña y murciélago.
// Sin daño ni vida extra: solo mueve (e.vx/e.vy/e.x/e.y) y marca e.telegraph /
// e.lunge / e.diving para que el dibujo avise. El daño sigue siendo el contacto
// existente. Todo ataque pasa antes por una fase de aviso. Límites fijos.
import { isAvispa } from "./stitcho-foes.js";

export const STITCHO_AI_KINDS = Object.freeze(["abeja", "libelula", "arana", "murcielago"]);
export const STITCHO_AI = Object.freeze({
  warn: 36,            // ticks de aviso antes de cualquier ataque (~0,6 s)
  angryT: 90,          // abejas enfadadas tras morir una cerca (~1,5 s)
  angryR: 220, angryBoost: 1.45,
  webMax: 3, webLife: 600, webSlowT: 60, webSlow: .55, webW: 34, webH: 22,
  batWake: 170,
});
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cx = (o) => o.x + o.w / 2, cy = (o) => o.y + o.h / 2;
const alive = (e) => e && e.hp > 0 && !e.dying && !e.fell;

function st(e) {
  return e._sai || (e._sai = { mode: "idle", t: 0, homeX: e.x, homeY: e.y, dir: 1, zig: 1, hang: e.kind === "arana" ? 0 : null, angry: 0, wasAlive: true });
}
function webs(game) { return game._stitchoWebs || (game._stitchoWebs = []); }

/** Notifica muertes: abejas en radio se enfadan (avispas no). Llamado internamente. */
function onBeeDeath(game, dead) {
  for (const o of game.enemies || []) {
    if (o === dead || o.kind !== "abeja" || isAvispa(o) || !alive(o)) continue;
    if (Math.hypot(cx(o) - cx(dead), cy(o) - cy(dead)) <= STITCHO_AI.angryR) st(o).angry = STITCHO_AI.angryT;
  }
}

let COMMIT = true, INTEGRATE = true;
function startWarn(s, next) { if (!COMMIT) { s.t = 20; return; } s.mode = "warn"; s.t = STITCHO_AI.warn; s.next = next; }

function bee(e, s, p, sp) {
  const dx = cx(p) - cx(e), dy = cy(p) - cy(e), d = Math.hypot(dx, dy) || 1;
  if (s.mode === "idle") {
    e.vx = (cx(p) > cx(e) ? 1 : -1) * .5 * sp; e.vy = Math.sin(s.clock * .08) * .9 + clamp((s.homeY - e.y) * .02, -1, 1);
    if (d < 260 && --s.t <= 0) { startWarn(s, "dash"); s.aim = [dx / d, dy / d]; }
  } else if (s.mode === "warn") {
    e.vx *= .8; e.vy *= .8; e.telegraph = true;
    if (--s.t <= 0) { e.telegraph = false; s.mode = "dash"; s.t = 26; }
  } else if (s.mode === "dash") {
    e.vx = s.aim[0] * 7.5 * sp; e.vy = s.aim[1] * 7.5 * sp; e.lunge = 2; e.diving = 1; /* contacto existente: abeja en picado = 14 */
    if (--s.t <= 0) { s.mode = "idle"; s.t = 60; e.lunge = 0; e.diving = 0; }
  }
}
function dragonfly(e, s, p, sp) {
  const dx = cx(p) - cx(e), d = Math.abs(dx);
  if (s.mode === "idle") {
    e.vx *= .9; e.vy = Math.sin(s.clock * .12) * .6;
    if (d < 320 && --s.t <= 0) { startWarn(s, "zig"); s.dir = dx > 0 ? 1 : -1; s.hops = 3; }
  } else if (s.mode === "warn") {
    e.vx = 0; e.vy = 0; e.telegraph = true;
    if (--s.t <= 0) { e.telegraph = false; s.mode = "zig"; s.t = 14; s.zig = -s.zig; }
  } else if (s.mode === "zig") {
    e.vx = s.dir * 6.5 * sp; e.vy = s.zig * 3.2 * sp; e.lunge = 2;
    if (--s.t <= 0) { s.mode = "stop"; s.t = 12; e.lunge = 0; }
  } else if (s.mode === "stop") {
    e.vx = 0; e.vy = 0;                                     // parada seca
    if (--s.t <= 0) { if (--s.hops > 0) { s.mode = "zig"; s.t = 14; s.zig = -s.zig; } else { s.mode = "idle"; s.t = 80; } }
  }
}
function spider(e, s, p, game) {
  const dx = cx(p) - cx(e), d = Math.abs(dx);
  if (s.mode === "idle") {
    // cuelga del hilo: baja cuando el jugador pasa por debajo, sube después
    e.vx = 0;
    const target = d < 120 ? Math.min(140, Math.max(0, p.y - s.homeY)) : 0;
    s.hang += clamp(target - s.hang, -2.2, 1.6);
    e.y = s.homeY + s.hang; e.vy = 0; e.dropping = s.hang > 4;
    if (d < 90 && --s.t <= 0) startWarn(s, "web");
  } else if (s.mode === "warn") {
    e.telegraph = true;
    if (--s.t <= 0) {
      e.telegraph = false; e.lunge = 10;
      const W = webs(game);
      if (W.length >= STITCHO_AI.webMax) W.shift();
      W.push({ x: cx(p) - STITCHO_AI.webW / 2, y: p.y + p.h - STITCHO_AI.webH, w: STITCHO_AI.webW, h: STITCHO_AI.webH, life: STITCHO_AI.webLife, max: STITCHO_AI.webLife });
      s.mode = "idle"; s.t = 150;
    }
  }
  if (e.lunge > 0) e.lunge--;
}
function bat(e, s, p, sp) {
  const dx = cx(p) - cx(e), dy = cy(p) - cy(e), d = Math.hypot(dx, dy);
  if (s.mode === "idle") {                                  // duerme colgado
    e.vx = 0; e.vy = 0; e.x = s.homeX; e.y = s.homeY; e.sleeping = true;
    if (d < STITCHO_AI.batWake) { e.sleeping = false; startWarn(s, "dive"); s.dir = dx > 0 ? 1 : -1; s.drop = Math.max(40, dy); }
  } else if (s.mode === "warn") {
    e.vx = 0; e.vy = 0; e.telegraph = true; e.sleeping = false;
    if (--s.t <= 0) { e.telegraph = false; s.mode = "dive"; s.t = 40; s.u = 0; s.ox = e.x; s.oy = e.y; }
  } else if (s.mode === "dive") {                           // picado en arco
    s.u += 1 / 40; e.diving = true;
    const nx = s.ox + s.dir * 150 * s.u * sp, ny = s.oy + Math.sin(s.u * Math.PI) * s.drop;
    e.x = nx; e.y = ny; e.vx = s.dir * .001; e.vy = 0;
    if (--s.t <= 0) { e.diving = false; s.mode = "back"; s.t = 60; }
  } else if (s.mode === "back") {
    const bx = (s.homeX - e.x) * .06, by = (s.homeY - e.y) * .06; e.x += bx; e.y += by; e.vx = Math.sign(bx) * .001; e.vy = 0;
    if (--s.t <= 0 || Math.hypot(s.homeX - e.x, s.homeY - e.y) < 4) { s.mode = "idle"; e.x = s.homeX; e.y = s.homeY; }
  }
}

/**
 * Gestiona la IA de abeja/libélula/araña/murciélago. Devuelve true si la ha
 * gestionado (el bucle debe saltarse la IA genérica y el movimiento genérico,
 * pero SÍ conservar el contacto/daño existente). Mueve el bicho él mismo.
 */
export function updateStitchoFoe(e, game, dt = 1) {
  if (!e || !STITCHO_AI_KINDS.includes(e.kind) || isAvispa(e) || e.boss) return false;
  const p = game?.player;
  if (!p) return false;
  if (game.paused) return true;                              // congelado en pausa
  const s = st(e);
  if (!alive(e)) {
    if (s.wasAlive && e.kind === "abeja") onBeeDeath(game, e);
    s.wasAlive = false; e.telegraph = false;
    return false;                                            // muerte: la gestiona el genérico
  }
  if ((e.stun || 0) > 5) { e.telegraph = false; if (s.mode !== "idle") { s.mode = "idle"; s.t = 40; } return true; }
  s.clock = (s.clock || 0) + 1;
  if (s.angry > 0) s.angry--;
  const sp = s.angry > 0 ? STITCHO_AI.angryBoost : 1;
  const steps = clamp(Math.round(Number(dt) || 1), 1, 3);
  for (let i = 0; i < steps; i++) {
    if (e.kind === "abeja") bee(e, s, p, sp);
    else if (e.kind === "libelula") dragonfly(e, s, p, sp);
    else if (e.kind === "arana") spider(e, s, p, game);
    else bat(e, s, p, sp);
    if (INTEGRATE && (e.kind === "abeja" || e.kind === "libelula")) { e.x += e.vx; e.y += e.vy; }
    const W = game.worldW || 1e5, H = game.worldH || 1e5;
    e.x = clamp(e.x, 0, W - e.w); e.y = clamp(e.y, 0, H - e.h);
  }
  return true;
}

/** Telas de araña: frenan al jugador ~1 s (sin daño). Llamar una vez por tick. */
export function updateStitchoWebs(game) {
  const W = game?._stitchoWebs, p = game?.player;
  if (!W || game.paused) return;
  for (let i = W.length - 1; i >= 0; i--) {
    const w = W[i];
    if (--w.life <= 0) { W.splice(i, 1); continue; }
    if (p && !p.dead && p.x < w.x + w.w && p.x + p.w > w.x && p.y < w.y + w.h && p.y + p.h > w.y) p._webSlowT = STITCHO_AI.webSlowT;
  }
  if (p && p._webSlowT > 0) { p._webSlowT--; p.vx *= STITCHO_AI.webSlow; }
}
export { drawStitchoWebs } from "./stitcho-foes.js";
export function clearStitchoWebs(game) {
  if (!game) return;
  game._stitchoWebs = [];
  // The web timer is attached to the player, not the room's hazard array.
  // Clearing only the array leaves the player slowed in the next room.
  if (game.player) game.player._webSlowT = 0;
}

/**
 * Enganche de game.js updateEnemies() (mismo patrón que updateKiloFoeAI):
 * se llama tras `if (e.invuln > 0) e.invuln--;`, DESPUÉS del movimiento
 * genérico (e.x += e.vx), así que aquí no se integra: se deja e.vx/e.vy para el
 * siguiente tick. `target` = aiTarget (coop), `canCommit` = enemyCanCommit(e).
 */
export function updateStitchoFoeAI(e, game, dt = 1, { t, target, canCommit = true } = {}) {
  if (!e || !STITCHO_AI_KINDS.includes(e.kind) || isAvispa(e) || e.boss) return false;
  const g = target && game?.player !== target ? { ...game, player: target, enemies: game.enemies, _stitchoWebs: webs(game) } : game;
  COMMIT = canCommit !== false; INTEGRATE = false;
  try { return updateStitchoFoe(e, g, dt); } finally { COMMIT = true; INTEGRATE = true; void t; }
}
