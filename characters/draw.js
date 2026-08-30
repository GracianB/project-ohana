function aura(ctx, x, y, r, color, t) {
  ctx.save();
  ctx.globalAlpha = 0.18 + Math.sin(t / 10) * 0.08;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCharacter(ctx, p, cam, t) {
  const x = p.x - cam.x;
  const y = p.y - cam.y;
  const dir = p.facing;
  const evo = p.evo || 0;
  ctx.save();
  ctx.translate(x + p.w / 2, y + p.h / 2);
  ctx.scale(dir, 1);
  if (evo >= 1) aura(ctx, 0, 0, p.w * (1.1 + evo * 0.25), p.color, t);
  const drawers = { lilo: drawLilo, stitch: drawStitch, pikachu: drawPikachu, dragon: drawDragon, cat: drawCat };
  (drawers[p.id] || drawLilo)(ctx, p, t, evo);
  ctx.restore();
}

function drawLilo(ctx, p, t, evo) {
  const scale = 1 + evo * 0.12;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f3c7a5";
  ctx.fillRect(-8, -16, 16, 14);
  ctx.fillStyle = "#2b1a12";
  ctx.fillRect(-10, -20, 20, 7);
  ctx.fillStyle = "#d21f2b";
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.lineTo(12, -2);
  ctx.lineTo(10, 18);
  ctx.lineTo(-10, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-5, -12, 3, 3);
  ctx.fillRect(2, -12, 3, 3);
  ctx.fillStyle = "#222";
  ctx.fillRect(-4, -11, 2, 2);
  ctx.fillRect(3, -11, 2, 2);
  if (evo >= 2) {
    ctx.strokeStyle = "#ffd27a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawStitch(ctx, p, t, evo) {
  const scale = 1 + evo * 0.18;
  ctx.scale(scale, scale);
  ctx.fillStyle = evo >= 1 ? "#1a3cff" : "#4aa3ff";
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#8cf" : "#9ad8ff";
  ctx.beginPath();
  ctx.ellipse(0, 6, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#1a3cff" : "#4aa3ff";
  ctx.beginPath();
  ctx.moveTo(-10, -6);
  ctx.quadraticCurveTo(-22, -28, -6, -10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.quadraticCurveTo(22, -28, 6, -10);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#ff3030" : "#111";
  ctx.beginPath();
  ctx.ellipse(-5, 0, 3.2, 4.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5, 0, 3.2, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 2) {
    ctx.fillStyle = "#2a6cff";
    ctx.fillRect(-22, 2, 8, 4);
    ctx.fillRect(14, 2, 8, 4);
  }
}

function drawPikachu(ctx, p, t, evo) {
  const scale = 1 + evo * 0.2;
  ctx.scale(scale, scale);
  ctx.fillStyle = evo >= 1 ? "#e0a000" : "#ffe14a";
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-11, -22);
  ctx.lineTo(-4, -10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.lineTo(11, -22);
  ctx.lineTo(4, -10);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-11, -22, 3, 3);
  ctx.fillRect(8, -22, 3, 3);
  ctx.fillStyle = "#e23";
  ctx.beginPath();
  ctx.arc(-8, 4, 2.4, 0, Math.PI * 2);
  ctx.arc(8, 4, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-4, 0, 2, 2);
  ctx.fillRect(2, 0, 2, 2);
  ctx.strokeStyle = evo >= 1 ? "#fff36a" : "#c90";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.quadraticCurveTo(22, -6, 18, 10);
  ctx.quadraticCurveTo(16, 16, 22, 14);
  ctx.stroke();
  if (evo >= 1) {
    ctx.strokeStyle = "#9cf";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-16 + i * 10, -18);
      ctx.lineTo(-10 + i * 10, 18);
      ctx.stroke();
    }
  }
}

function drawDragon(ctx, p, t, evo) {
  const scale = 1 + evo * 0.22;
  ctx.scale(scale, scale);
  const body = evo >= 2 ? "#7a1400" : evo >= 1 ? "#e24a12" : "#ff7a3a";
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 4, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, -2, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = evo >= 2 ? "#3a0500" : "#c43";
  ctx.beginPath();
  ctx.moveTo(-4, -2);
  ctx.quadraticCurveTo(-18, -22 + Math.sin(t / 8) * 4, -28, 6);
  ctx.lineTo(-4, 8);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(18, -4, 3, 3);
  if (evo >= 1) {
    ctx.fillStyle = "#ffcc55";
    ctx.beginPath();
    ctx.moveTo(24, -2);
    ctx.lineTo(34, 2);
    ctx.lineTo(24, 4);
    ctx.fill();
  }
}

function drawCat(ctx, p, t, evo) {
  const scale = 1 + evo * 0.15;
  ctx.scale(scale, scale);
  ctx.fillStyle = evo >= 1 ? "#ff5cb8" : "#ffb3e0";
  ctx.beginPath();
  ctx.arc(0, 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.lineTo(-8, -18);
  ctx.lineTo(-2, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(8, -18);
  ctx.lineTo(2, -6);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-5, 0, 2, 2);
  ctx.fillRect(3, 0, 2, 2);
  ctx.fillStyle = "#e66";
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(-2, 7);
  ctx.lineTo(2, 7);
  ctx.fill();
  ctx.strokeStyle = evo >= 1 ? "#fff" : "#ff7ac8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.quadraticCurveTo(18, 0, 16, 12);
  ctx.stroke();
}
