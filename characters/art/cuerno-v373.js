// V373 · Cuerno renovado: 5 formas cuadrúpedas que crecen con claridad.
//   1 Cuernín · Semilla   → potrito chibi, cabeza enorme, cuernito con brote.
//   2 Destello · Naciente → poni, cuerno corto en espiral, crin corta pastel.
//   3 Potro Iris          → unicornio, crin y cola arcoíris largas.
//   4 Unicornio Estelar   → unicornio alado (alas de pluma), estrellas en la crin.
//   5 Unicornio Negro     → corcel celeste oscuro, alas grandes, crin de estrellas, media luna.
// Contrato igual que characters/art/cuerno.js: draw(ctx, pose, R) con origen en los
// cascos (y=0, arriba negativo), mirando a la derecha; draw.js ya escala por H/100.
// Sin gradientes, determinista (azar con hash sembrado).
const TAU = Math.PI * 2;
export const CUERNO_V373_ANIMS = Object.freeze(["idle", "walk", "jump", "attack", "death", "trail"]);
export const CUERNO_V373_NAMES = Object.freeze(["Cuernín · Semilla", "Destello · Naciente", "Potro Iris", "Unicornio Estelar", "Unicornio Negro"]);
const IRIS = ["#ff8cab", "#ffc28e", "#ffe9a3", "#9de7bb", "#a5e5fa", "#aeb9fb", "#e5b9f4"];
// Altura de la silueta en unidades de arte (draw.js: px = H/100 · unidades, con
// H = CUERNO_VISUAL_H = [118, 92, 91, 86, 82]) → en pantalla ≈ 55, 58, 70, 82, 96 px.
export const CUERNO_V373_HEIGHT = Object.freeze([47, 63, 77, 95, 117]);
const F = [
  // coat, dark (contorno de color), mane colors, head/body proportions, legs, horn, wings
  { coat: "#fff3fa", shade: "#f2d3e8", ink: "#6b4a7a", mane: ["#b786dd", "#e4c4ff", "#a77ad3"], head: 1.45, body: .8, leg: .55, horn: .5, wings: 0, tail: .6, sprout: true },
  { coat: "#fde9ff", shade: "#e9c6f2", ink: "#634477", mane: ["#c29bea", "#f0d9ff", "#ad83da"], head: 1.15, body: .9, leg: .8, horn: .85, wings: 0, tail: .8 },
  { coat: "#f6f0ff", shade: "#d9cdf5", ink: "#4f3e78", mane: IRIS, head: 1, body: 1, leg: 1, horn: 1.15, wings: 0, tail: 1.1 },
  { coat: "#eef8ff", shade: "#c9dcf2", ink: "#344a74", mane: IRIS, head: .95, body: 1.05, leg: 1.08, horn: 1.3, wings: 1, tail: 1.2, stars: true },
  { coat: "#24203c", shade: "#15122a", ink: "#0a0816", mane: ["#a5e5fa", "#aeb9fb", "#e5b9f4", "#fff1ad"], head: .92, body: 1.1, leg: 1.12, horn: 1.45, wings: 1.35, tail: 1.35, stars: true, night: true },
];
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function animOf(pose) {
  const st = pose?.state || "idle";
  if (st === "dead") return "death";
  if (st === "trail") return "trail";
  if (st === "attack" || (st === "cast" && (pose.castSlot | 0) === 0)) return "attack";
  if (st === "jump" || st === "fall" || st === "glide" || pose?.air) return "jump";
  if (st === "run") return "walk";
  if (st === "hurt") return "hurt";
  if (st === "victory") return "victory";
  return "idle";
}
function ell(ctx, x, y, rx, ry, rot, fill, ink, lw) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU);
  ctx.fillStyle = fill; ctx.fill(); if (ink) { ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke(); }
}
function star(ctx, x, y, r, col) {
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function leg(ctx, P, hx, hy, len, swing, w, far, lw) {
  const stance = far ? -2.4 * (len / 22) : 0;
  hx += stance;
  const kx = hx + Math.sin(swing) * len * .45, ky = hy + Math.cos(swing) * len * .5;
  const fx = kx + Math.sin(swing * .6) * len * .25, fy = hy + len * .98 - Math.max(0, Math.sin(swing)) * len * .15;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy);
  ctx.strokeStyle = P.ink; ctx.lineWidth = w + lw * 2; ctx.stroke();
  ctx.strokeStyle = far ? P.shade : P.coat; ctx.lineWidth = w; ctx.stroke();
  // casco
  ell(ctx, fx + w * .1, fy, w * .62, w * .42, 0, P.night ? "#d8c7ff" : "#9a7ab0", P.ink, lw * .8);
  ell(ctx, fx - w * .1, fy - w * .12, w * .22, w * .1, 0, "rgba(255,255,255,.8)", null, 0);
}
function wing(ctx, P, x, y, span, flap, far, lw) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.35 - flap * .55);
  const col = far ? (P.night ? "#3a3360" : "#d6e6f8") : (P.night ? "#4a4278" : "#ffffff");
  for (let i = 0; i < 4; i++) {
    const L = span * (1 - i * .16), a = -i * .22;
    ctx.beginPath(); ctx.ellipse(-Math.cos(a) * L * .5, Math.sin(a) * L * .5 - i * 1.5, L * .5, span * .13, a, 0, TAU);
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw * .8; ctx.strokeStyle = P.ink; ctx.stroke();
  }
  if (P.night && !far) for (let i = 0; i < 3; i++) star(ctx, -span * (.3 + i * .2), -2 + i, span * .05, "#fff1ad");
  ctx.restore();
}

// Pedorreta arcoíris cómica y cute: nubecitas de colores + destellos tras la grupa.
function rainbowPuff(ctx, x, y, u, t) {
  for (let i = 0; i < 5; i++) {
    const k = ((t * .06 + i / 5) % 1), px = x - k * 12 * u, py = y + Math.sin(k * 6 + i) * 2 * u, r = (2.8 + k * 4.2) * u;
    ctx.globalAlpha = 1 - k * .7; ell(ctx, px, py, r, r * .85, 0, IRIS[i % 7], "#ffffff", .8 * u);
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) star(ctx, x - (4 + i * 5) * u, y - (4 - i * 2.5) * u + Math.sin(t * .3 + i) * u, (1.3 + hash(i, 7)) * u, "#fff6c8");
}
/** 0..1: alineación de la constelación de victoria. Ciclo 240 ticks: rampa 20, fija 60 (~1 s), rampa 20. */
export function cuernoV373StarAlign(t) {
  const k = ((Number(t) || 0) % 240 + 240) % 240, e = (x) => x * x * (3 - 2 * x);
  return k < 20 ? e(k / 20) : k < 80 ? 1 : k < 100 ? e(1 - (k - 80) / 20) : 0;
}
/** Dibuja la forma f (0..4) en coordenadas de arte (origen cascos). */
function drawForm(ctx, f, anim, t, atk = 0, R) {
  const P = F[f], H = CUERNO_V373_HEIGHT[f], u = H / 60, lw = Math.max(1.4, 2.2 * Math.min(1.4, u));
  const trail = anim === "trail", run = anim === "walk" || trail, air = anim === "jump", dead = anim === "death", hit = anim === "hurt", att = anim === "attack";
  const ph = t * (trail ? .45 : run ? .32 : .05);
  const legL = 22 * P.leg * u * (f === 0 ? .75 : 1), bodyRx = 17 * P.body * u, bodyRy = 10 * P.body * u;
  const bodyY = -(legL + bodyRy * .55);
  ctx.save();
  // muerte: se tumba de lado (patas flojas), sin salirse de su sitio
  if (dead) { ctx.translate(0, Math.min(legL * .42, -(bodyY + bodyRy) - lw * 1.5) - 3.5 * u); ctx.globalAlpha *= .85; }
  if (hit) { ctx.translate(-4 * u, 0); ctx.rotate(-.12); }
  const bob = run ? -Math.abs(Math.sin(ph)) * 2.5 * u : air ? -3 * u : Math.sin(t * .06) * .8 * u;
  const lunge = att ? Math.sin(clamp(atk, 0, 1) * Math.PI) * 6 * u : 0;
  ctx.translate(lunge, bob);
  if (att) ctx.rotate(.08 * Math.sin(clamp(atk, 0, 1) * Math.PI));
  const tuck = air ? .9 : 0;
  // --- capa trasera: cola, ala lejana, patas lejanas
  const tailX = -bodyRx * .95, tailY = bodyY - bodyRy * .3;
  for (let i = 0; i < P.mane.length; i++) {
    const L = (18 + i * 2) * P.tail * u, a = 2.5 + Math.sin(t * .1 + i) * .15 + (run ? .3 : 0) + i * .06;
    ctx.beginPath(); ctx.moveTo(tailX, tailY + i * 1.2);
    ctx.quadraticCurveTo(tailX - L * .55, tailY - L * .05 + i * 2, tailX - L * (.42 + Math.cos(a) * .08) - (run ? L * .25 : 0) - (trail ? L * .2 : 0), tailY + L * (trail ? -.55 : dead ? .12 : .8 - (run ? .3 : 0)) + i * 1.5);
    ctx.lineCap = "round"; ctx.strokeStyle = P.ink; ctx.lineWidth = 5.2 * u * .8 + lw; ctx.stroke();
    ctx.strokeStyle = P.mane[i]; ctx.lineWidth = 5.2 * u * .8; ctx.stroke();
  }
  const flap = dead ? -.4 : air ? Math.sin(t * .5) : Math.sin(t * .12) * .25;
  if (P.wings) wing(ctx, P, -bodyRx * .1, bodyY - bodyRy * .7, 26 * P.wings * u, flap + .15, true, lw);
  const sw = (k) => run ? Math.sin(ph + k) * .9 : air ? (k ? -1 : 1) * tuck * .6 : dead ? (k ? 1.4 : -1.4) : 0;
  leg(ctx, P, -bodyRx * .55, bodyY + bodyRy * .3, legL * (dead ? .42 : 1), sw(Math.PI), 4.4 * u * P.leg, true, lw);
  leg(ctx, P, bodyRx * .55, bodyY + bodyRy * .3, legL * (dead ? .42 : 1), sw(0), 4.4 * u * P.leg, true, lw);
  // --- cuerpo
  ell(ctx, 0, bodyY, bodyRx, bodyRy, 0, P.coat, P.ink, lw);
  ell(ctx, -bodyRx * .2, bodyY + bodyRy * .35, bodyRx * .7, bodyRy * .4, 0, P.shade, null, 0);
  // brillo superior (luz de arriba) + marca de cadera (cutie mark por forma)
  ell(ctx, bodyRx * .1, bodyY - bodyRy * .55, bodyRx * .55, bodyRy * .18, -.05, P.night ? "#3c3660" : "#ffffff", null, 0);
  if (f === 0) ell(ctx, -bodyRx * .45, bodyY, 1.6 * u, 1.1 * u, .4, "#9be39a", P.ink, lw * .5);
  else if (f === 1) star(ctx, -bodyRx * .45, bodyY, 2.4 * u, "#ffc28e");
  else if (f === 2) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-bodyRx * .45, bodyY + 2 * u, (3.2 - i * .9) * u, Math.PI, TAU); ctx.strokeStyle = IRIS[i * 2]; ctx.lineWidth = .9 * u; ctx.stroke(); }
  if (trail) rainbowPuff(ctx, -bodyRx * 1.05, bodyY - bodyRy * .1, u, t);
  if (P.stars) for (let i = 0; i < 5; i++) star(ctx, -bodyRx * .6 + hash(i, f) * bodyRx * 1.2, bodyY - bodyRy * .5 + hash(i, f + 3) * bodyRy, 1.3 * u, P.night ? "#fff1ad" : "#aeb9fb");
  // --- patas cercanas
  leg(ctx, P, -bodyRx * .45, bodyY + bodyRy * .45, legL * (dead ? .42 : 1), sw(0), 4.8 * u * P.leg, false, lw);
  leg(ctx, P, bodyRx * .65, bodyY + bodyRy * .45, legL * (dead ? .42 : 1), sw(Math.PI), 4.8 * u * P.leg, false, lw);
  // --- cuello + cabeza
  const neckX = bodyRx * .75, neckY = bodyY - bodyRy * .4;
  const headR = 9 * P.head * u, hx = neckX + headR * .55 + (att ? 3 * u : 0), hy = neckY - headR * (f === 0 ? .9 : 1.3) + (att ? 3 * u : 0);
  ctx.beginPath(); ctx.moveTo(neckX - 5 * u, neckY + 3 * u); ctx.quadraticCurveTo(neckX - 6 * u, hy + headR * .3, hx - headR * .4, hy); ctx.quadraticCurveTo(hx + headR * .1, hy - headR * .12, hx + headR * .2, hy + headR * .3); ctx.quadraticCurveTo(neckX + 7 * u, neckY - 2 * u, neckX + 5 * u, neckY + 2 * u); ctx.closePath();
  ctx.fillStyle = P.coat; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = P.ink; ctx.stroke();
  // crin arcoíris en mechones sobre el cuello
  for (let i = 0; i < P.mane.length; i++) {
    const k = i / Math.max(1, P.mane.length - 1), mx = hx - headR * .5 - k * (hx - neckX) * 1.1, my = hy - headR * .5 + k * (neckY - hy) * 1.05;
    const wave = Math.sin(t * .12 + i) * 1.5 * u + (run ? -2 * u : 0);
    ell(ctx, mx - 2 * u + wave * .5, my, 3.4 * u * (f === 0 ? .9 : 1), 6 * u * (f === 0 ? .7 : 1), .7, P.mane[i], P.ink, lw * .7);
    ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = .8 * u; ctx.beginPath(); ctx.moveTo(mx - 3 * u + wave * .5, my - 3 * u); ctx.quadraticCurveTo(mx - 1 * u, my, mx - 2.5 * u + wave * .5, my + 3 * u); ctx.stroke();
  }
  // cabeza
  ell(ctx, hx, hy, headR, headR * .86, 0, P.coat, P.ink, lw);
  ell(ctx, hx + headR * .7, hy + headR * .35, headR * .55, headR * .42, .2, P.shade, P.ink, lw * .8); // hocico
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(hx + headR * 1.05, hy + headR * .3, .9 * u, 0, TAU); ctx.fill();
  // oreja
  ctx.beginPath(); ctx.moveTo(hx - headR * .3, hy - headR * .6); ctx.lineTo(hx - headR * .55, hy - headR * 1.25); ctx.lineTo(hx + headR * .05, hy - headR * .75); ctx.closePath();
  ctx.fillStyle = P.coat; ctx.fill(); ctx.lineWidth = lw * .9; ctx.strokeStyle = P.ink; ctx.stroke();
  ell(ctx, hx - headR * .25, hy - headR * .85, headR * .12, headR * .23, -.35, P.night ? "#aa89d0" : "#d6a5ec", null, 0);
  // flequillo arcoíris sobre la frente
  for (let i = 0; i < Math.min(3, P.mane.length); i++) ell(ctx, hx - headR * (.15 - i * .18), hy - headR * .62, headR * .2, headR * .34, .5 + i * .2, P.mane[i], P.ink, lw * .6);
  // ojo grande con brillo (cerrado al recibir golpe; X al morir)
  const ex = hx + headR * .25, ey = hy - headR * .1, er = headR * (f === 0 ? .36 : .28);
  if (dead) { ctx.strokeStyle = P.night ? "#fff" : P.ink; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ex - er, ey - er); ctx.lineTo(ex + er, ey + er); ctx.moveTo(ex + er, ey - er); ctx.lineTo(ex - er, ey + er); ctx.stroke(); }
  else if (hit) { ctx.strokeStyle = P.night ? "#fff" : P.ink; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ex - er, ey - er * .5); ctx.lineTo(ex + er * .6, ey); ctx.lineTo(ex - er, ey + er * .5); ctx.stroke(); }
  else {
    ell(ctx, ex, ey, er, er * 1.15, 0, P.night ? "#a5e5fa" : "#3a2a5a", P.ink, lw * .6);
    ell(ctx, ex - er * .3, ey - er * .45, er * .38, er * .38, 0, "#ffffff", null, 0);
    ell(ctx, ex + er * .35, ey + er * .35, er * .16, er * .16, 0, "#ffffff", null, 0);
    if (P.night) { ctx.strokeStyle = "#fff1ad"; ctx.lineWidth = lw * .8; ctx.beginPath(); ctx.moveTo(ex - er * 1.2, ey - er * 1.5); ctx.lineTo(ex + er * 1.1, ey - er * 1.1); ctx.stroke(); }
  }
  if (f < 3) { ctx.fillStyle = "#ffb8d8"; ctx.globalAlpha *= .7; ctx.beginPath(); ctx.ellipse(hx + headR * .1, hy + headR * .45, headR * .2, headR * .12, 0, 0, TAU); ctx.fill(); ctx.globalAlpha /= .7; }
  // Small upturned smile remains readable beneath the muzzle.
  if (!dead && !hit) {
    ctx.strokeStyle = P.ink; ctx.lineWidth = lw * .65; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(hx + headR * .5, hy + headR * .53);
    ctx.quadraticCurveTo(hx + headR * .78, hy + headR * .7, hx + headR, hy + headR * .48); ctx.stroke();
  }
  // cuerno en espiral (embiste al atacar)
  const hl = 11 * P.horn * u * (f === 0 ? .6 : 1), ha = -1.05 + (att ? .45 * Math.sin(clamp(atk, 0, 1) * Math.PI) : 0);
  const bx = hx + headR * .15, by = hy - headR * .78, tx = bx + Math.cos(ha) * hl, ty = by + Math.sin(ha) * hl, nx = -Math.sin(ha) * 2.4 * u * P.horn, ny = Math.cos(ha) * 2.4 * u * P.horn;
  ctx.beginPath(); ctx.moveTo(bx - nx, by - ny); ctx.lineTo(tx, ty); ctx.lineTo(bx + nx, by + ny); ctx.closePath();
  ctx.fillStyle = P.night ? "#fff1ad" : "#ffe9a3"; ctx.fill(); ctx.lineWidth = lw * .8; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.strokeStyle = P.night ? "#e5b9f4" : "#ff8cab"; ctx.lineWidth = lw * .6;
  for (let i = 1; i < 4; i++) { const k = i / 4; ctx.beginPath(); ctx.moveTo(bx - nx * (1 - k) + (tx - bx) * k, by - ny * (1 - k) + (ty - by) * k); ctx.lineTo(bx + nx * (1 - k) + (tx - bx) * (k + .08), by + ny * (1 - k) + (ty - by) * (k + .08)); ctx.stroke(); }
  if (att && atk > .25 && atk < .75) { ctx.strokeStyle = "#fff6c8"; ctx.lineWidth = lw; for (let i = 0; i < 3; i++) { const a = ha + (i - 1) * .4; ctx.beginPath(); ctx.moveTo(tx + Math.cos(a) * 3 * u, ty + Math.sin(a) * 3 * u); ctx.lineTo(tx + Math.cos(a) * 8 * u, ty + Math.sin(a) * 8 * u); ctx.stroke(); } }
  // brote de semilla (forma 1)
  if (P.sprout) { ctx.strokeStyle = "#4f7a4a"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty - 3 * u); ctx.stroke(); for (const s of [-1, 1]) ell(ctx, tx + s * 2.2 * u, ty - 3.6 * u, 2.4 * u, 1.2 * u, s * -.5, "#9be39a", "#4f7a4a", 1); }
  // ala cercana
  if (P.wings) wing(ctx, P, bodyRx * .05, bodyY - bodyRy * .75, 30 * P.wings * u, flap, false, lw);
  // media luna + estrellas orbitando (forma 5)
  if (P.night) {
    const mx = hx - headR * 1.6, my = hy - headR * 1.4;
    ctx.fillStyle = "#fff1ad"; ctx.beginPath(); ctx.arc(mx, my, 4 * u, 0, TAU); ctx.fill();
    ctx.fillStyle = "#24203c"; ctx.beginPath(); ctx.arc(mx + 1.8 * u, my - 1 * u, 3.6 * u, 0, TAU); ctx.fill();
    // Sorpresa (victoria): las 3 estrellas se alinean ~1 s en una constelación con forma de cuerno.
    const al = anim === "victory" ? cuernoV373StarAlign(t) : 0, pts = [];
    for (let i = 0; i < 3; i++) {
      const a = t * .03 + i * TAU / 3, ox = Math.cos(a) * bodyRx * 1.3, oy = bodyY + Math.sin(a) * bodyRy * .8;
      const cs = 1.6, cx = bx + ((i - .2) * 5 * u + i * i * 1.5 * u) * cs, cy = by - 10 * u - i * 7 * u * cs; // constelación ×1.6 // espiral ascendente sobre el cuerno
      pts.push([ox + (cx - ox) * al, oy + (cy - oy) * al]);
    }
    if (al > .05) { ctx.globalAlpha *= al; ctx.strokeStyle = "#fff1ad"; ctx.lineWidth = .7 * u * 1.6; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[0][0] + 9.6 * u, pts[0][1]); ctx.closePath(); ctx.stroke(); ctx.globalAlpha /= al; }
    pts.forEach((q, i) => star(ctx, q[0], q[1], (1.8 + al * (1.8 * 1.6 - 1.8 + .8 * 1.6)) * u, IRIS[(i * 2) % 7]));
  }
  ctx.restore();
  void R;
}

export function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, (pose?.form | 0)));
  drawForm(ctx, f, animOf(pose), Number(pose?.t) || 0, Number(pose?.atk) || 0, R);
}

/** API directa: form 1..5, anim ∈ CUERNO_V373_ANIMS (+ "hurt"/"victory"). */
export function drawCuernoV373(ctx, x, y, { form = 1, anim = "idle", t = 0, facing = 1, scale = 1, atk = .5 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale((facing < 0 ? -1 : 1) * scale, scale);
  drawForm(ctx, clamp((form | 0) - 1, 0, 4), anim === "trail" || anim === "attack" || anim === "death" || anim === "jump" || anim === "walk" || anim === "hurt" || anim === "victory" ? anim : "idle", Number(t) || 0, atk);
  ctx.restore();
}
/** Punto (mundo) donde nace la estela arcoíris de Kilo/Chispín: tras la grupa. */
export function cuernoTrailOrigin(x, y, { form = 1, facing = 1, scale = 1 } = {}) {
  const f = clamp((form | 0) - 1, 0, 4), P = F[f], u = CUERNO_V373_HEIGHT[f] / 60;
  const legL = 22 * P.leg * u * (f === 0 ? .75 : 1), ry = 10 * P.body * u;
  return { x: x - (facing < 0 ? -1 : 1) * 17 * P.body * u * 1.05 * scale, y: y + (-(legL + ry * .55) - ry * .1) * scale };
}
export default { id: "cuerno", draw };
