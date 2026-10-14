// V373 · Cinemática de evolución de Stitcho ("Experimento 626").
// t en SEGUNDOS desde el inicio, igual que systems/evo-cinema.js (t = (now - t0) / 1000).
// Fases: carga (0–1,5 s) · transformación (1,5–2,6 s) · presentación (2,6–4,0 s).
// Sin gradientes (colores planos), determinista (hash por índice, sin aleatorios por frame).
import stitchArt from "../../characters/art/stitch.js";
import { R } from "../../characters/rig.js";
import { ROSTER } from "../../characters/roster.js";

export const EVO_CINE_DURATION = 4.0;
// Formas 1-based (1 = Mini Stitcho … 5 = Stitcho Nébula), igual que evo-cine/chispin.js.
export const FORM_NAMES = Object.freeze(["Mini Stitcho", "Stitcho", "Stitcho Bravo", "Experimento Ñam", "Stitcho Nébula"]);
export const EVO_CINE_UNITS = "seconds";
export const EVO_CINE_PHASES = Object.freeze({ charge: [0, 1.5], transform: [1.5, 2.6], present: [2.6, 4.0] });
const TAU = Math.PI * 2;
const BLUE = "#2f6bff", CYAN = "#62f3ff", INK = "#060a1c", MAGENTA = "#ff3fa4";
const GLYPHS = ["6", "2", "6", "Ж", "Ψ", "Ω", "Δ", "Ξ", "λ", "∑"];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (k) => 1 - (1 - k) ** 3;
/** Hash determinista 0..1 por índice. */
export function hash01(i, salt = 0) { const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453; return x - Math.floor(x); }

export function evoCinePhase(t) {
  if (t < EVO_CINE_PHASES.charge[1]) return "carga";
  if (t < EVO_CINE_PHASES.transform[1]) return "transformacion";
  return "presentacion";
}
function formName(f) {  // f 0-based interno
  const d = ROSTER.find((r) => r.id === "stitcho");
  return d?.forms?.[f]?.name || FORM_NAMES[f] || "Stitcho";
}
function pose(form, t, extra = {}) {
  return { form, state: "idle", t: t * 60, phase: 0, breath: Math.sin(t * 3) * .5, blink: 0, look: { x: .2, y: 0 }, sway: 0, bounce: 0,
    atk: 0, flourish: 0, flourishN: 0, cast: 0, castSlot: 0, speed: 0, air: false, reduceMotion: true, ...extra };
}
// El arte del personaje crea algunos gradientes al dibujar; aquí se envuelve el
// contexto para que esos gradientes se conviertan en su color de parada central
// (relleno plano): la cinemática no crea NINGÚN gradiente por frame.
const FLAT = Symbol("flatGradient");
function flatGradient() { const stops = []; return { [FLAT]: true, stops, addColorStop(o, c) { stops.push([o, c]); } }; }
const flatColor = (g) => { const st = g.stops; if (!st.length) return "#2f6bff"; return st[Math.min(st.length - 1, Math.floor(st.length / 2))][1]; };
const WRAP = new WeakMap();
export function flatCtx(ctx) {
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
function drawStitcho(ctx, form, x, y, s, t, extra) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  try { stitchArt.draw(flatCtx(ctx), pose(form, t, extra), R); } catch { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.ellipse(0, -40, 26, 40, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function scanlines(ctx, w, h, a) {
  ctx.fillStyle = `rgba(98,243,255,${.07 * a})`;
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.5);
}
function glitchSlices(ctx, w, h, t, k, n = 6) {
  // franjas desplazadas con separación de canales R/B (rellenos planos)
  const step = Math.floor(t * 18);
  for (let i = 0; i < n; i++) {
    const r = hash01(i, step), y = r * h, hh = 4 + hash01(i, step + 9) * 18 * k, off = (hash01(i, step + 3) - .5) * 60 * k;
    ctx.fillStyle = `rgba(255,63,164,${.22 * k})`; ctx.fillRect(off - 4, y, w, hh);
    ctx.fillStyle = `rgba(98,243,255,${.22 * k})`; ctx.fillRect(off + 4, y + 1, w, hh);
  }
}
function helix(ctx, cx, cy, t, k, R0) {
  // doble hélice de ADN 626 + glifos alienígenas en espiral hacia el centro
  ctx.save(); ctx.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    const u = i / 26, a = u * TAU * 2 + t * 3, r = R0 * (1 - k * .7) * (.35 + u * .65);
    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r * .45 - (u - .5) * R0 * .8;
    const x2 = cx + Math.cos(a + Math.PI) * r, y2 = cy + Math.sin(a + Math.PI) * r * .45 - (u - .5) * R0 * .8;
    ctx.strokeStyle = `rgba(98,243,255,${.25 + .5 * k})`; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.fillStyle = i % 2 ? CYAN : MAGENTA;
    ctx.beginPath(); ctx.arc(x1, y1, 2.6, 0, TAU); ctx.arc(x2, y2, 2.6, 0, TAU); ctx.fill();
  }
  ctx.font = `800 ${Math.round(R0 * .09)}px monospace`; ctx.textAlign = "center";
  for (let i = 0; i < 14; i++) {
    const u = (hash01(i, 1) + t * .35) % 1, a = hash01(i, 2) * TAU + u * 5, r = R0 * 1.3 * (1 - u * k);
    ctx.globalAlpha = (1 - u) * k; ctx.fillStyle = i % 3 ? CYAN : "#c5a8ff";
    ctx.fillText(GLYPHS[i % GLYPHS.length], cx + Math.cos(a) * r, cy + Math.sin(a) * r * .7);
  }
  ctx.restore();
}
function pod(ctx, cx, cy, R0, k, t) {
  // cápsula de contención + grilletes que salen volando al romperse (k: 0 entera → 1 rota)
  ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = "#9fb4d8"; ctx.fillStyle = "rgba(98,243,255,.08)";
  if (k <= 0) { ctx.beginPath(); ctx.ellipse(cx, cy, R0 * .55, R0 * .85, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); return; }
  for (let i = 0; i < 12; i++) {
    const a = hash01(i, 5) * TAU, d = R0 * (.5 + easeOut(k) * (1.2 + hash01(i, 6))), rot = k * (hash01(i, 7) - .5) * 8;
    ctx.save(); ctx.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8 + k * k * 60); ctx.rotate(rot);
    ctx.globalAlpha = 1 - k * .8;
    if (i < 4) { ctx.strokeStyle = "#c9d6e8"; ctx.beginPath(); ctx.arc(0, 0, R0 * .07, Math.PI * .2, Math.PI * 1.8); ctx.stroke(); } // grillete roto
    else { ctx.beginPath(); ctx.moveTo(-R0 * .08, 0); ctx.lineTo(R0 * .06, -R0 * .05); ctx.lineTo(R0 * .03, R0 * .07); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore(); void t;
}
function sparkles(ctx, w, h, t, k) {
  for (let i = 0; i < 18; i++) {
    const x = hash01(i, 11) * w, y = hash01(i, 12) * h * .8, tw = .5 + .5 * Math.sin(t * 9 + i);
    ctx.globalAlpha = k * tw; ctx.fillStyle = i % 2 ? CYAN : MAGENTA;
    ctx.fillRect(x, y, 3 + (i % 3) * 2, 2); ctx.fillRect(x + 1, y - 2, 2, 6);
  }
  ctx.globalAlpha = 1;
}

/**
 * Dibuja un frame de la cinemática. t en segundos (0..EVO_CINE_DURATION).
 * fromForm/toForm: 1..5 (1-based, como chispin.js).
 */
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  t = clamp(Number(t) || 0, 0, EVO_CINE_DURATION);
  const from = clamp((fromForm | 0) - 1, 0, 4), to = clamp((toForm | 0) - 1, 0, 4);
  const cx = w / 2, foot = h * .85, R0 = h * .32, s = h / 255;
  const kC = seg(t, 0, 1.5), kT = seg(t, 1.5, 2.6), kP = seg(t, 2.6, 4.0);
  ctx.save();
  ctx.fillStyle = INK; ctx.fillRect(0, 0, w, h);
  // energía azul de fondo (anillos planos)
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) { ctx.strokeStyle = `rgba(47,107,255,${.18 + .15 * kC})`; ctx.beginPath(); ctx.arc(cx, foot - R0 * .6, R0 * (.6 + i * .3) * (1 + .05 * Math.sin(t * 6 + i)), 0, TAU); ctx.stroke(); }
  scanlines(ctx, w, h, 1 - kP * .6);
  const phase = evoCinePhase(t);
  if (phase === "carga") {
    pod(ctx, cx, foot - R0 * .55, R0, 0, t);
    drawStitcho(ctx, from, cx, foot, s * (1 + kC * .06), t, { state: kC > .6 ? "cast" : "idle", castSlot: 0, cast: kC });
    helix(ctx, cx, foot - R0 * .6, t, kC, R0);
    glitchSlices(ctx, w, h, t, kC * .6, 4);
  } else if (phase === "transformacion") {
    // tartamudeo: alterna forma vieja / nueva por franjas desplazadas
    const step = Math.floor(t * 20), showNew = hash01(step, 21) < kT;
    const bands = 7, bh = h / bands;
    for (let i = 0; i < bands; i++) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, i * bh, w, bh + 1); ctx.clip();
      ctx.translate((hash01(i, step) - .5) * 40 * (1 - kT * .5), 0);
      drawStitcho(ctx, (showNew ? hash01(i, step + 1) < .8 : hash01(i, step + 1) < .2) ? to : from, cx, foot, s * (1 + kT * .1), t);
      ctx.restore();
    }
    pod(ctx, cx, foot - R0 * .55, R0, kT, t);
    glitchSlices(ctx, w, h, t, 1 - kT * .3, 9);
    const flash = Math.max(0, 1 - Math.abs(t - 2.05) / .22);
    if (flash > 0) { ctx.globalAlpha = flash * .9; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  } else {
    // presentación: rebote de orejas arriba + nombre
    const hop = Math.abs(Math.sin(kP * Math.PI * 2)) * (1 - kP) * R0 * .18;
    drawStitcho(ctx, to, cx, foot - hop, s * (1.1 - .02 * kP), t, { state: kP < .6 ? "victory" : "idle", stitchoWelcome: null });
    sparkles(ctx, w, h, t, 1 - kP * .5);
    if (kP < .25) glitchSlices(ctx, w, h, t, (.25 - kP) * 3, 3);
    const a = easeOut(seg(t, 2.7, 3.1));
    ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.lineJoin = "round";
    ctx.font = `900 ${Math.round(h * .075)}px Outfit, system-ui, sans-serif`;
    const ty = h * .14 + (1 - a) * 20, name = formName(to).toUpperCase();
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeText(name, cx, ty);
    ctx.fillStyle = MAGENTA; ctx.fillText(name, cx - 2, ty); ctx.fillStyle = CYAN; ctx.fillText(name, cx + 2, ty);
    ctx.fillStyle = "#ffffff"; ctx.fillText(name, cx, ty);
    ctx.font = `700 ${Math.round(h * .035)}px Outfit, system-ui, sans-serif`; ctx.fillStyle = "#bfe9ff";
    ctx.fillText("EXPERIMENTO 626 · FORMA " + (to + 1), cx, ty + h * .055);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
export default { drawEvoCine, EVO_CINE_DURATION, EVO_CINE_UNITS, FORM_NAMES, evoCinePhase };
