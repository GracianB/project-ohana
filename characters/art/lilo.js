// ============================================================================
// KILO · niña hawaiana (diseño original) · characters/art/lilo.js
// ----------------------------------------------------------------------------
// Formas: 0 Kilo Bebé (pelele, chupete, sonajero, gatea al correr)
//         1 Kilo (muumuu rojo con flores, ukelele a la espalda)
//         2 Kilo Ohana (corona de flores, lei, falda de hula)
//         3 Super Kilo (vestido ceremonial, capa, bastón luminoso)
//         4 KILO GOD (vestido blanco-dorado, alas de mariposa, halo, pelo flotante)
// pose.move === "float" (o state "glide"): falda en paracaídas, brazos abiertos.
// ============================================================================

const SKIN = "#c68657";
const HAIR = "#2b2233";
const HAIR_HI = "#6a5a8c";
const IRIS = "#7a4520";

const DIM = [
  { hr: 31, th: 17, ll: 12, al: 16, lw: 8.5, aw: 7 },
  { hr: 25, th: 25, ll: 20, al: 24, lw: 7.5, aw: 6 },
  { hr: 24, th: 27, ll: 24, al: 26, lw: 7.5, aw: 6 },
  { hr: 23, th: 29, ll: 26, al: 27, lw: 7.5, aw: 6 },
  { hr: 22, th: 30, ll: 28, al: 28, lw: 7.5, aw: 6 },
];
const DRESS = ["#ff9ab0", "#e23b3d", "#ff4d78", "#d42a3a", "#fff7ea"];
const HIBIS = ["#ff5c8a", "#ff6f91", "#ffd23f", "#ff4d6d", "#ff6b9a"];

const lerp = (a, b, k) => a + (b - a) * k;
const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const ease = (k) => k * k * (3 - 2 * k);

// ---------------------------------------------------------------------------
// helpers de dibujo
// ---------------------------------------------------------------------------
/** Extremidad por cinemática inversa: hombro/cadera (s) → objetivo (t). */
function ik(ctx, R, sx, sy, tx, ty, L, dir, w, col, opt) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.01;
  if (d > L) { tx = sx + (dx / d) * L; ty = sy + (dy / d) * L; dx = tx - sx; dy = ty - sy; d = L; }
  const h = Math.sqrt(Math.max(0, (L * L) / 4 - (d * d) / 4));
  const mx = (sx + tx) / 2 + (-dy / d) * h * dir, my = (sy + ty) / 2 + (dx / d) * h * dir;
  return R.limb(ctx, sx, sy, 2 * mx - (sx + tx) / 2, 2 * my - (sy + ty) / 2, tx, ty, w, col, opt);
}

function hibiscus(ctx, R, x, y, s, col, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    R.ellipse(ctx, Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55, s * 0.62, s * 0.48, col, { rot: a, lw: R.LINE * 0.6 });
  }
  R.ellipse(ctx, 0, 0, s * 0.3, s * 0.3, R.darken(col, 0.35), { line: false, shade: false });
  ctx.strokeStyle = "#fff2a0";
  ctx.lineWidth = Math.max(1, s * 0.12);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 0.55, -s * 0.5); ctx.stroke();
  ctx.fillStyle = "#ffe04a";
  ctx.beginPath(); ctx.arc(s * 0.58, -s * 0.54, s * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function note(ctx, R, x, y, s, col, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.fillStyle = col;
  ctx.strokeStyle = R.INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s * 0.4, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s * 0.48, -s * 0.1); ctx.lineTo(s * 0.48, -s * 1.5);
  ctx.quadraticCurveTo(s * 1.1, -s * 1.2, s * 1.0, -s * 0.7);
  ctx.lineWidth = 2.2; ctx.stroke();
  ctx.lineWidth = 1.2; ctx.strokeStyle = col; ctx.stroke();
  ctx.restore();
}

/** Ukelele: (x,y) = centro de la caja; el mástil apunta en `ang`. */
function uke(ctx, R, x, y, ang, s, gold) {
  const body = gold ? "#ffd35a" : "#e3a15c", neck = gold ? "#f0b43a" : "#7a4726";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (gold) { ctx.shadowColor = "#fff0a0"; ctx.shadowBlur = 8; }
  R.poly(ctx, [[s * 0.4, -s * 0.11], [s * 1.5, -s * 0.09], [s * 1.5, s * 0.09], [s * 0.4, s * 0.11]], neck, { lw: R.LINE * 0.7 });
  R.blob(ctx, [[s * 1.45, -s * 0.16], [s * 1.8, -s * 0.2], [s * 1.84, s * 0.16], [s * 1.45, s * 0.16]], R.darken(neck, 0.1), { lw: R.LINE * 0.7 });
  ctx.shadowBlur = 0;
  R.blob(ctx, [[s * 0.55, 0], [s * 0.45, -s * 0.33], [s * 0.2, -s * 0.38], [s * 0.04, -s * 0.3], [-s * 0.2, -s * 0.5], [-s * 0.55, -s * 0.42],
    [-s * 0.7, 0], [-s * 0.55, s * 0.42], [-s * 0.2, s * 0.5], [s * 0.04, s * 0.3], [s * 0.2, s * 0.38], [s * 0.45, s * 0.33]], body, { lw: R.LINE * 0.8 });
  R.ellipse(ctx, s * 0.12, 0, s * 0.14, s * 0.14, "#3a2014", { line: false, shade: false });
  ctx.fillStyle = R.darken(body, 0.45);
  ctx.fillRect(-s * 0.46, -s * 0.2, s * 0.08, s * 0.4);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let i = -1; i <= 1; i += 2) { ctx.moveTo(-s * 0.42, i * s * 0.05); ctx.lineTo(s * 1.5, i * s * 0.04); }
  ctx.stroke();
  R.shine(ctx, -s * 0.3, -s * 0.22, s * 0.16, s * 0.08, 0.5);
  ctx.restore();
}

function rattle(ctx, R, x, y, ang, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.lineCap = "round";
  ctx.strokeStyle = R.INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, -9); ctx.stroke();
  ctx.strokeStyle = "#ffe07a"; ctx.lineWidth = 3; ctx.stroke();
  R.ellipse(ctx, 0, -14, 7, 7, "#7fd6ff");
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -14, 4.5, 0.3, 2.2); ctx.stroke();
  R.ellipse(ctx, 0, 6, 3, 3, "#ff8ab0", { lw: 2 });
  ctx.restore();
}

function staff(ctx, R, x, y, ang, len, t, big) {
  const dx = Math.sin(ang), dy = -Math.cos(ang);
  const x0 = x - dx * len * 0.35, y0 = y - dy * len * 0.35, x1 = x + dx * len * 0.65, y1 = y + dy * len * 0.65;
  ctx.lineCap = "round";
  ctx.strokeStyle = R.INK; ctx.lineWidth = 7.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = "#8a4e22"; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = "#ffc53d"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x1 - dx * 6, y1 - dy * 6); ctx.lineTo(x1, y1); ctx.stroke();
  // punta: luna/sol luminoso
  const r = (big ? 8 : 5.5) + Math.sin(t * 0.15) * 0.8;
  ctx.save();
  const g = ctx.createRadialGradient(x1 + dx * 5, y1 + dy * 5, 1, x1 + dx * 5, y1 + dy * 5, r * 3);
  g.addColorStop(0, "rgba(255,245,190,0.9)");
  g.addColorStop(1, "rgba(255,200,90,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x1 + dx * 5, y1 + dy * 5, r * 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  R.star(ctx, x1 + dx * 5, y1 + dy * 5, r, "#fff0a0", { points: 4, inner: 0.5, rot: t * 0.03, lw: 2 });
  R.sparkle(ctx, x1 + dx * 5 + 6, y1 + dy * 5 - 6, 3 + Math.sin(t * 0.2) * 1.5, "#ffffff");
}

function glowOrb(ctx, R, x, y, r, t, col) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 1, x, y, r * 2.4);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.35, R.alpha(col, 0.7));
  g.addColorStop(1, R.alpha(col, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const a = t * 0.08 + (i * Math.PI) / 2;
    R.sparkle(ctx, x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r * 1.1, 2.5 + (i % 2) * 1.5, i % 2 ? "#ffffff" : "#fff3a0");
  }
}

// ---------------------------------------------------------------------------
// pose → objetivos de manos/pies (espacio del cuerpo)
// ---------------------------------------------------------------------------
function solve(pose, d, f) {
  const t = pose.t, st = pose.state, hipY = -d.ll, sy = hipY - d.th, al = d.al;
  const xF = 4, xB = -5;
  const restF = [xF + 3, sy + al * 0.86], restB = [xB - 3, sy + al * 0.86];
  const hr = d.hr, hx = 1;
  const r = {
    ox: 0, oy: 0, lean: 0, spin: 1, hipX: 0, headRot: Math.sin(t * 0.03) * 0.04,
    mood: "normal", mouth: "smile", wink: false,
    footF: [4, 0], footB: [-5, 0], handF: restF.slice(), handB: restB.slice(),
    flare: 0, hemLift: 0, hairUp: 0, uke: f >= 1 ? "back" : null, armOver: false,
    fx: null, fxK: 0, smear: 0, smearA: 0, paci: f === 0, staffUp: false, backOver: false,
  };
  const br = pose.breath;
  r.handF[1] += br * 0.8; r.handB[1] += br * 0.8; r.handF[0] += br * 0.4;
  r.hairUp = Math.sin(t * 0.05) * 0.12;
  if (f === 4) r.hairUp = 0.55 + Math.sin(t * 0.07) * 0.2;
  const float = pose.move === "float" || st === "glide";

  if (float && (st === "fall" || st === "jump" || st === "glide")) {
    r.handF = [xF + al * 0.95, sy + 3 + Math.sin(t * 0.12) * 2];
    r.handB = [xB - al * 0.95, sy + 5 - Math.sin(t * 0.12) * 2]; r.armOver = true;
    r.footF = [3, -1]; r.footB = [-2, -3];
    r.flare = 1.7; r.hemLift = 7; r.hairUp = 0.9;
    r.lean = Math.sin(t * 0.07) * 0.08; r.oy = Math.sin(t * 0.1) * 1.5;
    r.mouth = "open"; r.mood = "happy";
    return r;
  }
  switch (st) {
    case "run": {
      const p = pose.phase, s = Math.sin(p), c = Math.cos(p), A = d.ll * 0.5;
      r.footF = [3 + s * A, -Math.max(0, c) * d.ll * 0.5];
      r.footB = [-3 - s * A, -Math.max(0, -c) * d.ll * 0.5];
      r.oy = -Math.abs(c) * 3.5;
      r.handF = [xF - s * al * 0.55 + 2, sy + al * 0.72];
      r.handB = [xB + s * al * 0.55 - 2, sy + al * 0.72];
      r.lean = 0.12; r.flare = 0.25 + 0.2 * Math.abs(s); r.headRot = 0.05 + c * 0.03;
      r.hairUp = -0.1 + Math.abs(c) * 0.3;
      break;
    }
    case "jump":
      r.footF = [7, -d.ll * 0.5]; r.footB = [-6, -d.ll * 0.18];
      r.handF = [hx + hr * 0.9, sy - 10]; r.handB = [xB - al * 0.7, sy - 4]; r.armOver = true;
      r.lean = -0.06; r.hairUp = -0.6; r.flare = -0.1; r.mouth = "open"; r.headRot = -0.08;
      break;
    case "fall":
      r.footF = [5, 1]; r.footB = [-4, -3];
      r.handF = [xF + al * 0.9, sy - 3]; r.handB = [xB - al * 0.9, sy - 1]; r.armOver = true;
      r.hairUp = 1; r.flare = 0.7; r.hemLift = 3; r.mouth = "o"; r.headRot = 0.06;
      break;
    case "attack": {
      const a = pose.atk, sh = [xF, sy + 3];
      r.footF = [9, 0]; r.footB = [-8, 0]; r.mood = "angry"; r.mouth = "open"; r.paci = false;
      if (a < 0.3) {
        const k = ease(a / 0.3);
        r.handF = L2(restF, [xB - 6, sy - 10], k); r.lean = -0.14 * k; r.headRot = -0.06 * k;
        if (f >= 1 && k > 0.55) r.uke = "hand";
        r.armOver = false;
      } else {
        const k = a < 0.55 ? ease((a - 0.3) / 0.25) : 1;
        const back = a < 0.55 ? 0 : (a - 0.55) / 0.45;
        const ang = lerp(-2.7, 1.3, k) - back * 0.35;
        r.handF = [sh[0] + Math.sin(ang) * al, sh[1] + Math.cos(ang) * al];
        r.lean = lerp(-0.14, 0.2, k) * (1 - back * 0.7); r.headRot = 0.08 * k;
        r.armOver = true;
        if (f >= 1) r.uke = "hand";
        if (a < 0.8) { r.smear = 1 - Math.max(0, (a - 0.45) / 0.35); r.smearA = ang; }
      }
      r.handB = [xB - al * 0.5, sy + al * 0.5];
      break;
    }
    case "cast": {
      const c = pose.cast, slot = pose.castSlot;
      r.paci = false; r.fxK = c;
      if (slot === 1) {
        r.spin = Math.cos(c * Math.PI * 4);
        if (Math.abs(r.spin) < 0.18) r.spin = r.spin < 0 ? -0.18 : 0.18;
        const w = Math.sin(t * 0.3) * 3;
        r.handF = [xF + al * 0.9, sy - 2 + w]; r.handB = [xB - al * 0.9, sy - 6 - w];
        r.footF = [2, 0]; r.footB = [-3, -3];
        r.flare = 1.3; r.hemLift = 3; r.mood = "happy"; r.mouth = "open"; r.fx = "spin"; r.hairUp = 0.5;
      } else if (slot === 2) {
        r.handF = [hx + hr * 0.8, sy - 16]; r.handB = [hx - hr * 0.8, sy - 16]; r.armOver = true; r.backOver = true;
        r.headRot = -0.14; r.mood = "closed"; r.mouth = "o"; r.fx = "summon"; r.hairUp = 0.7; r.staffUp = true;
        r.footF = [6, 0]; r.footB = [-6, 0];
      } else {
        if (f === 0) {
          r.handF = [xF + 7 + Math.sin(t * 0.8) * 3, sy - al * 0.4];
        } else {
          r.uke = "play"; r.armOver = true;
          r.handB = [xF + al * 0.9, sy + 1];
          r.handF = [xF + 1, sy + al * 0.62 + Math.sin(t * 0.9) * 2.5];
        }
        r.mood = "happy"; r.mouth = "open"; r.fx = "notes"; r.headRot = 0.1 + Math.sin(t * 0.2) * 0.05;
      }
      break;
    }
    case "hurt":
      r.lean = -0.26; r.headRot = -0.22; r.mood = "hurt"; r.mouth = "o"; r.paci = false;
      r.handF = [xF + al * 0.85, sy - 8]; r.handB = [xB - al * 0.85, sy - 6]; r.armOver = true;
      r.footF = [8, -5]; r.footB = [-4, 0]; r.hairUp = 0.6;
      break;
    case "wall":
      r.lean = 0.1; r.headRot = -0.1;
      r.handF = [hx + hr * 0.95, sy - 12]; r.handB = [xB + 1, sy + al * 0.8]; r.armOver = true;
      r.footF = [14, -9]; r.footB = [8, -2]; r.hairUp = 0.8; r.mouth = "flat";
      break;
    case "victory": {
      const j = Math.abs(Math.sin(t * 0.09));
      r.oy = -j * 12;
      r.handF = [hx + hr * 0.95, sy - 12]; r.handB = [hx - hr * 0.95, sy - 12]; r.armOver = true; r.backOver = true;
      r.footF = [6, -j * 9]; r.footB = [-6, -j * 5];
      r.mood = "happy"; r.mouth = "open"; r.fx = "flowers"; r.hairUp = 0.8 - j; r.flare = 0.4 + j * 0.4; r.paci = false;
      r.headRot = -0.05;
      break;
    }
    default: {
      if (pose.flourish > 0) {
        const fl = pose.flourish, k = Math.min(1, Math.sin(fl * Math.PI) * 1.6), n = pose.flourishN % 3;
        if (n === 0) {
          // toca el ukelele (bebé: agita el sonajero)
          if (f === 0) {
            r.handF = L2(r.handF, [xF + 7 + Math.sin(t * 0.7) * 3, sy - al * 0.35], k);
          } else if (k > 0.3) {
            r.uke = "play"; r.armOver = true;
            r.handB = L2(restB, [xF + al * 0.9, sy + 1], k);
            r.handF = L2(restF, [xF + 1, sy + al * 0.62 + Math.sin(t * 0.6) * 2.5], k);
          }
          r.mood = "happy"; r.fx = "notes"; r.fxK = fl; r.headRot = Math.sin(t * 0.15) * 0.08;
        } else if (n === 1) {
          // baile hula: caderas y brazos ondulando
          const ph = fl * Math.PI * 6;
          r.hipX = Math.sin(ph * 0.5) * 4 * k;
          r.lean = -r.hipX * 0.025;
          r.handF = L2(r.handF, [xF + al * 0.85, sy + 4 + Math.sin(ph) * 4], k); r.armOver = true;
          r.handB = L2(r.handB, [xB - al * 0.85, sy + 4 - Math.sin(ph) * 4], k);
          r.flare = 0.35 * Math.abs(Math.sin(ph * 0.5)); r.mood = "happy"; r.headRot = -r.hipX * 0.03;
          r.footF = [4 + r.hipX * 0.3, 0]; r.footB = [-5 + r.hipX * 0.3, 0];
        } else {
          // saluda con la mano y guiña
          r.handF = L2(r.handF, [hx + hr * 0.95 + Math.sin(t * 0.4) * 4, sy - 14], k); r.armOver = true;
          r.wink = true; r.mouth = "open"; r.headRot = 0.08; r.paci = false;
        }
      }
    }
  }
  return r;
}

// ---------------------------------------------------------------------------
// partes
// ---------------------------------------------------------------------------
function ponytail(ctx, R, pose, f, hr, r) {
  const t = pose.t;
  if (f === 0) {
    // mechón rizado en la coronilla
    ctx.save();
    ctx.translate(-hr * 0.05, -hr * 0.92);
    ctx.rotate(Math.sin(t * 0.08) * 0.15 + pose.sway * 0.3);
    R.tail(ctx, 0, 0, hr * 0.55, -1.7, (k) => 4.5 + pose.bounce, 5, 2.5, HAIR, { segments: 7 });
    ctx.restore();
    return;
  }
  const turn = -2.1 + r.hairUp * 1.4 - pose.sway * 0.9 + pose.bounce * 0.6;
  const bx = -hr * 0.5, by = -hr * 0.82;
  const len = hr * (f === 4 ? 1.9 : 1.55);
  R.tail(ctx, bx, by, len, -2.2 - pose.sway * 0.2,
    (k) => turn + Math.sin(t * 0.08 + k * 3) * (f === 4 ? 0.9 : 0.35), hr * 0.44, hr * 0.14, HAIR, { segments: 10 });
  if (f === 4) {
    // mechones flotando
    for (let i = 0; i < 2; i++) {
      R.tail(ctx, -hr * 0.8, -hr * 0.1 + i * hr * 0.3, hr * 0.8, -2.4 - i * 0.3,
        (k) => Math.sin(t * 0.09 + i * 2 + k * 4) * 1.2 + 0.8, hr * 0.16, hr * 0.05, HAIR, { segments: 6 });
    }
  }
}

function head(ctx, R, pose, f, hr, r) {
  const t = pose.t;
  // pelo trasero
  R.ellipse(ctx, -hr * 0.1, -hr * 0.04, hr * 1.04, hr * 1.0, HAIR);
  if (f >= 1) R.blob(ctx, [[-hr * 0.95, -hr * 0.1], [-hr * 1.02, hr * 0.55], [-hr * 0.7, hr * 0.95], [-hr * 0.35, hr * 0.7], [-hr * 0.2, 0]], HAIR, { shade: false });
  // cara
  R.ellipse(ctx, hr * 0.1, hr * 0.14, hr * 0.86, hr * 0.8, SKIN);
  R.celShade(ctx, hr * 0.1, hr * 0.14, hr * 0.86, hr * 0.8, SKIN, 0.16);
  // oreja
  R.ellipse(ctx, -hr * 0.32, hr * 0.22, hr * 0.15, hr * 0.2, SKIN, { lw: R.LINE * 0.8 });
  // flequillo
  R.blob(ctx, [
    [-hr * 1.0, hr * 0.1], [-hr * 0.9, -hr * 0.6], [-hr * 0.25, -hr * 1.02], [hr * 0.5, -hr * 0.88], [hr * 0.92, -hr * 0.42],
    [hr * 1.0, hr * 0.0], [hr * 0.72, -hr * 0.2], [hr * 0.55, hr * 0.02], [hr * 0.36, -hr * 0.26], [hr * 0.12, -hr * 0.02],
    [-hr * 0.08, -hr * 0.3], [-hr * 0.28, hr * 0.02], [-hr * 0.52, -hr * 0.18], [-hr * 0.62, hr * 0.3],
  ], HAIR);
  // brillo del pelo (anillo de luz)
  ctx.save();
  ctx.strokeStyle = HAIR_HI;
  ctx.lineWidth = hr * 0.09;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(-hr * 0.1, -hr * 0.05, hr * 0.78, -2.5, -1.7); ctx.stroke();
  ctx.beginPath(); ctx.arc(-hr * 0.1, -hr * 0.05, hr * 0.78, -1.5, -1.25); ctx.stroke();
  ctx.restore();

  // cara
  const ex = hr * 0.12, ey = hr * 0.27;
  if (r.mood === "hurt" || r.mood === "dead") {
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.08; ctx.lineCap = "round";
    ctx.beginPath();
    if (r.mood === "hurt") {
      ctx.moveTo(ex - hr * 0.16, ey - hr * 0.14); ctx.lineTo(ex + hr * 0.1, ey); ctx.lineTo(ex - hr * 0.16, ey + hr * 0.12);
      ctx.moveTo(hr * 0.72, ey - hr * 0.16); ctx.lineTo(hr * 0.5, ey - hr * 0.02); ctx.lineTo(hr * 0.72, ey + hr * 0.1);
    } else {
      for (const [x, s] of [[ex, 0.14], [hr * 0.62, 0.12]]) {
        ctx.moveTo(x - hr * s, ey - hr * s); ctx.lineTo(x + hr * s, ey + hr * s);
        ctx.moveTo(x + hr * s, ey - hr * s); ctx.lineTo(x - hr * s, ey + hr * s);
      }
    }
    ctx.stroke();
  } else {
    const mood = r.mood === "normal" ? undefined : r.mood;
    R.eye(ctx, ex, ey, hr * 0.29, pose, { iris: IRIS, mood: r.wink ? "happy" : mood, lash: true });
    R.eye(ctx, hr * 0.66, ey - hr * 0.02, hr * 0.24, pose, { iris: IRIS, mood });
  }
  R.blush(ctx, -hr * 0.08, hr * 0.52, hr * 0.14);
  R.blush(ctx, hr * 0.84, hr * 0.5, hr * 0.09);
  // nariz
  ctx.strokeStyle = R.darken(SKIN, 0.35); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(hr * 0.5, hr * 0.44, hr * 0.05, -0.5, 1.4); ctx.stroke();
  const mx = hr * 0.44, my = hr * 0.62;
  if (r.paci) {
    R.ellipse(ctx, mx + 1, my, hr * 0.2, hr * 0.13, "#ff8ab0", { lw: 2.2 });
    ctx.strokeStyle = R.INK; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(mx + hr * 0.18, my + hr * 0.04, hr * 0.09, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#7fd6ff"; ctx.lineWidth = 1.6; ctx.stroke();
  } else {
    R.mouth(ctx, mx, my, hr * 0.3, r.mouth);
  }

  // accesorios de cabeza
  if (f >= 1 && f <= 3) hibiscus(ctx, R, -hr * 0.55, -hr * 0.72, hr * 0.3, HIBIS[f], 0.3 + Math.sin(t * 0.05) * 0.05);
  if (f === 0) hibiscus(ctx, R, -hr * 0.62, -hr * 0.5, hr * 0.2, HIBIS[0], 0.2);
  if (f === 2) {
    // corona de flores
    const cols = ["#ffffff", "#ffd23f", "#ff6f91", "#ffffff", "#ffb347", "#ff6f91"];
    for (let i = 0; i < 6; i++) {
      const a = -2.75 + i * 0.36;
      hibiscus(ctx, R, Math.cos(a) * hr * 0.9 - hr * 0.08, Math.sin(a) * hr * 0.86 - hr * 0.02, hr * 0.17, cols[i], a);
    }
  }
  if (f === 3) {
    // diadema dorada con sol
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(-hr * 0.08, hr * 0.02, hr * 0.92, -2.6, -0.45); ctx.stroke();
    ctx.strokeStyle = "#ffc53d"; ctx.lineWidth = hr * 0.1; ctx.stroke();
    R.star(ctx, hr * 0.28, -hr * 0.86, hr * 0.2, "#ffe27a", { points: 8, inner: 0.55, lw: 2 });
  }
  if (f === 4) {
    ctx.strokeStyle = R.INK; ctx.lineWidth = hr * 0.18; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(-hr * 0.08, hr * 0.02, hr * 0.92, -2.5, -0.55); ctx.stroke();
    ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = hr * 0.09; ctx.stroke();
    hibiscus(ctx, R, -hr * 0.6, -hr * 0.7, hr * 0.3, "#ffffff", 0.3);
    R.halo(ctx, -hr * 0.05, -hr * 1.3, hr * 0.7, t);
  }
}

function dressPath(ctx, x0, sy, hemY, wT, wH, shift, f, flare) {
  ctx.beginPath();
  ctx.moveTo(x0 - wT, sy);
  ctx.quadraticCurveTo(x0 - wT - 2, sy + (hemY - sy) * 0.4, x0 - wH + shift, hemY);
  // bajo festoneado
  const n = f === 0 ? 3 : 5;
  const w = (wH * 2) / n;
  for (let i = 0; i < n; i++) {
    const xa = x0 - wH + shift + w * i;
    ctx.quadraticCurveTo(xa + w / 2, hemY + 3 + flare * 1.2, xa + w, hemY);
  }
  ctx.quadraticCurveTo(x0 + wT + 2, sy + (hemY - sy) * 0.4, x0 + wT, sy);
  ctx.quadraticCurveTo(x0, sy + 4, x0 - wT, sy);
  ctx.closePath();
}

function torso(ctx, R, pose, f, d, r) {
  const t = pose.t, hipY = -d.ll, sy = hipY - d.th;
  const col = DRESS[f];
  const x0 = -0.5 + r.hipX * 0.4;
  const wT = f === 0 ? 10 : 8;
  let wH = (f === 0 ? 14 : 13 + f * 0.8) + r.flare * 7;
  let hemY = hipY + d.ll * (f === 0 ? 0.35 : f >= 3 ? 0.45 : 0.32) - r.hemLift;
  if (f === 4) hemY = hipY + d.ll * 0.55 - r.hemLift;
  const shift = -pose.sway * 3 + r.hipX * 0.6;
  if (f === 0) {
    // pelele: cuerpo redondito
    R.blob(ctx, [[x0 - 9, sy + 1], [x0 + 9, sy + 1], [x0 + 13, sy + d.th * 0.7], [x0 + 9, hemY], [x0 - 9, hemY], [x0 - 13, sy + d.th * 0.7]], col);
    R.ellipse(ctx, x0 + 3, sy + d.th * 0.55, 5, 5, "#ffffff", { lw: 2 });
    hibiscus(ctx, R, x0 + 3, sy + d.th * 0.55, 3.2, "#ff5c8a");
    return;
  }
  const g = ctx.createLinearGradient(x0 - wH, sy, x0 + wH, hemY);
  g.addColorStop(0, R.lighten(col, 0.22));
  g.addColorStop(0.6, col);
  g.addColorStop(1, R.darken(col, 0.2));
  dressPath(ctx, x0, sy, hemY, wT, wH, shift, f, r.flare);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  if (f <= 2) {
    // flores blancas del muumuu
    const fl = [[-6, 0.25], [4, 0.45], [-2, 0.8], [8, 0.95], [-10, 1.05], [2, 1.25]];
    ctx.fillStyle = f === 2 ? "#fff3f6" : "#ffffff";
    for (const [fx, fy] of fl) {
      const cx = x0 + fx + shift * fy * 0.5, cy = sy + (hemY - sy) * fy * 0.8;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.moveTo(cx + Math.cos(a) * 2.2 + 1.3, cy + Math.sin(a) * 2.2);
        ctx.arc(cx + Math.cos(a) * 2.2, cy + Math.sin(a) * 2.2, 1.3, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.fillStyle = "#ffd23f";
    ctx.beginPath();
    for (const [fx, fy] of fl) { const cx = x0 + fx + shift * fy * 0.5, cy = sy + (hemY - sy) * fy * 0.8; ctx.moveTo(cx + 1, cy); ctx.arc(cx, cy, 1, 0, Math.PI * 2); }
    ctx.fill();
  } else {
    // vestido ceremonial: bandas doradas con triángulos
    const gold = f === 3 ? "#ffc53d" : "#ffd35a";
    ctx.fillStyle = gold;
    ctx.fillRect(x0 - 30, hemY - 6, 60, 8);
    ctx.fillRect(x0 - 30, sy + d.th * 0.42, 60, 3.2);
    ctx.fillStyle = f === 3 ? "#8a1522" : "#ffb3d0";
    ctx.beginPath();
    for (let i = -5; i <= 5; i++) { const x = x0 + i * 5 + shift * 0.6; ctx.moveTo(x - 2.5, hemY - 1); ctx.lineTo(x, hemY - 5); ctx.lineTo(x + 2.5, hemY - 1); }
    ctx.fill();
    ctx.fillStyle = gold;
    ctx.beginPath(); ctx.moveTo(x0 - 2.5, sy); ctx.lineTo(x0 + 2.5, sy); ctx.lineTo(x0 + 4 + shift * 0.4, hemY); ctx.lineTo(x0 - 4 + shift * 0.4, hemY); ctx.fill();
    if (f === 4) {
      ctx.fillStyle = "rgba(255,210,120,0.35)";
      ctx.beginPath(); ctx.ellipse(x0 + 6, hemY - 4, 10, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  // sombra lateral
  ctx.fillStyle = R.alpha(R.darken(col, 0.5), 0.18);
  ctx.beginPath(); ctx.ellipse(x0 + wH * 0.8, hemY, wH * 0.6, (hemY - sy) * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  dressPath(ctx, x0, sy, hemY, wT, wH, shift, f, r.flare);
  R.paint(ctx, null);
  R.shine(ctx, x0 - wT * 0.4, sy + 5, 2.2, 4, 0.45);

  // falda de hula (forma 2)
  if (f === 2) {
    const wy = hipY - 3, n = 11, L = d.ll * 0.62;
    const fan = 0.22 + r.flare * 0.62;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), x = x0 - 13 + k * 26;
      const ang = (k - 0.5) * 2 * fan - pose.sway * 0.28 + Math.sin(t * 0.13 + i * 0.8) * 0.06 + r.hipX * 0.03 + pose.bounce * (k - 0.5) * 0.3;
      const ex = x + Math.sin(ang) * L, ey = wy + Math.cos(ang) * L * (1 - r.flare * 0.12);
      const px = Math.cos(ang) * 2, py = -Math.sin(ang) * 2;
      R.poly(ctx, [[x - 2.2, wy], [x + 2.2, wy], [ex + px * 0.3, ey + py * 0.3], [ex - px * 0.3, ey - py * 0.3]],
        i % 2 ? "#6cc04a" : "#8fd65a", { lw: 1.6 });
    }
    R.blob(ctx, [[x0 - 14, wy - 3], [x0 + 14, wy - 3], [x0 + 14.5, wy + 2], [x0 - 14.5, wy + 2]], "#c98a4a", { lw: 2 });
  }
  // lei (formas 2+)
  if (f >= 2) {
    const cols = f === 2 ? ["#ff6f91", "#ffd23f", "#ffffff"] : f === 3 ? ["#ffc53d", "#fff0a0", "#ff9a3d"] : ["#ffffff", "#ffe27a", "#ffd0e6"];
    for (let i = 0; i < 7; i++) {
      const a = 0.15 * Math.PI + (i / 6) * 0.7 * Math.PI;
      R.ellipse(ctx, x0 + 1.5 + Math.cos(a) * 9.5, sy + 1 + Math.sin(a) * 6, 2.8, 2.8, cols[i % 3], { lw: 1.6 });
    }
  }
}

function wings(ctx, R, pose, sy) {
  const t = pose.t;
  const flap = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.12));
  const up = [[0, 0], [-10, -18], [-30, -36], [-44, -30], [-42, -12], [-24, 2]];
  const lo = [[0, 2], [-22, 6], [-34, 20], [-26, 32], [-10, 22]];
  for (const side of [1, -1]) {
    ctx.save();
    ctx.translate(-4, sy + 8);
    ctx.scale(side === 1 ? flap : -flap * 0.72, 1);
    for (const pts of [lo, up]) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, -40, -20);
      g.addColorStop(0, "rgba(255,248,210,0.9)");
      g.addColorStop(0.5, "rgba(255,160,215,0.72)");
      g.addColorStop(1, "rgba(255,200,245,0.6)");
      ctx.fillStyle = g;
      ctx.lineJoin = "round";
      ctx.fill();
      ctx.lineWidth = 2.4; ctx.strokeStyle = "#fff2c4"; ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-36, -28); ctx.moveTo(0, 0); ctx.lineTo(-40, -14); ctx.moveTo(0, 2); ctx.lineTo(-28, 22); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.arc(-34, -24, 2.6, 0, Math.PI * 2); ctx.arc(-24, 18, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function cape(ctx, R, pose, d, r) {
  const t = pose.t, hipY = -d.ll, sy = hipY - d.th;
  const fly = -pose.sway * 10 + (pose.state === "run" ? 8 : 0) + (pose.air ? 6 : 0) + r.hairUp * 4;
  const bot = -2 - fly * 0.9;
  const pts = [[5, sy + 1], [-4, sy - 1]];
  pts.push([-14 - fly * 0.3, sy + d.th * 0.55]);
  for (let i = 0; i <= 4; i++) {
    const k = i / 4;
    pts.push([-26 - fly * 0.9 + k * 26 + Math.sin(t * 0.11 + k * 4) * 2, lerp(bot, -1, k) + Math.sin(t * 0.15 + k * 5) * 3 * (1 - k * 0.5)]);
  }
  pts.push([4, hipY]);
  R.blob(ctx, pts, "#ffc53d", { shade: false });
  const inner = pts.map(([x, y]) => [x * 0.92 + 0.8, y * 0.94 + (y - sy) * -0.02]);
  inner[0] = [3, sy + 2]; inner[1] = [-3, sy];
  R.blob(ctx, inner, "#b31f30", { line: false });
}

// ---------------------------------------------------------------------------
// efectos
// ---------------------------------------------------------------------------
function effects(ctx, R, pose, f, d, r, headTop) {
  const t = pose.t, sy = -d.ll - d.th;
  if (r.fx === "notes") {
    const cols = ["#ffe04a", "#7fe0ff", "#ff8ab0"];
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.02 + i / 3) % 1);
      note(ctx, R, 18 + k * 24 + Math.sin(k * 8 + i) * 4, sy + 2 - k * 36, 7.5, cols[i], Math.min(1, Math.sin(k * Math.PI) * 2));
    }
  } else if (r.fx === "summon") {
    const oy = headTop - 12 + Math.sin(t * 0.2) * 2;
    glowOrb(ctx, R, 0, oy, 7 + r.fxK * 5, t, f >= 3 ? "#ffd36a" : "#ff8ab0");
    ctx.save();
    ctx.strokeStyle = "rgba(255,240,200,0.6)"; ctx.lineWidth = 1.6; ctx.setLineDash([2, 4]); ctx.lineDashOffset = -t * 0.6;
    ctx.beginPath(); ctx.moveTo(r.handF[0], r.handF[1]); ctx.quadraticCurveTo(10, oy + 6, 0, oy);
    ctx.moveTo(r.handB[0], r.handB[1]); ctx.quadraticCurveTo(-10, oy + 6, 0, oy); ctx.stroke();
    ctx.restore();
  } else if (r.fx === "spin") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const y = -d.ll * (0.4 + i * 0.5), a0 = t * 0.4 + i * 2;
      ctx.beginPath(); ctx.ellipse(0, y, 22 + i * 2, 5, 0, a0, a0 + 2.2); ctx.stroke();
    }
    ctx.restore();
    hibiscus(ctx, R, Math.cos(t * 0.3) * 24, -d.ll * 0.6 + Math.sin(t * 0.3) * 4, 4, "#ff6f91", t * 0.2);
  } else if (r.fx === "flowers") {
    const cols = ["#ff6f91", "#ffd23f", "#ffffff", "#ff4d6d"];
    for (let i = 0; i < 6; i++) {
      const k = ((t * 0.012 + i / 6) % 1);
      ctx.save();
      ctx.globalAlpha *= Math.min(1, (1 - k) * 2.5);
      hibiscus(ctx, R, Math.sin(i * 2.1 + t * 0.03) * 34 * (0.5 + k), sy - 6 - k * 44, 4 + (i % 3), cols[i % 4], t * 0.05 + i);
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------------------
// gatear (Kilo Bebé corriendo)
// ---------------------------------------------------------------------------
function drawCrawl(ctx, pose, R) {
  const d = DIM[0], p = pose.phase, s = Math.sin(p), c = Math.cos(p);
  const pink = DRESS[0], dk = R.darken(pink, 0.15);
  const bob = -Math.abs(c) * 2;
  ctx.save();
  ctx.translate(0, bob);
  const r = { mood: "normal", mouth: "smile", paci: true, hairUp: 0.2, wink: false };
  // brazo y pierna lejanos
  ik(ctx, R, 6, -18, 12 - s * 5, -2 - Math.max(0, -c) * 4, 17, 1, d.aw, R.darken(SKIN, 0.15), { hand: 3.8 });
  const kneeB = [-12 + s * 4, -3 - Math.max(0, c) * 3];
  R.limb(ctx, -10, -14, -12, -9, kneeB[0], kneeB[1], d.lw, dk, { hand: false });
  R.limb(ctx, kneeB[0], kneeB[1], kneeB[0] - 5, kneeB[1] + 1, kneeB[0] - 10, kneeB[1] - 6, d.lw * 0.8, dk, { hand: false });
  R.ellipse(ctx, kneeB[0] - 11, kneeB[1] - 7, 3.2, 4, R.darken(SKIN, 0.15), { lw: 2.2 });
  // cuerpo
  R.ellipse(ctx, -4, -15, 16, 11, pink);
  R.ellipse(ctx, -3, -11, 9, 5, "#ffffff", { line: false, shade: false });
  // pierna y brazo cercanos
  const kneeF = [-8 - s * 4, -3 - Math.max(0, -c) * 3];
  R.limb(ctx, -8, -12, -8, -7, kneeF[0], kneeF[1], d.lw, pink, { hand: false });
  R.limb(ctx, kneeF[0], kneeF[1], kneeF[0] - 5, kneeF[1] + 1, kneeF[0] - 10, kneeF[1] - 6, d.lw * 0.8, pink, { hand: false });
  R.ellipse(ctx, kneeF[0] - 11, kneeF[1] - 7, 3.4, 4.2, SKIN, { lw: 2.2 });
  // cabeza
  ctx.save();
  ctx.translate(16, -34 + c * 0.8);
  ctx.rotate(0.06 + s * 0.04);
  ctx.scale(0.92, 0.92);
  ponytail(ctx, R, pose, 0, d.hr, r);
  head(ctx, R, pose, 0, d.hr, r);
  ctx.restore();
  ik(ctx, R, 8, -16, 14 + s * 5, -2 - Math.max(0, c) * 4, 17, 1, d.aw, SKIN, { hand: 3.8 });
  ctx.restore();
}

// ---------------------------------------------------------------------------
// principal
// ---------------------------------------------------------------------------
function draw(ctx, pose, R) {
  const f = pose.form, d = DIM[f], t = pose.t, st = pose.state;
  if (f === 0 && st === "run") return drawCrawl(ctx, pose, R);
  const dead = st === "dead";
  const r = dead ? solve({ ...pose, state: "idle", flourish: 0 }, d, f) : solve(pose, d, f);
  const hipY = -d.ll, sy = hipY - d.th, al = d.al;
  const hx = 1 + r.hipX * 0.3, hy = sy - d.hr * 0.9;
  if (dead) {
    r.mood = "dead"; r.mouth = "o"; r.paci = false; r.hairUp = -0.3;
    r.handF = [4 + al * 0.8, sy - al * 0.2]; r.handB = [-5 - al * 0.8, sy - al * 0.1];
    r.footF = [6, 0]; r.footB = [-6, 0]; r.headRot = 0.1; r.flare = 0.3;
  }

  ctx.save();
  if (dead) { ctx.translate(46 + f * 2, -d.hr * 1.12); ctx.rotate(-Math.PI / 2); }
  ctx.translate(r.ox, r.oy);
  if (r.spin !== 1) ctx.scale(r.spin, 1);
  const bodyT = () => { ctx.translate(r.hipX, hipY); ctx.rotate(r.lean); ctx.translate(0, -hipY); };
  const headT = () => { ctx.translate(hx, sy); ctx.rotate(r.headRot); ctx.translate(0, hy - sy); };
  const skinB = R.darken(SKIN, 0.16);
  const legCol = f === 0 ? DRESS[0] : SKIN;
  const legL = (d.ll - 4) * 1.06;

  // --- capa trasera: alas, capa, coleta, ukelele, brazo trasero
  ctx.save();
  bodyT();
  if (f === 4 && !dead) wings(ctx, R, pose, sy);
  if (f === 3) cape(ctx, R, pose, d, r);
  if (r.fx === "summon" && f >= 1) glowOrb(ctx, R, 0, sy - d.hr * 2 - 6, 12, t, "#fff0c0");
  ctx.save(); headT(); ponytail(ctx, R, pose, f, d.hr, r); ctx.restore();
  if (r.uke === "back") uke(ctx, R, -15, sy + d.th * 0.58, -Math.PI / 2 - 0.95 + pose.sway * 0.1, 12 + f, f === 4);
  if (f === 3) {
    const hb = r.staffUp ? [r.handB[0], r.handB[1]] : r.handB;
    staff(ctx, R, hb[0], hb[1], r.staffUp ? -0.15 : -0.12 - pose.sway * 0.1, 56, t, r.staffUp);
  }
  const backArm = () => {
    ik(ctx, R, -5, sy + 3, r.handB[0], r.handB[1], al, r.backOver ? -1 : 1, d.aw, skinB, { hand: d.aw * 0.72 });
    R.ellipse(ctx, -5, sy + 3, 5, 4.5, R.darken(DRESS[f], 0.15), { lw: 2.4 });
  };
  if (!r.backOver) backArm();
  ctx.restore();

  // --- piernas (descalzas)
  const leg = (hxp, foot, col, fcol) => {
    const fy = foot[1] - 3.6, fx = foot[0];
    const e = ik(ctx, R, hxp + r.hipX, hipY, fx, fy, legL, -1, d.lw, col, { hand: false });
    R.ellipse(ctx, e[0] + 2.4, e[1] + 0.6, d.lw * 0.7, d.lw * 0.46, fcol, { lw: 2.4 });
  };
  leg(-3, r.footB, f === 0 ? R.darken(DRESS[0], 0.12) : skinB, skinB);
  leg(3, r.footF, legCol, SKIN);

  // --- cuerpo, cabeza, brazo delantero
  ctx.save();
  bodyT();
  torso(ctx, R, pose, f, d, r);
  const frontArm = () => {
    const e = ik(ctx, R, 4, sy + 3, r.handF[0], r.handF[1], al, 1, d.aw, SKIN, { hand: d.aw * 0.75 });
    R.ellipse(ctx, 4, sy + 3.5, 5, 4.5, DRESS[f], { lw: 2.4 });
    if (f === 0) {
      const ang = Math.atan2(e[0] - 4, -(e[1] - sy - 3)) * 0.4 + (r.fx === "notes" ? Math.sin(t * 0.8) * 0.5 : 0) + (st === "attack" ? pose.atk * 1.5 - 0.5 : 0);
      rattle(ctx, R, e[0], e[1], ang, t);
    } else if (r.uke === "hand") {
      const a = Math.atan2(e[1] - sy - 3, e[0] - 4), us = 13 + f;
      uke(ctx, R, e[0] + Math.cos(a) * us * 1.55, e[1] + Math.sin(a) * us * 1.55, a + Math.PI, us, f === 4);
      R.ellipse(ctx, e[0], e[1], d.aw * 0.75, d.aw * 0.75, SKIN, { lw: 2.4 });
    }
  };
  if (r.uke === "play") {
    const bx = 1, by = sy + al * 0.62;
    uke(ctx, R, bx, by, Math.atan2(r.handB[1] - by, r.handB[0] - bx), 14 + f, f === 4);
    R.ellipse(ctx, r.handB[0], r.handB[1], d.aw * 0.72, d.aw * 0.72, skinB, { lw: 2.4 });
  }
  if (!r.armOver) frontArm();
  if (r.smear > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255," + (0.65 * r.smear).toFixed(3) + ")";
    ctx.lineWidth = 7; ctx.lineCap = "round";
    const a1 = Math.PI / 2 - r.smearA;
    ctx.beginPath(); ctx.arc(4, sy + 3, al + 12, a1 - 1.6, a1); ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  headT();
  head(ctx, R, pose, f, d.hr, r);
  ctx.restore();
  if (r.backOver) backArm();
  if (r.armOver) frontArm();
  effects(ctx, R, pose, f, d, r, hy - d.hr);
  ctx.restore();
  ctx.restore();

  if (dead) {
    for (let i = 0; i < 3; i++) {
      const a = t * 0.1 + (i * Math.PI * 2) / 3;
      R.star(ctx, -d.hr * 0.2 + Math.cos(a) * 14, -d.hr * 2.1 + Math.sin(a) * 4, 3.5, "#ffe04a", { lw: 1.5 });
    }
  }
}

export default { id: "lilo", draw };
