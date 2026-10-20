// VALLE DE LOS GIGANTES — Procedural vector backdrop for Dino's personal world.
// 100% vector Canvas drawing: prehistoric amber sky, ancient ferns, giant dinosaur ribcages,
// monolith ridges, and the Ancient Guardian constellation (GUARDIÁN ANTIGUO). Zero external bitmaps.

export function drawDinoCraterBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;

 ctx.save();

 // Layer 0: Deep prehistoric twilight sky
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#2e1c0c');
 skyGrad.addColorStop(0.35, '#4a2810');
 skyGrad.addColorStop(0.7, '#8c501c');
 skyGrad.addColorStop(1, '#d48834');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, w, h);

 // Ancient Amber Moon
 const moonX = w * 0.78 - (cam.x * 0.015) % (w * 1.5);
 const moonY = h * 0.22;
 const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 65);
 moonGrad.addColorStop(0, '#fff4cc');
 moonGrad.addColorStop(0.4, '#f5c862');
 moonGrad.addColorStop(0.8, '#d48828');
 moonGrad.addColorStop(1, 'rgba(212,136,40,0)');
 ctx.fillStyle = moonGrad;
 ctx.beginPath();
 ctx.arc(moonX, moonY, 65, 0, Math.PI * 2);
 ctx.fill();

 // Layer 1: Ancient Guardian Constellation (GUARDIÁN ANTIGUO)
 const starStars = [
  { x: 0.15, y: 0.18 }, { x: 0.22, y: 0.12 }, { x: 0.32, y: 0.15 },
  { x: 0.38, y: 0.24 }, { x: 0.28, y: 0.28 }, { x: 0.18, y: 0.26 },
  { x: 0.44, y: 0.20 }, { x: 0.52, y: 0.14 }, { x: 0.58, y: 0.22 }
 ];
 ctx.save();
 ctx.strokeStyle = 'rgba(255, 235, 170, 0.45)';
 ctx.lineWidth = 1.4;
 ctx.beginPath();
 for (let i = 0; i < starStars.length; i++) {
  const sx = (starStars[i].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = starStars[i].y * h;
  if (i === 0) ctx.moveTo(sx, sy);
  else ctx.lineTo(sx, sy);
 }
 ctx.stroke();

 for (const st of starStars) {
  const sx = (st.x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = st.y * h;
  const pulse = reduceMotion ? 1 : (1 + Math.sin(t * 0.08 + st.x * 20) * 0.35);
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath();
  ctx.arc(sx, sy, 2.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 2: Distant prehistoric monoliths and mesa silhouettes
 ctx.save();
 const mesaX = -(cam.x * 0.06) % 400;
 ctx.fillStyle = 'rgba(56, 32, 14, 0.85)';
 ctx.beginPath();
 ctx.moveTo(0, h);
 for (let x = -400; x < w + 400; x += 180) {
  const mx = x + mesaX;
  const my = h * 0.58 + Math.sin(x * 0.012) * 45;
  ctx.lineTo(mx, my);
  ctx.lineTo(mx + 60, my - 25);
  ctx.lineTo(mx + 120, my - 20);
  ctx.lineTo(mx + 180, my + 15);
 }
 ctx.lineTo(w, h);
 ctx.closePath();
 ctx.fill();
 ctx.restore();

 // Layer 3: Giant fossil ribcage silhouettes & ancient cycad palms
 ctx.save();
 const ribBaseX = -(cam.x * 0.18) % 650;
 ctx.strokeStyle = 'rgba(40, 22, 10, 0.9)';
 ctx.lineWidth = 6;
 ctx.lineCap = 'round';
 for (let rx = -200; rx < w + 600; rx += 550) {
  const cx = rx + ribBaseX;
  const cy = h * 0.72;
  // Rib arches
  for (let r = 0; r < 5; r++) {
   const ribX = cx + r * 35;
   ctx.beginPath();
   ctx.moveTo(ribX, cy);
   ctx.quadraticCurveTo(ribX + 18, cy - 80 - r * 8, ribX + 45, cy - 20);
   ctx.stroke();
  }
  // Ancient Fern / Cycad Palm
  const palmX = cx - 90;
  const palmY = cy + 10;
  ctx.fillStyle = '#1c1006';
  ctx.beginPath();
  ctx.moveTo(palmX - 6, palmY);
  ctx.quadraticCurveTo(palmX, palmY - 90, palmX + 8, palmY - 110);
  ctx.quadraticCurveTo(palmX + 12, palmY - 90, palmX + 6, palmY);
  ctx.fill();
  // Fronds
  for (let f = -3; f <= 3; f++) {
   ctx.beginPath();
   ctx.moveTo(palmX + 8, palmY - 110);
   ctx.quadraticCurveTo(palmX + f * 35, palmY - 130 + Math.abs(f) * 10, palmX + f * 55, palmY - 95 + Math.abs(f) * 15);
   ctx.stroke();
  }
 }
 ctx.restore();

 // Layer 4: Floating golden prehistoric pollen / spore particles
 if (!reduceMotion) {
  ctx.save();
  for (let i = 0; i < 22; i++) {
   const px = ((i * 137.5 + t * 22 - cam.x * 0.25) % (w + 100) + w + 100) % (w + 100);
   const py = ((i * 89.3 + Math.sin(t * 0.05 + i) * 35) % (h * 0.8) + h * 0.8) % (h * 0.8);
   const size = 1.5 + (i % 3);
   ctx.fillStyle = 'rgba(255, 215, 120, 0.65)';
   ctx.beginPath();
   ctx.arc(px, py, size, 0, Math.PI * 2);
   ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
