// MERCADO DORADO — Frita's dedicated procedural stage backdrop.
// 100% vector Canvas: zero external image assets.
// 8 parallax layers: golden coastal sunset, market stall silhouettes, palm trees,
// hanging lanterns, seagull silhouettes, wave shimmer, spice smoke and feast constellation.
const TAU=Math.PI*2;
const wrap=(v,lim)=>((v%lim)+lim)%lim;

// ── Helper: market stall canopy ──────────────────────────────────────────────
function _stall(ctx,cx,cy,w,col,stripe){
 ctx.fillStyle=col;
 // Canopy top (wavy pennant shape)
 ctx.beginPath();
 ctx.moveTo(cx-w*.55,cy);
 for(let i=0;i<=8;i++){
  const tx=cx-w*.55+i*(w*1.1/8);
  const ty=cy+(i%2===0?0:-12);
  ctx.lineTo(tx,ty);
 }
 ctx.lineTo(cx+w*.55,cy);ctx.lineTo(cx+w*.5,cy+18);ctx.lineTo(cx-w*.5,cy+18);
 ctx.closePath();ctx.fill();
 // Stripe
 ctx.fillStyle=stripe;ctx.fillRect(cx-w*.5,cy+2,w,7);
 // Pole
 ctx.strokeStyle='rgba(80,40,10,0.7)';ctx.lineWidth=5;ctx.lineCap='butt';
 ctx.beginPath();ctx.moveTo(cx-w*.45,cy+18);ctx.lineTo(cx-w*.45,cy+80);ctx.stroke();
 ctx.beginPath();ctx.moveTo(cx+w*.45,cy+18);ctx.lineTo(cx+w*.45,cy+80);ctx.stroke();
}

// ── Helper: coastal palm tree ─────────────────────────────────────────────────
function _palm(ctx,cx,cy,h,lean,col){
 ctx.strokeStyle=col;ctx.lineCap='round';
 // Trunk with lean
 ctx.lineWidth=9;
 ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(cx+lean*.4,cy-h*.5,cx+lean,cy-h);ctx.stroke();
 // Fronds
 ctx.lineWidth=3;
 for(let f=-4;f<=4;f++){
  const fx=cx+lean+f*30,fy=cy-h+Math.abs(f)*16;
  ctx.beginPath();ctx.moveTo(cx+lean,cy-h);ctx.quadraticCurveTo((cx+lean+fx)*.5,fy-30,fx,fy);ctx.stroke();
 }
}

// ── Helper: hanging lantern ──────────────────────────────────────────────────
function _lantern(ctx,cx,cy,col,glow,t,reduced){
 const swing=reduced?0:Math.sin(t*.06+cx*.01)*5;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(swing*.04);
 // String
 ctx.strokeStyle='rgba(120,80,20,0.7)';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,22);ctx.stroke();
 // Body
 ctx.fillStyle=col;ctx.strokeStyle='rgba(200,140,0,0.8)';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.ellipse(0,32,10,16,0,0,TAU);ctx.fill();ctx.stroke();
 // Glow
 if(!reduced){
  ctx.fillStyle=`rgba(${glow},${0.35+Math.sin(t*.1+cx)*.1})`;
  ctx.beginPath();ctx.arc(0,32,22,0,TAU);ctx.fill();
 }
 ctx.restore();
}

// ── Helper: seagull silhouette ────────────────────────────────────────────────
function _seagull(ctx,cx,cy,span,col){
 ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.lineCap='round';
 ctx.beginPath();
 ctx.moveTo(cx-span,cy);ctx.quadraticCurveTo(cx-span*.5,cy-span*.3,cx,cy);
 ctx.quadraticCurveTo(cx+span*.5,cy-span*.3,cx+span,cy);
 ctx.stroke();
}

// ── Helper: BANQUETE DORADO constellation ─────────────────────────────────────
const BANQUET_STARS=[
 {x:.12,y:.12},{x:.18,y:.08},{x:.26,y:.11},{x:.32,y:.18},
 {x:.28,y:.25},{x:.20,y:.27},{x:.14,y:.20},{x:.38,y:.14},{x:.44,y:.09}
];

export function drawFritaMarketBackdrop(ctx,cam,t,viewportW,viewportH,reduceMotion=false){
 const w=viewportW||1100,h=viewportH||700;
 ctx.save();

 // ── Layer 0: Warm golden coastal sunset sky ──
 const skyG=ctx.createLinearGradient(0,0,0,h);
 skyG.addColorStop(0,'#2c0e18');skyG.addColorStop(.22,'#7a2818');
 skyG.addColorStop(.52,'#c84e14');skyG.addColorStop(.78,'#f0941a');
 skyG.addColorStop(1,'#ffc843');
 ctx.fillStyle=skyG;ctx.fillRect(0,0,w,h);

 // ── Layer 1: Setting sun disc ──
 const sunX=wrap(w*.7-cam.x*.016,w*2);
 const sunY=h*.30;
 const sunG=ctx.createRadialGradient(sunX,sunY,14,sunX,sunY,72);
 sunG.addColorStop(0,'#fffde7');sunG.addColorStop(.4,'#ffd54f');
 sunG.addColorStop(.82,'#ff9800');sunG.addColorStop(1,'rgba(255,150,0,0)');
 ctx.fillStyle=sunG;ctx.beginPath();ctx.arc(sunX,sunY,72,0,TAU);ctx.fill();
 // Sun rays
 if(!reduceMotion){
  ctx.strokeStyle='rgba(255,220,100,0.18)';ctx.lineWidth=2;
  for(let r=0;r<8;r++){
   const ang=r*TAU/8+(t*.006);
   ctx.beginPath();
   ctx.moveTo(sunX+Math.cos(ang)*76,sunY+Math.sin(ang)*76);
   ctx.lineTo(sunX+Math.cos(ang)*130,sunY+Math.sin(ang)*130);
   ctx.stroke();
  }
 }

 // ── Layer 2: BANQUETE DORADO constellation ──
 ctx.save();
 ctx.strokeStyle='rgba(255,235,140,0.40)';ctx.lineWidth=1.4;
 ctx.beginPath();
 for(let i=0;i<BANQUET_STARS.length;i++){
  const sx=wrap(BANQUET_STARS[i].x*w*1.35-cam.x*.019,w*1.3);
  const sy=BANQUET_STARS[i].y*h;
  i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
 }
 ctx.stroke();
 for(const st of BANQUET_STARS){
  const sx=wrap(st.x*w*1.35-cam.x*.019,w*1.3);
  const sy=st.y*h;
  const pulse=reduceMotion?1:(1+Math.sin(t*.09+st.x*16)*.28);
  ctx.fillStyle='#fffde7';ctx.beginPath();ctx.arc(sx,sy,2.5*pulse,0,TAU);ctx.fill();
 }
 ctx.restore();

 // ── Layer 3: Distant coastal town silhouette ──
 ctx.save();
 ctx.fillStyle='rgba(60,25,10,0.75)';
 ctx.beginPath();ctx.moveTo(0,h);
 const townOff=wrap(-(cam.x*.06),w+500);
 for(let tx=-200;tx<w+500;tx+=220){
  const bx=tx+townOff;
  const bh=h*(.32+Math.sin(tx*.008)*.04);
  ctx.lineTo(bx,h-bh);
  // Tower / minaret
  ctx.lineTo(bx+18,h-bh-24);ctx.lineTo(bx+22,h-bh-24);ctx.lineTo(bx+40,h-bh);
  ctx.lineTo(bx+100,h-bh+12);ctx.lineTo(bx+120,h-bh-18);ctx.lineTo(bx+140,h-bh);
  ctx.lineTo(bx+220,h-bh+8);
 }
 ctx.lineTo(w,h);ctx.closePath();ctx.fill();
 ctx.restore();

 // ── Layer 4: Palm trees (mid parallax) ──
 ctx.save();
 const palmOff=wrap(-(cam.x*.14),w+600);
 const palmCol='rgba(24,12,4,0.88)';
 const palmData=[{ox:60,h:95,lean:22},{ox:280,h:110,lean:-18},{ox:500,h:88,lean:15},{ox:720,h:100,lean:-20},{ox:940,h:105,lean:18}];
 for(const pd of palmData){
  const px=wrap(pd.ox+palmOff,w+600)-100;
  _palm(ctx,px,h*.84,pd.h,pd.lean,palmCol);
 }
 ctx.restore();

 // ── Layer 5: Market stall canopies (near-mid) ──
 ctx.save();
 const stallOff=wrap(-(cam.x*.22),w+700);
 const stallDef=[
  {ox:40, col:'rgba(180,60,10,0.82)',stripe:'rgba(255,200,0,0.55)',w:90},
  {ox:260,col:'rgba(10,80,30,0.75)', stripe:'rgba(255,220,60,0.5)',w:80},
  {ox:480,col:'rgba(20,30,120,0.75)',stripe:'rgba(255,180,0,0.55)',w:85},
  {ox:700,col:'rgba(140,20,10,0.8)', stripe:'rgba(255,230,80,0.5)',w:90}
 ];
 for(const sd of stallDef){
  const sx=wrap(sd.ox+stallOff,w+700)-80;
  _stall(ctx,sx,h*.82,sd.w,sd.col,sd.stripe);
 }
 ctx.restore();

 // ── Layer 6: Hanging lanterns ──
 ctx.save();
 const lanternOff=wrap(-(cam.x*.28),w+400);
 const lanternColors=['rgba(255,180,0,0.9)','rgba(255,80,40,0.85)','rgba(0,160,100,0.8)'];
 const lanternGlow=['255,200,80','255,120,60','80,220,140'];
 for(let i=0;i<10;i++){
  const lx=wrap(i*120+lanternOff,w+400)-40;
  _lantern(ctx,lx,h*.58,lanternColors[i%3],lanternGlow[i%3],t,reduceMotion);
 }
 ctx.restore();

 // ── Layer 7: Seagull silhouettes ──
 ctx.save();
 if(!reduceMotion){
  const birdCol='rgba(30,14,4,0.6)';
  const birdOff=wrap(-(cam.x*.35),w+600);
  for(let b=0;b<6;b++){
   const bx=wrap(b*190+birdOff+Math.sin(t*.04+b)*20,w+600)-50;
   const by=h*(.12+b*.04)+Math.sin(t*.07+b*.8)*8;
   _seagull(ctx,bx,by,14+b*3,birdCol);
  }
 }
 ctx.restore();

 // ── Layer 8: Floating spice smoke particles ──
 if(!reduceMotion){
  ctx.save();
  for(let i=0;i<24;i++){
   const px=wrap(i*143+t*14-cam.x*.26,w+120)-60;
   const py=wrap(i*83+Math.sin(t*.05+i)*28,h*.75);
   const sz=1.4+(i%4)*.5;
   ctx.fillStyle=`rgba(255,200,100,${0.38+Math.sin(i+t*.06)*.18})`;
   ctx.beginPath();ctx.arc(px,py,sz,0,TAU);ctx.fill();
  }
  ctx.restore();
 }

 ctx.restore();
}
