// ============================================================================
// MICHI · gatita rosa (diseño original) · characters/art/cat.js
// ----------------------------------------------------------------------------
// Siempre a cuatro patas. Formas:
//   0 Michito (diminuto y redondo)   1 Michi (elegante, cola larga)
//   2 Nube rosa (pelaje de nube)     3 Nueve vidas (morada, luna, colas fantasma)
//   4 MICHI GOD (blanca, alas, halo, 9 colas en abanico)
// Modos de cuerpo: stand · sit (victoria / lavarse) · stretch (desperezo)
//                  curl (cast 1, ovillo) · wall (vertical, garras) · dead (tumbada)
// ============================================================================

const PAL = [
  { fur: "#ffc8e8", belly: "#fff2f9", ear: "#ff8fc4", iris: "#35a4ff" },
  { fur: "#ffaedb", belly: "#ffe8f5", ear: "#ff78b8", iris: "#2f9be0" },
  { fur: "#ff9ad6", belly: "#fff3fb", ear: "#ff5fb4", iris: "#8a5cff" },
  { fur: "#5f419c", belly: "#8f73c9", ear: "#d487e6", iris: "#ffc93a" },
  { fur: "#fff9fc", belly: "#ffffff", ear: "#ffb3d9", iris: "#ff5ac8" },
];
const DIMS = [
  { hr: 30, bl: 17, bh: 14, ll: 12, lw: 9, tl: 28 },
  { hr: 25, bl: 25, bh: 14.5, ll: 20, lw: 7.5, tl: 46 },
  { hr: 26, bl: 26, bh: 17, ll: 18, lw: 8, tl: 50 },
  { hr: 25, bl: 27, bh: 15.5, ll: 22, lw: 7.5, tl: 46 },
  { hr: 25, bl: 27, bh: 15.5, ll: 23, lw: 7.5, tl: 44 },
];
const BOW = "#e8283a";

const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => k * k * (3 - 2 * k);
const rp = (cx, cy, a, x, y) => { const c = Math.cos(a), s = Math.sin(a); return [cx + x * c - y * s, cy + x * s + y * c]; };

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function ik(ctx, R, sx, sy, tx, ty, L, dir, w, col, opt) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.01;
  if (d > L) { tx = sx + (dx / d) * L; ty = sy + (dy / d) * L; dx = tx - sx; dy = ty - sy; d = L; }
  const h = Math.sqrt(Math.max(0, (L * L) / 4 - (d * d) / 4));
  const mx = (sx + tx) / 2 + (-dy / d) * h * dir, my = (sy + ty) / 2 + (dx / d) * h * dir;
  return R.limb(ctx, sx, sy, 2 * mx - (sx + tx) / 2, 2 * my - (sy + ty) / 2, tx, ty, w, col, opt);
}

function tailPts(x, y, len, ang, wave, n) {
  const pts = [[x, y]];
  let a = ang, px = x, py = y;
  for (let i = 0; i < n; i++) {
    a += wave(i / n) / n;
    px += Math.cos(a) * (len / n);
    py += Math.sin(a) * (len / n);
    pts.push([px, py]);
  }
  return pts;
}

function strokeTail(ctx, R, pts, w0, w1, col, ink, glow) {
  const n = pts.length - 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (glow) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = glow;
    ctx.lineWidth = w0 * 2.6;
    ctx.stroke();
  }
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? col : ink || R.INK;
    for (let i = 0; i < n; i++) {
      const w = w0 + (w1 - w0) * (i / n);
      ctx.lineWidth = pass ? w : w + R.LINE * 2;
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
    }
  }
}

/** Cola esponjosa de nube: círculos unidos con un único contorno. */
function fluffyTail(ctx, R, pts, r0, r1, col) {
  const n = pts.length - 1;
  const rad = (i) => { const k = i / n; return lerp(r0, r1, Math.sin(k * Math.PI * 0.85)) * (1 - k * 0.25); };
  ctx.beginPath();
  for (let i = 1; i <= n; i++) { ctx.moveTo(pts[i][0] + rad(i), pts[i][1]); ctx.arc(pts[i][0], pts[i][1], rad(i), 0, Math.PI * 2); }
  ctx.lineWidth = R.LINE * 2; ctx.strokeStyle = R.INK; ctx.stroke();
  ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  for (let i = 2; i <= n; i += 2) { const q = rad(i) * 0.4; ctx.moveTo(pts[i][0] - q * 0.5 + q, pts[i][1] - q); ctx.arc(pts[i][0] - q * 0.5, pts[i][1] - q, q, 0, Math.PI * 2); }
  ctx.fill();
}

function heart(ctx, x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.2, x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  ctx.fill();
}

function yarn(ctx, R, x, y, r, rot) {
  R.ellipse(ctx, x, y, r, r, "#ff5a8a", { lw: 2.2 });
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = "#ffc2d6"; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.75, r * 0.35, 0.5, 0, Math.PI * 2);
  ctx.moveTo(r * 0.6, -r * 0.5); ctx.quadraticCurveTo(0, 0, -r * 0.4, r * 0.7);
  ctx.moveTo(-r * 0.7, -r * 0.2); ctx.quadraticCurveTo(0, -r * 0.3, r * 0.2, r * 0.8);
  ctx.stroke();
  ctx.restore();
}

function bow(ctx, R, x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  R.blob(ctx, [[0, 0], [-s * 0.9, -s * 0.7], [-s * 1.15, s * 0.1], [-s * 0.7, s * 0.6]], BOW, { lw: 2.4 });
  R.blob(ctx, [[0, 0], [s * 0.9, -s * 0.7], [s * 1.15, s * 0.1], [s * 0.7, s * 0.6]], BOW, { lw: 2.4 });
  R.poly(ctx, [[-s * 0.15, s * 0.2], [-s * 0.5, s * 1.1], [-s * 0.15, s * 0.95]], R.darken(BOW, 0.15), { lw: 2 });
  R.poly(ctx, [[s * 0.15, s * 0.2], [s * 0.45, s * 1.05], [s * 0.1, s * 0.95]], R.darken(BOW, 0.15), { lw: 2 });
  R.ellipse(ctx, 0, 0, s * 0.32, s * 0.36, R.darken(BOW, 0.1), { lw: 2.2 });
  R.shine(ctx, -s * 0.7, -s * 0.25, s * 0.2, s * 0.1, 0.6);
  ctx.restore();
}

function angelWing(ctx, R, x, y, s, flap, far) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.25 - flap * 0.5);
  if (far) ctx.scale(0.8, 0.8);
  const col = far ? "#f1e6ff" : "#ffffff";
  const rows = [
    [[0, 0], [-s * 0.3, -s * 0.55], [-s * 0.8, -s * 0.9], [-s * 1.3, -s * 0.85], [-s * 1.05, -s * 0.55], [-s * 1.2, -s * 0.35], [-s * 0.85, -s * 0.2], [-s * 0.9, 0], [-s * 0.4, s * 0.1]],
  ];
  R.blob(ctx, rows[0], col, { lw: 2.6 });
  ctx.strokeStyle = "rgba(200,170,120,0.7)"; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, -s * 0.25); ctx.quadraticCurveTo(-s * 0.7, -s * 0.5, -s * 1.0, -s * 0.52);
  ctx.moveTo(-s * 0.25, -s * 0.05); ctx.quadraticCurveTo(-s * 0.6, -s * 0.2, -s * 0.85, -s * 0.2);
  ctx.stroke();
  ctx.fillStyle = "#ffe27a";
  ctx.beginPath(); ctx.arc(-s * 1.22, -s * 0.8, s * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// pose
// ---------------------------------------------------------------------------
function solve(pose, d, f) {
  const t = pose.t, st = pose.state;
  const BX = -10, BY = -(d.ll + d.bh * 0.75);
  const SX = BX + d.bl * 0.55, HX = BX - d.bl * 0.6;
  const r = {
    mode: "stand", bx: BX, by: BY, tilt: 0, ox: 0, oy: 0, autoLeg: false,
    fn: [SX + 3, 0], ff: [SX + 8, 0], bn: [HX + 2, 0], bf: [HX + 7, 0],
    headRot: Math.sin(t * 0.03) * 0.05, hdx: 0, hdy: 0,
    earB: 0, earF: Math.pow(Math.max(0, Math.sin(t * 0.045)), 18) * -0.6,
    mood: "normal", mouth: "cat", tongue: false, pawOver: false,
    tailBase: -2.0 + pose.sway * 1.1 - pose.bounce * 0.35, tailC: 2.6 * (1 + pose.sway * 0.4), tailPh: Math.sin(t * 0.04) * 0.9, tailSpd: 1,
    fan: 0, glow: false, fx: null, fxK: 0, bristle: false, claws: 0, slash: 0, puff: 1,
  };
  r.earB = Math.pow(Math.max(0, Math.sin(t * 0.045 + 2.2)), 18) * -0.5;
  const sit = () => {
    r.mode = "sit"; r.tilt = -0.95; r.autoLeg = true; r.bx = BX - 2;
    r.by = -2 - ((-d.bl * 0.8) * Math.sin(r.tilt) + d.bh * 0.6 * Math.cos(r.tilt));
    r.fn = [BX + d.bl * 0.45, 0]; r.ff = [BX + d.bl * 0.6, 0];
    r.tailBase = -1.75; r.tailC = -1.8; r.tailPh = 0.6 + Math.sin(t * 0.05) * 0.3;
  };
  const legStep = (q, S, lift) => [Math.sin(q) * S, -Math.max(0, Math.cos(q)) * lift];

  switch (st) {
    case "run": {
      const q = pose.phase, S = d.ll * 0.5, lift = d.ll * 0.42;
      const a = legStep(q, S, lift), b = legStep(q + Math.PI, S, lift);
      r.fn = [SX + 3 + a[0], a[1]]; r.bf = [HX + 7 + a[0], a[1]];
      r.ff = [SX + 8 + b[0], b[1]]; r.bn = [HX + 2 + b[0], b[1]];
      r.oy = -Math.abs(Math.cos(q)) * 2.4;
      r.tilt = Math.sin(q * 2) * 0.03;
      r.hdy = Math.cos(q * 2) * 0.8;
      r.earB = -0.3; r.earF = -0.25; r.headRot = 0.04;
      r.tailBase = -2.25 + Math.sin(q) * 0.1; r.tailC = 1.6; r.tailPh = 0.4 + Math.sin(q) * 0.5;
      break;
    }
    case "jump":
      r.tilt = -0.24; r.autoLeg = true;
      r.fn = [SX + 15, -d.ll * 0.7]; r.ff = [SX + 19, -d.ll * 0.6];
      r.bn = [HX - 12, -1]; r.bf = [HX - 8, -3];
      r.earB = -0.35; r.earF = -0.3; r.tailBase = -2.7; r.tailC = 1.2; r.mouth = "open";
      break;
    case "fall":
      r.tilt = 0.12;
      r.fn = [SX + 9, 2]; r.ff = [SX + 13, 1]; r.bn = [HX + 5, -5]; r.bf = [HX + 9, -6];
      r.earB = 0.2; r.earF = 0.25; r.tailBase = -1.45; r.tailC = 2.2; r.mouth = "o";
      break;
    case "attack": {
      const a = pose.atk;
      r.mood = "angry"; r.mouth = "fang"; r.earB = -0.5; r.earF = -0.45;
      if (a < 0.3) {
        const k = ease(a / 0.3);
        r.by = BY + 5 * k; r.tilt = 0.14 * k; r.hdy = 3 * k;
        r.bn = [HX + 4, 0]; r.bf = [HX + 9, 0];
        r.tailBase = -2.4; r.tailPh = t * 0.3;
      } else {
        const k = a < 0.6 ? ease((a - 0.3) / 0.3) : 1, rec = a < 0.6 ? 0 : (a - 0.6) / 0.4;
        r.oy = -Math.sin(Math.min(1, (a - 0.3) / 0.45) * Math.PI) * 9;
        r.ox = k * 8 * (1 - rec * 0.5);
        r.tilt = lerp(0.14, -0.2, k) * (1 - rec); r.autoLeg = true;
        const sx = SX + 2;
        const ang = lerp(-0.9, 0.5, k);
        r.fn = [sx + Math.cos(ang) * d.ll * 1.2, BY + Math.sin(ang) * d.ll * 1.1];
        r.ff = [SX + 10, r.oy < -2 ? -4 : 0];
        r.bn = [HX - 4, 0]; r.bf = [HX, 0];
        r.pawOver = true; r.claws = 1;
        if (a < 0.8) r.slash = 1 - Math.max(0, (a - 0.5) / 0.3);
      }
      break;
    }
    case "cast": {
      const c = pose.cast, slot = pose.castSlot;
      r.fxK = c;
      if (slot === 1) {
        r.mode = "curl"; r.mood = "closed"; r.fx = "purr";
      } else if (slot === 2) {
        r.tilt = -0.12; r.headRot = -0.18; r.mood = "closed"; r.mouth = "open";
        r.fan = 1; r.glow = true; r.fx = "tails"; r.tailBase = -1.9; r.tailC = 1.2; r.tailPh = t * 0.05;
        r.earB = 0.2; r.earF = 0.2;
      } else {
        const k = Math.min(1, c / 0.35);
        const ang = lerp(0.6, -0.5, ease(k));
        r.autoLeg = true; r.pawOver = true;
        r.fn = [SX + 2 + Math.cos(ang) * d.ll * 1.2, BY + 6 + Math.sin(ang) * d.ll];
        r.tilt = -0.06; r.bn = [HX, 0];
        r.mood = "happy"; r.mouth = "open"; r.fx = "yarn";
      }
      break;
    }
    case "hurt":
      r.bristle = true; r.mood = "hurt"; r.mouth = "fang"; r.earB = -0.9; r.earF = -0.9;
      r.by = BY - 4; r.tilt = -0.06; r.autoLeg = true; r.hdx = -2;
      r.fn = [SX + 7, 0]; r.ff = [SX + 10, 0]; r.bn = [HX - 5, 0]; r.bf = [HX - 2, 0];
      r.tailBase = -1.6; r.tailC = 0.3; r.tailPh = 0; r.puff = 1.7; r.headRot = -0.15;
      break;
    case "wall":
      r.mode = "wall"; r.autoLeg = true; r.claws = 1;
      r.fn = [SX + 6, 1]; r.ff = [SX + 1, 0]; r.bn = [HX + 7, 1]; r.bf = [HX + 2, 0];
      r.headRot = Math.PI / 2 - 0.3; r.earB = -0.2; r.tailBase = -1.5; r.tailC = 2.4; r.mouth = "flat"; r.hdx = -4;
      break;
    case "dead":
      r.mode = "dead"; r.mood = "dead"; r.tongue = true; r.mouth = "flat";
      break;
    case "victory": {
      sit();
      r.oy = -Math.abs(Math.sin(t * 0.08)) * 3;
      r.headRot = -0.14; r.mood = "happy"; r.mouth = "cat"; r.fx = "stars";
      r.tailBase = -1.6; r.tailC = -2.4; r.tailPh = 0.9 + Math.sin(t * 0.09) * 0.25; r.earF = 0.15; r.earB = 0.1;
      break;
    }
    default: {
      if (pose.flourish > 0) {
        const fl = pose.flourish, n = pose.flourishN % 3, k = Math.min(1, Math.sin(fl * Math.PI) * 1.8);
        if (n === 0) {
          // se lame la pata y se lava la cara
          sit();
          r.pawOver = true; r.mood = "closed"; r.tongue = true; r.headRot = 0.18;
          r.fx = "lick";
          r.fxK = fl;
        } else if (n === 1) {
          // desperezo
          r.mode = "stretch"; r.autoLeg = true;
          r.tilt = 0.32 * k; r.by = BY - 3 * k + 3 * k; r.bx = BX - 3 * k;
          r.fn = [SX + 3 + 14 * k, 0]; r.ff = [SX + 8 + 15 * k, 0];
          r.bn = [HX + 1, 0]; r.bf = [HX + 6, 0];
          r.hdy = 8 * k; r.hdx = 6 * k; r.headRot = -0.2 * k;
          r.mood = "closed"; r.mouth = "open"; r.tailBase = -1.5; r.tailC = 1.2 + Math.sin(t * 0.1) * 0.3;
          r.earB = -0.3 * k; r.earF = -0.3 * k;
        } else {
          // mueve la cola, orejas giran
          r.tailC = 3.4; r.tailPh = Math.sin(t * 0.22) * 2.2; r.tailBase = -1.9 + Math.sin(t * 0.22) * 0.35;
          r.earF = Math.sin(t * 0.3) * 0.45; r.earB = Math.sin(t * 0.3 + 1.5) * 0.4;
          r.mood = "happy"; r.headRot = Math.sin(t * 0.11) * 0.1;
        }
      }
    }
  }
  return r;
}

// ---------------------------------------------------------------------------
// cabeza
// ---------------------------------------------------------------------------
function ear(ctx, R, x, y, ang, s, fur, inner) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  R.blob(ctx, [[-s * 0.55, s * 0.1], [-s * 0.3, -s * 0.6], [-s * 0.05, -s * 1.15], [s * 0.3, -s * 0.55], [s * 0.55, s * 0.1]], fur);
  R.blob(ctx, [[-s * 0.3, 0], [-s * 0.1, -s * 0.8], [s * 0.28, 0]], inner, { line: false, shade: false });
  ctx.restore();
}

function head(ctx, R, pose, f, d, r) {
  const hr = d.hr, c = PAL[f], t = pose.t;
  const fl = r.mood === "hurt" ? -0.3 : 0;
  ear(ctx, R, -hr * 0.52, -hr * 0.6, -0.4 + r.earB + fl, hr * 0.62, R.darken(c.fur, 0.08), R.darken(c.ear, 0.1));
  ear(ctx, R, hr * 0.28, -hr * 0.72, 0.22 + r.earF - fl * 0.5, hr * 0.64, c.fur, c.ear);
  // cabeza con carrillos
  R.blob(ctx, [
    [-hr * 1.0, -hr * 0.1], [-hr * 0.78, -hr * 0.72], [0, -hr * 0.92], [hr * 0.78, -hr * 0.7], [hr * 1.04, 0], [hr * 0.86, hr * 0.56],
    [hr * 0.3, hr * 0.84], [-hr * 0.4, hr * 0.8], [-hr * 1.02, hr * 0.62], [-hr * 0.88, hr * 0.42], [-hr * 1.12, hr * 0.3],
  ], c.fur);
  R.celShade(ctx, 0, hr * 0.05, hr * 0.98, hr * 0.85, c.fur, 0.14);
  if (f === 2) {
    // mechones de nube
    for (let i = 0; i < 3; i++) R.ellipse(ctx, -hr * 0.5 + i * hr * 0.35, -hr * 0.85 - (i === 1 ? 3 : 0), hr * 0.22, hr * 0.2, c.fur, { lw: 2.4 });
  }
  if (f === 3) {
    // luna creciente en la frente
    const mx = hr * 0.3, my = -hr * 0.5, mr = hr * 0.18;
    ctx.save();
    ctx.shadowColor = "#ffe27a"; ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffd84a";
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = c.fur;
    ctx.beginPath(); ctx.arc(mx + mr * 0.45, my - mr * 0.25, mr * 0.85, 0, Math.PI * 2); ctx.fill();
  }
  // hocico
  R.ellipse(ctx, hr * 0.62, hr * 0.46, hr * 0.3, hr * 0.2, c.belly, { line: false, shade: false });
  // ojos
  const big = f === 0 ? 1.2 : 1;
  const e1 = [hr * 0.1, hr * 0.06], e2 = [hr * 0.64, hr * 0.02];
  if (r.mood === "hurt" || r.mood === "dead") {
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.08; ctx.lineCap = "round";
    ctx.beginPath();
    if (r.mood === "hurt") {
      ctx.moveTo(e1[0] - hr * 0.16, e1[1] - hr * 0.14); ctx.lineTo(e1[0] + hr * 0.1, e1[1]); ctx.lineTo(e1[0] - hr * 0.16, e1[1] + hr * 0.12);
      ctx.moveTo(e2[0] + hr * 0.12, e2[1] - hr * 0.14); ctx.lineTo(e2[0] - hr * 0.1, e2[1]); ctx.lineTo(e2[0] + hr * 0.12, e2[1] + hr * 0.12);
    } else {
      for (const [x, y] of [e1, e2]) {
        const s = hr * 0.13;
        ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
      }
    }
    ctx.stroke();
  } else {
    const mood = r.mood === "normal" ? undefined : r.mood;
    R.eye(ctx, e1[0], e1[1], hr * 0.3 * big, pose, { iris: c.iris, mood, lash: true });
    R.eye(ctx, e2[0], e2[1], hr * 0.25 * big, pose, { iris: c.iris, mood });
  }
  R.blush(ctx, -hr * 0.18, hr * 0.44, hr * 0.14);
  R.blush(ctx, hr * 0.9, hr * 0.38, hr * 0.09);
  // nariz y boca
  const nx = hr * 0.8, ny = hr * 0.32;
  R.poly(ctx, [[nx - hr * 0.08, ny - hr * 0.05], [nx + hr * 0.08, ny - hr * 0.05], [nx, ny + hr * 0.05]], "#ff6fa8", { lw: 1.6 });
  if (r.mouth === "cat" || r.tongue) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 1.8; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(nx, ny + hr * 0.05); ctx.lineTo(nx, ny + hr * 0.12);
    ctx.arc(nx - hr * 0.08, ny + hr * 0.12, hr * 0.08, 0, Math.PI * 0.9);
    ctx.moveTo(nx + hr * 0.16, ny + hr * 0.12);
    ctx.arc(nx + hr * 0.08, ny + hr * 0.12, hr * 0.08, 0, Math.PI * 0.9);
    ctx.stroke();
    if (r.tongue) R.ellipse(ctx, nx + hr * 0.02, ny + hr * 0.26, hr * 0.08, hr * 0.1, "#ff7a9a", { lw: 1.5 });
  } else {
    R.mouth(ctx, nx - hr * 0.04, ny + hr * 0.2, hr * 0.26, r.mouth);
  }
  // bigotes
  ctx.strokeStyle = f === 3 ? "#e8dcff" : R.INK; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hr * 0.86, hr * 0.44); ctx.lineTo(hr * 1.34, hr * 0.36);
  ctx.moveTo(hr * 0.86, hr * 0.5); ctx.lineTo(hr * 1.32, hr * 0.56);
  ctx.moveTo(-hr * 0.72, hr * 0.36); ctx.lineTo(-hr * 1.22, hr * 0.26);
  ctx.moveTo(-hr * 0.72, hr * 0.44); ctx.lineTo(-hr * 1.2, hr * 0.48);
  ctx.stroke();
  // lazo rojo
  bow(ctx, R, -hr * 0.12, -hr * 0.84, hr * 0.3, -0.35 + pose.sway * 0.1);
  if (f === 4) R.halo(ctx, -hr * 0.05, -hr * 1.3, hr * 0.62, t);
}

// ---------------------------------------------------------------------------
// colas
// ---------------------------------------------------------------------------
function tails(ctx, R, pose, f, d, r, x, y) {
  const t = pose.t, c = PAL[f];
  const wave = (ph, C) => (k) => C * Math.cos(k * Math.PI * 2 + ph);
  const n = 10;
  if (f === 4 || r.fan) {
    // abanico (GOD: 9 colas; resto: colas espectrales al lanzar)
    const count = f === 4 ? 9 : f === 3 ? 5 : 3;
    const spread = (f === 4 ? 1.9 : 1.3) * (r.fan ? 1.25 : 1);
    for (let i = 0; i < count; i++) {
      const k = count === 1 ? 0.5 : i / (count - 1);
      const base = r.tailBase - spread / 2 + k * spread;
      const pts = tailPts(x, y, d.tl * (0.85 + Math.sin(i * 1.7) * 0.1), base, wave(r.tailPh + i * 0.7 + t * 0.03, r.tailC * 0.6), 7);
      const real = f === 4 || i === Math.floor(count / 2);
      ctx.save();
      if (!real) ctx.globalAlpha *= 0.5;
      const col = f === 4 ? "#fffafc" : real ? c.fur : "#e6d2ff";
      strokeTail(ctx, R, pts, d.lw * (f === 4 ? 0.8 : 0.95), d.lw * 0.55, col, f === 4 ? "#9a7aa8" : real ? R.INK : "#b08cff", r.glow ? R.alpha(f === 3 ? "#b98cff" : "#ffd0ee", 0.35) : null);
      ctx.restore();
      const e = pts[pts.length - 1];
      if (f === 4) R.ellipse(ctx, e[0], e[1], d.lw * 0.5, d.lw * 0.5, "#ffd84a", { lw: 1.8 });
      if (r.glow) R.sparkle(ctx, e[0], e[1], 3 + Math.sin(t * 0.3 + i) * 1.5, "#ffffff");
    }
    return;
  }
  if (f === 3) {
    // colas fantasma translúcidas + cola real
    for (let i = 0; i < 4; i++) {
      const base = r.tailBase - 0.9 + i * 0.5 + (i > 1 ? 0.35 : 0);
      const pts = tailPts(x, y, d.tl * 0.9, base, wave(r.tailPh + 1 + i * 1.3 + t * 0.05, 2.2), 7);
      ctx.save();
      ctx.globalAlpha *= 0.38 + Math.sin(t * 0.08 + i) * 0.1;
      strokeTail(ctx, R, pts, d.lw * 0.9, d.lw * 0.5, "#dcc6ff", "#9f7ae8", null);
      ctx.restore();
    }
  }
  const pts = tailPts(x, y, d.tl, r.tailBase, wave(r.tailPh, r.tailC), n);
  if (f === 2) fluffyTail(ctx, R, pts, d.lw * 0.8, d.lw * 1.9 * r.puff, c.fur);
  else {
    strokeTail(ctx, R, pts, d.lw * (f === 0 ? 1.1 : 0.95) * r.puff, d.lw * 0.62 * r.puff, c.fur);
    if (r.puff > 1) {
      // pelo erizado de la cola
      ctx.strokeStyle = R.INK; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 2; i < pts.length; i += 2) { ctx.moveTo(pts[i][0] - d.lw, pts[i][1]); ctx.lineTo(pts[i][0] - d.lw * 1.6, pts[i][1] - 2); ctx.moveTo(pts[i][0] + d.lw, pts[i][1]); ctx.lineTo(pts[i][0] + d.lw * 1.6, pts[i][1] - 2); }
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------------------
// cuerpo
// ---------------------------------------------------------------------------
function body(ctx, R, pose, f, d, r, bx, by) {
  const c = PAL[f], a = r.tilt, bl = d.bl, bh = d.bh * (1 + pose.breath * 0.025);
  if (r.bristle) {
    // pelo erizado
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const u = Math.PI + 0.15 + (i / 16) * (Math.PI - 0.3);
      const k = i % 2 ? 1.02 : 1.5;
      pts.push(rp(bx, by, a, Math.cos(u) * bl * (i % 2 ? 1.0 : 1.18), Math.sin(u) * bh * k));
    }
    pts.push(rp(bx, by, a, bl * 0.8, bh * 0.2));
    pts.push(rp(bx, by, a, -bl * 0.8, bh * 0.2));
    R.poly(ctx, pts, R.lighten(c.fur, 0.1), { lw: 2.4 });
  }
  if (f === 2) {
    // cuerpo de nube
    const puffs = [];
    for (let i = 0; i < 9; i++) {
      const u = (i / 9) * Math.PI * 2;
      puffs.push([...rp(bx, by, a, Math.cos(u) * bl * 0.78, Math.sin(u) * bh * 0.68), bh * (0.5 + (i % 2) * 0.1)]);
    }
    ctx.beginPath();
    ctx.ellipse(bx, by, bl * 0.85, bh * 0.8, a, 0, Math.PI * 2);
    for (const [x, y, rr] of puffs) { ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, Math.PI * 2); }
    ctx.lineWidth = R.LINE * 2; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke();
    ctx.fillStyle = R.volume(ctx, bx, by, bl, c.fur); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    for (const [x, y, rr] of puffs.slice(4, 8)) { ctx.moveTo(x + rr * 0.35, y - rr * 0.3); ctx.arc(x, y - rr * 0.3, rr * 0.35, 0, Math.PI * 2); }
    ctx.fill();
    return;
  }
  R.ellipse(ctx, bx, by, bl, bh, c.fur, { rot: a });
  ctx.save();
  ctx.beginPath(); ctx.ellipse(bx, by, bl, bh, a, 0, Math.PI * 2); ctx.clip();
  const bp = rp(bx, by, a, bl * 0.15, bh * 0.75);
  ctx.fillStyle = c.belly;
  ctx.beginPath(); ctx.ellipse(bp[0], bp[1], bl * 0.7, bh * 0.5, a, 0, Math.PI * 2); ctx.fill();
  if (f === 3) {
    // rayitas moradas / estrellas en el lomo
    ctx.fillStyle = "rgba(255,230,140,0.8)";
    for (let i = 0; i < 3; i++) { const p = rp(bx, by, a, -bl * 0.4 + i * bl * 0.35, -bh * 0.45); R.sparkle(ctx, p[0], p[1], 2.4, "#ffe9a0"); }
  }
  ctx.restore();
  const cp = rp(bx, by, a, bl * 0.75, -bh * 0.1);
  if (f !== 0) {
    // pechera esponjosa
    R.blob(ctx, [[cp[0] - 3, cp[1] - bh * 0.4], [cp[0] + 6, cp[1] - bh * 0.3], [cp[0] + 8, cp[1] + bh * 0.2], [cp[0] + 3, cp[1] + bh * 0.55], [cp[0] - 3, cp[1] + bh * 0.3]], c.belly, { lw: 2.2 });
  }
  const sp = rp(bx, by, a, -bl * 0.3, -bh * 0.55);
  R.shine(ctx, sp[0], sp[1], bl * 0.25, bh * 0.14, 0.4);
}

function paw(ctx, R, e, col, lw, claws) {
  R.ellipse(ctx, e[0] + 1.5, e[1], lw * 0.72, lw * 0.52, col, { lw: 2.4 });
  if (claws) {
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = R.INK; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -1; i <= 1; i++) {
      const y = e[1] + i * lw * 0.28;
      ctx.moveTo(e[0] + lw * 0.8, y - 1.3); ctx.lineTo(e[0] + lw * 1.35, y + 0.3); ctx.lineTo(e[0] + lw * 0.8, y + 1.3);
    }
    ctx.fill(); ctx.stroke();
  } else {
    ctx.strokeStyle = R.alpha(R.INK, 0.6); ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(e[0] + lw * 0.5, e[1] - lw * 0.1); ctx.lineTo(e[0] + lw * 0.5, e[1] + lw * 0.4);
    ctx.moveTo(e[0] + lw * 0.1, e[1] - lw * 0.05); ctx.lineTo(e[0] + lw * 0.1, e[1] + lw * 0.42);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// modos especiales
// ---------------------------------------------------------------------------
function drawCurl(ctx, pose, R, f, d, r) {
  const c = PAL[f], t = pose.t, bl = d.bl, bh = d.bh, hr = d.hr;
  const cy = -bh * 1.15 - 1;
  ctx.save();
  ctx.translate(Math.sin(t * 1.7) * 0.4, 0);
  if (f === 4) angelWing(ctx, R, -bl * 0.1, cy - bh * 0.8, hr * 0.8, 0.1, true);
  body(ctx, R, pose, f, { ...d, bl: bl * 0.95, bh: bh * 1.2 }, { ...r, tilt: 0, bristle: false }, 0, cy);
  R.ellipse(ctx, -bl * 0.4, cy + bh * 0.25, bl * 0.42, bh * 0.75, c.fur, { rot: -0.2 });
  // cabeza apoyada
  ctx.save();
  ctx.translate(bl * 0.6, -hr * 0.78);
  ctx.rotate(0.22);
  ctx.scale(0.86, 0.86);
  head(ctx, R, pose, f, d, { ...r, mood: "closed", mouth: "cat", earB: -0.2, earF: -0.15 });
  ctx.restore();
  R.ellipse(ctx, bl * 0.95, -d.lw * 0.5, d.lw * 0.75, d.lw * 0.5, c.fur, { lw: 2.4 });
  // cola enrollada por delante
  const pts = tailPts(-bl * 0.9, cy + bh * 0.6, d.tl * 0.9, 1.5, (k) => -2.6 - k * 0.8, 8);
  if (f === 2) fluffyTail(ctx, R, pts, d.lw * 0.8, d.lw * 1.6, c.fur);
  else strokeTail(ctx, R, pts, d.lw, d.lw * 0.65, f === 4 ? "#fffafc" : c.fur);
  ctx.restore();
  // Zzz y corazones
  ctx.save();
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.lineWidth = 3; ctx.strokeStyle = R.INK; ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.015 + i / 3) % 1;
    ctx.globalAlpha = Math.sin(k * Math.PI);
    const x = bl * 0.6 + k * 20 + Math.sin(k * 6) * 3, y = -hr * 1.6 - k * 26;
    if (i === 1) heart(ctx, x, y, 4.5, "#ff5a9a");
    else {
      ctx.save(); ctx.translate(x, y); ctx.scale(0.7 + k * 0.6, 0.7 + k * 0.6);
      ctx.strokeText("z", 0, 0); ctx.fillText("z", 0, 0); ctx.restore();
    }
  }
  ctx.restore();
}

function drawDead(ctx, pose, R, f, d, r) {
  const c = PAL[f], t = pose.t, bl = d.bl, bh = d.bh, hr = d.hr;
  const by = -bh * 0.92, bx = -6;
  const dk = R.darken(c.fur, 0.14);
  // patas lejanas
  R.limb(ctx, bx + bl * 0.5, by + 2, bx + bl * 0.5 + d.ll * 0.5, by + 1, bx + bl * 0.5 + d.ll, by - 3, d.lw, dk, { hand: false });
  R.limb(ctx, bx - bl * 0.6, by + 2, bx - bl * 0.6 - d.ll * 0.5, by + 1, bx - bl * 0.6 - d.ll, by - 3, d.lw, dk, { hand: false });
  const pts = tailPts(bx - bl * 0.9, by + 2, d.tl * 0.9, Math.PI - 0.1, (k) => -0.3, 8);
  if (f === 2) fluffyTail(ctx, R, pts, d.lw * 0.8, d.lw * 1.6, c.fur);
  else strokeTail(ctx, R, pts, d.lw * 0.9, d.lw * 0.6, f === 4 ? "#fffafc" : c.fur);
  body(ctx, R, pose, f, { ...d, bh: bh * 0.9 }, { ...r, tilt: 0 }, bx, by);
  const e1 = R.limb(ctx, bx + bl * 0.55, by + 5, bx + bl * 0.55 + d.ll * 0.5, by + 5, bx + bl * 0.55 + d.ll * 1.05, by + 4, d.lw, c.fur, { hand: false });
  paw(ctx, R, e1, c.fur, d.lw, false);
  const e2 = R.limb(ctx, bx - bl * 0.55, by + 5, bx - bl * 0.55 - d.ll * 0.5, by + 5, bx - bl * 0.55 - d.ll * 1.05, by + 4, d.lw, c.fur, { hand: false });
  paw(ctx, R, e2, c.fur, d.lw, false);
  ctx.save();
  ctx.translate(bx + bl + hr * 0.45, -hr * 0.82);
  ctx.rotate(0.3);
  head(ctx, R, pose, f, d, { ...r, earB: -0.4, earF: -0.4 });
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    const a = t * 0.1 + (i * Math.PI * 2) / 3;
    R.star(ctx, bx + bl + hr * 0.4 + Math.cos(a) * 14, -hr * 2 + Math.sin(a) * 4, 3.5, "#ffe04a", { lw: 1.5 });
  }
}

// ---------------------------------------------------------------------------
// principal
// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = pose.form, d = DIMS[f], c = PAL[f], t = pose.t;
  const r = solve(pose, d, f);
  if (r.mode === "curl") return drawCurl(ctx, pose, R, f, d, r);
  if (r.mode === "dead") return drawDead(ctx, pose, R, f, d, r);

  ctx.save();
  if (r.mode === "wall") { ctx.translate(20, -d.bl - d.hr - 12); ctx.rotate(-Math.PI / 2); }
  ctx.translate(r.ox, r.oy);
  const bx = r.bx, by = r.by, a = r.tilt, bl = d.bl, bh = d.bh, hr = d.hr;
  const P = (x, y) => rp(bx, by, a, x, y);
  const sh = P(bl * 0.55, bh * 0.35), hp = P(-bl * 0.6, bh * 0.25);
  const neck = P(bl * 0.8, -bh * 0.45);
  const hc = [neck[0] + hr * 0.35 + r.hdx, neck[1] - hr * 0.55 + r.hdy];
  const tb = P(-bl * 0.92, -bh * 0.25);
  const dk = R.darken(c.fur, 0.14);
  const fL = d.ll + bh * 0.4, bL = (d.ll + bh * 0.5) * 1.06;
  const pr = d.lw * 0.52;
  const leg = (s, tgt, L, dir, col, claws) => {
    const tx = tgt[0], ty = tgt[1] - pr;
    const LL = r.autoLeg ? Math.max(L, Math.hypot(tx - s[0], ty - s[1]) * 1.01) : L;
    const e = ik(ctx, R, s[0], s[1], tx, ty, LL, dir, d.lw, col, { hand: false });
    paw(ctx, R, e, col, d.lw, claws);
  };
  const flap = Math.sin(t * 0.14);

  // --- detrás: ala lejana, colas, patas lejanas
  if (f === 4) { const w = P(bl * 0.1, -bh * 0.7); angelWing(ctx, R, w[0] + 4, w[1], hr * 1.0, flap, true); }
  tails(ctx, R, pose, f, d, r, tb[0], tb[1]);
  leg([sh[0] + 3, sh[1]], r.ff, fL, -1, dk, r.claws && r.mode === "wall");
  leg([hp[0] + 3, hp[1]], r.bf, bL, 1, dk, r.claws && r.mode === "wall");

  // --- cuerpo
  body(ctx, R, pose, f, d, r, bx, by);

  // --- patas cercanas
  leg(hp, r.bn, bL, 1, c.fur, r.claws && r.mode === "wall");
  R.ellipse(ctx, hp[0] + 1, hp[1] - 2, bl * (r.mode === "sit" ? 0.46 : 0.36), bh * (r.mode === "sit" ? 0.85 : 0.62), c.fur, { rot: a * 0.5, lw: 2.2 });
  if (!r.pawOver) leg(sh, r.fn, fL, -1, c.fur, r.claws);
  if (f === 4) { const w = P(bl * 0.05, -bh * 0.8); angelWing(ctx, R, w[0], w[1], hr * 1.05, flap, false); }

  // --- cabeza
  ctx.save();
  ctx.translate(hc[0], hc[1] + hr * 0.6);
  ctx.rotate(r.headRot + (r.mode === "wall" ? 0 : 0));
  ctx.translate(0, -hr * 0.6);
  head(ctx, R, pose, f, d, r);
  ctx.restore();

  // --- pata delantera por encima (zarpazo / lanzar / lavarse)
  if (r.pawOver) {
    if (r.fx === "lick") {
      const k = r.fxK, wash = k > 0.5;
      const tgt = wash
        ? [hc[0] + hr * 0.45 + Math.sin(t * 0.35) * hr * 0.2, hc[1] + hr * 0.05 + Math.cos(t * 0.35) * hr * 0.15]
        : [hc[0] + hr * 0.75, hc[1] + hr * 0.7 + Math.sin(t * 0.4) * 1.5];
      const tx = tgt[0], ty = tgt[1];
      const e = ik(ctx, R, sh[0], sh[1], tx, ty, Math.hypot(tx - sh[0], ty - sh[1]) * 1.1, -1, d.lw, c.fur, { hand: false });
      R.ellipse(ctx, e[0], e[1], d.lw * 0.7, d.lw * 0.62, c.fur, { lw: 2.4 });
      R.ellipse(ctx, e[0] + 1, e[1] + 1, d.lw * 0.3, d.lw * 0.25, c.ear, { line: false, shade: false });
    } else {
      leg(sh, r.fn, fL, -1, c.fur, r.claws);
    }
  }

  // --- efectos
  if (r.slash > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255," + (0.9 * r.slash).toFixed(3) + ")";
    ctx.lineCap = "round";
    const px = r.fn[0] + 8, py = r.fn[1] - 4;
    for (let i = 0; i < 3; i++) {
      ctx.lineWidth = 3.2 - i * 0.6;
      ctx.beginPath();
      ctx.moveTo(px + i * 6, py - 14);
      ctx.quadraticCurveTo(px + 10 + i * 6, py - 2, px + 4 + i * 6, py + 12);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (r.fx === "yarn") {
    const k = r.fxK, x = sh[0] + d.ll + k * 44, y = sh[1] - 4 - Math.sin(k * Math.PI) * 22 + k * 10;
    ctx.save();
    ctx.strokeStyle = "#ff5a8a"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(sh[0] + d.ll, sh[1] - 2);
    ctx.quadraticCurveTo((sh[0] + d.ll + x) / 2, y + 12, x, y); ctx.stroke();
    ctx.restore();
    yarn(ctx, R, x, y, 7 + f * 0.6, t * 0.3);
  }
  if (r.fx === "stars" || (f === 2 && pose.state === "idle") || r.fx === "tails") {
    const cnt = r.fx === "stars" ? 5 : 3;
    for (let i = 0; i < cnt; i++) {
      const aa = t * 0.05 + (i * Math.PI * 2) / cnt;
      const rr = (r.fx === "stars" ? 46 : 38) + Math.sin(t * 0.1 + i) * 4;
      R.sparkle(ctx, bx + 8 + Math.cos(aa) * rr, by - 18 + Math.sin(aa) * rr * 0.6, 2.5 + Math.abs(Math.sin(t * 0.15 + i)) * 3, i % 2 ? "#ffffff" : "#fff3a0");
    }
  }
  ctx.restore();
}

export default { id: "cat", draw };
