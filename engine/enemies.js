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
  else if (e.kind === "phosquito") drawPhosquito(ctx, e, t);
  else if (e.kind === "planta") drawPlanta(ctx, e, t);
  else if (e.kind === "medusa") drawMedusa(ctx, e, t);
  else drawCucaracho(ctx, e, t);
  ctx.filter = "none";
  ctx.fillStyle = "#000"; ctx.fillRect(-e.w / 2, -e.h / 2 - 10, e.w, 5);
  ctx.fillStyle = e.boss ? "#f55" : "#5f5"; ctx.fillRect(-e.w / 2, -e.h / 2 - 10, e.w * Math.max(0, e.hp / e.max), 5);
  ctx.restore();
}

function drawCucaracho(ctx, e, t) {
  const leg = Math.sin(t / 5 + e.x) * 4;
  const s = e.evo ? 1.25 : 1;
  ctx.scale(s, s);
  ctx.fillStyle = e.evo ? "#8a2010" : "#5a3010";
  ctx.beginPath(); ctx.ellipse(0, 3, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = e.evo ? "#c44520" : "#7a4a18";
  ctx.beginPath(); ctx.ellipse(4, 1, 8, 6, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2a1408"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -2); ctx.lineTo(16, -10);
  ctx.moveTo(12, 0); ctx.lineTo(18, -6);
  ctx.stroke();
  ctx.strokeStyle = "#2a1408"; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-8, 6); ctx.lineTo(-14, 12 + leg);
  ctx.moveTo(-2, 8); ctx.lineTo(-6, 14 - leg);
  ctx.moveTo(6, 6); ctx.lineTo(12, 12 + leg);
  ctx.moveTo(2, 8); ctx.lineTo(8, 14 - leg);
  ctx.stroke();
  ctx.fillStyle = "#111"; ctx.fillRect(8, -2, 2.4, 2.4); ctx.fillRect(11, 1, 2.4, 2.4);
}

function drawPhosquito(ctx, e, t) {
  const flap = Math.sin(t / 2.6) * 10;
  const s = e.baby ? 0.78 : 1.15;
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(200,255,240,.55)";
  ctx.beginPath(); ctx.ellipse(-12, -4, 13, 6 + flap * 0.2, -0.35, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, -6, 12, 5 + flap * 0.18, 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(126,231,255,.45)"; ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = "#2a6a4a";
  ctx.beginPath(); ctx.ellipse(0, 3, 9, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#7ee7ff";
  ctx.beginPath(); ctx.arc(-2, 2, 2.2, 0, Math.PI * 2); ctx.arc(3, 2, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-2, 2, 1, 0, Math.PI * 2); ctx.arc(3, 2, 1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1a4030"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(20, 12); ctx.stroke();
  ctx.fillStyle = "#c81e1e";
  ctx.beginPath(); ctx.arc(20, 12, 2.4, 0, Math.PI * 2); ctx.fill();
}

function drawPlanta(ctx, e, t) {
  ctx.fillStyle = "#2a6a28";
  ctx.fillRect(-8, 10, 16, 16);
  ctx.fillStyle = "#3a8a30";
  ctx.beginPath(); ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
  if (!e.up) return;
  const chomp = Math.sin(t / 7) * 3;
  ctx.fillStyle = "#2f8a32";
  ctx.fillRect(-3, -8, 6, 22);
  ctx.fillStyle = "#e23b3d";
  ctx.beginPath(); ctx.ellipse(0, -16, 14, 12 + chomp * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4 - 2, -16);
    ctx.lineTo(i * 4, -8 + (i % 2 ? 2 : 0));
    ctx.lineTo(i * 4 + 2, -16);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-5, -20, 3.2, 0, Math.PI * 2); ctx.arc(5, -20, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-5, -20, 1.4, 0, Math.PI * 2); ctx.arc(5, -20, 1.4, 0, Math.PI * 2); ctx.fill();
}

function drawMedusa(ctx, e, t) {
  const pulse = Math.sin(t / 8 + e.x) * 0.14;
  // soft glow halo
  ctx.fillStyle = "rgba(255,140,215,.16)";
  ctx.beginPath(); ctx.arc(0, -2, 22, 0, Math.PI * 2); ctx.fill();
  // bell (dome)
  const grad = ctx.createLinearGradient(0, -18, 0, 4);
  grad.addColorStop(0, "rgba(255,180,235,.9)");
  grad.addColorStop(1, "rgba(180,120,220,.55)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, -4, 16, 13 - pulse * 6, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(190,245,255,.7)"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, -4, 16, 13 - pulse * 6, 0, Math.PI, 0); ctx.stroke();
  // inner core
  ctx.fillStyle = "rgba(190,245,255,.4)";
  ctx.beginPath(); ctx.arc(0, -6, 6, 0, Math.PI * 2); ctx.fill();
  // tentacles
  ctx.strokeStyle = "rgba(255,150,220,.72)"; ctx.lineWidth = 2; ctx.lineCap = "round";
  for (let i = -2; i <= 2; i++) {
    const tx = i * 5.5;
    ctx.beginPath();
    ctx.moveTo(tx, -2);
    ctx.quadraticCurveTo(tx + Math.sin(t / 6 + i) * 5, 11, tx + Math.sin(t / 5 + i) * 7, 24);
    ctx.stroke();
  }
  ctx.lineCap = "butt";
  // eyes
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-4, -6, 2.4, 0, Math.PI * 2); ctx.arc(4, -6, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#221"; ctx.beginPath(); ctx.arc(-4, -6, 1.1, 0, Math.PI * 2); ctx.arc(4, -6, 1.1, 0, Math.PI * 2); ctx.fill();
}

function drawBoss(ctx, e, t) {
  if (e.dying) {
    const k = Math.max(0.15, e.dying / 96);
    ctx.globalAlpha = 0.35 + k * 0.65;
    ctx.scale(0.6 + k * 0.5, 0.6 + k * 0.5);
    ctx.rotate((96 - e.dying) * 0.04);
  }
  const pulse = e.dying ? 1 : 1 + Math.sin(t / 8) * 0.04;
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
