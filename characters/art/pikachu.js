// ============================================================================
// CHISPÍN · "ajolote-hurón eléctrico" original
// Cuerpo redondo amarillo sol con barriga blanca, orejas cortas redondeadas
// (interior turquesa), 3 branquias plumosas por lado que brillan al cargarse,
// cola larga en MUELLE con punta-pila turquesa, marcas "+" en las mejillas.
// Corre a SALTITOS con los dos pies juntos.
// pose.move: "spark" (corre rodeado de chispas).
// ============================================================================

const TAU = Math.PI * 2;
const TQ = "#27d8c8";
const BOLT = "#fff6a0";

const PAL = [
  { body: "#fff06a", belly: "#fffdf2", gill: "#3fe6d4", glow: "#9ffff4", inner: "#39d7c9" },
  { body: "#ffd83a", belly: "#fffaf0", gill: "#2fdcc9", glow: "#9ffff4", inner: "#27cbbd" },
  { body: "#ffa024", belly: "#fff1dc", gill: "#27d8c8", glow: "#b6fff6", inner: "#20bfb2" },
  { body: "#ffe45a", belly: "#fffbef", gill: "#34e0cf", glow: "#a8fff5", inner: "#27cbbd" },
  { body: "#fff4d2", belly: "#ffffff", gill: "#3aa8ff", glow: "#bfe6ff", inner: "#3aa8ff" },
];

const P = [
  { hr: 27, hx: 2, hy: -41, brx: 17, bry: 14, bx: 0, by: -17, legW: 8, armL: 7, armW: 6, gillL: 9, gillW: 3, ear: 7, eye: 8.4, tail: 17, coil: 4, turns: 2.5 },
  { hr: 24, hx: 3, hy: -60, brx: 19, bry: 20, bx: -1, by: -27, legW: 9, armL: 11, armW: 6.5, gillL: 13, gillW: 3.4, ear: 8.5, eye: 8.2, tail: 27, coil: 6, turns: 2.5 },
  { hr: 21, hx: 4, hy: -74, brx: 14, bry: 24, bx: 0, by: -37, legW: 8, armL: 15, armW: 6, gillL: 15, gillW: 3.4, ear: 7.5, eye: 7.6, tail: 33, coil: 5, turns: 3, crest: true },
  { hr: 24, hx: 7, hy: -60, brx: 30, bry: 27, bx: -2, by: -29, legW: 10, armL: 10, armW: 7, gillL: 21, gillW: 4.4, ear: 8.5, eye: 8, tail: 30, coil: 6, turns: 2.5, fat: true, clouds: true },
  { hr: 23, hx: 4, hy: -70, brx: 18, bry: 23, bx: -1, by: -33, legW: 9, armL: 13, armW: 6.5, gillL: 17, gillW: 3.8, ear: 8.5, eye: 8, tail: 34, coil: 5.5, turns: 3, god: true },
];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function pEll(x, y, rx, ry, rot = 0) {
  const p = new Path2D();
  p.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU);
  return p;
}
function godFill(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.05, x, y, r * 1.2);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, "#fff1c4"); g.addColorStop(1, "#f2c65a");
  return g;
}
function skin(ctx, R, path, f, x, y, r, col, extra) {
  ctx.fillStyle = f === 4 ? godFill(ctx, x, y, r) : R.volume(ctx, x, y, r, col);
  ctx.fill(path);
  if (extra) { ctx.save(); ctx.clip(path); extra(); ctx.restore(); }
  ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke(path);
}
/** Rayo en zigzag entre dos puntos (determinista por semilla). */
function bolt(ctx, x1, y1, x2, y2, seed, col, w, glow) {
  const n = 5, dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
  const px = -dy / d, py = dx / d;
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 1; i < n; i++) {
    const k = i / n, o = Math.sin(seed * 12.9 + i * 78.2) * d * 0.14;
    ctx.lineTo(x1 + dx * k + px * o, y1 + dy * k + py * o);
  }
  ctx.lineTo(x2, y2);
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 8; }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = w * 0.4; ctx.stroke();
  ctx.restore();
}
function sparkBurst(ctx, x, y, r, t, n, col) {
  for (let i = 0; i < n; i++) {
    const a = i * (TAU / n) + t * 0.2 + Math.sin(t * 0.5 + i) * 0.3;
    const r0 = r * (0.7 + 0.3 * Math.sin(t * 0.7 + i * 2));
    bolt(ctx, x + Math.cos(a) * r0 * 0.55, y + Math.sin(a) * r0 * 0.55, x + Math.cos(a) * r0, y + Math.sin(a) * r0, i + Math.floor(t / 3), col, 1.6, false);
  }
}
function cloud(ctx, R, x, y, s, col, dark) {
  const p = new Path2D();
  p.arc(x - s * 0.8, y + s * 0.15, s * 0.6, 0, TAU);
  p.moveTo(x + s * 0.85 + s * 0.65, y + s * 0.1);
  p.arc(x + s * 0.85, y + s * 0.1, s * 0.65, 0, TAU);
  p.moveTo(x + s * 0.95, y - s * 0.25);
  p.arc(x, y - s * 0.25, s * 0.95, 0, TAU);
  ctx.lineWidth = 4; ctx.strokeStyle = R.INK; ctx.stroke(p);
  const g = ctx.createLinearGradient(x, y - s, x, y + s);
  g.addColorStop(0, dark ? "#8f97c8" : "#ffffff"); g.addColorStop(1, dark ? "#4c5288" : "#c9d8ea");
  ctx.fillStyle = g; ctx.fill(p);
}

// ---------------------------------------------------------------------------
// partes
// ---------------------------------------------------------------------------
/** Branquia plumosa: tallo curvo + flecos. */
function gill(ctx, R, x, y, ang, len, w, col, glowCol, charge, t, i) {
  const bend = Math.sin(t * 0.12 + i * 0.9) * 0.25;
  const pts = [];
  const n = 5;
  let a = ang, px = x, py = y;
  for (let k = 0; k <= n; k++) {
    pts.push([px, py, a]);
    a += bend / n + 0.06;
    px += Math.cos(a) * len / n; py += Math.sin(a) * len / n;
  }
  const fr = new Path2D();
  for (let k = 1; k <= n; k++) {
    const [qx, qy, qa] = pts[k], L = w * (0.55 + (k / n) * 0.4) * (k === n ? 0.6 : 1);
    for (const sd of [-1, 1]) {
      fr.moveTo(qx, qy);
      fr.lineTo(qx + Math.cos(qa + sd * 0.9) * L, qy + Math.sin(qa + sd * 0.9) * L);
    }
  }
  const stem = new Path2D();
  stem.moveTo(pts[0][0], pts[0][1]);
  for (let k = 1; k <= n; k++) stem.lineTo(pts[k][0], pts[k][1]);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = R.INK;
  ctx.lineWidth = w * 0.6 + 3; ctx.stroke(fr);
  ctx.lineWidth = w + 3.4; ctx.stroke(stem);
  const c = charge > 0.05 ? R.mix(col, glowCol, Math.min(1, charge)) : col;
  ctx.save();
  if (charge > 0.3) { ctx.shadowColor = glowCol; ctx.shadowBlur = 6 * charge; }
  ctx.strokeStyle = c;
  ctx.lineWidth = w * 0.6; ctx.stroke(fr);
  ctx.lineWidth = w; ctx.stroke(stem);
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = w * 0.3; ctx.stroke(stem);
}

/** Cola en muelle con punta de pila. Devuelve la punta. */
function springTail(ctx, R, x, y, axis, len, amp, turns, col, f, t, glow) {
  const N = Math.round(turns * 11);
  const ax = Math.cos(axis), ay = Math.sin(axis), nx = -ay, ny = ax;
  const pts = [];
  for (let j = 0; j <= N; j++) {
    const u = j / N, th = u * turns * TAU;
    const a = amp * (0.5 + 0.4 * u);
    const along = u * len + (1 - Math.cos(th)) * a * 0.35;
    const side = Math.sin(th) * a + Math.sin(t * 0.1 + u * 3) * u * 2;
    pts.push([x + ax * along + nx * side, y + ay * along + ny * side]);
  }
  ctx.lineCap = "round";
  const w = f === 3 ? 6 : 5.2;
  const base = f === 4 ? "#f4d27a" : R.darken(col, 0.05);
  for (let j = 0; j < N; j++) {
    ctx.beginPath(); ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(pts[j + 1][0], pts[j + 1][1]);
    ctx.strokeStyle = R.INK; ctx.lineWidth = w + 2.8; ctx.stroke();
    const th = (j / N) * turns * TAU;
    ctx.strokeStyle = Math.cos(th) > 0 ? R.lighten(base, 0.15) : R.darken(base, 0.12);
    ctx.lineWidth = w; ctx.stroke();
  }
  // punta-pila
  const [ex, ey] = pts[N];
  ctx.save();
  ctx.translate(ex, ey); ctx.rotate(axis);
  if (glow > 0.05) {
    const g = ctx.createRadialGradient(6, 0, 0, 6, 0, 14 + glow * 6);
    g.addColorStop(0, "rgba(160,255,245," + (0.8 * glow) + ")"); g.addColorStop(1, "rgba(160,255,245,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(6, 0, 14 + glow * 6, 0, TAU); ctx.fill();
  }
  ctx.beginPath(); ctx.roundRect(0, -5, 12, 10, 3.5);
  const bg = ctx.createLinearGradient(0, -5, 0, 5);
  const bc = f === 4 ? "#6cc4ff" : TQ;
  bg.addColorStop(0, R.lighten(bc, 0.45)); bg.addColorStop(1, R.darken(bc, 0.2));
  R.paint(ctx, bg, { lw: 2.4 });
  ctx.fillStyle = "#ffffff"; ctx.fillRect(3.5, -4.2, 2, 8.4);
  ctx.beginPath(); ctx.roundRect(12, -2.5, 3.5, 5, 1.2); R.paint(ctx, "#e8f4ff", { lw: 1.8 });
  ctx.restore();
  return [ex + Math.cos(axis) * 14, ey + Math.sin(axis) * 14];
}

function ear(ctx, R, x, y, s, ang, col, inner, back) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  const p = new Path2D();
  p.moveTo(-s * 0.85, s * 0.4);
  p.bezierCurveTo(-s * 1.05, -s * 0.9, s * 1.05, -s * 0.9, s * 0.85, s * 0.4);
  p.closePath();
  ctx.fillStyle = back ? R.darken(col, 0.12) : col; ctx.fill(p);
  ctx.lineWidth = 2.6; ctx.strokeStyle = R.INK; ctx.stroke(p);
  ctx.beginPath(); ctx.ellipse(0, -s * 0.05, s * 0.45, s * 0.42, 0, 0, TAU);
  ctx.fillStyle = back ? R.darken(inner, 0.2) : inner; ctx.fill();
  ctx.restore();
}

function plusMark(ctx, R, x, y, s, col) {
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
  ctx.strokeStyle = R.darken(col, 0.35); ctx.lineWidth = 3.4; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
}

function paw(ctx, R, x1, y1, x2, y2, w, col, bend) {
  const mx = (x1 + x2) / 2 + (bend || 0), my = (y1 + y2) / 2;
  R.limb(ctx, x1, y1, mx, my, x2, y2, w, col, { hand: w * 0.7, lw: 2.6 });
}
function footOval(ctx, R, x, y, w, col, rot) {
  R.ellipse(ctx, x + w * 0.2, y, w * 0.85, w * 0.5, col, { lw: 2.6, rot: rot || 0 });
  ctx.strokeStyle = R.alpha(R.INK, 0.6); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x + w * 0.55, y - w * 0.15); ctx.lineTo(x + w * 0.55, y + w * 0.3);
  ctx.moveTo(x + w * 0.8, y - w * 0.12); ctx.lineTo(x + w * 0.8, y + w * 0.3); ctx.stroke();
}

// ---------------------------------------------------------------------------
// figura
// ---------------------------------------------------------------------------
function figure(ctx, R, pose, f, S, C, o) {
  const t = pose.t;
  const hr = S.hr;
  const hipY = S.by + S.bry * 0.72;

  // --- pies juntos (salto) / patitas
  const back = R.darken(C.body, 0.14);
  const footY = o.footY;
  // cola (detrás de todo)
  const tailBase = [S.bx - S.brx * 0.85, S.by + S.bry * 0.35];
  const drawTail = () => springTail(ctx, R, tailBase[0], tailBase[1], o.tailAxis, S.tail * o.tailLen, S.coil * o.tailAmp, S.turns, C.body, f, t, o.tailGlow);
  let tip = o.whip > 0 ? null : drawTail();

  // pierna trasera
  paw(ctx, R, S.bx - S.brx * 0.25, hipY, S.bx - S.brx * 0.25 + o.footX - 3, footY - 3, S.legW, back, o.legBend);
  footOval(ctx, R, S.bx - S.brx * 0.25 + o.footX - 4, footY - S.legW * 0.4, S.legW * 0.95, back);
  // brazo trasero
  const shB = [S.bx - S.brx * 0.15, S.by - S.bry * 0.45];
  const ae = [shB[0] + Math.sin(o.armB) * S.armL, shB[1] + Math.cos(o.armB) * S.armL];
  paw(ctx, R, shB[0], shB[1], ae[0], ae[1], S.armW, back, 2);

  // cuerpo
  const bp = pEll(S.bx, S.by, S.brx, S.bry);
  skin(ctx, R, bp, f, S.bx, S.by, Math.max(S.brx, S.bry), C.body, () => {
    ctx.fillStyle = C.belly;
    ctx.beginPath(); ctx.ellipse(S.bx + S.brx * 0.35, S.by + S.bry * 0.15, S.brx * 0.62, S.bry * 0.72, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(120,60,0,0.14)";
    ctx.beginPath(); ctx.ellipse(S.bx + S.brx * 0.2, S.by + S.bry * 1.05, S.brx * 1.1, S.bry * 0.45, 0, 0, TAU); ctx.fill();
    if (f === 2) {
      // rayas de voltaje en el lomo
      ctx.strokeStyle = "rgba(160,70,0,0.55)"; ctx.lineWidth = 2.2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(S.bx - S.brx * 1.1, S.by - 8 + i * 8); ctx.lineTo(S.bx - S.brx * 0.6, S.by - 5 + i * 8); ctx.lineTo(S.bx - S.brx * 0.75, S.by - 2 + i * 8); ctx.stroke(); }
    }
  });
  R.shine(ctx, S.bx - S.brx * 0.35, S.by - S.bry * 0.5, S.brx * 0.2, S.bry * 0.1, 0.4);

  // pierna delantera
  paw(ctx, R, S.bx + S.brx * 0.3, hipY, S.bx + S.brx * 0.3 + o.footX, footY - 3, S.legW, C.body, o.legBend);
  footOval(ctx, R, S.bx + S.brx * 0.3 + o.footX, footY - S.legW * 0.4, S.legW, C.body);

  // --- cabeza
  ctx.save();
  ctx.translate(S.hx + o.headDX, S.hy + o.headDY);
  ctx.rotate(o.headRot);
  const gc = C.gill, gg = C.glow, ch = o.charge, gL = S.gillL * o.gillK, gW = S.gillW;
  // branquias lejanas (detrás)
  const flare = o.gillFlare;
  if (S.crest) {
    for (let i = 0; i < 3; i++) {
      const a = -1.75 - i * 0.42;
      gill(ctx, R, Math.cos(a) * hr * 0.8, Math.sin(a) * hr * 0.8, a - 0.55 - flare * 0.2 + pose.sway * 0.2, gL * (1.15 - i * 0.12), gW, R.darken(gc, 0.12), gg, ch, t, i + 3);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const a = -1.95 - i * (0.42 + flare * 0.15) + pose.sway * 0.25;
      gill(ctx, R, -hr * 0.2 - i * 3, -hr * 0.62 + i * 2.5, a, gL * (i === 1 ? 0.95 : 0.8), gW * 0.9, R.darken(gc, 0.16), gg, ch, t, i + 3);
    }
  }
  // oreja trasera
  ear(ctx, R, -hr * 0.3, -hr * 0.86, S.ear, -0.35 + o.earA, C.body, C.inner, true);
  // cabeza
  const hp = pEll(0, 0, hr * 1.05, hr * 0.94);
  skin(ctx, R, hp, f, 0, 0, hr, C.body, () => {
    ctx.fillStyle = R.alpha(C.belly, 0.8);
    ctx.beginPath(); ctx.ellipse(hr * 0.5, hr * 0.42, hr * 0.55, hr * 0.38, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(120,60,0,0.12)";
    ctx.beginPath(); ctx.ellipse(-hr * 0.3, hr * 0.9, hr * 1.1, hr * 0.35, 0, 0, TAU); ctx.fill();
  });
  R.shine(ctx, -hr * 0.3, -hr * 0.55, hr * 0.28, hr * 0.14, 0.5);
  // oreja delantera
  ear(ctx, R, hr * 0.35, -hr * 0.82, S.ear * 1.05, 0.3 + o.earA * 0.8, C.body, C.inner, false);

  // cara
  const ey = -hr * 0.08;
  if (o.eyes === "swirl") {
    for (const [ex, r] of [[hr * 0.1, hr * 0.2], [hr * 0.6, hr * 0.22]]) {
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) { const a = k * 0.8, rr = (k / 16) * r; k ? ctx.lineTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr) : ctx.moveTo(ex, ey); }
      ctx.strokeStyle = R.INK; ctx.lineWidth = 2; ctx.stroke();
    }
  } else if (o.eyes === "squeeze") {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2.6; ctx.lineCap = "round";
    for (const ex of [hr * 0.1, hr * 0.6]) {
      ctx.beginPath(); ctx.moveTo(ex - 4, ey - 3); ctx.lineTo(ex + 2, ey); ctx.lineTo(ex - 4, ey + 3); ctx.stroke();
    }
  } else {
    const iris = f === 4 ? "#2a7bd8" : "#16808a";
    R.eye(ctx, hr * 0.08, ey, S.eye * 0.9, pose, { iris, mood: o.eyes });
    R.eye(ctx, hr * 0.6, ey + 0.5, S.eye, pose, { iris, mood: o.eyes });
  }
  // mejillas "+"
  if (o.puff > 0) {
    const pr = hr * 0.3 * o.puff;
    R.ellipse(ctx, hr * 0.78, hr * 0.38, pr, pr * 0.9, C.body, { lw: 2.4 });
    R.ellipse(ctx, -hr * 0.12, hr * 0.38, pr * 0.8, pr * 0.72, C.body, { lw: 2.2 });
  }
  const pc = ch > 0.3 ? C.glow : C.inner;
  plusMark(ctx, R, hr * 0.9, hr * 0.4, 2.6, pc);
  plusMark(ctx, R, -hr * 0.18, hr * 0.36, 2.2, pc);
  // boca
  if (o.puff > 0.3) R.mouth(ctx, hr * 0.4, hr * 0.42, hr * 0.2, "flat");
  else R.mouth(ctx, hr * 0.38, hr * 0.34, hr * 0.36, o.mouth, { tongue: "#ff8fa6" });

  // branquias cercanas (delante)
  if (S.crest) {
    for (let i = 0; i < 2; i++) gill(ctx, R, -hr * 0.92, -hr * 0.05 + i * 5, 2.9 + i * 0.35 + pose.sway * 0.2, gL * 0.6, gW * 0.85, gc, gg, ch, t, i);
  } else {
    for (let i = 0; i < 3; i++) {
      const a = -2.25 - i * (0.55 + flare * 0.2) + pose.sway * 0.3;
      gill(ctx, R, -hr * 0.88, -hr * 0.3 + i * 5.5, a, gL * (i === 1 ? 1.1 : 0.95), gW, gc, gg, ch, t, i);
    }
  }
  // corona de nubes (GOD)
  if (S.god) {
    ctx.save();
    ctx.translate(0, -hr - 10 + Math.sin(t * 0.07) * 1.5);
    for (let i = 0; i < 3; i++) {
      const a = t * 0.03 + i * (TAU / 3), z = Math.sin(a);
      if (z < 0) cloud(ctx, R, Math.cos(a) * 16, z * 3, 5, "#fff", true);
    }
    bolt(ctx, -4, 2, -8, 14, Math.floor(t / 4), "#9fd8ff", 1.8, true);
    for (let i = 0; i < 3; i++) {
      const a = t * 0.03 + i * (TAU / 3), z = Math.sin(a);
      if (z >= 0) cloud(ctx, R, Math.cos(a) * 16, z * 3, 5.5, "#fff", true);
    }
    ctx.restore();
  }
  // efectos de boca
  if (o.mouthSpark > 0) {
    const k = o.mouthSpark, mx = hr * 0.75 + 6 + Math.max(0, k - 0.5) * 60, my = hr * 0.35;
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 8 + k * 6);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.4, BOLT); g.addColorStop(1, "rgba(255,240,120,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 8 + k * 6, 0, TAU); ctx.fill();
    sparkBurst(ctx, mx, my, 12 + k * 6, t, 5, BOLT);
  }
  ctx.restore();

  // brazo delantero
  const shF = [S.bx + S.brx * 0.4, S.by - S.bry * 0.4];
  const fe = o.armFTo || [shF[0] + Math.sin(o.armA) * S.armL, shF[1] + Math.cos(o.armA) * S.armL];
  paw(ctx, R, shF[0], shF[1], fe[0], fe[1], S.armW, C.body, -2);
  if (!tip) tip = drawTail();
  return tip;
}

// ---------------------------------------------------------------------------
function opts(pose, f, S) {
  const t = pose.t, st = pose.state;
  const o = {
    footY: 0, footX: 0, legBend: 2, armA: 0.5, armB: -0.3, armFTo: null,
    headRot: Math.sin(t * 0.035) * 0.05, headDX: 0, headDY: pose.breath * 0.8,
    tailAxis: -2.55 + pose.sway * 0.25 + Math.sin(t * 0.05) * 0.08, tailLen: 1 + Math.sin(t * 0.09) * 0.12, tailAmp: 1 - Math.sin(t * 0.09) * 0.1,
    tailGlow: 0.3 + 0.3 * Math.sin(t * 0.12),
    earA: Math.sin(t * 0.04) * 0.06 - pose.sway * 0.15, charge: 0.25 + 0.2 * Math.sin(t * 0.1), gillK: 1, gillFlare: 0,
    eyes: "normal", mouth: "smile", mouthSpark: 0, puff: 0,
    lift: 0, rot: 0, rotY: -40, spinX: 1, stretchY: 1, sparks: 0, whip: 0, skyBolt: 0,
  };
  if (S.god) o.charge = 0.8 + 0.2 * Math.sin(t * 0.15);
  const hopRun = (spark) => {
    const ph = pose.phase * 0.6;
    const h = Math.abs(Math.sin(ph));
    o.lift = -h * 18;
    const squash = h < 0.3 ? 1 - h / 0.3 : 0;
    o.footY = h > 0.3 ? -h * 4 : 0;
    o.footX = h > 0.3 ? -3 * h : 2;
    o.legBend = 4 + squash * 4;
    o.headDY += squash * 3;
    o.rot = Math.cos(ph) * (Math.sin(ph) > 0 ? 0.12 : -0.12);
    o.armA = -0.6 - h * 0.8; o.armB = -0.9 - h * 0.6;
    o.tailAxis = -2.3 - h * 0.6 + pose.sway * 0.2;
    o.tailLen = 0.75 + h * 0.55; o.tailAmp = 1.25 - h * 0.45;
    o.earA = -0.35 * h - 0.1; o.gillFlare = -0.4 * h;
    o.mouth = "open";
    if (spark) { o.sparks = 1; o.charge = 1; o.tailGlow = 1; o.eyes = "angry"; o.mouth = "grin"; }
  };
  if (st === "run") hopRun(pose.move === "spark");
  else if (pose.move === "spark" && !pose.air && st === "idle") hopRun(true);
  else if (st === "jump") {
    o.footY = -6; o.footX = -2; o.legBend = 6; o.armA = 1.9; o.armB = -2.5;
    o.tailAxis = -2.95; o.tailLen = 1.3; o.tailAmp = 0.7; o.earA = -0.4; o.gillFlare = -0.5; o.mouth = "open";
  } else if (st === "fall" || st === "glide") {
    o.footY = -2; o.footX = 3; o.legBend = -2; o.armA = 1.95; o.armB = -2.6;
    o.tailAxis = -1.9; o.tailLen = 0.7; o.tailAmp = 1.3; o.earA = 0.25; o.gillFlare = 0.6; o.mouth = "o";
  } else if (st === "attack") {
    const k = pose.atk;
    o.eyes = "angry"; o.mouth = "grin"; o.charge = 0.7;
    if (k < 0.2) { const u = k / 0.2; o.rot = -0.12 * u; o.tailLen = 0.7; o.tailAmp = 1.3; o.headRot = -0.1; o.footX = -2; }
    else if (k < 0.55) {
      const u = (k - 0.2) / 0.35;
      o.spinX = Math.cos(u * TAU); o.lift = -Math.sin(u * Math.PI) * 8;
      o.tailAxis = -2.55 + u * 2.4; o.tailLen = 1.2;
    } else {
      const u = Math.min(1, (k - 0.55) / 0.3);
      o.tailAxis = Math.PI * (1 + u * 1.05); // barre por encima hacia delante
      o.tailLen = 1.8; o.tailAmp = 0.4; o.whip = u; o.tailGlow = 1; o.rot = 0.12; o.armA = 1.4;
    }
  } else if (st === "cast") {
    const k = pose.cast;
    if (pose.castSlot === 0) {
      o.charge = 1.3; o.gillFlare = 0.8; o.mouth = "open"; o.eyes = "angry"; o.mouthSpark = k;
      o.headRot = 0.08; o.armA = 1.2; o.armB = 0.9; o.rot = 0.06; o.gillK = 1.15;
    } else if (pose.castSlot === 1) {
      o.stretchY = 1 + Math.sin(k * Math.PI) * 0.45; o.spinX = 1 - Math.sin(k * Math.PI) * 0.35;
      o.eyes = "closed"; o.mouth = "o"; o.charge = 1; o.armA = 1.9; o.armB = -2.8; o.footY = -2;
    } else {
      o.tailAxis = -Math.PI / 2 + 0.25; o.tailLen = 1.25; o.tailAmp = 0.6; o.tailGlow = 1.2; o.skyBolt = k;
      o.armA = 2.0; o.armB = -2.7; o.eyes = "closed"; o.mouth = "open"; o.charge = 1.2; o.gillFlare = 0.7; o.headRot = -0.15;
    }
  } else if (st === "hurt") {
    o.eyes = "closed"; o.mouth = "o"; o.headRot = -0.3; o.headDX = -2; o.rot = -0.15; o.armA = 1.8; o.armB = -2.2;
    o.gillFlare = 1; o.charge = 1; o.sparks = 0.6; o.tailLen = 1.3; o.tailAmp = 0.5; o.tailAxis = -2.9; o.earA = -0.4;
  } else if (st === "wall") {
    const c = Math.sin(t * 0.18);
    o.armFTo = [S.bx + S.brx + 7, S.by - S.bry * 0.9 + c * 2];
    o.armA = 2.2; o.armB = 2.0; o.footX = 6; o.footY = -3; o.legBend = -5;
    o.tailAxis = 2.4; o.tailLen = 0.8; o.tailAmp = 1.2; o.earA = -0.35; o.eyes = "normal"; o.mouth = "open";
    o.rot = 0.1;
  } else if (st === "dead") {
    o.eyes = "swirl"; o.mouth = "o"; o.charge = 0; o.tailGlow = 0; o.tailLen = 1.1; o.tailAmp = 0.35; o.tailAxis = 1.3;
    o.armA = 1.4; o.armB = -1.2; o.gillFlare = -0.9; o.gillK = 0.8; o.earA = 0.4;
  } else if (st === "victory") {
    const cyc = (t % 70) / 70;
    if (cyc < 0.45) {
      const u = cyc / 0.45;
      o.lift = -Math.sin(u * Math.PI) * 30; o.rot = -u * TAU; o.footY = -6; o.legBend = 6;
      o.armA = 1.9; o.armB = -2.4; o.eyes = "happy"; o.mouth = "open";
    } else {
      const u = (cyc - 0.45) / 0.55;
      o.armA = 1.95 + Math.sin(u * 20) * 0.2; o.armB = -2.7; o.eyes = "happy"; o.mouth = "open"; o.lift = -Math.abs(Math.sin(u * 9)) * 3;
    }
    o.sparks = 1; o.charge = 1; o.tailGlow = 1; o.tailAxis = -2.0; o.gillFlare = 0.6;
  } else if (st === "idle" && pose.flourish > 0) {
    const n = pose.flourishN % 3, k = Math.sin(pose.flourish * Math.PI);
    if (n === 0) { // se sacude
      o.rot = Math.sin(t * 1.3) * 0.16 * k; o.headRot = Math.sin(t * 1.3 + 1) * 0.25 * k;
      o.eyes = "squeeze"; o.mouth = "flat"; o.sparks = k; o.charge = 0.4 + k * 0.6; o.gillFlare = Math.sin(t * 1.3) * k; o.earA = Math.sin(t * 1.3) * 0.4 * k;
    } else if (n === 1) { // persigue su cola
      o.spinX = Math.cos(t * 0.28); o.lift = -Math.abs(Math.sin(t * 0.28)) * 5;
      o.tailAxis = -1.2; o.tailLen = 0.8; o.headRot = -0.25; o.mouth = "open"; o.armA = 1.3;
    } else { // infla los mofletes
      o.puff = Math.min(1, k * 1.8); o.eyes = k > 0.6 ? "squeeze" : "normal"; o.headDY -= k * 2;
      if (pose.flourish > 0.85) { o.sparks = 1; o.puff = 0; o.mouth = "open"; o.eyes = "happy"; }
    }
  }
  return o;
}

function draw(ctx, pose, R) {
  const f = pose.form, S = P[f], C = PAL[f], t = pose.t, st = pose.state;
  const o = opts(pose, f, S);
  const cy = S.by - 4;

  // nubecitas (Trueno Gordo): detrás
  if (S.clouds) for (let i = 0; i < 3; i++) {
    const a = t * 0.025 + i * (TAU / 3);
    if (Math.sin(a) < 0) cloud(ctx, R, Math.cos(a) * 50, -50 + Math.sin(a) * 22, 5, "#fff", false);
  }
  // halo de rayos (GOD)
  if (S.god) {
    ctx.save();
    ctx.translate(0, cy - 14);
    for (let i = 0; i < 8; i++) {
      const a0 = i * (TAU / 8) + t * 0.02, a1 = a0 + TAU / 8;
      bolt(ctx, Math.cos(a0) * 50, Math.sin(a0) * 50, Math.cos(a1) * 50, Math.sin(a1) * 50, i + Math.floor(t / 5), "#8fd4ff", 1.6, i % 2 === 0);
    }
    ctx.restore();
  }

  const drawFig = (alphaK, dx) => {
    ctx.save();
    if (alphaK < 1) ctx.globalAlpha *= alphaK;
    ctx.translate(dx, o.lift);
    if (st === "dead") { ctx.translate(-S.hy * 0.6, -Math.max(S.hr - S.hx, S.brx - S.bx) - 3); ctx.rotate(-Math.PI / 2 + 0.06); }
    if (o.rot) { ctx.translate(0, cy); ctx.rotate(o.rot); ctx.translate(0, -cy); }
    if (o.spinX !== 1) { const sx = Math.sign(o.spinX || 1) * Math.max(0.2, Math.abs(o.spinX)); ctx.scale(sx, 1); }
    if (o.stretchY !== 1) ctx.scale(1, o.stretchY);
    const tip = figure(ctx, R, pose, f, S, C, o);
    ctx.restore();
    return tip;
  };

  let tip;
  if (st === "cast" && pose.castSlot === 1) {
    const k = pose.cast;
    drawFig(0.18, -26 * Math.sin(k * Math.PI));
    tip = drawFig(0.5 + 0.3 * Math.cos(k * Math.PI * 2), 0);
    for (let i = 0; i < 5; i++) R.sparkle(ctx, Math.sin(i * 2.3 + t * 0.2) * 26, -20 - i * 16 * o.stretchY, 3 + (i % 2) * 2, i % 2 ? "#ffffff" : C.glow);
  } else tip = drawFig(1, 0);

  // latigazo de cola: estela
  if (o.whip > 0) {
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = (0.7 - i * 0.2) * (1 - o.whip * 0.5);
      ctx.strokeStyle = i === 1 ? "#ffffff" : BOLT; ctx.lineWidth = 4 - i;
      ctx.beginPath(); ctx.arc(S.bx - S.brx * 0.85, S.by + S.bry * 0.35, S.tail * 1.8 + 12 + i * 4, Math.PI, Math.PI * (1 + o.whip * 1.05) - 0.05, false); ctx.stroke();
    }
    ctx.restore();
  }
  // rayo al cielo
  if (o.skyBolt > 0 && tip) {
    bolt(ctx, tip[0], tip[1], tip[0] + Math.sin(t) * 4, tip[1] - 60, Math.floor(t / 2), BOLT, 3.2, true);
    bolt(ctx, tip[0], tip[1], tip[0] - 14, tip[1] - 40, Math.floor(t / 2) + 7, C.glow, 1.8, false);
    sparkBurst(ctx, tip[0], tip[1], 12, t, 5, "#ffffff");
  }
  // chispas alrededor
  if (o.sparks > 0) {
    ctx.save();
    ctx.globalAlpha *= Math.min(1, o.sparks);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = i * (TAU / n) + t * 0.15;
      const r = 36 + Math.sin(t * 0.4 + i) * 6;
      const x = Math.cos(a) * r, y = cy - 8 + o.lift + Math.sin(a) * r * 0.9;
      bolt(ctx, x, y, x + Math.cos(a + 1.6) * 9, y + Math.sin(a + 1.6) * 9, i + Math.floor(t / 3), i % 2 ? BOLT : C.glow, 1.8, false);
    }
    ctx.restore();
  }
  // nubecitas: delante
  if (S.clouds) for (let i = 0; i < 3; i++) {
    const a = t * 0.025 + i * (TAU / 3);
    if (Math.sin(a) >= 0) cloud(ctx, R, Math.cos(a) * 50, -50 + Math.sin(a) * 22, 5.5, "#fff", false);
  }
}

export default { id: "pikachu", draw };
