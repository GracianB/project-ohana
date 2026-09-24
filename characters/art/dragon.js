// ============================================================================
// DRAGÓN · dragón rojo y dorado (diseño original)
// Escamas rojas, barriga crema con placas, cuernos y bigotes dorados,
// alas de membrana y cola con punta de llama.
//   0 Dragoncito  · bebé cabezón con cáscara de huevo y alitas diminutas
//   1 Dragón      · pequeño, bípedo, alas pequeñas
//   2 Dragón Alado· alas grandes, cresta dorada, más esbelto
//   3 Dragón Real · armadura dorada en pecho y cabeza, cuernos grandes, cola con púas
//   4 DRAGÓN GOD  · dorado, alas de fuego, corona de llamas y ojos brillantes
// pose.move: "fly" se dibuja como planeo batiendo alas (GOD vuela).
// ============================================================================

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const ease = (k) => k * k * (3 - 2 * k);
const lerp = (a, b, k) => a + (b - a) * k;

const PAL = [
  { body: "#ff7458", belly: "#ffe9c8", plate: "#f2b98a", gold: "#ffc93a", mem: "#ffb08a", bone: "#ff9a78", iris: "#ff9d1a" },
  { body: "#e8452f", belly: "#ffe3b6", plate: "#eaa86e", gold: "#ffc93a", mem: "#ff9a5c", bone: "#f06a4a", iris: "#ffa01a" },
  { body: "#f0532a", belly: "#ffe6b0", plate: "#eda060", gold: "#ffcd3a", mem: "#ffa446", bone: "#ff7a3a", iris: "#ffb01a" },
  { body: "#c7331f", belly: "#ffdfa8", plate: "#dd9a5a", gold: "#ffcc34", mem: "#f06a3a", bone: "#e0502e", iris: "#ffd23a" },
  { body: "#ffcf3a", belly: "#fff6d2", plate: "#f0c060", gold: "#fff2a0", mem: "#ff7a1a", bone: "#ffb32a", iris: "#fff4a0" },
];

// proporciones por forma
const F = [
  { r: 30, bw: 14, bh: 22, legL: 9, legW: 10, armL: 9, wing: 22, tail: 20, horn: 3, sn: 0.5 },
  { r: 25, bw: 14, bh: 29, legL: 14, legW: 10, armL: 13, wing: 36, tail: 30, horn: 9, sn: 0.62 },
  { r: 22, bw: 13, bh: 33, legL: 18, legW: 10, armL: 15, wing: 58, tail: 38, horn: 11, sn: 0.68 },
  { r: 22, bw: 16, bh: 35, legL: 18, legW: 12, armL: 16, wing: 62, tail: 42, horn: 19, sn: 0.68 },
  { r: 21, bw: 15, bh: 36, legL: 19, legW: 11, armL: 16, wing: 70, tail: 44, horn: 15, sn: 0.7 },
];

// ---------------------------------------------------------------------------
// helpers locales
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

function strokeChain(ctx, R, pts, w0, w1, color) {
  const n = pts.length - 1;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      const w = w0 + (w1 - w0) * (i / n);
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.lineCap = "round";
      ctx.lineWidth = pass ? w : w + R.LINE * 2;
      ctx.strokeStyle = pass ? color : R.INK;
      ctx.stroke();
    }
  }
}

/** Llama en forma de gota; la punta apunta en la dirección ang. */
function flame(ctx, R, x, y, s, ang, t, seed, opt = {}) {
  const L = s * (2.1 + Math.sin(t * 0.45 + seed * 1.7) * 0.45);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.sin(t * 0.3 + seed) * 0.12);
  const shape = (k) => {
    ctx.beginPath();
    ctx.moveTo(L * k, 0);
    ctx.quadraticCurveTo(s * 0.7 * k, -s * 1.15 * k, 0, -s * k);
    ctx.arc(0, 0, s * k, -PI / 2, PI / 2, true);
    ctx.quadraticCurveTo(s * 0.7 * k, s * 1.15 * k, L * k, 0);
    ctx.closePath();
  };
  shape(1);
  ctx.fillStyle = opt.outer || "#ff6a1a";
  ctx.fill();
  if (opt.line !== false) { ctx.lineWidth = R.LINE * 0.6; ctx.strokeStyle = opt.ink || "#8a1e12"; ctx.stroke(); }
  ctx.translate(-s * 0.15, 0);
  shape(0.66);
  ctx.fillStyle = opt.mid || "#ffc234";
  ctx.fill();
  shape(0.33);
  ctx.fillStyle = opt.core || "#fff6c8";
  ctx.fill();
  ctx.restore();
}

/** Ala de membrana. rot 0 = ala hacia arriba; + hacia delante, - hacia atrás. */
function wing(ctx, R, x, y, L, rot, open, c, god, t, far) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const W = [-0.1 * L, -0.48 * L];
  const spread = 0.3 + 0.62 * open;
  const lens = [0.62, 0.55, 0.42];
  const a0 = -PI / 2 + 0.15;
  const tips = [];
  for (let i = 0; i < 3; i++) {
    const a = a0 - i * spread;
    tips.push([W[0] + Math.cos(a) * L * lens[i], W[1] + Math.sin(a) * L * lens[i], a]);
  }
  const P = [-0.1 * L - 0.12 * L * open, 0.08 * L];
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W[0], W[1]);
  ctx.lineTo(tips[0][0], tips[0][1]);
  const scal = (a, b) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    ctx.quadraticCurveTo(mx + (W[0] - mx) * 0.22, my + (W[1] - my) * 0.22, b[0], b[1]);
  };
  for (let i = 1; i < 3; i++) scal(tips[i - 1], tips[i]);
  scal(tips[2], P);
  ctx.closePath();
  const g = ctx.createRadialGradient(W[0], W[1], L * 0.05, W[0], W[1], L * 0.65);
  if (god) {
    g.addColorStop(0, "#ff5a1a");
    g.addColorStop(0.55, "#ffa02a");
    g.addColorStop(1, "#ffe86a");
  } else {
    const m = far ? R.darken(c.mem, 0.22) : c.mem;
    g.addColorStop(0, R.darken(m, 0.1));
    g.addColorStop(1, R.lighten(m, 0.18));
  }
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = R.LINE;
  ctx.strokeStyle = god ? "#8a2a10" : R.INK;
  ctx.lineJoin = "round";
  ctx.stroke();
  // huesos
  const bone = god ? "#ffe27a" : far ? R.darken(c.bone, 0.22) : c.bone;
  const bw = Math.max(2.2, L * (god ? 0.045 : 0.07));
  ctx.lineCap = "round";
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass ? bone : R.INK;
    ctx.lineWidth = pass ? bw : bw + R.LINE * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W[0], W[1]); ctx.lineTo(tips[0][0], tips[0][1]);
    ctx.stroke();
  }
  ctx.strokeStyle = R.darken(far ? R.darken(c.mem, 0.22) : c.mem, 0.28);
  ctx.lineWidth = bw * 0.45;
  ctx.beginPath();
  for (let i = 1; i < 3; i++) { ctx.moveTo(W[0], W[1]); ctx.lineTo(lerp(W[0], tips[i][0], 0.92), lerp(W[1], tips[i][1], 0.92)); }
  ctx.stroke();
  // garrita del ala
  const cs = Math.max(3, L * 0.08);
  R.poly(ctx, [[W[0] - cs * 0.4, W[1]], [W[0] + cs * 0.7, W[1] - cs], [W[0] + cs * 0.5, W[1] + cs * 0.3]], c.gold, { lw: 1.6 });
  if (god) {
    for (let i = 0; i < 3; i++) flame(ctx, R, tips[i][0], tips[i][1], 3.4 + (i === 0 ? 1.2 : 0), tips[i][2], t, i + (far ? 5 : 0));
    // lenguas de fuego en el borde
    for (let i = 1; i < 3; i++) {
      const a = tips[i - 1], b = tips[i];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      flame(ctx, R, mx + (W[0] - mx) * 0.3, my + (W[1] - my) * 0.3, 2.6, (a[2] + b[2]) / 2, t, i * 3 + (far ? 2 : 0), { line: false });
    }
    ctx.save();
    ctx.shadowColor = "#ffb030";
    ctx.shadowBlur = 8;
    R.sparkle(ctx, tips[0][0], tips[0][1], 3, "#fffbe0");
    ctx.restore();
  }
  ctx.restore();
}

function foot(ctx, R, x, y, w, col, claw) {
  R.ellipse(ctx, x + w * 0.3, y + w * 0.05, w * 0.78, w * 0.5, col);
  ctx.fillStyle = claw;
  ctx.strokeStyle = R.INK;
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 2; i++) {
    const cx = x + w * (0.72 + i * 0.3), cy = y + w * (0.3 - i * 0.12);
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 2); ctx.lineTo(cx + 3.2, cy + 0.5); ctx.lineTo(cx - 1.5, cy + 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function arm(ctx, R, x, y, len, ang, w, col, claw) {
  const e = R.swingLimb(ctx, x, y, len, ang, 2, w, col, { hand: w * 0.72 });
  const a = ang + 0.15;
  ctx.fillStyle = claw; ctx.strokeStyle = R.INK; ctx.lineWidth = 1.1;
  for (let i = -1; i <= 1; i += 2) {
    const aa = a + i * 0.45;
    const cx = e[0] + Math.sin(aa) * w * 0.7, cy = e[1] + Math.cos(aa) * w * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(aa) * 1.4, cy + Math.sin(aa) * 1.4);
    ctx.lineTo(cx + Math.sin(aa) * 3, cy + Math.cos(aa) * 3);
    ctx.lineTo(cx + Math.cos(aa) * 1.4, cy - Math.sin(aa) * 1.4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function puff(ctx, R, x, y, r, a) {
  if (a <= 0.02) return;
  ctx.save();
  ctx.globalAlpha *= a;
  R.ellipse(ctx, x, y, r, r * 0.9, "#ece6f0", { lw: 1.4, ink: "#8a7f96" });
  ctx.restore();
}

// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = pose.form, c = PAL[f], P = F[f], t = pose.t, st = pose.state;
  const r = P.r, bw = P.bw, bh = P.bh;
  const god = f === 4;
  const dark = R.darken(c.body, 0.2);
  const fl = pose.flourish > 0 ? pose.flourish : 0;
  const flN = pose.flourishN % 3;
  const flE = fl > 0 ? Math.sin(fl * PI) : 0;
  const flying = st === "glide" || pose.move === "fly" || pose.move === "float";

  // ---- pose base
  let bob = pose.breath * 1.1, lean = 0.04, headRot = Math.sin(t * 0.025) * 0.04, hdx = 0, hdy = 0;
  let legF = 0, legB = 0, lenF = 1, lenB = 1;
  let armF = 0.35 + pose.breath * 0.05, armB = -0.15;
  let wRot = -0.42 + Math.sin(t * 0.05) * 0.12, wOpen = 0.62, wRotFar = null;
  let jaw = 0, eyeMood = "normal", brow = 0;
  let tailWave = Math.sin(t * 0.06) * 0.5 + pose.sway * 1.4;
  let smoke = st === "idle" && fl === 0, breath = 0, breathUp = 0, slash = 0, gust = 0, roar = 0, rings = 0;
  let hurtEyes = false;

  if (st === "run") {
    const ph = pose.phase, s = Math.sin(ph), cph = Math.cos(ph);
    const a = 0.8 * s;
    legF = a; legB = -a;
    lenF = 1 - Math.max(0, cph) * 0.3;
    lenB = 1 - Math.max(0, -cph) * 0.3;
    bob = P.legL * (1 - Math.cos(a)) * 0.9 - 2.2 * Math.abs(cph);
    lean = 0.2;
    armF = 0.5 - s * 0.7; armB = 0.2 + s * 0.7;
    wRot = -0.55 + Math.sin(ph * 2) * 0.1; wOpen = 0.4;
    headRot = 0.05 + Math.sin(ph * 2) * 0.03;
    tailWave = Math.sin(ph) * 0.5 + pose.sway * 1.6;
  } else if (st === "jump") {
    legF = 0.9; lenF = 0.72; legB = 0.25; lenB = 0.85;
    armF = 1.8; armB = 1.5;
    wRot = Math.sin(t * 0.7) * 0.75 - 0.15; wOpen = 1;
    lean = -0.04; headRot = -0.12; jaw = 0.25;
    tailWave = 1.2 + pose.bounce;
  } else if (st === "fall") {
    legF = 0.35; legB = -0.3;
    armF = 2.2; armB = -2.4;
    wRot = -0.25 + Math.sin(t * 0.35) * 0.3; wOpen = 1;
    headRot = 0.1; jaw = 0.3;
    tailWave = -0.6 + pose.bounce;
  } else if (st === "attack") {
    const a = pose.atk, w = ease(seg(a, 0, 0.3)), h = ease(seg(a, 0.3, 0.5)), rc = ease(seg(a, 0.55, 1));
    armF = lerp(lerp(0.35, 2.9, w), 0.5, h); armF = lerp(armF, 0.35, rc);
    armB = lerp(-0.15, -1.1, w) * (1 - rc);
    lean = lerp(lerp(0.04, -0.14, w), 0.3, h); lean = lerp(lean, 0.04, rc);
    legF = 0.35 * h * (1 - rc); legB = -0.3 * h * (1 - rc);
    tailWave = lerp(-1.5 * w, 2.2, h) * (1 - rc);
    eyeMood = "angry"; jaw = 0.35 * h * (1 - rc) + 0.1;
    wRot = -0.4 * h; wOpen = 0.8;
    slash = h > 0 ? (1 - rc) * h : 0;
  } else if (st === "cast") {
    const k = pose.cast, slot = pose.castSlot;
    if (slot === 0) {
      const inh = ease(seg(k, 0, 0.22)), out = ease(seg(k, 0.22, 0.34)), end = seg(k, 0.85, 1);
      lean = lerp(-0.12 * inh, 0.2, out);
      headRot = lerp(-0.3 * inh, 0.12, out); hdx = lerp(-3 * inh, 6, out);
      jaw = 0.8 * out * (1 - end);
      breath = out * (1 - end) + (k > 0.3 && k < 0.85 ? 0 : 0);
      armF = lerp(0.6, 0.2, out); armB = -0.4;
      eyeMood = out > 0.1 ? "angry" : "normal";
      wRot = -0.5; wOpen = 0.7;
      legF = 0.3 * out; legB = -0.35 * out;
    } else if (slot === 1) {
      const up = ease(seg(k, 0, 0.3)), fw = ease(seg(k, 0.3, 0.48)), rc = seg(k, 0.8, 1);
      wRot = lerp(lerp(-0.1, -1.0, up), 1.05, fw); wRot = lerp(wRot, -0.1, rc);
      wOpen = 1;
      lean = lerp(-0.1 * up, 0.18, fw) * (1 - rc);
      gust = fw * (1 - rc);
      armF = 1.2; armB = 0.8; eyeMood = "angry"; jaw = 0.3 * fw;
      legF = 0.3 * fw; legB = -0.4 * fw;
    } else {
      const up = ease(seg(k, 0, 0.35)), rc = seg(k, 0.85, 1);
      const e = up * (1 - rc);
      lean = -0.32 * e; headRot = -0.75 * e; hdx = -2 * e;
      jaw = 0.85 * e; roar = e;
      armF = lerp(0.35, 2.5, e); armB = lerp(-0.15, 2.1, e);
      wRot = lerp(-0.1, 0.1, e) + Math.sin(t * 0.4) * 0.12 * e; wOpen = lerp(0.6, 1, e);
      legF = 0.25 * e; legB = -0.2 * e;
      eyeMood = e > 0.3 ? "angry" : "normal";
      tailWave = 1.5 * e + Math.sin(t * 0.3) * 0.3;
    }
  } else if (st === "hurt") {
    lean = -0.28; headRot = -0.35; hdx = -2;
    armF = 2.3; armB = -2.2; legF = 0.5; legB = -0.1;
    wRot = -1.0; wOpen = 0.25; jaw = 0.35; hurtEyes = true;
    tailWave = -1.2;
  } else if (st === "wall") {
    lean = 0.12; headRot = -0.2;
    armF = 2.35; armB = 2.0; legF = 0.95; lenF = 0.8; legB = 0.5; lenB = 0.85;
    wRot = -0.45; wOpen = 0.3; tailWave = -1.4 + Math.sin(t * 0.08) * 0.2;
  } else if (st === "dead") {
    armF = 1.9; armB = 1.5; legF = 2.3; legB = 2.0; lenF = 0.85; lenB = 0.85; wRot = -1.5; wOpen = 0; jaw = 0.25; tailWave = -2.2;
    eyeMood = "closed"; smoke = false;
  } else if (st === "victory") {
    const hop = Math.abs(Math.sin(t * 0.13));
    bob = -hop * 4;
    lean = -0.12; headRot = -0.62; jaw = 0.9;
    armF = 2.7 + Math.sin(t * 0.25) * 0.15; armB = 2.4;
    wRot = 0.05 + Math.sin(t * 0.18) * 0.18; wOpen = 1; wRotFar = 0.35 + Math.sin(t * 0.18) * 0.18;
    legF = 0.25 * hop; legB = -0.25 * hop;
    breathUp = 1; eyeMood = "happy";
    tailWave = 1.4 + Math.sin(t * 0.2) * 0.5;
  } else if (flying) {
    lean = 0.34; headRot = -0.1;
    legF = -0.55; legB = -0.85;
    armF = 0.9; armB = 0.6;
    if (st === "glide" && pose.move !== "fly") { wRot = -0.7 + Math.sin(t * 0.05) * 0.03; wRotFar = -0.35; }
    else { wRot = Math.sin(t * 0.3) * 0.6 - 0.4; }
    wOpen = 1; eyeMood = "happy";
    tailWave = -0.3 + Math.sin(t * 0.07) * 0.3;
  }

  // gestos de espera
  if (fl > 0) {
    if (flN === 0) { // anillos de humo
      headRot = -0.25 * flE; jaw = 0.3 * flE; rings = fl;
    } else if (flN === 1) { // estira las alas
      wRot = lerp(wRot, 0.02, flE); wRotFar = 0.3 * flE; wOpen = lerp(0.62, 1, flE);
      lean = -0.15 * flE; headRot = -0.35 * flE; jaw = 0.55 * flE;
      armF = lerp(armF, 2.6, flE); armB = lerp(armB, 2.3, flE);
      eyeMood = flE > 0.4 ? "closed" : "normal";
    } else { // se rasca con la pata trasera
      lean = -0.3 * flE; bob += 4 * flE;
      legF = lerp(0, -2.75 + Math.sin(t * 1.1) * 0.22 * flE, flE); lenF = 1 + 0.9 * flE; armF = 0.9; armB = 0.5;
      headRot = -0.3 * flE; eyeMood = flE > 0.3 ? "happy" : "normal";
      wRot = -0.2; tailWave = Math.sin(t * 0.4) * 0.6;
    }
  }

  const hipY = -(P.legL + P.legW * 0.55) + bob;

  ctx.save();
  if (st === "dead") { ctx.translate(40, -bw - 3); ctx.rotate(-PI / 2); }

  // frame superior (torso) alrededor de la cadera
  const upper = () => { ctx.translate(0, hipY); ctx.rotate(lean); };
  const neckX = bw * 0.28 + hdx, neckY = -bh - r * 0.5 + hdy;
  const shX = bw * 0.38, shY = -bh * 0.74;
  const wingX = f === 0 ? -bw * 0.75 : -bw * 0.55, wingY = f === 0 ? -bh * 0.55 : -bh * 0.8;
  if (f === 0) { wRot -= 0.45; if (wRotFar !== null) wRotFar -= 0.45; }

  // ---- ala lejana
  if (st !== "dead") { ctx.save(); upper();
  wing(ctx, R, wingX + 7, wingY - 3, P.wing * 0.9, wRotFar !== null ? wRotFar : wRot + 0.3, wOpen, c, god, t, true);
  ctx.restore(); }

  // ---- cola
  ctx.save(); upper();
  const tpts = chain(-bw * 0.7, -4, P.tail, PI * 0.86, (k) => tailWave * (0.3 + k) + k * 6.5 - 1.6 + Math.sin(t * 0.09 + k * 3) * 0.3, 9);
  strokeChain(ctx, R, tpts, P.legW * 0.95, 3.5, c.body);
  // barriga de la cola (línea crema)
  if (f >= 3) {
    for (let i = 2; i < tpts.length - 1; i += 2) {
      const p = tpts[i], a = p[2] + PI / 2, len = 5 + (1 - i / tpts.length) * 6;
      R.poly(ctx, [[p[0] + Math.cos(a + 0.5) * 2, p[1] + Math.sin(a + 0.5) * 2], [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len], [p[0] + Math.cos(a - 0.9) * 3, p[1] + Math.sin(a - 0.9) * 3]], c.gold, { lw: 1.6 });
    }
  } else if (f >= 1) {
    for (let i = 3; i < tpts.length - 1; i += 3) {
      const p = tpts[i], a = p[2] + PI / 2;
      R.poly(ctx, [[p[0] + Math.cos(a + 0.6) * 1.5, p[1] + Math.sin(a + 0.6) * 1.5], [p[0] + Math.cos(a) * 4.5, p[1] + Math.sin(a) * 4.5], [p[0] + Math.cos(a - 0.8) * 2, p[1] + Math.sin(a - 0.8) * 2]], c.gold, { lw: 1.4 });
    }
  }
  const tip = tpts[tpts.length - 1];
  flame(ctx, R, tip[0], tip[1], 3 + f * 0.7, tip[2], t, 3, god ? { outer: "#ff8a1a", mid: "#ffe45a" } : {});
  ctx.restore();

  // ---- pierna trasera
  const legCol = dark;
  const lb = R.swingLimb(ctx, -4, hipY, P.legL * lenB, legB, 3, P.legW, legCol, { hand: false });
  foot(ctx, R, lb[0], lb[1], P.legW * 0.95, legCol, c.belly);

  // ---- brazo trasero
  ctx.save(); upper();
  arm(ctx, R, shX - 5, shY - 1, P.armL, armB, P.legW * 0.52, legCol, c.belly);
  ctx.restore();

  // ---- ala cercana
  if (st !== "dead") { ctx.save(); upper();
  wing(ctx, R, wingX, wingY, P.wing, wRot, wOpen, c, god, t, false);
  ctx.restore(); }

  // ---- cuerpo
  ctx.save(); upper();
  const body = [[-bw * 0.95, -bh * 0.05], [-bw * 0.85, -bh * 0.6], [-bw * 0.3, -bh * 1.02], [bw * 0.5, -bh * 0.98], [bw * 1.0, -bh * 0.5], [bw * 0.92, -bh * 0.02], [0, bw * 0.28]];
  R.blob(ctx, body, c.body);
  // barriga con placas
  const bel = [[bw * 0.08, -bh * 0.88], [bw * 0.66, -bh * 0.84], [bw * 0.93, -bh * 0.42], [bw * 0.74, -bh * 0.02], [bw * 0.1, bw * 0.12], [-bw * 0.18, -bh * 0.42]];
  R.blob(ctx, bel, c.belly, { lw: 1.6 });
  ctx.save();
  R.blob(ctx, bel, null, { line: false, shade: false });
  ctx.clip();
  ctx.strokeStyle = c.plate; ctx.lineWidth = 1.7;
  for (let i = 1; i <= 4; i++) {
    const y = -bh * (0.02 + i * 0.19);
    ctx.beginPath(); ctx.moveTo(-bw * 0.3, y - 2); ctx.quadraticCurveTo(bw * 0.4, y + 3, bw * 1.1, y - 2); ctx.stroke();
  }
  ctx.restore();
  // espinas dorsales
  if (f >= 2) {
    const n = 3;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const bx = lerp(-bw * 0.9, -bw * 0.45, k), by = lerp(-bh * 0.3, -bh * 0.92, k);
      R.poly(ctx, [[bx + 2, by + 2], [bx - 6 - f, by - 3], [bx + 1, by - 5]], c.gold, { lw: 1.6 });
    }
  }
  // armadura real
  if (f === 3) {
    const plate = [[bw * 0.0, -bh * 0.94], [bw * 0.7, -bh * 0.9], [bw * 1.05, -bh * 0.55], [bw * 0.7, -bh * 0.38], [bw * 0.1, -bh * 0.42], [-bw * 0.15, -bh * 0.7]];
    R.blob(ctx, plate, c.gold);
    ctx.strokeStyle = R.darken(c.gold, 0.3); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bw * 0.05, -bh * 0.52); ctx.quadraticCurveTo(bw * 0.55, -bh * 0.45, bw * 0.95, -bh * 0.6); ctx.stroke();
    R.ellipse(ctx, bw * 0.5, -bh * 0.68, 3.4, 3.8, "#e8263a", { lw: 1.6 });
    R.shine(ctx, bw * 0.45, -bh * 0.72, 1.2, 1.6, 0.9);
    R.shine(ctx, bw * 0.2, -bh * 0.82, 4, 1.6, 0.6);
  }
  if (god) {
    R.star(ctx, bw * 0.45, -bh * 0.66, 5, "#fff8d0", { lw: 1.6 });
  }
  R.shine(ctx, -bw * 0.4, -bh * 0.75, bw * 0.22, bh * 0.1, 0.35);
  ctx.restore();

  // ---- pierna delantera
  const scratch = fl > 0 && flN === 2;
  const frontLeg = () => {
    const lf = R.swingLimb(ctx, 5, hipY, P.legL * lenF, legF, scratch ? -4 : 3, P.legW, c.body, { hand: false });
    foot(ctx, R, lf[0], lf[1], P.legW, c.body, c.belly);
    if (scratch && flE > 0.5) {
      ctx.save();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.8; ctx.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const a = -PI / 2 + (i - 1) * 0.6 + legF * 0.2;
        const d = 9 + ((t * 0.8 + i * 3) % 4);
        ctx.beginPath();
        ctx.moveTo(lf[0] + Math.cos(a) * d, lf[1] + Math.sin(a) * d);
        ctx.lineTo(lf[0] + Math.cos(a) * (d + 4), lf[1] + Math.sin(a) * (d + 4));
        ctx.stroke();
      }
      ctx.restore();
    }
  };
  if (!scratch) frontLeg();

  // ---- cabeza
  ctx.save(); upper();
  ctx.translate(neckX, neckY + pose.bounce * 1.5);
  ctx.rotate(headRot);
  drawHead(ctx, R, pose, { f, c, P, r, t, god, jaw, eyeMood, brow, hurtEyes, smoke, breath, breathUp, roar, rings, fl, dark });
  ctx.restore();

  if (scratch) frontLeg();

  // ---- brazo delantero
  ctx.save(); upper();
  arm(ctx, R, shX, shY, P.armL, armF, P.legW * 0.56, c.body, c.belly);
  if (f === 3) R.ellipse(ctx, shX - 1, shY - 1, 5.5, 4.6, c.gold, { lw: 2 });
  if (slash > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(slash, 0, 1);
    ctx.strokeStyle = "#ffffff"; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.lineWidth = 3.2 - i * 0.7;
      ctx.beginPath();
      ctx.arc(shX, shY, P.armL + 7 + i * 5, -1.0, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();

  // ---- ráfaga de alas (cast K)
  if (gust > 0) {
    ctx.save();
    ctx.globalAlpha *= gust;
    ctx.strokeStyle = "#e8fbff"; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const gx = bw + 30 + i * 9 + pose.cast * 18;
      ctx.lineWidth = 3.2 - i * 0.6;
      ctx.beginPath(); ctx.arc(gx - 16, -bh - 10, 18 + i * 4, -0.8, 0.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx - 10, -bh - 34 + i * 18); ctx.lineTo(gx + 8, -bh - 34 + i * 18); ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
function drawHead(ctx, R, pose, o) {
  const { f, c, P, r, t, god, jaw, eyeMood, hurtEyes } = o;
  const sn = P.sn;
  const snX = r * (0.45 + sn * 0.45), snY = r * 0.3, snRx = r * (0.3 + sn * 0.4), snRy = r * 0.4;
  const tipX = snX + snRx;
  const swayK = pose.sway;

  // cuerno lejano
  if (f >= 1) horn(ctx, R, r * 0.28, -r * 0.05, r, P.horn * 0.85, R.darken(c.gold, 0.18), f);
  // cresta dorada
  if (f >= 2 && !god) {
    for (let i = 0; i < 4; i++) {
      const a = -PI * 0.62 - i * 0.26;
      const ex = Math.cos(a) * r * 0.95, ey = Math.sin(a) * r * 0.88;
      const sp = r * (0.42 - i * 0.07) * (f >= 3 ? 1.15 : 1);
      const px = Math.cos(a + 0.35), py = Math.sin(a + 0.35);
      R.poly(ctx, [[ex + px * 4, ey + py * 4], [ex + Math.cos(a - 0.25) * sp, ey + Math.sin(a - 0.25) * sp], [ex - px * 4, ey - py * 4]], c.gold, { lw: 1.8 });
    }
  }
  // aleta-oreja
  const fin = r * (f === 0 ? 0.3 : 0.45);
  const fs = swayK * 3 + Math.sin(t * 0.07) * 1.5;
  R.poly(ctx, [[-r * 0.55, -r * 0.2], [-r * 0.6 - fin * 1.5, -r * 0.5 - fin * 0.4 + fs], [-r * 0.65 - fin * 0.8, -r * 0.1], [-r * 0.65 - fin * 1.4, r * 0.25 + fs], [-r * 0.5, r * 0.2]], c.mem, { lw: 2.2 });

  // mandíbula + interior de la boca
  const hx = r * 0.12, hy = r * 0.52;
  const ja = jaw * 0.7;
  const jt = [hx + Math.cos(ja) * (tipX - hx - r * 0.08), hy + Math.sin(ja) * (tipX - hx - r * 0.08)];
  if (jaw > 0.02) {
    ctx.beginPath();
    ctx.moveTo(hx, hy - r * 0.05);
    ctx.lineTo(tipX - r * 0.05, snY + snRy * 0.8);
    ctx.lineTo(jt[0], jt[1]);
    ctx.closePath();
    ctx.fillStyle = "#6b1420"; ctx.fill();
    ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.stroke();
    // lengua
    R.ellipse(ctx, lerp(hx, jt[0], 0.55), lerp(hy, jt[1], 0.55) - r * 0.04, r * 0.22, r * 0.08, "#ff6f86", { line: false, shade: false, rot: ja });
  }
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ja);
  const jl = tipX - hx - r * 0.06;
  R.blob(ctx, [[-r * 0.12, -r * 0.14], [jl * 0.9, -r * 0.08], [jl, r * 0.02], [jl * 0.8, r * 0.16], [r * 0.1, r * 0.24], [-r * 0.2, r * 0.08]], R.lighten(c.belly, 0.05));
  if (jaw > 0.15) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 2; i++) {
      const tx = jl * (0.55 + i * 0.28);
      ctx.beginPath(); ctx.moveTo(tx - 2, -r * 0.06); ctx.lineTo(tx, -r * 0.2); ctx.lineTo(tx + 2, -r * 0.06); ctx.fill();
    }
  }
  ctx.restore();

  // cabeza (unión cráneo + hocico sin costuras)
  const shapes = [
    () => { ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.92, 0, 0, PI * 2); },
    () => { ctx.beginPath(); ctx.ellipse(snX, snY, snRx, snRy, -0.08, 0, PI * 2); },
  ];
  ctx.lineWidth = R.LINE * 2; ctx.strokeStyle = R.INK;
  for (const s of shapes) { s(); ctx.stroke(); }
  const vol = R.volume(ctx, r * 0.1, -r * 0.05, r * 1.15, c.body);
  for (const s of shapes) { s(); ctx.fillStyle = vol; ctx.fill(); }
  // hocico más claro por debajo
  ctx.save();
  shapes[1](); ctx.clip();
  ctx.fillStyle = R.alpha(c.belly, 0.55);
  ctx.beginPath(); ctx.ellipse(snX + r * 0.05, snY + snRy * 0.75, snRx * 1.1, snRy * 0.5, 0, 0, PI * 2); ctx.fill();
  ctx.restore();
  R.shine(ctx, -r * 0.35, -r * 0.5, r * 0.28, r * 0.14, 0.45);

  // colmillo
  if (f >= 1 && jaw < 0.15) {
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = R.INK; ctx.lineWidth = 1.2;
    const fx = tipX - r * 0.3, fy = snY + snRy * 0.92;
    ctx.beginPath(); ctx.moveTo(fx - 2.2, fy - 1); ctx.lineTo(fx, fy + 4); ctx.lineTo(fx + 2.2, fy - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // sonrisa (comisura)
  if (jaw < 0.1) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(r * 0.24, hy - r * 0.08, r * 0.1, 0.2, 1.8); ctx.stroke();
  }

  // cuerno cercano
  if (f >= 1) horn(ctx, R, 0, 0, r, P.horn, c.gold, f);
  else {
    // cuernitos bebé
    R.ellipse(ctx, -r * 0.1, -r * 0.88, 3.5, 5, c.gold, { rot: -0.4, lw: 2 });
  }

  // cáscara de huevo (bebé)
  if (f === 0) {
    ctx.save();
    ctx.rotate(-0.18);
    ctx.beginPath();
    ctx.arc(-r * 0.05, -r * 0.1, r * 1.03, PI * 1.13, PI * 1.87);
    const x1 = Math.cos(PI * 1.87) * r * 1.03 - r * 0.05, y1 = Math.sin(PI * 1.87) * r * 1.03 - r * 0.1;
    const x0 = Math.cos(PI * 1.13) * r * 1.03 - r * 0.05;
    const n = 6;
    for (let i = 1; i <= n; i++) {
      const x = lerp(x1, x0, i / n), y = y1 + (i % 2 ? r * 0.2 : -r * 0.02) + (i === n ? r * 0.02 : 0);
      ctx.lineTo(x, y + (i / n) * r * 0.05);
    }
    ctx.closePath();
    ctx.fillStyle = R.volume(ctx, -r * 0.2, -r * 0.8, r * 0.9, "#fff8ec");
    ctx.fill();
    ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke();
    R.ellipse(ctx, -r * 0.35, -r * 0.8, 3, 2.2, "#ffb07a", { line: false, shade: false });
    R.ellipse(ctx, r * 0.25, -r * 0.88, 2.2, 1.7, "#ffb07a", { line: false, shade: false });
    R.ellipse(ctx, -r * 0.02, -r * 0.98, 1.6, 1.2, "#9fd8a0", { line: false, shade: false });
    ctx.restore();
  }

  // casco real
  if (f === 3) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.92, 0, 0, PI * 2); ctx.clip();
    ctx.beginPath();
    ctx.moveTo(-r * 1.1, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.1, -r * 0.62, r * 1.1, -r * 0.3);
    ctx.lineTo(r * 1.1, -r * 1.2); ctx.lineTo(-r * 1.1, -r * 1.2); ctx.closePath();
    ctx.fillStyle = R.volume(ctx, 0, -r * 0.8, r, c.gold); ctx.fill();
    ctx.lineWidth = R.LINE; ctx.strokeStyle = R.INK; ctx.stroke();
    ctx.restore();
    R.poly(ctx, [[r * 0.02, -r * 0.8], [r * 0.25, -r * 1.35], [r * 0.45, -r * 0.72]], c.gold, { lw: 2 });
    R.ellipse(ctx, r * 0.25, -r * 0.62, 3, 3.4, "#e8263a", { lw: 1.6 });
    R.shine(ctx, r * 0.2, -r * 0.68, 1, 1.4, 0.9);
  }

  // ojo
  const ex = r * 0.3, ey = -r * 0.12, er = r * (f === 0 ? 0.34 : 0.3);
  if (god) {
    ctx.save();
    ctx.shadowColor = "#fff080"; ctx.shadowBlur = 10;
    ctx.fillStyle = R.alpha("#fff6a0", 0.5);
    ctx.beginPath(); ctx.arc(ex, ey, er * 1.25, 0, PI * 2); ctx.fill();
    ctx.restore();
  }
  if (hurtEyes) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = 2.6; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ex - er * 0.6, ey - er * 0.6); ctx.lineTo(ex + er * 0.5, ey); ctx.lineTo(ex - er * 0.6, ey + er * 0.6);
    ctx.stroke();
  } else {
    R.eye(ctx, ex, ey, er, pose, { iris: god ? "#ffb400" : c.iris, pupil: god ? "#8a3a00" : "#1a0a10", mood: eyeMood });
  }
  // ceja/cresta ósea
  if (f >= 2 && eyeMood !== "angry" && eyeMood !== "happy" && !hurtEyes) {
    ctx.strokeStyle = R.darken(c.body, 0.35); ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ex - er * 0.9, ey - er * 1.25); ctx.quadraticCurveTo(ex, ey - er * 1.5, ex + er * 0.9, ey - er * 1.05); ctx.stroke();
  }
  // orificio nasal
  R.ellipse(ctx, tipX - r * 0.14, snY - snRy * 0.35, 1.8, 1.2, R.INK, { line: false, shade: false, rot: -0.4 });
  R.blush(ctx, r * 0.18, r * 0.36, r * 0.14, "#ff5a6a");

  // bigotes dorados
  if (f >= 1) {
    const wl = [0, 0.7, 0.9, 1.0, 1.15][f] * r;
    const sx = tipX - r * 0.2, sy = snY + snRy * 0.55;
    const w1 = Math.sin(t * 0.08) * 2.5 + swayK * 6;
    ctx.lineCap = "round";
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? c.gold : R.INK;
      ctx.lineWidth = pass ? 1.8 : 1.8 + 2.4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx + wl * 0.25, sy + wl * 0.45, sx - wl * 0.3, sy + wl * 0.75, sx - wl * 0.85 + w1, sy + wl * 0.55);
      ctx.quadraticCurveTo(sx - wl * 1.1 + w1 * 1.3, sy + wl * 0.4, sx - wl * 1.0 + w1 * 1.4, sy + wl * 0.25);
      ctx.stroke();
    }
  }

  // corona de llamas (GOD)
  if (god) {
    R.halo(ctx, -r * 0.05, -r * 1.25, r * 0.85, t, "#ffe27a");
    for (let i = 0; i < 5; i++) {
      const a = -PI * 0.82 + i * PI * 0.16;
      const fx = Math.cos(a) * r * 0.78, fy = Math.sin(a) * r * 0.72 - 2;
      flame(ctx, R, fx, fy, 3 + (i === 2 ? 1.5 : 0.5), a * 0.25 - PI / 2 - 0.05 + (a + PI / 2) * 0.4, t, i * 2.1, { outer: "#ff7a1a", mid: "#ffe45a" });
    }
    R.sparkle(ctx, r * 0.9, -r * 0.95, 3.5 + Math.sin(t * 0.2) * 1.5);
  }

  // humo por la nariz (idle)
  if (o.smoke) {
    const cyc = (t % 150) / 150;
    if (cyc < 0.5) {
      const k = cyc / 0.5;
      for (let i = 0; i < 2; i++) {
        const kk = clamp(k * 1.3 - i * 0.3, 0, 1);
        if (kk > 0) puff(ctx, R, tipX + kk * 8 + i * 2, snY - snRy * 0.4 - kk * 14 - i * 2, 1.8 + kk * 3.5, (1 - kk) * 0.85);
      }
    }
  }
  // anillos de humo (gesto 0)
  if (o.rings > 0) {
    for (let i = 0; i < 3; i++) {
      const kk = clamp(o.rings * 1.7 - i * 0.32, 0, 1);
      if (kk <= 0 || kk >= 1) continue;
      ctx.save();
      ctx.globalAlpha *= (1 - kk) * 0.9;
      ctx.strokeStyle = "#e4dde8"; ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(tipX + kk * 12, snY + r * 0.2 - kk * 34, 2.5 + kk * 5, 1.8 + kk * 3.5, -0.3, 0, PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // aliento de fuego
  const mouthX = tipX - r * 0.05, mouthY = snY + snRy * 0.95;
  if (o.breath > 0 || o.breathUp > 0) {
    const k = Math.max(o.breath, o.breathUp);
    const n = 6;
    for (let i = n - 1; i >= 0; i--) {
      const d = (i / (n - 1)) * (40 + f * 8) * k;
      const s = (2.5 + i * 1.6 + f * 0.3) * (0.6 + 0.4 * k);
      const wob = Math.sin(t * 0.6 + i * 1.9) * 2 * (i / n);
      flame(ctx, R, mouthX + d, mouthY + wob + d * 0.12, s, 0.12 + wob * 0.04, t, i * 1.3,
        god ? { outer: "#ff9a1a", mid: "#fff06a", ink: "#b0400a" } : {});
    }
  }
  // rugido
  if (o.roar > 0.2) {
    ctx.save();
    ctx.globalAlpha *= o.roar;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const a = -0.7 + i * 0.45;
      const d0 = r * 0.35 + ((t * 1.2 + i * 5) % 10);
      ctx.beginPath();
      ctx.moveTo(mouthX + Math.cos(a) * d0, mouthY + Math.sin(a) * d0);
      ctx.lineTo(mouthX + Math.cos(a) * (d0 + 7), mouthY + Math.sin(a) * (d0 + 7));
      ctx.stroke();
    }
    ctx.restore();
  }
}

function horn(ctx, R, ox, oy, r, h, col, f) {
  const bx = ox - r * 0.2, by = oy - r * 0.72;
  const tx = bx - r * 0.35 - h * 0.9, ty = by - r * 0.25 - h * 0.85;
  R.blob(ctx, [[bx + r * 0.18, by + 1], [bx - h * 0.25, by - r * 0.3 - h * 0.35], [tx, ty], [bx - r * 0.25 - h * 0.25, by - r * 0.05 - h * 0.12], [bx - r * 0.2, by + r * 0.14]], col, { lw: 2.4 });
  if (h > 8) {
    ctx.strokeStyle = R.darken(col, 0.3); ctx.lineWidth = 1.3;
    for (let i = 1; i <= 2; i++) {
      const k = i / 3.2;
      const mx = lerp(bx, tx, k), my = lerp(by, ty, k);
      ctx.beginPath(); ctx.moveTo(mx - 1, my - 3.5 + k * 2); ctx.lineTo(mx + 3.5 - k * 2, my + 1); ctx.stroke();
    }
  }
}

export default { id: "dragon", draw };
