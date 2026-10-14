// Cinemática de evolución de Dragón: vórtice de llamas, alas enormes que se
// despliegan y columna de fuego al cielo. Sin gradientes nuevos ni azar por frame (todo determinista).
// t en segundos. fromForm/toForm en base 1 (1..5), como chispin.js.
import dragonArt from "../../characters/art/dragon.js";
import { R } from "../../characters/rig.js";

export const EVO_CINE_DURATION = 4.0;
export const EVO_CINE_PHASES = Object.freeze({ charge: [0, 1.5], transform: [1.5, 2.8], present: [2.8, 4.0] });
// Nombres reales de characters/roster.js (evoNames de dragon)
export const FORM_NAMES = Object.freeze(["Dragoncito", "Dragón", "Dragón Alado", "Dragón Real", "Dragón Celestial"]);
const TAU = Math.PI * 2;
const clampF = (f) => Math.max(1, Math.min(FORM_NAMES.length, (f | 0) || 1));
export const formName = (f) => FORM_NAMES[clampF(f) - 1];
const hash = (n) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const ease = (k) => 1 - (1 - k) * (1 - k);

function pose(form, t, extra = {}) {
  return { form, state: "idle", t: t * 60, phase: 0, breath: Math.sin(t * 3) * 0.5, blink: 0, look: { x: 0.2, y: 0 }, sway: 0, bounce: 0,
    atk: 0, flourish: 0, flourishN: 0, cast: 0, castSlot: 0, speed: 0, air: false, reduceMotion: true, facing: 1, ...extra };
}
// El arte del personaje usa gradientes del rig: se aplanan a color sólido.
const FLAT = Symbol("flatGradient");
function flatGradient() { const stops = []; return { [FLAT]: true, stops, addColorStop(o, c) { stops.push([o, c]); } }; }
const flatColor = (g) => (g.stops.length ? g.stops[Math.min(g.stops.length - 1, g.stops.length >> 1)][1] : "#e05a2a");
const WRAP = new WeakMap();
function flatCtx(ctx) {
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
function drawDragon(ctx, form, x, y, s, t, extra) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  try { dragonArt.draw(flatCtx(ctx), pose(form, t, extra), R); }
  catch { ctx.fillStyle = "#e05a2a"; ctx.beginPath(); ctx.ellipse(0, -36, 28, 36, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function bigWings(ctx, x, y, span, open, color, rim) {
  for (const d of [-1, 1]) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + d * span * 0.45, y - span * 0.75 * open);
    ctx.lineTo(x + d * span, y - span * 0.55 * open);
    for (let i = 0; i < 4; i++) {          // borde festoneado entre varillas
      const k = 1 - i / 4, k2 = 1 - (i + 1) / 4;
      ctx.quadraticCurveTo(x + d * span * (k + k2) / 2, y - span * 0.1 * open, x + d * span * k2 * 0.95, y - span * 0.45 * open * k2 + span * 0.05);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, span * 0.02);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { ctx.moveTo(x + d * span * 0.45, y - span * 0.75 * open); ctx.lineTo(x + d * span * (1 - i / 4) * 0.95, y - span * 0.45 * open * (1 - i / 4) + span * 0.05); }
    ctx.stroke();
  }
}
function vortex(ctx, cx, cy, t, k, u) {
  for (let i = 0; i < 22; i++) {
    const a = i * 2.39996 + t * (3 + k * 6), r = (180 - k * 140) * u * (0.4 + hash(i) * 0.6);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.45;
    ctx.fillStyle = i % 3 ? "#ff6a20" : "#ffd04a"; ctx.globalAlpha = 0.55 + 0.45 * hash(i + 7);
    ctx.beginPath(); ctx.ellipse(x, y, (6 + hash(i + 2) * 6) * u, 3 * u, a + Math.PI / 2, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function column(ctx, cx, top, bottom, wid, t, u) {
  ctx.fillStyle = "#ff5a14"; ctx.fillRect(cx - wid / 2, top, wid, bottom - top);
  ctx.fillStyle = "#ffb040"; ctx.fillRect(cx - wid * 0.3, top, wid * 0.6, bottom - top);
  ctx.fillStyle = "#fff0b0"; ctx.fillRect(cx - wid * 0.1, top, wid * 0.2, bottom - top);
  ctx.fillStyle = "#ff8a24";
  for (let i = 0; i < 8; i++) {           // lenguas laterales que suben
    const y = bottom - ((t * 260 * u + i * 47 * u) % (bottom - top + 1));
    const d = i % 2 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(cx + d * wid / 2, y); ctx.lineTo(cx + d * (wid / 2 + 12 * u), y - 18 * u); ctx.lineTo(cx + d * wid / 2, y - 26 * u); ctx.fill();
  }
}
function stars(ctx, w, h, u) {
  ctx.fillStyle = "#fff6d0";
  for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.3 + hash(i + 40) * 0.6; ctx.fillRect(hash(i) * w, hash(i + 90) * h * 0.6, 1.5 * u, 1.5 * u); }
  ctx.globalAlpha = 1;
}

export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  t = Math.max(0, Math.min(EVO_CINE_DURATION, Number(t) || 0));
  const u = h / 300, cx = w / 2, gy = h * 0.82, to = clampF(toForm), from = clampF(fromForm);
  const celestial = to === 5;
  ctx.save();
  ctx.fillStyle = celestial && t >= 2.8 ? "#14123a" : "#160a14"; ctx.fillRect(0, 0, w, h);
  stars(ctx, w, h, u);
  ctx.fillStyle = "#24121a"; ctx.fillRect(0, gy, w, h - gy);
  const baseS = 1.3 * u;
  if (t < 1.5) {               // 1 · CARGA: vórtice de llamas que se cierra
    const k = t / 1.5;
    vortex(ctx, cx, gy - 50 * u, t, ease(k), u);
    drawDragon(ctx, from - 1, cx + Math.sin(t * 45) * 1.5 * u * k, gy, baseS, t, k > 0.6 ? { state: "cast", castSlot: 3, cast: 1 } : {});
  } else if (t < 2.8) {        // 2 · TRANSFORMACIÓN: columna de fuego al cielo + alas enormes
    const k = (t - 1.5) / 1.3;
    if (k < 0.1) { ctx.fillStyle = "#fff4d0"; ctx.fillRect(0, 0, w, h); }
    const ck = Math.min(1, k / 0.3);
    column(ctx, cx, (gy - 40 * u) * (1 - ck), gy, (60 - 30 * k) * u, t, u);
    if (k > 0.3) {
      const wk = ease((k - 0.3) / 0.7);
      bigWings(ctx, cx, gy - 70 * u, 200 * u * wk, wk, celestial ? "#ffd84a" : "#c0302a", "#ffe8a0");
    }
    drawDragon(ctx, k < 0.4 ? from - 1 : to - 1, cx, gy, baseS * (1 + 0.3 * ease(k)), t, { state: "cast", castSlot: 3, cast: 1 });
  } else {                     // 3 · PRESENTACIÓN
    const k = Math.min(1, (t - 2.8) / 0.5);
    bigWings(ctx, cx, gy - 80 * u, 165 * u, 0.92 + 0.08 * Math.sin(t * 3), celestial ? "#e8b830" : "#a8241e", "#ffe8a0");
    if (celestial) {           // constelación de 3 estrellas planas (sin halo)
      ctx.fillStyle = "#fff6c0";
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 90 * u, gy - 120 * u + Math.sin(a) * 60 * u, 3.5 * u, 0, TAU); ctx.fill(); }
    }
    drawDragon(ctx, to - 1, cx, gy, baseS * 1.15 + Math.sin(t * 4) * 0.02 * u, t, {});
    ctx.globalAlpha = k; ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(32 * u)}px sans-serif`; ctx.fillStyle = "#2a0810"; ctx.fillText("¡" + formName(to) + "!", cx + 2 * u, h * 0.1 + 2 * u);
    ctx.fillStyle = celestial ? "#ffe680" : "#ffb040"; ctx.fillText("¡" + formName(to) + "!", cx, h * 0.1);
    ctx.font = `${Math.round(15 * u)}px sans-serif`; ctx.fillStyle = "#ffd8a0";
    ctx.strokeStyle = "#1a0608"; ctx.lineWidth = 3 * u; ctx.strokeText("Forma " + from + " → " + to, cx, h * 0.1 + 24 * u);
    ctx.fillText("Forma " + from + " → " + to, cx, h * 0.1 + 24 * u);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
export default { id: "dragon", drawEvoCine, EVO_CINE_DURATION, FORM_NAMES };
