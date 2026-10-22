// V372 · Cinemática de evolución de Frita.
// Pizza & Frita · «Al punto», cuatro actos: (1) al aceite — de noche en el
// diner del Puerto, bajo un neón azul marino, la cesta de la freidora baja
// sobre Frita; (2) hervor — el aceite sube, burbujas y columnas de vapor, un
// remolino de patatas; (3) cucurucho — un cartón gigante rojo y blanco la
// envuelve entre chispas eléctricas; (4) al punto — el cartón se abre en
// pétalos, abanico de patatas, capa al viento, kétchup y sal brillante.
// Unidades: `t` en SEGUNDOS (0..EVO_CINE_DURATION), igual que evo-cinema.js.
// Identidad: freidora (cesta, aceite que burbujea), sal gorda, kétchup y patatas.
// Reutiliza drawCharacter con un muñeco. Sin gradientes por frame (halo cacheado).
import { drawCharacter } from "../../characters/draw.js";
import { ROSTER } from "../../characters/roster.js";

export const EVO_CINE_DURATION = 4.5; // s
export const EVO_CINE_PHASES = Object.freeze({ charge: [0, 1.2], transform: [1.2, 2.9], reveal: [2.9, 4.5] });
export const EVO_CINE_ACTS = Object.freeze({ aceite: [0, 1.2], hervor: [1.2, 2.1], cucurucho: [2.1, 2.9], alpunto: [2.9, 4.5] });
export const FRITA_FORM_NAMES = Object.freeze(["Palito", "Frita", "Capitán Kétchup", "Extra Crujiente", "Frita Centella"]);
const COL = { navy: "#14204a", navy2: "#1f3a8a", neon: "#5fd0ff", tileW: "#f4ece0", tileR: "#c8282a", bg: "#2a1208", tile: "#3a1c0e", tile2: "#33180c", oil: "#e8a22a", oil2: "#ffcf5a", steel: "#9aa6b8", steel2: "#5a6474", red: "#d42020", red2: "#ff5a4a", salt: "#fff8e0", fry: "#ffd36a", fry2: "#8a4a10", white: "#fff6e8" };
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeOut = (k) => 1 - (1 - k) ** 3;
const easeBack = (k) => { const c = 1.7; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
export function evoCinePhase(t) { return t < 1.2 ? "carga" : t < 2.9 ? "transformacion" : "presentacion"; }
export function evoCineAct(t) { return t < 1.2 ? "aceite" : t < 2.1 ? "hervor" : t < 2.9 ? "cucurucho" : "alpunto"; }
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
  const s = H / 140; // in-game heights follow the standard 64…140 px curve: H = final-form height
  ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s); p.x = -p.w / 2; p.y = -p.h;
  try { draw(flatCtx(ctx), p, { x: 0, y: 0 }, t * 60, { reduceMotion: false }); } catch { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h); }
  ctx.restore();
}

function diner(ctx, w, h, floorY, t, heat) {
  ctx.fillStyle = COL.navy; ctx.fillRect(0, 0, w, h);
  // vertical wall panels
  ctx.fillStyle = COL.navy2; ctx.globalAlpha = 0.35;
  const pw = Math.max(24, w / 14);
  for (let x = 0; x < w; x += pw * 2) ctx.fillRect(x, 0, pw, floorY);
  ctx.globalAlpha = 1;
  // chrome rail + neon sign
  ctx.fillStyle = COL.steel; ctx.fillRect(0, floorY - h * .2, w, Math.max(3, h * .012));
  // hanging diner sign (chains + chrome frame) so it reads as scenery, not HUD
  const flick = Math.sin(t * 23) > -0.85 ? 1 : 0.35;
  const sx = w * .86, sy = h * .1, sw = Math.max(80, h * .28), sh = sw * .36;
  ctx.strokeStyle = COL.steel2; ctx.lineWidth = Math.max(1.5, h * .004);
  ctx.beginPath(); ctx.moveTo(sx - sw * .35, 0); ctx.lineTo(sx - sw * .35, sy - sh / 2); ctx.moveTo(sx + sw * .35, 0); ctx.lineTo(sx + sw * .35, sy - sh / 2); ctx.stroke();
  ctx.fillStyle = COL.steel; ctx.fillRect(sx - sw / 2 - 3, sy - sh / 2 - 3, sw + 6, sh + 6);
  ctx.fillStyle = COL.navy; ctx.fillRect(sx - sw / 2, sy - sh / 2, sw, sh);
  ctx.globalAlpha = 0.16 * flick; ctx.fillStyle = COL.neon; ctx.fillRect(sx - sw / 2 - sh * .3, sy - sh * .8, sw + sh * .6, sh * 1.6);
  ctx.globalAlpha = flick; ctx.fillStyle = COL.neon; ctx.font = `800 ${Math.round(sh * .56)}px Outfit, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("FRITA'S", sx, sy - sh * .04);
  ctx.fillStyle = COL.red2; ctx.fillRect(sx - sw * .36, sy + sh * .3, sw * .72, Math.max(2, sh * .07)); // neon ketchup underline
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
  // checkerboard diner floor
  const ts = Math.max(14, Math.min(w, h) / 12);
  for (let y = floorY, r = 0; y < h; y += ts, r++) for (let x = 0, c = 0; x < w; x += ts, c++) {
    ctx.fillStyle = (r + c) % 2 ? COL.tileR : COL.tileW; ctx.fillRect(x, y, ts, ts);
  }
  if (heat > 0) { ctx.globalAlpha = .18 * heat; ctx.fillStyle = COL.oil2; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
}
function fryer(ctx, cx, top, fw, fh, oilK, t, boil) {
  ctx.fillStyle = COL.steel2; ctx.fillRect(cx - fw / 2 - 6, top - 6, fw + 12, fh + 12);
  ctx.fillStyle = COL.steel; ctx.fillRect(cx - fw / 2, top, fw, fh);
  const oy = top + fh * (1 - oilK);
  ctx.fillStyle = COL.oil; ctx.fillRect(cx - fw / 2 + 4, oy, fw - 8, top + fh - oy - 4);
  ctx.fillStyle = COL.oil2;
  for (let i = 0; i < 12; i++) {
    const k = (t * (1.4 + boil * 3) + i * .29) % 1;
    ctx.globalAlpha = (1 - k) * (.4 + boil * .6);
    ctx.beginPath(); ctx.arc(cx - fw / 2 + 8 + ((i * 37) % (fw - 16)), oy + 4 - k * (12 + boil * 30), 2 + (i % 3) * 1.5 + boil * 3, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  return oy;
}
function basket(ctx, cx, y, bw, bh) {
  ctx.strokeStyle = COL.steel; ctx.lineWidth = 3;
  ctx.strokeRect(cx - bw / 2, y, bw, bh);
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx - bw / 2 + i * bw / 5, y); ctx.lineTo(cx - bw / 2 + i * bw / 5, y + bh); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(cx + bw / 2, y + bh * .15); ctx.lineTo(cx + bw * 1.1, y - bh * .2); ctx.stroke();
  ctx.fillStyle = COL.navy2; ctx.fillRect(cx + bw * 1.02, y - bh * .3, bw * .35, bh * .16);
}
function carton(ctx, cx, foot, cw, chh, open, t) {
  // giant red/white striped fry carton; open → petals fold outwards
  const n = 6;
  for (let i = 0; i < n; i++) {
    const k = (i + .5) / n - .5, ang = k * open * 1.6;
    ctx.save(); ctx.translate(cx + k * cw * (1 - open * .3), foot); ctx.rotate(ang);
    ctx.fillStyle = i % 2 ? COL.tileW : COL.red; ctx.fillRect(-cw / n / 2 - .5, -chh, cw / n + 1, chh);
    ctx.restore();
  }
  ctx.fillStyle = COL.red; ctx.fillRect(cx - cw * .52, foot - chh * .24, cw * 1.04, chh * .24 * (1 - open));
  if (open < .05 && chh > 20) {
    // closed carton: scalloped rim + golden "F" badge
    for (let i = 0; i < n; i++) { const k = (i + .5) / n - .5; ctx.fillStyle = i % 2 ? COL.tileW : COL.red; ctx.beginPath(); ctx.arc(cx + k * cw, foot - chh, cw / n / 2, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = COL.oil2; ctx.beginPath(); ctx.arc(cx, foot - chh * .12, Math.min(cw * .16, chh * .1), 0, TAU); ctx.fill();
  }
}
function sparks(ctx, cx, cy, r, t, k) {
  if (k <= 0) return;
  ctx.strokeStyle = COL.neon; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.globalAlpha = k;
  for (let i = 0; i < 6; i++) {
    if (Math.floor(t * 14 + i * 3) % 3 === 0) continue;
    const a = i * TAU / 6 + t * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a + .6) * r * .18, y + Math.sin(a + .6) * r * .18);
    ctx.lineTo(x + Math.cos(a - .3) * r * .3, y + Math.sin(a - .3) * r * .3); ctx.lineTo(x + Math.cos(a + .2) * r * .45, y + Math.sin(a + .2) * r * .45); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .35 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}

/** Igual que evo-cine/kilo.js: t en segundos; formas 1..5 (1 = inicial) o nombre. */
export function drawEvoCine(ctx, w, h, t, fromForm, toForm, opts = {}) {
  if (!ctx || !(w > 0) || !(h > 0)) return "none";
  const draw = opts.drawActor || drawCharacter;
  const reduced = !!opts.reducedMotion;
  const from = formIndex(fromForm), to = toForm == null ? Math.min(4, from + 1) : formIndex(toForm);
  t = reduced ? 4.2 : clamp(Number(t) || 0, 0, EVO_CINE_DURATION);
  const phase = evoCinePhase(t), act = evoCineAct(t), cx = w / 2, foot = h * .74, H = Math.min(h * .5, w * .42);
  const kA = seg(t, 0, 1.2), kH = seg(t, 1.2, 2.1), kC = seg(t, 2.1, 2.9), kR = seg(t, 2.9, 4.5);
  ctx.save();
  diner(ctx, w, h, foot, t, act === "hervor" ? kH : act === "cucurucho" ? 1 - kC * .5 : 0);
  // halo cacheado
  const hr = H * (act === "aceite" ? .4 + kA * .3 : act === "alpunto" ? .85 : .8 + Math.sin(kH * Math.PI) * .4);
  ctx.save(); ctx.translate(cx, foot - H * .45); ctx.scale(hr, hr); ctx.fillStyle = halo(ctx); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
  const fw = H * .9, fTop = foot - H * .1;
  if (act === "aceite") {
    // 1 · al aceite: la cesta baja sobre Frita, sal gorda cayendo
    fryer(ctx, cx, fTop, fw, h - fTop, .5, t, 0);
    drawFrita(ctx, from, cx + Math.sin(t * 14) * kA * 2, fTop, H * .8, t, "idle", draw);
    basket(ctx, cx, fTop - H * (1.3 - kA * .6), H * .64, H * .55);
    ctx.fillStyle = COL.salt;
    for (let i = 0; i < 24; i++) ctx.fillRect((i * 53) % w, ((t * 140 + i * 41) % (h * .75)), 3, 3);
    text(ctx, "¡AL ACEITE…!", cx, h * .12, Math.min(w, h) * .055 * (.6 + kA * .4), COL.neon);
  } else if (act === "hervor") {
    // 2 · hervor: el aceite sube sobre ella, vapor y remolino de patatas
    drawFrita(ctx, from, cx, fTop, H * .8 * (1 + Math.sin(kH * Math.PI) * .08), t, "fall", draw);
    const oy = fryer(ctx, cx, fTop - H * .3 * easeOut(kH), fw, h - fTop + H * .3 * easeOut(kH), .55 + .45 * kH, t, kH);
    for (let i = 0; i < 4; i++) {
      const sx = cx + (i - 1.5) * fw * .28, life = (t * 1.3 + i * .25) % 1;
      ctx.globalAlpha = (1 - life) * .45; ctx.fillStyle = COL.white;
      ctx.beginPath(); ctx.arc(sx + Math.sin(life * 6 + i) * 8, oy - life * H * .9, H * (.05 + life * .09), 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const R = H * (.35 + kH * .3);
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * 5; fry(ctx, cx + Math.cos(a) * R, foot - H * .5 + Math.sin(a) * R * .45, H * .1, a); }
  } else if (act === "cucurucho") {
    // 3 · cucurucho: un cartón gigante la envuelve entre chispas
    const rise = easeBack(clamp(kC / .5, 0, 1));
    fryer(ctx, cx, fTop, fw, h - fTop, 1, t, 1 - kC);
    const showNew = kC > .55 && Math.sin(t * 40) > 0;
    drawFrita(ctx, showNew ? to : from, cx, fTop - H * .28 * rise, H * .85, t, "victory", draw);
    carton(ctx, cx, fTop, H * .78, H * .6 * rise, 0, t);
    sparks(ctx, cx, fTop - H * .55, H * .62, t, kC);
    if (kC > .9) { ctx.globalAlpha = .55 * (kC - .9) / .1; ctx.fillStyle = COL.white; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  } else {
    // 4 · al punto: el cartón se abre en pétalos y sale la nueva forma
    const k = reduced ? 1 : easeBack(clamp(kR / .3, 0, 1));
    if (!reduced && kR < .05) { ctx.globalAlpha = .55 * (1 - kR / .05); ctx.fillStyle = COL.white; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    for (let i = 0; i < 9; i++) fry(ctx, cx + (i - 4) * H * .08, foot - H * (.85 + Math.abs(i - 4) * -.03) * k, H * .48, (i - 4) * .14);
    carton(ctx, cx, foot, H * .78, H * .42, clamp(k, 0, 1.2), t);
    drawFrita(ctx, to, cx, foot, H * (.75 + .3 * Math.min(1, k)), t, "victory", draw);
    for (let i = 0; i < 10; i++) splat(ctx, (i * 131 + 40) % w, h * (.2 + ((i * 37) % 50) / 100), 4 + (i % 3) * 2 * Math.min(1, k), i);
    ctx.fillStyle = COL.salt;
    for (let i = 0; i < 16; i++) { const tw = .5 + .5 * Math.sin(t * 9 + i * 2); ctx.globalAlpha = tw; star(ctx, (i * 71 + 23) % w, ((t * 60 + i * 29) % (h * .7)), 2 + tw * 3); }
    ctx.globalAlpha = 1;
    sparks(ctx, cx, foot - H * .6, H * .7, t, (to === 4 ? 1 : .5) * (1 - kR * .5));
    ctx.globalAlpha = reduced ? 1 : clamp(kR * 4, 0, 1);
    text(ctx, "¡TODO AL PUNTO!", cx, h * .1, Math.min(w, h) * .04, COL.salt);
    text(ctx, "¡" + FRITA_FORM_NAMES[to].toUpperCase() + "!", cx, h * .18, Math.min(w, h) * .08 * (.8 + .2 * Math.min(1, k)), COL.oil2);
    text(ctx, "Forma " + (to + 1) + " de 5", cx, h * .92, Math.min(w, h) * .035, COL.white);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return phase;
}
export default { id: "frita", drawEvoCine, EVO_CINE_DURATION, FORM_NAMES: FRITA_FORM_NAMES };
