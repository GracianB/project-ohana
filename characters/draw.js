import { computePose, R } from "./rig.js";
import { ART } from "./art/index.js";
import { paintedBody } from "./sprites.js";
import { getLook } from "./look.js";

// ============================================================================
// PROJECT OHANA · dibujo de personajes (characters/draw.js)
// ============================================================================

// Sombra elíptica bajo los pies (coordenadas locales)
function drawShadow(ctx, x, y, rx, ry) {
  ctx.save();
  ctx.globalAlpha *= 0.28;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x || 0, y || 0, Math.max(1, rx || 10), Math.max(1, ry || 3), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


/** Estrella de 5 puntas (partículas de Michi, GOD). */
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill || "#fff6a8";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
    const b = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(b) * r * 0.4, y + Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// RENDER DE PERSONAJES · pipeline único
// ----------------------------------------------------------------------------
// 1. Todos los personajes se anclan por los PIES (centro inferior de la hitbox)
//    → nadie flota ni se hunde en el suelo.
// 2. Altura visual por forma (bebé → GOD) independiente de la hitbox, así las
//    5 formas crecen de manera coherente aunque la hitbox sea pequeña (Dino).
// 3. Cada personaje es un módulo vectorial animado (characters/art/<id>.js)
//    que recibe una pose de rig.js: 5 formas, animaciones y gestos propios.
// 4. Capas: sombra → aura/rayos → arte (squash & stretch) → flash → partículas.
// ============================================================================

const VISUAL_H = [36, 48, 58, 68, 80];
const CHAR_K = { kilo: 1.0, lilo: 1.0, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92, cat: 0.92, dragon: 1.0, frita: 1.04, dino: 1.0, pizza: 0.98, yomi: 0.96 };

const FLAVOR = {
  kilo:    { kind: "petal", colors: ["#ff9ab0", "#ffd36a", "#ffffff"] },
  lilo:    { kind: "petal", colors: ["#ff9ab0", "#ffd36a", "#ffffff"] },
  stitcho: { kind: "spark", colors: ["#7ef0ff", "#3fa8ff", "#ffffff"] },
  stitch:  { kind: "spark", colors: ["#7ef0ff", "#3fa8ff", "#ffffff"] },
  chispin: { kind: "bolt",  colors: ["#fff36a", "#ffd000", "#ffffff"] },
  pikachu: { kind: "bolt",  colors: ["#fff36a", "#ffd000", "#ffffff"] },
  cat:     { kind: "star",  colors: ["#ffd0ee", "#fff6a8", "#c9a8ff"] },
  dragon:  { kind: "ember", colors: ["#ff7a2a", "#ffd84a", "#ff3b2a"] },
  frita:   { kind: "salt",  colors: ["#ffffff", "#fff3c4", "#ff4a3a"] },
  dino:    { kind: "leaf",  colors: ["#7bd86a", "#c8f07a", "#fff3a0"] },
  pizza:   { kind: "salt",  colors: ["#ffd24a", "#e8452f", "#6fbf4a"] },
  yomi:    { kind: "ember", colors: ["#6a3cff", "#ff4466", "#1a0828"] },
};

/** "#rgb" | "#rrggbb" → rgba() con alfa. Otros formatos se devuelven tal cual. */
function withAlpha(color, a) {
  let h = String(color || "#ffffff").trim();
  if (/^#[0-9a-f]{3}$/i.test(h)) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (!/^#[0-9a-f]{6}$/i.test(h)) return color;
  const n = parseInt(h.slice(1), 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

// ---------------------------------------------------------------------------
// Capas de efectos (coordenadas locales: pies en 0,0; arriba = y negativo)
// ---------------------------------------------------------------------------
function drawAura(ctx, H, color, t, evo) {
  const cy = -H * 0.5;
  const r = H * (0.5 + evo * 0.09) * (1 + Math.sin(t / 9) * 0.05);
  ctx.save();
  ctx.globalAlpha *= evo >= 4 ? 0.5 : 0.3;
  const g = ctx.createRadialGradient(0, cy, r * 0.1, 0, cy, r);
  g.addColorStop(0, withAlpha(color, 1));
  g.addColorStop(0.55, withAlpha(color, 0.33));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGodRays(ctx, H, color, t) {
  const cy = -H * 0.55;
  const n = 10;
  ctx.save();
  ctx.translate(0, cy);
  ctx.rotate(t / 90);
  ctx.globalAlpha *= 0.16 + Math.sin(t / 14) * 0.05;
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.rotate((Math.PI * 2) / n);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-H * 0.07, -H * 0.95);
    ctx.lineTo(H * 0.07, -H * 0.95);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGroundRing(ctx, H, color, t) {
  const k = (t % 60) / 60;
  ctx.save();
  ctx.globalAlpha *= (1 - k) * 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, H * (0.25 + k * 0.45), H * (0.06 + k * 0.1), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlavor(ctx, id, H, t, evo, front) {
  const fl = FLAVOR[id];
  if (!fl || evo < 2) return;
  const n = evo * 2 + (evo >= 4 ? 4 : 0);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const seed = i * 2.399;
    const a = t / (38 - evo * 4) + seed;
    const z = Math.sin(a);                 // profundidad: >0 delante
    if ((z > 0) !== front) continue;
    const rx = H * (0.42 + (i % 3) * 0.08);
    let x = Math.cos(a) * rx;
    let y = -H * 0.5 + Math.sin(a * 0.7 + seed) * H * 0.32;
    const col = fl.colors[i % fl.colors.length];
    const s = (1.4 + (i % 3) * 0.6) * (0.75 + 0.25 * (z + 1)) * (H / 48);
    ctx.globalAlpha = 0.55 + 0.4 * Math.abs(z);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    if (fl.kind === "ember") {
      const life = ((t * 0.6 + i * 23) % (H * 1.1)) / (H * 1.1);
      y = -H * 0.2 - life * H * 0.95;
      x = Math.sin(t / 11 + i) * H * 0.35;
      ctx.globalAlpha = 0.85 * Math.sin(life * Math.PI);
      ctx.beginPath(); ctx.arc(x, y, s * 0.9, 0, Math.PI * 2); ctx.fill();
    } else if (fl.kind === "petal") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2);
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.4, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (fl.kind === "bolt") {
      ctx.lineWidth = Math.max(1, s * 0.6);
      ctx.beginPath();
      ctx.moveTo(x - s, y - s * 2); ctx.lineTo(x + s * 0.4, y - s * 0.3);
      ctx.lineTo(x - s * 0.4, y + s * 0.3); ctx.lineTo(x + s, y + s * 2);
      ctx.stroke();
    } else if (fl.kind === "star") {
      star(ctx, x, y, s * 1.5, col);
    } else if (fl.kind === "leaf") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 1.5);
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.5, s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (fl.kind === "salt") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha *= 0.6; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawDust(ctx, H, t, speed) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.07 * (1 + speed * 0.1) + i / 3) % 1);
    ctx.globalAlpha *= 1;
    ctx.globalAlpha = (1 - k) * 0.35;
    ctx.fillStyle = "#e8e2d0";
    ctx.beginPath();
    ctx.arc(-H * 0.22 - k * H * 0.35, -1 - k * 5, 1.5 + k * H * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBurst(ctx, H, color, k) {
  // k: 1 → 0 durante la evolución
  const prog = 1 - k;
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.strokeStyle = color || "#ffe66a";
  ctx.lineWidth = Math.max(0.5, 5 * k);
  ctx.beginPath();
  ctx.arc(0, -H * 0.5, Math.max(1, H * 0.3 + prog * H * 2.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.5, 2.5 * k);
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, -H * 0.5, Math.max(1, H * 0.15 + prog * H * 1.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Dibuja el personaje teñido (flash de daño/evolución): se pinta en un lienzo
 * auxiliar, se tiñe solo donde hay personaje y se compone encima.
 */
let flashCanvas = null;
let colorCanvas = null;
let inkCanvas = null;

function sheet(which, W) {
  let c = which === "color" ? colorCanvas : which === "ink" ? inkCanvas : flashCanvas;
  if (!c) c = document.createElement("canvas");
  if (c.width !== W) { c.width = W; c.height = W; }
  if (which === "color") colorCanvas = c;
  else if (which === "ink") inkCanvas = c;
  else flashCanvas = c;
  return c;
}

/** Contorno de tinta alrededor del personaje, para que la silueta se lea. */
function presentCharacter(ctx, art, pose, flashCol, flashA) {
  const U = 280;
  const ps = 2;
  const W = U * ps;
  const color = sheet("color", W);
  const cg = color.getContext("2d");
  cg.setTransform(1, 0, 0, 1, 0, 0);
  cg.clearRect(0, 0, W, W);
  cg.setTransform(ps, 0, 0, ps, W / 2, W * 0.78);
  art.draw(cg, pose, R);
  if (flashCol && flashA > 0) {
    const flash = sheet("flash", W);
    const fg = flash.getContext("2d");
    fg.setTransform(1, 0, 0, 1, 0, 0);
    fg.clearRect(0, 0, W, W);
    fg.drawImage(color, 0, 0);
    fg.globalCompositeOperation = "source-in";
    fg.fillStyle = flashCol;
    fg.fillRect(0, 0, W, W);
    fg.globalCompositeOperation = "source-over";
    cg.setTransform(1, 0, 0, 1, 0, 0);
    cg.globalAlpha = flashA;
    cg.drawImage(flash, 0, 0);
    cg.globalAlpha = 1;
  }
  const ink = sheet("ink", W);
  const ig = ink.getContext("2d");
  ig.setTransform(1, 0, 0, 1, 0, 0);
  ig.clearRect(0, 0, W, W);
  ig.drawImage(color, 0, 0);
  ig.globalCompositeOperation = "source-in";
  ig.fillStyle = "#1a1022";
  ig.fillRect(0, 0, W, W);
  ig.globalCompositeOperation = "source-over";
  const o = 3.4;
  const dirs = [[o, 0], [-o, 0], [0, o], [0, -o], [o * 0.7, o * 0.7], [-o * 0.7, o * 0.7], [o * 0.7, -o * 0.7], [-o * 0.7, -o * 0.7]];
  for (let i = 0; i < dirs.length; i++) {
    ctx.drawImage(ink, -U / 2 + dirs[i][0], -U * 0.78 + dirs[i][1], U, U);
  }
  ctx.drawImage(color, -U / 2, -U * 0.78, U, U);
}

function pickPainted(id, t, moving, air, atk) {
  if (getLook() !== "paint") return null;
  let pose = "idle";
  if (atk > 0.15) pose = "atk";
  else if (air) pose = "jump";
  else if (moving) pose = (Math.floor(t / 7) % 2) ? "run" : "idle";
  return paintedBody(id, pose) || paintedBody(id, "idle");
}

let tintCanvas = null;
function drawPainted(ctx, img, x, y, w, h, flashCol, flashA) {
  ctx.drawImage(img, x, y, w, h);
  if (!flashCol || flashA <= 0) return;
  const sw = img.naturalWidth, sh = img.naturalHeight;
  if (!tintCanvas) tintCanvas = document.createElement("canvas");
  if (tintCanvas.width !== sw || tintCanvas.height !== sh) {
    tintCanvas.width = sw;
    tintCanvas.height = sh;
  }
  const g = tintCanvas.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, sw, sh);
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = flashCol;
  g.fillRect(0, 0, sw, sh);
  g.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.globalAlpha *= flashA;
  ctx.drawImage(tintCanvas, x, y, w, h);
  ctx.restore();
}

// ============================================================================
// FUNCIÓN PRINCIPAL EXPORTADA
// ============================================================================

export function drawCharacter(ctx, p, cam, t) {
  const evo = Math.max(0, Math.min(4, Math.round(Number(p.evo) || 0)));
  const facing = p.facing || 1;
  const footX = p.x + p.w / 2 - cam.x;
  const footY = p.y + p.h - cam.y;

  const speed = Math.abs(p.vx || 0);
  const moving = !!p.grounded && speed > 0.55;
  const air = !p.grounded;
  const ascending = air && (p.vy || 0) < -1.2;
  const falling = air && (p.vy || 0) > 1.5;
  const atk = p.melee > 0 ? Math.sin(Math.min(1, (12 - p.melee) / 12) * Math.PI) : 0;
  const hurt = (p.invuln || 0) > 0 || (p.hurtFlash || 0) > 0;
  const hurtFresh = (p.invuln || 0) > 18;

  // Tamaño visual de la forma (con "pop" al evolucionar)
  let H = VISUAL_H[evo] * (CHAR_K[p.id] || 1) * (p.visualScale || 1);
  const burstK = p.evoBurst > 0 ? Math.max(0, Math.min(1, p.evoBurst / Math.max(1, p.evoBurstMax || 90))) : 0;
  if (burstK > 0) H *= 1 + Math.sin((1 - burstK) * Math.PI * 3) * 0.08 * burstK;

  // Squash & stretch global (suave; cada personaje anima sus partes)
  let sx = 1, sy = 1;
  if (ascending) { sx = 0.94; sy = 1.06; }
  else if (falling) { sx = 1.03; sy = 0.97; }
  if (p.grounded && p._wasAir) p._land = 8;
  p._wasAir = air;
  if (p._land > 0) {
    const k = p._land / 8;
    sx *= 1 + 0.12 * k; sy *= 1 - 0.1 * k;
    p._land--;
  }

  const tilt = moving ? 0.05 : air ? (ascending ? -0.04 : 0.05) : 0;
  const lunge = atk * H * 0.08;
  const recoilX = hurtFresh ? -H * 0.08 : 0;

  const color = p.color || "#ffffff";
  const art = ART[p.id] || ART.kilo;
  const pose = computePose(p, t);

  ctx.save();
  ctx.translate(footX, footY);

  // 1 · sombra (se queda en el suelo)
  drawShadow(ctx, 0, 0, H * 0.3 * (air ? 0.7 : 1), H * 0.06 * (air ? 0.7 : 1));

  ctx.scale(facing, 1);
  ctx.translate(recoilX + lunge, 0);

  // 2 · capas traseras
  if (evo >= 4) drawGodRays(ctx, H, color, t);
  if (evo >= 2) drawAura(ctx, H, color, t, evo);
  if (evo >= 3 && !air) drawGroundRing(ctx, H, color, t);
  drawFlavor(ctx, p.id, H, t, evo, false);
  if (moving) drawDust(ctx, H, t, speed);

  // 3 · personaje (vectorial animado, 100 unidades de alto)
  const s = H / 100;
  let flashCol = null, flashA = 0;
  if (burstK > 0.35) { flashCol = "#ffffff"; flashA = ((burstK - 0.35) / 0.65) * 0.9; }
  else if (hurtFresh || (hurt && (p.invuln || 0) % 8 < 4)) { flashCol = "#ff3b4e"; flashA = hurtFresh ? 0.55 : 0.3; }
  const painted = pickPainted(p.id, t, moving, air, atk);
  ctx.save();
  ctx.rotate(tilt * 0.5);
  if (painted) {
    const ih = H * 1.05;
    const iw = ih * (painted.naturalWidth / painted.naturalHeight);
    ctx.scale(sx, sy);
    drawPainted(ctx, painted, -iw / 2, -ih, iw, ih, flashCol, flashA);
  } else {
    ctx.scale(sx * s, sy * s);
    try { presentCharacter(ctx, art, pose, flashCol, flashA); }
    catch (err) {
      try { art.draw(ctx, pose, R); }
      catch (e2) { if (!drawCharacter._warned) { drawCharacter._warned = true; console.warn("[ohana] dibujo", p.id, err); } }
    }
  }
  ctx.restore();

  // 4 · capas delanteras
  drawFlavor(ctx, p.id, H, t, evo, true);
  if (burstK > 0) {
    drawBurst(ctx, H, color, burstK);
    p.evoBurst--;
  }

  ctx.restore();
}
