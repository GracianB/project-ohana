// ============================================================================
// RIG · Project Ohana
// ----------------------------------------------------------------------------
// 1) computePose(p, t): traduce el estado del jugador a una "pose" animable
//    (idle/run/jump/fall/attack/cast/hurt/...) + movimiento secundario
//    (muelles para orejas, colas, pelo) + parpadeo + gesto de espera.
// 2) R: kit de dibujo común para que los 8 personajes compartan estilo
//    (contorno grueso tipo pegatina, sombreado cel, brillos, ojos chibi).
//
// CONTRATO DE ARTE (characters/art/<id>.js):
//   export default { id, draw(ctx, pose, R) }
//   · Origen (0,0) = centro de los PIES. Mira hacia +x (derecha).
//   · Unidades de diseño: cada forma mide ~100 de alto (y de 0 a -100).
//     draw.js escala a la altura visual de la forma. Alas, auras, etc.
//     pueden salirse de ese rango.
//   · No tocar globalAlpha global salvo con save/restore.
// ============================================================================

// Red de seguridad: un radio negativo en ellipse()/arc() lanza excepción y
// pararía el bucle del juego. Los personajes animan radios con senos, así que
// los recortamos a 0 de forma global.
(function safeRadii() {
  const P = typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype;
  if (!P || P.__ohanaSafe) return;
  const el = P.ellipse, ar = P.arc;
  P.ellipse = function (x, y, rx, ry, ...rest) { return el.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, ...rest); };
  P.arc = function (x, y, r, ...rest) { return ar.call(this, x, y, r > 0 ? r : 0, ...rest); };
  if (typeof Path2D !== "undefined") {
    const pe = Path2D.prototype.ellipse, pa = Path2D.prototype.arc;
    Path2D.prototype.ellipse = function (x, y, rx, ry, ...rest) { return pe.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, ...rest); };
    Path2D.prototype.arc = function (x, y, r, ...rest) { return pa.call(this, x, y, r > 0 ? r : 0, ...rest); };
  }
  P.__ohanaSafe = true;
})();

// ---------------------------------------------------------------------------
// Pose
// ---------------------------------------------------------------------------
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/**
 * pose = {
 *   state:  "idle"|"run"|"jump"|"fall"|"attack"|"cast"|"hurt"|"wall"|"glide"|"dead"|"victory",
 *   move:   string|null  → movimiento especial del personaje (p._move): "slide","pound","climb","float","bounce","charge",...
 *   form:   0..4 (evolución), t: frames, color: color de la forma,
 *   phase:  fase del ciclo de carrera (radianes, avanza con la velocidad),
 *   speed:  0..1 velocidad horizontal normalizada, vy: -1..1 (negativo = subiendo),
 *   air:    bool, land: 0..1 aplastamiento tras aterrizar,
 *   atk:    0..1 progreso del ataque cuerpo a cuerpo (0 si no ataca),
 *   cast:   0..1 progreso de la habilidad, castSlot: 0 (J) | 1 (K) | 2 (L) | -1,
 *   hurt:   0..1 (1 = golpe reciente),
 *   blink:  0..1 (1 = ojos cerrados), look: {x,y} -1..1,
 *   sway:   -1..1 muelle horizontal (inercia: orejas/cola/pelo se van hacia atrás al correr),
 *   bounce: -1..1 muelle vertical (rebote al aterrizar/saltar),
 *   breath: -1..1 respiración lenta,
 *   flourish: 0..1 gesto propio de espera (0 = no activo). flourishN: nº de gesto (0,1,2...) para variar.
 *   evoT:   0..1 durante la cinemática de evolución (pose.state === "victory").
 * }
 */
export function computePose(p, t) {
  const r = p._rig || (p._rig = {
    sway: 0, swayV: 0, bounce: 0, bounceV: 0, blinkAt: 90 + Math.random() * 120, blinkT: 0,
    idleT: 0, flourishT: -1, flourishN: 0, atkMax: 0, phase: 0, land: 0, wasAir: false, lastT: t,
  });
  const dt = clamp(t - r.lastT, 0, 4) || 1;
  r.lastT = t;

  const vx = p.vx || 0, vy = p.vy || 0;
  const air = !p.grounded;
  const speed = clamp(Math.abs(vx) / Math.max(3, p.speed || 5), 0, 1.4);

  // ciclo de carrera
  if (!air && speed > 0.08) r.phase += (0.16 + speed * 0.2) * dt;

  // aterrizaje
  if (!air && r.wasAir) r.land = 1;
  r.wasAir = air;
  r.land = Math.max(0, r.land - 0.12 * dt);

  // muelles (movimiento secundario)
  const swayTarget = clamp(-vx / 8, -1, 1);
  r.swayV += (swayTarget - r.sway) * 0.18 - r.swayV * 0.22;
  r.sway = clamp(r.sway + r.swayV, -1.3, 1.3);
  const bounceTarget = clamp(vy / 12, -1, 1) + (r.land > 0.8 ? 0.8 : 0);
  r.bounceV += (bounceTarget - r.bounce) * 0.2 - r.bounceV * 0.2;
  r.bounce = clamp(r.bounce + r.bounceV, -1.3, 1.3);

  // parpadeo
  r.blinkAt -= dt;
  if (r.blinkAt <= 0) { r.blinkT = 10; r.blinkAt = 110 + Math.random() * 180; }
  r.blinkT = Math.max(0, r.blinkT - dt);
  const blink = r.blinkT > 0 ? Math.sin((r.blinkT / 10) * Math.PI) : 0;

  // ataque cuerpo a cuerpo
  let atk = 0;
  if (p.melee > 0) {
    if (!r.atkMax || p.melee > r.atkMax) r.atkMax = p.melee;
    atk = clamp(1 - p.melee / r.atkMax, 0, 1);
  } else r.atkMax = 0;

  // habilidad (J/K/L): p._cast = { slot, t } lo pone systems/abilities.js
  let cast = 0, castSlot = -1;
  if (p._cast && t - p._cast.t < 26) {
    cast = clamp((t - p._cast.t) / 26, 0, 1);
    castSlot = p._cast.slot;
  }

  const hurt = (p.invuln || 0) > 18 ? clamp(((p.invuln || 0) - 18) / 10, 0, 1) : 0;

  // estado principal
  let state = "idle";
  if (p.dead) state = "dead";
  else if (p._poseOverride) state = p._poseOverride;
  else if (hurt > 0) state = "hurt";
  else if (cast > 0) state = "cast";
  else if (atk > 0) state = "attack";
  else if (p.wall && air) state = "wall";
  else if (air && p._gliding) state = "glide";
  else if (air) state = vy < 0 ? "jump" : "fall";
  else if (speed > 0.08) state = "run";

  // gesto de espera
  if (state === "idle") {
    r.idleT += dt;
    if (r.flourishT < 0 && r.idleT > 200) { r.flourishT = 0; r.idleT = 0; }
  } else { r.idleT = 0; r.flourishT = -1; }
  let flourish = 0;
  if (r.flourishT >= 0) {
    r.flourishT += dt / 80;
    if (r.flourishT >= 1) { r.flourishT = -1; r.flourishN++; }
    else flourish = r.flourishT;
  }

  return {
    state, move: p._move || null, form: clamp(Math.round(Number(p.evo) || 0), 0, 4), t, color: p.color || "#fff",
    phase: r.phase, speed: Math.min(1, speed), vy: clamp(vy / 12, -1, 1), air, land: r.land,
    atk, cast, castSlot, hurt, blink,
    look: { x: 1, y: clamp(vy / 14, -0.6, 0.6) },
    sway: r.sway, bounce: r.bounce, breath: Math.sin(t * 0.06),
    flourish, flourishN: r.flourishN,
    evoT: p._evoT || 0,
  };
}

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------
function hexToRgb(h) {
  h = String(h).replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}
/** Mezcla dos colores hex (k = 0 → a, 1 → b). */
function mix(a, b, k) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k);
}
const lighten = (c, k = 0.25) => mix(c, "#ffffff", k);
const darken = (c, k = 0.25) => mix(c, "#000000", k);
function alpha(c, a) {
  const [r, g, b] = hexToRgb(c);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

// ---------------------------------------------------------------------------
// Kit de dibujo
// ---------------------------------------------------------------------------
const INK = "#241733";   // contorno por defecto (morado muy oscuro, más cálido que negro)
const LINE = 3.2;        // grosor de contorno en unidades de diseño

/** Relleno con volumen: color base + luz arriba-izquierda + sombra abajo. */
function volume(ctx, x, y, r, base) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.08, x, y, r * 1.15);
  g.addColorStop(0, lighten(base, 0.32));
  g.addColorStop(0.55, base);
  g.addColorStop(1, darken(base, 0.22));
  return g;
}

/** Aplica relleno + contorno al path actual. */
function paint(ctx, fill, opt = {}) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (opt.line !== false) {
    ctx.lineWidth = opt.lw || LINE;
    ctx.strokeStyle = opt.ink || INK;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

/** Elipse rellena con volumen (shade:true) o plana. */
function ellipse(ctx, x, y, rx, ry, color, opt = {}) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), opt.rot || 0, 0, Math.PI * 2);
  paint(ctx, opt.shade === false ? color : volume(ctx, x, y, Math.max(rx, ry), color), opt);
}

/** Blob suave que pasa por los puntos [[x,y],...] (curva cerrada Catmull-Rom). */
function blob(ctx, pts, color, opt = {}) {
  const n = pts.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) ctx.moveTo(p1[0], p1[1]);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
  }
  ctx.closePath();
  if (opt.shade === false) return paint(ctx, color, opt);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, rr = Math.max(maxX - minX, maxY - minY) / 2;
  paint(ctx, volume(ctx, cx, cy, rr, color), opt);
}

/** Polígono de puntas (pinchos, alas membrana...). */
function poly(ctx, pts, color, opt = {}) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  paint(ctx, color, opt);
}

/**
 * Extremidad de 2 segmentos (hombro → codo → mano) con contorno y
 * extremo redondeado. w = grosor. Devuelve la posición final.
 */
function limb(ctx, x1, y1, x2, y2, x3, y3, w, color, opt = {}) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(x2, y2, x3, y3);
  ctx.strokeStyle = opt.ink || INK;
  ctx.lineWidth = w + (opt.lw || LINE) * 2;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke();
  if (opt.hand !== false) {
    const hr = opt.hand || w * 0.62;
    ellipse(ctx, x3, y3, hr, hr, opt.handColor || color, { shade: false });
  }
  return [x3, y3];
}

/** Pierna/brazo simple a partir de ángulo y longitud (cómodo para ciclos). */
function swingLimb(ctx, x, y, len, ang, bend, w, color, opt = {}) {
  const mx = x + Math.sin(ang) * len * 0.5 + Math.cos(ang) * bend;
  const my = y + Math.cos(ang) * len * 0.5;
  const ex = x + Math.sin(ang) * len;
  const ey = y + Math.cos(ang) * len;
  return limb(ctx, x, y, mx, my, ex, ey, w, color, opt);
}

/**
 * Ojo chibi. r = radio. pose.blink cierra, pose.look mueve la pupila.
 * opt: { iris, pupil, mood: "happy"|"angry"|"sad"|"closed"|"star", lash, shine }
 */
function eye(ctx, x, y, r, pose, opt = {}) {
  const blink = Math.max(pose ? pose.blink : 0, opt.mood === "closed" ? 1 : 0);
  const mood = opt.mood || "normal";
  if (blink > 0.75 || mood === "happy") {
    ctx.beginPath();
    if (mood === "happy") ctx.arc(x, y + r * 0.35, r * 0.8, Math.PI * 1.1, Math.PI * 1.9);
    else { ctx.moveTo(x - r * 0.85, y); ctx.quadraticCurveTo(x, y + r * 0.45, x + r * 0.85, y); }
    ctx.lineWidth = Math.max(2, r * 0.32);
    ctx.strokeStyle = INK;
    ctx.lineCap = "round";
    ctx.stroke();
    return;
  }
  const ry = r * (1.12 - blink * 0.9);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.86, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = LINE * 0.8;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.clip();
  const lx = (pose ? pose.look.x : 1) * r * 0.18;
  const ly = (pose ? pose.look.y : 0) * r * 0.25;
  const ir = r * 0.62;
  const g = ctx.createLinearGradient(x, y - ir, x, y + ir);
  g.addColorStop(0, darken(opt.iris || "#3a2a1a", 0.25));
  g.addColorStop(1, lighten(opt.iris || "#3a2a1a", 0.35));
  ctx.beginPath();
  ctx.ellipse(x + lx, y + ly + r * 0.08, ir * 0.9, ir, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + lx, y + ly + r * 0.1, ir * 0.48, ir * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = opt.pupil || "#120a18";
  ctx.fill();
  if (opt.shine !== false) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(x + lx - ir * 0.35, y + ly - ir * 0.35, ir * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + lx + ir * 0.3, y + ly + ir * 0.35, ir * 0.14, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (mood === "angry") {
    ctx.beginPath();
    ctx.moveTo(x - r * 1.0, y - r * 1.25);
    ctx.lineTo(x + r * 0.9, y - r * 0.7);
    ctx.lineWidth = Math.max(2, r * 0.3);
    ctx.strokeStyle = INK;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  if (opt.lash) {
    ctx.beginPath();
    ctx.moveTo(x + r * 0.6, y - r * 0.8); ctx.lineTo(x + r * 1.05, y - r * 1.15);
    ctx.moveTo(x + r * 0.85, y - r * 0.45); ctx.lineTo(x + r * 1.25, y - r * 0.65);
    ctx.lineWidth = Math.max(1.5, r * 0.2);
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

/** Boca. mood: "smile"|"open"|"grin"|"o"|"fang"|"flat"|"roar". */
function mouth(ctx, x, y, w, mood = "smile", opt = {}) {
  ctx.lineWidth = Math.max(2, w * 0.18);
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (mood === "smile") {
    ctx.arc(x, y - w * 0.3, w * 0.5, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else if (mood === "flat") {
    ctx.moveTo(x - w * 0.4, y); ctx.lineTo(x + w * 0.4, y); ctx.stroke();
  } else if (mood === "o") {
    ctx.ellipse(x, y, w * 0.22, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = opt.inside || "#6b1f2e"; ctx.fill(); ctx.stroke();
  } else {
    // open / grin / fang / roar: boca abierta con lengua
    const h = mood === "roar" ? w * 0.75 : mood === "grin" ? w * 0.38 : w * 0.5;
    ctx.moveTo(x - w * 0.5, y - h * 0.2);
    ctx.quadraticCurveTo(x, y - h * 0.05, x + w * 0.5, y - h * 0.2);
    ctx.quadraticCurveTo(x, y + h * 1.1, x - w * 0.5, y - h * 0.2);
    ctx.closePath();
    ctx.fillStyle = opt.inside || "#6b1f2e";
    ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = opt.tongue || "#ff7a8a";
    ctx.beginPath(); ctx.ellipse(x, y + h * 0.75, w * 0.3, h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    if (mood === "fang" || mood === "roar" || mood === "grin") {
      ctx.fillStyle = "#ffffff";
      const n = mood === "grin" ? 5 : 2;
      for (let i = 0; i < n; i++) {
        const fx = x - w * 0.36 + (i * w * 0.72) / Math.max(1, n - 1);
        ctx.beginPath(); ctx.moveTo(fx - w * 0.07, y - h * 0.2); ctx.lineTo(fx + w * 0.07, y - h * 0.2); ctx.lineTo(fx, y + h * 0.25); ctx.fill();
      }
    }
    ctx.restore();
    ctx.stroke();
  }
}

/** Mejillas sonrosadas. */
function blush(ctx, x, y, r, color = "#ff7aa0") {
  ctx.save();
  ctx.fillStyle = alpha(color, 0.5);
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Brillo especular (pegatina). */
function shine(ctx, x, y, rx, ry, a = 0.55) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255," + a + ")";
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Estrella de n puntas. */
function star(ctx, x, y, r, color, opt = {}) {
  const n = opt.points || 5, inner = opt.inner || 0.45;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n + (opt.rot || 0);
    const rr = i % 2 ? r * inner : r;
    i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  paint(ctx, color, opt);
}

/** Destello de 4 puntas (magia, GOD). */
function sparkle(ctx, x, y, r, color = "#fff6c0") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

/** Cola/tentáculo: cadena de n segmentos que ondula. pts se calculan con fn(i/n). */
function tail(ctx, x, y, len, baseAng, wave, w0, w1, color, opt = {}) {
  const n = opt.segments || 10;
  const pts = [];
  let a = baseAng, px = x, py = y;
  for (let i = 0; i <= n; i++) {
    pts.push([px, py]);
    a += wave(i / n) / n;
    px += Math.cos(a) * (len / n);
    py += Math.sin(a) * (len / n);
  }
  // contorno
  for (const pass of [0, 1]) {
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const w = w0 + (w1 - w0) * k;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.lineCap = "round";
      ctx.lineWidth = pass ? w : w + (opt.lw || LINE) * 2;
      ctx.strokeStyle = pass ? color : (opt.ink || INK);
      ctx.stroke();
    }
  }
  return pts[n];
}

/** Halo dorado (formas GOD). */
function halo(ctx, x, y, rx, t, color = "#ffe27a") {
  ctx.save();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(x, y + Math.sin(t * 0.08) * 1.5, rx, rx * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Sombra cel (media luna oscura) dentro de una elipse ya dibujada. */
function celShade(ctx, x, y, rx, ry, color, k = 0.18) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = alpha(darken(color, 0.5), k);
  ctx.beginPath();
  ctx.ellipse(x + rx * 0.35, y + ry * 0.45, rx * 1.05, ry * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const R = {
  INK, LINE, clamp, mix, lighten, darken, alpha, volume, paint,
  ellipse, blob, poly, limb, swingLimb, eye, mouth, blush, shine, star, sparkle, tail, halo, celShade,
};
