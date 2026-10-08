
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

function onView(x, w) {
  return x + w > -180 && x < 1460;
}

export function drawChasms(ctx, platforms, cam, t) {
  const grounds = platforms.filter((pl) => pl.h > 40).sort((a, b) => a.x - b.x);
  for (let i = 0; i < grounds.length - 1; i++) {
    const a = grounds[i], b = grounds[i + 1];
    const gap = b.x - (a.x + a.w);
    if (gap < 40) continue;
    const x = a.x + a.w - cam.x;
    const y = a.y - cam.y;
    if (!onView(x, gap)) continue;

    const g = ctx.createLinearGradient(0, y, 0, y + 220);
    g.addColorStop(0, "rgba(8,12,22,.18)");
    g.addColorStop(0.28, "rgba(4,6,16,.7)");
    g.addColorStop(1, "rgba(0,0,0,.96)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y + 6, gap, 220);

    ctx.strokeStyle = "rgba(126,231,255," + (0.28 + Math.sin(t / 9) * 0.08) + ")";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    const steps = gap > 280 ? 6 : 8;
    for (let k = 0; k <= steps; k++) {
      const px = x + (gap * k) / steps;
      const py = y + 8 + Math.sin(t / 11 + k + i) * 2 + (k % 2) * 2.5;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(16,14,24,.8)";
    const teeth = Math.max(2, Math.min(8, Math.floor(gap / 36)));
    for (let k = 1; k < teeth; k++) {
      const tx = x + (gap * k) / teeth;
      const th = 10 + hash(a.x + k * 17) * 22;
      ctx.beginPath();
      ctx.moveTo(tx - 5, y + 10);
      ctx.lineTo(tx, y + 10 + th);
      ctx.lineTo(tx + 5, y + 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "rgba(20,16,28,.88)";
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
  if (!onView(x, w)) return;
  const id = world.id || "grove";
  const thin = h <= 24;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.28)";
  plate(ctx, x + 4, y + (thin ? 6 : 10), w, h, thin ? 5 : 8);
  ctx.fill();

  const body = ctx.createLinearGradient(x, y, x, y + h);
  body.addColorStop(0, world.groundTop || "#8fd98a");
  body.addColorStop(thin ? 0.45 : 0.14, world.ground || "#245522");
  body.addColorStop(1, "rgba(0,0,0,.5)");
  ctx.fillStyle = body;
  plate(ctx, x, y, w, h, thin ? 6 : 8);
  ctx.fill();

  if (!thin) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y + 12, w - 2, h - 13);
    ctx.clip();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#000";
    const step = id === "space" || id === "lab" ? 22 : 28;
    for (let i = 0; i < w; i += step) {
      if (hash(plat.x + i) > 0.42) ctx.fillRect(x + i, y + 14, 2, h);
    }
    ctx.restore();
  }

  ctx.fillStyle = world.edge || "#fff";
  ctx.globalAlpha = 0.85;
  plate(ctx, x, y - 1, w, thin ? 6 : 9, 6);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,.3)";
  ctx.fillRect(x + 4, y + 1, Math.max(0, w - 8), 2);

  if (id === "jungle" || id === "grove" || id === "beach") {
    const n = Math.max(2, Math.min(18, Math.floor(w / 22)));
    for (let i = 0; i < n; i++) {
      const tx = x + 8 + ((i + 0.5) * (w - 16)) / n;
      const sway = Math.sin(t / 16 + i + plat.x * 0.01) * 1.4;
      const tw = 6 + hash(plat.x + i) * 4;
      const th = 2.5 + hash(plat.x + i * 5) * 2.5;
      ctx.fillStyle = id === "beach" ? "#8fbf62" : (i % 2 ? "#8ed56a" : "#63b84e");
      ctx.beginPath();
      ctx.moveTo(tx - tw, y + 1);
      ctx.quadraticCurveTo(tx + sway, y - th, tx + tw, y + 1);
      ctx.closePath();
      ctx.fill();
    }
  } else if (id === "volcano") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,120,40,.8)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const cx = x + w * (0.2 + hash(plat.x + i) * 0.6);
      ctx.globalAlpha = 0.55 + Math.sin(t / 8 + i) * 0.25;
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
    const dots = Math.min(12, Math.floor((w - 18) / 26));
    for (let i = 0; i < dots; i++) {
      ctx.globalAlpha = 0.45 + Math.sin(t / 10 + i) * 0.35;
      ctx.beginPath();
      ctx.arc(x + 10 + i * 26, y + 14, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (id === "aquatic") {
    ctx.fillStyle = "rgba(180,255,255,.35)";
    const bubbles = Math.min(10, Math.floor(w / 20));
    for (let i = 0; i < bubbles; i++) {
      const bob = Math.sin(t / 14 + i) * 2;
      ctx.beginPath();
      ctx.arc(x + 8 + i * 20, y + 8 + bob, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(140,230,220,.4)";
    ctx.lineWidth = 1.4;
    const kelp = Math.max(1, Math.min(6, Math.floor(w / 48)));
    for (let i = 0; i < kelp; i++) {
      const kx = x + 10 + ((i + 0.5) * (w - 20)) / kelp;
      const sway = Math.sin(t / 13 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(kx, y);
      ctx.quadraticCurveTo(kx + sway, y - 12, kx + sway * 0.6, y - 22);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fillRect(x, y + 8, 3, Math.max(0, h - 10));
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.fillRect(x + w - 3, y + 8, 3, Math.max(0, h - 10));
  ctx.restore();
}

function dress(ctx, world, cam, t) {
  const id = world && world.id;
  ctx.save();
  if (id === "beach") {
    for (let i = 0; i < 4; i++) {
      const x = 180 + i * 420 - cam.x;
      ctx.fillStyle = "#6a4a28";
      ctx.fillRect(x, 520 - cam.y, 10, 160);
      ctx.fillStyle = "#2f8a3a";
      ctx.beginPath();
      ctx.ellipse(x + 5, 500 - cam.y, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === "jungle") {
    ctx.strokeStyle = "rgba(40,120,50,.7)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const x = 120 + i * 280 - cam.x;
      ctx.beginPath();
      ctx.moveTo(x, 80 - cam.y);
      ctx.quadraticCurveTo(x + 20, 200 - cam.y, x - 8, 420 - cam.y);
      ctx.stroke();
    }
  } else if (id === "volcano") {
    ctx.fillStyle = "rgba(255,80,20,.18)";
    ctx.fillRect(0, 980 - cam.y, 2240, 40);
  } else if (id === "space") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 18; i++) {
      const x = (i * 137) % 2000 - cam.x;
      const y = 40 + (i * 53) % 280 - cam.y;
      ctx.globalAlpha = 0.4 + (i % 3) * 0.2;
      ctx.fillRect(x, y, 2, 2);
    }
  } else if (id === "aquatic") {
    ctx.strokeStyle = "rgba(140,230,255,.35)";
    for (let i = 0; i < 8; i++) {
      const y = ((t * 0.4 + i * 90) % 700) - cam.y;
      ctx.beginPath();
      ctx.arc(160 + i * 240 - cam.x, y, 6 + (i % 3), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
export function drawTerrain(ctx, platforms, world, cam, t) {
  drawChasms(ctx, platforms, cam, t);
  for (const plat of platforms) drawPlatform(ctx, plat, world, cam, t);
  dress(ctx, world, cam, t);
}