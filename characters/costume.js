// Traje de forma. Solo presentación: no toca hitbox, daño ni física.
// Cada héroe gana una silueta propia que crece de bebé a forma final.

const INK = "#1a1022";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function formOf(pose) {
  return clamp(Math.round(Number(pose?.form) || 0), 0, 4);
}

function stroke(ctx, color, w) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function kilo(ctx, H, f, color) {
  const n = 3 + f;
  const r = H * (0.16 + f * 0.05);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.moveTo(Math.cos(a) * r * 0.35, -H * 0.78 + Math.sin(a) * r * 0.2);
    ctx.lineTo(Math.cos(a) * r, -H * 0.92 + Math.sin(a) * r * 0.35);
  }
  ctx.stroke();
  if (f >= 3) {
    ctx.beginPath();
    ctx.arc(0, -H * 0.9, H * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
}

function stitcho(ctx, H, f) {
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * H * 0.22, -H * (0.72 + f * 0.04), H * 0.08, H * (0.16 + f * 0.03), side * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (f >= 2) {
    ctx.beginPath();
    ctx.moveTo(-H * 0.28, -H * 0.42);
    ctx.quadraticCurveTo(-H * 0.46, -H * 0.05, -H * 0.22, H * 0.08);
    ctx.moveTo(H * 0.28, -H * 0.42);
    ctx.quadraticCurveTo(H * 0.46, -H * 0.05, H * 0.22, H * 0.08);
    ctx.stroke();
  }
}

function chispin(ctx, H, f, t) {
  const bolt = (x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.35, y - s * 0.15);
    ctx.lineTo(x - s * 0.05, y);
    ctx.lineTo(x + s * 0.45, y + s);
    ctx.stroke();
  };
  bolt(-H * 0.34, -H * 0.55, H * (0.08 + f * 0.015));
  bolt(H * 0.34, -H * 0.52, H * (0.08 + f * 0.015));
  if (f >= 3) bolt(0, -H * (0.95 + Math.sin(t * 0.2) * 0.02), H * 0.12);
}

function cat(ctx, H, f, t) {
  const wag = Math.sin(t * 0.18) * H * 0.06;
  ctx.beginPath();
  ctx.moveTo(H * 0.05, -H * 0.28);
  ctx.quadraticCurveTo(-H * 0.28, -H * 0.42, -H * 0.34 + wag, -H * (0.62 + f * 0.04));
  ctx.stroke();
  if (f >= 2) {
    ctx.beginPath();
    ctx.arc(H * 0.02, -H * 0.86, H * (0.08 + f * 0.02), 0.4, Math.PI * 1.7);
    ctx.stroke();
  }
}

function dragon(ctx, H, f) {
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * H * 0.08, -H * 0.7);
    ctx.quadraticCurveTo(side * H * 0.22, -H * (0.92 + f * 0.04), side * H * 0.06, -H * 1.02);
    ctx.stroke();
    if (f >= 2) {
      ctx.beginPath();
      ctx.moveTo(side * H * 0.18, -H * 0.48);
      ctx.quadraticCurveTo(side * H * (0.55 + f * 0.06), -H * 0.7, side * H * 0.42, -H * 0.2);
      ctx.stroke();
    }
  }
}

function dino(ctx, H, f) {
  const n = 3 + f;
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * H * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - H * 0.04, -H * 0.28);
    ctx.lineTo(x, -H * (0.46 + (i % 2) * 0.08 + f * 0.03));
    ctx.lineTo(x + H * 0.04, -H * 0.28);
    ctx.stroke();
  }
}

function frita(ctx, H, f) {
  const n = 4 + f;
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * H * 0.07;
    ctx.beginPath();
    ctx.moveTo(x, -H * 0.62);
    ctx.lineTo(x, -H * (0.82 + (i % 2) * 0.08));
    ctx.stroke();
  }
}

function pizza(ctx, H, f) {
  ctx.beginPath();
  ctx.ellipse(0, -H * 0.55, H * (0.22 + f * 0.04), H * 0.08, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (f >= 2) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-H * 0.08 + i * H * 0.08, -H * 0.7, H * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function yomi(ctx, H, f) {
  ctx.beginPath();
  ctx.moveTo(-H * 0.16, -H * 0.78);
  ctx.lineTo(0, -H * (0.98 + f * 0.04));
  ctx.lineTo(H * 0.16, -H * 0.78);
  ctx.closePath();
  ctx.stroke();
  if (f >= 3) {
    ctx.beginPath();
    ctx.arc(0, -H * 0.42, H * 0.16, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}

function cuerno(ctx, H, f) {
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * H * 0.06, -H * 0.62);
    ctx.quadraticCurveTo(side * H * 0.28, -H * 0.84, side * H * 0.18, -H * (1.02 + f * 0.04));
    if (f >= 2) {
      ctx.moveTo(side * H * 0.16, -H * 0.78);
      ctx.lineTo(side * H * 0.34, -H * 0.86);
    }
    ctx.stroke();
  }
}

const DRAW = {
  kilo, lilo: kilo,
  stitcho, stitch: stitcho,
  chispin, pikachu: chispin,
  cat, michi: cat,
  dragon, dino, frita, pizza, yomi, cuerno,
};

export function drawCostume(ctx, id, H, pose, t) {
  const draw = DRAW[id] || DRAW.kilo;
  const f = formOf(pose);
  const color = pose?.color || "#fff6c8";
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.82;
  stroke(ctx, color, Math.max(2, H * (0.018 + f * 0.004)));
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3.2, H * (0.026 + f * 0.004));
  draw(ctx, H, f, t || 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.6, H * (0.012 + f * 0.003));
  draw(ctx, H, f, t || 0);
  ctx.restore();
}
