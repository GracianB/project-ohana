// Michi. Origen (0,0) = pies. Cada forma es otra silueta.
// 0 bola · 1 gato · 2 nube · 3 luna · 4 alas
const TAU = Math.PI * 2;
const INK = "#3a2416";

const PAL = [
  { fur: "#ffe3b8", dark: "#e7b56a", belly: "#fff8ee", ear: "#ffb7c8", nose: "#ff8aa0", eye: "#49b4f0", accent: "#7ec8ff" },
  { fur: "#f29a3a", dark: "#c45e16", belly: "#ffe4c2", ear: "#ff8fa3", nose: "#e23b4a", eye: "#2d6fe0", accent: "#d23a3a" },
  { fur: "#ffd4ea", dark: "#f09ac4", belly: "#fff", ear: "#ffb3d4", nose: "#ff5c8a", eye: "#3f8ef0", accent: "#8ad8ff" },
  { fur: "#c9b4ff", dark: "#6d55c4", belly: "#f4eeff", ear: "#a88cff", nose: "#ff7aa8", eye: "#f0d060", accent: "#ffe27a" },
  { fur: "#fff6ea", dark: "#e8c27a", belly: "#fff", ear: "#ffd0e0", nose: "#ff5c8a", eye: "#e0489b", accent: "#ffd24a" },
];

function line(ctx, w, color) {
  ctx.lineWidth = w;
  ctx.strokeStyle = color || INK;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function fill(ctx, color, w) {
  ctx.fillStyle = color;
  ctx.fill();
  if (w) line(ctx, w);
}

function oval(ctx, x, y, rx, ry, color, w) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, TAU);
  fill(ctx, color, w == null ? 2.6 : w);
}

function eye(ctx, x, y, r, blink, color, shut) {
  if (shut || blink > 0.65) {
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x, y + r * 0.4, x + r, y);
    line(ctx, 2.8);
    return;
  }
  oval(ctx, x, y, r, r * 1.2, "#fff", 2.4);
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.1, r * 0.52, r * 0.64, 0, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + r * 0.18, Math.max(1.2, r * 0.24), 0, TAU);
  ctx.fillStyle = "#1a120c";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.34, Math.max(1, r * 0.16), 0, TAU);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

function nose(ctx, x, y, s, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s, y + s * 0.7);
  ctx.lineTo(x + s, y + s * 0.7);
  ctx.closePath();
  fill(ctx, color, 1.5);
}

function ear(ctx, side, x, y, h, fur, inner) {
  ctx.beginPath();
  ctx.moveTo(x - side * 8, y);
  ctx.lineTo(x + side * 2, y - h);
  ctx.lineTo(x + side * 14, y + 2);
  ctx.closePath();
  fill(ctx, fur, 2.4);
  ctx.beginPath();
  ctx.moveTo(x - side * 3, y - 2);
  ctx.lineTo(x + side * 1, y - h * 0.62);
  ctx.lineTo(x + side * 8, y);
  ctx.fillStyle = inner;
  ctx.fill();
}

function paw(ctx, x, y, len, ang, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-5, -len, 10, len + 4, 5) : ctx.rect(-5, -len, 10, len + 4);
  fill(ctx, color, 2.2);
  ctx.beginPath();
  ctx.ellipse(0, 2, 2.2, 1.4, 0, 0, TAU);
  ctx.fillStyle = "#ffb0c4";
  ctx.fill();
  ctx.restore();
}

function face(ctx, pose, r, y, c, shut) {
  const blink = (pose && pose.blink) || 0;
  const er = r * 0.34;
  eye(ctx, -r * 0.34, y, er, blink, c.eye, shut);
  eye(ctx, r * 0.36, y, er * 0.96, blink, c.eye, shut);
  nose(ctx, r * 0.02, y + r * 0.28, 3.2, c.nose);
  ctx.beginPath();
  const open = pose && (pose.state === "attack" || pose.state === "victory");
  ctx.moveTo(-4, y + r * 0.46);
  ctx.quadraticCurveTo(1, y + r * (open ? 0.66 : 0.54), 6, y + r * 0.46);
  line(ctx, 2);
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, y + r * 0.4); ctx.lineTo(-r * 0.7, y + r * 0.32);
  ctx.moveTo(-r * 0.2, y + r * 0.5); ctx.lineTo(-r * 0.72, y + r * 0.52);
  ctx.moveTo(r * 0.24, y + r * 0.4); ctx.lineTo(r * 0.74, y + r * 0.32);
  ctx.moveTo(r * 0.24, y + r * 0.5); ctx.lineTo(r * 0.76, y + r * 0.52);
  line(ctx, 1.3);
  ctx.restore();
}

function tailTip(ctx, R, f, c, x, y, len, ang, swing) {
  const end = R && R.tail
    ? R.tail(ctx, x, y, len, ang, (u) => swing * (1 - u), f === 0 ? 7 : 9, 3.5, c.fur, { ink: INK, lw: 2.4, segments: 8 })
    : null;
  if (!end) return;
  if (f === 2) oval(ctx, end[0], end[1], 9, 7, "#fff", 2);
  else if (f === 0) oval(ctx, end[0], end[1], 5, 5, c.dark, 1.6);
  else oval(ctx, end[0], end[1], f === 4 ? 6 : 4.5, f === 4 ? 6 : 4.5, f >= 3 ? c.accent : c.dark, 1.8);
}

function drawBaby(ctx, pose, R, c, t, st) {
  const shut = st === "dead";
  tailTip(ctx, R, 0, c, -8, -18, 14, -2.4, Math.sin(t * 0.12) * 0.5);
  oval(ctx, 0, -36, 34, 32, c.fur, 3);
  oval(ctx, 6, -30, 16, 14, c.belly, 0);
  ear(ctx, -1, -16, -58, 22, c.fur, c.ear);
  ear(ctx, 1, 12, -58, 22, c.fur, c.ear);
  face(ctx, pose, 30, -40, c, shut);
  oval(ctx, 8, -18, 4, 4, c.accent, 1.6);
  paw(ctx, -8, 0, 6, 0.1, c.fur);
  paw(ctx, 8, 0, 6, -0.1, c.fur);
}

function drawCat(ctx, pose, R, c, t, st, step) {
  const shut = st === "dead";
  tailTip(ctx, R, 1, c, -16, -28, 36, -2.1, Math.sin(t * 0.1) * 0.7);
  paw(ctx, -12, 0, 16, step * 0.4, c.dark);
  paw(ctx, 10, 0, 16, -step * 0.4, c.dark);
  oval(ctx, 2, -30, 22, 16, c.fur, 2.8);
  oval(ctx, 8, -26, 11, 9, c.belly, 0);
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-8, -36 + i * 6);
    ctx.quadraticCurveTo(2, -33 + i * 6, 10, -36 + i * 6);
    ctx.stroke();
  }
  paw(ctx, -6, 0, 18, -step * 0.35, c.fur);
  if (st === "attack" || st === "victory" || st === "cast") {
    ctx.save();
    ctx.translate(16, -28);
    ctx.rotate(st === "attack" ? -0.4 + (pose.atk || 0) * 1.6 : -1.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 0);
    line(ctx, 8, INK);
    line(ctx, 5, c.fur);
    ctx.restore();
  } else paw(ctx, 14, 0, 18, step * 0.35, c.fur);
  ctx.save();
  ctx.translate(10, -58);
  ear(ctx, -1, -14, -8, 26, c.fur, c.ear);
  ear(ctx, 1, 10, -8, 26, c.fur, c.ear);
  oval(ctx, 0, 6, 24, 22, c.fur, 2.8);
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.quadraticCurveTo(-2, -28, 6, -16);
  line(ctx, 2.4, c.dark);
  face(ctx, pose, 22, 2, c, shut);
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.quadraticCurveTo(0, 22, 12, 16);
  line(ctx, 4, c.accent);
  oval(ctx, 0, 20, 3.4, 3.4, "#ffd24a", 1.6);
  ctx.restore();
}

function drawCloud(ctx, pose, R, c, t, st) {
  const shut = st === "dead";
  const bob = Math.sin(t * 0.08) * 3;
  ctx.save();
  ctx.translate(0, bob);
  tailTip(ctx, R, 2, c, -18, -34, 30, -1.6, Math.sin(t * 0.1) * 0.4);
  const puffs = [[-22, -28, 14], [0, -24, 18], [20, -30, 13], [-8, -40, 12], [12, -42, 11]];
  for (const p of puffs) oval(ctx, p[0], p[1], p[2], p[2] * 0.85, "#fff", 2.2);
  oval(ctx, 2, -32, 20, 14, c.fur, 0);
  ctx.save();
  ctx.translate(6, -62);
  ear(ctx, -1, -12, -4, 18, "#fff", c.ear);
  ear(ctx, 1, 12, -4, 18, "#fff", c.ear);
  oval(ctx, -16, 2, 9, 8, "#fff", 2);
  oval(ctx, 16, 4, 8, 7, "#fff", 2);
  oval(ctx, 0, 6, 22, 20, c.fur, 2.6);
  face(ctx, pose, 18, 4, c, shut);
  if (R && R.star) R.star(ctx, -14, -16, 6, c.accent);
  ctx.restore();
  ctx.restore();
}

function drawMoon(ctx, pose, R, c, t, st, step) {
  const shut = st === "dead";
  const sway = Math.sin(t * 0.09) * 5;
  ctx.beginPath();
  ctx.moveTo(-6, -70);
  ctx.quadraticCurveTo(-36 + sway, -40, -28 + sway, -4);
  ctx.lineTo(8, -8);
  ctx.quadraticCurveTo(-8, -36, -2, -70);
  ctx.closePath();
  fill(ctx, "#4a3498", 2.4);
  tailTip(ctx, R, 3, c, -10, -30, 34, -2.4, Math.sin(t * 0.1) * 0.5);
  tailTip(ctx, R, 3, c, -6, -24, 28, -1.5, Math.sin(t * 0.12 + 1) * 0.5);
  paw(ctx, -8, 0, 20, step * 0.25, c.dark);
  paw(ctx, 10, 0, 20, -step * 0.25, c.fur);
  oval(ctx, 2, -36, 14, 22, c.fur, 2.6);
  oval(ctx, 4, -30, 7, 12, c.belly, 0);
  ctx.save();
  ctx.translate(4, -72);
  ear(ctx, -1, -10, -2, 34, c.fur, c.ear);
  ear(ctx, 1, 10, -2, 34, c.fur, c.ear);
  ctx.beginPath();
  ctx.arc(0, -30, 8, 0.5, 5.5);
  ctx.lineWidth = 3;
  ctx.strokeStyle = c.accent;
  ctx.stroke();
  oval(ctx, 0, 4, 18, 20, c.fur, 2.6);
  face(ctx, pose, 16, 2, c, shut);
  ctx.restore();
}

function feather(ctx, side, rot, len, color) {
  ctx.save();
  ctx.translate(-4, -36);
  ctx.scale(side, 1);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.45, -16, len, -4);
  ctx.quadraticCurveTo(len * 0.5, 8, 0, 4);
  ctx.closePath();
  fill(ctx, color, 2.2);
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(len * 0.75, -2);
  line(ctx, 1.3, "#e6c56a");
  ctx.restore();
}

function drawGod(ctx, pose, R, c, t, st, step) {
  const shut = st === "dead";
  const flap = Math.sin(t * 0.16) * 0.18;
  feather(ctx, -1, -0.9 + flap, 46, "#fff");
  feather(ctx, -1, -0.35 + flap, 54, "#fff8e4");
  feather(ctx, -1, 0.15 + flap, 40, "#ffe7a8");
  feather(ctx, 1, -0.9 - flap, 42, "#fff4d4");
  feather(ctx, 1, -0.3 - flap, 50, "#fff");
  for (let i = 0; i < 3; i++) {
    tailTip(ctx, R, 4, c, -12, -26, 26 + i * 4, -2.3 + i * 0.45, Math.sin(t * 0.1 + i) * 0.4);
  }
  paw(ctx, -10, 0, 16, step * 0.3, c.dark);
  paw(ctx, 12, 0, 16, -step * 0.3, c.fur);
  oval(ctx, 2, -30, 20, 16, c.fur, 2.8);
  oval(ctx, 6, -28, 8, 8, c.accent, 2);
  ctx.save();
  ctx.translate(8, -60);
  ear(ctx, -1, -12, -6, 24, c.fur, c.ear);
  ear(ctx, 1, 12, -6, 24, c.fur, c.ear);
  oval(ctx, 0, 6, 24, 22, c.fur, 3);
  face(ctx, pose, 20, 2, c, shut);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 9, -16);
    ctx.lineTo(i * 9, -28 - (i === 0 ? 6 : 0));
    ctx.lineTo(i * 9 + 7, -16);
    fill(ctx, c.accent, 1.8);
  }
  ctx.restore();
  if (R && R.halo) R.halo(ctx, 8, -96, 18, t, "#ffd76a");
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, Math.round(Number(pose && pose.form) || 0)));
  const c = PAL[f];
  const t = (pose && pose.t) || 0;
  const st = (pose && pose.state) || "idle";
  const step = st === "run" ? Math.sin((pose.phase || 0) * 2) : 0;
  const hop = st === "run" ? -Math.abs(step) * 4 : st === "victory" ? -Math.abs(Math.sin(t * 0.18)) * 8 : 0;
  ctx.save();
  ctx.translate(0, hop);
  if (st === "hurt") ctx.rotate(-0.12);
  if (st === "dead") ctx.rotate(0.18);
  if (f === 0) drawBaby(ctx, pose, R, c, t, st);
  else if (f === 1) drawCat(ctx, pose, R, c, t, st, step);
  else if (f === 2) drawCloud(ctx, pose, R, c, t, st);
  else if (f === 3) drawMoon(ctx, pose, R, c, t, st, step);
  else drawGod(ctx, pose, R, c, t, st, step);
  if (R && R.blush && f !== 2) R.blush(ctx, f === 0 ? -14 : 0, f === 0 ? -28 : -48, 2.4, "#ff8aa8");
  ctx.restore();
}

export default { id: "cat", draw };
