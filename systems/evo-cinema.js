// ============================================================================
// PROJECT OHANA · Cinemática de evolución (systems/evo-cinema.js)
// ----------------------------------------------------------------------------
// Escucha window "ohana-evolve" ({ id, evo, color, fromName, toName, name }) y
// reproduce a pantalla completa, en un <canvas> propio:
//   oscurecer breve → forma anterior + nueva en crossfade continuo
//   → flash corto → forma nueva legible y retorno rápido al juego.
// Mientras dura, #evo-stage tiene la clase "show" (game.js pausa la partida).
// También exporta utilidades (partículas, rayos, texto) que reutiliza intro.js.
// ============================================================================
import { drawCharacter } from "../characters/draw.js";
import { ROSTER } from "../characters/roster.js";
import { sfx } from "../engine/audio.js";
import { duckMusic } from "../engine/music.js";
import { evolutionTiming } from "./evolution-timing.js";

const VISUAL_H = [34, 56, 76, 98, 124];
const CHAR_K = { kilo: 1.0, lilo: 1.0, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92, cat: 0.92, dragon: 1.0, frita: 1.04, dino: 1.0, pizza: 0.98, yomi: 0.96 };
export const FONT_DISPLAY = "Fredoka, 'Baloo 2', system-ui, sans-serif";
export const FONT_BODY = "Outfit, system-ui, sans-serif";
const GOLD = "#ffd84a";

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
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
export function fullCanvas(cv) {
  const ctx = cv.getContext("2d");
  const st = { cv, ctx, W: 0, H: 0, dpr: 1 };
  st.resize = () => {
    st.dpr = Math.min(2, window.devicePixelRatio || 1);
    st.W = Math.max(1, window.innerWidth);
    st.H = Math.max(1, window.innerHeight);
    cv.width = Math.round(st.W * st.dpr);
    cv.height = Math.round(st.H * st.dpr);
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
  };
  st.resize();
  return st;
}

// ---------------------------------------------------------------------------
// Partículas
// ---------------------------------------------------------------------------
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
        // convergencia: aceleración hacia el objetivo
        const dx = p.to.x - p.x, dy = p.to.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 10) continue;
        const acc = 2600 * dt;
        p.vx += (dx / d) * acc; p.vy += (dy / d) * acc;
        // componente tangencial: espiral
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

// ---------------------------------------------------------------------------
// Capas de fondo
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Personaje grande
// ---------------------------------------------------------------------------
/** Altura visual (px) de un personaje/forma con visualScale = 1. */
export function baseHeight(id, evo) {
  return VISUAL_H[clamp(evo | 0, 0, 4)] * (CHAR_K[id] || 1);
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

// ---------------------------------------------------------------------------
// Cinemática
// ---------------------------------------------------------------------------
let stage = null;
let running = null;

function ensureStage() {
  if (stage) return stage;
  const el = document.getElementById("evo-stage") || document.createElement("div");
  el.id = "evo-stage";
  el.dataset.dialog = "show";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "evo-description");
  el.setAttribute("aria-live", "assertive");
  el.innerHTML = '<canvas aria-hidden="true"></canvas><p class="evo-sr" id="evo-description"></p>';
  if (!el.isConnected) document.body.appendChild(el);
  const fc = fullCanvas(el.querySelector("canvas"));
  stage = { el, fc, sr: el.querySelector(".evo-sr") };
  addEventListener("resize", () => { if (stage) stage.fc.resize(); });
  return stage;
}

export function playEvolution(detail = {}) {
  const st = ensureStage();
  if (running) running.stop(true);

  const id = detail.id || "kilo";
  const evo = clamp(Number(detail.evo) || 1, 1, 4);
  const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
  const oldForm = (def.forms && def.forms[evo - 1]) || {};
  const newForm = (def.forms && def.forms[evo]) || {};
  const finalForm = evo >= 4;
  const color = detail.color || newForm.color || def.color || "#7ee7ff";
  const accent = newForm.accent || newForm.color || color;
  const light = tint(accent, 0.62);
  const oldColor = oldForm.color || color;
  const toName = String(detail.toName || detail.name || newForm.name || "Nueva forma");
  const title = "¡" + toName.toUpperCase() + "!";
  const reduce = reducedMotion();
  const T = evolutionTiming({ reduced: reduce, finalForm });

  const oldP = makeDummy(def.id, evo - 1, oldColor);
  const newP = makeDummy(def.id, evo, color);
  oldP._poseOverride = "idle";
  newP._poseOverride = "victory";

  const { el, fc } = st;
  const ctx = fc.ctx;
  const parts = new Particles();
  st.sr.textContent = "Evolución completada: " + toName + ". Nueva forma " + (evo + 1) + " de 5.";
  el.classList.add("show");
  el.classList.toggle("finale", finalForm);
  el.querySelector(".form-ladder")?.remove();

  sfx("evoCharge");
  duckMusic(true);

  let t0 = performance.now();
  let last = t0;
  let raf = 0;
  let skipAt = -1;
  let impactPlayed = false;
  let revealPlayed = false;
  let spawnAcc = 0;

  function layout() {
    const W = fc.W, H = fc.H;
    const portrait = H > W * 1.1;
    const target = Math.min(H * (portrait ? 0.40 : 0.48), W * (portrait ? 0.66 : 0.46));
    return {
      W, H, cx: W / 2,
      cy: H * (portrait ? 0.40 : 0.39),
      target,
      footY: H * (portrait ? 0.70 : 0.76),
      portrait
    };
  }

  function spawnOrbit(L, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = L.target * (1.0 + Math.random() * 0.38);
      parts.add({
        x: L.cx + Math.cos(a) * r,
        y: L.cy + Math.sin(a) * r * 0.72,
        vx: 0, vy: 0,
        to: { x: L.cx, y: L.cy },
        swirl: (i & 1 ? -1 : 1) * 260,
        max: 0.9 + Math.random() * 0.55,
        size: 1.4 + Math.random() * 2.4,
        kind: i % 3 === 0 ? "spark" : "dot",
        color: [accent, light, "#ffffff"][i % 3],
      });
    }
  }

  function drawHero(p, alpha, scale, y, t, opts = {}) {
    if (alpha <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (opts.ghost) ctx.globalCompositeOperation = "source-over";
    drawDummy(ctx, p, L.cx, y, scale, t);
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    let t = (now - t0) / 1000;
    if (skipAt >= 0 && t < T.out) {
      t0 -= (T.out - t) * 1000;
      t = T.out;
    }

    const L = layout();
    const { W, H } = L;
    const fade = 1 - easeInOut(seg(t, T.out, T.end));
    const charge = easeInOut(seg(t, T.charge, T.flip));
    const morph = easeInOut(seg(t, T.flip, T.reveal));
    const reveal = easeOut(seg(t, T.reveal, T.reveal + 0.30));
    const titleK = easeOut(seg(t, T.reveal + 0.16, T.reveal + 0.62));

    ctx.clearRect(0, 0, W, H);

    // 1. Escenario limpio. Nada de rayos radiales ocupando media pantalla.
    ctx.fillStyle = "rgba(3, 7, 16," + (0.70 * fade) + ")";
    ctx.fillRect(0, 0, W, H);

    const halo = ctx.createRadialGradient(L.cx, L.cy, 0, L.cx, L.cy, L.target * 1.65);
    halo.addColorStop(0, rgba(accent, (0.20 + charge * 0.18 + reveal * 0.18) * fade));
    halo.addColorStop(0.48, rgba(accent, 0.055 * fade));
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    // Línea de suelo. El personaje vuelve a tener un lugar físico.
    ctx.save();
    ctx.globalAlpha = fade * 0.55;
    const floor = ctx.createLinearGradient(L.cx - L.target, 0, L.cx + L.target, 0);
    floor.addColorStop(0, rgba(accent, 0));
    floor.addColorStop(0.5, rgba(accent, 0.75));
    floor.addColorStop(1, rgba(accent, 0));
    ctx.strokeStyle = floor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(L.cx, L.footY + 3, L.target * 0.60, L.target * 0.075, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Forma anterior: estable, reconocible, todavía presente.
    const oldIn = seg(t, T.oldIn, T.charge);
    const oldFade = 1 - morph;
    const oldScale = (0.92 + charge * 0.04) * (1 - morph * 0.04);
    if (t >= T.oldIn && t < T.flip) {
      drawHero(oldP, oldIn * fade, L.target / baseHeight(def.id, evo - 1) * oldScale, L.footY, now * 0.02);
    }

    // 3. Durante la transformación, la forma se comprime y la nueva aparece
    // desde el mismo punto. Es una transformación, no dos Pokémon peleándose.
    if (t >= T.flip && t < T.reveal + 0.04) {
      const breathe = reduce ? 0 : Math.sin(t * 14) * 0.025;
      const oldA = (1 - morph) * 0.72;
      const newA = morph * 0.92;
      const oldS = (1 - morph * 0.12) * (1 + breathe);
      const newS = 0.90 + morph * 0.12;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade * (0.10 + morph * 0.10);
      ctx.fillStyle = rgba(accent, 0.35);
      ctx.beginPath();
      ctx.arc(L.cx, L.cy, L.target * (0.30 + morph * 0.38), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawHero(oldP, oldA * fade, L.target / baseHeight(def.id, evo - 1) * oldS, L.footY, now * 0.02);
      drawHero(newP, newA * fade, L.target / baseHeight(def.id, evo) * newS, L.footY, now * 0.02 + 8);
    }

    // 4. Revelación: golpe limpio y breve, con una sola onda.
    if (t >= T.reveal) {
      const newScale = (0.92 + easeOut(reveal) * 0.08);
      drawHero(newP, reveal * fade, L.target / baseHeight(def.id, evo) * newScale, L.footY, now * 0.02 + 12);

      if (!reducedMotion() && !revealPlayed) {
        revealPlayed = true;
        sfx(finalForm ? "evoFinalFanfare" : "evoFanfare");
      }

      if (!reduce) {
        const ringK = seg(t, T.reveal, T.reveal + 0.42);
        drawRing(ctx, L.cx, L.footY - L.target * 0.48, L.target * 1.05, ringK, light, 2.5, 0.22);
      }

      // Pequeños fragmentos salen después del impacto, no durante toda la escena.
      if (!reduce && t < T.out) {
        spawnAcc += dt * (finalForm ? 15 : 9);
        while (spawnAcc > 1) {
          spawnAcc -= 1;
          const a = Math.random() * Math.PI * 2;
          const r = L.target * (0.22 + Math.random() * 0.38);
          parts.add({
            x: L.cx + Math.cos(a) * r,
            y: L.footY - L.target * 0.48 + Math.sin(a) * r * 0.45,
            vx: Math.cos(a) * (80 + Math.random() * 130),
            vy: Math.sin(a) * (80 + Math.random() * 130) - 55,
            g: 90,
            drag: 0.985,
            max: 0.42 + Math.random() * 0.42,
            size: 1.5 + Math.random() * 2,
            kind: "spark",
            color: [accent, light, "#ffffff"][Math.floor(Math.random() * 3)]
          });
        }
      }
    }

    // 5. Una breve línea de energía durante la carga.
    if (!reduce && t >= T.charge && t < T.flip) {
      const k = seg(t, T.charge, T.flip);
      ctx.save();
      ctx.globalAlpha = fade * (0.15 + k * 0.28);
      ctx.strokeStyle = light;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(L.cx, L.cy, L.target * (0.62 - k * 0.16), L.target * (0.62 - k * 0.16) * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (!reduce && t < T.flip) {
        const n = finalForm ? 10 : 7;
        const expected = Math.floor(k * n);
        if (expected > 0 && Math.random() < dt * 18) spawnOrbit(L, 1);
      }
    }

    parts.update(dt);
    parts.draw(ctx);

    // 6. Flash único. Blanco muy breve, sin pantalla quemada.
    if (t >= T.flash && t < T.flash + 0.10) {
      const fk = 1 - seg(t, T.flash, T.flash + 0.10);
      ctx.fillStyle = "rgba(255,255,255," + (fk * (finalForm ? 0.78 : 0.58)) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    // 7. Texto aparece DESPUÉS de que el jugador pueda ver la forma.
    if (titleK > 0) {
      const size = Math.max(27, Math.min(W * 0.075, H * 0.075, 82));
      const ty = Math.min(H - size * 1.8, L.footY + L.target * 0.18);
      ctx.save();
      ctx.globalAlpha = titleK * fade;
      drawTitle(ctx, "NUEVA FORMA", L.cx, ty - size * 0.70, Math.max(13, size * 0.25),
        "#dcecff", { font: FONT_BODY, weight: 800, spacing: "0.22em", stroke: false });
      drawTitle(ctx, title, L.cx, ty, size, finalForm ? ["#fff7d0", light, accent] : ["#ffffff", light, accent],
        { maxWidth: W * 0.88, glow: rgba(accent, 0.65) });
      drawTitle(ctx, "FORMA " + (evo + 1) + " / 5", L.cx, ty + size * 0.70,
        Math.max(11, size * 0.22), "#bcd0e5", { font: FONT_BODY, weight: 700, spacing: "0.18em", stroke: false });
      ctx.restore();
    }

    // 8. Saída. Nada queda pegado al gameplay.
    if (t >= T.out) {
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = "rgba(3,7,16," + (1 - fade) + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    if (t >= T.end) {
      finish();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function onSkip(e) {
    const t = (performance.now() - t0) / 1000;
    if (t < 0.65) return;
    if (e?.type === "keydown") {
      e.preventDefault();
      e.stopPropagation();
    }
    skipAt = t;
  }

  function finish(silent) {
    cancelAnimationFrame(raf);
    removeEventListener("keydown", onSkip, true);
    el.removeEventListener("pointerdown", onSkip);
    ctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
    ctx.clearRect(0, 0, fc.W, fc.H);
    el.classList.remove("show", "finale");
    duckMusic(false);
    running = null;
    if (!silent) {
      document.querySelectorAll(".game-notification.evo").forEach((n) => n.click());
      try {
        window.dispatchEvent(new CustomEvent("ohana-evolve-done", { detail: { id: def.id, evo } }));
      } catch (_) {}
    }
  }

  addEventListener("keydown", onSkip, true);
  el.addEventListener("pointerdown", onSkip);
  running = { stop: finish };
  loadFonts();
  raf = requestAnimationFrame(frame);
}

if (!window.__ohanaEvoCinema) {
  window.__ohanaEvoCinema = true;
  addEventListener("ohana-evolve", (e) => playEvolution((e && e.detail) || {}));
}
