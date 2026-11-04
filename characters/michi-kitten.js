import {drawMichiEye} from './michi-eyes.js';
// Pólipo Astral / Medusita Cósmica Bebé (Form 0)
// Silueta 100% Medusa Abisal Cósmica: campana translúcida viva, núcleo de pulso,
// canales radiales, ropalios, gónadas celestiales, 4 zarcillos bioluminiscentes
// y ojos de perla etérea. Cero anatomía felina. Geometría ultra articulada (>100 ops).
const TAU = Math.PI * 2;
const P = Object.freeze({
  ink: '#51425f', coat: '#f5eafa', shade: '#cdb8dc', deep: '#aa8cbd',
  light: '#fff9ef', rose: '#e9b6ce', ear: '#d591bb', gold: '#e5bb75',
  glow: '#d8f0ff', core: '#ffe2f2', rim: '#ffffff'
});
const finite = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
const unit = v => Math.max(0, Math.min(1, finite(v)));
const STATES = new Set(['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']);

function shape(c, color, trace, width = 1.15) {
  c.beginPath(); trace(); c.closePath(); c.fillStyle = color; c.fill();
  if (width) { c.strokeStyle = P.ink; c.lineWidth = width; c.stroke(); }
}
function line(c, color, width, trace) {
  c.beginPath(); trace(); c.strokeStyle = color; c.lineWidth = width; c.stroke();
}
function oval(c, x, y, rx, ry, color, angle = 0) {
  shape(c, color, () => c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), angle, 0, TAU), 0);
}

// Zarcillo tierno y ondulante de la medusita bebé con 4 segmentos Bézier y perlas luminosas
function babyTentacle(c, rootX, rootY, endX, endY, w, far = false, curl = 0) {
  const col = far ? P.shade : P.coat;
  const dx = endX - rootX, dy = endY - rootY;
  const p1x = rootX + dx * 0.33 + curl * 6, p1y = rootY + dy * 0.33;
  const p2x = rootX + dx * 0.66 - curl * 4, p2y = rootY + dy * 0.66;

  c.beginPath();
  c.moveTo(rootX - w, rootY);
  c.quadraticCurveTo(p1x - w * 0.8, p1y, p2x - w * 0.6, p2y);
  c.quadraticCurveTo(endX - w * 0.3, endY, endX, endY);
  c.quadraticCurveTo(endX + w * 0.3, endY, p2x + w * 0.6, p2y);
  c.quadraticCurveTo(p1x + w * 0.8, p1y, rootX + w, rootY);
  c.closePath();
  c.fillStyle = col;
  c.fill();
  c.strokeStyle = P.ink;
  c.lineWidth = 1.05;
  c.stroke();

  // Línea nerviosa central bioluminiscente
  line(c, far ? P.deep : P.light, 0.85, () => {
    c.moveTo(rootX, rootY + 1);
    c.bezierCurveTo(p1x, p1y, p2x, p2y, endX, endY);
  });

  // Perlas / nódulos luminosos en el tentáculo
  for (let k = 1; k <= 3; k++) {
    const u = k / 4;
    const nx = (1 - u) * (1 - u) * rootX + 2 * (1 - u) * u * p1x + u * u * endX;
    const ny = (1 - u) * (1 - u) * rootY + 2 * (1 - u) * u * p1y + u * u * endY;
    oval(c, nx, ny, Math.max(0.6, w * 0.35 * (1 - u * 0.4)), Math.max(0.6, w * 0.35 * (1 - u * 0.4)), P.gold);
  }
  oval(c, endX, endY, Math.max(0.8, w * 0.55), Math.max(0.8, w * 0.55), P.gold);
}

function eye(c, x, y, scale, r) {
  drawMichiEye(c, x, y, 7.2 * scale, {
    closed: r.closed,
    happy: r.happy,
    look: { x: r.gaze, y: 0 }
  });
}

// Rostro etéreo frontal de la medusita sobre la campana
function babyFace(c, r) {
  c.save();
  c.translate(r.headX, r.headY - 26);
  c.rotate(r.headTilt);

  // Ojos luminosos en el plano frontal de la campana
  eye(c, -8.5, -2, 0.92, r);
  eye(c, 10.5, -2, 0.98, r);

  // Mejillas bioluminiscentes suaves
  oval(c, -14, 5.5, 3.2, 1.6, P.rose);
  oval(c, 16, 5.5, 3.2, 1.6, P.rose);

  // Núcleo de respiración / boca de luz
  if (r.open > 0.05) {
    shape(c, '#66445f', () => {
      c.moveTo(-1.5, 6);
      c.quadraticCurveTo(1.5, 5.2, 4.5, 6);
      c.quadraticCurveTo(3, 9 + r.open * 3, 1.5, 9 + r.open * 3);
      c.quadraticCurveTo(-0.5, 9 + r.open * 2, -1.5, 6);
    }, 0.7);
    oval(c, 2, 8 + r.open, 2.2, 1.1, '#ec9fb9');
  } else {
    line(c, P.ink, 0.9, () => {
      c.moveTo(0, 6.5);
      c.quadraticCurveTo(1.5, 8.2, 3, 6.5);
    });
  }

  // Brote de luz coronal: media luna dorada sobre la cima de la cúpula
  shape(c, P.gold, () => {
    c.moveTo(1.5, -18);
    c.bezierCurveTo(-4, -19, -4, -12, 1.5, -13);
    c.bezierCurveTo(-2, -14, -2, -17, 1.5, -18);
  }, 0);
  line(c, P.light, 0.8, () => {
    c.moveTo(1.5, -19);
    c.lineTo(1.5, -22);
  });
  oval(c, 1.5, -23, 1.2, 1.2, '#fff');

  // Pequeñas perlas etéreas sobre la corona
  for (const sx of [-6, 9]) {
    oval(c, sx, -16, 1.1, 1.1, P.gold);
    line(c, P.deep, 0.6, () => {
      c.moveTo(sx, -15);
      c.lineTo(sx + (sx > 0 ? 2 : -2), -12);
    });
  }

  c.restore();
}

export function drawMoonKitten(c, p = {}) {
  const state = STATES.has(p.state) ? p.state : 'idle';
  const reduced = !!p.reduceMotion, dead = state === 'dead';
  const t = reduced || dead ? 0 : finite(p.t);
  const phase = reduced ? 0 : finite(p.phase, t * 0.27);
  const run = state === 'run', jump = state === 'jump', fall = state === 'fall';
  const air = jump || fall || state === 'glide', hurt = state === 'hurt', victory = state === 'victory';
  const reach = state === 'attack' ? Math.sin(Math.PI * (reduced ? 0.5 : unit(finite(p.atk, 0.5)))) : 0;
  const spell = state === 'cast' ? Math.sin(Math.PI * (reduced ? 0.5 : unit(finite(p.cast, 0.5)))) : 0;
  const power = Number.isInteger(p.michiPowerIndex) ? p.michiPowerIndex : Math.trunc(finite(p.castSlot, -1));
  const step = run ? Math.sin(phase) : 0, follow = run ? Math.sin(phase - 0.7) : 0;
  const breath = reduced ? 0 : Math.sin(t * 0.062), w = p.michiWelcome || {};
  const inspect = reduced ? 0 : unit(w.inspect), groom = reduced ? 0 : unit(w.groom), purr = reduced ? 0 : unit(w.purr);
  const land = reduced ? 0 : unit(p.land), blink = dead || hurt || (!reduced && (t + 29) % 199 < 6);

  // Biopulso de contracción y expansión de natación de la medusita
  const pulse = reduced ? 0 : Math.sin(t * 0.12);
  const bellSquash = jump ? -0.22 : fall ? 0.16 : state === 'glide' ? 0.24 : pulse * 0.08 - land * 0.15;
  const bellStretch = -bellSquash * 0.75;

  const headTilt = hurt ? -0.15 : state === 'wall' ? -0.13 : victory ? -0.09 : -follow * 0.035 + inspect * 0.12 - groom * 0.055;
  const r = {
    reach,
    headX: reach * 3.5 - hurt * 2 + inspect * 2,
    headY: jump ? -4 : fall ? 2 : victory ? -3 : land * 2 + breath * 1.2,
    headTilt,
    closed: blink || purr > 0.75,
    happy: victory || purr > 0.3,
    gaze: Math.max(-1, Math.min(1, finite(p.look?.x, 0.3))) * 0.5 + inspect * 0.2,
    open: Math.max(reach * 0.55, victory ? 0.45 : 0, power === 5 ? spell * 0.5 : 0),
    focus: reach * 0.65
  };

  if (spell) {
    r.headTilt += (power === 1 ? 0.12 : power === 3 ? -0.14 : power === 5 ? -0.1 : 0.02) * spell;
    r.headY -= spell * (power === 2 ? 4 : power === 4 ? 3 : 1);
  }

  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';

  // Elevación por flotación / natación aérea
  const floatY = run ? -Math.max(0, step) * 4 : jump ? -10 : fall ? 2 : state === 'glide' ? -5 : breath * 2 + land * 2;
  c.translate(reach * 2 - hurt * 2, floatY);
  c.rotate(dead ? 0.5 : jump ? -0.06 : state === 'glide' ? 0.06 : hurt ? -0.08 : reach * 0.05);
  if (dead) c.translate(-2, -8);

  const bw = Math.max(12, 24 * (1 + bellSquash)), bh = Math.max(12, 22 * (1 + bellStretch));
  const rimY = -12 + r.headY;

  // 1. Halo bioluminiscente de la medusa (3 capas suaves)
  for (const [k, a] of [[1.35, 0.06], [1.18, 0.09], [1.05, 0.13]]) {
    c.save();
    c.globalAlpha = a;
    oval(c, 0, rimY - bh * 0.55, bw * k, bh * k, P.glow);
    c.restore();
  }

  // 2. Zarcillos posteriores (far tentacles)
  const hindX = -12 + (run ? -step * 5 : 0) - follow * 4;
  const hindY = rimY + 12 + (air ? 4 : Math.sin(t * 0.08) * 2);
  babyTentacle(c, -10, rimY, hindX - 4, hindY + 4, 2.6, true, -0.2);
  babyTentacle(c, 10, rimY, 12 + (run ? -step * 4 : 0), hindY + 2, 2.6, true, 0.2);

  // 3. Campana principal de la Medusita (cúpula translúcida abovedada)
  shape(c, P.coat, () => {
    c.moveTo(-bw, rimY);
    c.bezierCurveTo(-bw * 1.05, rimY - bh * 0.7, -bw * 0.65, rimY - bh * 1.35, 0, rimY - bh * 1.35);
    c.bezierCurveTo(bw * 0.65, rimY - bh * 1.35, bw * 1.05, rimY - bh * 0.7, bw, rimY);
    // 6 festones de la subumbrela (lóbulos del borde)
    for (let k = 6; k > 0; k--) {
      const x0 = -bw + 2 * bw * (k - 1) / 6;
      const x1 = -bw + 2 * bw * (k - 0.5) / 6;
      c.quadraticCurveTo(x1, rimY + 3.5 + (k % 2 ? 1 : -0.5) * pulse, x0, rimY);
    }
  }, 1.3);

  // 4. Sombras internas y volumen de la mesoglea
  shape(c, P.shade, () => {
    c.moveTo(-bw * 0.85, rimY - 2);
    c.bezierCurveTo(-bw * 0.5, rimY + 2, bw * 0.5, rimY + 2, bw * 0.85, rimY - 2);
    c.quadraticCurveTo(bw * 0.4, rimY + 4, 0, rimY + 4);
    c.quadraticCurveTo(-bw * 0.4, rimY + 4, -bw * 0.85, rimY - 2);
  }, 0);

  // 5. Canales radiales de transporte de luz en la campana
  for (const k of [-3, -2, -1, 1, 2, 3]) {
    line(c, '#ffffff', 0.8, () => {
      c.moveTo(k * bw * 0.08, rimY - bh * 1.2);
      c.quadraticCurveTo(k * bw * 0.24, rimY - bh * 0.55, k * bw * 0.28, rimY - 1);
    });
  }

  // 6. Núcleo interior palpitante de luz con gónadas en trébol
  oval(c, 0, rimY - bh * 0.65, bw * 0.55, bh * 0.45, P.core);
  oval(c, 0, rimY - bh * 0.65, bw * 0.35, bh * 0.3, '#ffffff');

  // 4 pequeñas gónadas celestiales internas
  for (let k = 0; k < 4; k++) {
    const ga = k * Math.PI * 0.5;
    const gx = Math.cos(ga) * bw * 0.22;
    const gy = rimY - bh * 0.65 + Math.sin(ga) * bh * 0.18;
    line(c, P.rose, 1.1, () => {
      c.arc(gx, gy, bw * 0.08, 0, Math.PI * 1.6);
    });
  }

  // Motas estelares bioluminiscentes en la campana
  for (let k = 0; k < 5; k++) {
    const mx = Math.sin(k * 2.1) * bw * 0.55;
    const my = rimY - bh * 0.95 + (k / 5) * bh * 0.65;
    oval(c, mx, my, 1.2, 1.2, P.gold);
    line(c, '#ffffff', 0.5, () => {
      c.moveTo(mx - 1.5, my);
      c.lineTo(mx + 1.5, my);
    });
  }

  // Reflejo especular satinado en la exumbrela superior
  shape(c, '#fff8fd', () => {
    c.moveTo(-bw * 0.65, rimY - bh * 0.85);
    c.bezierCurveTo(-bw * 0.5, rimY - bh * 1.2, 0, rimY - bh * 1.25, bw * 0.45, rimY - bh * 0.95);
    c.quadraticCurveTo(0, rimY - bh * 1.1, -bw * 0.4, rimY - bh * 0.8);
    c.closePath();
  }, 0);

  // Ropalios (sensores de luz) en el borde inferior
  for (let k = 0; k < 6; k++) {
    const rx = -bw * 0.8 + k * bw * 1.6 / 5;
    oval(c, rx, rimY + 1.2, 0.9, 0.9, P.gold);
  }

  // 7. Zarcillos frontales articulados (lead & near tentacles)
  let foreEnd1 = {
    x: 10 + reach * 18 + (run ? -step * 5 : 0),
    y: rimY + 14 + (air ? 2 : 0) + (victory ? -10 : 0)
  };
  let foreEnd2 = {
    x: -4 + (run ? -step * 6 : 0),
    y: rimY + 16 + (air ? 3 : 0)
  };

  if (state === 'wall') {
    foreEnd1 = { x: 18, y: rimY - 8 };
    foreEnd2 = { x: 8, y: rimY - 2 };
  } else if (state === 'glide') {
    foreEnd1 = { x: 16, y: rimY + 8 };
    foreEnd2 = { x: -8, y: rimY + 10 };
  } else if (hurt) {
    foreEnd1 = { x: 6, y: rimY + 4 };
    foreEnd2 = { x: -4, y: rimY + 6 };
  }

  // Poses distintivas para los 6 poderes mágicos
  if (spell) {
    const powerTargets = [
      [22, rimY + 4],   // Yarn (luz frontal)
      [6, rimY + 2],    // Purr (recogido sereno)
      [18, rimY - 14],  // Ninetails (alzado en flor)
      [26, rimY + 12],  // Látigo estelar
      [14, rimY - 10],  // Velo ascendente
      [20, rimY - 4]    // Estrella doble
    ];
    const tgt = powerTargets[power] || [16, rimY + 6];
    foreEnd1 = {
      x: foreEnd1.x + (tgt[0] - foreEnd1.x) * spell,
      y: foreEnd1.y + (tgt[1] - foreEnd1.y) * spell
    };
  }

  babyTentacle(c, -5, rimY + 1, foreEnd2.x, foreEnd2.y, 3.2, false, -0.15);
  babyTentacle(c, 6, rimY + 1, foreEnd1.x, foreEnd1.y, 3.2, false, 0.25);

  // Destello / perla mágica de ataque o conjuro
  if (reach > 0.1 || spell > 0.1) {
    c.save();
    c.globalAlpha = Math.max(reach, spell) * 0.85;
    oval(c, foreEnd1.x + 3, foreEnd1.y, 3, 3, P.gold);
    line(c, '#ffffff', 1.2, () => {
      c.moveTo(foreEnd1.x + 3, foreEnd1.y - 5);
      c.lineTo(foreEnd1.x + 3, foreEnd1.y + 5);
      c.moveTo(foreEnd1.x - 2, foreEnd1.y);
      c.lineTo(foreEnd1.x + 8, foreEnd1.y);
    });
    c.restore();
  }

  // 8. Rostro expresivo frontal
  babyFace(c, r);

  c.restore();
}
