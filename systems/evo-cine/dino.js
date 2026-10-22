// Dino & Dragón · Cinemática de evolución de Dino: «Despertar fósil».
// Dino es TIERRA: valle de helechos, temblor, grietas de luz de geoda, un
// fósil gigante que despierta detrás, capullo de roca que estalla y pisotón
// final con onda de choque. Nada de alas, fuego ni magma (eso es de Dragón).
// Cuatro actos deterministas (hash fijo, sin azar), sin gradientes:
// el arte del personaje se aplana con un proxy de contexto. t en segundos;
// fromForm/toForm en base 1 (1..5), como chispin.js.
import dinoArt from "../../characters/art/dino.js";
import { R } from "../../characters/rig.js";
import { CANVAS_ANATOMY_HEIGHT, heroHeightTarget } from "../../characters/visual-size.js";

export const EVO_CINE_DURATION = 4.5;
export const EVO_CINE_PHASES = Object.freeze({ tremor: [0, 1.1], charge: [1.1, 2.2], cocoon: [2.2, 3.2], reveal: [3.2, 4.5] });
// Nombres reales de characters/roster.js (evoNames de dino)
export const FORM_NAMES = Object.freeze(["Dino Bebé", "Dino", "Dino Pico", "Dino Rex", "Dino Coloso"]);
export const DINO_CINE_PALETTE = Object.freeze({ sky: ["#cfe9c8", "#a9d8b0", "#7fbf98"], hills: ["#5e9c6e", "#3f7a52", "#2a5a3c"], ground: "#4a3a26", light: "#7ff0c8", stone: "#8a7a62", bone: "#efe2c0" });
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
const flatColor = (g) => (g.stops.length ? g.stops[Math.min(g.stops.length - 1, g.stops.length >> 1)][1] : "#55c25a");
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
/** Real Dino art, scaled so each form keeps its in-game proportion. */
function drawDino(ctx, form0, x, y, h, t, extra) {
  const f = Math.max(0, Math.min(4, form0 | 0));
  const s = h * heroHeightTarget("dino", f) / 140 / CANVAS_ANATOMY_HEIGHT.dino[f];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  try { dinoArt.draw(flatCtx(ctx), pose(f, t, extra), R); }
  catch { ctx.fillStyle = "#55c25a"; ctx.beginPath(); ctx.ellipse(0, -36, 34, 30, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}

function valley(ctx, w, h, gy, u, t, shake, final) {
  const P = DINO_CINE_PALETTE;
  const bands = final ? ["#bfe6dc", "#94d0c4", "#6ab3a6"] : P.sky;
  for (let i = 0; i < 3; i++) { ctx.fillStyle = bands[i]; ctx.fillRect(0, gy * i / 3, w, gy / 3 + 1); }
  // Morning sun disc and three soft rings (flat fills, no gradients).
  for (let i = 3; i >= 0; i--) { ctx.globalAlpha = i ? 0.12 : 0.9; ctx.fillStyle = "#fff6d8"; ctx.beginPath(); ctx.arc(w * 0.78, gy * 0.32, (26 + i * 18) * u, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  // Three hill layers with sauropod necks and fern crowns.
  for (let l = 0; l < 3; l++) {
    ctx.fillStyle = P.hills[l];
    ctx.beginPath(); ctx.moveTo(0, gy);
    for (let i = 0; i <= 10; i++) ctx.lineTo(w * i / 10, gy - (40 + l * 18 + Math.sin(i * 1.7 + l * 2) * 18) * u * (1 - l * 0.25) + shake * (l + 1) * 0.4);
    ctx.lineTo(w, gy); ctx.closePath(); ctx.fill();
    if (l === 0) for (let k = 0; k < 2; k++) {
      const sx = w * (0.16 + k * 0.5), sy = gy - 52 * u;
      ctx.beginPath(); ctx.ellipse(sx, sy, 34 * u, 13 * u, 0, 0, TAU); ctx.fill();
      ctx.lineWidth = 9 * u; ctx.strokeStyle = P.hills[0]; ctx.lineCap = "round";
      const nod = Math.sin(t * 0.8 + k * 2) * 6 * u;
      ctx.beginPath(); ctx.moveTo(sx + 24 * u, sy - 4 * u); ctx.quadraticCurveTo(sx + 48 * u, sy - 44 * u + nod, sx + 64 * u, sy - 50 * u + nod); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - 28 * u, sy); ctx.quadraticCurveTo(sx - 52 * u, sy + 2 * u, sx - 70 * u, sy + 10 * u); ctx.stroke();
    }
  }
  for (let i = 0; i < 6; i++) {           // ferns in the foreground
    const fx = w * (i + 0.5) / 6 + (hash(i) - 0.5) * 40 * u, fy = gy;
    ctx.strokeStyle = i % 2 ? "#2f6a40" : "#3c7f4c"; ctx.lineWidth = 2.4 * u;
    for (let j = -3; j <= 3; j++) {
      const a = -Math.PI / 2 + j * 0.32 + Math.sin(t * 1.3 + i) * 0.05;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + Math.cos(a) * 18 * u, fy + Math.sin(a) * 26 * u, fx + Math.cos(a) * 30 * u, fy + Math.sin(a) * 22 * u); ctx.stroke();
    }
  }
  ctx.fillStyle = P.ground; ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = "#5c4a32"; ctx.fillRect(0, gy, w, 5 * u);
}
function fossil(ctx, cx, gy, u, k, t) {
  if (k <= 0.01) return;
  // A giant T-rex skull fossil wakes in the cliff behind (bone line art).
  ctx.save(); ctx.globalAlpha = 0.55 * k; ctx.translate(cx - 10 * u, gy - 150 * u); ctx.scale(u, u);
  ctx.strokeStyle = DINO_CINE_PALETTE.bone; ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.lineCap = "round";
  const jaw = Math.sin(t * 6) * 4 * k;
  ctx.beginPath(); ctx.moveTo(-90, 10); ctx.quadraticCurveTo(-70, -48, 10, -50); ctx.quadraticCurveTo(80, -48, 104, -10); ctx.lineTo(96, 6); ctx.lineTo(-40, 12); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, 18 + jaw); ctx.lineTo(92, 16 + jaw); ctx.lineTo(70, 40 + jaw); ctx.lineTo(-30, 40 + jaw); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-6, -20, 13, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(52, -22, 8, 12, 0.3, 0, TAU); ctx.stroke();
  for (let i = 0; i < 7; i++) { const x = -26 + i * 17; ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x + 4, 22); ctx.lineTo(x + 8, 10); ctx.stroke(); }
  ctx.globalAlpha = 0.8 * k; ctx.fillStyle = DINO_CINE_PALETTE.light;
  ctx.beginPath(); ctx.arc(-6, -20, 5 + 3 * Math.sin(t * 8), 0, TAU); ctx.fill();
  ctx.restore();
}
function cracks(ctx, cx, gy, k, u, light) {
  if (k <= 0) return;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? "#eafff6" : light; ctx.lineWidth = (pass ? 1.4 : 4) * u;
    ctx.globalAlpha = pass ? 0.9 : 0.75;
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 ? 1 : -1, len = (50 + hash(i + 3) * 150) * k * u;
      ctx.beginPath(); ctx.moveTo(cx, gy + 2 * u);
      let x = cx, y = gy + 2 * u;
      for (let j = 1; j <= 4; j++) { x += dir * len / 4; y += (hash(i * 7 + j) * 0.8 + 0.1) * 6 * u; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
function pebbles(ctx, cx, gy, u, t, k) {
  for (let i = 0; i < 14; i++) {
    const x = cx + (hash(i) - 0.5) * 360 * u, hop = Math.abs(Math.sin(t * (9 + hash(i + 4) * 5) + i)) * 10 * u * k;
    ctx.fillStyle = i % 3 ? DINO_CINE_PALETTE.stone : "#b8a47e";
    ctx.beginPath(); ctx.ellipse(x, gy - 2 * u - hop, (2 + hash(i + 9) * 3) * u, (1.6 + hash(i + 2) * 2) * u, 0, 0, TAU); ctx.fill();
  }
}
function orbitRocks(ctx, cx, cy, u, t, k, n) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + t * (1.4 + k * 2.2), r = (120 - k * 64) * u * (0.6 + hash(i) * 0.4);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.42 - k * 30 * u * hash(i + 5);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2);
    const s = (5 + hash(i + 1) * 6) * u;
    ctx.fillStyle = i % 4 === 0 ? DINO_CINE_PALETTE.light : DINO_CINE_PALETTE.stone; ctx.strokeStyle = "#2c2418"; ctx.lineWidth = 1.5 * u;
    ctx.beginPath(); ctx.moveTo(-s, -s * 0.4); ctx.lineTo(-s * 0.2, -s); ctx.lineTo(s, -s * 0.3); ctx.lineTo(s * 0.6, s * 0.8); ctx.lineTo(-s * 0.7, s * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}
function geode(ctx, cx, gy, u, close, burst, light) {
  // Stone petals close around Dino, glow through seams, then burst outward.
  const n = 7;
  for (let i = 0; i < n; i++) {
    const side = i - (n - 1) / 2, base = cx + side * 22 * u;
    const lean = (1 - close) * side * 0.22 + burst * side * 0.9;
    const fly = burst * (60 + hash(i) * 80) * u;
    ctx.save(); ctx.translate(base + Math.sign(side || 1) * fly, gy - burst * hash(i + 3) * 70 * u); ctx.rotate(lean);
    const hh = (110 - Math.abs(side) * 18) * u * ease(close);
    ctx.fillStyle = i % 2 ? "#7b6c56" : "#9a8a6c"; ctx.strokeStyle = "#2c2418"; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.moveTo(-13 * u, 0); ctx.lineTo(-9 * u, -hh); ctx.lineTo(2 * u, -hh - 14 * u); ctx.lineTo(12 * u, -hh * 0.92); ctx.lineTo(13 * u, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = light; ctx.lineWidth = 2.2 * u; ctx.globalAlpha = 0.4 + 0.6 * close;
    ctx.beginPath(); ctx.moveTo(0, -6 * u); ctx.lineTo(3 * u, -hh * 0.4); ctx.lineTo(-2 * u, -hh * 0.75); ctx.stroke();
    ctx.restore();
  }
}
function shockwave(ctx, cx, gy, u, k, light) {
  for (let i = 0; i < 3; i++) {
    const kk = clamp01(k * 1.4 - i * 0.22); if (kk <= 0 || kk >= 1) continue;
    ctx.globalAlpha = (1 - kk) * 0.85; ctx.strokeStyle = i ? "#fff6dc" : light; ctx.lineWidth = (5 - i) * u;
    ctx.beginPath(); ctx.ellipse(cx, gy + 2 * u, (30 + kk * 260) * u, (6 + kk * 22) * u, 0, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < 10; i++) {           // dust plumes
    const kk = clamp01(k * 1.2 - hash(i) * 0.2), side = i % 2 ? 1 : -1;
    ctx.globalAlpha = (1 - kk) * 0.7; ctx.fillStyle = "#e4dcc8";
    ctx.beginPath(); ctx.arc(cx + side * (30 + kk * (90 + hash(i + 1) * 120)) * u, gy - (4 + kk * 26 * hash(i + 6)) * u, (6 + kk * 14) * u, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function leaves(ctx, w, gy, u, t, k) {
  for (let i = 0; i < 16; i++) {
    const x = (hash(i) * w + t * 30 * u * (0.5 + hash(i + 2))) % w, y = ((hash(i + 7) * gy) + t * 60 * u * (0.6 + hash(i + 3))) % gy;
    ctx.globalAlpha = 0.75 * k; ctx.fillStyle = i % 3 ? "#5fae4e" : "#9fe27e";
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 5 * u, 2.2 * u, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function title(ctx, w, h, u, from, to, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = `bold ${Math.round(32 * u)}px Fredoka, sans-serif`;
  ctx.fillStyle = "#1f3a26"; ctx.fillText("¡" + formName(to) + "!", w / 2 + 2 * u, h * 0.12 + 2 * u);
  ctx.fillStyle = to === 5 ? "#bff8ec" : "#fff3d2"; ctx.fillText("¡" + formName(to) + "!", w / 2, h * 0.12);
  ctx.font = `${Math.round(15 * u)}px Outfit, sans-serif`; ctx.strokeStyle = "#1f3a26"; ctx.lineWidth = 3 * u; ctx.fillStyle = "#e8f6d6";
  ctx.strokeText("Forma " + from + " → " + to, w / 2, h * 0.12 + 24 * u); ctx.fillText("Forma " + from + " → " + to, w / 2, h * 0.12 + 24 * u);
  ctx.restore();
}

/** @param opts {reducedMotion?:boolean} — reduced shows the calm reveal frame. */
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2, opts = {}) {
  const reduced = !!opts.reducedMotion;
  t = reduced ? 4.2 : Math.max(0, Math.min(EVO_CINE_DURATION, Number(t) || 0));
  const u = h / 300, cx = w / 2, gy = h * 0.8, to = clampF(toForm), from = clampF(fromForm);
  const final = to === 5, light = final ? "#5ff0d0" : DINO_CINE_PALETTE.light;
  const ch = h * 0.42;                                 // on-screen height of a 140 px form
  const tremor = seg(t, 0, 1.1), charge = seg(t, 1.1, 2.2), cocoon = seg(t, 2.2, 3.2), reveal = seg(t, 3.2, 4.5);
  const shake = reduced ? 0 : (Math.sin(t * 47) * (tremor * 1.5 + charge * 3) * (1 - cocoon)) * u + (t > 3.2 && t < 3.6 ? Math.sin(t * 80) * 4 * u * (1 - seg(t, 3.2, 3.6)) : 0);
  ctx.save();
  ctx.translate(shake, 0);
  valley(ctx, w, h, gy, u, t, shake, final);
  fossil(ctx, cx, gy, u, ease(charge) * (1 - reveal * 0.6) + (final ? reveal * 0.5 : 0), t);
  pebbles(ctx, cx, gy, u, t, t < 3.2 ? 0.3 + tremor * 0.7 : 1 - reveal);
  cracks(ctx, cx, gy, out(charge) * (1 - reveal * 0.5), u, light);
  if (t < 2.2) {                                       // 1–2 · temblor y carga
    const crouch = ease(seg(t, 0.5, 2.0));
    drawDino(ctx, from - 1, cx, gy, ch, t, t < 0.6 ? {} : { state: "cast", castSlot: 2, cast: 0.15 + crouch * 0.25 });
    orbitRocks(ctx, cx, gy - ch * 0.4, u, t, charge, 6 + Math.round(charge * 8));
  } else if (t < 3.2) {                                // 3 · capullo de piedra
    orbitRocks(ctx, cx, gy - ch * 0.45, u, t, 1, 14);
    if (cocoon < 0.55) drawDino(ctx, from - 1, cx, gy, ch, t, { state: "cast", castSlot: 2, cast: 0.4 });
    geode(ctx, cx, gy, u, ease(seg(cocoon, 0, 0.55)), 0, light);
    if (cocoon > 0.55) {                               // light leaks through the seams
      ctx.globalAlpha = 0.25 + 0.5 * seg(cocoon, 0.55, 1); ctx.fillStyle = light;
      ctx.beginPath(); ctx.ellipse(cx, gy - 60 * u, 30 * u * (1 + cocoon), 70 * u, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
  } else {                                             // 4 · estallido, pisotón y revelación
    const burst = out(seg(t, 3.2, 3.6));
    if (burst < 1) geode(ctx, cx, gy, u, 1, burst, light);
    if (!reduced && t < 3.34) { ctx.globalAlpha = 1 - seg(t, 3.2, 3.34); ctx.fillStyle = "#f4fff8"; ctx.fillRect(-10, 0, w + 20, h); ctx.globalAlpha = 1; }
    shockwave(ctx, cx, gy, u, seg(t, 3.25, 4.3), light);
    const stomp = seg(t, 3.3, 3.9);
    const extra = stomp < 1 ? { state: "cast", castSlot: 2, cast: 0.3 + stomp * 0.4 } : { state: "victory" };
    drawDino(ctx, to - 1, cx, gy, ch, t, reduced ? {} : extra);
    leaves(ctx, w, gy, u, t, reduced ? 0.6 : reveal);
  }
  ctx.restore();
  title(ctx, w, h, u, from, to, reduced ? 1 : ease(seg(t, 3.35, 3.8)));
}
export default { id: "dino", drawEvoCine, EVO_CINE_DURATION, FORM_NAMES };
