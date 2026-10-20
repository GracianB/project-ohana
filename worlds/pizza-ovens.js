// REINO DEL HORNO — Procedural vector backdrop for Pizza's personal world.
// 100% vector Canvas drawing: 8 parallax layers — volcanic brick oven sky,
// glowing hearth oven sun, HORNO ESTELAR constellation, distant chimney skyline,
// giant pizza silhouettes, brick oven arches, molten cheese stalactites, ember sparks.
// Zero external bitmaps.

function _ovenArch(ctx,x,y,w,h){
 ctx.beginPath();
 ctx.moveTo(x,y+h);ctx.lineTo(x,y+h*0.3);
 ctx.quadraticCurveTo(x+w/2,y-h*0.15,x+w,y+h*0.3);
 ctx.lineTo(x+w,y+h);ctx.closePath();
}

function _chimney(ctx,x,y,w,h){
 ctx.fillRect(x-w/2,y-h,w,h);
 ctx.fillRect(x-w*0.7,y-h-10,w*1.4,10);
}

function _pizzaSilhouette(ctx,x,y,r){
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 // slice lines
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();
 }
}

function _cheeseDrip(ctx,x,y,w,h){
 ctx.beginPath();ctx.moveTo(x-w/2,y);
 ctx.lineTo(x-w/2,y+h*0.4);
 ctx.quadraticCurveTo(x-w/2,y+h,x,y+h);
 ctx.quadraticCurveTo(x+w/2,y+h,x+w/2,y+h*0.4);
 ctx.lineTo(x+w/2,y);ctx.closePath();
}

export function drawPizzaOvensBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;
 const cam0 = cam.x || 0;

 ctx.save();

 // ── Layer 0: Warm stone oven vault sky gradient ──────────────────────────
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#2e1008');
 skyGrad.addColorStop(0.35, '#5c1f0d');
 skyGrad.addColorStop(0.7, '#a83c16');
 skyGrad.addColorStop(1, '#ff6e40');
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, w, h);

 // ── Layer 1: Glowing Hearth Oven Sun (HORNO SOLAR) ──────────────────────
 const ovenX = ((w * 0.74 - cam0 * 0.015) % (w * 2) + w * 2) % (w * 2) - w * 0.5;
 const ovenY = h * 0.28;
 const pulse = reduceMotion ? 0 : Math.sin(t * 0.06) * 6;
 const ovenGrad = ctx.createRadialGradient(ovenX, ovenY, 12, ovenX, ovenY, 72 + pulse);
 ovenGrad.addColorStop(0, '#fff3e0');
 ovenGrad.addColorStop(0.4, '#ffab40');
 ovenGrad.addColorStop(0.8, '#ff3d00');
 ovenGrad.addColorStop(1, 'rgba(255,61,0,0)');
 ctx.fillStyle = ovenGrad;
 ctx.beginPath();ctx.arc(ovenX, ovenY, 72 + pulse, 0, Math.PI * 2);ctx.fill();
 // Oven heat rays
 if(!reduceMotion){
  ctx.strokeStyle = 'rgba(255,200,100,0.18)';ctx.lineWidth = 2;
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4+(t*0.01);
   ctx.beginPath();ctx.moveTo(ovenX+Math.cos(a)*76,ovenY+Math.sin(a)*76);
   ctx.lineTo(ovenX+Math.cos(a)*110,ovenY+Math.sin(a)*110);ctx.stroke();
  }
 }

 // ── Layer 2: HORNO ESTELAR Constellation ───────────────────────────────
 const pizzaStars = [
  { x: 0.18, y: 0.16 }, { x: 0.25, y: 0.12 }, { x: 0.34, y: 0.16 },
  { x: 0.38, y: 0.24 }, { x: 0.30, y: 0.28 }, { x: 0.20, y: 0.25 },
  { x: 0.27, y: 0.20 }
 ];
 ctx.save();
 ctx.strokeStyle = 'rgba(255,230,190,0.50)';ctx.lineWidth = 1;
 const cx7 = pizzaStars[6].x * w, cy7 = pizzaStars[6].y * h;
 for(let i=0;i<6;i++){
  const s1=pizzaStars[i],s2=pizzaStars[(i+1)%6];
  ctx.beginPath();ctx.moveTo(s1.x*w,s1.y*h);ctx.lineTo(s2.x*w,s2.y*h);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s1.x*w,s1.y*h);ctx.lineTo(cx7,cy7);ctx.stroke();
 }
 for(const ps of pizzaStars){
  ctx.fillStyle='rgba(255,240,210,0.9)';
  ctx.beginPath();ctx.arc(ps.x*w,ps.y*h,2.2,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle='rgba(255,210,140,0.45)';ctx.font='10px sans-serif';ctx.textAlign='left';
 ctx.fillText('HORNO ESTELAR',pizzaStars[1].x*w+6,pizzaStars[1].y*h-4);
 ctx.restore();

 // ── Layer 3: Distant chimney skyline silhouettes (far parallax) ─────────
 const chimneyOff = ((cam0 * 0.08) % (w * 1.6) + w * 1.6) % (w * 1.6);
 ctx.fillStyle = '#1a0804';
 const chimneyData = [
  [0.05,0.55,14,120],[0.14,0.5,18,150],[0.22,0.58,12,100],[0.30,0.48,20,165],
  [0.42,0.52,15,130],[0.55,0.46,22,170],[0.63,0.55,13,108],[0.72,0.50,18,145],
  [0.82,0.56,14,120],[0.92,0.48,20,158]
 ];
 for(const [rx,ry,cw,ch] of chimneyData){
  const cx=rx*w*1.6-chimneyOff;
  _chimney(ctx,cx,ry*h,cw,ch);
  ctx.fill();
  // smoke puff
  if(!reduceMotion){
   ctx.fillStyle='rgba(80,30,10,0.3)';
   const sy=ry*h-ch-(t*0.5%30);
   ctx.beginPath();ctx.arc(cx,sy,8,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#1a0804';
 }

 // ── Layer 4: Giant pizza silhouettes (mid parallax) ─────────────────────
 const pizzaOff = ((cam0 * 0.18) % (w * 1.8) + w * 1.8) % (w * 1.8);
 ctx.fillStyle='rgba(60,18,5,0.65)';
 ctx.strokeStyle='rgba(80,25,8,0.4)';ctx.lineWidth=1.5;
 const pizzaData=[
  [0.1,0.42,55],[0.38,0.38,68],[0.65,0.45,52],[0.92,0.40,62]
 ];
 for(const [rx,ry,r] of pizzaData){
  const px=rx*w*1.8-pizzaOff;
  _pizzaSilhouette(ctx,px,ry*h,r);ctx.fill();ctx.stroke();
 }

 // ── Layer 5: Brick oven arches (near-mid parallax) ──────────────────────
 const archOff = ((cam0 * 0.28) % (w * 1.5) + w * 1.5) % (w * 1.5);
 ctx.fillStyle='#3b1005';ctx.strokeStyle='#7a2d12';ctx.lineWidth=3;
 const archData=[[0.08,0.72,160,180],[0.32,0.68,180,200],[0.60,0.74,155,175],[0.88,0.70,170,195]];
 for(const [rx,ry,aw,ah] of archData){
  const ax=rx*w*1.5-archOff;
  _ovenArch(ctx,ax-aw/2,ry*h,aw,ah);
  ctx.fill();ctx.stroke();
  // glowing oven window inside arch
  ctx.fillStyle='rgba(255,150,40,0.35)';
  ctx.beginPath();ctx.ellipse(ax,ry*h+ah*0.45,aw*0.22,ah*0.22,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3b1005';
 }

 // ── Layer 6: Molten cheese stalactites from ceiling ──────────────────────
 const dripOff = ((cam0 * 0.40) % (w * 1.4) + w * 1.4) % (w * 1.4);
 const dripData=[
  [0.04,22,45],[0.13,28,55],[0.22,18,38],[0.31,32,60],[0.40,22,44],
  [0.49,26,52],[0.58,18,36],[0.67,30,58],[0.76,20,42],[0.85,28,54],[0.94,22,46]
 ];
 for(const [rx,cw,ch] of dripData){
  const dripX=rx*w*1.4-dripOff;
  const dripGrad=ctx.createLinearGradient(dripX,0,dripX,ch);
  dripGrad.addColorStop(0,'rgba(255,214,80,0.85)');
  dripGrad.addColorStop(0.6,'rgba(255,180,30,0.7)');
  dripGrad.addColorStop(1,'rgba(255,150,0,0)');
  ctx.fillStyle=dripGrad;
  _cheeseDrip(ctx,dripX-cw/2,0,cw,ch);ctx.fill();
 }

 // ── Layer 7: Ember/spark particles (near, animated) ──────────────────────
 if(!reduceMotion){
  ctx.fillStyle='rgba(255,220,80,0.8)';
  for(let i=0;i<22;i++){
   const px=(((i*137+cam0*0.6+t*0.9)%(w*1.1))+w*1.1)%(w*1.1);
   const py=h-(((i*79+t*(0.6+i%4*0.15))%(h*0.85))+h*0.1);
   const sr=1+i%3;
   ctx.beginPath();ctx.arc(px,py,sr,0,Math.PI*2);ctx.fill();
  }
 }

 ctx.restore();
}
