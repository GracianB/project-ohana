// ============================================================================
// PLANTILLA DE PERSONAJE (referencia para characters/art/<id>.js)
// No se usa en el juego. Muestra cómo leer la pose y animar por partes.
// ============================================================================
//
// draw(ctx, pose, R)
//   · (0,0) = centro de los pies, mira a +x, ~100 unidades de alto.
//   · pose.state: idle | run | jump | fall | attack | cast | hurt | wall | glide | dead | victory
//   · pose.form 0..4 → cambia silueta/accesorios (bebé → GOD)
//   · NO aplastes el cuerpo entero al aterrizar/saltar: draw.js ya lo hace.
//     Sí anima partes: piernas, brazos, cabeza, orejas, cola, cara.

const PAL = [
  // una paleta por forma: cuerpo, barriga, acento
  { body: "#8fd3ff", belly: "#e8f7ff", accent: "#ff8ab0" },
  { body: "#5bb8f5", belly: "#dff2ff", accent: "#ff6f9c" },
  { body: "#3f9ae8", belly: "#d4ecff", accent: "#ffcf4a" },
  { body: "#2c73c9", belly: "#c9e4ff", accent: "#ffcf4a" },
  { body: "#f4f8ff", belly: "#ffffff", accent: "#ffd84a" },
];

function draw(ctx, pose, R) {
  const f = pose.form;
  const c = PAL[f];
  const t = pose.t;
  const run = pose.state === "run";
  const air = pose.state === "jump" || pose.state === "fall";

  // --- proporciones por forma: bebé = cabezón; GOD = más estilizado
  const headR = [30, 26, 24, 23, 22][f];
  const bodyH = [22, 30, 34, 38, 40][f];
  const legL = [12, 18, 20, 22, 24][f];
  const hipY = -legL;
  const bodyY = hipY - bodyH * 0.5;
  const headY = hipY - bodyH - headR * 0.75;

  // --- ciclo de piernas / brazos según estado
  const sw = run ? Math.sin(pose.phase) : 0;
  let legA = sw * 0.7, legB = -sw * 0.7;
  if (air) { legA = pose.vy < 0 ? -0.6 : 0.35; legB = pose.vy < 0 ? 0.25 : -0.3; }
  let armA = -sw * 0.8, armB = sw * 0.8;
  // swingLimb: ángulo 0 = hacia abajo; positivo = hacia delante (+x); ±π = hacia arriba
  if (pose.state === "attack") armA = -0.8 + pose.atk * 2.6;        // de atrás a delante-arriba
  if (pose.state === "cast") { armA = 2.5; armB = 2.2; }             // brazos arriba-delante
  if (pose.state === "hurt") { armA = -1.2; armB = 1.2; }
  if (pose.state === "victory") { armA = 2.9; armB = -2.9; }

  const bob = run ? -Math.abs(Math.cos(pose.phase)) * 3 : pose.breath * 1.2;

  ctx.save();
  ctx.translate(0, bob);

  // --- cola (detrás): se va hacia atrás con pose.sway
  R.tail(ctx, -bodyH * 0.35, bodyY + 6, 26 + f * 4, Math.PI * 0.95,
    (k) => Math.sin(t * 0.12 + k * 3) * 1.2 + pose.sway * 1.5, 7, 3, c.body);

  // --- pierna y brazo traseros (más oscuros)
  R.swingLimb(ctx, -6, hipY, legL, legB, 3, 9, R.darken(c.body, 0.18));
  R.swingLimb(ctx, -8, bodyY - bodyH * 0.25, 16 + f * 2, armB, -3, 7, R.darken(c.body, 0.18));

  // --- cuerpo
  R.ellipse(ctx, 0, bodyY, bodyH * 0.55, bodyH * 0.58, c.body);
  R.ellipse(ctx, 3, bodyY + 3, bodyH * 0.34, bodyH * 0.38, c.belly, { line: false, shade: false });

  // --- pierna y brazo delanteros
  R.swingLimb(ctx, 6, hipY, legL, legA, 3, 10, c.body);

  // --- cabeza (se inclina con el estado y rebota con pose.bounce)
  ctx.save();
  ctx.translate(2, headY + pose.bounce * 2);
  ctx.rotate(pose.state === "hurt" ? -0.25 : run ? 0.06 : Math.sin(t * 0.03) * 0.04);
  // orejas con muelle
  const ear = pose.sway * 0.4;
  R.blob(ctx, [[-14, -headR * 0.7], [-22 + ear * 10, -headR * 1.5], [-6, -headR * 0.95]], c.body);
  R.blob(ctx, [[6, -headR * 0.9], [16 + ear * 10, -headR * 1.55], [16, -headR * 0.6]], c.body);
  R.ellipse(ctx, 0, 0, headR, headR * 0.92, c.body);
  // cara (mira a +x → rasgos desplazados a la derecha)
  const mood = pose.state === "hurt" ? "closed" : pose.state === "attack" ? "angry" : pose.state === "victory" ? "happy" : "normal";
  R.eye(ctx, 2, -3, headR * 0.26, pose, { iris: "#2a5bd7", mood });
  R.eye(ctx, headR * 0.55, -3, headR * 0.22, pose, { iris: "#2a5bd7", mood });
  R.blush(ctx, -4, headR * 0.35, headR * 0.16);
  R.mouth(ctx, headR * 0.35, headR * 0.35, headR * 0.35,
    pose.state === "attack" || pose.state === "cast" ? "open" : pose.state === "hurt" ? "o" : "smile");
  ctx.restore();

  R.swingLimb(ctx, 10, bodyY - bodyH * 0.25, 16 + f * 2, armA, 3, 8, c.body);

  // --- accesorios por forma
  if (f >= 3) R.star(ctx, 0, headY - headR * 1.3, 7, c.accent);
  if (f === 4) R.halo(ctx, 0, headY - headR * 1.25, headR * 0.8, t);

  // --- gesto de espera propio (pose.flourish 0..1): aquí, un saludo
  if (pose.flourish > 0) {
    const k = Math.sin(pose.flourish * Math.PI);
    R.sparkle(ctx, 22, headY - 10 - k * 10, 4 + k * 4);
  }
  ctx.restore();
}

export default { id: "template", draw };
