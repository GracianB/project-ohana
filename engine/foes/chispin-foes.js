// V372 · Enemigos de Chispín: pez, medusa, anguila y cangrejo.
// Solo arte/animación. Origen = centro del enemigo (como en enemies.js). Sin gradientes, sin daño/vida.
const TAU = Math.PI * 2;
export const CHISPIN_FOE_IDS = Object.freeze(["pez", "medusa", "anguila", "cangrejo"]);
const IDSET = new Set(CHISPIN_FOE_IDS);

function poseOf(e) {
  if (e.hp <= 0) return "die";
  if ((e.flash || 0) > 6) return "hit";
  if (e.telegraph || e.clawWind > 0) return "telegraph";
  if (e.dashSwim > 0 || e.clawSnap > 0 || e.pulsezap > 0) return "attack";
  if (Math.abs(e.vx || 0) > 0.3) return "move";
  return "idle";
}
const tierOf = (e) => Math.max(0, Math.min(2, (e.evo || 0) + (e.elite ? 1 : 0)));
function ell(ctx, x, y, rx, ry, c, rot = 0) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); }
function eye(ctx, x, y, r, angry) {
  ell(ctx, x, y, r, r, "#fff"); ell(ctx, x + r * 0.2, y + r * 0.1, r * 0.55, r * 0.6, "#101828");
  ell(ctx, x - r * 0.15, y - r * 0.3, r * 0.22, r * 0.22, "#fff");
  if (angry) { ctx.strokeStyle = "#101828"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - r, y - r * 1.3); ctx.lineTo(x + r, y - r * 0.7); ctx.stroke(); }
}
function warnRing(ctx, x, y, r, t, col) {
  const k = 0.5 + 0.5 * Math.sin(t * 0.6);
  ctx.save(); ctx.globalAlpha = 0.35 + k * 0.45; ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t; ctx.beginPath(); ctx.arc(x, y, r + k * 4, 0, TAU); ctx.stroke(); ctx.restore();
}

function drawPez(ctx, e, t, pose, tier) {
  const dir = (e.vx || 0) >= 0 ? 1 : -1, ph = t * (pose === "attack" ? 0.55 : 0.22) + (e.bob || 0);
  const sw = Math.sin(ph), st = pose === "attack" ? 1.18 : 1;
  const body = ["#3aa8d8", "#2f7fe0", "#7a4fe0"][tier], belly = ["#c8f4ff", "#bfe0ff", "#e6d4ff"][tier], fin = ["#ff9a3c", "#ffb020", "#ff4fa0"][tier];
  ctx.save(); ctx.scale(dir * 1.35 * st, 1.35 / Math.sqrt(st));
  if (pose === "die") ctx.rotate(Math.PI);
  // cola (bifurcada, aletea)
  ctx.save(); ctx.translate(-13, 0); ctx.rotate(sw * 0.45);
  ctx.fillStyle = fin; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-8, -10, -12, -11); ctx.lineTo(-8, 0); ctx.lineTo(-12, 11); ctx.quadraticCurveTo(-8, 10, 0, 0); ctx.fill(); ctx.restore();
  // aletas dorsal y ventral
  ctx.fillStyle = fin; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(0, -17 - sw * 2, 7, -8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-3, 8); ctx.quadraticCurveTo(1, 13 + sw, 4, 8); ctx.fill();
  // cuerpo
  ctx.strokeStyle = "rgba(5,20,40,.85)"; ctx.lineWidth = 2.4;
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, 15, 9.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ell(ctx, 1, 3.5, 11, 4.5, belly);
  // escamas
  ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 1;
  for (let r = -1; r <= 1; r++) for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.arc(-8 + c * 4 + (r & 1) * 2, r * 3.4 - 1, 2.2, -1.2, 1.2); ctx.stroke(); }
  // agalla + aleta pectoral
  ctx.strokeStyle = "rgba(5,20,40,.6)"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(6, 0, 6, -1.1, 1.1); ctx.stroke();
  ctx.fillStyle = fin; ctx.beginPath(); ctx.ellipse(2, 3, 4, 2, 0.6 + sw * 0.4, 0, TAU); ctx.fill();
  eye(ctx, 9.5, -2.5, 3, pose === "attack" || tier > 0);
  ctx.fillStyle = "#101828"; ctx.beginPath(); ctx.arc(14, 2.5, pose === "attack" ? 2 : 1.1, 0, TAU); ctx.fill();
  if (tier >= 2) { ctx.fillStyle = "#fff"; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-5 + i * 4, -9); ctx.lineTo(-3 + i * 4, -14); ctx.lineTo(-1 + i * 4, -9); ctx.fill(); } }
  if (pose === "attack") { ctx.strokeStyle = "rgba(200,250,255,.7)"; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-22 - i * 4, -5 + i * 5); ctx.lineTo(-30 - i * 6, -5 + i * 5); ctx.stroke(); } }
  ctx.restore();
}

function drawMedusa(ctx, e, t, pose, tier) {
  const ph = t * 0.12 + (e.bob || 0), pulse = Math.sin(ph * (pose === "attack" ? 3 : 1));
  const bell = ["#ff8ad0", "#b48aff", "#7af0ff"][tier], rim = ["#ff4fb0", "#8050ff", "#30c0ff"][tier];
  ctx.save(); if (pose === "die") ctx.globalAlpha = 0.5;
  if (pose === "telegraph") warnRing(ctx, 0, 0, 24, t, "#fff36a");
  const bw = 16 + pulse * 1.8, bh = 13 - pulse * 1.5;
  // tentáculos ondulantes
  const n = 5 + tier;
  for (let i = 0; i < n; i++) {
    const x0 = -bw * 0.8 + (i / (n - 1)) * bw * 1.6;
    ctx.strokeStyle = i % 2 ? "rgba(255,255,255,.55)" : bell; ctx.lineWidth = i % 2 ? 1.4 : 2.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0, 2);
    for (let s = 1; s <= 6; s++) ctx.lineTo(x0 + Math.sin(ph * 2 + s * 0.9 + i) * (1.5 + s * 0.6), 2 + s * (3.4 + pulse * 0.4));
    ctx.stroke();
  }
  // brazos orales
  ctx.fillStyle = rim; ctx.globalAlpha *= 0.8;
  for (const sx of [-4, 4]) { ctx.beginPath(); ctx.moveTo(sx - 2, 2); ctx.quadraticCurveTo(sx + Math.sin(ph * 2) * 4, 12, sx, 18); ctx.quadraticCurveTo(sx + 3, 10, sx + 2, 2); ctx.fill(); }
  ctx.globalAlpha /= 0.8;
  // campana translúcida en capas
  ctx.globalAlpha *= 0.55; ctx.fillStyle = bell; ctx.beginPath(); ctx.ellipse(0, 2, bw, bh + 2, 0, Math.PI, 0); ctx.fill();
  ctx.globalAlpha /= 0.55; ctx.globalAlpha *= 0.85;
  ctx.fillStyle = bell; ctx.beginPath(); ctx.ellipse(0, 2, bw - 2.5, bh, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.globalAlpha /= 0.85;
  ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i <= 8; i++) { const x = -bw + (i / 8) * bw * 2; ctx.lineTo(x, 2 + (i % 2) * 2); } ctx.stroke();
  ell(ctx, -5, -6, 5, 3, "rgba(255,255,255,.55)", -0.3);
  ctx.fillStyle = "rgba(255,255,255,.35)"; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-6 + i * 4, -2, 1.6, 0, TAU); ctx.fill(); }
  eye(ctx, -4.5, -3, 2.3, tier > 0); eye(ctx, 4.5, -3, 2.3, tier > 0);
  if (pose === "attack" || pose === "telegraph") {
    ctx.strokeStyle = pose === "attack" ? "#fff36a" : "rgba(255,243,106,.6)"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + t * 0.2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 12); ctx.lineTo(Math.cos(a + 0.2) * 20, Math.sin(a + 0.2) * 17); ctx.lineTo(Math.cos(a - 0.1) * 25, Math.sin(a - 0.1) * 21); ctx.stroke(); }
  }
  ctx.restore();
}

function drawAnguila(ctx, e, t, pose, tier) {
  const dir = (e.vx || 0) >= 0 ? 1 : -1, ph = t * 0.2 + (e.bob || 0);
  const body = ["#2fb8a8", "#2a8ac0", "#4a3aa0"][tier], spot = ["#e8ff6a", "#7af0ff", "#ff6af0"][tier];
  const N = 11, L = 58, amp = pose === "attack" ? 2 : pose === "telegraph" ? 3 : 5;
  const pts = [];
  for (let i = 0; i < N; i++) { const u = i / (N - 1); pts.push([L / 2 - u * L, Math.sin(ph - u * 5.5) * amp * (0.3 + u)]); }
  ctx.save(); ctx.scale(dir, 1); if (pose === "die") ctx.scale(1, -1);
  const glow = pose === "attack" || pose === "telegraph" || tier >= 2;
  if (glow) { ctx.strokeStyle = pose === "attack" ? "rgba(255,250,140,.55)" : "rgba(120,240,255,.35)"; ctx.lineWidth = 16; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); }
  for (let i = N - 1; i >= 0; i--) {
    const u = i / (N - 1), r = 6.5 * (1 - u * 0.7), [x, y] = pts[i];
    ell(ctx, x, y, r + 1.2, r + 1.2, "rgba(5,20,40,.85)"); ell(ctx, x, y, r, r, body); ell(ctx, x, y + r * 0.4, r * 0.7, r * 0.4, "rgba(255,255,255,.25)");
    if (i % 2 && i > 1) ell(ctx, x, y - r * 0.35, r * 0.3, r * 0.3, spot);
  }
  // aleta dorsal continua
  ctx.strokeStyle = spot; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 2; i < N; i++) { const u = i / (N - 1); ctx.lineTo(pts[i][0], pts[i][1] - 6.5 * (1 - u * 0.7) - 1.5); } ctx.stroke(); ctx.globalAlpha = 1;
  const [hx, hy] = pts[0];
  ell(ctx, hx + 3, hy, 7.5, 5.5, "rgba(5,20,40,.85)"); ell(ctx, hx + 3, hy, 6.5, 4.6, body);
  eye(ctx, hx + 5, hy - 1.8, 2, true);
  ctx.strokeStyle = "#101828"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(hx + 3, hy + 2.2); ctx.lineTo(hx + 9.5, hy + (pose === "attack" ? 3.8 : 1.5)); ctx.stroke();
  if (pose === "attack" || pose === "telegraph") {
    ctx.strokeStyle = "#fff36a"; ctx.lineWidth = pose === "attack" ? 2 : 1.2;
    for (let i = 1; i < N; i += 2) { const [x, y] = pts[i], s = Math.sin(t * 1.3 + i) > 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(x, y - 6 * s); ctx.lineTo(x + 3, y - 10 * s); ctx.lineTo(x - 1, y - 12 * s); ctx.lineTo(x + 2, y - 16 * s); ctx.stroke(); }
    if (pose === "telegraph") warnRing(ctx, hx + 3, hy, 10, t, "#fff36a");
  }
  ctx.restore();
}

function drawCangrejo(ctx, e, t, pose, tier) {
  const dir = (e.vx || 0) >= 0 ? 1 : -1, ph = t * (pose === "move" ? 0.6 : 0.1);
  const shell = ["#e07040", "#d04040", "#a03ab0"][tier], dark = ["#8a3418", "#7a1818", "#501860"][tier], pale = "#ffd0a0";
  ctx.save(); if (pose === "die") ctx.rotate(Math.PI);
  const lift = pose === "telegraph" ? -5 : 0;
  // 8 patas laterales (4 por lado)
  ctx.strokeStyle = dark; ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const a = Math.sin(ph + i * 1.3 + (s > 0 ? Math.PI : 0)) * (pose === "move" ? 3.5 : 0.8);
    const bx = s * (8 + i * 1.5), by = 2 + i * 1.6;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(s * (16 + i * 2), by - 5 + a); ctx.lineTo(s * (19 + i * 2.6), 12 + Math.max(0, a)); ctx.stroke();
  }
  // pinzas grandes
  const open = pose === "telegraph" ? 0.75 : pose === "attack" ? 0.05 : 0.25 + Math.sin(t * 0.15) * 0.1;
  for (const s of [-1, 1]) {
    const big = s === dir ? 1.2 + tier * 0.1 : 1;
    const cx = s * 17, cy = -8 + lift + (pose === "attack" ? -2 : 0);
    ctx.strokeStyle = dark; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(s * 9, -1); ctx.lineTo(s * 13, -5 + lift); ctx.lineTo(cx, cy + 3); ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s * big, big);
    ell(ctx, 0, 0, 6.4, 5.2, dark); ell(ctx, 0, 0, 5.4, 4.3, shell);
    ctx.fillStyle = shell; ctx.strokeStyle = dark; ctx.lineWidth = 1.4;
    ctx.save(); ctx.rotate(-open); ctx.beginPath(); ctx.moveTo(3, -2); ctx.quadraticCurveTo(11, -6, 12, -1); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.rotate(open * 0.6); ctx.beginPath(); ctx.moveTo(3, 1); ctx.quadraticCurveTo(10, 4, 11, 1); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    ell(ctx, -1.5, -1.5, 1.8, 1.1, "rgba(255,255,255,.5)");
    ctx.restore();
    if (pose === "attack") { ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx + s * 10, cy, 5, 0, TAU); ctx.stroke(); }
  }
  // caparazón
  ctx.strokeStyle = dark; ctx.lineWidth = 2.4; ctx.fillStyle = shell;
  ctx.beginPath(); ctx.moveTo(-14, 3); ctx.quadraticCurveTo(-15, -9, 0, -10); ctx.quadraticCurveTo(15, -9, 14, 3); ctx.quadraticCurveTo(0, 9, -14, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; for (const x of [-11, -6, 6, 11]) { ctx.beginPath(); ctx.moveTo(x - 1.5, -6); ctx.lineTo(x, -9.5); ctx.lineTo(x + 1.5, -6); ctx.fill(); }
  ell(ctx, 0, 4, 9, 2.4, pale); ell(ctx, -5, -5, 4, 2, "rgba(255,255,255,.35)", -0.3);
  if (tier >= 1) { ctx.fillStyle = tier >= 2 ? "#ffe066" : dark; for (const x of [-4, 0, 4]) ell(ctx, x, -2, 1.2, 1.2, ctx.fillStyle); }
  // ojos en pedúnculos
  for (const s of [-1, 1]) {
    const ey = -16 + Math.sin(t * 0.1 + s) * 1;
    ctx.strokeStyle = dark; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(s * 4, -9); ctx.lineTo(s * 5, ey); ctx.stroke();
    eye(ctx, s * 5, ey, 2.4, pose !== "idle" || tier > 0);
  }
  if (pose === "telegraph") warnRing(ctx, dir * 18, -8, 9, t, "#ff5040");
  ctx.restore();
}

const DRAW = { pez: drawPez, medusa: drawMedusa, anguila: drawAnguila, cangrejo: drawCangrejo };

/** Dibuja pez/medusa/anguila/cangrejo con origen en el centro. Devuelve true si lo dibujó. */
export function drawChispinFoe(ctx, e, t) {
  if (!e || !IDSET.has(e.kind)) return false;
  const pose = poseOf(e), tt = t || 0;
  ctx.save();
  if (pose === "hit") { ctx.translate(-((e.vx || 0) >= 0 ? 3 : -3), 0); ctx.rotate(Math.sin(tt * 2) * 0.12); }
  const hid = e.kind === "anguila" && e.hidden && !(e.peek > 0.2);
  if (hid) { // grieta + anguila asomando apenas
    ctx.fillStyle = "#13202c"; ctx.fillRect(-16, 6, 32, 5);
    ctx.globalAlpha = 0.3;
  }
  DRAW[e.kind](ctx, e, tt, pose, tierOf(e));
  ctx.globalAlpha = 1;
  drawChispinWarn(ctx, e, tt);
  ctx.restore();
  return true;
}
export function isChispinFoe(e) { return !!e && IDSET.has(e.kind); }

// Avisos de la IA (chispin-ai.js): anillo medusa y línea anguila. Sin gradientes.
function drawChispinWarn(ctx, e, t) {
  if (e.kind === "medusa" && e.ringT > 0) {
    const r = 14 + e.ringT * 34;
    ctx.strokeStyle = (t >> 2) & 1 ? "#fff6a0" : "#ff8ad0";
    ctx.lineWidth = 2; ctx.globalAlpha = 0.5 + e.ringT * 0.5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (e.kind === "anguila" && e.lineAim != null) {
    ctx.save(); ctx.rotate(e.lineAim);
    ctx.strokeStyle = "#7ee7ff"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.globalAlpha = (t >> 2) & 1 ? 0.9 : 0.5;
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(120, 0); ctx.stroke();
    ctx.setLineDash([]); ctx.restore(); ctx.globalAlpha = 1;
  }
}
