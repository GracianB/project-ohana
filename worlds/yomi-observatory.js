// OBSERVATORIO ASTRAL — Procedural vector backdrop for Yomi's personal world.
// 100% vector Canvas drawing: 8 parallax layers — deep cosmic indigo void sky,
// astral spirit moon with halo, CONSTELACIÓN ETERNA constellation (radial spoke),
// distant torii temple silhouettes, floating spirit orbs, torii gate arches,
// talisman ofuda ribbons, animated soul wisp particles.
// Zero external bitmaps.

function _torii(ctx,x,y,w,h){
 const pillarW=w*0.1;
 // Two pillars
 ctx.fillRect(x,y,pillarW,h);
 ctx.fillRect(x+w-pillarW,y,pillarW,h);
 // Kasagi (top lintel — slightly overhangs)
 ctx.fillRect(x-pillarW*0.5,y-pillarW*1.2,w+pillarW,pillarW*1.2);
 // Nuki (middle crossbeam)
 ctx.fillRect(x-pillarW*0.2,y+h*0.2,w+pillarW*0.4,pillarW*0.8);
}

function _spiritOrb(ctx,x,y,r,alpha,t){
 const grad=ctx.createRadialGradient(x,y,r*0.2,x,y,r);
 grad.addColorStop(0,`rgba(225,190,231,${alpha})`);
 grad.addColorStop(0.6,`rgba(171,71,188,${alpha*0.6})`);
 grad.addColorStop(1,'rgba(171,71,188,0)');
 ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}

function _ofuda(ctx,x,y,w,h,col){
 ctx.fillStyle=col;
 ctx.fillRect(x-w/2,y-h,w,h);
 // decorative stripe
 ctx.fillStyle='rgba(255,80,80,0.6)';
 ctx.fillRect(x-w/2,y-h,w*0.25,h);
 // bottom fringe
 ctx.fillStyle=col;
 for(let i=0;i<3;i++){
  ctx.fillRect(x-w/2+i*(w/3),y,w/3-2,8);
 }
}

export function drawYomiObservatoryBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;
 const cam0 = cam.x || 0;

 ctx.save();

 // ── Layer 0: Deep cosmic indigo void sky ────────────────────────────────
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#080612');
 skyGrad.addColorStop(0.30, '#120c2c');
 skyGrad.addColorStop(0.65, '#2a1858');
 skyGrad.addColorStop(1, '#5c3890');
 ctx.fillStyle = skyGrad;ctx.fillRect(0, 0, w, h);

 // ── Layer 1: Astral spirit moon with pulsing halo ───────────────────────
 const moonX = ((w * 0.76 - cam0 * 0.015) % (w * 2) + w * 2) % (w * 2) - w * 0.5;
 const moonY = h * 0.24;
 const haloPulse = reduceMotion ? 0 : Math.sin(t * 0.08) * 8;
 // outer halo
 ctx.fillStyle = 'rgba(171,71,188,0.10)';
 ctx.beginPath();ctx.arc(moonX,moonY,95+haloPulse,0,Math.PI*2);ctx.fill();
 ctx.fillStyle = 'rgba(206,147,216,0.18)';
 ctx.beginPath();ctx.arc(moonX,moonY,78+haloPulse*0.5,0,Math.PI*2);ctx.fill();
 // moon core
 const moonGrad = ctx.createRadialGradient(moonX,moonY,10,moonX,moonY,58);
 moonGrad.addColorStop(0,'#f3e5f5');
 moonGrad.addColorStop(0.45,'#ce93d8');
 moonGrad.addColorStop(0.85,'#9c27b0');
 moonGrad.addColorStop(1,'rgba(156,39,176,0)');
 ctx.fillStyle=moonGrad;ctx.beginPath();ctx.arc(moonX,moonY,58,0,Math.PI*2);ctx.fill();

 // ── Layer 2: CONSTELACIÓN ETERNA (radial spoke from center) ────────────
 const yomiStars = [
  {x:0.16,y:0.14},{x:0.24,y:0.18},{x:0.32,y:0.12},
  {x:0.40,y:0.18},{x:0.34,y:0.26},{x:0.22,y:0.26},
  {x:0.28,y:0.20}, // center
  {x:0.46,y:0.24},{x:0.54,y:0.16}
 ];
 ctx.save();
 const cxS=yomiStars[6].x*w,cyS=yomiStars[6].y*h;
 ctx.strokeStyle='rgba(206,147,216,0.55)';ctx.lineWidth=1;
 // outer perimeter (0-5) as hexagon
 for(let i=0;i<6;i++){
  const a=yomiStars[i],b=yomiStars[(i+1)%6];
  ctx.beginPath();ctx.moveTo(a.x*w,a.y*h);ctx.lineTo(b.x*w,b.y*h);ctx.stroke();
 }
 // spokes to center
 for(let i=0;i<6;i++){
  ctx.beginPath();ctx.moveTo(yomiStars[i].x*w,yomiStars[i].y*h);ctx.lineTo(cxS,cyS);ctx.stroke();
 }
 // extension stars (7,8) connected to nearest perimeter
 ctx.strokeStyle='rgba(206,147,216,0.35)';
 ctx.beginPath();ctx.moveTo(yomiStars[3].x*w,yomiStars[3].y*h);ctx.lineTo(yomiStars[7].x*w,yomiStars[7].y*h);ctx.stroke();
 ctx.beginPath();ctx.moveTo(yomiStars[7].x*w,yomiStars[7].y*h);ctx.lineTo(yomiStars[8].x*w,yomiStars[8].y*h);ctx.stroke();
 for(const ys of yomiStars){
  ctx.fillStyle='rgba(240,220,255,0.92)';
  ctx.beginPath();ctx.arc(ys.x*w,ys.y*h,2.2,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle='rgba(206,180,255,0.45)';ctx.font='10px sans-serif';ctx.textAlign='left';
 ctx.fillText('CONSTELACIÓN ETERNA',yomiStars[2].x*w+6,yomiStars[2].y*h-5);
 ctx.restore();

 // ── Layer 3: Distant torii temple silhouettes (far parallax) ────────────
 const toriiOff = ((cam0 * 0.07) % (w * 1.8) + w * 1.8) % (w * 1.8);
 ctx.fillStyle='#140e28';
 const toriiData=[[0.06,0.55,70,120],[0.22,0.50,85,140],[0.40,0.57,65,110],[0.58,0.52,80,135],[0.75,0.55,72,125],[0.92,0.48,88,145]];
 for(const [rx,ry,tw,th] of toriiData){
  _torii(ctx,rx*w*1.8-toriiOff-tw/2,ry*h,tw,th);ctx.fill();
 }

 // ── Layer 4: Floating spirit orbs (mid parallax) ─────────────────────────
 const orbOff = ((cam0 * 0.16) % (w * 1.6) + w * 1.6) % (w * 1.6);
 const orbData=[[0.10,0.38,28,0.5],[0.28,0.42,22,0.4],[0.45,0.36,30,0.55],[0.62,0.44,20,0.38],[0.80,0.39,26,0.48],[0.96,0.41,24,0.45]];
 for(const [rx,ry,r,alpha] of orbData){
  const ox=rx*w*1.6-orbOff;
  const bob=reduceMotion?0:Math.sin(t*0.09+rx*8)*10;
  _spiritOrb(ctx,ox,ry*h+bob,r,alpha,t);
 }

 // ── Layer 5: Near torii gate arches (near-mid parallax) ──────────────────
 const nearToriiOff = ((cam0 * 0.28) % (w * 1.5) + w * 1.5) % (w * 1.5);
 ctx.fillStyle='#2d1b55';
 const nearToriiData=[[0.08,0.68,110,170],[0.34,0.65,125,185],[0.62,0.70,105,165],[0.90,0.66,118,180]];
 for(const [rx,ry,tw,th] of nearToriiData){
  _torii(ctx,rx*w*1.5-nearToriiOff-tw/2,ry*h,tw,th);ctx.fill();
  // torii: red lacquer highlight
  ctx.fillStyle='rgba(180,30,60,0.28)';
  const tx2=rx*w*1.5-nearToriiOff;
  ctx.fillRect(tx2-tw/2-tw*0.05,ry*h-tw*0.12-5,tw*1.1,tw*0.12);
  ctx.fillStyle='#2d1b55';
 }

 // ── Layer 6: Talisman ofuda paper charms (near parallax) ─────────────────
 const ofudaOff = ((cam0 * 0.40) % (w * 1.4) + w * 1.4) % (w * 1.4);
 const ofudaData=[[0.05,0.40,14,36],[0.14,0.35,12,30],[0.26,0.42,15,38],[0.38,0.38,13,32],[0.50,0.44,14,36],[0.62,0.37,12,30],[0.74,0.41,15,38],[0.86,0.36,13,32],[0.96,0.43,14,35]];
 for(const [rx,ry,cw,ch] of ofudaData){
  const ox=rx*w*1.4-ofudaOff;
  const swing=reduceMotion?0:Math.sin(t*0.11+rx*6)*6;
  _ofuda(ctx,ox+swing,ry*h,cw,ch,'rgba(255,253,230,0.72)');
 }

 // ── Layer 7: Animated soul wisp particles ─────────────────────────────────
 if(!reduceMotion){
  for(let i=0;i<20;i++){
   const px=(((i*149+cam0*0.55+t*0.7)%(w*1.1))+w*1.1)%(w*1.1);
   const py=h*0.2+(((i*83+t*(0.4+i%5*0.1))%(h*0.65))+h*0.05);
   const wispR=1.5+i%3*0.5;
   const wispAlpha=0.4+Math.sin(t*0.12+i)*0.3;
   ctx.fillStyle=`rgba(206,147,216,${wispAlpha})`;
   ctx.beginPath();ctx.arc(px,py,wispR,0,Math.PI*2);ctx.fill();
   // tiny trail
   ctx.fillStyle=`rgba(171,71,188,${wispAlpha*0.4})`;
   ctx.beginPath();ctx.arc(px-3,py+2,wispR*0.6,0,Math.PI*2);ctx.fill();
  }
 }

 ctx.restore();
}
