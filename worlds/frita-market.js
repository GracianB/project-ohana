// MERCADO DORADO — Procedural vector backdrop for Frita's personal world.
// 100% vector Canvas drawing: golden sunset beach, coastal lanterns, market stall canopies,
// palm silhouettes, and the Golden Feast constellation (BANQUETE DORADO). Zero external bitmaps.

export function drawFritaMarketBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;

 ctx.save();

 // Layer 0: Warm golden sunset sky
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#3e1b24');
 skyGrad.addColorStop(0.35, '#8c3a27');
 skyGrad.addColorStop(0.7, '#d96b27');
 skyGrad.addColorStop(1, '#ffc043');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, w, h);

 // Golden Sun disc setting on horizon
 const sunX = w * 0.72 - (cam.x * 0.015) % (w * 1.5);
 const sunY = h * 0.32;
 const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 75);
 sunGrad.addColorStop(0, '#fffbe6');
 sunGrad.addColorStop(0.4, '#ffd54f');
 sunGrad.addColorStop(0.8, '#ff9800');
 sunGrad.addColorStop(1, 'rgba(255,152,0,0)');
 ctx.fillStyle = sunGrad;
 ctx.beginPath();
 ctx.arc(sunX, sunY, 75, 0, Math.PI * 2);
 ctx.fill();

 // Layer 1: Golden Feast Constellation (BANQUETE DORADO)
 const skilletStars = [
  { x: 0.16, y: 0.16 }, { x: 0.24, y: 0.14 }, { x: 0.32, y: 0.19 },
  { x: 0.28, y: 0.26 }, { x: 0.18, y: 0.25 }, { x: 0.38, y: 0.15 },
  { x: 0.46, y: 0.12 }, { x: 0.54, y: 0.18 }, { x: 0.48, y: 0.24 }
 ];
 ctx.save();
 ctx.strokeStyle = 'rgba(255, 240, 180, 0.48)';
 ctx.lineWidth = 1.4;
 ctx.beginPath();
 for (let i = 0; i < skilletStars.length; i++) {
  const sx = (skilletStars[i].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = skilletStars[i].y * h;
  if (i === 0) ctx.moveTo(sx, sy);
  else ctx.lineTo(sx, sy);
 }
 ctx.stroke();

 for (const st of skilletStars) {
  const sx = (st.x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = st.y * h;
  const pulse = reduceMotion ? 1 : (1 + Math.sin(t * 0.08 + st.x * 20) * 0.35);
  ctx.fillStyle = '#fffde7';
  ctx.beginPath();
  ctx.arc(sx, sy, 2.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 2: Distant archipelago dunes & coastal silhouettes
 ctx.save();
 const duneX = -(cam.x * 0.06) % 450;
 ctx.fillStyle = 'rgba(110, 45, 25, 0.82)';
 ctx.beginPath();
 ctx.moveTo(0, h);
 for (let x = -450; x < w + 450; x += 150) {
  const dx = x + duneX;
  const dy = h * 0.62 + Math.sin(x * 0.015) * 35;
  ctx.lineTo(dx, dy);
 }
 ctx.lineTo(w, h);
 ctx.closePath();
 ctx.fill();
 ctx.restore();

 // Layer 3: Market stall canopies, bunting flags & palms
 ctx.save();
 const stallBaseX = -(cam.x * 0.18) % 550;
 for (let sx = -200; sx < w + 550; sx += 480) {
  const cx = sx + stallBaseX;
  const cy = h * 0.74;

  // Palm trunk & fronds
  ctx.fillStyle = '#421a10';
  ctx.beginPath();
  ctx.moveTo(cx - 80, cy + 20);
  ctx.quadraticCurveTo(cx - 65, cy - 80, cx - 40, cy - 110);
  ctx.quadraticCurveTo(cx - 55, cy - 80, cx - 72, cy + 20);
  ctx.fill();

  ctx.strokeStyle = '#2b1008';
  ctx.lineWidth = 4;
  for (let f = -2; f <= 2; f++) {
   ctx.beginPath();
   ctx.moveTo(cx - 40, cy - 110);
   ctx.quadraticCurveTo(cx - 40 + f * 35, cy - 125, cx - 40 + f * 55, cy - 90 + Math.abs(f) * 12);
   ctx.stroke();
  }

  // Market canopy
  ctx.fillStyle = '#ff8f00';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 50);
  ctx.lineTo(cx + 120, cy - 50);
  ctx.lineTo(cx + 140, cy - 25);
  ctx.lineTo(cx - 20, cy - 25);
  ctx.closePath();
  ctx.fill();

  // Striped scalloped valance
  for (let s = 0; s < 5; s++) {
   ctx.fillStyle = s % 2 === 0 ? '#ffca28' : '#e65100';
   ctx.fillRect(cx - 15 + s * 30, cy - 25, 28, 12);
  }

  // Lantern
  const lx = cx + 60, ly = cy - 10;
  ctx.fillStyle = '#ffeb3b';
  ctx.beginPath();
  ctx.arc(lx, ly, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 235, 59, 0.35)';
  ctx.beginPath();
  ctx.arc(lx, ly, 18 + Math.sin(t * 0.1 + cx) * 3, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 4: Sizzling golden aroma sparks & beach fireflies
 if (!reduceMotion) {
  ctx.save();
  for (let i = 0; i < 24; i++) {
   const px = ((i * 127.3 + t * 20 - cam.x * 0.22) % (w + 100) + w + 100) % (w + 100);
   const py = ((i * 91.5 + Math.sin(t * 0.06 + i) * 30) % (h * 0.8) + h * 0.8) % (h * 0.8);
   const size = 1.6 + (i % 3);
   ctx.fillStyle = 'rgba(255, 235, 120, 0.7)';
   ctx.beginPath();
   ctx.arc(px, py, size, 0, Math.PI * 2);
   ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
