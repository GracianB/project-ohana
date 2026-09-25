// ============================================================================
// DINO · Dinosaurio verde cabezón tipo T-rex (Versión Ultra Pulida)
// 0 Dino Bebé | 1 Dino | 2 Dino Pico | 3 Dino Rex | 4 DINO GOD
// ============================================================================

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const ease = (k) => k * k * (3 - 2 * k);
const lerp = (a, b, k) => a + (b - a) * k;

const PAL = [
  { body: "#8ee07a", spot: "#ffa64a", belly: "#fff4b4", claw: "#fffbe8", plate: "#ffb84a", plate2: "#ffd86a" },
  { body: "#4cbf56", spot: "#ff9a3a", belly: "#fff0a4", claw: "#fffbe8", plate: "#ffb03a", plate2: "#ffd24a" },
  { body: "#2ea8a0", spot: "#ff9a3a", belly: "#fff2b6", claw: "#fffbe8", plate: "#ff9a3a", plate2: "#ffcf4a" },
  { body: "#3f8f3a", spot: "#e8822a", belly: "#f2e6a0", claw: "#fff6dc", plate: "#dcc48c", plate2: "#ff9a3a" },
  { body: "#a9d83e", spot: "#ffd84a", belly: "#fff6b8", claw: "#fffbe8", plate: "#bff4ff", plate2: "#e8fdff" },
];

const F = [
  { hw: 31, hh: 26, bw: 17, bh: 24, legL: 6,  legW: 12, armL: 9,  tail: 12, tw: 8 },
  { hw: 25, hh: 19, bw: 16, bh: 24, legL: 11, legW: 13, armL: 10, tail: 32, tw: 17 },
  { hw: 25, hh: 19, bw: 17, bh: 27, legL: 13, legW: 14, armL: 11, tail: 38, tw: 18 },
  { hw: 27, hh: 20, bw: 21, bh: 30, legL: 14, legW: 17, armL: 12, tail: 44, tw: 22 },
  { hw: 26, hh: 20, bw: 20, bh: 31, legL: 15, legW: 16, armL: 12, tail: 46, tw: 21 },
];

// ---------------------------------------------------------------------------
// FUNCIONES AUXILIARES DE RENDERIZADO
// ---------------------------------------------------------------------------

function chain(x, y, len, a0, wave, n) {
  const pts = [];
  let a = a0, px = x, py = y;
  for (let i = 0; i <= n; i++) {
    pts.push([px, py, a]);
    a += wave(i / n) / n;
    px += Math.cos(a) * (len / n);
    py += Math.sin(a) * (len / n);
  }
  return pts;
}

function taperTail(ctx, R, pts, w0, color) {
  const n = pts.length - 1;
  const L = [], Rt = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n, w = w0 * (1 - k * 0.85) * 0.5;
    const a = pts[i][2] + PI / 2;
    L.push([pts[i][0] + Math.cos(a) * w, pts[i][1] + Math.sin(a) * w]);
    Rt.push([pts[i][0] - Math.cos(a) * w, pts[i][1] - Math.sin(a) * w]);
  }
  const e = pts[n], ea = e[2];
  const outline = L.concat([[e[0] + Math.cos(ea) * w0 * 0.12, e[1] + Math.sin(ea) * w0 * 0.12]], Rt.reverse());
  R.blob(ctx, outline, color);
  return { top: Rt.reverse(), bottom: L };
}

function spikeAt(ctx, R, x, y, a, len, wd, col, lw = 1.8) {
  const nx = Math.cos(a + PI / 2), ny = Math.sin(a + PI / 2);
  R.poly(ctx, [
    [x + nx * wd, y + ny * wd],
    [x + Math.cos(a) * len, y + Math.sin(a) * len],
    [x - nx * wd, y - ny * wd]
  ], col, { lw });
}

function plateAt(ctx, R, x, y, a, len, wd, col) {
  const nx = Math.cos(a + PI / 2), ny = Math.sin(a + PI / 2);
  const ux = Math.cos(a), uy = Math.sin(a);
  R.blob(ctx, [
    [x + nx * wd * 0.6, y + ny * wd * 0.6],
    [x + ux * len * 0.55 + nx * wd, y + uy * len * 0.55 + ny * wd],
    [x + ux * len, y + uy * len],
    [x + ux * len * 0.55 - nx * wd, y + uy * len * 0.55 - ny * wd],
    [x - nx * wd * 0.6, y - ny * wd * 0.6],
  ], col, { lw: 2 });
}

function crystal(ctx, R, x, y, a, len, wd) {
  const nx = Math.cos(a + PI / 2), ny = Math.sin(a + PI / 2);
  const ux = Math.cos(a), uy = Math.sin(a);
  const pts = [
    [x + nx * wd * 0.7, y + ny * wd * 0.7],
    [x + ux * len * 0.7 + nx * wd, y + uy * len * 0.7 + ny * wd],
    [x + ux * len, y + uy * len],
    [x + ux * len * 0.7 - nx * wd, y + uy * len * 0.7 - ny * wd],
    [x - nx * wd * 0.7, y - ny * wd * 0.7],
  ];
  const g = ctx.createLinearGradient(x, y, x + ux * len, y + uy * len);
  g.addColorStop(0, "#5fd0f0");
  g.addColorStop(0.6, "#bff4ff");
  g.addColorStop(1, "#ffffff");
  R.poly(ctx, pts, g, { lw: 2, ink: "#1d3c5c" });
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + ux * len * 0.15 + nx * wd * 0.3, y + uy * len * 0.15 + ny * wd * 0.3);
  ctx.lineTo(x + ux * len * 0.8 + nx * wd * 0.3, y + uy * len * 0.8 + ny * wd * 0.3);
  ctx.stroke();
}

function crack(ctx, pts, t, seed) {
  const glow = 0.75 + Math.sin(t * 0.15 + seed) * 0.25;
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.shadowColor = "#ff9a1a"; ctx.shadowBlur = 7;
  ctx.strokeStyle = "rgba(255,120,20," + (0.95 * glow).toFixed(2) + ")";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#fff7c0";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

function foot(ctx, R, x, y, w, col, claw) {
  R.ellipse(ctx, x + w * 0.25, y + w * 0.08, w * 0.85, w * 0.48, col);
  ctx.fillStyle = claw; ctx.strokeStyle = R.INK; ctx.lineWidth = 1.3;
  for (let i = 0; i < 3; i++) {
    const cx = x + w * (0.55 + i * 0.25), cy = y + w * (0.42 - i * 0.07);
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.13, w * 0.1, 0, 0, PI * 2);
    ctx.fill(); ctx.stroke();
  }
}

function leg(ctx, R, x, y, len, ang, w, col, claw, bend) {
  const e = R.swingLimb(ctx, x, y, len, ang, bend, w * 0.78, col, { hand: false });
  R.ellipse(ctx, x + Math.sin(ang) * len * 0.15, y + Math.cos(ang) * len * 0.1, w * 0.68, w * 0.82, col, { rot: ang * 0.6 });
  foot(ctx, R, e[0], e[1], w * 0.85, col, claw);
}

function tinyArm(ctx, R, x, y, len, ang, w, col, claw) {
  const e = R.swingLimb(ctx, x, y, len, ang, 1.5, w, col, { hand: w * 0.7 });
  ctx.fillStyle = claw; ctx.strokeStyle = R.INK; ctx.lineWidth = 1.1;
  for (let i = -1; i <= 1; i += 2) {
    const aa = ang + 0.3 + i * 0.5;
    const cx = e[0] + Math.sin(aa) * w * 0.6, cy = e[1] + Math.cos(aa) * w * 0.6;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(aa) * 1.3, cy + Math.sin(aa) * 1.3);
    ctx.lineTo(cx + Math.sin(aa) * 2.6, cy + Math.cos(aa) * 2.6);
    ctx.lineTo(cx + Math.cos(aa) * 1.3, cy - Math.sin(aa) * 1.3);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function eggShell(ctx, R, cx, cy, rx, ry, top, t) {
  ctx.beginPath();
  if (top) ctx.ellipse(cx, cy, rx, ry, 0, PI, PI * 2);
  else ctx.ellipse(cx, cy, rx, ry, 0, 0, PI);
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const x = top ? lerp(cx + rx, cx - rx, k) : lerp(cx - rx, cx + rx, k);
    const dy = (i % 2 ? 1 : -1) * ry * 0.13 * (i === 0 || i === n ? 0 : 1);
    ctx.lineTo(x, cy + (top ? dy + ry * 0.05 : dy - ry * 0.05));
  }
  ctx.closePath();
  ctx.fillStyle = R.volume(ctx, cx - rx * 0.2, cy - ry * 0.3, Math.max(rx, ry), "#fff8ea");
  ctx.fill();
  ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke();
  
  const sy = top ? -1 : 1;
  R.ellipse(ctx, cx - rx * 0.4, cy + sy * ry * 0.5, 2.6, 2, "#9fd88a", { line: false, shade: false });
  R.ellipse(ctx, cx + rx * 0.35, cy + sy * ry * 0.35, 2, 1.6, "#ffb07a", { line: false, shade: false });
  R.ellipse(ctx, cx + rx * 0.05, cy + sy * ry * 0.7, 1.6, 1.3, "#9fd88a", { line: false, shade: false });
  if (!top) R.shine(ctx, cx - rx * 0.55, cy + ry * 0.3, rx * 0.12, ry * 0.2, 0.5);
}

// ---------------------------------------------------------------------------
// DIBUJO PRINCIPAL DE DINO
// ---------------------------------------------------------------------------

function draw(ctx, pose, R) {
  const f = pose.form, c = PAL[f], P = F[f], t = pose.t, st = pose.state;
  const { hh, bw, bh } = P;
  const god = f === 4, baby = f === 0;
  const dark = R.darken(c.body, 0.22);
  const fl = pose.flourish > 0 ? pose.flourish : 0;
  const flN = pose.flourishN % 3;
  const flE = fl > 0 ? Math.sin(fl * PI) : 0;
  const pound = pose.move === "pound" && (st === "fall" || st === "jump" || st === "idle");
  const charging = (pose.move === "charge" && (st === "run" || st === "idle")) || (st === "cast" && pose.castSlot === 1);

  let bob = pose.breath * 1.2, lean = 0.08, headRot = Math.sin(t * 0.03) * 0.04, hdx = 0, hdy = pose.breath * 0.6;
  let legF = 0, legB = 0, lenF = 1, lenB = 1, bendF = 3, bendB = 3;
  let armF = 0.6 + Math.sin(t * 0.05) * 0.1, armB = 0.4 + Math.sin(t * 0.05 + 1) * 0.1;
  let jaw = 0, eyeMood = "normal", hurtEyes = false, deadEyes = false;
  let tailA = Math.sin(t * 0.05) * 0.12 + pose.sway * 0.3, tailWag = 0;
  let roarK = 0, chomp = 0, speedLines = 0, shock = 0, stomp = 0, apple = 0, lookUp = 0, rawr = 0;
  let shellRot = 0;

  // LÓGICA DE ESTADOS Y ANIMACIÓN
  if (charging) {
    const ph = pose.phase * 1.3, s = Math.sin(ph);
    legF = s * 0.9; legB = -s * 0.9;
    lenF = 1 - Math.max(0, Math.cos(ph)) * 0.35; lenB = 1 - Math.max(0, -Math.cos(ph)) * 0.35;
    bob = P.legL * (1 - Math.cos(0.9 * s)) * 0.9 - Math.abs(Math.cos(ph)) * 2;
    lean = 0.42; headRot = 0.5; hdx = 4; hdy = 6;
    armF = -0.6; armB = -0.8;
    eyeMood = "angry"; speedLines = 1;
    tailA = -0.25 + Math.sin(ph) * 0.1;
    shellRot = Math.sin(ph) * 0.12;
  } else if (st === "run") {
    const ph = pose.phase, s = Math.sin(ph), cs = Math.cos(ph);
    const a = 0.7 * s;
    legF = a; legB = -a;
    lenF = 1 - Math.max(0, cs) * 0.4; lenB = 1 - Math.max(0, -cs) * 0.4;
    bendF = 3 + Math.max(0, cs) * 5; bendB = 3 + Math.max(0, -cs) * 5;
    const upDown = Math.abs(cs);
    bob = P.legL * (1 - Math.cos(a)) * 0.95 - upDown * (baby ? 3 : 5);
    lean = 0.14 + upDown * 0.04;
    headRot = 0.08 - upDown * 0.1; hdy = (1 - upDown) * 2.5;
    armF = 1.0 + Math.sin(ph * 2) * 0.8; armB = 1.0 - Math.sin(ph * 2) * 0.8;
    tailA = -0.15 + (1 - upDown) * 0.2 + pose.sway * 0.3;
    stomp = Math.max(0, 1 - upDown * 4);
    jaw = 0.12 + upDown * 0.1;
    shellRot = s * 0.14;
  } else if (pound) {
    legF = 1.9; lenF = 0.6; bendF = -2; legB = 1.6; lenB = 0.6; bendB = -2;
    armF = 2.4; armB = 2.2;
    lean = 0.28; headRot = 0.3; hdy = 2;
    eyeMood = "angry"; speedLines = 2; tailA = -0.9 + Math.sin(t * 0.5) * 0.08;
  } else if (st === "jump") {
    legF = 1.2; lenF = 0.7; bendF = -2; legB = 0.6; lenB = 0.8;
    armF = 2.4 + Math.sin(t * 0.7) * 0.4; armB = 2.2 - Math.sin(t * 0.7) * 0.4;
    headRot = -0.12; jaw = 0.35; tailA = 0.5 + pose.bounce * 0.3;
    lean = 0.02;
  } else if (st === "fall") {
    legF = 0.3; legB = -0.35;
    armF = 2.6 + Math.sin(t * 0.9) * 0.5; armB = 2.3 - Math.sin(t * 0.9) * 0.5;
    headRot = 0.1; jaw = 0.4; tailA = -0.45 + pose.bounce * 0.3;
    eyeMood = "normal";
  } else if (st === "attack") {
    const a = pose.atk, op = ease(seg(a, 0, 0.35)), sn = ease(seg(a, 0.35, 0.5)), rc = ease(seg(a, 0.6, 1));
    jaw = lerp(op * 1.3, 0, sn);
    jaw = lerp(jaw, 0.05, rc);
    headRot = lerp(lerp(0, -0.35, op), 0.22, sn); headRot = lerp(headRot, 0, rc);
    hdx = lerp(lerp(0, -4, op), 9, sn); hdx = lerp(hdx, 0, rc);
    lean = lerp(lerp(0.08, -0.08, op), 0.3, sn); lean = lerp(lean, 0.08, rc);
    legF = 0.35 * sn * (1 - rc); legB = -0.3 * sn * (1 - rc);
    armF = lerp(0.2, -0.4, sn); armB = lerp(0.1, -0.6, sn);
    eyeMood = "angry"; chomp = sn * (1 - rc);
    tailA = lerp(0.3 * op, -0.35, sn) * (1 - rc);
  } else if (st === "cast") {
    const k = pose.cast, slot = pose.castSlot;
    if (slot === 0) {
      const e = ease(seg(k, 0, 0.2)) * (1 - seg(k, 0.85, 1));
      jaw = 1.0 * e; headRot = -0.18 * e; hdx = 3 * e; lean = 0.15 * e + 0.05;
      armF = lerp(0.6, -0.5, e); armB = lerp(0.4, -0.7, e);
      legF = 0.35 * e; legB = -0.35 * e;
      roarK = e; eyeMood = "angry";
      tailA = 0.3 * e + Math.sin(t * 0.8) * 0.08 * e;
      hdy = Math.sin(t * 1.3) * 0.8 * e;
    } else {
      const up = ease(seg(k, 0, 0.45)), down = seg(k, 0.45, 0.55), rc = seg(k, 0.7, 1);
      if (k < 0.5) {
        const jumpH = Math.sin(up * PI * 0.5) * 22;
        bob = -jumpH;
        legF = 1.6 * up; lenF = 1 - 0.4 * up; bendF = -2; legB = 1.3 * up; lenB = 1 - 0.4 * up; bendB = -2;
        armF = 2.5; armB = 2.3; jaw = 0.3; eyeMood = "angry";
        lean = 0.1; tailA = 0.6 * up;
      } else {
        const imp = 1 - rc;
        bob = 5 * imp * (down >= 1 ? 1 : down);
        legF = 0.55 * imp; legB = -0.55 * imp; lenF = 1; lenB = 1;
        armF = lerp(0.6, -0.9, imp); armB = lerp(0.4, -1.1, imp);
        jaw = 0.7 * imp; eyeMood = "angry"; headRot = 0.15 * imp; hdy = 3 * imp;
        shock = seg(k, 0.5, 1); tailA = -0.5 * imp;
      }
    }
  } else if (st === "hurt") {
    lean = -0.25; headRot = -0.38; hdx = -3;
    armF = 2.2; armB = 2.6; legF = 0.45; legB = -0.1;
    jaw = 0.45; hurtEyes = true; tailA = -0.5;
  } else if (st === "wall") {
    lean = 0.18; headRot = -0.22; hdx = 2;
    armF = 2.1; armB = 1.9; legF = 1.0; lenF = 0.8; legB = 0.6; lenB = 0.8;
    tailA = -0.8 + Math.sin(t * 0.08) * 0.1;
  } else if (st === "dead") {
    bob = P.legL * 0.85; lean = -0.3; headRot = 0.9; hdx = 2; hdy = 3;
    armF = 0.2; armB = 0.1; legF = 1.45; legB = 1.25; lenF = 0.9; lenB = 0.9;
    jaw = 0.3; deadEyes = true; tailA = -0.9;
  } else if (st === "victory") {
    const hop = Math.abs(Math.sin(t * 0.12));
    bob = -hop * 5;
    lean = -0.1; headRot = -0.5 + Math.sin(t * 0.5) * 0.03; jaw = 1.0;
    armF = 2.2 + Math.sin(t * 0.4) * 0.3; armB = 2.0 - Math.sin(t * 0.4) * 0.3;
    legF = 0.3 * hop; legB = -0.3 * hop;
    eyeMood = "happy"; roarK = 0.8;
    tailA = 0.5 + Math.sin(t * 0.3) * 0.3;
  }

  // GESTOS DE ESPERA
  if (fl > 0 && st === "idle" && !pound && !charging) {
    if (flN === 0) {
      apple = flE; lookUp = -flE;
      lean = lerp(lean, 0.3, flE); headRot = -0.1 * flE; hdx += 2 * flE;
      armF = lerp(armF, 2.05 + Math.sin(t * 0.9) * 0.2, flE); armB = lerp(armB, 1.9 - Math.sin(t * 0.9) * 0.2, flE);
      legF = 0.25 * flE; legB = -0.2 * flE;
      jaw = 0.12 * flE; eyeMood = "normal";
    } else if (flN === 1) {
      const r2 = seg(fl, 0.3, 0.8);
      jaw = 0.6 * Math.sin(r2 * PI); rawr = Math.sin(r2 * PI);
      headRot = -0.2 * flE; armF = lerp(armF, 1.9, flE); armB = lerp(armB, 1.7, flE);
      eyeMood = rawr > 0.3 ? "closed" : "normal";
    } else {
      tailWag = flE; eyeMood = "happy"; jaw = 0.25 * flE;
      bob += Math.abs(Math.sin(t * 0.6)) * -1.5 * flE;
      headRot = Math.sin(t * 0.3) * 0.08 * flE;
    }
  }

  const legRoot = P.legL + P.legW * 0.5;
  const hipY = -legRoot + bob;

  ctx.save();
  const SC = [1.3, 1.36, 1.32, 1.28, 1.26][f];
  ctx.scale(SC, SC);

  const upper = () => { ctx.translate(0, hipY); ctx.rotate(lean); };
  const headX = (baby ? bw * 0.25 : bw * 0.62) + hdx, headY = (baby ? -bh * 0.95 - hh * 0.62 : -bh - hh * 0.42) + hdy;

  // AURA DINO GOD (EFECTO EXCLUSIVO MEJORADO)
  if (god) {
    ctx.save();
    const auraGlow = 0.5 + Math.sin(t * 0.1) * 0.25;
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 15 * auraGlow;
    ctx.fillStyle = "rgba(255, 170, 0, " + (0.15 * auraGlow).toFixed(2) + ")";
    ctx.beginPath();
    ctx.ellipse(0, hipY - bh * 0.5, bw * 1.8, bh * 1.5, 0, 0, PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // LÍNEAS DE VELOCIDAD
  if (speedLines === 1) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineCap = "round"; ctx.lineWidth = 2.4;
    for (let i = 0; i < 4; i++) {
      const y = -20 - i * 14, off = (t * 3.5 + i * 11) % 20;
      ctx.beginPath(); ctx.moveTo(-bw - 12 - off, y); ctx.lineTo(-bw - 32 - off, y); ctx.stroke();
    }
    ctx.restore();
  } else if (speedLines === 2) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineCap = "round"; ctx.lineWidth = 2.6;
    for (let i = 0; i < 5; i++) {
      const x = -24 + i * 12, off = (t * 4.5 + i * 9) % 18;
      ctx.beginPath(); ctx.moveTo(x, -bh - hh * 2.2 - off); ctx.lineTo(x, -bh - hh * 2.2 - 18 - off); ctx.stroke();
    }
    ctx.restore();
  }

  // COLA
  let tpts = null;
  if (!baby) {
    ctx.save(); upper();
    const wagA = tailWag > 0 ? Math.sin(t * 0.75) * 0.9 * tailWag : 0;
    const base = PI * 0.96 - tailA - wagA * 0.6;
    tpts = chain(-bw * 0.7, -bh * 0.22, P.tail, base, (k) => -k * 1.2 * (1 + tailA) - wagA * k * 1.4 + Math.sin(t * 0.07 + k * 2) * 0.12, 8);
    
    if (f === 2 || god) {
      for (let i = 2; i <= 3; i++) {
        const p = tpts[i], a = p[2] + PI / 2 + 0.25;
        if (god) crystal(ctx, R, p[0], p[1], a, 11 - i, 4);
        else plateAt(ctx, R, p[0], p[1], a, 15 - i * 2, 6, i % 2 ? c.plate : c.plate2);
      }
    }
    const sides = taperTail(ctx, R, tpts, P.tw, c.body);
    
    ctx.fillStyle = R.alpha(c.spot, 0.9);
    for (let i = 2; i < 7; i += 2) {
      const p = sides.top[i], q = tpts[i];
      ctx.beginPath(); ctx.ellipse(lerp(p[0], q[0], 0.45), lerp(p[1], q[1], 0.45), P.tw * 0.15 * (1 - i / 10), P.tw * 0.1, q[2], 0, PI * 2); ctx.fill();
    }
    
    if (f === 2 || god) {
      for (let i = 6; i <= 7; i++) {
        const p = sides.top[i], a = tpts[i][2];
        spikeAt(ctx, R, p[0], p[1], a - PI / 2 - 0.5, 9, 2.4, god ? "#e8fdff" : c.claw);
        spikeAt(ctx, R, p[0], p[1], a - PI / 2 + 0.1, 7, 2.2, god ? "#e8fdff" : c.claw);
      }
    }
    
    if (f === 3) {
      for (let i = 1; i < 7; i += 2) {
        const p = sides.top[i], q = tpts[i];
        R.ellipse(ctx, lerp(p[0], q[0], 0.25), lerp(p[1], q[1], 0.25), 4.5 - i * 0.4, 2.6, c.plate, { rot: q[2], lw: 1.6 });
      }
      const e = tpts[8];
      spikeAt(ctx, R, e[0], e[1], e[2] - 0.2, 7, 3, c.plate);
    }
    if (god) {
      crack(ctx, [[tpts[1][0], tpts[1][1] - 3], [tpts[2][0] + 2, tpts[2][1] + 2], [tpts[3][0], tpts[3][1] - 2], [tpts[4][0] - 1, tpts[4][1] + 2]], t, 1);
    }
    ctx.restore();
  }

  // DINO BEBÉ: CÁSCARA Y PIERNAS
  if (baby) {
    const lb = [-6, hipY], lf = [6, hipY];
    leg(ctx, R, lb[0], lb[1], P.legL * lenB, legB, P.legW, dark, c.claw, bendB);
    leg(ctx, R, lf[0], lf[1], P.legL * lenF, legF, P.legW, c.body, c.claw, bendF);
    ctx.save(); upper();
    ctx.rotate(shellRot);
    const tw = Math.sin(t * (tailWag > 0 ? 0.8 : 0.08)) * (tailWag > 0 ? 0.6 : 0.15);
    R.blob(ctx, [[-bw * 0.8, -bh * 0.8], [-bw * 1.5 + tw * 4, -bh * 1.3 - tw * 3], [-bw * 1.2 + tw * 3, -bh * 0.9], [-bw * 0.9, -bh * 0.5]], c.body, { lw: 2.4 });
    tinyArm(ctx, R, bw * 0.3, -bh * 1.0, P.armL, armB, 5, dark, c.claw);
    ctx.restore();
  } else {
    // PLACAS DORSALES
    ctx.save(); upper();
    if (f === 2 || god) {
      for (let i = 0; i < 4; i++) {
        const a = -PI * 0.5 - 0.25 - i * 0.32;
        const px = Math.cos(a) * bw * 0.85, py = -bh * 0.5 + Math.sin(a) * bh * 0.52;
        const len = (god ? 17 : 18) - Math.abs(i - 1.2) * 2.5;
        if (god) crystal(ctx, R, px, py, a - 0.15, len + 2, 4.5);
        else plateAt(ctx, R, px, py, a - 0.15, len, 7, i % 2 ? c.plate2 : c.plate);
      }
    }
    ctx.restore();

    // PIERNA TRASERA Y BRAZO TRASERO
    leg(ctx, R, -5, hipY, P.legL * lenB, legB, P.legW, dark, c.claw, bendB);
    ctx.save(); upper();
    tinyArm(ctx, R, bw * 0.45, -bh * 0.66, P.armL, armB, 4.5 + f * 0.4, dark, c.claw);
    ctx.restore();

    // CUERPO PRINCIPAL
    ctx.save(); upper();
    const body = [[-bw * 1.0, -bh * 0.15], [-bw * 0.8, -bh * 0.7], [-bw * 0.15, -bh * 1.02], [bw * 0.65, -bh * 0.92], [bw * 1.02, -bh * 0.45], [bw * 0.85, -bh * 0.02], [0, bw * 0.3]];
    R.blob(ctx, body, c.body);
    const bel = [[bw * 0.2, -bh * 0.85], [bw * 0.75, -bh * 0.76], [bw * 0.95, -bh * 0.4], [bw * 0.72, -bh * 0.02], [bw * 0.1, bw * 0.16], [-bw * 0.15, -bh * 0.4]];
    R.blob(ctx, bel, c.belly, { lw: 1.6 });
    
    ctx.save();
    R.blob(ctx, bel, null, { line: false, shade: false }); ctx.clip();
    ctx.strokeStyle = R.alpha(R.darken(c.belly, 0.3), 0.6); ctx.lineWidth = 1.4;
    for (let i = 1; i <= 3; i++) {
      const y = -bh * (0.1 + i * 0.2);
      ctx.beginPath(); ctx.moveTo(-bw * 0.2, y - 1); ctx.quadraticCurveTo(bw * 0.45, y + 3, bw * 1.0, y - 1.5); ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = c.spot;
    ctx.beginPath(); ctx.ellipse(-bw * 0.5, -bh * 0.55, bw * 0.2, bw * 0.13, -0.4, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-bw * 0.62, -bh * 0.25, bw * 0.13, bw * 0.09, -0.2, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-bw * 0.2, -bh * 0.82, bw * 0.12, bw * 0.08, -0.1, 0, PI * 2); ctx.fill();

    if (f === 3) {
      for (let i = 0; i < 4; i++) {
        const a = -PI * 0.5 - 0.1 - i * 0.34;
        const px = Math.cos(a) * bw * 0.88, py = -bh * 0.5 + Math.sin(a) * bh * 0.5;
        R.ellipse(ctx, px, py, 5.5 - i * 0.4, 3.6, c.plate, { rot: a + PI / 2, lw: 1.8 });
        spikeAt(ctx, R, px + Math.cos(a) * 2, py + Math.sin(a) * 2, a - 0.2, 6, 2.2, R.lighten(c.plate, 0.3), 1.5);
      }
    }
    if (god) {
      crack(ctx, [[-bw * 0.9, -bh * 0.4], [-bw * 0.55, -bh * 0.52], [-bw * 0.62, -bh * 0.72], [-bw * 0.25, -bh * 0.88]], t, 2);
      crack(ctx, [[-bw * 0.7, -bh * 0.1], [-bw * 0.38, -bh * 0.22], [-bw * 0.3, -bh * 0.05]], t, 3);
    }
    R.shine(ctx, -bw * 0.35, -bh * 0.78, bw * 0.25, bh * 0.1, 0.35);
    ctx.restore();

    // PIERNA DELANTERA
    leg(ctx, R, 6, hipY, P.legL * lenF, legF, P.legW, c.body, c.claw, bendF);
  }

  // CABEZA
  ctx.save(); upper();
  if (baby) ctx.rotate(shellRot * 0.6);
  ctx.translate(headX, headY + pose.bounce * 1.5);
  ctx.rotate(headRot);
  drawHead(ctx, R, pose, { f, c, P, t, god, baby, jaw, eyeMood, hurtEyes, deadEyes, roarK, chomp, rawr, lookUp });
  ctx.restore();

  // BRAZO DELANTERO
  ctx.save(); upper();
  if (baby) {
    ctx.rotate(shellRot);
    eggShell(ctx, R, 0, -bh * 0.9, bw * 1.5, bh * 0.85, false, t);
    tinyArm(ctx, R, bw * 0.95, -bh * 1.0, P.armL, armF, 5.5, c.body, c.claw);
  } else {
    tinyArm(ctx, R, bw * 0.7, -bh * 0.64, P.armL, armF, 5 + f * 0.4, c.body, c.claw);
  }
  ctx.restore();

  // ACCESORIO DE GESTO: MANZANA INALCANZABLE
  if (apple > 0.05) {
    ctx.save();
    ctx.globalAlpha *= clamp(apple * 2, 0, 1);
    const sw = Math.sin(t * 0.07) * 2;
    const ax = bw * 0.9 + P.armL + 18 + sw, ay = hipY - bh * 0.35;
    ctx.strokeStyle = "#6fae4a"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ax - sw * 0.5, ay - 70); ctx.lineTo(ax + 1, ay - 5); ctx.stroke();
    R.ellipse(ctx, ax, ay, 5, 4.6, "#ff4a4a", { lw: 2 });
    R.ellipse(ctx, ax + 2.5, ay - 6, 3, 1.5, "#6fcf4a", { lw: 1.4, rot: -0.5 });
    R.shine(ctx, ax - 1.8, ay - 1.5, 1.4, 1, 0.8);
    ctx.restore();
  }

  // ONDA DE IMPACTO (PISOTÓN / CAST L)
  if (shock > 0) {
    ctx.save();
    for (let i = 0; i < 2; i++) {
      const k = clamp(shock * 1.3 - i * 0.3, 0, 1);
      if (k <= 0) continue;
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = i ? "#fff3c0" : "#ffffff"; ctx.lineWidth = 3 - i;
      ctx.beginPath(); ctx.ellipse(0, -1, 14 + k * 50, 3 + k * 8, 0, 0, PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1 - shock;
    for (let i = 0; i < 4; i++) {
      const dx = (i < 2 ? -1 : 1) * (14 + shock * 22 + (i % 2) * 8);
      R.ellipse(ctx, dx, -3 - shock * 6 - (i % 2) * 4, 3 + shock * 3, 2.5 + shock * 2, "#d8cfb8", { lw: 1.2, ink: "#7a6d5a" });
    }
    ctx.restore();
  }

  // POLVO AL CORRER
  if (stomp > 0 && !baby) {
    ctx.save();
    ctx.globalAlpha *= stomp * 0.8;
    R.ellipse(ctx, 16, -2, 3.5, 2.5, "#e4dcc8", { lw: 1.2, ink: "#8a7d6a" });
    R.ellipse(ctx, -12, -2, 3, 2.2, "#e4dcc8", { lw: 1.2, ink: "#8a7d6a" });
    ctx.restore();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// DIBUJO DETALLADO DE LA CABEZA
// ---------------------------------------------------------------------------

function drawHead(ctx, R, pose, o) {
  const { f, c, P, t, god, baby, jaw } = o;
  const hw = P.hw, hh = P.hh;
  const dark = R.darken(c.body, 0.2);

  if (f === 3) {
    const cx = -hw * 0.55, cy = -hh * 0.35, rr = hh * 1.15;
    ctx.beginPath();
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const a = -PI * 0.15 - (i / n) * PI * 0.95;
      const r1 = rr * (i % 2 ? 1 : 0.88);
      const x = cx + Math.cos(a) * r1, y = cy + Math.sin(a) * r1;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineTo(cx, cy + hh * 0.3);
    ctx.closePath();
    ctx.fillStyle = R.volume(ctx, cx, cy, rr, "#ff9a3a");
    ctx.fill();
    ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = -PI * 0.3 - i * PI * 0.22;
      R.ellipse(ctx, cx + Math.cos(a) * rr * 0.68, cy + Math.sin(a) * rr * 0.68, 2.6, 2.6, "#ffe07a", { lw: 1.4 });
    }
  }

  if (god) {
    R.halo(ctx, -hw * 0.1, -hh * 1.35, hw * 0.7, t, "#fff27a");
  }

  const hx = -hw * 0.55, hy = hh * 0.22;
  const ja = jaw * 0.85;
  const jl = hw * 1.45;
  if (jaw > 0.03) {
    ctx.beginPath();
    ctx.moveTo(hx, hy - hh * 0.05);
    ctx.lineTo(hw * 0.95, hh * 0.15);
    ctx.lineTo(hx + Math.cos(ja) * jl, hy + Math.sin(ja) * jl);
    ctx.closePath();
    ctx.fillStyle = "#6b1f2e"; ctx.fill();
    ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.stroke();
    R.ellipse(ctx, hx + Math.cos(ja * 0.6) * jl * 0.62, hy + Math.sin(ja * 0.6) * jl * 0.62, hw * 0.35, hh * 0.1, "#ff7a8a", { line: false, shade: false, rot: ja * 0.7 });
  }

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ja);
  const jawPts = [[-hw * 0.2, -hh * 0.12], [jl * 0.95, -hh * 0.08], [jl, hh * 0.12], [jl * 0.8, hh * 0.38], [hw * 0.2, hh * 0.5], [-hw * 0.25, hh * 0.25]];
  R.blob(ctx, jawPts, c.body);

  ctx.save();
  R.blob(ctx, jawPts, null, { line: false, shade: false }); ctx.clip();
  ctx.fillStyle = c.belly;
  ctx.beginPath(); ctx.ellipse(jl * 0.45, hh * 0.45, jl * 0.6, hh * 0.24, -0.05, 0, PI * 2); ctx.fill();
  ctx.restore();
  R.blob(ctx, jawPts, null, { shade: false });

  if (jaw > 0.12) {
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = R.INK; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const tx = jl * (0.45 + i * 0.18);
      ctx.beginPath(); ctx.moveTo(tx - 2.2, -hh * 0.08); ctx.lineTo(tx, -hh * 0.3); ctx.lineTo(tx + 2.2, -hh * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();

  const skull = [[-hw * 0.95, -hh * 0.05], [-hw * 0.8, -hh * 0.78], [-hw * 0.1, -hh * 1.02], [hw * 0.6, -hh * 0.88], [hw * 1.0, -hh * 0.45], [hw * 1.02, hh * 0.08], [hw * 0.35, hh * 0.28], [-hw * 0.6, hh * 0.32]];
  R.blob(ctx, skull, c.body);

  ctx.save();
  R.blob(ctx, skull, null, { line: false, shade: false }); ctx.clip();
  ctx.fillStyle = c.spot;
  ctx.beginPath(); ctx.ellipse(-hw * 0.55, -hh * 0.62, hw * 0.13, hh * 0.1, -0.5, 0, PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-hw * 0.2, -hh * 0.95, hw * 0.14, hh * 0.1, 0, 0, PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hw * 0.35, -hh * 0.9, hw * 0.09, hh * 0.07, 0.2, 0, PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-hw * 0.78, -hh * 0.2, hw * 0.08, hh * 0.08, 0, 0, PI * 2); ctx.fill();
  ctx.restore();

  R.blob(ctx, skull, null, { shade: false });
  R.shine(ctx, -hw * 0.35, -hh * 0.7, hw * 0.25, hh * 0.12, 0.45);

  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = R.INK; ctx.lineWidth = 1.1;
  const nT = jaw > 0.12 ? 4 : 2;
  for (let i = 0; i < nT; i++) {
    const tx = jaw > 0.12 ? hw * (0.05 + i * 0.26) : hw * (0.55 + i * 0.28);
    const ty = lerp(hh * 0.3, hh * 0.18, (tx + hw) / (2 * hw));
    ctx.beginPath(); ctx.moveTo(tx - 2.3, ty - 1); ctx.lineTo(tx, ty + 4.5); ctx.lineTo(tx + 2.3, ty - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  if (jaw <= 0.03) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(hx + hw * 0.15, hy - hh * 0.12, hh * 0.13, 0.2, 1.8); ctx.stroke();
  }

  if (baby) {
    ctx.save();
    ctx.translate(-hw * 0.3, -hh * 0.92);
    ctx.rotate(-0.3 + Math.sin(t * 0.06) * 0.04 - pose.bounce * 0.08);
    eggShell(ctx, R, 0, 0, hw * 0.7, hh * 0.5, true, t);
    ctx.restore();
  }

  if (f === 3) {
    R.blob(ctx, [[hw * 0.45, -hh * 0.82], [hw * 0.72, -hh * 1.45], [hw * 0.82, -hh * 0.62]], c.plate, { lw: 2.2 });
    R.blob(ctx, [[-hw * 0.2, -hh * 0.95], [-hw * 0.25, -hh * 1.4], [hw * 0.05, -hh * 0.98]], c.plate, { lw: 2 });
  }

  if (f === 2) {
    for (let i = 0; i < 3; i++) spikeAt(ctx, R, -hw * (0.25 + i * 0.25), -hh * (0.98 - i * 0.12), -PI / 2 - 0.4 - i * 0.25, 7 - i, 2.4, c.plate);
  }

  if (god) {
    for (let i = 0; i < 5; i++) {
      const a = -PI / 2 - 0.9 + i * 0.4;
      const bx = -hw * 0.15 + Math.cos(a) * hw * 0.5, by = -hh * 0.72 + Math.sin(a) * hh * 0.35;
      crystal(ctx, R, bx, by, a * 0.5 - PI * 0.25 - 0.3, i === 2 ? 17 : 12 - Math.abs(i - 2), 3.6);
    }
    ctx.save();
    ctx.shadowColor = "#bff4ff"; ctx.shadowBlur = 8;
    R.sparkle(ctx, hw * 0.35, -hh * 1.55, 3 + Math.sin(t * 0.2) * 1.5, "#ffffff");
    ctx.restore();
    crack(ctx, [[-hw * 0.9, -hh * 0.35], [-hw * 0.6, -hh * 0.3], [-hw * 0.5, -hh * 0.05], [-hw * 0.25, hh * 0.05]], t, 4);
  }

  const ex = -hw * 0.08, ey = -hh * 0.42, er = hh * (baby ? 0.46 : 0.4);
  if (o.hurtEyes) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2.6; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ex - er * 0.6, ey - er * 0.6); ctx.lineTo(ex + er * 0.5, ey); ctx.lineTo(ex - er * 0.6, ey + er * 0.6);
    ctx.stroke();
  } else if (o.deadEyes) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2.4; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ex - er * 0.5, ey - er * 0.5); ctx.lineTo(ex + er * 0.5, ey + er * 0.5);
    ctx.moveTo(ex + er * 0.5, ey - er * 0.5); ctx.lineTo(ex - er * 0.5, ey + er * 0.5);
    ctx.stroke();
  } else {
    const lp = o.lookUp !== 0 ? { ...pose, look: { x: 1, y: 0.4 } } : pose;
    R.eye(ctx, ex, ey, er, lp, { iris: god ? "#ff9a1a" : f === 2 ? "#7a3a10" : "#5a3a12", mood: o.eyeMood });
  }

  if ((f >= 3 || o.eyeMood === "angry") && !o.hurtEyes && !o.deadEyes && o.eyeMood !== "happy" && o.eyeMood !== "closed") {
    ctx.strokeStyle = R.darken(c.body, 0.45); ctx.lineWidth = 3.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ex - er * 0.9, ey - er * 1.2); ctx.lineTo(ex + er * 0.9, ey - er * (o.eyeMood === "angry" ? 0.75 : 1.1)); ctx.stroke();
  }

  R.ellipse(ctx, hw * 0.8, -hh * 0.45, 1.8, 1.3, R.INK, { line: false, shade: false, rot: -0.3 });
  R.blush(ctx, hw * 0.3, -hh * 0.02, hh * 0.18, "#ff6a7a");
  void dark;

  const mx = hw * 1.1, my = hh * 0.25;
  if (o.roarK > 0.15) {
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.05 + i / 3) % 1);
      ctx.globalAlpha = o.roarK * (1 - k);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 - k * 1.5;
      ctx.beginPath(); ctx.arc(mx, my, 8 + k * 30, -0.7, 0.7); ctx.stroke();
    }
    ctx.restore();
  }

  if (o.rawr > 0.2) {
    ctx.save();
    ctx.globalAlpha *= o.rawr;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(mx, my, 6 + i * 5, -0.5, 0.5); ctx.stroke(); }
    ctx.fillStyle = "#ff7aa0";
    R.star(ctx, mx + 12, my - 12, 3.5, "#ffd0e0", { lw: 1.2 });
    ctx.restore();
  }

  if (o.chomp > 0.2) {
    ctx.save();
    ctx.globalAlpha *= o.chomp;
    R.star(ctx, hw * 1.35, hh * 0.1, 6 + o.chomp * 4, "#ffffff", { points: 6, inner: 0.4, lw: 1.6 });
    ctx.restore();
  }
}

export default { id: "dino", draw };
