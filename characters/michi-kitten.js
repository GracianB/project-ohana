import {drawMichiEye} from './michi-eyes.js';
// Plánula Luminosa (Form 0)
// Larva bioluminiscente de medusa: gota oblonga translúcida con cilios vibrátiles,
// núcleo estelar palpitante, pseudópodos cortos y motas de luz interna.
// Cero anatomía felina. Geometría ultra articulada (>100 ops).
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

// Pseudópodo corto y translúcido de la plánula (brazo larval primitivo)
function babyTentacle(c, rootX, rootY, endX, endY, w, far = false, curl = 0) {
  const col = far ? P.shade : P.coat;
  const dx = endX - rootX, dy = endY - rootY;
  const mx = rootX + dx * 0.5 + curl * 4, my = rootY + dy * 0.5;

  // Pseudópodo como lóbulo corto y redondeado
  c.beginPath();
  c.moveTo(rootX - w, rootY);
  c.quadraticCurveTo(mx - w * 0.7, my, endX - w * 0.4, endY);
  c.quadraticCurveTo(endX, endY + w * 0.6, endX + w * 0.4, endY);
  c.quadraticCurveTo(mx + w * 0.7, my, rootX + w, rootY);
  c.closePath();
  c.fillStyle = col;
  c.fill();
  c.strokeStyle = P.ink;
  c.lineWidth = 1.05;
  c.stroke();

  // Nervio central bioluminiscente
  line(c, far ? P.deep : P.light, 0.85, () => {
    c.moveTo(rootX, rootY + 1);
    c.quadraticCurveTo(mx, my, endX, endY);
  });

  // Punta luminosa
  oval(c, endX, endY, Math.max(0.8, w * 0.45), Math.max(0.8, w * 0.45), P.gold);
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

  const bw = Math.max(12, 20 * (1 + bellSquash)), bh = Math.max(16, 30 * (1 + bellStretch));
  const rimY = -12 + r.headY;

  // 1. Halo bioluminiscente de la plánula (3 capas suaves, oblongas)
  for (const [k, a] of [[1.35, 0.06], [1.18, 0.09], [1.05, 0.13]]) {
    c.save();
    c.globalAlpha = a;
    oval(c, 0, rimY - bh * 0.45, bw * k, bh * k * 0.75, P.glow);
    c.restore();
  }

  // 2. Pseudópodos posteriores (cortos, larvales)
  const hindX = -8 + (run ? -step * 4 : 0) - follow * 3;
  const hindY = rimY + 6 + (air ? 3 : Math.sin(t * 0.08) * 1.5);
  babyTentacle(c, -8, rimY, hindX - 2, hindY + 2, 2.2, true, -0.15);
  babyTentacle(c, 8, rimY, 8 + (run ? -step * 3 : 0), hindY + 1, 2.2, true, 0.15);

  // 3. Cuerpo de la Plánula — gota oblonga translúcida (NO campana/dome)
  shape(c, P.coat, () => {
    c.moveTo(-bw * 0.6, rimY + 2);
    // Lado izquierdo: curva suave hacia arriba
    c.bezierCurveTo(-bw * 1.05, rimY - bh * 0.3, -bw * 0.8, rimY - bh * 0.9, -bw * 0.3, rimY - bh * 1.1);
    // Punta superior redondeada (no puntiaguda)
    c.bezierCurveTo(-bw * 0.1, rimY - bh * 1.2, bw * 0.1, rimY - bh * 1.2, bw * 0.3, rimY - bh * 1.1);
    // Lado derecho: curva simétrica hacia abajo
    c.bezierCurveTo(bw * 0.8, rimY - bh * 0.9, bw * 1.05, rimY - bh * 0.3, bw * 0.6, rimY + 2);
    // Base inferior: redondeada (la plánula es ovalada por abajo)
    c.bezierCurveTo(bw * 0.4, rimY + bh * 0.18, -bw * 0.4, rimY + bh * 0.18, -bw * 0.6, rimY + 2);
  }, 1.3);

  // 4. Cilios vibrátiles alrededor del perímetro (24 pelitos cortos oscilantes)
  for (let k = 0; k < 24; k++) {
    const angle = (k / 24) * TAU - Math.PI * 0.5;
    const cx0 = Math.cos(angle) * bw * 0.72;
    const cy0 = rimY - bh * 0.45 + Math.sin(angle) * bh * 0.65;
    const wave = reduced ? 0 : Math.sin(t * 0.18 + k * 0.6) * 2.5;
    const cLen = 5 + (run ? 2 : 0) + (k % 3 === 0 ? 1.5 : 0);
    const tipX = cx0 + Math.cos(angle) * cLen + wave * Math.sin(angle);
    const tipY = cy0 + Math.sin(angle) * cLen + wave * Math.cos(angle);
    line(c, k % 3 === 0 ? P.gold : P.light, 0.7, () => {
      c.moveTo(cx0, cy0);
      c.lineTo(tipX, tipY);
    });
  }

  // 5. Sombra interna de volumen (mesoglea larval)
  shape(c, P.shade, () => {
    c.moveTo(-bw * 0.5, rimY - 1);
    c.bezierCurveTo(-bw * 0.3, rimY + 3, bw * 0.3, rimY + 3, bw * 0.5, rimY - 1);
    c.quadraticCurveTo(bw * 0.2, rimY + bh * 0.1, 0, rimY + bh * 0.1);
    c.quadraticCurveTo(-bw * 0.2, rimY + bh * 0.1, -bw * 0.5, rimY - 1);
  }, 0);

  // 6. Redes nerviosas internas (en vez de canales radiales, nervios ramificados de la larva)
  for (const k of [-2, -1, 1, 2]) {
    line(c, '#ffffff', 0.7, () => {
      c.moveTo(0, rimY - bh * 0.95);
      c.quadraticCurveTo(k * bw * 0.18, rimY - bh * 0.4, k * bw * 0.25, rimY - 2);
    });
    // Ramificación
    line(c, P.light, 0.5, () => {
      c.moveTo(k * bw * 0.15, rimY - bh * 0.5);
      c.lineTo(k * bw * 0.35, rimY - bh * 0.35);
    });
  }

  // 7. Núcleo estelar palpitante (corazón de la plánula)
  const coreSize = 1 + pulse * 0.15;
  oval(c, 0, rimY - bh * 0.55, bw * 0.4 * coreSize, bh * 0.3 * coreSize, P.core);
  oval(c, 0, rimY - bh * 0.55, bw * 0.22 * coreSize, bh * 0.18 * coreSize, '#ffffff');

  // Cuatro vesículas internas (proto-gónadas)
  for (let k = 0; k < 4; k++) {
    const ga = k * Math.PI * 0.5 + (reduced ? 0 : t * 0.02);
    const gx = Math.cos(ga) * bw * 0.18;
    const gy = rimY - bh * 0.55 + Math.sin(ga) * bh * 0.14;
    oval(c, gx, gy, 1.8, 1.8, P.rose);
  }

  // 8. Motas bioluminiscentes flotando dentro del cuerpo (plancton interior)
  for (let k = 0; k < 7; k++) {
    const mx = Math.sin(k * 2.3 + (reduced ? 0 : t * 0.015)) * bw * 0.45;
    const my = rimY - bh * 0.9 + (k / 7) * bh * 0.7;
    const mAlpha = 0.5 + Math.sin(k * 1.7 + (reduced ? 0 : t * 0.04)) * 0.3;
    c.save();
    c.globalAlpha = mAlpha;
    oval(c, mx, my, 1.1, 1.1, k % 2 ? P.gold : P.glow);
    c.restore();
    // Destello en cruz en algunas motas
    if (k % 3 === 0) {
      line(c, '#ffffff', 0.4, () => {
        c.moveTo(mx - 1.5, my); c.lineTo(mx + 1.5, my);
        c.moveTo(mx, my - 1.5); c.lineTo(mx, my + 1.5);
      });
    }
  }

  // 9. Reflejo especular satinado en la parte superior
  shape(c, '#fff8fd', () => {
    c.moveTo(-bw * 0.45, rimY - bh * 0.75);
    c.bezierCurveTo(-bw * 0.3, rimY - bh * 1.05, bw * 0.1, rimY - bh * 1.1, bw * 0.35, rimY - bh * 0.8);
    c.quadraticCurveTo(0, rimY - bh * 0.95, -bw * 0.3, rimY - bh * 0.7);
    c.closePath();
  }, 0);

  // 10. Marca de nacimiento: media luna dorada en la cúspide
  shape(c, P.gold, () => {
    c.moveTo(1.5, rimY - bh * 1.05);
    c.bezierCurveTo(-4, rimY - bh * 1.1, -4, rimY - bh * 0.9, 1.5, rimY - bh * 0.92);
    c.bezierCurveTo(-2, rimY - bh * 0.94, -2, rimY - bh * 1.03, 1.5, rimY - bh * 1.05);
  }, 0);

  // 11. Pseudópodos frontales articulados (cortos, larvales)
  let foreEnd1 = {
    x: 8 + reach * 14 + (run ? -step * 4 : 0),
    y: rimY + 8 + (air ? 2 : 0) + (victory ? -6 : 0)
  };
  let foreEnd2 = {
    x: -3 + (run ? -step * 5 : 0),
    y: rimY + 10 + (air ? 2 : 0)
  };

  if (state === 'wall') {
    foreEnd1 = { x: 14, y: rimY - 4 };
    foreEnd2 = { x: 6, y: rimY };
  } else if (state === 'glide') {
    foreEnd1 = { x: 12, y: rimY + 5 };
    foreEnd2 = { x: -6, y: rimY + 7 };
  } else if (hurt) {
    foreEnd1 = { x: 5, y: rimY + 3 };
    foreEnd2 = { x: -3, y: rimY + 5 };
  }

  // Poses mágicas para los pseudópodos
  if (spell) {
    const powerTargets = [
      [18, rimY + 3],   // Yarn (luz frontal)
      [5, rimY + 1],    // Purr (recogido sereno)
      [14, rimY - 10],  // Ninetails (alzado)
      [20, rimY + 8],   // Látigo estelar
      [11, rimY - 7],   // Velo ascendente
      [16, rimY - 3]    // Estrella doble
    ];
    const tgt = powerTargets[power] || [12, rimY + 4];
    foreEnd1 = {
      x: foreEnd1.x + (tgt[0] - foreEnd1.x) * spell,
      y: foreEnd1.y + (tgt[1] - foreEnd1.y) * spell
    };
  }

  babyTentacle(c, -4, rimY + 1, foreEnd2.x, foreEnd2.y, 2.6, false, -0.1);
  babyTentacle(c, 5, rimY + 1, foreEnd1.x, foreEnd1.y, 2.6, false, 0.2);

  // 12. Destello / perla mágica de ataque o conjuro
  if (reach > 0.1 || spell > 0.1) {
    c.save();
    c.globalAlpha = Math.max(reach, spell) * 0.85;
    oval(c, foreEnd1.x + 2, foreEnd1.y, 2.5, 2.5, P.gold);
    line(c, '#ffffff', 1.2, () => {
      c.moveTo(foreEnd1.x + 2, foreEnd1.y - 4);
      c.lineTo(foreEnd1.x + 2, foreEnd1.y + 4);
      c.moveTo(foreEnd1.x - 2, foreEnd1.y);
      c.lineTo(foreEnd1.x + 6, foreEnd1.y);
    });
    c.restore();
  }

  // 13. Rostro expresivo frontal (ojos de larva)
  babyFace(c, r);

  c.restore();
}
