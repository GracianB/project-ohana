// ── Cuerno V373 · evolución jugable, intro, muerte, victoria y estallido ──────
// Módulo autónomo (Dino). No toca game.js ni el kit: Ohana lo engancha.
// Sin degradados, sin azar (todo determinista), respeta game.paused.
// Las escalas de daño NO cambian: los mods solo tocan geometría, recuentos y
// desbloqueos. Cualquier multiplicador de daño queda en 1 (lo hace cuerno-kit).
import { drawCuernoV373, cuernoTrailOrigin } from "../characters/art/cuerno-v373.js";
import { healPlayer } from "./mutations.js";

const TAU = Math.PI * 2;
const RAINBOW = Object.freeze(["#ff8fb8", "#ffc46b", "#fff27a", "#8dffb0", "#7ee7ff", "#a99bff"]);
// Nombres = evoNames de characters/roster.js (cuerno)
export const CUERNO_FORM_NAMES = Object.freeze(["Cuernín · Semilla", "Destello · Naciente", "Potro Iris", "Unicornio Estelar", "Unicornio Negro"]);
const clampForm = (f) => Math.max(1, Math.min(5, (f | 0) || 1));
const hash = (n) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const ease = (k) => 1 - (1 - k) * (1 - k);
const k01 = (v) => Math.max(0, Math.min(1, v));

// ── 1 · Evolución jugable ────────────────────────────────────────────────────
// Tabla por forma 1..5. Todo crece (o se mantiene) con la forma.
const MODS = [
  // J: proyectiles y perforación · desbloqueos. K/L/F = 1 (Ohana): el kit de Kilo ya escala con la forma.
  { J: { extra: 0, pierce: 0 }, K: { trailLen: 1, trailW: 1 }, L: { dist: 1 }, F: { radius: 1 }, unlock: { rainbowJump: false, trailStars: false, ringOnEvolve: true } },
  { J: { extra: 0, pierce: 1 }, K: { trailLen: 1, trailW: 1 }, L: { dist: 1 }, F: { radius: 1 }, unlock: { rainbowJump: false, trailStars: false, ringOnEvolve: true } },
  { J: { extra: 1, pierce: 1 }, K: { trailLen: 1, trailW: 1 }, L: { dist: 1 }, F: { radius: 1 }, unlock: { rainbowJump: true, trailStars: false, ringOnEvolve: true } },
  { J: { extra: 1, pierce: 2 }, K: { trailLen: 1, trailW: 1 }, L: { dist: 1 }, F: { radius: 1 }, unlock: { rainbowJump: true, trailStars: false, ringOnEvolve: true } },
  { J: { extra: 2, pierce: 2 }, K: { trailLen: 1, trailW: 1 }, L: { dist: 1 }, F: { radius: 1 }, unlock: { rainbowJump: true, trailStars: true, ringOnEvolve: true } },
].map((m) => Object.freeze({ ...m, dmgMul: 1 }));

export function cuernoFormMods(form) {
  const f = clampForm(form), m = MODS[f - 1];
  return { form: f, name: CUERNO_FORM_NAMES[f - 1], dmgMul: 1,
    J: { ...m.J }, K: { ...m.K }, L: { ...m.L }, F: { ...m.F }, unlock: { ...m.unlock } };
}
// Lista de cosas NUEVAS (no existían) para que Ohana decida.
export const CUERNO_V373_NEW_FOR_OHANA = Object.freeze([
  "J.extra: proyectiles extra de la lanza (forma 3: +1, forma 5: +2). Cada uno usa el daño existente → más daño total si aciertan todos.",
  "J.pierce: perforación (atraviesa 1-2 enemigos) → más daño total con grupos.",
  "unlock.trailStars (forma 5): estallido visual de estrellas en la estela, sin daño.",
  "unlock.rainbowJump (forma 3+): doble salto arcoíris (cuernoDoubleJump de Chispín), sin daño.",
  "Curación del anillo al evolucionar (cuernoEvolveBurst), ver CUERNO_EVOLVE_HEAL.",
]);

// ── helpers de dibujo ───────────────────────────────────────────────────────
function star(ctx, x, y, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function rainbowArc(ctx, x, y, r, band, a0 = Math.PI, a1 = TAU, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineWidth = band;
  RAINBOW.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(x, y, r - i * band, a0, a1); ctx.stroke(); });
  ctx.restore();
}
function note(ctx, x, y, s, color) {
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, s * 0.18);
  ctx.beginPath(); ctx.ellipse(x, y, s * 0.42, s * 0.3, -0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + s * 0.38, y); ctx.lineTo(x + s * 0.38, y - s * 1.2); ctx.lineTo(x + s * 0.8, y - s * 0.9); ctx.stroke();
}
function drawCuerno(ctx, x, y, form, anim, t, scale, facing = 1, atk = 0.5) {
  try { drawCuernoV373(ctx, x, y, { form, anim, t, scale, facing, atk }); }
  catch { ctx.fillStyle = "#f2c1ff"; ctx.beginPath(); ctx.ellipse(x, y - 30 * scale, 26 * scale, 20 * scale, 0, 0, TAU); ctx.fill(); }
}
const formScale = (form) => 0.85 + clampForm(form) * 0.07;

// ── 2 · Intro ───────────────────────────────────────────────────────────────
export const CUERNO_INTRO_DURATION = 2.0;
export function drawCuernoIntro(ctx, w, h, t, form = 5) {
  t = Math.max(0, Math.min(CUERNO_INTRO_DURATION, Number(t) || 0));
  const u = h / 300, gy = h * 0.8, cx = w / 2, s = 1.4 * u * formScale(form);
  ctx.save();
  ctx.fillStyle = "#1a1430"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#2a2040"; ctx.fillRect(0, gy, w, h - gy);
  const gk = ease(k01(t / 1.0));                     // galope 0-1 s
  const x = -60 * u + (cx + 60 * u) * gk;
  // camino arcoíris por detrás
  RAINBOW.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, gy - 4 * u - i * 4 * u, Math.max(0, x - 20 * u), 4 * u); });
  let anim = "walk", lift = 0;
  if (t > 1.0 && t < 1.55) { anim = "victory"; lift = Math.sin(k01((t - 1.0) / 0.55) * Math.PI) * 18 * u; } // encabritarse
  else if (t >= 1.55) anim = "idle";
  if (t > 1.0) {
    ctx.save(); ctx.translate(x, gy - lift); ctx.rotate(-Math.sin(k01((t - 1.0) / 0.55) * Math.PI) * 0.35);
    drawCuerno(ctx, 0, 0, form, anim, t * 60, s); ctx.restore();
  } else drawCuerno(ctx, x, gy - Math.abs(Math.sin(t * 18)) * 4 * u, form, anim, t * 60, s);
  if (t > 1.55) {                                    // pose + destello
    const pk = k01((t - 1.55) / 0.45);
    ctx.fillStyle = "#fff6c8"; ctx.globalAlpha = pk;
    for (let i = 0; i < 6; i++) star(ctx, cx + Math.cos(i * 1.05 + t) * 60 * u, gy - 70 * u + Math.sin(i * 1.05 + t) * 30 * u, 4 * u, t * 2);
    ctx.font = `bold ${Math.round(22 * u)}px sans-serif`; ctx.textAlign = "center";
    ctx.fillText(CUERNO_FORM_NAMES[clampForm(form) - 1], cx, h * 0.14);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ── 3 · Muerte ──────────────────────────────────────────────────────────────
export const CUERNO_DEATH_DURATION = 1.8;
export function drawCuernoDeath(ctx, x, y, t, form = 1) {
  t = Math.max(0, Math.min(CUERNO_DEATH_DURATION, Number(t) || 0));
  const f = clampForm(form), s = formScale(f), H = (40 + f * 12) * s;
  ctx.save();
  if (t < 0.5) {                                     // el cuerno brilla
    drawCuerno(ctx, x, y, f, "death", t * 60, s);
    ctx.fillStyle = "#fff6c8"; ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 20));
    star(ctx, x + 14 * s, y - H, (5 + t * 12) * s, t * 4);
  } else {
    const k = k01((t - 0.5) / 0.9);                  // se deshace en confeti
    ctx.globalAlpha = 1 - k; drawCuerno(ctx, x, y, f, "death", t * 60, s); ctx.globalAlpha = 1;
    const n = 18 + f * 4;
    for (let i = 0; i < n; i++) {
      const a = hash(i) * TAU, sp = (30 + hash(i + 7) * 60) * s;
      const px = x + Math.cos(a) * sp * k, py = y - H * 0.5 + Math.sin(a) * sp * k * 0.7 + k * k * 40 * s;
      ctx.globalAlpha = 1 - k * 0.8; ctx.fillStyle = RAINBOW[i % 6];
      if (i % 4 === 0) star(ctx, px, py, 3.5 * s, k * 6 + i);
      else { ctx.save(); ctx.translate(px, py); ctx.rotate(k * 8 + i); ctx.fillRect(-2.5 * s, -1.5 * s, 5 * s, 3 * s); ctx.restore(); }
    }
    // el cuerno cae el último
    const ck = k01((t - 0.9) / 0.9), hx = x + 10 * s, hy = y - H + ck * ck * H;
    ctx.globalAlpha = 1; ctx.fillStyle = f === 5 ? "#c9b6ff" : "#fff2a8";
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ck * 2.4);
    ctx.beginPath(); ctx.moveTo(-3 * s, 0); ctx.lineTo(0, -16 * s); ctx.lineTo(3 * s, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#b08a30"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2 * s, -4 * s); ctx.lineTo(2 * s, -7 * s); ctx.moveTo(-1.5 * s, -9 * s); ctx.lineTo(1.5 * s, -12 * s); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ── 4 · Victoria ────────────────────────────────────────────────────────────
export const CUERNO_VICTORY_DURATION = 2.0;
export function drawCuernoVictory(ctx, x, y, t, form = 1) {
  t = Math.max(0, Number(t) || 0);
  const f = clampForm(form), s = formScale(f), H = (40 + f * 12) * s;
  const ak = ease(k01(t / 0.6));
  rainbowArc(ctx, x, y - H * 0.4, H * 1.1, 3 * s, Math.PI, Math.PI + Math.PI * ak, 0.9);
  const rear = Math.sin(k01(t / 0.8) * Math.PI) * 0.3;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-rear); drawCuerno(ctx, 0, 0, f, "victory", t * 60, s); ctx.restore();
  for (let i = 0; i < 3 + (f >> 1); i++) {
    const ph = (t * 0.7 + i * 0.29) % 1;
    ctx.globalAlpha = 1 - ph;
    note(ctx, x + (i % 2 ? 1 : -1) * (20 + i * 8) * s, y - H - ph * 40 * s, 7 * s, RAINBOW[(i * 2) % 6]);
  }
  ctx.globalAlpha = 1;
}

// ── 5 · Estallido al evolucionar (cura opcional) ────────────────────────────
// Aprobado por Ohana: 8 % de la vida máx., tope duro 20 PV, una vez por evolución,
// nunca por encima de maxHealth (healPlayer ya lo limita). enabled=false lo apaga.
export const CUERNO_EVOLVE_HEAL = { enabled: true, pct: 0.08, maxAmount: 20, radius: 220 };
export const CUERNO_BURST_LIFE = 50;
const BURSTS = [];
export function cuernoBursts() { return BURSTS; }
function alliesOf(game) {
  const out = [];
  const add = (q) => { if (q && !q.dead && !out.includes(q)) out.push(q); };
  add(game?.player);
  for (const k of ["allies", "players", "partners"]) if (Array.isArray(game?.[k])) game[k].forEach(add);
  return out;
}
export function cuernoEvolveBurst(game, p, opts = {}) {
  if (!game || !p || game.paused) return { healed: [] };
  const form = clampForm((Number(p.evo) || 0) + 1);
  const key = "cuerno-" + form;
  const cx = p.x + (p.w || 0) / 2, cy = p.y + (p.h || 0) / 2;
  if (BURSTS.length > 4) BURSTS.shift();
  BURSTS.push({ x: cx, y: cy, life: CUERNO_BURST_LIFE, form });
  const healed = [];
  const cfg = { ...CUERNO_EVOLVE_HEAL, ...opts };
  if (cfg.enabled && p._cuernoEvoHealed !== key) {
    p._cuernoEvoHealed = key;                          // una vez por evolución
    for (const a of alliesOf(game)) {
      const ax = a.x + (a.w || 0) / 2, ay = a.y + (a.h || 0) / 2;
      if (Math.hypot(ax - cx, ay - cy) > cfg.radius) continue;
      const max = Number(a.maxHealth) || 100, room = Math.max(0, max - (Number(a.health) || 0));
      const amt = Math.min(cfg.maxAmount, room, Math.round(max * cfg.pct));
      if (amt <= 0) continue;
      if (healPlayer(a, amt)) { healed.push(a); game.nums?.add?.(a.x, a.y - 12, "+" + amt, "#8dffb0", true); }
    }
  }
  return { healed };
}
export function updateCuernoBursts(game) {
  if (game?.paused) return;
  for (let i = BURSTS.length - 1; i >= 0; i--) if (--BURSTS[i].life <= 0) BURSTS.splice(i, 1);
}
export function drawCuernoBurst(ctx, b) {
  const k = 1 - b.life / CUERNO_BURST_LIFE, r = 20 + ease(k) * CUERNO_EVOLVE_HEAL.radius;
  ctx.save(); ctx.globalAlpha = 1 - k; ctx.lineWidth = 4;
  RAINBOW.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(1, r - i * 5), 0, TAU); ctx.stroke(); });
  ctx.fillStyle = "#fff6c8";
  for (let i = 0; i < 6 + b.form; i++) { const a = i * TAU / (6 + b.form) + k; star(ctx, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r, 4, k * 4); }
  ctx.restore();
}
export function drawCuernoBursts(ctx) { for (const b of BURSTS) drawCuernoBurst(ctx, b); }
export function resetCuernoEvoV373() { BURSTS.length = 0; }
export { cuernoTrailOrigin };
