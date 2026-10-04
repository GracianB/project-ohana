// ============================================================================
// RIG · Project Ohana
// ----------------------------------------------------------------------------
// 1) computePose(p, t): estado lógico → pose animable.
// 2) R: kit de dibujo compartido (contorno pegatina, cel, ojos chibi).
//
// CONTRATO DE ARTE (characters/art/<id>.js):
//   export default { id, draw(ctx, pose, R) }
//   · Origen (0,0) = centro de los PIES. Mira hacia +x.
//   · Unidades de diseño: ~100 de alto (y de 0 a -100).
//   · No tocar globalAlpha salvo con save/restore.
//
// Los campos viejos no cambian. Los nuevos (squash, stretch, bodyTilt,
// armSwing, legSwing, anticipation, impact) son aditivos: el arte viejo
// los ignora y el que quiera puede leerlos.
// ============================================================================

(function safeRadii() {
  const P = typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype;
  if (!P || P.__ohanaSafe) return;
  const el = P.ellipse, ar = P.arc;
  P.ellipse = function (x, y, rx, ry, ...rest) { return el.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, ...rest); };
  P.arc = function (x, y, r, ...rest) { return ar.call(this, x, y, r > 0 ? r : 0, ...rest); };
  if (typeof Path2D !== "undefined") {
    const pe = Path2D.prototype.ellipse, pa = Path2D.prototype.arc;
    Path2D.prototype.ellipse = function (x, y, rx, ry, ...rest) { return pe.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, ...rest); };
    Path2D.prototype.arc = function (x, y, r, ...rest) { return pa.call(this, x, y, r > 0 ? r : 0, ...rest); };
  }
  P.__ohanaSafe = true;
})();

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const PROFILES = {
  kilo:    { freq: 1.18, bounce: 0.85, sway: 1.15, breath: 1.15, land: 0.85, weight: 0.8,  snap: 1.25 },
  pizza:   { freq: 0.82, bounce: 1.45, sway: 1.35, breath: 1.35, land: 1.7,  weight: 1.25, snap: 0.85 },
  michi:   { freq: 1.08, bounce: 0.6,  sway: 0.65, breath: 1.0,  land: 0.55, weight: 0.7,  snap: 1.45 },
  cat:     { freq: 1.08, bounce: 0.6,  sway: 0.65, breath: 1.0,  land: 0.55, weight: 0.7,  snap: 1.45 },
  cuerno:  { freq: 0.7,  bounce: 1.05, sway: 1.2,  breath: 0.85, land: 1.4,  weight: 1.45, snap: 0.7 },
  chispin: { freq: 1.55, bounce: 0.8,  sway: 1.5,  breath: 1.25, land: 0.7,  weight: 0.65, snap: 1.55 },
  pikachu: { freq: 1.55, bounce: 0.8,  sway: 1.5,  breath: 1.25, land: 0.7,  weight: 0.65, snap: 1.55 },
  stitcho: { freq: 0.95, bounce: 0.7,  sway: 1.0,  breath: 1.0,  land: 0.85, weight: 0.9,  snap: 1.0 },
  stitch:  { freq: 0.95, bounce: 0.7,  sway: 1.0,  breath: 1.0,  land: 0.85, weight: 0.9,  snap: 1.0 },
  dragon:  { freq: 0.65, bounce: 0.85, sway: 1.1,  breath: 1.45, land: 1.15, weight: 1.3,  snap: 0.85 },
  dino:    { freq: 0.62, bounce: 1.2,  sway: 1.3,  breath: 1.15, land: 1.7,  weight: 1.65, snap: 0.75 },
  frita:   { freq: 1.2,  bounce: 0.55, sway: 1.35, breath: 1.0,  land: 0.65, weight: 0.8,  snap: 1.35 },
  yomi:    { freq: 0.9,  bounce: 0.35, sway: 1.65, breath: 1.5,  land: 0.4,  weight: 0.55, snap: 1.6 },
  lilo:    { freq: 1.05, bounce: 0.9,  sway: 1.05, breath: 1.05, land: 0.9,  weight: 0.95, snap: 1.05 },
};
const NEUTRAL = { freq: 1, bounce: 1, sway: 1, breath: 1, land: 1, weight: 1, snap: 1 };

function profileOf(p) {
  const id = String(p?.characterId || p?.id || p?.name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  if (PROFILES[id]) return PROFILES[id];
  if (id.includes("chisp") || id.includes("pika") || id.includes("spark")) return PROFILES.chispin;
  if (id.includes("stit")) return PROFILES.stitcho;
  if (id.includes("michi") || id.includes("gato") || id.includes("cat")) return PROFILES.michi;
  if (id.includes("drago")) return PROFILES.dragon;
  return NEUTRAL;
}

/**
 * pose = {
 *   state, move, form, t, color, phase, speed, vy, air, land,
 *   atk, cast, castSlot, hurt, blink, nineLives, look,
 *   sway, bounce, breath, flourish, flourishN, evoT,
 *   squash, stretch, bodyTilt, headTilt, armSwing, legSwing,
 *   anticipation, impact, secondary
 * }
 */
export function computePose(p, t, opts = {}) {
  const prof = profileOf(p);
  const rng = typeof opts.rng === "function" ? opts.rng : (typeof p.rng === "function" ? p.rng : Math.random);
  const r = p._rig || (p._rig = {
    sway: 0, swayV: 0, bounce: 0, bounceV: 0, blinkAt: 90 + rng() * 120, blinkT: 0,
    idleT: 0, flourishT: -1, flourishN: 0, atkMax: 0, phase: 0, land: 0, wasAir: false, lastT: t,
    lastVx: 0, turn: 0, brake: 0,
  });
  const dt = clamp(t - r.lastT, 0, 4) || 1;
  r.lastT = t;

  const vx = p.vx || 0, vy = p.vy || 0;
  const air = !p.grounded;
  const speed = clamp(Math.abs(vx) / Math.max(3, p.speed || 5), 0, 1.4);
  const prevVx = r.lastVx || 0;
  const turning = !air && Math.abs(vx) > 1.2 && Math.abs(prevVx) > 1.2 && Math.sign(vx) !== Math.sign(prevVx);
  const braking = !air && Math.abs(prevVx) > 2 && Math.abs(vx) < Math.abs(prevVx) * 0.72;
  if (turning) r.turn = 1;
  r.turn = Math.max(0, r.turn - 0.11 * dt);
  r.brake = braking ? Math.min(1, Math.abs(prevVx - vx) / 7) : Math.max(0, r.brake - 0.16 * dt);
  r.lastVx = vx;

  if (!air && speed > 0.08) r.phase += (0.16 + speed * 0.2) * dt * prof.freq;

  if (!air && r.wasAir) r.land = 1;
  r.wasAir = air;
  r.land = Math.max(0, r.land - 0.12 * dt);

  const swayTarget = clamp(-vx / 8, -1, 1) * prof.sway;
  r.swayV += (swayTarget - r.sway) * 0.18 - r.swayV * 0.22;
  r.sway = clamp(r.sway + r.swayV, -1.5, 1.5);
  const bounceTarget = clamp(vy / 12, -1, 1) * prof.bounce + (r.land > 0.8 ? 0.8 * prof.land : 0);
  r.bounceV += (bounceTarget - r.bounce) * 0.2 - r.bounceV * 0.2;
  r.bounce = clamp(r.bounce + r.bounceV, -1.5, 1.5);

  r.blinkAt -= dt;
  if (r.blinkAt <= 0) { r.blinkT = 10; r.blinkAt = 110 + rng() * 180; }
  r.blinkT = Math.max(0, r.blinkT - dt);
  const blink = r.blinkT > 0 ? Math.sin((r.blinkT / 10) * Math.PI) : 0;

  let atk = 0;
  if (p.melee > 0) {
    if (!r.atkMax || p.melee > r.atkMax) r.atkMax = p.melee;
    atk = clamp(1 - p.melee / r.atkMax, 0, 1);
  } else r.atkMax = 0;

  let cast = 0, castSlot = -1;
  if (p._cast && t - p._cast.t < 26) {
    cast = clamp((t - p._cast.t) / 26, 0, 1);
    castSlot = p._cast.slot;
  }

  const hurt = (p.invuln || 0) > 18 ? clamp(((p.invuln || 0) - 18) / 10, 0, 1) : 0;

  let state = "idle";
  if (p.dead) state = "dead";
  else if (p._poseOverride) state = p._poseOverride;
  else if (hurt > 0) state = "hurt";
  else if (cast > 0) state = "cast";
  else if (atk > 0) state = "attack";
  else if (p.wall && air) state = "wall";
  else if (air && p._gliding) state = "glide";
  else if (air) state = vy < 0 ? "jump" : "fall";
  else if (speed > 0.08) state = "run";

  if (state === "idle") {
    r.idleT += dt;
    if (r.flourishT < 0 && r.idleT > 200) { r.flourishT = 0; r.idleT = 0; }
  } else { r.idleT = 0; r.flourishT = -1; }
  let flourish = 0;
  if (r.flourishT >= 0) {
    r.flourishT += dt / 80;
    if (r.flourishT >= 1) { r.flourishT = -1; r.flourishN++; }
    else flourish = r.flourishT;
  }

  const anticipation = atk > 0 && atk < 0.28 ? (0.28 - atk) / 0.28 : 0;
  const impact = atk >= 0.28 && atk < 0.55 ? 1 - (atk - 0.28) / 0.27 : 0;
  const stretch = air ? clamp(-vy / 14, -0.35, 0.45) * (state === "jump" ? 1 : 0.7) : 0;
  const squash = r.land * 0.28 * prof.land;
  const run = state === "run" ? speed : 0;

  return {
    state, move: p._move || null, form: clamp(Math.round(Number(p.evo) || 0), 0, 4), t, color: p.color || "#fff",
    phase: r.phase, speed: Math.min(1, speed), vy: clamp(vy / 12, -1, 1), air, land: r.land,
    atk, cast, castSlot, hurt, blink,
    nineLives: Math.max(0, Number(p._nineT) || 0),
    look: { x: 1, y: clamp(vy / 14, -0.6, 0.6) },
    sway: r.sway, bounce: r.bounce, breath: Math.sin(t * 0.06) * prof.breath,
    flourish, flourishN: r.flourishN,
    evoT: p._evoT || 0,
    squash, stretch,
    bodyTilt: clamp(-vx / 10, -1, 1) * 0.18 * prof.sway,
    headTilt: clamp(-vx / 12, -1, 1) * 0.22,
    armSwing: Math.sin(r.phase) * run * prof.snap,
    legSwing: Math.sin(r.phase + Math.PI) * run,
    anticipation: anticipation / prof.snap,
    impact,
    turnPulse: r.turn,
    brake: clamp(r.brake, 0, 1),
    secondary: r.sway * prof.sway,
  };
}

function hexToRgb(h) {
  h = String(h).replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}
function mix(a, b, k) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k);
}
const lighten = (c, k = 0.25) => mix(c, "#ffffff", k);
const darken = (c, k = 0.25) => mix(c, "#000000", k);
function alpha(c, a) {
  const [r, g, b] = hexToRgb(c);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

const INK = "#241733";
const LINE = 3.2;

function volume(ctx, x, y, r, base) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.08, x, y, r * 1.15);
  g.addColorStop(0, lighten(base, 0.32));
  g.addColorStop(0.55, base);
  g.addColorStop(1, darken(base, 0.22));
  return g;
}

function paint(ctx, fill, opt = {}) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (opt.line !== false) {
    ctx.lineWidth = opt.lw || LINE;
    ctx.strokeStyle = opt.ink || INK;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function ellipse(ctx, x, y, rx, ry, color, opt = {}) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), opt.rot || 0, 0, Math.PI * 2);
  paint(ctx, opt.shade === false ? color : volume(ctx, x, y, Math.max(rx, ry), color), opt);
}

function blob(ctx, pts, color, opt = {}) {
  if (!pts || pts.length < 2) return;
  const n = pts.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) ctx.moveTo(p1[0], p1[1]);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
  }
  ctx.closePath();
  if (opt.shade === false) return paint(ctx, color, opt);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, rr = Math.max(maxX - minX, maxY - minY) / 2;
  paint(ctx, volume(ctx, cx, cy, rr, color), opt);
}

function poly(ctx, pts, color, opt = {}) {
  if (!pts || pts.length < 2) return;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  paint(ctx, color, opt);
}

function limb(ctx, x1, y1, x2, y2, x3, y3, w, color, opt = {}) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(x2, y2, x3, y3);
  ctx.strokeStyle = opt.ink || INK;
  ctx.lineWidth = w + (opt.lw || LINE) * 2;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke();
  if (opt.hand !== false) {
    const hr = opt.hand || w * 0.62;
    ellipse(ctx, x3, y3, hr, hr, opt.handColor || color, { shade: false });
  }
  return [x3, y3];
}

function swingLimb(ctx, x, y, len, ang, bend, w, color, opt = {}) {
  const mx = x + Math.sin(ang) * len * 0.5 + Math.cos(ang) * bend;
  const my = y + Math.cos(ang) * len * 0.5;
  const ex = x + Math.sin(ang) * len;
  const ey = y + Math.cos(ang) * len;
  return limb(ctx, x, y, mx, my, ex, ey, w, color, opt);
}

function eye(ctx, x, y, r, pose, opt = {}) {
  const blink = Math.max(pose ? pose.blink : 0, opt.mood === "closed" ? 1 : 0);
  const mood = opt.mood || "normal";
  if (blink > 0.75 || mood === "happy") {
    ctx.beginPath();
    if (mood === "happy") ctx.arc(x, y + r * 0.35, r * 0.8, Math.PI * 1.1, Math.PI * 1.9);
    else { ctx.moveTo(x - r * 0.85, y); ctx.quadraticCurveTo(x, y + r * 0.45, x + r * 0.85, y); }
    ctx.lineWidth = Math.max(2, r * 0.32);
    ctx.strokeStyle = INK;
    ctx.lineCap = "round";
    ctx.stroke();
    return;
  }
  const ry = r * (1.12 - blink * 0.9);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.86, Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = LINE * 0.8;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.clip();
  const lx = (pose ? pose.look.x : 1) * r * 0.18;
  const ly = (pose ? pose.look.y : 0) * r * 0.25;
  const ir = r * 0.62;
  const g = ctx.createLinearGradient(x, y - ir, x, y + ir);
  g.addColorStop(0, darken(opt.iris || "#3a2a1a", 0.25));
  g.addColorStop(1, lighten(opt.iris || "#3a2a1a", 0.35));
  ctx.beginPath();
  ctx.ellipse(x + lx, y + ly + r * 0.08, ir * 0.9, ir, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + lx, y + ly + r * 0.1, ir * 0.48, ir * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = opt.pupil || "#120a18";
  ctx.fill();
  if (opt.shine !== false) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(x + lx - ir * 0.35, y + ly - ir * 0.35, ir * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + lx + ir * 0.3, y + ly + ir * 0.35, ir * 0.14, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (mood === "angry") {
    ctx.beginPath();
    ctx.moveTo(x - r * 1.0, y - r * 1.25);
    ctx.lineTo(x + r * 0.9, y - r * 0.7);
    ctx.lineWidth = Math.max(2, r * 0.3);
    ctx.strokeStyle = INK;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  if (mood === "sad") {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.9, y - r * 0.85);
    ctx.quadraticCurveTo(x, y - r * 0.45, x + r * 0.9, y - r * 0.85);
    ctx.lineWidth = Math.max(1.6, r * 0.22);
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
  if (opt.lash) {
    ctx.beginPath();
    ctx.moveTo(x + r * 0.6, y - r * 0.8); ctx.lineTo(x + r * 1.05, y - r * 1.15);
    ctx.moveTo(x + r * 0.85, y - r * 0.45); ctx.lineTo(x + r * 1.25, y - r * 0.65);
    ctx.lineWidth = Math.max(1.5, r * 0.2);
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

function mouth(ctx, x, y, w, mood = "smile", opt = {}) {
  ctx.lineWidth = Math.max(2, w * 0.18);
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (mood === "smile") {
    ctx.arc(x, y - w * 0.3, w * 0.5, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else if (mood === "flat") {
    ctx.moveTo(x - w * 0.4, y); ctx.lineTo(x + w * 0.4, y); ctx.stroke();
  } else if (mood === "o") {
    ctx.ellipse(x, y, w * 0.22, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = opt.inside || "#6b1f2e"; ctx.fill(); ctx.stroke();
  } else {
    const h = mood === "roar" ? w * 0.75 : mood === "grin" ? w * 0.38 : w * 0.5;
    ctx.moveTo(x - w * 0.5, y - h * 0.2);
    ctx.quadraticCurveTo(x, y - h * 0.05, x + w * 0.5, y - h * 0.2);
    ctx.quadraticCurveTo(x, y + h * 1.1, x - w * 0.5, y - h * 0.2);
    ctx.closePath();
    ctx.fillStyle = opt.inside || "#6b1f2e";
    ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = opt.tongue || "#ff7a8a";
    ctx.beginPath(); ctx.ellipse(x, y + h * 0.75, w * 0.3, h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    if (mood === "fang" || mood === "roar" || mood === "grin") {
      ctx.fillStyle = "#ffffff";
      const n = mood === "grin" ? 5 : 2;
      for (let i = 0; i < n; i++) {
        const fx = x - w * 0.36 + (i * w * 0.72) / Math.max(1, n - 1);
        ctx.beginPath(); ctx.moveTo(fx - w * 0.07, y - h * 0.2); ctx.lineTo(fx + w * 0.07, y - h * 0.2); ctx.lineTo(fx, y + h * 0.25); ctx.fill();
      }
    }
    ctx.restore();
    ctx.stroke();
  }
}

function blush(ctx, x, y, r, color = "#ff7aa0") {
  ctx.save();
  ctx.fillStyle = alpha(color, 0.5);
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function shine(ctx, x, y, rx, ry, a = 0.55) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255," + a + ")";
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function star(ctx, x, y, r, color, opt = {}) {
  const n = opt.points || 5, inner = opt.inner || 0.45;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n + (opt.rot || 0);
    const rr = i % 2 ? r * inner : r;
    i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  paint(ctx, color, opt);
}

function sparkle(ctx, x, y, r, color = "#fff6c0") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

function tail(ctx, x, y, len, baseAng, wave, w0, w1, color, opt = {}) {
  const n = opt.segments || 10;
  const waveAt = typeof wave === "function" ? wave : () => Number(wave) || 0;
  const pts = [];
  let a = baseAng, px = x, py = y;
  for (let i = 0; i <= n; i++) {
    pts.push([px, py]);
    a += waveAt(i / n) / n;
    px += Math.cos(a) * (len / n);
    py += Math.sin(a) * (len / n);
  }
  for (const pass of [0, 1]) {
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const w = w0 + (w1 - w0) * k;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.lineCap = "round";
      ctx.lineWidth = pass ? w : w + (opt.lw || LINE) * 2;
      ctx.strokeStyle = pass ? color : (opt.ink || INK);
      ctx.stroke();
    }
  }
  return pts[n];
}

function halo(ctx, x, y, rx, t, color = "#ffe27a") {
  ctx.save();
  ctx.lineWidth = 7;
  ctx.strokeStyle = alpha(color, 0.28);
  ctx.beginPath();
  ctx.ellipse(x, y + Math.sin(t * 0.08) * 1.5, rx, rx * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function celShade(ctx, x, y, rx, ry, color, k = 0.18) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = alpha(darken(color, 0.5), k);
  ctx.beginPath();
  ctx.ellipse(x + rx * 0.35, y + ry * 0.45, rx * 1.05, ry * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const R = {
  INK, LINE, clamp, mix, lighten, darken, alpha, volume, paint,
  ellipse, blob, poly, limb, swingLimb, eye, mouth, blush, shine, star, sparkle, tail, halo, celShade,
};

// ---------------------------------------------------------------------------
// MOTION POLISH · identidad cinética por personaje
// ---------------------------------------------------------------------------
// Los artistas reciben una pose común, pero cada criatura tiene su propio
// peso, cadencia, elasticidad y agresividad. Así evitamos diez muñecos con la
// misma animación de PowerPoint.
export const MOTION_PROFILES = {
  kilo:    { pace: 0.96, sway: 1.18, bounce: 1.08, weight: 0.82, attack: 1.10, impact: 1.05, jump: 1.08, cast: 1.00, dash: 0.90 },
  stitcho: { pace: 1.12, sway: 1.20, bounce: 0.92, weight: 0.68, attack: 1.18, impact: 1.05, jump: 1.18, cast: 1.08, dash: 1.32 },
  chispin: { pace: 1.38, sway: 1.42, bounce: 0.74, weight: 0.54, attack: 1.28, impact: 1.18, jump: 1.28, cast: 1.22, dash: 1.48 },
  cat:     { pace: 1.18, sway: 0.82, bounce: 0.62, weight: 0.48, attack: 1.32, impact: 0.98, jump: 1.22, cast: 1.10, dash: 1.38 },
  dragon:  { pace: 0.74, sway: 1.06, bounce: 1.18, weight: 1.22, attack: 1.04, impact: 1.32, jump: 1.10, cast: 1.28, dash: 0.82 },
  dino:    { pace: 0.70, sway: 1.16, bounce: 1.28, weight: 1.46, attack: 0.94, impact: 1.46, jump: 0.96, cast: 1.02, dash: 0.76 },
  frita:   { pace: 1.10, sway: 1.30, bounce: 0.88, weight: 0.76, attack: 1.24, impact: 1.16, jump: 1.06, cast: 1.16, dash: 1.18 },
  pizza:   { pace: 0.86, sway: 1.24, bounce: 1.46, weight: 1.34, attack: 1.02, impact: 1.34, jump: 0.88, cast: 1.12, dash: 0.86 },
  yomi:    { pace: 0.92, sway: 1.62, bounce: 0.36, weight: 0.40, attack: 1.16, impact: 0.92, jump: 1.34, cast: 1.34, dash: 1.10 },
  cuerno:  { pace: 0.82, sway: 1.28, bounce: 1.34, weight: 1.06, attack: 1.12, impact: 1.20, jump: 1.02, cast: 1.08, dash: 0.90 },
};

const MOTION_ALIAS = { lilo: "kilo", stitch: "stitcho", pikachu: "chispin", michi: "cat" };
export function motionProfile(actor) {
  const raw = String(actor?.id || actor?.characterId || actor?.name || "")
    .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  return MOTION_PROFILES[MOTION_ALIAS[raw] || raw] || NEUTRAL;
}

export function enhancePose(pose, actor = {}) {
  if (!pose) return pose;
  const m = motionProfile(actor);
  const form = clamp(Number(pose.form) || 0, 0, 4);
  const tier = 1 + form * 0.045;
  const q = { ...pose };
  q.armSwing = (q.armSwing || 0) * m.pace * m.sway * tier;
  q.legSwing = (q.legSwing || 0) * m.pace * tier;
  q.sway = (q.sway || 0) * m.sway;
  q.bounce = (q.bounce || 0) * m.bounce;
  q.breath = (q.breath || 0) * (0.92 + m.pace * 0.08);
  q.bodyTilt = clamp((q.bodyTilt || 0) * m.pace, -0.38, 0.38);
  q.headTilt = clamp((q.headTilt || 0) * (1.05 + m.sway * 0.18), -0.34, 0.34);
  q.anticipation = clamp((q.anticipation || 0) * m.attack, 0, 1);
  q.impact = clamp((q.impact || 0) * m.impact, 0, 1.3);
  q.squash = clamp((q.squash || 0) * m.weight, 0, 0.32);
  q.stretch = clamp((q.stretch || 0) * m.jump, -0.45, 0.60);
  q.motionPace = m.pace;
  q.motionWeight = m.weight;
  q.motionAccent = m.sway;

  const face = Number(actor?.facing) || 1;
  if (actor?.dash > 0) {
    q.bodyTilt = clamp(q.bodyTilt + face * 0.16 * m.dash, -0.48, 0.48);
    q.stretch = clamp(q.stretch + 0.12 * m.dash, -0.45, 0.72);
    q.squash *= 0.65;
  }
  if (q.air) {
    q.stretch = clamp(q.stretch + (q.state === "jump" ? 0.06 : 0.02) * m.jump, -0.45, 0.72);
    q.headTilt = clamp(q.headTilt + (q.state === "fall" ? 0.035 : -0.025), -0.38, 0.38);
  }
  if (q.state === "attack") {
    if (q.anticipation > 0) q.bodyTilt = clamp(q.bodyTilt - face * 0.10 * q.anticipation * m.attack, -0.50, 0.50);
    if (q.impact > 0) {
      q.bodyTilt = clamp(q.bodyTilt + face * 0.18 * q.impact, -0.58, 0.58);
      q.stretch = clamp(q.stretch + 0.10 * q.impact, -0.45, 0.74);
      q.squash = clamp(q.squash + 0.035 * q.impact * m.weight, 0, 0.34);
    }
  }
  if (q.state === "cast") {
    const castWave = Math.sin(clamp(q.cast || 0, 0, 1) * Math.PI);
    q.bodyTilt = clamp(q.bodyTilt + face * 0.055 * castWave * m.cast, -0.45, 0.45);
    q.headTilt = clamp(q.headTilt - 0.075 * castWave * m.cast, -0.40, 0.40);
    q.stretch = clamp(q.stretch + 0.035 * castWave * m.cast, -0.45, 0.72);
  }
  if (q.state === "dead") {
    q.bodyTilt = clamp(face * 0.34, -0.45, 0.45);
    q.stretch = -0.12;
    q.squash = clamp(q.squash + 0.08, 0, 0.34);
  }
  return q;
}
