// V372 · Bichos de Stitcho: abeja (y avispa), libélula, araña y murciélago.
// Dibujo vectorial plano (sin gradientes), anatomía reconocible y poses
// idle / walk / telegraph / lunge / hurt / die. Solo visual: no toca IA, daño ni vida.
import { foePose } from "../foe-rig.js";

const TAU = Math.PI * 2;
const INK = "#1d1424";
export const STITCHO_FOE_KINDS = Object.freeze(["abeja", "libelula", "arana", "murcielago"]);
// La avispa (kind "avispa" o variant "avispa") la dibuja kilo-foes: aquí se devuelve false.
export const isAvispa = (e) => e?.kind === "avispa" || e?.variant === "avispa";

/** Pose extendida: añade "hurt" cuando el bicho acaba de recibir un golpe. */
export function stitchoFoePose(e) {
  const p = foePose(e);
  if (p === "die") return p;
  if ((Number(e?.flash) || 0) > 6 || (Number(e?.hurtT) || 0) > 0) return "hurt";
  return p;
}
/** Variante visual: avispa > élite > normal. */
export function stitchoFoeVariant(e) {
  return e?.elite ? "elite" : "normal";
}
function ell(ctx, x, y, rx, ry, rot, fill, lw = 1.8, stroke = INK) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function line(ctx, pts, w, col = INK) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
}
function eye(ctx, x, y, r, angry, dead) {
  if (dead) { line(ctx, [[x - r, y - r], [x + r, y + r]], 1.6); line(ctx, [[x + r, y - r], [x - r, y + r]], 1.6); return; }
  ell(ctx, x, y, r, r, 0, "#fff", 1.2);
  ell(ctx, x + r * .25, y + r * .1, r * .55, r * .6, 0, INK, 0);
  ell(ctx, x - r * .1, y - r * .3, r * .22, r * .22, 0, "#fff", 0);
  if (angry) line(ctx, [[x - r * 1.2, y - r * 1.4], [x + r * 1.1, y - r * .8]], 1.6);
}
/** Aviso de ataque: contorno parpadeante + flecha en la dirección. */
function telegraphMark(ctx, t, r, col) {
  const k = .5 + .5 * Math.sin(t * .7);
  ctx.save(); ctx.globalAlpha *= .55 + .45 * k; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * .6;
  ell(ctx, 0, 0, r * (1.15 + k * .1), r * (.95 + k * .08), 0, null, 2.2, col); ctx.setLineDash([]);
  line(ctx, [[r * 1.2, 0], [r * 1.65, 0]], 2.4, col); line(ctx, [[r * 1.45, -4], [r * 1.68, 0], [r * 1.45, 4]], 2.4, col);
  ctx.restore();
}

// ---------------- abeja / avispa ----------------
function drawBee(ctx, e, t, pose, v) {
  const wasp = v === "avispa", elite = v === "elite";
  const body = wasp ? "#ffb21f" : "#ffd23a", stripe = wasp ? "#20140c" : "#3a2410";
  const flap = pose === "die" ? 0 : Math.sin(t * (pose === "lunge" ? 1.6 : 1.1));
  const tilt = pose === "lunge" ? .35 : pose === "telegraph" ? -.25 : pose === "hurt" ? -.4 : 0;
  ctx.rotate(tilt);
  // alas traseras + delanteras translúcidas con venas
  for (const [ox, rot, a] of [[-3, -.9, .38], [3, -.5, .55]]) {
    ctx.save(); ctx.translate(ox, -7); ctx.rotate(rot + flap * .45);
    ell(ctx, 0, -7, 5.5, 9, 0, `rgba(225,245,255,${a})`, 1.2, "rgba(40,60,90,.7)");
    line(ctx, [[0, -1], [0, -14]], .8, "rgba(40,60,90,.55)"); ctx.restore();
  }
  // abdomen con rayas + aguijón
  const ab = pose === "telegraph" ? 1.12 : 1;
  ell(ctx, -6, 2, 10 * ab, 8, .15, body);
  ctx.save(); ctx.beginPath(); ctx.ellipse(-6, 2, 10 * ab, 8, .15, 0, TAU); ctx.clip();
  ctx.fillStyle = stripe; for (let i = 0; i < 3; i++) ctx.fillRect(-14 + i * 5.5, -8, 2.6, 18);
  ctx.restore(); ell(ctx, -6, 2, 10 * ab, 8, .15, null);
  const sting = pose === "telegraph" ? 8 : pose === "lunge" ? 10 : 5;
  ctx.beginPath(); ctx.moveTo(-15 * ab, 3); ctx.lineTo(-15 * ab - sting, 5); ctx.lineTo(-15 * ab, 7); ctx.closePath();
  ctx.fillStyle = "#2a1a10"; ctx.fill();
  // tórax peludo + cabeza
  ell(ctx, 5, 0, 6, 6, 0, wasp ? "#3a2410" : "#f2b632");
  for (let i = 0; i < 5; i++) line(ctx, [[1 + i * 2, -6], [1.5 + i * 2, -7.6]], 1, INK);
  ell(ctx, 12, 0, 5.4, 5.6, 0, stripe);
  eye(ctx, 13.5, -1, 2.4, wasp || elite || pose === "telegraph", pose === "die");
  line(ctx, [[12, -5], [14, -10], [17, -11]], 1.2); line(ctx, [[10, -5], [10, -10], [12, -12]], 1.2);
  // patitas
  for (let i = 0; i < 3; i++) line(ctx, [[2 + i * 3, 5], [i * 3, 9 + Math.sin(t * .3 + i) * .8], [-1 + i * 3, 11]], 1.2);
  if (elite) { ctx.fillStyle = "#fff6a0"; ctx.beginPath(); ctx.arc(5, -15, 2.4, 0, TAU); ctx.fill(); line(ctx, [[1, -13], [5, -17], [9, -13]], 1.2, "#c58a00"); }
  if (pose === "telegraph" && FX_ON) telegraphMark(ctx, t, 16, wasp ? "#ff7a2a" : "#ffe14a");
}

// ---------------- libélula ----------------
function drawDragonfly(ctx, e, t, pose, v) {
  const elite = v === "elite", col = elite ? "#3fd0ff" : "#3fbf7f", dark = elite ? "#145a7a" : "#1f6a45";
  const flap = pose === "die" ? .2 : Math.sin(t * 1.4);
  ctx.rotate(pose === "lunge" ? .12 : pose === "hurt" ? -.35 : 0);
  // 4 alas venadas (par delantero y trasero, desfasados)
  for (const [ox, side, ph] of [[2, -1, 0], [-2, -1, 1.4], [2, 1, 0], [-2, 1, 1.4]]) {
    ctx.save(); ctx.translate(ox, -2); ctx.rotate(side * (.25 + (Math.sin(t * 1.4 + ph) * .5 + .5) * .5) * (pose === "die" ? .2 : 1) + (side < 0 ? Math.PI : 0) * 0);
    const L = 18, a = side < 0 ? -1 : 1;
    ctx.beginPath(); ctx.ellipse(0, a * -8, 3.4, L / 2, 0, 0, TAU);
    ctx.fillStyle = "rgba(210,250,255,.42)"; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = "rgba(20,70,80,.75)"; ctx.stroke();
    line(ctx, [[0, 0], [0, a * -16]], .7, "rgba(20,70,80,.6)");
    for (let i = 1; i < 4; i++) line(ctx, [[0, a * -i * 4], [2.6, a * (-i * 4 - 2)]], .5, "rgba(20,70,80,.5)");
    ctx.restore();
  }
  void flap;
  // abdomen largo segmentado
  const curl = pose === "telegraph" ? .35 : pose === "lunge" ? -.1 : Math.sin(t * .1) * .06;
  let x = -3, y = 1, a = Math.PI + curl * .5;
  for (let i = 0; i < 7; i++) {
    const nx = x + Math.cos(a) * 4, ny = y + Math.sin(a) * 4;
    ell(ctx, (x + nx) / 2, (y + ny) / 2, 2.6 - i * .15, 1.9 - i * .1, a, i % 2 ? col : dark, 1.1);
    x = nx; y = ny; a += curl * .18;
  }
  // tórax + cabeza con ojos compuestos grandes
  ell(ctx, 1, 0, 5, 4.2, 0, col);
  ell(ctx, 8, -1, 4.5, 4.2, 0, dark);
  eye(ctx, 9.5, -2.5, 2.8, pose === "telegraph" || elite, pose === "die");
  for (let i = 0; i < 3; i++) line(ctx, [[i * 2, 3.5], [i * 2 - 1, 7.5]], 1);
  if (pose === "telegraph" && FX_ON) telegraphMark(ctx, t, 15, "#7cffd0");
}

// ---------------- araña ----------------
function drawSpider(ctx, e, t, pose, v) {
  const elite = v === "elite", body = elite ? "#4a1a3a" : "#3a2420", mark = elite ? "#ff5fa8" : "#e05a2a";
  const walk = pose === "walk" ? t * .55 : t * .06;
  const crouch = pose === "telegraph" ? 3 : pose === "lunge" ? -3 : 0;
  ctx.translate(0, crouch);
  if (pose === "hurt") ctx.rotate(-.15);
  // hilo de seda cuando está al acecho
  { const hang = Number(e._sai?.hang); if (FX_ON && (pose === "idle" || pose === "telegraph" || hang > 0)) line(ctx, [[2, -8], [2, -8 - (Number.isFinite(hang) ? hang / Math.max(.3, STITCHO_LAST_S) + 10 : 52)]], .9, "rgba(235,235,245,.75)"); }
  // 8 patas articuladas (4 por lado; la cercana más oscura detrás)
  for (let side = 0; side < 2; side++) for (let i = 0; i < 4; i++) {
    const ph = walk + i * 1.3 + side * Math.PI, sw = Math.sin(ph) * (pose === "walk" ? 3 : 1);
    const bx = -2 + i * 3, dir = i < 2 ? 1 : -1, reach = pose === "die" ? .4 : 1;
    const kx = bx + dir * (9 + i * 2) * reach + sw, ky = -9 - (dir < 0 ? 7 : 0) - (side ? 1 : 0) + (pose === "die" ? 6 : 0);
    const fx = bx + dir * (15 + i * 3 + (dir < 0 ? 6 : 0)) * reach + sw * 1.4, fy = 9 + (Math.cos(ph) > 0 && pose === "walk" ? -2 : 0) - (pose === "die" ? 6 : 0);
    line(ctx, [[bx, 0], [kx, ky], [fx, fy]], side ? 1.9 : 2.2, side ? "#120a0a" : INK);
  }
  // abdomen con marca + cefalotórax
  ell(ctx, -7, -2, 9, 8, 0, body);
  ctx.fillStyle = mark; ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(-4, -2); ctx.lineTo(-7, 3); ctx.lineTo(-10, -2); ctx.closePath(); ctx.fill();
  ell(ctx, 4, 0, 6, 5, 0, body);
  // 8 ojitos (2 grandes + 6 pequeños) y quelíceros
  const dead = pose === "die";
  eye(ctx, 6, -2, 1.9, pose === "telegraph", dead); eye(ctx, 9, -2, 1.9, pose === "telegraph", dead);
  if (!dead) { ctx.fillStyle = elite ? "#ff9fd0" : "#ffd27a"; for (const [x, y] of [[4, -4.5], [7.5, -5], [11, -4.5], [5, .2], [8, .5], [10.5, .2]]) { ctx.beginPath(); ctx.arc(x, y, .9, 0, TAU); ctx.fill(); } }
  const open = pose === "lunge" ? 2 : pose === "telegraph" ? 1.2 : .4;
  line(ctx, [[9, 3], [11, 5 + open]], 1.6); line(ctx, [[7, 3], [8, 5.5 + open]], 1.6);
  if (pose === "telegraph" && FX_ON) telegraphMark(ctx, t, 15, "#ff7a3a");
}

// ---------------- murciélago ----------------
function drawBat(ctx, e, t, pose, v) {
  const elite = v === "elite", fur = elite ? "#5a2a7a" : "#4a3060", mem = elite ? "rgba(150,80,200,.85)" : "rgba(110,70,140,.85)";
  const hang = pose === "idle" && (Number(e.vx) || 0) === 0 && (Number(e.vy) || 0) === 0;
  const flap = pose === "die" ? -.2 : hang ? -.9 : Math.sin(t * (pose === "lunge" ? 1.3 : .9));
  if (pose === "hurt") ctx.rotate(.3);
  if (pose === "lunge") ctx.rotate(.25);
  // alas membranosas con 3 dedos por lado
  for (const side of [-1, 1]) {
    ctx.save(); ctx.scale(side, 1); ctx.rotate(-flap * .55);
    const tip = [22, -6 - flap * 6], f1 = [17, 6], f2 = [10, 9];
    ctx.beginPath(); ctx.moveTo(3, -3); ctx.lineTo(9, -8 - flap * 3); ctx.lineTo(tip[0], tip[1]);
    ctx.quadraticCurveTo(19, 2, f1[0], f1[1]); ctx.quadraticCurveTo(13, 5, f2[0], f2[1]); ctx.quadraticCurveTo(6, 5, 3, 4); ctx.closePath();
    ctx.fillStyle = mem; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    line(ctx, [[9, -8 - flap * 3], f1], 1, INK); line(ctx, [[9, -8 - flap * 3], f2], 1, INK);
    ctx.fillStyle = "#e8d8f0"; ctx.beginPath(); ctx.arc(9, -8 - flap * 3, 1.2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // cuerpo, orejas grandes, cara y colmillos
  ell(ctx, 0, 1, 6, 7, 0, fur);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 2, -5); ctx.lineTo(s * 5.5, -13); ctx.lineTo(s * 6, -4); ctx.closePath(); ctx.fillStyle = fur; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(s * 3.5, -6); ctx.lineTo(s * 5.2, -10.5); ctx.lineTo(s * 5.3, -5.5); ctx.fillStyle = "#c48ab0"; ctx.fill(); }
  ell(ctx, 0, -3, 5, 4.4, 0, fur);
  const dead = pose === "die", angry = pose === "telegraph" || pose === "lunge" || elite;
  eye(ctx, -2, -4, 1.6, angry, dead); eye(ctx, 2, -4, 1.6, angry, dead);
  const mo = pose === "lunge" || pose === "telegraph" ? 2 : .6;
  ctx.fillStyle = "#3a0f20"; ctx.beginPath(); ctx.ellipse(0, -.5, 2.2, mo, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "#fff"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 1.4, -1); ctx.lineTo(s * 1, 1.4 + mo * .5); ctx.lineTo(s * .4, -1); ctx.closePath(); ctx.fill(); }
  line(ctx, [[-2, 7], [-2.5, 10]], 1.2); line(ctx, [[2, 7], [2.5, 10]], 1.2);
  if (pose === "telegraph" && FX_ON) { telegraphMark(ctx, t, 18, "#c89cff"); ctx.save(); ctx.globalAlpha *= .6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(8, -2, 6 + i * 4 + (t * .4 % 4), -.6, .6); ctx.lineWidth = 1.4; ctx.strokeStyle = "#e0c8ff"; ctx.stroke(); } ctx.restore(); }
}

const DRAW = { abeja: drawBee, libelula: drawDragonfly, arana: drawSpider, murcielago: drawBat };
// Semiextensión de la silueta en unidades de dibujo (máximo medido en todas las
// poses, alas/patas abiertas incluidas, sin FX de aviso ni hilo). Se usa para
// encajar el dibujo en la caja real e.w × e.h (desborde máx. FIT-1 = 10 %).
export const STITCHO_FOE_EXTENT = Object.freeze({ abeja: [25.5, 24], libelula: [31.5, 23], arana: [27.5, 20.5], murcielago: [24.5, 24.5] });
export const STITCHO_FOE_FIT = 1.1;
let FX_ON = true, STITCHO_LAST_S = 1;

/**
 * Dibuja el bicho centrado en (0,0) del ctx actual (mismo contrato que
 * drawLibelula/drawAbeja/... de enemies.js). Devuelve true si lo dibujó.
 */
export function stitchoFoeScale(e) {
  const ext = STITCHO_FOE_EXTENT[e?.kind];
  if (!ext || !ext[0]) return 1;
  const w = Math.max(4, Number(e.w) || 20), h = Math.max(4, Number(e.h) || 20);
  return Math.min(w / 2 * STITCHO_FOE_FIT / ext[0], h / 2 * STITCHO_FOE_FIT / ext[1]);
}
export function drawStitchoFoe(ctx, e, t = 0, { fx = true, unit = false } = {}) {
  const fn = e && DRAW[e.kind];
  if (!fn || isAvispa(e)) return false;
  const pose = stitchoFoePose(e), v = stitchoFoeVariant(e);
  const s = unit ? 1 : stitchoFoeScale(e);
  STITCHO_LAST_S = s;
  FX_ON = fx;
  ctx.save();
  ctx.scale((Number(e.vx) || 0) < 0 ? -s : s, s);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (pose === "die") { ctx.globalAlpha *= .75; ctx.rotate(.9); ctx.translate(0, 3); }
  if (pose === "hurt") ctx.translate(-2, 0);
  try { fn(ctx, e, Number(t) || 0, pose, v); } finally { FX_ON = true; }
  ctx.restore();
  return true;
}
export default { kinds: STITCHO_FOE_KINDS, draw: drawStitchoFoe, pose: stitchoFoePose, variant: stitchoFoeVariant };

/** Telas de araña (game._stitchoWebs, las crea stitcho-ai.js). Dibujar tras el mundo. */
export function drawStitchoWebs(ctx, game, cam = game?.cam || { x: 0, y: 0 }) {
  const W = game?._stitchoWebs;
  if (!W?.length) return;
  ctx.save(); ctx.strokeStyle = "rgba(235,235,245,.85)"; ctx.lineWidth = 1.2;
  for (const w of W) {
    const x = w.x - cam.x + w.w / 2, y = w.y - cam.y + w.h / 2;
    ctx.globalAlpha = Math.min(1, w.life / 40);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * w.w / 2, y + Math.sin(a) * w.h / 2); ctx.stroke(); }
    for (let r = 1; r <= 3; r++) { ctx.beginPath(); ctx.ellipse(x, y, w.w / 2 * r / 3, w.h / 2 * r / 3, 0, 0, TAU); ctx.stroke(); }
  }
  ctx.restore();
}
