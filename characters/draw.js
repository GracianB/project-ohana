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
    drawBaby(ctx, p, t);
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
  const dress = evo >= 4 ? "#fff4c8" : evo >= 3 ? "#ffd36a" : evo >= 2 ? "#ff4d78" : "#e0142c";
  const hair = evo >= 3 ? "#3a1608" : "#1a0c08";
  const ink = "#3a140c";

  if (evo >= 4) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    oval(ctx, 0, -6, 34, 28, "rgba(255,236,150,.45)");
    ctx.restore();
    leaf(ctx, -28, 2, 16, -0.7, "#2bb56a");
    leaf(ctx, 28, 2, 16, 0.7, "#2bb56a");
    leaf(ctx, -24, -10, 12, -1.1, "#7ee08a");
    leaf(ctx, 24, -10, 12, 1.1, "#7ee08a");
  }
  if (evo >= 3) {
    ctx.fillStyle = evo >= 4 ? "rgba(255,244,180,.85)" : "rgba(255,180,70,.8)";
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.quadraticCurveTo(-28, 8, -18, 26);
    ctx.lineTo(18, 26);
    ctx.quadraticCurveTo(28, 8, 6, -4);
    ctx.fill();
  }

  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 12);
  ctx.lineTo(-10, 22);
  ctx.moveTo(8, 12);
  ctx.lineTo(10, 22);
  ctx.stroke();

  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, evo >= 3 ? -22 : -18, evo >= 3 ? 18 : 15, evo >= 2 ? 14 : 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-16, -16);
  ctx.quadraticCurveTo(-24, evo >= 2 ? -38 : -30, -6, -24);
  ctx.quadraticCurveTo(0, evo >= 3 ? -42 : -34, 6, -24);
  ctx.quadraticCurveTo(24, evo >= 2 ? -38 : -30, 16, -16);
  ctx.fill();

  oval(ctx, 0, evo >= 3 ? -11 : -9, evo >= 3 ? 11 : 9.4, evo >= 3 ? 11 : 9.2, "#f3c4a0", ink, 1.2);
  shine(ctx, -3, evo >= 3 ? -14 : -12, 3.2, 2);
  eye(ctx, -4.2, evo >= 3 ? -12 : -10, 2.5, 2.8);
  eye(ctx, 4.2, evo >= 3 ? -12 : -10, 2.5, 2.8);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, evo >= 3 ? -7 : -5.5, 3.4, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.lineTo(13, 0);
  ctx.lineTo(evo >= 3 ? 20 : 16, evo >= 3 ? 24 : 20);
  ctx.lineTo(evo >= 3 ? -20 : -16, evo >= 3 ? 24 : 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = evo >= 3 ? "#fff8d6" : "#fff";
  ctx.fillRect(-4, 6, 8, 7);

  limb(ctx, -13, 2, -20, 10, 3.2, "#f3c4a0");
  limb(ctx, 13, 2, 20, 10, 3.2, "#f3c4a0");
  oval(ctx, -15, 3, 3.2, 5, "#f3c4a0");
  oval(ctx, 15, 3, 3.2, 5, "#f3c4a0");

  if (evo >= 1) {
    ctx.fillStyle = "#2ec9c0";
    ctx.beginPath();
    ctx.ellipse(0, evo >= 3 ? -32 : -26, 7 + evo, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8ad4";
    ctx.beginPath();
    ctx.arc(-9, 3, 2.4, 0, Math.PI * 2);
    ctx.arc(0, 4, 2.4, 0, Math.PI * 2);
    ctx.arc(9, 3, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (evo >= 2) {
    ctx.fillStyle = "#ffd36a";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 6, evo >= 3 ? -30 : -24, 2.4, 4.2, i * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,230,160,.95)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 6, 18 + evo * 2, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }
  if (evo >= 3) {
    ctx.strokeStyle = "#c47a18";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(22, -28);
    ctx.stroke();
    star(ctx, 22, -32, 6, "#ffe66a");
  }
  if (evo >= 4) {
    for (let i = 0; i < 6; i++) {
      const a = t / 8 + i * 1.05;
      star(ctx, Math.cos(a) * 26, Math.sin(a) * 18 - 4, 3, "#fff8c8");
    }
  }
}

function drawKetchup(ctx, p, t, evo) {
  const fry = evo >= 3 ? "#ffe08a" : "#f0b43a";
  const ink = "#7a3a08";
  ctx.fillStyle = "#c81e1e";
  ctx.beginPath();
  ctx.moveTo(-4, -2);
  ctx.quadraticCurveTo(-22, 8, -8, 22);
  ctx.lineTo(10, 20);
  ctx.quadraticCurveTo(6, 6, 6, 0);
  ctx.fill();
  ctx.fillStyle = fry;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-7, -8, 14, 28, 5) : ctx.rect(-7, -8, 14, 28);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  oval(ctx, 0, -14, 9, 8, "#f4c2a8", ink, 1.1);
  eye(ctx, -3, -15, 2.1, 2.3);
  eye(ctx, 3, -15, 2.1, 2.3);
  ctx.fillStyle = "#c81e1e";
  ctx.fillRect(-8, -22, 16, 6);
  ctx.fillRect(-4, -28, 8, 7);
  ctx.fillStyle = "#ffe66a";
  ctx.fillRect(-2, -26, 4, 3);
  if (evo >= 2) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(-10, 6, 6, 4);
    ctx.fillRect(4, 6, 6, 4);
  }
}

function drawStitch(ctx, p, t, evo) {
  const blue = evo >= 4 ? "#e8f7ff" : evo >= 3 ? "#6ad0ff" : evo >= 2 ? "#1a3cff" : "#3d9bff";
  const ink = evo >= 4 ? "#4a7aaa" : "#0b1a44";
  const flap = Math.sin(t / 9) * (2 + evo);
  const earH = evo >= 3 ? -52 : evo >= 2 ? -46 : -40;

  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.quadraticCurveTo(-30, earH + flap, -2, -14);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -8);
  ctx.quadraticCurveTo(30, earH + flap, 2, -14);
  ctx.fill();
  ctx.fillStyle = "#f4b6c8";
  ctx.beginPath();
  ctx.ellipse(-20, earH * 0.55, 4.2, 8 + evo, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(20, earH * 0.55, 4.2, 8 + evo, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(-9, -22);
  ctx.lineTo(-7, -10);
  ctx.lineTo(-3, -20);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -22);
  ctx.lineTo(7, -10);
  ctx.lineTo(3, -20);
  ctx.fill();

  oval(ctx, 0, 6, 18 + evo * 1.6, 15 + evo, blue, ink, 1.4);
  shine(ctx, -6, 0, 5, 3.5);
  oval(ctx, 0, 11, 11, 8, evo >= 4 ? "#fff" : "#d7f4ff");

  const angry = evo >= 2;
  ctx.fillStyle = evo >= 2 ? "#ff1a1a" : "#111";
  ctx.beginPath();
  ctx.ellipse(-6.2, 0, 4.4, angry ? 6 : 5.2, 0, 0, Math.PI * 2);
  ctx.ellipse(6.2, 0, 4.4, angry ? 6 : 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-7.4, -2.6, 2, 2.2);
  ctx.fillRect(5.4, -2.6, 2, 2.2);
  ctx.fillStyle = "#111";
  ctx.fillRect(-4, 9, 8, 2.6);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-3.2, 8, 1.8, 3);
  ctx.fillRect(1.4, 8, 1.8, 3);

  if (evo >= 2) {
    ctx.strokeStyle = blue;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.lineTo(-28, -6);
    ctx.moveTo(18, 4);
    ctx.lineTo(28, -6);
    ctx.stroke();
    ctx.fillStyle = "#cfe9ff";
    ctx.beginPath();
    ctx.moveTo(-28, -6);
    ctx.lineTo(-34, -10);
    ctx.lineTo(-26, -2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(28, -6);
    ctx.lineTo(34, -10);
    ctx.lineTo(26, -2);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.lineTo(-22, 22);
    ctx.moveTo(10, 16);
    ctx.lineTo(22, 22);
    ctx.stroke();
  }
  if (evo >= 3) {
    oval(ctx, 0, -18, 5, 4, "#8ad4ff", ink, 1);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-1, -28, 2, 10);
    ctx.strokeStyle = "#cfe9ff";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(-26, 14);
    ctx.moveTo(16, 8);
    ctx.lineTo(26, 14);
    ctx.stroke();
    oval(ctx, 0, 4, 20, 8, "rgba(180,230,255,.35)");
  }
  if (evo >= 4) {
    ctx.strokeStyle = "rgba(180,240,255,.9)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 4, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 4, 30, 0.2, Math.PI - 0.2);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const a = t / 7 + i * 1.2;
      oval(ctx, Math.cos(a) * 28, Math.sin(a) * 16, 2, 2, "#fff");
    }
  }
}

function drawPikachu(ctx, p, t, evo) {
  const body = evo >= 4 ? "#fff8c4" : evo >= 3 ? "#ffe14a" : "#ffd000";
  const ink = "#3a2208";
  const s = 1 + evo * 0.08;
  ctx.scale(s, s);
  if (evo >= 2) {
    ctx.strokeStyle = "rgba(255,230,80,.55)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3 + evo; i++) {
      const a = t / 6 + i * 1.1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * (16 + evo * 3), Math.sin(a) * (10 + evo * 2));
      ctx.stroke();
    }
  }
  ctx.strokeStyle = body;
  ctx.lineWidth = 5 + evo;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.lineTo(18, -2);
  ctx.lineTo(14, 10);
  ctx.lineTo(24, 4);
  ctx.stroke();
  ctx.fillStyle = evo >= 2 ? "#fff36a" : "#222";
  ctx.beginPath();
  ctx.moveTo(22, 2);
  ctx.lineTo(32, -6);
  ctx.lineTo(26, 8);
  ctx.fill();
  oval(ctx, 0, 8, 13, 11, body, ink, 1.3);
  oval(ctx, 0, 11, 8.5, 7, "rgba(255,255,255,.18)");
  oval(ctx, 0, -6, 12, 11, body, ink, 1.3);
  shine(ctx, -5, -9, 4.2, 2.6);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-7, -12);
  ctx.lineTo(-9, -32 - evo * 2);
  ctx.lineTo(-2, -12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, -12);
  ctx.lineTo(9, -32 - evo * 2);
  ctx.lineTo(2, -12);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(-9, -32 - evo * 2);
  ctx.lineTo(-4, -32 - evo * 2);
  ctx.lineTo(-6.5, -24);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -32 - evo * 2);
  ctx.lineTo(4, -32 - evo * 2);
  ctx.lineTo(6.5, -24);
  ctx.fill();
  // cheek glow
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "rgba(255,80,90,.5)";
  ctx.beginPath();
  ctx.arc(-9, 0, 5.6 + evo * 0.4, 0, Math.PI * 2);
  ctx.arc(9, 0, 5.6 + evo * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#e23b3d";
  ctx.beginPath();
  ctx.arc(-9, 0, 3.4 + evo * 0.4, 0, Math.PI * 2);
  ctx.arc(9, 0, 3.4 + evo * 0.4, 0, Math.PI * 2);
  ctx.fill();
  eye(ctx, -4, -7, 2.4, 2.6);
  eye(ctx, 4, -7, 2.4, 2.6);
  // little smile
  ctx.strokeStyle = "#5a3208";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-2.6, -1.5);
  ctx.quadraticCurveTo(0, 1.2, 2.6, -1.5);
  ctx.stroke();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, -3, 1.3, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 3) {
    ctx.strokeStyle = "#fff36a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.lineTo(-22, -18);
    ctx.lineTo(-14, -12);
    ctx.stroke();
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
  else drawDinoBase(ctx, t);
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

/** Evo 1 — classic bipedal pocket dino: long body, modest head, soft crest. */
function drawDinoBase(ctx, t) {
  const green = "#5ecf6a";
  const belly = "#d8f8c8";
  const ink = "#1e4a22";
  const crest = "#3bb85a";
  const wag = Math.sin(t / 7) * 2.4;

  // Horizontal tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 3);
  ctx.quadraticCurveTo(-12, 5 + wag * 0.3, -15, 2 + wag);
  ctx.stroke();

  // Digging legs (rear-weighted)
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-1, 5); ctx.lineTo(-2.5, 9);
  ctx.moveTo(4, 5); ctx.lineTo(5.5, 9);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-2.8, 9.2, 2.4, 1.15, 0, 0, Math.PI * 2);
  ctx.ellipse(5.8, 9.2, 2.4, 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long horizontal torso
  dinoOval(ctx, 1, 3.2, 7.4, 4.6, green, ink, 1.05);
  dinoOval(ctx, 1.2, 4.4, 4.2, 2.4, belly);

  // Stubby arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 1.5); ctx.lineTo(-5, 3.5);
  ctx.moveTo(5, 1.5); ctx.lineTo(8, 3.2);
  ctx.stroke();

  // Head forward on short neck
  dinoOval(ctx, 7.2, -2.2, 5.2, 4.4, green, ink, 1.05);
  dinoOval(ctx, 9.2, -1.2, 3.2, 2.2, belly);

  // Soft 2-spike crest
  ctx.fillStyle = crest;
  ctx.beginPath();
  ctx.moveTo(4.5, -5); ctx.lineTo(5.5, -8.2); ctx.lineTo(6.8, -5); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6.5, -5.2); ctx.lineTo(7.6, -8.8); ctx.lineTo(8.8, -5); ctx.fill();

  dinoEye(ctx, 6.2, -2.8, 1.6, 1.75);
  dinoEye(ctx, 9.2, -2.8, 1.6, 1.75);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(10.8, -1.2, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.arc(8.6, -0.2, 1.5, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,140,160,.38)";
  ctx.beginPath();
  ctx.ellipse(5.4, -0.8, 1.3, 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Evo 2 — Dino Pico: tall sail crest, upright neck, whip tail with blade tip. */
function drawDinoPico(ctx, t) {
  const green = "#2a9a48";
  const belly = "#c8f0b8";
  const ink = "#0e3a1a";
  const sail = "#7ee08a";
  const horn = "#b8ff6a";
  const wag = Math.sin(t / 6) * 3;

  // Long whip tail + blade tip
  ctx.strokeStyle = green;
  ctx.lineWidth = 3.6;
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

  // Tall rear legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-1.5, 4); ctx.lineTo(-3, 10);
  ctx.moveTo(3.5, 4); ctx.lineTo(5, 10);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.4, 10.3, 2.8, 1.3, 0, 0, Math.PI * 2);
  ctx.ellipse(5.4, 10.3, 2.8, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upright body
  dinoOval(ctx, 0.5, 2.5, 6.2, 6.4, green, ink, 1.1);
  dinoOval(ctx, 0.8, 4, 3.4, 3.2, belly);

  // Back sail (tall triangles) — signature silhouette
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
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4.5, 0); ctx.lineTo(-7.5, 2.5);
  ctx.moveTo(4.5, 0); ctx.lineTo(7.5, 2.2);
  ctx.stroke();

  // High neck + head
  dinoOval(ctx, 2.5, -5.5, 3.2, 3.6, green, ink, 1);
  dinoOval(ctx, 5.5, -7.2, 5.4, 4.2, green, ink, 1.1);
  dinoOval(ctx, 7.4, -6.4, 3.2, 2.2, belly);

  // Tall "pico" horn — unmistakable
  ctx.fillStyle = horn;
  ctx.beginPath();
  ctx.moveTo(4.2, -10);
  ctx.lineTo(5.6, -18);
  ctx.lineTo(7.4, -10.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  dinoEye(ctx, 4.2, -7.6, 1.7, 1.9, true);
  dinoEye(ctx, 7.4, -7.6, 1.7, 1.9, true);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(9.2, -5.8, 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Soft green ring
  ctx.strokeStyle = "rgba(126,224,138,.5)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(2, -2, 11, 0, Math.PI * 2);
  ctx.stroke();
}

/** Evo 3 — Dino Rex: massive jaws, tiny arms, thick legs, heavy predator. */
function drawDinoRex(ctx, t) {
  const green = "#1a6b3a";
  const belly = "#9ed4a0";
  const ink = "#0a2814";
  const gum = "#4a2030";
  const tooth = "#f4ffe8";
  const wag = Math.sin(t / 8) * 1.6;

  // Thick counterbalance tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 5.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.quadraticCurveTo(-12, 4 + wag * 0.3, -17, 0 + wag);
  ctx.stroke();
  // Tail ridges
  ctx.fillStyle = "#2a8a48";
  for (let i = 0; i < 3; i++) {
    const tx = -8 - i * 3;
    ctx.beginPath();
    ctx.moveTo(tx, 1 + wag * 0.2);
    ctx.lineTo(tx - 0.6, -2 + wag * 0.2);
    ctx.lineTo(tx + 1.4, 1.5 + wag * 0.2);
    ctx.fill();
  }

  // Massive tree-trunk legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 4.4;
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
  dinoOval(ctx, 1, 2.2, 8.2, 6.8, green, ink, 1.2);
  dinoOval(ctx, 1.4, 4, 4.8, 3.6, belly);

  // Comically tiny T-rex arms
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

  // HUGE head — silhouette hero
  dinoOval(ctx, 8.5, -4.5, 8.5, 6.4, green, ink, 1.25);
  // Snout
  dinoOval(ctx, 14.5, -3.2, 5.2, 3.6, green, ink, 1.1);
  dinoOval(ctx, 14.2, -2.2, 3.6, 2.2, belly);

  // Open jaw wedge
  ctx.fillStyle = gum;
  ctx.beginPath();
  ctx.moveTo(10, -0.5);
  ctx.lineTo(18, 0.5);
  ctx.lineTo(12, 3.5);
  ctx.closePath();
  ctx.fill();
  // Teeth
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
  ctx.fillStyle = "#2a9a48";
  ctx.beginPath();
  ctx.moveTo(4, -8);
  ctx.lineTo(7, -12.5);
  ctx.lineTo(10, -8.5);
  ctx.closePath();
  ctx.fill();

  dinoEye(ctx, 6.5, -5.5, 2.2, 2.4, true);
  dinoEye(ctx, 11.2, -5.2, 2.0, 2.2, true);

  // Nostril
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(17.2, -3.6, 0.7, 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Menace particles
  ctx.fillStyle = "#7ee08a";
  for (let i = 0; i < 3; i++) {
    const a = t / 10 + i * 2.1;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 12, Math.sin(a) * 7 - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Evo 4 — DINO GOD: winged celestial dino, horn crown, ribbon tail, aura. */
function drawDinoGod(ctx, t) {
  const body = "#c8ff7a";
  const belly = "#f4ffe8";
  const ink = "#3a6a28";
  const gold = "#ffe66a";
  const wing = "rgba(180,255,140,.85)";
  const flap = Math.sin(t / 5) * 4;
  const wag = Math.sin(t / 6) * 2.5;

  // Soft halo
  ctx.save();
  ctx.globalAlpha = 0.35 + Math.sin(t / 8) * 0.08;
  dinoOval(ctx, 1, 0, 16, 13, "rgba(255,244,160,.45)");
  ctx.restore();

  // Twin wings — huge silhouette change
  ctx.fillStyle = wing;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.2;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-14, -10 + flap, -22, -2 + flap * 0.5);
  ctx.quadraticCurveTo(-16, 2 + flap * 0.3, -8, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(4, -2);
  ctx.quadraticCurveTo(16, -12 - flap, 24, -4 - flap * 0.5);
  ctx.quadraticCurveTo(18, 1 - flap * 0.3, 10, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Wing bones
  ctx.strokeStyle = "rgba(255,230,120,.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -2); ctx.lineTo(-18, -4 + flap);
  ctx.moveTo(4, -2); ctx.lineTo(20, -6 - flap);
  ctx.stroke();

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

  // Graceful legs
  ctx.strokeStyle = body;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-1, 5); ctx.lineTo(-2.2, 10);
  ctx.moveTo(4, 5); ctx.lineTo(5.4, 10);
  ctx.stroke();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-2.5, 10.3, 2.4, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.6, 10.3, 2.4, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Luminous body
  dinoOval(ctx, 1, 2.5, 7.2, 5.8, body, ink, 1.15);
  dinoOval(ctx, 1.2, 3.8, 4.2, 3, belly);

  // Arms reaching
  ctx.strokeStyle = body;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-5, 0.5); ctx.lineTo(-9, -1);
  ctx.moveTo(6, 0.5); ctx.lineTo(10, -1.5);
  ctx.stroke();

  // Noble head
  dinoOval(ctx, 6.5, -4.5, 6.2, 5.2, body, ink, 1.15);
  dinoOval(ctx, 9.2, -3.4, 3.6, 2.6, belly);

  // Triple horn crown
  ctx.fillStyle = gold;
  const horns = [[3.5, -8, -14], [6.5, -9, -16.5], [9.5, -8, -13.5]];
  for (const [hx, hy, tip] of horns) {
    ctx.beginPath();
    ctx.moveTo(hx - 1.2, hy);
    ctx.lineTo(hx, tip);
    ctx.lineTo(hx + 1.2, hy);
    ctx.closePath();
    ctx.fill();
  }

  dinoEye(ctx, 4.8, -5, 1.8, 2);
  dinoEye(ctx, 8.6, -5, 1.8, 2);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(11.2, -2.8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(8.4, -1.6, 1.6, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Orbiting stars
  for (let i = 0; i < 5; i++) {
    const a = t / 7 + i * 1.25;
    const sx = Math.cos(a) * 13;
    const sy = Math.sin(a) * 9 - 1;
    ctx.fillStyle = i % 2 ? "#fff8c8" : gold;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const ang = -Math.PI / 2 + k * ((Math.PI * 2) / 5);
      const br = ang + Math.PI / 5;
      const r = 1.8;
      if (k === 0) ctx.moveTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
      else ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
      ctx.lineTo(sx + Math.cos(br) * r * 0.4, sy + Math.sin(br) * r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawCat(ctx, p, t, evo) {
  const fur = evo >= 4 ? "#fff4fc" : evo >= 3 ? "#ffd0ee" : evo >= 2 ? "#ff8ad4" : "#ffb6e4";
  const ink = "#5a2040";
  const pink = "#ff7ac2";
  const deep = "#ff4da0";
  const s = 1 + evo * 0.06;
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ---- Curled cat tail (whips gently) ----
  const tails = evo >= 4 ? 3 : 1;
  const tw = Math.sin(t / 12) * 3;
  for (let i = 0; i < tails; i++) {
    const off = (i - (tails - 1) / 2) * 9;
    ctx.strokeStyle = fur;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(11, 16);
    ctx.quadraticCurveTo(26 + off, 14 + tw, 24 + off, 0 + tw);
    ctx.quadraticCurveTo(22 + off, -10 + tw, 13 + off, -8 + tw);
    ctx.stroke();
    // tail tip
    ctx.fillStyle = evo >= 2 ? "#fff" : deep;
    ctx.beginPath();
    ctx.arc(13 + off, -8 + tw, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Sitting body ----
  oval(ctx, 0, 13, 12, 12, fur, ink, 1.3);
  oval(ctx, 0, 17, 7.5, 6, "rgba(255,255,255,.30)");
  // front paws
  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  for (const px of [-6, 6]) {
    ctx.beginPath();
    ctx.ellipse(px, 22, 4.6, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // toe beans
  ctx.fillStyle = pink;
  for (const px of [-6, 6]) {
    ctx.beginPath();
    ctx.ellipse(px, 22, 1.6, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Cat ears (wide base, ON TOP of head) drawn BEFORE head ----
  function catEar(dir) {
    const bx = dir * 8;           // base center on the skull
    ctx.fillStyle = fur;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 8, -13);        // inner base
    ctx.lineTo(bx + dir * 3, -30);        // pointed tip
    ctx.lineTo(bx + dir * 9, -14);        // outer base (wide)
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // pink inner ear
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 4, -14.5);
    ctx.lineTo(bx + dir * 2.5, -26);
    ctx.lineTo(bx + dir * 5.5, -14.5);
    ctx.closePath();
    ctx.fill();
  }
  catEar(-1);
  catEar(1);

  // ---- Round head ----
  oval(ctx, 0, -6, 14, 12.5, fur, ink, 1.3);
  shine(ctx, -6, -11, 4.4, 2.8);

  // tabby forehead stripes
  ctx.strokeStyle = deep;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -16); ctx.lineTo(0, -12);
  ctx.moveTo(-4, -15.5); ctx.lineTo(-3, -12.5);
  ctx.moveTo(4, -15.5); ctx.lineTo(3, -12.5);
  ctx.stroke();

  // ---- Whiskers: 3 long per side ----
  ctx.strokeStyle = "rgba(90,32,64,.7)";
  ctx.lineWidth = 1;
  const wk = Math.sin(t / 18) * 0.8;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 5, -3);  ctx.lineTo(dir * 22, -7 + wk);
    ctx.moveTo(dir * 5, -1);  ctx.lineTo(dir * 23, -1);
    ctx.moveTo(dir * 5, 1);   ctx.lineTo(dir * 22, 5 - wk);
    ctx.stroke();
  }

  // ---- Big kitten eyes ----
  eye(ctx, -5, -7, 3.2, 3.8);
  eye(ctx, 5, -7, 3.2, 3.8);

  // ---- Pink nose + ω cat mouth ----
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, -1.5);
  ctx.lineTo(-2.4, -3.4);
  ctx.lineTo(2.4, -3.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, -1.5); ctx.lineTo(0, 0.5);
  ctx.arc(-1.8, 0.5, 1.8, 0, Math.PI);
  ctx.moveTo(0, 0.5);
  ctx.arc(1.8, 0.5, 1.8, 0, Math.PI);
  ctx.stroke();

  // ---- Cheek blush ----
  ctx.fillStyle = "rgba(255,120,180,.45)";
  ctx.beginPath();
  ctx.ellipse(-9, -3, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(9, -3, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---- Evo flourishes ----
  if (evo >= 2) {
    ctx.strokeStyle = "rgba(255,180,220,.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -6, 17, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (evo >= 3) {
    for (let i = 0; i < 4; i++) star(ctx, Math.cos(t / 10 + i) * 19, Math.sin(t / 10 + i) * 13 - 6, 2.2, "#fff");
  }
}
