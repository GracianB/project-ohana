// V614 — Mercado Dorado de Frita: arte vectorial puro para 5 especies de comiditas,
// géiseres de aceite burbujeante con premios dorados y atmósfera de festival diner.
const TAU = Math.PI * 2;

function _rr(c, x, y, w, h, r = 4) {
 if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

export function drawFritaCreature(ctx, e, cam, t, reduced = false) {
 if (!e || (e.roomId !== 'w1-frita' && !e._fritaEncounter && !e.roomPersona?.fritaEncounter)) return false;
 const kind = e.kind || e._species;
 if (!['cangrejo', 'gaviota', 'brasita', 'rana', 'cucaracho'].includes(kind)) return false;

 const x = e.x + e.w / 2 - cam.x, y = e.y + e.h - cam.y, facing = e.facing || 1;
 const hurt = e.invuln > 0 || e.stun > 4;
 const step = reduced ? 0 : Math.sin((t * 0.15) + (e.spawnIndex || 0) * 1.3);

 ctx.save();
 ctx.translate(x, y);
 ctx.scale(facing, 1);
 ctx.lineCap = 'round'; ctx.lineJoin = 'round';

 if (kind === 'cangrejo') {
  // ── Cangrejo crujiente (pursuer) ──
  // Cangrejo rebozado dorado con pinzas de cono de patatas
  ctx.fillStyle = hurt ? '#ffffff' : '#f57f17';
  ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2.4;

  // Caparazón dorado y crujiente
  ctx.beginPath();
  ctx.ellipse(0, -18, 22, 14, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Rayitas de salsa ketchup sobre el lomo
  ctx.strokeStyle = '#d32f2f'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -20); ctx.quadraticCurveTo(-4, -25, 4, -22); ctx.quadraticCurveTo(10, -20, 14, -23);
  ctx.stroke();

  // 4 patitas crujientes
  for (let side of [-1, 1]) {
   for (let l = 0; l < 2; l++) {
    const lx = side * (8 + l * 10), swing = side * step * (l === 0 ? 4 : -4);
    ctx.strokeStyle = '#bf360c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + side * 8 + swing, -3); ctx.lineTo(lx + side * 12 + swing, 0); ctx.stroke();
   }
  }

  // Pinzas grandes con toque crujiente
  for (let side of [-1, 1]) {
   const px = side * 24, py = -24 + step * 2 * side;
   ctx.fillStyle = '#ffb300'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.ellipse(px, py, 9, 6, side * 0.4, 0, TAU);
   ctx.fill(); ctx.stroke();
   // Dientes de la pinza
   ctx.strokeStyle = '#fff8e1'; ctx.lineWidth = 1.5;
   ctx.beginPath(); ctx.moveTo(px + side * 6, py - 3); ctx.lineTo(px + side * 10, py); ctx.lineTo(px + side * 6, py + 3); ctx.stroke();
  }

  // Ojos saltones curiosos
  for (let s of [-6, 6]) {
   ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e65100'; ctx.lineWidth = 1.5;
   ctx.beginPath(); ctx.arc(s, -30, 4, 0, TAU); ctx.fill(); ctx.stroke();
   ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(s + 1, -30, 1.8, 0, TAU); ctx.fill();
  }

 } else if (kind === 'gaviota') {
  // ── Gaviota ladrona de patatas (flyer) ──
  // Pájaro portuario con gorro de chef torcido y patata en el pico
  const flap = reduced ? 0 : Math.sin(t * 0.28) * 12;
  ctx.translate(0, -24 + Math.sin(t * 0.1) * 5);

  // Cuerpo blanco de ave
  ctx.fillStyle = hurt ? '#ffffff' : '#fafafa';
  ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 11, -0.1, 0, TAU); ctx.fill(); ctx.stroke();

  // Alas con puntas tostadas
  for (let side of [-1, 1]) {
   ctx.save(); ctx.scale(side, 1);
   ctx.fillStyle = '#cfd8dc'; ctx.strokeStyle = '#455a64'; ctx.lineWidth = 1.8;
   ctx.beginPath();
   ctx.moveTo(-4, -4);
   ctx.quadraticCurveTo(12, -22 + flap, 28, -16 + flap);
   ctx.lineTo(20, 2 + flap * 0.4);
   ctx.closePath(); ctx.fill(); ctx.stroke();
   // Punta de pluma tostada
   ctx.fillStyle = '#ffb300';
   ctx.beginPath(); ctx.arc(26, -15 + flap, 3, 0, TAU); ctx.fill();
   ctx.restore();
  }

  // Cabeza con pico amarillo y patata frita
  ctx.fillStyle = '#fafafa'; ctx.beginPath(); ctx.arc(14, -6, 8, 0, TAU); ctx.fill(); ctx.stroke();
  // Pico
  ctx.fillStyle = '#ff8f00'; ctx.beginPath(); ctx.moveTo(20, -8); ctx.lineTo(32, -5); ctx.lineTo(20, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Patata frita atrapada en el pico
  ctx.fillStyle = '#ffe082'; ctx.strokeStyle = '#ffb300'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(24, -14, 4, 16); ctx.fill(); ctx.stroke();

  // Ojo pícaro
  ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(15, -8, 2, 0, TAU); ctx.fill();

 } else if (kind === 'brasita') {
  // ── Nube de aceite burbujeante (shooter) ──
  // Gota de aceite hirviendo con ojos traviesos que lanza gotas de fritura
  const bob = reduced ? 0 : Math.sin(t * 0.14) * 6;
  ctx.translate(0, -18 + bob);

  // Resplandor de fritura
  const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, 26);
  glow.addColorStop(0, 'rgba(255, 238, 88, 0.7)');
  glow.addColorStop(0.6, 'rgba(255, 179, 0, 0.4)');
  glow.addColorStop(1, 'rgba(255, 111, 0, 0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fill();

  // Cuerpo de gota dorada translúcida
  ctx.fillStyle = '#ffca28'; ctx.strokeStyle = '#f57c00'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.quadraticCurveTo(14, -4, 12, 10);
  ctx.quadraticCurveTo(0, 18, -12, 10);
  ctx.quadraticCurveTo(-14, -4, 0, -16);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Burbujitas internas
  ctx.fillStyle = '#fffde7';
  for (let b = 0; b < 3; b++) {
   const bx = -5 + b * 5, by = Math.sin(t * 0.2 + b) * 4;
   ctx.beginPath(); ctx.arc(bx, by, 2, 0, TAU); ctx.fill();
  }

  // Ojos tiernos
  ctx.fillStyle = '#212121';
  ctx.beginPath(); ctx.arc(-4, -1, 2.2, 0, TAU); ctx.arc(4, -1, 2.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-3, -2, 1, 0, TAU); ctx.arc(5, -2, 1, 0, TAU); ctx.fill();

 } else if (kind === 'rana') {
  // ── Rana rebozada (jumper) ──
  // Sapo crujiente con piel de pan rallado y ancas saltarinas
  const jumpAir = e.vy < -0.5;
  ctx.fillStyle = hurt ? '#ffffff' : '#fbc02d';
  ctx.strokeStyle = '#f57f17'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -15, 18, 12, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Motitas crujientes de rebozado
  ctx.fillStyle = '#e65100';
  for (let c = -2; c <= 2; c++) {
   ctx.beginPath(); ctx.arc(c * 6, -18 + Math.abs(c), 1.6, 0, TAU); ctx.fill();
  }

  // Ancas dobladas
  ctx.strokeStyle = '#e65100'; ctx.lineWidth = 4;
  const legExt = jumpAir ? 8 : 0;
  ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(-18, -6 + legExt); ctx.lineTo(-12, -1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -12); ctx.lineTo(18, -6 + legExt); ctx.lineTo(12, -1); ctx.stroke();

  // Ojos dorados
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7, -22, 4.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#bf360c'; ctx.beginPath(); ctx.arc(8, -22, 2, 0, TAU); ctx.fill();

 } else if (kind === 'cucaracho') {
  // ── Escarabajo de bandeja (shield) ──
  // Bicho acorazado con caparazón de cartón de comida rápida que bloquea ataques
  ctx.fillStyle = hurt ? '#ffffff' : '#b71c1c';
  ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -14, 18, 12, 0, 0, TAU);
  ctx.fill(); ctx.stroke();

  // Emblema de hamburguesa en el caparazón
  ctx.fillStyle = '#ffb300';
  ctx.beginPath(); ctx.ellipse(0, -14, 8, 4, 0, 0, TAU); ctx.fill();

  // Patas de escarabajo
  ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 2.5;
  for (let l of [-8, 0, 8]) {
   ctx.beginPath(); ctx.moveTo(l, -8); ctx.lineTo(l + 4, 0); ctx.stroke();
  }
 }

 ctx.restore();
 return true;
}

export function drawFritaVentV614(ctx, g, s, cam, done, t, reduced = false) {
 const x = s.x - cam.x, y = s.y - cam.y;
 ctx.save();

 // Rejilla / fosa de freidora industrial de acero inoxidable
 ctx.fillStyle = '#424242'; ctx.strokeStyle = done ? '#ffd54f' : '#757575'; ctx.lineWidth = 2.5;
 ctx.beginPath(); ctx.ellipse(x, y - 5, 42, 13, 0, 0, TAU); ctx.fill(); ctx.stroke();

 // Aceite dorado hirviendo
 ctx.fillStyle = done ? '#ffb300' : '#ff8f00';
 ctx.beginPath(); ctx.ellipse(x, y - 5, 34, 8.5, 0, 0, TAU); ctx.fill();

 // Chorro geotérmico / géiser de vapor dorado
 const cycle = reduced ? 0.7 : (t * 0.05 + s.id * 1.5) % 1;
 const h = 60 + Math.sin(cycle * Math.PI) * 45;
 ctx.fillStyle = 'rgba(255, 238, 88, 0.45)';
 ctx.beginPath();
 ctx.moveTo(x - 14, y - 6);
 ctx.quadraticCurveTo(x - 24, y - 6 - h * 0.5, x - 6, y - 6 - h);
 ctx.quadraticCurveTo(x + 6, y - 6 - h, x + 24, y - 6 - h * 0.5);
 ctx.lineTo(x + 14, y - 6);
 ctx.closePath(); ctx.fill();

 // Premio en el aire (vent.prize): patata frita estelar giratoria
 if (s.prize) {
  const px = s.prize.x - cam.x, py = s.prize.y - cam.y;
  const pBob = reduced ? 0 : Math.sin(t * 0.12 + s.id) * 6;
  ctx.save();
  ctx.translate(px, py + pBob);
  if (!done) {
   // Halo dorado del premio
   ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
   ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.fill();

   // Patata frita de oro reluciente
   ctx.fillStyle = '#ffd54f'; ctx.strokeStyle = '#ff8f00'; ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.roundRect ? ctx.roundRect(-5, -16, 10, 32, 4) : ctx.rect(-5, -16, 10, 32);
   ctx.fill(); ctx.stroke();

   // Destello de estrella
   ctx.fillStyle = '#fffde7';
   ctx.beginPath(); ctx.arc(2, -8, 2.5, 0, TAU); ctx.fill();

   // Texto indicador
   ctx.fillStyle = '#ffb300'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
   ctx.fillText('¡ATRAPA EL PREMIO!', 0, -26);
  } else {
   // Estrella conquistada
   ctx.fillStyle = '#aed581'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
   ctx.fillText('CONSEGUIDO ✓', 0, -22);
  }
  ctx.restore();
 }

 // Rótulo del géiser
 ctx.fillStyle = done ? '#c8e6c9' : '#ffe082';
 ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
 ctx.fillText(done ? `GÉISER ${s.id + 1} ACTIVO ✓` : `↑ GÉISER ${s.id + 1} · IMPULSO`, x, y - 36);

 ctx.restore();
}

export function drawFritaAtmosphere(ctx, g, cam, t, reduced = false) {
 const W = g.viewW || 1280, H = g.viewH || 720;
 ctx.save();

 // 1. Resplandor dorado de feria diner en la base
 const goldGlow = ctx.createLinearGradient(0, H - 140, 0, H);
 goldGlow.addColorStop(0, 'rgba(255, 179, 0, 0)');
 goldGlow.addColorStop(1, 'rgba(255, 143, 0, 0.15)');
 ctx.fillStyle = goldGlow; ctx.fillRect(0, H - 140, W, 140);

 // 2. Chispas doradas de freidora y neón flotante
 if (!reduced) {
  const seed = Math.floor(cam.x / 250);
  for (let i = 0; i < 18; i++) {
   const phase = (t * 0.03 + i * 13.9 + seed) % 100;
   const px = ((i * 123 + phase * 22) % W);
   const py = H - ((phase * 13 + i * 42) % H);
   const size = 1.5 + (i % 3) * 0.8;
   const flicker = 0.35 + Math.sin(t * 0.1 + i) * 0.25;
   ctx.fillStyle = i % 2 === 0 ? '#ffea00' : '#ff9100';
   ctx.globalAlpha = flicker;
   ctx.beginPath(); ctx.arc(px, py, size, 0, TAU); ctx.fill();
  }
 }

 ctx.restore();
}
