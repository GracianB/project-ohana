// V615 — Puerto del Horno de Pizza: arte vectorial puro para 5 especies de criaturas culinarias,
// horno de leña refractario tradicional, mesa trattoria con cliente comensal y atmósfera portuaria mediterránea.
const TAU = Math.PI * 2;

function _rr(c, x, y, w, h, r = 4) {
 if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

export function drawPizzaCreature(ctx, e, cam, t, reduced = false) {
 if (!e || (e.roomId !== 'w1-pizza' && !e._pizzaEncounter && !e.roomPersona?.pizzaEncounter)) return false;
 const kind = e.kind || e._species;
 if (!['pez', 'cangrejo', 'anguila', 'medusa', 'gaviota'].includes(kind)) return false;

 const x = e.x + e.w / 2 - cam.x, y = e.y + e.h - cam.y, facing = e.facing || 1;
 const hurt = e.invuln > 0 || e.stun > 4;
 const step = reduced ? 0 : Math.sin((t * 0.15) + (e.spawnIndex || 0) * 1.3);

 ctx.save();
 ctx.translate(x, y);
 ctx.scale(facing, 1);
 ctx.lineCap = 'round'; ctx.lineJoin = 'round';

 if (kind === 'pez') {
  // ── Pez pomodoro (jumper / pursuer) ──
  // Pez con cuerpo de tomate San Marzano carnoso, aletas de hojas de albahaca y cola salpicante
  const bob = reduced ? 0 : Math.sin(t * 0.18 + (e.spawnIndex || 0)) * 5;
  ctx.translate(0, -16 + bob);

  // Cuerpo de tomate redondo
  ctx.fillStyle = hurt ? '#ffffff' : '#d32f2f';
  ctx.strokeStyle = '#8e0000'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 16, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Resplandor pomodoro
  ctx.fillStyle = 'rgba(255, 138, 128, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-5, -6, 10, 6, -0.3, 0, TAU);
  ctx.fill();

  // Aleta caudal / tallo con hojas de albahaca verde
  ctx.fillStyle = '#2e7d32'; ctx.strokeStyle = '#1b5e20'; ctx.lineWidth = 1.8;
  // Aleta trasera
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.quadraticCurveTo(-28, -12 + step * 4, -32, -8);
  ctx.quadraticCurveTo(-24, 0, -32, 8);
  ctx.quadraticCurveTo(-28, 12 - step * 4, -18, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Aleta dorsal de hoja de albahaca
  ctx.beginPath();
  ctx.moveTo(-4, -15);
  ctx.quadraticCurveTo(2, -26, 12, -22);
  ctx.quadraticCurveTo(8, -15, 4, -14);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Ojo fresco
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(10, -5, 4.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1b0000'; ctx.beginPath(); ctx.arc(11, -5, 2, 0, TAU); ctx.fill();

  // Boquita soplando pomodoro
  ctx.strokeStyle = '#8e0000'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(18, 2, 3, 0.2, Math.PI - 0.2); ctx.stroke();

 } else if (kind === 'cangrejo') {
  // ── Cangrejo calzone / pizzero (shield / pursuer) ──
  // Caparazón dorado de masa recién horneada con borde relleno y pinzas de pala
  ctx.fillStyle = hurt ? '#ffffff' : '#d7a15c';
  ctx.strokeStyle = '#8d5028'; ctx.lineWidth = 2.5;

  // Borde relleno trenzado de masa
  ctx.beginPath();
  ctx.ellipse(0, -18, 24, 15, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Manchas tostadas de horno de leña
  ctx.fillStyle = '#5d3215';
  for (let s of [-12, -2, 8]) {
   ctx.beginPath(); ctx.ellipse(s, -22 + (s % 3), 3, 2, 0.4, 0, TAU); ctx.fill();
  }

  // Rodaja de pepperoni en el centro
  ctx.fillStyle = '#b71c1c'; ctx.strokeStyle = '#7f0000'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(2, -16, 7, 6, 0, 0, TAU); ctx.fill(); ctx.stroke();
  // Grasa brillante en el pepperoni
  ctx.fillStyle = 'rgba(255, 235, 59, 0.6)';
  ctx.beginPath(); ctx.arc(0, -17, 1.8, 0, TAU); ctx.fill();

  // Patas de masa dobladas
  for (let side of [-1, 1]) {
   for (let l = 0; l < 2; l++) {
    const lx = side * (9 + l * 10), swing = side * step * (l === 0 ? 3 : -3);
    ctx.strokeStyle = '#8d5028'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + side * 9 + swing, -3); ctx.lineTo(lx + side * 14 + swing, 0); ctx.stroke();
   }
  }

  // Pinzas tipo pala de madera de horno
  for (let side of [-1, 1]) {
   const px = side * 25, py = -22 + step * 2 * side;
   ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 2.5;
   ctx.beginPath(); ctx.moveTo(side * 14, -14); ctx.lineTo(px, py); ctx.stroke();

   // Cabeza ancha de pala
   ctx.fillStyle = '#bcaaa4'; ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 1.6;
   ctx.beginPath();
   ctx.roundRect(px - 6, py - 6, 12, 10, 2);
   ctx.fill(); ctx.stroke();
  }

  // Ojos sobre tallos de masa
  for (let s of [-7, 7]) {
   ctx.fillStyle = '#fff'; ctx.strokeStyle = '#8d5028'; ctx.lineWidth = 1.5;
   ctx.beginPath(); ctx.arc(s, -30, 4, 0, TAU); ctx.fill(); ctx.stroke();
   ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(s + 1, -30, 1.8, 0, TAU); ctx.fill();
  }

 } else if (kind === 'anguila') {
  // ── Anguila mozzarella (shooter / charger) ──
  // Hilo largo y elástico de queso fundido ondulante con motas de pimienta negra
  const wave = reduced ? 0 : Math.sin(t * 0.22 + (e.spawnIndex || 0)) * 7;
  ctx.translate(0, -18);

  ctx.strokeStyle = hurt ? '#ffffff' : '#fffde7';
  ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.quadraticCurveTo(8, -12 + wave, -8, 6 - wave);
  ctx.quadraticCurveTo(-22, 16 + wave, -34, 0);
  ctx.stroke();

  // Borde dorado de queso fundido
  ctx.strokeStyle = '#fbc02d'; ctx.lineWidth = 1.8;
  ctx.stroke();

  // Hilos de queso derretido goteando
  ctx.fillStyle = '#fff9c4';
  for (let d = 0; d < 3; d++) {
   const dx = -15 + d * 14, dy = 8 + Math.sin(t * 0.16 + d) * 4;
   ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, TAU); ctx.fill();
  }

  // Motas de pimienta negra y orégano molido
  ctx.fillStyle = '#212121';
  for (let p = 0; p < 5; p++) {
   const px = -25 + p * 10, py = Math.sin(p * 1.5) * 4;
   ctx.beginPath(); ctx.arc(px, py, 1.2, 0, TAU); ctx.fill();
  }

  // Cabeza de queso brillante
  ctx.fillStyle = '#fffde7'; ctx.strokeStyle = '#fbc02d'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(22, 0, 8, 7, 0, 0, TAU); ctx.fill(); ctx.stroke();

  // Ojo de aceituna negra
  ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(24, -2, 2.8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(25, -3, 1, 0, TAU); ctx.fill();

 } else if (kind === 'medusa') {
  // ── Medusa de orégano (flyer / floater) ──
  // Campana de masa fina transparente con salpicaduras verdes de hierbas aromáticas
  const floatBob = reduced ? 0 : Math.sin(t * 0.16 + (e.spawnIndex || 0)) * 7;
  ctx.translate(0, -22 + floatBob);

  // Sombrilla de masa translúcida
  const jellyGlow = ctx.createRadialGradient(0, -6, 2, 0, -6, 22);
  jellyGlow.addColorStop(0, 'rgba(255, 249, 196, 0.9)');
  jellyGlow.addColorStop(0.7, 'rgba(230, 238, 156, 0.7)');
  jellyGlow.addColorStop(1, 'rgba(139, 195, 74, 0.4)');
  ctx.fillStyle = jellyGlow;
  ctx.strokeStyle = '#689f38'; ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.bezierCurveTo(-20, -22, 20, -22, 18, 0);
  ctx.quadraticCurveTo(9, 3, 0, 0);
  ctx.quadraticCurveTo(-9, 3, -18, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Hojitas de orégano flotando dentro de la cúpula
  ctx.fillStyle = '#33691e';
  for (let h = -2; h <= 2; h++) {
   ctx.beginPath();
   ctx.ellipse(h * 6, -10 + Math.abs(h) * 2, 2.5, 1.5, h * 0.3, 0, TAU);
   ctx.fill();
  }

  // Tentáculos de vapor aromático y finas hierbas
  ctx.strokeStyle = 'rgba(104, 159, 56, 0.75)'; ctx.lineWidth = 1.8;
  for (let s of [-12, -4, 4, 12]) {
   const waveTent = reduced ? 0 : Math.sin(t * 0.2 + s) * 4;
   ctx.beginPath();
   ctx.moveTo(s, 2);
   ctx.quadraticCurveTo(s + waveTent, 12, s - waveTent, 22);
   ctx.stroke();
  }

  // Ojos soñadores
  ctx.fillStyle = '#1b5e20';
  ctx.beginPath(); ctx.arc(-5, -6, 2, 0, TAU); ctx.arc(5, -6, 2, 0, TAU); ctx.fill();

 } else if (kind === 'gaviota') {
  // ── Gaviota cazadora de porciones (flyer) ──
  // Pájaro portuario veloz que sobrevuela con una porción humeante de pizza en sus garras
  const flap = reduced ? 0 : Math.sin(t * 0.28) * 12;
  ctx.translate(0, -24 + Math.sin(t * 0.1) * 5);

  // Cuerpo aerodinámico
  ctx.fillStyle = hurt ? '#ffffff' : '#eceff1';
  ctx.strokeStyle = '#455a64'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 11, -0.1, 0, TAU); ctx.fill(); ctx.stroke();

  // Alas con puntas ceniza
  for (let side of [-1, 1]) {
   ctx.save(); ctx.scale(side, 1);
   ctx.fillStyle = '#cfd8dc'; ctx.strokeStyle = '#37474f'; ctx.lineWidth = 1.8;
   ctx.beginPath();
   ctx.moveTo(-4, -4);
   ctx.quadraticCurveTo(14, -24 + flap, 30, -18 + flap);
   ctx.lineTo(22, 2 + flap * 0.4);
   ctx.closePath(); ctx.fill(); ctx.stroke();
   ctx.fillStyle = '#37474f';
   ctx.beginPath(); ctx.arc(28, -17 + flap, 3.5, 0, TAU); ctx.fill();
   ctx.restore();
  }

  // Cabeza con pico afilado
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(15, -6, 8, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffa000'; ctx.beginPath(); ctx.moveTo(21, -8); ctx.lineTo(34, -5); ctx.lineTo(21, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(16, -8, 2, 0, TAU); ctx.fill();

  // Garras sosteniendo una porción triangular de pizza
  ctx.save();
  ctx.translate(4, 12);
  ctx.rotate(0.2);
  ctx.fillStyle = '#d7a15c'; ctx.strokeStyle = '#8d5028'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -8, 12, 0.4, Math.PI - 0.4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd54f'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, -5);
  ctx.lineTo(10, -5);
  ctx.lineTo(0, 15);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
  ctx.restore();
 }

 ctx.restore();
 return true;
}

export function drawPizzaOvenV615(ctx, s, cam, relay = false, t = 0, reduced = false) {
 const x = s.x - cam.x, y = s.y - cam.y;
 ctx.save();

 // ── Base de piedra volcánica / muelle ──
 ctx.fillStyle = '#4e342e'; ctx.strokeStyle = '#271c19'; ctx.lineWidth = 2.5;
 _rr(ctx, x - 64, y - 18, 128, 18, 4); ctx.fill(); ctx.stroke();

 // ── Bóveda de ladrillo refractario napolitano ──
 const ovenGrad = ctx.createRadialGradient(x, y - 60, 10, x, y - 60, 68);
 ovenGrad.addColorStop(0, '#d87a4a');
 ovenGrad.addColorStop(0.8, '#bf4e26');
 ovenGrad.addColorStop(1, '#6d2611');
 ctx.fillStyle = ovenGrad;
 ctx.strokeStyle = '#4a1506'; ctx.lineWidth = 3.5;

 ctx.beginPath();
 ctx.moveTo(x - 62, y - 18);
 ctx.lineTo(x - 62, y - 55);
 ctx.bezierCurveTo(x - 66, y - 145, x + 66, y - 145, x + 62, y - 55);
 ctx.lineTo(x + 62, y - 18);
 ctx.closePath();
 ctx.fill(); ctx.stroke();

 // Filas de ladrillos refractarios arqueados
 ctx.strokeStyle = 'rgba(255, 204, 188, 0.4)'; ctx.lineWidth = 1.5;
 for (let r = 1; r <= 3; r++) {
  const arcY = y - 35 - r * 24;
  ctx.beginPath();
  ctx.moveTo(x - 52 + r * 5, arcY);
  ctx.quadraticCurveTo(x, arcY - 22, x + 52 - r * 5, arcY);
  ctx.stroke();
 }

 // ── Chimenea con humo y chispas ──
 ctx.fillStyle = '#8d3016'; ctx.strokeStyle = '#4a1506'; ctx.lineWidth = 2.5;
 ctx.fillRect(x + 22, y - 150, 24, 32); ctx.strokeRect(x + 22, y - 150, 24, 32);
 ctx.fillStyle = '#4e1b0c'; _rr(ctx, x + 18, y - 156, 32, 8, 2); ctx.fill(); ctx.stroke();

 if (!reduced) {
  for (let p = 0; p < 4; p++) {
   const smokeRise = (t * 0.04 + p * 0.3) % 1;
   const sx = x + 34 + Math.sin(t * 0.05 + p) * 12 * smokeRise;
   const sy = y - 160 - smokeRise * 45;
   ctx.fillStyle = `rgba(238, 238, 238, ${0.45 * (1 - smokeRise)})`;
   ctx.beginPath(); ctx.arc(sx, sy, 6 + smokeRise * 10, 0, TAU); ctx.fill();
  }
 }

 // ── Boca del horno abovedada ──
 ctx.fillStyle = '#1a0804';
 ctx.beginPath();
 ctx.arc(x, y - 38, 36, Math.PI, 0);
 ctx.lineTo(x + 36, y - 18);
 ctx.lineTo(x - 36, y - 18);
 ctx.closePath(); ctx.fill();

 const fireFlicker = reduced ? 0 : Math.sin(t * 0.2) * 4;
 const flameGrad = ctx.createLinearGradient(x, y - 20, x, y - 60 - fireFlicker);
 flameGrad.addColorStop(0, '#ff3d00');
 flameGrad.addColorStop(0.5, '#ff9100');
 flameGrad.addColorStop(1, '#ffea00');

 ctx.fillStyle = flameGrad;
 ctx.beginPath();
 ctx.moveTo(x - 28, y - 18);
 ctx.quadraticCurveTo(x - 18, y - 55 - fireFlicker, x - 10, y - 38);
 ctx.quadraticCurveTo(x, y - 65 - fireFlicker, x + 10, y - 38);
 ctx.quadraticCurveTo(x + 20, y - 55 - fireFlicker, x + 28, y - 18);
 ctx.closePath(); ctx.fill();

 const hearthGlow = ctx.createRadialGradient(x, y - 18, 5, x, y - 18, 80);
 hearthGlow.addColorStop(0, 'rgba(255, 145, 0, 0.45)');
 hearthGlow.addColorStop(1, 'rgba(255, 87, 34, 0)');
 ctx.fillStyle = hearthGlow;
 ctx.beginPath(); ctx.ellipse(x, y - 12, 70, 20, 0, 0, TAU); ctx.fill();

 // ── Letrero de cerámica artesanal ──
 ctx.fillStyle = '#fff8e1'; ctx.strokeStyle = '#004d40'; ctx.lineWidth = 2.5;
 _rr(ctx, x - 88, y - 172, 176, 26, 6); ctx.fill(); ctx.stroke();

 ctx.fillStyle = '#2e7d32'; ctx.fillRect(x - 84, y - 169, 6, 20);
 ctx.fillStyle = '#c62828'; ctx.fillRect(x + 78, y - 169, 6, 20);

 ctx.fillStyle = '#1b5e20'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
 ctx.fillText(relay ? 'HORNO DE BARRIO · RECOGE' : 'ANTICA PIZZERIA · HORNO', x, y - 155);

 ctx.restore();
}

export function drawPizzaGuestV615(ctx, s, cam, done, t = 0, reduced = false) {
 const x = s.x - cam.x, y = s.y - cam.y;
 ctx.save();

 // ── Mesa trattoria con mantel a cuadros blancos y rojos ──
 ctx.fillStyle = '#6d4c41'; ctx.fillRect(x - 38, y - 26, 76, 26);
 ctx.fillStyle = '#4e342e'; ctx.fillRect(x - 6, y - 16, 12, 16);

 ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#c62828'; ctx.lineWidth = 1.5;
 _rr(ctx, x - 44, y - 34, 88, 14, 3); ctx.fill(); ctx.stroke();
 ctx.fillStyle = '#d32f2f';
 for (let q = -3; q <= 3; q++) {
  if (Math.abs(q) % 2 === 1) ctx.fillRect(x + q * 11 - 5, y - 34, 10, 14);
 }

 // ── Comensal sentado esperando o disfrutando ──
 const chairX = x + 28;
 ctx.fillStyle = '#5d4037'; ctx.fillRect(chairX + 6, y - 56, 8, 40);

 ctx.fillStyle = ['#1565c0', '#6a1b9a', '#2e7d32'][(s.id - 1) % 3];
 ctx.beginPath();
 ctx.moveTo(chairX - 14, y - 24);
 ctx.lineTo(chairX + 10, y - 24);
 ctx.lineTo(chairX + 8, y - 56);
 ctx.lineTo(chairX - 12, y - 56);
 ctx.closePath(); ctx.fill();

 ctx.fillStyle = '#fff'; ctx.beginPath();
 ctx.moveTo(chairX - 6, y - 56);
 ctx.lineTo(chairX + 2, y - 56);
 ctx.lineTo(chairX - 2, y - 44);
 ctx.closePath(); ctx.fill();

 ctx.fillStyle = '#ffcc80'; ctx.beginPath(); ctx.ellipse(chairX - 2, y - 68, 13, 14, 0, 0, TAU); ctx.fill();
 ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.ellipse(chairX - 2, y - 79, 14, 8, -0.15, Math.PI, TAU); ctx.fill();

 ctx.fillStyle = '#212121';
 ctx.beginPath(); ctx.arc(chairX - 7, y - 69, 1.8, 0, TAU); ctx.arc(chairX + 1, y - 69, 1.8, 0, TAU); ctx.fill();
 ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 1.5; ctx.beginPath();
 if (done) {
  ctx.arc(chairX - 3, y - 64, 5, 0.2, Math.PI - 0.2);
 } else {
  ctx.moveTo(chairX - 6, y - 62); ctx.lineTo(chairX, y - 62);
 }
 ctx.stroke();

 ctx.fillStyle = '#2e1c14';
 ctx.beginPath(); ctx.ellipse(chairX - 6, y - 65, 4, 2, -0.2, 0, TAU); ctx.fill();
 ctx.beginPath(); ctx.ellipse(chairX, y - 65, 4, 2, 0.2, 0, TAU); ctx.fill();

 if (done) {
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(x - 14, y - 36, 18, 8, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd54f'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(x - 14, y - 37, 15, 6, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c62828';
  for (let p = -1; p <= 1; p++) { ctx.beginPath(); ctx.arc(x - 14 + p * 6, y - 37, 1.8, 0, TAU); ctx.fill(); }

  if (!reduced) {
   const steam = (t * 0.05) % 1;
   ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - steam)})`; ctx.lineWidth = 1.5;
   ctx.beginPath();
   ctx.moveTo(x - 14, y - 44);
   ctx.quadraticCurveTo(x - 10 + Math.sin(t * 0.1) * 4, y - 54, x - 14, y - 62);
   ctx.stroke();
  }
 } else {
  ctx.fillStyle = '#eceff1'; ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(x - 14, y - 36, 16, 7, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#78909c'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x - 32, y - 39); ctx.lineTo(x - 32, y - 33); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 4, y - 39); ctx.lineTo(x + 4, y - 33); ctx.stroke();
 }

 ctx.fillStyle = done ? '#e8f5e9' : '#fff3e0';
 ctx.strokeStyle = done ? '#43a047' : '#fb8c00'; ctx.lineWidth = 2;
 _rr(ctx, x - 70, y - 116, 140, 24, 5); ctx.fill(); ctx.stroke();

 ctx.fillStyle = done ? '#2e7d32' : '#e65100'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
 ctx.fillText(done ? `REPARTO ${s.id} ENTREGADO ✓` : `CLIENTE ${s.id} · ¡PIZZA CALIENTE!`, x, y - 100);

 ctx.restore();
}

export function drawPizzaAtmosphere(ctx, g, cam, t = 0, reduced = false) {
 if (!g || g.roomDef?.hero !== 'pizza') return;
 const w = g.viewW || 1200, h = g.viewH || 700;

 ctx.save();
 const duskGrad = ctx.createLinearGradient(0, 0, 0, h);
 duskGrad.addColorStop(0, 'rgba(255, 112, 67, 0.10)');
 duskGrad.addColorStop(0.7, 'rgba(255, 167, 38, 0.05)');
 duskGrad.addColorStop(1, 'rgba(230, 81, 0, 0.15)');
 ctx.fillStyle = duskGrad;
 ctx.fillRect(0, 0, w, h);

 if (!reduced) {
  for (let s = 0; s < 18; s++) {
   const seed = (s * 491) % 1000;
   const sx = ((seed * 14 + t * 0.7) % (w + 200)) - 100;
   const sy = h - 60 - ((seed * 23 + t * 0.5) % (h * 0.7));
   const sparkPulse = Math.sin(t * 0.15 + s) * 0.5 + 0.5;
   ctx.fillStyle = `rgba(255, ${160 + Math.floor(sparkPulse * 80)}, 30, ${0.35 + sparkPulse * 0.45})`;
   ctx.beginPath();
   ctx.arc(sx, sy, 1.5 + sparkPulse * 1.5, 0, TAU);
   ctx.fill();
  }
 }

 ctx.restore();
}
