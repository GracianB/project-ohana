// OHANA V372 · Bienvenida fantástica con coreografía controlada.
// El RITMO es fijo (tres huecos de tiempo por bucle de 14 s) y nunca depende
// del azar: lo único que varía en cada ejecución es QUÉ maravilla ocupa cada
// hueco y QUIÉN de la familia reacciona. Todo es vector plano: sin gradientes,
// sin shadowBlur y con un número acotado de piezas por fotograma.
const TAU = Math.PI * 2;
export const WELCOME_LOOP = 14;
// Huecos fijos: no se pisan con la persecución (4.25–7.15 s) ni entre sí.
export const FANTASY_SLOTS = Object.freeze([
  Object.freeze({ start: 0.9, end: 3.9 }),
  Object.freeze({ start: 7.5, end: 10.3 }),
  Object.freeze({ start: 10.7, end: 13.6 }),
]);
export const FANTASY_EVENTS = Object.freeze([
  "starShower", "portal", "skyWhale", "cameraThief", "lanternRise", "rainbowBridge", "moonBalloon",
]);
const REACTORS = Object.freeze({
  starShower: Object.freeze([["kilo", "¡PIDE UN DESEO!"], ["cat", "LA MÁS BRILLANTE, PARA MÍ."], ["chispin", "¡ESTRELLAS CON CHISPA!"]]),
  portal: Object.freeze([["yomi", "¿QUIÉN LLAMA?"], ["dragon", "¡YO ENTRO PRIMERO!"], ["cuerno", "HUELE A MAGIA."]]),
  skyWhale: Object.freeze([["dino", "¡ES MÁS GRANDE QUE YO!"], ["pizza", "¿VUELA? ¿Y SE COME?"], ["kilo", "¡HOLA, BALLENA!"]]),
  cameraThief: Object.freeze([["stitcho", "¡LA CÁMARA ES MÍA!"]]),
  lanternRise: Object.freeze([["frita", "¡FAROLILLOS DORADITOS!"], ["yomi", "LUCES ESPÍRITU…"], ["cat", "QUÉ BONITO. NO LLORO."]]),
  rainbowBridge: Object.freeze([["cuerno", "¡ES MI ARCOÍRIS!"], ["chispin", "¡CARRERA POR EL PUENTE!"], ["dragon", "VOLAR ES MÁS RÁPIDO."]]),
  moonBalloon: Object.freeze([["cat", "¡MI LUNA! DEVOLVEDLA."], ["stitcho", "¡LA ATRAPO!"], ["dino", "¿LA LUNA TIENE CUERDA?"]]),
});

/** PRNG pequeño y determinista (mulberry32). */
export function welcomeRng(seed) {
  let s = (Number(seed) >>> 0) || 1;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plan de una ejecución: tres maravillas distintas, cada una con su reacción. */
export function planWelcomeFantasy(seed) {
  const rnd = welcomeRng(seed);
  const pool = [...FANTASY_EVENTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return Object.freeze({
    seed: (Number(seed) >>> 0) || 1,
    beats: Object.freeze(FANTASY_SLOTS.map((slot, i) => {
      const kind = pool[i];
      const options = REACTORS[kind];
      const [reactor, line] = options[Math.floor(rnd() * options.length)];
      return Object.freeze({ ...slot, kind, reactor, line, flip: rnd() < 0.5 ? -1 : 1, hue: Math.floor(rnd() * 4) });
    })),
  });
}

/** Maravilla activa en el instante `loop` (0–14 s) y su progreso 0–1. */
export function activeFantasy(plan, loop) {
  for (const beat of plan.beats) {
    if (loop >= beat.start && loop < beat.end) return { beat, k: (loop - beat.start) / (beat.end - beat.start) };
  }
  return null;
}
const env = (k) => Math.min(1, k / 0.14, (1 - k) / 0.16);
const smooth = (x) => x * x * (3 - 2 * x);

/** Encuadre de la cámara para el robo de Stitcho (identidad si no aplica o reduced-motion). */
export function fantasyCamera(active, reduce) {
  if (!active || active.beat.kind !== "cameraThief" || reduce) return null;
  const e = env(active.k), k = active.k;
  return { rotate: Math.sin(k * Math.PI * 3) * 0.035 * e * active.beat.flip, zoom: 1 + 0.07 * e, dx: Math.sin(k * 9) * 8 * e, dy: Math.cos(k * 7) * 4 * e };
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

const STAR_COLS = ["#fff3b0", "#9be7ee", "#ffc2e2", "#d9c6ff"];
function starShower(ctx, W, H, k, b, still) {
  const e = env(k);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 16; i++) {
    const u = still ? (i * 0.137) % 1 : (i * 0.137 + k * 1.6) % 1;
    const x0 = W * ((i * 0.193 + b.hue * 0.07) % 1);
    const x = x0 + b.flip * u * W * 0.22, y = H * (0.04 + u * 0.5);
    const r = 2.5 + (i % 3) * 1.6;
    ctx.globalAlpha = e * (1 - u) * 0.85;
    ctx.strokeStyle = STAR_COLS[(i + b.hue) % 4]; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - b.flip * 26, y - 32); ctx.stroke();
    ctx.fillStyle = STAR_COLS[(i + b.hue) % 4]; star(ctx, x, y, r * 1.6);
  }
  ctx.globalCompositeOperation = "source-over";
}

function portal(ctx, W, H, k, b, spots, still, actorAt) {
  const e = env(k), cx = W * (b.flip > 0 ? 0.68 : 0.32), cy = H * 0.36, R = Math.min(W, H) * 0.12 * smooth(e);
  if (R < 2) return;
  const spin = still ? 0.6 : k * 8;
  ctx.globalAlpha = 0.9 * e;
  ctx.fillStyle = "#170a2e"; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 1.18, 0, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = ["#b78bff", "#7ee7ff", "#ff6aa8"][i]; ctx.lineWidth = 3 - i * 0.6;
    ctx.beginPath(); ctx.ellipse(cx, cy, R * (1 + i * 0.12), R * (1.18 + i * 0.13), spin * (i % 2 ? -1 : 1) * 0.2, i, i + 4.6); ctx.stroke();
  }
  // Algo se asoma desde el portal: una silueta de la familia, en pequeño.
  const peek = Math.sin(Math.min(1, Math.max(0, (k - 0.25) / 0.55)) * Math.PI);
  if (peek > 0.05 && actorAt) actorAt(b.reactor === "dragon" ? "cuerno" : "dragon", cx, cy + R * 0.7, R * 1.05 * peek, peek);
  ctx.fillStyle = "#e7dcff";
  for (let i = 0; i < 6; i++) {
    const a = spin + i * TAU / 6, rr = R * (1.35 + 0.1 * Math.sin(spin * 2 + i));
    ctx.globalAlpha = 0.7 * e; star(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.1, 3.2);
  }
}

function skyWhale(ctx, W, H, k, b, still) {
  const e = env(k), s = Math.min(W, H) * 0.0021;
  const u = still ? 0.5 : k;
  const x = b.flip > 0 ? -W * 0.25 + u * W * 1.5 : W * 1.25 - u * W * 1.5, y = H * 0.2 + Math.sin(u * TAU) * H * 0.03;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * b.flip, s); ctx.globalAlpha = 0.92 * e;
  ctx.fillStyle = "#4f86b8"; ctx.strokeStyle = "#173550"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-70, 0);
  ctx.bezierCurveTo(-60, -42, 40, -46, 72, -6); ctx.bezierCurveTo(80, 10, 50, 30, 0, 30);
  ctx.bezierCurveTo(-40, 30, -60, 20, -70, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  const flap = still ? 0 : Math.sin(k * 22) * 10;
  ctx.beginPath(); ctx.moveTo(-66, 2); ctx.lineTo(-104, -18 + flap); ctx.lineTo(-96, 6); ctx.lineTo(-106, 26 - flap); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#cfe8f6"; ctx.beginPath(); ctx.moveTo(-50, 14); ctx.bezierCurveTo(-10, 34, 40, 30, 64, 6); ctx.bezierCurveTo(30, 18, -10, 22, -50, 14); ctx.fill();
  ctx.fillStyle = "#173550"; ctx.beginPath(); ctx.arc(44, -6, 4, 0, TAU); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(45.5, -7.5, 1.4, 0, TAU); ctx.fill();
  // Aleta-ala de fantasía y chorro de estrellas.
  ctx.fillStyle = "#86c3ea"; ctx.beginPath(); ctx.moveTo(4, 4); ctx.quadraticCurveTo(-8, 44 + flap, -30, 38); ctx.quadraticCurveTo(-8, 22, 4, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff3b0";
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.32; star(ctx, 30 + Math.cos(a) * (28 + (i % 2) * 8), -38 + Math.sin(a) * (24 + (i % 2) * 6), 4); }
  ctx.restore();
}

function cameraThief(ctx, W, H, k, b, spots, still) {
  const e = env(k), m = Math.min(W, H) * 0.06, blink = still || Math.floor(k * 12) % 2 === 0;
  ctx.globalAlpha = 0.9 * e; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
  const corners = [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m * 1.6, 1, -1], [W - m, H - m * 1.6, -1, -1]];
  for (const [x, y, sx, sy] of corners) { ctx.beginPath(); ctx.moveTo(x, y + sy * m * 0.8); ctx.lineTo(x, y); ctx.lineTo(x + sx * m * 0.8, y); ctx.stroke(); }
  if (blink) { ctx.fillStyle = "#ff3b5c"; ctx.beginPath(); ctx.arc(m * 1.2, m * 1.25, 6, 0, TAU); ctx.fill(); }
  ctx.fillStyle = "#ffffff"; ctx.font = "800 12px Outfit,system-ui,sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("REC · STITCHO-CAM", m * 1.2 + 12, m * 1.25);
  // La cámara, en manos de Stitcho.
  const s = spots?.stitcho; if (!s) return;
  const cx = s.x + 18, cy = s.foot - 46 - Math.abs(Math.sin(k * 14)) * (still ? 0 : 6);
  ctx.fillStyle = "#2a2f3a"; ctx.strokeStyle = "#0d1016"; ctx.lineWidth = 2;
  ctx.fillRect(cx - 13, cy - 9, 26, 18); ctx.strokeRect(cx - 13, cy - 9, 26, 18);
  ctx.fillStyle = "#7ee7ff"; ctx.beginPath(); ctx.arc(cx + 2, cy, 5.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff3b5c"; ctx.fillRect(cx - 10, cy - 7, 4, 3);
}

function lanternRise(ctx, W, H, k, b, still) {
  const e = env(k);
  for (let i = 0; i < 9; i++) {
    const u = still ? 0.45 : Math.min(1, k * 1.25 + (i % 3) * 0.08);
    const x = W * (0.12 + ((i * 0.37 + b.hue * 0.11) % 0.76)) + Math.sin(k * 5 + i) * 10, y = H * (0.78 - u * 0.62) - (i % 3) * 18;
    const s = 0.8 + (i % 3) * 0.25;
    ctx.globalAlpha = e * 0.92;
    ctx.fillStyle = i % 2 ? "#ffb35a" : "#ff8a5c"; ctx.strokeStyle = "#5a2614"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 10 * s); ctx.lineTo(x + 7 * s, y - 10 * s); ctx.lineTo(x + 5 * s, y + 8 * s); ctx.lineTo(x - 5 * s, y + 8 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = e * 0.55; ctx.fillStyle = "#fff0b0";
    ctx.beginPath(); ctx.ellipse(x, y + 3 * s, 2.4 * s, 3.6 * s, 0, 0, TAU); ctx.fill();
  }
}

const RAINBOW = ["#ff7aa8", "#ffd36a", "#a6f08c", "#7ee7ff", "#b78bff"];
function rainbowBridge(ctx, W, H, k, b, spots, still) {
  const e = env(k), grow = still ? 1 : smooth(Math.min(1, k / 0.45));
  const x0 = spots?.cuerno?.x ?? W * 0.85, x1 = spots?.chispin?.x ?? W * 0.15, foot = spots?.cuerno?.foot ?? H * 0.8;
  const cx = (x0 + x1) / 2, r = Math.abs(x0 - x1) / 2, from = b.flip > 0 ? Math.PI : TAU, dir = b.flip > 0 ? 1 : -1;
  ctx.lineCap = "round";
  RAINBOW.forEach((col, i) => {
    ctx.globalAlpha = 0.75 * e; ctx.strokeStyle = col; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, foot - 30, r - i * 6, from, from + dir * Math.PI * grow, dir < 0); ctx.stroke();
  });
  // Un corredor de luz cruza el puente.
  if (grow > 0.98 && !still) {
    const a = from + dir * Math.PI * Math.min(1, (k - 0.45) / 0.45);
    ctx.globalAlpha = e; ctx.fillStyle = "#ffffff"; star(ctx, cx + Math.cos(a) * (r + 6), foot - 30 + Math.sin(a) * (r + 6), 6);
  }
}

function moonBalloon(ctx, W, H, k, b, spots, still) {
  const e = env(k), u = still ? 0.4 : k;
  const ax = spots?.cat?.x ?? W * 0.4, x = ax + b.flip * u * W * 0.18, y = H * (0.5 - u * 0.36), r = Math.min(W, H) * 0.045;
  ctx.globalAlpha = e;
  ctx.strokeStyle = "#ffe8b0"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x, y + r); ctx.quadraticCurveTo(x - 10 * b.flip, y + r * 2.4, ax, (spots?.cat?.foot ?? H * 0.8) - 40); ctx.stroke();
  ctx.fillStyle = "#fff1b8"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = "#14303f"; ctx.beginPath(); ctx.arc(x + r * 0.42 * b.flip, y - r * 0.18, r * 0.86, 0, TAU); ctx.fill();
  ctx.fillStyle = "#e6c98a";
  ctx.beginPath(); ctx.arc(x - r * 0.45 * b.flip, y + r * 0.3, r * 0.14, 0, TAU); ctx.fill();
}

/**
 * Dibuja la maravilla activa. `actorAt(id,x,foot,h,alpha)` permite reutilizar
 * los rigs reales de la familia sin acoplar este módulo al renderer.
 */
export function drawWelcomeFantasy(ctx, W, H, active, spots, { reduce = false, actorAt = null } = {}) {
  if (!active) return;
  const { beat, k } = active, still = !!reduce;
  ctx.save();
  switch (beat.kind) {
    case "starShower": starShower(ctx, W, H, k, beat, still); break;
    case "portal": portal(ctx, W, H, k, beat, spots, still, actorAt); break;
    case "skyWhale": skyWhale(ctx, W, H, k, beat, still); break;
    case "cameraThief": cameraThief(ctx, W, H, k, beat, spots, still); break;
    case "lanternRise": lanternRise(ctx, W, H, k, beat, still); break;
    case "rainbowBridge": rainbowBridge(ctx, W, H, k, beat, spots, still); break;
    case "moonBalloon": moonBalloon(ctx, W, H, k, beat, spots, still); break;
  }
  ctx.restore();
}
