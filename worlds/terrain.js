// Suelos, muros y precipicios. La hitbox no cambia: solo el dibujo.

function plate(ctx, x, y, w, h, r) {
  const rad = Math.max(0, Math.min(r, h / 2, w / 2));
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5;
  return s - Math.floor(s);
}

export function drawChasms(ctx, platforms, cam, t) {
  const grounds = platforms.filter((pl) => pl.h > 40).sort((a, b) => a.x - b.x);
  for (let i = 0; i < grounds.length - 1; i++) {
    const a = grounds[i], b = grounds[i + 1];
    const gap = b.x - (a.x + a.w);
    if (gap < 40) continue;
    const x = a.x + a.w - cam.x;
    const y = a.y - cam.y;
    const g = ctx.createLinearGradient(0, y, 0, y + 180);
    g.addColorStop(0, "rgba(8,12,22,.15)");
    g.addColorStop(0.4, "rgba(4,6,16,.72)");
    g.addColorStop(1, "rgba(1,1,6,.92)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y + 6, gap, 180);
    ctx.strokeStyle = "rgba(126,231,255," + (0.25 + Math.sin(t / 9) * 0.08) + ")";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    for (let k = 0; k <= 6; k++) {
      const px = x + (gap * k) / 6;
      const py = y + 8 + Math.sin(t / 11 + k) * 2 + (k % 2) * 3;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    // dientes de roca en los labios
    ctx.fillStyle = "rgba(20,16,28,.85)";
    for (let side = 0; side < 2; side++) {
      const sx = side ? x + gap : x;
      const dir = side ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(sx, y + 8);
      ctx.lineTo(sx + dir * 16, y + 28);
      ctx.lineTo(sx + dir * 6, y + 46);
      ctx.lineTo(sx, y + 40);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export function drawPlatform(ctx, plat, world, cam, t) {
  const x = plat.x - cam.x;
  const y = plat.y - cam.y;
  const w = plat.w;
  const h = plat.h;
  const id = world.id || "grove";
  const thin = h <= 24;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.30)";
  plate(ctx, x + 4, y + (thin ? 6 : 10), w, h, thin ? 5 : 8);
  ctx.fill();

  const body = ctx.createLinearGradient(x, y, x, y + h);
  body.addColorStop(0, world.groundTop || "#8fd98a");
  body.addColorStop(thin ? 0.45 : 0.16, world.ground || "#245522");
  body.addColorStop(1, "rgba(0,0,0,.45)");
  ctx.fillStyle = body;
  plate(ctx, x, y, w, h, thin ? 6 : 8);
  ctx.fill();

  // cara del muro: franjas verticales para que no sea un rectángulo plano
  if (!thin) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + 12, w, h - 12);
    ctx.clip();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000";
    const step = id === "space" || id === "lab" ? 22 : 28;
    for (let i = 0; i < w; i += step) {
      if (hash(plat.x + i) > 0.45) ctx.fillRect(x + i, y + 14, 2, h);
    }
    ctx.restore();
  }

  // labio superior
  ctx.fillStyle = world.edge || "#fff";
  ctx.globalAlpha = 0.85;
  plate(ctx, x, y - 1, w, thin ? 6 : 9, 6);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,.28)";
  ctx.fillRect(x + 4, y + 1, w - 8, 2);

  if (id === "jungle" || id === "grove" || id === "beach") {
    const n = Math.max(2, Math.floor(w / 22));
    for (let i = 0; i < n; i++) {
      const tx = x + 8 + ((i + 0.5) * (w - 16)) / n;
      const tw = 6 + hash(plat.x + i) * 4;
      const th = 2.5 + hash(plat.x + i * 5) * 2.5;
      ctx.fillStyle = id === "beach" ? "#8fbf62" : (i % 2 ? "#8ed56a" : "#63b84e");
      ctx.beginPath();
      ctx.moveTo(tx - tw, y + 1);
      ctx.quadraticCurveTo(tx, y - th, tx + tw, y + 1);
      ctx.closePath();
      ctx.fill();
    }
  } else if (id === "volcano") {
    ctx.save();
    ctx.shadowColor = "#ff6a22";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "rgba(255,120,40,.85)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const cx = x + w * (0.2 + hash(plat.x + i) * 0.6);
      ctx.beginPath();
      ctx.moveTo(cx, y + 8);
      ctx.lineTo(cx + 6, y + h * 0.45);
      ctx.lineTo(cx - 2, y + h * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  } else if (id === "space" || id === "lab") {
    ctx.strokeStyle = id === "lab" ? "rgba(80,240,255,.45)" : "rgba(160,140,255,.4)";
    ctx.lineWidth = 1;
    for (let row = 18; row < h; row += 16) {
      ctx.beginPath();
      ctx.moveTo(x + 6, y + row);
      ctx.lineTo(x + w - 6, y + row);
      ctx.stroke();
    }
    ctx.fillStyle = id === "lab" ? "#7af3ff" : "#c8b6ff";
    for (let i = 10; i < w - 8; i += 26) {
      ctx.beginPath();
      ctx.arc(x + i, y + 14, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === "aquatic") {
    ctx.fillStyle = "rgba(180,255,255,.35)";
    for (let i = 0; i < w; i += 20) {
      const bob = Math.sin(t / 14 + i) * 2;
      ctx.beginPath();
      ctx.arc(x + 8 + i, y + 8 + bob, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fillRect(x, y + 8, 3, Math.max(0, h - 10));
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.fillRect(x + w - 3, y + 8, 3, Math.max(0, h - 10));
  ctx.restore();
}

export function drawTerrain(ctx, platforms, world, cam, t) {
  drawChasms(ctx, platforms, cam, t);
  for (const plat of platforms) drawPlatform(ctx, plat, world, cam, t);
}
