// ============================================================================
// STITCHO · alien travieso original ("experimento" espacial azul cobalto)
// Cuerpo de judía, cabeza grande con DOS antenas-muelle con bulbos cian,
// orejas-aleta triangulares hacia atrás, 3 rayas moradas en la espalda,
// sonrisa pícara con colmillitos, manos de 3 garras, cola corta con punta
// luminosa. Formas 2+ galopan a cuatro patas.
// pose.move: "roll" (bola rodando), "climb" (trepando, igual que wall).
// ============================================================================

const TAU = Math.PI * 2;
const CYAN = "#62f3ff";
const CLAW = "#f2f7ff";

const PAL = [
  { body: "#8ac6ff", stripe: "#827aeb", limb: "#6aabe8" },
  { body: "#367ddd", stripe: "#7a3fe0", limb: "#2a5fe6" },
  { body: "#244aa3", stripe: "#8e3ff0", limb: "#213fc0" },
  { body: "#337cbb", stripe: "#7a3fe0", limb: "#246add" },
  { body: "#5b4cc4", stripe: "#f08cff", limb: "#5a44d8" },
];

// Proporciones por forma (y de 0 a ~-100; las antenas pueden sobresalir)
const P = [
  { egg: true, hx: 1, hy: -38, hrx: 30, hry: 33, bx: 0, by: -24, brx: 0, bry: 0, legL: 5, legW: 8.5, armL: 8, armW: 6, hand: 4.6, antL: 13, ear: 9.5, eye: 12.2 },
  { hx: 4, hy: -58, hrx: 25, hry: 21, bx: -2, by: -31, brx: 15, bry: 17, legL: 13, legW: 8.5, armL: 16, armW: 6.5, hand: 5.4, antL: 26, ear: 11, eye: 10.4 },
  { hx: 13, hy: -52, hrx: 25, hry: 20, bx: -2, by: -30, brx: 19, bry: 17, lean: 0.32, legL: 12, legW: 10.5, armL: 20, armW: 8.5, hand: 7.5, antL: 29, ear: 12.5, eye: 9.2, spikes: true, bigClaw: true },
  { hx: 5, hy: -64, hrx: 26, hry: 21, bx: -2, by: -35, brx: 19, bry: 20, legL: 15, legW: 10, armL: 19, armW: 8, hand: 6.4, antL: 30, ear: 12.5, eye: 9.4, tech: true, extraArms: true },
  { hx: 5, hy: -72, hrx: 27, hry: 22, bx: -2, by: -39, brx: 19, bry: 22, legL: 17, legW: 10, armL: 21, armW: 8, hand: 6.6, antL: 35, ear: 14, eye: 9.8, final: true, extraArms: true },
];

// ---------------------------------------------------------------------------
// helpers de trazo (Path2D para poder rellenar, recortar y contornear)
// ---------------------------------------------------------------------------
function pEll(x, y, rx, ry, rot = 0) {
  const p = new Path2D();
  p.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU);
  return p;
}
function pBlob(pts) {
  const p = new Path2D(), n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) p.moveTo(p1[0], p1[1]);
    p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  p.closePath();
  return p;
}
function galaxyFill(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.05, x, y, r * 1.25);
  g.addColorStop(0, "#c2b2ff");
  g.addColorStop(0.3, "#7254f2");
  g.addColorStop(0.7, "#2e1d92");
  g.addColorStop(1, "#150c48");
  return g;
}
function starsIn(ctx, x, y, r, t) {
  ctx.fillStyle = "rgba(255,110,220,0.28)";
  ctx.beginPath(); ctx.ellipse(x + r * 0.2, y + r * 0.1, r * 0.8, r * 0.28, -0.6, 0, TAU); ctx.fill();
  ctx.fillStyle = "rgba(120,220,255,0.22)";
  ctx.beginPath(); ctx.ellipse(x - r * 0.3, y + r * 0.4, r * 0.6, r * 0.2, 0.5, 0, TAU); ctx.fill();
  for (let i = 0; i < 9; i++) {
    const a = i * 2.399 + x * 0.01, d = r * (0.2 + ((i * 37) % 10) / 12);
    const sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d * 0.9;
    const tw = 0.6 + 0.4 * Math.sin(t * 0.12 + i * 1.7);
    ctx.fillStyle = "rgba(255,255,255," + (0.5 + tw * 0.5) + ")";
    ctx.beginPath(); ctx.arc(sx, sy, 0.6 + tw * 0.9, 0, TAU); ctx.fill();
  }
}
/** Relleno de piel (volumen o galaxia) + extras recortados + contorno. */
function skin(ctx, R, path, f, x, y, r, col, t, extra, lw) {
  ctx.fillStyle = f === 4 ? galaxyFill(ctx, x, y, r) : R.volume(ctx, x, y, r, col);
  ctx.fill(path);
  if (f === 4 || extra) {
    ctx.save(); ctx.clip(path);
    if (f === 4) starsIn(ctx, x, y, r, t);
    if (extra) extra();
    ctx.restore();
  }
  ctx.lineWidth = lw || R.LINE; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke(path);
}
function stroke2(ctx, R, build, w, col, lw = 2.4) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); build();
  ctx.strokeStyle = R.INK; ctx.lineWidth = w + lw * 2; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
function glowDot(ctx, x, y, r, col, a = 1) {
  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, a));
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.35, col); g.addColorStop(1, "rgba(98,243,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}
function zap(ctx, x, y, ang, len, col, w = 1.6) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  const n = 3;
  for (let i = 1; i <= n; i++) {
    const k = i / n, off = i === n ? 0 : (i % 2 ? 1 : -1) * Math.min(3, len * 0.18);
    ctx.lineTo(x + Math.cos(ang) * len * k - Math.sin(ang) * off, y + Math.sin(ang) * len * k + Math.cos(ang) * off);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
}

// ---------------------------------------------------------------------------
// partes
// ---------------------------------------------------------------------------
/** Mano de tres garras. dir = ángulo canvas hacia donde apunta. */
function claw(ctx, R, x, y, dir, s, col, big) {
  const L = big ? s * 1.5 : s * 1.15;
  for (let i = -1; i <= 1; i++) {
    const a = dir + i * 0.62;
    const bx = x + Math.cos(a) * s * 0.7, by = y + Math.sin(a) * s * 0.7;
    const px = -Math.sin(a) * s * 0.28, py = Math.cos(a) * s * 0.28;
    ctx.beginPath();
    ctx.moveTo(bx + px, by + py);
    ctx.quadraticCurveTo(bx + Math.cos(a) * L * 0.8 + px * 0.6, by + Math.sin(a) * L * 0.8 + py * 0.6,
      bx + Math.cos(a + 0.35) * L, by + Math.sin(a + 0.35) * L);
    ctx.lineTo(bx - px, by - py);
    ctx.closePath();
    R.paint(ctx, CLAW, { lw: 1.6 });
  }
  R.ellipse(ctx, x, y, s, s * 0.92, col, { lw: 2.2 });
}
function arm(ctx, R, x, y, len, ang, bend, w, col, hs, big) {
  const e = R.swingLimb(ctx, x, y, len, ang, bend, w, col, { hand: false, lw: 2.6 });
  claw(ctx, R, e[0], e[1], Math.atan2(Math.cos(ang), Math.sin(ang)), hs, col, big);
  return e;
}
function leg(ctx, R, x, y, len, ang, bend, w, col) {
  const e = R.swingLimb(ctx, x, y, len, ang, bend, w, col, { hand: false, lw: 2.6 });
  foot(ctx, R, e[0], e[1], w, col);
  return e;
}
function foot(ctx, R, x, y, w, col) {
  for (let i = 0; i < 2; i++) {
    const cx = x + w * 0.55 + i * w * 0.32;
    ctx.beginPath();
    ctx.moveTo(cx - 1.2, y + 1); ctx.lineTo(cx + 2.4, y + 1.6); ctx.lineTo(cx, y - 0.6); ctx.closePath();
    R.paint(ctx, CLAW, { lw: 1.3 });
  }
  R.ellipse(ctx, x + w * 0.2, y - w * 0.12, w * 0.72, w * 0.46, col, { lw: 2.4 });
}
function tailPart(ctx, R, x, y, ang, len, w, col, t, pose, glow) {
  const e = R.tail(ctx, x, y, len, ang, (k) => Math.sin(t * 0.16 + k * 2) * 1.4 + pose.sway * 1.2, w, w * 0.55, col, { segments: 5, lw: 2.4 });
  R.ellipse(ctx, e[0], e[1], w * 0.55, w * 0.55, CYAN, { lw: 2 });
  glowDot(ctx, e[0], e[1], w * 1.3, CYAN, 0.5 + glow * 0.5);
}

/** Ojo grande oscuro con borde cian. */
function alienEye(ctx, R, x, y, rx, ry, pose, mood, rim, lookUp, slant = 0.12) {
  const blink = mood === "closed" ? 1 : pose.blink;
  ctx.lineCap = "round";
  if (mood === "x") {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x - rx * 0.7, y - rx * 0.7); ctx.lineTo(x + rx * 0.7, y + rx * 0.7);
    ctx.moveTo(x + rx * 0.7, y - rx * 0.7); ctx.lineTo(x - rx * 0.7, y + rx * 0.7);
    ctx.stroke();
    return;
  }
  if (mood === "happy" || mood === "squint" || blink > 0.75) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2.8;
    ctx.beginPath();
    if (mood === "happy") ctx.arc(x, y + ry * 0.35, rx * 0.85, Math.PI * 1.12, Math.PI * 1.88);
    else if (mood === "squint") { ctx.moveTo(x - rx * 0.8, y - ry * 0.35); ctx.lineTo(x + rx * 0.5, y); ctx.lineTo(x - rx * 0.8, y + ry * 0.35); }
    else { ctx.moveTo(x - rx * 0.85, y); ctx.quadraticCurveTo(x, y + ry * 0.4, x + rx * 0.85, y); }
    ctx.stroke();
    return;
  }
  const h = ry * (1 - blink * 0.85);
  const g = ctx.createLinearGradient(x, y - h, x, y + h);
  g.addColorStop(0, "#07081c"); g.addColorStop(1, "#1b2460");
  const p = pEll(x, y, rx, h, slant);
  ctx.fillStyle = g; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  ctx.strokeStyle = rim || CYAN; ctx.lineWidth = 1.7;
  ctx.beginPath(); ctx.ellipse(x, y, rx - 1, h - 1, slant, 0, TAU); ctx.stroke();
  const lx = pose.look.x * rx * 0.18, ly = (lookUp ? -0.5 : pose.look.y) * h * 0.25;
  ctx.fillStyle = "rgba(90,120,255,0.35)";
  ctx.beginPath(); ctx.ellipse(x + lx, y + ly + h * 0.45, rx * 0.45, h * 0.22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(x + lx - rx * 0.28, y + ly - h * 0.35, rx * 0.32, h * 0.26, -0.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x + lx + rx * 0.3, y + ly + h * 0.12, rx * 0.13, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2.4; ctx.strokeStyle = R.INK; ctx.stroke(p);
  if (mood === "angry") {
    ctx.beginPath();
    ctx.moveTo(x - rx * 1.1, y - ry * 1.25); ctx.lineTo(x + rx * 0.9, y - ry * 0.72);
    ctx.lineWidth = 3; ctx.strokeStyle = R.INK; ctx.stroke();
  }
}

/** Boca ancha de pillo. type: smirk|grin|roar|laugh|o|tongue|wavy */
function alienMouth(ctx, R, x, y, w, type, teeth) {
  const L = [x - w * 0.5, y - w * 0.04], Rt = [x + w * 0.5, y - w * 0.22], C = [x, y + w * 0.22];
  const qy = (u) => (1 - u) * (1 - u) * L[1] + 2 * u * (1 - u) * C[1] + u * u * Rt[1];
  const qx = (u) => (1 - u) * (1 - u) * L[0] + 2 * u * (1 - u) * C[0] + u * u * Rt[0];
  const fang = (u, s) => {
    const fx = qx(u), fy = qy(u);
    ctx.beginPath(); ctx.moveTo(fx - s * 0.55, fy - 0.3); ctx.lineTo(fx + s * 0.55, fy - 0.3); ctx.lineTo(fx + s * 0.1, fy + s * 1.1); ctx.closePath();
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = R.INK; ctx.stroke();
  };
  const fangs = (s) => { if (teeth === 1) fang(0.55, s * 1.15); else { fang(0.3, s); fang(0.72, s); } };
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (type === "o") {
    ctx.beginPath(); ctx.ellipse(x + w * 0.1, y + w * 0.05, w * 0.16, w * 0.2, 0, 0, TAU);
    ctx.fillStyle = "#4a1030"; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = R.INK; ctx.stroke();
    return;
  }
  if (type === "wavy") {
    ctx.beginPath(); ctx.moveTo(L[0] + w * 0.15, y);
    for (let i = 1; i <= 4; i++) ctx.lineTo(L[0] + w * 0.15 + i * w * 0.18, y + (i % 2 ? -w * 0.08 : w * 0.06));
    ctx.lineWidth = 2.2; ctx.strokeStyle = R.INK; ctx.stroke();
    return;
  }
  if (type === "smirk" || type === "tongue") {
    if (type === "tongue") {
      const tx = qx(0.6), ty = qy(0.6);
      ctx.beginPath();
      ctx.moveTo(tx - w * 0.16, ty - 1);
      ctx.quadraticCurveTo(tx - w * 0.2, ty + w * 0.42, tx + w * 0.02, ty + w * 0.44);
      ctx.quadraticCurveTo(tx + w * 0.22, ty + w * 0.4, tx + w * 0.16, ty - 1);
      ctx.closePath();
      R.paint(ctx, "#ff6f95", { lw: 2 });
      ctx.beginPath(); ctx.moveTo(tx, ty + 1); ctx.lineTo(tx + 0.5, ty + w * 0.28);
      ctx.lineWidth = 1.2; ctx.strokeStyle = "#b8325a"; ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(L[0], L[1]); ctx.quadraticCurveTo(C[0], C[1], Rt[0], Rt[1]);
    ctx.lineWidth = 2.6; ctx.strokeStyle = R.INK; ctx.stroke();
    // comisura pícara
    ctx.beginPath(); ctx.moveTo(Rt[0] - 1, Rt[1] + 1.6); ctx.lineTo(Rt[0] + 1.5, Rt[1] - 1.5); ctx.lineWidth = 2; ctx.stroke();
    if (type === "smirk") fangs(2.4);
    return;
  }
  const depth = type === "roar" ? w * 0.85 : type === "laugh" ? w * 0.62 : w * 0.45;
  ctx.beginPath();
  ctx.moveTo(L[0], L[1]);
  ctx.quadraticCurveTo(C[0], C[1] - (type === "roar" ? w * 0.25 : 0), Rt[0], Rt[1]);
  ctx.quadraticCurveTo(x + w * 0.1, y + depth, L[0], L[1]);
  ctx.closePath();
  ctx.fillStyle = "#4a1030"; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = "#ff6f95";
  ctx.beginPath(); ctx.ellipse(x + w * 0.05, y + depth * 0.8, w * 0.28, depth * 0.35, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 2.4; ctx.strokeStyle = R.INK; ctx.stroke();
  fangs(type === "roar" ? 3.4 : 2.8);
}

/** Antena-muelle. Devuelve la punta. */
function antenna(ctx, R, bx, by, tx, ty, bend, w, bulb, glow, final, t, i) {
  const mx = (bx + tx) / 2, my = (by + ty) / 2;
  const dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / d) * bend, cy = my + (dx / d) * bend;
  stroke2(ctx, R, () => { ctx.moveTo(bx, by); ctx.quadraticCurveTo(cx, cy, tx, ty); }, w, final ? "#7a5cff" : "#3a78ff", 2.2);
  // anillo de muelle cerca de la base
  ctx.beginPath(); ctx.moveTo(bx + (cx - bx) * 0.35 - 2, by + (cy - by) * 0.35); ctx.lineTo(bx + (cx - bx) * 0.35 + 2, by + (cy - by) * 0.35);
  ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.2; ctx.stroke();
  glowDot(ctx, tx, ty, bulb * (2.2 + glow), final ? "#ffe98a" : CYAN, 0.35 + glow * 0.45);
  R.ellipse(ctx, tx, ty, bulb, bulb, final ? "#fff2a8" : CYAN, { lw: 2.2 });
  ctx.save();
  ctx.globalAlpha *= Math.min(1, 0.4 + glow * 0.6);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(tx - bulb * 0.3, ty - bulb * 0.3, bulb * 0.4, 0, TAU); ctx.fill();
  ctx.restore();
  return [tx, ty];
}

// ---------------------------------------------------------------------------
// cabeza (coordenadas locales: centro de la cabeza en 0,0)
// ---------------------------------------------------------------------------
function headPath(S) {
  const rx = S.hrx, ry = S.hry;
  if (S.egg) {
    return pBlob([[0, -ry], [rx * 0.72, -ry * 0.72], [rx, 0], [rx * 0.9, ry * 0.62], [rx * 0.35, ry * 0.97],
      [-rx * 0.4, ry * 0.97], [-rx * 0.92, ry * 0.6], [-rx, 0], [-rx * 0.72, -ry * 0.72]]);
  }
  return pBlob([[-rx * 0.15, -ry], [rx * 0.55, -ry * 0.88], [rx * 0.98, -ry * 0.25], [rx * 1.02, ry * 0.35],
    [rx * 0.62, ry * 0.9], [-rx * 0.2, ry * 0.98], [-rx * 0.88, ry * 0.55], [-rx * 1.02, -ry * 0.1], [-rx * 0.75, -ry * 0.72]]);
}

function earFin(ctx, R, x, y, s, ang, col, back) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  const pts = [[0, -s * 0.35], [-s * 1.7, -s * 0.55], [-s * 0.3, s * 0.55]];
  R.poly(ctx, pts, back ? R.darken(col, 0.2) : col, { lw: 2.4 });
  ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.05); ctx.lineTo(-s * 1.2, -s * 0.35);
  ctx.strokeStyle = "rgba(160,110,255,0.8)"; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.restore();
}

function drawHead(ctx, R, pose, f, S, C, x, y, rot, face) {
  const t = pose.t, rx = S.hrx, ry = S.hry;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // --- antenas (detrás de la cabeza)
  const L = S.antL, bulb = f === 0 ? 3.6 : 4.3;
  const bases = [[-rx * 0.28, -ry * 0.9], [rx * 0.18, -ry * 0.97]];
  const tips = [];
  for (let i = 0; i < 2; i++) {
    const [bx, by] = bases[i];
    let tx, ty, bend = Math.sin(t * 0.1 + i * 1.3) * L * 0.12 + pose.sway * L * 0.2;
    const m = pose.stitchoDuetAge>=18&&pose.stitchoDuetAge<30?'spin':face.ant;
    if (m === "spin") {
      const a = t * 0.38 + i * Math.PI;
      tx = bx + Math.cos(a) * L * 0.75; ty = by - L * 0.55 + Math.sin(a) * L * 0.3; bend = L * 0.25;
    } else if (m === "up") {
      tx = bx + (i ? L * 0.15 : -L * 0.15) + Math.sin(t * 0.8 + i) * 1.2; ty = by - L; bend = 0;
    } else if (m === "limp") {
      tx = bx - L * 0.75; ty = by + L * 0.15 - i * 3; bend = -L * 0.3;
    } else if (m === "forward") {
      tx = bx + L * 0.65; ty = by - L * 0.65; bend = -L * 0.12;
    } else if (m === "back") {
      tx = bx - L * 0.9; ty = by - L * 0.3 + Math.sin(t * 0.3 + i) * 2.5; bend = L * 0.2;
    } else if (m === "tuck") {
      tx = bx - L * 0.5; ty = by - L * 0.35; bend = L * 0.25;
    } else {
      tx = bx + (i ? L * 0.2 : -L * 0.38) + Math.sin(t * 0.07 + i * 2) * L * 0.07 - pose.sway * L * 0.35;
      ty = by - L * 0.92 - pose.bounce * L * 0.28 + Math.cos(t * 0.09 + i) * L * 0.04;
    }
    const glow = face.glow != null ? face.glow : 0.5 + 0.5 * Math.sin(t * 0.14 + i * 2.1);
    tips.push(antenna(ctx, R, bx, by, tx, ty, bend, f === 0 ? 2.4 : 2.8, bulb, glow, f === 4, t, i));
  }

  // --- oreja trasera
  const earWig = Math.sin(t * 0.05) * 0.08 + pose.sway * 0.12 + (face.earFlick || 0) +
    (pose.stitchoWelcome?.reduced||pose.reduceMotion ? 0 : (pose.stitchoWelcome?.antenna||0)*.13);
  earFin(ctx, R, -rx * 0.45, -ry * 0.62, S.ear * 0.85, -0.25 + earWig, C.body, true);

  // --- cabeza
  const hp = headPath(S);
  skin(ctx, R, hp, f, 0, -ry * 0.1, Math.max(rx, ry), C.body, t, () => {
    if (S.egg) {
      // rayas en la espalda del huevo
      for (let i = 0; i < 3; i++) {
        const yy = -ry * 0.05 + i * ry * 0.26;
        ctx.beginPath(); ctx.moveTo(-rx * 1.1, yy - 3); ctx.quadraticCurveTo(-rx * 0.75, yy + 1, -rx * 0.55, yy + 4);
        ctx.strokeStyle = C.stripe; ctx.lineWidth = 3.4; ctx.lineCap = "round"; ctx.stroke();
      }
    }
    // mejilla/hocico más claro y sombra inferior
    ctx.fillStyle = "rgba(170,210,255,0.28)";
    ctx.beginPath(); ctx.ellipse(rx * 0.45, ry * 0.45, rx * 0.5, ry * 0.35, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(20,10,60,0.18)";
    ctx.beginPath(); ctx.ellipse(-rx * 0.2, ry * 0.95, rx * 1.1, ry * 0.4, 0, 0, TAU); ctx.fill();
  });
  R.shine(ctx, -rx * 0.25, -ry * 0.62, rx * 0.22, ry * 0.12, 0.45);

  // púas en la cabeza (Bravo)
  if (S.spikes) {
    for (let i = 0; i < 3; i++) {
      const a = -2.2 - i * 0.38, px = Math.cos(a) * rx * 0.98, py = Math.sin(a) * ry * 0.98;
      R.poly(ctx, [[px + 3, py + 1], [px + Math.cos(a) * 8 - 3, py + Math.sin(a) * 8], [px - 2, py + 3]], C.stripe, { lw: 2 });
    }
  }

  // --- oreja delantera
  earFin(ctx, R, -rx * 0.28, -ry * 0.28, S.ear, -0.05 + earWig * 1.3, C.body, false);

  // --- cara
  const eyR = S.eye, mood = face.mood;
  const exF = rx * 0.5, exB = -rx * 0.1, ey = -ry * 0.14;
  // ojos de alien almendrados y rasgados, sin aro (no parecen gafas)
  alienEye(ctx, R, exB - 1, ey - 0.5, eyR * 0.72, eyR * 1.05, pose, mood, "#5a2fb8", face.lookUp, -0.45);
  alienEye(ctx, R, exF + 1, ey, eyR * 0.84, eyR * 1.15, pose, mood, S.final ? CYAN : "#5a2fb8", face.lookUp, 0.45);
  const openEye = mood !== "x" && mood !== "happy" && mood !== "squint" && mood !== "closed" && pose.blink <= 0.75;
  if (S.egg && openEye) {
    // brillo doble extra (bebé)
    ctx.fillStyle = "#fff";
    for (const [ex, k] of [[exB - 1, 0.72], [exF + 1, 0.84]]) { ctx.beginPath(); ctx.arc(ex + eyR * k * 0.35, ey - eyR * 0.55, eyR * 0.16, 0, TAU); ctx.fill(); }
  }
  if (S.final && openEye && mood !== "angry") {
    // ceja corta cósmica: mirada intensa
    ctx.beginPath(); ctx.moveTo(exF - eyR * 0.7, ey - eyR * 1.35); ctx.lineTo(exF + eyR * 0.8, ey - eyR * 1.05);
    ctx.moveTo(exB - eyR * 0.6, ey - eyR * 1.2); ctx.lineTo(exB + eyR * 0.4, ey - eyR * 1.3);
    ctx.lineWidth = 2.6; ctx.strokeStyle = R.INK; ctx.lineCap = "round"; ctx.stroke();
  }
  // fosas nasales mínimas
  ctx.fillStyle = R.INK;
  ctx.beginPath(); ctx.arc(rx * 0.93, ry * 0.12, 1, 0, TAU); ctx.arc(rx * 0.8, ry * 0.16, 0.9, 0, TAU); ctx.fill();
  alienMouth(ctx, R, rx * 0.42, ry * 0.56, rx * (S.egg ? 0.5 : 0.92), face.mouth, S.egg ? 1 : 2);
  if (face.blush !== false) R.blush(ctx, rx * 0.05, ry * 0.42, rx * (S.egg ? 0.2 : 0.14), S.egg ? "#ff9ad5" : "#b784ff");
  if (S.egg && face.blush !== false) R.blush(ctx, rx * 0.86, ry * 0.36, rx * 0.12, "#ff9ad5");

  // --- visor (Experimento Ñam)
  if (S.tech) {
    ctx.beginPath();
    ctx.moveTo(exF - eyR * 0.9, ey - eyR * 1.1);
    ctx.quadraticCurveTo(-rx * 0.4, -ry * 0.55, -rx * 0.98, -ry * 0.2);
    ctx.lineWidth = 6; ctx.strokeStyle = R.INK; ctx.stroke();
    ctx.lineWidth = 3.4; ctx.strokeStyle = "#8fa3bd"; ctx.stroke();
    const vp = pEll(exF + 0.5, ey, eyR * 1.02, eyR * 1.3, 0.1);
    ctx.fillStyle = "rgba(255,70,120,0.35)"; ctx.fill(vp);
    ctx.save(); ctx.clip(vp);
    const sy = ey - eyR * 1.4 + ((t * 0.9) % (eyR * 2.8));
    ctx.fillStyle = "rgba(255,200,220,0.6)"; ctx.fillRect(exF - eyR * 2, sy, eyR * 4, 1.4);
    ctx.restore();
    ctx.lineWidth = 3.2; ctx.strokeStyle = "#c9d6e8"; ctx.stroke(vp);
    ctx.lineWidth = 1.4; ctx.strokeStyle = R.INK; ctx.stroke(vp);
    glowDot(ctx, exF + eyR * 1.2, ey - eyR * 1.1, 3, "#ff4a7a", 0.6 + 0.4 * Math.sin(t * 0.3));
  }

  // V302: a constellation crest belongs to Nebula's alien silhouette.
  if(S.final){
    ctx.save();ctx.translate(0,-ry-9);ctx.strokeStyle='#cbbaff';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.ellipse(0,0,16,4,-.1,0,TAU);ctx.stroke();
    for(let i=0;i<5;i++){
      const a=-Math.PI+i*Math.PI/4;
      R.ellipse(ctx,Math.cos(a)*15,Math.sin(a)*8,2,2,i%2?CYAN:'#fff2ba',{lw:1});
    }
    ctx.restore();
    for(const tp of tips)R.sparkle(ctx,tp[0],tp[1]-5,2.5,'#cbbaff');
  }

  // --- efectos de cara
  if (face.plasma > 0) {
    const k = face.plasma;
    const px = rx * 1.15 + 6 + Math.max(0, k - 0.55) * 90, py = ry * 0.45;
    ctx.save();
    ctx.strokeStyle = "rgba(150,250,255,0.85)"; ctx.lineWidth = 1.6;
    if (k < 0.6) for (const tp of tips) zap(ctx, tp[0], tp[1], Math.atan2(py - tp[1], px - tp[0]), Math.hypot(py - tp[1], px - tp[0]), "rgba(150,250,255,0.85)", 1.4);
    ctx.shadowColor = CYAN; ctx.shadowBlur = 12;
    glowDot(ctx, px, py, 7 + k * 9, CYAN, 1);
    ctx.restore();
    R.ellipse(ctx, px, py, 3 + k * 3, 3 + k * 3, "#e8ffff", { line: false, shade: false });
  }
  if (face.waves > 0) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const k = (face.waves * 1.6 + i / 3) % 1;
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = i % 2 ? "#ffffff" : CYAN; ctx.lineWidth = 3 - k * 1.5;
      ctx.beginPath(); ctx.arc(rx * 0.6, ry * 0.55, 10 + k * 34, -0.75, 0.75); ctx.stroke();
    }
    ctx.restore();
  }
  if (face.crackle) {
    for (let j = 0; j < tips.length; j++) {
      const tp = tips[j];
      for (let i = 0; i < 3; i++) {
        const a = t * 0.5 + i * 2.1 + j;
        zap(ctx, tp[0] + Math.cos(a) * 4, tp[1] + Math.sin(a) * 4, a, 7 + Math.sin(t + i) * 2, i % 2 ? "#ffffff" : CYAN, 1.6);
      }
    }
  }
  ctx.restore();
  return tips;
}

// ---------------------------------------------------------------------------
// cuerpo
// ---------------------------------------------------------------------------
function bodyPath(bx, by, rx, ry) {
  // judía: más ancha abajo, ligera curva en la espalda
  return pBlob([[bx - rx * 0.25, by - ry], [bx + rx * 0.55, by - ry * 0.8], [bx + rx, by], [bx + rx * 0.75, by + ry * 0.8],
    [bx, by + ry], [bx - rx * 0.8, by + ry * 0.75], [bx - rx * 1.02, by + ry * 0.05], [bx - rx * 0.8, by - ry * 0.7]]);
}
function drawBody(ctx, R, f, S, C, bx, by, rx, ry, t, horizontal) {
  const bp = horizontal ? pBlob([[bx - rx, by - ry * 0.3], [bx - rx * 0.4, by - ry], [bx + rx * 0.5, by - ry * 0.9], [bx + rx, by - ry * 0.1],
    [bx + rx * 0.7, by + ry * 0.85], [bx - rx * 0.2, by + ry], [bx - rx * 0.9, by + ry * 0.6]]) : bodyPath(bx, by, rx, ry);
  skin(ctx, R, bp, f, bx, by, Math.max(rx, ry), C.body, t, () => {
    // tres rayas moradas en la espalda
    ctx.strokeStyle = C.stripe; ctx.lineWidth = f === 4 ? 2.6 : 3.6; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      if (horizontal) {
        const xx = bx - rx * 0.55 + i * rx * 0.42;
        ctx.moveTo(xx - 2, by - ry * 1.1); ctx.quadraticCurveTo(xx + 1, by - ry * 0.6, xx - 1, by - ry * 0.2);
      } else {
        const yy = by - ry * 0.6 + i * ry * 0.42;
        ctx.moveTo(bx - rx * 1.15, yy - 2); ctx.quadraticCurveTo(bx - rx * 0.7, yy + 1, bx - rx * 0.35, yy + 4);
      }
      ctx.stroke();
    }
    // circuitos luminosos
    if (S.tech) {
      const a = 0.55 + 0.45 * Math.sin(t * 0.2);
      ctx.strokeStyle = "rgba(98,243,255," + a + ")"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + rx * 0.1, by - ry * 0.7); ctx.lineTo(bx + rx * 0.1, by - ry * 0.1); ctx.lineTo(bx + rx * 0.5, by + ry * 0.2);
      ctx.moveTo(bx - rx * 0.2, by + ry * 0.1); ctx.lineTo(bx + rx * 0.05, by + ry * 0.45); ctx.lineTo(bx + rx * 0.55, by + ry * 0.5);
      ctx.stroke();
      ctx.fillStyle = "rgba(200,255,255," + a + ")";
      for (const [u, v] of [[0.1, -0.7], [0.5, 0.2], [-0.2, 0.1], [0.55, 0.5]]) { ctx.beginPath(); ctx.arc(bx + rx * u, by + ry * v, 1.6, 0, TAU); ctx.fill(); }
    }
    ctx.fillStyle = "rgba(20,10,60,0.16)";
    ctx.beginPath(); ctx.ellipse(bx + rx * 0.2, by + ry * 0.9, rx * 1.1, ry * 0.45, 0, 0, TAU); ctx.fill();
  });
  R.shine(ctx, bx - rx * 0.1, by - ry * 0.55, rx * 0.25, ry * 0.12, 0.35);
  if (S.spikes) {
    for (let i = 0; i < 4; i++) {
      let px, py, ax, ay;
      if (horizontal) { px = bx - rx * 0.7 + i * rx * 0.42; py = by - ry * 0.95 + Math.abs(i - 1.5) * 1.5; ax = -0.35; ay = -1; }
      else { const a = Math.PI * 1.02 + i * 0.3; px = bx + Math.cos(a) * rx * 0.97; py = by + Math.sin(a) * ry * 0.97; ax = Math.cos(a); ay = Math.sin(a); }
      const L = 7 - Math.abs(i - 1.5);
      R.poly(ctx, [[px - ay * 3, py + ax * 3], [px + ax * L - ay * -1.5, py + ay * L], [px + ay * 3, py - ax * 3]], C.stripe, { lw: 2 });
    }
  }
}
function jetpack(ctx, R, x, y, t, fire) {
  if (fire > 0) {
    for (const ox of [-3, 3]) {
      const L = (8 + Math.sin(t * 0.9 + ox) * 3) * fire;
      ctx.beginPath(); ctx.moveTo(x + ox - 2.5, y + 12); ctx.quadraticCurveTo(x + ox, y + 14 + L * 1.4, x + ox + 2.5, y + 12); ctx.closePath();
      ctx.fillStyle = "#ffb03a"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + ox - 1.3, y + 12); ctx.quadraticCurveTo(x + ox, y + 13 + L * 0.8, x + ox + 1.3, y + 12); ctx.closePath();
      ctx.fillStyle = "#c8ffff"; ctx.fill();
    }
  }
  for (const ox of [-3, 3]) R.poly(ctx, [[x + ox - 2.2, y + 8], [x + ox + 2.2, y + 8], [x + ox + 3, y + 13], [x + ox - 3, y + 13]], "#5d6b80", { lw: 1.8 });
  ctx.beginPath();
  ctx.roundRect(x - 6.5, y - 11, 13, 21, 5);
  const g = ctx.createLinearGradient(x - 6, 0, x + 6, 0);
  g.addColorStop(0, "#e6eef8"); g.addColorStop(1, "#8193ab");
  R.paint(ctx, g, { lw: 2.4 });
  ctx.fillStyle = "rgba(98,243,255," + (0.6 + 0.4 * Math.sin(t * 0.25)) + ")";
  ctx.beginPath(); ctx.arc(x, y - 4, 2.2, 0, TAU); ctx.fill();
}
function shoulderPlate(ctx, R, x, y, s, back) {
  const pts = [[x - s, y + s * 0.3], [x - s * 0.7, y - s * 0.7], [x + s * 0.4, y - s * 0.85], [x + s * 1.05, y - s * 0.1], [x + s * 0.8, y + s * 0.45]];
  const g = ctx.createLinearGradient(x, y - s, x, y + s);
  g.addColorStop(0, back ? "#aebbd0" : "#f0f5fc"); g.addColorStop(1, back ? "#5d6b80" : "#8a9bb4");
  ctx.fillStyle = g; ctx.fill(pBlob(pts));
  ctx.lineWidth = 2.4; ctx.strokeStyle = R.INK; ctx.stroke(pBlob(pts));
  ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.1); ctx.lineTo(x + s * 0.6, y - s * 0.3);
  ctx.strokeStyle = "rgba(98,243,255,0.9)"; ctx.lineWidth = 1.5; ctx.stroke();
}

// Anillos orbitales (FORMA FINAL): mitad trasera / delantera
function rings(ctx, R, cx, cy, t, front) {
  for (let i = 0; i < 2; i++) {
    const rx = 44 + i * 9, ry = 10 + i * 3, rot = i ? 0.42 : -0.28;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.shadowColor = i ? "#9fe8ff" : "#ffe27a"; ctx.shadowBlur = 6;
    ctx.strokeStyle = i ? "rgba(160,232,255,0.85)" : "rgba(255,226,122,0.9)";
    ctx.lineWidth = i ? 1.8 : 2.6;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); ctx.stroke();
    ctx.shadowBlur = 0;
    const a = t * (i ? -0.045 : 0.035) + i * 2;
    if ((Math.sin(a) > 0) === front) {
      const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      R.ellipse(ctx, px, py, i ? 3 : 4, i ? 3 : 4, i ? "#ff8ae0" : "#ffd24a", { lw: 1.6 });
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// modos de dibujo
// ---------------------------------------------------------------------------
// The welcome drives Stitcho's CANONICAL antenna/head/limb rig. F0 stays
// an egg: scaled tiny paws, no imaginary armor, jetpack or orbital rings.
export function stitchoWelcomeRig(pose={},form=0){
 const w=pose.stitchoWelcome;
 const inert={active:false,lean:0,head:0,armA:0,armB:0,legA:0,legB:0,
  bendA:0,bendB:0,lift:0,tail:0,antenna:0,torsoX:1,torsoY:1,
  ear:0,look:0,cheer:0};
 if(!w||w.reduced||pose.reduceMotion||(pose.state||'idle')!=='idle')
  return inert;
 const n=v=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
 const scout=n(w.scout),taunt=n(w.taunt),curl=n(w.curl),
  shock=n(w.shock),swagger=n(w.swagger);
 const dragon=n(w.dragon),chase=n(w.chase),yomi=n(w.yomi),dino=n(w.dino);
 const breath=(n(w.breath)-.5)*2;
 const f=Number.isFinite(form)?Math.max(0,Math.min(4,Math.round(form))):0;
 const rib=[.063,.051,.048,.039,.033][f];
 const baby=f===0?.56:1;
 return {
  active:true,
  // F0 is a living egg with attached very short paws, not a scaled biped.
  // F3 tech visor/jetpack and F4 orbital rings retain native geometry.
  torsoX:Math.max(.91,Math.min(1.09,1+breath*rib-dragon*.020+chase*.022+yomi*.014)),
  torsoY:Math.max(.93,Math.min(1.08,1-breath*rib*.65+dragon*.015-chase*.014)),
  lean:baby*(-.10*scout+.17*taunt-.27*curl-.22*shock+.10*swagger
    +breath*.026+dragon*.14-chase*.105+yomi*.10-dino*.16),
  head:-.16*scout+.19*taunt+.27*curl-.38*shock-.13*swagger
    +breath*.033+dragon*.22-chase*.16+yomi*.20-dino*.25,
  armA:baby*(.30*scout+1.20*taunt-.74*curl+1.66*shock+.96*swagger
    +dragon*.83+chase*.64+yomi*.47+dino*.91),
  armB:baby*(-.47*scout-1.05*taunt+1.18*curl-1.37*shock-.67*swagger
    -dragon*.65-chase*.47+yomi*.39-dino*.78),
  legA:baby*(.12*scout+.18*taunt-.18*curl+.42*shock+.21*swagger
    +dragon*.12+chase*.17+dino*.19),
  legB:baby*(-.10*scout-.15*taunt+.13*curl-.32*shock-.16*swagger
    -dragon*.11-chase*.15-dino*.14),
  bendA:baby*(-2*curl-4*shock+dragon*.65-chase*.35),
  bendB:baby*(3*curl+3*shock-dragon*.56+chase*.30),
  lift:baby*(-2.8*taunt-2.3*swagger-breath*.65+dragon*1.2
    -chase*.90-yomi*.65+dino*1.45),
  tail:n(w.tail),antenna:n(w.antenna),
  ear:breath*.04+dragon*.20+chase*(-.23)+yomi*.18+dino*.30,
  look:dragon*.20-chase*.13+yomi*.14+dino*.15,
  cheer:chase
 };
}

function faceFor(pose, S) {
  const st = pose.state;
  const face = { mood: S.spikes ? "angry" : "normal", mouth: "smirk", ant: "idle", glow: null, plasma: 0, waves: 0, crackle: false, lookUp: false, earFlick: 0 };
  if (st === "run") { face.mouth = "grin"; face.ant = "back"; }
  else if (st === "jump") { face.mouth = "grin"; }
  else if (st === "fall" || st === "glide") { face.mouth = "o"; }
  else if (st === "attack") { face.mood = "angry"; face.mouth = pose.atk > 0.2 ? "roar" : "grin"; face.ant = "back"; }
  else if (st === "hurt") { face.mood = "squint"; face.mouth = "wavy"; face.ant = "limp"; face.earFlick = -0.75; }
  else if (st === "dead") { face.mood = "x"; face.mouth = "tongue"; face.ant = "limp"; face.glow = 0; face.blush = false; }
  else if (st === "victory") { face.mood = "happy"; face.mouth = "laugh"; face.crackle = true; face.glow = 1; }
  else if (st === "dance") { face.mood = "happy"; face.mouth = pose.reduceMotion || Math.floor((pose.stitchoDanceAge || 0) / 24) % 2 ? "grin" : "tongue"; face.ant = "spin"; face.glow = 1.1; face.crackle = true; }
  else if (st === "wall") { face.mouth = "grin"; face.lookUp = true; face.ant = "back"; }
  else if (st === "cast") {
    if (pose.castSlot === 0) { face.mood = "angry"; face.mouth = "roar"; face.ant = "forward"; face.glow = 1.4; face.plasma = pose.cast; }
    else if (pose.castSlot === 2) { face.mood = "angry"; face.mouth = "roar"; face.ant = "up"; face.glow = 1.2; face.waves = pose.cast; }
  }
  if (st === "idle" && pose.flourish > 0) {
    const n = pose.flourishN % 4;
    if (n === 0) { face.mood = "happy"; face.mouth = "tongue"; face.earFlick = Math.sin(pose.t * 0.9) * 0.25; }
    else if (n === 1) { face.mood = "squint"; face.mouth = "tongue"; }
    else if (n === 2) { face.mouth = "grin"; face.ant = "spin"; face.lookUp = true; face.glow = 1; }
    else { face.mouth = "smirk"; face.ant = "forward"; face.crackle = true; face.glow = 1.15; }
  }
  // Stage expressions live in this face, not on a decorative overlay.
  const w=pose.stitchoWelcome;
  if(w&&!w.reduced&&!pose.reduceMotion&&st==='idle'){
    if(w.shock>.18){face.mood="squint";face.mouth="o";face.ant="limp";face.earFlick=-.26*w.shock;face.glow=1.05;}
    else if(w.swagger>.18){face.mood="happy";face.mouth="grin";face.ant="up";face.earFlick=.20*w.swagger;face.glow=.95;}
    else if(w.curl>.18){face.mood="squint";face.mouth="o";face.ant="tuck";face.earFlick=-.12*w.curl;}
    else if(w.taunt>.18){face.mood="happy";face.mouth="tongue";face.ant="forward";face.earFlick=.18*w.taunt;face.glow=.82;}
    else if(w.scout>.18){face.mood="squint";face.mouth="smirk";face.ant="up";face.lookUp=true;face.earFlick=.1*w.scout;}
    else if(w.dragon>.18){face.mood="squint";face.mouth="o";face.ant="back";face.earFlick=.18*w.dragon;}
    else if(w.chase>.18){face.mood="happy";face.mouth="grin";face.ant="forward";face.earFlick=-.17*w.chase;}
    else if(w.yomi>.18){face.mood="normal";face.mouth="o";face.ant="up";face.earFlick=.14*w.yomi;face.lookUp=true;}
    else if(w.dino>.18){face.mood="squint";face.mouth="o";face.ant="tuck";face.earFlick=.25*w.dino;}
    // Tiny independent breathing of the authentic antenna roots, not FX.
    const living=stitchoWelcomeRig(pose,Number(pose.form)||0);
    face.earFlick+=living.ear;
  }
  return face;
}

function drawBiped(ctx, R, pose, f, S, C) {
  const st = pose.state, t = pose.t;
  const face = faceFor(pose, S);
  const welcome=stitchoWelcomeRig(pose,f);
  const hipY = -S.legL - 2;
  let legA = 0, legB = 0, legBendA = 3, legBendB = 3;
  let armA = 0.35, armB = -0.25, bendA = 4, bendB = -3;
  let bob = pose.breath * 1.1, lean = S.lean || 0, headRot = Math.sin(t * 0.03) * 0.05, lift = 0;
  let headDX = 0, headDY = 0, trail = null, scratch = 0, kA = 1, kB = 1;
  const limbCol = C.limb, back = R.darken(limbCol, 0.22);

  if (st === "dance" || pose.stitchoDanceT > 0) {
    const age = pose.reduceMotion ? 0 : Number(pose.stitchoDanceAge) || 0;
    const groove = Math.sin(age * 0.27), counter = Math.cos(age * 0.27);
    legA = 0.35 + groove * 0.48; legB = -0.35 - groove * 0.42;
    legBendA = -3 - Math.max(0, groove) * 8; legBendB = -3 - Math.max(0, -groove) * 8;
    armA = 1.15 + counter * 0.78; armB = -1.15 - counter * 0.78;
    bendA = -4 - Math.max(0, counter) * 5; bendB = 4 + Math.max(0, -counter) * 5;
    bob = -Math.abs(groove) * 4; lean += groove * 0.18; headRot = -groove * 0.2;
    if (!pose.reduceMotion && age % 24 < 5) lift = -4;
    face.mood = "happy"; face.mouth = Math.floor(age / 24) % 2 ? "grin" : "tongue"; face.ant = "spin"; face.glow = 1.1;
  } else if (st === "run") {
    const sw = Math.sin(pose.phase);
    legA = sw * 0.95; legB = -sw * 0.95; legBendA = 5; legBendB = 5;
    armA = -sw * 1.0 + 0.3; armB = sw * 1.0 + 0.1;
    bob = -Math.abs(Math.cos(pose.phase)) * 4; lean += 0.12; headRot = 0.05;
    if (S.egg) { lean += sw * 0.16 - 0.1; bob *= 1.6; }
  } else if (st === "jump") {
    legA = 0.9; legB = 0.4; legBendA = -8; legBendB = -6;
    armA = 1.35; armB = -2.5; headRot = -0.08;
  } else if (st === "fall" || st === "glide") {
    legA = 0.25; legB = -0.35; armA = 1.75; armB = -2.2; bendA = -5; headRot = 0.06;
  } else if (st === "attack") {
    const k = pose.atk;
    if (k < 0.22) { const u = k / 0.22; armA = -0.4 - u * 1.0; armB = -0.5 - u * 1.2; lean -= u * 0.15; headRot = -0.06; }
    else if (k < 0.55) {
      const u = (k - 0.22) / 0.33; armB = -1.7; lean += 0.12 * u; kA = 1.45;
      armA = 2.0 - u * 1.8; trail = { which: "A", from: 2.0, to: armA };
    } else if (k < 0.85) {
      const u = (k - 0.55) / 0.3; armA = 0.3 + u * 0.3; armB = 2.1 - u * 1.8; lean += 0.12; kB = 1.6;
      trail = { which: "B", from: 2.1, to: armB };
    } else { const u = (k - 0.85) / 0.15; armA = 0.6 - u * 0.25; armB = 0.4 - u * 0.6; lean += 0.12 * (1 - u); }
    legA = 0.45; legB = -0.35;
  } else if (st === "cast") {
    if (pose.castSlot === 0) { armA = 1.3; armB = 1.0; lean += 0.1; headRot = 0.05; legA = 0.35; legB = -0.3; }
    else { armA = 1.45 + Math.sin(t * 0.6) * 0.1; armB = -1.85; kA = 1.25; kB = 1.35; headRot = -0.22; legA = 0.4; legB = -0.4; lift = 0; }
  } else if (st === "hurt") {
    armA = 1.25; armB = -2.1; lean -= 0.42; headRot = -0.42; headDX = -5; headDY = 1.5; legA = 0.55; legB = -0.35; legBendA = -4;
  } else if (st === "victory") {
    const hop = Math.abs(Math.sin(t * 0.17));
    lift = -hop * 16;
    legA = 0.3 + hop * 0.5; legB = -0.2 + hop * 0.6; legBendA = -hop * 6; legBendB = -hop * 5;
    armA = 1.5 + Math.sin(t * 0.34) * 0.35; armB = -2.7 - Math.sin(t * 0.34) * 0.3;
    headRot = Math.sin(t * 0.34) * 0.1 - 0.05;
  } else if (st === "wall") {
    const c = Math.sin(t * 0.2);
    armA = 1.75 + c * 0.35; armB = 1.45 - c * 0.35; bendA = -4; bendB = -4;
    legA = 1.2 - c * 0.25; legB = 0.95 + c * 0.25; legBendA = -7; legBendB = -7;
    lean += 0.12; headRot = -0.12; bob = c * 1.5;
  } else if (st === "idle" && pose.flourish > 0) {
    const n = pose.flourishN % 4, k = Math.sin(pose.flourish * Math.PI);
    if (n === 0) { scratch = Math.min(1, k * 2); lean += 0.12 * scratch; headRot = -0.18 * scratch; armA = 0.6; armB = -0.6; }
    else if (n === 1) { headRot = Math.sin(t * 0.25) * 0.14; armA = 1.6; armB = 1.3; bendA = -6; }
    else if (n === 2) { headRot = -0.12; armA = 0.8 + Math.sin(t * 0.3) * 0.2; armB = -0.4; }
    else { lean += 0.09 * k; headRot = -0.08; armA = 1.9 - k * 0.35; armB = -1.55 + k * 0.22; bendA = -4; bendB = 4; }
  }

  // The five beats articulate connected arms, short egg paws, planted
  // feet, torso and head. Inactive in real gameplay and damaged states.
  if(welcome.active){
    lean+=welcome.lean;headRot+=welcome.head;
    armA+=welcome.armA;armB+=welcome.armB;
    legA+=welcome.legA;legB+=welcome.legB;
    bendA+=welcome.bendA;bendB+=welcome.bendB;
    lift+=welcome.lift;
    headDX+=welcome.lean*3+welcome.look*2.1;
  }

  ctx.save();
  if (st === "dead") { ctx.translate(-S.hy * 0.55, -(S.hrx - S.hx) - 1); ctx.rotate(-Math.PI / 2 + 0.06); legA = 0.6; legB = -0.2; armA = 1.7; armB = -1.3; headRot = 0.1; bob = 0; }
  ctx.translate(0, lift);
  // squash/stretch leve: estira al saltar/caer, aplasta al aterrizar
  if (st !== "dead") {
    const land = Math.max(0, Math.min(1, Number(pose.land) || 0));
    const sy = (st === "jump" ? 1.06 : st === "fall" ? 1.03 : 1) - land * 0.08;
    if (sy !== 1) ctx.scale(1 + (1 - sy) * 0.7, sy);
  }

  const hy = hipY + bob;
  // Keep original hip as transform root: the upper anatomy breathes together
  // (egg shell / chest / arms / ears / antennae / visor), shoes stay grounded.
  const upper = (fn) => {
    ctx.save();ctx.translate(0,hy);ctx.rotate(lean);
    if(welcome.active)ctx.scale(welcome.torsoX,welcome.torsoY);
    ctx.translate(0,-hipY);fn();ctx.restore();
  };
  const legX = S.egg ? 8 : S.brx * 0.45;
  const shF = S.egg ? [S.hx + S.hrx * 0.5, S.hy + S.hry * 0.62] : [S.bx + S.brx * 0.25, S.by - S.bry * 0.2];
  const shB = S.egg ? [S.hx - S.hrx * 0.55, S.hy + S.hry * 0.5] : [S.bx - S.brx * 0.3, S.by - S.bry * 0.3];
  const hs = S.hand;
  const drawTrail = (sh, len) => {
    if (!trail) return;
    ctx.save();
    const a0 = Math.PI / 2 - trail.from, a1 = Math.PI / 2 - trail.to; // swing → canvas
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.75 - i * 0.18;
      ctx.strokeStyle = i === 1 ? "#ffffff" : CYAN; ctx.lineWidth = 2.4 - i * 0.4;
      ctx.beginPath(); ctx.arc(sh[0], sh[1], len + hs * 1.6 + i * 3.5, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
    }
    ctx.restore();
  };

  // --- capa trasera
  const scratchLeg = () => upper(() => {
      const ex = S.hx - S.hrx * 0.62 + Math.sin(t * 1.1) * 2.5 * scratch, ey = S.hy - S.hry * 0.2 + Math.cos(t * 1.1) * 1.5;
      R.limb(ctx, legX * 0.3, hipY, -legX - 20, (hipY + ey) / 2 + 6, ex, ey, S.legW * 0.9, limbCol, { hand: false, lw: 2.6 });
      foot(ctx, R, ex, ey, S.legW * 0.9, limbCol);
    });
  leg(ctx, R, -legX * (scratch > 0 ? 0.3 : 1), hy, S.legL, scratch > 0 ? 0 : legB, legBendB, S.legW, back);
  upper(() => {
    if (!S.egg) tailPart(ctx, R, S.bx - S.brx * 0.85, S.by + S.bry * 0.45, Math.PI * 1.08, 10 + f, 5.5, C.body, t, pose, 0.5 + 0.5 * Math.sin(t * 0.14));
    else tailPart(ctx, R, S.hx - S.hrx * 0.9, S.hy + S.hry * 0.6, Math.PI * 1.05, 7, 4.5, C.body, t, pose, 0.5 + 0.5 * Math.sin(t * 0.14));
    if (S.tech) jetpack(ctx, R, S.bx - S.brx - 3, S.by - S.bry * 0.25, t, pose.air || st === "victory" ? 1 : 0.35);
    if (!(trail && trail.which === "B")) arm(ctx, R, shB[0], shB[1], S.armL * kB, armB, bendB, S.armW, back, hs * 0.95, S.bigClaw);
    if (S.tech) shoulderPlate(ctx, R, shB[0], shB[1] - 1, 6.5, true);
    // brazos extra: el trasero sale hacia atrás del torso para no quedar tapado
    if (S.extraArms) arm(ctx, R, shB[0] - S.brx * 0.45, shB[1] + S.bry * 0.6, S.armL * 0.88, armB * 0.5 - 0.95, bendB, S.armW * 0.9, R.darken(limbCol, 0.3), hs * 0.9, true);
    if (!S.egg) drawBody(ctx, R, f, S, C, S.bx, S.by, S.brx, S.bry, t, false);
  });
  if (scratch <= 0) leg(ctx, R, legX * (S.egg ? 1 : 0.5), hy, S.legL, legA, legBendA, S.legW, limbCol);

  upper(() => {
    drawHead(ctx, R, pose, f, S, C, S.hx + headDX, S.hy + headDY, headRot - lean * 0.6, face);
    if (trail && trail.which === "B") { drawTrail(shB, S.armL * kB); arm(ctx, R, shB[0], shB[1], S.armL * kB, armB, bendB, S.armW, back, hs * 0.95, S.bigClaw); }
    if (trail && trail.which === "A") drawTrail(shF, S.armL * kA);
    // brazo extra del lado de cámara: delante del cuerpo y desplazado hacia fuera
    if (S.extraArms) arm(ctx, R, shF[0] + S.brx * 0.35, shF[1] + S.bry * 0.7, S.armL * 0.88, (st === "attack" ? -0.35 : armA * 0.5 + 0.95), (st === "attack" ? -4 : bendA), S.armW * 0.9, R.lighten(limbCol, 0.08), hs * 0.9, true);
    arm(ctx, R, shF[0], shF[1], S.armL * kA, armA, bendA, S.armW, limbCol, hs, S.bigClaw);
    if (S.tech) shoulderPlate(ctx, R, shF[0], shF[1] - 1, 7, false);
  });
  if (scratch > 0) scratchLeg();
  ctx.restore();
}

function drawGallop(ctx, R, pose, f, S, C) {
  const t = pose.t, ph = pose.phase;
  const face = faceFor(pose, S);
  face.ant = "back";
  const s = Math.sin(ph), bob = -Math.abs(Math.cos(ph)) * 5;
  const limbCol = C.limb, back = R.darken(limbCol, 0.22);
  const legL = 24, w = S.legW;
  const hipB = [-16, -26 + bob], hipF = [13, -27 + bob];
  const bx = -2, by = -31 + bob, rx = 22 + s * 2.5, ry = 12.5;

  leg(ctx, R, hipB[0] - 3, hipB[1], legL, -s * 0.9 - 0.25, 4, w, back);
  // brazos extra al galope: par central con fase cruzada (no desaparecen)
  if (S.extraArms) arm(ctx, R, bx + 1, by + 6, legL - 6, -s * 0.8 + 0.5, -3, w * 0.8, R.darken(limbCol, 0.3), S.hand * 0.75, true);
  arm(ctx, R, hipF[0] - 3, hipF[1], legL - 1, s * 0.95 + 0.25, -4, w * 0.9, back, S.hand * 0.8, S.bigClaw);
  tailPart(ctx, R, bx - rx * 0.95, by - 2, Math.PI * 1.15, 11, 5.5, C.body, t, pose, 1);
  if (S.tech) jetpack(ctx, R, bx - rx * 0.3, by - ry - 6, t, 1);
  drawBody(ctx, R, f, S, C, bx, by, rx, ry, t, true);
  leg(ctx, R, hipB[0], hipB[1], legL, -s * 0.9, 4, w, limbCol);
  if (S.extraArms) arm(ctx, R, bx + 4, by + 7, legL - 6, s * 0.8 + 0.3, -3, w * 0.8, R.lighten(limbCol, 0.08), S.hand * 0.78, true);
  drawHead(ctx, R, pose, f, S, C, bx + rx + 8, by - 14, 0.12, face);
  arm(ctx, R, hipF[0], hipF[1], legL - 1, s * 0.95, -4, w, limbCol, S.hand * 0.85, S.bigClaw);
  if (S.tech) shoulderPlate(ctx, R, hipF[0], hipF[1] - 2, 7, false);
}

function drawBall(ctx, R, pose, f, S, C, chaos = false) {
  const t = pose.t, r = S.egg ? 22 : 20 + f * 1.2;
  const moving = pose.state === "run" || pose.speed > 0.1;
  const inRoll = pose.move === "roll";
  const bounceCount = Math.max(0, Number(pose.stitchoRollBounces) || 0);
  const rot = pose.reduceMotion ? 0 : t * (inRoll ? 0.82 : moving ? 0.35 : 0.5) + bounceCount * 0.5;
  const cy = -r - (pose.state === "cast" ? Math.abs(Math.sin(pose.cast * Math.PI)) * 6 : 0);
  // estela
  ctx.save();
  ctx.strokeStyle = chaos ? "rgba(186,140,255,0.9)" : "rgba(160,230,255,0.7)"; ctx.lineWidth = chaos ? 2.8 : 2; ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(0, cy, r + 5 + i * 4, Math.PI * 0.7 + i * 0.1, Math.PI * 1.25 - i * 0.05); ctx.stroke();
  }
  ctx.restore();
  const bp = pEll(0, cy, r, r);
  skin(ctx, R, bp, f, 0, cy, r, C.body, t, () => {
    ctx.save();
    ctx.translate(0, cy); ctx.rotate(rot);
    ctx.strokeStyle = chaos ? "#d3a6ff" : C.stripe; ctx.lineWidth = chaos ? 4.2 : 3.6; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, r * (0.45 + i * 0.2), -0.7, 0.7); ctx.stroke(); }
    // cola y bulbos girando con la bola
    const glow = chaos ? "#d6a8ff" : CYAN;
    R.ellipse(ctx, -r * 0.55, r * 0.35, 3, 3, glow, { lw: 1.6 });
    R.ellipse(ctx, -r * 0.2, -r * 0.7, 2.6, 2.6, glow, { lw: 1.4 });
    R.ellipse(ctx, r * 0.1, -r * 0.78, 2.6, 2.6, glow, { lw: 1.4 });
    // garras
    for (let i = 0; i < 3; i++) {
      const a = Math.PI * 0.35 + i * 0.25;
      ctx.fillStyle = CLAW;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, 1.8, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "rgba(20,10,60,0.2)";
    ctx.beginPath(); ctx.ellipse(r * 0.3, cy + r * 0.5, r, r * 0.6, 0, 0, TAU); ctx.fill();
  });
  R.shine(ctx, -r * 0.35, cy - r * 0.5, r * 0.3, r * 0.14, 0.55);
  if (chaos) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const a = t * 0.34 + i * (TAU / 4);
      const x = Math.cos(a) * (r + 6), y = cy + Math.sin(a) * (r + 6);
      zap(ctx, x, y, a + Math.PI / 2, 8 + (i % 2) * 3, i % 2 ? CYAN : "#d6a8ff", 2.2);
    }
    ctx.restore();
  }
  if (inRoll && bounceCount > 0) {
    ctx.save();
    ctx.globalAlpha = pose.reduceMotion ? 0.5 : 0.7;
    ctx.strokeStyle = bounceCount % 2 ? CYAN : "#d6a8ff";
    ctx.lineWidth = 1.8;
    for (let i = 0; i < Math.min(3, bounceCount); i++) {
      const a = -Math.PI * 0.8 + i * 0.34;
      ctx.beginPath(); ctx.arc(0, cy, r + 7 + i * 4, a, a + 0.32); ctx.stroke();
    }
    ctx.restore();
  }
  // ojo asomando
  const ea = rot % TAU, show = Math.cos(ea);
  if (show > 0.2) alienEye(ctx, R, Math.sin(ea) * r * 0.55, cy - Math.cos(ea) * r * 0.1, 3.4 * show, 4.2, pose, chaos ? "angry" : "normal");
}


function drawSoulSeams(ctx, pose, f, front = false) {
  const move = pose.move || "";
  const wall = pose.state === "wall" || move === "climb";
  const roll = move === "roll";
  const chaos = move === "chaos";
  const dance = move === "stitcho-dance" || pose.state === "dance";
  const victory = pose.state === "victory";
  const peek = pose.state === "idle" && pose.flourish > 0 && (pose.flourishN % 4) === 3;
  if (!wall && !roll && !chaos && !dance && !victory && !peek) return;

  const t = Number(pose.t) || 0;
  const col = f >= 4 ? "#f2b3ff" : "#67ddff";
  const hot = f >= 4 ? "#fff2a8" : "#dffcff";
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (!front && (wall || roll || chaos || dance)) {
    ctx.strokeStyle = col;
    ctx.lineWidth = chaos || dance ? 3.2 : 2.1;
    ctx.globalAlpha = chaos || dance ? .72 : .48;
    const baseX = wall ? -30 : -22;
    const baseY = wall ? -50 : -30;
    for (let i=0;i<(chaos || dance?7:5);i++) {
      const y = baseY + i * (wall ? 13 : 9);
      const x = baseX - i * (wall ? 1.5 : 6);
      ctx.beginPath();
      ctx.moveTo(x-8,y-3);
      ctx.lineTo(x-2,y+2);
      ctx.lineTo(x+5,y-2);
      ctx.stroke();
    }
  }

  if (front && dance) {
    const pulse = pose.reduceMotion ? .55 : .35 + .35 * Math.sin(t * .26);
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = hot; ctx.lineWidth = 2.2;
    for (let i = 0; i < 3; i++) {
      const a = pose.reduceMotion ? i * TAU / 3 : t * .08 + i * TAU / 3;
      const x = Math.cos(a) * 28, y = -45 + Math.sin(a) * 12;
      ctx.beginPath(); ctx.moveTo(x - 4, y - 3); ctx.lineTo(x, y + 2); ctx.lineTo(x + 4, y - 2); ctx.stroke();
    }
  }

  if (peek) {
    const k = Math.sin(Math.max(0,Math.min(1,pose.flourish))*Math.PI);
    const x = 34, y = -52, h = 26*k;
    ctx.globalAlpha = .25 + .55*k;
    ctx.fillStyle = "rgba(7,4,20,.88)";
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.ellipse(x,y,7+h*.12,Math.max(2,h),-.08,0,TAU);
    ctx.fill();ctx.stroke();
    if(k>.42){
      ctx.fillStyle = hot;
      ctx.beginPath();ctx.ellipse(x+1,y,2.4,4.2*k,0,0,TAU);ctx.fill();
    }
    ctx.strokeStyle = hot;
    ctx.globalAlpha = .56*k;
    for(let i=-2;i<=2;i++){
      const yy=y+i*6;
      ctx.beginPath();ctx.moveTo(x-13,yy);ctx.lineTo(x-8,yy+2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+8,yy-1);ctx.lineTo(x+13,yy+1);ctx.stroke();
    }
  }

  if (front && victory) {
    const pulse = .5 + .5*Math.sin(t*.16);
    ctx.globalAlpha = .34 + .24*pulse;
    ctx.strokeStyle = hot;
    ctx.lineWidth = 1.7;
    for(let i=0;i<4;i++){
      const a=t*.025+i*TAU/4;
      const x=Math.cos(a)*30,y=-46+Math.sin(a)*14;
      ctx.beginPath();ctx.moveTo(x-5,y-3);ctx.lineTo(x,y+2);ctx.lineTo(x+5,y-2);ctx.stroke();
    }
  }

  ctx.restore();
}


const STITCHO_MOTION_MEDIA=typeof window!=='undefined'&&typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
export function stitchoFootwork(pose={}){
 if(pose.reduceMotion||STITCHO_MOTION_MEDIA?.matches||pose.air||['roll','chaos','climb'].includes(pose.move)||!['idle','run'].includes(pose.state||'idle'))return null;
 const unit=v=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):0;
 const landing=unit(pose.land),turn=pose.state==='run'?unit(pose.turnPulse):0,brake=pose.state==='run'?unit(pose.brake):0,running=pose.state==='run'?unit(pose.speed):0;
 return landing>.02||turn>.02||brake>.02||running>.3?{landing,turn,brake,running}:null;
}
function drawStitchoFootwork(ctx,pose,f,t){
 const m=stitchoFootwork(pose);if(!m)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';const col=f===4?'#bfa5ff':'#8ae9ff';ctx.strokeStyle=col;ctx.lineWidth=f===0?1.5:1.8;
 if(m.running>.3)for(let i=0;i<3;i++){const k=((t*.065+i/3)%1+1)%1,x=-15-k*25,y=-3-k*5;ctx.globalAlpha=.4*(1-k)*m.running;ctx.beginPath();ctx.moveTo(x-2,y-2);ctx.lineTo(x+2,y+1);ctx.lineTo(x+5,y-2);ctx.stroke();}
 if(m.landing>.02){ctx.globalAlpha=m.landing*.65;const spread=12+(1-m.landing)*18;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*6,-1);ctx.lineTo(side*spread,-3);ctx.lineTo(side*(spread+4),-7);ctx.stroke();}for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-6+i*6,-2);ctx.lineTo(-9+i*6,-7-(1-m.landing)*4);ctx.stroke();}}
 if(m.turn>.02){ctx.globalAlpha=m.turn*.6;for(let i=0;i<3;i++){const a=1.7+i*.4;ctx.beginPath();ctx.arc(-4,-11,15+f,a,a+.23);ctx.stroke();}}
 if(m.brake>.02){ctx.globalAlpha=m.brake*.55;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-13-i*5,-1);ctx.lineTo(-23-i*5,-3-i*2);ctx.stroke();}}
 ctx.restore();
}

function draw(ctx, pose, R) {
  const f = pose.form, S = P[f], C = PAL[f], st = pose.state;
  const dance = pose.move === "stitcho-dance" || pose.stitchoDanceT > 0;
  const chaos = !dance && (pose.move === "chaos" || (st === "cast" && pose.castSlot === 2));
  const roll = !dance && (pose.move === "roll" || (st === "cast" && pose.castSlot === 1) || chaos);
  const gallop = f >= 2 && st === "run" && !roll;
  const pr = { ...pose };
  if (dance) pr.state = "dance";
  if(pose.stitchoWelcome&&!pose.stitchoWelcome.reduced&&st==="idle"){
    pr.sway=(Number(pr.sway)||0)+stitchoWelcomeRig(pr,f).tail*.54;
  }
  if (pose.move === "climb" && st !== "dead" && st !== "hurt") pr.state = "wall";
  const ringY = (roll ? -24 : gallop ? -34 : S.by - 6) - (f===4?(pr.stitchoWelcome?.swagger||0)*2:0);
  ctx.save();
  drawStitchoFootwork(ctx,pr,f,pose.t||0);
  drawSoulSeams(ctx, pr, f, false);
  if (f === 4) rings(ctx, R, 0, ringY, pose.t, false);
  // los anillos van siempre detrás del cuerpo (misma capa en todas las poses)
  if (f === 4) rings(ctx, R, 0, ringY, pose.t, true);
  if (roll && st !== "dead" && st !== "hurt") drawBall(ctx, R, pr, f, S, C, chaos);
  else if (gallop) drawGallop(ctx, R, pr, f, S, C);
  else drawBiped(ctx, R, pr, f, S, C);
  drawSoulSeams(ctx, pr, f, true);
  ctx.restore();
}

export default { id: "stitcho", draw };
