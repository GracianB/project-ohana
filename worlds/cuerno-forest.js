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

// Paint the organic grove once, then scroll its cached vector layers. Hundreds
// of leaf and bark details cost two image blits per frame on a small viewport.
const groveTiles=new WeakMap();
function paintPrismaticGrove(ctx,camX,w,h){
 if(typeof OffscreenCanvas==='undefined')return;
 let tile=groveTiles.get(ctx);
 if(!tile){
  tile=new OffscreenCanvas(1200,640);const c=tile.getContext('2d');
  for(let n=0;n<3;n++){
   const x=110+n*430,base=630,lean=n%2?1:-1;
   c.fillStyle='#285560';c.beginPath();c.moveTo(x-24,base);
   c.bezierCurveTo(x+18,base-150,x-lean*36,base-310,x+lean*12,base-454);
   c.bezierCurveTo(x-lean*4,base-295,x+54,base-165,x+42,base);c.closePath();c.fill();
   for(let side of [-1,1]){
    c.strokeStyle='#376e71';c.lineWidth=20;c.lineCap='round';c.beginPath();
    c.moveTo(x+8,base-175);c.bezierCurveTo(x+side*39,base-305,x+side*115,base-352,x+side*190,base-351);c.stroke();
    c.strokeStyle='#74a39a';c.lineWidth=2;c.beginPath();c.moveTo(x+4,base-12);c.bezierCurveTo(x-18,base-143,x+side*20,base-267,x+side*90,base-328);c.stroke();
   }
   for(let cluster=0;cluster<12;cluster++){
    const a=cluster*Math.PI*2/12,cx=x+Math.cos(a)*135,cy=base-405+Math.sin(a)*44;
    for(let leaf=0;leaf<18;leaf++){
     const ang=leaf*2.399,rad=12+Math.sqrt(leaf)*11,lx=cx+Math.cos(ang)*rad,ly=cy+Math.sin(ang)*rad*.56;
     c.fillStyle=['#3d7d79','#58978a','#80b399','#b2cda1'][(leaf+cluster+n)%4];
     c.beginPath();c.ellipse(lx,ly,16+(leaf%3)*3,7,ang*.3,0,Math.PI*2);c.fill();
     if(leaf%4===0){c.strokeStyle='#d4e2b880';c.lineWidth=.8;c.beginPath();c.moveTo(lx-9,ly);c.lineTo(lx+8,ly-2);c.stroke();}
    }
   }
   for(let vine=0;vine<6;vine++){
    const vx=x-135+vine*51,vy=base-380+(vine%3)*17,len=65+(vine*31)%89;
    c.strokeStyle='#8eae96';c.lineWidth=1.2;c.beginPath();c.moveTo(vx,vy);c.bezierCurveTo(vx-9,vy+len*.4,vx+11,vy+len*.7,vx+2,vy+len);c.stroke();
    const light=c.createRadialGradient(vx+2,vy+len,1,vx+2,vy+len,20);light.addColorStop(0,'#ffefd49c');light.addColorStop(1,'#ffefd400');c.fillStyle=light;c.fillRect(vx-18,vy+len-20,40,40);
    c.fillStyle=vine%2?'#e5bad9':'#efe1a5';c.beginPath();c.ellipse(vx+2,vy+len,4,7,.2,0,Math.PI*2);c.fill();
   }
  }
  groveTiles.set(ctx,tile);
 }
 const scale=Math.max(.65,Math.min(1,h/900)),span=1200*scale,off=((camX*.22)%span+span)%span;
 ctx.save();ctx.globalAlpha=.86;
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
