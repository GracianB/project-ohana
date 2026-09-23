import { drawBaby } from "./baby.js";
import { spriteFor } from "./sprites.js";

function glow(ctx, r, color, t, extra) {
  ctx.save();
  ctx.globalAlpha = 0.22 + Math.sin(t / 8) * 0.1;
  const g = ctx.createRadialGradient(0, 2, 3, 0, 2, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 2, r, 0, Math.PI * 2);
  ctx.fill();
  if (extra) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = color;
    for (let i = 0; i < extra; i++) {
      const a = t / 10 + i * ((Math.PI * 2) / extra);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.42, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function oval(ctx, x, y, rx, ry, fill, stroke, lw) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw || 1.5;
    ctx.stroke();
  }
}

function eye(ctx, x, y, w, h, angry) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, angry ? -0.25 * Math.sign(x) : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(x + w * 0.2, y + (angry ? 0.4 : 0), w * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - w * 0.22, y - h * 0.28, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.strokeStyle = "#1a0c08";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - w, y - h * 1.1);
    ctx.lineTo(x + w * 0.4, y - h * 0.2);
    ctx.stroke();
  }
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill || "#fff6a8";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
    const b = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(b) * r * 0.4, y + Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

function leaf(ctx, x, y, s, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.fillStyle = fill || "#3ecf7a";
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.7, 0, 0, s);
  ctx.quadraticCurveTo(-s * 0.7, 0, 0, -s);
  ctx.fill();
  ctx.restore();
}

function shine(ctx, x, y, rx, ry) {
  ctx.fillStyle = "rgba(255,255,255,.32)";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function limb(ctx, x1, y1, x2, y2, w, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawCharacter(ctx, p, cam, t) {
  const x = p.x - cam.x;
  const y = p.y - cam.y;
  const evo = Number(p.evo) || 0;
  const speed = Math.abs(p.vx || 0);
  const moving = !!p.grounded && speed > 0.55;
  const runT = t * (0.46 + speed * 0.14);
  const step = Math.sin(runT);
  const idle = p.grounded && !moving;
  const air = !p.grounded;
  const atk = p.melee > 0 ? (12 - p.melee) / 12 : 0;
  const bob = idle
    ? Math.sin(t * 0.1) * 1.8
    : moving
      ? Math.abs(step) * -1.4
      : (p.vy || 0) < 0 ? -1 : 1.2;
  const tilt = moving
    ? step * 0.05
    : air
      ? ((p.vy || 0) < 0 ? -0.06 : 0.08)
      : Math.sin(t * 0.08) * 0.03;
  const sx = air
    ? ((p.vy || 0) < 0 ? 0.94 : 1.04)
    : moving
      ? 1 + step * 0.03
      : 1 + Math.sin(t * 0.1) * 0.02;
  const sy = air
    ? ((p.vy || 0) < 0 ? 1.06 : 0.96)
    : moving
      ? 1 - step * 0.03
      : 1 - Math.sin(t * 0.1) * 0.02;
  if (p.invuln > 0 && p.invuln % 6 < 3 && p.invuln < 40) {
    ctx.save();
    ctx.globalAlpha = 0.35;
  }
  ctx.save();
  ctx.translate(x + p.w / 2, y + p.h / 2 + bob);
  ctx.scale((p.facing || 1) * sx, sy);
  ctx.rotate(tilt + atk * 0.16 * (p.facing || 1));
  const spr = spriteFor(p.id, evo);
  if (spr) {
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.beginPath();
    ctx.ellipse(0, p.h / 2 + 2, p.w * 0.42, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (evo >= 2) glow(ctx, p.w * (0.9 + evo * 0.28), p.color, t, evo >= 3 ? 4 + evo : 0);
    if (p.evoBurst > 0) {
      const k = p.evoBurst / 90;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = p.color || "#ffe66a";
      ctx.lineWidth = 6 * k;
      ctx.beginPath();
      ctx.arc(0, 0, 10 + (90 - p.evoBurst) * 2.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      p.evoBurst--;
    }
    const h = Math.max(40, p.h * 1.35 + evo * 2);
    const w = h;
    ctx.drawImage(spr, -w / 2, -h * 0.62, w, h);
    if (moving) {
      ctx.strokeStyle = "rgba(255,255,255,.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, h * 0.28);
      ctx.lineTo(-4 + step * 8, h * 0.42);
      ctx.moveTo(6, h * 0.28);
      ctx.lineTo(4 - step * 8, h * 0.42);
      ctx.stroke();
    }
    ctx.restore();
    if (p.invuln > 0 && p.invuln % 6 < 3 && p.invuln < 40) ctx.restore();
    return;
  }
  if (evo === 0) {
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath();
    ctx.ellipse(0, p.h / 2 + 2, Math.max(8, p.w * 0.36), 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dino Bebé uses drawDino's hatchling silhouette; other chars keep baby.js
    if (p.id === "dragon") drawDino(ctx, p, t, 0);
    else drawBaby(ctx, p, t);
    ctx.restore();
    if (p.invuln > 0 && p.invuln % 6 < 3 && p.invuln < 40) ctx.restore();
    return;
  }
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(0, p.h / 2 + 3, p.w * 0.42, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 2) glow(ctx, p.w * (0.9 + evo * 0.28), p.color, t, evo >= 3 ? 4 + evo : 0);
  if (p.evoBurst > 0) {
    const k = p.evoBurst / 90;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = p.color || "#ffe66a";
    ctx.lineWidth = 6 * k;
    ctx.beginPath();
    ctx.arc(0, 0, 10 + (90 - p.evoBurst) * 2.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    p.evoBurst--;
  }
  ctx.scale(0.92 + evo * 0.055, 0.92 + evo * 0.055);
  const drawers = { lilo: drawLilo, stitch: drawStitch, dragon: drawDino, pikachu: drawPikachu, cat: drawCat, frita: drawKetchup };
  (drawers[p.id] || drawLilo)(ctx, p, t, evo);
  ctx.restore();
  if (p.invuln > 0 && p.invuln % 6 < 3 && p.invuln < 40) ctx.restore();
}

function drawLilo(ctx, p, t, evo) {
  // Kilo: human silhouette — big hair bun + A-line dress (never a blob)
  const dress = evo >= 4 ? "#fff4c8" : evo >= 3 ? "#ffd36a" : evo >= 2 ? "#ff4d78" : "#e0142c";
  const skin = "#f3c4a0";
  const hair = evo >= 3 ? "#3a1608" : "#1a0c08";
  const ink = "#3a140c";
  const hem = evo >= 3 ? 22 : evo >= 2 ? 18 : 15;
  const dressH = evo >= 3 ? 24 : 19;
  const headY = evo >= 3 ? -12 : -9;
  const hairY = evo >= 3 ? -22 : -18;

  if (evo >= 4) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    oval(ctx, 0, -4, 36, 30, "rgba(255,236,150,.5)");
    ctx.restore();
    leaf(ctx, -30, 0, 15, -0.75, "#2bb56a");
    leaf(ctx, 30, 0, 15, 0.75, "#2bb56a");
    leaf(ctx, -26, -12, 11, -1.15, "#7ee08a");
    leaf(ctx, 26, -12, 11, 1.15, "#7ee08a");
  }
  if (evo >= 3) {
    // Soft cape behind dress
    ctx.fillStyle = evo >= 4 ? "rgba(255,244,180,.9)" : "rgba(255,180,70,.85)";
    ctx.beginPath();
    ctx.moveTo(-7, -2);
    ctx.quadraticCurveTo(-30, 10, -20, 28);
    ctx.lineTo(20, 28);
    ctx.quadraticCurveTo(30, 10, 7, -2);
    ctx.fill();
  }

  // Legs + little shoes (clear biped read)
  ctx.strokeStyle = skin;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-7, dressH - 4);
  ctx.lineTo(-9, dressH + 6);
  ctx.moveTo(7, dressH - 4);
  ctx.lineTo(9, dressH + 6);
  ctx.stroke();
  ctx.fillStyle = evo >= 3 ? "#fff8d6" : "#2a1408";
  ctx.beginPath();
  ctx.ellipse(-9.5, dressH + 7, 4.2, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(9.5, dressH + 7, 4.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair mass FIRST (silhouette crown) — high bun is Kilo's signature
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, hairY, evo >= 3 ? 17 : 14.5, evo >= 2 ? 13 : 10.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Twin top puffs
  ctx.beginPath();
  ctx.moveTo(-15, hairY + 2);
  ctx.quadraticCurveTo(-26, hairY - (evo >= 2 ? 22 : 16), -5, hairY - 4);
  ctx.quadraticCurveTo(0, hairY - (evo >= 3 ? 26 : 20), 5, hairY - 4);
  ctx.quadraticCurveTo(26, hairY - (evo >= 2 ? 22 : 16), 15, hairY + 2);
  ctx.fill();
  // Side locks framing face
  ctx.beginPath();
  ctx.ellipse(-12, headY + 2, 4.5, 9, 0.15, 0, Math.PI * 2);
  ctx.ellipse(12, headY + 2, 4.5, 9, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Round face
  oval(ctx, 0, headY, evo >= 3 ? 10.5 : 9.2, evo >= 3 ? 10.5 : 9, skin, ink, 1.15);
  shine(ctx, -3.2, headY - 3.5, 3.2, 2);
  eye(ctx, -4, headY - 1, 2.5, 2.8);
  eye(ctx, 4, headY - 1, 2.5, 2.8);
  // Blush
  ctx.fillStyle = "rgba(255,120,140,.4)";
  ctx.beginPath();
  ctx.ellipse(-7.5, headY + 2.5, 2.4, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(7.5, headY + 2.5, 2.4, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, headY + 3.5, 3.2, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // A-line dress — wide hem = instant girl-in-dress silhouette
  ctx.fillStyle = dress;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-10, 1);
  ctx.lineTo(10, 1);
  ctx.lineTo(hem, dressH);
  ctx.quadraticCurveTo(0, dressH + 3, -hem, dressH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // White tummy panel
  ctx.fillStyle = evo >= 3 ? "#fff8d6" : "#fff";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-4.5, 5, 9, 8, 2) : ctx.rect(-4.5, 5, 9, 8);
  ctx.fill();

  // Chubby arms
  oval(ctx, -12, 4, 3.6, 5.5, skin);
  oval(ctx, 12, 4, 3.6, 5.5, skin);
  limb(ctx, -12, 6, -18, 12, 3.4, skin);
  limb(ctx, 12, 6, 18, 12, 3.4, skin);
  oval(ctx, -19, 13, 3.2, 2.8, skin);
  oval(ctx, 19, 13, 3.2, 2.8, skin);

  if (evo >= 1) {
    // Teal leaf clip + flower lei dots
    ctx.fillStyle = "#2ec9c0";
    ctx.beginPath();
    ctx.ellipse(0, hairY - 8, 6.5 + evo * 0.6, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8ad4";
    for (const fx of [-10, 0, 10]) {
      ctx.beginPath();
      ctx.arc(fx, 4, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (evo >= 2) {
    // Flower crown petals
    ctx.fillStyle = "#ffd36a";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 5.5, hairY - 6, 2.6, 4.4, i * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,230,160,.95)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 8, 17 + evo * 2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  if (evo >= 3) {
    // Ukulele-ish star wand
    ctx.strokeStyle = "#c47a18";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(22, -28);
    ctx.stroke();
    star(ctx, 22, -32, 6.5, "#ffe66a");
  }
  if (evo >= 4) {
    for (let i = 0; i < 6; i++) {
      const a = t / 8 + i * 1.05;
      star(ctx, Math.cos(a) * 28, Math.sin(a) * 18 - 4, 3.2, "#fff8c8");
    }
  }
}

function drawKetchup(ctx, p, t, evo) {
  // Capitán Kétchup: tall fry stick + ketchup drip cape + captain hat
  const fry = evo >= 4 ? "#fff1a0" : evo >= 3 ? "#ffe08a" : "#f0b43a";
  const fryDark = evo >= 3 ? "#e8a028" : "#d49220";
  const ink = "#7a3a08";
  const ket = evo >= 4 ? "#ff5a5a" : "#c81e1e";
  const stickH = evo >= 3 ? 30 : 26;
  const stickW = evo >= 2 ? 8 : 7;
  const drip = Math.sin(t / 10) * 1.2;

  // Ketchup cape / splash behind (grows with evo — silhouette width)
  if (evo >= 1) {
    ctx.fillStyle = ket;
    ctx.beginPath();
    ctx.moveTo(-stickW - 2, 2);
    ctx.quadraticCurveTo(-18 - evo * 2, 8 + drip, -10 - evo, stickH - 2);
    ctx.lineTo(stickW + 2, stickH - 4);
    ctx.quadraticCurveTo(6, 8, stickW + 2, 2);
    ctx.fill();
    // Drip blobs
    ctx.beginPath();
    ctx.ellipse(-12 - evo, stickH - 1 + drip, 3.5 + evo * 0.4, 4 + evo * 0.3, 0.2, 0, Math.PI * 2);
    ctx.ellipse(-4, stickH + 2, 2.8, 3.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tall fry stick body — unique vertical silhouette
  ctx.fillStyle = fry;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-stickW, -6, stickW * 2, stickH, 5);
  else ctx.rect(-stickW, -6, stickW * 2, stickH);
  ctx.fill();
  ctx.stroke();
  // Fry ridges (grill marks)
  ctx.strokeStyle = fryDark;
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    const yy = 2 + i * 6;
    ctx.beginPath();
    ctx.moveTo(-stickW + 2, yy);
    ctx.lineTo(stickW - 2, yy + 1);
    ctx.stroke();
  }
  // Salt crystals
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 4 + evo; i++) {
    const sx = ((i * 7) % 11) - 5;
    const sy = 1 + ((i * 5) % 18);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Little arms (tiny fry nubs)
  ctx.fillStyle = fry;
  oval(ctx, -stickW - 3, 6, 3.2, 2.4, fry, ink, 1);
  oval(ctx, stickW + 3, 6, 3.2, 2.4, fry, ink, 1);

  // Shoes / footer
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.ellipse(-5, stickH - 2, 5, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(5, stickH - 2, 5, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Round head on top of fry
  oval(ctx, 0, -14, 9.5, 8.5, "#f4c2a8", ink, 1.15);
  shine(ctx, -3, -17, 3, 2);
  eye(ctx, -3.2, -15, 2.2, 2.4);
  eye(ctx, 3.2, -15, 2.2, 2.4);
  ctx.fillStyle = "rgba(255,120,120,.4)";
  ctx.beginPath();
  ctx.ellipse(-7, -12, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(7, -12, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -11, 2.6, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Captain hat (ketchup-bottle crown silhouette)
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.moveTo(-11, -20);
  ctx.lineTo(11, -20);
  ctx.lineTo(9, -24);
  ctx.lineTo(-9, -24);
  ctx.closePath();
  ctx.fill();
  // Bottle tip / plume
  ctx.fillRect(-4, -32, 8, 9);
  ctx.beginPath();
  ctx.moveTo(-4, -32);
  ctx.lineTo(0, -38 - evo);
  ctx.lineTo(4, -32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffe66a";
  ctx.fillRect(-2.5, -29, 5, 3);
  // Brim
  ctx.fillStyle = ink;
  ctx.fillRect(-13, -21, 26, 2.2);

  if (evo >= 2) {
    // Salt shaker badges
    ctx.fillStyle = "#fff";
    ctx.fillRect(-stickW - 1, 10, 5, 4);
    ctx.fillRect(stickW - 4, 10, 5, 4);
    ctx.fillStyle = ket;
    ctx.fillRect(-stickW, 10, 3, 2);
    ctx.fillRect(stickW - 3, 10, 3, 2);
  }
  if (evo >= 3) {
    // Extra-crispy glow fringe
    ctx.strokeStyle = "rgba(255,220,100,.85)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-stickW - 4, -4);
    ctx.lineTo(-stickW - 8, 8);
    ctx.moveTo(stickW + 4, -4);
    ctx.lineTo(stickW + 8, 8);
    ctx.stroke();
    // Ketchup bottle held out
    ctx.fillStyle = ket;
    ctx.fillRect(16, -2, 5, 10);
    ctx.fillStyle = "#fff";
    ctx.fillRect(16.5, -2, 4, 3);
  }
  if (evo >= 4) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    oval(ctx, 0, 4, 22, 18, "rgba(255,240,160,.5)");
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const a = t / 7 + i * 1.25;
      star(ctx, Math.cos(a) * 20, Math.sin(a) * 14, 2.4, "#fff8c8");
    }
  }
}

function drawStitch(ctx, p, t, evo) {
  // Glitch: alien — huge notched ears + antennae + tubby belly (wide silhouette)
  const blue = evo >= 4 ? "#e8f7ff" : evo >= 3 ? "#6ad0ff" : evo >= 2 ? "#1a3cff" : "#3d9bff";
  const belly = evo >= 4 ? "#fff" : "#d7f4ff";
  const ink = evo >= 4 ? "#4a7aaa" : "#0b1a44";
  const flap = Math.sin(t / 9) * (2.5 + evo * 0.6);
  const earH = evo >= 3 ? -56 : evo >= 2 ? -48 : -42;
  const bodyR = 17 + evo * 1.5;

  // Huge rabbit-alien ears (signature silhouette — draw first)
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-11, -6);
  ctx.quadraticCurveTo(-32, earH + flap, -4, -14);
  ctx.quadraticCurveTo(-14, -18, -11, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -6);
  ctx.quadraticCurveTo(32, earH + flap, 4, -14);
  ctx.quadraticCurveTo(14, -18, 11, -6);
  ctx.fill();
  // Notch tips
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(-22, earH * 0.72 + flap * 0.5);
  ctx.lineTo(-28, earH * 0.85 + flap);
  ctx.lineTo(-18, earH * 0.78);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, earH * 0.72 + flap * 0.5);
  ctx.lineTo(28, earH * 0.85 + flap);
  ctx.lineTo(18, earH * 0.78);
  ctx.fill();
  // Pink inner ear
  ctx.fillStyle = "#f4b6c8";
  ctx.beginPath();
  ctx.ellipse(-18, earH * 0.5, 4.5, 9 + evo, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, earH * 0.5, 4.5, 9 + evo, 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Antennae horns
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(-8, -20);
  ctx.lineTo(-10, -32 - evo);
  ctx.lineTo(-4, -18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -20);
  ctx.lineTo(10, -32 - evo);
  ctx.lineTo(4, -18);
  ctx.fill();
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.arc(-10, -33 - evo, 2.4, 0, Math.PI * 2);
  ctx.arc(10, -33 - evo, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Stubby legs
  ctx.strokeStyle = blue;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 16);
  ctx.lineTo(-12, 24);
  ctx.moveTo(8, 16);
  ctx.lineTo(12, 24);
  ctx.stroke();
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.ellipse(-13, 25, 4.5, 2.4, 0, 0, Math.PI * 2);
  ctx.ellipse(13, 25, 4.5, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tubby body + belly
  oval(ctx, 0, 6, bodyR, 14 + evo, blue, ink, 1.4);
  shine(ctx, -6, 0, 5, 3.5);
  oval(ctx, 0, 11, 10 + evo * 0.5, 7.5, belly);

  // Big alien eyes
  const angry = evo >= 2;
  ctx.fillStyle = evo >= 2 ? "#ff1a1a" : "#111";
  ctx.beginPath();
  ctx.ellipse(-6.5, 0, 4.6, angry ? 6.2 : 5.4, 0, 0, Math.PI * 2);
  ctx.ellipse(6.5, 0, 4.6, angry ? 6.2 : 5.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-7.6, -2.8, 2.2, 2.4);
  ctx.fillRect(5.6, -2.8, 2.2, 2.4);
  // Nose + teeth
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 7, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-4.5, 10, 9, 2.8);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-3.6, 9.2, 2, 3.2);
  ctx.fillRect(1.6, 9.2, 2, 3.2);

  if (evo >= 2) {
    // Claw arms raised
    ctx.strokeStyle = blue;
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-bodyR + 2, 4);
    ctx.lineTo(-28, -8);
    ctx.moveTo(bodyR - 2, 4);
    ctx.lineTo(28, -8);
    ctx.stroke();
    ctx.fillStyle = "#cfe9ff";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 28, -8);
      ctx.lineTo(side * 36, -14);
      ctx.lineTo(side * 30, -4);
      ctx.lineTo(side * 34, -2);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (evo >= 3) {
    // Experiment antenna dish
    oval(ctx, 0, -22, 5.5, 4.2, "#8ad4ff", ink, 1);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-1.2, -34, 2.4, 12);
    ctx.strokeStyle = "#cfe9ff";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(-26, 14);
    ctx.moveTo(16, 8);
    ctx.lineTo(26, 14);
    ctx.stroke();
    oval(ctx, 0, 4, 22, 9, "rgba(180,230,255,.35)");
  }
  if (evo >= 4) {
    ctx.strokeStyle = "rgba(180,240,255,.9)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 4, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 4, 32, 0.2, Math.PI - 0.2);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = t / 7 + i * 1.2;
      oval(ctx, Math.cos(a) * 28, Math.sin(a) * 16, 2.2, 2.2, "#fff");
    }
  }
}

function drawPikachu(ctx, p, t, evo) {
  // Pika: rodent — tall black-tipped ears + zigzag lightning tail
  const body = evo >= 4 ? "#fff8c4" : evo >= 3 ? "#ffe14a" : "#ffd000";
  const ink = "#3a2208";
  const tip = "#1a1208";
  const s = 1 + evo * 0.07;
  ctx.scale(s, s);
  const earTip = -34 - evo * 2;

  if (evo >= 2) {
    ctx.strokeStyle = "rgba(255,230,80,.6)";
    ctx.lineWidth = 1.7;
    for (let i = 0; i < 3 + evo; i++) {
      const a = t / 6 + i * 1.1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * (18 + evo * 3), Math.sin(a) * (11 + evo * 2));
      ctx.stroke();
    }
  }

  // Zigzag lightning tail (draw behind) — signature
  ctx.strokeStyle = body;
  ctx.lineWidth = 5.5 + evo;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(16, -4);
  ctx.lineTo(12, 8);
  ctx.lineTo(22, 0);
  ctx.lineTo(18, 12);
  ctx.stroke();
  // Bolt tip flare
  ctx.fillStyle = evo >= 2 ? "#fff36a" : tip;
  ctx.beginPath();
  ctx.moveTo(20, -2);
  ctx.lineTo(34, -10);
  ctx.lineTo(24, 6);
  ctx.lineTo(28, 10);
  ctx.closePath();
  ctx.fill();

  // Stubby hind legs
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-8, 16, 4.5, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(8, 16, 4.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Round body
  oval(ctx, 0, 8, 13.5, 11.5, body, ink, 1.3);
  oval(ctx, 0, 11, 8.5, 7, "rgba(255,255,255,.2)");

  // Arms
  oval(ctx, -12, 6, 3.5, 4.5, body);
  oval(ctx, 12, 6, 3.5, 4.5, body);

  // Round head
  oval(ctx, 0, -6, 12.5, 11.5, body, ink, 1.3);
  shine(ctx, -5, -10, 4.2, 2.6);

  // Tall pointy ears ON TOP — black tips for instant Pika read
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.lineTo(-11, earTip);
  ctx.lineTo(-1, -12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -12);
  ctx.lineTo(11, earTip);
  ctx.lineTo(1, -12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tip;
  ctx.beginPath();
  ctx.moveTo(-11, earTip);
  ctx.lineTo(-4, earTip);
  ctx.lineTo(-7.5, earTip + 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, earTip);
  ctx.lineTo(4, earTip);
  ctx.lineTo(7.5, earTip + 10);
  ctx.closePath();
  ctx.fill();
  // Ear outline
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-8, -12); ctx.lineTo(-11, earTip); ctx.lineTo(-1, -12);
  ctx.moveTo(8, -12); ctx.lineTo(11, earTip); ctx.lineTo(1, -12);
  ctx.stroke();

  // Cheek glow + solid red disks (high contrast)
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "rgba(255,60,70,.55)";
  ctx.beginPath();
  ctx.arc(-10, 0, 6.2 + evo * 0.5, 0, Math.PI * 2);
  ctx.arc(10, 0, 6.2 + evo * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#e23b3d";
  ctx.beginPath();
  ctx.arc(-10, 0, 3.8 + evo * 0.35, 0, Math.PI * 2);
  ctx.arc(10, 0, 3.8 + evo * 0.35, 0, Math.PI * 2);
  ctx.fill();

  eye(ctx, -4.2, -7, 2.5, 2.7);
  eye(ctx, 4.2, -7, 2.5, 2.7);
  // Tiny nose + smile
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, -3, 1.3, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3208";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-2.8, -1.2);
  ctx.quadraticCurveTo(0, 1.6, 2.8, -1.2);
  ctx.stroke();

  if (evo >= 3) {
    // Extra bolt spark from cheek
    ctx.strokeStyle = "#fff36a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(-24, -18);
    ctx.lineTo(-14, -10);
    ctx.lineTo(-20, -4);
    ctx.stroke();
  }
  if (evo >= 4) {
    for (let i = 0; i < 4; i++) {
      const a = t / 8 + i * 1.5;
      star(ctx, Math.cos(a) * 22, Math.sin(a) * 14 - 2, 2.5, "#fffde8");
    }
  }
}

function drawCatOLD_UNUSED(ctx, p, t, evo) {
  const body = evo >= 4 ? "#fffde8" : evo >= 3 ? "#fff36a" : evo >= 2 ? "#e0891c" : "#ffe44a";
  const ink = "#5a3208";
  const ear = evo >= 2 ? 36 : 30;

  if (evo >= 3) {
    ctx.strokeStyle = "rgba(255,240,120,.75)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5 + evo; i++) {
      const a = t / 5 + i * 0.9;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(Math.cos(a) * (22 + evo * 3), Math.sin(a) * (16 + evo));
      ctx.stroke();
    }
  }

  oval(ctx, 0, 6, evo >= 2 ? 18 : 15, evo >= 2 ? 16 : 13, body, ink, 1.4);
  shine(ctx, -5, 2, 5, 3);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(-14, -ear);
  ctx.lineTo(-1, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(14, -ear);
  ctx.lineTo(1, -8);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-14, -ear);
  ctx.lineTo(-8, -ear);
  ctx.lineTo(-11, -ear + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -ear);
  ctx.lineTo(8, -ear);
  ctx.lineTo(11, -ear + 8);
  ctx.fill();

  eye(ctx, -5, 1, 2.6, 2.9, evo >= 3);
  eye(ctx, 5, 1, 2.6, 2.9, evo >= 3);
  ctx.fillStyle = "#e23";
  ctx.beginPath();
  ctx.arc(-12, 8, evo >= 2 ? 4.2 : 3.2, 0, Math.PI * 2);
  ctx.arc(12, 8, evo >= 2 ? 4.2 : 3.2, 0, Math.PI * 2);
  ctx.fill();
  oval(ctx, 0, 8, 1.6, 1.2, "#333");

  ctx.strokeStyle = evo >= 3 ? "#fff36a" : "#c90";
  ctx.lineWidth = evo >= 2 ? 5.2 : 4.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, 6);
  ctx.quadraticCurveTo(32, evo >= 2 ? -22 : -14, 24, 10);
  ctx.quadraticCurveTo(22, 20, evo >= 2 ? 38 : 30, 16);
  ctx.stroke();
  if (evo >= 2) {
    ctx.fillStyle = "#fff36a";
    ctx.beginPath();
    ctx.moveTo(36, 12);
    ctx.lineTo(48, 6);
    ctx.lineTo(40, 18);
    ctx.lineTo(44, 22);
    ctx.closePath();
    ctx.fill();
  }
  if (evo >= 4) {
    oval(ctx, 0, 4, 26, 22, "rgba(255,255,220,.28)");
    star(ctx, -18, -16, 4);
    star(ctx, 20, -12, 3);
  }
}

function drawDino(ctx, p, t, evo) {
  // Five unmistakable silhouettes — soft size via hitbox scale only.
  const unit = Math.max(10, Math.min(p.w || 14, p.h || 14));
  const s = unit / 18;
  ctx.scale(s, s);
  const bob = Math.sin(t / 9) * 0.55;
  ctx.translate(0, 1 + bob);
  if (evo >= 4) drawDinoGod(ctx, t);
  else if (evo >= 3) drawDinoRex(ctx, t);
  else if (evo >= 2) drawDinoPico(ctx, t);
  else if (evo >= 1) drawDinoRunner(ctx, t);
  else drawDinoBaby(ctx, t);
}

function dinoEye(ctx, x, y, w, h, angry) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, angry ? -0.2 * Math.sign(x || 1) : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(x + w * 0.18, y + (angry ? 0.35 : 0), w * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - w * 0.25, y - h * 0.3, w * 0.18, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.strokeStyle = "#1a0c08";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - w, y - h * 1.15);
    ctx.lineTo(x + w * 0.45, y - h * 0.15);
    ctx.stroke();
  }
}

function dinoOval(ctx, x, y, rx, ry, fill, stroke, lw) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.1; ctx.stroke(); }
}

/** Evo 0 — Dino Bebé: round hatchling, stubby limbs, huge eyes. */
function drawDinoBaby(ctx, t) {
  const body = "#9ae8b8";
  const belly = "#e8fff0";
  const ink = "#2a5a40";
  const blush = "rgba(255,150,170,.45)";
  const wag = Math.sin(t / 8) * 1.6;

  // Tiny stub tail
  ctx.strokeStyle = body;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 3);
  ctx.quadraticCurveTo(-7, 5 + wag * 0.3, -8.5, 3.5 + wag);
  ctx.stroke();

  // Stubby little legs (almost hidden under ball body)
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-2, 5); ctx.lineTo(-2.5, 7.5);
  ctx.moveTo(2.5, 5); ctx.lineTo(3, 7.5);
  ctx.stroke();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-2.6, 7.7, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(3.2, 7.7, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Round potato body
  dinoOval(ctx, 0, 2.2, 7.2, 6.4, body, ink, 1.05);
  dinoOval(ctx, 0.4, 3.6, 4.2, 3.2, belly);

  // Egg-shell flake on back (hatchling cue)
  ctx.fillStyle = "#f4ffe8";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-3, -2);
  ctx.lineTo(-1, -5.5);
  ctx.lineTo(1.5, -2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Big round head sitting on body
  dinoOval(ctx, 1.5, -3.2, 6.4, 5.6, body, ink, 1.05);
  dinoOval(ctx, 2.2, -2.2, 3.6, 2.8, belly);

  // HUGE cute eyes
  dinoEye(ctx, -0.5, -3.8, 2.4, 2.6);
  dinoEye(ctx, 4.2, -3.8, 2.4, 2.6);

  // Tiny nostrils + smile
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(5.8, -1.6, 0.4, 0, Math.PI * 2);
  ctx.arc(6.8, -1.6, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(3.5, -0.6, 2.2, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Blush
  ctx.fillStyle = blush;
  ctx.beginPath();
  ctx.ellipse(-2.2, -1.4, 1.5, 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(5.8, -1.2, 1.5, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Evo 1 — Dino: bipedal runner, longer legs, small crest. */
function drawDinoRunner(ctx, t) {
  const green = "#5ecf6a";
  const belly = "#d8f8c8";
  const ink = "#1e4a22";
  const crest = "#3bb85a";
  const wag = Math.sin(t / 7) * 2.4;
  const stride = Math.sin(t / 5) * 1.2;

  // Horizontal balance tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 3);
  ctx.quadraticCurveTo(-12, 5 + wag * 0.3, -15, 2 + wag);
  ctx.stroke();

  // Longer runner legs
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-1.5, 4); ctx.lineTo(-3 + stride, 10.5);
  ctx.moveTo(3.5, 4); ctx.lineTo(5.5 - stride, 10.5);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.2 + stride, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.8 - stride, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lean horizontal torso
  dinoOval(ctx, 1, 2.8, 7.0, 4.4, green, ink, 1.05);
  dinoOval(ctx, 1.2, 4.0, 4.0, 2.2, belly);

  // Stubby arms pumping
  ctx.strokeStyle = green;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 1.2); ctx.lineTo(-5.5, 2.8 + stride * 0.4);
  ctx.moveTo(5, 1.2); ctx.lineTo(8.2, 2.5 - stride * 0.4);
  ctx.stroke();

  // Head on short neck
  dinoOval(ctx, 7.0, -2.4, 5.0, 4.2, green, ink, 1.05);
  dinoOval(ctx, 9.0, -1.4, 3.0, 2.0, belly);

  // Small 2-spike crest
  ctx.fillStyle = crest;
  ctx.beginPath();
  ctx.moveTo(4.2, -5); ctx.lineTo(5.2, -8.4); ctx.lineTo(6.5, -5); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6.2, -5.2); ctx.lineTo(7.3, -9.0); ctx.lineTo(8.5, -5); ctx.fill();

  dinoEye(ctx, 6.0, -3.0, 1.55, 1.7);
  dinoEye(ctx, 9.0, -3.0, 1.55, 1.7);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(10.6, -1.4, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.arc(8.4, -0.4, 1.4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,140,160,.38)";
  ctx.beginPath();
  ctx.ellipse(5.2, -1.0, 1.2, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Evo 2 — Dino Pico: spiked / beak-ish, tall crest, lean teal. */
function drawDinoPico(ctx, t) {
  const green = "#2ec4b6";
  const belly = "#d0fff4";
  const ink = "#0e3a3a";
  const sail = "#7ef0d8";
  const horn = "#ffe66a";
  const wag = Math.sin(t / 6) * 3;

  // Long whip tail + blade tip
  ctx.strokeStyle = green;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 2);
  ctx.quadraticCurveTo(-11, 6 + wag * 0.2, -18, 1 + wag);
  ctx.stroke();
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(-16, 1 + wag);
  ctx.lineTo(-21, -2 + wag);
  ctx.lineTo(-17.5, 3.5 + wag);
  ctx.closePath();
  ctx.fill();

  // Tall lean legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-1.5, 4); ctx.lineTo(-3, 10.5);
  ctx.moveTo(3.5, 4); ctx.lineTo(5, 10.5);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.4, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.4, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upright lean body
  dinoOval(ctx, 0.5, 2.5, 5.6, 6.6, green, ink, 1.1);
  dinoOval(ctx, 0.8, 4, 3.0, 3.2, belly);

  // Back sail spikes — signature
  ctx.fillStyle = sail;
  const sails = [
    [-3.2, -2.5, 4.2],
    [-0.6, -3.5, 6.2],
    [2.2, -2.8, 5.0],
  ];
  for (const [sx, sy, sh] of sails) {
    ctx.beginPath();
    ctx.moveTo(sx - 1.4, sy);
    ctx.lineTo(sx, sy - sh);
    ctx.lineTo(sx + 1.4, sy);
    ctx.closePath();
    ctx.fill();
  }

  // Arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-4.2, 0); ctx.lineTo(-7.2, 2.2);
  ctx.moveTo(4.2, 0); ctx.lineTo(7.2, 2.0);
  ctx.stroke();

  // High neck + beaked head
  dinoOval(ctx, 2.5, -5.5, 3.0, 3.4, green, ink, 1);
  dinoOval(ctx, 5.5, -7.2, 5.2, 4.0, green, ink, 1.1);
  // Beak wedge
  ctx.fillStyle = "#e8fff8";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(8.5, -7.5);
  ctx.lineTo(14.5, -6.2);
  ctx.lineTo(8.8, -4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tall pico horn
  ctx.fillStyle = horn;
  ctx.beginPath();
  ctx.moveTo(4.0, -10);
  ctx.lineTo(5.4, -18);
  ctx.lineTo(7.2, -10.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  dinoEye(ctx, 4.0, -7.6, 1.6, 1.8, true);
  dinoEye(ctx, 7.0, -7.6, 1.6, 1.8, true);

  // Soft teal ring
  ctx.strokeStyle = "rgba(46,196,182,.45)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(2, -2, 11, 0, Math.PI * 2);
  ctx.stroke();
}

/** Evo 3 — Dino Rex: bulky predator, thick tail, jaws, clay/rust. */
function drawDinoRex(ctx, t) {
  const green = "#c96b2a";
  const belly = "#f0d0a8";
  const ink = "#3a1a08";
  const gum = "#6a2030";
  const tooth = "#f4ffe8";
  const ridge = "#e89040";
  const wag = Math.sin(t / 8) * 1.6;

  // Thick counterbalance tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 5.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.quadraticCurveTo(-12, 4 + wag * 0.3, -17, 0 + wag);
  ctx.stroke();
  ctx.fillStyle = ridge;
  for (let i = 0; i < 3; i++) {
    const tx = -8 - i * 3;
    ctx.beginPath();
    ctx.moveTo(tx, 1 + wag * 0.2);
    ctx.lineTo(tx - 0.6, -2 + wag * 0.2);
    ctx.lineTo(tx + 1.4, 1.5 + wag * 0.2);
    ctx.fill();
  }

  // Tree-trunk legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.moveTo(-2, 4); ctx.lineTo(-3.5, 11);
  ctx.moveTo(4, 4); ctx.lineTo(5.8, 11);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-4, 11.4, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.ellipse(6.2, 11.4, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy barrel body
  dinoOval(ctx, 1, 2.2, 8.4, 6.8, green, ink, 1.2);
  dinoOval(ctx, 1.4, 4, 4.8, 3.6, belly);

  // Tiny T-rex arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(2, 0); ctx.lineTo(0.5, 2.2);
  ctx.moveTo(4, 0); ctx.lineTo(5.2, 2);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(0.2, 2.5, 1.1, 0, Math.PI * 2);
  ctx.arc(5.4, 2.3, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // HUGE head + snout
  dinoOval(ctx, 8.5, -4.5, 8.5, 6.4, green, ink, 1.25);
  dinoOval(ctx, 14.5, -3.2, 5.2, 3.6, green, ink, 1.1);
  dinoOval(ctx, 14.2, -2.2, 3.6, 2.2, belly);

  // Open jaw
  ctx.fillStyle = gum;
  ctx.beginPath();
  ctx.moveTo(10, -0.5);
  ctx.lineTo(18, 0.5);
  ctx.lineTo(12, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tooth;
  for (let i = 0; i < 4; i++) {
    const tx = 11.5 + i * 1.7;
    ctx.beginPath();
    ctx.moveTo(tx, -0.2);
    ctx.lineTo(tx + 0.55, 1.8);
    ctx.lineTo(tx + 1.1, -0.2);
    ctx.fill();
  }

  // Brow crest
  ctx.fillStyle = ridge;
  ctx.beginPath();
  ctx.moveTo(4, -8);
  ctx.lineTo(7, -12.5);
  ctx.lineTo(10, -8.5);
  ctx.closePath();
  ctx.fill();

  dinoEye(ctx, 6.5, -5.5, 2.2, 2.4, true);
  dinoEye(ctx, 11.2, -5.2, 2.0, 2.2, true);

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(17.2, -3.6, 0.7, 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heat shimmer dots
  ctx.fillStyle = "#ffb060";
  for (let i = 0; i < 3; i++) {
    const a = t / 10 + i * 2.1;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 12, Math.sin(a) * 7 - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Evo 4 — DINO GOD: compact mythic titan, aura + crown spikes (no glide). */
function drawDinoGod(ctx, t) {
  const body = "#ffe66a";
  const belly = "#fff8d8";
  const ink = "#6a4a18";
  const gold = "#fff1a0";
  const glow = "#c8ff7a";
  const wag = Math.sin(t / 6) * 2.2;
  const pulse = 0.32 + Math.sin(t / 8) * 0.08;

  // Soft golden aura (not wings — form has no glide)
  ctx.save();
  ctx.globalAlpha = pulse;
  dinoOval(ctx, 1, 0, 15, 12, "rgba(255,230,100,.55)");
  dinoOval(ctx, 1, 0, 11, 9, "rgba(200,255,120,.35)");
  ctx.restore();

  // Ribbon celestial tail
  ctx.strokeStyle = body;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 2);
  ctx.quadraticCurveTo(-10, 8 + wag, -16, 4 + wag);
  ctx.quadraticCurveTo(-20, 0 + wag, -18, -4 + wag);
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(-18, -4 + wag);
  ctx.lineTo(-22, -7 + wag);
  ctx.lineTo(-16, -6 + wag);
  ctx.closePath();
  ctx.fill();

  // Compact sturdy legs
  ctx.strokeStyle = body;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-1, 5); ctx.lineTo(-2.2, 10);
  ctx.moveTo(4, 5); ctx.lineTo(5.4, 10);
  ctx.stroke();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-2.5, 10.3, 2.4, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.6, 10.3, 2.4, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Luminous compact body
  dinoOval(ctx, 1, 2.5, 7.0, 5.6, body, ink, 1.15);
  dinoOval(ctx, 1.2, 3.8, 4.0, 2.8, belly);

  // Glowing chest gem
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(1.2, 2.2, 1.6, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0.8, 1.6, 0.5, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.strokeStyle = body;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-5, 0.5); ctx.lineTo(-8.5, -0.5);
  ctx.moveTo(6, 0.5); ctx.lineTo(9.5, -0.8);
  ctx.stroke();

  // Noble head
  dinoOval(ctx, 6.5, -4.2, 6.0, 5.0, body, ink, 1.15);
  dinoOval(ctx, 9.0, -3.2, 3.4, 2.4, belly);

  // Crown spikes (5) — mythic silhouette
  ctx.fillStyle = gold;
  const horns = [[2.8, -7.5, -13], [5.0, -8.5, -16], [7.2, -9, -17.5], [9.4, -8.5, -15.5], [11.4, -7.2, -12.5]];
  for (const [hx, hy, tip] of horns) {
    ctx.beginPath();
    ctx.moveTo(hx - 1.1, hy);
    ctx.lineTo(hx, tip);
    ctx.lineTo(hx + 1.1, hy);
    ctx.closePath();
    ctx.fill();
  }

  dinoEye(ctx, 4.6, -4.8, 1.7, 1.9);
  dinoEye(ctx, 8.4, -4.8, 1.7, 1.9);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(11.0, -2.6, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(8.2, -1.4, 1.5, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Orbiting sparkles
  for (let i = 0; i < 5; i++) {
    const a = t / 7 + i * 1.25;
    const sx = Math.cos(a) * 12;
    const sy = Math.sin(a) * 8.5 - 1;
    ctx.fillStyle = i % 2 ? "#fff8c8" : glow;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const ang = -Math.PI / 2 + k * ((Math.PI * 2) / 5);
      const br = ang + Math.PI / 5;
      const r = 1.6;
      if (k === 0) ctx.moveTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
      else ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
      ctx.lineTo(sx + Math.cos(br) * r * 0.4, sy + Math.sin(br) * r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawCat(ctx, p, t, evo) {
  // Michi: sitting cat — pointed ears + curled tail + whiskers (loaf silhouette)
  const fur = evo >= 4 ? "#fff4fc" : evo >= 3 ? "#ffd0ee" : evo >= 2 ? "#ff8ad4" : "#ffb6e4";
  const ink = "#5a2040";
  const pink = "#ff7ac2";
  const deep = "#ff4da0";
  const s = 1 + evo * 0.06;
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Curled cat tail (whips) — multi at GOD
  const tails = evo >= 4 ? 3 : 1;
  const tw = Math.sin(t / 12) * 3.5;
  for (let i = 0; i < tails; i++) {
    const off = (i - (tails - 1) / 2) * 9;
    ctx.strokeStyle = fur;
    ctx.lineWidth = 5.8;
    ctx.beginPath();
    ctx.moveTo(11, 16);
    ctx.quadraticCurveTo(28 + off, 12 + tw, 26 + off, -2 + tw);
    ctx.quadraticCurveTo(24 + off, -12 + tw, 14 + off, -10 + tw);
    ctx.stroke();
    ctx.fillStyle = evo >= 2 ? "#fff" : deep;
    ctx.beginPath();
    ctx.arc(14 + off, -10 + tw, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sitting loaf body
  oval(ctx, 0, 13, 12.5, 12, fur, ink, 1.3);
  oval(ctx, 0, 17, 7.5, 6, "rgba(255,255,255,.32)");
  // Front paws with toe beans
  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  for (const px of [-6.5, 6.5]) {
    ctx.beginPath();
    ctx.ellipse(px, 22.5, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = pink;
  for (const px of [-6.5, 6.5]) {
    ctx.beginPath();
    ctx.ellipse(px, 22.5, 1.7, 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tiny toe dots
    ctx.beginPath();
    ctx.arc(px - 2.2, 21.2, 0.7, 0, Math.PI * 2);
    ctx.arc(px + 2.2, 21.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cat ears BEFORE head (wide base → pointed tip)
  function catEar(dir) {
    const bx = dir * 8.5;
    ctx.fillStyle = fur;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 8.5, -13);
    ctx.lineTo(bx + dir * 2.5, -32);
    ctx.lineTo(bx + dir * 9.5, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 4.2, -14.5);
    ctx.lineTo(bx + dir * 2.2, -27.5);
    ctx.lineTo(bx + dir * 5.8, -14.5);
    ctx.closePath();
    ctx.fill();
  }
  catEar(-1);
  catEar(1);

  // Round head
  oval(ctx, 0, -6, 14.5, 12.8, fur, ink, 1.3);
  shine(ctx, -6, -11, 4.4, 2.8);

  // Tabby forehead M
  ctx.strokeStyle = deep;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -16.5); ctx.lineTo(0, -12);
  ctx.moveTo(-4.5, -16); ctx.lineTo(-3, -12.5);
  ctx.moveTo(4.5, -16); ctx.lineTo(3, -12.5);
  ctx.stroke();

  // Long whiskers
  ctx.strokeStyle = "rgba(90,32,64,.72)";
  ctx.lineWidth = 1.05;
  const wk = Math.sin(t / 18) * 0.9;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 5, -3); ctx.lineTo(dir * 24, -8 + wk);
    ctx.moveTo(dir * 5, -1); ctx.lineTo(dir * 25, -1);
    ctx.moveTo(dir * 5, 1); ctx.lineTo(dir * 24, 6 - wk);
    ctx.stroke();
  }

  eye(ctx, -5.2, -7, 3.3, 3.9);
  eye(ctx, 5.2, -7, 3.3, 3.9);

  // Pink nose + ω mouth
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, -1.5);
  ctx.lineTo(-2.5, -3.5);
  ctx.lineTo(2.5, -3.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(0, -1.5); ctx.lineTo(0, 0.6);
  ctx.arc(-1.9, 0.6, 1.9, 0, Math.PI);
  ctx.moveTo(0, 0.6);
  ctx.arc(1.9, 0.6, 1.9, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,120,180,.48)";
  ctx.beginPath();
  ctx.ellipse(-9.5, -3, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.ellipse(9.5, -3, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  if (evo >= 2) {
    // Soft cloud ring
    ctx.strokeStyle = "rgba(255,180,220,.75)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -6, 18, 0, Math.PI * 2);
    ctx.stroke();
    // Fluff cheek tufts
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(-14, -2, 3.5, 2.8, -0.3, 0, Math.PI * 2);
    ctx.ellipse(14, -2, 3.5, 2.8, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (evo >= 3) {
    for (let i = 0; i < 5; i++) {
      star(ctx, Math.cos(t / 10 + i * 1.2) * 20, Math.sin(t / 10 + i * 1.2) * 14 - 6, 2.4, "#fff");
    }
  }
  if (evo >= 4) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    oval(ctx, 0, 4, 24, 20, "rgba(255,240,255,.55)");
    ctx.restore();
  }
}

