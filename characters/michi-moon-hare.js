import {drawMichiEye} from './michi-eyes.js';
// Hidrozoo Cósmico / Quimera Abisal (Form 3)
// Silueta 100% Medusa Cósmica Abisal: doble campana lobulada, manto ondulante,
// 8 zarcillos eléctricos bioluminiscentes, ojos astrales y cavidad interior radiante.
// Cero anatomía de conejo ni gato. Conserva API exportada para tests existentes.
const TAU = Math.PI * 2;
const finite = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, finite(v)));
const P = Object.freeze({
  ink: '#493451', ivory: '#fff6e9', light: '#fffdf6', shadow: '#d6c3e3', deep: '#a78abf',
  lavender: '#bba1df', rose: '#efbad3', ear: '#cb83b0', blue: '#5784b4', gold: '#e6b96b',
  goldLight: '#fff0b6', abyss: '#2a0f2e', plasma: '#ff7fae'
});
const STATES = new Set(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']);

export function moonHarePose(p = {}) {
  const state = STATES.has(p.state) ? p.state : 'idle';
  const reduced = !!p.reduceMotion, dead = state === 'dead';
  const t = reduced || dead ? 0 : finite(p.t);
  const phase = reduced ? 0 : Math.abs(finite(p.phase)) > 0.0001 ? p.phase : t * 0.24;
  const moving = state === 'run', air = ['jump','fall','glide'].includes(state), cast = state === 'cast';
  const attack = state === 'attack' ? Math.sin(Math.PI * (reduced ? 0.5 : clamp(finite(p.atk, 0.5)))) : 0;
  const charge = cast ? Math.sin(Math.PI * (reduced ? 0.5 : clamp(finite(p.cast, 0.5)))) : 0;
  const power = Number.isInteger(p.michiPowerIndex) ? p.michiPowerIndex : Math.trunc(finite(p.castSlot, -1));
  const land = reduced ? 0 : clamp(p.land), breath = reduced ? 0 : Math.sin(t * 0.055);
  const stride = moving ? Math.sin(phase) : 0, follow = moving ? Math.sin(phase - 0.75) : 0;
  const speed = clamp(finite(p.speed, 1), 0.25, 1.25), sit = state === 'victory';
  const welcome = p.michiWelcome || {}, inspect = reduced ? 0 : clamp(welcome.inspect), groom = reduced ? 0 : clamp(welcome.groom);
  const hurt = state === 'hurt', jump = state === 'jump', fall = state === 'fall', glide = state === 'glide', wall = state === 'wall';

  const rig = {
    state, t, reduced, power, attack, charge, air, sit, dead,
    bodyX: attack * 3.5 - hurt * 2,
    bodyY: moving ? -Math.max(0, stride) * 5.5 * speed : land * 3.5 + breath * 0.6,
    lean: dead ? 0.6 : hurt ? -0.10 : jump ? -0.055 : glide ? 0.055 : attack * -0.05,
    chest: sit ? -8 : jump ? -1 : land * 3,
    headX: attack * 6 - hurt * 3 + inspect * 2,
    headY: sit ? -11 : jump ? -3 : land * 2,
    headTilt: hurt ? -0.18 : wall ? -0.12 : sit ? -0.09 + breath * 0.035 : -follow * 0.035,
    sway: moving ? -follow * 0.2 : reduced ? 0 : Math.sin(t * 0.049) * 0.10,
    frontX: moving ? 29 - Math.sin(phase + 0.65) * 15 : attack ? 31 + attack * 24 : jump ? 18 : glide ? 48 : wall ? 37 : sit ? 13 : 28,
    frontY: moving ? -3 - Math.max(0, Math.cos(phase + 0.65)) * 8 : jump ? -26 : glide ? -29 : wall ? -49 : sit ? -30 : fall ? 2 : hurt ? -24 : -3,
    backX: moving ? -13 + stride * 17 : jump ? -24 : glide ? -36 : fall ? -18 : -10,
    backY: moving ? -3 - Math.max(0, Math.cos(phase)) * 11 : jump ? -20 : glide ? -13 : fall ? -4 : -3,
    farOffset: moving ? Math.sin(phase + 0.25) * 3 : 0,
    pawLift: cast ? (power === 1 ? 10 : power === 5 ? 22 : 18) * charge : groom * 9,
    blink: dead || hurt ? 1 : reduced ? 0 : ((t + 31) % 193) < 6 ? 1 : 0,
    look: clamp(finite(p.look?.x, 1), -1, 1) * 0.9 + inspect * 0.5,
    smile: sit || power === 5 && cast || clamp(welcome.purr) > 0.3,
    breath,
    mantle: glide ? 1 : cast && power === 2 ? 0.65 : 0
  };

  if (cast) {
    if (power === 0) { rig.frontX = 29 + charge * 12; rig.frontY = -9; rig.headTilt -= charge * 0.045; }
    else if (power === 1) { rig.frontX = 9; rig.frontY = -17; rig.bodyY += charge * 3; rig.headY += charge * 3; }
    else if (power === 2) { rig.frontX = 43; rig.frontY = -25; rig.headY -= charge * 6; }
    else if (power === 3) { rig.frontX = 34; rig.frontY = -3; rig.pawLift = 0; rig.backX = -22; rig.bodyX += charge * 5; rig.headTilt -= charge * 0.16; }
    else if (power === 4) { rig.frontX = 44; rig.frontY = -28; rig.bodyY -= charge * 3; rig.mantle = charge * 0.8; }
    else if (power === 5) { rig.frontX = 32; rig.frontY = -24 + (reduced ? 0 : Math.sin(t * 0.25) * 4); rig.headTilt = -0.08; rig.look = -0.4; }
  }
  return rig;
}

function path(c, fill, fn, width = 1.45) {
  c.beginPath(); fn(); c.closePath(); c.fillStyle = fill; c.fill();
  if (width) { c.strokeStyle = P.ink; c.lineWidth = width; c.stroke(); }
}
function oval(c, x, y, rx, ry, fill, rot = 0, width = 1.3) {
  path(c, fill, () => c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU), width);
}
function line(c, col, width, fn) {
  c.strokeStyle = col; c.lineWidth = width; c.beginPath(); fn(); c.stroke();
}
function crescent(c, x, y, r, col) {
  path(c, col, () => {
    c.moveTo(x + r * 0.4, y - r);
    c.bezierCurveTo(x - r * 1.35, y - r, x - r * 1.35, y + r, x + r * 0.4, y + r);
    c.bezierCurveTo(x - r * 0.45, y + r * 0.48, x - r * 0.45, y - r * 0.48, x + r * 0.4, y - r);
  }, 0.65);
}

// Compatibilidad IK preservada para tests
export function hareLegJoint(hip, paw, upper, lower, bend = -1) {
  const dx = paw.x - hip.x, dy = paw.y - hip.y, d = Math.hypot(dx, dy) || 0.001;
  const reach = Math.max(Math.abs(upper - lower) + 0.001, Math.min(upper + lower - 0.001, d));
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const side = Math.sqrt(Math.max(0, upper * upper - along * along)) * bend;
  return { x: hip.x + dx / d * along - dy / d * side, y: hip.y + dy / d * along + dx / d * side };
}

// Coordenadas faciales exportadas para verificación biométrica en tests
export function moonHareFace(p = {}) {
  const r = moonHarePose(p);
  const headX = 14 + r.headX * 0.7, headY = -42 + r.headY;
  return {
    far: { x: headX - 8, y: headY - 6, rx: 7.8, ry: 7.8 },
    nose: { x: headX + 2, y: headY + 9 },
    near: { x: headX + 12, y: headY - 6, rx: 8.2, ry: 8.2 },
    closed: r.blink === 1 || r.state === 'hurt' || r.state === 'dead'
  };
}

// Zarcillo primordial del hidrozoo cósmico
function drawHydroTentacle(c, rootX, rootY, endX, endY, w, far = false, curl = 0) {
  const col = far ? P.deep : P.lavender;
  const dx = endX - rootX, dy = endY - rootY;
  const p1x = rootX + dx * 0.33 + curl * 12, p1y = rootY + dy * 0.33;
  const p2x = rootX + dx * 0.66 - curl * 8, p2y = rootY + dy * 0.66;

  c.beginPath();
  c.moveTo(rootX - w, rootY);
  c.quadraticCurveTo(p1x - w * 0.8, p1y, p2x - w * 0.6, p2y);
  c.quadraticCurveTo(endX - w * 0.25, endY, endX, endY);
  c.quadraticCurveTo(endX + w * 0.25, endY, p2x + w * 0.6, p2y);
  c.quadraticCurveTo(p1x + w * 0.8, p1y, rootX + w, rootY);
  c.closePath();
  c.fillStyle = col;
  c.fill();
  c.strokeStyle = P.ink;
  c.lineWidth = 1.15;
  c.stroke();

  // Núcleo de plasma eléctrico interior
  line(c, far ? P.shadow : P.light, 0.9, () => {
    c.moveTo(rootX, rootY + 1);
    c.bezierCurveTo(p1x, p1y, p2x, p2y, endX, endY);
  });

  // Fotóforos bioluminiscentes a lo largo del zarcillo
  for (let k = 1; k <= 3; k++) {
    const u = k / 4;
    const nx = (1 - u) * (1 - u) * rootX + 2 * (1 - u) * u * p1x + u * u * endX;
    const ny = (1 - u) * (1 - u) * rootY + 2 * (1 - u) * u * p1y + u * u * endY;
    oval(c, nx, ny, Math.max(0.7, w * 0.32 * (1 - u * 0.3)), Math.max(0.7, w * 0.32 * (1 - u * 0.3)), P.gold);
  }
  oval(c, endX, endY, Math.max(1, w * 0.55), Math.max(1, w * 0.55), P.goldLight);
}

// Cabeza y campana frontal del Hidrozoo Cósmico
function hydroHead(c, r) {
  c.save();
  c.translate(14 + r.headX * 0.7, -42 + r.headY);
  c.rotate(r.headTilt);

  // Manto superior de la campana
  path(c, P.ivory, () => {
    c.moveTo(-24, 2);
    c.bezierCurveTo(-28, -20, -14, -36, 4, -34);
    c.bezierCurveTo(22, -34, 32, -18, 28, 4);
    c.quadraticCurveTo(24, 14, 12, 16);
    c.quadraticCurveTo(0, 18, -12, 16);
    c.quadraticCurveTo(-20, 14, -24, 2);
  }, 1.45);

  // Mesoglea interna translúcida
  path(c, P.shadow, () => {
    c.moveTo(-22, 6);
    c.bezierCurveTo(-12, 16, 12, 16, 22, 6);
    c.quadraticCurveTo(12, 18, 0, 18);
    c.quadraticCurveTo(-12, 18, -22, 6);
  }, 0);

  // Canales radiales luminosos
  for (const k of [-2, -1, 1, 2]) {
    line(c, P.light, 0.8, () => {
      c.moveTo(k * 4, -30);
      c.quadraticCurveTo(k * 10, -10, k * 12, 8);
    });
  }

  // Ojos estelares
  drawMichiEye(c, -8, -6, 7.8, {
    closed: r.blink,
    happy: r.smile,
    look: { x: r.look, y: 0 }
  });
  drawMichiEye(c, 12, -6, 8.2, {
    closed: r.blink,
    happy: r.smile,
    look: { x: r.look, y: 0 }
  });

  // Mejillas luminosas
  oval(c, -15, 6, 3.8, 1.8, P.rose);
  oval(c, 18, 6, 3.8, 1.8, P.rose);

  // Cavidad abisal / boca de plasma estelar en ataque
  const openK = Math.max(r.attack, r.charge * (r.power === 5 ? 0.8 : 0.3));
  if (openK > 0.08) {
    // Fondo abisal (debe contener #2a0f2e)
    path(c, P.abyss, () => {
      c.moveTo(-6, 8);
      c.quadraticCurveTo(2, 6, 10, 8);
      c.quadraticCurveTo(8, 18 + openK * 8, 2, 20 + openK * 8);
      c.quadraticCurveTo(-4, 18 + openK * 8, -6, 8);
    }, 1.1);
    // Lengua / llama de plasma estelar (debe contener #ff7fae)
    path(c, P.plasma, () => {
      c.moveTo(-2, 14);
      c.quadraticCurveTo(2, 10, 6, 14);
      c.quadraticCurveTo(4, 19 + openK * 6, 2, 19 + openK * 6);
      c.quadraticCurveTo(0, 19 + openK * 6, -2, 14);
    }, 0);
    oval(c, 2, 16 + openK * 3, 2.5, 1.5, P.goldLight);
  } else {
    line(c, P.ink, 1.1, () => {
      c.moveTo(-1, 9);
      c.quadraticCurveTo(2, 11, 5, 9);
    });
  }

  // Corona de filamentos sensitivos estelares superiores
  for (const side of [-1, 1]) {
    const bend = Math.sin((r.t || 0) * 0.08 + side) * 2;
    line(c, P.deep, 1.1, () => {
      c.moveTo(side * 8, -32);
      c.bezierCurveTo(side * 12, -44, side * 22, -46 + bend, side * 24, -50 + bend);
    });
    oval(c, side * 24, -50 + bend, 2, 2, P.gold);
  }

  // Cuerno / zarcillo de luz axial
  path(c, P.goldLight, () => {
    c.moveTo(-3, -31);
    c.quadraticCurveTo(-3, -44, 1, -54);
    c.quadraticCurveTo(5, -44, 4, -31);
  }, 0.9);
  line(c, '#ffffff', 0.9, () => {
    c.moveTo(1, -33);
    c.lineTo(1, -52);
  });
  crescent(c, 1, -22, 3.2, P.gold);

  c.restore();
}

function magic(c, r) {
  if (r.dead || r.reduced) return;
  if (r.mantle) {
    c.save();
    c.globalAlpha = 0.35 * r.mantle;
    path(c, '#b8dff3', () => {
      c.moveTo(-26, -37);
      c.bezierCurveTo(-72, -54, -64, -11, -23, -17);
      c.quadraticCurveTo(-45, -27, -26, -37);
    }, 0);
    c.restore();
  }
  if (r.charge > 0.06 && r.power !== 5) {
    c.save();
    c.globalAlpha = r.charge * 0.7;
    const x = r.power === 1 ? 2 : r.power === 3 ? 43 : 37;
    const y = r.power === 4 ? -55 : -31;
    crescent(c, x, y, 5 + r.charge * 3, r.power === 1 ? P.lavender : P.goldLight);
    for (let i = 0; i < 3; i++) {
      const a = i * TAU / 3 - r.charge * 0.7;
      oval(c, x + Math.cos(a) * 13, y + Math.sin(a) * 10, 1.2, 1.5, P.light, a, 0);
    }
    c.restore();
  }
  if (r.attack > 0.1) {
    c.save();
    c.globalAlpha = r.attack * 0.75;
    line(c, P.goldLight, 2, () => {
      c.moveTo(42, -43);
      c.quadraticCurveTo(63, -35, 51, -16);
    });
    line(c, P.plasma, 1.2, () => {
      c.moveTo(38, -39);
      c.quadraticCurveTo(56, -32, 47, -18);
    });
    c.restore();
  }
}

export function drawMoonHare(c, pose = {}) {
  const r = moonHarePose(pose);
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.translate(r.bodyX, r.bodyY);
  c.rotate(r.lean);
  if (r.dead) c.translate(-4, -18);

  magic(c, { ...r, charge: 0, attack: 0 });

  // 1. Velo dorsal / aleta ondulante hidroacústica
  const lag = r.reduced ? 0 : Math.sin((r.t || 0) * 0.075) * 3;
  path(c, P.shadow, () => {
    c.moveTo(-22, -35);
    c.bezierCurveTo(-46, -46 + lag, -52, -22 + lag, -28, -16);
    c.quadraticCurveTo(-38, -25, -22, -35);
  }, 1.2);
  line(c, P.light, 0.9, () => {
    c.moveTo(-24, -33);
    c.quadraticCurveTo(-42, -36 + lag, -32, -18);
  });

  // 2. Zarcillos posteriores (far tentacles)
  const rearRoot1 = { x: -24, y: -22 };
  const rearRoot2 = { x: -14, y: -24 };
  drawHydroTentacle(c, rearRoot1.x, rearRoot1.y, r.backX - 8 + r.farOffset, r.backY + 6, 3.8, true, -0.3);
  drawHydroTentacle(c, rearRoot2.x, rearRoot2.y, r.backX + 6 + r.farOffset, r.backY + 4, 3.5, true, 0.2);

  // 3. Campana torácica / umbrela central del hidrozoo
  path(c, P.ivory, () => {
    c.moveTo(-35, -24);
    c.bezierCurveTo(-43, -44, -23, r.sit ? -68 : -56, -4, -48);
    c.quadraticCurveTo(7, -45 + r.chest, 13, -51 + r.chest);
    c.quadraticCurveTo(24, -53, 25, -39);
    c.bezierCurveTo(30, -27, 27, -15, 16, -12);
    c.bezierCurveTo(1, -6, -27, -6, -35, -24);
  }, 1.35);

  path(c, '#e5d4e8', () => {
    c.moveTo(-35, -23);
    c.bezierCurveTo(-24, -13, -2, -12, 17, -20);
    c.quadraticCurveTo(25, -25, 26, -32);
    c.quadraticCurveTo(30, -16, 14, -11);
    c.bezierCurveTo(-5, -5, -28, -10, -35, -23);
  }, 0);

  path(c, P.light, () => {
    c.moveTo(-32, -36);
    c.bezierCurveTo(-28, -49, -12, -51, -3, -45);
    c.quadraticCurveTo(-18, -46, -28, -31, -32, -36);
  }, 0);

  // Marcas de bioluminiscencia y fotóforos
  crescent(c, -18, -35, 4.4, '#b59bcf');
  for (const [x, y, radius] of [[-28, -32, 1.3], [-8, -39, 1.3], [-4, -34, 0.9]]) {
    oval(c, x, y, radius, radius, '#dfbe89', 0, 0);
  }
  for (let i = 0; i < 3; i++) {
    line(c, i % 2 ? P.light : '#dac7e3', 0.85, () => {
      const wlag = r.reduced ? 0 : Math.sin((r.t || 0) * 0.055 - i * 0.6) * 0.8;
      c.moveTo(-29 + i * 5, -40 - i % 2);
      c.quadraticCurveTo(-20 + i * 5, -47 + wlag, -12 + i * 4, -44 + wlag);
    });
  }

  // 4. Zarcillos medios
  const midRoot = { x: -8, y: -16 };
  drawHydroTentacle(c, midRoot.x, midRoot.y, r.backX + 2, r.backY + 2, 4.2, false, -0.15);

  // Velo oral ondulante del cuello
  path(c, P.light, () => {
    c.moveTo(8, -46 + r.chest);
    c.quadraticCurveTo(19, -52, 26, -40);
    c.quadraticCurveTo(29, -32, 24, -26);
    c.lineTo(24, -22);
    c.lineTo(20, -25);
    c.quadraticCurveTo(18, -19, 16, -20);
    c.lineTo(15, -24);
    c.lineTo(11, -22);
    c.quadraticCurveTo(8, -29, 8, -46 + r.chest);
  }, 0.85);

  line(c, '#e5d3e2', 0.75, () => {
    c.moveTo(16, -39);
    c.quadraticCurveTo(13, -32, 16, -27);
  });

  // 5. Zarcillos frontales primordiales (lead tentacles)
  const frontRoot1 = { x: 12, y: -24 };
  const frontRoot2 = { x: 22, y: -28 };
  drawHydroTentacle(c, frontRoot1.x, frontRoot1.y, r.frontX - 4, r.frontY - r.pawLift + 2, 4.5, false, 0.35);
  drawHydroTentacle(c, frontRoot2.x, frontRoot2.y, r.frontX + 8, r.frontY - r.pawLift - 3, 4.2, false, 0.45);

  // 6. Cabeza y campana frontal con ojos y cavidad bucal
  hydroHead(c, r);
  magic(c, { ...r, mantle: 0 });

  c.restore();
}
