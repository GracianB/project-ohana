function blush(ctx, x, y) {
  ctx.fillStyle = "rgba(255,120,150,.55)";
  ctx.beginPath();
  ctx.ellipse(x - 7, y + 3, 3.6, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 7, y + 3, 3.6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function spark(ctx, t) {
  ctx.fillStyle = "rgba(255,255,255,.85)";
  for (let i = 0; i < 4; i++) {
    const a = t / 12 + i * 1.6;
    ctx.fillRect(Math.cos(a) * 16 - 1, Math.sin(a) * 12 - 1, 2, 2);
  }
}

export function drawBaby(ctx, p, t) {
  ctx.scale(1.35, 1.35);
  spark(ctx, t);
  const id = p.id;
  if (id === "stitch") babyStitch(ctx, t);
  else if (id === "pikachu") babyPichu(ctx, t);
  else if (id === "dragon") babyMushu(ctx, t);
  else if (id === "cat") babyCat(ctx, t);
  else babyLilo(ctx, t);
}

function babyLilo(ctx, t) {
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(0, -6, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4c2a8";
  ctx.beginPath();
  ctx.arc(0, -4, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3, -5, 2.3, 0, Math.PI * 2);
  ctx.arc(3, -5, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.arc(-2.6, -4.8, 1.2, 0, Math.PI * 2);
  ctx.arc(3.4, -4.8, 1.2, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, -3);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -2, 2.4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#ff5a7a";
  ctx.beginPath();
  ctx.ellipse(0, 8, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2, 6, 4, 3);
}

function babyStitch(ctx, t) {
  const flap = Math.sin(t / 8) * 2;
  ctx.fillStyle = "#6bb6ff";
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.quadraticCurveTo(-14, -22 + flap, -1, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.quadraticCurveTo(14, -22 + flap, 1, -8);
  ctx.fill();
  ctx.fillStyle = "#f7c0d0";
  ctx.beginPath();
  ctx.ellipse(-9, -14, 2.2, 4.2, -0.3, 0, Math.PI * 2);
  ctx.ellipse(9, -14, 2.2, 4.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5aaeff";
  ctx.beginPath();
  ctx.arc(0, 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e9f7ff";
  ctx.beginPath();
  ctx.ellipse(0, 5, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(-3.4, 0, 2.4, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(3.4, 0, 2.4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-4, -1.4, 1.2, 1.4);
  ctx.fillRect(2.6, -1.4, 1.2, 1.4);
  blush(ctx, 0, 2);
  ctx.fillStyle = "#111";
  ctx.fillRect(-2, 4.5, 4, 1.6);
}

function babyPichu(ctx, t) {
  ctx.fillStyle = "#ffe44a";
  ctx.beginPath();
  ctx.arc(0, 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(-7, -16);
  ctx.lineTo(0, -5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.lineTo(7, -16);
  ctx.lineTo(0, -5);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.fillRect(-7.5, -16, 3, 3);
  ctx.fillRect(4.5, -16, 3, 3);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3, 1, 2.2, 0, Math.PI * 2);
  ctx.arc(3, 1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-2.6, 1.2, 1.1, 0, Math.PI * 2);
  ctx.arc(3.4, 1.2, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e23";
  ctx.beginPath();
  ctx.arc(-6, 5, 2, 0, Math.PI * 2);
  ctx.arc(6, 5, 2, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, 3);
  ctx.strokeStyle = "#c90";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(7, 3);
  ctx.quadraticCurveTo(14, -4, 12, 6);
  ctx.stroke();
}

function babyMushu(ctx, t) {
  const wag = Math.sin(t / 7) * 3;
  ctx.fillStyle = "#ff6a3a";
  ctx.beginPath();
  ctx.arc(0, 4, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe9b8";
  ctx.beginPath();
  ctx.ellipse(1, 6, 5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ff6a3a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  ctx.quadraticCurveTo(-14, 8 + wag, -16, 2 + wag);
  ctx.stroke();
  ctx.fillStyle = "#ff6a3a";
  ctx.beginPath();
  ctx.arc(3, -6, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe9b8";
  ctx.beginPath();
  ctx.arc(4, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff7d8";
  ctx.beginPath();
  ctx.arc(1, -7, 2.4, 0, Math.PI * 2);
  ctx.arc(6, -7, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a0a04";
  ctx.beginPath();
  ctx.arc(1.3, -6.8, 1.1, 0, Math.PI * 2);
  ctx.arc(6.3, -6.8, 1.1, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 3, -4);
  ctx.fillStyle = "#f6c14a";
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-1, -18);
  ctx.lineTo(3, -12);
  ctx.fill();
}

function babyCat(ctx, t) {
  ctx.fillStyle = "#ffd0ec";
  ctx.beginPath();
  ctx.arc(0, 2, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-7, -2);
  ctx.lineTo(-6, -14);
  ctx.lineTo(-1, -4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, -2);
  ctx.lineTo(6, -14);
  ctx.lineTo(1, -4);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(-5, -3);
  ctx.lineTo(-5, -10);
  ctx.lineTo(-2, -3);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3, 1, 2.2, 0, Math.PI * 2);
  ctx.arc(3, 1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a2a40";
  ctx.beginPath();
  ctx.arc(-2.6, 1.2, 1.1, 0, Math.PI * 2);
  ctx.arc(3.4, 1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff7aa8";
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(-1.6, 5);
  ctx.lineTo(1.6, 5);
  ctx.fill();
  blush(ctx, 0, 3);
  ctx.strokeStyle = "#ff9ad0";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(7, 4);
  ctx.quadraticCurveTo(14, 0, 11, 10);
  ctx.stroke();
}
