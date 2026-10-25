import {heroHeightTarget} from '../characters/visual-size.js';
// Shared intro and cinema drawing primitives. V367: no evolution event listeners.
import { drawCharacter } from "../characters/draw.js";
import { ROSTER } from "../characters/roster.js";
import {CUERNO_V373_HEIGHT} from "../characters/art/cuerno-v373.js";
import {CUERNO_VISUAL_H} from "../characters/art/cuerno.js";

const VISUAL_H = [34, 56, 76, 98, 124];
const CHAR_K = { kilo: 1.0, lilo: 1.0, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92, cat: 0.92, dragon: 1.0, frita: 1.04, dino: 1.0, pizza: 0.98, yomi: 0.96 };
export const FONT_DISPLAY = "Fredoka, 'Baloo 2', system-ui, sans-serif";
export const FONT_BODY = "Outfit, system-ui, sans-serif";
const GOLD = "#ffd84a";

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, k) => a + (b - a) * k;
/** Progreso 0..1 de t dentro de [a, b]. */
export const seg = (t, a, b) => clamp((t - a) / Math.max(1e-6, b - a), 0, 1);
export const easeOut = (k) => 1 - Math.pow(1 - k, 3);
export const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeBack = (k) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

export function reducedMotion() {
  try { if (globalThis.localStorage?.getItem("ohana-gentle-motion") === "1") return true; } catch (_) {}
  try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (_) { return false; }
}

function hexRgb(color) {
  let h = String(color || "#ffffff").trim();
  if (/^#[0-9a-f]{3}$/i.test(h)) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (!/^#[0-9a-f]{6}$/i.test(h)) return [255, 255, 255];
  const n = parseInt(h.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
export function rgba(color, a) {
  const [r, g, b] = hexRgb(color);
  return "rgba(" + r + "," + g + "," + b + "," + clamp(a, 0, 1) + ")";
}
/** Mezcla un color hacia blanco (k>0) o negro (k<0). */
export function tint(color, k) {
  const c = hexRgb(color);
  const to = k >= 0 ? 255 : 0;
  const a = Math.abs(k);
  const out = c.map((v) => Math.round(v + (to - v) * a));
  return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
}

let fontsReady = false;
export function loadFonts() {
  if (fontsReady || !document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load("700 64px Fredoka"),
    document.fonts.load("800 16px Outfit"),
  ]).then(() => { fontsReady = true; }, () => {});
}
loadFonts();

/** Canvas a pantalla completa con DPR; devuelve { cv, ctx, W, H, resize }. */
export function fullCanvas(cv, dprCap = Infinity) {
  const ctx = cv.getContext("2d");
  const st = { cv, ctx, W: 0, H: 0, dpr: 1 };
  st.resize = () => {
    st.W = Math.max(1, window.innerWidth);
    st.H = Math.max(1, window.innerHeight);
    const pixels = st.W * st.H;
    const maxDpr = pixels > 1800000 ? 1.45 : pixels > 1000000 ? 1.6 : 1.8;
    st.dpr = Math.min(maxDpr, dprCap, window.devicePixelRatio || 1);
    cv.width = Math.round(st.W * st.dpr);
    cv.height = Math.round(st.H * st.dpr);
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
  };
  st.resize();
  return st;
}

export class Particles {
  constructor() { this.list = []; }
  add(p) {
    this.list.push(Object.assign({ life: 0, max: 1, vx: 0, vy: 0, drag: 0.985, g: 0, size: 3, rot: 0, vr: 0, kind: "dot", color: "#fff", to: null }, p));
  }
  update(dt) {
    const out = [];
    for (const p of this.list) {
      p.life += dt;
      if (p.life >= p.max) continue;
      if (p.to) {
        const dx = p.to.x - p.x, dy = p.to.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 10) continue;
        const acc = 2600 * dt;
        p.vx += (dx / d) * acc; p.vy += (dy / d) * acc;
        p.vx += (-dy / d) * p.swirl * dt; p.vy += (dx / d) * p.swirl * dt;
        p.vx *= 0.92; p.vy *= 0.92;
      }
      p.vy += p.g * dt;
      p.vx *= Math.pow(p.drag, dt * 60); p.vy *= Math.pow(p.drag, dt * 60);
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
      out.push(p);
    }
    this.list = out;
  }
  draw(ctx, pred) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.list) {
      if (pred && !pred(p)) continue;
      const k = p.life / p.max;
      const a = p.to ? Math.min(1, p.life * 4) : Math.sin(Math.min(1, k) * Math.PI) * (p.alpha || 1);
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      if (p.kind === "star") drawStar(ctx, p.x, p.y, p.size * (1 - k * 0.4), p.rot, p.color);
      else if (p.kind === "spark") drawSpark(ctx, p.x, p.y, p.size * (0.6 + 0.4 * Math.sin(p.life * 18 + p.size)), p.color);
      else if (p.kind === "streak") {
        const sp = Math.hypot(p.vx, p.vy) || 1;
        const len = clamp(sp * 0.05, 4, 60);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.vx / sp) * len, p.y - (p.vy / sp) * len);
        ctx.stroke();
      } else {
        const r = p.size * 3;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, p.color);
        g.addColorStop(0.3, rgba(p.color, 0.6));
        g.addColorStop(1, rgba(p.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
}

export function drawStar(ctx, x, y, r, rot, color) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    const b = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(b) * r * 0.45, Math.sin(b) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Destello de cuatro puntas. */
export function drawSpark(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

/** Rayos de luz giratorios desde (cx, cy). */
export function drawRays(ctx, cx, cy, R, color, alpha, rot, n = 14) {
  if (alpha <= 0.005) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  g.addColorStop(0, rgba(color, 0.55 * alpha));
  g.addColorStop(0.45, rgba(color, 0.16 * alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = (i % 2 ? 0.07 : 0.12) * (1 + 0.3 * Math.sin(i * 3.1));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, a - w, a + w);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Fondo oscuro con viñeta y resplandor central. */
export function drawBackdrop(ctx, W, H, cx, cy, color, dark, glow) {
  if (dark > 0) {
    ctx.fillStyle = "rgba(3,6,14," + (0.9 * dark) + ")";
    ctx.fillRect(0, 0, W, H);
    const R = Math.hypot(W, H) * 0.62;
    const v = ctx.createRadialGradient(cx, cy, R * 0.25, cx, cy, R);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0," + (0.75 * dark) + ")");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
  if (glow > 0) {
    const r = Math.min(W, H) * 0.55;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(color, 0.42 * glow));
    g.addColorStop(0.4, rgba(color, 0.12 * glow));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }
}

/** Anillo expansivo (onda). k 0..1. */
export function drawRing(ctx, cx, cy, maxR, k, color, width, squash = 1) {
  if (k <= 0 || k >= 1) return;
  const e = easeOut(k);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha *= (1 - k) * (1 - k);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.5, width * (1 - e * 0.8));
  ctx.beginPath();
  ctx.ellipse(cx, cy, maxR * e, maxR * e * squash, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Texto con relleno degradado, contorno y brillo. */
export function drawTitle(ctx, text, x, y, size, colors, opts = {}) {
  ctx.save();
  ctx.font = (opts.weight || 700) + " " + size + "px " + (opts.font || FONT_DISPLAY);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (opts.spacing && "letterSpacing" in ctx) ctx.letterSpacing = opts.spacing;
  const maxW = opts.maxWidth || Infinity;
  const w = ctx.measureText(text).width;
  if (w > maxW) {
    const s = maxW / w;
    ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);
  }
  const tw = Math.min(w, 4000);
  if (opts.stroke !== false) {
    ctx.lineJoin = "round";
    ctx.strokeStyle = opts.strokeColor || "rgba(4,8,18,0.9)";
    ctx.lineWidth = Math.max(3, size * 0.14);
    ctx.strokeText(text, x, y);
  }
  if (opts.glow) {
    ctx.shadowColor = opts.glow;
    ctx.shadowBlur = size * 0.5;
  }
  if (Array.isArray(colors)) {
    const g = ctx.createLinearGradient(x - tw / 2, y - size / 2, x + tw / 2, y + size / 2);
    colors.forEach((c, i) => g.addColorStop(i / Math.max(1, colors.length - 1), c));
    ctx.fillStyle = g;
  } else ctx.fillStyle = colors;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Altura visual (px) de un personaje/forma con visualScale = 1. */
export function baseHeight(id, evo) {
  return heroHeightTarget(id,evo);
}

/** Muñeco ficticio para drawCharacter con los pies en (fx, fy). */
export function makeDummy(id, evo, color) {
  const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
  const f = (def.forms && def.forms[evo]) || def;
  return {
    id: def.id, evo, color: color || f.color || def.color,
    w: f.w || 24, h: f.h || 28, x: 0, y: 0,
    facing: 1, grounded: true, vx: 0, vy: 0, melee: 0, invuln: 0,
    visualScale: 1, _poseOverride: "victory", _evoT: 0,
  };
}

export function drawDummy(ctx, p, fx, fy, scale, t) {
  p.x = fx - p.w / 2;
  p.y = fy - p.h;
  p.visualScale = scale;
  p.evoBurst = 0;
  drawCharacter(ctx, p, { x: 0, y: 0 }, t);
}

