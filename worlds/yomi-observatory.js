// OBSERVATORIO ASTRAL — Procedural vector backdrop for Yomi's personal world.
// 100% vector Canvas drawing: deep cosmic indigo nebula, floating Torii gates, ethereal spirit wisps,
// floating paper charm talismans, and the Eternal Constellation (CONSTELACIÓN ETERNA). Zero external bitmaps.

export function drawYomiObservatoryBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;

 ctx.save();

 // Layer 0: Deep cosmic indigo & spiritual violet sky
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#0c0818');
 skyGrad.addColorStop(0.35, '#1e1438');
 skyGrad.addColorStop(0.7, '#382260');
 skyGrad.addColorStop(1, '#68459b');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, w, h);

 // Spiritual Ethereal Moon / Astral Halo
 const moonX = w * 0.76 - (cam.x * 0.015) % (w * 1.5);
 const moonY = h * 0.24;
 const moonGrad = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 70);
 moonGrad.addColorStop(0, '#f3e5f5');
 moonGrad.addColorStop(0.4, '#ce93d8');
 moonGrad.addColorStop(0.8, '#ab47bc');
 moonGrad.addColorStop(1, 'rgba(171,71,188,0)');
 ctx.fillStyle = moonGrad;
 ctx.beginPath();
 ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
 ctx.fill();

 // Layer 1: Eternal Constellation (CONSTELACIÓN ETERNA)
 const yomiStars = [
  { x: 0.16, y: 0.14 }, { x: 0.24, y: 0.18 }, { x: 0.32, y: 0.12 },
  { x: 0.40, y: 0.18 }, { x: 0.34, y: 0.26 }, { x: 0.22, y: 0.26 },
  { x: 0.28, y: 0.20 }, // Center star
  { x: 0.46, y: 0.24 }, { x: 0.54, y: 0.16 }
 ];
 ctx.save();
 ctx.strokeStyle = 'rgba(230, 205, 255, 0.48)';
 ctx.lineWidth = 1.4;
 ctx.beginPath();
 for (let i = 0; i < yomiStars.length; i++) {
  const sx = (yomiStars[i].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = yomiStars[i].y * h;
  if (i === 0) ctx.moveTo(sx, sy);
  else ctx.lineTo(sx, sy);
 }
 ctx.stroke();

 for (const st of yomiStars) {
  const sx = (st.x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = st.y * h;
  const pulse = reduceMotion ? 1 : (1 + Math.sin(t * 0.08 + st.x * 20) * 0.35);
  ctx.fillStyle = '#f8edff';
  ctx.beginPath();
  ctx.arc(sx, sy, 2.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 2: Distant floating Torii gate silhouettes
 ctx.save();
 const toriiX = -(cam.x * 0.06) % 450;
 ctx.fillStyle = 'rgba(28, 16, 48, 0.85)';
 ctx.beginPath();
 ctx.moveTo(0, h);
 for (let x = -450; x < w + 450; x += 170) {
  const tx = x + toriiX;
  const ty = h * 0.60 + Math.sin(x * 0.015) * 35;
  ctx.lineTo(tx, ty);
  ctx.lineTo(tx + 40, ty - 25);
  ctx.lineTo(tx + 120, ty - 25);
  ctx.lineTo(tx + 170, ty);
 }
 ctx.lineTo(w, h);
 ctx.closePath();
 ctx.fill();
 ctx.restore();

 // Layer 3: Astral Torii Gates & floating talisman ofuda
 ctx.save();
 const shrineBaseX = -(cam.x * 0.18) % 550;
 for (let sx = -200; sx < w + 550; sx += 480) {
  const cx = sx + shrineBaseX;
  const cy = h * 0.74;

  // Floating Torii Gate
  ctx.fillStyle = '#ba68c8';
  ctx.strokeStyle = '#e1bee7';
  ctx.lineWidth = 3;

  // Pillars
  ctx.fillRect(cx - 35, cy - 80, 10, 80);
  ctx.fillRect(cx + 25, cy - 80, 10, 80);

  // Lintels
  ctx.fillRect(cx - 45, cy - 85, 90, 8);
  ctx.fillRect(cx - 52, cy - 96, 104, 10);

  // Talisman Ofuda ribbons
  for (let s = 0; s < 3; s++) {
   const ox = cx - 20 + s * 20;
   const oy = cy - 70;
   ctx.fillStyle = '#fff9c4';
   ctx.fillRect(ox, oy, 8, 22);
   ctx.fillStyle = '#d32f2f';
   ctx.fillRect(ox + 2, oy + 4, 4, 14);
  }

  // Spirit wisp lantern
  const lx = cx, ly = cy - 40;
  ctx.fillStyle = '#ea80fc';
  ctx.beginPath();
  ctx.arc(lx, ly, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(234, 128, 252, 0.35)';
  ctx.beginPath();
  ctx.arc(lx, ly, 22 + Math.sin(t * 0.12 + cx) * 4, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 4: Floating ethereal spirit will-o'-the-wisps
 if (!reduceMotion) {
  ctx.save();
  for (let i = 0; i < 24; i++) {
   const px = ((i * 121.7 + t * 18 - cam.x * 0.22) % (w + 100) + w + 100) % (w + 100);
   const py = ((i * 87.5 + Math.sin(t * 0.06 + i) * 32) % (h * 0.8) + h * 0.8) % (h * 0.8);
   const size = 1.6 + (i % 3);
   ctx.fillStyle = 'rgba(225, 190, 255, 0.7)';
   ctx.beginPath();
   ctx.arc(px, py, size, 0, Math.PI * 2);
   ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
