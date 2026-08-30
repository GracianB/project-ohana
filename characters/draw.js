function aura(ctx, r, color, t) {
  ctx.save();
  ctx.globalAlpha = 0.2 + Math.sin(t / 8) * 0.1;
  const g = ctx.createRadialGradient(0, 2, 3, 0, 2, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 2, r, 0, Math.PI * 2);
  ctx.fill();
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
  if (evo >= 1) aura(ctx, p.w * (1.35 + evo * 0.4), p.color, t);
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
  ctx.scale(1 + evo * 0.16, 1 + evo * 0.16);
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.ellipse(0, -16, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-13, -18);
  ctx.quadraticCurveTo(-18, -28, -6, -22);
  ctx.quadraticCurveTo(0, -30, 6, -22);
  ctx.quadraticCurveTo(18, -28, 13, -18);
  ctx.fill();
  ctx.fillStyle = "#f3c4a0";
  ctx.beginPath();
  ctx.arc(0, -9, 9.2, 0, Math.PI * 2);
  ctx.fill();
  eye(ctx, -3.6, -10, 2.3, 2.6);
  eye(ctx, 3.6, -10, 2.3, 2.6);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -6.2, 3.2, 0.15, Math.PI - 0.15);
  ctx.stroke();
  const dress = evo >= 2 ? "#ffd36a" : evo >= 1 ? "#ff4d78" : "#e0142c";
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(-12, -1);
  ctx.lineTo(12, -1);
  ctx.lineTo(14, 20);
  ctx.lineTo(-14, 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-3.2, 5, 6.4, 6);
  ctx.fillStyle = "#f3c4a0";
  ctx.fillRect(-13, 0, 4, 8);
  ctx.fillRect(9, 0, 4, 8);
  if (evo >= 1) {
    ctx.fillStyle = "#2ec9c0";
    ctx.beginPath();
    ctx.ellipse(0, -24, 5 + evo, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1aa39c";
    ctx.beginPath();
    ctx.moveTo(-4, -24);
    ctx.quadraticCurveTo(0, -32, 4, -24);
    ctx.fill();
  }
  if (evo >= 2) {
    ctx.strokeStyle = "rgba(255,230,160,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 4, 18, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }
}

function drawStitch(ctx, p, t, evo) {
  const s = 1 + evo * 0.17;
  ctx.scale(s, s);
  const blue = evo >= 2 ? "#8ad4ff" : evo >= 1 ? "#1b4dff" : "#3d9bff";
  const flap = Math.sin(t / 9) * 2;
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.quadraticCurveTo(-24, -36 + flap, -2, -10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.quadraticCurveTo(24, -36 + flap, 2, -10);
  ctx.fill();
  ctx.fillStyle = "#f4b6c8";
  ctx.beginPath();
  ctx.ellipse(-16, -22, 3.4, 7.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, -22, 3.4, 7.2, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b1a44";
  ctx.beginPath();
  ctx.moveTo(-8, -18);
  ctx.lineTo(-6, -8);
  ctx.lineTo(-3, -16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -18);
  ctx.lineTo(6, -8);
  ctx.lineTo(3, -16);
  ctx.fill();
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.ellipse(0, 5, 17, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d7f4ff";
  ctx.beginPath();
  ctx.ellipse(0, 9, 10, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#ff2a2a" : "#111";
  ctx.beginPath();
  ctx.ellipse(-5.5, 0, 3.8, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5.5, 0, 3.8, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-6.4, -2.2, 1.6, 1.8);
  ctx.fillRect(4.2, -2.2, 1.6, 1.8);
  ctx.fillStyle = "#111";
  ctx.fillRect(-3, 8, 6, 2);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2.4, 7.2, 1.4, 2.4);
  ctx.fillRect(1, 7.2, 1.4, 2.4);
  if (evo >= 1) {
    ctx.strokeStyle = blue;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, 6);
    ctx.lineTo(-22, 0);
    ctx.moveTo(16, 6);
    ctx.lineTo(22, 0);
    ctx.stroke();
  }
  if (evo >= 2) {
    ctx.strokeStyle = "#cfe9ff";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-14, 10);
    ctx.lineTo(-24, 14);
    ctx.moveTo(14, 10);
    ctx.lineTo(24, 14);
    ctx.stroke();
  }
}

function drawPikachu(ctx, p, t, evo) {
  const s = 1 + evo * 0.18;
  ctx.scale(s, s);
  const body = evo >= 2 ? "#fff36a" : evo >= 1 ? "#e0891c" : "#ffe44a";
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 5, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-7, -6);
  ctx.lineTo(-12, -27);
  ctx.lineTo(-1, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, -6);
  ctx.lineTo(12, -27);
  ctx.lineTo(1, -8);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-12, -27);
  ctx.lineTo(-8, -27);
  ctx.lineTo(-10, -22);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -27);
  ctx.lineTo(8, -27);
  ctx.lineTo(10, -22);
  ctx.fill();
  eye(ctx, -4.6, 1, 2.3, 2.6);
  eye(ctx, 4.6, 1, 2.3, 2.6);
  ctx.fillStyle = "#e23";
  ctx.beginPath();
  ctx.arc(-10, 7, 3, 0, Math.PI * 2);
  ctx.arc(10, 7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, 6.5, 1.4, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = evo >= 1 ? "#fff36a" : "#c90";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(13, 4);
  ctx.quadraticCurveTo(26, -12, 20, 8);
  ctx.quadraticCurveTo(18, 16, 28, 13);
  ctx.stroke();
  if (evo >= 1) {
    ctx.strokeStyle = "rgba(255,230,80,.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3 + evo; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(Math.cos(t / 5 + i * 1.4) * 20, Math.sin(t / 5 + i * 1.4) * 16);
      ctx.stroke();
    }
  }
}

function drawMushu(ctx, p, t, evo) {
  const s = 1 + evo * 0.22;
  ctx.scale(s, s);
  const red = evo >= 2 ? "#9a140c" : evo >= 1 ? "#d41c12" : "#e1321a";
  const dark = evo >= 2 ? "#5a0808" : "#8a120c";
  const gold = "#f6c14a";
  const cream = "#ffe6b0";
  const flap = Math.sin(t / 6) * (4 + evo * 3);
  const wag = Math.sin(t / 8) * 6;

  ctx.strokeStyle = red;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.quadraticCurveTo(-22, 16 + wag, -30, 4 + wag * 0.4);
  ctx.quadraticCurveTo(-34, -4 + wag, -26, -2 + wag);
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(-26, -2 + wag);
  ctx.lineTo(-36, -8 + wag);
  ctx.lineTo(-30, 4 + wag);
  ctx.fill();

  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.ellipse(-2, 8, 14, 9.5, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(0, 10, 9, 5.2, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = dark;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(-16, 1);
  ctx.moveTo(-4, 8);
  ctx.lineTo(-12, 3);
  ctx.stroke();
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.arc(-16, 1, 1.6, 0, Math.PI * 2);
  ctx.arc(-12, 3, 1.6, 0, Math.PI * 2);
  ctx.fill();

  if (evo >= 1) {
    ctx.fillStyle = "rgba(255,90,20,.55)";
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-26, -16 + flap, -4, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.quadraticCurveTo(10, -26 + flap, 18, 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,200,80,.65)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-18, -6 + flap);
    ctx.lineTo(-8, 6);
    ctx.moveTo(10, -16 + flap);
    ctx.lineTo(8, 0);
    ctx.stroke();
  }

  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.ellipse(10, -2, 13, 11, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(12, 2, 8, 5.5, 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(4, -10);
  ctx.quadraticCurveTo(2, -22, 8, -12);
  ctx.lineTo(6, -10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -11);
  ctx.quadraticCurveTo(18, -24, 18, -10);
  ctx.fill();
  if (evo >= 1) {
    ctx.fillStyle = "#fff3c0";
    ctx.beginPath();
    ctx.moveTo(8, -12);
    ctx.lineTo(6, -20);
    ctx.lineTo(11, -12);
    ctx.fill();
  }

  ctx.fillStyle = "#ff9a18";
  ctx.beginPath();
  ctx.moveTo(2, -8);
  ctx.quadraticCurveTo(-4, -20, 8, -14);
  ctx.quadraticCurveTo(16, -22, 18, -10);
  ctx.quadraticCurveTo(10, -8, 2, -8);
  ctx.fill();
  ctx.fillStyle = "#ffe36a";
  ctx.beginPath();
  ctx.moveTo(6, -10);
  ctx.quadraticCurveTo(10, -18, 14, -10);
  ctx.fill();

  ctx.fillStyle = "#fff7d8";
  ctx.beginPath();
  ctx.ellipse(7, -3, 3.6, 4.4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(15, -3.2, 3.6, 4.4, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a0a04";
  ctx.beginPath();
  ctx.arc(8, -3, 1.7, 0, Math.PI * 2);
  ctx.arc(16, -3.2, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(7.2, -4.2, 0.7, 0, Math.PI * 2);
  ctx.arc(15.2, -4.4, 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(20, 2, 3.6, 2.4, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = cream;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(18, 0.4);
  ctx.quadraticCurveTo(26, -4, 28, -1);
  ctx.moveTo(18, 3.2);
  ctx.quadraticCurveTo(26, 7, 28, 4);
  ctx.stroke();

  if (evo >= 2) {
    ctx.fillStyle = "rgba(255,70,16,.85)";
    ctx.beginPath();
    ctx.moveTo(21, 2);
    ctx.lineTo(34, -4);
    ctx.lineTo(30, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe36a";
    ctx.beginPath();
    ctx.moveTo(22, 2);
    ctx.lineTo(30, 0);
    ctx.lineTo(26, 4);
    ctx.fill();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(2, -10);
    ctx.lineTo(10, 2);
    ctx.stroke();
  }
}

function drawCat(ctx, p, t, evo) {
  const s = 1 + evo * 0.17;
  ctx.scale(s, s);
  const fur = evo >= 2 ? "#f6f1ff" : evo >= 1 ? "#3a2048" : "#ffb6e4";
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(0, 3, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-11, -3);
  ctx.lineTo(-10, -22);
  ctx.lineTo(-2, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -3);
  ctx.lineTo(10, -22);
  ctx.lineTo(2, -6);
  ctx.fill();
  ctx.fillStyle = evo >= 1 ? "#ff5cb8" : "#fff";
  ctx.beginPath();
  ctx.moveTo(-9, -5);
  ctx.lineTo(-9, -16);
  ctx.lineTo(-4, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -5);
  ctx.lineTo(9, -16);
  ctx.lineTo(4, -6);
  ctx.fill();
  eye(ctx, -4, 2, 2.3, 2.8);
  eye(ctx, 4, 2, 2.3, 2.8);
  ctx.fillStyle = "#ff7aa8";
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(-2.2, 7.4);
  ctx.lineTo(2.2, 7.4);
  ctx.fill();
  ctx.strokeStyle = evo >= 2 ? "#c9f" : "#ff7ac8";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(11, 6);
  ctx.quadraticCurveTo(22, -4, 17, 16);
  ctx.stroke();
  if (evo >= 1) {
    ctx.fillStyle = "#ff4da0";
    ctx.beginPath();
    ctx.arc(0, -8, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (evo >= 2) {
    ctx.fillStyle = "rgba(255,255,255,.8)";
    for (let i = 0; i < 5; i++) {
      const a = t / 10 + i * 1.2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 16, Math.sin(a) * 12, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
