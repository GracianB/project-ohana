// Michi · gato jengibre de pegatina. Origen (0,0) = pies.
// Otro dibujo: cabeza redonda, ojos blancos, rayas, cola gruesa.
const TAU = Math.PI * 2;
const INK = "#3a2416";

const PAL = [
  { fur: "#ffd7a8", dark: "#e39a55", belly: "#fff6ea", ear: "#ffb7c2", nose: "#ff7a8a", eye: "#4aa3e8", accent: "#7ec8ff" },
  { fur: "#f6a04a", dark: "#d4782a", belly: "#ffe7c4", ear: "#ff8fa3", nose: "#e23b4a", eye: "#2f6fe0", accent: "#e23b3d" },
  { fur: "#ffc2de", dark: "#e08ab0", belly: "#fff", ear: "#ff9ec4", nose: "#ff5c8a", eye: "#3f8ef0", accent: "#7fd8ff" },
  { fur: "#cbb6ff", dark: "#8d74d8", belly: "#f4eeff", ear: "#b594ff", nose: "#ff7aa8", eye: "#5b3fd0", accent: "#ffd76a" },
  { fur: "#fff7ee", dark: "#f0c98a", belly: "#fff", ear: "#ffd1e0", nose: "#ff5c8a", eye: "#e0489b", accent: "#ffd24a" },
];

function ink(ctx, w = 3) {
  ctx.lineWidth = w;
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function blob(ctx, x, y, rx, ry, fill, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), rot, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  ink(ctx, 2.8);
}

function eye(ctx, x, y, r, pose, color, shut) {
  if (shut || (pose.blink || 0) > 0.65) {
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x, y + r * 0.55, x + r, y);
    ink(ctx, 2.6);
    return;
  }
  blob(ctx, x, y, r * 0.95, r * 1.15, "#fff");
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.08, r * 0.48, r * 0.58, 0, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + r * 0.16, r * 0.22, 0, TAU);
  ctx.fillStyle = "#1a120c";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.32, r * 0.18, 0, TAU);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

function stripes(ctx, x, y, w, n, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const yy = y - 6 + i * 7;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.35, yy);
    ctx.quadraticCurveTo(x, yy + 3, x + w * 0.35, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = INK;
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, Number(pose && pose.form) || 0));
  const c = PAL[f];
  const t = (pose && pose.t) || 0;
  const st = (pose && pose.state) || "idle";
  const run = st === "run";
  const shut = st === "hurt" || st === "dead";
  const step = run ? Math.sin((pose.phase || 0) * 2) : 0;
  const hop = run ? -Math.abs(step) * 4 : st === "victory" ? -Math.abs(Math.sin(t * 0.18)) * 8 : 0;
  const bob = Math.sin(t * 0.05) * 1.2;

  ctx.save();
  ctx.translate(0, hop + bob);

  const tails = [1, 1, 1, 2, 3][f];
  for (let i = 0; i < tails; i++) {
    const spread = (i - (tails - 1) / 2) * 14;
    const wag = Math.sin(t * 0.12 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(-16, -22);
    ctx.bezierCurveTo(-34, -8 + spread * 0.2, -28 + wag, 8 + spread, -8 + wag * 0.3, 6 + spread * 0.15);
    ctx.lineWidth = 16;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.lineWidth = 11;
    ctx.strokeStyle = c.fur;
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.dark;
    ctx.stroke();
    blob(ctx, -8 + wag * 0.3, 4 + spread * 0.15, 6, 5, c.dark);
  }

  const leg = (x, ang) => {
    ctx.save();
    ctx.translate(x, 0);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-5.5, 12);
    ctx.quadraticCurveTo(0, 18, 5.5, 12);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fillStyle = c.fur;
    ctx.fill();
    ink(ctx, 2.4);
    ctx.fillStyle = "#ffb7c5";
    ctx.beginPath();
    ctx.ellipse(0, 13, 2.4, 1.5, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  };
  leg(-9, step * 0.35);
  leg(10, -step * 0.35);

  blob(ctx, 2, -26, 18 + f, 15 + f * 0.6, c.fur);
  blob(ctx, 6, -22, 9, 8, c.belly);
  stripes(ctx, -2, -30, 16, f === 0 ? 1 : 2, c.dark);

  ctx.save();
  ctx.translate(4, -58);
  ctx.rotate(st === "hurt" ? -0.18 : Math.sin(t * 0.04) * 0.04);

  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 8, -10);
    ctx.lineTo(side * 20, -34);
    ctx.lineTo(side * 2, -12);
    ctx.closePath();
    ctx.fillStyle = c.fur;
    ctx.fill();
    ink(ctx, 2.6);
    ctx.beginPath();
    ctx.moveTo(side * 8, -12);
    ctx.lineTo(side * 15, -26);
    ctx.lineTo(side * 4, -12);
    ctx.fillStyle = c.ear;
    ctx.fill();
  }

  blob(ctx, 0, 4, 26, 24, c.fur);
  stripes(ctx, -10, -8, 10, 2, c.dark);

  eye(ctx, -9, 2, 8.2, pose, c.eye, shut);
  eye(ctx, 10, 2, 8.2, pose, c.eye, shut);

  ctx.beginPath();
  ctx.moveTo(1, 10);
  ctx.lineTo(-3, 14);
  ctx.lineTo(5, 14);
  ctx.closePath();
  ctx.fillStyle = c.nose;
  ctx.fill();
  ink(ctx, 1.6);

  ctx.beginPath();
  ctx.moveTo(-4, 15);
  ctx.quadraticCurveTo(1, st === "attack" || st === "victory" ? 21 : 18, 6, 15);
  ink(ctx, 2.2);

  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(-14, 12); ctx.lineTo(-28, 9);
  ctx.moveTo(-14, 16); ctx.lineTo(-28, 18);
  ctx.moveTo(16, 12); ctx.lineTo(30, 9);
  ctx.moveTo(16, 16); ctx.lineTo(30, 18);
  ink(ctx, 1.5);
  ctx.globalAlpha = 1;

  if (R && R.blush) {
    R.blush(ctx, -16, 12, 3.2, "#ff8aa0");
    R.blush(ctx, 17, 12, 3.2, "#ff8aa0");
  }

  if (f === 0) {
    blob(ctx, 0, 22, 3.2, 3.2, c.accent);
  } else if (f === 2 && R && R.star) {
    R.star(ctx, -16, -22, 6, c.accent);
  } else if (f === 3) {
    ctx.beginPath();
    ctx.arc(-14, -24, 7, 0.4, 5.4);
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.accent;
    ctx.stroke();
    ctx.strokeStyle = INK;
  } else if (f >= 1 && f !== 3) {
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.quadraticCurveTo(0, -16, 8, -22);
    ctx.lineWidth = 4;
    ctx.strokeStyle = c.accent;
    ctx.stroke();
    blob(ctx, 0, -14, 3.4, 3.4, "#ffd24a");
  }
  ctx.restore();

  if (f === 4 && R && R.halo) R.halo(ctx, 4, -92, 18, t, "#ffd76a");

  if (st === "attack") {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, -36, 16, -1.1, 0.5);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

export default { id: "cat", draw };
