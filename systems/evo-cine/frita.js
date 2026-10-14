// V372 · Cinemática de evolución de Frita.
// Unidades: `t` en SEGUNDOS (0..EVO_CINE_DURATION), igual que evo-cinema.js.
// Identidad: freidora (cesta, aceite que burbujea), sal gorda, kétchup y patatas.
// Reutiliza drawCharacter con un muñeco. Sin gradientes por frame (halo cacheado).
import { drawCharacter } from "../../characters/draw.js";
import { ROSTER } from "../../characters/roster.js";

export const EVO_CINE_DURATION = 4.0; // s
export const EVO_CINE_PHASES = Object.freeze({ charge: [0, 1.4], transform: [1.4, 2.6], reveal: [2.6, 4.0] });
export const FRITA_FORM_NAMES = Object.freeze(["Palito", "Frita", "Capitán Kétchup", "Extra Crujiente", "Frita Centella"]);
const COL = { bg: "#2a1208", tile: "#3a1c0e", tile2: "#33180c", oil: "#e8a22a", oil2: "#ffcf5a", steel: "#9aa6b8", steel2: "#5a6474", red: "#d42020", red2: "#ff5a4a", salt: "#fff8e0", fry: "#ffd36a", fry2: "#8a4a10", white: "#fff6e8" };
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeOut = (k) => 1 - (1 - k) ** 3;
const easeBack = (k) => { const c = 1.7; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
export function evoCinePhase(t) { return t < 1.4 ? "carga" : t < 2.6 ? "transformacion" : "presentacion"; }
// Convención Ohana: formas 1..5 (1 = inicial). También acepta el nombre de forma del roster.
const formIndex = (f) => clamp(typeof f === "string" && !Number.isFinite(+f) ? Math.max(0, NAMES_REF().indexOf(f)) : Math.floor(Number(f) || 1) - 1, 0, 4);
function NAMES_REF() { return FRITA_FORM_NAMES; }


// drawCharacter (rig.js, evolution.js, art/*.js) crea gradientes en cada frame.
// Envolvemos el ctx: create*Gradient devuelve un "gradiente plano" que guarda
// sus paradas y, al asignarse como fill/stroke, se convierte en el color central.
// Resultado: cero gradientes nativos creados durante la cinemática.
const FLAT = Symbol("flatGradient"), WRAP = new WeakMap();
function flatGradient() { const stops = []; return { [FLAT]: stops, addColorStop(o, c) { stops.push([+o || 0, String(c)]); } }; }
function flatColor(g) { const st = g[FLAT]; if (!st.length) return "rgba(0,0,0,0)"; st.sort((a, b) => a[0] - b[0]); return st[Math.floor((st.length - 1) / 2)][1]; }
export function flatCtx(ctx) {
  if (!ctx || typeof ctx !== "object") return ctx;
  if (WRAP.has(ctx)) return WRAP.get(ctx);
  const px = new Proxy(ctx, {
    get(o, k) {
      if (k === "createLinearGradient" || k === "createRadialGradient" || k === "createConicGradient") return flatGradient;
      const v = o[k]; return typeof v === "function" ? v.bind(o) : v;
    },
    set(o, k, v) { o[k] = v && v[FLAT] ? flatColor(v) : v; return true; },
  });
  WRAP.set(ctx, px); return px;
}
const haloCache = new WeakMap();
function halo(ctx) {
  let g = haloCache.get(ctx);
  if (!g && typeof ctx.createRadialGradient === "function") {
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, "rgba(255,220,120,.9)"); g.addColorStop(.5, "rgba(255,120,40,.35)"); g.addColorStop(1, "rgba(255,80,30,0)");
    haloCache.set(ctx, g);
  }
  return g || "rgba(255,180,80,.3)";
}
function fry(ctx, x, y, len, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = COL.fry2; ctx.fillRect(-len * .14, -len / 2 - 1, len * .28, len + 2);
  ctx.fillStyle = COL.fry; ctx.fillRect(-len * .1, -len / 2, len * .2, len); ctx.restore();
}
function splat(ctx, x, y, r, rot) {
  ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  for (let i = 0; i < 5; i++) { const a = rot + i * 1.26; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1, r * .35, 0, TAU); ctx.fill(); }
  ctx.fillStyle = COL.red2; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .3, r * .3, 0, TAU); ctx.fill();
}
function text(ctx, s, x, y, size, col) {
  ctx.font = "900 " + Math.round(size) + "px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, size * .18); ctx.strokeStyle = "#2a1008"; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function drawFrita(ctx, evo, fx, fy, H, t, pose, draw) {
  const def = ROSTER.find((r) => r.id === "frita") || ROSTER[0], f = def.forms?.[evo] || def;
  const p = { id: "frita", evo, color: f.color || def.color, w: f.w || 20, h: f.h || 30, x: 0, y: 0, facing: 1, grounded: true, vx: 0, vy: 0, melee: 0, invuln: 0, visualScale: 1, _poseOverride: pose, _evoT: 0, health: 1, maxHealth: 1 };
  const s = H / (p.h * 1.9);
  ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s); p.x = -p.w / 2; p.y = -p.h;
  try { draw(flatCtx(ctx), p, { x: 0, y: 0 }, t * 60, { reduceMotion: false }); } catch { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h); }
  ctx.restore();
}

/** Igual que evo-cine/kilo.js: t en segundos; formas 1..5 (1 = inicial) o nombre. */
export function drawEvoCine(ctx, w, h, t, fromForm, toForm, opts = {}) {
  if (!ctx || !(w > 0) || !(h > 0)) return "none";
  const draw = opts.drawActor || drawCharacter;
  const from = formIndex(fromForm), to = toForm == null ? Math.min(4, from + 1) : formIndex(toForm);
  t = clamp(Number(t) || 0, 0, EVO_CINE_DURATION);
  const phase = evoCinePhase(t), cx = w / 2, foot = h * .72, H = Math.min(h * .5, w * .42);
  const kC = seg(t, 0, 1.4), kT = seg(t, 1.4, 2.6), kR = seg(t, 2.6, 4.0);
  ctx.save();
  // cocina: azulejos planos
  ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, w, h);
  const ts = Math.max(18, Math.min(w, h) / 9);
  ctx.fillStyle = COL.tile;
  for (let y = 0; y < h * .78; y += ts) for (let x = ((y / ts) % 2) * ts; x < w; x += ts * 2) ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
  // cuba de aceite (suelo) que sube con la carga
  const oilY = h * .78 - (phase === "carga" ? kC : phase === "transformacion" ? 1 : 1 - easeOut(kR)) * h * .06;
  ctx.fillStyle = COL.steel2; ctx.fillRect(0, oilY - 6, w, h - oilY + 6);
  ctx.fillStyle = COL.oil; ctx.fillRect(0, oilY, w, h - oilY);
  ctx.fillStyle = COL.oil2;
  for (let i = 0; i < 14; i++) { const k = ((t * (1.2 + kC * 2) + i * .37) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc((i * 89) % w, oilY + 6 - k * 26, 3 + (i % 3) * 2, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  // halo cacheado
  const hr = H * (phase === "carga" ? .4 + kC * .3 : phase === "transformacion" ? .8 + Math.sin(kT * Math.PI) * .5 : .85);
  ctx.save(); ctx.translate(cx, foot - H * .45); ctx.scale(hr, hr); ctx.fillStyle = halo(ctx); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();

  if (phase === "carga") {
    // cesta de freidora baja sobre Frita; sal gorda cayendo
    const by = foot - H * (1.25 - kC * .5);
    drawFrita(ctx, from, cx + Math.sin(t * 14) * kC * 2, foot, H * .8, t, "idle", draw);
    ctx.strokeStyle = COL.steel; ctx.lineWidth = 3;
    ctx.strokeRect(cx - H * .32, by, H * .64, H * .5);
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx - H * .32 + i * H * .128, by); ctx.lineTo(cx - H * .32 + i * H * .128, by + H * .5); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx + H * .32, by + H * .1); ctx.lineTo(cx + H * .7, by - H * .1); ctx.stroke();
    ctx.fillStyle = COL.salt;
    for (let i = 0; i < 24; i++) ctx.fillRect((i * 53) % w, ((t * 140 + i * 41) % (h * .75)), 3, 3);
    text(ctx, "¡AL ACEITE…!", cx, h * .12, Math.min(w, h) * .055 * (.6 + kC * .4), COL.oil2);
  } else if (phase === "transformacion") {
    // chisporroteo: patatas que giran en espiral + parpadeo de formas
    const rate = 4 + kT * 18, showNew = Math.sin(t * rate * Math.PI) > (1 - kT * 2);
    drawFrita(ctx, showNew ? to : from, cx, foot, H * (showNew ? 1 : .8) * (1 + Math.sin(kT * Math.PI) * .15), t, showNew ? "victory" : "idle", draw);
    const R = H * (.3 + kT * .5);
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * 4; fry(ctx, cx + Math.cos(a) * R, foot - H * .45 + Math.sin(a) * R * .5, H * .1, a); }
    for (let i = 0; i < 6; i++) { const a = i * 1.05 - t * 3; splat(ctx, cx + Math.cos(a) * R * 1.2, foot - H * .45 + Math.sin(a) * R * .6, H * .025, a); }
    if (kT > .85) { ctx.globalAlpha = (kT - .85) / .15; ctx.fillStyle = COL.white; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  } else {
    const k = easeBack(clamp(kR / .35, 0, 1));
    if (kR < .12) { ctx.globalAlpha = 1 - kR / .12; ctx.fillStyle = COL.white; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    // abanico de patatas detrás (como un cucurucho gigante)
    for (let i = 0; i < 9; i++) fry(ctx, cx + (i - 4) * H * .07, foot - H * (.85 + Math.abs(i - 4) * -.03) * k, H * .45, (i - 4) * .12);
    drawFrita(ctx, to, cx, foot, H * (.7 + .3 * k), t, "victory", draw);
    for (let i = 0; i < 10; i++) splat(ctx, (i * 131 + 40) % w, h * (.2 + ((i * 37) % 50) / 100), 4 + (i % 3) * 2 * k, i);
    ctx.fillStyle = COL.salt;
    for (let i = 0; i < 20; i++) ctx.fillRect((i * 71) % w, ((t * 90 + i * 29) % (h * .75)), 2.5, 2.5);
    ctx.globalAlpha = clamp(kR * 4, 0, 1);
    text(ctx, "¡TODO AL PUNTO!", cx, h * .1, Math.min(w, h) * .04, COL.salt);
    text(ctx, "¡" + FRITA_FORM_NAMES[to].toUpperCase() + "!", cx, h * .18, Math.min(w, h) * .08 * (.8 + .2 * k), COL.oil2);
    text(ctx, "Forma " + (to + 1) + " de 5", cx, h * .92, Math.min(w, h) * .035, COL.white);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return phase;
}
