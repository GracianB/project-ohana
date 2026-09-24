// Rig vectorial de 3 arquetipos. Origen = centro del enemigo.

function limb(ctx, x1, y1, x2, y2, w, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function blob(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
  ctx.fill();
}
function eye(ctx, x, y, r, look) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1020";
  ctx.beginPath();
  ctx.arc(x + (look || 0), y, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCrawlerRig(ctx, e, t) {
  const dir = (e.vx || 0) >= 0 ? 1 : -1;
  const walk = Math.sin((t || 0) * 0.35);
  const shell = e.eliteTint || e.color || "#c45a18";
  ctx.save();
  ctx.scale(dir, 1);
  if (e.diving || e.lunge > 0) ctx.rotate(-0.35);
  limb(ctx, -4, 4, -12 - walk * 5, 11, 2.2, "#4a220c");
  limb(ctx, 4, 4, 12 + walk * 5, 11, 2.2, "#4a220c");
  blob(ctx, 0, 1, 11, 6.5, shell);
  blob(ctx, 9, -1, 5, 4.2, shell);
  eye(ctx, 11, -2, 1.6, 0.3);
  ctx.strokeStyle = "#4a220c";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(11, -5);
  ctx.quadraticCurveTo(16, -12 - walk * 2, 18, -8);
  ctx.stroke();
  ctx.restore();
}

export function drawFlyerRig(ctx, e, t) {
  const dir = (e.vx || 0) >= 0 ? 1 : -1;
  const flap = Math.sin((t || 0) * (e.diving ? 0.9 : 0.55));
  const body = e.color || "#ff6a4a";
  ctx.save();
  ctx.scale(dir, 1);
  if (e.diving) ctx.rotate(0.5);
  ctx.globalAlpha = 0.45;
  blob(ctx, -1, -8, 13, 4 + flap * 2, "#e8fff8");
  ctx.globalAlpha = 1;
  blob(ctx, -6, 3, 8, 4, body);
  blob(ctx, 8, -1, 4, 3.4, body);
  eye(ctx, 10, -1.5, 1.5, e.diving ? 0.5 : 0.2);
  ctx.strokeStyle = "#3a140c";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(18, e.diving ? 6 : 3);
  ctx.stroke();
  ctx.restore();
}

export function drawBruteRig(ctx, e, t) {
  const dir = (e.vx || 0) >= 0 ? 1 : -1;
  const walk = Math.sin((t || 0) * 0.22);
  const shell = e.color || "#e07040";
  const open = e.telegraph ? 10 : 4;
  ctx.save();
  ctx.scale(dir, 1);
  limb(ctx, -6, 4, -12 - walk * 3, 12, 2.4, "#6a2410");
  limb(ctx, 6, 4, 12 + walk * 3, 12, 2.4, "#6a2410");
  blob(ctx, 0, 0, 13, 7, shell);
  limb(ctx, -4, -6, -5, -12, 1.6, "#6a2410");
  limb(ctx, 4, -6, 5, -12, 1.6, "#6a2410");
  eye(ctx, -5, -13, 2, 0.2);
  eye(ctx, 5, -13, 2, 0.2);
  ctx.strokeStyle = "#6a2410";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(18, -open * 0.2);
  ctx.moveTo(12, 2);
  ctx.lineTo(18, open * 0.2);
  ctx.stroke();
  ctx.restore();
}

const CRAWL = new Set(["cucaracho", "escoria", "arana"]);
const FLY = new Set(["mosquito", "phosquito", "libelula", "gaviota", "murcielago"]);
const BRUTE = new Set(["cangrejo", "planta", "rana"]);

export function drawFoeRig(ctx, e, t) {
  const k = e.kind;
  if (CRAWL.has(k)) { drawCrawlerRig(ctx, e, t); return true; }
  if (FLY.has(k)) { drawFlyerRig(ctx, e, t); return true; }
  if (BRUTE.has(k)) { drawBruteRig(ctx, e, t); return true; }
  return false;
}
