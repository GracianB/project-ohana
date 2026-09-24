// ============================================================================
// MICHI · gatita mochi kawaii (diseño original)
// Cabeza enorme y redonda como un daifuku, cuerpo de panecillo, patitas
// cortas con almohadillas, ojos gigantes con brillos, nariz de corazón,
// boquita "ω", cascabel y cola con punta de corazón.
// Formas: Michito (bolita) · Michi · Nube rosa · Michi Luna · MICHI GOD
// ============================================================================

const TAU = Math.PI * 2;
const INK = "#5b2f4f";   // contorno ciruela: más tierno que el negro
const LW = 3;

const PAL = [
  { fur: "#ffd9ec", belly: "#fff6fb", ear: "#ff9cc8", bow: "#ff5c9a", iris: "#7a4bd8", tail: "#ff9cc8" },
  { fur: "#ffc4e1", belly: "#fff3f9", ear: "#ff86bb", bow: "#ff4f8e", iris: "#6c47e0", tail: "#ff86bb" },
  { fur: "#ffb0d6", belly: "#fff0f8", ear: "#ff6fae", bow: "#7fd8ff", iris: "#3f8ef0", tail: "#ffffff" },
  { fur: "#d9c6ff", belly: "#f6f0ff", ear: "#b594ff", bow: "#ffd76a", iris: "#5b3fd0", tail: "#b594ff" },
  { fur: "#fffaff", belly: "#ffffff", ear: "#ffb3d6", bow: "#ffcf4a", iris: "#e0489b", tail: "#ffd1e8" },
];

// ---------------------------------------------------------------------------
// helpers de dibujo con el contorno ciruela
// ---------------------------------------------------------------------------
function stroke(ctx, lw = LW) {
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
}
function soft(ctx, x, y, r, c, R) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, R.lighten(c, 0.45));
  g.addColorStop(0.6, c);
  g.addColorStop(1, R.darken(c, 0.1));
  return g;
}
function oval(ctx, R, x, y, rx, ry, c, opt = {}) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, opt.rot || 0, 0, TAU);
  ctx.fillStyle = opt.flat ? c : soft(ctx, x, y, Math.max(rx, ry), c, R);
  ctx.fill();
  if (opt.line !== false) stroke(ctx, opt.lw);
}
function heart(ctx, x, y, s, c, line = true) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  ctx.closePath();
  ctx.fillStyle = c; ctx.fill();
  if (line) stroke(ctx, Math.max(1.2, s * 0.3));
}
function twinkle(ctx, x, y, r, c = "#fff") {
  ctx.save(); ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill(); ctx.restore();
}

/** Ojo kawaii: óvalo grande, degradado de iris, dos brillos grandes y destello. */
function kawaiiEye(ctx, R, x, y, r, pose, iris, mood) {
  const blink = pose.blink;
  if (mood === "happy" || mood === "closed" || blink > 0.7) {
    ctx.beginPath();
    if (mood === "happy") ctx.arc(x, y + r * 0.4, r * 0.75, Math.PI * 1.15, Math.PI * 1.85);
    else { ctx.moveTo(x - r * 0.8, y); ctx.quadraticCurveTo(x, y + r * 0.5, x + r * 0.8, y); }
    stroke(ctx, r * 0.32);
    return;
  }
  if (mood === "hurt") { // > <
    ctx.beginPath();
    ctx.moveTo(x - r * 0.6, y - r * 0.55); ctx.lineTo(x + r * 0.5, y); ctx.lineTo(x - r * 0.6, y + r * 0.55);
    stroke(ctx, r * 0.3);
    return;
  }
  if (mood === "swirl") {
    ctx.beginPath();
    for (let a = 0; a < TAU * 2; a += 0.3) ctx.lineTo(x + Math.cos(a) * a * r * 0.07, y + Math.sin(a) * a * r * 0.07);
    stroke(ctx, r * 0.18);
    return;
  }
  const ry = r * 1.18 * (1 - blink * 0.85);
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.92, ry, 0, 0, TAU);
  const g = ctx.createLinearGradient(x, y - ry, x, y + ry);
  g.addColorStop(0, "#2a1636");
  g.addColorStop(0.55, R.darken(iris, 0.15));
  g.addColorStop(1, R.lighten(iris, 0.45));
  ctx.fillStyle = g; ctx.fill();
  stroke(ctx, 2.4);
  ctx.clip();
  if (mood === "heart") {
    heart(ctx, x, y + r * 0.1, r * 0.55, "#ff5c9a", false);
  }
  const lx = pose.look.x * r * 0.08, ly = pose.look.y * r * 0.15;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(x + lx - r * 0.3, y + ly - r * 0.45, r * 0.34, r * 0.4, -0.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x + lx + r * 0.35, y + ly + r * 0.42, r * 0.16, 0, TAU); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath(); ctx.arc(x + lx + r * 0.1, y + ly + r * 0.72, r * 0.1, 0, TAU); ctx.fill();
  ctx.restore();
  // pestañitas
  ctx.beginPath();
  ctx.moveTo(x + r * 0.62, y - ry * 0.72); ctx.lineTo(x + r * 1.02, y - ry * 0.98);
  stroke(ctx, 2);
}

/** Boquita ω (o abierta). */
function kittyMouth(ctx, x, y, s, open) {
  if (open) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.55, y);
    ctx.quadraticCurveTo(x, y + s * 1.3 * open, x + s * 0.55, y);
    ctx.closePath();
    ctx.fillStyle = "#b8345f"; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = "#ff8fb0";
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.9 * open, s * 0.35, s * 0.3, 0, 0, TAU); ctx.fill();
    ctx.restore();
    stroke(ctx, 2);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x - s * 0.55, y - s * 0.05);
  ctx.quadraticCurveTo(x - s * 0.28, y + s * 0.4, x, y);
  ctx.quadraticCurveTo(x + s * 0.28, y + s * 0.4, x + s * 0.55, y - s * 0.05);
  stroke(ctx, 2);
}

/** Pata con almohadilla (x,y = base en el suelo). */
function paw(ctx, R, x, y, len, ang, c, beans = false) {
  const ex = x + Math.sin(ang) * len, ey = y - Math.cos(ang) * 0 + Math.cos(ang) * len * 0; // base
  ctx.save();
  ctx.translate(x, y - len);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(-5, 0); ctx.lineTo(-5.5, len - 2); ctx.quadraticCurveTo(0, len + 4, 5.5, len - 2); ctx.lineTo(5, 0);
  ctx.fillStyle = c; ctx.fill(); stroke(ctx);
  if (beans) {
    ctx.fillStyle = "#ff8fb8";
    ctx.beginPath(); ctx.ellipse(0, len - 1.5, 2.4, 1.6, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  return [ex, ey];
}

/** Pata delantera levantada (saludo, zarpazo) con almohadillas visibles. */
function raisedPaw(ctx, R, sx, sy, ang, len, c) {
  const x = sx + Math.sin(ang) * len, y = sy - Math.cos(ang) * len;
  ctx.beginPath();
  ctx.moveTo(sx, sy); ctx.lineTo(x, y);
  ctx.lineCap = "round";
  ctx.lineWidth = 11 + LW * 2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = 11; ctx.strokeStyle = c; ctx.stroke();
  // almohadillas
  ctx.fillStyle = "#ff8fb8";
  ctx.beginPath(); ctx.ellipse(x, y, 3.2, 2.6, 0, 0, TAU); ctx.fill();
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(x + i * 3, y - 3.8 + Math.abs(i) * 0.8, 1.3, 0, TAU); ctx.fill(); }
  return [x, y];
}

// ---------------------------------------------------------------------------
// dibujo principal
// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = pose.form, c = PAL[f], t = pose.t, st = pose.state;
  const run = st === "run", air = st === "jump" || st === "fall" || st === "glide";

  // proporciones: bebé = casi solo cabeza
  const headR = [36, 33, 31, 30, 29][f];
  const bodyRX = [15, 24, 27, 28, 29][f];
  const bodyRY = [11, 16, 18, 19, 20][f];
  const legL = [5, 8, 9, 10, 11][f];

  // rebote mochi: el cuerpo se aplasta y estira con la carrera y la respiración
  let squash = 1 + pose.breath * 0.025;
  let hop = 0;
  if (run) { const s = Math.sin(pose.phase * 2); squash = 1 + s * 0.07; hop = -Math.max(0, Math.sin(pose.phase * 2)) * 6; }
  if (st === "victory") hop = -Math.abs(Math.sin(t * 0.18)) * 12 * (0.5 + pose.evoT * 0.5);
  if (st === "dead") squash = 0.55;
  const bodyY = -legL - bodyRY * 0.9;
  const headX = 10 + (run ? 3 : 0) + (st === "attack" ? pose.atk * 6 : 0);
  let headY = bodyY - bodyRY * 0.35 - headR * 0.72 + (f === 0 ? 10 : 0);
  let tilt = Math.sin(t * 0.045) * 0.06 + pose.sway * 0.06;
  if (st === "hurt") tilt = -0.28;
  if (st === "cast" && pose.castSlot === 1) tilt = 0.18;
  if (pose.flourish > 0 && pose.flourishN % 3 === 1) tilt = Math.sin(pose.flourish * TAU * 2) * 0.25; // mira a la mariposa

  ctx.save();
  ctx.translate(0, hop);
  if (st === "dead") { ctx.translate(0, 8); ctx.rotate(0.12); }

  // ------------------------------------------------------------- detrás
  // alas (GOD)
  if (f === 4) {
    const flap = Math.sin(t * (air ? 0.4 : 0.12)) * (air ? 0.5 : 0.2);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-8, bodyY - 8);
      ctx.scale(side === -1 ? 1 : 0.8, 1);
      ctx.rotate(-0.5 - flap * side * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-20, -30, -48, -26, -46, -6);
      ctx.bezierCurveTo(-44, 4, -34, 2, -30, 8);
      ctx.bezierCurveTo(-26, 16, -14, 12, 0, 4);
      ctx.fillStyle = side === -1 ? "#ffffff" : "#ffe8f4"; ctx.fill(); stroke(ctx);
      ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-26, -12, -36, -6); stroke(ctx, 1.6);
      ctx.restore();
    }
  }
  // capa estrellada (Luna)
  if (f === 3) {
    ctx.beginPath();
    const w = pose.sway * 8 + Math.sin(t * 0.1) * 3;
    ctx.moveTo(0, bodyY - bodyRY * 0.9);
    ctx.quadraticCurveTo(-bodyRX - 14 + w, bodyY, -bodyRX - 10 + w * 1.5, -legL + 2);
    ctx.lineTo(-bodyRX * 0.2, -legL + 4);
    ctx.closePath();
    ctx.fillStyle = "#6a4fd8"; ctx.fill(); stroke(ctx);
    ctx.fillStyle = "#fff4b0";
    [[-18, -30], [-28, -18], [-12, -16]].forEach(([sx, sy], i) => twinkle(ctx, sx + w * 0.5, sy, 2.4 + Math.sin(t * 0.2 + i) * 0.8, "#fff4b0"));
  }

  // cola (muelle + punta de corazón; Nube = cola nube; GOD = 3 colitas)
  const tails = f === 4 ? 3 : 1;
  for (let k = 0; k < tails; k++) {
    const spread = tails > 1 ? (k - 1) * 0.45 : 0;
    const swing = Math.sin(t * 0.09 + k) * 0.5 + pose.sway * 0.9 + (st === "hurt" ? -0.6 : 0) + (st === "cast" && pose.castSlot === 2 ? Math.sin(t * 0.4 + k) * 0.6 : 0);
    const base = -Math.PI / 2 - 0.55 + spread;
    const end = R.tail(ctx, -bodyRX * 0.85, bodyY - 2, 26 + f * 4, base - 0.4,
      (u) => (swing + 1.2) * (1 - u) * 1.4 + Math.sin(t * 0.12 + u * 4) * 0.5,
      7.5, 4.5, c.tail, { ink: INK, lw: LW, segments: 9 });
    if (f === 2) {
      oval(ctx, R, end[0], end[1], 9, 7, "#ffffff");
      oval(ctx, R, end[0] - 6, end[1] + 3, 6, 5, "#ffffff");
    } else heart(ctx, end[0], end[1], 5.5, f >= 3 ? "#ffd76a" : c.bow);
  }

  // patas traseras (lado lejano)
  const step = run ? pose.phase * 2 : 0;
  const legSwing = (o) => (run ? Math.sin(step + o) * 0.55 : air ? (pose.vy < 0 ? -0.5 : 0.4) : 0);
  if (f > 0) {
    paw(ctx, R, -bodyRX * 0.55, 0, legL + 2, legSwing(Math.PI), R.darken(c.fur, 0.08));
    paw(ctx, R, bodyRX * 0.45, 0, legL + 2, legSwing(0), R.darken(c.fur, 0.08));
  }

  // ------------------------------------------------------------- cuerpo
  ctx.save();
  ctx.translate(0, bodyY + bodyRY);
  ctx.scale(1 / squash, squash);
  ctx.translate(0, -bodyRY);
  if (f > 0 || true) {
    oval(ctx, R, 0, 0, bodyRX, bodyRY, c.fur);
    oval(ctx, R, bodyRX * 0.25, bodyRY * 0.25, bodyRX * 0.55, bodyRY * 0.55, c.belly, { line: false, flat: true });
  }
  // melena nube (Nube rosa)
  if (f === 2) {
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * 0.95 + i * 0.36;
      oval(ctx, R, bodyRX * 0.25 + Math.cos(a) * 16, -2 + Math.sin(a) * 10, 8, 7, "#fff5fb", { lw: 2.4 });
    }
  }
  ctx.restore();

  // patas delanteras (lado cercano)
  const frontSwing = (o) => legSwing(o + Math.PI * 0.5);
  paw(ctx, R, -bodyRX * 0.35, 0, legL + 3, frontSwing(0), c.fur, f === 0);
  let pawUp = null;
  if (st === "attack") pawUp = { ang: -0.3 + pose.atk * 2.4, len: 18 };
  else if (st === "cast" && pose.castSlot === 0) pawUp = { ang: 2.2 - pose.cast * 1.6, len: 18 };
  else if (st === "cast" && pose.castSlot === 2) pawUp = { ang: 2.8, len: 20 };
  else if (st === "victory") pawUp = { ang: 2.6 + Math.sin(t * 0.3) * 0.4, len: 18 };
  else if (st === "wall") pawUp = { ang: 1.4, len: 16 };
  else if (pose.flourish > 0 && pose.flourishN % 3 === 0) pawUp = { ang: 2.2 + Math.sin(pose.flourish * TAU * 3) * 0.35, len: 16 }; // lavarse la cara
  if (pawUp) raisedPaw(ctx, R, bodyRX * 0.45, bodyY - 2, pawUp.ang, pawUp.len + f, c.fur);
  else paw(ctx, R, bodyRX * 0.55, 0, legL + 3, frontSwing(Math.PI), c.fur, f === 0);

  // cascabel
  if (f <= 2) {
    const bx = headX - 4, by = headY + headR * 0.85;
    ctx.beginPath(); ctx.moveTo(bx - 12, by - 3); ctx.quadraticCurveTo(bx, by + 3, bx + 12, by - 3);
    ctx.lineWidth = 5; ctx.strokeStyle = c.bow; ctx.stroke();
    oval(ctx, R, bx, by + 3 + Math.sin(t * 0.3) * (run ? 1.5 : 0.4), 4.2, 4.2, "#ffd84a", { lw: 2 });
  }

  // ------------------------------------------------------------- cabeza
  ctx.save();
  ctx.translate(headX, headY + pose.bounce * 2.5);
  ctx.rotate(tilt);
  const earFlick = pose.flourish > 0 ? Math.sin(pose.flourish * TAU * 4) * 0.15 : Math.sin(t * 0.07) > 0.97 ? 0.2 : 0;
  const earBack = (st === "hurt" ? 0.5 : 0) + (air && pose.vy < 0 ? -0.15 : 0) + pose.sway * 0.12;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * headR * 0.52, -headR * 0.62);
    ctx.rotate(side * 0.28 + earBack * -side * 0.4 + (side === 1 ? earFlick : 0));
    ctx.beginPath();
    ctx.moveTo(-headR * 0.34, headR * 0.18);
    ctx.quadraticCurveTo(-headR * 0.2, -headR * 0.55, headR * 0.02, -headR * 0.58);
    ctx.quadraticCurveTo(headR * 0.22, -headR * 0.5, headR * 0.34, headR * 0.18);
    ctx.fillStyle = soft(ctx, 0, 0, headR * 0.5, c.fur, R); ctx.fill(); stroke(ctx);
    ctx.beginPath();
    ctx.moveTo(-headR * 0.18, headR * 0.08);
    ctx.quadraticCurveTo(-headR * 0.08, -headR * 0.36, headR * 0.02, -headR * 0.38);
    ctx.quadraticCurveTo(headR * 0.12, -headR * 0.3, headR * 0.2, headR * 0.08);
    ctx.fillStyle = c.ear; ctx.fill();
    ctx.restore();
  }
  // cabeza mochi (un poco más ancha que alta)
  oval(ctx, R, 0, 0, headR * 1.08, headR * 0.94, c.fur);
  // mofletes y mechón
  ctx.beginPath();
  ctx.moveTo(-6, -headR * 0.9); ctx.quadraticCurveTo(-2, -headR * 1.12, 3, -headR * 0.92);
  ctx.quadraticCurveTo(6, -headR * 1.1, 10, -headR * 0.86);
  stroke(ctx, 2.2);

  // cara (desplazada hacia +x)
  let mood = "normal";
  if (st === "hurt") mood = "hurt";
  else if (st === "dead") mood = "swirl";
  else if (st === "victory") mood = "heart";
  else if ((st === "cast" && pose.castSlot === 1) || (pose.flourish > 0 && pose.flourishN % 3 === 0)) mood = "happy";
  else if (pose.flourish > 0 && pose.flourishN % 3 === 2 && pose.flourish > 0.3 && pose.flourish < 0.7) mood = "closed";
  const er = headR * 0.27;
  const fx = headR * 0.14;
  kawaiiEye(ctx, R, fx - headR * 0.36, headR * 0.02, er, pose, c.iris, mood);
  kawaiiEye(ctx, R, fx + headR * 0.4, headR * 0.02, er * 0.95, pose, c.iris, mood);
  R.blush(ctx, fx - headR * 0.62, headR * 0.34, headR * 0.17, "#ff6fa8");
  R.blush(ctx, fx + headR * 0.7, headR * 0.34, headR * 0.15, "#ff6fa8");
  heart(ctx, fx + headR * 0.03, headR * 0.26, 2.6, "#ff6f9f", false);
  let open = 0;
  if (st === "attack") open = 0.6 * Math.sin(pose.atk * Math.PI);
  else if (st === "hurt") open = 0.5;
  else if (st === "victory") open = 0.7;
  else if (st === "cast" && pose.castSlot !== 1) open = 0.55;
  else if (pose.flourish > 0 && pose.flourishN % 3 === 2) open = Math.sin(pose.flourish * Math.PI) * 0.9; // bostezo
  kittyMouth(ctx, fx + headR * 0.03, headR * 0.42, headR * 0.2, open);
  // bigotes
  ctx.globalAlpha = 0.7;
  for (const s of [-1, 1]) for (const k of [-1, 1]) {
    const bx = fx + headR * 0.03 + s * headR * 0.55;
    ctx.beginPath(); ctx.moveTo(bx, headR * 0.4 + k * 3); ctx.lineTo(bx + s * headR * 0.35, headR * 0.36 + k * 6);
    stroke(ctx, 1.3);
  }
  ctx.globalAlpha = 1;
  if (st === "hurt") { // lagrimita
    ctx.fillStyle = "#8fd8ff";
    ctx.beginPath(); ctx.ellipse(fx - headR * 0.45, headR * 0.35 + (t % 20) * 0.4, 2, 3, 0, 0, TAU); ctx.fill();
  }

  // accesorios de cabeza por forma
  if (f <= 1) { // lazo
    const bx = -headR * 0.55, by = -headR * 0.68;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + s * 10, by - 9, bx + s * 11, by + 1);
      ctx.quadraticCurveTo(bx + s * 8, by + 6, bx, by);
      ctx.fillStyle = c.bow; ctx.fill(); stroke(ctx, 2.2);
    }
    oval(ctx, R, bx, by, 3.2, 3.2, R.darken(c.bow, 0.1), { lw: 2 });
  } else if (f === 2) { // horquilla de estrella + nubecita
    R.star(ctx, -headR * 0.5, -headR * 0.72, 7, "#7fd8ff", { ink: INK, lw: 2.2 });
  } else if (f === 3) { // luna creciente
    ctx.save(); ctx.translate(-headR * 0.45, -headR * 0.72); ctx.rotate(-0.4);
    ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI * 0.3, Math.PI * 1.7);
    ctx.arc(4, -1, 6.5, Math.PI * 1.55, Math.PI * 0.45, true);
    ctx.closePath(); ctx.fillStyle = "#ffd76a"; ctx.fill(); stroke(ctx, 2);
    ctx.restore();
  } else { // corona de corazones
    for (let i = -1; i <= 1; i++) heart(ctx, i * 9, -headR * 0.98 - (i === 0 ? 4 : 0), i === 0 ? 5 : 4, "#ffcf4a");
  }
  ctx.restore(); // cabeza

  // halo GOD
  if (f === 4) R.halo(ctx, headX, headY - headR * 1.35, headR * 0.7, t, "#ffd76a");

  // ------------------------------------------------------------- efectos
  // bebé: chupete de corazón
  if (f === 0 && st !== "attack" && st !== "victory") {
    heart(ctx, headX + headR * 0.2, headY + headR * 0.55, 4, "#8fd8ff");
  }
  // lanzar ovillo
  if (st === "cast" && pose.castSlot === 0) {
    const k = pose.cast;
    const yx = headX + 18 + k * 30, yy = bodyY - 26 - Math.sin(k * Math.PI) * 18;
    oval(ctx, R, yx, yy, 6, 6, "#ff86bb", { lw: 2 });
    ctx.beginPath(); ctx.arc(yx, yy, 3.5, 0, Math.PI * 1.4); stroke(ctx, 1.4);
  }
  // ronroneo: corazones y zzz
  if (st === "cast" && pose.castSlot === 1) {
    for (let i = 0; i < 3; i++) {
      const k = (pose.cast + i / 3) % 1;
      heart(ctx, headX + 18 + i * 6, headY - headR - k * 22, 3 + k * 2, "#ff8fbf");
    }
  }
  // nueve colas / estrellas
  if (st === "cast" && pose.castSlot === 2) {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + t * 0.1;
      twinkle(ctx, Math.cos(a) * 44, bodyY - 20 + Math.sin(a) * 28, 3 + pose.cast * 3, i % 2 ? "#fff6c0" : "#ffb6e4");
    }
  }
  // zarpazo: estela de corazoncitos
  if (st === "attack") {
    ctx.save();
    ctx.globalAlpha = Math.sin(pose.atk * Math.PI);
    ctx.beginPath(); ctx.arc(headX + 8, bodyY - 12, 26, -1.2, 0.6);
    ctx.lineWidth = 4; ctx.strokeStyle = "#ffb6e4"; ctx.stroke();
    heart(ctx, headX + 32, bodyY - 20, 4, "#ff5c9a", false);
    ctx.restore();
  }
  // gestos: mariposa / burbujas de bostezo
  if (pose.flourish > 0 && pose.flourishN % 3 === 1) {
    const k = pose.flourish;
    const bx = headX + 26 + Math.sin(k * TAU * 2) * 14, by = headY - headR - 8 + Math.cos(k * TAU * 3) * 8;
    const w = Math.abs(Math.sin(t * 0.6)) * 5 + 2;
    ctx.fillStyle = "#8fd8ff";
    ctx.beginPath(); ctx.ellipse(bx - w * 0.6, by, w, 4, -0.4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx + w * 0.6, by, w, 4, 0.4, 0, TAU); ctx.fill();
    ctx.fillStyle = INK; ctx.fillRect(bx - 0.8, by - 3, 1.6, 6);
  }
  if (f === 2 && st === "idle") { // nubecitas flotando
    for (let i = 0; i < 2; i++) {
      const cx = -30 + i * 64, cy = -84 + Math.sin(t * 0.05 + i * 2) * 4;
      oval(ctx, R, cx, cy, 7, 5, "#ffffff", { lw: 1.8 });
      oval(ctx, R, cx + 6, cy + 1, 5, 4, "#ffffff", { lw: 1.8 });
    }
  }
  if (st === "victory" || f === 4) {
    for (let i = 0; i < 4; i++) {
      const a = t * 0.05 + i * 1.6;
      twinkle(ctx, Math.cos(a) * 46, -58 + Math.sin(a * 1.3) * 34, 2.5 + Math.sin(t * 0.2 + i) * 1.2, i % 2 ? "#fff6c0" : "#ffd1e8");
    }
  }
  if (st === "dead") { // estrellitas mareada
    for (let i = 0; i < 3; i++) {
      const a = t * 0.1 + i * 2.1;
      twinkle(ctx, headX + Math.cos(a) * 20, headY - headR - 4 + Math.sin(a) * 5, 3, "#ffe66a");
    }
  }
  ctx.restore();
}

export default { id: "cat", draw };
