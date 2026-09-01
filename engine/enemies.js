import { vfxSprite } from "../characters/sprites.js";

export function drawEnemy(ctx, e, cam, t) {
  const x = e.x - cam.x;
  const y = e.y - cam.y;
  ctx.save();
  ctx.translate(x + e.w / 2, y + e.h / 2);
  if (e.flash > 0) ctx.filter = "brightness(2.4)";
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, e.h / 2 + 2, e.w * 0.4, 4, 0, 0, Math.PI * 2); ctx.fill();
  if (e.telegraph) {
    ctx.strokeStyle = "rgba(255,80,40,.7)";
    ctx.beginPath(); ctx.arc(0, 0, e.w * 0.8 + Math.sin(t) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  if (e.kind === "boss") drawBoss(ctx, e, t);
  else if (e.kind === "flyer") drawFlyer(ctx, e, t);
  else if (e.kind === "brute") drawBrute(ctx, e, t);
  else drawCrawler(ctx, e, t);
  ctx.filter = "none";
  ctx.fillStyle = "#000"; ctx.fillRect(-e.w / 2, -e.h / 2 - 10, e.w, 5);
  ctx.fillStyle = e.boss ? "#f55" : "#5f5"; ctx.fillRect(-e.w / 2, -e.h / 2 - 10, e.w * Math.max(0, e.hp / e.max), 5);
  ctx.restore();
}

function drawCrawler(ctx, e, t) {
  const leg = Math.sin(t / 6) * 5;
  ctx.fillStyle = "#3a8a2a";
  ctx.beginPath(); ctx.ellipse(0, 4, 16, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6c3";
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2a5a1a"; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-8, -6); ctx.lineTo(-6, -14);
  ctx.moveTo(8, -6); ctx.lineTo(10, -14);
  ctx.stroke();
  ctx.fillStyle = "#8c4"; ctx.beginPath(); ctx.arc(-6, -14, 2, 0, Math.PI * 2); ctx.arc(10, -14, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2a5a1a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(-16, 14 + leg); ctx.moveTo(10, 8); ctx.lineTo(16, 14 - leg);
  ctx.moveTo(-4, 8); ctx.lineTo(-8, 16 - leg); ctx.moveTo(4, 8); ctx.lineTo(8, 16 + leg);
  ctx.stroke();
  ctx.fillStyle = "#111"; ctx.fillRect(-6, -2, 3, 3); ctx.fillRect(3, -2, 3, 3);
  ctx.fillStyle = "#c33"; ctx.fillRect(-2, 4, 4, 2);
}

function drawFlyer(ctx, e, t) {
  const flap = Math.sin(t / 5) * 10;
  ctx.fillStyle = "#8a4ccf";
  ctx.beginPath(); ctx.ellipse(0, 2, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(180,120,255,.85)";
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-24, -14 + flap, -8, 8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(24, -14 + flap, 8, 8); ctx.fill();
  ctx.fillStyle = "#c9f"; ctx.beginPath(); ctx.ellipse(0, 6, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111"; ctx.fillRect(-5, -1, 3, 3); ctx.fillRect(2, -1, 3, 3);
  ctx.fillStyle = "#f6f"; ctx.fillRect(-2, 3, 4, 2);
}

function drawBrute(ctx, e, t) {
  ctx.fillStyle = "#7a3010";
  ctx.fillRect(-18, 8, 8, 10); ctx.fillRect(10, 8, 8, 10);
  ctx.fillStyle = "#c45a18";
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-16, -12, 32, 26, 5) : ctx.rect(-16, -12, 32, 26); ctx.fill();
  ctx.fillStyle = "#7a3010";
  ctx.fillRect(-16, -16, 10, 10); ctx.fillRect(6, -16, 10, 10);
  ctx.fillStyle = "#ffe66a";
  ctx.fillRect(-8, -4, 5, 5); ctx.fillRect(3, -4, 5, 5);
  ctx.fillStyle = "#111"; ctx.fillRect(-4, 6, 8, 3);
  ctx.fillStyle = "#e8a"; ctx.fillRect(-3, 6, 2, 3);
}

function drawBoss(ctx, e, t) {
  const pulse = 1 + Math.sin(t / 8) * 0.04;
  ctx.scale(pulse, pulse);
  const img = vfxSprite(e.phase === 2 ? "boss-2" : "boss-1");
  if (img) {
    const s = 118;
    ctx.drawImage(img, -s / 2, -s / 2 + 8, s, s);
  } else {
    const body = e.phase === 2 ? "#ff2040" : "#c02040";
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 4, 42, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7a1020";
    ctx.beginPath(); ctx.moveTo(-18, -10); ctx.lineTo(-32, -40); ctx.lineTo(-6, -14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(18, -10); ctx.lineTo(32, -40); ctx.lineTo(6, -14); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-12, -2, 8, 0, Math.PI * 2); ctx.arc(12, -2, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(-12, -2, 3.4, 0, Math.PI * 2); ctx.arc(12, -2, 3.4, 0, Math.PI * 2); ctx.fill();
  }
  if (e.phase === 2) {
    ctx.strokeStyle = "rgba(255,60,30,.65)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 4, 52 + Math.sin(t / 4) * 4, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,180,40,.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 4, 62 + Math.sin(t / 5) * 3, 0, Math.PI * 2); ctx.stroke();
  }
}
