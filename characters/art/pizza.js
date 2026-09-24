// ============================================================================
// PIZZA · porción de pizza (diseño original)
// ----------------------------------------------------------------------------
// Porción con la punta hacia abajo: la corteza arriba hace de "pelo", la cara
// va en la parte ancha, el queso gotea por los bordes y se estira con el
// movimiento (pose.sway / pose.bounce). Carrera de contoneo (waddle).
//   0 Porcioncita · mini y redondeada, un pepperoni, ojazos
//   1 Pizza       · pepperonis y aceitunas
//   2 Picante     · jalapeños, dos guindillas como cuernos, llamitas
//   3 Familiar    · mucho más ancha, doble corteza, gorro de chef
//   4 PIZZA GOD   · corteza dorada tipo halo, queso luminoso, pepperonis orbitando
// pose.move "bounce" → aplastada / estirada al rebotar.
// ============================================================================

const TAU = Math.PI * 2;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const seg = (k, a, b) => ease((k - a) / (b - a));
const frac = (x) => x - Math.floor(x);

const PAL = [
  { cheese: "#ffd66a", crust: "#eaa64e", sauce: "#e0452c", dough: "#f0b868", shoe: "#9a4a22" },
  { cheese: "#ffcc48", crust: "#e0963e", sauce: "#d83a26", dough: "#eaae5e", shoe: "#9a4a22" },
  { cheese: "#ffc23a", crust: "#d8843a", sauce: "#e0301e", dough: "#e8a456", shoe: "#5a2a2a" },
  { cheese: "#ffd24e", crust: "#e0983e", sauce: "#d83a26", dough: "#eab060", shoe: "#9a4a22" },
  { cheese: "#fff0a0", crust: "#ffcf3a", sauce: "#ff7a3a", dough: "#ffd46a", shoe: "#e8a41a" },
];
const PEP = "#c8322a";

const FORM = [
  { W: 60, legL: 13, top: -80, crH: 14, rT: 13, rB: 16, er: 9.5, arm: 13, fv: 0.33 },
  { W: 66, legL: 17, top: -84, crH: 14, rT: 8, rB: 7, er: 7.4, arm: 16, fv: 0.34 },
  { W: 68, legL: 18, top: -84, crH: 14, rT: 8, rB: 7, er: 7.4, arm: 17, fv: 0.34 },
  { W: 96, legL: 16, top: -72, crH: 13, rT: 9, rB: 9, er: 8.6, arm: 18, fv: 0.3 },
  { W: 74, legL: 18, top: -86, crH: 14, rT: 9, rB: 8, er: 7.6, arm: 18, fv: 0.34 },
];

// Toppings en coordenadas de la porción: u ∈ [-1,1] a lo ancho, v ∈ [0,1] (0 = corteza, 1 = punta)
const TOPS = [
  [["pep", -0.05, 0.66, 6]],
  [["pep", -0.8, 0.14, 5.5], ["pep", 0.05, 0.72, 5.5], ["olive", 0.82, 0.1, 2.8], ["olive", -0.55, 0.5, 2.8], ["pep", 0.72, 0.52, 4.6]],
  [["pep", -0.8, 0.14, 5.5], ["jal", 0.05, 0.72, 5], ["jal", 0.82, 0.1, 3.8], ["pep", 0.72, 0.52, 4.6], ["jal", -0.55, 0.5, 3.8]],
  [["pep", -0.86, 0.14, 6.5], ["pep", 0.02, 0.74, 6], ["pep", 0.82, 0.46, 5.5], ["olive", 0.86, 0.1, 3.2], ["olive", -0.62, 0.52, 3.2],
    ["mush", -0.5, 0.1, 4.6], ["basil", 0.45, 0.1, 4.2], ["mush", 0.55, 0.62, 4], ["basil", -0.75, 0.35, 4.2]],
  [["pep", -0.8, 0.14, 5.5], ["pep", 0.05, 0.72, 5.5], ["pep", 0.72, 0.52, 4.6]],
];

// ---------------------------------------------------------------------------
// Geometría de la porción
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

function topping(ctx, R, kind, x, y, r, t, i) {
  if (kind === "pep") {
    R.ellipse(ctx, x, y, r, r * 0.92, PEP, { lw: 2 });
    ctx.fillStyle = R.darken(PEP, 0.3);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + i;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.15, 0, TAU); ctx.fill();
    }
    R.shine(ctx, x - r * 0.35, y - r * 0.4, r * 0.35, r * 0.18, 0.6);
  } else if (kind === "olive") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.arc(x, y, r * 0.45, 0, TAU, true);
    ctx.fillStyle = "#2a2230";
    ctx.fill("evenodd");
    ctx.lineWidth = 1.2; ctx.strokeStyle = R.INK; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.arc(x - r * 0.5, y - r * 0.5, r * 0.22, 0, TAU); ctx.fill();
  } else if (kind === "jal") {
    R.ellipse(ctx, x, y, r, r, "#5ab84a", { lw: 1.8 });
    R.ellipse(ctx, x, y, r * 0.62, r * 0.62, "#c8ec8a", { line: false, shade: false });
    ctx.fillStyle = "#fff6d0";
    for (let k = 0; k < 4; k++) {
      const a = k * 1.57 + 0.4;
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32, r * 0.14, r * 0.09, a, 0, TAU); ctx.fill();
    }
  } else if (kind === "mush") {
    ctx.save();
    ctx.translate(x, y);
    R.blob(ctx, [[-r, 0], [-r * 0.8, -r * 0.7], [0, -r], [r * 0.8, -r * 0.7], [r, 0], [r * 0.3, 0.2], [r * 0.3, r * 0.8], [-r * 0.3, r * 0.8], [-r * 0.3, 0.2]], "#f0dcc0", { lw: 1.6 });
    ctx.restore();
  } else if (kind === "basil") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i * 1.3);
    R.blob(ctx, [[-r, 0], [0, -r * 0.5], [r, 0], [0, r * 0.5]], "#3f9a3a", { lw: 1.4 });
    ctx.beginPath(); ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 0.8, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();
  }
}

// Goterón de queso colgando desde (x,y); len < 0 = hacia arriba (queso volando)
function drip(ctx, R, x, y, len, w, lean, color, t, i, fillOnly = false) {
  const ex = x + lean, ey = y + len;
  const up = len < 0;
  const br = w * 0.62;
  ctx.beginPath();
  ctx.moveTo(x - w * 1.3, y - 5);
  ctx.quadraticCurveTo(x - w * 0.35, y + len * 0.25, ex - br * 0.8, ey - (up ? -1 : 1) * br * 0.4);
  ctx.arc(ex, ey, br, Math.PI + 0.2 * (up ? -1 : 1), -0.2 * (up ? -1 : 1), !up);
  ctx.quadraticCurveTo(x + w * 0.35, y + len * 0.25, x + w * 1.3, y - 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (fillOnly) return;
  ctx.lineWidth = R.LINE * 0.8; ctx.strokeStyle = R.INK; ctx.lineJoin = "round"; ctx.stroke();
  R.shine(ctx, ex - br * 0.35, ey - br * 0.3, br * 0.3, br * 0.18, 0.7);
  // gota que se desprende
  const life = frac(t * 0.018 + i * 0.37);
  if (life > 0.6 && len > 3) {
    const k = (life - 0.6) / 0.4;
    const dy = ey + 3 + k * k * 30;
    ctx.globalAlpha = 1 - k;
    R.ellipse(ctx, ex, dy, w * 0.5, w * 0.62, color, { lw: 1.4, shade: false });
    ctx.globalAlpha = 1;
  }
}

function cheeseString(ctx, R, x1, y1, x2, y2, sag, color) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.lineCap = "round";
  ctx.strokeStyle = R.INK; ctx.lineWidth = 4.2; ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
}

function crust(ctx, R, F, c, y0, W, t, gold) {
  const h = F.crH;
  const pts = [
    [-W / 2, y0 + 4], [-W / 2 - 2.5, y0 - h * 0.45], [-W * 0.42, y0 - h * 0.92],
    [-W * 0.22, y0 - h * 1.05], [0, y0 - h * 0.94], [W * 0.22, y0 - h * 1.06], [W * 0.42, y0 - h * 0.92],
    [W / 2 + 2.5, y0 - h * 0.45], [W / 2, y0 + 4], [W * 0.25, y0 + 5.5], [-W * 0.25, y0 + 5.5],
  ];
  R.blob(ctx, pts, c.crust, { lw: R.LINE });
  // labio interior (donde empieza la salsa)
  ctx.beginPath();
  ctx.moveTo(-W * 0.42, y0 + 1.5);
  ctx.quadraticCurveTo(0, y0 + 4, W * 0.42, y0 + 1.5);
  ctx.strokeStyle = R.alpha(R.darken(c.crust, 0.35), 0.6); ctx.lineWidth = 1.6; ctx.stroke();
  // tostado + brillos + harina
  ctx.save();
  ctx.fillStyle = R.alpha(R.darken(c.crust, 0.3), 0.35);
  for (let i = 0; i < 5; i++) {
    const x = -W * 0.4 + i * W * 0.2 + Math.sin(i * 3.1) * 3;
    ctx.beginPath(); ctx.ellipse(x, y0 - h * 0.4 + Math.cos(i * 2.3) * 2, 2.6, 1.3, 0.3, 0, TAU); ctx.fill();
  }
  ctx.restore();
  R.shine(ctx, -W * 0.24, y0 - h * 0.72, W * 0.12, h * 0.16, gold ? 0.8 : 0.55);
  if (gold) {
    ctx.save();
    ctx.shadowColor = "#fff6c0";
    ctx.shadowBlur = 6;
    R.sparkle(ctx, W * 0.32, y0 - h * 0.7, 2.5 + Math.sin(t * 0.25) * 1.5, "#ffffff");
    ctx.restore();
  }
}

function chili(ctx, R, x, y, side, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(side, 1);
  ctx.rotate(Math.sin(t * 0.09) * 0.06);
  R.blob(ctx, [[-4, 0], [4, 0], [9, -10], [11, -20], [8, -26], [5, -18], [-1, -8]], "#e8281c", { lw: 2.2 });
  R.shine(ctx, 5, -14, 1.2, 4, 0.55);
  R.blob(ctx, [[-5, 2], [5, 2], [3, -2], [-3, -2]], "#4aa83a", { lw: 1.8, shade: false });
  ctx.restore();
}

function flame(ctx, R, x, y, h, t, i) {
  const cu = Math.sin(t * 0.4 + i) * 2;
  for (const [k, col, a] of [[1, "#ff6a1a", 0.9], [0.62, "#ffd23a", 0.95]]) {
    ctx.beginPath();
    ctx.moveTo(x + cu, y - h * k);
    ctx.bezierCurveTo(x + 5 * k, y - h * 0.5 * k, x + 4.5 * k, y, x, y + 1.5);
    ctx.bezierCurveTo(x - 4.5 * k, y, x - 5 * k, y - h * 0.5 * k, x + cu, y - h * k);
    ctx.fillStyle = R.alpha(col, a);
    ctx.fill();
  }
}

function chefHat(ctx, R, x, y, t, sway) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.08 + sway * 0.06 + Math.sin(t * 0.05) * 0.02);
  R.blob(ctx, [[-13, 0], [-15, -12], [-20, -20], [-12, -30], [-3, -27], [4, -33], [14, -27], [19, -17], [14, -10], [13, 0]], "#ffffff", { lw: R.LINE });
  ctx.fillStyle = "rgba(160,170,200,0.35)";
  ctx.beginPath(); ctx.ellipse(6, -18, 5, 8, 0.2, 0, TAU); ctx.fill();
  R.blob(ctx, [[-14, 2], [14, 2], [14, -6], [-14, -6]], "#f2f2f6", { lw: 2.4, shade: false });
  ctx.strokeStyle = R.alpha(R.INK, 0.35); ctx.lineWidth = 1;
  for (const lx of [-6, 1, 8]) { ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + 1, -3); ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Pose → parámetros
// ---------------------------------------------------------------------------
function params(pose, f) {
  const st = pose.state, t = pose.t;
  const P = {
    roll: Math.sin(t * 0.04) * 0.025, bx: 0, lift: 0, sx: 1, sy: 1,
    legF: [0.1, 2], legB: [-0.1, -2],
    armF: { ang: 0.5 + pose.breath * 0.08, bend: 3 }, armB: { ang: -0.5 - pose.breath * 0.08, bend: -3 },
    mood: "normal", mouth: "smile", dripK: 1 - pose.bounce * 1.1, strings: 0, fx: null,
    look: 0, glow: 0,
  };
  const heavy = f >= 3;
  if (st === "run") {
    const ph = pose.phase, s = Math.sin(ph);
    P.roll = s * 0.16;
    P.bx = s * 2;
    P.lift = -Math.abs(Math.cos(ph)) * 3.5;
    P.legF = [Math.max(0, s) * 0.8 - 0.1, 3];
    P.legB = [Math.max(0, -s) * 0.8 - 0.1, 3];
    P.armF = { ang: 1.2 + s * 0.5, bend: 4 };
    P.armB = { ang: -1.2 + s * 0.5, bend: -4 };
    P.mouth = "open";
    P.strings = Math.min(1, Math.abs(pose.sway) + pose.speed * 0.6);
  } else if (st === "jump") {
    P.legF = [0.9, 4]; P.legB = [0.5, 4];
    P.armF = { ang: 2.6, bend: 4 }; P.armB = { ang: -2.6, bend: -4 };
    P.mouth = "open";
    P.strings = 0.8;
  } else if (st === "fall" || st === "glide") {
    P.legF = [0.25 + Math.sin(t * 0.5) * 0.2, -2]; P.legB = [-0.3 - Math.sin(t * 0.5) * 0.2, 2];
    P.armF = { ang: 2.0 + Math.sin(t * 0.4) * 0.3, bend: 3 }; P.armB = { ang: -2.0 - Math.sin(t * 0.4 + 1) * 0.3, bend: -3 };
    if (st === "glide") { P.armF.ang = 1.6; P.armB.ang = -1.6; }
    P.mouth = "o";
    P.strings = 0.6;
  } else if (st === "attack") {
    const k = pose.atk;
    const ant = seg(k, 0, 0.3), hit = seg(k, 0.3, 0.5), rec = seg(k, 0.65, 1);
    P.mood = "angry"; P.mouth = hit > 0.5 && rec < 0.5 ? "grin" : "open";
    if (!heavy) {
      // bofetada con el bracito
      P.roll = -0.12 * ant + 0.28 * hit - 0.16 * rec;
      P.bx = 5 * hit - 5 * rec;
      P.armF = { ang: 0.4 - 2.3 * ant + 4.1 * hit - 1.6 * rec, bend: 5 - 8 * hit, len: 1 + 0.25 * hit };
      P.armB = { ang: -0.8, bend: -3 };
      P.legF = [0.4 * hit, 2]; P.legB = [-0.4 * hit, -2];
      if (hit > 0.3 && rec < 0.8) P.fx = { kind: "slap", k: hit * (1 - rec) };
    } else {
      // porrazo con la corteza
      P.roll = -0.22 * ant + 0.75 * hit - 0.53 * rec;
      P.bx = 4 * hit - 4 * rec;
      P.armF = { ang: -0.8 * hit, bend: 3 }; P.armB = { ang: -1.4 * hit - 0.4, bend: -3 };
      P.legF = [0.5 * hit, 3]; P.legB = [-0.6 * hit, -3];
      if (hit > 0.4 && rec < 0.8) P.fx = { kind: "bonk", k: hit * (1 - rec) };
    }
  } else if (st === "cast") {
    const k = pose.cast, slot = pose.castSlot;
    if (slot === 0) {
      // lanza un pepperoni como disco
      const wind = seg(k, 0, 0.35), thr = seg(k, 0.35, 0.55);
      P.roll = -0.15 * wind + 0.25 * thr;
      P.armF = { ang: -1.9 * wind + 3.3 * thr + 0.4, bend: 3 - 6 * thr };
      P.armB = { ang: 0.8 * wind - 0.8, bend: -3 };
      P.fx = { kind: "disc", k: thr, t: k };
      P.mood = "angry"; P.mouth = thr > 0.5 ? "grin" : "flat";
      P.legF = [0.35 * thr, 2]; P.legB = [-0.35 * thr, -2];
    } else if (slot === 1) {
      // el brazo se estira como hilo de queso (lazo)
      P.roll = 0.08;
      P.armF = null;
      P.armB = { ang: -1, bend: -3 };
      P.fx = { kind: "lasso", k };
      P.mood = "normal"; P.mouth = "open";
      P.legF = [0.35, 2]; P.legB = [-0.35, -2];
    } else {
      // al rojo vivo (horno)
      P.glow = Math.sin(Math.min(1, k * 1.2) * Math.PI * 0.5 + 0.3);
      P.bx = Math.sin(t * 1.7) * 1.2;
      P.armF = { ang: 1.0, bend: 5 }; P.armB = { ang: -1.0, bend: -5 };
      P.legF = [0.3, 2]; P.legB = [-0.3, -2];
      P.fx = { kind: "oven", k };
      P.mood = "angry"; P.mouth = "roar";
      P.dripK = 1.6;
    }
  } else if (st === "hurt") {
    P.roll = -0.32; P.bx = -3;
    P.armF = { ang: 2.3, bend: 4 }; P.armB = { ang: -2.4, bend: -4 };
    P.legF = [0.6, 3]; P.legB = [-0.1, -2];
    P.mood = "hurt"; P.mouth = "o"; P.dripK = -0.8;
    P.fx = { kind: "splash" };
  } else if (st === "wall") {
    P.roll = 0.12;
    P.wall = true;
    P.mouth = "flat";
  } else if (st === "dead") {
    P.dead = true;
    P.mood = "dead"; P.mouth = "o";
  } else if (st === "victory") {
    const j = Math.abs(Math.sin(t * 0.09));
    P.lift = -j * 16;
    P.roll = Math.sin(t * 0.09) * 0.06;
    P.armF = { ang: 2.8, bend: 3 }; P.armB = { ang: -2.8, bend: -3 };
    P.legF = [0.7 * j, 4]; P.legB = [0.3 * j, 4];
    P.mood = "happy"; P.mouth = "grin";
    P.dripK = 1 - Math.cos(t * 0.18) * 1.6;
    P.fx = { kind: "victory", j };
  }
  if (pose.move === "bounce") {
    const q = Math.max(-0.28, Math.min(0.28, -pose.vy * 0.3 + Math.sin(t * 0.35) * 0.1));
    P.sx = 1 - q; P.sy = 1 + q;
    P.armF = { ang: 1.9, bend: 3 }; P.armB = { ang: -1.9, bend: -3 };
    P.legF = [0.25, 2]; P.legB = [-0.25, -2];
    P.mood = "happy"; P.mouth = "open";
    P.fx = { kind: "boing", q };
  }

  if (st === "idle" && pose.flourish > 0) {
    const k = pose.flourish, n = pose.flourishN % 3, b = Math.sin(k * Math.PI);
    if (n === 0) {
      // gotea queso y lo sorbe de vuelta
      P.drool = k < 0.55 ? seg(k, 0.05, 0.5) : 1 - seg(k, 0.6, 0.85);
      P.mood = k < 0.55 ? "normal" : "closed";
      P.mouth = k < 0.55 ? "open" : k < 0.85 ? "o" : "smile";
      P.armF = { ang: 0.9, bend: 4 };
      P.dripK = 1.3 + b * 0.8;
    } else if (n === 1) {
      // gira como masa de pizza
      P.spin = Math.cos(k * TAU * 2);
      P.lift = -b * 10;
      P.armF = { ang: 2.8, bend: 2 }; P.armB = { ang: -2.8, bend: -2 };
      P.mood = "happy"; P.mouth = "open";
      P.dripK = -0.6 * b + 1 - b;
    } else {
      // espolvorea orégano
      P.armF = { ang: 2.9, bend: -3, len: 1.1 };
      P.sprinkle = b;
      P.look = -0.6;
      P.mood = "happy"; P.mouth = "smile";
      P.roll = -0.05 * b;
    }
  }
  return P;
}

// ---------------------------------------------------------------------------
// Dibujo
// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = pose.form, c = PAL[f], F = FORM[f], t = pose.t;
  const P = params(pose, f);
  const tipY = -F.legL;
  const W = F.W;
  const heavy = f >= 3;

  ctx.save();
  if (P.dead) {
    ctx.translate(-F.top * 0.5, -W * 0.5 - 4);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, F.legL * 0.3);
  }
  ctx.translate(P.bx, P.lift);
  ctx.rotate(P.roll);
  if (P.sx !== 1 || P.sy !== 1) ctx.scale(P.sx, P.sy);

  // --- halo dorado y pepperonis orbitando (detrás) ---
  if (f === 4 && !P.dead) {
    ctx.save();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = "#ffe27a";
    ctx.shadowColor = "#fff2a0";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, F.top - 2 + Math.sin(t * 0.07) * 1.5, W * 0.56, W * 0.5, 0, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#fffbe0";
    ctx.stroke();
    ctx.restore();
    orbit(ctx, R, F, t, false);
  }

  // --- spin (masa de pizza): escala x ---
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
    const ex = x + Math.sin(L[0]) * F.legL, ey = tipY + Math.cos(L[0]) * F.legL;
    const mx = x + Math.sin(L[0]) * F.legL * 0.5 + Math.cos(L[0]) * L[1], my = tipY + Math.cos(L[0]) * F.legL * 0.5;
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

  // hilos de queso estirados hacia atrás con el movimiento
  if (P.strings > 0.05) {
    for (let i = 0; i < 2; i++) {
      const [x, y] = uv(F, tipY, -1, 0.25 + i * 0.3);
      const L = (14 + i * 6) * P.strings;
      cheeseString(ctx, R, x + 2, y, x - L + pose.sway * 4, y + 4 + pose.bounce * 8 + i * 3, 5 + Math.sin(t * 0.3 + i) * 2, c.cheese);
    }
  }

  // --- porción ---
  slicePath(ctx, F, tipY);
  const g = ctx.createLinearGradient(-W * 0.3, F.top, W * 0.2, tipY);
  g.addColorStop(0, R.lighten(c.cheese, f === 4 ? 0.6 : 0.35));
  g.addColorStop(0.55, c.cheese);
  g.addColorStop(1, R.darken(c.cheese, 0.12));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // salsa asomando bajo el queso junto a la corteza
  ctx.fillStyle = c.sauce;
  ctx.beginPath();
  ctx.moveTo(-W, F.top - 2);
  ctx.lineTo(W, F.top - 2);
  for (let i = 0; i <= 8; i++) {
    const x = W / 2 - (i / 8) * W;
    ctx.lineTo(x, F.top + 6 + (i % 2 ? 3.5 : 0) + Math.sin(i * 1.7) * 1.2);
  }
  ctx.closePath();
  ctx.fill();
  // borde de salsa por los lados
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = R.alpha(c.sauce, 0.55);
  slicePath(ctx, F, tipY);
  ctx.stroke();
  // burbujas tostadas del queso
  for (let i = 0; i < 5; i++) {
    const [x, y] = uv(F, tipY, (frac(i * 0.43 + 0.2) - 0.5) * 1.6, 0.18 + frac(i * 0.61) * 0.65);
    ctx.fillStyle = R.alpha(R.darken(c.cheese, 0.25), 0.25);
    ctx.beginPath(); ctx.ellipse(x, y, 2.4, 1.6, 0, 0, TAU); ctx.fill();
  }
  // sombra lateral
  const sg = ctx.createLinearGradient(W * 0.1, 0, W * 0.5, 0);
  sg.addColorStop(0, "rgba(120,40,0,0)");
  sg.addColorStop(1, "rgba(120,40,0,0.22)");
  ctx.fillStyle = sg;
  ctx.fillRect(-W, F.top - 10, W * 2, -F.top + 10);
  // brillo del queso
  R.shine(ctx, -W * 0.28, F.top + 14, 5, 2.4, 0.6);
  if (f === 4) {
    ctx.fillStyle = R.alpha("#ffffff", 0.18 + 0.12 * Math.sin(t * 0.12));
    ctx.fillRect(-W, F.top - 10, W * 2, -F.top + 10);
  }
  // ingredientes
  TOPS[f].forEach(([kind, u, v, r], i) => {
    const [x, y] = uv(F, tipY, u, v);
    topping(ctx, R, kind, x, y, r, t, i);
  });
  // al rojo vivo
  if (P.glow > 0) {
    ctx.fillStyle = R.alpha("#ff2a10", 0.45 * P.glow + 0.08 * Math.sin(t * 0.6));
    ctx.fillRect(-W, F.top - 10, W * 2, -F.top + 10);
  }
  ctx.restore();
  slicePath(ctx, F, tipY);
  R.paint(ctx, null, { lw: R.LINE });

  // --- goterones de queso: se desbordan por los lados ---
  const dK = P.dripK;
  const drips = f === 3 ? [[-1, 0.1], [-1, 0.5], [1, 0.22], [1, 0.62], [-1, 0.78]] : f === 0 ? [[-1, 0.25], [1, 0.5]] : [[-1, 0.14], [1, 0.26], [-1, 0.6], [1, 0.7]];
  const dripCol = f === 4 ? "#fff6c0" : c.cheese;
  const dripArgs = drips.map(([side, v], i) => {
    const [x, y] = uv(F, tipY, side, v);
    const base = (5 + frac(i * 0.61) * 7) * (f === 0 ? 0.8 : 1);
    const len = base * dK + Math.sin(t * 0.07 + i * 1.9) * 1.2;
    const lean = -pose.sway * 5 + side * 1.5;
    return [x + side * 0.5, y + 1, len, f === 0 ? 3.4 : 3.8, lean, dripCol, t, i];
  });
  for (const a of dripArgs) drip(ctx, R, ...a);
  ctx.save();
  slicePath(ctx, F, tipY);
  ctx.clip();
  for (const a of dripArgs) drip(ctx, R, ...a, true);
  ctx.restore();

  // --- corteza (pelo) ---
  const crY = F.top - 1 + pose.bounce * 1.2;
  ctx.save();
  ctx.translate(0, crY);
  ctx.rotate(pose.sway * 0.04);
  if (f === 3) {
    crust(ctx, R, F, c, -F.crH * 0.9, W * 0.94, t, false);
    crust(ctx, R, F, c, 0, W, t, false);
  } else {
    crust(ctx, R, F, c, 0, W, t, f === 4);
  }
  if (P.glow > 0) {
    ctx.globalAlpha = P.glow * 0.4;
    ctx.fillStyle = "#ff3a10";
    ctx.beginPath(); ctx.ellipse(0, -F.crH * 0.4, W * 0.55, F.crH * 0.8, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // accesorios de cabeza
  if (f === 2) {
    chili(ctx, R, -W * 0.3, -F.crH * 0.8, -1, t);
    chili(ctx, R, W * 0.3, -F.crH * 0.8, 1, t);
    for (let i = 0; i < 3; i++) flame(ctx, R, (i - 1) * 9, -F.crH * 0.9, 8 + Math.sin(t * 0.3 + i * 2) * 3, t, i);
  }
  if (f === 3) chefHat(ctx, R, 2, -F.crH * 1.7, t, pose.sway);
  ctx.restore();

  // --- cara ---
  faceDraw(ctx, R, pose, P, F, tipY, f);

  // babilla de queso (flourish 0)
  if (P.drool > 0) {
    const [mx, my] = uv(F, tipY, 0.12, F.fv);
    const myy = my + F.er * 1.9;
    drip(ctx, R, mx + F.er * 0.2, myy, P.drool * (-myy - 10), 3.4, 1, c.cheese, 0, 0);
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

  // --- efectos ---
  fx(ctx, R, P, F, tipY, hand, t, c, shX, shY, heavy);

  ctx.restore();
}

function faceDraw(ctx, R, pose, P, F, tipY, f) {
  const [cx, cy] = uv(F, tipY, 0.12, F.fv);
  const er = F.er;
  const e1 = [cx - er * 1.05, cy], e2 = [cx + er * 1.25, cy - 0.5];
  const iris = f === 4 ? "#d08a10" : f === 2 ? "#7a2a10" : "#5a3418";
  const look = { x: 1, y: P.look || pose.look.y };
  const pz = { ...pose, look };
  if (P.mood === "dead") {
    for (const [ex, ey] of [e1, e2]) {
      ctx.beginPath();
      ctx.moveTo(ex - er * 0.6, ey - er * 0.6); ctx.lineTo(ex + er * 0.6, ey + er * 0.6);
      ctx.moveTo(ex + er * 0.6, ey - er * 0.6); ctx.lineTo(ex - er * 0.6, ey + er * 0.6);
      ctx.lineWidth = 2.4; ctx.strokeStyle = R.INK; ctx.lineCap = "round"; ctx.stroke();
    }
  } else {
    const m = P.mood === "hurt" ? "closed" : P.mood;
    R.eye(ctx, e1[0], e1[1], er, pz, { iris, mood: m, lash: f === 0 });
    R.eye(ctx, e2[0], e2[1], er * 0.88, pz, { iris, mood: m });
    if (P.mood === "hurt") {
      ctx.beginPath();
      ctx.moveTo(e1[0] - er, e1[1] - er * 1.3); ctx.lineTo(e1[0] + er * 0.6, e1[1] - er * 0.9);
      ctx.moveTo(e2[0] + er, e2[1] - er * 1.3); ctx.lineTo(e2[0] - er * 0.5, e2[1] - er * 0.9);
      ctx.lineWidth = 1.8; ctx.strokeStyle = R.INK; ctx.stroke();
    }
    if (f === 2 && P.mood === "normal") {
      // cejas picantes
      ctx.beginPath();
      ctx.moveTo(e1[0] - er * 0.8, e1[1] - er * 1.4); ctx.lineTo(e1[0] + er * 0.6, e1[1] - er * 1.15);
      ctx.moveTo(e2[0] + er * 0.8, e2[1] - er * 1.35); ctx.lineTo(e2[0] - er * 0.5, e2[1] - er * 1.15);
      ctx.lineWidth = 2; ctx.strokeStyle = R.INK; ctx.lineCap = "round"; ctx.stroke();
    }
  }
  R.blush(ctx, e1[0] - er * 0.4, cy + er * 1.3, er * 0.55, f === 2 ? "#ff3a2a" : "#ff7aa0");
  R.blush(ctx, e2[0] + er * 0.5, cy + er * 1.25, er * 0.45, f === 2 ? "#ff3a2a" : "#ff7aa0");
  const mm = P.mouth === "smile" && f === 2 ? "fang" : P.mouth;
  R.mouth(ctx, cx + er * 0.15, cy + er * 1.55, f === 0 ? 8 : 7.5, mm);
}

function orbit(ctx, R, F, t, front) {
  for (let i = 0; i < 3; i++) {
    const a = t * 0.06 + (i * TAU) / 3;
    const z = Math.sin(a);
    if ((z > 0) !== front) continue;
    const x = Math.cos(a) * F.W * 0.72;
    const y = -52 + z * 10 + Math.sin(a * 2) * 4;
    const s = 0.75 + z * 0.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.shadowColor = "#ffd84a";
    ctx.shadowBlur = 8;
    R.ellipse(ctx, 0, 0, 6, 5.6, PEP, { lw: 2 });
    ctx.restore();
    ctx.fillStyle = R.darken(PEP, 0.3);
    ctx.beginPath(); ctx.arc(x + 1.5 * s, y - 1 * s, 1 * s, 0, TAU); ctx.fill();
    R.shine(ctx, x - 2 * s, y - 2 * s, 1.6 * s, 0.9 * s, 0.7);
  }
}

function fx(ctx, R, P, F, tipY, hand, t, c, shX, shY, heavy) {
  const e = P.fx;
  if (P.sprinkle > 0 && hand) {
    for (let i = 0; i < 12; i++) {
      const life = frac(t * 0.03 + i * 0.083);
      const x = hand[0] - 4 - life * 14 + (frac(i * 0.37) - 0.5) * 20;
      const y = hand[1] + 4 + life * 40;
      ctx.save();
      ctx.globalAlpha = P.sprinkle * (1 - life * 0.7);
      ctx.translate(x, y); ctx.rotate(i + t * 0.15);
      ctx.beginPath(); ctx.ellipse(0, 0, 2.6, 1.5, 0, 0, TAU);
      ctx.fillStyle = i % 3 ? "#5ab84a" : "#2f8a2a"; ctx.fill();
      ctx.lineWidth = 0.8; ctx.strokeStyle = R.INK; ctx.stroke();
      ctx.restore();
    }
  }
  if (!e) return;
  if (e.kind === "slap" && hand) {
    ctx.save();
    ctx.globalAlpha = e.k;
    R.star(ctx, hand[0] + 8, hand[1] - 2, 7 + e.k * 5, "#fff6a8", { points: 6, inner: 0.5, lw: 2 });
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const a = -0.6 + i * 0.6;
      ctx.beginPath();
      ctx.moveTo(hand[0] + 12 + Math.cos(a) * 8, hand[1] + Math.sin(a) * 8);
      ctx.lineTo(hand[0] + 12 + Math.cos(a) * 15, hand[1] + Math.sin(a) * 15);
      ctx.stroke();
    }
    ctx.restore();
  } else if (e.kind === "bonk") {
    ctx.save();
    ctx.globalAlpha = e.k;
    const x = F.W * 0.5 + 6, y = F.top - 4;
    R.star(ctx, x, y, 9 + e.k * 6, "#fff6a8", { points: 7, inner: 0.5, lw: 2 });
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-F.W * 0.5 - 4, F.top + i * 8); ctx.lineTo(-F.W * 0.5 - 14, F.top + 6 + i * 9); ctx.stroke();
    }
    ctx.restore();
  } else if (e.kind === "disc" && hand) {
    if (e.k < 0.5) {
      // en la mano
      R.ellipse(ctx, hand[0], hand[1] - 3, 6, 5.5, PEP, { lw: 2 });
    } else {
      const d = (e.t - 0.45) * 130;
      const x = hand[0] + 6 + d, y = hand[1] - 6 - d * 0.1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.55);
      ctx.rotate(t * 0.8);
      R.ellipse(ctx, 0, 0, 8, 8, PEP, { lw: 2.4 });
      ctx.fillStyle = R.darken(PEP, 0.3);
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 2.1) * 4, Math.sin(k * 2.1) * 4, 1.2, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
      for (const dy of [-4, 0, 4]) { ctx.beginPath(); ctx.moveTo(x - 12, y + dy); ctx.lineTo(x - 22 - Math.abs(dy), y + dy); ctx.stroke(); }
      ctx.restore();
    }
  } else if (e.kind === "lasso") {
    const reach = 20 + seg(e.k, 0, 0.5) * 50;
    const ex = shX + reach, ey = shY - 10 - reach * 0.25;
    ctx.save();
    ctx.lineCap = "round";
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.bezierCurveTo(shX + reach * 0.3, shY + 10 + Math.sin(t * 0.5) * 5, shX + reach * 0.65, ey - 12 + Math.cos(t * 0.5) * 5, ex, ey);
    };
    path(); ctx.strokeStyle = R.INK; ctx.lineWidth = 5 + R.LINE * 1.6; ctx.stroke();
    path(); ctx.strokeStyle = c.cheese; ctx.lineWidth = 5; ctx.stroke();
    // lazo
    const lr = 8 + Math.sin(t * 0.4) * 1.5;
    ctx.translate(ex + lr * 0.8, ey - 2);
    ctx.rotate(Math.sin(t * 0.3) * 0.4 - 0.3);
    ctx.beginPath(); ctx.ellipse(0, 0, lr, lr * 0.6, 0, 0, TAU);
    ctx.strokeStyle = R.INK; ctx.lineWidth = 4 + R.LINE * 1.4; ctx.stroke();
    ctx.strokeStyle = c.cheese; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    // gotitas de queso
    for (let i = 0; i < 2; i++) {
      const life = frac(t * 0.04 + i * 0.5);
      R.ellipse(ctx, shX + reach * (0.4 + i * 0.3), shY + 6 + life * 18, 2, 2.4, c.cheese, { lw: 1.3, shade: false });
    }
  } else if (e.kind === "oven") {
    // vapor + ondas de calor
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const life = frac(t * 0.025 + i * 0.2);
      const x = (i - 2) * 12 + Math.sin(t * 0.1 + i) * 4;
      const y = F.top - 10 - life * 34;
      ctx.globalAlpha = (1 - life) * 0.7;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(x, y, 3 + life * 6, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#ff8a3a"; ctx.lineWidth = 1.8; ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      const x0 = side * (F.W * 0.5 + 8);
      ctx.beginPath();
      for (let k = 0; k <= 6; k++) {
        const y = F.top + 10 + k * 7;
        const x = x0 + Math.sin(k * 1.4 + t * 0.4) * 3;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.shadowColor = "#ff5a1a";
    ctx.shadowBlur = 10;
    R.sparkle(ctx, F.W * 0.45, F.top + 8, 3 + Math.sin(t * 0.5) * 1.5, "#ffd23a");
    ctx.restore();
  } else if (e.kind === "splash") {
    for (let i = 0; i < 4; i++) {
      const a = 2.2 + i * 0.45;
      R.ellipse(ctx, -F.W * 0.55 + Math.cos(a) * 10, F.top + 30 - i * 9, 2.4, 3, c.cheese, { lw: 1.4, shade: false });
    }
  } else if (e.kind === "victory") {
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6 + t * 0.04;
      const r = 36 + e.j * 10;
      const x = Math.cos(a) * r, y = -50 + Math.sin(a) * r * 0.8;
      if (i % 2) {
        if (Math.abs(Math.cos(a)) > 0.45) R.ellipse(ctx, x, y, 3.2, 2.6, c.cheese, { lw: 1.6, shade: false });
      } else {
        const tw = Math.sin(t * 0.2 + i);
        if (tw > 0) R.sparkle(ctx, x, y, 2 + tw * 3.5, "#fff6c0");
      }
    }
  } else if (e.kind === "boing") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    const k = Math.abs(e.q) * 3;
    for (const dx of [-10, 0, 10]) {
      ctx.beginPath(); ctx.moveTo(dx * (1 + k), 4); ctx.lineTo(dx * (1.6 + k), 8 + k * 2); ctx.stroke();
    }
    ctx.restore();
  }
}

export default { id: "pizza", draw };
