import { computePose, enhancePose, motionProfile, R } from "./rig.js";
import { ART } from "./art/index.js";
import { CUERNO_VISUAL_H } from "./art/cuerno.js";
import { paintedBody, paintedForm } from "./sprites.js";
import { drawCostume } from "./costume.js";
import { drawDefinitive } from "./definitive.js";
import { getLook } from "./look.js";
import { applyEvolutionPose, drawEvolutionSignatureFX, drawEvolutionCombatFX } from "./evolution.js";

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
const evoCombat = pose.evolutionCombat || {};
const attackScale = Number(evoCombat.attack) || 1;
const impactScale = Number(evoCombat.impact) || 1;
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
const len = H * (0.26 + impact * 0.52) * (0.92 + attackScale * 0.08);
ctx.strokeStyle = color;
ctx.lineCap = "round";
ctx.globalAlpha = Math.min(0.92, (0.20 + impact * 0.50) * impactScale);
ctx.lineWidth = Math.max(1.4, H * (0.020 + 0.002 * Math.min(1.5, attackScale)));
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

export const BASIC_ATTACK_SIGNATURES = Object.freeze({
kilo: "note", stitcho: "claws", chispin: "bolt", cat: "paw", dragon: "flame",
dino: "bite", frita: "salt", pizza: "wedge", yomi: "fang", cuerno: "poke",
});

export const ABILITY_VISUAL_SIGNATURES = Object.freeze({
ukulele: "note-bounce", hula: "hula-ring", ohana: "ohana-halo",
plasma: "plasma-burst", rollo: "roll-trail", caos: "chaos-orbit",
chain: "chain-light", blink: "blink-gate", storm: "storm-cloud",
yarn: "yarn-loop", purr: "purr-wave", ninetails: "tail-fan",
breath: "breath-cone", gust: "gust-wing", meteor: "meteor-rain",
bite: "bite-jaw", charge: "charge-ram", quake: "quake-ring",
salt: "salt-shot", ketchup: "ketchup-pool", fryer: "fryer-geyser",
pepperoni: "pepperoni-disc", cheese: "cheese-tether", oven: "oven-heat",
ofuda: "ofuda-paper", sleeve: "sleeve-pull", maw: "maw-open",
gleam: "gleam-star", gallop: "gallop-horn", rainbow: "rainbow-arc",
});

function drawAbilitySignatureFX(ctx, p, H, pose, t) {
if (pose.state !== "cast" || pose.cast <= 0 || pose.cast >= 1.02) return;
const id = p?._cast?.id;
const kind = ABILITY_VISUAL_SIGNATURES[id];
if (!kind) return;
const u = Math.max(0, Math.min(1, pose.cast));
const k = Math.sin(u * Math.PI);
if (k < 0.05) return;
const color = ABILITY_ACCENTS[id] || accentFor(p);
const f = p.facing || 1;
const evoCombat = pose.evolutionCombat || {};
const castScale = Number(evoCombat.cast) || 1;
const pulse = 1 + k * 0.18 * castScale;
const r = H * (0.14 + k * 0.24) * (0.92 + (castScale - 0.84) * 0.28);

ctx.save();
ctx.globalCompositeOperation = "lighter";
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.globalAlpha = Math.min(0.92, (0.16 + k * 0.52) * (Number(evoCombat.glow) || 1));

switch (kind) {
case "note-bounce":
  for (let i = 0; i < 3; i++) {
    const a = t * 0.09 + i * 2.1;
    const x = f * H * 0.22 + Math.cos(a) * H * 0.15;
    const y = -H * 0.45 + Math.sin(a) * H * 0.22;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 2, H * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(H * 0.025, -H * 0.13, H * 0.018, H * 0.15);
    ctx.restore();
  }
  break;
case "hula-ring":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, H * 0.022);
  ctx.beginPath(); ctx.ellipse(0, -H * 0.48, r * 1.35, r * 0.72, t * 0.08, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -H * 0.48, r * 0.82, r * 0.44, -t * 0.11, 0, Math.PI * 2); ctx.stroke();
  break;
case "ohana-halo":
  ctx.strokeStyle = "#fff7d1"; ctx.lineWidth = Math.max(1.6, H * 0.025);
  ctx.beginPath(); ctx.arc(0, -H * 0.52, r * 1.45, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = t * 0.05 + i * 1.256;
    star(ctx, Math.cos(a) * r * 1.45, -H * 0.52 + Math.sin(a) * r * 1.45, H * 0.035, color);
  }
  break;

case "plasma-burst":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.2, H * 0.018);
  for (let i = 0; i < 3; i++) {
    const x = f * H * (0.12 + i * 0.08);
    ctx.beginPath(); ctx.arc(x, -H * 0.48, r * (0.45 + i * 0.2), -1.3, 1.3); ctx.stroke();
  }
  break;
case "roll-trail":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, H * 0.024);
  for (let i = 0; i < 2; i++) {
    ctx.beginPath(); ctx.arc(-f * H * (0.10 + i * 0.10), -H * 0.45, r * (0.85 + i * 0.18), 0.2, 2.5); ctx.stroke();
  }
  break;
case "chaos-orbit":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.021);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(0, -H * 0.45, r * (0.9 + i * 0.28), r * (0.35 + i * 0.12), t * 0.12 * (i % 2 ? -1 : 1), 0, Math.PI * 2); ctx.stroke();
  }
  break;

case "chain-light":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.2, H * 0.018);
  ctx.beginPath(); ctx.moveTo(f * H * 0.06, -H * 0.45);
  for (let i = 1; i <= 4; i++) {
    ctx.lineTo(f * H * (0.06 + i * 0.16), -H * (0.45 + (i % 2 ? 0.10 : -0.04)) + Math.sin(t * 0.22 + i) * H * 0.04);
  }
  ctx.stroke();
  break;
case "blink-gate":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.02);
  ctx.beginPath(); ctx.arc(-f * H * 0.10, -H * 0.5, r * pulse, -1.3, 1.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(-f * H * 0.24, -H * 0.5, r * 0.62, -1.1, 1.1); ctx.stroke();
  break;
case "storm-cloud":
  ctx.fillStyle = "#6e7fa8";
  for (let i = 0; i < 5; i++) {
    const x = -H * 0.22 + i * H * 0.11, y = -H * (0.68 - (i % 2) * 0.06);
    ctx.beginPath(); ctx.arc(x, y, H * (0.06 + (i % 2) * 0.02), 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, H * 0.014);
  ctx.beginPath(); ctx.moveTo(f * H * 0.04, -H * 0.55); ctx.lineTo(f * H * 0.12, -H * 0.35); ctx.lineTo(f * H * 0.05, -H * 0.43); ctx.lineTo(f * H * 0.16, -H * 0.16); ctx.stroke();
  break;

case "yarn-loop":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.3, H * 0.018);
  ctx.beginPath(); ctx.moveTo(f * H * 0.05, -H * 0.42);
  ctx.bezierCurveTo(f * H * 0.42, -H * 0.75, -f * H * 0.08, -H * 0.02, f * H * 0.34, -H * 0.25);
  ctx.stroke();
  break;
case "purr-wave":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.02);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(f * H * 0.04, -H * 0.45, r * (0.65 + i * 0.32), -0.85, 0.85); ctx.stroke();
  }
  break;
case "tail-fan":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.1, H * 0.016);
  for (let i = 0; i < 9; i++) {
    const a = -1.3 + i * 0.325 + Math.sin(t * 0.08 + i) * 0.03;
    ctx.beginPath(); ctx.arc(f * H * 0.10, -H * 0.48, r * (0.65 + i * 0.04), a, a + 0.18); ctx.stroke();
  }
  break;

case "breath-cone":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, H * 0.022);
  ctx.beginPath(); ctx.moveTo(f * H * 0.08, -H * 0.54); ctx.lineTo(f * H * 0.55, -H * 0.28); ctx.moveTo(f * H * 0.08, -H * 0.54); ctx.lineTo(f * H * 0.55, -H * 0.78); ctx.stroke();
  break;
case "gust-wing":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.2, H * 0.018);
  ctx.beginPath(); ctx.arc(f * H * 0.08, -H * 0.54, r * 1.5, -1.0, 0.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(f * H * 0.08, -H * 0.54, r * 1.1, 0.3, 1.4); ctx.stroke();
  break;
case "meteor-rain":
  ctx.strokeStyle = "#ff8a45"; ctx.lineWidth = Math.max(1.3, H * 0.02);
  for (let i = 0; i < 4; i++) {
    const x = -H * 0.34 + i * H * 0.20;
    const y = -H * (0.85 - ((t * 0.07 + i * 0.23) % 0.35));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + f * H * 0.10, y + H * 0.20); ctx.stroke();
  }
  break;

case "bite-jaw":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.3, H * 0.02);
  ctx.beginPath(); ctx.arc(f * H * 0.20, -H * 0.45, r * 1.05, -0.7, 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(f * H * 0.40, -H * 0.48); ctx.lineTo(f * H * 0.52, -H * 0.56); ctx.moveTo(f * H * 0.40, -H * 0.42); ctx.lineTo(f * H * 0.52, -H * 0.34); ctx.stroke();
  break;
case "charge-ram":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.6, H * 0.023);
  ctx.beginPath(); ctx.moveTo(-f * H * 0.22, -H * 0.54); ctx.lineTo(f * H * 0.40, -H * 0.54); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-f * H * (0.18 + i * 0.08), -H * (0.30 + i * 0.10)); ctx.lineTo(-f * H * (0.36 + i * 0.08), -H * (0.24 + i * 0.10)); ctx.stroke();
  }
  break;
case "quake-ring":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.022);
  ctx.beginPath(); ctx.ellipse(0, 1, r * 1.9, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r, 1); ctx.lineTo(-r * 0.7, -H * 0.14); ctx.moveTo(r * 0.2, 1); ctx.lineTo(r * 0.45, -H * 0.12); ctx.stroke();
  break;

case "salt-shot":
  ctx.fillStyle = color;
  for (let i = 0; i < 9; i++) {
    const a = -0.9 + i * 0.225;
    const rr = H * (0.22 + ((i * 17) % 5) * 0.03);
    ctx.beginPath(); ctx.arc(f * Math.cos(a) * rr, -H * 0.48 + Math.sin(a) * rr, H * 0.022, 0, Math.PI * 2); ctx.fill();
  }
  break;
case "ketchup-pool":
  ctx.fillStyle = "rgba(226,59,59,.35)"; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, H * 0.014);
  ctx.beginPath(); ctx.ellipse(f * H * 0.22, 1, r * 1.4, r * 0.25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  break;
case "fryer-geyser":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.021);
  for (let i = 0; i < 3; i++) {
    const x = f * H * (0.12 + i * 0.20);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + f * H * 0.04, -H * 0.32, x, -H * 0.62); ctx.stroke();
  }
  break;

case "pepperoni-disc":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.021);
  ctx.beginPath(); ctx.arc(f * H * 0.24, -H * 0.45, r * 0.78, t * 0.12, t * 0.12 + 5.1); ctx.stroke();
  break;
case "cheese-tether":
  ctx.strokeStyle = "#ffe66a"; ctx.lineWidth = Math.max(1.1, H * 0.018);
  ctx.beginPath(); ctx.moveTo(f * H * 0.08, -H * 0.48);
  ctx.bezierCurveTo(f * H * 0.22, -H * 0.70, f * H * 0.38, -H * 0.30, f * H * 0.52, -H * 0.52); ctx.stroke();
  break;
case "oven-heat":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.3, H * 0.02);
  for (let i = 0; i < 3; i++) {
    const x = -H * 0.10 + i * H * 0.12;
    ctx.beginPath(); ctx.moveTo(x, -H * 0.08); ctx.quadraticCurveTo(x + H * 0.08, -H * 0.26, x, -H * 0.46); ctx.stroke();
  }
  break;

case "ofuda-paper":
  ctx.fillStyle = "#f2e6c8"; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, H * 0.014);
  ctx.save(); ctx.translate(f * H * 0.26, -H * 0.54); ctx.rotate(Math.sin(t * 0.14) * 0.16);
  ctx.fillRect(-H * 0.07, -H * 0.14, H * 0.14, H * 0.28); ctx.strokeRect(-H * 0.07, -H * 0.14, H * 0.14, H * 0.28);
  ctx.restore();
  break;
case "sleeve-pull":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.3, H * 0.02);
  ctx.beginPath(); ctx.arc(f * H * 0.24, -H * 0.48, r * 1.15, 1.2, 4.1); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(f * H * 0.12, -H * (0.36 + i * 0.08)); ctx.lineTo(f * H * (0.34 + i * 0.06), -H * (0.40 + i * 0.08)); ctx.stroke(); }
  break;
case "maw-open":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.8, H * 0.028);
  ctx.beginPath(); ctx.arc(f * H * 0.18, -H * 0.48, r * 0.9, -0.8, 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(f * H * 0.42, -H * 0.48); ctx.lineTo(f * H * 0.58, -H * 0.57); ctx.moveTo(f * H * 0.42, -H * 0.48); ctx.lineTo(f * H * 0.58, -H * 0.39); ctx.stroke();
  break;

case "gleam-star":
  for (let i = 0; i < 3; i++) star(ctx, f * H * (0.16 + i * 0.16), -H * (0.48 + (i % 2) * 0.10), H * (0.035 + k * 0.02), color);
  break;
case "gallop-horn":
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, H * 0.021);
  ctx.beginPath(); ctx.arc(f * H * 0.20, -H * 0.50, r * 1.18, -1.1, 0.9); ctx.stroke();
  break;
case "rainbow-arc":
  const cols = ["#ff5a5f","#ffb347","#ffe66a","#7bd86a","#5ad1ff","#7a7cff","#c58cff"];
  for (let i = 0; i < cols.length; i++) {
    ctx.globalAlpha = 0.13 + k * 0.08;
    ctx.strokeStyle = cols[i];
    ctx.lineWidth = Math.max(1, H * 0.014);
    ctx.beginPath(); ctx.arc(f * H * 0.05, -H * 0.50, r * (0.85 + i * 0.07), -0.95, 0.95); ctx.stroke();
  }
  break;
}
ctx.restore();
}

function drawBasicAttackSignatureFX(ctx, p, H, pose, t) {
if (pose.state !== "attack") return;
const kind = BASIC_ATTACK_SIGNATURES[String(p?.id || "").toLowerCase()];
if (!kind) return;
const k = Math.max(0, Math.min(1, pose.impact || 0));
if (k < 0.06) return;
const color = (p?.color || accentFor(p));
const f = p?.facing || 1;
const evoCombat = pose.evolutionCombat || {};
const attackScale = Number(evoCombat.attack) || 1;
const density = Number(evoCombat.density) || 1;
const reach = H * (0.42 + k * 0.42) * (0.92 + (attackScale - 0.82) * 0.16);

ctx.save();
ctx.globalCompositeOperation = "lighter";
ctx.globalAlpha = Math.min(0.92, (0.18 + k * 0.54) * (Number(evoCombat.glow) || 1));
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = color;
ctx.lineWidth = Math.max(1.4, H * 0.022);

switch (kind) {
case "note":
  for (let i = 0; i < 3; i++) { const a = -0.7 + i * 0.35; ctx.beginPath(); ctx.arc(f * reach * 0.45, -H * 0.45 + Math.sin(a) * H * 0.08, H * 0.04, 0, Math.PI * 2); ctx.stroke(); }
  break;
case "claws":
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(f * H * 0.16, -H * (0.50 - i * 0.08), reach * (0.55 + i * 0.08), -0.95, 0.25); ctx.stroke(); }
  break;
case "bolt":
  ctx.beginPath(); ctx.moveTo(f * H * 0.08, -H * 0.56); ctx.lineTo(f * H * 0.30, -H * 0.74); ctx.lineTo(f * H * 0.22, -H * 0.50); ctx.lineTo(f * H * 0.48, -H * 0.62); ctx.stroke();
  break;
case "paw":
  ctx.beginPath(); ctx.arc(f * reach * 0.58, -H * 0.48, H * 0.12, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(f * (reach * 0.58 + H * (0.10 + i * 0.04)), -H * 0.57 + i * H * 0.04, H * 0.035, 0, Math.PI * 2); ctx.stroke(); }
  break;
case "flame":
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(f * reach * (0.45 + i * 0.08), -H * (0.38 + i * 0.08), H * (0.10 + k * 0.04), -1.5, 1.1); ctx.stroke(); }
  break;
case "bite":
case "fang":
  ctx.beginPath(); ctx.arc(f * reach * 0.52, -H * 0.46, H * 0.15, -0.8, 0.8); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const x = f * (reach * 0.52 + H * (0.08 + i * 0.05));
    ctx.beginPath(); ctx.moveTo(x, -H * 0.50); ctx.lineTo(x, -H * (0.42 - i * 0.03)); ctx.stroke();
  }
  break;
case "salt":
  ctx.fillStyle = "#fff3c0";
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(f * reach * (0.24 + i * 0.10), -H * (0.56 - i * 0.03), H * 0.022, 0, Math.PI * 2); ctx.fill(); }
  break;
case "wedge":
  ctx.beginPath(); ctx.moveTo(f * H * 0.08, -H * 0.56); ctx.lineTo(f * reach * 0.75, -H * 0.38); ctx.lineTo(f * reach * 0.75, -H * 0.62); ctx.closePath(); ctx.stroke();
  break;
case "poke":
  ctx.beginPath(); ctx.moveTo(f * H * 0.10, -H * 0.50); ctx.lineTo(f * reach * 0.84, -H * 0.50); ctx.stroke();
  star(ctx, f * reach * 0.86, -H * 0.50, H * 0.06, "#fff6c8");
  break;
}
if (k > 0.18 && (Number(pose.form) || 0) >= 2) {
ctx.save();
const evo = Number(pose.form) || 0;
ctx.globalAlpha = Math.min(0.62, k * 0.24 * (Number(evoCombat.glow) || 1));
ctx.strokeStyle = color;
ctx.lineWidth = Math.max(1.1, H * 0.012);
const n = Math.max(2, Math.min(5, Math.round(evo + density - 0.5)));
for (let i = 0; i < n; i++) {
  const a = -0.95 + i * (1.9 / Math.max(1, n - 1));
  ctx.beginPath();
  ctx.arc(f * reach * 0.72, -H * 0.48, H * (0.08 + evo * 0.018), a, a + 0.22);
  ctx.stroke();
}
ctx.restore();
}

ctx.restore();
}

function drawSignatureFX(ctx, p, H, pose, t) {
const id = String(p?.id || "").toLowerCase();
const m = motionProfile(p);
const run = pose.state === "run" ? Math.max(0, Math.min(1, pose.speed || 0)) : 0;
const castU = pose.state === "cast" ? Math.max(0, Math.min(1, pose.cast || 0)) : 0;
const cast = castU ? Math.sin(castU * Math.PI) : 0;
const attackU = pose.state === "attack" ? Math.max(0, Math.min(1, pose.atk || 0)) : 0;
const attack = attackU ? Math.sin(attackU * Math.PI) : 0;
const dash = p?.dash > 0 ? Math.min(1, p.dash / 12) : 0;
const flourish = pose.state === "idle"
? Math.max(0, Math.min(1, Number(pose.flourish) || 0))
: 0;
const evoCombat = pose.evolutionCombat || {};
const energy = Math.max(
run * 0.72 * (Number(evoCombat.trail) || 1),
cast,
attack * (Number(evoCombat.attack) || 1),
dash * 0.9,
flourish * 0.28
);
if (energy < 0.06) return;

const color = accentFor(p);
const phase = t * (0.12 + m.pace * 0.035) + m.sway * 1.7;
const amp = H * (0.032 + energy * 0.047) * (0.92 + ((Number(evoCombat.trail) || 1) - 0.7) * 0.16);
ctx.save();
ctx.globalCompositeOperation = "lighter";
ctx.lineCap = "round";
ctx.lineJoin = "round";

switch (id) {
case "kilo":
  ctx.globalAlpha = 0.18 + energy * 0.42;
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const a = phase + i * 2.1;
    const x = -H * 0.12 + Math.cos(a) * H * (0.25 + energy * 0.12);
    const y = -H * 0.48 + Math.sin(a * 1.35) * H * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, amp * 0.82, amp * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  break;

case "stitcho":
  ctx.globalAlpha = 0.22 + energy * 0.42;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, H * 0.018);
  for (let i = 0; i < 4; i++) {
    const y = -H * (0.20 + i * 0.13);
    const x = -H * 0.42 - (i % 2) * H * 0.08;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + H * 0.07, y + H * 0.035);
    ctx.lineTo(x + H * 0.14, y - H * 0.015);
    ctx.stroke();
  }
  break;

case "chispin":
  ctx.globalAlpha = 0.24 + energy * 0.48;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.1, H * 0.018);
  for (let i = 0; i < 2; i++) {
    const y = -H * (0.28 + i * 0.18);
    const x = -H * (0.16 + i * 0.12);
    const z = Math.sin(phase * 2 + i) * amp * 0.55;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + amp * 0.5, y - amp * 0.35 + z);
    ctx.lineTo(x + amp * 0.18, y + amp * 0.08);
    ctx.lineTo(x + amp * 0.72, y - amp * 0.10 + z);
    ctx.stroke();
  }
  break;

case "cat":
  ctx.globalAlpha = 0.18 + energy * 0.36;
  for (let i = 0; i < 2; i++) {
    const a = phase * 0.7 + i * Math.PI;
    star(ctx, H * 0.24 + Math.cos(a) * amp * 2.2, -H * 0.55 + Math.sin(a) * amp * 1.3, Math.max(2, amp * 0.42), i ? "#fff6a8" : color);
  }
  break;

case "dragon":
  ctx.globalAlpha = 0.16 + energy * 0.44;
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) {
    const q = (phase * 0.7 + i * 1.7) % 3.8;
    const x = -H * 0.12 + Math.sin(q * 1.8 + i) * H * 0.24;
    const y = -H * 0.16 - q * H * 0.16;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1.3, amp * (0.22 + (i % 2) * 0.15)), 0, Math.PI * 2);
    ctx.fill();
  }
  break;

case "dino":
  ctx.globalAlpha = 0.16 + energy * 0.40;
  ctx.fillStyle = "#d5c7a0";
  for (let i = 0; i < 3; i++) {
    const x = -H * (0.08 + i * 0.13);
    const y = -H * 0.04 - Math.abs(Math.sin(phase + i)) * amp * 0.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((i - 1) * 0.35);
    ctx.fillRect(-amp * 0.28, -amp * 0.16, amp * 0.56, amp * 0.32);
    ctx.restore();
  }
  break;

case "frita":
  ctx.globalAlpha = 0.20 + energy * 0.42;
  ctx.fillStyle = "#fff3c0";
  for (let i = 0; i < 4; i++) {
    const a = phase + i * 1.4;
    const x = -H * 0.35 + Math.cos(a) * H * 0.20;
    const y = -H * 0.16 + Math.sin(a * 1.7) * H * 0.13;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(-amp * 0.22, -amp * 0.22, amp * 0.44, amp * 0.44);
    ctx.restore();
  }
  break;

case "pizza":
  ctx.globalAlpha = 0.18 + energy * 0.40;
  ctx.strokeStyle = "#ffe27a";
  ctx.lineWidth = Math.max(1.1, H * 0.016);
  for (let i = 0; i < 2; i++) {
    const y = -H * (0.18 + i * 0.16);
    ctx.beginPath();
    ctx.moveTo(H * 0.08, y);
    ctx.quadraticCurveTo(H * 0.26, y + Math.sin(phase + i) * amp, H * 0.44, y + H * 0.03);
    ctx.stroke();
  }
  break;

case "yomi":
  ctx.globalAlpha = 0.14 + energy * 0.34;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.1, H * 0.015);
  for (let i = 0; i < 2; i++) {
    const r = H * (0.18 + i * 0.08) + energy * H * 0.08;
    ctx.beginPath();
    ctx.ellipse(H * 0.10, -H * 0.52, r, r * 0.35, phase * 0.25 + i, 0, Math.PI * 2);
    ctx.stroke();
  }
  break;

case "cuerno":
  ctx.globalAlpha = 0.20 + energy * 0.42;
  ctx.strokeStyle = "#fff6c8";
  ctx.lineWidth = Math.max(1.1, H * 0.016);
  ctx.beginPath();
  ctx.arc(H * 0.18, -H * 0.60, H * (0.18 + energy * 0.10), -1.9, -0.35);
  ctx.stroke();
  star(ctx, H * 0.34, -H * 0.72, Math.max(2.5, amp * 0.55), color);
  break;
}

ctx.restore();
}

function drawMasteryMotionFX(ctx, p, H, t) {
const move = String(p?._move || "");
if (!move) return;
const f = p.facing || 1;
const color = accentFor(p);
ctx.save();
ctx.globalCompositeOperation = "lighter";
ctx.lineCap = "round";

if (move === "wingbeat") {
const flap = 0.45 + Math.sin(t * 0.55) * 0.18;
ctx.globalAlpha = 0.72;
ctx.strokeStyle = p.evo >= 4 ? "#ffd84a" : "#fff0d0";
ctx.lineWidth = Math.max(1.8, H * 0.024);
for (const side of [-1, 1]) {
  ctx.beginPath();
  ctx.moveTo(-f * H * 0.04, -H * 0.55);
  ctx.quadraticCurveTo(-f * H * (0.30 + flap) * side, -H * 0.78, -f * H * 0.44 * side, -H * 0.30);
  ctx.stroke();
}
} else if (move === "cloudstep") {
ctx.globalAlpha = 0.78;
ctx.strokeStyle = "#ffe14a";
ctx.lineWidth = Math.max(1.4, H * 0.018);
ctx.beginPath();
ctx.moveTo(-H * 0.18, 0);
ctx.lineTo(-H * 0.04, -H * 0.12);
ctx.lineTo(H * 0.02, -H * 0.02);
ctx.lineTo(H * 0.18, -H * 0.18);
ctx.stroke();
} else if (move === "moonpounce") {
ctx.globalAlpha = 0.68;
ctx.strokeStyle = "#ffb6e4";
ctx.lineWidth = Math.max(1.5, H * 0.02);
ctx.beginPath();
ctx.arc(-f * H * 0.18, -H * 0.50, H * 0.42, -1.2, 1.25);
ctx.stroke();
ctx.globalAlpha = 0.36;
ctx.beginPath();
ctx.arc(-f * H * 0.32, -H * 0.50, H * 0.30, -1.2, 1.25);
ctx.stroke();
} else if (move === "bloomdraft") {
ctx.globalAlpha = 0.62;
ctx.fillStyle = "#ff9ad8";
for (let i = 0; i < 5; i++) {
  const a = t * 0.12 + i * 1.26;
  const x = Math.cos(a) * H * 0.24;
  const y = -H * (0.10 + ((t * 0.025 + i * 0.17) % 0.75));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.beginPath();
  ctx.ellipse(0, 0, H * 0.035, H * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
} else if (move === "wallvault") {
ctx.globalAlpha = 0.58;
ctx.strokeStyle = "#7edfff";
ctx.lineWidth = Math.max(1.4, H * 0.018);
for (let i = 0; i < 3; i++) {
  const y = -H * (0.22 + i * 0.16);
  ctx.beginPath();
  ctx.moveTo(-f * H * 0.16, y + H * 0.06);
  ctx.lineTo(-f * H * 0.34, y);
  ctx.lineTo(-f * H * 0.18, y - H * 0.06);
  ctx.stroke();
}
} else if (move === "seismicbreak") {
ctx.globalAlpha = 0.74;
ctx.strokeStyle = "#c8f04a";
ctx.lineWidth = Math.max(1.6, H * 0.022);
ctx.beginPath();
ctx.moveTo(-H * 0.42, 0);
ctx.lineTo(-H * 0.18, -H * 0.10);
ctx.lineTo(0, 0);
ctx.lineTo(H * 0.20, -H * 0.12);
ctx.lineTo(H * 0.44, 0);
ctx.stroke();
} else if (move === "greaserail") {
ctx.globalAlpha = 0.58;
ctx.strokeStyle = "#ffd36a";
ctx.lineWidth = Math.max(1.5, H * 0.018);
for (let i = 0; i < 4; i++) {
  const y = -H * (0.08 + i * 0.08);
  ctx.beginPath();
  ctx.moveTo(-f * H * (0.18 + i * 0.05), y);
  ctx.lineTo(-f * H * (0.56 + i * 0.07), y + Math.sin(t * 0.2 + i) * H * 0.025);
  ctx.stroke();
}
} else if (move === "ovenbounce") {
ctx.globalAlpha = 0.66;
ctx.strokeStyle = "#ffb43a";
ctx.lineWidth = Math.max(1.5, H * 0.02);
for (let i = 0; i < 3; i++) {
  ctx.beginPath();
  ctx.arc(0, 0, H * (0.18 + i * 0.10), Math.PI * 0.10, Math.PI * 0.90);
  ctx.stroke();
}
} else if (move === "hollowphase") {
ctx.globalAlpha = 0.42;
ctx.strokeStyle = "#ff5b78";
ctx.lineWidth = Math.max(1.4, H * 0.018);
for (let i = 1; i <= 3; i++) {
  ctx.strokeRect(-f * H * (0.16 + i * 0.11), -H * 0.76, H * 0.12, H * 0.56);
}
} else if (move === "aurorabridge") {
ctx.globalAlpha = 0.72;
ctx.strokeStyle = "#fff6c8";
ctx.lineWidth = Math.max(1.4, H * 0.019);
for (let i = 0; i < 3; i++) {
  ctx.beginPath();
  ctx.arc(f * H * 0.04, -H * 0.28, H * (0.18 + i * 0.09), -1.1, 0.55);
  ctx.stroke();
}
}

ctx.restore();
}

function drawCharacterMotionFX(ctx, p, H, pose, t) {
const color = accentFor(p);
const prof = motionProfile(p);
drawSignatureFX(ctx, p, H, pose, t);
drawAbilitySignatureFX(ctx, p, H, pose, t);
drawBasicAttackSignatureFX(ctx, p, H, pose, t);
const intensity = Math.min(1.35, (pose.speed || 0) * (0.55 + prof.pace * 0.45));
if (pose.state === "run" && intensity > 0.28) drawSpeedLines(ctx, H, color, t, intensity);
drawLocomotionFX(ctx, H, color, pose, t);
drawMasteryMotionFX(ctx, p, H, t);
drawLandingImpact(ctx, H, color, pose);
drawAttackFX(ctx, H, color, pose);
drawEvolutionCombatFX(ctx, p, H, pose, t);
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
pose.state || "", pose.move || "", pose.form | 0, pose.cuernoBeat || "",
  pose.cuernoMagicSlot ?? -1, q(pose.cuernoDreamT, 2),
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
try { art.draw(cg, pose, R); } catch (e) { drawDefinitive(cg, charId || art.id, pose); }
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
// Cuerno's V59+ metamorphosis is authored in Canvas in every look mode.
// Never revive the obsolete four-legged baby SVG over the living horn.
if (id === "cuerno") return null;
const plate = paintedForm(id, p.evo);
if (plate && !moving && !air && atk < 0.12) return plate;
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
const pose = applyEvolutionPose(enhancePose(computePose(p, t, { rng: p.rng }), p), p);
if (p.id === "cuerno") {
  pose.cuernoBeat = p._cuernoBeat || "";
  pose.cuernoMagicSlot = Number.isInteger(p._cuernoMagicSlot) ? p._cuernoMagicSlot : -1;
  pose.cuernoDreamT = Math.max(0, Number(p._specialAuroraT) || 0) / 260;
}
const atk = pose.atk;
const hurt = (p.invuln || 0) > 0 || (p.hurtFlash || 0) > 0;
const hurtFresh = (p.invuln || 0) > 18;

// Cuerno V74 is already drawn in five different anatomical sizes. Do NOT
// multiply their growth again by generic evolution scaling or old sprite size.
let H = (p.id==="cuerno"?CUERNO_VISUAL_H[evo]:VISUAL_H[evo]*(CHAR_K[p.id]||1))*(p.visualScale||1);
if (getLook() === "paint" && p.id!=="cuerno") H = Math.min(220, Math.max(H, (p.h || 28) * 3));
const burstK = p.evoBurst > 0 ? Math.max(0, Math.min(1, p.evoBurst / Math.max(1, p.evoBurstMax || 90))) : 0;
if (burstK > 0) H *= 1 + Math.sin((1 - burstK) * Math.PI * 3) * 0.08 * burstK;

// Squash del rig. Un solo aplaste: no se suma al contador viejo.
const squash = Math.max(0, Math.min(0.22, pose.squash || 0));
const stretch = Math.max(-0.12, Math.min(0.16, pose.stretch || 0));
const evoVis = pose.evolutionVisual || { bodyX: 1, bodyY: 1, stance: 0, lift: 0 };
let sx = 1 + squash * 0.9 - stretch * 0.35;
let sy = 1 - squash * 0.75 + stretch * 0.4;
// El arte de cada forma ya cambia su geometría. Este segundo nivel ajusta
// la lectura corporal por personaje sin alterar jamás w/h de la hitbox.
if(p.id!=="cuerno"){
sx *= (pose.evolutionScaleX || 1) * (evoVis.bodyX || 1);
sy *= (pose.evolutionScaleY || 1) * (evoVis.bodyY || 1);
}
if (p.grounded && p._wasAir) p._land = 8;
p._wasAir = air;
if (p._land > 0) p._land--;

const stageLean = Number(evoVis.stance) || 0;
const dynamicLean = moving ? 0.05 : air ? ((p.vy || 0) < -1.2 ? -0.04 : 0.05) : 0;
const tilt = dynamicLean + (pose.bodyTilt || 0) * 0.35 + stageLean * (moving ? 1.35 : 0.92);
const lunge = atk * H * 0.08 + (pose.impact || 0) * H * 0.03;
const recoilX = hurtFresh ? -H * 0.08 : 0;
const formLift = air ? (evoVis.lift || 0) * H * 0.35 : (pose.state === "idle" || pose.state === "cast" ? (evoVis.lift || 0) * H * 0.55 : 0);
const color = p.color || "#ffffff";
const art = ART[p.id] || ART.kilo;
const airK = air ? 0.62 + Math.min(0.2, Math.abs(p.vy || 0) / 40) : 1;

ctx.save();
ctx.translate(footX, footY);
drawShadow(ctx, 0, 2 + (air ? 3 : 0), H * 0.3 * airK * sx, H * 0.06 * airK);
ctx.scale(facing, 1);
ctx.translate(recoilX + lunge, -formLift);

if (evo >= 3 && !air) drawGroundRing(ctx, H, color, t);
drawFlavor(ctx, p.id, H, t, evo, false);
if (moving) drawDust(ctx, H, t, speed);

const s = H / 100;
let flashCol = null, flashA = 0;
// V75 · A white crossfade bleached the black unicorn into a white one for most
// of every title evolution. Let black stay black; retain only pearl-lilac glint.
if (burstK > 0.35) {
  const intensity = Math.max(0, (burstK - 0.35) / 0.65);
  flashCol = p.id === "cuerno" ? "#bba8f5" : "#ffffff";
  flashA = intensity * (p.id === "cuerno" ? 0.075 : 0.9);
}
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
drawEvolutionSignatureFX(ctx, p, H, pose, t);
drawCharacterMotionFX(ctx, p, H, pose, t);
if (burstK > 0) {
drawBurst(ctx, H, color, burstK);
p.evoBurst--;
}
ctx.restore();
}