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
    const h = Math.max(44, p.h * 1.7 + evo * 4);
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
  ctx.scale(0.88 + evo * 0.11, 0.88 + evo * 0.11);
  const drawers = { lilo: drawLilo, stitch: drawStitch, dragon: drawMushu, pikachu: drawPikachu, cat: drawCat, frita: drawKetchup };
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
  oval(ctx, 0, -6, 12, 11, body, ink, 1.3);
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
  ctx.fillStyle = "#e23b3d";
  ctx.beginPath();
  ctx.arc(-9, 0, 3.4 + evo * 0.4, 0, Math.PI * 2);
  ctx.arc(9, 0, 3.4 + evo * 0.4, 0, Math.PI * 2);
  ctx.fill();
  eye(ctx, -4, -7, 2.4, 2.6);
  eye(ctx, 4, -7, 2.4, 2.6);
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.4, 1, 0, 0, Math.PI * 2);
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

function drawMushu(ctx, p, t, evo) {
  const red = evo >= 4 ? "#ffd36a" : evo >= 3 ? "#8b1208" : evo >= 2 ? "#d61f12" : "#ef3a22";
  const dark = "#4a0c08";
  const gold = "#f6c14a";
  const cream = "#ffe9b8";
  const flap = Math.sin(t / 6) * (6 + evo * 3);
  const wag = Math.sin(t / 7) * 6;
  ctx.translate(0, 4);

  ctx.strokeStyle = red;
  ctx.lineWidth = 7 + evo * 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 12);
  ctx.quadraticCurveTo(-28, 20 + wag, evo >= 3 ? -48 : -34, 8 + wag);
  ctx.quadraticCurveTo(evo >= 3 ? -56 : -40, wag, evo >= 3 ? -44 : -32, -2 + wag);
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(evo >= 3 ? -44 : -32, -2 + wag);
  ctx.lineTo(evo >= 3 ? -60 : -44, -10 + wag);
  ctx.lineTo(evo >= 3 ? -48 : -36, 8 + wag);
  ctx.closePath();
  ctx.fill();

  if (evo >= 2) {
    ctx.fillStyle = evo >= 4 ? "rgba(255,210,80,.7)" : "rgba(255,80,20,.6)";
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-36, -28 + flap, 0, 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.quadraticCurveTo(38, -34 + flap, 22, 12);
    ctx.fill();
    if (evo >= 3) {
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.moveTo(-6, 4);
      ctx.lineTo(-22, -16 + flap);
      ctx.lineTo(2, 10);
      ctx.fill();
    }
  }

  oval(ctx, -2, 12, 16 + evo * 2.2, 11 + evo, red, dark, 1.2);
  oval(ctx, 0, 14, 10, 6, cream);
  ctx.strokeStyle = red;
  ctx.lineWidth = 7 + evo;
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.quadraticCurveTo(14, -6, 10, -14);
  ctx.stroke();

  const hx = 12;
  const hy = -18;
  oval(ctx, hx, hy, 15 + evo, 13 + evo * 0.6, red, dark, 1.2);
  oval(ctx, hx + 3, hy + 3, 11, 8, cream);
  shine(ctx, hx - 2, hy - 4, 4, 2.4);
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy - 8);
  ctx.lineTo(hx - 12, hy - (22 + evo * 3));
  ctx.lineTo(hx - 2, hy - 9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx + 4, hy - 10);
  ctx.lineTo(hx + 10, hy - (24 + evo * 3));
  ctx.lineTo(hx + 12, hy - 8);
  ctx.fill();
  if (evo >= 3) {
    ctx.beginPath();
    ctx.moveTo(hx, hy - 10);
    ctx.lineTo(hx + 2, hy - 30);
    ctx.lineTo(hx + 8, hy - 10);
    ctx.fill();
  }
  ctx.fillStyle = "#ff9a18";
  ctx.beginPath();
  ctx.moveTo(hx - 10, hy - 6);
  ctx.quadraticCurveTo(hx - 2, hy - 18, hx + 14, hy - 8);
  ctx.quadraticCurveTo(hx + 2, hy - 6, hx - 10, hy - 6);
  ctx.fill();
  oval(ctx, hx - 4, hy - 2, 4.4, 5.2, "#fff7d8");
  oval(ctx, hx + 8, hy - 2, 4.4, 5.2, "#fff7d8");
  ctx.fillStyle = "#2a0a04";
  ctx.beginPath();
  ctx.arc(hx - 3, hy - 2, 2.1, 0, Math.PI * 2);
  ctx.arc(hx + 9, hy - 2, 2.1, 0, Math.PI * 2);
  ctx.fill();
  oval(ctx, hx + 16, hy + 4, 6 + evo, 3.4, dark);
  ctx.strokeStyle = cream;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(hx + 14, hy + 2);
  ctx.quadraticCurveTo(hx + 28, hy - 6, hx + 32, hy);
  ctx.moveTo(hx + 14, hy + 6);
  ctx.quadraticCurveTo(hx + 28, hy + 12, hx + 32, hy + 8);
  ctx.stroke();

  if (evo >= 2) {
    ctx.fillStyle = gold;
    oval(ctx, -4, 8, 5, 3, gold);
    oval(ctx, 6, 10, 5, 3, gold);
  }
  if (evo >= 4) {
    ctx.fillStyle = "rgba(255,160,40,.95)";
    ctx.beginPath();
    ctx.moveTo(hx + 18, hy + 4);
    ctx.lineTo(hx + 44, hy - 4);
    ctx.lineTo(hx + 34, hy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe36a";
    ctx.beginPath();
    ctx.moveTo(hx + 20, hy + 4);
    ctx.lineTo(hx + 34, hy + 2);
    ctx.lineTo(hx + 28, hy + 8);
    ctx.fill();
    for (let i = 0; i < 4; i++) star(ctx, -20 + i * 12, -28 + Math.sin(t / 6 + i) * 4, 3, "#ffe66a");
  }
}

function drawCat(ctx, p, t, evo) {
  const fur = evo >= 4 ? "#fff4fc" : evo >= 3 ? "#ffd0ee" : evo >= 2 ? "#ff8ad4" : "#ffb6e4";
  const ink = "#5a2040";
  const inner = "#fff";
  const s = 1 + evo * 0.06;
  ctx.scale(s, s);
  const tails = evo >= 4 ? 3 : 1;
  ctx.strokeStyle = fur;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (let i = 0; i < tails; i++) {
    const off = (i - (tails - 1) / 2) * 8;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.quadraticCurveTo(22 + off, -4 + Math.sin(t / 9 + i) * 5, 8 + off, 18);
    ctx.stroke();
  }
  oval(ctx, 0, 12, 14, 11, fur, ink, 1.2);
  oval(ctx, 0, -8, 13, 12, fur, ink, 1.2);
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(-11, -14);
  ctx.lineTo(-14, -28);
  ctx.lineTo(-3, -16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -14);
  ctx.lineTo(14, -28);
  ctx.lineTo(3, -16);
  ctx.fill();
  ctx.fillStyle = "#ff8ad4";
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.lineTo(-12, -24);
  ctx.lineTo(-5, -16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -16);
  ctx.lineTo(12, -24);
  ctx.lineTo(5, -16);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.lineTo(-18, -6);
  ctx.moveTo(-6, 0);
  ctx.lineTo(-18, 2);
  ctx.moveTo(6, -2);
  ctx.lineTo(18, -6);
  ctx.moveTo(6, 0);
  ctx.lineTo(18, 2);
  ctx.stroke();
  eye(ctx, -4.5, -9, 2.8, 3.4, true);
  eye(ctx, 4.5, -9, 2.8, 3.4, true);
  ctx.fillStyle = "#ff4da0";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(-2.4, -1);
  ctx.lineTo(2.4, -1);
  ctx.fill();
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(-10, 14, 4, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 14, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 2) {
    ctx.strokeStyle = "rgba(255,180,220,.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -8, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (evo >= 3) {
    for (let i = 0; i < 4; i++) star(ctx, Math.cos(t / 10 + i) * 18, Math.sin(t / 10 + i) * 12 - 8, 2.2, "#fff");
  }
}
