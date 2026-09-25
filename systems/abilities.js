// ============================================================================
// PIZZA · porción de pizza (diseño original) · v2
// ----------------------------------------------------------------------------
// Porción con la punta hacia abajo: corteza = "pelo", cara en la parte ancha,
// queso que gotea y se estira con pose.sway / pose.bounce. Carrera waddle.
//   0 Porcioncita · mini, un pepperoni, ojazos
//   1 Pizza       · pepperonis + aceitunas
//   2 Picante     · jalapeños, cuernos-guindilla, llamitas
//   3 Familiar    · ancha, doble corteza, gorro de chef
//   4 PIZZA GOD   · halo dorado, queso luminoso, pepperonis en órbita
// pose.move "bounce" → squash/stretch al rebotar sobre enemigos.
// ============================================================================
const TAU = Math.PI * 2;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const seg = (k, a, b) => ease((k - a) / Math.max(1e-6, b - a));
const frac = (x) => x - Math.floor(x);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const PAL = [
  { cheese: "#ffd66a", crust: "#eaa64e", sauce: "#e0452c", dough: "#f0b868", shoe: "#9a4a22", rim: "#f8e8a8" },
  { cheese: "#ffcc48", crust: "#e0963e", sauce: "#d83a26", dough: "#eaae5e", shoe: "#9a4a22", rim: "#ffe8a0" },
  { cheese: "#ffc23a", crust: "#d8843a", sauce: "#e0301e", dough: "#e8a456", shoe: "#5a2a2a", rim: "#ffd090" },
  { cheese: "#ffd24e", crust: "#e0983e", sauce: "#d83a26", dough: "#eab060", shoe: "#9a4a22", rim: "#fff0b0" },
  { cheese: "#fff0a0", crust: "#ffcf3a", sauce: "#ff7a3a", dough: "#ffd46a", shoe: "#e8a41a", rim: "#fffbe8" },
];
const PEP = "#c8322a";
const PEP_GOD = "#e84838";

const FORM = [
  { W: 60, legL: 13, top: -80, crH: 14, rT: 13, rB: 16, er: 9.5, arm: 13, fv: 0.33 },
  { W: 66, legL: 17, top: -84, crH: 14, rT: 8,  rB: 7,  er: 7.4, arm: 16, fv: 0.34 },
  { W: 68, legL: 18, top: -84, crH: 14, rT: 8,  rB: 7,  er: 7.4, arm: 17, fv: 0.34 },
  { W: 96, legL: 16, top: -72, crH: 13, rT: 9,  rB: 9,  er: 8.6, arm: 18, fv: 0.30 },
  { W: 74, legL: 18, top: -86, crH: 15, rT: 9,  rB: 8,  er: 7.8, arm: 18, fv: 0.34 },
];

// Toppings: [kind, u∈[-1,1], v∈[0,1], r]
const TOPS = [
  [["pep", -0.05, 0.66, 6]],
  [
    ["pep", -0.80, 0.14, 5.5], ["pep", 0.05, 0.72, 5.5], ["pep", 0.72, 0.52, 4.6],
    ["olive", 0.82, 0.10, 2.8], ["olive", -0.55, 0.50, 2.8],
  ],
  [
    ["pep", -0.80, 0.14, 5.5], ["jal", 0.05, 0.72, 5], ["jal", 0.82, 0.10, 3.8],
    ["pep", 0.72, 0.52, 4.6], ["jal", -0.55, 0.50, 3.8], ["pep", -0.20, 0.38, 4.2],
  ],
  [
    ["pep", -0.86, 0.14, 6.5], ["pep", 0.02, 0.74, 6], ["pep", 0.82, 0.46, 5.5],
    ["olive", 0.86, 0.10, 3.2], ["olive", -0.62, 0.52, 3.2],
    ["mush", -0.50, 0.10, 4.6], ["basil", 0.45, 0.10, 4.2],
    ["mush", 0.55, 0.62, 4], ["basil", -0.75, 0.35, 4.2], ["pep", -0.30, 0.42, 5],
  ],
  [
    ["pep", -0.80, 0.14, 5.8], ["pep", 0.05, 0.72, 5.8], ["pep", 0.72, 0.52, 5],
    ["olive", -0.40, 0.40, 2.6], ["olive", 0.55, 0.22, 2.6],
  ],
];

// ---------------------------------------------------------------------------
// Geometría
// ---------------------------------------------------------------------------
function slicePath(ctx, F, tipY) {
  const W = F.W, top = F.top;
  ctx.beginPath();
  ctx.moveTo(0, top - 1);
  ctx.arcTo(W / 2, top, 0, tipY, F.rT);
  ctx.arcTo(0, tipY, -W / 2, top, F.rB);
  ctx.arcTo(-W / 2, top, 0, top - 1, F.rT);
  ctx.closePath();
}

function uv(F, tipY, u, v) {
  const y = F.top + v * (tipY - F.top);
  return [u * (F.W / 2) * (1 - v), y];
}

// ---------------------------------------------------------------------------
// Toppings
// ---------------------------------------------------------------------------
function topping(ctx, R, kind, x, y, r, t, i) {
  if (kind === "pep") {
    R.ellipse(ctx, x, y, r, r * 0.92, PEP, { lw: 2 });
    ctx.fillStyle = R.darken(PEP, 0.28);
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + i * 0.4;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.13, 0, TAU);
      ctx.fill();
    }
    R.shine(ctx, x - r * 0.35, y - r * 0.4, r * 0.35, r * 0.18, 0.65);
  } else if (kind === "olive") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.arc(x, y, r * 0.42, 0, TAU, true);
    ctx.fillStyle = "#2a2230";
    ctx.fill("evenodd");
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = R.INK;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(x - r * 0.48, y - r * 0.48, r * 0.2, 0, TAU);
    ctx.fill();
  } else if (kind === "jal") {
    R.ellipse(ctx, x, y, r, r, "#5ab84a", { lw: 1.8 });
    R.ellipse(ctx, x, y, r * 0.6, r * 0.6, "#c8ec8a", { line: false, shade: false });
    ctx.fillStyle = "#fff6d0";
    for (let k = 0; k < 4; k++) {
      const a = k * 1.57 + 0.4;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3, r * 0.13, r * 0.08, a, 0, TAU);
      ctx.fill();
    }
  } else if (kind === "mush") {
    ctx.save();
    ctx.translate(x, y);
    R.blob(ctx, [
      [-r, 0], [-r * 0.8, -r * 0.7], [0, -r], [r * 0.8, -r * 0.7], [r, 0],
      [r * 0.3, 0.2], [r * 0.3, r * 0.8], [-r * 0.3, r * 0.8], [-r * 0.3, 0.2],
    ], "#f0dcc0", { lw: 1.6 });
    ctx.fillStyle = R.alpha("#c8a888", 0.35);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.35, r * 0.55, r * 0.25, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  } else if (kind === "basil") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i * 1.3 + Math.sin(t * 0.05 + i) * 0.08);
    R.blob(ctx, [[-r, 0], [0, -r * 0.5], [r, 0], [0, r * 0.5]], "#3f9a3a", { lw: 1.4 });
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, 0);
    ctx.lineTo(r * 0.8, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Queso: goterones + hilos
// ---------------------------------------------------------------------------
function drip(ctx, R, x, y, len, w, lean, color, t, i, fillOnly) {
  const ex = x + lean;
  const ey = y + len;
  const up = len < 0;
  const br = Math.max(0.8, w * 0.62);
  ctx.beginPath();
  ctx.moveTo(x - w * 1.3, y - 5);
  ctx.quadraticCurveTo(x - w * 0.35, y + len * 0.25, ex - br * 0.8, ey - (up ? -1 : 1) * br * 0.4);
  ctx.arc(ex, ey, br, Math.PI + 0.2 * (up ? -1 : 1), -0.2 * (up ? -1 : 1), !up);
  ctx.quadraticCurveTo(x + w * 0.35, y + len * 0.25, x + w * 1.3, y - 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (fillOnly) return;
  ctx.lineWidth = R.LINE * 0.8;
  ctx.strokeStyle = R.INK;
  ctx.lineJoin = "round";
  ctx.stroke();
  R.shine(ctx, ex - br * 0.35, ey - br * 0.3, br * 0.3, br * 0.18, 0.7);
  // gota que se desprende
  const life = frac(t * 0.018 + i * 0.37);
  if (life > 0.55 && len > 4) {
    const k = (life - 0.55) / 0.45;
    const dy = ey + 4 + k * k * 34;
    ctx.globalAlpha = 1 - k;
    R.ellipse(ctx, ex + lean * 0.2, dy, w * 0.48, w * 0.6, color, { lw: 1.3, shade: false });
    ctx.globalAlpha = 1;
  }
}

function cheeseString(ctx, R, x1, y1, x2, y2, sag, color) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.lineCap = "round";
  ctx.strokeStyle = R.INK;
  ctx.lineWidth = 4.2;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Corteza, guindillas, llamas, gorro
// ---------------------------------------------------------------------------
function crust(ctx, R, F, c, y0, W, t, gold) {
  const h = F.crH;
  const pts = [
    [-W / 2, y0 + 4], [-W / 2 - 2.5, y0 - h * 0.45], [-W * 0.42, y0 - h * 0.92],
    [-W * 0.22, y0 - h * 1.05], [0, y0 - h * 0.94], [W * 0.22, y0 - h * 1.06],
    [W * 0.42, y0 - h * 0.92], [W / 2 + 2.5, y0 - h * 0.45], [W / 2, y0 + 4],
    [W * 0.25, y0 + 5.5], [-W * 0.25, y0 + 5.5],
  ];
  R.blob(ctx, pts, c.crust, { lw: R.LINE });

  // labio interior (salsa)
  ctx.beginPath();
  ctx.moveTo(-W * 0.42, y0 + 1.5);
  ctx.quadraticCurveTo(0, y0 + 4.2, W * 0.42, y0 + 1.5);
  ctx.strokeStyle = R.alpha(R.darken(c.crust, 0.35), 0.6);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // tostado
  ctx.save();
  ctx.fillStyle = R.alpha(R.darken(c.crust, 0.32), 0.38);
  for (let i = 0; i < 6; i++) {
    const x = -W * 0.42 + i * W * 0.17 + Math.sin(i * 3.1) * 2.5;
    ctx.beginPath();
    ctx.ellipse(x, y0 - h * 0.4 + Math.cos(i * 2.3) * 2, 2.5, 1.25, 0.25, 0, TAU);
    ctx.fill();
  }
  // harina
  ctx.fillStyle = R.alpha("#fff8e8", gold ? 0.45 : 0.28);
  for (let i = 0; i < 4; i++) {
    const x = -W * 0.35 + i * W * 0.22;
    ctx.beginPath();
    ctx.arc(x + Math.sin(i * 2) * 2, y0 - h * 0.65, 1.1, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  R.shine(ctx, -W * 0.24, y0 - h * 0.72, W * 0.12, h * 0.16, gold ? 0.85 : 0.55);
  if (gold) {
    ctx.save();
    ctx.shadowColor = "#fff6c0";
    ctx.shadowBlur = 8;
    R.sparkle(ctx, W * 0.3, y0 - h * 0.72, 2.6 + Math.sin(t * 0.25) * 1.4, "#ffffff");
    R.sparkle(ctx, -W * 0.18, y0 - h * 0.55, 1.8 + Math.cos(t * 0.2) * 1, "#fff8d0");
    ctx.restore();
  }
}

function chili(ctx, R, x, y, side, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(side, 1);
  ctx.rotate(Math.sin(t * 0.09) * 0.07);
  R.blob(ctx, [[-4, 0], [4, 0], [9, -10], [11, -20], [8, -26], [5, -18], [-1, -8]], "#e8281c", { lw: 2.2 });
  R.shine(ctx, 5, -14, 1.2, 4, 0.55);
  R.blob(ctx, [[-5, 2], [5, 2], [3, -2], [-3, -2]], "#4aa83a", { lw: 1.8, shade: false });
  ctx.restore();
}

function flame(ctx, R, x, y, h, t, i) {
  const cu = Math.sin(t * 0.42 + i * 1.7) * 2.2;
  for (const [k, col, a] of [[1, "#ff6a1a", 0.92], [0.6, "#ffd23a", 0.96], [0.28, "#fff6c8", 0.85]]) {
    ctx.beginPath();
    ctx.moveTo(x + cu * k, y - h * k);
    ctx.bezierCurveTo(x + 5.2 * k, y - h * 0.5 * k, x + 4.6 * k, y, x, y + 1.6);
    ctx.bezierCurveTo(x - 4.6 * k, y, x - 5.2 * k, y - h * 0.5 * k, x + cu * k, y - h * k);
    ctx.fillStyle = R.alpha(col, a);
    ctx.fill();
  }
}

function chefHat(ctx, R, x, y, t, sway) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.08 + sway * 0.06 + Math.sin(t * 0.05) * 0.025);
  R.blob(ctx, [
    [-13, 0], [-15, -12], [-20, -20], [-12, -30], [-3, -27],
    [4, -33], [14, -27], [19, -17], [14, -10], [13, 0],
  ], "#ffffff", { lw: R.LINE });
  ctx.fillStyle = "rgba(160,170,200,0.32)";
  ctx.beginPath();
  ctx.ellipse(6, -18, 5, 8, 0.2, 0, TAU);
  ctx.fill();
  R.blob(ctx, [[-14, 2], [14, 2], [14, -6], [-14, -6]], "#f2f2f6", { lw: 2.4, shade: false });
  ctx.strokeStyle = R.alpha(R.INK, 0.32);
  ctx.lineWidth = 1;
  for (const lx of [-6, 1, 8]) {
    ctx.beginPath();
    ctx.moveTo(lx, -10);
    ctx.lineTo(lx + 1, -3);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Pose → parámetros animados
// ---------------------------------------------------------------------------
function params(pose, f) {
  const st = pose.state;
  const t = pose.t;
  const P = {
    roll: Math.sin(t * 0.04) * 0.025,
    bx: 0,
    lift: 0,
    sx: 1,
    sy: 1,
    legF: [0.1, 2],
    legB: [-0.1, -2],
    armF: { ang: 0.5 + pose.breath * 0.08, bend: 3 },
    armB: { ang: -0.5 - pose.breath * 0.08, bend: -3 },
    mood: "normal",
    mouth: "smile",
    dripK: 1 - pose.bounce * 1.1,
    strings: 0,
    fx: null,
    look: 0,
    glow: 0,
  };
  const heavy = f >= 3;

  if (st === "run") {
    const ph = pose.phase;
    const s = Math.sin(ph);
    P.roll = s * 0.16;
    P.bx = s * 2.2;
    P.lift = -Math.abs(Math.cos(ph)) * 3.6;
    P.legF = [Math.max(0, s) * 0.85 - 0.1, 3];
    P.legB = [Math.max(0, -s) * 0.85 - 0.1, 3];
    P.armF = { ang: 1.25 + s * 0.55, bend: 4 };
    P.armB = { ang: -1.25 + s * 0.55, bend: -4 };
    P.mouth = "open";
    P.strings = Math.min(1, Math.abs(pose.sway) + pose.speed * 0.65);
  } else if (st === "jump") {
    P.legF = [0.95, 4];
    P.legB = [0.55, 4];
    P.armF = { ang: 2.65, bend: 4 };
    P.armB = { ang: -2.65, bend: -4 };
    P.mouth = "open";
    P.strings = 0.85;
    P.lift = -2;
  } else if (st === "fall" || st === "glide") {
    P.legF = [0.25 + Math.sin(t * 0.5) * 0.22, -2];
    P.legB = [-0.3 - Math.sin(t * 0.5) * 0.22, 2];
    P.armF = { ang: 2.05 + Math.sin(t * 0.4) * 0.32, bend: 3 };
    P.armB = { ang: -2.05 - Math.sin(t * 0.4 + 1) * 0.32, bend: -3 };
    if (st === "glide") {
      P.armF.ang = 1.65;
      P.armB.ang = -1.65;
    }
    P.mouth = "o";
    P.strings = 0.65;
  } else if (st === "attack") {
    const k = pose.atk;
    const ant = seg(k, 0, 0.28);
    const hit = seg(k, 0.28, 0.52);
    const rec = seg(k, 0.62, 1);
    P.mood = "angry";
    P.mouth = hit > 0.45 && rec < 0.55 ? "grin" : "open";
    if (!heavy) {
      P.roll = -0.14 * ant + 0.32 * hit - 0.18 * rec;
      P.bx = 6 * hit - 5 * rec;
      P.armF = { ang: 0.4 - 2.4 * ant + 4.2 * hit - 1.7 * rec, bend: 5 - 8 * hit, len: 1 + 0.28 * hit };
      P.armB = { ang: -0.85, bend: -3 };
      P.legF = [0.45 * hit, 2];
      P.legB = [-0.45 * hit, -2];
      if (hit > 0.25 && rec < 0.85) P.fx = { kind: "slap", k: hit * (1 - rec) };
    } else {
      P.roll = -0.24 * ant + 0.78 * hit - 0.55 * rec;
      P.bx = 5 * hit - 4 * rec;
      P.armF = { ang: -0.85 * hit, bend: 3 };
      P.armB = { ang: -1.5 * hit - 0.4, bend: -3 };
      P.legF = [0.55 * hit, 3];
      P.legB = [-0.65 * hit, -3];
      if (hit > 0.35 && rec < 0.85) P.fx = { kind: "bonk", k: hit * (1 - rec) };
    }
  } else if (st === "cast") {
    const k = pose.cast;
    const slot = pose.castSlot;
    if (slot === 0) {
      // J · Disco pepperoni
      const wind = seg(k, 0, 0.32);
      const thr = seg(k, 0.32, 0.55);
      P.roll = -0.18 * wind + 0.28 * thr;
      P.armF = { ang: -2.0 * wind + 3.4 * thr + 0.35, bend: 3 - 6.5 * thr };
      P.armB = { ang: 0.9 * wind - 0.85, bend: -3 };
      P.fx = { kind: "disc", k: thr, t: k };
      P.mood = "angry";
      P.mouth = thr > 0.45 ? "grin" : "flat";
      P.legF = [0.4 * thr, 2];
      P.legB = [-0.4 * thr, -2];
    } else if (slot === 1) {
      // K · Hilo de queso
      P.roll = 0.1;
      P.armF = null;
      P.armB = { ang: -1.05, bend: -3 };
      P.fx = { kind: "lasso", k };
      P.mood = "normal";
      P.mouth = "open";
      P.legF = [0.4, 2];
      P.legB = [-0.4, -2];
      P.strings = 0.4 + k * 0.5;
    } else {
      // L · Horno total
      P.glow = Math.sin(Math.min(1, k * 1.25) * Math.PI * 0.5 + 0.25);
      P.bx = Math.sin(t * 1.8) * 1.4;
      P.armF = { ang: 1.05, bend: 5 };
      P.armB = { ang: -1.05, bend: -5 };
      P.legF = [0.35, 2];
      P.legB = [-0.35, -2];
      P.fx = { kind: "oven", k };
      P.mood = "angry";
      P.mouth = "roar";
      P.dripK = 1.7;
    }
  } else if (st === "hurt") {
    P.roll = -0.34;
    P.bx = -3.5;
    P.armF = { ang: 2.35, bend: 4 };
    P.armB = { ang: -2.45, bend: -4 };
    P.legF = [0.65, 3];
    P.legB = [-0.12, -2];
    P.mood = "hurt";
    P.mouth = "o";
    P.dripK = -0.85;
    P.fx = { kind: "splash" };
  } else if (st === "wall") {
    P.roll = 0.12;
    P.wall = true;
    P.mouth = "flat";
  } else if (st === "dead") {
    P.dead = true;
    P.mood = "dead";
    P.mouth = "o";
  } else if (st === "victory") {
    const j = Math.abs(Math.sin(t * 0.09));
    P.lift = -j * 17;
    P.roll = Math.sin(t * 0.09) * 0.07;
    P.armF = { ang: 2.85, bend: 3 };
    P.armB = { ang: -2.85, bend: -3 };
    P.legF = [0.75 * j, 4];
    P.legB = [0.35 * j, 4];
    P.mood = "happy";
    P.mouth = "grin";
    P.dripK = 1 - Math.cos(t * 0.18) * 1.7;
    P.fx = { kind: "victory", j };
  }

  if (pose.move === "bounce") {
    const q = clamp(-pose.vy * 0.3 + Math.sin(t * 0.35) * 0.1, -0.3, 0.3);
    P.sx = 1 - q;
    P.sy = 1 + q;
    P.armF = { ang: 1.95, bend: 3 };
    P.armB = { ang: -1.95, bend: -3 };
    P.legF = [0.28, 2];
    P.legB = [-0.28, -2];
    P.mood = "happy";
    P.mouth = "open";
    P.fx = { kind: "boing", q };
  }

  // idle flourishes
  if (st === "idle" && pose.flourish > 0) {
    const k = pose.flourish;
    const n = pose.flourishN % 3;
    const b = Math.sin(k * Math.PI);
    if (n === 0) {
      P.drool = k < 0.55 ? seg(k, 0.05, 0.5) : 1 - seg(k, 0.6, 0.85);
      P.mood = k < 0.55 ? "normal" : "closed";
      P.mouth = k < 0.55 ? "open" : k < 0.85 ? "o" : "smile";
      P.armF = { ang: 0.95, bend: 4 };
      P.dripK = 1.35 + b * 0.85;
    } else if (n === 1) {
      P.spin = Math.cos(k * TAU * 2);
      P.lift = -b * 11;
      P.armF = { ang: 2.85, bend: 2 };
      P.armB = { ang: -2.85, bend: -2 };
      P.mood = "happy";
      P.mouth = "open";
      P.dripK = -0.65 * b + 1 - b;
    } else {
      P.armF = { ang: 2.95, bend: -3, len: 1.12 };
      P.sprinkle = b;
      P.look = -0.65;
      P.mood = "happy";
      P.mouth = "smile";
      P.roll = -0.06 * b;
    }
  }

  // aterrizaje: squash
  if (pose.land > 0.05) {
    const L = pose.land;
    P.sx = lerp(P.sx, 1.12, L);
    P.sy = lerp(P.sy, 0.88, L);
  }

  return P;
}

// ---------------------------------------------------------------------------
// Cara
// ---------------------------------------------------------------------------
function faceDraw(ctx, R, pose, P, F, tipY, f) {
  const [cx, cy] = uv(F, tipY, 0.12, F.fv);
  const er = F.er;
  const e1 = [cx - er * 1.05, cy];
  const e2 = [cx + er * 1.25, cy - 0.5];
  const iris = f === 4 ? "#d08a10" : f === 2 ? "#7a2a10" : "#5a3418";
  const look = { x: 1, y: P.look || (pose.look && pose.look.y) || 0 };
  const pz = { ...pose, look };

  if (P.mood === "dead") {
    for (const [ex, ey] of [e1, e2]) {
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.6, ey - er * 0.6);
      ctx.lineTo(ex + er * 0.6, ey + er * 0.6);
      ctx.moveTo(ex + er * 0.6, ey - er * 0.6);
      ctx.lineTo(ex - er * 0.6, ey + er * 0.6);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = R.INK;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  } else {
    const m = P.mood === "hurt" ? "closed" : P.mood;
    R.eye(ctx, e1[0], e1[1], er, pz, { iris, mood: m, lash: f === 0 });
    R.eye(ctx, e2[0], e2[1], er * 0.88, pz, { iris, mood: m });
    if (P.mood === "hurt") {
      ctx.beginPath();
      ctx.moveTo(e1[0] - er, e1[1] - er * 1.3);
      ctx.lineTo(e1[0] + er * 0.6, e1[1] - er * 0.9);
      ctx.moveTo(e2[0] + er, e2[1] - er * 1.3);
      ctx.lineTo(e2[0] - er * 0.5, e2[1] - er * 0.9);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = R.INK;
      ctx.stroke();
    }
    if (f === 2 && P.mood === "normal") {
      ctx.beginPath();
      ctx.moveTo(e1[0] - er * 0.8, e1[1] - er * 1.4);
      ctx.lineTo(e1[0] + er * 0.6, e1[1] - er * 1.15);
      ctx.moveTo(e2[0] + er * 0.8, e2[1] - er * 1.35);
      ctx.lineTo(e2[0] - er * 0.5, e2[1] - er * 1.15);
      ctx.lineWidth = 2;
      ctx.strokeStyle = R.INK;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  R.blush(ctx, e1[0] - er * 0.4, cy + er * 1.3, er * 0.55, f === 2 ? "#ff3a2a" : "#ff7aa0");
  R.blush(ctx, e2[0] + er * 0.5, cy + er * 1.25, er * 0.45, f === 2 ? "#ff3a2a" : "#ff7aa0");
  const mm = P.mouth === "smile" && f === 2 ? "fang" : P.mouth;
  R.mouth(ctx, cx + er * 0.15, cy + er * 1.55, f === 0 ? 8 : 7.5, mm);
}

// ---------------------------------------------------------------------------
// Órbita GOD
// ---------------------------------------------------------------------------
function orbit(ctx, R, F, t, front) {
  for (let i = 0; i < 4; i++) {
    const a = t * 0.065 + (i * TAU) / 4;
    const z = Math.sin(a);
    if ((z > 0) !== front) continue;
    const x = Math.cos(a) * F.W * 0.74;
    const y = -52 + z * 12 + Math.sin(a * 2) * 4;
    const s = 0.72 + z * 0.22;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.shadowColor = "#ffd84a";
    ctx.shadowBlur = 10;
    R.ellipse(ctx, 0, 0, 6.2, 5.7, PEP_GOD, { lw: 2 });
    ctx.restore();
    ctx.fillStyle = R.darken(PEP, 0.28);
    ctx.beginPath();
    ctx.arc(x + 1.4 * s, y - 1 * s, 1.05 * s, 0, TAU);
    ctx.fill();
    R.shine(ctx, x - 2 * s, y - 2 * s, 1.7 * s, 0.95 * s, 0.75);
  }
}

// ---------------------------------------------------------------------------
// FX de combate / habilidades
// ---------------------------------------------------------------------------
function fx(ctx, R, P, F, tipY, hand, t, c, shX, shY) {
  const e = P.fx;

  if (P.sprinkle > 0 && hand) {
    for (let i = 0; i < 14; i++) {
      const life = frac(t * 0.03 + i * 0.071);
      const x = hand[0] - 4 - life * 16 + (frac(i * 0.37) - 0.5) * 22;
      const y = hand[1] + 4 + life * 42;
      ctx.save();
      ctx.globalAlpha = P.sprinkle * (1 - life * 0.72);
      ctx.translate(x, y);
      ctx.rotate(i + t * 0.15);
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.7, 1.55, 0, 0, TAU);
      ctx.fillStyle = i % 3 ? "#5ab84a" : "#2f8a2a";
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = R.INK;
      ctx.stroke();
      ctx.restore();
    }
  }

  if (!e) return;

  if (e.kind === "slap" && hand) {
    ctx.save();
    ctx.globalAlpha = e.k;
    R.star(ctx, hand[0] + 8, hand[1] - 2, 7 + e.k * 5.5, "#fff6a8", { points: 6, inner: 0.5, lw: 2 });
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const a = -0.65 + i * 0.65;
      ctx.beginPath();
      ctx.moveTo(hand[0] + 12 + Math.cos(a) * 8, hand[1] + Math.sin(a) * 8);
      ctx.lineTo(hand[0] + 12 + Math.cos(a) * 16, hand[1] + Math.sin(a) * 16);
      ctx.stroke();
    }
    ctx.restore();
  } else if (e.kind === "bonk") {
    ctx.save();
    ctx.globalAlpha = e.k;
    const x = F.W * 0.52 + 6;
    const y = F.top - 4;
    R.star(ctx, x, y, 10 + e.k * 6, "#fff6a8", { points: 7, inner: 0.48, lw: 2 });
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-F.W * 0.52 - 4, F.top + i * 8);
      ctx.lineTo(-F.W * 0.52 - 15, F.top + 6 + i * 9);
      ctx.stroke();
    }
    ctx.restore();
  } else if (e.kind === "disc" && hand) {
    if (e.k < 0.48) {
      R.ellipse(ctx, hand[0], hand[1] - 3, 6.2, 5.6, PEP, { lw: 2 });
      R.shine(ctx, hand[0] - 2, hand[1] - 5, 2, 1.2, 0.7);
    } else {
      const d = (e.t - 0.42) * 140;
      const x = hand[0] + 6 + d;
      const y = hand[1] - 6 - d * 0.12;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.52);
      ctx.rotate(t * 0.9);
      R.ellipse(ctx, 0, 0, 8.5, 8.5, PEP, { lw: 2.4 });
      ctx.fillStyle = R.darken(PEP, 0.28);
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(Math.cos(k * 2.1) * 4.2, Math.sin(k * 2.1) * 4.2, 1.3, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.7;
      ctx.lineCap = "round";
      for (const dy of [-5, 0, 5]) {
        ctx.beginPath();
        ctx.moveTo(x - 14, y + dy);
        ctx.lineTo(x - 24 - Math.abs(dy), y + dy);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else if (e.kind === "lasso") {
    const reach = 22 + seg(e.k, 0, 0.55) * 54;
    const ex = shX + reach;
    const ey = shY - 12 - reach * 0.28;
    ctx.save();
    ctx.lineCap = "round";
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.bezierCurveTo(
        shX + reach * 0.28, shY + 12 + Math.sin(t * 0.5) * 6,
        shX + reach * 0.62, ey - 14 + Math.cos(t * 0.5) * 6,
        ex, ey
      );
    };
    path();
    ctx.strokeStyle = R.INK;
    ctx.lineWidth = 5.2 + R.LINE * 1.4;
    ctx.stroke();
    path();
    ctx.strokeStyle = c.cheese;
    ctx.lineWidth = 5;
    ctx.stroke();
    // lazo
    const lr = 9 + Math.sin(t * 0.42) * 1.8;
    ctx.translate(ex + lr * 0.85, ey - 2);
    ctx.rotate(Math.sin(t * 0.32) * 0.45 - 0.28);
    ctx.beginPath();
    ctx.ellipse(0, 0, lr, lr * 0.58, 0, 0, TAU);
    ctx.strokeStyle = R.INK;
    ctx.lineWidth = 4.2 + R.LINE * 1.2;
    ctx.stroke();
    ctx.strokeStyle = c.cheese;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const life = frac(t * 0.04 + i * 0.33);
      R.ellipse(
        ctx,
        shX + reach * (0.35 + i * 0.22),
        shY + 8 + life * 20,
        2.1, 2.5, c.cheese, { lw: 1.2, shade: false }
      );
    }
  } else if (e.kind === "oven") {
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const life = frac(t * 0.028 + i * 0.17);
      const x = (i - 2.5) * 11 + Math.sin(t * 0.12 + i) * 5;
      const y = F.top - 12 - life * 38;
      ctx.globalAlpha = (1 - life) * 0.75;
      ctx.fillStyle = i % 2 ? "#ffffff" : "#ffe8c0";
      ctx.beginPath();
      ctx.arc(x, y, 3.2 + life * 7, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = "#ff8a3a";
    ctx.lineWidth = 1.9;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      const x0 = side * (F.W * 0.52 + 10);
      ctx.beginPath();
      for (let k = 0; k <= 7; k++) {
        const y = F.top + 8 + k * 7;
        const x = x0 + Math.sin(k * 1.5 + t * 0.45) * 3.5;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.shadowColor = "#ff5a1a";
    ctx.shadowBlur = 12;
    R.sparkle(ctx, F.W * 0.42, F.top + 6, 3.2 + Math.sin(t * 0.5) * 1.6, "#ffd23a");
    R.sparkle(ctx, -F.W * 0.35, F.top + 18, 2.4 + Math.cos(t * 0.4) * 1.2, "#ff9a40");
    ctx.restore();
  } else if (e.kind === "splash") {
    for (let i = 0; i < 5; i++) {
      const a = 2.15 + i * 0.42;
      R.ellipse(ctx, -F.W * 0.55 + Math.cos(a) * 11, F.top + 28 - i * 8, 2.5, 3.1, c.cheese, { lw: 1.4, shade: false });
    }
  } else if (e.kind === "victory") {
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8 + t * 0.045;
      const r = 38 + e.j * 12;
      const x = Math.cos(a) * r;
      const y = -52 + Math.sin(a) * r * 0.78;
      if (i % 2) {
        if (Math.abs(Math.cos(a)) > 0.4) R.ellipse(ctx, x, y, 3.4, 2.7, c.cheese, { lw: 1.5, shade: false });
      } else {
        const tw = Math.sin(t * 0.22 + i);
        if (tw > 0) R.sparkle(ctx, x, y, 2.2 + tw * 3.6, "#fff6c0");
      }
    }
  } else if (e.kind === "boing") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2.1;
    ctx.lineCap = "round";
    const k = Math.abs(e.q) * 3.2;
    for (const dx of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.moveTo(dx * (1 + k * 0.3), 4);
      ctx.lineTo(dx * (1.55 + k), 9 + k * 2.2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Draw principal
// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = clamp(pose.form | 0, 0, 4);
  const c = PAL[f];
  const F = FORM[f];
  const t = pose.t;
  const P = params(pose, f);
  const tipY = -F.legL;
  const W = F.W;

  ctx.save();
  if (P.dead) {
    ctx.translate(-F.top * 0.5, -W * 0.5 - 4);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, F.legL * 0.3);
  }
  ctx.translate(P.bx, P.lift);
  ctx.rotate(P.roll);
  if (P.sx !== 1 || P.sy !== 1) ctx.scale(P.sx, P.sy);

  // --- halo GOD (detrás) ---
  if (f === 4 && !P.dead) {
    ctx.save();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#ffe27a";
    ctx.shadowColor = "#fff2a0";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(0, F.top - 2 + Math.sin(t * 0.07) * 1.6, W * 0.58, W * 0.52, 0, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "#fffbe0";
    ctx.stroke();
    ctx.restore();
    orbit(ctx, R, F, t, false);
  }

  // --- spin (masa) ---
  ctx.save();
  if (P.spin != null) {
    ctx.translate(0, (F.top + tipY) / 2);
    ctx.scale(Math.max(0.12, Math.abs(P.spin)) * Math.sign(P.spin || 1), 1);
    ctx.translate(0, -(F.top + tipY) / 2);
  }

  // --- extremidades traseras ---
  const shV = 0.46;
  const shY = F.top + shV * (tipY - F.top);
  const shX = (W / 2) * (1 - shV) - 2;
  const armC = c.dough;
  const armW = f === 0 ? 4.6 : 5.2;

  const drawArm = (sx, sy, A, back) => {
    if (!A) return null;
    const len = F.arm * (A.len || 1);
    return R.swingLimb(ctx, sx, sy, len, A.ang, A.bend, armW, back ? R.darken(armC, 0.15) : armC, { lw: 2.2 });
  };
  const legC = R.darken(c.dough, 0.08);
  const drawLeg = (x, L, back) => {
    const ex = x + Math.sin(L[0]) * F.legL;
    const ey = tipY + Math.cos(L[0]) * F.legL;
    const mx = x + Math.sin(L[0]) * F.legL * 0.5 + Math.cos(L[0]) * L[1];
    const my = tipY + Math.cos(L[0]) * F.legL * 0.5;
    R.limb(ctx, x, tipY - 4, mx, my, ex, ey, 5, back ? R.darken(legC, 0.15) : legC, { lw: 2.2, hand: false });
    R.ellipse(ctx, ex + 2.2, ey - 1.8, 5, 3.3, back ? R.darken(c.shoe, 0.2) : c.shoe, { lw: 2 });
  };

  if (P.wall) {
    drawLeg(-4, [-0.2, -2], true);
    R.limb(ctx, -shX, shY, -shX + 10, shY - 18, W / 2 + 6, F.top + 6, armW, R.darken(armC, 0.15), { lw: 2.2 });
  } else {
    drawLeg(-4, P.legB, true);
    drawArm(-shX, shY, P.armB, true);
  }

  // hilos de queso al correr / saltar
  if (P.strings > 0.05) {
    for (let i = 0; i < 3; i++) {
      const [x, y] = uv(F, tipY, -1, 0.22 + i * 0.28);
      const L = (12 + i * 7) * P.strings;
      cheeseString(
        ctx, R,
        x + 2, y,
        x - L + pose.sway * 5, y + 5 + pose.bounce * 9 + i * 3,
        5 + Math.sin(t * 0.32 + i) * 2.5,
        c.cheese
      );
    }
  }

  // --- cuerpo: porción ---
  slicePath(ctx, F, tipY);
  const g = ctx.createLinearGradient(-W * 0.3, F.top, W * 0.22, tipY);
  g.addColorStop(0, R.lighten(c.cheese, f === 4 ? 0.62 : 0.35));
  g.addColorStop(0.5, c.cheese);
  g.addColorStop(1, R.darken(c.cheese, 0.14));
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  ctx.clip();

  // salsa bajo el queso
  ctx.fillStyle = c.sauce;
  ctx.beginPath();
  ctx.moveTo(-W, F.top - 2);
  ctx.lineTo(W, F.top - 2);
  for (let i = 0; i <= 10; i++) {
    const x = W / 2 - (i / 10) * W;
    ctx.lineTo(x, F.top + 6 + (i % 2 ? 3.6 : 0) + Math.sin(i * 1.6) * 1.3);
  }
  ctx.closePath();
  ctx.fill();

  // borde salsa
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = R.alpha(c.sauce, 0.58);
  slicePath(ctx, F, tipY);
  ctx.stroke();

  // burbujas tostadas
  for (let i = 0; i < 6; i++) {
    const [x, y] = uv(F, tipY, (frac(i * 0.43 + 0.2) - 0.5) * 1.65, 0.16 + frac(i * 0.61) * 0.68);
    ctx.fillStyle = R.alpha(R.darken(c.cheese, 0.28), 0.28);
    ctx.beginPath();
    ctx.ellipse(x, y, 2.5, 1.7, 0, 0, TAU);
    ctx.fill();
  }

  // sombra lateral
  const sg = ctx.createLinearGradient(W * 0.08, 0, W * 0.52, 0);
  sg.addColorStop(0, "rgba(120,40,0,0)");
  sg.addColorStop(1, "rgba(120,40,0,0.24)");
  ctx.fillStyle = sg;
  ctx.fillRect(-W, F.top - 10, W * 2, -F.top + 10);

  R.shine(ctx, -W * 0.28, F.top + 14, 5.5, 2.5, 0.62);
  if (f === 4) {
    ctx.fillStyle = R.alpha("#ffffff", 0.16 + 0.12 * Math.sin(t * 0.12));
    ctx.fillRect(-W, F.top - 10, W * 2, -F.top + 10);
  }

  // toppings
  TOPS[f].forEach(([kind, u, v, r], i) => {
    const [x, y] = uv(F, tipY, u, v);
    topping(ctx, R, kind, x, y, r, t, i);
  });

  // glow horno
  if (P.glow > 0) {
    ctx.fillStyle = R.alpha("#ff2a10", 0.48 * P.glow + 0.1 * Math.sin(t * 0.6));
    ctx.fillRect(-W, F.top - 10, W * 2, -F.top + 10);
  }

  ctx.restore(); // clip

  slicePath(ctx, F, tipY);
  R.paint(ctx, null, { lw: R.LINE });

  // --- goterones de queso ---
  const dK = P.dripK;
  const drips =
    f === 3 ? [[-1, 0.1], [-1, 0.48], [1, 0.2], [1, 0.6], [-1, 0.78], [1, 0.78]] :
    f === 0 ? [[-1, 0.25], [1, 0.5]] :
    [[-1, 0.12], [1, 0.24], [-1, 0.58], [1, 0.7]];
  const dripCol = f === 4 ? "#fff6c0" : c.cheese;
  const dripArgs = drips.map(([side, v], i) => {
    const [x, y] = uv(F, tipY, side, v);
    const base = (5.5 + frac(i * 0.61) * 7.5) * (f === 0 ? 0.78 : 1);
    const len = base * dK + Math.sin(t * 0.07 + i * 1.9) * 1.4;
    const lean = -pose.sway * 5.5 + side * 1.6;
    return [x + side * 0.5, y + 1, len, f === 0 ? 3.3 : 3.9, lean, dripCol, t, i];
  });
  for (const a of dripArgs) drip(ctx, R, ...a, false);
  ctx.save();
  slicePath(ctx, F, tipY);
  ctx.clip();
  for (const a of dripArgs) drip(ctx, R, ...a, true);
  ctx.restore();

  // --- corteza ---
  const crY = F.top - 1 + pose.bounce * 1.3;
  ctx.save();
  ctx.translate(0, crY);
  ctx.rotate(pose.sway * 0.045);
  if (f === 3) {
    crust(ctx, R, F, c, -F.crH * 0.92, W * 0.94, t, false);
    crust(ctx, R, F, c, 0, W, t, false);
  } else {
    crust(ctx, R, F, c, 0, W, t, f === 4);
  }
  if (P.glow > 0) {
    ctx.globalAlpha = P.glow * 0.42;
    ctx.fillStyle = "#ff3a10";
    ctx.beginPath();
    ctx.ellipse(0, -F.crH * 0.4, W * 0.56, F.crH * 0.85, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (f === 2) {
    chili(ctx, R, -W * 0.3, -F.crH * 0.82, -1, t);
    chili(ctx, R, W * 0.3, -F.crH * 0.82, 1, t);
    for (let i = 0; i < 3; i++) {
      flame(ctx, R, (i - 1) * 9.5, -F.crH * 0.92, 9 + Math.sin(t * 0.32 + i * 2) * 3.2, t, i);
    }
  }
  if (f === 3) chefHat(ctx, R, 2, -F.crH * 1.72, t, pose.sway);
  ctx.restore();

  // --- cara ---
  faceDraw(ctx, R, pose, P, F, tipY, f);

  // babilla (flourish)
  if (P.drool > 0) {
    const [mx, my] = uv(F, tipY, 0.12, F.fv);
    const myy = my + F.er * 1.9;
    drip(ctx, R, mx + F.er * 0.2, myy, P.drool * (-myy - 10), 3.5, 1, c.cheese, 0, 0, false);
  }

  // --- extremidades delanteras ---
  let hand = null;
  if (P.wall) {
    drawLeg(4, [1.5, 4], false);
    hand = R.limb(ctx, shX, shY, shX + 6, shY - 6, W / 2 + 7, shY - 4, armW, armC, { lw: 2.2 });
  } else {
    drawLeg(4, P.legF, false);
    hand = drawArm(shX, shY, P.armF, false);
  }

  ctx.restore(); // spin

  if (f === 4 && !P.dead) orbit(ctx, R, F, t, true);

  // --- FX ---
  fx(ctx, R, P, F, tipY, hand, t, c, shX, shY);

  ctx.restore();
}

export default { id: "pizza", draw };
