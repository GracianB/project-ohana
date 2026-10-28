// V616 — Observatorio Astral de Yomi: arte vectorial puro para 5 especies de fauna cuántica,
// terminales de sincronización con antenas holográficas de radio-faro y atmósfera de constelaciones infinitas.
const TAU = Math.PI * 2;

function _rr(c, x, y, w, h, r = 4) {
 if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

// ── 5 Especies de Fauna Astral del Observatorio ──────────────────────────────
export function drawYomiCreature(ctx, e, cam, t, reduced = false) {
 if (!e || (e.roomId !== 'w1-yomi' && !e._yomiEncounter && !e.roomPersona?.yomiEncounter)) return false;
 const kind = e.kind || e._species;
 if (!['ufo', 'phosquito', 'brasita', 'medusa', 'murcielago'].includes(kind)) return false;

 const x = e.x + e.w / 2 - cam.x, y = e.y + e.h - cam.y, facing = e.facing || 1;
 const hurt = e.invuln > 0 || e.stun > 4;
 const step = reduced ? 0 : Math.sin((t * 0.15) + (e.spawnIndex || 0) * 1.3);

 ctx.save();
 ctx.translate(x, y);
 ctx.scale(facing, 1);
 ctx.lineCap = 'round'; ctx.lineJoin = 'round';

 if (kind === 'ufo') {
  // ── Sonda de Curiosidad (flyer / gunner) ──
  // Dron de exploración astronómica con cúpula de nácar, ojo escáner menta y antena parabólica
  const hover = reduced ? 0 : Math.sin(t * 0.16 + (e.spawnIndex || 0)) * 6;
  ctx.translate(0, -22 + hover);

  // Anillo exterior de titanio blanco
  ctx.fillStyle = hurt ? '#ffffff' : '#e8eaf6';
  ctx.strokeStyle = '#3f51b5'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 10, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Luces de navegación en el borde del platillo (pulsan en secuencia binaria)
  const TINT = ['#4ff0c8', '#ff7f6e', '#ffd56b', '#80deea'];
  for (let i = 0; i < 4; i++) {
   const lx = -18 + i * 12;
   const pulse = Math.sin(t * 0.2 + i * 1.5) * 0.5 + 0.5;
   ctx.fillStyle = TINT[i];
   ctx.beginPath(); ctx.arc(lx, 2, 2 + pulse * 1.2, 0, TAU); ctx.fill();
  }

  // Cúpula central translúcida
  const domeGrad = ctx.createLinearGradient(0, -18, 0, 0);
  domeGrad.addColorStop(0, 'rgba(79, 240, 200, 0.9)');
  domeGrad.addColorStop(1, 'rgba(26, 35, 126, 0.8)');
  ctx.fillStyle = domeGrad;
  ctx.strokeStyle = '#4ff0c8'; ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -4, 12, Math.PI, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Ojo escáner central que busca respuestas
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, -5, 3.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0d1430';
  ctx.beginPath(); ctx.arc(facing > 0 ? 1 : -1, -5, 1.8, 0, TAU); ctx.fill();

  // Antena parabólica orientada hacia el cielo
  ctx.strokeStyle = '#7986cb'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -26); ctx.stroke();
  ctx.fillStyle = '#ffd56b';
  ctx.beginPath(); ctx.arc(0, -28, 3, 0, TAU); ctx.fill();

  // Haz de escaneo cónico hacia abajo
  if (!reduced) {
   ctx.fillStyle = 'rgba(79, 240, 200, 0.12)';
   ctx.beginPath();
   ctx.moveTo(-6, 8);
   ctx.lineTo(6, 8);
   ctx.lineTo(16, 28);
   ctx.lineTo(-16, 28);
   ctx.closePath(); ctx.fill();
  }

 } else if (kind === 'phosquito') {
  // ── Bit Libélula / Pulso de Código (flyer / fast) ──
  // Insecto astral de silicio con alas de diagrama de circuito y cola de fibra óptica
  const flap = reduced ? 0 : Math.sin(t * 0.35) * 14;
  ctx.translate(0, -20 + Math.sin(t * 0.12) * 5);

  // Cuerpo aerodinámico de cristal
  ctx.fillStyle = hurt ? '#ffffff' : '#0d1430';
  ctx.strokeStyle = '#4ff0c8'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 6, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Cola segmentada de fibra óptica que parpadea
  for (let s = 1; s <= 3; s++) {
   const col = s === 3 ? '#ff7f6e' : '#4ff0c8';
   ctx.fillStyle = col; ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 1.2;
   ctx.beginPath();
   ctx.ellipse(-14 - s * 7, 0, 4, 3, 0, 0, TAU);
   ctx.fill(); ctx.stroke();
  }

  // Alas de circuitos cuánticos transparentes
  for (let side of [-1, 1]) {
   ctx.save();
   ctx.scale(side, 1);
   ctx.strokeStyle = '#80deea'; ctx.lineWidth = 1.6;
   ctx.fillStyle = 'rgba(79, 240, 200, 0.25)';
   ctx.beginPath();
   ctx.moveTo(0, -3);
   ctx.quadraticCurveTo(16, -26 + flap, 28, -20 + flap);
   ctx.quadraticCurveTo(24, 0 + flap * 0.3, 8, -1);
   ctx.closePath(); ctx.fill(); ctx.stroke();
   // Pistas doradas en el ala
   ctx.strokeStyle = '#ffd56b'; ctx.lineWidth = 1;
   ctx.beginPath(); ctx.moveTo(4, -5); ctx.lineTo(16, -16 + flap); ctx.lineTo(24, -15 + flap); ctx.stroke();
   ctx.restore();
  }

  // Cabeza con visor de datos
  ctx.fillStyle = '#4ff0c8';
  ctx.beginPath(); ctx.arc(14, 0, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0d1430';
  ctx.beginPath(); ctx.arc(16, 0, 2, 0, TAU); ctx.fill();

 } else if (kind === 'brasita') {
  // ── Chispa Cuántica (floater / shooter) ──
  // Esfera de energía de código puro rodeada de runas orbitantes: {}, </>, λ
  const bob = reduced ? 0 : Math.sin(t * 0.15 + (e.spawnIndex || 0)) * 6;
  ctx.translate(0, -18 + bob);

  // Aura cuántica multicapa
  const qGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 24);
  qGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  qGlow.addColorStop(0.4, 'rgba(79, 240, 200, 0.65)');
  qGlow.addColorStop(0.8, 'rgba(63, 81, 181, 0.35)');
  qGlow.addColorStop(1, 'rgba(13, 20, 48, 0)');
  ctx.fillStyle = qGlow;
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.fill();

  // Núcleo diamante flotante
  ctx.fillStyle = hurt ? '#ffffff' : '#e0f7fa';
  ctx.strokeStyle = '#4ff0c8'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Runas de código orbitando
  const RUNES = ['{}', '</>', 'λ'];
  for (let r = 0; r < 3; r++) {
   const ang = (t * 0.08 + r * (TAU / 3));
   const rx = Math.cos(ang) * 19, ry = Math.sin(ang) * 9;
   ctx.fillStyle = '#ffd56b'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
   ctx.fillText(RUNES[r], rx, ry + 3);
  }

 } else if (kind === 'medusa') {
  // ── Medusa de Fibra Óptica (floater / flyer) ──
  // Campana de cristal añil con 10 filamentos de luz de los colores de la familia Ohana
  const floatY = reduced ? 0 : Math.sin(t * 0.14 + (e.spawnIndex || 0)) * 7;
  ctx.translate(0, -24 + floatY);

  // Sombrilla de cristal cuántico
  const jellyGrad = ctx.createRadialGradient(0, -6, 2, 0, -6, 20);
  jellyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  jellyGrad.addColorStop(0.5, 'rgba(129, 212, 250, 0.7)');
  jellyGrad.addColorStop(1, 'rgba(26, 35, 126, 0.85)');
  ctx.fillStyle = jellyGrad;
  ctx.strokeStyle = '#80deea'; ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.bezierCurveTo(-20, -22, 20, -22, 18, 0);
  ctx.quadraticCurveTo(9, 3, 0, 0);
  ctx.quadraticCurveTo(-9, 3, -18, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Diez estrellas familiares latiendo en el interior
  const FAM_COLS = ['#e8322a', '#2c4aa6', '#ffd56b', '#b397d0', '#76a68a', '#ff7043', '#81c784', '#ffb300', '#f4511e', '#4ff0c8'];
  for (let f = 0; f < 5; f++) {
   ctx.fillStyle = FAM_COLS[f * 2];
   ctx.beginPath(); ctx.arc(-12 + f * 6, -10 + (f % 2) * 3, 1.8, 0, TAU); ctx.fill();
  }

  // 10 filamentos de fibra óptica ondulantes
  for (let i = 0; i < 5; i++) {
   const fx = -12 + i * 6;
   const wave = reduced ? 0 : Math.sin(t * 0.18 + i) * 4;
   ctx.strokeStyle = FAM_COLS[i * 2 + 1]; ctx.lineWidth = 1.6;
   ctx.beginPath();
   ctx.moveTo(fx, 1);
   ctx.quadraticCurveTo(fx + wave, 12, fx - wave, 24);
   ctx.stroke();
   // Puntos terminales de datos
   ctx.fillStyle = '#ffffff';
   ctx.beginPath(); ctx.arc(fx - wave, 24, 1.3, 0, TAU); ctx.fill();
  }

 } else if (kind === 'murcielago') {
  // ── Centinela de Bits (pursuer / jumper) ──
  // Guardián alado con estructura de fibra de carbono y matriz de ojos binarios
  const beat = reduced ? 0 : Math.sin(t * 0.28) * 12;
  ctx.translate(0, -20);

  // Cuerpo angular de polímero negro
  ctx.fillStyle = hurt ? '#ffffff' : '#1a237e';
  ctx.strokeStyle = '#304ffe'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(10, 2);
  ctx.lineTo(0, 12);
  ctx.lineTo(-10, 2);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Alas poligonales con trazos de radar
  for (let side of [-1, 1]) {
   ctx.save(); ctx.scale(side, 1);
   ctx.fillStyle = '#283593'; ctx.strokeStyle = '#536dfe'; ctx.lineWidth = 1.8;
   ctx.beginPath();
   ctx.moveTo(6, -6);
   ctx.lineTo(24, -22 + beat);
   ctx.lineTo(34, -14 + beat);
   ctx.lineTo(22, 6 + beat * 0.3);
   ctx.lineTo(8, 2);
   ctx.closePath(); ctx.fill(); ctx.stroke();
   ctx.restore();
  }

  // Matriz de ojos binarios (parpadean en 0 y 1)
  ctx.fillStyle = '#4ff0c8';
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillText('0', -4, 2);
  ctx.fillText('1', 4, 2);
 }

 ctx.restore();
 return true;
}

// ── Terminal Astral Cuántico (Estación de Sincronización) ─────────────────────
export function drawYomiTerminalV616(ctx, g, s, cam, done, t = 0, reduced = false) {
 const x = s.x - cam.x, y = s.y - cam.y;
 const tick = g.world1?.tick || 0;
 const isLive = (g.world1?.yomiWindows?.[s.id] || 0) > tick || ((tick + (s.phase || 0)) % 180 + 180) % 180 < 55;
 const isWarn = !isLive && ((tick + (s.phase || 0)) % 180 + 180) % 180 >= 150;

 ctx.save();

 // ── Base de la torre de observación astronómica ──
 ctx.fillStyle = '#1a237e'; ctx.strokeStyle = '#3949ab'; ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.moveTo(x - 32, y);
 ctx.quadraticCurveTo(x - 14, y - 28, x - 18, y - 52);
 ctx.lineTo(x + 18, y - 52);
 ctx.quadraticCurveTo(x + 14, y - 28, x + 32, y);
 ctx.closePath(); ctx.fill(); ctx.stroke();

 // Anillos de sujeción cromados
 ctx.fillStyle = '#9fa8da';
 _rr(ctx, x - 22, y - 36, 44, 6, 2); ctx.fill();

 // ── Cúpula y Púlpito Holográfico ──
 ctx.fillStyle = '#0d1430'; ctx.strokeStyle = '#283593'; ctx.lineWidth = 2.5;
 _rr(ctx, x - 52, y - 124, 104, 72, 14); ctx.fill(); ctx.stroke();

 // Pantalla central translúcida con terminal
 const screenCol = done ? '#004d40' : isLive ? '#006064' : isWarn ? '#3e2723' : '#0a1026';
 const borderCol = done ? '#4ff0c8' : isLive ? '#00e5ff' : isWarn ? '#ffd54f' : '#3f51b5';
 ctx.fillStyle = screenCol; ctx.strokeStyle = borderCol; ctx.lineWidth = 2;
 _rr(ctx, x - 42, y - 114, 84, 52, 8); ctx.fill(); ctx.stroke();

 // Contenido en la pantalla del terminal
 if (done) {
  // Constelación de la familia completada
  ctx.fillStyle = '#4ff0c8'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('NODO COMPILADO', x, y - 92);
  ctx.fillStyle = '#ffd54f';
  ctx.fillText('✦ ✦ ✦ ✦ ✦', x, y - 76);
 } else if (isLive) {
  // Estado activo: AHORA
  const livePulse = reduced ? 0 : Math.sin(t * 0.25) * 3;
  ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillText('⚡ ¡AHORA! ⚡', x, y - 94 + livePulse);
  ctx.fillStyle = '#e0f7fa'; ctx.font = '9px monospace';
  ctx.fillText('PULSA J / ACÉRCATE', x, y - 76);

  // Ondas circulares cuánticas expansivas
  if (!reduced) {
   const waveR = (t * 0.08) % 1;
   ctx.strokeStyle = `rgba(79, 240, 200, ${0.8 * (1 - waveR)})`; ctx.lineWidth = 2;
   ctx.beginPath(); ctx.arc(x, y - 88, 30 + waveR * 40, 0, TAU); ctx.stroke();
  }
 } else if (isWarn) {
  // Advertencia de ventana próxima
  ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('SINCRONIZANDO...', x, y - 92);
  ctx.fillStyle = '#ffcc80'; ctx.font = '9px monospace';
  ctx.fillText('PREPARA EL PASO', x, y - 76);
 } else {
  // Espera / recarga de búfer
  ctx.fillStyle = '#7986cb'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('ESPERA...', x, y - 92);
  ctx.fillStyle = '#5c6bc0'; ctx.font = '9px monospace';
  ctx.fillText('ESCUDO K LISTO', x, y - 76);
 }

 // ── Mástil de Antena y Transmisor Radio-Faro ──
 ctx.strokeStyle = '#7986cb'; ctx.lineWidth = 3;
 ctx.beginPath(); ctx.moveTo(x, y - 124); ctx.lineTo(x, y - 158); ctx.stroke();

 // Esfera luminiscente del faro cuántico
 const bulbCol = done ? '#4ff0c8' : isLive ? '#00e5ff' : isWarn ? '#ffd54f' : '#7986cb';
 ctx.fillStyle = bulbCol;
 ctx.beginPath(); ctx.arc(x, y - 162, 8, 0, TAU); ctx.fill();

 // Destellos de faro
 if ((isLive || done) && !reduced) {
  const beamPulse = Math.sin(t * 0.15) * 0.4 + 0.6;
  ctx.strokeStyle = `rgba(79, 240, 200, ${beamPulse * 0.5})`; ctx.lineWidth = 1.5;
  for (let k = -2; k <= 2; k++) {
   ctx.beginPath();
   ctx.arc(x, y - 162, 14 + Math.abs(k) * 8, -Math.PI * 0.8, -Math.PI * 0.2);
   ctx.stroke();
  }
 }

 // ── Cartela Táctica Inferior ──
 ctx.fillStyle = done ? '#e0f2f1' : isLive ? '#e0f7fa' : isWarn ? '#fff8e1' : '#ede7f6';
 ctx.strokeStyle = borderCol; ctx.lineWidth = 2;
 _rr(ctx, x - 85, y - 190, 170, 24, 6); ctx.fill(); ctx.stroke();

 ctx.fillStyle = done ? '#004d40' : isLive ? '#006064' : isWarn ? '#e65100' : '#283593';
 ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
 ctx.fillText(
  done ? `NODO ${s.id + 1} CONECTADO ✓` :
  isLive ? `AHORA · ACÉRCATE · J PROLONGA` :
  isWarn ? `VENTANA CASI ABIERTA` :
  `ESPERA · PROTÉGETE CON K`,
  x, y - 174
 );

 ctx.restore();
}

// ── Atmósfera del Observatorio Astral: Nebulosa y Constelaciones ──────────────
export function drawYomiAtmosphere(ctx, g, cam, t = 0, reduced = false) {
 if (!g || g.roomDef?.hero !== 'yomi') return;
 const w = g.viewW || 1200, h = g.viewH || 700;

 ctx.save();
 // Fondo de nebulosa cuántica añil y menta
 const nebGrad = ctx.createLinearGradient(0, 0, 0, h);
 nebGrad.addColorStop(0, 'rgba(13, 20, 48, 0.12)');
 nebGrad.addColorStop(0.5, 'rgba(26, 35, 126, 0.08)');
 nebGrad.addColorStop(1, 'rgba(79, 240, 200, 0.10)');
 ctx.fillStyle = nebGrad;
 ctx.fillRect(0, 0, w, h);

 if (!reduced) {
  // Constelaciones conectándose en el cielo
  const STARS = [
   [120, 80], [240, 110], [310, 60], [450, 95], [600, 70],
   [720, 120], [860, 85], [980, 130], [1100, 75]
  ];
  ctx.strokeStyle = 'rgba(79, 240, 200, 0.22)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < STARS.length - 1; i++) {
   const [x1, y1] = STARS[i], [x2, y2] = STARS[i + 1];
   const sx1 = ((x1 - cam.x * 0.1) % w + w) % w;
   const sx2 = ((x2 - cam.x * 0.1) % w + w) % w;
   if (Math.abs(sx1 - sx2) < 200) {
    ctx.moveTo(sx1, y1); ctx.lineTo(sx2, y2);
   }
  }
  ctx.stroke();

  // Estrellas de datos parpadeando
  for (let s = 0; s < STARS.length; s++) {
   const [sx0, sy] = STARS[s];
   const sx = ((sx0 - cam.x * 0.1) % w + w) % w;
   const p = Math.sin(t * 0.1 + s * 1.3) * 0.4 + 0.6;
   ctx.fillStyle = s % 2 === 0 ? `rgba(79, 240, 200, ${p})` : `rgba(255, 127, 110, ${p})`;
   ctx.beginPath(); ctx.arc(sx, sy, 2 + p * 1.5, 0, TAU); ctx.fill();
  }

  // Bits de datos flotantes ascendentes
  for (let b = 0; b < 16; b++) {
   const seed = (b * 577) % 1000;
   const bx = ((seed * 19 + t * 0.6) % (w + 200)) - 100;
   const by = h - 60 - ((seed * 31 + t * 0.4) % (h * 0.7));
   const bPulse = Math.sin(t * 0.12 + b) * 0.5 + 0.5;
   ctx.fillStyle = `rgba(79, 240, 200, ${0.25 + bPulse * 0.4})`;
   ctx.fillRect(bx, by, 2.5, 2.5);
  }
 }

 ctx.restore();
}
