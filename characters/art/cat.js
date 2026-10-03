// ============================================================================
// MICHI · GATO MOCHI · RENDER V2 MAX
// ============================================================================
// Diseño:
//   - Cabeza grande y claramente legible.
//   - Cara centrada y visible en todas las animaciones.
//   - Ojos grandes con doble brillo.
//   - Orejas detrás de la cabeza.
//   - Hocico y boca claramente separados.
//   - Cuerpo pequeño para reforzar la silueta "mochi".
//   - Cola expresiva.
//   - Patas cortas y visibles.
//   - Animaciones de ataque/cast/victory/dead/hurt reforzadas.
//   - Evoluciones visuales progresivas.
//   - Protección contra NaN, poses incompletas y valores inválidos.
//
// API pública:
//   export default { id: "cat", draw }
// ============================================================================

const TAU = Math.PI * 2;

const INK = "#4a2442";
const INK_SOFT = "#6b3c5b";

const LW = 3;

const PAL = [
  {
    fur: "#ffd9ec",
    belly: "#fff8fc",
    ear: "#ff9bc8",
    innerEar: "#ffb8d7",
    bow: "#ff4f91",
    iris: "#7044d7",
    tail: "#ff9bc8",
    paw: "#ff91bb"
  },
  {
    fur: "#ffc4e1",
    belly: "#fff4fa",
    ear: "#ff82b9",
    innerEar: "#ffacd1",
    bow: "#ff3f85",
    iris: "#6841df",
    tail: "#ff82b9",
    paw: "#ff82b9"
  },
  {
    fur: "#ffb4d9",
    belly: "#fff0f8",
    ear: "#ff70ae",
    innerEar: "#ff9fc7",
    bow: "#70d8ff",
    iris: "#388cf0",
    tail: "#ffffff",
    paw: "#ff78b4"
  },
  {
    fur: "#d8c6ff",
    belly: "#f8f3ff",
    ear: "#ae8fff",
    innerEar: "#c9b8ff",
    bow: "#ffd765",
    iris: "#5940d0",
    tail: "#ae8fff",
    paw: "#b398ff"
  },
  {
    fur: "#fffaff",
    belly: "#ffffff",
    ear: "#ffb3d7",
    innerEar: "#ffd3e8",
    bow: "#ffcf4b",
    iris: "#e0449b",
    tail: "#ffd4e8",
    paw: "#ffb5d8"
  }
];

// ============================================================================
// UTILIDADES NUMÉRICAS
// ============================================================================

function n(v, fallback = 0) {
  return Number.isFinite(v) ? v : fallback;
}

function clamp(v, a, b) {
  v = n(v, a);
  return Math.max(a, Math.min(b, v));
}

function safeForm(pose) {
  return clamp(Math.floor(n(pose?.form, 0)), 0, PAL.length - 1);
}

function safeTime(pose) {
  return n(pose?.t, 0);
}

function safeState(pose) {
  return typeof pose?.state === "string" ? pose.state : "idle";
}

function safePoseValue(pose, key, fallback = 0) {
  return n(pose?.[key], fallback);
}

function finitePoint(x, y) {
  return Number.isFinite(x) && Number.isFinite(y);
}

// ============================================================================
// CANVAS
// ============================================================================

function stroke(ctx, lw = LW, color = INK) {
  ctx.lineWidth = Number.isFinite(lw) ? lw : LW;
  ctx.strokeStyle = color;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function soft(ctx, x, y, r, color, R) {
  const radius = Math.max(1, n(r, 1));

  if (!R || typeof R.lighten !== "function" || typeof R.darken !== "function") {
    return color;
  }

  const g = ctx.createRadialGradient(
    x - radius * 0.35,
    y - radius * 0.45,
    radius * 0.08,
    x,
    y,
    radius * 1.15
  );

  g.addColorStop(0, R.lighten(color, 0.42));
  g.addColorStop(0.58, color);
  g.addColorStop(1, R.darken(color, 0.12));

  return g;
}

function oval(ctx, R, x, y, rx, ry, color, opt = {}) {
  rx = Math.max(0.1, n(rx, 1));
  ry = Math.max(0.1, n(ry, 1));

  ctx.beginPath();
  ctx.ellipse(
    n(x),
    n(y),
    rx,
    ry,
    n(opt.rot, 0),
    0,
    TAU
  );

  ctx.fillStyle =
    opt.flat || !R
      ? color
      : soft(ctx, n(x), n(y), Math.max(rx, ry), color, R);

  ctx.fill();

  if (opt.line !== false) {
    stroke(ctx, n(opt.lw, LW), opt.ink || INK);
  }
}

function circle(ctx, x, y, r, color, line = false, lw = 1.5) {
  ctx.beginPath();
  ctx.arc(n(x), n(y), Math.max(0.1, n(r, 1)), 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();

  if (line) {
    stroke(ctx, lw);
  }
}

function heart(ctx, x, y, s, color, line = true) {
  s = Math.max(0.5, n(s, 1));

  ctx.beginPath();

  ctx.moveTo(x, y + s * 0.92);

  ctx.bezierCurveTo(
    x - s * 1.35,
    y - s * 0.05,
    x - s * 0.72,
    y - s * 1.08,
    x,
    y - s * 0.32
  );

  ctx.bezierCurveTo(
    x + s * 0.72,
    y - s * 1.08,
    x + s * 1.35,
    y - s * 0.05,
    x,
    y + s * 0.92
  );

  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  if (line) {
    stroke(ctx, Math.max(1.1, s * 0.26));
  }
}

function twinkle(ctx, x, y, r, color = "#fff") {
  r = Math.max(0.5, n(r, 1));

  ctx.save();

  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// OJOS
// ============================================================================

function drawEye(ctx, R, x, y, radius, pose, iris, mood, side = 1) {
  radius = Math.max(4, n(radius, 8));

  const blink = clamp(safePoseValue(pose, "blink", 0), 0, 1);

  // --------------------------------------------------------------------------
  // EXPRESIONES ESPECIALES
  // --------------------------------------------------------------------------

  if (mood === "hurt") {
    ctx.beginPath();

    ctx.moveTo(x - radius * 0.62, y - radius * 0.48);
    ctx.lineTo(x + radius * 0.55, y + radius * 0.46);
    ctx.moveTo(x + radius * 0.55, y - radius * 0.48);
    ctx.lineTo(x - radius * 0.62, y + radius * 0.46);

    stroke(ctx, Math.max(2.5, radius * 0.28));
    return;
  }

  if (mood === "happy" || mood === "closed" || blink > 0.78) {
    ctx.beginPath();

    ctx.arc(
      x,
      y + radius * 0.16,
      radius * 0.72,
      Math.PI * 1.12,
      Math.PI * 1.88
    );

    stroke(ctx, Math.max(2.2, radius * 0.25));
    return;
  }

  if (mood === "heart") {
    heart(
      ctx,
      x,
      y,
      radius * 0.68,
      side < 0 ? "#ff4f9a" : "#ff72ad",
      false
    );

    return;
  }

  if (mood === "swirl") {
    ctx.beginPath();

    for (let i = 0; i < 28; i++) {
      const a = i * 0.42;
      const rr = radius * 0.05 + i * radius * 0.022;

      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    stroke(ctx, Math.max(1.4, radius * 0.13));
    return;
  }

  // --------------------------------------------------------------------------
  // OJO NORMAL
  // --------------------------------------------------------------------------

  const eyeW = radius * 0.92;
  const eyeH = radius * 1.17 * (1 - blink * 0.78);

  ctx.save();

  ctx.beginPath();
  ctx.ellipse(x, y, eyeW, Math.max(1, eyeH), 0, 0, TAU);

  ctx.fillStyle = "#fff";
  ctx.fill();

  stroke(ctx, Math.max(1.8, radius * 0.16));

  ctx.clip();

  // Iris
  ctx.beginPath();

  ctx.ellipse(
    x,
    y + eyeH * 0.08,
    radius * 0.49,
    eyeH * 0.62,
    0,
    0,
    TAU
  );

  ctx.fillStyle = iris;
  ctx.fill();

  // Pupila
  ctx.beginPath();

  ctx.ellipse(
    x,
    y + eyeH * 0.12,
    radius * 0.23,
    eyeH * 0.40,
    0,
    0,
    TAU
  );

  ctx.fillStyle = "#17101d";
  ctx.fill();

  // Brillo principal
  circle(
    ctx,
    x - radius * 0.22,
    y - radius * 0.28,
    radius * 0.22,
    "#fff"
  );

  // Segundo brillo
  circle(
    ctx,
    x + radius * 0.22,
    y + radius * 0.18,
    radius * 0.09,
    "#fff"
  );

  ctx.restore();

  // Pestaña exterior
  ctx.beginPath();

  ctx.moveTo(
    x + side * radius * 0.58,
    y - radius * 0.67
  );

  ctx.lineTo(
    x + side * radius * 0.98,
    y - radius * 0.93
  );

  stroke(ctx, Math.max(1.3, radius * 0.12));
}

// ============================================================================
// BOCA
// ============================================================================

function drawMouth(ctx, x, y, size, open, mood) {
  size = Math.max(2, n(size, 5));
  open = clamp(n(open, 0), 0, 1);

  if (mood === "hurt") {
    ctx.beginPath();

    ctx.moveTo(x - size * 0.7, y + 2);
    ctx.quadraticCurveTo(x, y - size * 0.35, x + size * 0.7, y + 2);

    stroke(ctx, 1.8);
    return;
  }

  if (open > 0.05) {
    const h = size * (0.55 + open * 1.1);

    ctx.beginPath();

    ctx.moveTo(x - size * 0.62, y);
    ctx.quadraticCurveTo(
      x,
      y + h,
      x + size * 0.62,
      y
    );

    ctx.closePath();

    ctx.fillStyle = "#a92f58";
    ctx.fill();

    ctx.fillStyle = "#ff8cae";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + h * 0.72,
      size * 0.31,
      size * 0.22,
      0,
      0,
      TAU
    );

    ctx.fill();

    stroke(ctx, 1.7);
    return;
  }

  // Boca omega muy limpia
  ctx.beginPath();

  ctx.moveTo(x - size * 0.58, y);

  ctx.quadraticCurveTo(
    x - size * 0.28,
    y + size * 0.45,
    x,
    y + size * 0.03
  );

  ctx.quadraticCurveTo(
    x + size * 0.28,
    y + size * 0.45,
    x + size * 0.58,
    y
  );

  stroke(ctx, 1.8);
}

// ============================================================================
// BIGOTES
// ============================================================================

function whiskers(ctx, x, y, headR) {
  ctx.save();

  ctx.globalAlpha = 0.72;

  ctx.lineWidth = 1.25;
  ctx.strokeStyle = INK_SOFT;
  ctx.lineCap = "round";

  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const yy = y + (i - 1) * 5;

      ctx.beginPath();

      ctx.moveTo(
        x + side * headR * 0.48,
        yy
      );

      ctx.quadraticCurveTo(
        x + side * headR * 0.72,
        yy - 2,
        x + side * headR * (0.98 + i * 0.04),
        yy + (i - 1) * 4
      );

      ctx.stroke();
    }
  }

  ctx.restore();
}

// ============================================================================
// PATAS
// ============================================================================

function paw(ctx, R, x, y, length, angle, color, beans = false) {
  length = Math.max(5, n(length, 8));
  angle = n(angle, 0);

  ctx.save();

  ctx.translate(n(x), n(y - length));
  ctx.rotate(angle);

  ctx.beginPath();

  ctx.moveTo(-5, 0);
  ctx.lineTo(-6, length - 3);

  ctx.quadraticCurveTo(
    0,
    length + 3,
    6,
    length - 3
  );

  ctx.lineTo(5, 0);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  stroke(ctx, 2.4);

  if (beans) {
    ctx.fillStyle = "#ff8fb9";

    ctx.beginPath();
    ctx.ellipse(
      0,
      length - 1.5,
      2.6,
      1.7,
      0,
      0,
      TAU
    );
    ctx.fill();

    for (let i = -1; i <= 1; i++) {
      circle(
        ctx,
        i * 3,
        length - 5 - Math.abs(i),
        1.15,
        "#ff8fb9"
      );
    }
  }

  ctx.restore();
}

function raisedPaw(ctx, x, y, angle, length, color) {
  length = Math.max(8, n(length, 16));
  angle = n(angle, 0);

  const ex = x + Math.sin(angle) * length;
  const ey = y - Math.cos(angle) * length;

  ctx.save();

  ctx.lineCap = "round";

  ctx.lineWidth = 15;
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.lineWidth = 11;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Almohadilla grande
  circle(ctx, ex, ey, 3.6, "#ff8fb9");

  for (let i = -1; i <= 1; i++) {
    circle(
      ctx,
      ex + i * 3,
      ey - 4 + Math.abs(i),
      1.25,
      "#ff8fb9"
    );
  }

  ctx.restore();

  return [ex, ey];
}

// ============================================================================
// OREJAS
// ============================================================================

function drawEar(ctx, R, x, y, size, side, c, tilt = 0) {
  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(side * tilt);

  ctx.beginPath();

  ctx.moveTo(-size * 0.48, size * 0.36);

  ctx.quadraticCurveTo(
    -size * 0.34,
    -size * 0.65,
    0,
    -size * 0.78
  );

  ctx.quadraticCurveTo(
    size * 0.34,
    -size * 0.65,
    size * 0.48,
    size * 0.36
  );

  ctx.closePath();

  ctx.fillStyle = soft(
    ctx,
    0,
    0,
    size,
    c.fur,
    R
  );

  ctx.fill();

  stroke(ctx, 2.8);

  // Interior
  ctx.beginPath();

  ctx.moveTo(-size * 0.27, size * 0.18);

  ctx.quadraticCurveTo(
    -size * 0.18,
    -size * 0.40,
    0,
    -size * 0.52
  );

  ctx.quadraticCurveTo(
    size * 0.18,
    -size * 0.40,
    size * 0.27,
    size * 0.18
  );

  ctx.closePath();

  ctx.fillStyle = c.innerEar;
  ctx.fill();

  stroke(ctx, 1.2, INK_SOFT);

  ctx.restore();
}

// ============================================================================
// ACCESORIOS
// ============================================================================

function drawBow(ctx, x, y, color) {
  for (const side of [-1, 1]) {
    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.quadraticCurveTo(
      x + side * 12,
      y - 10,
      x + side * 13,
      y
    );

    ctx.quadraticCurveTo(
      x + side * 10,
      y + 7,
      x,
      y
    );

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    stroke(ctx, 1.8);
  }

  circle(ctx, x, y, 3.4, "#ffd84d", true, 1.5);
}

function drawCrown(ctx, x, y) {
  ctx.beginPath();

  ctx.moveTo(x - 16, y + 8);
  ctx.lineTo(x - 12, y - 7);
  ctx.lineTo(x - 4, y + 1);
  ctx.lineTo(x, y - 11);
  ctx.lineTo(x + 5, y + 1);
  ctx.lineTo(x + 14, y - 7);
  ctx.lineTo(x + 17, y + 8);
  ctx.closePath();

  ctx.fillStyle = "#ffd84d";
  ctx.fill();

  stroke(ctx, 2);
}

function drawHood(ctx, x, y, r) {
  ctx.save();

  ctx.globalAlpha = 0.96;

  ctx.beginPath();

  ctx.arc(
    x,
    y - r * 0.12,
    r * 1.12,
    Math.PI * 1.08,
    Math.PI * 1.92
  );

  ctx.lineTo(
    x + r * 0.92,
    y + r * 0.62
  );

  ctx.quadraticCurveTo(
    x,
    y + r * 0.82,
    x - r * 0.92,
    y + r * 0.62
  );

  ctx.closePath();

  ctx.fillStyle = "#27192f";
  ctx.fill();

  stroke(ctx, 2.8);

  // Borde interior
  ctx.beginPath();

  ctx.arc(
    x,
    y + r * 0.08,
    r * 0.96,
    Math.PI * 1.12,
    Math.PI * 1.88
  );

  ctx.strokeStyle = "#6d3c72";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Decoración
  circle(ctx, x - r * 0.5, y - r * 0.52, 3, "#ff4f91");
  circle(ctx, x - r * 0.5, y - r * 0.52, 1.2, "#fff");

  ctx.restore();
}

// ============================================================================
// COLA
// ============================================================================

function drawTail(ctx, R, x, y, length, angle, color, time, index = 0) {
  if (!R || typeof R.tail !== "function") {
    return [x, y];
  }

  const sway =
    Math.sin(time * 0.08 + index * 1.7) * 0.48;

  return R.tail(
    ctx,
    x,
    y,
    length,
    angle,
    (u) =>
      sway * (1 - u) +
      Math.sin(time * 0.12 + u * 4 + index) * 0.35,
    8,
    5,
    color,
    {
      ink: INK,
      lw: 2.6,
      segments: 10
    }
  );
}

// ============================================================================
// CARA
// ============================================================================

function drawFace(ctx, R, pose, c, headR, state, time) {
  const faceY = 2;

  let mood = "normal";

  if (state === "dead") mood = "swirl";
  else if (state === "hurt") mood = "hurt";
  else if (state === "victory") mood = "heart";
  else if (safePoseValue(pose, "nineLives", 0) > 0) mood = "heart";
  else if (
    state === "cast" &&
    n(pose.castSlot, 0) === 1
  ) {
    mood = "happy";
  }

  // Ojos deliberadamente centrados.
  // Nada de desplazar la cara hacia +X, que era parte del problema original.

  const eyeR = headR * 0.285;

  const leftEyeX = -headR * 0.36;
  const rightEyeX = headR * 0.36;

  drawEye(
    ctx,
    R,
    leftEyeX,
    faceY,
    eyeR,
    pose,
    c.iris,
    mood,
    -1
  );

  drawEye(
    ctx,
    R,
    rightEyeX,
    faceY,
    eyeR,
    pose,
    c.iris,
    mood,
    1
  );

  // Mejillas
  if (R && typeof R.blush === "function") {
    R.blush(
      ctx,
      -headR * 0.61,
      headR * 0.32,
      headR * 0.16,
      "#ff6fa8"
    );

    R.blush(
      ctx,
      headR * 0.61,
      headR * 0.32,
      headR * 0.16,
      "#ff6fa8"
    );
  } else {
    ctx.globalAlpha = 0.32;

    circle(
      ctx,
      -headR * 0.61,
      headR * 0.32,
      headR * 0.14,
      "#ff6fa8"
    );

    circle(
      ctx,
      headR * 0.61,
      headR * 0.32,
      headR * 0.14,
      "#ff6fa8"
    );

    ctx.globalAlpha = 1;
  }

  // Nariz
  const noseY = headR * 0.29;

  heart(
    ctx,
    0,
    noseY,
    Math.max(2.4, headR * 0.065),
    "#ff629c",
    false
  );

  // Boca
  let open = 0;

  if (state === "attack") {
    open = 0.5 + Math.sin(
      clamp(n(pose.atk, 0), 0, 1) * Math.PI
    ) * 0.3;
  }

  if (state === "hurt") open = 0.45;
  if (state === "victory") open = 0.7;

  if (
    state === "cast" &&
    n(pose.castSlot, 0) !== 1
  ) {
    open = 0.45;
  }

  drawMouth(
    ctx,
    0,
    headR * 0.46,
    headR * 0.19,
    open,
    mood
  );

  // Bigotes por detrás de la boca pero claramente visibles.
  whiskers(
    ctx,
    0,
    headR * 0.37,
    headR
  );
}

// ============================================================================
// EFECTOS DE CABEZA
// ============================================================================

function drawHeadAccessories(ctx, R, pose, form, headR, time) {
  if (form === 0) {
    drawBow(
      ctx,
      -headR * 0.62,
      -headR * 0.68,
      PAL[form].bow
    );
    return;
  }

  if (form === 1) {
    drawBow(
      ctx,
      -headR * 0.63,
      -headR * 0.68,
      PAL[form].bow
    );
    return;
  }

  if (form === 2) {
    if (R && typeof R.star === "function") {
      R.star(
        ctx,
        -headR * 0.55,
        -headR * 0.76,
        7,
        "#70d8ff",
        {
          ink: INK,
          lw: 1.8
        }
      );
    } else {
      twinkle(
        ctx,
        -headR * 0.55,
        -headR * 0.76,
        7,
        "#70d8ff"
      );
    }

    return;
  }

  if (form === 3) {
    ctx.save();

    ctx.translate(
      -headR * 0.55,
      -headR * 0.76
    );

    ctx.rotate(-0.35);

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      9,
      Math.PI * 0.3,
      Math.PI * 1.7
    );

    ctx.arc(
      4,
      -1,
      7,
      Math.PI * 1.55,
      Math.PI * 0.45,
      true
    );

    ctx.closePath();

    ctx.fillStyle = "#ffd766";
    ctx.fill();

    stroke(ctx, 1.8);

    ctx.restore();

    return;
  }

  // GOD
  drawCrown(
    ctx,
    0,
    -headR * 0.9
  );

  // Corona
  if (R && typeof R.halo === "function") {
    R.halo(
      ctx,
      0,
      -headR * 1.27,
      headR * 0.72,
      time,
      "#ffd766"
    );
  }
}

// ============================================================================
// CABEZA
// ============================================================================

function drawHead(ctx, R, pose, c, form, headR, headX, headY, tilt, state, time) {
  ctx.save();

  ctx.translate(headX, headY);
  ctx.rotate(tilt);

  // Orejas SIEMPRE detrás de la cabeza.
  const earTilt =
    state === "hurt"
      ? 0.28
      : Math.sin(time * 0.07) > 0.985
        ? 0.14
        : 0;

  drawEar(
    ctx,
    R,
    -headR * 0.58,
    -headR * 0.60,
    headR * 0.72,
    -1,
    c,
    earTilt
  );

  drawEar(
    ctx,
    R,
    headR * 0.58,
    -headR * 0.60,
    headR * 0.72,
    1,
    c,
    earTilt
  );

  // Cabeza grande y claramente circular.
  const headW = headR * 1.13;
  const headH = headR * 1.00;

  oval(
    ctx,
    R,
    0,
    0,
    headW,
    headH,
    c.fur,
    {
      lw: 3
    }
  );

  // Zona de cara más clara.
  ctx.save();

  ctx.globalAlpha = 0.17;

  ctx.beginPath();

  ctx.ellipse(
    0,
    headR * 0.16,
    headR * 0.79,
    headR * 0.67,
    0,
    0,
    TAU
  );

  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.restore();

  // Mechón superior
  ctx.beginPath();

  ctx.moveTo(-headR * 0.28, -headR * 0.82);

  ctx.quadraticCurveTo(
    -headR * 0.13,
    -headR * 1.08,
    0,
    -headR * 0.87
  );

  ctx.quadraticCurveTo(
    headR * 0.16,
    -headR * 1.07,
    headR * 0.31,
    -headR * 0.80
  );

  stroke(ctx, 2.2);

  // Cara limpia y centrada.
  drawFace(
    ctx,
    R,
    pose,
    c,
    headR,
    state,
    time
  );

  // Accesorios DESPUÉS de la cara, pero solo en la zona superior.
  drawHeadAccessories(
    ctx,
    R,
    pose,
    form,
    headR,
    time
  );

  // Cascabel visible bajo la cabeza.
  if (form <= 2) {
    const bellY = headR * 0.88;

    ctx.beginPath();

    ctx.moveTo(
      -headR * 0.26,
      bellY - 2
    );

    ctx.quadraticCurveTo(
      0,
      bellY + 6,
      headR * 0.26,
      bellY - 2
    );

    ctx.strokeStyle = c.bow;
    ctx.lineWidth = 4;
    ctx.stroke();

    oval(
      ctx,
      R,
      0,
      bellY + 3,
      4.4,
      4.4,
      "#ffd84d",
      {
        lw: 1.7
      }
    );

    circle(
      ctx,
      0,
      bellY + 4,
      1,
      "#8b5a22"
    );
  }

  // Lágrima
  if (state === "hurt") {
    ctx.fillStyle = "#8fd8ff";

    ctx.beginPath();

    ctx.moveTo(
      -headR * 0.40,
      headR * 0.40
    );

    ctx.quadraticCurveTo(
      -headR * 0.46,
      headR * 0.52,
      -headR * 0.39,
      headR * 0.58
    );

    ctx.quadraticCurveTo(
      -headR * 0.30,
      headR * 0.50,
      -headR * 0.40,
      headR * 0.40
    );

    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// COLA / CUERPO / EFECTOS
// ============================================================================

function drawBody(ctx, R, pose, c, form, state, time, bodyRX, bodyRY, bodyY, legL) {
  const run = state === "run";
  const air =
    state === "jump" ||
    state === "fall" ||
    state === "glide";

  // Cola detrás del cuerpo.
  const tails =
    form === 0 ? 1 :
    form === 1 ? 1 :
    form === 2 ? 2 :
    form === 3 ? 3 :
    5;

  for (let i = 0; i < tails; i++) {
    const spread =
      tails > 1
        ? (i - (tails - 1) / 2) * 0.30
        : 0;

    const startX =
      -bodyRX * 0.84;

    const startY =
      bodyY - bodyRY * 0.10;

    const end = drawTail(
      ctx,
      R,
      startX,
      startY,
      27 + form * 4,
      -Math.PI / 2 - 0.55 + spread,
      c.tail,
      time,
      i
    );

    if (!end || !finitePoint(end[0], end[1])) continue;

    if (form === 2) {
      oval(
        ctx,
        R,
        end[0],
        end[1],
        9,
        7,
        "#fff",
        {
          lw: 1.5
        }
      );
    } else {
      heart(
        ctx,
        end[0],
        end[1],
        5.2,
        form >= 3
          ? "#ffd766"
          : c.bow,
        false
      );
    }
  }

  // Patas traseras.
  const phase =
    safePoseValue(pose, "phase", 0);

  const legSwing = (offset) =>
    run
      ? Math.sin(phase * 2 + offset) * 0.5
      : air
        ? safePoseValue(pose, "vy", 0) < 0
          ? -0.35
          : 0.30
        : 0;

  paw(
    ctx,
    R,
    -bodyRX * 0.52,
    0,
    legL + 2,
    legSwing(Math.PI),
    R && typeof R.darken === "function"
      ? R.darken(c.fur, 0.08)
      : c.fur
  );

  paw(
    ctx,
    R,
    bodyRX * 0.48,
    0,
    legL + 2,
    legSwing(0),
    R && typeof R.darken === "function"
      ? R.darken(c.fur, 0.08)
      : c.fur
  );

  // Cuerpo.
  ctx.save();

  const breath =
    safePoseValue(pose, "breath", 0);

  const squash =
    state === "dead"
      ? 0.68
      : 1 + breath * 0.018;

  ctx.translate(
    0,
    bodyY + bodyRY
  );

  ctx.scale(
    1 / squash,
    squash
  );

  ctx.translate(
    0,
    -bodyRY
  );

  oval(
    ctx,
    R,
    0,
    0,
    bodyRX,
    bodyRY,
    c.fur
  );

  // Barriguita.
  oval(
    ctx,
    R,
    bodyRX * 0.18,
    bodyRY * 0.24,
    bodyRX * 0.55,
    bodyRY * 0.53,
    c.belly,
    {
      line: false,
      flat: true
    }
  );

  // Nube rosa.
  if (form === 2) {
    for (let i = 0; i < 6; i++) {
      const a =
        -Math.PI * 0.95 +
        i * 0.36;

      oval(
        ctx,
        R,
        bodyRX * 0.18 +
          Math.cos(a) * 15,
        -2 +
          Math.sin(a) * 9,
        8,
        7,
        "#fff6fb",
        {
          lw: 1.8
        }
      );
    }
  }

  ctx.restore();

  // Patas delanteras.
  const frontSwing =
    legSwing(Math.PI * 0.5);

  paw(
    ctx,
    R,
    -bodyRX * 0.34,
    0,
    legL + 3,
    frontSwing,
    c.fur,
    true
  );

  let raised = null;

  const atk =
    clamp(
      safePoseValue(pose, "atk", 0),
      0,
      1
    );

  const castSlot =
    Math.floor(
      safePoseValue(pose, "castSlot", 0)
    );

  const cast =
    clamp(
      safePoseValue(pose, "cast", 0),
      0,
      1
    );

  if (state === "attack") {
    raised = {
      angle: -0.35 + atk * 2.3,
      length: 20
    };
  } else if (state === "cast" && castSlot === 0) {
    raised = {
      angle: 2.25 - cast * 1.5,
      length: 19
    };
  } else if (state === "cast" && castSlot === 2) {
    raised = {
      angle: 2.75,
      length: 20
    };
  } else if (state === "victory") {
    raised = {
      angle:
        2.55 +
        Math.sin(time * 0.28) * 0.4,
      length: 19
    };
  } else if (state === "wall") {
    raised = {
      angle: 1.35,
      length: 17
    };
  }

  if (raised) {
    raisedPaw(
      ctx,
      bodyRX * 0.46,
      bodyY - 2,
      raised.angle,
      raised.length + form,
      c.fur
    );
  } else {
    paw(
      ctx,
      R,
      bodyRX * 0.54,
      0,
      legL + 3,
      frontSwing(Math.PI),
      c.fur,
      true
    );
  }
}

// ============================================================================
// EFECTOS ESPECIALES
// ============================================================================

function drawCastEffects(ctx, R, pose, form, headX, headY, headR, bodyY, state, time) {
  if (state !== "cast") return;

  const slot =
    Math.floor(
      safePoseValue(pose, "castSlot", 0)
    );

  const cast =
    clamp(
      safePoseValue(pose, "cast", 0),
      0,
      1
    );

  // --------------------------------------------------------------------------
  // J
  // --------------------------------------------------------------------------

  if (slot === 0) {
    const x =
      headX +
      18 +
      cast * 28;

    const y =
      bodyY -
      25 -
      Math.sin(cast * Math.PI) * 18;

    oval(
      ctx,
      R,
      x,
      y,
      6.5,
      6.5,
      "#ff82b8",
      {
        lw: 1.8
      }
    );

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      3.7,
      0,
      Math.PI * 1.4
    );

    stroke(ctx, 1.2);
  }

  // --------------------------------------------------------------------------
  // K
  // --------------------------------------------------------------------------

  if (slot === 1) {
    for (let i = 0; i < 4; i++) {
      const k =
        (cast + i * 0.22) % 1;

      heart(
        ctx,
        headX +
          16 +
          i * 7,
        headY -
          headR -
          k * 26,
        3 + k * 2,
        i % 2
          ? "#ff8fbf"
          : "#ffcfeb",
        false
      );
    }
  }

  // --------------------------------------------------------------------------
  // L
  // --------------------------------------------------------------------------

  if (slot === 2) {
    for (let i = 0; i < 9; i++) {
      const a =
        i / 9 * TAU +
        time * 0.1;

      twinkle(
        ctx,
        headX +
          Math.cos(a) * 45,
        bodyY -
          20 +
          Math.sin(a) * 30,
        3 + cast * 2,
        i % 2
          ? "#fff6c0"
          : "#ffb6e4"
      );
    }
  }
}

function drawAttackEffect(ctx, pose, headX, bodyY, state) {
  if (state !== "attack") return;

  const atk =
    clamp(
      safePoseValue(pose, "atk", 0),
      0,
      1
    );

  const alpha =
    Math.sin(atk * Math.PI);

  if (alpha <= 0) return;

  ctx.save();

  ctx.globalAlpha = alpha;

  ctx.beginPath();

  ctx.arc(
    headX + 10,
    bodyY - 12,
    27,
    -1.2,
    0.65
  );

  ctx.lineWidth = 5;
  ctx.strokeStyle = "#ff9fcf";
  ctx.stroke();

  heart(
    ctx,
    headX + 36,
    bodyY - 21,
    4,
    "#ff4f91",
    false
  );

  ctx.restore();
}

function drawVictoryEffects(ctx, form, time) {
  for (let i = 0; i < 5; i++) {
    const a =
      time * 0.05 +
      i * 1.35;

    twinkle(
      ctx,
      Math.cos(a) * 52,
      -64 +
        Math.sin(a * 1.25) * 38,
      2.5 +
        Math.sin(time * 0.2 + i) * 1.2,
      i % 2
        ? "#fff6c0"
        : "#ffd1e8"
    );
  }

  if (form === 4) {
    for (let i = 0; i < 3; i++) {
      heart(
        ctx,
        Math.cos(time * 0.04 + i) * 35,
        -45 +
          Math.sin(time * 0.07 + i) * 22,
        3.5,
        "#ffb3da",
        false
      );
    }
  }
}

function drawNineLives(ctx, pose, headX, headY, headR, time) {
  const life =
    clamp(
      safePoseValue(pose, "nineLives", 0),
      0,
      100
    );

  if (life <= 0) return;

  ctx.save();

  ctx.globalAlpha =
    clamp(life / 18, 0, 1);

  for (let i = 0; i < 9; i++) {
    const a =
      time * 0.08 +
      i / 9 * TAU;

    heart(
      ctx,
      headX +
        Math.cos(a) * (headR + 10),
      headY -
        headR * 0.12 +
        Math.sin(a) * headR * 0.58,
      2.8,
      i % 2
        ? "#fff6c0"
        : "#ff8fcf",
      false
    );
  }

  ctx.restore();
}

function drawIdleFlourish(ctx, R, pose, headX, headY, headR, time, form, state) {
  const flourish =
    clamp(
      safePoseValue(pose, "flourish", 0),
      0,
      1
    );

  if (flourish <= 0 || state !== "idle") {
    return;
  }

  const flourishN =
    Math.floor(
      safePoseValue(pose, "flourishN", 0)
    );

  // Mariposa
  if (flourishN % 3 === 1) {
    const bx =
      headX +
      27 +
      Math.sin(flourish * TAU * 2) * 14;

    const by =
      headY -
      headR -
      8 +
      Math.cos(flourish * TAU * 3) * 8;

    const wing =
      Math.abs(
        Math.sin(time * 0.6)
      ) * 5 + 2;

    ctx.save();

    ctx.fillStyle = "#8fd8ff";

    ctx.beginPath();
    ctx.ellipse(
      bx - wing * 0.6,
      by,
      wing,
      4,
      -0.4,
      0,
      TAU
    );
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      bx + wing * 0.6,
      by,
      wing,
      4,
      0.4,
      0,
      TAU
    );
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.fillRect(
      bx - 0.8,
      by - 3,
      1.6,
      6
    );

    ctx.restore();
  }

  // Nube
  if (form === 2) {
    for (let i = 0; i < 2; i++) {
      const x =
        -34 +
        i * 68;

      const y =
        -86 +
        Math.sin(time * 0.05 + i * 2) * 4;

      oval(
        ctx,
        R,
        x,
        y,
        7,
        5,
        "#fff",
        {
          lw: 1.5
        }
      );

      oval(
        ctx,
        R,
        x + 6,
        y + 1,
        5,
        4,
        "#fff",
        {
          lw: 1.5
        }
      );
    }
  }
}

// ============================================================================
// DIBUJO PRINCIPAL
// ============================================================================

function draw(ctx, pose = {}, R = {}) {
  if (!ctx || typeof ctx.save !== "function") {
    return;
  }

  const form = safeForm(pose);
  const c = PAL[form];

  const state = safeState(pose);
  const time = safeTime(pose);

  const run = state === "run";

  const air =
    state === "jump" ||
    state === "fall" ||
    state === "glide";

  // --------------------------------------------------------------------------
  // PROPORCIONES
  // --------------------------------------------------------------------------

  // Mucho más grande que antes.
  // La cara es ahora el elemento dominante de la silueta.
  const headR = [
    43,
    45,
    46,
    47,
    49
  ][form];

  const bodyRX = [
    16,
    23,
    26,
    28,
    30
  ][form];

  const bodyRY = [
    12,
    16,
    18,
    20,
    21
  ][form];

  const legL = [
    6,
    8,
    9,
    10,
    11
  ][form];

  // --------------------------------------------------------------------------
  // ANIMACIÓN
  // --------------------------------------------------------------------------

  const phase =
    safePoseValue(pose, "phase", 0);

  const bounce =
    safePoseValue(pose, "bounce", 0);

  let squash =
    1 +
    safePoseValue(pose, "breath", 0) *
    0.02;

  let hop = 0;

  if (run) {
    const s = Math.sin(phase * 2);

    squash =
      1 +
      s * 0.06;

    hop =
      -Math.max(
        0,
        Math.sin(phase * 2)
      ) * 5;
  }

  if (state === "victory") {
    hop =
      -Math.abs(
        Math.sin(time * 0.18)
      ) *
      11;
  }

  if (state === "dead") {
    squash = 0.66;
    hop = 5;
  }

  // --------------------------------------------------------------------------
  // POSICIONES
  // --------------------------------------------------------------------------

  const bodyY =
    -legL -
    bodyRY * 0.9;

  // Cabeza centrada.
  const headX =
    4 +
    (run
      ? 2
      : 0);

  let headY =
    bodyY -
    bodyRY * 0.30 -
    headR * 0.73;

  headY +=
    form === 0
      ? 7
      : 0;

  headY += bounce * 1.8;

  let tilt =
    Math.sin(time * 0.045) * 0.045 +
    safePoseValue(pose, "sway", 0) * 0.045;

  if (state === "hurt") {
    tilt = -0.18;
  }

  if (
    state === "cast" &&
    Math.floor(
      safePoseValue(pose, "castSlot", 0)
    ) === 1
  ) {
    tilt = 0.10;
  }

  if (
    state === "victory"
  ) {
    tilt =
      Math.sin(time * 0.13) * 0.06;
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  ctx.save();

  try {
    ctx.translate(0, hop);

    if (state === "dead") {
      ctx.translate(0, 5);
      ctx.rotate(0.10);
    }

    // ------------------------------------------------------------------------
    // COLA + CUERPO
    // ------------------------------------------------------------------------

    drawBody(
      ctx,
      R,
      pose,
      c,
      form,
      state,
      time,
      bodyRX,
      bodyRY,
      bodyY,
      legL
    );

    // ------------------------------------------------------------------------
    // CABEZA
    // ------------------------------------------------------------------------

    drawHead(
      ctx,
      R,
      pose,
      c,
      form,
      headR,
      headX,
      headY,
      tilt,
      state,
      time
    );

    // ------------------------------------------------------------------------
    // EFECTOS
    // ------------------------------------------------------------------------

    drawCastEffects(
      ctx,
      R,
      pose,
      form,
      headX,
      headY,
      headR,
      bodyY,
      state,
      time
    );

    drawAttackEffect(
      ctx,
      pose,
      headX,
      bodyY,
      state
    );

    drawNineLives(
      ctx,
      pose,
      headX,
      headY,
      headR,
      time
    );

    drawVictoryEffects(
      ctx,
      form,
      time
    );

    drawIdleFlourish(
      ctx,
      R,
      pose,
      headX,
      headY,
      headR,
      time,
      form,
      state
    );

    // ------------------------------------------------------------------------
    // GOD
    // ------------------------------------------------------------------------

    if (form === 4) {
      ctx.save();

      ctx.globalAlpha = 0.22;

      ctx.beginPath();

      ctx.arc(
        headX,
        headY,
        headR * 1.35,
        0,
        TAU
      );

      ctx.strokeStyle = "#ffd766";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
    }

  } finally {
    ctx.restore();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  id: "cat",
  draw
};