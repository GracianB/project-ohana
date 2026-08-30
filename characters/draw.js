function aura(ctx, r, color, t) {
  ctx.save();
  ctx.globalAlpha = 0.18 + Math.sin(t / 9) * 0.08;
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
export function drawCharacter(ctx, p, cam, t) {
  const x = p.x - cam.x, y = p.y - cam.y, evo = p.evo || 0;
  const run = p.grounded ? Math.sin(t * 0.35 * (1 + Math.abs(p.vx))) : 0;
  const bob = run * Math.min(2.4, Math.abs(p.vx) * 0.4);
  const leg = run * 5;
  ctx.save();
  ctx.translate(x + p.w / 2, y + p.h / 2 + bob);
  ctx.scale(p.facing || 1, 1);
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath();
  ctx.ellipse(0, p.h / 2 + 3, p.w * 0.42, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 1) aura(ctx, p.w * (1.25 + evo * 0.35), p.color, t);
  ctx.strokeStyle = "rgba(0,0,0,.4)";
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-7, 11); ctx.lineTo(-7 - leg, 19);
  ctx.moveTo(7, 11); ctx.lineTo(7 + leg, 19);
  ctx.stroke();
  const drawers = { lilo: drawLilo, stitch: drawStitch, pikachu: drawPikachu, dragon: drawMushu, cat: drawCat };
  (drawers[p.id] || drawLilo)(ctx, p, t, evo);
  ctx.restore();
}
function eye(ctx, x, y, w, h) {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(x + w * 0.15, y, w * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - w * 0.2, y - h * 0.25, w * 0.18, 0, Math.PI * 2); ctx.fill();
}
function drawLilo(ctx, p, t, evo) {
  ctx.scale(1 + evo * 0.14, 1 + evo * 0.14);
  ctx.fillStyle = "#1a0e08"; ctx.beginPath(); ctx.ellipse(0, -17, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f0c2a0"; ctx.beginPath(); ctx.arc(0, -10, 9.5, 0, Math.PI * 2); ctx.fill();
  eye(ctx, -4, -11, 2.4, 2.6); eye(ctx, 4, -11, 2.4, 2.6);
  ctx.fillStyle = evo >= 2 ? "#ffd36a" : evo >= 1 ? "#ff5a7a" : "#e11d2e";
  ctx.beginPath(); ctx.moveTo(-13, -1); ctx.lineTo(13, -1); ctx.lineTo(11, 20); ctx.lineTo(-11, 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(-3.5, 4, 7, 6);
  if (evo >= 1) { ctx.fillStyle = "#37c6c0"; ctx.beginPath(); ctx.arc(0, -22, 4 + evo, 0, Math.PI * 2); ctx.fill(); }
}
function drawStitch(ctx, p, t, evo) {
  const s = 1 + evo * 0.16; ctx.scale(s, s);
  const blue = evo >= 2 ? "#7ec8ff" : evo >= 1 ? "#1a4dff" : "#3d9bff";
  ctx.fillStyle = blue;
  ctx.beginPath(); ctx.moveTo(-12, -6); ctx.quadraticCurveTo(-26, -34, -3, -12); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12, -6); ctx.quadraticCurveTo(26, -34, 3, -12); ctx.fill();
  ctx.fillStyle = "#f3b6c8";
  ctx.beginPath(); ctx.ellipse(-17, -20, 3.6, 7, -0.4, 0, Math.PI * 2); ctx.ellipse(17, -20, 3.6, 7, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = blue; ctx.beginPath(); ctx.ellipse(0, 4, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c4f0ff"; ctx.beginPath(); ctx.ellipse(0, 8, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#ff2a2a" : "#111";
  ctx.beginPath(); ctx.ellipse(-6, 0, 3.6, 5, 0, 0, Math.PI * 2); ctx.ellipse(6, 0, 3.6, 5, 0, 0, Math.PI * 2); ctx.fill();
}
function drawPikachu(ctx, p, t, evo) {
  const s = 1 + evo * 0.18; ctx.scale(s, s);
  ctx.fillStyle = evo >= 2 ? "#fff36a" : evo >= 1 ? "#e08a20" : "#ffe44a";
  ctx.beginPath(); ctx.ellipse(0, 4, 16, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-13, -26); ctx.lineTo(-2, -10); ctx.fill();
  ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(13, -26); ctx.lineTo(2, -10); ctx.fill();
  ctx.fillStyle = "#111"; ctx.fillRect(-13, -26, 4, 4); ctx.fillRect(9, -26, 4, 4);
  eye(ctx, -5, 1, 2.3, 2.5); eye(ctx, 5, 1, 2.3, 2.5);
  ctx.fillStyle = "#e23"; ctx.beginPath(); ctx.arc(-9, 7, 2.8, 0, Math.PI * 2); ctx.arc(9, 7, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = evo >= 1 ? "#fff36a" : "#c90"; ctx.lineWidth = 3.6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(14, 3); ctx.quadraticCurveTo(26, -10, 22, 10); ctx.quadraticCurveTo(20, 16, 28, 14); ctx.stroke();
}
function drawMushu(ctx, p, t, evo) {
  const s = 1 + evo * 0.2; ctx.scale(s, s);
  const red = evo >= 2 ? "#8b1208" : evo >= 1 ? "#d61f12" : "#e23a1c";
  const gold = evo >= 2 ? "#ffd36a" : "#f2c14a";
  const flap = Math.sin(t / 7) * (evo >= 1 ? 8 : 4);
  ctx.fillStyle = red;
  ctx.beginPath(); ctx.moveTo(-4, 8); ctx.quadraticCurveTo(-18, 16 + flap, -28, 6); ctx.quadraticCurveTo(-16, 22, -2, 14); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-2, 8, 13, 9, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gold; ctx.beginPath(); ctx.ellipse(-1, 10, 8, 5, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = red; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(-14, 2); ctx.moveTo(-4, 7); ctx.lineTo(-10, 1); ctx.stroke();
  ctx.fillStyle = red; ctx.beginPath(); ctx.ellipse(8, -2, 14, 12, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gold; ctx.beginPath(); ctx.ellipse(10, 2, 8, 6, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = red;
  ctx.beginPath(); ctx.moveTo(2, -12); ctx.lineTo(-1, -20); ctx.lineTo(6, -13); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(16, -20); ctx.lineTo(16, -11); ctx.fill();
  ctx.fillStyle = "#fff8d0";
  ctx.beginPath(); ctx.ellipse(5, -4, 4.2, 5, -0.2, 0, Math.PI * 2); ctx.ellipse(13, -4, 4.2, 5, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a0a04"; ctx.beginPath(); ctx.arc(6, -4, 1.8, 0, Math.PI * 2); ctx.arc(14, -4, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(5.2, -5.2, 0.7, 0, Math.PI * 2); ctx.arc(13.2, -5.2, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a0a08"; ctx.beginPath(); ctx.ellipse(18, 2, 3.2, 2.2, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(24, -2); ctx.moveTo(16, 3); ctx.lineTo(24, 5); ctx.stroke();
  if (evo >= 1) {
    ctx.fillStyle = "rgba(255,140,40,.85)";
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-22, -18 + flap, -8, 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(8, -22 + flap, 16, 2); ctx.fill();
  }
  if (evo >= 2) {
    ctx.strokeStyle = gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-2, -8); ctx.lineTo(8, 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,80,20,.7)";
    ctx.beginPath(); ctx.moveTo(18, 2); ctx.lineTo(30, -2); ctx.lineTo(22, 6); ctx.fill();
  }
}
function drawCat(ctx, p, t, evo) {
  const s = 1 + evo * 0.16; ctx.scale(s, s);
  const fur = evo >= 2 ? "#f7f3ff" : evo >= 1 ? "#3a2048" : "#ffb6e4";
  ctx.fillStyle = fur; ctx.beginPath(); ctx.arc(0, 3, 13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-11, -4); ctx.lineTo(-10, -22); ctx.lineTo(-2, -6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11, -4); ctx.lineTo(10, -22); ctx.lineTo(2, -6); ctx.fill();
  eye(ctx, -4, 2, 2.2, 2.6); eye(ctx, 4, 2, 2.2, 2.6);
  ctx.fillStyle = "#ff7aa8"; ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-2, 7); ctx.lineTo(2, 7); ctx.fill();
  ctx.strokeStyle = evo >= 2 ? "#c9f" : "#ff7ac8"; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(11, 6); ctx.quadraticCurveTo(22, -2, 18, 16); ctx.stroke();
}
