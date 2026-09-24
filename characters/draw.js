import { drawBaby } from "./baby.js";
import { formArt, silhouette } from "./sprites.js";

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
// 3. Forma 0 = bebé chibi (baby.js); formas 1-4 = PNG de assets/sprites.
//    Si un PNG no ha cargado todavía, se muestra el bebé escalado como reserva.
// 4. Capas: sombra → aura/rayos → arte (squash & stretch) → flash → partículas.
// ============================================================================

const VISUAL_H = [36, 48, 58, 68, 80];
const CHAR_K = { lilo: 1.0, stitch: 0.95, pikachu: 0.92, cat: 0.9, dragon: 0.95, frita: 1.06 };
const MAX_RATIO = 1.9; // ancho máximo = 1.9 × alto (dragones muy anchos)

const FLAVOR = {
  lilo:    { kind: "petal", colors: ["#ff9ab0", "#ffd36a", "#ffffff"] },
  stitch:  { kind: "spark", colors: ["#7ef0ff", "#3fa8ff", "#ffffff"] },
  pikachu: { kind: "bolt",  colors: ["#fff36a", "#ffd000", "#ffffff"] },
  cat:     { kind: "star",  colors: ["#ffd0ee", "#fff6a8", "#c9a8ff"] },
  dragon:  { kind: "ember", colors: ["#ff7a2a", "#ffd84a", "#ff3b2a"] },
  frita:   { kind: "salt",  colors: ["#ffffff", "#fff3c4", "#ff4a3a"] },
};

// ---------------------------------------------------------------------------
// Normalizador de dibujos procedurales: los renderiza una vez fuera de pantalla,
// mide su caja real y así podemos escalarlos y apoyarlos en el suelo igual que
// un sprite.
// ---------------------------------------------------------------------------
const measured = new Map();
function measure(key, draw) {
  if (measured.has(key)) return measured.get(key);
  let box = { top: -24, bottom: 20, left: -20, right: 20 };
  try {
    const S = 320, O = 160;
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.translate(O, O);
    draw(g);
    const d = g.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = -1, y1 = -1;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (d[(y * S + x) * 4 + 3] > 90) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 > x0 && y1 > y0) box = { top: y0 - O, bottom: y1 - O, left: x0 - O, right: x1 - O };
  } catch (_) {}
  measured.set(key, box);
  return box;
}

function stubPlayer(p, evo) {
  return {
    id: p.id, evo, color: p.color, w: p.w, h: p.h, facing: 1, vx: 0, vy: 0,
    grounded: true, melee: 0, invuln: 0,
    _anim: { step: 0, moving: false, idle: true, air: false, legL: 0, legR: 0, armL: 0, armR: 0 },
  };
}

/**
 * Bebé chibi (baby.js) con los pies en (0,0) y altura H.
 * También hace de reserva mientras el PNG de una forma adulta termina de cargar.
 */
function drawProceduralNormalized(ctx, p, t, evo, H) {
  const fn = (g, pp, tt) => drawBaby(g, pp, tt);
  const key = "baby:" + p.id;
  const box = measure(key, (g) => fn(g, stubPlayer(p, 0), 0));
  const s = H / Math.max(8, box.bottom - box.top);
  ctx.save();
  ctx.scale(s, s);
  ctx.translate(-(box.left + box.right) / 2, -box.bottom);
  fn(ctx, p, t);
  ctx.restore();
}

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
  const idle = !!p.grounded && !moving;
  const ascending = air && (p.vy || 0) < -1.2;
  const falling = air && (p.vy || 0) > 1.5;
  const runT = t * (0.52 + speed * 0.16);
  const step = Math.sin(runT);
  const atk = p.melee > 0 ? Math.sin(Math.min(1, (12 - p.melee) / 12) * Math.PI) : 0;
  const hurt = (p.invuln || 0) > 0 || (p.hurtFlash || 0) > 0;
  const hurtFresh = (p.invuln || 0) > 18;

  // Tamaño visual de la forma (con "pop" al evolucionar)
  let H = VISUAL_H[evo] * (CHAR_K[p.id] || 1) * (p.visualScale || 1);
  const burstK = p.evoBurst > 0 ? Math.max(0, Math.min(1, p.evoBurst / Math.max(1, p.evoBurstMax || 90))) : 0;
  if (burstK > 0) H *= 1 + Math.sin((1 - burstK) * Math.PI * 3) * 0.08 * burstK;

  // Squash & stretch anclado en los pies
  let sx = 1, sy = 1;
  if (ascending) { sx = 0.9; sy = 1.1; }
  else if (falling) { sx = 1.05; sy = 0.95; }
  else if (moving) { sx = 1 + Math.abs(step) * 0.05; sy = 1 - Math.abs(step) * 0.05; }
  else { const b = Math.sin(t * 0.08); sx = 1 - b * 0.018; sy = 1 + b * 0.025; }
  if (p.grounded && p._wasAir) p._land = 8;
  p._wasAir = air;
  if (p._land > 0) {
    const k = p._land / 8;
    sx *= 1 + 0.16 * k; sy *= 1 - 0.14 * k;
    p._land--;
  }
  if (atk) { sx *= 1 + atk * 0.1; sy *= 1 - atk * 0.05; }

  const hop = moving ? -Math.abs(step) * H * 0.05 : 0;
  const tilt = moving ? 0.06 + step * 0.03 : air ? (ascending ? -0.06 : 0.08) : Math.sin(t * 0.05) * 0.015;
  const lunge = atk * H * 0.1;
  const recoilX = hurtFresh ? -H * 0.08 : 0;

  // Estado de animación para dibujadores procedurales (compatibilidad)
  p._anim = {
    step, moving, idle, air, ascending, falling, hurt, hurtFresh,
    legL: moving ? step * 7 : (air ? (ascending ? -3 : 4) : Math.sin(t * 0.08) * 1.2),
    legR: moving ? -step * 7 : (air ? (ascending ? -3 : 4) : -Math.sin(t * 0.08) * 1.2),
    armL: moving ? -step * 5 : (atk ? -8 : Math.sin(t * 0.09) * 2),
    armR: moving ? step * 5 : (atk ? 10 : -Math.sin(t * 0.09) * 2),
  };

  const color = p.color || "#ffffff";
  const art = formArt(p.id, evo);

  ctx.save();
  ctx.translate(footX, footY);

  // 1 · sombra (se queda en el suelo aunque salte el personaje en el sprite)
  drawShadow(ctx, 0, 0, H * 0.3 * (air ? 0.7 : 1), H * 0.06 * (air ? 0.7 : 1));

  ctx.scale(facing, 1);
  ctx.translate(recoilX + lunge, 0);

  // 2 · capas traseras
  if (evo >= 4) drawGodRays(ctx, H, color, t);
  if (evo >= 2) drawAura(ctx, H, color, t, evo);
  if (evo >= 3 && !air) drawGroundRing(ctx, H, color, t);
  drawFlavor(ctx, p.id, H, t, evo, false);
  if (moving) drawDust(ctx, H, t, speed);

  // 3 · personaje
  ctx.save();
  ctx.translate(0, hop);
  ctx.rotate(tilt + atk * 0.12);
  ctx.scale(sx, sy);
  if (art) {
    const img = art.img;
    const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    let h = H * art.sy;
    let w = h * (iw / ih) * art.sx;
    const maxW = H * MAX_RATIO;
    if (w > maxW) { h *= maxW / w; w = maxW; }
    ctx.drawImage(img, -w / 2, -h, w, h);
    // flash: daño (rojo parpadeante) o evolución (blanco)
    let flashCol = null, flashA = 0;
    if (burstK > 0.35) { flashCol = "#ffffff"; flashA = (burstK - 0.35) / 0.65 * 0.9; }
    else if (hurtFresh || (hurt && (p.invuln || 0) % 8 < 4)) { flashCol = "#ff3b4e"; flashA = hurtFresh ? 0.6 : 0.35; }
    if (flashCol) {
      const sil = silhouette(img, flashCol);
      if (sil) {
        ctx.save();
        ctx.globalAlpha *= flashA;
        ctx.drawImage(sil, -w / 2, -h, w, h);
        ctx.restore();
      }
    }
  } else {
    drawProceduralNormalized(ctx, p, t, evo, H);
    if (hurt && (hurtFresh || (p.invuln || 0) % 8 < 4)) {
      ctx.save();
      ctx.globalAlpha *= 0.25;
      ctx.fillStyle = "#ff3030";
      ctx.beginPath();
      ctx.ellipse(0, -H * 0.5, H * 0.45, H * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
