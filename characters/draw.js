import { computePose, enhancePose, motionProfile, R } from "./rig.js";
import { ART } from "./art/index.js";
import { paintedBody } from "./sprites.js";
import { getLook } from "./look.js";

// ============================================================================
// PROJECT OHANA · dibujo de personajes (characters/draw.js)
// Pies en el suelo. La hitbox no se toca. El PNG solo entra si look === "paint".
// ============================================================================

function drawShadow(ctx, x, y, rx, ry) {
  ctx.save();
  ctx.globalAlpha *= 0.28;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(x || 0, y || 0, Math.max(1, rx || 10), Math.max(1, ry || 3), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill || "#fff6a8";
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
    const b = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(b) * r * 0.4, y + Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

const VISUAL_H = [36, 48, 58, 68, 80];
const ABILITY_ACCENTS = { ukulele:"#ffb347", hula:"#ff5ad5", ohana:"#ffd36a", plasma:"#5ad1ff", rollo:"#2f6bff", caos:"#8f7bff", chain:"#ffe14a", blink:"#fff3a0", storm:"#99ccff", yarn:"#ff8ad4", purr:"#ffb6e4", ninetails:"#b78bff", breath:"#ff6a2a", gust:"#bfefff", meteor:"#ff4a20", bite:"#e8ffe0", charge:"#4cbf56", quake:"#c8a060", salt:"#fff3c0", ketchup:"#e23b3b", fryer:"#ffd36a", pepperoni:"#e0402a", cheese:"#ffd84a", oven:"#ff8a2a", ofuda:"#f2e6c8", sleeve:"#6a3cff", maw:"#ff2244", gleam:"#ffe9a8", gallop:"#f2c1ff", rainbow:"#fff6c8" };

const CHARACTER_ACCENTS = {
  kilo: "#ffd36a", stitcho: "#67ddff", chispin: "#fff29a", cat: "#ffb8e8",
  dragon: "#ff8a45", dino: "#b8ef6b", frita: "#fff1b3", pizza: "#ffd84a",
  yomi: "#ff5b78", cuerno: "#f2c1ff",
};

function accentFor(p) {
  const base = p && p.id || "";
  return CHARACTER_ACCENTS[base] || (p && p.color) || "#ffe66a";
}

function drawSpeedLines(ctx, H, color, t, intensity) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  const n = 2 + Math.round(Math.min(3, intensity * 2));
  for (let i = 0; i < n; i++) {
    const y = -H * (0.18 + i * 0.13);
    const len = H * (0.18 + intensity * 0.30) * (1 + (i % 2) * 0.2);
    const phase = Math.sin(t * 0.22 + i * 2.1) * H * 0.025;
    ctx.globalAlpha = 0.16 + intensity * 0.16;
    ctx.lineWidth = Math.max(1.2, H * 0.018);
    ctx.beginPath();
    ctx.moveTo(-H * 0.08 - len - phase, y);
    ctx.lineTo(-H * 0.08 - phase, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLandingImpact(ctx, H, color, pose) {
  const k = Math.max(0, Math.min(1, pose.land || 0));
  if (k <= 0) return;
  const p = 1 - k;
  ctx.save();
  ctx.globalAlpha = k * 0.48;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.2, H * 0.018);
  ctx.beginPath();
  ctx.ellipse(0, 1, H * (0.24 + p * 0.35), H * (0.045 + p * 0.06), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = k * 0.30;
  for (let i = -2; i <= 2; i++) {
    const x = i * H * 0.10;
    ctx.beginPath();
    ctx.moveTo(x, 1);
    ctx.lineTo(x + i * H * 0.10, -H * (0.06 + p * 0.12));
    ctx.stroke();
  }
  ctx.restore();
}

function drawCastFX(ctx, H, color, pose, slot, abilityId) {
  const abilityColor = (abilityId && ABILITY_ACCENTS[abilityId]) || color;
  color = abilityColor;
  if (pose.state !== "cast" || pose.cast <= 0 || pose.cast >= 1.02) return;
  const u = Math.max(0, Math.min(1, pose.cast));
  const pulse = Math.sin(u * Math.PI);
  const r = H * (0.28 + pulse * 0.28);
  ctx.save();
  ctx.translate(0, -H * 0.50);
  ctx.rotate((pose.t || 0) * 0.035 * (slot === 1 ? -1 : 1));
  ctx.globalAlpha = 0.18 + pulse * 0.42;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.2, H * 0.018);
  const parts = slot === 2 ? 8 : slot === 1 ? 4 : 3;
  for (let i = 0; i < parts; i++) {
    const a0 = (Math.PI * 2 * i) / parts + 0.14;
    const a1 = (Math.PI * 2 * i) / parts + 0.52;
    ctx.beginPath();
    ctx.arc(0, 0, r + (i % 2) * H * 0.035, a0, a1);
    ctx.stroke();
  }
  if (slot === 2) {
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 + (pose.t || 0) * 0.06;
      const rr = r * 0.62;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      ctx.globalAlpha = 0.32 + pulse * 0.36;
      star(ctx, x, y, Math.max(2, H * 0.035), color);
    }
  } else {
    ctx.globalAlpha = 0.16 + pulse * 0.30;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawLocomotionFX(ctx, H, color, pose, t) {
  const turn = Math.max(0, Math.min(1, pose.turnPulse || 0));
  const brake = Math.max(0, Math.min(1, pose.brake || 0));
  if (turn > 0.02) {
    ctx.save();
    ctx.globalAlpha = turn * 0.42;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, H * 0.017);
    const dir = pose.bodyTilt >= 0 ? 1 : -1;
    for (let i = 0; i < 3; i++) {
      const a0 = dir > 0 ? -0.95 - i * 0.11 : Math.PI + 0.95 + i * 0.11;
      const a1 = dir > 0 ? -0.35 - i * 0.11 : Math.PI + 0.35 + i * 0.11;
      ctx.beginPath();
      ctx.arc(-H * 0.10, -H * (0.25 + i * 0.10), H * (0.24 + i * 0.035), a0, a1);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (brake > 0.02) {
    ctx.save();
    ctx.globalAlpha = brake * 0.36;
    ctx.strokeStyle = "#fff4c4";
    ctx.lineWidth = Math.max(1.2, H * 0.014);
    for (let i = 0; i < 3; i++) {
      const y = -H * (0.04 + i * 0.07);
      const len = H * (0.12 + brake * 0.24) * (1 - i * 0.14);
      ctx.beginPath();
      ctx.moveTo(-H * 0.12 - len, y);
      ctx.lineTo(-H * 0.12, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawAttackFX(ctx, H, color, pose) {
  if (pose.state !== "attack") return;
  const a = Math.max(0, Math.min(1, pose.atk || 0));
  const charge = Math.max(0, Math.min(1, pose.anticipation || 0));
  const impact = Math.max(0, Math.min(1.2, pose.impact || 0));
  ctx.save();
  if (charge > 0) {
    ctx.globalAlpha = charge * 0.25;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, H * 0.016);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, -H * 0.48, H * (0.18 + i * 0.05), -Math.PI * 0.95, -Math.PI * 0.3);
      ctx.stroke();
    }
  }
  if (impact > 0) {
    const len = H * (0.26 + impact * 0.52);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.globalAlpha = Math.min(0.85, 0.22 + impact * 0.48);
    ctx.lineWidth = Math.max(1.4, H * 0.022);
    for (let i = 0; i < 5; i++) {
      const y = -H * 0.72 + i * H * 0.14;
      const start = H * 0.04 + (i % 2) * H * 0.04;
      ctx.beginPath();
      ctx.moveTo(start, y);
      ctx.lineTo(start + len * (0.62 + (i % 3) * 0.16), y + (i - 2) * H * 0.035);
      ctx.stroke();
    }
    ctx.globalAlpha = Math.min(0.75, impact * 0.65);
    ctx.strokeStyle = "#fffdf2";
    ctx.lineWidth = Math.max(1, H * 0.012);
    ctx.beginPath(); ctx.arc(H * 0.14, -H * 0.50, H * (0.12 + impact * 0.18), -0.85, 0.85); ctx.stroke();
  }
  ctx.restore();
}

function drawCharacterMotionFX(ctx, p, H, pose, t) {
  const color = accentFor(p);
  const prof = motionProfile(p);
  const intensity = Math.min(1.35, (pose.speed || 0) * (0.55 + prof.pace * 0.45));
  if (pose.state === "run" && intensity > 0.28) drawSpeedLines(ctx, H, color, t, intensity);
  drawLocomotionFX(ctx, H, color, pose, t);
  drawLandingImpact(ctx, H, color, pose);
  drawAttackFX(ctx, H, color, pose);
  drawCastFX(ctx, H, color, pose, pose.castSlot | 0, p._cast && p._cast.id);
  if (pose.state === "jump" && pose.stretch > 0.12) {
    ctx.save();
    ctx.globalAlpha = 0.22 + pose.stretch * 0.18;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, H * 0.014);
    ctx.beginPath();
    ctx.arc(0, 1, H * 0.26, Math.PI * 0.10, Math.PI * 0.90);
    ctx.stroke();
    ctx.restore();
  }
  if (p.dash > 0) {
    const d = Math.min(1, p.dash / 12);
    ctx.save();
    ctx.globalAlpha = 0.22 + d * 0.28;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.4, H * 0.02);
    for (let i = 0; i < 4; i++) {
      const y = -H * (0.2 + i * 0.15);
      ctx.beginPath(); ctx.moveTo(-H * (0.12 + i * 0.025), y); ctx.lineTo(-H * (0.40 + d * 0.3), y); ctx.stroke();
    }
    ctx.restore();
  }
}

const CHAR_K = {
  kilo: 1, lilo: 1, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92,
  cat: 0.92, dragon: 1, frita: 1.04, dino: 1, pizza: 0.98, yomi: 0.96, cuerno: 1,
};

const FLAVOR = {
  kilo:    { kind: "petal", colors: ["#ff9ab0", "#ffd36a", "#ffffff"] },
  lilo:    { kind: "petal", colors: ["#ff9ab0", "#ffd36a", "#ffffff"] },
  stitcho: { kind: "spark", colors: ["#7ef0ff", "#3fa8ff", "#ffffff"] },
  stitch:  { kind: "spark", colors: ["#7ef0ff", "#3fa8ff", "#ffffff"] },
  chispin: { kind: "bolt",  colors: ["#fff36a", "#ffd000", "#ffffff"] },
  pikachu: { kind: "bolt",  colors: ["#fff36a", "#ffd000", "#ffffff"] },
  cat:     { kind: "star",  colors: ["#ffd0ee", "#fff6a8", "#c9a8ff"] },
  dragon:  { kind: "ember", colors: ["#ff7a2a", "#ffd84a", "#ff3b2a"] },
  frita:   { kind: "salt",  colors: ["#ffffff", "#fff3c4", "#ff4a3a"] },
  dino:    { kind: "leaf",  colors: ["#7bd86a", "#c8f07a", "#fff3a0"] },
  pizza:   { kind: "salt",  colors: ["#ffd24a", "#e8452f", "#6fbf4a"] },
  yomi:    { kind: "ember", colors: ["#6a3cff", "#ff4466", "#1a0828"] },
  cuerno:  { kind: "star",  colors: ["#ffe9a8", "#f2c1ff", "#ffffff"] },
};

function withAlpha(color, a) {
  let h = String(color || "#ffffff").trim();
  if (/^#[0-9a-f]{3}$/i.test(h)) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (!/^#[0-9a-f]{6}$/i.test(h)) return color;
  const n = parseInt(h.slice(1), 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

function drawAura(ctx, H, color, t, evo) {
  const cy = -H * 0.5;
  const r = H * (0.5 + evo * 0.09) * (1 + Math.sin(t / 9) * 0.05);
  ctx.save();
  ctx.globalAlpha *= evo >= 4 ? 0.5 : 0.3;
  const g = ctx.createRadialGradient(0, cy, r * 0.1, 0, cy, r);
  g.addColorStop(0, withAlpha(color, 1));
  g.addColorStop(0.55, withAlpha(color, 0.33));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGodRays(ctx, H, color, t) {
  const cy = -H * 0.55;
  ctx.save();
  ctx.translate(0, cy);
  ctx.rotate(t / 90);
  ctx.globalAlpha *= 0.16 + Math.sin(t / 14) * 0.05;
  ctx.fillStyle = color;
  for (let i = 0; i < 10; i++) {
    ctx.rotate((Math.PI * 2) / 10);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-H * 0.07, -H * 0.95);
    ctx.lineTo(H * 0.07, -H * 0.95);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGroundRing(ctx, H, color, t) {
  const k = (t % 60) / 60;
  ctx.save();
  ctx.globalAlpha *= (1 - k) * 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, H * (0.25 + k * 0.45), H * (0.06 + k * 0.1), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlavor(ctx, id, H, t, evo, front) {
  const fl = FLAVOR[id];
  if (!fl || evo < 2) return;
  if (front && H > 140) return;
  const n = evo * 2 + (evo >= 4 ? 4 : 0);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const seed = i * 2.399;
    const a = t / (38 - evo * 4) + seed;
    const z = Math.sin(a);
    if ((z > 0) !== front) continue;
    const rx = H * (0.42 + (i % 3) * 0.08);
    let x = Math.cos(a) * rx;
    let y = -H * 0.5 + Math.sin(a * 0.7 + seed) * H * 0.32;
    const col = fl.colors[i % fl.colors.length];
    const s = (1.4 + (i % 3) * 0.6) * (0.75 + 0.25 * (z + 1)) * (H / 48);
    ctx.globalAlpha = 0.55 + 0.4 * Math.abs(z);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    if (fl.kind === "ember") {
      const life = ((t * 0.6 + i * 23) % (H * 1.1)) / (H * 1.1);
      y = -H * 0.2 - life * H * 0.95;
      x = Math.sin(t / 11 + i) * H * 0.35;
      ctx.globalAlpha = 0.85 * Math.sin(life * Math.PI);
      ctx.beginPath(); ctx.arc(x, y, s * 0.9, 0, Math.PI * 2); ctx.fill();
    } else if (fl.kind === "petal") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2);
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.4, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (fl.kind === "bolt") {
      ctx.lineWidth = Math.max(1, s * 0.6);
      ctx.beginPath();
      ctx.moveTo(x - s, y - s * 2); ctx.lineTo(x + s * 0.4, y - s * 0.3);
      ctx.lineTo(x - s * 0.4, y + s * 0.3); ctx.lineTo(x + s, y + s * 2);
      ctx.stroke();
    } else if (fl.kind === "star") {
      star(ctx, x, y, s * 1.5, col);
    } else if (fl.kind === "leaf") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 1.5);
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.5, s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (fl.kind === "salt") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha *= 0.6; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawDust(ctx, H, t, speed) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.07 * (1 + speed * 0.1) + i / 3) % 1);
    ctx.globalAlpha = (1 - k) * 0.35;
    ctx.fillStyle = "#e8e2d0";
    ctx.beginPath();
    ctx.arc(-H * 0.22 - k * H * 0.35, -1 - k * 5, 1.5 + k * H * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBurst(ctx, H, color, k) {
  const prog = 1 - k;
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.strokeStyle = color || "#ffe66a";
  ctx.lineWidth = Math.max(0.5, 5 * k);
  ctx.beginPath();
  ctx.arc(0, -H * 0.5, Math.max(1, H * 0.3 + prog * H * 2.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.5, 2.5 * k);
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, -H * 0.5, Math.max(1, H * 0.15 + prog * H * 1.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

let flashCanvas = null;
let colorCanvas = null;
let inkCanvas = null;
let presentCanvas = null;
let presentLastKey = "";

function sheet(which, W) {
  let c = which === "color" ? colorCanvas : which === "ink" ? inkCanvas : flashCanvas;
  if (!c) c = document.createElement("canvas");
  if (c.width !== W) { c.width = W; c.height = W; }
  if (which === "color") colorCanvas = c;
  else if (which === "ink") inkCanvas = c;
  else flashCanvas = c;
  return c;
}

function poseFingerprint(pose) {
  const q = (v, s) => Math.round((Number(v) || 0) * s);
  return [
    pose.state || "", pose.move || "", pose.form | 0,
    q(pose.phase, 6), q(pose.speed, 8), q(pose.vy, 8), pose.air ? 1 : 0,
    q(pose.land, 8), q(pose.atk, 10), q(pose.cast, 10), pose.castSlot | 0,
    q(pose.hurt, 8), q(pose.blink, 4), q(pose.sway, 8), q(pose.bounce, 8),
    q(pose.breath, 6), q(pose.flourish, 8), pose.flourishN | 0, q(pose.evoT, 12),
    pose.nineLives > 0 ? 1 : 0, q(pose.look && pose.look.y, 6),
    q(pose.squash, 8), q(pose.stretch, 8), q(pose.bodyTilt, 8),
  ].join("|");
}

function presentCharacter(ctx, art, pose, flashCol, flashA, charId) {
  const U = 280;
  const ps = 1.5;
  const W = Math.round(U * ps);
  const faBucket = Math.round((flashA || 0) * 20);
  const key = (charId || art.id || "?") + "#" + (pose.form | 0) + "#" + poseFingerprint(pose) + "#" + (flashCol || "") + "#" + faBucket;
  if (key === presentLastKey && presentCanvas && presentCanvas.width === W) {
    ctx.drawImage(presentCanvas, -U / 2, -U * 0.78, U, U);
    return;
  }
  const color = sheet("color", W);
  const cg = color.getContext("2d");
  cg.setTransform(1, 0, 0, 1, 0, 0);
  cg.clearRect(0, 0, W, W);
  cg.setTransform(ps, 0, 0, ps, W / 2, W * 0.78);
  art.draw(cg, pose, R);
  if (flashCol && flashA > 0) {
    const flash = sheet("flash", W);
    const fg = flash.getContext("2d");
    fg.setTransform(1, 0, 0, 1, 0, 0);
    fg.clearRect(0, 0, W, W);
    fg.drawImage(color, 0, 0);
    fg.globalCompositeOperation = "source-in";
    fg.fillStyle = flashCol;
    fg.fillRect(0, 0, W, W);
    fg.globalCompositeOperation = "source-over";
    cg.setTransform(1, 0, 0, 1, 0, 0);
    cg.globalAlpha = flashA;
    cg.drawImage(flash, 0, 0);
    cg.globalAlpha = 1;
  }
  const ink = sheet("ink", W);
  const ig = ink.getContext("2d");
  ig.setTransform(1, 0, 0, 1, 0, 0);
  ig.clearRect(0, 0, W, W);
  ig.drawImage(color, 0, 0);
  ig.globalCompositeOperation = "source-in";
  ig.fillStyle = "#1a1022";
  ig.fillRect(0, 0, W, W);
  ig.globalCompositeOperation = "source-over";
  if (!presentCanvas) presentCanvas = document.createElement("canvas");
  if (presentCanvas.width !== W) { presentCanvas.width = W; presentCanvas.height = W; }
  const pg = presentCanvas.getContext("2d");
  pg.setTransform(1, 0, 0, 1, 0, 0);
  pg.clearRect(0, 0, W, W);
  const o = 3.4 * ps;
  const dirs = [[o, 0], [-o, 0], [0, o], [0, -o]];
  for (let i = 0; i < dirs.length; i++) pg.drawImage(ink, dirs[i][0], dirs[i][1]);
  pg.drawImage(color, 0, 0);
  presentLastKey = key;
  ctx.drawImage(presentCanvas, -U / 2, -U * 0.78, U, U);
}

function kiloPose(p, t, moving, air, atk) {
  const cast = p._cast;
  if (cast && t >= cast.t && t - cast.t < (cast.slot === 2 ? 34 : cast.slot === 1 ? 26 : 16)) {
    return ["j", "k", "l"][cast.slot] || "j";
  }
  if ((p.invuln || 0) > 14) return "hurt";
  if (atk > 0.12 || (p.melee || 0) > 0) return "hit";
  if (air && (p.vy || 0) < -0.6) return "rise";
  if (air) return "fall";
  if (moving) return ["run1", "run2", "run3"][Math.floor(t / 6) % 3];
  return (Math.floor(t / 46) % 11 === 0) ? "blink" : "idle";
}

function pickPainted(p, t, moving, air, atk) {
  if (getLook() !== "paint") return null;
  const id = p.id;
  if (id === "kilo") {
    const pose = kiloPose(p, t, moving, air, atk);
    return paintedBody("kilo", pose) || paintedBody("kilo", "idle");
  }
  let pose = "idle";
  if (atk > 0.15) pose = "atk";
  else if (air) pose = "jump";
  else if (moving) pose = (Math.floor(t / 7) % 2) ? "run" : "idle";
  return paintedBody(id, pose) || paintedBody(id, "idle");
}

let tintCanvas = null;
function drawPainted(ctx, img, x, y, w, h, flashCol, flashA) {
  ctx.drawImage(img, x, y, w, h);
  if (!flashCol || flashA <= 0) return;
  const sw = img.naturalWidth, sh = img.naturalHeight;
  if (!tintCanvas) tintCanvas = document.createElement("canvas");
  if (tintCanvas.width !== sw || tintCanvas.height !== sh) {
    tintCanvas.width = sw;
    tintCanvas.height = sh;
  }
  const g = tintCanvas.getContext("2d");
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, sw, sh);
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = flashCol;
  g.fillRect(0, 0, sw, sh);
  g.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.globalAlpha *= flashA;
  ctx.drawImage(tintCanvas, x, y, w, h);
  ctx.restore();
}

export function drawCharacter(ctx, p, cam, t) {
  const evo = Math.max(0, Math.min(4, Math.round(Number(p.evo) || 0)));
  const facing = p.facing || 1;
  const footX = p.x + p.w / 2 - cam.x;
  const footY = p.y + p.h - cam.y;
  const speed = Math.abs(p.vx || 0);
  const moving = !!p.grounded && speed > 0.55;
  const air = !p.grounded;
  const pose = enhancePose(computePose(p, t, { rng: p.rng }), p);
  const atk = pose.atk;
  const hurt = (p.invuln || 0) > 0 || (p.hurtFlash || 0) > 0;
  const hurtFresh = (p.invuln || 0) > 18;

  let H = VISUAL_H[evo] * (CHAR_K[p.id] || 1) * (p.visualScale || 1);
  if (getLook() === "paint") H = Math.min(220, Math.max(H, (p.h || 28) * 3));
  const burstK = p.evoBurst > 0 ? Math.max(0, Math.min(1, p.evoBurst / Math.max(1, p.evoBurstMax || 90))) : 0;
  if (burstK > 0) H *= 1 + Math.sin((1 - burstK) * Math.PI * 3) * 0.08 * burstK;

  // Squash del rig. Un solo aplaste: no se suma al contador viejo.
  const squash = Math.max(0, Math.min(0.22, pose.squash || 0));
  const stretch = Math.max(-0.12, Math.min(0.16, pose.stretch || 0));
  let sx = 1 + squash * 0.9 - stretch * 0.35;
  let sy = 1 - squash * 0.75 + stretch * 0.4;
  if (p.grounded && p._wasAir) p._land = 8;
  p._wasAir = air;
  if (p._land > 0) p._land--;

  const tilt = (moving ? 0.05 : air ? ((p.vy || 0) < -1.2 ? -0.04 : 0.05) : 0) + (pose.bodyTilt || 0) * 0.35;
  const lunge = atk * H * 0.08 + (pose.impact || 0) * H * 0.03;
  const recoilX = hurtFresh ? -H * 0.08 : 0;
  const color = p.color || "#ffffff";
  const art = ART[p.id] || ART.kilo;
  const airK = air ? 0.62 + Math.min(0.2, Math.abs(p.vy || 0) / 40) : 1;

  ctx.save();
  ctx.translate(footX, footY);
  drawShadow(ctx, 0, 2 + (air ? 3 : 0), H * 0.3 * airK * sx, H * 0.06 * airK);
  ctx.scale(facing, 1);
  ctx.translate(recoilX + lunge, 0);

  if (evo >= 4) drawGodRays(ctx, H, color, t);
  if (evo >= 2) drawAura(ctx, H, color, t, evo);
  if (evo >= 3 && !air) drawGroundRing(ctx, H, color, t);
  drawFlavor(ctx, p.id, H, t, evo, false);
  if (moving) drawDust(ctx, H, t, speed);

  const s = H / 100;
  let flashCol = null, flashA = 0;
  if (burstK > 0.35) { flashCol = "#ffffff"; flashA = ((burstK - 0.35) / 0.65) * 0.9; }
  else if (hurtFresh || (hurt && (p.invuln || 0) % 8 < 4)) { flashCol = "#ff3b4e"; flashA = hurtFresh ? 0.55 : 0.3; }
  const painted = pickPainted(p, t, moving, air, atk);
  ctx.save();
  ctx.rotate(tilt * 0.5);
  if (painted) {
    const ih = H * 1.05;
    const iw = ih * (painted.naturalWidth / painted.naturalHeight);
    ctx.scale(sx, sy);
    drawPainted(ctx, painted, -iw / 2, -ih, iw, ih, flashCol, flashA);
  } else {
    ctx.scale(sx * s, sy * s);
    try { presentCharacter(ctx, art, pose, flashCol, flashA, p.id); }
    catch (err) {
      try { art.draw(ctx, pose, R); }
      catch (e2) { if (!drawCharacter._warned) { drawCharacter._warned = true; console.warn("[ohana] dibujo", p.id, err); } }
    }
  }
  ctx.restore();

  drawFlavor(ctx, p.id, H, t, evo, true);
  drawCharacterMotionFX(ctx, p, H, pose, t);
  if (burstK > 0) {
    drawBurst(ctx, H, color, burstK);
    p.evoBurst--;
  }
  ctx.restore();
}