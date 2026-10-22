// Dino & Dragón · Cinemática de evolución de Dragón: «Ascenso».
// Dragón es CIELO y FUEGO: noche de la caldera, brasas que suben, el dragón
// despega dentro de un vórtice helicoidal de cintas de llama, sus alas lo
// envuelven en un capullo ardiente y se abren de golpe con una corona solar.
// Nunca pisa ni agrieta el suelo (eso es de Dino). Cuatro actos deterministas
// (hash fijo, sin azar), sin gradientes: el arte del personaje se aplana con
// un proxy de contexto. t en segundos; fromForm/toForm en base 1 (1..5).
import dragonArt from "../../characters/art/dragon.js";
import { R } from "../../characters/rig.js";
import { CANVAS_ANATOMY_HEIGHT, heroHeightTarget } from "../../characters/visual-size.js";

export const EVO_CINE_DURATION = 4.5;
export const EVO_CINE_PHASES = Object.freeze({ ember: [0, 1.1], ascent: [1.1, 2.2], cocoon: [2.2, 3.2], reveal: [3.2, 4.5] });
// Nombres reales de characters/roster.js (evoNames de dragon)
export const FORM_NAMES = Object.freeze(["Dragoncito", "Dragón", "Dragón Alado", "Dragón Real", "Dragón Celestial"]);
export const DRAGON_CINE_PALETTE = Object.freeze({ sky: ["#12071a", "#24091e", "#3c0f22"], peaks: ["#2a0c1c", "#1c0814", "#120510"], lava: "#ff5a24", ember: "#ffb04a", core: "#fff0b0", wing: "#3f1638" });
const TAU = Math.PI * 2;
const clampF = (f) => Math.max(1, Math.min(FORM_NAMES.length, (f | 0) || 1));
export const formName = (f) => FORM_NAMES[clampF(f) - 1];
const hash = (n) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (k) => Math.max(0, Math.min(1, k));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const ease = (k) => { k = clamp01(k); return k * k * (3 - 2 * k); };
const out = (k) => 1 - (1 - clamp01(k)) ** 3;
export function evoCinePhase(t) {
  for (const [name, [a, b]] of Object.entries(EVO_CINE_PHASES)) if (t >= a && t < b) return name;
  return "reveal";
}

function pose(form, t, extra = {}) {
  return { form, state: "idle", t: t * 60, phase: t * 9, breath: Math.sin(t * 3) * 0.5, blink: 0, look: { x: 0.2, y: 0 }, sway: 0, bounce: 0,
    atk: 0, flourish: 0, flourishN: 0, cast: 0, castSlot: 0, speed: 0, air: false, reduceMotion: false, facing: 1, ...extra };
}
// El arte del personaje usa gradientes del rig: se aplanan a color sólido.
const FLAT = Symbol("flatGradient");
function flatGradient() { const stops = []; return { [FLAT]: true, stops, addColorStop(o, c) { stops.push([o, c]); } }; }
const flatColor = (g) => (g.stops.length ? g.stops[Math.min(g.stops.length - 1, g.stops.length >> 1)][1] : "#e2343a");
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
/** Real Dragón art, scaled so each form keeps its in-game proportion. */
function drawDragon(ctx, form0, x, y, h, t, extra) {
  const f = Math.max(0, Math.min(4, form0 | 0));
  const s = h * heroHeightTarget("dragon", f) / 151 / CANVAS_ANATOMY_HEIGHT.dragon[f];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  try { dragonArt.draw(flatCtx(ctx), pose(f, t, extra), R); }
  catch { ctx.fillStyle = "#e2343a"; ctx.beginPath(); ctx.ellipse(0, -36, 22, 36, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}

function caldera(ctx, w, h, gy, u, t, rise, celestial) {
  const P = DRAGON_CINE_PALETTE;
  const sky = celestial ? ["#1a1440", "#2c1c5a", "#4a2a6a"] : P.sky;
  ctx.fillStyle = sky[2]; ctx.fillRect(0, 0, w, h);    // opaque base: no residue from the previous frame
  for (let i = 0; i < 3; i++) { ctx.fillStyle = sky[i]; ctx.fillRect(0, gy * i / 3, w, gy / 3 + 1); }
  for (let i = 0; i < 40; i++) {           // stars, drifting down as the dragon rises
    ctx.globalAlpha = 0.3 + hash(i + 40) * 0.6; ctx.fillStyle = "#fff6d0";
    const y = (hash(i + 90) * gy * 0.9 + rise * 120 * u * (0.4 + hash(i))) % gy;
    ctx.fillRect(hash(i) * w, y, 1.6 * u, 1.6 * u);
  }
  ctx.globalAlpha = 1;
  // Jagged volcanic peaks, sinking as the camera follows the ascent.
  for (let l = 0; l < 3; l++) {
    const drop = rise * (30 + l * 40) * u;
    ctx.fillStyle = P.peaks[l];
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let i = 0; i <= 12; i++) {
      const x = w * i / 12, peak = (i % 2 ? 70 : 30) + hash(i + l * 13) * 60;
      ctx.lineTo(x, gy - peak * u * (1 - l * 0.22) + drop);
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    if (l === 0) {                         // lava threads on the far range
      ctx.strokeStyle = P.lava; ctx.globalAlpha = 0.55; ctx.lineWidth = 2 * u;
      for (let i = 1; i < 12; i += 2) { const x = w * i / 12; ctx.beginPath(); ctx.moveTo(x, gy - 90 * u + drop + hash(i) * 20 * u); ctx.lineTo(x + 8 * u, gy - 40 * u + drop); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  }
  ctx.fillStyle = "#0c0408"; ctx.fillRect(0, gy + rise * 60 * u, w, h);
  ctx.fillStyle = P.lava; ctx.globalAlpha = 0.5; ctx.fillRect(0, gy + rise * 60 * u, w, 3 * u); ctx.globalAlpha = 1;
}
function embers(ctx, w, h, u, t, k, celestial) {
  for (let i = 0; i < 26; i++) {
    const x = (hash(i) * w + Math.sin(t * 1.3 + i) * 18 * u + w) % w;
    const y = h - ((t * (60 + hash(i + 3) * 90) * u * (0.6 + k) + hash(i + 7) * h) % h);
    ctx.globalAlpha = (0.35 + 0.5 * hash(i + 11)) * (0.4 + 0.6 * k);
    ctx.fillStyle = i % 3 === 0 ? DRAGON_CINE_PALETTE.core : celestial && i % 2 ? "#8fd8ff" : DRAGON_CINE_PALETTE.ember;
    ctx.beginPath(); ctx.ellipse(x, y, 1.7 * u, (2 + k * 1.2) * u, 0, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function helix(ctx, cx, cy, u, t, k, tight) {
  // Two flame ribbons spiral around the rising body (back half, then front).
  for (let pass = 0; pass < 2; pass++) for (let rib = 0; rib < 2; rib++) {
    ctx.strokeStyle = rib ? DRAGON_CINE_PALETTE.ember : DRAGON_CINE_PALETTE.lava; ctx.lineCap = "round";
    for (let i = 0; i < 26; i++) {
      const a = i * 0.42 + t * 5 + rib * Math.PI, front = Math.sin(a) > 0;
      if (front !== (pass === 1)) continue;
      const r = (90 - tight * 50) * u * (0.7 + 0.3 * Math.sin(i * 0.3));
      const x = cx + Math.cos(a) * r, y = cy + 90 * u - i * 8 * u * (0.6 + k * 0.6);
      ctx.globalAlpha = (0.25 + 0.6 * (1 - i / 26)) * k; ctx.lineWidth = (6 - i * 0.18) * u;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a + Math.PI / 2) * 9 * u, y - 6 * u); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
function wingCocoon(ctx, cx, body, ch, u, close, open, celestial) {
  // Two giant bat wings: folded up and wrapped over the body like a flame bud
  // (close→1), then thrown wide into a V (open→1). Anchored at the shoulders.
  const mem = celestial ? "#ff8a2a" : DRAGON_CINE_PALETTE.wing, rim = celestial ? "#ffe8a0" : "#ff7a3a";
  const L = ch * (0.95 + open * 0.35), cy = body - ch * (0.04 + 0.42 * open);
  for (const side of [-1, 1]) {
    const folded = -Math.PI / 2 - 0.32 * close;            // tip up, curling inward
    const spread = -0.42;                                   // thrown wide
    const ang = folded + (spread - folded) * open;
    ctx.save(); ctx.translate(cx + side * 8 * u, cy); ctx.scale(side, 1); ctx.rotate(ang);
    const pts = [[0, 0], [L * 0.42, -L * 0.3], [L, -L * 0.12]];
    const back = [[L * 0.82, L * 0.12], [L * 0.6, L * 0.16], [L * 0.36, L * 0.14], [L * 0.12, L * 0.1]];
    ctx.fillStyle = mem; ctx.strokeStyle = "#1a0610"; ctx.lineWidth = 3 * u; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
    let prev = pts[2];
    for (const q of back) { ctx.quadraticCurveTo((prev[0] + q[0]) / 2, (prev[1] + q[1]) / 2 - L * 0.08, q[0], q[1]); prev = q; }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 0.35; ctx.fillStyle = rim;
    ctx.beginPath(); ctx.ellipse(L * 0.45, -L * 0.04, L * 0.22, L * 0.1, -0.2, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.85; ctx.strokeStyle = celestial ? "#ffb84a" : "#e07a6e"; ctx.lineWidth = 3.2 * u; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.stroke();
    ctx.lineWidth = 1.8 * u;
    for (const q of back.slice(0, 3)) { ctx.beginPath(); ctx.moveTo(pts[1][0], pts[1][1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
function corona(ctx, cx, cy, u, t, k, celestial) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy);
  for (let i = 0; i < 16; i++) {           // flame petals of the solar crown
    const a = i * TAU / 16 + t * 0.6, r0 = 70 * u * k, r1 = (100 + (i % 2) * 26 + Math.sin(t * 6 + i) * 6) * u * k;
    ctx.globalAlpha = 0.5; ctx.fillStyle = i % 2 ? DRAGON_CINE_PALETTE.ember : DRAGON_CINE_PALETTE.lava;
    ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.12) * r0, Math.sin(a - 0.12) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a + 0.12) * r0, Math.sin(a + 0.12) * r0); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 0.85; ctx.strokeStyle = DRAGON_CINE_PALETTE.core; ctx.lineWidth = 2.5 * u;
  ctx.beginPath(); ctx.arc(0, 0, 70 * u * k, 0, TAU); ctx.stroke();
  if (celestial) {                         // the Celestial Dragon constellation
    const pts = [[-110, -40], [-70, -92], [-14, -112], [42, -96], [96, -58], [120, -6]];
    ctx.strokeStyle = "#cfe8ff"; ctx.lineWidth = 1.4 * u; ctx.globalAlpha = 0.7 * k;
    ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x * u, y * u) : ctx.moveTo(x * u, y * u)); ctx.stroke();
    ctx.fillStyle = "#fff6d0";
    pts.forEach(([x, y], i) => { ctx.beginPath(); ctx.arc(x * u, y * u, (i === 2 ? 4 : 2.6) * u * (1 + 0.2 * Math.sin(t * 5 + i)), 0, TAU); ctx.fill(); });
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
function title(ctx, w, h, u, from, to, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = `bold ${Math.round(32 * u)}px Fredoka, sans-serif`;
  ctx.fillStyle = "#2a0810"; ctx.fillText("¡" + formName(to) + "!", w / 2 + 2 * u, h * 0.12 + 2 * u);
  ctx.fillStyle = to === 5 ? "#ffe680" : "#ffb04a"; ctx.fillText("¡" + formName(to) + "!", w / 2, h * 0.12);
  ctx.font = `${Math.round(15 * u)}px Outfit, sans-serif`; ctx.fillStyle = "#ffd8a0";
  ctx.strokeStyle = "#1a0608"; ctx.lineWidth = 3 * u; ctx.strokeText("Forma " + from + " → " + to, w / 2, h * 0.12 + 24 * u);
  ctx.fillText("Forma " + from + " → " + to, w / 2, h * 0.12 + 24 * u);
  ctx.restore();
}

/** @param opts {reducedMotion?:boolean} — reduced shows the calm reveal frame. */
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2, opts = {}) {
  const reduced = !!opts.reducedMotion;
  t = reduced ? 4.2 : Math.max(0, Math.min(EVO_CINE_DURATION, Number(t) || 0));
  const u = h / 300, cx = w / 2, gy = h * 0.82, to = clampF(toForm), from = clampF(fromForm);
  const celestial = to === 5, ch = h * 0.44;
  const ember = seg(t, 0, 1.1), ascent = seg(t, 1.1, 2.2), cocoon = seg(t, 2.2, 3.2), reveal = seg(t, 3.2, 4.5);
  // The camera follows the climb: the world sinks while the dragon rises.
  const rise = ease(ascent) * (1 - 0.35 * ease(reveal));
  const lift = reduced ? 30 * u : (ease(ascent) * 70 - ease(reveal) * 40) * u + Math.sin(t * 4) * 3 * u * ascent;
  ctx.save();
  caldera(ctx, w, h, gy, u, t, reduced ? 0.4 : rise, celestial && t >= 3.2);
  embers(ctx, w, h, u, t, ember * 0.6 + ascent * 0.4, celestial && t >= 3.2);
  const body = gy - lift;
  if (t < 2.2) {                                       // 1–2 · brasa y despegue
    helix(ctx, cx, body - ch * 0.45, u, t, ascent, 0);
    const look = t < 1.1 ? { state: "cast", castSlot: 2, cast: 0.1 + ember * 0.3 } : { state: "glide", vy: -0.8, move: "fly" };
    drawDragon(ctx, from - 1, cx, body, ch, t, look);
    // chest ember swelling before take-off
    ctx.globalAlpha = 0.5 * ember * (1 - ascent); ctx.fillStyle = DRAGON_CINE_PALETTE.core;
    ctx.beginPath(); ctx.arc(cx + 6 * u, body - ch * 0.38, (4 + ember * 6) * u, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  } else if (t < 3.2) {                                // 3 · capullo de alas en llamas
    helix(ctx, cx, body - ch * 0.45, u, t, 1, ease(cocoon));
    if (cocoon < 0.5) drawDragon(ctx, from - 1, cx, body, ch, t, { state: "glide", vy: -0.4, move: "fly" });
    wingCocoon(ctx, cx, body, ch, u, ease(seg(cocoon, 0, 0.5)), 0, celestial);
    ctx.globalAlpha = 0.2 + 0.6 * seg(cocoon, 0.5, 1); ctx.fillStyle = DRAGON_CINE_PALETTE.core;
    ctx.beginPath(); ctx.ellipse(cx, body - ch * 0.45, 12 * u * (1 + cocoon), 50 * u * (0.5 + cocoon), 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  } else {                                             // 4 · alas abiertas y corona solar
    const open = out(seg(t, 3.2, 3.6));
    corona(ctx, cx, body - ch * 0.5, u, t, reduced ? 1 : out(seg(t, 3.25, 3.9)), celestial);
    if (open < 1) wingCocoon(ctx, cx, body, ch, u, 1, open, celestial);
    if (!reduced && t < 3.34) { ctx.globalAlpha = 1 - seg(t, 3.2, 3.34); ctx.fillStyle = "#fff4d0"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    const extra = reduced ? {} : t < 3.85 ? { state: "cast", castSlot: 2, cast: 0.5 } : { state: "victory" };
    drawDragon(ctx, to - 1, cx, body, ch, t, extra);
  }
  ctx.restore();
  title(ctx, w, h, u, from, to, reduced ? 1 : ease(seg(t, 3.35, 3.8)));
}
export default { id: "dragon", drawEvoCine, EVO_CINE_DURATION, FORM_NAMES };
