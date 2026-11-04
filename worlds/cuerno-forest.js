// BOSQUE DEL PRISMA — Procedural vector backdrop for Cuerno's personal world.
// 100% vector Canvas drawing: 8 parallax layers — alpine twilight sky,
// aurora borealis ribbons (3 bands), AURORA VIVA constellation (stag-antler shape),
// glacier mountain silhouettes, crystal stag silhouettes, prism crystal towers,
// crystal stalactites with rainbow refraction, animated prism spark motes.
// Zero external bitmaps.

function _crystalTower(ctx,x,y,w,h){
 // Hexagonal prism tower
 const hw=w/2;
 ctx.beginPath();
 ctx.moveTo(x,y-h);
 ctx.lineTo(x+hw,y-h+hw*0.8);
 ctx.lineTo(x+hw,y);
 ctx.lineTo(x-hw,y);
 ctx.lineTo(x-hw,y-h+hw*0.8);
 ctx.closePath();
 // cap
 ctx.moveTo(x,y-h);ctx.lineTo(x+hw,y-h+hw*0.8);ctx.lineTo(x-hw,y-h+hw*0.8);ctx.closePath();
}

function _stagSilhouette(ctx,x,y,scale){
 const s=scale||1;
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 // body
 ctx.beginPath();ctx.ellipse(0,0,28,18,0,0,Math.PI*2);ctx.fill();
 // neck
 ctx.beginPath();ctx.moveTo(12,-14);ctx.lineTo(20,-38);ctx.lineTo(28,-34);ctx.lineTo(22,-12);ctx.closePath();ctx.fill();
 // head
 ctx.beginPath();ctx.arc(24,-42,10,0,Math.PI*2);ctx.fill();
 // legs
 for(const lx of [-16,-6,8,20]){
  ctx.fillRect(lx-4,14,6,22);
 }
 // antlers — left
 ctx.beginPath();ctx.moveTo(18,-50);ctx.lineTo(8,-72);ctx.lineTo(2,-82);ctx.lineTo(-4,-70);
 ctx.moveTo(8,-72);ctx.lineTo(14,-84);
 ctx.lineWidth=3/s;ctx.strokeStyle=ctx.fillStyle;ctx.stroke();
 // antlers — right
 ctx.beginPath();ctx.moveTo(30,-50);ctx.lineTo(40,-72);ctx.lineTo(46,-82);ctx.lineTo(52,-70);
 ctx.moveTo(40,-72);ctx.lineTo(36,-84);ctx.stroke();
 ctx.restore();
}

// Paint the pure fantasy crystal realm once, then scroll its cached vector layers.
// Crystal prism monoliths, levitating jewel shards and aurora refractions replace trees.
const groveTiles=new WeakMap();
function paintPrismaticGrove(ctx,camX,w,h){
 if(typeof OffscreenCanvas==='undefined')return;
 let tile=groveTiles.get(ctx);
 if(!tile){
  tile=new OffscreenCanvas(1200,640);const c=tile.getContext('2d');
  for(let n=0;n<3;n++){
   const x=160+n*390,base=630;
   // High-fantasy towering crystal obelisks with multifaceted chromatic prisms
   const colors=['#9c27b0','#00bcd4','#ff4081','#7c4dff','#00e676','#ffd700'];
   const pCol=colors[n*2%colors.length],pCol2=colors[(n*2+1)%colors.length];

   // Main central crystal monolith
   const spireH=360+n*35,halfW=42;
   const grad=c.createLinearGradient(x-halfW,base-spireH,x+halfW,base);
   grad.addColorStop(0,'#ffffff');
   grad.addColorStop(0.2,pCol+'cc');
   grad.addColorStop(0.65,pCol2+'aa');
   grad.addColorStop(1,'#180e29dd');
   c.fillStyle=grad;
   c.beginPath();
   c.moveTo(x,base-spireH);
   c.lineTo(x+halfW,base-spireH+60);
   c.lineTo(x+halfW*0.8,base);
   c.lineTo(x-halfW*0.8,base);
   c.lineTo(x-halfW,base-spireH+60);
   c.closePath();c.fill();
   c.strokeStyle='#ffffff99';c.lineWidth=2;c.stroke();

   // Facet line down the spine
   c.beginPath();c.moveTo(x,base-spireH);c.lineTo(x,base);
   c.strokeStyle='#ffffffbb';c.lineWidth=1.5;c.stroke();

   // Twin flanking satellite crystal spires
   for(const side of [-1,1]){
    const sx=x+side*65,sh=spireH*0.62,sw=24;
    const sGrad=c.createLinearGradient(sx,base-sh,sx,base);
    sGrad.addColorStop(0,'#fff8e1');
    sGrad.addColorStop(0.3,side>0?'#80deea':'#f48fb1');
    sGrad.addColorStop(1,'#21153b');
    c.fillStyle=sGrad;
    c.beginPath();
    c.moveTo(sx,base-sh);
    c.lineTo(sx+sw,base-sh+35);
    c.lineTo(sx+sw*0.7,base);
    c.lineTo(sx-sw*0.7,base);
    c.lineTo(sx-sw,base-sh+35);
    c.closePath();c.fill();
    c.strokeStyle='#ffffff66';c.lineWidth=1;c.stroke();
   }

   // Levitating geometric prism shards floating above the crystal spire
   for(let k=0;k<5;k++){
    const ang=k*1.25,dist=85+k*22;
    const fx=x+Math.cos(ang)*(halfW+dist*0.6),fy=base-spireH-20+Math.sin(ang)*50-k*28;
    const sz=12+(k%3)*6;
    c.save();c.translate(fx,fy);c.rotate(k*0.4);
    c.fillStyle=['#e1bee7cc','#80deeacc','#ffcdd2cc','#ffe082cc','#b2dfdbcc'][k%5];
    c.strokeStyle='#ffffff';c.lineWidth=1.2;
    c.beginPath();
    c.moveTo(0,-sz);c.lineTo(sz*0.6,0);c.lineTo(0,sz);c.lineTo(-sz*0.6,0);
    c.closePath();c.fill();c.stroke();
    // Inner glint
    c.fillStyle='#ffffff';c.beginPath();c.arc(0,0,sz*0.2,0,Math.PI*2);c.fill();
    c.restore();
   }

   // Aurora light pillar emitting from the monolith tip
   const beam=c.createRadialGradient(x,base-spireH,2,x,base-spireH,95);
   beam.addColorStop(0,'#ffffffcc');
   beam.addColorStop(0.35,pCol+'66');
   beam.addColorStop(1,pCol+'00');
   c.fillStyle=beam;
   c.beginPath();c.arc(x,base-spireH,95,0,Math.PI*2);c.fill();
  }
  groveTiles.set(ctx,tile);
 }
 const scale=Math.max(.65,Math.min(1,h/900)),span=1200*scale,off=((camX*.22)%span+span)%span;
 ctx.save();ctx.globalAlpha=.92;
 for(let x=-off-span;x<w+span;x+=span)ctx.drawImage(tile,x,h*.75-640*scale,span,640*scale);
 ctx.restore();
}

export function drawCuernoForestBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
 const w = viewportW || 1100;
 const h = viewportH || 700;
 const cam0 = cam.x || 0;

 ctx.save();

 // ── Layer 0: Alpine twilight sky ─────────────────────────────────────────
 const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
 skyGrad.addColorStop(0, '#285266');
 skyGrad.addColorStop(0.30, '#3d7884');
 skyGrad.addColorStop(0.65, '#7fb6a5');
 skyGrad.addColorStop(1, '#d4dfb7');
 ctx.fillStyle = skyGrad;ctx.fillRect(0, 0, w, h);

 // ── Layer 1: Aurora Borealis ribbons (3 animated bands) ─────────────────
 ctx.save();
 const auroraColors=[
  ['rgba(100,255,218,0)','rgba(100,255,218,0.38)','rgba(100,255,218,0)'],
  ['rgba(128,203,196,0)','rgba(128,203,196,0.44)','rgba(128,203,196,0)'],
  ['rgba(206,147,216,0)','rgba(206,147,216,0.32)','rgba(206,147,216,0)']
 ];
 for(let a=0;a<3;a++){
  const waveTime=reduceMotion?0:t*0.04+a*1.5;
  const auroraY=h*0.25+a*38;
  const aG=ctx.createLinearGradient(0,auroraY-65,0,auroraY+65);
  aG.addColorStop(0,auroraColors[a][0]);aG.addColorStop(0.5,auroraColors[a][1]);aG.addColorStop(1,auroraColors[a][2]);
  ctx.fillStyle=aG;
  ctx.beginPath();ctx.moveTo(0,auroraY);
  for(let x=0;x<=w;x+=55){
   const wY=auroraY+Math.sin(x*0.008+waveTime)*38+Math.cos(x*0.015-waveTime*0.7)*22;
   ctx.lineTo(x,wY);
  }
  ctx.lineTo(w,auroraY+100);ctx.lineTo(0,auroraY+100);ctx.closePath();ctx.fill();
 }
 ctx.restore();

 // ── Layer 2: AURORA VIVA Constellation (stag-antler shape) ──────────────
 const cuernoStars=[
  {x:0.16,y:0.14},{x:0.22,y:0.22},{x:0.30,y:0.18},
  {x:0.38,y:0.12},{x:0.46,y:0.16},{x:0.42,y:0.26},
  {x:0.32,y:0.28},{x:0.26,y:0.24},
  {x:0.38,y:0.06}
 ];
 ctx.save();
 // use safe wrap for constellation parallax
 const cSx=(n)=>((n*w*1.3-cam0*0.02)%(w*1.3)+w*1.3)%(w*1.3);
 ctx.strokeStyle='rgba(178,255,240,0.50)';ctx.lineWidth=1.4;
 // draw as connected stag-antler path
 const cPath=[[0,1,2,3,8],[3,4,5,6,7,1]]; // two antler branches
 for(const branch of cPath){
  ctx.beginPath();
  for(let bi=0;bi<branch.length;bi++){
   const si=cuernoStars[branch[bi]];
   const sx=cSx(si.x),sy=si.y*h;
   if(bi===0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);
  }
  ctx.stroke();
 }
 for(const st of cuernoStars){
  const sx=cSx(st.x),sy=st.y*h;
  const pulse=reduceMotion?1:(1+Math.sin(t*0.08+st.x*20)*0.35);
  ctx.fillStyle='#e0f2f1';ctx.beginPath();ctx.arc(sx,sy,2.8*pulse,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle='rgba(178,255,240,0.45)';ctx.font='10px sans-serif';ctx.textAlign='left';
 ctx.fillText('AURORA VIVA',cSx(cuernoStars[3].x)+6,cuernoStars[3].y*h-5);
 ctx.restore();

 // ── Layer 3: Distant glacier mountain silhouettes (far parallax) ─────────
 const peakOff=((cam0*0.06)%(w*1.5)+w*1.5)%(w*1.5);
 ctx.fillStyle='rgba(6,30,40,0.88)';
 ctx.beginPath();ctx.moveTo(-peakOff%w,h);
 for(let x=-200;x<w+300;x+=160){
  const px=x-peakOff%200;
  const py=h*0.55+Math.sin(x*0.014)*48;
  ctx.bezierCurveTo(px-20,py+18,px+16,py-45,px+60,py-42);ctx.quadraticCurveTo(px+100,py-46,px+160,py+8);
 }
 ctx.lineTo(w,h);ctx.closePath();ctx.fill();

 paintPrismaticGrove(ctx,cam0,w,h);

 // ── Layer 4: Crystal stag silhouettes (mid parallax) ─────────────────────
 const stagOff=((cam0*0.14)%(w*2)+w*2)%(w*2);
 ctx.fillStyle='rgba(8,50,60,0.75)';
 const stagData=[[0.15,0.68,0.7],[0.55,0.65,0.85],[0.90,0.70,0.65]];
 for(const [rx,ry,sc] of stagData){
  _stagSilhouette(ctx,rx*w*2-stagOff,ry*h,sc);ctx.fill();
 }

 // ── Layer 5: Prism crystal towers (near-mid parallax) ────────────────────
 const towerOff=((cam0*0.25)%(w*1.6)+w*1.6)%(w*1.6);
 const towerData=[[0.06,0.74,28,160],[0.18,0.70,36,200],[0.34,0.76,24,140],[0.50,0.72,32,185],[0.66,0.75,26,155],[0.80,0.71,38,210],[0.94,0.74,28,165]];
 for(const [rx,ry,tw,th] of towerData){
  const tx=rx*w*1.6-towerOff;
  const tG=ctx.createLinearGradient(tx,ry*h-th,tx,ry*h);
  tG.addColorStop(0,'rgba(128,203,196,0.8)');tG.addColorStop(0.5,'rgba(0,105,92,0.9)');tG.addColorStop(1,'rgba(0,77,64,1)');
  ctx.fillStyle=tG;ctx.strokeStyle='rgba(178,255,240,0.6)';ctx.lineWidth=1.5;
  _crystalTower(ctx,tx,ry*h,tw,th);ctx.fill();ctx.stroke();
  // rainbow prism glint at cap
  ctx.fillStyle='rgba(206,147,216,0.5)';ctx.beginPath();ctx.arc(tx,ry*h-th,4,0,Math.PI*2);ctx.fill();
 }

 // ── Layer 6: Crystal stalactites from ceiling (near, rainbow tint) ───────
 const stalaOff=((cam0*0.38)%(w*1.3)+w*1.3)%(w*1.3);
 const stalaData=[[0.04,18,50],[0.12,24,62],[0.20,16,42],[0.28,28,70],[0.38,20,52],[0.46,22,58],[0.56,16,44],[0.64,26,65],[0.73,18,48],[0.82,24,60],[0.90,20,54],[0.97,16,44]];
 const rainbowS=['rgba(128,203,196,0.7)','rgba(206,147,216,0.65)','rgba(128,222,234,0.72)','rgba(178,255,240,0.6)'];
 for(let si=0;si<stalaData.length;si++){
  const [rx,sw,sh]=stalaData[si];
  const sx=rx*w*1.3-stalaOff;
  const sG=ctx.createLinearGradient(sx,0,sx,sh);
  sG.addColorStop(0,rainbowS[si%4]);sG.addColorStop(1,'rgba(0,100,88,0)');
  ctx.fillStyle=sG;
  ctx.beginPath();ctx.moveTo(sx-sw/2,0);ctx.lineTo(sx,sh);ctx.lineTo(sx+sw/2,0);ctx.closePath();ctx.fill();
 }

 // ── Layer 7: Prism spark motes (near animated) ────────────────────────────
 if(!reduceMotion){
  const sparkColors=['rgba(128,222,234,0.8)','rgba(206,147,216,0.8)','rgba(178,255,240,0.9)','rgba(255,220,180,0.7)'];
  for(let i=0;i<26;i++){
   const px=((i*137.3+cam0*0.6+t*0.95)%(w*1.1)+w*1.1)%(w*1.1);
   const py=h*0.12+(((i*89.5+t*(0.5+i%4*0.12))%(h*0.76))+h*0.12);
   const sr=1.2+(i%3)*0.6;
   ctx.fillStyle=sparkColors[i%4];
   ctx.beginPath();ctx.arc(px,py,sr,0,Math.PI*2);ctx.fill();
  }
 }

 ctx.restore();
}
