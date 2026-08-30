function aura(ctx, r, color, t) {
  ctx.save();
  ctx.globalAlpha = 0.16 + Math.sin(t / 9) * 0.07;
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function drawCharacter(ctx, p, cam, t) {
  const x = p.x - cam.x, y = p.y - cam.y, evo = p.evo || 0;
  const bob = p.grounded ? Math.sin(t * 0.25 * (1 + Math.abs(p.vx))) * Math.min(2.2, Math.abs(p.vx) * 0.35) : 0;
  ctx.save();
  ctx.translate(x + p.w / 2, y + p.h / 2 + bob);
  ctx.scale(p.facing || 1, 1);
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, p.h / 2 + 2, p.w * 0.42, 5, 0, 0, Math.PI * 2); ctx.fill();
  if (evo >= 1) aura(ctx, p.w * (1.15 + evo * 0.28), p.color, t);
  const drawers = { lilo: drawLilo, stitch: drawStitch, pikachu: drawPikachu, dragon: drawDragon, cat: drawCat };
  (drawers[p.id] || drawLilo)(ctx, p, t, evo);
  ctx.restore();
}
function drawLilo(ctx, p, t, evo) {
  ctx.scale(1 + evo * 0.12, 1 + evo * 0.12);
  ctx.fillStyle = "#2a1810"; ctx.beginPath(); ctx.ellipse(0, -16, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f0c2a0"; ctx.beginPath(); ctx.arc(0, -10, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(-5,-12,3.2,3.2); ctx.fillRect(2,-12,3.2,3.2);
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(-4,-11,1.8,1.8); ctx.fillRect(3,-11,1.8,1.8);
  ctx.fillStyle = "#e11d2e"; ctx.beginPath(); ctx.moveTo(-13,-1); ctx.lineTo(13,-1); ctx.lineTo(11,20); ctx.lineTo(-11,20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(-3,4,6,5);
  if (evo >= 2) { ctx.strokeStyle="#ffd36a"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,24,0,Math.PI*2); ctx.stroke(); }
}
function drawStitch(ctx, p, t, evo) {
  const s = 1 + evo * 0.16; ctx.scale(s,s);
  const blue = evo >= 1 ? "#1c4bff" : "#3d9bff";
  ctx.fillStyle = blue;
  ctx.beginPath(); ctx.moveTo(-11,-8); ctx.quadraticCurveTo(-24,-32,-4,-12); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11,-8); ctx.quadraticCurveTo(24,-32,4,-12); ctx.fill();
  ctx.fillStyle = "#f3b6c8";
  ctx.beginPath(); ctx.ellipse(-16,-18,3.5,6,-0.4,0,Math.PI*2); ctx.ellipse(16,-18,3.5,6,0.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = blue; ctx.beginPath(); ctx.ellipse(0,3,17,13,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = evo>=1?"#9de7ff":"#c4f0ff"; ctx.beginPath(); ctx.ellipse(0,7,10,7,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = evo>=1?"#ff2a2a":"#111"; ctx.beginPath(); ctx.ellipse(-5.5,0,3.4,4.6,0,0,Math.PI*2); ctx.ellipse(5.5,0,3.4,4.6,0,0,Math.PI*2); ctx.fill();
  if (evo>=2) { ctx.fillStyle=blue; ctx.fillRect(-24,2,9,4); ctx.fillRect(15,2,9,4); }
}
function drawPikachu(ctx, p, t, evo) {
  const s=1+evo*0.18; ctx.scale(s,s);
  ctx.fillStyle = evo>=1?"#f0b400":"#ffe44a"; ctx.beginPath(); ctx.ellipse(0,3,15,12,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#222";
  ctx.beginPath(); ctx.moveTo(-8,-8); ctx.lineTo(-12,-24); ctx.lineTo(-3,-10); ctx.fill();
  ctx.beginPath(); ctx.moveTo(8,-8); ctx.lineTo(12,-24); ctx.lineTo(3,-10); ctx.fill();
  ctx.fillStyle="#111"; ctx.fillRect(-12,-24,3.4,3.4); ctx.fillRect(9,-24,3.4,3.4);
  ctx.fillStyle="#e23"; ctx.beginPath(); ctx.arc(-8.5,5,2.6,0,Math.PI*2); ctx.arc(8.5,5,2.6,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=evo>=1?"#fff36a":"#c90"; ctx.lineWidth=3.4; ctx.lineCap="round";
  ctx.beginPath(); ctx.moveTo(13,3); ctx.quadraticCurveTo(24,-8,20,10); ctx.quadraticCurveTo(18,16,26,14); ctx.stroke();
}
function drawDragon(ctx, p, t, evo) {
  const s=1+evo*0.2; ctx.scale(s,s);
  const body = evo>=2?"#7a1400":evo>=1?"#e24a12":"#ff7a3a";
  const flap = Math.sin(t/7)*8;
  ctx.fillStyle=evo>=2?"#3a0500":"#c43";
  ctx.beginPath(); ctx.moveTo(-2,0); ctx.quadraticCurveTo(-22,-24+flap,-34,8); ctx.lineTo(-2,10); ctx.fill();
  ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(0,5,21,13,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(18,-1,11,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#111"; ctx.fillRect(20,-3,3,3);
  ctx.fillStyle="#ffcc55"; ctx.beginPath(); ctx.moveTo(27,-2); ctx.lineTo(38,2); ctx.lineTo(27,5); ctx.fill();
}
function drawCat(ctx, p, t, evo) {
  const s=1+evo*0.14; ctx.scale(s,s);
  ctx.fillStyle=evo>=1?"#ff5cb8":"#ffb6e4"; ctx.beginPath(); ctx.arc(0,3,13,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-11,-4); ctx.lineTo(-9,-20); ctx.lineTo(-2,-6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(11,-4); ctx.lineTo(9,-20); ctx.lineTo(2,-6); ctx.fill();
  ctx.fillStyle="#111"; ctx.fillRect(-5,1,2.2,2.2); ctx.fillRect(3,1,2.2,2.2);
  ctx.fillStyle="#e66"; ctx.beginPath(); ctx.moveTo(0,5); ctx.lineTo(-2.4,8); ctx.lineTo(2.4,8); ctx.fill();
  ctx.strokeStyle=evo>=1?"#fff":"#ff7ac8"; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(11,6); ctx.quadraticCurveTo(20,0,18,14); ctx.stroke();
}
