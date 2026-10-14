// Cinemática de evolución de Dino: fuego y alas, grietas de magma, anillo de rugido,
// meteoro de brasas y onda de pisotón. Sin gradientes nuevos ni azar por frame (todo determinista).
// t en segundos. fromForm/toForm en base 1 (1..5), como chispin.js.
import dinoArt from "../../characters/art/dino.js";
import { R } from "../../characters/rig.js";

export const EVO_CINE_DURATION = 4.0;
export const EVO_CINE_PHASES = Object.freeze({ charge: [0, 1.5], transform: [1.5, 2.8], present: [2.8, 4.0] });
// Nombres reales de characters/roster.js (evoNames de dino)
export const FORM_NAMES = Object.freeze(["Dino Bebé", "Dino", "Dino Pico", "Dino Rex", "Dino Coloso"]);
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
const flatColor = (g) => (g.stops.length ? g.stops[Math.min(g.stops.length - 1, g.stops.length >> 1)][1] : "#8bd64a");
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
function drawDino(ctx, form, x, y, s, t, extra) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  try { dinoArt.draw(flatCtx(ctx), pose(form, t, extra), R); }
  catch { ctx.fillStyle = "#7cc84a"; ctx.beginPath(); ctx.ellipse(0, -36, 28, 36, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function wings(ctx, x, y, span, open, color) {
  ctx.fillStyle = color;
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + d * span * 0.5, y - span * 0.6 * open, x + d * span, y - span * 0.35 * open);
    ctx.lineTo(x + d * span * 0.75, y - span * 0.05); ctx.lineTo(x + d * span * 0.5, y - span * 0.12 * open);
    ctx.lineTo(x + d * span * 0.3, y + span * 0.02); ctx.closePath(); ctx.fill();
  }
}
function cracks(ctx, cx, gy, k, u, seedOff) {
  ctx.strokeStyle = "#ff6a20"; ctx.lineWidth = 3 * u; ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const dir = i % 2 ? 1 : -1, len = (60 + hash(i + seedOff) * 160) * k * u;
    ctx.beginPath(); ctx.moveTo(cx, gy);
    let x = cx, y = gy;
    for (let j = 1; j <= 4; j++) { x += dir * len / 4; y += (hash(i * 7 + j) - 0.5) * 14 * u; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.strokeStyle = "#ffd04a"; ctx.lineWidth = 1.2 * u; ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.moveTo(cx - 80 * k * u, gy); ctx.lineTo(cx + 80 * k * u, gy); ctx.stroke(); ctx.globalAlpha = 1;
}
function embers(ctx, w, h, t, n, u, toX, toY, k) {
  for (let i = 0; i < n; i++) {
    const sx = hash(i) * w, sy = hash(i + 50) * h * 0.7;
    const x = sx + (toX - sx) * k, y = sy + (toY - sy) * k + Math.sin(t * 3 + i) * 6 * u;
    ctx.fillStyle = i % 3 ? "#ff8a24" : "#ffd04a"; ctx.globalAlpha = 0.5 + 0.5 * hash(i + 9);
    ctx.beginPath(); ctx.arc(x, y, (1.5 + hash(i + 3) * 2.5) * u, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  t = Math.max(0, Math.min(EVO_CINE_DURATION, Number(t) || 0));
  const u = h / 300, cx = w / 2, gy = h * 0.8, to = clampF(toForm), from = clampF(fromForm);
  ctx.save();
  ctx.fillStyle = "#1a0c0a"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#2a1410"; ctx.fillRect(0, gy, w, h - gy);
  const baseS = 1.4 * u;
  if (t < 1.5) {               // 1 · CARGA: brasas convergen, grietas de magma, temblor
    const k = t / 1.5, sh = Math.sin(t * 50) * 2 * u * k;
    cracks(ctx, cx, gy, ease(k), u, 0);
    embers(ctx, w, h, t, 24, u, cx, gy - 40 * u, ease(k));
    ctx.fillStyle = "#ff5a14"; ctx.globalAlpha = 0.18 + 0.15 * k;
    ctx.beginPath(); ctx.ellipse(cx, gy, 90 * u * (0.5 + k), 12 * u, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    drawDino(ctx, from - 1, cx + sh, gy, baseS, t, k > 0.6 ? { state: "cast", castSlot: 3, cast: 1 } : {});
  } else if (t < 2.8) {        // 2 · TRANSFORMACIÓN: meteoro de brasas, flash, anillo de rugido, alas de fuego
    const k = (t - 1.5) / 1.3;
    const mk = Math.min(1, k / 0.35);
    if (mk < 1) {               // meteoro cae
      const mx = cx + (1 - mk) * w * 0.4, my = gy - 40 * u - (1 - mk) * h * 0.8;
      ctx.fillStyle = "#ff8a24";
      for (let i = 0; i < 6; i++) { ctx.globalAlpha = 1 - i / 6; ctx.beginPath(); ctx.arc(mx + i * 12 * u, my - i * 20 * u, (14 - i * 2) * u, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = "#fff0a8"; ctx.beginPath(); ctx.arc(mx, my, 7 * u, 0, TAU); ctx.fill();
    } else if (k < 0.45) { ctx.fillStyle = "#fff4d0"; ctx.fillRect(0, 0, w, h); }
    cracks(ctx, cx, gy, 1, u, 0);
    if (k > 0.35) {
      const rk = (k - 0.35) / 0.65;
      ctx.strokeStyle = "#ffd04a"; ctx.lineWidth = 5 * u * (1 - rk) + 1; ctx.globalAlpha = 1 - rk;
      ctx.beginPath(); ctx.arc(cx, gy - 60 * u, (40 + rk * 260) * u, 0, TAU); ctx.stroke();       // anillo de rugido
      ctx.strokeStyle = "#ff6a20";
      ctx.beginPath(); ctx.ellipse(cx, gy, (30 + rk * 300) * u, (5 + rk * 14) * u, 0, 0, TAU); ctx.stroke(); // onda de pisotón
      ctx.globalAlpha = 1;
      wings(ctx, cx, gy - 70 * u, 130 * u * ease(rk), ease(rk), "#ff5a14");
      wings(ctx, cx, gy - 70 * u, 95 * u * ease(rk), ease(rk), "#ffb040");
    }
    const form = k < 0.45 ? from - 1 : to - 1;
    drawDino(ctx, form, cx, gy, baseS * (1 + 0.3 * ease(k)), t, { state: "cast", castSlot: 3, cast: 1 });
  } else {                     // 3 · PRESENTACIÓN: más grande, nombre y "Forma X → Y"
    const k = Math.min(1, (t - 2.8) / 0.5);
    cracks(ctx, cx, gy, 1, u, 0);
    wings(ctx, cx, gy - 75 * u, 140 * u, 0.9 + 0.1 * Math.sin(t * 4), "#c8401a");
    embers(ctx, w, h, t, 14, u, cx, gy - 40 * u, 0.2);
    drawDino(ctx, to - 1, cx, gy, baseS * 1.15 + Math.sin(t * 4) * 0.02 * u, t, {});
    ctx.globalAlpha = k; ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(32 * u)}px sans-serif`; ctx.fillStyle = "#3a0c04"; ctx.fillText("¡" + formName(to) + "!", cx + 2 * u, h * 0.1 + 2 * u);
    ctx.fillStyle = "#ffd04a"; ctx.fillText("¡" + formName(to) + "!", cx, h * 0.1);
    ctx.font = `${Math.round(15 * u)}px sans-serif`; ctx.fillStyle = "#ff9a50";
    ctx.strokeStyle = "#1a0608"; ctx.lineWidth = 3 * u; ctx.strokeText("Forma " + from + " → " + to, cx, h * 0.1 + 24 * u);
    ctx.fillText("Forma " + from + " → " + to, cx, h * 0.1 + 24 * u);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
export default { id: "dino", drawEvoCine, EVO_CINE_DURATION, FORM_NAMES };
