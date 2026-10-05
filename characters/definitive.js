// Ficha definitiva. Pies en (0,0), mira a +x, alto de diseño ~100.
// Solo presentación. No cambia hitbox, daño ni física.

const INK = "#1a1022";

const CAST = {
  kilo:    ["#ffd0e4", "#ff8fb8", "#ffd56a", "#fff6ea"],
  stitcho: ["#6aa7ff", "#2f6bff", "#9ad7ff", "#eaf4ff"],
  chispin: ["#ffe56a", "#ffb703", "#fff4a8", "#fff"],
  cat:     ["#ffd0e8", "#ff8fb8", "#fff", "#7ec8ff"],
  dragon:  ["#ff8a5b", "#e8452f", "#ffd27a", "#fff1df"],
  dino:    ["#8fd36a", "#3e9a45", "#d8f5b0", "#245522"],
  frita:   ["#f0b43a", "#e07a2f", "#fff1b3", "#c45e16"],
  pizza:   ["#ffb43a", "#e23b3d", "#fff4c8", "#f4e2b0"],
  yomi:    ["#e8c090", "#8a5a3a", "#ff5b78", "#fff6df"],
  cuerno:  ["#f2c1ff", "#c47ad4", "#fff", "#7ee7ff"],
};

function pal(id) {
  return CAST[id] || CAST.kilo;
}

function fnum(pose) {
  return Math.max(0, Math.min(4, Math.round(Number(pose?.form) || 0)));
}

function ink(ctx, w) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
}

function blob(ctx, x, y, rx, ry, fill, rot) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function eye(ctx, x, y, r, pose) {
  const shut = pose.state === "hurt" || pose.state === "dead" || (pose.blink || 0) > 0.45;
  ctx.beginPath();
  if (shut) {
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x, y + r * 0.4, x + r, y);
  } else {
    ctx.ellipse(x, y, r, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + r * 0.15, y + 0.4, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1022";
    ctx.fill();
  }
  ctx.stroke();
}

function limb(ctx, x, y, len, rot, color, w) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke();
  ctx.restore();
}

function poseAngles(pose) {
  const st = pose.state || "idle";
  const sw = Math.sin(pose.phase || 0);
  const atk = pose.atk || 0;
  const ant = pose.anticipation || 0;
  let arm = 0.4;
  let leg = 0.15;
  let leg2 = -0.1;
  if (st === "run") {
    arm = sw * 0.9;
    leg = sw * 0.8;
    leg2 = -sw * 0.8;
  } else if (st === "jump") {
    arm = -1.2;
    leg = -0.9;
    leg2 = 0.4;
  } else if (st === "fall" || st === "glide") {
    arm = 0.6;
    leg = 0.35;
    leg2 = -0.2;
  } else if (st === "attack") {
    arm = -0.8 + ant * -0.6 + atk * 2.4;
    leg = 0.2 + atk * 0.3;
  } else if (st === "cast") {
    arm = -1.6;
    leg = 0.1;
  } else if (st === "hurt" || st === "dead") {
    arm = 0.8;
    leg = 0.5;
  }
  return { arm, leg, leg2, bob: st === "idle" ? Math.sin((pose.t || 0) * 0.08) * 2.2 : st === "run" ? -Math.abs(sw) * 3 : 0 };
}

function body(ctx, id, pose) {
  const f = fnum(pose);
  const [fur, dark, light, accent] = pal(id);
  const a = poseAngles(pose);
  const grow = 0.82 + f * 0.08;
  ink(ctx, 3.2);
  const hip = -18 * grow;
  limb(ctx, -6, hip, 16, a.leg + 1.2, dark, 5);
  limb(ctx, 6, hip, 16, a.leg2 + 1.2, dark, 5);
  blob(ctx, 0, hip - 16 * grow + a.bob, 16 * grow, 18 * grow, fur);
  blob(ctx, 2, hip - 12 * grow + a.bob, 8 * grow, 10 * grow, light);
  return { f, fur, dark, light, accent, a, hip, grow };
}

function head(ctx, x, y, r, pose, fill) {
  blob(ctx, x, y, r, r * 0.96, fill);
  eye(ctx, x - r * 0.32, y - r * 0.05, r * 0.18, pose);
  eye(ctx, x + r * 0.32, y - r * 0.02, r * 0.18, pose);
}

function kilo(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const bob = a.bob;
  const fur = ["#ffd0e4", "#ffb7d5", "#ff9ec8", "#ffe08a", "#fff6ea"][f];
  const leaf = ["#7dce6a", "#5cbf6a", "#3ea86a", "#ffd36a", "#fff1a8"][f];
  ink(ctx, 3.2);
  const hip = -16 - f * 2;
  limb(ctx, -5, hip, 12 + f * 2, a.leg + 1.15, "#e07aa8", 5);
  limb(ctx, 5, hip, 12 + f * 2, a.leg2 + 1.15, "#e07aa8", 5);
  blob(ctx, 0, hip - 14 + bob, 14 + f, 15 + f * 0.6, fur);
  const y = hip - 36 - f * 3 + bob;
  head(ctx, 0, y, 16 + f * 0.4, pose, fur);
  ctx.fillStyle = leaf;
  ctx.strokeStyle = INK;
  const petals = 3 + f;
  for (let i = 0; i < petals; i++) {
    const ang = -Math.PI / 2 + (i / petals) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(ang) * (10 + f * 2), y - 8 + Math.sin(ang) * (6 + f), 4 + f * 0.4, 8 + f, ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (f >= 2) {
    ctx.save();
    ctx.translate(10, y + 8);
    ctx.rotate(a.arm * 0.4);
    ctx.fillStyle = "#c47a3a";
    ctx.fillRect(-3, -2, 16, 8);
    ctx.strokeRect(-3, -2, 16, 8);
    ctx.strokeStyle = leaf;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(12, -16);
    ctx.stroke();
    ctx.restore();
  }
  if (f >= 4) {
    ctx.strokeStyle = "#ffd36a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, y + 6);
    ctx.quadraticCurveTo(-34, y - 8, -22, y + 18);
    ctx.moveTo(16, y + 6);
    ctx.quadraticCurveTo(34, y - 8, 22, y + 18);
    ctx.stroke();
  }
}

function stitcho(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const fur = ["#9ec8ff", "#6aa7ff", "#3d7cff", "#2f6bff", "#d7e6ff"][f];
  const dark = "#1d3f8f";
  ink(ctx, 3.2);
  const hip = -16 - f;
  limb(ctx, -6, hip, 14 + f, a.leg + 1.2, dark, 5);
  limb(ctx, 6, hip, 14 + f, a.leg2 + 1.2, dark, 5);
  if (f >= 2) {
    limb(ctx, -8, hip - 10, 12, a.arm + 0.4, dark, 4);
    limb(ctx, 8, hip - 10, 12, -a.arm + 0.2, dark, 4);
  }
  blob(ctx, 0, hip - 16 + a.bob, 16 + f, 15 + f * 0.4, fur);
  const y = hip - 38 - f * 2 + a.bob;
  head(ctx, 0, y, 15, pose, fur);
  blob(ctx, -16, y - 8, 6, 14 + f * 1.4, dark, -0.35);
  blob(ctx, 16, y - 8, 6, 14 + f * 1.4, dark, 0.35);
  ctx.strokeStyle = "#eaf4ff";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, y + 4);
  ctx.lineTo(6, y + 10);
  ctx.moveTo(-4, hip - 8);
  ctx.lineTo(5, hip - 2);
  ctx.stroke();
  if (f >= 1) {
    ctx.strokeStyle = "#67ddff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y - 14);
    ctx.lineTo(0, y - 24 - f * 2);
    ctx.stroke();
    blob(ctx, 0, y - 26 - f * 2, 3, 3, "#67ddff");
  }
  if (f >= 3) {
    ctx.strokeStyle = "#8f7bff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, y + 14);
    ctx.quadraticCurveTo(-30, y + 26, -14, y + 40);
    ctx.moveTo(12, y + 14);
    ctx.quadraticCurveTo(30, y + 26, 14, y + 40);
    ctx.stroke();
  }
  if (pose.state === "attack") {
    ctx.strokeStyle = "#dff4ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, y + 6);
    ctx.lineTo(28, y - 2);
    ctx.moveTo(16, y + 10);
    ctx.lineTo(30, y + 8);
    ctx.moveTo(16, y + 14);
    ctx.lineTo(28, y + 18);
    ctx.stroke();
  }
}

function chispin(ctx, pose) {
  const b = body(ctx, "chispin", pose);
  const y = b.hip - 40 * b.grow + b.a.bob;
  head(ctx, 0, y, 17, pose, b.fur);
  ctx.strokeStyle = b.accent;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-4, y - 16);
  ctx.lineTo(2, y - 28 - b.f * 2);
  ctx.lineTo(-1, y - 28);
  ctx.lineTo(6, y - 42 - b.f * 3);
  ctx.stroke();
  blob(ctx, -12, y + 2, 4, 3, b.dark);
  blob(ctx, 12, y + 2, 4, 3, b.dark);
}

function cat(ctx, pose) {
  const b = body(ctx, "cat", pose);
  const y = b.hip - 40 * b.grow + b.a.bob;
  head(ctx, 0, y, 16, pose, b.fur);
  blob(ctx, -10, y - 16, 4, 8, b.fur, -0.2);
  blob(ctx, 10, y - 16, 4, 8, b.fur, 0.2);
  const wag = Math.sin((pose.t || 0) * 0.2) * 6;
  ctx.strokeStyle = b.dark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(8, b.hip);
  ctx.quadraticCurveTo(-10, b.hip - 10, -16 + wag, b.hip - 24 - b.f * 2);
  ctx.stroke();
}

function dragon(ctx, pose) {
  const b = body(ctx, "dragon", pose);
  const y = b.hip - 38 * b.grow + b.a.bob;
  head(ctx, 8, y, 15, pose, b.fur);
  ctx.fillStyle = b.dark;
  ctx.beginPath();
  ctx.moveTo(18, y);
  ctx.lineTo(28 + b.f, y + 2);
  ctx.lineTo(16, y + 6);
  ctx.fill();
  ctx.stroke();
  if (b.f >= 1) {
    ctx.strokeStyle = b.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, y + 8);
    ctx.quadraticCurveTo(-26 - b.f * 3, y - 8, -18, y + 16);
    ctx.moveTo(6, y + 6);
    ctx.quadraticCurveTo(24 + b.f * 3, y - 10, 16, y + 14);
    ctx.stroke();
  }
}

function dino(ctx, pose) {
  const b = body(ctx, "dino", pose);
  const y = b.hip - 36 * b.grow + b.a.bob;
  head(ctx, 10, y, 16 + b.f, pose, b.fur);
  for (let i = 0; i < 2 + b.f; i++) {
    ctx.beginPath();
    ctx.moveTo(-8 + i * 6, y + 8);
    ctx.lineTo(-6 + i * 6, y - 6 - i);
    ctx.strokeStyle = b.dark;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.strokeStyle = b.dark;
  ctx.beginPath();
  ctx.moveTo(-12, b.hip);
  ctx.quadraticCurveTo(-28, b.hip + 4, -22, b.hip + 14);
  ctx.stroke();
}

function frita(ctx, pose) {
  const b = body(ctx, "frita", pose);
  const y = b.hip - 34 * b.grow + b.a.bob;
  ctx.fillStyle = b.accent;
  ctx.fillRect(-14, y - 16, 28, 28 + b.f * 2);
  ctx.strokeRect(-14, y - 16, 28, 28 + b.f * 2);
  head(ctx, 0, y - 8, 12, pose, b.fur);
  ctx.strokeStyle = b.light;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3 + b.f; i++) {
    ctx.beginPath();
    ctx.moveTo(-10 + i * 5, y - 16);
    ctx.lineTo(-10 + i * 5, y - 28 - (i % 2) * 4);
    ctx.stroke();
  }
}

function pizza(ctx, pose) {
  const b = body(ctx, "pizza", pose);
  const y = b.hip - 36 * b.grow + b.a.bob;
  ctx.fillStyle = b.fur;
  ctx.beginPath();
  ctx.moveTo(0, y - 22 - b.f * 2);
  ctx.lineTo(20 + b.f, y + 12);
  ctx.lineTo(-16, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = b.accent;
  ctx.beginPath();
  ctx.arc(-2, y - 2, 3, 0, Math.PI * 2);
  ctx.arc(6, y + 2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  eye(ctx, -2, y - 6, 3, pose);
}

function yomi(ctx, pose) {
  const b = body(ctx, "yomi", pose);
  const y = b.hip - 46 * b.grow + b.a.bob;
  blob(ctx, 0, y, 14, 20 + b.f, b.fur);
  ctx.strokeStyle = b.accent;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-8, y + 4);
  ctx.quadraticCurveTo(0, y + 12 + (pose.state === "attack" ? 6 : 0), 8, y + 4);
  ctx.stroke();
  eye(ctx, -5, y - 6, 2.6, pose);
  eye(ctx, 5, y - 6, 2.6, pose);
  if (b.f >= 3) {
    ctx.beginPath();
    ctx.moveTo(0, y - 18);
    ctx.lineTo(-6, y - 30);
    ctx.lineTo(6, y - 30);
    ctx.closePath();
    ctx.stroke();
  }
}

function cuerno(ctx, pose) {
  const b = body(ctx, "cuerno", pose);
  const y = b.hip - 40 * b.grow + b.a.bob;
  head(ctx, 0, y, 16, pose, b.fur);
  ctx.strokeStyle = b.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, y - 12);
  ctx.quadraticCurveTo(-16 - b.f * 2, y - 28, -6, y - 36 - b.f * 2);
  ctx.moveTo(4, y - 12);
  ctx.quadraticCurveTo(16 + b.f * 2, y - 28, 6, y - 36 - b.f * 2);
  ctx.stroke();
}

const DRAW = { kilo, stitcho, chispin, cat, dragon, dino, frita, pizza, yomi, cuerno, lilo: kilo, stitch: stitcho, pikachu: chispin, michi: cat };

export function drawDefinitive(ctx, id, pose) {
  const draw = DRAW[id] || kilo;
  ctx.save();
  draw(ctx, pose || {});
  ctx.restore();
}
