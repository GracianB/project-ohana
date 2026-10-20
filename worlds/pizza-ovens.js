// REINO DEL HORNO — Procedural vector backdrop for Pizza's personal world.
// 100% vector Canvas drawing: terracotta brick arches, glowing oven vaults, melted cheese stalactites,
// volcanic chimney silhouettes, and the Stellar Oven constellation (HORNO ESTELAR). Zero external bitmaps.

export function drawPizzaOvensBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;

 ctx.save();

 // Layer 0: Warm stone oven vault glow
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#2e1008');
 skyGrad.addColorStop(0.35, '#5c1f0d');
 skyGrad.addColorStop(0.7, '#a83c16');
 skyGrad.addColorStop(1, '#ff6e40');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, w, h);

 // Glowing Hearth Vent (giant radiant oven sun)
 const ovenX = w * 0.74 - (cam.x * 0.015) % (w * 1.5);
 const ovenY = h * 0.28;
 const ovenGrad = ctx.createRadialGradient(ovenX, ovenY, 15, ovenX, ovenY, 70);
 ovenGrad.addColorStop(0, '#fff3e0');
 ovenGrad.addColorStop(0.4, '#ffab40');
 ovenGrad.addColorStop(0.8, '#ff3d00');
 ovenGrad.addColorStop(1, 'rgba(255,61,0,0)');
 ctx.fillStyle = ovenGrad;
 ctx.beginPath();
 ctx.arc(ovenX, ovenY, 70, 0, Math.PI * 2);
 ctx.fill();

 // Layer 1: Stellar Hearth Constellation (HORNO ESTELAR)
 const pizzaStars = [
  { x: 0.18, y: 0.16 }, { x: 0.25, y: 0.12 }, { x: 0.34, y: 0.16 },
  { x: 0.38, y: 0.24 }, { x: 0.30, y: 0.28 }, { x: 0.20, y: 0.25 },
  { x: 0.27, y: 0.20 } // Center star
 ];
 ctx.save();
 ctx.strokeStyle = 'rgba(255, 230, 190, 0.48)';
 ctx.lineWidth = 1.4;
 ctx.beginPath();
 // Draw perimeter
 for (let i = 0; i < 6; i++) {
  const sx = (pizzaStars[i].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = pizzaStars[i].y * h;
  if (i === 0) ctx.moveTo(sx, sy);
  else ctx.lineTo(sx, sy);
 }
 ctx.closePath();
 ctx.stroke();

 // Connect to center star
 const cx = (pizzaStars[6].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
 const cy = pizzaStars[6].y * h;
 for (let i = 0; i < 6; i++) {
  const sx = (pizzaStars[i].x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = pizzaStars[i].y * h;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(sx, sy);
  ctx.stroke();
 }

 for (const st of pizzaStars) {
  const sx = (st.x * w * 1.3 - cam.x * 0.02) % (w * 1.2);
  const sy = st.y * h;
  const pulse = reduceMotion ? 1 : (1 + Math.sin(t * 0.08 + st.x * 20) * 0.35);
  ctx.fillStyle = '#fffde7';
  ctx.beginPath();
  ctx.arc(sx, sy, 2.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 2: Distant stone arches & brick chimneys
 ctx.save();
 const archX = -(cam.x * 0.06) % 450;
 ctx.fillStyle = 'rgba(78, 26, 12, 0.85)';
 ctx.beginPath();
 ctx.moveTo(0, h);
 for (let x = -450; x < w + 450; x += 160) {
  const ax = x + archX;
  const ay = h * 0.60 + Math.sin(x * 0.015) * 35;
  ctx.lineTo(ax, ay);
  ctx.lineTo(ax + 50, ay - 30);
  ctx.lineTo(ax + 110, ay - 30);
  ctx.lineTo(ax + 160, ay);
 }
 ctx.lineTo(w, h);
 ctx.closePath();
 ctx.fill();
 ctx.restore();

 // Layer 3: Terracotta masonry arches & melted cheese stalactites
 ctx.save();
 const masonryBaseX = -(cam.x * 0.18) % 550;
 ctx.strokeStyle = '#3e1508';
 ctx.lineWidth = 6;
 for (let mx = -200; mx < w + 550; mx += 480) {
  const cx = mx + masonryBaseX;
  const cy = h * 0.74;

  // Brick Arch
  ctx.beginPath();
  ctx.arc(cx + 60, cy - 40, 70, Math.PI, 0);
  ctx.stroke();

  // Cheese stalactites
  ctx.fillStyle = '#ffd54f';
  for (let s = 0; s < 4; s++) {
   const stalX = cx + 20 + s * 30;
   const len = 25 + Math.sin(s * 1.5 + cx) * 12;
   ctx.beginPath();
   ctx.moveTo(stalX - 6, cy - 80);
   ctx.quadraticCurveTo(stalX, cy - 80 + len, stalX + 6, cy - 80);
   ctx.fill();
  }

  // Glowing oven window
  const ox = cx + 60, oy = cy - 25;
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.arc(ox, oy, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 112, 67, 0.35)';
  ctx.beginPath();
  ctx.arc(ox, oy, 28 + Math.sin(t * 0.12 + cx) * 4, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();

 // Layer 4: Floating oven sparks & golden oregano embers
 if (!reduceMotion) {
  ctx.save();
  for (let i = 0; i < 24; i++) {
   const px = ((i * 123.7 + t * 20 - cam.x * 0.22) % (w + 100) + w + 100) % (w + 100);
   const py = ((i * 88.5 + Math.sin(t * 0.06 + i) * 30) % (h * 0.8) + h * 0.8) % (h * 0.8);
   const size = 1.6 + (i % 3);
   ctx.fillStyle = 'rgba(255, 204, 128, 0.7)';
   ctx.beginPath();
   ctx.arc(px, py, size, 0, Math.PI * 2);
   ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
