function aura(ctx, r, color, t, extra) {
  ctx.save();
  ctx.globalAlpha = 0.2 + Math.sin(t / 8) * 0.1;
  const g = ctx.createRadialGradient(0, 4, 4, 0, 4, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 4, r, 0, Math.PI * 2);
  ctx.fill();
  if (extra) {
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = color;
    for (let i = 0; i < extra; i++) {
      const a = t / 9 + i * ((Math.PI * 2) / extra);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.42, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function eye(ctx, x, y, w, h) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(x + w * 0.18, y, w * 0.46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - w * 0.22, y - h * 0.28, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCharacter(ctx, p, cam, t) {
  const x = p.x - cam.x, y = p.y - cam.y, evo = p.evo || 0;
  const run = p.grounded ? Math.sin(t * 0.38 * (1 + Math.abs(p.vx))) : 0;
  const bob = run * Math.min(2.6, Math.abs(p.vx) * 0.45);
  const leg = p.grounded ? run * 6 : 3;
  ctx.save();
  ctx.translate(x + p.w / 2, y + p.h / 2 + bob);
  ctx.scale(p.facing || 1, 1);
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath();
  ctx.ellipse(0, p.h / 2 + 4, p.w * 0.44, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 1) aura(ctx, p.w * (1.35 + evo * 0.45), p.color, t, 3 + evo * 2);
  if (p.evoBurst > 0) {
    const k = p.evoBurst / 90;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = p.color || "#ffe66a";
    ctx.lineWidth = 5 * k;
    ctx.shadowBlur = 18;
    ctx.shadowColor = p.color || "#ffe66a";
    ctx.beginPath();
    ctx.arc(0, 0, 16 + (90 - p.evoBurst) * 2.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    p.evoBurst--;
  }
  if (p.id !== "dragon") {
    ctx.strokeStyle = "rgba(20,10,8,.55)";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 10);
    ctx.lineTo(-8 - leg, 18);
    ctx.moveTo(7, 10);
    ctx.lineTo(8 + leg, 18);
    ctx.stroke();
  }
  const drawers = { lilo: drawLilo, stitch: drawStitch, pikachu: drawPikachu, dragon: drawMushu, cat: drawCat };
  (drawers[p.id] || drawLilo)(ctx, p, t, evo);
  ctx.restore();
}

function drawLilo(ctx, p, t, evo) {
  ctx.scale(1 + evo * 0.14, 1 + evo * 0.14);
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.ellipse(0, -17, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14, -18);
  ctx.quadraticCurveTo(-20, -30, -7, -23);
  ctx.quadraticCurveTo(0, -33, 7, -23);
  ctx.quadraticCurveTo(20, -30, 14, -18);
  ctx.fill();
  ctx.fillStyle = "#f3c4a0";
  ctx.beginPath();
  ctx.arc(0, -9, 9.6, 0, Math.PI * 2);
  ctx.fill();
  eye(ctx, -3.8, -10, 2.4, 2.7);
  eye(ctx, 3.8, -10, 2.4, 2.7);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -6, 3.3, 0.15, Math.PI - 0.15);
  ctx.stroke();
  const dress = evo >= 2 ? "#ffd36a" : evo >= 1 ? "#ff4d78" : "#e0142c";
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(-12, -1);
  ctx.lineTo(12, -1);
  ctx.lineTo(15, 20);
  ctx.lineTo(-15, 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-3.4, 5, 6.8, 6);
  ctx.fillStyle = "#f3c4a0";
  ctx.fillRect(-14, 0, 4, 8);
  ctx.fillRect(10, 0, 4, 8);
  if (evo >= 1) {
    ctx.fillStyle = "#2ec9c0";
    ctx.beginPath();
    ctx.ellipse(0, -26, 6 + evo, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8ad4";
    ctx.beginPath();
    ctx.arc(-8, 2, 2.2, 0, Math.PI * 2);
    ctx.arc(0, 3, 2.2, 0, Math.PI * 2);
    ctx.arc(8, 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (evo >= 2) {
    ctx.strokeStyle = "rgba(255,230,160,.95)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 4, 20, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}

function drawStitch(ctx, p, t, evo) {
  const s = 1 + evo * 0.16;
  ctx.scale(s, s);
  const blue = evo >= 2 ? "#8ad4ff" : evo >= 1 ? "#1b4dff" : "#3d9bff";
  const flap = Math.sin(t / 9) * 2;
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-11, -6);
  ctx.quadraticCurveTo(-26, -40 + flap, -2, -12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -6);
  ctx.quadraticCurveTo(26, -40 + flap, 2, -12);
  ctx.fill();
  ctx.fillStyle = "#f4b6c8";
  ctx.beginPath();
  ctx.ellipse(-17, -24, 3.6, 7.6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(17, -24, 3.6, 7.6, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b1a44";
  ctx.beginPath();
  ctx.moveTo(-8, -20);
  ctx.lineTo(-6, -9);
  ctx.lineTo(-3, -18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -20);
  ctx.lineTo(6, -9);
  ctx.lineTo(3, -18);
  ctx.fill();
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.ellipse(0, 6, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d7f4ff";
  ctx.beginPath();
  ctx.ellipse(0, 10, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#ff2a2a" : "#111";
  ctx.beginPath();
  ctx.ellipse(-5.8, 0, 4, 5.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5.8, 0, 4, 5.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-6.8, -2.4, 1.8, 2);
  ctx.fillRect(4.6, -2.4, 1.8, 2);
  ctx.fillStyle = "#111";
  ctx.fillRect(-3.2, 8.5, 6.4, 2.2);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2.6, 7.6, 1.5, 2.6);
  ctx.fillRect(1.1, 7.6, 1.5, 2.6);
  if (evo >= 1) {
    ctx.strokeStyle = blue;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-17, 6);
    ctx.lineTo(-24, -1);
    ctx.moveTo(17, 6);
    ctx.lineTo(24, -1);
    ctx.stroke();
  }
  if (evo >= 2) {
    ctx.strokeStyle = "#cfe9ff";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-15, 11);
    ctx.lineTo(-26, 16);
    ctx.moveTo(15, 11);
    ctx.lineTo(26, 16);
    ctx.stroke();
  }
}

function drawPikachu(ctx, p, t, evo) {
  const s = 1 + evo * 0.15;
  ctx.scale(s, s);
  const body = evo >= 2 ? "#fff36a" : evo >= 1 ? "#e0891c" : "#ffe44a";
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 6, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(-13, -30);
  ctx.lineTo(-1, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(13, -30);
  ctx.lineTo(1, -8);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-13, -30);
  ctx.lineTo(-8, -30);
  ctx.lineTo(-10.5, -24);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, -30);
  ctx.lineTo(8, -30);
  ctx.lineTo(10.5, -24);
  ctx.fill();
  eye(ctx, -4.8, 1, 2.5, 2.8);
  eye(ctx, 4.8, 1, 2.5, 2.8);
  ctx.fillStyle = "#e23";
  ctx.beginPath();
  ctx.arc(-11, 8, 3.2, 0, Math.PI * 2);
  ctx.arc(11, 8, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, 7, 1.5, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = evo >= 1 ? "#fff36a" : "#c90";
  ctx.lineWidth = 4.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, 5);
  ctx.quadraticCurveTo(28, -14, 22, 8);
  ctx.quadraticCurveTo(20, 17, 30, 14);
  ctx.stroke();
  if (evo >= 1) {
    ctx.strokeStyle = "rgba(255,230,80,.75)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3 + evo; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(Math.cos(t / 5 + i * 1.4) * 22, Math.sin(t / 5 + i * 1.4) * 16);
      ctx.stroke();
    }
  }
}

function drawMushu(ctx, p, t, evo) {
  const red = evo >= 2 ? "#b31410" : evo >= 1 ? "#e02418" : "#ef3a22";
  const dark = "#6a100c";
  const gold = "#f6c14a";
  const cream = "#ffe9b8";
  const flap = Math.sin(t / 6) * (5 + evo * 3);
  const wag = Math.sin(t / 7) * 5;
  ctx.translate(0, 6);
  ctx.strokeStyle = red;
  ctx.lineWidth = 8 + evo;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.quadraticCurveTo(-24, 18 + wag, -34, 8 + wag);
  ctx.quadraticCurveTo(-40, 0 + wag, -32, -2 + wag);
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(-32, -2 + wag);
  ctx.lineTo(-44, -8 + wag);
  ctx.lineTo(-36, 6 + wag);
  ctx.closePath();
  ctx.fill();
  if (evo >= 1) {
    ctx.fillStyle = "rgba(255,80,20,.55)";
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.quadraticCurveTo(-28, -18 + flap, -2, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.quadraticCurveTo(22, -22 + flap, 18, 10);
    ctx.fill();
  }
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.ellipse(-2, 12, 16 + evo * 2, 11 + evo, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(0, 14, 10, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = red;
  ctx.lineWidth = 7 + evo;
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.quadraticCurveTo(12, -4, 8, -12);
  ctx.stroke();
  const hx = 10, hy = -16;
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 15, 13, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(hx + 3, hy + 3, 11, 8, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy - 8);
  ctx.lineTo(hx - 10, hy - 22);
  ctx.lineTo(hx - 2, hy - 9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx + 4, hy - 10);
  ctx.lineTo(hx + 8, hy - 24);
  ctx.lineTo(hx + 10, hy - 8);
  ctx.fill();
  ctx.fillStyle = "#ff9a18";
  ctx.beginPath();
  ctx.moveTo(hx - 10, hy - 6);
  ctx.quadraticCurveTo(hx - 2, hy - 18, hx + 12, hy - 8);
  ctx.quadraticCurveTo(hx + 2, hy - 6, hx - 10, hy - 6);
  ctx.fill();
  ctx.fillStyle = "#fff7d8";
  ctx.beginPath();
  ctx.ellipse(hx - 4, hy - 2, 4.2, 5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 7, hy - 2, 4.2, 5, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a0a04";
  ctx.beginPath();
  ctx.arc(hx - 3, hy - 2, 2, 0, Math.PI * 2);
  ctx.arc(hx + 8, hy - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(hx - 4, hy - 3.4, 0.8, 0, Math.PI * 2);
  ctx.arc(hx + 7, hy - 3.4, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(hx + 14, hy + 4, 6, 3.4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = cream;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hx + 12, hy + 2);
  ctx.quadraticCurveTo(hx + 24, hy - 4, hx + 26, hy);
  ctx.moveTo(hx + 12, hy + 6);
  ctx.quadraticCurveTo(hx + 24, hy + 10, hx + 26, hy + 7);
  ctx.stroke();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(-20, 2);
  ctx.moveTo(-4, 10);
  ctx.lineTo(-14, 4);
  ctx.stroke();
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.arc(-20, 2, 2, 0, Math.PI * 2);
  ctx.arc(-14, 4, 2, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 2) {
    ctx.fillStyle = "rgba(255,90,20,.9)";
    ctx.beginPath();
    ctx.moveTo(hx + 16, hy + 4);
    ctx.lineTo(hx + 34, hy - 2);
    ctx.lineTo(hx + 28, hy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe36a";
    ctx.beginPath();
    ctx.moveTo(hx + 18, hy + 4);
    ctx.lineTo(hx + 28, hy + 2);
    ctx.lineTo(hx + 24, hy + 7);
    ctx.fill();
  }
}

function drawCat(ctx, p, t, evo) {
  const s = 1 + evo * 0.15;
  ctx.scale(s, s);
  const fur = evo >= 2 ? "#f6f1ff" : evo >= 1 ? "#3a2048" : "#ffb6e4";
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(0, 4, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.lineTo(-11, -24);
  ctx.lineTo(-2, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(11, -24);
  ctx.lineTo(2, -6);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#ff5cb8" : "#fff";
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.lineTo(-10, -17);
  ctx.lineTo(-4, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(10, -17);
  ctx.lineTo(4, -6);
  ctx.fill();
  eye(ctx, -4.2, 2, 2.5, 3);
  eye(ctx, 4.2, 2, 2.5, 3);
  ctx.fillStyle = "#ff7aa8";
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(-2.4, 8.4);
  ctx.lineTo(2.4, 8.4);
  ctx.fill();
  ctx.strokeStyle = evo >= 2 ? "#c9f" : "#ff7ac8";
  ctx.lineWidth = 2.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(12, 7);
  ctx.quadraticCurveTo(24, -4, 18, 18);
  ctx.stroke();
  if (evo >= 1) {
    ctx.fillStyle = "#ff4da0";
    ctx.beginPath();
    ctx.arc(0, -8, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (evo >= 2) {
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (let i = 0; i < 6; i++) {
      const a = t / 10 + i * 1.05;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 18, Math.sin(a) * 13, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
