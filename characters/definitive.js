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
  const id = pose.id || "";
  const sw = Math.sin(pose.phase || 0);
  const atk = pose.atk || 0;
  const ant = pose.anticipation || 0;
  const weight = { dino: 0.6, dragon: 0.8, frita: 0.7, yomi: 1.15, chispin: 1.2, kilo: 1.1, cat: 1.05 }[id] || 1;
  let arm = 0.4;
  let leg = 0.15;
  let leg2 = -0.1;
  if (st === "run") {
    arm = sw * 0.9 * weight;
    leg = sw * (id === "dino" ? 0.45 : 0.8);
    leg2 = -sw * (id === "dino" ? 0.45 : 0.8);
  } else if (st === "jump") {
    arm = id === "cat" ? -0.4 : -1.2;
    leg = id === "dino" ? -0.3 : -0.9;
    leg2 = 0.4;
  } else if (st === "fall" || st === "glide") {
    arm = id === "dragon" ? 1.4 : 0.6;
    leg = 0.35;
    leg2 = -0.2;
  } else if (st === "attack") {
    arm = (id === "dino" ? -0.4 : -1.3) + ant * -0.8 + atk * (id === "yomi" ? 1.4 : 3.1);
    leg = id === "dino" ? 0.55 : 0.2 + atk * 0.3;
  } else if (st === "cast") {
    arm = id === "pizza" ? 0.2 : -1.6;
    leg = id === "cuerno" ? -0.4 : 0.1;
  } else if (st === "hurt" || st === "dead") {
    arm = 0.8;
    leg = 0.5;
  }
  const bobAmp = id === "chispin" ? 4.2 : id === "dino" ? 1.4 : 2.8;
  return { arm, leg, leg2, bob: st === "idle" ? Math.sin((pose.t || 0) * 0.08) * bobAmp : st === "run" ? -Math.abs(sw) * 3 : 0 };
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
  const f = fnum(pose);
  const a = poseAngles(pose);
  const fur = ["#fff3a0", "#ffe56a", "#ffd23a", "#ffb703", "#fff"][f];
  ink(ctx, 3.2);
  const hip = -14 - f;
  limb(ctx, -5, hip, 12 + f, a.leg + 1.2, "#c98412", 5);
  limb(ctx, 5, hip, 12 + f, a.leg2 + 1.2, "#c98412", 5);
  blob(ctx, 0, hip - 14 + a.bob, 15 + f * 0.6, 14 + f * 0.4, fur);
  const y = hip - 36 - f * 2 + a.bob;
  head(ctx, 0, y, 16, pose, fur);
  blob(ctx, -12, y + 2, 4.5, 3.2, "#ff8a3a");
  blob(ctx, 12, y + 2, 4.5, 3.2, "#ff8a3a");
  ctx.strokeStyle = "#fff29a";
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-3, y - 14);
  ctx.lineTo(2, y - 26 - f * 2);
  ctx.lineTo(-1, y - 26);
  ctx.lineTo(5, y - 40 - f * 3);
  ctx.stroke();
  if (f >= 2) {
    ctx.beginPath();
    ctx.moveTo(-18, y - 4);
    ctx.lineTo(-28, y - 14);
    ctx.moveTo(18, y - 2);
    ctx.lineTo(28, y - 12);
    ctx.stroke();
  }
  if (f >= 4) {
    ctx.beginPath();
    ctx.moveTo(-8, hip);
    ctx.quadraticCurveTo(-20, hip + 8, -6, hip + 16);
    ctx.moveTo(8, hip);
    ctx.quadraticCurveTo(22, hip + 6, 8, hip + 18);
    ctx.stroke();
  }
  if (pose.state === "attack" || pose.state === "cast") {
    ctx.beginPath();
    ctx.moveTo(14, y + 6);
    ctx.lineTo(26, y - 4);
    ctx.lineTo(22, y + 2);
    ctx.lineTo(34, y + 10);
    ctx.stroke();
  }
}

function cat(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const fur = ["#ffe3b8", "#f29a3a", "#ffd0e8", "#c9b4ff", "#fff6ea"][f];
  const dark = ["#e7b56a", "#c45e16", "#e888c0", "#6a4ec4", "#e4c07a"][f];
  ink(ctx, 3.2);
  const hip = -14 - f;
  limb(ctx, -5, hip, 12 + f, a.leg + 1.15, dark, 4.5);
  limb(ctx, 5, hip, 12 + f, a.leg2 + 1.15, dark, 4.5);
  blob(ctx, 0, hip - 14 + a.bob, 14 + f * 0.5, 13 + f * 0.4, fur);
  const y = hip - 34 - f * 2 + a.bob;
  head(ctx, 0, y, 15, pose, fur);
  blob(ctx, -9, y - 14, 3.4, 8 + f, fur, -0.25);
  blob(ctx, 9, y - 14, 3.4, 8 + f, fur, 0.25);
  ctx.fillStyle = "#ff8aa0";
  ctx.beginPath();
  ctx.moveTo(0, y + 4);
  ctx.lineTo(-3, y + 8);
  ctx.lineTo(3, y + 8);
  ctx.fill();
  const tails = f >= 4 ? 3 : 1;
  const wag = Math.sin((pose.t || 0) * 0.22) * 6;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 4;
  for (let i = 0; i < tails; i++) {
    ctx.beginPath();
    ctx.moveTo(6, hip - i * 3);
    ctx.quadraticCurveTo(-8 - i * 4, hip - 8, -14 + wag + i * 4, hip - 22 - f * 2);
    ctx.stroke();
  }
  if (f >= 2) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, y - 20, 10 + f, 0.5, 2.6);
    ctx.stroke();
  }
  if (pose.state === "attack") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, y + 8);
    ctx.lineTo(26, y + 2);
    ctx.moveTo(14, y + 12);
    ctx.lineTo(28, y + 12);
    ctx.moveTo(14, y + 16);
    ctx.lineTo(26, y + 22);
    ctx.stroke();
  }
}

function dragon(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const fur = ["#ffb08a", "#ff8a5b", "#ff6a3a", "#e8452f", "#ffd27a"][f];
  ink(ctx, 3.2);
  const hip = -16 - f;
  limb(ctx, -6, hip, 14 + f, a.leg + 1.2, "#a8321c", 5);
  limb(ctx, 6, hip, 14 + f, a.leg2 + 1.2, "#a8321c", 5);
  blob(ctx, -2, hip - 16 + a.bob, 16 + f, 15, fur);
  const y = hip - 34 - f * 2 + a.bob;
  head(ctx, 8, y, 14, pose, fur);
  ctx.fillStyle = "#a8321c";
  ctx.beginPath();
  ctx.moveTo(16, y);
  ctx.lineTo(28 + f * 2, y + 2);
  ctx.lineTo(14, y + 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (f >= 1) {
    ctx.strokeStyle = "#ffd27a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, y - 12);
    ctx.quadraticCurveTo(-2, y - 24 - f * 2, 4, y - 14);
    ctx.stroke();
  }
  if (f >= 2) {
    ctx.fillStyle = "rgba(255,90,40,.55)";
    ctx.beginPath();
    ctx.moveTo(-8, y + 6);
    ctx.quadraticCurveTo(-32 - f * 3, y - 16, -16, y + 18);
    ctx.quadraticCurveTo(-18, y + 6, -8, y + 6);
    ctx.moveTo(10, y + 4);
    ctx.quadraticCurveTo(34 + f * 3, y - 18, 18, y + 16);
    ctx.quadraticCurveTo(16, y + 4, 10, y + 4);
    ctx.fill();
    ctx.stroke();
  }
  if (pose.state === "attack" || pose.state === "cast") {
    ctx.fillStyle = "#ffd36a";
    ctx.beginPath();
    ctx.moveTo(24, y + 2);
    ctx.quadraticCurveTo(40, y - 6, 36, y + 8);
    ctx.quadraticCurveTo(30, y + 4, 24, y + 2);
    ctx.fill();
  }
}

function dino(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const fur = ["#d8f5b0", "#8fd36a", "#5cbf56", "#3e9a45", "#c8f04a"][f];
  const dark = "#245522";
  ink(ctx, 3.4);
  const hip = -14 - f;
  limb(ctx, -7, hip, 16 + f, a.leg + 1.25, dark, 6);
  limb(ctx, 7, hip, 16 + f, a.leg2 + 1.25, dark, 6);
  blob(ctx, -4, hip - 18 + a.bob, 18 + f, 16 + f * 0.4, fur);
  const y = hip - 32 - f * 2 + a.bob;
  head(ctx, 12, y, 15 + f * 0.4, pose, fur);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(20, y + 2);
  ctx.lineTo(32 + f, y + 4);
  ctx.lineTo(18, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const spines = 2 + f;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  for (let i = 0; i < spines; i++) {
    ctx.beginPath();
    ctx.moveTo(-10 + i * 6, y + 10);
    ctx.lineTo(-8 + i * 6, y - 4 - (i % 2) * 6);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-16, hip);
  ctx.quadraticCurveTo(-32 - f * 2, hip + 2, -24, hip + 16);
  ctx.stroke();
  if (pose.state === "attack") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(28, y + 2);
    ctx.lineTo(40, y - 4);
    ctx.lineTo(36, y + 6);
    ctx.fill();
  }
}

function frita(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  ink(ctx, 3.2);
  const hip = -12 - f;
  limb(ctx, -6, hip, 12 + f, a.leg + 1.2, "#c45e16", 5);
  limb(ctx, 6, hip, 12 + f, a.leg2 + 1.2, "#c45e16", 5);
  const y = hip - 28 - f * 2 + a.bob;
  ctx.fillStyle = ["#f0b43a", "#e07a2f", "#ffb43a", "#ffd36a", "#fff1b3"][f];
  ctx.fillRect(-16, y - 8, 32, 30 + f * 2);
  ctx.strokeRect(-16, y - 8, 32, 30 + f * 2);
  ctx.fillStyle = "#e23b3b";
  ctx.fillRect(-16, y + 10, 32, 5);
  ctx.strokeRect(-16, y + 10, 32, 5);
  head(ctx, 0, y + 4, 10, pose, "#fff1b3");
  ctx.strokeStyle = "#fff1b3";
  ctx.lineWidth = 3;
  const n = 4 + f;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(-14 + i * (28 / (n - 1)), y - 8);
    ctx.lineTo(-14 + i * (28 / (n - 1)), y - 22 - (i % 2) * 6);
    ctx.stroke();
  }
  if (pose.state === "attack") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(16 + i * 4, y + 2 + (i % 2) * 4, 2, 2);
    }
  }
}

function pizza(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  ink(ctx, 3.2);
  const hip = -12 - f;
  limb(ctx, -5, hip, 12 + f, a.leg + 1.2, "#c45a12", 5);
  limb(ctx, 6, hip, 12 + f, a.leg2 + 1.2, "#c45a12", 5);
  const y = hip - 30 - f * 2 + a.bob;
  ctx.fillStyle = ["#ffd27a", "#ffb43a", "#ff9a2a", "#ff7a2a", "#ffe08a"][f];
  ctx.beginPath();
  ctx.moveTo(0, y - 24 - f * 2);
  ctx.lineTo(22 + f * 2, y + 14);
  ctx.lineTo(-18, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#f4e2b0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-16, y + 12);
  ctx.lineTo(20 + f, y + 12);
  ctx.stroke();
  ctx.fillStyle = "#e0402a";
  const dots = 2 + f;
  for (let i = 0; i < dots; i++) {
    ctx.beginPath();
    ctx.arc(-6 + (i % 3) * 7, y - 2 + Math.floor(i / 3) * 6, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  eye(ctx, -2, y - 8, 3.2, pose);
  if (pose.state === "attack" || pose.state === "cast") {
    ctx.strokeStyle = "#ffd84a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, y + 4);
    ctx.quadraticCurveTo(28, y - 6, 34, y + 8);
    ctx.stroke();
  }
}

function yomi(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const paper = ["#f2e6c8", "#e8c090", "#d7a36a", "#c98458", "#fff6df"][f];
  ink(ctx, 3.2);
  const hip = -10 - f;
  limb(ctx, -4, hip, 10 + f, a.leg + 1.1, "#6a3cff", 4);
  limb(ctx, 4, hip, 10 + f, a.leg2 + 1.1, "#6a3cff", 4);
  const y = hip - 36 - f * 3 + a.bob;
  blob(ctx, 0, y, 13, 20 + f * 2, paper);
  if (f >= 2) {
    ctx.fillStyle = "#6a3cff";
    ctx.fillRect(-18, y - 4, 8, 22 + f * 2);
    ctx.strokeRect(-18, y - 4, 8, 22 + f * 2);
  }
  eye(ctx, -5, y - 6, 2.8, pose);
  eye(ctx, 5, y - 6, 2.8, pose);
  const open = pose.state === "attack" || pose.state === "cast" ? 8 : 2;
  ctx.strokeStyle = "#ff2244";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-8, y + 4);
  ctx.quadraticCurveTo(0, y + 10 + open, 8, y + 4);
  ctx.stroke();
  if (f >= 1) {
    ctx.fillStyle = "#fff6df";
    ctx.fillRect(14, y - 8, 8, 14);
    ctx.strokeRect(14, y - 8, 8, 14);
    ctx.fillStyle = "#ff2244";
    ctx.fillRect(17, y - 4, 2, 8);
  }
  if (f >= 4) {
    ctx.beginPath();
    ctx.moveTo(0, y - 18);
    ctx.lineTo(-7, y - 32);
    ctx.lineTo(7, y - 32);
    ctx.closePath();
    ctx.stroke();
  }
}

function cuerno(ctx, pose) {
  const f = fnum(pose);
  const a = poseAngles(pose);
  const fur = ["#f8e6ff", "#f2c1ff", "#e59bff", "#d07af0", "#fff"][f];
  ink(ctx, 3.2);
  const hip = -14 - f;
  limb(ctx, -5, hip, 14 + f, a.leg + 1.2, "#b56ad0", 5);
  limb(ctx, 5, hip, 14 + f, a.leg2 + 1.2, "#b56ad0", 5);
  blob(ctx, 0, hip - 14 + a.bob, 15 + f * 0.4, 14, fur);
  const y = hip - 36 - f * 2 + a.bob;
  head(ctx, 0, y, 15, pose, fur);
  ctx.strokeStyle = "#fff6c8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, y - 12);
  ctx.quadraticCurveTo(-16 - f * 3, y - 30, -6, y - 38 - f * 3);
  ctx.moveTo(4, y - 12);
  ctx.quadraticCurveTo(16 + f * 3, y - 30, 6, y - 38 - f * 3);
  if (f >= 2) {
    ctx.moveTo(-10, y - 24);
    ctx.lineTo(-20, y - 30);
    ctx.moveTo(10, y - 24);
    ctx.lineTo(20, y - 30);
  }
  ctx.stroke();
  if (f >= 4) {
    ctx.strokeStyle = "#7ee7ff";
    ctx.beginPath();
    ctx.arc(0, y - 8, 18, 0.4, Math.PI - 0.4);
    ctx.stroke();
  }
  if (pose.state === "attack") {
    ctx.fillStyle = "#ffe9a8";
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(32, y - 4);
    ctx.lineTo(26, y + 2);
    ctx.lineTo(34, y + 6);
    ctx.lineTo(22, y + 4);
    ctx.fill();
  }
}


function mark(ctx, id, pose) {
  const f = fnum(pose);
  const y = -42 - f * 2;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (id === "kilo") {
    ctx.fillStyle = "#5cbf6a";
    ctx.beginPath();
    ctx.ellipse(0, y - 16, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (id === "stitcho") {
    ctx.fillStyle = "#1d3f8f";
    ctx.beginPath();
    ctx.ellipse(-18, y - 4, 7, 16, -0.4, 0, Math.PI * 2);
    ctx.ellipse(18, y - 4, 7, 16, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (id === "chispin") {
    ctx.strokeStyle = "#fff29a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-2, y - 10);
    ctx.lineTo(4, y - 24);
    ctx.lineTo(0, y - 24);
    ctx.lineTo(6, y - 38);
    ctx.stroke();
  } else if (id === "cat" || id === "michi") {
    ctx.fillStyle = "#ffb6e4";
    ctx.beginPath();
    ctx.moveTo(-12, y - 8);
    ctx.lineTo(-18, y - 24);
    ctx.lineTo(-4, y - 12);
    ctx.moveTo(12, y - 8);
    ctx.lineTo(18, y - 24);
    ctx.lineTo(4, y - 12);
    ctx.fill();
    ctx.stroke();
  } else if (id === "dragon") {
    ctx.strokeStyle = "#ff6a2a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, y + 8);
    ctx.quadraticCurveTo(-36, y - 10, -18, y + 22);
    ctx.moveTo(16, y + 8);
    ctx.quadraticCurveTo(36, y - 10, 18, y + 22);
    ctx.stroke();
  } else if (id === "dino") {
    ctx.fillStyle = "#3f8f3a";
    ctx.beginPath();
    ctx.moveTo(10, y + 18);
    ctx.quadraticCurveTo(34, y + 8, 28, y + 28);
    ctx.quadraticCurveTo(16, y + 24, 10, y + 18);
    ctx.fill();
    ctx.stroke();
  } else if (id === "frita") {
    ctx.fillStyle = "#f0b43a";
    ctx.fillRect(-12, y - 18, 24, 6);
    ctx.strokeRect(-12, y - 18, 24, 6);
  } else if (id === "pizza") {
    ctx.fillStyle = "#ffb43a";
    ctx.beginPath();
    ctx.moveTo(0, y - 20);
    ctx.lineTo(12, y - 4);
    ctx.lineTo(-12, y - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === "yomi") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-6, y + 6);
    ctx.lineTo(-3, y + 14);
    ctx.lineTo(0, y + 6);
    ctx.lineTo(3, y + 14);
    ctx.lineTo(6, y + 6);
    ctx.fill();
  } else if (id === "cuerno") {
    ctx.fillStyle = "#ffe9a8";
    ctx.beginPath();
    ctx.moveTo(-4, y - 12);
    ctx.lineTo(0, y - 32);
    ctx.lineTo(4, y - 12);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

const DRAW = { kilo, stitcho, chispin, cat, dragon, dino, frita, pizza, yomi, cuerno, lilo: kilo, stitch: stitcho, pikachu: chispin, michi: cat };

export function drawDefinitive(ctx, id, pose) {
  const draw = DRAW[id] || kilo;
  const next = pose || {};
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  draw(ctx, { ...next, id: next.id || id });
  mark(ctx, next.id || id, next);
  if (next.state === "cast") {
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -28, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
