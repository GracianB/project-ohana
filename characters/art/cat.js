// Michi · 5 formas. Origen (0,0) = centro de los pies. Mira a +x.
// Michito · Michi · Nube rosa · Michi Luna · MICHI GOD
const TAU = Math.PI * 2;
const INK = "#3a2416";

const PAL = [
  { fur: "#ffe0b0", dark: "#e8b070", belly: "#fff8ee", ear: "#ffb7c8", nose: "#ff8aa0", eye: "#4aa3e8", accent: "#7ec8ff", ink: "#6a4030" },
  { fur: "#f6a04a", dark: "#c86a22", belly: "#ffe7c4", ear: "#ff8fa3", nose: "#e23b4a", eye: "#2f6fe0", accent: "#e23b3d", ink: "#3a2416" },
  { fur: "#ffd0e6", dark: "#f0a0c4", belly: "#fff", ear: "#ff9ec8", nose: "#ff5c8a", eye: "#3f8ef0", accent: "#7fd8ff", ink: "#6a3050" },
  { fur: "#cbb6ff", dark: "#7a62c8", belly: "#f6f0ff", ear: "#b594ff", nose: "#ff7aa8", eye: "#5b3fd0", accent: "#ffd76a", ink: "#2c2050" },
  { fur: "#fff7ee", dark: "#f0c98a", belly: "#fff", ear: "#ffd0e0", nose: "#ff5c8a", eye: "#e0489b", accent: "#ffd24a", ink: "#5a3a18" },
];

function ink(ctx, w, color) {
  ctx.lineWidth = w;
  ctx.strokeStyle = color || INK;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function blob(ctx, x, y, rx, ry, fill, lw) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), 0, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  ink(ctx, lw == null ? 2.6 : lw);
}

function eye(ctx, x, y, r, pose, color, shut) {
  const blink = (pose && pose.blink) || 0;
  if (shut || blink > 0.65) {
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x, y + r * 0.45, x + r, y);
    ink(ctx, 2.6);
    return;
  }
  blob(ctx, x, y, r, r * 1.18, "#fff", 2.4);
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.08, r * 0.5, r * 0.62, 0, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + r * 0.16, Math.max(1, r * 0.22), 0, TAU);
  ctx.fillStyle = "#1a120c";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.32, Math.max(1, r * 0.16), 0, TAU);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

function tri(ctx, x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.2);
  ctx.lineTo(x - s * 0.7, y + s * 0.55);
  ctx.lineTo(x + s * 0.7, y + s * 0.55);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ink(ctx, 1.6);
}

function whiskers(ctx, y) {
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(-12, y); ctx.lineTo(-26, y - 3);
  ctx.moveTo(-12, y + 4); ctx.lineTo(-26, y + 6);
  ctx.moveTo(14, y); ctx.lineTo(28, y - 3);
  ctx.moveTo(14, y + 4); ctx.lineTo(28, y + 6);
  ink(ctx, 1.4);
  ctx.restore();
}

function ear(ctx, side, r, fur, inner, tilt) {
  ctx.save();
  ctx.translate(side * r * 0.55, -r * 0.72);
  ctx.rotate(side * (0.15 + tilt));
  ctx.beginPath();
  ctx.moveTo(-r * 0.28, r * 0.2);
  ctx.lineTo(0, -r * 0.55);
  ctx.lineTo(r * 0.32, r * 0.22);
  ctx.closePath();
  ctx.fillStyle = fur;
  ctx.fill();
  ink(ctx, 2.4);
  ctx.beginPath();
  ctx.moveTo(-r * 0.12, r * 0.08);
  ctx.lineTo(0, -r * 0.32);
  ctx.lineTo(r * 0.14, r * 0.1);
  ctx.fillStyle = inner;
  ctx.fill();
  ctx.restore();
}

function paw(ctx, x, y, len, ang, fur) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(-4.5, 0);
  ctx.lineTo(-5, len);
  ctx.quadraticCurveTo(0, len + 5, 5, len);
  ctx.lineTo(4.5, 0);
  ctx.closePath();
  ctx.fillStyle = fur;
  ctx.fill();
  ink(ctx, 2.2);
  ctx.fillStyle = "#ffb0c4";
  ctx.beginPath();
  ctx.ellipse(0, len + 1, 2.2, 1.4, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function wing(ctx, side, flap, fill) {
  ctx.save();
  ctx.translate(-6, -28);
  ctx.scale(side, 1);
  ctx.rotate(-0.7 - flap);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(16, -28, 42, -22, 40, -4);
  ctx.bezierCurveTo(36, 6, 22, 8, 0, 6);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ink(ctx, 2.4);
  ctx.restore();
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, Math.round(Number(pose && pose.form) || 0)));
  const c = PAL[f];
  const t = (pose && pose.t) || 0;
  const st = (pose && pose.state) || "idle";
  const run = st === "run";
  const air = st === "jump" || st === "fall" || st === "glide";
  const shut = st === "dead" || (st === "hurt" && ((pose.blink || 0) > 0.2));
  const step = run ? Math.sin((pose.phase || 0) * 2) : 0;
  const hop = run ? -Math.abs(step) * 5 : st === "victory" ? -Math.abs(Math.sin(t * 0.18)) * 10 : 0;

  const headR = [32, 26, 28, 27, 30][f];
  const bodyRX = [11, 18, 24, 20, 22][f];
  const bodyRY = [8, 13, 16, 14, 15][f];
  const legL = [4, 9, 8, 10, 11][f];
  const tails = [1, 1, 1, 2, 3][f];
  const bodyY = -legL - bodyRY;

  ctx.save();
  ctx.translate(0, hop);
  if (st === "dead") ctx.rotate(0.12);

  if (f === 4) {
    const flap = Math.sin(t * (air ? 0.45 : 0.12)) * 0.35;
    wing(ctx, -1, flap, "#fff");
    wing(ctx, 1, -flap * 0.6, "#fff4d0");
  }

  if (f === 3) {
    ctx.beginPath();
    const w = Math.sin(t * 0.1) * 4;
    ctx.moveTo(-4, bodyY);
    ctx.quadraticCurveTo(-bodyRX - 16 + w, bodyY + 8, -bodyRX - 8 + w, -2);
    ctx.lineTo(-4, -2);
    ctx.closePath();
    ctx.fillStyle = "#5a3fd0";
    ctx.fill();
    ink(ctx, 2.2);
  }

  for (let i = 0; i < tails; i++) {
    const spread = (i - (tails - 1) / 2) * 0.55;
    const swing = Math.sin(t * 0.1 + i) * 0.45 + (st === "hurt" ? -0.4 : 0);
    const len = f === 0 ? 16 : 28 + f * 4;
    const end = R && R.tail
      ? R.tail(ctx, -bodyRX * 0.7, bodyY + 4, len, -2.2 + spread, () => swing, f === 0 ? 6 : 8, 4, c.fur, { ink: c.ink, lw: 2.4, segments: 8 })
      : null;
    if (end) {
      if (f === 2) blob(ctx, end[0], end[1], 8, 6, "#fff", 2);
      else if (f === 0) blob(ctx, end[0], end[1], 4, 4, c.dark, 1.6);
      else tri(ctx, end[0], end[1], f === 4 ? 7 : 5, f >= 3 ? c.accent : c.nose);
    }
  }

  const swingLeg = air ? 0.35 : step * 0.4;
  if (f > 0) {
    paw(ctx, -bodyRX * 0.45, 0, legL, swingLeg, c.dark);
    paw(ctx, bodyRX * 0.35, 0, legL, -swingLeg, c.dark);
  }
  paw(ctx, -bodyRX * 0.2, 0, legL + (f === 0 ? 1 : 3), -swingLeg, c.fur);

  ctx.save();
  ctx.translate(0, bodyY + bodyRY);
  const squash = run ? 1 + step * 0.06 : 1;
  ctx.scale(1 / squash, squash);
  ctx.translate(0, -bodyRY);
  blob(ctx, 0, 0, bodyRX, bodyRY, c.fur);
  blob(ctx, bodyRX * 0.15, bodyRY * 0.15, bodyRX * 0.5, bodyRY * 0.5, c.belly, 0);
  if (f === 1 || f === 4) {
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 2;
    for (let i = 0; i < (f === 4 ? 2 : 3); i++) {
      ctx.beginPath();
      ctx.moveTo(-bodyRX * 0.2, -4 + i * 5);
      ctx.quadraticCurveTo(0, -1 + i * 5, bodyRX * 0.15, -4 + i * 5);
      ctx.stroke();
    }
  }
  if (f === 2) {
    for (let i = 0; i < 5; i++) {
      const a = -2.4 + i * 0.55;
      blob(ctx, Math.cos(a) * (bodyRX * 0.7), Math.sin(a) * 8 - 2, 8, 7, "#fff", 2);
    }
  }
  ctx.restore();

  let pawUp = null;
  if (st === "attack") pawUp = -0.2 + (pose.atk || 0) * 2.2;
  else if (st === "victory") pawUp = 2.4 + Math.sin(t * 0.3) * 0.3;
  else if (st === "cast") pawUp = 2.2;
  if (pawUp != null && f > 0) {
    ctx.save();
    ctx.translate(bodyRX * 0.4, bodyY);
    ctx.rotate(pawUp);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -16 - f);
    ink(ctx, 10, c.ink);
    ink(ctx, 7, c.fur);
    blob(ctx, 0, -16 - f, 4, 3.2, "#ffb0c4", 1.5);
    ctx.restore();
  } else {
    paw(ctx, bodyRX * 0.45, 0, legL + 2, swingLeg, c.fur);
  }

  const headX = f === 0 ? 2 : 8;
  const headY = f === 0 ? bodyY - headR * 0.35 : bodyY - headR * 0.55;
  ctx.save();
  ctx.translate(headX, headY + ((pose && pose.bounce) || 0));
  ctx.rotate(st === "hurt" ? -0.25 : Math.sin(t * 0.04) * 0.04);
  const earTilt = st === "hurt" ? 0.35 : 0;
  ear(ctx, -1, headR, c.fur, c.ear, earTilt);
  ear(ctx, 1, headR, c.fur, c.ear, -earTilt * 0.5);
  blob(ctx, 0, 2, headR * (f === 0 ? 1.15 : 1.02), headR * 0.95, c.fur);

  if (f === 2) {
    blob(ctx, -headR * 0.7, 0, 8, 7, "#fff", 2);
    blob(ctx, headR * 0.75, 2, 7, 6, "#fff", 2);
  }

  const er = headR * (f === 0 ? 0.34 : 0.3);
  eye(ctx, -headR * 0.32, 0, er, pose, c.eye, shut || st === "dead");
  eye(ctx, headR * 0.34, 0, er * 0.96, pose, c.eye, shut || st === "dead");
  tri(ctx, headR * 0.02, headR * 0.28, f === 0 ? 4.2 : 3.4, c.nose);
  ctx.beginPath();
  ctx.moveTo(-4, headR * 0.42);
  ctx.quadraticCurveTo(1, headR * (st === "attack" || st === "victory" ? 0.62 : 0.52), 6, headR * 0.42);
  ink(ctx, 2);
  whiskers(ctx, headR * 0.36);
  if (R && R.blush) {
    R.blush(ctx, -headR * 0.55, headR * 0.32, 3, "#ff8aa8");
    R.blush(ctx, headR * 0.58, headR * 0.32, 3, "#ff8aa8");
  }

  if (f === 0) {
    blob(ctx, headR * 0.08, headR * 0.62, 3.4, 3.4, c.accent, 1.8);
  } else if (f === 1) {
    ctx.beginPath();
    ctx.moveTo(-10, -headR * 0.15);
    ctx.quadraticCurveTo(0, -headR * 0.02, 10, -headR * 0.15);
    ink(ctx, 4, c.accent);
    blob(ctx, 0, headR * 0.05, 3.2, 3.2, "#ffd24a", 1.6);
  } else if (f === 2 && R && R.star) {
    R.star(ctx, -headR * 0.55, -headR * 0.75, 6, c.accent);
  } else if (f === 3) {
    ctx.beginPath();
    ctx.arc(-headR * 0.15, -headR * 0.15, 7, 0.6, 5.6);
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.accent;
    ctx.stroke();
  } else {
    for (let i = -1; i <= 1; i++) {
      tri(ctx, i * 8, -headR * 0.95 - (i === 0 ? 4 : 0), i === 0 ? 6 : 4.5, c.accent);
    }
  }
  ctx.restore();

  if (f === 4 && R && R.halo) R.halo(ctx, headX, headY - headR - 8, 16, t, "#ffd76a");

  if (st === "attack") {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(headX + 16, bodyY, 18, -1.2, 0.4);
    ink(ctx, 3, "#fff");
    ctx.restore();
  }

  ctx.restore();
}

export default { id: "cat", draw };
