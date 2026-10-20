// BOSQUE DEL PRISMA — Procedural vector backdrop for Cuerno's personal world.
// 100% vector Canvas drawing: crisp alpine twilight, undulating Aurora Borealis ribbons,
// crystalline glass pines, glacier mountain peaks, and the Living Aurora constellation (AURORA VIVA). Zero external bitmaps.

export function drawCuernoForestBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;

 ctx.save();

 // Layer 0: Alpine twilight sky
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#061a22');
 skyGrad.addColorStop(0.35, '#0b323c');
 skyGrad.addColorStop(0.7, '#13545e');
 skyGrad.addColorStop(1, '#268a8e');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, w, h);

 // Undulating Aurora Borealis ribbons (curved bezier bands)
 ctx.save();
 for (let a = 0; a < 3; a++) {
  const waveTime = reduceMotion ? 0 : t * 0.04 + a * 1.5;
  const auroraY = h * 0.28 + a * 35;
  const auroraGrad = ctx.createLinearGradient(0, auroraY - 60, 0, auroraY + 60);
  if (a === 0) {
   auroraGrad.addColorStop(0, 'rgba(100, 255, 218, 0)');
   auroraGrad.addColorStop(0.5, 'rgba(100, 255, 218, 0.35)');
   auroraGrad.addColorStop(1, 'rgba(100, 255, 218, 0)');
  } else if (a === 1) {
   auroraGrad.addColorStop(0, 'rgba(128, 203, 196, 0)');
   auroraGrad.addColorStop(0.5, 'rgba(128, 203, 196, 0.4)');
   auroraGrad.addColorStop(1, 'rgba(128, 203, 196, 0)');
  } else {
   auroraGrad.addColorStop(0, 'rgba(206, 147, 216, 0)');
   auroraGrad.addColorStop(0.5, 'rgba(206, 147, 216, 0.3)');
   auroraGrad.addColorStop(1, 'rgba(206, 147, 216, 0)');
  }
  ctx.fillStyle = auroraGrad;
  ctx.beginPath();
  ctx.moveTo(0, auroraY);
  for (let x = 0; x <= w; x += 60) {
   const waveY = auroraY + Math.sin(x * 0.008 + waveTime) * 35 + Math.cos(x * 0.015 - waveTime * 0.7) * 20;
   ctx.lineTo(x, waveY);
  }
  ctx.lineTo(w, auroraY + 90);
  ctx.lineTo(0, auroraY + 90);
  ctx.closePath();
  ctx.fill();
 }
 ctx.restore();

 // Layer 1: Living Aurora Constellation (AURORA VIVA)
 const cuernoStars = [
  { x: 0.16, y: 0.14 }, { x: 0.22, y: 0.22 }, { x: 0.30, y: 0.18 },
  { x: 0.38, y: 0.12 }, { x: 0.46, y: 0.16 }, { x: 0.42, y: 0.26 },
  { x: 0.32, y: 0.28 }, { x: 0.26, y: 0.24 },
  { x: 0.38, y: 0.06 } // Antler tip
 ];
 ctx.save();
 ctx.strokeStyle = 'rgba(178, 255, 240, 0.48)';
 ctx.lineWidth = 1.4;
 ctx.beginPath();
 for (let i = 0; i < cuernoStars.length; i++) {
  const sx = (cuernoStars[i].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = cuernoStars[i].y * h;
  if (i === 0) ctx.moveTo(sx, sy);
  else ctx.lineTo(sx, sy);
 }
 ctx.stroke();

 for (const st of cuernoStars) {
  const sx = (st.x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = st.y * h;
  const pulse = reduceMotion ? 1 : (1 + Math.sin(t * 0.08 + st.x * 20) * 0.35);
  ctx.fillStyle = '#e0f2f1';
  ctx.beginPath();
  ctx.arc(sx, sy, 2.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 2: Distant glacier mountain peaks
 ctx.save();
 const peakX = -(cam.x * 0.06) % 450;
 ctx.fillStyle = 'rgba(8, 42, 52, 0.85)';
 ctx.beginPath();
 ctx.moveTo(0, h);
 for (let x = -450; x < w + 450; x += 180) {
  const px = x + peakX;
  const py = h * 0.58 + Math.sin(x * 0.015) * 45;
  ctx.lineTo(px, py);
  ctx.lineTo(px + 70, py - 40);
  ctx.lineTo(px + 140, py);
 }
 ctx.lineTo(w, h);
 ctx.closePath();
 ctx.fill();
 ctx.restore();

 // Layer 3: Crystalline glass pine trees & prism shards
 ctx.save();
 const pineBaseX = -(cam.x * 0.18) % 550;
 for (let px = -200; px < w + 550; px += 480) {
  const cx = px + pineBaseX;
  const cy = h * 0.74;

  // Glass Pine Tree
  ctx.fillStyle = '#104d55';
  ctx.strokeStyle = '#80cbc4';
  ctx.lineWidth = 2.5;

  // Tree tiers
  for (let tier = 0; tier < 3; tier++) {
   const ty = cy - 40 - tier * 30;
   const tw = 45 - tier * 10;
   ctx.beginPath();
   ctx.moveTo(cx, ty - 35);
   ctx.lineTo(cx + tw, ty);
   ctx.lineTo(cx - tw, ty);
   ctx.closePath();
   ctx.fill();
   ctx.stroke();
  }

  // Floating prism crystal
  const lx = cx + 80, ly = cy - 50;
  ctx.fillStyle = '#b2dfdb';
  ctx.beginPath();
  ctx.moveTo(lx, ly - 18);
  ctx.lineTo(lx + 10, ly);
  ctx.lineTo(lx, ly + 18);
  ctx.lineTo(lx - 10, ly);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = 'rgba(128, 203, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(lx, ly, 22 + Math.sin(t * 0.12 + cx) * 4, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 4: Shimmering prism glitter / rainbow motes
 if (!reduceMotion) {
  ctx.save();
  for (let i = 0; i < 24; i++) {
   const px = ((i * 123.7 + t * 18 - cam.x * 0.22) % (w + 100) + w + 100) % (w + 100);
   const py = ((i * 89.5 + Math.sin(t * 0.06 + i) * 32) % (h * 0.8) + h * 0.8) % (h * 0.8);
   const size = 1.6 + (i % 3);
   ctx.fillStyle = i % 2 === 0 ? 'rgba(128, 222, 234, 0.75)' : 'rgba(206, 147, 216, 0.75)';
   ctx.beginPath();
   ctx.arc(px, py, size, 0, Math.PI * 2);
   ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
