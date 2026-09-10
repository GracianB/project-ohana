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
  const flap = Math.sin(t / 3.2) * 8;
  const s = e.baby ? 0.72 : 1;
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(180,255,220,.45)";
  ctx.beginPath(); ctx.ellipse(-10, -2, 10, 4 + flap * 0.15, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, -4, 9, 3.5 + flap * 0.12, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a8a6a";
  ctx.beginPath(); ctx.ellipse(0, 2, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1a4030"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(16, 8); ctx.stroke();
  ctx.fillStyle = "#111"; ctx.fillRect(-2, 0, 2.2, 2.2); ctx.fillRect(2, 0, 2.2, 2.2);
  ctx.fillStyle = "#7ee7ff"; ctx.beginPath(); ctx.arc(0, 4, 1.6, 0, Math.PI * 2); ctx.fill();
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
