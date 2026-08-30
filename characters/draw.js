function aura(ctx, r, color, t, extra) {
  ctx.save();
  ctx.globalAlpha = 0.22 + Math.sin(t / 8) * 0.12;
  const g = ctx.createRadialGradient(0, 2, 3, 0, 2, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 2, r, 0, Math.PI * 2);
  ctx.fill();
  if (extra) {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < extra; i++) {
      const a = t / 10 + i * ((Math.PI * 2) / extra);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.45, 3, 0, Math.PI * 2);
      ctx.stroke();
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
  if (evo >= 1) aura(ctx, p.w * (1.5 + evo * 0.55), p.color, t, 3 + evo * 2);
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
    ctx.beginPath();
    ctx.arc(0, 0, 8 + (90 - p.evoBurst) * 1.3, 0, Math.PI * 2);
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
