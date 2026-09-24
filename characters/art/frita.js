// ============================================================================
// FRITA · "Capitán Kétchup" (patata frita, diseño original)
// ----------------------------------------------------------------------------
// Rasgo propio: el cuerpo es una "columna" flexible (spine) que se curva como
// un fideo: con pose.sway, al correr, al atacar y en los gestos.
//   0 Palito        · patatita regordeta en un cucurucho rojo y blanco
//   1 Frita         · una patata esbelta
//   2 Capitán       · capa con goterones de kétchup, antifaz, espada-tenedor
//   3 Extra Crujiente · tres patatas fundidas, muy crujiente, gafas de sol
//   4 KÉTCHUP GOD   · dorada con purpurina, corona, aura de llamas doradas
// pose.move "slide" → tumbada surfeando con los brazos hacia delante.
// ============================================================================

const PAL = [
  { fry: "#ffe08a", edge: "#e3a63c", cape: "#e8322a", limb: "#5a3322", shoe: "#e8322a" },
  { fry: "#f7c04a", edge: "#d98c22", cape: "#e8322a", limb: "#5a3322", shoe: "#e8322a" },
  { fry: "#f6bd45", edge: "#d6851e", cape: "#d42020", limb: "#4a2a26", shoe: "#2b2b3a" },
  { fry: "#ffd35e", edge: "#cf7a18", cape: "#d42020", limb: "#4a2a26", shoe: "#e8322a" },
  { fry: "#ffd23a", edge: "#e89a10", cape: "#e82020", limb: "#6a3a16", shoe: "#ffe27a" },
];
const KETCHUP = "#d8231c";

const TAU = Math.PI * 2;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const seg = (k, a, b) => ease((k - a) / (b - a));
const frac = (x) => x - Math.floor(x);

// ---------------------------------------------------------------------------
// Columna flexible: puntos {x,y,a}; a = ángulo desde la vertical (+ = hacia +x)
// ---------------------------------------------------------------------------
function spine(x, y, a0, L, bend, wig, N = 10) {
  const pts = [];
  let px = x, py = y;
  const ds = L / N;
  const ang = (s) => a0 + bend * s + wig * Math.sin(s * Math.PI);
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    pts.push({ x: px, y: py, a: ang(s) });
    const am = ang(s + 0.5 / N);
    px += Math.sin(am) * ds;
    py -= Math.cos(am) * ds;
  }
  return pts;
}
function at(sp, s) {
  const f = Math.max(0, Math.min(1, s)) * (sp.length - 1);
  const i = Math.min(sp.length - 2, Math.floor(f));
  const k = f - i, A = sp[i], B = sp[i + 1];
  return { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k, a: A.a + (B.a - A.a) * k };
}
const off = (q, u) => [q.x + Math.cos(q.a) * u, q.y + Math.sin(q.a) * u];
const along = (q, v) => [q.x + Math.sin(q.a) * v, q.y - Math.cos(q.a) * v];
function shift(sp, u) {
  return sp.map((q) => ({ x: q.x + Math.cos(q.a) * u, y: q.y + Math.sin(q.a) * u, a: q.a }));
}

/** Path cerrado suave (puntos de control → curvas por puntos medios). */
function smoothPath(ctx, pts) {
  const n = pts.length;
  ctx.beginPath();
  const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}

function fryOutline(sp, w) {
  const n = sp.length, b = sp[0], tp = sp[n - 1];
  const pts = [along(b, -w * 0.06)];
  for (let i = 0; i < n; i++) pts.push(off(sp[i], w / 2));
  pts.push(along(tp, w * 0.12));
  for (let i = n - 1; i >= 0; i--) pts.push(off(sp[i], -w / 2));
  return pts;
}

function strokeAlong(ctx, sp, u, s0, s1, lw, color) {
  ctx.beginPath();
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const p = off(at(sp, s0 + ((s1 - s0) * i) / n), u);
    i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
  }
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

/** Cuerpo de patata: relleno con volumen, cara lateral, brillo, motitas crujientes. */
function fryBody(ctx, R, sp, w, c, opt = {}) {
  const pts = fryOutline(sp, w);
  const mid = at(sp, 0.5);
  const A = off(mid, -w / 2), B = off(mid, w / 2);
  const g = ctx.createLinearGradient(A[0], A[1], B[0], B[1]);
  g.addColorStop(0, R.lighten(c.fry, 0.35));
  g.addColorStop(0.45, c.fry);
  g.addColorStop(1, R.darken(c.fry, 0.12));
  smoothPath(ctx, pts);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // cara lateral (sección cuadrada de la patata)
  strokeAlong(ctx, sp, w * 0.4, 0, 1, w * 0.34, R.alpha(c.edge, 0.45));
  // tostado de las puntas
  const tp = sp[sp.length - 1];
  ctx.fillStyle = R.alpha(c.edge, opt.crisp ? 0.75 : 0.55);
  ctx.beginPath();
  const tt = along(tp, w * 0.1);
  ctx.ellipse(tt[0], tt[1], w * 0.62, w * 0.24, tp.a, 0, TAU);
  ctx.fill();
  // brillo vertical
  strokeAlong(ctx, sp, -w * 0.24, 0.12, 0.86, Math.max(2, w * 0.13), "rgba(255,255,255,0.45)");
  // motitas crujientes
  const nd = opt.dots || 10;
  for (let i = 0; i < nd; i++) {
    const s = 0.06 + frac(i * 0.618 + (opt.seed || 0.1)) * 0.88;
    const u = (frac(i * 0.377 + 0.21 + (opt.seed || 0)) - 0.5) * w * 0.8;
    const p = off(at(sp, s), u);
    const r = 0.7 + frac(i * 0.73) * (opt.crisp ? 1.2 : 0.8);
    ctx.fillStyle = R.alpha(R.darken(c.edge, 0.2), 0.7);
    ctx.beginPath();
    ctx.ellipse(p[0], p[1], r * 1.3, r, sp[0].a + i, 0, TAU);
    ctx.fill();
    if (opt.crisp && i % 2 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(p[0] - r, p[1] - r, r * 0.45, 0, TAU);
      ctx.fill();
    }
  }
  if (opt.dipped > 0) {
    // punta mojada en kétchup
    ctx.fillStyle = KETCHUP;
    ctx.globalAlpha = opt.dipped;
    const d0 = off(at(sp, 0.84), -w * 0.5), d1 = off(at(sp, 0.86), w * 0.05), d2 = off(at(sp, 0.84), w * 0.5);
    ctx.moveTo(off(at(sp, 0.91), -w)[0], off(at(sp, 0.91), -w)[1]);
    ctx.quadraticCurveTo(d0[0], d0[1], d1[0], d1[1]);
    ctx.quadraticCurveTo(d2[0], d2[1], off(at(sp, 0.93), w)[0], off(at(sp, 0.93), w)[1]);
    const e = along(tp, w * 1.5);
    ctx.lineTo(e[0] + w, e[1]);
    ctx.lineTo(e[0] - w, e[1]);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (opt.glow) {
    ctx.fillStyle = R.alpha("#fffbe0", 0.25 + 0.15 * Math.sin(opt.t * 0.15));
    ctx.fillRect(-200, -250, 400, 300);
  }
  ctx.restore();
  smoothPath(ctx, pts);
  R.paint(ctx, null, { lw: R.LINE });
}

// ---------------------------------------------------------------------------
// Piezas
// ---------------------------------------------------------------------------
function thinLimb(ctx, R, x1, y1, x3, y3, bend, c, hand) {
  const mx = (x1 + x3) / 2, my = (y1 + y3) / 2;
  const dx = x3 - x1, dy = y3 - y1, d = Math.hypot(dx, dy) || 1;
  const x2 = mx - (dy / d) * bend, y2 = my + (dx / d) * bend;
  R.limb(ctx, x1, y1, x2, y2, x3, y3, 3.4, c.limb, { lw: 1.4, hand: false });
  if (hand) glove(ctx, R, x3, y3, hand === true ? 4.2 : hand);
  return [x3, y3];
}
function glove(ctx, R, x, y, r) {
  R.ellipse(ctx, x, y, r, r * 0.95, "#ffffff", { lw: 2 });
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y - r * 0.4);
  ctx.lineTo(x - r * 0.2, y + r * 0.1);
  ctx.lineWidth = 1;
  ctx.strokeStyle = R.alpha(R.INK, 0.5);
  ctx.stroke();
}
function shoe(ctx, R, x, y, c, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  R.ellipse(ctx, 2.2, -1.8, 5.4, 3.4, c.shoe, { lw: 2 });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-2.6, 0.2, 9.4, 1.2);
  R.shine(ctx, 0.5, -3.2, 1.8, 0.9, 0.7);
  ctx.restore();
}
function leg(ctx, R, x, y, len, ang, bend, c) {
  const ex = x + Math.sin(ang) * len, ey = y + Math.cos(ang) * len;
  thinLimb(ctx, R, x, y, ex, ey, bend, c, false);
  shoe(ctx, R, ex, ey, c, ang * 0.35);
  return [ex, ey];
}

function fork(ctx, R, x, y, ang, len, gold) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const metal = gold ? "#ffd84a" : "#d8e2ee";
  const lw = R.LINE * 0.8;
  const bar = (x1, y1, x2, y2, w) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.lineCap = "round";
    ctx.strokeStyle = R.INK; ctx.lineWidth = w + lw * 2; ctx.stroke();
  };
  const fillBar = (x1, y1, x2, y2, w) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = metal; ctx.lineWidth = w; ctx.stroke();
  };
  const tines = [-4.2, -1.4, 1.4, 4.2];
  bar(-len * 0.3, 0, len * 0.55, 0, 3.4);
  bar(len * 0.55, -4.6, len * 0.55, 4.6, 3);
  for (const ty of tines) bar(len * 0.56, ty, len, ty, 1.8);
  fillBar(-len * 0.3, 0, len * 0.55, 0, 3.4);
  fillBar(len * 0.55, -4.6, len * 0.55, 4.6, 3);
  for (const ty of tines) fillBar(len * 0.56, ty, len, ty, 1.8);
  // empuñadura roja (espada)
  R.ellipse(ctx, -len * 0.02, 0, 2.2, 6.5, gold ? "#e82020" : "#d42020", { lw: 1.8 });
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillRect(len * 0.1, -1.1, len * 0.35, 0.9);
  ctx.restore();
}

function saltShaker(ctx, R, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  R.blob(ctx, [[-5, -2], [5, -2], [6, 10], [-6, 10]], "#eef6ff", { lw: 2 });
  R.ellipse(ctx, 0, 5, 4, 3.5, "#ffffff", { line: false, shade: false });
  R.blob(ctx, [[-5, -2], [-4, -8], [4, -8], [5, -2]], "#b8c4d4", { lw: 2 });
  ctx.fillStyle = R.INK;
  for (const hx of [-2, 0, 2]) { ctx.beginPath(); ctx.arc(hx, -6, 0.7, 0, TAU); ctx.fill(); }
  R.shine(ctx, -3, 3, 1, 3, 0.7);
  ctx.restore();
}

function ketchupBottle(ctx, R, x, y, rot, squeeze) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const sq = 1 - squeeze * 0.35;
  // apunta a +x
  R.blob(ctx, [[-10, -6 * sq], [4, -6.5 * sq], [8, -3], [8, 3], [4, 6.5 * sq], [-10, 6 * sq]], KETCHUP, { lw: 2.2 });
  R.poly(ctx, [[8, -3], [13, -1.2], [13, 1.2], [8, 3]], "#ffffff", { lw: 2 });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-7, -2.2 * sq, 9, 4.4 * sq);
  R.shine(ctx, -4, -3.5 * sq, 3, 1, 0.6);
  ctx.restore();
}

function ketchupCup(ctx, R, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  R.poly(ctx, [[-9, -9], [9, -9], [7, 0], [-7, 0]], "#ffffff", { lw: 2.2 });
  ctx.strokeStyle = R.alpha("#d42020", 0.6);
  ctx.lineWidth = 1;
  for (const lx of [-5, 0, 5]) { ctx.beginPath(); ctx.moveTo(lx, -8); ctx.lineTo(lx * 0.8, -1); ctx.stroke(); }
  R.ellipse(ctx, 0, -9, 9, 2.6, KETCHUP, { lw: 2, shade: false });
  R.shine(ctx, -3, -9.5, 2.5, 0.8, 0.6);
  ctx.restore();
}

function crown(ctx, R, x, y, rot, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  R.poly(ctx, [[-11, 0], [-12, -12], [-6, -6], [0, -15], [6, -6], [12, -12], [11, 0]], "#ffd84a", { lw: 2.4 });
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-9, -3.5, 18, 1.4);
  R.ellipse(ctx, 0, -4, 2.4, 2.4, "#e82020", { lw: 1.4 });
  R.ellipse(ctx, -7, -3.5, 1.5, 1.5, "#3fd0ff", { lw: 1.2 });
  R.ellipse(ctx, 7, -3.5, 1.5, 1.5, "#3fd0ff", { lw: 1.2 });
  ctx.save();
  ctx.shadowColor = "#fff6c0";
  ctx.shadowBlur = 6;
  R.sparkle(ctx, 0, -15, 3 + Math.sin(t * 0.2) * 1.2);
  ctx.restore();
  ctx.restore();
}

function goldFlames(ctx, R, sp, w, t, scale = 1) {
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const s = 0.05 + (i / 8) * 0.95;
    const side = i % 2 ? 1 : -1;
    const q = at(sp, s);
    const [x, y] = off(q, side * (w * 0.5 + 3));
    const h = (12 + 10 * s + Math.sin(t * 0.35 + i * 1.9) * 4) * scale;
    const lean = side * 0.35 + Math.sin(t * 0.2 + i) * 0.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean);
    for (const [k, col, a] of [[1, "#ff9a1a", 0.7], [0.72, "#ffd23a", 0.85], [0.4, "#fffbe0", 0.9]]) {
      ctx.beginPath();
      const cu = Math.sin(t * 0.4 + i) * 3 * k;
      ctx.moveTo(cu, -h * k);
      ctx.bezierCurveTo(7 * k, -h * 0.55 * k, 6 * k, -1, 0, 2.5 * k);
      ctx.bezierCurveTo(-6 * k, -1, -7 * k, -h * 0.45 * k, cu, -h * k);
      ctx.fillStyle = R.alpha(col, a);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function capeShape(ctx, R, sp, w, c, o) {
  const neck = at(sp, 0.66);
  const sL = off(neck, -w * 0.5), sR = off(neck, w * 0.25);
  const base = sp[0];
  const len = o.len;
  const flow = o.flow; // desplazamiento hacia atrás (-x)
  const lift = o.lift || 0;
  const t = o.t;
  const w1 = Math.sin(t * 0.22) * 3 * (0.4 + o.wind);
  const w2 = Math.sin(t * 0.22 + 1.6) * 4 * (0.4 + o.wind);
  const by = Math.min(base.y + 4, sL[1] + len) - lift;
  const pts = [
    sR, sL,
    [sL[0] - 6 - flow * 0.45, (sL[1] + by) / 2 - lift * 0.5 + w1],
    [sL[0] - 10 - flow, by + w2],
    [sL[0] - flow * 0.55 + 2, by + 3 - w1 * 0.5],
    [base.x + w * 0.2 - flow * 0.1, by + 1],
  ];
  const g = ctx.createLinearGradient(sL[0], sL[1], sL[0] - flow, by);
  g.addColorStop(0, R.lighten(c.cape, 0.12));
  g.addColorStop(1, R.darken(c.cape, 0.25));
  smoothPath(ctx, pts);
  ctx.fillStyle = g;
  ctx.fill();
  R.paint(ctx, null, { lw: R.LINE });
  // goterones de kétchup en el borde
  const drips = [[0.3, 0], [0.6, 1], [0.85, 2]];
  for (const [k, i] of drips) {
    const x = pts[3][0] + (pts[5][0] - pts[3][0]) * k;
    const y = pts[3][1] + (pts[5][1] - pts[3][1]) * k + 2;
    const dl = 3 + 3 * frac(i * 0.61) + Math.sin(t * 0.08 + i * 2) * 1.5;
    R.blob(ctx, [[x - 2.4, y - 2], [x + 2.4, y - 2], [x + 2, y + dl], [x, y + dl + 2.5], [x - 2, y + dl]], KETCHUP, { lw: 1.6, shade: false });
  }
  // cierre
  R.ellipse(ctx, neck.x + Math.cos(neck.a) * w * 0.1, neck.y + Math.sin(neck.a) * w * 0.1, 3, 3, o.gold ? "#ffe27a" : "#ffd24a", { lw: 1.6 });
}

// ---------------------------------------------------------------------------
// Cara (marco local: origen = centro de la cara, mira a +x)
// ---------------------------------------------------------------------------
function face(ctx, R, pose, w, f, mood, mouthM, t) {
  const er = f === 0 ? 7.6 : f === 3 ? 5.4 : 5.2;
  const e1 = [-w * 0.1, 0], e2 = [w * 0.3, -0.3];
  const iris = f === 4 ? "#c07a10" : "#5a3418";
  if (f === 2) {
    // antifaz
    const tailW = Math.sin(t * 0.3) * 2 + pose.sway * 3;
    ctx.save();
    R.blob(ctx, [[-w * 0.5 - 1, -er * 0.3], [-w * 0.5 - 9, -er * 0.9 + tailW], [-w * 0.5 - 8, er * 0.2 + tailW]], "#b81414", { lw: 1.6, shade: false });
    R.blob(ctx, [[-w * 0.5 - 1, er * 0.3], [-w * 0.5 - 8, er * 0.8 + tailW * 1.3], [-w * 0.5 - 5, er * 1.3 + tailW]], "#b81414", { lw: 1.6, shade: false });
    ctx.beginPath();
    ctx.moveTo(-w * 0.52, -er * 1.1);
    ctx.quadraticCurveTo(w * 0.12, -er * 1.8, w * 0.54, -er * 1.1);
    ctx.lineTo(w * 0.52, er * 0.9);
    ctx.quadraticCurveTo(w * 0.1, er * 0.5, -w * 0.52, er * 0.9);
    ctx.closePath();
    R.paint(ctx, "#d42020", { lw: 2 });
    ctx.restore();
  }
  if (f === 3 && mood !== "hurt") {
    // gafas de sol
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-w * 0.55, -er * 0.4); ctx.lineTo(w * 0.62, -er * 0.4);
    ctx.lineWidth = 2.4; ctx.strokeStyle = R.INK; ctx.stroke();
    for (const [ex, ey, s] of [[e1[0], e1[1], 1], [e2[0], e2[1], 0.9]]) {
      R.blob(ctx, [[ex - er * 1.1 * s, ey - er * 0.7], [ex + er * 1.1 * s, ey - er * 0.7], [ex + er * 0.9 * s, ey + er * 0.7], [ex - er * 0.9 * s, ey + er * 0.8]], "#1a1030", { lw: 2 });
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.6 * s, ey - er * 0.4); ctx.lineTo(ex - er * 0.1 * s, ey - er * 0.4); ctx.lineTo(ex - er * 0.5 * s, ey + er * 0.4);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // ceja segura
    if (mood === "angry") {
      ctx.beginPath(); ctx.moveTo(-w * 0.3, -er * 1.4); ctx.lineTo(w * 0.45, -er * 0.9);
      ctx.lineWidth = 2; ctx.strokeStyle = R.INK; ctx.stroke();
    }
  } else if (mood === "dead") {
    for (const [ex, ey] of [e1, e2]) {
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.6, ey - er * 0.6); ctx.lineTo(ex + er * 0.6, ey + er * 0.6);
      ctx.moveTo(ex + er * 0.6, ey - er * 0.6); ctx.lineTo(ex - er * 0.6, ey + er * 0.6);
      ctx.lineWidth = 2.2; ctx.strokeStyle = R.INK; ctx.lineCap = "round"; ctx.stroke();
    }
  } else {
    const m = mood === "hurt" ? "closed" : mood;
    R.eye(ctx, e1[0], e1[1], er, pose, { iris, mood: m, lash: f === 0 });
    R.eye(ctx, e2[0], e2[1], er * 0.86, pose, { iris, mood: m });
    if (mood === "hurt") {
      ctx.beginPath();
      ctx.moveTo(e1[0] - er, e1[1] - er * 1.4); ctx.lineTo(e1[0] + er * 0.7, e1[1] - er);
      ctx.moveTo(e2[0] + er, e2[1] - er * 1.4); ctx.lineTo(e2[0] - er * 0.5, e2[1] - er);
      ctx.lineWidth = 1.8; ctx.strokeStyle = R.INK; ctx.stroke();
    }
  }
  R.blush(ctx, -w * 0.3, er * 1.35, er * 0.55);
  R.blush(ctx, w * 0.48, er * 1.3, er * 0.45);
  R.mouth(ctx, w * 0.12, er * 1.55, f === 0 ? 7 : 6.5, mouthM);
}

// ---------------------------------------------------------------------------
// Pose → parámetros del cuerpo
// ---------------------------------------------------------------------------
const FORM = [
  { w: 30, L: 50, legL: 10, fs: 0.62 },
  { w: 20, L: 72, legL: 20, fs: 0.74 },
  { w: 21, L: 70, legL: 20, fs: 0.74 },
  { w: 19, L: 62, legL: 18, fs: 0.74 },
  { w: 23, L: 70, legL: 20, fs: 0.74 },
];

// cuánto puede doblarse para mojar la punta en el cuenco (sin atravesar el suelo)
const DIP = [];
function dipInfo(f, F) {
  if (DIP[f]) return DIP[f];
  const by = f === 0 ? -F.legL - 26 : -F.legL, am = f === 0 ? 0.6 : 1;
  let d = 1, tp = null;
  for (let x = 0.3; x <= 1.001; x += 0.05) {
    const sp = spine(0, by, 0.9 * x * am, F.L, 1.55 * x, 0.2 * x);
    tp = sp[sp.length - 1];
    d = x;
    if (tp.y > -16) break;
  }
  DIP[f] = { d, x: tp.x + Math.sin(tp.a) * F.w * 0.4 };
  return DIP[f];
}

function params(pose, f, F) {
  const st = pose.state, t = pose.t;
  const P = {
    a0: 0, bend: Math.sin(t * 0.045) * 0.1 + pose.breath * 0.04, wig: pose.sway * 0.55,
    bx: 0, lift: 0,
    legF: [0.12, 1.5], legB: [-0.12, -1.5],
    armF: { ang: 0.35 + pose.breath * 0.05, bend: 3 }, armB: { ang: -0.35 - pose.breath * 0.05, bend: -3 },
    mood: "normal", mouth: "smile", item: null, fx: null, faceRot: 0,
    capeFlow: 6 + Math.abs(pose.sway) * 10, capeWind: 0, dipped: 0, lying: false,
  };
  const withFork = f >= 2;
  if (st === "run" && pose.move !== "slide") {
    const ph = pose.phase, s = Math.sin(ph);
    P.a0 = 0.16 * pose.speed;
    P.bend = Math.sin(ph * 2 + 0.8) * 0.28 + pose.sway * 0.35;
    P.wig = -0.35 * pose.speed + Math.sin(ph * 2) * 0.2;
    P.lift = -Math.abs(Math.cos(ph)) * 4.5;
    P.legF = [s * 1.0, 3 + Math.max(0, s) * 4];
    P.legB = [-s * 1.0, 3 + Math.max(0, -s) * 4];
    P.armF = { ang: -s * 1.1, bend: 4 };
    P.armB = { ang: s * 1.1, bend: -4 };
    P.mouth = "open";
    P.capeFlow = 20 + pose.speed * 12;
    P.capeWind = 0.8;
  } else if (st === "jump") {
    P.bend = -0.55 + pose.bounce * 0.2;
    P.wig = 0.2;
    P.legF = [0.9, 5]; P.legB = [0.35, 5];
    P.armF = { ang: 2.5, bend: 4 }; P.armB = { ang: 2.9, bend: -4 };
    P.mouth = "open";
    P.capeFlow = 8; P.capeWind = 0.6;
  } else if (st === "fall" || st === "glide") {
    P.bend = 0.35 + pose.bounce * 0.25;
    P.wig = -0.35 + Math.sin(t * 0.3) * 0.1;
    P.legF = [0.2 + Math.sin(t * 0.5) * 0.15, -2]; P.legB = [-0.3 - Math.sin(t * 0.5) * 0.15, 2];
    P.armF = { ang: 2.1 + Math.sin(t * 0.45) * 0.35, bend: 3 }; P.armB = { ang: -2.1 - Math.sin(t * 0.45 + 1) * 0.35, bend: -3 };
    if (st === "glide") { P.armF.ang = 1.6; P.armB.ang = -1.6; P.bend = 0.15; }
    P.mouth = "o";
    P.capeFlow = 6; P.capeWind = 1; P.capeUp = 1;
  } else if (st === "attack") {
    const k = pose.atk;
    const ant = seg(k, 0, 0.3), hit = seg(k, 0.3, 0.5), rec = seg(k, 0.65, 1);
    P.mood = "angry"; P.mouth = hit > 0.5 && rec < 0.5 ? "grin" : "open";
    if (!withFork) {
      // latigazo con todo el cuerpo
      P.a0 = -0.25 * ant + 0.45 * hit - 0.2 * rec;
      P.bend = -0.7 * ant + 1.5 * hit - 0.8 * rec;
      P.wig = 0.2 * hit;
      P.legF = [0.5 * hit, 3]; P.legB = [-0.5 * hit - 0.1, -3];
      P.armF = { ang: -1.2 * ant + 1.8 * hit, bend: 3 }; P.armB = { ang: -1.4 * hit - 0.3, bend: -3 };
      if (hit > 0.3 && rec < 0.8) P.fx = { kind: "whack", k: hit * (1 - rec) };
    } else {
      // estocada con la espada-tenedor
      P.a0 = -0.15 * ant + 0.4 * hit - 0.3 * rec;
      P.bend = -0.25 * ant + 0.35 * hit - 0.2 * rec;
      P.bx = 6 * hit - 6 * rec;
      P.legF = [-0.2 * ant + 0.9 * hit - 0.6 * rec, 5];
      P.legB = [-0.1 * ant - 0.75 * hit + 0.55 * rec, -2];
      P.armF = { ang: 0.6 - 1.0 * ant + 2.05 * hit - 0.9 * rec, bend: 2 * (1 - hit) + 1, len: 1 + 0.3 * hit };
      P.armB = { ang: -1.2 - 1.3 * hit + 1.2 * rec, bend: -5 };
      P.item = "fork";
      if (hit > 0.3 && rec < 0.9) P.fx = { kind: "thrust", k: hit * (1 - rec) };
    }
  } else if (st === "cast") {
    const k = pose.cast, slot = pose.castSlot;
    if (slot === 0) {
      // sacude un salero
      P.bend = -0.25; P.a0 = -0.05;
      P.armF = { ang: 2.75 + Math.sin(t * 1.3) * 0.2, bend: 3 };
      P.armB = { ang: -0.6, bend: -3 };
      P.item = "salt"; P.fx = { kind: "salt", k };
      P.mood = "happy"; P.mouth = "open";
    } else if (slot === 1) {
      // aprieta un bote de kétchup
      const sq = 0.5 + Math.sin(t * 0.8) * 0.5;
      P.a0 = 0.12; P.bend = 0.3 + sq * 0.1;
      P.armF = { ang: 1.35, bend: 4, len: 0.95 }; P.armB = { ang: 1.2, bend: 5, len: 0.9 };
      P.item = "ketchup"; P.squeeze = sq; P.fx = { kind: "ketchup", k };
      P.mood = "angry"; P.mouth = "grin";
      P.legF = [0.35, 3]; P.legB = [-0.35, -3];
    } else {
      // salta dentro de burbujas de aceite
      const j = Math.sin(Math.min(1, k * 1.4) * Math.PI);
      P.lift = -16 * j;
      P.bend = -0.7 * j + Math.sin(t * 0.5) * 0.15; P.wig = 0.4 * j;
      P.legF = [1.1 * j, 5]; P.legB = [0.5 * j, 5];
      P.armF = { ang: 2.6, bend: 4 }; P.armB = { ang: -2.6, bend: -4 };
      P.fx = { kind: "oil", k };
      P.mood = "happy"; P.mouth = "open";
      P.capeFlow = 4; P.capeWind = 0.6; P.capeUp = 1;
    }
  } else if (st === "hurt") {
    P.a0 = -0.3; P.bend = -0.9 - pose.hurt * 0.2; P.wig = -0.3; P.bx = -3;
    P.legF = [0.7, 4]; P.legB = [-0.15, -2];
    P.armF = { ang: 1.4, bend: 4 }; P.armB = { ang: 1.9, bend: 4 };
    P.mood = "hurt"; P.mouth = "o";
    P.capeFlow = 2; P.capeWind = 0.8;
  } else if (st === "wall") {
    P.a0 = 0.16; P.bend = 0.25 + Math.sin(t * 0.1) * 0.05; P.bx = 2;
    P.wall = true;
    P.mood = "normal"; P.mouth = "flat";
  } else if (st === "dead") {
    P.lying = "back";
    P.mood = "dead"; P.mouth = "o";
  } else if (st === "victory") {
    const e = pose.evoT || 0;
    P.bend = -0.18 + Math.sin(t * 0.08) * 0.06; P.wig = -0.1;
    P.lift = -Math.abs(Math.sin(t * 0.09)) * 3;
    P.legF = [0.38, 2]; P.legB = [-0.38, -2];
    P.armF = { ang: 2.95, bend: 2, len: 1.1 };
    P.hip = true;
    P.mood = "happy"; P.mouth = "grin";
    P.capeFlow = 26 + Math.sin(t * 0.2) * 4; P.capeWind = 1.4; P.capeUp = 0.4 + e * 0.3;
    P.fx = { kind: "victory" };
    P.item = withFork ? "forkUp" : null;
  } else if (pose.move === "slide") {
    P.lying = "slide";
    P.mood = "happy"; P.mouth = "grin";
  }

  // gesto de espera
  if (st === "idle" && pose.flourish > 0) {
    const k = pose.flourish, n = pose.flourishN % 3;
    const b = Math.sin(k * Math.PI);
    if (n === 0) {
      // se moja en kétchup
      const d = seg(k, 0.05, 0.4) * (1 - seg(k, 0.6, 0.9)) * dipInfo(f, F).d;
      P.a0 = 0.9 * d; P.bend = 1.55 * d; P.wig = 0.2 * d;
      P.legF = [0.1, 2]; P.legB = [-0.25 * d - 0.1, -2];
      P.armF = { ang: 0.4 + d * 0.6, bend: 3 }; P.armB = { ang: -0.4 - d * 1.2, bend: -3 };
      P.cup = 1 - seg(k, 0.85, 1);
      P.dipped = seg(k, 0.35, 0.45);
      P.mood = d > 0.8 ? "closed" : k > 0.6 ? "happy" : "normal";
      P.mouth = k > 0.6 ? "open" : "o";
    } else if (n === 1) {
      // saca bíceps
      const fl = Math.sin(k * Math.PI * 4) * 0.5 + 0.5;
      P.bend = -0.2 * b; P.wig = -0.15 * b;
      P.flex = b; P.flexK = fl;
      P.mood = "angry"; P.mouth = "grin";
      P.legF = [0.3 * b, 2]; P.legB = [-0.3 * b, -2];
    } else {
      // hace girar el tenedor
      P.bend = Math.sin(k * TAU * 2) * 0.2; P.wig = 0.15;
      P.armF = { ang: 1.4 + Math.sin(k * TAU * 2) * 0.2, bend: 3 };
      P.item = "spin"; P.spin = k * TAU * 3;
      P.mood = "happy"; P.mouth = "smile";
    }
  }
  return P;
}

// ---------------------------------------------------------------------------
// Dibujo principal
// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = pose.form, c = PAL[f], F = FORM[f], t = pose.t;
  const P = params(pose, f, F);
  const w = F.w;
  const multi = f === 3;

  ctx.save();

  // ---------------- columna (cuerpo) ----------------
  let sp, legBase;
  let hipY = -F.legL + P.lift;
  let coneTilt = 0;
  if (P.lying === "slide") {
    const wob = Math.sin(t * 0.35) * 0.08;
    const bw = multi ? w * 2.4 : w;
    sp = spine(-F.L * 0.5 - 4, -bw * 0.5 - 4 + Math.sin(t * 0.3) * 1.5, Math.PI / 2 - 0.1, F.L, wob, -0.1);
    legBase = at(sp, 0);
  } else if (P.lying === "back") {
    const bw = multi ? w * 2.4 : w;
    sp = spine(F.L * 0.5 - 4, -bw * 0.5 - 1, -Math.PI / 2, F.L, 0.06, 0);
    legBase = at(sp, 0);
  } else if (f === 0) {
    coneTilt = pose.state === "run" ? Math.sin(pose.phase * 2) * 0.08 + 0.06 : P.a0 * 0.3 + pose.sway * 0.05;
    sp = spine(P.bx, hipY - 29, P.a0 * 0.6 + coneTilt, F.L, P.bend, P.wig);
    legBase = { x: P.bx, y: hipY, a: coneTilt };
  } else {
    sp = spine(P.bx, hipY, P.a0, F.L, P.bend, P.wig);
    legBase = sp[0];
  }
  const tip = sp[sp.length - 1];
  const faceQ = at(sp, F.fs);

  // ---------------- detrás ----------------
  if (f === 4) goldFlames(ctx, R, sp, w + 6, t, P.lying ? 0.45 : 1);
  if (P.fx && P.fx.kind === "oil") drawOil(ctx, R, sp, P.fx.k, t, false);
  if (P.cup > 0) {
    ketchupCup(ctx, R, dipInfo(f, F).x, 0, P.cup);
  }
  const hasCape = (f === 2 || f === 4) && !P.lying;
  if (hasCape) {
    capeShape(ctx, R, sp, w, c, {
      len: F.L * 0.8, flow: P.capeFlow, wind: P.capeWind, t, lift: (P.capeUp || 0) * 14, gold: f === 4,
    });
  }

  // hombros
  const shQ = at(sp, f === 0 ? 0.3 : 0.52);
  const sideW = multi ? w * 1.2 : w * 0.5;
  const shF = off(shQ, sideW - 1), shB = off(shQ, -sideW + 2);
  const armLen = [14, 20, 21, 22, 23][f];

  // brazo trasero
  const drawArm = (sh, A, front) => {
    if (!A) return null;
    const len = armLen * (A.len || 1);
    const ex = sh[0] + Math.sin(A.ang) * len, ey = sh[1] + Math.cos(A.ang) * len;
    return thinLimb(ctx, R, sh[0], sh[1], ex, ey, A.bend, c, front ? true : 3.8);
  };

  // extremidades según estado especial
  let handF = null;
  if (P.lying === "slide") {
    // piernas atrás, brazos adelante
    const lb = legBase;
    leg(ctx, R, lb.x - 2, lb.y - 3, F.legL + 2, -1.75 + Math.sin(t * 0.3) * 0.1, 3, c);
    leg(ctx, R, lb.x - 2, lb.y + 3, F.legL + 2, -1.45 + Math.sin(t * 0.3 + 1) * 0.1, -3, c);
    const sq = at(sp, 0.7);
    const s0 = off(sq, -2);
    thinLimb(ctx, R, s0[0], s0[1], tip.x + 16, tip.y - 6 + Math.sin(t * 0.3) * 2, -3, c, 3.8);
  } else if (P.lying === "back") {
    const lb = legBase;
    const kick = Math.sin(t * 0.25) * 0.15;
    leg(ctx, R, lb.x + 2, lb.y - w * 0.2, F.legL + 2, Math.PI * 0.85 + kick, 3, c);
    leg(ctx, R, lb.x - 2, lb.y - w * 0.2, F.legL + 2, Math.PI * 1.1 - kick, -3, c);
  } else if (P.wall) {
    const hx = w * 0.5 + 9;
    leg(ctx, R, legBase.x - 3, legBase.y, F.legL, -0.15 + Math.sin(t * 0.15) * 0.1, -3, c);
    const s = off(shQ, -sideW + 2);
    thinLimb(ctx, R, s[0], s[1], hx - 2, at(sp, 1).y - 6, -6, c, 3.8);
  } else {
    const lbx = legBase.x, lby = legBase.y;
    const legW = f === 0 ? 5 : multi ? w * 0.7 : w * 0.24;
    leg(ctx, R, lbx - legW, lby, F.legL, P.legB[0], P.legB[1], c);
    if (P.flex) {
      flexArm(ctx, R, shB, -1, P, armLen, c);
    } else if (P.hip) {
      thinLimb(ctx, R, shB[0], shB[1], shB[0] - 7, shB[1] + 12, -6, c, 3.8);
    } else drawArm(shB, P.armB, false);
  }

  // cucurucho trasero + patatas de fondo (forma 0)
  if (f === 0 && !P.lying) {
    const cb = coneBase(legBase);
    ctx.save();
    ctx.translate(cb.x, cb.y);
    ctx.rotate(cb.a);
    R.ellipse(ctx, 0, -40, 21, 5, "#8c1a14", { lw: 2, shade: false });
    ctx.restore();
    const sw = pose.sway * 0.3 + Math.sin(t * 0.05) * 0.05;
    const bk1 = spine(cb.x - 11, cb.y - 26, -0.35 + sw + cb.a, 36, sw, 0, 6);
    const bk2 = spine(cb.x + 12, cb.y - 26, 0.35 + sw + cb.a, 32, sw, 0, 6);
    fryBody(ctx, R, bk1, 12, c, { dots: 3, seed: 0.3 });
    fryBody(ctx, R, bk2, 12, c, { dots: 3, seed: 0.6 });
  }

  // ---------------- cuerpo ----------------
  const bodyOpt = {
    dots: [8, 12, 12, 16, 10][f], crisp: f === 3, dipped: P.dipped, seed: 0.1, glow: f === 4, t,
  };
  if (multi) {
    const spL = spine(sp[0].x - Math.cos(sp[0].a) * w * 0.82, sp[0].y - Math.sin(sp[0].a) * w * 0.82 + 1, sp[0].a - 0.04, F.L * 0.88, P.bend, P.wig);
    const spR = spine(sp[0].x + Math.cos(sp[0].a) * w * 0.82, sp[0].y + Math.sin(sp[0].a) * w * 0.82 + 1, sp[0].a + 0.04, F.L * 0.94, P.bend, P.wig);
    fryBody(ctx, R, spL, w, c, { ...bodyOpt, seed: 0.35 });
    fryBody(ctx, R, spR, w, c, { ...bodyOpt, seed: 0.7 });
    // bloque fundido: rellena las juntas
    ctx.save();
    ctx.globalAlpha = 0.85;
    strokeAlong(ctx, shift(sp, -w * 0.45), 0, 0.04, 0.8, 4, R.darken(c.fry, 0.05));
    strokeAlong(ctx, shift(sp, w * 0.45), 0, 0.04, 0.86, 4, R.darken(c.fry, 0.08));
    ctx.restore();
  }
  fryBody(ctx, R, sp, w, c, bodyOpt);

  // cucurucho delantero (forma 0)
  if (f === 0 && !P.lying) drawCone(ctx, R, coneBase(legBase));
  if (f === 0 && P.lying) drawConeLying(ctx, R, legBase, P.lying);

  // glitter GOD
  if (f === 4) {
    for (let i = 0; i < 6; i++) {
      const tw = Math.sin(t * 0.18 + i * 1.7);
      if (tw <= 0) continue;
      const p = off(at(sp, 0.12 + frac(i * 0.41) * 0.8), (frac(i * 0.73) - 0.5) * w * 0.7);
      R.sparkle(ctx, p[0], p[1], 1 + tw * 2.8, "#ffffff");
    }
  }

  // ---------------- cara ----------------
  ctx.save();
  ctx.translate(faceQ.x, faceQ.y);
  let fr = faceQ.a;
  if (P.lying === "slide") fr = faceQ.a - 1.1;
  if (P.lying === "back") fr = faceQ.a + 1.2;
  ctx.rotate(fr);
  face(ctx, R, pose, w, f, P.mood, P.mouth, t);
  ctx.restore();

  if (f === 4) {
    const ct = along(tip, w * 0.08);
    crown(ctx, R, ct[0], ct[1], tip.a, t);
  }

  // ---------------- delante ----------------
  if (!P.lying && !P.wall) {
    const lbx = legBase.x, lby = legBase.y;
    const legW = f === 0 ? 5 : multi ? w * 0.7 : w * 0.24;
    leg(ctx, R, lbx + legW, lby, F.legL, P.legF[0], P.legF[1], c);
    if (P.flex) handF = flexArm(ctx, R, shF, 1, P, armLen, c);
    else handF = drawArm(shF, P.armF, true);
  } else if (P.wall) {
    const hx = w * 0.5 + 9;
    leg(ctx, R, legBase.x + 3, legBase.y - 2, F.legL * 0.9, 1.9, 4, c);
    handF = thinLimb(ctx, R, shF[0], shF[1], hx + 1, shF[1] + 2, 4, c, true);
  } else if (P.lying === "slide") {
    const sq = at(sp, 0.66);
    const s0 = off(sq, 3);
    handF = thinLimb(ctx, R, s0[0], s0[1], tip.x + 20, tip.y + 4 + Math.sin(t * 0.3 + 1) * 2, 3, c, true);
  } else if (P.lying === "back") {
    const sq = at(sp, 0.55);
    const s0 = off(sq, w * 0.3);
    handF = thinLimb(ctx, R, s0[0], s0[1], s0[0] + 4, s0[1] - 14 + Math.sin(t * 0.2) * 2, 3, c, true);
  }

  // objeto en la mano delantera
  if (handF) {
    const [hx, hy] = handF;
    const gold = f === 4;
    const flen = f === 2 ? 30 : 34;
    if (P.item === "fork") {
      const aa = P.armF.ang;
      fork(ctx, R, hx, hy, Math.PI / 2 - aa + 0.12 * Math.sin(aa), flen, gold);
    } else if (P.item === "forkUp") {
      fork(ctx, R, hx, hy, -Math.PI / 2 + 0.25, flen, gold);
    } else if (P.item === "spin") {
      fork(ctx, R, hx, hy, P.spin, withForkLen(f), gold);
    } else if (P.item === "salt") {
      saltShaker(ctx, R, hx, hy - 3, Math.PI + 0.3 + Math.sin(t * 1.3) * 0.35);
    } else if (P.item === "ketchup") {
      ketchupBottle(ctx, R, hx + 4, hy, 0.35, P.squeeze);
    }
    glove(ctx, R, hx, hy, 4.2);
  }

  // ---------------- efectos ----------------
  if (P.fx) drawFx(ctx, R, P, sp, handF, t, f, w);
  if (P.fx && P.fx.kind === "oil") drawOil(ctx, R, sp, P.fx.k, t, true);
  if (P.lying === "slide") speedLines(ctx, R, sp, t, w);
  if (pose.state === "dead") dizzy(ctx, R, tip.x - 4, tip.y - w * 0.9, t);

  ctx.restore();
}

function withForkLen(f) { return f < 2 ? 24 : 30; }

function flexArm(ctx, R, sh, side, P, armLen, c) {
  const up = 6 + P.flexK * 3;
  const ex = sh[0] + side * armLen * 0.75, ey = sh[1] - 2 * P.flex;
  const hx = ex - side * 2, hy = ey - armLen * 0.7 * P.flex - up * 0.2;
  thinLimb(ctx, R, sh[0], sh[1], ex, ey, side * 2, c, false);
  // bíceps
  const bx = (sh[0] + ex) / 2, by = (sh[1] + ey) / 2 - 2.5;
  R.ellipse(ctx, bx, by, 4 + P.flexK * 1.5, 3 + P.flexK * 1.8, c.limb, { lw: 1.4 });
  thinLimb(ctx, R, ex, ey, hx, hy, 0, c, side > 0 ? false : 3.8);
  if (side > 0 && P.flexK > 0.6) R.sparkle(ctx, bx + 4, by - 8, 3 * P.flexK, "#fff6c0");
  return side > 0 ? [hx, hy] : null;
}

function coneBase(lb) {
  return { x: lb.x, y: lb.y, a: lb.a || 0 };
}

function drawCone(ctx, R, cb) {
  ctx.save();
  ctx.translate(cb.x, cb.y);
  ctx.rotate(cb.a);
  const pts = [[-12, 0], [12, 0], [22, -40], [-22, -40]];
  ctx.beginPath();
  ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
  ctx.lineTo(22, -40);
  ctx.quadraticCurveTo(0, -35, -22, -40);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#e8322a";
  for (let i = -3; i <= 3; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i * 3.2, 0); ctx.lineTo(i * 3.2 + 3.2, 0);
    ctx.lineTo(i * 6.4 + 6.4, -42); ctx.lineTo(i * 6.4, -42);
    ctx.closePath(); ctx.fill();
  }
  const g = ctx.createLinearGradient(-20, 0, 20, 0);
  g.addColorStop(0, "rgba(255,255,255,0.3)");
  g.addColorStop(0.5, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(60,0,20,0.25)");
  ctx.fillStyle = g;
  ctx.fillRect(-24, -44, 48, 46);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]);
  ctx.lineTo(22, -40);
  ctx.quadraticCurveTo(0, -35, -22, -40);
  ctx.closePath();
  R.paint(ctx, null, { lw: R.LINE });
  // ribete del borde
  ctx.beginPath();
  ctx.moveTo(-22, -40); ctx.quadraticCurveTo(0, -35, 22, -40);
  ctx.lineWidth = 2.4; ctx.strokeStyle = "#ffffff"; ctx.stroke();
  // estrellita (logo)
  R.star(ctx, 0, -18, 5, "#ffd84a", { lw: 1.4 });
  ctx.restore();
}

function drawConeLying(ctx, R, lb, mode) {
  ctx.save();
  ctx.translate(lb.x, lb.y);
  ctx.rotate(mode === "slide" ? -Math.PI / 2 + 0.1 : Math.PI / 2);
  ctx.translate(0, 18);
  drawCone(ctx, R, { x: 0, y: 0, a: 0 });
  ctx.restore();
}

function drawOil(ctx, R, sp, k, t, front) {
  const mid = at(sp, 0.5);
  for (let i = 0; i < 9; i++) {
    const z = i % 2 === 0;
    if (z !== front) continue;
    const life = frac(k * 1.6 + i * 0.137);
    const ang = i * 2.1 + t * 0.03;
    const rr = 22 + (i % 3) * 5;
    const x = mid.x + Math.cos(ang) * rr * (0.6 + life * 0.4);
    const y = mid.y + 20 - life * 60 + Math.sin(ang) * 6;
    const r = 3 + (i % 4) * 1.6 + life * 2;
    ctx.save();
    ctx.globalAlpha = Math.sin(life * Math.PI) * 0.9;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = "rgba(255,214,90,0.35)";
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "#e8a020";
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, TAU); ctx.fill();
    ctx.restore();
  }
  if (!front) {
    // charco de aceite chisporroteante bajo los pies
    ctx.save();
    ctx.globalAlpha = Math.sin(Math.min(1, k * 1.2) * Math.PI) * 0.8;
    R.ellipse(ctx, 0, -1, 26, 4.5, "#ffc93a", { lw: 2, shade: false });
    ctx.restore();
  }
}

function drawFx(ctx, R, P, sp, hand, t, f, w) {
  const fx = P.fx;
  const tip = sp[sp.length - 1];
  if (fx.kind === "whack") {
    const [x, y] = along(tip, 4);
    ctx.save();
    ctx.globalAlpha = fx.k;
    R.star(ctx, x + 10, y, 8 + fx.k * 4, "#fff6a8", { points: 6, inner: 0.5, lw: 2 });
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(x - 6, y + 4 + i * 6); ctx.lineTo(x - 18 - i * 3, y + 8 + i * 7); ctx.stroke();
    }
    ctx.restore();
  } else if (fx.kind === "thrust" && hand) {
    ctx.save();
    ctx.globalAlpha = fx.k * 0.9;
    const x = hand[0] + 34, y = hand[1];
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    for (const dy of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(hand[0] - 4, y + dy); ctx.lineTo(hand[0] + 18, y + dy * 0.5); ctx.stroke(); }
    R.sparkle(ctx, x + 4, y, 6 + fx.k * 5, "#fff6c0");
    ctx.restore();
  } else if (fx.kind === "salt" && hand) {
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const life = frac(t * 0.05 + i * 0.071);
      const x = hand[0] + 4 + (frac(i * 0.37) - 0.3) * 18 + life * 10;
      const y = hand[1] + 6 + life * 50;
      ctx.globalAlpha = 1 - life;
      ctx.fillStyle = "#ffffff";
      ctx.save(); ctx.translate(x, y); ctx.rotate(i + t * 0.2);
      ctx.fillRect(-1.3, -1.3, 2.6, 2.6);
      ctx.strokeStyle = R.alpha(R.INK, 0.5); ctx.lineWidth = 0.6; ctx.strokeRect(-1.3, -1.3, 2.6, 2.6);
      ctx.restore();
    }
    ctx.restore();
  } else if (fx.kind === "ketchup" && hand) {
    const x0 = hand[0] + 4 + Math.cos(0.35) * 13, y0 = hand[1] + Math.sin(0.35) * 13;
    const len = 30 + fx.k * 20;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + len * 0.6, y0 + 2, x0 + len, y0 + 16 + Math.sin(t * 0.5) * 2);
    ctx.lineCap = "round";
    ctx.strokeStyle = R.INK; ctx.lineWidth = 7.5; ctx.stroke();
    ctx.strokeStyle = KETCHUP; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.2; ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const life = frac(t * 0.06 + i / 3);
      R.ellipse(ctx, x0 + len + 4 + life * 12, y0 + 18 + life * 14, 3 - life, 3.4 - life, KETCHUP, { lw: 1.6 });
    }
    ctx.restore();
  } else if (fx.kind === "victory") {
    for (let i = 0; i < 5; i++) {
      const a = t * 0.05 + (i * TAU) / 5;
      const tw = Math.sin(t * 0.2 + i * 1.3);
      if (tw > 0) R.sparkle(ctx, Math.cos(a) * 40, -55 + Math.sin(a) * 36, 2 + tw * 3.5, i % 2 ? "#fff6c0" : "#ffffff");
    }
    // líneas de viento
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const k = frac(t * 0.04 + i / 3);
      const y = -70 + i * 16;
      ctx.beginPath(); ctx.moveTo(30 - k * 80, y); ctx.lineTo(18 - k * 80, y); ctx.stroke();
    }
    ctx.restore();
  }
}

function speedLines(ctx, R, sp, t, w) {
  const b = sp[0];
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const k = frac(t * 0.08 + i * 0.27);
    const y = b.y - w * 0.4 + i * (w * 0.3);
    ctx.globalAlpha = 1 - k;
    ctx.lineWidth = 2 - k;
    ctx.beginPath(); ctx.moveTo(b.x - 20 - k * 30, y); ctx.lineTo(b.x - 32 - k * 40, y); ctx.stroke();
  }
  ctx.restore();
  // chispas del suelo
  for (let i = 0; i < 3; i++) {
    const k = frac(t * 0.1 + i / 3);
    R.sparkle(ctx, b.x - 8 - k * 26, -2 - k * 6, 2.4 * (1 - k), "#fff3c4");
  }
}

function dizzy(ctx, R, x, y, t) {
  for (let i = 0; i < 3; i++) {
    const a = t * 0.1 + (i * TAU) / 3;
    R.star(ctx, x + Math.cos(a) * 12, y + Math.sin(a) * 4, 3.4, "#ffe27a", { lw: 1.2 });
  }
}

export default { id: "frita", draw };
