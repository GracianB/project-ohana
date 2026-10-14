// Dino foes V372 · brasita (ascua viva), escoria (roca de lava), ufo (platillo).
// Solo arte/animación canvas. Sin gradientes por frame. No cambia daño ni vida.
export const DINO_FOE_IDS = Object.freeze(["brasita", "escoria", "ufo"]);
export const DINO_FOE_POSES = Object.freeze(["idle", "move", "windup", "attack", "hurt", "death"]);

export function isDinoFoe(foe) { return !!foe && DINO_FOE_IDS.includes(foe.kind); }

export function dinoFoePose(foe) {
  if (!foe) return "idle";
  if (foe.pose && DINO_FOE_POSES.includes(foe.pose)) return foe.pose;
  if (foe.dying > 0 || foe.dead) return "death";
  if (foe.flash > 0 || foe.hurtT > 0) return "hurt";
  if (foe.attacking || foe.atkT > 0 || foe.firing) return "attack";
  if (foe.telegraph) return "windup";
  if (Math.abs(foe.vx || 0) > 0.25 || Math.abs(foe.vy || 0) > 0.6) return "move";
  return "idle";
}

// Variante 0 normal, 1 élite / avanzada, 2 alfa (tier>=2 o evo>=2)
export function dinoFoeTier(foe) {
  const n = Math.max(Number(foe?.tier) || 0, Number(foe?.evo) || 0);
  if (n >= 2) return 2;
  return n >= 1 || foe?.elite ? 1 : 0;
}

const TAU = Math.PI * 2;
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); }
function deathK(foe, pose) {
  if (pose !== "death") return 0;
  const d = Number(foe.dying);
  return d > 0 ? Math.max(0, Math.min(1, 1 - d / (foe.dyingMax || 20))) : 0.6;
}

// ---------- BRASITA: chispa/ascua viva con llamita en la cabeza ----------
const BRASITA = [
  { rim: "#ff5a14", body: "#ff8a24", core: "#fff0a8", tip: "#ffd04a" },
  { rim: "#e8301a", body: "#ff6a20", core: "#fff6d0", tip: "#ffef80" },
  { rim: "#5a3cff", body: "#7d6bff", core: "#e8f4ff", tip: "#9ff4ff" },
];
function drawBrasita(ctx, foe, t, pose, tier) {
  const c = BRASITA[tier], ph = foe.bob || 0, dk = deathK(foe, pose);
  let sx = 1, sy = 1, lean = 0, oy = Math.sin(t / 5 + ph) * 1.6;
  if (pose === "move") { lean = 0.25 * Math.sign(foe.vx || 1); sx = 1.1; sy = 0.92; }
  if (pose === "windup") { const k = 0.5 + 0.5 * Math.sin(t * 0.9); sx = 0.8 + 0.1 * k; sy = 1.25; oy += 2; }
  if (pose === "attack") { sx = 1.35; sy = 0.8; }
  if (pose === "hurt") { sx = 0.85; sy = 0.85; lean = -0.4; }
  const s = 1.15 + tier * 0.12;
  ctx.save(); ctx.translate(0, oy); ctx.rotate(lean); ctx.scale(sx * s, sy * s);
  if (dk > 0) { ctx.globalAlpha *= 1 - dk * 0.8; ctx.scale(1 - dk * 0.5, 1 - dk * 0.5); }
  // halo plano (dos capas alfa, sin gradiente)
  ctx.fillStyle = c.rim; ctx.globalAlpha *= 0.22; circle(ctx, 0, 0, pose === "attack" ? 17 : 13);
  ctx.globalAlpha /= 0.22;
  // llama superior: 3 lenguas
  const fl = Math.sin(t / 3 + ph);
  ctx.fillStyle = c.tip;
  ctx.beginPath(); ctx.moveTo(-6, -3); ctx.quadraticCurveTo(-7, -12, -3 + fl, -16 - (pose === "windup" ? 5 : 0));
  ctx.quadraticCurveTo(0, -9, 2, -14 + fl); ctx.quadraticCurveTo(5, -10, 7 - fl, -12); ctx.quadraticCurveTo(7, -5, 6, -3); ctx.fill();
  // cuerpo gota
  ctx.fillStyle = c.rim; ell(ctx, 0, 1, 9, 8.5);
  ctx.fillStyle = c.body; ell(ctx, 0, 0.5, 7.5, 7);
  ctx.fillStyle = c.core; ell(ctx, -1.2, -0.5, 4.2, 3.6);
  // cara
  ctx.fillStyle = "#2a0a00";
  if (pose === "hurt" || pose === "death") {
    ctx.strokeStyle = "#2a0a00"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-1.5, 0); ctx.moveTo(-4, 0); ctx.lineTo(-1.5, -2);
    ctx.moveTo(1.5, -2); ctx.lineTo(4, 0); ctx.moveTo(1.5, 0); ctx.lineTo(4, -2); ctx.stroke();
  } else {
    const ang = pose === "windup" || pose === "attack";
    ell(ctx, -2.5, -1, 1.2, ang ? 0.8 : 1.5); ell(ctx, 2.5, -1, 1.2, ang ? 0.8 : 1.5);
    if (ang) { ctx.fillRect(-4, -3.2, 2.8, 0.8); ctx.fillRect(1.2, -3.2, 2.8, 0.8); }
  }
  if (pose === "attack") ell(ctx, 0, 3, 2.4, 1.8); else ell(ctx, 0, 3, 1.4, 0.7);
  // chispas orbitando / estallido
  ctx.fillStyle = c.tip;
  const n = 3 + tier, R = pose === "attack" ? 15 : pose === "windup" ? 9 : 12;
  for (let i = 0; i < n; i++) {
    const a = t / (pose === "windup" ? 2 : 6) + (i * TAU) / n + ph;
    circle(ctx, Math.cos(a) * (R + dk * 14), Math.sin(a) * (R * 0.8 + dk * 10), pose === "attack" ? 2 : 1.3);
  }
  if (tier === 2) { ctx.strokeStyle = c.tip; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 11, t / 7, t / 7 + 2); ctx.stroke(); }
  ctx.restore();
}

// ---------- ESCORIA: criatura de roca volcánica con grietas de lava ----------
const ESCORIA = [
  { rock: "#4a2a22", dark: "#2a1410", lava: "#ff6a20", hot: "#ffd04a" },
  { rock: "#3a2420", dark: "#1a0c08", lava: "#ff3c18", hot: "#fff080" },
  { rock: "#2a2a34", dark: "#121218", lava: "#c040ff", hot: "#ffb0ff" },
];
function drawEscoria(ctx, foe, t, pose, tier) {
  const c = ESCORIA[tier], dir = (foe.vx || foe.dir || 1) >= 0 ? 1 : -1, dk = deathK(foe, pose);
  const hot = pose === "windup" || pose === "attack" || (foe.max && foe.hp < foe.max * 0.45);
  const walk = pose === "move" ? Math.sin(t / 3 + (foe.x || 0) * 0.08) : Math.sin(t / 12) * 0.3;
  let sx = 1, sy = 1, oy = 0, rot = 0;
  if (pose === "idle") sy = 1 + Math.sin(t / 10) * 0.03;
  if (pose === "move") oy = -Math.abs(walk) * 1.5;
  if (pose === "windup") { sx = 0.88; sy = 1.15; rot = -0.18; }
  if (pose === "attack") { sx = 1.25; sy = 0.82; rot = 0.12; oy = 2; }
  if (pose === "hurt") { rot = -0.3; oy = -2; }
  const s = 1.25 + tier * 0.12;
  ctx.save(); ctx.scale(dir * s, s); ctx.translate(0, oy); ctx.rotate(rot);
  if (dk > 0) { ctx.globalAlpha *= 1 - dk * 0.7; }
  // patas rocosas (3 bloques)
  ctx.fillStyle = c.dark;
  for (let i = -1; i <= 1; i++) {
    const lift = (i % 2 === 0 ? walk : -walk) * 2.2;
    ctx.fillRect(i * 7 - 2.5, 5 - Math.max(0, lift), 5, 6 + Math.min(0, lift) + dk * -4);
  }
  // cuerpo: polígono de roca (se agrieta al morir)
  const sep = dk * 6;
  ctx.fillStyle = c.rock;
  ctx.beginPath(); ctx.moveTo(-14 - sep, 6); ctx.lineTo(-12 - sep, -4); ctx.lineTo(-5 - sep, -10); ctx.lineTo(0, -8); ctx.lineTo(0, 7); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6 + sep, -11); ctx.lineTo(13 + sep, -3); ctx.lineTo(14 + sep, 6); ctx.lineTo(0, 7); ctx.closePath(); ctx.fill();
  // espinas de basalto (más en variantes)
  ctx.fillStyle = c.dark;
  const spikes = 2 + tier;
  for (let i = 0; i < spikes; i++) {
    const x = -8 + (i * 16) / Math.max(1, spikes - 1);
    ctx.beginPath(); ctx.moveTo(x - 2.5, -8); ctx.lineTo(x, -14 - (pose === "windup" ? 3 : 0)); ctx.lineTo(x + 2.5, -8); ctx.fill();
  }
  // grietas de lava
  ctx.strokeStyle = hot ? c.hot : c.lava; ctx.lineWidth = hot ? 1.8 : 1.2; ctx.lineCap = "round";
  ctx.globalAlpha *= hot ? 1 : 0.7 + 0.3 * Math.sin(t / 6);
  ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-5, -3); ctx.lineTo(1, 1); ctx.lineTo(6, -4); ctx.lineTo(11, 0);
  ctx.moveTo(-3, 5); ctx.lineTo(0, 1); ctx.stroke();
  ctx.globalAlpha = 1 * (dk > 0 ? 1 - dk * 0.7 : 1);
  // ojos/boca de horno
  ctx.fillStyle = hot ? c.hot : c.lava;
  if (pose === "hurt" || pose === "death") { ctx.fillRect(4, -3, 4, 1.2); ctx.fillRect(9, -3, 3, 1.2); }
  else { ell(ctx, 6, -3, 1.6, pose === "windup" ? 0.8 : 1.4); ell(ctx, 10.5, -3, 1.4, pose === "windup" ? 0.8 : 1.2); }
  ctx.fillStyle = c.dark; ctx.fillRect(5, 1, 7, pose === "attack" ? 4 : 2);
  if (pose === "attack") { ctx.fillStyle = c.hot; ctx.fillRect(6, 2, 5, 2);
    // salpicadura de magma delante
    ctx.fillStyle = c.lava; for (let i = 0; i < 4; i++) circle(ctx, 16 + i * 4, 2 - Math.sin(i + t / 3) * 3, 2 - i * 0.3); }
  if (pose === "windup") { ctx.fillStyle = c.hot; circle(ctx, 0, -16 - Math.abs(Math.sin(t / 2)) * 3, 1.5); }
  ctx.restore();
}

// ---------- UFO: platillo pequeño con alienígena en la cúpula ----------
const UFO = [
  { hull: "#9fb8c8", band: "#5a7486", dome: "#bff4ff", light: "#ffd04a", pilot: "#7cff9a" },
  { hull: "#c0a0e0", band: "#6a4a90", dome: "#e8d4ff", light: "#ff70c0", pilot: "#a6ff6a" },
  { hull: "#2a3040", band: "#ff4040", dome: "#ffb0b0", light: "#ff3030", pilot: "#ffef6a" },
];
function drawUfo(ctx, foe, t, pose, tier) {
  const c = UFO[tier], ph = foe.bob || 0, dk = deathK(foe, pose);
  let tilt = Math.sin(t / 14 + ph) * 0.06, oy = Math.sin(t / 8 + ph) * 2;
  if (pose === "move") tilt = 0.22 * Math.sign(foe.vx || 1);
  if (pose === "windup") { tilt = 0; oy -= 2 + Math.sin(t * 1.2) * 0.8; }
  if (pose === "hurt") { tilt = -0.45; }
  if (pose === "death") { tilt = 0.6 + dk * 0.8; oy += dk * 10; }
  const s = 1.1 + tier * 0.12;
  ctx.save(); ctx.translate(0, oy); ctx.scale(s, s);
  // rayo tractor (plano)
  if (pose === "windup" || pose === "attack") {
    const a = pose === "attack" ? 0.42 : 0.16 + 0.1 * Math.sin(t * 0.8);
    ctx.fillStyle = c.dome; ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.moveTo(-7, 5); ctx.lineTo(7, 5); ctx.lineTo(pose === "attack" ? 18 : 12, 38); ctx.lineTo(pose === "attack" ? -18 : -12, 38); ctx.closePath(); ctx.fill();
    ctx.globalAlpha /= a;
    ctx.strokeStyle = c.light; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 38, pose === "attack" ? 17 : 10, 3.5, 0, 0, TAU); ctx.stroke();
  }
  ctx.rotate(tilt);
  if (dk > 0) ctx.globalAlpha *= 1 - dk * 0.6;
  // cúpula + piloto
  ctx.fillStyle = c.dome; ctx.beginPath(); ctx.ellipse(0, -2, 8, 8, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = c.pilot; ell(ctx, 0, -4, 3.2, 3.6);
  ctx.fillStyle = "#101820";
  if (pose === "hurt" || pose === "death") { ctx.fillRect(-2.4, -5, 1.8, 0.8); ctx.fillRect(0.6, -5, 1.8, 0.8); }
  else { ell(ctx, -1.3, -4.8, 0.9, 1.3); ell(ctx, 1.3, -4.8, 0.9, 1.3); }
  ctx.strokeStyle = c.pilot; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(0, -7.5); ctx.lineTo(1.5, -10); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.55)"; ell(ctx, -4, -5, 1.6, 1.2);
  // casco
  ctx.fillStyle = c.hull; ell(ctx, 0, 2, 18, 5.5);
  ctx.fillStyle = c.band; ctx.fillRect(-17, 2, 34, 2.2);
  ctx.fillStyle = c.band; ell(ctx, 0, 5.5, 8, 2.2);
  // luces que giran
  const spin = pose === "windup" ? t / 1.5 : t / 5;
  for (let i = 0; i < 5; i++) {
    const on = ((Math.floor(spin) + i) % 5) < 2 || pose === "attack";
    ctx.fillStyle = on ? c.light : "#30404c";
    circle(ctx, -12 + i * 6, 3, 1.5);
  }
  if (pose === "death") { ctx.fillStyle = "#555"; ctx.globalAlpha *= 0.6; circle(ctx, 10, -4 - dk * 6, 3 + dk * 3); circle(ctx, 14, -9 - dk * 8, 2 + dk * 3); }
  if (pose === "hurt") { ctx.fillStyle = c.light; circle(ctx, 15, -3, 1.6); circle(ctx, -14, 5, 1.2); }
  ctx.restore();
}

const DRAW = { brasita: drawBrasita, escoria: drawEscoria, ufo: drawUfo };

// Dibuja en coordenadas locales (origen = centro del enemigo, ya trasladado).
// Devuelve true si lo ha dibujado, false si no es uno de los foes de Dino.
export function drawDinoFoe(ctx, foe, t) {
  const fn = foe && DRAW[foe.kind];
  if (!fn || !ctx) return false;
  ctx.save();
  try { fn(ctx, foe, Number(t) || 0, dinoFoePose(foe), dinoFoeTier(foe)); }
  finally { ctx.restore(); }
  return true;
}

// ---------- Peligros (charco de lava de escoria + chispitas de brasita) ----------
// Coordenadas de mundo: llamar con el ctx ya trasladado por la cámara.
// puddles/sparks = dinoPuddles/dinoSparks de engine/foes/dino-ai.js.
export function drawDinoHazards(ctx, puddles = [], sparks = [], t = 0) {
  if (!ctx) return;
  ctx.save();
  for (const q of puddles) {
    const mx = q.x + q.w / 2;
    if (q.warn > 0) {   // telegraph: anillo discontinuo que parpadea
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.9);
      ctx.strokeStyle = "#ffd04a"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.ellipse(mx, q.y, q.w / 2, 5, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      continue;
    }
    const k = Math.min(1, q.life / 20);         // se apaga al final
    ctx.globalAlpha = k;
    ctx.fillStyle = "#7a1a08"; ell(ctx, mx, q.y, q.w / 2, 5.5);
    ctx.fillStyle = "#ff5a14"; ell(ctx, mx, q.y - 0.5, q.w / 2 - 4, 3.8);
    ctx.fillStyle = "#ffd04a"; ell(ctx, mx - 6, q.y - 1, q.w / 5, 1.6);
    for (let i = 0; i < 3; i++) {                // burbujas
      const ph = (t / 9 + i * 0.37) % 1;
      ctx.globalAlpha = k * (1 - ph);
      circle(ctx, q.x + 10 + i * (q.w - 20) / 2, q.y - 2 - ph * 10, 1.5 + ph);
    }
  }
  for (const s of sparks) {
    const k = s.life / (s.max || 40);
    ctx.globalAlpha = k;
    ctx.fillStyle = s.tier >= 2 ? "#9ff4ff" : "#ffd04a"; circle(ctx, s.x, s.y, 2 + 3 * k);
    ctx.fillStyle = "#ff8a24"; circle(ctx, s.x - s.vx, s.y - s.vy, 1.5 * k + 0.5);
  }
  ctx.restore();
}

// Jugador abducido por el ufo: halo de anillos ascendentes (llamar en coords de mundo).
export function drawDinoAbductFx(ctx, p, t = 0) {
  if (!ctx || !p || !(p.dinoAbducted > 0)) return;
  ctx.save(); ctx.strokeStyle = "#bff4ff"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const ph = (t / 12 + i / 3) % 1;
    ctx.globalAlpha = 1 - ph;
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h - ph * (p.h + 10), p.w * 0.7, 3, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
