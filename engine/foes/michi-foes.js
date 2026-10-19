// V372 · Arte nuevo para rana, planta y gaviota (dueña: Ohana Michi).
// Solo dibujo: no cambia daño, HP, IA ni hitbox. Canvas2D plano, sin gradientes por frame.
// Hook (enemies.js, en drawEnemy, justo antes de `else if (drawFoeRig(ctx, e, t))`):
//   else if (drawMichiFoe(ctx, e, t)) { /* rana / planta / gaviota */ }
// El contexto llega con el origen en el centro del enemigo (como el resto de draw*).
const TAU = Math.PI * 2;
export const MICHI_FOE_KINDS = Object.freeze(["rana", "planta", "gaviota"]);

// Variante por dureza de sala: el HP base sale de foes.js (base + hard*k), así que se deduce sin tocar nada.
const BASE = { rana: [24, 12], planta: [36, 18], gaviota: [22, 10] };
export function michiFoeTier(e) {
  const b = BASE[e?.kind]; if (!b) return 0;
  const max = Number(e.max) / (e.elite ? 1.75 : 1);
  return Math.max(0, Math.min(3, Math.round((max - b[0]) / b[1]) || 0));
}
export function michiFoePose(e) {
  if (!e) return "idle";
  if ((e._hitT || 0) > 0 || (e.flash || 0) > 6) return "hurt";
  if(e.campaignRole&&e._campaign?.wind>0)return 'telegraph';
  if(e.campaignRole&&e._campaign?.active>0)return e.kind==='rana'?'jump':'attack';
  if (e.kind === "rana") return (e.hopWind > 0 || e.tongueWind > 0) ? "telegraph" : Math.abs(e.vy || 0) > 1 ? "jump" : (e.sitting > 0 || !e.vx) ? "idle" : "move";
  if (e.kind === "planta") return !e.up ? "hidden" : e.plantWind > 0 ? "telegraph" : ((e.plantWind | 0) === 0 && (e.shoot || 0) >= 20 && (e.shoot || 0) < 32) ? "attack" : "idle";
  if (e.kind === "gaviota") return e.diving ? "attack" : e.telegraph ? "telegraph" : "move";
  return "idle";
}
function facing(e) {
  if (Math.abs(e.vx || 0) > 0.05) e._mfDir = e.vx > 0 ? 1 : -1;
  if (e.kind === "planta" && e.aimDx != null) e._mfDir = e.aimDx >= 0 ? 1 : -1;
  return e._mfDir || 1;
}
function blob(ctx, x, y, rx, ry, rot, fill, line, lw = 2) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
  ctx.fillStyle = fill; ctx.fill();
}

// ---------------------------------------------------------------- RANA
const FROG = [
  { line: "#1d4a1f", body: "#5cbf4a", dark: "#3a8f34", spot: "#2f7a2c", belly: "#f1f5c8", iris: "#f2c230" },
  { line: "#0f3a4a", body: "#36b6c9", dark: "#2386a0", spot: "#123f5c", belly: "#e6fbff", iris: "#ffd23a" },
  { line: "#3a1608", body: "#ff8a1e", dark: "#d4600e", spot: "#1a1010", belly: "#ffe7b8", iris: "#111" },
  { line: "#2a0f3a", body: "#9a5cff", dark: "#6b36cf", spot: "#ffd23a", belly: "#f3e8ff", iris: "#ff5a8a" },
];
function drawRana(ctx, e, t, pose, tier) {
  const P = FROG[tier], dir = facing(e);
  const breathe = Math.sin(t * 0.12 + e.x * 0.01);
  let sx = 1, sy = 1, lift = 0, legOut = 0, sac = pose === "idle" ? (breathe * 0.5 + 0.5) * 0.6 : 0;
  if (pose === "telegraph") { const k = e.tongueWind > 0 ? 1 - e.tongueWind / 18 : 1 - (e.hopWind || 0) / 24; sx = 1.12 + k * 0.08; sy = 0.84 - k * 0.08; sac = 0.4 + k * 0.6; }
  else if (pose === "jump") { const up = (e.vy || 0) < 0; sx = up ? 0.86 : 0.95; sy = up ? 1.18 : 1.05; legOut = up ? 1 : 0.5; lift = -2; }
  else if (pose === "move") { const k = Math.abs(Math.sin(t * 0.3)); sy = 1 - k * 0.06; lift = -k * 2; }
  else if (pose === "hurt") { sx = 1.1; sy = 0.86; }
  ctx.save(); ctx.scale(dir, 1); ctx.translate(0, 14);  // origen en los pies
  ctx.scale(sx, sy); ctx.translate(0, lift);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // Patas traseras: muslo + pie largo con dedos (estiradas en salto).
  if (legOut > 0) {
    ctx.strokeStyle = P.line; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-20, -1); ctx.lineTo(-30, 3); ctx.stroke();
    ctx.strokeStyle = P.dark; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-20, -1); ctx.lineTo(-30, 3); ctx.stroke();
    for (let i = -1; i <= 1; i++) blob(ctx, -32, 3 + i * 2.6, 2.6, 1.6, 0, P.dark, P.line, 1.2);
  } else {
    blob(ctx, -10, -5, 9, 7, -0.3, P.dark, P.line);
    ctx.fillStyle = P.dark; ctx.strokeStyle = P.line; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(-8, -0.5, 9, 2.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 3; i++) blob(ctx, -1 + i * 0.5, -0.8 + (i - 1) * 1.8, 1.9, 1.5, 0, P.body, P.line, 1);
  }
  // Cuerpo en gota con lomo.
  ctx.beginPath(); ctx.moveTo(-15, -4); ctx.quadraticCurveTo(-14, -20, 2, -20); ctx.quadraticCurveTo(15, -19, 15, -8); ctx.quadraticCurveTo(15, -1, 5, -1); ctx.lineTo(-10, -1); ctx.quadraticCurveTo(-16, -1, -15, -4); ctx.closePath();
  ctx.fillStyle = P.body; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 2.2; ctx.stroke();
  // Manchas + banda clara del lomo (sombreado plano).
  ctx.fillStyle = P.dark; ctx.beginPath(); ctx.ellipse(-4, -6, 10, 3.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.spot;
  for (const [x, y, r] of [[-8, -13, 2.4], [-1, -16, 1.8], [-11, -8, 1.6], [4, -12, 1.5]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  // Barriga + saco vocal que se infla.
  blob(ctx, 7, -4, 7, 3.2, 0, P.belly);
  if (sac > 0.05) blob(ctx, 9, -3 + sac, 4 + sac * 4, 2.5 + sac * 3.5, 0, P.belly, P.line, 1.4);
  // Pata delantera.
  ctx.strokeStyle = P.line; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(9, -0.5); ctx.stroke();
  ctx.strokeStyle = P.body; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(9, -0.5); ctx.stroke();
  blob(ctx, 10.5, -0.5, 2.6, 1.3, 0, P.body, P.line, 1);
  // Boca ancha.
  ctx.strokeStyle = P.line; ctx.lineWidth = 1.6; ctx.beginPath();
  if (pose === "hurt") { ctx.moveTo(4, -9); ctx.lineTo(8, -10.5); ctx.lineTo(11, -9); ctx.lineTo(14, -10.5); }
  else ctx.moveTo(1, -9.5), ctx.quadraticCurveTo(9, -7, 15, -10);
  ctx.stroke();
  // Ojos saltones arriba (el de atrás asoma).
  const blink = pose === "idle" && ((t + (e.x | 0)) % 170) < 6;
  const angry = pose === "telegraph";
  for (const [ex, back] of [[0, true], [8, false]]) {
    blob(ctx, ex, -20, 5.2, 5, 0, back ? P.dark : P.body, P.line);
    if (blink || pose === "hurt") { ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(ex - 3, -20); ctx.lineTo(ex + 3, -20 + (pose === "hurt" ? 1 : 0)); ctx.stroke(); continue; }
    blob(ctx, ex + 0.6, -20.3, 3.6, 3.4, 0, angry ? "#ff3b30" : P.iris);
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.ellipse(ex + 0.6, -20.3, 2.4, angry ? 1.3 : 0.9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex - 0.8, -22, 0.9, 0, TAU); ctx.fill();
    if (angry) { ctx.strokeStyle = P.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 4, -26); ctx.lineTo(ex + 4, -24); ctx.stroke(); }
  }
  // Variante de sala: cresta de veneno (2+) / brillo de puntos (3).
  if (tier >= 2) { ctx.fillStyle = P.spot; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 5, -16 - i * 1.2); ctx.lineTo(-8 + i * 5, -22 - i); ctx.lineTo(-6 + i * 5, -16 - i * 1.2); ctx.fill(); } }
  // Lengüetazo (michi-ai: tongueLen/tongueY) y aviso de lengua (tongueWind).
  if (e.tongueLen > 2) {
    const tx = 14 + e.tongueLen / 1.25, ty = -9 + (e.tongueY || 0) / 1.25;
    ctx.strokeStyle = "#8a1f3a"; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(13, -9); ctx.quadraticCurveTo((13 + tx) / 2, -12 + (ty + 9) / 2, tx, ty); ctx.stroke();
    ctx.strokeStyle = "#ff7aa8"; ctx.lineWidth = 2.6; ctx.stroke();
    blob(ctx, tx, ty, 3.6, 3.2, 0, "#ff7aa8", "#8a1f3a", 1.4);
  } else if (e.tongueWind > 0) {
    blob(ctx, 14, -9, 2 + (18 - e.tongueWind) / 6, 1.6, 0, "#ff7aa8", "#8a1f3a", 1);
  }
  ctx.restore();
  // Telegraph: polvo bajo los pies (≤4 motas).
  if (pose === "telegraph") { ctx.fillStyle = "rgba(220,240,200,.8)"; for (let i = 0; i < 4; i++) { const ph = ((t + i * 6) % 24) / 24; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc((i - 1.5) * 9 * (1 + ph), 14 - ph * 6, 2.2, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
}

// ---------------------------------------------------------------- PLANTA (atrapamoscas)
const PLANT = [
  { line: "#123a14", stem: "#3f8f2e", leaf: "#5cbf3e", jaw: "#6fcf4a", inside: "#e2363a", teeth: "#fff7d6", dark: "#2c6b22" },
  { line: "#2a1238", stem: "#5a8a3a", leaf: "#7ab84a", jaw: "#b04fd0", inside: "#ff5fae", teeth: "#fff", dark: "#7a2f9a" },
  { line: "#1a0c06", stem: "#4a5a22", leaf: "#6a7a2a", jaw: "#3d3d1e", inside: "#ff7a1a", teeth: "#ffd23a", dark: "#22220e" },
  { line: "#0c2a3a", stem: "#2f7a8a", leaf: "#58c0d0", jaw: "#7ee0f0", inside: "#3a5aff", teeth: "#ffffff", dark: "#2a8aa8" },
];
function jawPath(ctx, len, open, sign) {
  // Lóbulo con forma de concha; sign=-1 arriba, 1 abajo. Rotado por `open`.
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.45, sign * len * 0.62, len, sign * 2);
  ctx.lineTo(0, sign * 1); ctx.closePath();
}
function drawPlanta(ctx, e, t, pose, tier) {
  const P = PLANT[tier], dir = facing(e), ground = 24;
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  // Hojas de la base (siempre).
  for (const [a, l] of [[-2.6, 20], [-0.55, 20], [-2.1, 15], [-1.05, 15]]) {
    ctx.save(); ctx.translate(0, ground - 2); ctx.rotate(a + Math.sin(t * 0.05 + a) * 0.04);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(l * 0.5, -6, l, 0); ctx.quadraticCurveTo(l * 0.5, 6, 0, 0);
    ctx.fillStyle = P.leaf; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.strokeStyle = P.dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(l - 3, 0); ctx.stroke();
    ctx.restore();
  }
  blob(ctx, 0, ground, 13, 4, 0, "#5a3a22", "#2a1a10", 1.5);
  // Charcos de ácido (michi-ai: e.puddles, coordenadas de mundo, 60f).
  if (e.puddles?.length) for (const q of e.puddles) {
    const px = q.x - (e.x + e.w / 2), py = q.y - (e.y + e.h / 2), a = Math.min(1, q.t / 15);
    ctx.globalAlpha = a; blob(ctx, px, py - 1, 16, 4, 0, "#9be04a", "#3a7a12", 1.4);
    ctx.fillStyle = "#e9ffb0"; for (let i = 0; i < 2; i++) { const b = ((t + i * 11) % 22) / 22; ctx.beginPath(); ctx.arc(px - 6 + i * 10, py - 3 - b * 6, 1.8 * (1 - b) + 0.6, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  if (pose === "hidden" || (e.burrowed && pose === "hurt")) {
    // Montículo de tierra con grietas; al asomar (peek) se ven los ojos.
    const pk = e.peek || 0;
    ctx.fillStyle = "#6b4528"; ctx.strokeStyle = "#2a1a10"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(0, ground - 2, 16, 7 + pk * 2, 0, Math.PI, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#3a2414"; ctx.beginPath(); ctx.moveTo(-6, ground - 6); ctx.lineTo(-2, ground - 3); ctx.lineTo(2, ground - 7); ctx.moveTo(5, ground - 5); ctx.lineTo(8, ground - 2); ctx.stroke();
    if (pk > 0) {
      const ey = ground - 6 - pk * 10, sh = Math.sin(t * 0.9) * pk * 1.5;
      ctx.fillStyle = P.jaw; ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(sh, ey + 4, 8, 6 * pk + 2, 0, Math.PI, TAU); ctx.fill(); ctx.stroke();
      for (const ex of [-3, 3]) { blob(ctx, ex + sh, ey, 2.4, 2.4, 0, "#fff", P.line, 1); ctx.fillStyle = "#ff2a2a"; ctx.beginPath(); ctx.arc(ex + sh, ey, 1.1, 0, TAU); ctx.fill(); }
      ctx.fillStyle = "#8a5a32"; for (let i = 0; i < 3; i++) { const b = ((t + i * 7) % 18) / 18; ctx.beginPath(); ctx.arc((i - 1) * 9, ground - 4 - b * 10, 1.6, 0, TAU); ctx.fill(); }
    }
    ctx.restore(); return;
  }
  // Tallo en S que se balancea; en telegraph se echa hacia atrás para escupir.
  const tele = pose === "telegraph", k = tele ? 1 - (e.plantWind || 0) / 20 : 0;
  const sway = Math.sin(t * 0.07 + e.x * 0.01) * 3 - k * 6;
  const hx = dir * (4 + sway * 0.6 - k * 5), hy = -14 - k * 3;
  ctx.strokeStyle = P.line; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, ground); ctx.bezierCurveTo(-dir * 8, 10, dir * (8 + sway), 0, hx, hy); ctx.stroke();
  ctx.strokeStyle = P.stem; ctx.lineWidth = 4.2; ctx.stroke();
  // Hojita en el tallo.
  ctx.save(); ctx.translate(-dir * 3, 8); ctx.rotate(-dir * 0.9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-5, -3, -10, 0); ctx.quadraticCurveTo(-5, 3, 0, 0); ctx.fillStyle = P.leaf; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore();
  // Cabeza: dos mandíbulas con pinchos. Abre según estado.
  let open = 0.35 + Math.abs(Math.sin(t * 0.09)) * 0.15, aim = 0;
  if (tele) { open = 0.5 + k * 0.35; if (e.aimDx != null) aim = Math.max(-0.6, Math.min(0.6, Math.atan2(e.aimDy || 0, Math.abs(e.aimDx) || 1))); }
  if (pose === "attack") open = 0.8;
  if (pose === "hurt") open = 0.05;
  const len = 22 + tier * 1.5;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(dir, 1); ctx.rotate(aim + (pose === "hurt" ? -0.3 : 0));
  // Interior (boca) visible entre mandíbulas.
  ctx.fillStyle = P.inside; ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(-open) * len, Math.sin(-open) * len); ctx.quadraticCurveTo(len * 0.7, 0, Math.cos(open) * len, Math.sin(open) * len); ctx.closePath(); ctx.fill();
  for (const sign of [-1, 1]) {
    ctx.save(); ctx.rotate(sign * open);
    // Pinchos/cilios del borde.
    ctx.strokeStyle = P.teeth; ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) { const u = 0.25 + i * 0.13, px = len * u, py = sign * (len * 0.62 * 2 * u * (1 - u) * 0.9); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 2, py + sign * 6); ctx.stroke(); }
    jawPath(ctx, len, open, sign); ctx.fillStyle = P.jaw; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 2; ctx.stroke();
    // Cara interna roja y dientes hacia dentro.
    ctx.fillStyle = P.inside; ctx.beginPath(); ctx.moveTo(2, sign * 1); ctx.quadraticCurveTo(len * 0.45, sign * len * 0.18, len - 2, sign * 2); ctx.lineTo(2, sign * 1); ctx.fill();
    ctx.fillStyle = P.teeth;
    for (let i = 0; i < 4; i++) { const px = 5 + i * (len - 8) / 3; ctx.beginPath(); ctx.moveTo(px - 2, sign * 1.5); ctx.lineTo(px, -sign * 4); ctx.lineTo(px + 2, sign * 1.5); ctx.fill(); }
    // Manchas de la concha (variante 1+).
    if (tier >= 1) { ctx.fillStyle = P.dark; ctx.beginPath(); ctx.arc(len * 0.45, sign * len * 0.3, 2.2, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  // Ojos sobre la mandíbula superior: rojos en telegraph.
  ctx.save(); ctx.rotate(-open);
  blob(ctx, len * 0.42, -len * 0.33, 4, 4, 0, "#fff", P.line, 1.4);
  ctx.fillStyle = tele ? "#ff2a2a" : "#111"; ctx.beginPath(); ctx.arc(len * 0.45, -len * 0.32, tele ? 2.2 : 1.6, 0, TAU); ctx.fill();
  if (tele) { ctx.strokeStyle = P.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(len * 0.3, -len * 0.5); ctx.lineTo(len * 0.56, -len * 0.42); ctx.stroke(); }
  ctx.restore();
  // Telegraph: bola de ácido creciendo en la boca + babas.
  if (tele || pose === "attack") {
    const r = tele ? 2 + k * 5 : 6;
    blob(ctx, len * 0.55, 0, r, r, 0, "#b6ff5a", "#3a7a12", 1.5);
    ctx.fillStyle = "#e9ffb0"; ctx.beginPath(); ctx.arc(len * 0.55 - r * 0.3, -r * 0.3, r * 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(200,255,140,.8)"; ctx.lineWidth = 1.5; const d = (t % 20) / 20;
    ctx.beginPath(); ctx.moveTo(len * 0.4, 3); ctx.lineTo(len * 0.4, 5 + d * 8); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- GAVIOTA
const GULL = [
  { body: "#ffffff", mantle: "#a9b6c4", tip: "#1d1f24", line: "#3b4652", beak: "#f5c518", spot: "#e2342a", leg: "#f0a07a" },
  { body: "#f7f9fb", mantle: "#7f8fa3", tip: "#14161a", line: "#2c3642", beak: "#ffd23a", spot: "#e2342a", leg: "#f28a5a" },
  { body: "#f2f4f6", mantle: "#4e5a68", tip: "#0c0d10", line: "#1d242c", beak: "#ffb31a", spot: "#d01818", leg: "#ff7a3a" },
  { body: "#ffffff", mantle: "#2d3440", tip: "#000000", line: "#11161c", beak: "#ff9a1a", spot: "#ff2a2a", leg: "#ff6a2a" },
];
function wing(ctx, P, lift, fold, front) {
  // Ala desde el hombro: brazo + mano con primarias negras y espejuelos blancos.
  const span = 30 * (1 - fold * 0.45), tipY = -lift * 16;
  ctx.beginPath(); ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-span * 0.4, tipY * 0.6 - 6, -span, tipY);
  ctx.quadraticCurveTo(-span * 0.62, tipY * 0.4 + 4, -2, 4); ctx.closePath();
  ctx.fillStyle = front ? P.mantle : P.line; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 1.6; ctx.stroke();
  // Primarias negras (último tercio).
  ctx.beginPath(); ctx.moveTo(-span * 0.66, tipY * 0.78 - 2); ctx.quadraticCurveTo(-span * 0.85, tipY * 0.95 - 2, -span, tipY); ctx.quadraticCurveTo(-span * 0.8, tipY * 0.7 + 4, -span * 0.62, tipY * 0.5 + 3); ctx.closePath();
  ctx.fillStyle = P.tip; ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-span * 0.86, tipY * 0.9, 1.4, 0, TAU); ctx.fill();
  // Borde de fuga blanco.
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-4, 3.5); ctx.quadraticCurveTo(-span * 0.35, tipY * 0.35 + 4, -span * 0.6, tipY * 0.5 + 3); ctx.stroke();
}
function drawGaviota(ctx, e, t, pose, tier) {
  const P = GULL[tier], dir = facing(e);
  const dive = pose === "attack", tele = pose === "telegraph", hurt = pose === "hurt";
  const ph = t * (tele ? 0.42 : 0.2) + e.x * 0.02;
  let lift = Math.sin(ph), fold = 0, tilt = 0;
  if (dive) { fold = 1; lift = 0.15; tilt = Math.min(0.75, Math.atan2(e.vy || 4, Math.abs(e.vx || 2))); }
  if (tele) { lift = 0.8 + Math.sin(ph) * 0.3; tilt = -0.25; }
  if (hurt) { lift = -0.3; tilt = 0.3; }
  ctx.save(); ctx.scale(dir, 1); ctx.rotate(tilt); ctx.lineJoin = "round"; ctx.lineCap = "round";
  // Ala lejana (más oscura, detrás).
  ctx.save(); ctx.translate(2, -3); ctx.scale(-0.75, 1); ctx.rotate(dive ? -0.3 : 0.15); wing(ctx, P, lift * 0.9, fold, false); ctx.restore();
  // Patas recogidas (bajadas en telegraph).
  ctx.strokeStyle = P.leg; ctx.lineWidth = 2;
  ctx.beginPath(); if (tele) { ctx.moveTo(-1, 6); ctx.lineTo(0, 13); ctx.moveTo(2, 6); ctx.lineTo(4, 13); } else { ctx.moveTo(-3, 6); ctx.lineTo(-9, 8); } ctx.stroke();
  // Cola gris con punta negra.
  ctx.beginPath(); ctx.moveTo(-10, -1); ctx.lineTo(-20, -3); ctx.lineTo(-20, 3); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fillStyle = P.body; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = P.tip; ctx.fillRect(-20, -3, 3, 6);
  // Cuerpo alargado blanco + manto gris en el lomo.
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-6, -8, 6, -6); ctx.quadraticCurveTo(13, -5, 13, 0); ctx.quadraticCurveTo(10, 7, -2, 7); ctx.quadraticCurveTo(-11, 6, -12, 0); ctx.closePath();
  ctx.fillStyle = P.body; ctx.fill(); ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.fillStyle = P.mantle; ctx.beginPath(); ctx.moveTo(-11, -1); ctx.quadraticCurveTo(-4, -7, 6, -5.5); ctx.quadraticCurveTo(-1, -2, -11, -1); ctx.fill();
  // Cabeza redonda.
  blob(ctx, 13, -6, 6.2, 5.6, 0, P.body, P.line, 1.8);
  // Pico amarillo con mancha roja; se abre en telegraph (graznido).
  const gape = tele ? 0.35 + Math.abs(Math.sin(ph * 1.5)) * 0.25 : hurt ? 0.4 : 0.04;
  ctx.save(); ctx.translate(18, -5.5);
  ctx.fillStyle = P.beak; ctx.strokeStyle = P.line; ctx.lineWidth = 1.2;
  ctx.save(); ctx.rotate(-gape); ctx.beginPath(); ctx.moveTo(0, -1.6); ctx.lineTo(9, -0.4); ctx.quadraticCurveTo(10, 0.6, 8.5, 1); ctx.lineTo(0, 0.6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(gape * 0.6); ctx.beginPath(); ctx.moveTo(0, 0.6); ctx.lineTo(8, 1.2); ctx.lineTo(0, 2.6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.spot; ctx.beginPath(); ctx.arc(6.5, 1.5, 1.3, 0, TAU); ctx.fill(); ctx.restore();
  ctx.restore();
  // Ojo amarillo con pupila y ceño (malhumorada).
  blob(ctx, 15, -7.5, 1.9, 1.9, 0, hurt ? "#fff" : "#ffe14a", P.line, 1);
  if (hurt) { ctx.strokeStyle = P.line; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(13.6, -9); ctx.lineTo(16.4, -6); ctx.moveTo(16.4, -9); ctx.lineTo(13.6, -6); ctx.stroke(); }
  else { ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(15.4, -7.4, 0.9, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = P.line; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(12.5, -10.5); ctx.lineTo(17.5, -9); ctx.stroke();
  // Ala cercana (delante).
  ctx.save(); ctx.translate(2, -2); if (dive) ctx.rotate(-0.45); wing(ctx, P, lift, fold, true); ctx.restore();
  // Variante 2+: cicatriz/banda oscura en la cabeza (gaviota veterana).
  if (tier >= 2) { ctx.strokeStyle = P.mantle; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(9, -9); ctx.lineTo(12, -4); ctx.stroke(); }
  ctx.restore();
  // Graznido (michi-ai: squawk) y cristal robado en el pico (stolen) / devuelto (returnT).
  if (e.squawk) { ctx.save(); ctx.font = "900 9px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "#1d242c"; const sy = -24 - Math.abs(Math.sin(t * 0.5)) * 3; ctx.strokeText("¡KRAA!", dir * 12, sy); ctx.fillStyle = "#ffe14a"; ctx.fillText("¡KRAA!", dir * 12, sy); ctx.restore(); }
  if (e.stolen) { const bx = dir * 27, by = -4; ctx.save(); ctx.translate(bx, by); ctx.rotate(t * 0.05); ctx.fillStyle = "#7ee7ff"; ctx.strokeStyle = "#1a5a8a"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 0); ctx.lineTo(0, 6); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const a = t * 0.2 + i * 2.1, r = 8 + Math.sin(t * 0.3 + i) * 2; ctx.beginPath(); ctx.moveTo(bx + Math.cos(a) * r - 2, by + Math.sin(a) * r); ctx.lineTo(bx + Math.cos(a) * r + 2, by + Math.sin(a) * r); ctx.stroke(); } }
  if (e.returnT > 0) { const k = 1 - e.returnT / 30; ctx.strokeStyle = "#7ee7ff"; ctx.lineWidth = 2; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(0, 0, 8 + k * 26, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  // Picado: líneas de velocidad detrás (3). Golpe: 3 plumas que caen.
  if (dive) { ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { const o = (i - 1) * 7; ctx.beginPath(); ctx.moveTo(-dir * 18, o - 14); ctx.lineTo(-dir * (30 + i * 4), o - 24); ctx.stroke(); } }
  if (hurt) { const k = Math.max(0, Math.min(1, (e._hitT || e.flash || 0) / 10)); ctx.fillStyle = P.body; ctx.strokeStyle = P.line; ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) { const fx = (i - 1) * 9, fy = -6 + (1 - k) * 14 + i * 2; ctx.save(); ctx.translate(fx, fy); ctx.rotate(i + (1 - k) * 2); ctx.beginPath(); ctx.ellipse(0, 0, 3.5, 1.4, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); } }
}

// Escala visual (la hitbox no cambia): la rana y la gaviota antiguas se dibujaban a ×1,3.
const SCALE = { rana: 1.25, gaviota: 1.25, planta: 1 };
const DRAW = { rana: drawRana, planta: drawPlanta, gaviota: drawGaviota };
export function drawMichiFoe(ctx, e, t) {
  const fn = e && DRAW[e.kind];
  if (!fn || e.boss) return false;
  const tt = Number(t) || 0;
  const sc = SCALE[e.kind] || 1;
  ctx.save(); if (sc !== 1) ctx.scale(sc, sc);
  fn(ctx, e, tt, michiFoePose(e), michiFoeTier(e));
  ctx.restore();
  return true;
}
