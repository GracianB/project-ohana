function blush(ctx, x, y, s) {
  const k = s || 1;
  ctx.fillStyle = "rgba(255,120,150,.6)";
  ctx.beginPath();
  ctx.ellipse(x - 6 * k, y, 3.2 * k, 2.1 * k, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 6 * k, y, 3.2 * k, 2.1 * k, 0, 0, Math.PI * 2);
  ctx.fill();
}

function wobble(t) {
  return Math.sin(t / 9) * 0.08;
}

export function drawBaby(ctx, p, t) {
  ctx.rotate(wobble(t));
  ctx.scale(0.82, 0.82);
  const id = p.id;
  if (id === "stitch") babyTiko(ctx, t);
  else if (id === "ardilla") babyBellota(ctx, t);
  else if (id === "dragon") babyKoa(ctx, t);
  else if (id === "frita") babyFrita(ctx, t);
  else babyLani(ctx, t);
}

function babyLani(ctx, t) {
  const bob = Math.sin(t / 10) * 1.2;
  ctx.translate(0, 4 + bob);
  ctx.fillStyle = "#ff6a8a";
  ctx.beginPath();
  ctx.ellipse(0, 11, 6.2, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2.2, 8, 4.4, 2.4);
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(0, -7, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4c2a8";
  ctx.beginPath();
  ctx.arc(0, -5, 8.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3.2, -6, 2.8, 0, Math.PI * 2);
  ctx.arc(3.2, -6, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.arc(-2.8, -5.6, 1.35, 0, Math.PI * 2);
  ctx.arc(3.6, -5.6, 1.35, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, -2.2, 0.9);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -1.4, 2.2, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.strokeStyle = "#1a0c08";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 10);
  ctx.lineTo(-6, 14);
  ctx.moveTo(5, 10);
  ctx.lineTo(6, 14);
  ctx.stroke();
}

function babyTiko(ctx, t) {
  const flap = Math.sin(t / 7) * 3;
  ctx.translate(0, 3);
  ctx.fillStyle = "#7ec8ff";
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.quadraticCurveTo(-16, -26 + flap, 0, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.quadraticCurveTo(16, -26 + flap, 0, -8);
  ctx.fill();
  ctx.fillStyle = "#f7c0d0";
  ctx.beginPath();
  ctx.ellipse(-10, -16, 2.4, 5, -0.25, 0, Math.PI * 2);
  ctx.ellipse(10, -16, 2.4, 5, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6bb6ff";
  ctx.beginPath();
  ctx.arc(0, 4, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e9f7ff";
  ctx.beginPath();
  ctx.ellipse(0, 7, 5.2, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(-3.6, 1.2, 3.1, 3.6, 0, 0, Math.PI * 2);
  ctx.ellipse(3.6, 1.2, 3.1, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-4.4, -0.4, 1.4, 1.6);
  ctx.fillRect(2.4, -0.4, 1.4, 1.6);
  blush(ctx, 0, 4, 0.85);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 6.6, 2.2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6bb6ff";
  ctx.fillRect(-3, 12, 2.4, 3);
  ctx.fillRect(0.6, 12, 2.4, 3);
}

function babyFrita(ctx, t) {
  const bob = Math.sin(t / 8) * 1.4;
  ctx.translate(0, 2 + bob);
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath();
  ctx.roundRect(-4.5, -2, 9, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#f0b43a";
  ctx.beginPath();
  ctx.roundRect(-4.5, 8, 9, 6, 3);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.2, 2, 1.8, 0, Math.PI * 2);
  ctx.arc(2.2, 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-1.9, 2.2, 0.9, 0, Math.PI * 2);
  ctx.arc(2.5, 2.2, 0.9, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, 5, 0.7);
  ctx.strokeStyle = "#c47a2a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 6.2, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function babyKoa(ctx, t) {
  const wag = Math.sin(t / 6) * 4;
  ctx.translate(0, 3);
  ctx.fillStyle = "#ffe9b8";
  ctx.beginPath();
  ctx.ellipse(0, 8, 7.5, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d4b07a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 8, 7.5, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#ff6a3a";
  ctx.beginPath();
  ctx.arc(0, -2, 8.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe9b8";
  ctx.beginPath();
  ctx.arc(1, -1, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff7d8";
  ctx.beginPath();
  ctx.arc(-2.2, -3.4, 2.6, 0, Math.PI * 2);
  ctx.arc(3.4, -3.4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a0a04";
  ctx.beginPath();
  ctx.arc(-1.8, -3.1, 1.2, 0, Math.PI * 2);
  ctx.arc(3.8, -3.1, 1.2, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0.5, 0, 0.8);
  ctx.fillStyle = "#f6c14a";
  ctx.beginPath();
  ctx.moveTo(-1, -9);
  ctx.lineTo(0, -16);
  ctx.lineTo(3, -9);
  ctx.fill();
  ctx.strokeStyle = "#ff6a3a";
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.quadraticCurveTo(-12, 6 + wag, -13, 1 + wag);
  ctx.stroke();
  ctx.fillStyle = "#ff8a55";
  ctx.beginPath();
  ctx.ellipse(-8, 2, 3.5, 1.6, -0.4, 0, Math.PI * 2);
  ctx.ellipse(8, 2, 3.5, 1.6, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function babyBellota(ctx, t) {
  const bob = Math.sin(t / 11) * 1.1;
  ctx.translate(0, 3 + bob);
  ctx.fillStyle = "#8a4a18";
  ctx.beginPath();
  ctx.ellipse(0, -6, 9, 5.2, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-9, -7, 18, 3);
  ctx.fillStyle = "#6a3410";
  ctx.fillRect(-1.2, -14, 2.4, 8);
  ctx.fillStyle = "#e8b07a";
  ctx.beginPath();
  ctx.arc(0, 4, 8.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3, 3, 2.4, 0, Math.PI * 2);
  ctx.arc(3, 3, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a2a10";
  ctx.beginPath();
  ctx.arc(-2.6, 3.2, 1.15, 0, Math.PI * 2);
  ctx.arc(3.4, 3.2, 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c4783a";
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(-1.5, 8.2);
  ctx.lineTo(1.5, 8.2);
  ctx.fill();
  blush(ctx, 0, 6, 0.75);
}
