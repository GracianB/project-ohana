// V372 · Bichos de Kilo: cucaracho, mosquito, phosquito y avispa.
// Arte vectorial en canvas, solo colores planos en capas. El único gradiente
// (halo del phosquito) se crea una vez por contexto y se reutiliza.
// Contrato: el contexto llega trasladado al centro del enemigo (drawEnemy).
// drawKiloFoe devuelve true si ha dibujado el bicho.
export const KILO_FOE_TYPES = Object.freeze(["cucaracho", "mosquito", "phosquito", "avispa"]);

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Tipo de arte para un enemigo (avispa hoy nace como kind "abeja"). */
export function kiloFoeType(e) {
  if (!e) return null;
  if (e.variant === "avispa" || e.srcKind === "avispa" || e.kind === "avispa") return "avispa";
  return KILO_FOE_TYPES.includes(e.kind) ? e.kind : null;
}
export function isKiloFoe(e) { return !!kiloFoeType(e); }

/** Estado de animación: die · hurt · telegraph · attack · move · idle. */
export function kiloFoePose(e) {
  if (!e) return "idle";
  if (e.hp <= 0 || e.dying > 0) return "die";
  if ((e.flash || 0) > 8 || (e._hitT || 0) > 4) return "hurt";
  if (e.telegraph || e.wind > 0 || e.hopWind > 0 || e.clawWind > 0) return "telegraph";
  if (e.lunge > 0 || e.diving || e.charging > 0 || e.darting) return "attack";
  if (Math.abs(e.vx || 0) > 0.35 || Math.abs(e.vy || 0) > 0.6) return "move";
  return "idle";
}
/** Variante: 0 cría · 1 normal · 2 élite/evolucionado · 3 evo máxima. */
export function kiloFoeTier(e) {
  let k = e?.baby ? 0 : 1;
  if (e?.elite) k = 2;
  if ((e?.evo || 0) >= 1) k = Math.max(k, 1 + Math.min(2, e.evo));
  return clamp(k, 0, 3);
}

function line(ctx, pts, w, c) {
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
}
function oval(ctx, x, y, rx, ry, rot, c) {
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, Math.max(.3, rx), Math.max(.3, ry), rot || 0, 0, TAU); ctx.fill();
}
function eyeDot(ctx, x, y, r, c, shut) {
  if (shut) { line(ctx, [x - r, y - r, x + r, y + r], 1.2, "#1a1020"); line(ctx, [x - r, y + r, x + r, y - r], 1.2, "#1a1020"); return; }
  oval(ctx, x, y, r, r, 0, c); oval(ctx, x - r * .35, y - r * .35, r * .32, r * .32, 0, "rgba(255,255,255,.85)");
}

// ---------------- CUCARACHO ----------------
// Vista lateral: cuerpo ovalado y plano, pronoto-escudo, alas plegadas,
// antenas largas, 6 patas espinosas con marcha trípode.
function roachLeg(ctx, hx, hy, phase, len, w, col, spineCol, lift) {
  const sw = Math.sin(phase), up = Math.max(0, Math.cos(phase)) * lift;
  const kx = hx + sw * len * .45 + len * .25 * (hx > 0 ? 1 : -1), ky = hy + len * .3 - up;
  const fx = hx + sw * len * .6 + len * .55 * (hx > 0 ? 1 : -1), fy = hy + len * .95 - up * .6;
  line(ctx, [hx, hy, kx, ky - len * .12, fx, fy], w, col);
  // espinas en la tibia
  ctx.strokeStyle = spineCol; ctx.lineWidth = Math.max(.6, w * .38);
  ctx.beginPath();
  for (let i = 1; i <= 3; i++) {
    const k = i / 4, sx = kx + (fx - kx) * k, sy = ky - len * .12 + (fy - ky + len * .12) * k;
    ctx.moveTo(sx, sy); ctx.lineTo(sx + len * .1, sy - len * .06);
  }
  ctx.stroke();
}
function drawRoach(ctx, e, t, pose, tier) {
  const L = e.w * .55 * (tier >= 2 ? 1.12 : 1), H = Math.max(6, e.h * .46);
  const ph = t * (pose === "attack" ? .7 : pose === "move" ? .42 : .06) + (e.x || 0) * .05;
  const shell = tier >= 3 ? "#7a1a0e" : tier === 2 ? "#8a2c10" : "#7a3612";
  const shellMid = tier >= 2 ? "#b0441c" : "#a3511e", shellHi = "#e08a4a", dark = "#2e1206", leg = "#4a1e0a";
  const dead = pose === "die";
  ctx.save();
  if (dead) { ctx.scale(1, -1); ctx.translate(0, -H * .6); }
  if (pose === "telegraph") { ctx.rotate(-.12); ctx.translate(-L * .06, -1); }
  if (pose === "attack") ctx.scale(1.1, .9);
  if (pose === "hurt") ctx.scale(.94, 1.06);
  const legY = H * .35, legLen = H * 1.25 + 2, lw = Math.max(1.1, H * .16);
  const hips = [L * .6, L * .1, -L * .55];
  const lift = dead ? 0 : legLen * .3;
  const legPh = (i, side) => dead ? t * .9 + i * 2 + side : ph + ((i + side) % 2) * Math.PI; // trípode
  // patas del lado lejano (más claras, detrás)
  for (let i = 0; i < 3; i++) roachLeg(ctx, hips[i] - L * .04, legY - 1, legPh(i, 1), legLen * (i === 2 ? 1.15 : 1), lw * .85, "#6b3416", "#8a4a22", lift);
  // cercos traseros
  line(ctx, [-L * .95, H * .05, -L * 1.2, -H * .15], lw * .7, dark);
  line(ctx, [-L * .95, H * .2, -L * 1.18, H * .25], lw * .7, dark);
  // abdomen plano (vientre) + alas plegadas encima
  oval(ctx, -L * .15, H * .15, L * .85, H * .55, 0, dark);
  oval(ctx, -L * .15, H * .1, L * .82, H * .48, 0, "#5a2410");
  const open = (pose === "attack" && tier >= 2) || tier >= 3 ? .35 + Math.abs(Math.sin(t * .9)) * .35 : (pose === "telegraph" ? .12 : 0);
  if (open > 0) { // alas membranosas asomando
    ctx.globalAlpha = .45; oval(ctx, -L * .35, -H * .55, L * .7, H * .35, -open, "#e8c8a0"); ctx.globalAlpha = 1;
  }
  ctx.save(); ctx.translate(L * .2, -H * .15); ctx.rotate(-open * .6);
  oval(ctx, -L * .48, 0, L * .82, H * .52, .02, shell);          // tegmina
  oval(ctx, -L * .5, -H * .08, L * .72, H * .36, .02, shellMid);
  oval(ctx, -L * .55, -H * .2, L * .5, H * .14, .03, "rgba(255,200,150,.55)"); // reflejo largo
  oval(ctx, -L * .2, -H * .26, L * .14, H * .07, 0, "rgba(255,240,220,.85)");   // brillo puntual
  line(ctx, [L * .3, -H * .05, -L * 1.25, H * .05], Math.max(.7, lw * .45), "#3a1608"); // sutura de alas
  ctx.restore();
  // pronoto escudo
  const px = L * .55;
  oval(ctx, px, -H * .05, L * .36, H * .55, -.08, dark);
  oval(ctx, px, -H * .1, L * .33, H * .48, -.08, shellMid);
  oval(ctx, px + L * .02, -H * .14, L * .24, H * .32, -.08, tier >= 2 ? "#5a140a" : "#4a1c0c"); // mancha central oscura
  ctx.strokeStyle = "#e9a060"; ctx.lineWidth = Math.max(.8, lw * .5);
  ctx.beginPath(); ctx.ellipse(px, -H * .1, L * .31, H * .45, -.08, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); // borde claro
  oval(ctx, px - L * .05, -H * .38, L * .08, H * .08, 0, "rgba(255,235,210,.8)");
  // cabeza bajo el escudo
  const hx = px + L * .32, hy = H * .2;
  oval(ctx, hx, hy, L * .14, H * .3, .3, dark);
  eyeDot(ctx, hx + L * .04, hy - H * .06, Math.max(1.2, H * .12), "#120804", dead);
  // antenas largas y finas que se mueven
  const tw = pose === "telegraph" ? 1.6 : pose === "hurt" ? -1 : 1;
  for (let s = 0; s < 2; s++) {
    const a = Math.sin(t * (pose === "telegraph" ? .9 : .17) + s * 1.9) * .35 * tw;
    const len = L * (1.5 + s * .2);
    ctx.strokeStyle = s ? "#5a2a12" : "#2a0e04"; ctx.lineWidth = Math.max(.6, lw * .35);
    ctx.beginPath(); ctx.moveTo(hx + L * .08, hy - H * .2);
    ctx.quadraticCurveTo(hx + len * .45, hy - H * (1.6 + a * 2) - s * 2, hx + len * (.95 + a * .1), hy - H * (.6 - a * 3) + s * 3);
    ctx.stroke();
  }
  // palpos/mandíbulas
  const bite = pose === "attack" ? 1 : pose === "telegraph" ? .6 : .2;
  line(ctx, [hx + L * .1, hy + H * .2, hx + L * .2, hy + H * (.3 + bite * .2)], lw * .6, dark);
  // patas del lado cercano
  for (let i = 0; i < 3; i++) roachLeg(ctx, hips[i], legY, legPh(i, 0), legLen * (i === 2 ? 1.15 : 1), lw, leg, "#c07040", lift);
  if (pose === "telegraph" && !dead) { // siseo
    ctx.globalAlpha = .7; ctx.strokeStyle = "#ffcf9a"; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { const r = H * (1 + i * .45) + (t % 10) * .4; ctx.beginPath(); ctx.arc(hx, hy, r, -.6, .6); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (tier >= 2 && !dead) { // élite: espinas extra en el escudo
    ctx.fillStyle = "#ffcf7a";
    for (let i = 0; i < 3; i++) { const sx = px - L * .2 + i * L * .18; ctx.beginPath(); ctx.moveTo(sx, -H * .5); ctx.lineTo(sx + 2, -H * .78); ctx.lineTo(sx + 4, -H * .5); ctx.fill(); }
  }
  ctx.restore();
}

// ---------------- MOSQUITO / PHOSQUITO ----------------
let glowCache = new WeakMap();
function glowGrad(ctx) {
  let g = glowCache.get(ctx);
  if (!g && typeof ctx.createRadialGradient === "function") {
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, "rgba(160,255,200,.55)"); g.addColorStop(.5, "rgba(80,230,170,.2)"); g.addColorStop(1, "rgba(60,200,160,0)");
    glowCache.set(ctx, g);
  }
  return g;
}
function wings(ctx, x, y, len, wid, t, rate, col, edge, n) {
  const a = Math.sin(t * rate);
  for (let i = n - 1; i >= 0; i--) { // estela de zumbido
    const aa = a - i * .55 * Math.sign(a || 1);
    ctx.globalAlpha = i ? .18 : .55;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-1.2 + aa * .7);
    oval(ctx, len * .5, 0, len * .5, wid, 0, col);
    if (!i) { ctx.strokeStyle = edge; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(len * .5, 0, len * .5, wid, 0, 0, TAU); ctx.moveTo(1, 0); ctx.lineTo(len * .95, 0); ctx.stroke(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawGnat(ctx, e, t, pose, tier, phos) {
  const S = e.w / 40 * (phos ? 1.15 : 1), dead = pose === "die";
  const body = phos ? "#1c4a36" : "#3a2a26", body2 = phos ? "#2f7a58" : "#5a4038";
  const legC = phos ? "#2a6a4c" : "#3a2a26";
  const glow = phos ? .55 + Math.sin(t * .18 + (e.x || 0) * .01) * .3 : 0;
  ctx.save();
  ctx.scale(S, S);
  const dive = pose === "attack";
  if (dive) ctx.rotate(.45);
  if (pose === "telegraph") ctx.rotate(-.25 + Math.sin(t * 1.3) * .05);
  if (dead) ctx.rotate(1.4);
  if (phos) { // halo bioluminiscente (gradiente cacheado)
    const g = glowGrad(ctx);
    ctx.save(); ctx.translate(-6, 4); const r = 30 + glow * 10 + (pose === "telegraph" ? 8 : 0); ctx.scale(r, r);
    ctx.fillStyle = g || "rgba(120,255,190,.18)"; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
  }
  // patas largas colgando (lado lejano)
  for (let i = 0; i < 3; i++) {
    const sw = Math.sin(t * .2 + i) * 2 + (dive ? -6 : 0), hx = 2 - i * 4;
    line(ctx, [hx, 4, hx - 4 + sw, 14, hx - 8 + sw * 1.5, 26 + i * 2], .9, phos ? "#4a9a76" : "#6a5048");
  }
  // abdomen segmentado fino
  ctx.save(); ctx.translate(-4, 3); ctx.rotate(dive ? -.1 : .35);
  const blood = !phos && tier >= 2;
  for (let i = 0; i < 5; i++) oval(ctx, -4 - i * 4.2, 0, 3.4, 2.6 - i * .15, 0, i % 2 ? body : body2);
  if (blood) oval(ctx, -10, .8, 7, 2.6, 0, "rgba(200,20,30,.75)");
  if (phos) { ctx.globalAlpha = clamp(glow + .2, 0, 1); oval(ctx, -18, 0, 5, 3.4, 0, "#b8ffd8"); oval(ctx, -18, 0, 2.6, 1.8, 0, "#ffffff"); ctx.globalAlpha = 1; }
  ctx.restore();
  // tórax jorobado
  oval(ctx, 2, -1, 6.5, 5.5, -.2, body);
  oval(ctx, 1, -3, 4, 2.4, -.2, phos ? "#5ad2a0" : "#8a6a5a");
  if (!phos) { line(ctx, [-1, -4, 5, -4], .8, "#d8c8b8"); }
  // alas zumbando
  if (!dead) wings(ctx, 0, -4, 18, 4, t, 2.6, phos ? "#c8fff0" : "#e6eef8", phos ? "#7ee7c8" : "#9aa6b8", 3);
  // cabeza, ojo compuesto, antenas plumosas, probóscide
  oval(ctx, 9, 1, 3.6, 3.4, 0, body);
  eyeDot(ctx, 10, .5, 2.4, phos ? "#7ee7ff" : "#a01818", dead);
  for (let s = 0; s < 2; s++) {
    const a = Math.sin(t * .15 + s) * 1.2;
    line(ctx, [10, -2, 14 + s * 2, -8 + a], .8, body);
    ctx.strokeStyle = body; ctx.lineWidth = .5; ctx.beginPath();
    for (let k = 1; k < 4; k++) { const px = 10 + (4 + s * 2) * k / 4, py = -2 + (-6 + a) * k / 4; ctx.moveTo(px - 1.2, py - 1); ctx.lineTo(px + 1.2, py + 1); }
    ctx.stroke();
  }
  const pl = dive ? 16 : pose === "telegraph" ? 14 : 12;
  line(ctx, [12, 2.5, 12 + pl, 4 + pl * .35], 1.1, phos ? "#123a28" : "#1a1210");
  if (dive || pose === "telegraph") oval(ctx, 12 + pl, 4 + pl * .35, 1.6, 1.6, 0, phos ? "#b8ffd8" : "#ff4040");
  // patas cercanas
  for (let i = 0; i < 3; i++) {
    const sw = Math.sin(t * .2 + i + 1.5) * 2 + (dive ? -6 : 0), hx = 4 - i * 3.5;
    line(ctx, [hx, 4, hx + 3 + sw, 13, hx + sw * 1.4, 25 + i * 2], 1, legC);
  }
  if (phos && !dead) { // chispas que dejan rastro
    ctx.fillStyle = "#c8ffe0";
    for (let i = 0; i < 4; i++) { const k = ((t * .7 + i * 9) % 36); ctx.globalAlpha = (1 - k / 36) * .8; ctx.fillRect(-22 - k * .6, 6 + Math.sin(i * 2 + t * .1) * 5 + k * .2, 1.8, 1.8); }
    ctx.globalAlpha = 1;
  }
  if (tier >= 2 && phos && !dead) { ctx.strokeStyle = "#b8ffd8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-6, 4, 22 + Math.sin(t * .3) * 2, 0, TAU); ctx.stroke(); }
  ctx.restore();
}

// ---------------- AVISPA ----------------
function drawWasp(ctx, e, t, pose, tier) {
  const S = e.w / 42, dead = pose === "die";
  const Y = "#ffcc1a", K = "#1c1410";
  ctx.save(); ctx.scale(S, S);
  const charge = pose === "attack", wind = pose === "telegraph";
  if (charge) ctx.rotate(.18);
  if (dead) ctx.rotate(2.6);
  // patas colgando (amarillas con articulaciones negras)
  for (let i = 0; i < 3; i++) {
    const sw = Math.sin(t * .22 + i) * 2.5 + (charge ? -5 : 0), hx = 4 - i * 4;
    line(ctx, [hx, 6, hx - 2 + sw, 14, hx - 5 + sw * 1.4, 22], 1.6, K);
    line(ctx, [hx - 2 + sw, 14, hx - 5 + sw * 1.4, 22], 1.1, Y);
  }
  // alas traseras + delanteras
  if (!dead) {
    wings(ctx, -2, -9, 20, 4.5, t, 2.4, "#dde8f2", "#8aa0b8", 3);
    wings(ctx, 1, -9, 15, 3.5, t + 1, 2.4, "#eef4fa", "#8aa0b8", 2);
  }
  // abdomen a rayas, se curva hacia delante al atacar
  const curl = charge ? .9 : wind ? .5 + Math.sin(t * .8) * .1 : .15 + Math.sin(t * .1) * .05;
  ctx.save(); ctx.translate(-8, 3); ctx.rotate(-curl);
  ctx.save(); ctx.beginPath(); ctx.ellipse(-9, 0, 11, 7.5, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = Y; ctx.fillRect(-21, -9, 24, 18);
  ctx.fillStyle = K; for (let i = 0; i < 3; i++) ctx.fillRect(-4 - i * 6.2, -9, 2.8, 18);
  ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-18, -6, 14, 2);
  ctx.restore();
  // aguijón
  const sl = charge ? 8 : wind ? 6 : 4.5;
  ctx.fillStyle = K; ctx.beginPath(); ctx.moveTo(-19, -2); ctx.lineTo(-20 - sl, 0); ctx.lineTo(-19, 2); ctx.fill();
  if (wind || charge) { // gota de veneno
    oval(ctx, -20 - sl, 2.5 + (t % 14) * .2, 1.4, 1.8, 0, "#b8ff6a");
  }
  ctx.restore();
  // cintura de avispa (pecíolo)
  line(ctx, [-8, 3, -3, 1], 2, K);
  // tórax negro con marcas amarillas
  oval(ctx, 1, 0, 6.5, 6, 0, K);
  oval(ctx, 0, -3.5, 3, 1.4, 0, Y); oval(ctx, 3, 3, 2, 1.2, .5, Y);
  // cabeza
  oval(ctx, 9, 0, 4.6, 5, 0, Y);
  oval(ctx, 10.5, -1.4, 2.6, 3.4, 0, K); // ojo compuesto
  if (!dead) oval(ctx, 9.8, -2.6, .9, .9, 0, "rgba(255,255,255,.8)"); else eyeDot(ctx, 10.5, -1.4, 1.6, K, true);
  // mandíbulas
  const m = charge || wind ? Math.abs(Math.sin(t * .8)) * 2 : .5;
  line(ctx, [12.5, 3, 14.5, 4.2 + m], 1.4, K); line(ctx, [12.5, 3.6, 14, 5.6 - m * .3], 1.4, "#5a3a10");
  // antenas acodadas
  for (let s = 0; s < 2; s++) { const a = Math.sin(t * .14 + s * 2) * 1.2; line(ctx, [10, -4, 12 + s, -9 + a, 17 + s * 2, -10 + a], 1, K); }
  if (tier >= 2 && !dead) { // élite: corona de rayas rojas
    ctx.fillStyle = "#e23b1a"; ctx.beginPath(); ctx.moveTo(6, -5); ctx.lineTo(8, -9); ctx.lineTo(10, -6); ctx.lineTo(12, -9); ctx.lineTo(13, -4); ctx.fill();
  }
  if (wind && !dead) { ctx.globalAlpha = .6; ctx.strokeStyle = "#ffcc1a"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const r = 18 + i * 5 + (t % 8); ctx.beginPath(); ctx.arc(-6, 3, r, 2.2, 3.6); ctx.stroke(); } ctx.globalAlpha = 1; }
  ctx.restore();
}

/** Dibuja uno de los 4 bichos de Kilo. Contexto ya centrado en el enemigo. */
export function drawKiloFoe(ctx, e, t = 0) {
  const type = kiloFoeType(e);
  if (!type || !ctx) return false;
  const pose = kiloFoePose(e), tier = kiloFoeTier(e);
  ctx.save();
  const dir = (e.vx || 0) >= 0 ? 1 : -1;
  ctx.scale(dir, 1);
  if (type !== "cucaracho" && pose !== "die") ctx.translate(0, Math.sin(t * .15 + (e.x || 0) * .02) * 1.6); // flotación
  if (type === "cucaracho") drawRoach(ctx, e, t, pose, tier);
  else if (type === "avispa") drawWasp(ctx, e, t, pose, tier);
  else drawGnat(ctx, e, t, pose, tier, type === "phosquito");
  ctx.restore();
  return true;
}
