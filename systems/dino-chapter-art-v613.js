// V613 — Valle Fósil de Dino: arte vectorial puro para 5 especies prehistóricas,
// placas fósiles ancestrales con venas de ámbar, géiseres de fango y atmósfera de jade.
const TAU = Math.PI * 2;

function _rr(c, x, y, w, h, r = 4) {
 if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

export function drawDinoCreature(ctx, e, cam, t, reduced = false) {
 if (!e || (e.roomId !== 'w1-dino' && !e._dinoEncounter && !e.roomPersona?.dinoEncounter)) return false;
 const kind = e.kind || e._species;
 if (!['cucaracho', 'rana', 'cangrejo', 'arana', 'libelula', 'abeja'].includes(kind)) return false;

 const x = e.x + e.w / 2 - cam.x, y = e.y + e.h - cam.y, facing = e.facing || 1;
 const hurt = e.invuln > 0 || e.stun > 4;
 const step = reduced ? 0 : Math.sin((t * 0.14) + (e.spawnIndex || 0) * 1.3);

 ctx.save();
 ctx.translate(x, y);
 ctx.scale(facing, 1);
 ctx.lineCap = 'round'; ctx.lineJoin = 'round';

 if (kind === 'cucaracho') {
  // ── Trilobite acorazado (pursuer) ──
  // Quelícero prehistórico acorazado de quitina fósil y jade
  ctx.fillStyle = hurt ? '#ffffff' : '#2e3d34';
  ctx.strokeStyle = '#5a7c6a'; ctx.lineWidth = 2.2;

  // Caparazón cefálico semicircular
  ctx.beginPath();
  ctx.arc(8, -18, 16, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.lineTo(-4, -2); ctx.quadraticCurveTo(-2, -18, -4, -34);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Segmentos torácicos acanalados
  for (let s = 0; s < 4; s++) {
   const sx = -6 - s * 7, sw = 14 - s * 2.2;
   ctx.fillStyle = s % 2 === 0 ? '#3c5245' : '#2e3d34';
   ctx.beginPath();
   ctx.ellipse(sx, -18, sw, 10 - s * 1.2, 0, 0, TAU);
   ctx.fill(); ctx.stroke();
  }

  // Ojos compuestos facetados de ámbar
  ctx.fillStyle = '#ffb300';
  ctx.beginPath(); ctx.ellipse(12, -24, 4, 2.5, 0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ff6f00'; ctx.beginPath(); ctx.arc(13, -24, 1.3, 0, TAU); ctx.fill();

  // Patas marchadoras articuladas
  for (let l = 0; l < 5; l++) {
   const lx = 4 - l * 8, swing = step * (l % 2 === 0 ? 4 : -4);
   ctx.strokeStyle = '#223027'; ctx.lineWidth = 2.8;
   ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx - 4 + swing, -3); ctx.lineTo(lx + swing, 0); ctx.stroke();
  }

  // Antenas sensoriales delanteras
  const antWob = Math.sin(t * 0.2 + 1) * 3;
  ctx.strokeStyle = '#7ca990'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(18, -20); ctx.quadraticCurveTo(28, -28 + antWob, 36, -24 + antWob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(16, -16); ctx.quadraticCurveTo(26, -20 - antWob, 34, -14 - antWob); ctx.stroke();

 } else if (kind === 'rana') {
  // ── Anuro primigenio (jumper) ──
  // Sapo fósil de pantano con ancas elásticas y piel de musgo
  const jumpAir = e.vy < -0.5;
  const squish = jumpAir ? 1.25 : 1.0;

  // Cuerpo rechoncho
  ctx.fillStyle = hurt ? '#ffffff' : '#33503b';
  ctx.strokeStyle = '#5a8264'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -15 * squish, 18, 12 * squish, -0.05, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Vientre pálido
  ctx.fillStyle = '#d7e8ba';
  ctx.beginPath(); ctx.ellipse(2, -11 * squish, 11, 7 * squish, 0, 0, TAU); ctx.fill();

  // Pústulas y tubérculos dorsales de jade
  for (let p = -2; p <= 2; p++) {
   ctx.fillStyle = p % 2 === 0 ? '#7cb88b' : '#a2d4b0';
   ctx.beginPath(); ctx.arc(p * 6 - 2, -21 * squish, 2.2, 0, TAU); ctx.fill();
  }

  // Ancas traseras dobladas
  ctx.strokeStyle = '#203626'; ctx.lineWidth = 4.2;
  const legExt = jumpAir ? 10 : 0;
  ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(-18, -6 + legExt); ctx.lineTo(-12, -1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -12); ctx.lineTo(18, -6 + legExt); ctx.lineTo(12, -1); ctx.stroke();

  // Ojos saltones sobre la bóveda craneal
  ctx.fillStyle = '#406349'; ctx.beginPath(); ctx.arc(8, -23 * squish, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffe082'; ctx.beginPath(); ctx.arc(9, -23 * squish, 3.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1c281e'; ctx.beginPath(); ctx.arc(9.5, -23 * squish, 1.8, 0, TAU); ctx.fill();

  // Garganta inflable (saco vocal animado)
  const croak = Math.abs(Math.sin(t * 0.12)) * 4;
  ctx.fillStyle = 'rgba(215, 232, 186, 0.7)';
  ctx.beginPath(); ctx.ellipse(12, -14, 5 + croak, 4 + croak * 0.6, 0.2, 0, TAU); ctx.fill();

 } else if (kind === 'cangrejo' || kind === 'arana') {
  // ── Quelícero de roca / ammonite acorazado (shield) ──
  // Concha espiral petrificada que bloquea impactos frontales
  ctx.translate(0, -6);

  // Concha de fósil en espiral
  ctx.fillStyle = hurt ? '#ffffff' : '#455a4c';
  ctx.strokeStyle = '#7ca38b'; ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(-4, -16, 17, 0, TAU); ctx.fill(); ctx.stroke();

  // Costillas de la concha
  ctx.strokeStyle = '#2d3d33'; ctx.lineWidth = 2;
  for (let k = 0; k < 6; k++) {
   const a = k * (TAU / 6) + t * 0.02;
   ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-4 + Math.cos(a) * 16, -16 + Math.sin(a) * 16); ctx.stroke();
  }

  // Centro de ammonite dorado
  ctx.fillStyle = '#d4af37';
  ctx.beginPath(); ctx.arc(-4, -16, 5, 0, TAU); ctx.fill();

  // Escudo óseo frontal que protege el cuerpo
  ctx.fillStyle = '#2d4034'; ctx.strokeStyle = '#85b89a'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(8, -32); ctx.quadraticCurveTo(24, -18, 16, -4);
  ctx.lineTo(8, -8); ctx.quadraticCurveTo(12, -18, 6, -26);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Ojo fósil protegido
  ctx.fillStyle = '#ffca28'; ctx.beginPath(); ctx.arc(10, -18, 3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(11, -18, 1.4, 0, TAU); ctx.fill();

  // Patas de soporte
  ctx.strokeStyle = '#1d2a22'; ctx.lineWidth = 3.5;
  for (let p of [-10, 0, 8]) {
   ctx.beginPath(); ctx.moveTo(p, -6); ctx.lineTo(p - 3, 2); ctx.lineTo(p + 2, 6); ctx.stroke();
  }

 } else if (kind === 'libelula') {
  // ── Meganeura gigante (flyer) ──
  // Libélula prehistórica de alas dobles con envergadura de 65px
  const flap = reduced ? 0 : Math.sin(t * 0.35) * 14;
  ctx.translate(0, -22 + Math.sin(t * 0.09) * 5);

  // Abdomen segmentado alargado de jade
  ctx.fillStyle = '#2e5b42'; ctx.strokeStyle = '#55a175'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(-14, 0, 18, 3.5, -0.08, 0, TAU); ctx.fill(); ctx.stroke();
  for (let s = 0; s < 5; s++) {
   ctx.strokeStyle = '#72c294'; ctx.lineWidth = 1;
   ctx.beginPath(); ctx.moveTo(-28 + s * 6, -3); ctx.lineTo(-28 + s * 6, 3); ctx.stroke();
  }

  // Tórax robusto
  ctx.fillStyle = '#1f3d2c'; ctx.beginPath(); ctx.ellipse(2, 0, 7, 5.5, 0, 0, TAU); ctx.fill(); ctx.stroke();

  // Ojos compuestos esmeralda
  ctx.fillStyle = '#69f0ae'; ctx.beginPath(); ctx.arc(8, -2, 3.8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#004d40'; ctx.beginPath(); ctx.arc(9, -2, 1.6, 0, TAU); ctx.fill();

  // 4 alas transparentes venosas con aleteo rápido
  for (const [ox, oy, span, ang] of [[-4, -3, 32, -0.3], [3, -4, 28, -0.15], [-4, 3, 28, 0.2], [3, 4, 25, 0.1]]) {
   ctx.save();
   ctx.translate(ox, oy);
   ctx.fillStyle = 'rgba(167, 255, 235, 0.65)'; ctx.strokeStyle = '#a7ffeb'; ctx.lineWidth = 1.2;
   ctx.beginPath();
   ctx.moveTo(0, 0);
   ctx.quadraticCurveTo(span * 0.5, -12 + flap, span, -8 + flap * 0.7);
   ctx.quadraticCurveTo(span * 0.6, 2 + flap * 0.3, 0, 0);
   ctx.fill(); ctx.stroke();
   // Nervaduras alares
   ctx.strokeStyle = 'rgba(0, 77, 64, 0.35)'; ctx.lineWidth = 0.8;
   ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(span * 0.7, -5 + flap * 0.6); ctx.stroke();
   ctx.restore();
  }

 } else if (kind === 'abeja') {
  // ── Avispa jurásica (shooter) ──
  // Avispa voladora con aguijón de ámbar que dispara espinas
  const bob = reduced ? 0 : Math.sin(t * 0.16) * 5;
  ctx.translate(0, -20 + bob);

  // Cuerpo a rayas ámbar y carbón
  ctx.fillStyle = '#ffb300'; ctx.strokeStyle = '#261c14'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0.1, 0, TAU); ctx.fill(); ctx.stroke();

  // Rayas de quitina negra
  ctx.fillStyle = '#261c14';
  for (let r = -1; r <= 1; r++) {
   ctx.beginPath(); ctx.ellipse(r * 6, 0, 2.5, 8.5, 0.1, 0, TAU); ctx.fill();
  }

  // Aguijón puntiagudo retráctil
  ctx.fillStyle = '#ff6f00'; ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-24, 2); ctx.lineTo(-13, 4); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Ojo de insecto
  ctx.fillStyle = '#ffe082'; ctx.beginPath(); ctx.arc(10, -2, 3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(11, -2, 1.2, 0, TAU); ctx.fill();

  // Par de alas de alta vibración
  const wFlap = Math.sin(t * 0.4) * 10;
  ctx.fillStyle = 'rgba(255, 236, 179, 0.7)'; ctx.strokeStyle = '#ffe082'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(10, -24 + wFlap, 22, -18 + wFlap); ctx.quadraticCurveTo(12, -6, 0, -6); ctx.fill(); ctx.stroke();
 }

 ctx.restore();
 return true;
}

export function drawDinoPlateV613(ctx, s, cam, t, reduced = false) {
 const x = s.x - cam.x, y = s.y - cam.y, done = !!s.done;
 const dropReq = s.dropHeight || 40;

 ctx.save();
 // Pedestal fósil de basalto y arenisca estratificada
 ctx.fillStyle = done ? '#385744' : '#4e4337';
 ctx.strokeStyle = done ? '#6da57e' : '#796854';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.ellipse(x, y - 6, 68, 14, 0, 0, TAU);
 ctx.fill(); ctx.stroke();

 // Anillo concéntrico interno con textura de estratos geológicos
 ctx.fillStyle = done ? '#7ea882' : '#695c4b';
 ctx.strokeStyle = done ? '#a2cca6' : '#94836c';
 ctx.lineWidth = 1.8;
 ctx.beginPath();
 ctx.ellipse(x, y - 8, 48, 9.5, 0, 0, TAU);
 ctx.fill(); ctx.stroke();

 // Impronta central fósil (garra de dinosaurio o espiral de ammonite)
 ctx.fillStyle = done ? '#c8e6c9' : '#bcaaa4';
 ctx.strokeStyle = done ? '#2e7d32' : '#3e2723';
 ctx.lineWidth = 1.5;
 for (let claw = -1; claw <= 1; claw++) {
  const ca = claw * 0.35;
  ctx.beginPath();
  ctx.moveTo(x + claw * 12, y - 9);
  ctx.lineTo(x + claw * 15 + Math.sin(ca) * 6, y - 18);
  ctx.lineTo(x + claw * 9, y - 9);
  ctx.closePath(); ctx.fill(); ctx.stroke();
 }

 // Venas de jade / ámbar reactivas cuando está despierto
 if (done) {
  const pulse = reduced ? 0 : Math.sin(t * 0.08) * 3;
  ctx.strokeStyle = '#b9f6ca'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 8, 32 + pulse, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.stroke();

  // Partículas ascendentes de esporas de la tierra
  if (!reduced) {
   for (let k = 0; k < 4; k++) {
    const rise = ((t * 0.04 + k * 0.25) % 1);
    const sx = x + Math.sin(t * 0.09 + k * 1.8) * 22;
    const sy = y - 15 - rise * 50;
    ctx.fillStyle = '#b9f6ca'; ctx.globalAlpha = 1 - rise;
    ctx.beginPath(); ctx.arc(sx, sy, 2.2, 0, TAU); ctx.fill();
   }
   ctx.globalAlpha = 1;
  }
 } else {
  // Flecha indicadora de caída alta y texto de requerimiento
  const bob = reduced ? 0 : Math.sin(t * 0.06) * 5;
  ctx.strokeStyle = '#ffe082'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x, y - 75 + bob); ctx.lineTo(x, y - 40 + bob);
  ctx.lineTo(x - 7, y - 48 + bob); ctx.moveTo(x, y - 40 + bob); ctx.lineTo(x + 7, y - 48 + bob);
  ctx.stroke();
 }

 // Rótulo identificativo de placa
 ctx.fillStyle = done ? '#c8e6c9' : '#d7ccc8';
 ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
 const orderLabel = (s.order !== undefined ? s.order + 1 : (s.id || 0) + 1);
 const reqLabel = dropReq >= 160 ? 'CAÍDA COLOSAL (180)' : dropReq >= 110 ? 'SALTO ALTO (120)' : dropReq >= 70 ? 'SALTO MEDIO (80)' : 'PISOTÓN (40)';
 ctx.fillText(done ? `FÓSIL ${orderLabel} · DESPIERTO ✓` : `↓ FÓSIL ${orderLabel} · ${reqLabel}`, x, y - 88);

 ctx.restore();
}

export function drawDinoGeyser(ctx, vent, cam, t, reduced = false) {
 const x = vent.x - cam.x, y = vent.y - cam.y;
 ctx.save();

 // Boca de lodo / cráter de géiser
 ctx.fillStyle = '#3e2723'; ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2.5;
 ctx.beginPath(); ctx.ellipse(x, y - 4, vent.w / 2, 12, 0, 0, TAU); ctx.fill(); ctx.stroke();

 // Charco borboteante
 ctx.fillStyle = '#8d6e63';
 ctx.beginPath(); ctx.ellipse(x, y - 4, vent.w / 2 - 8, 7, 0, 0, TAU); ctx.fill();

 // Columna de vapor y lodo geotérmico
 const cycle = reduced ? 0.6 : (t * 0.05 + vent.x * 0.01) % 1;
 const h = vent.h * Math.sin(cycle * Math.PI);
 if (h > 10) {
  ctx.fillStyle = 'rgba(215, 204, 200, 0.45)';
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 6);
  ctx.quadraticCurveTo(x - 22, y - 6 - h * 0.6, x - 6, y - 6 - h);
  ctx.quadraticCurveTo(x + 6, y - 6 - h, x + 22, y - 6 - h * 0.6);
  ctx.lineTo(x + 14, y - 6);
  ctx.closePath(); ctx.fill();

  // Gotas de fango expulsadas
  if (!reduced) {
   for (let i = 0; i < 3; i++) {
    const gx = x + Math.sin(t * 0.2 + i) * 12;
    const gy = y - 10 - (h * (0.4 + i * 0.25));
    ctx.fillStyle = '#5d4037';
    ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, TAU); ctx.fill();
   }
  }
 }

 ctx.restore();
}

export function drawDinoAtmosphere(ctx, g, cam, t, reduced = false) {
 const W = g.viewW || 1280, H = g.viewH || 720;
 ctx.save();

 // 1. Neblina verde esmeralda y humedad basal
 const mistGrad = ctx.createLinearGradient(0, H - 150, 0, H);
 mistGrad.addColorStop(0, 'rgba(46, 125, 50, 0)');
 mistGrad.addColorStop(1, 'rgba(27, 94, 32, 0.16)');
 ctx.fillStyle = mistGrad; ctx.fillRect(0, H - 150, W, 150);

 // 2. Esporas luminosas y luciérnagas prehistóricas
 if (!reduced) {
  const seed = Math.floor(cam.x / 250);
  for (let i = 0; i < 16; i++) {
   const phase = (t * 0.025 + i * 14.1 + seed) % 100;
   const px = ((i * 127 + phase * 20) % W);
   const py = H - ((phase * 12 + i * 41) % H);
   const size = 1.6 + (i % 3) * 0.7;
   const flicker = 0.35 + Math.sin(t * 0.09 + i) * 0.25;
   ctx.fillStyle = i % 2 === 0 ? '#b9f6ca' : '#ffe082';
   ctx.globalAlpha = flicker;
   ctx.beginPath(); ctx.arc(px, py, size, 0, TAU); ctx.fill();
  }
 }

 ctx.restore();
}
