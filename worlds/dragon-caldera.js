// CORDILLERA DE LAS BRASAS — Dragón's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero external image assets, zero layout thrash.
// Identity: SKY + FIRE at NIGHT. Indigo-plum starry dome with the Celestial
// Dragon constellation, an eclipse moon, an erupting far volcano with lava
// streams and an ash plume, obsidian spires rimmed in plum, wyverns circling,
// basalt crags, fire beacons, the Dragon shrine, a flowing lava river, embers
// and ash. Opposite of Dino's green daylight valley.
// Rules: gradients come from cachedGradient (built once per context, never per
// frame); all variation is a deterministic hash of an index.
import {cachedGradient} from '../systems/canvas-gradient-cache.js';
const TAU=Math.PI*2;
const wrap=(v,w)=>((v%w)+w)%w;
const visible=(x,w,pad=260)=>x>=-pad&&x<=w+pad;
const hash=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453;return s-Math.floor(s);};

export const DRAGON_CALDERA_PALETTE=Object.freeze({
 skyTop:'#06030f',skyMid:'#1b0b2a',skyLow:'#3d1024',horizon:'#7a1e16',
 star:'#fff1d6',moon:'#ffd9a8',volcano:'#170812',lava:'#ff5a1e',lavaHot:'#ffd166',
 spire:'#12060f',spireRim:'#6e2a5e',ash:'#4a3346'
});
const P=DRAGON_CALDERA_PALETTE;
// Celestial Dragon: a serpentine chain of stars (head → wings → tail).
const DRAGON_STARS=[[0,0],[.03,-.035],[.07,-.02],[.1,.02],[.14,.035],[.18,.01],[.21,-.03],[.25,-.04],[.29,-.015],[.32,.02],
 [.1,-.08],[.16,-.11],[.13,.09]];

function wyvern(ctx,x,y,s,flap){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#0d0510';
 ctx.beginPath();ctx.moveTo(-30,-flap*14);ctx.lineTo(-8,-2);ctx.lineTo(0,-6);ctx.lineTo(8,-2);ctx.lineTo(30,-flap*14);
 ctx.lineTo(12,4);ctx.lineTo(4,3);ctx.lineTo(0,10);ctx.lineTo(-4,3);ctx.lineTo(-12,4);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(0,8);ctx.quadraticCurveTo(4,20,-2,30);ctx.lineTo(1,30);ctx.quadraticCurveTo(7,20,2,8);ctx.closePath();ctx.fill();
 ctx.restore();
}

function basaltPillar(ctx,x,y,w,h,col,glowCol){
 ctx.save();
 ctx.fillStyle=col;
 ctx.strokeStyle=glowCol;
 ctx.lineWidth=1.5;
 ctx.beginPath();
 ctx.moveTo(x-w*0.5,y);
 ctx.lineTo(x-w*0.35,y-h);
 ctx.lineTo(x+w*0.35,y-h);
 ctx.lineTo(x+w*0.5,y);
 ctx.closePath();
 ctx.fill();ctx.stroke();
 // Vertical cooling crack
 ctx.beginPath();
 ctx.moveTo(x,y-h*0.1);
 ctx.lineTo(x-w*0.1,y-h*0.5);
 ctx.lineTo(x+w*0.08,y-h*0.85);
 ctx.stroke();
 ctx.restore();
}

function flameBeacon(ctx,x,y,scale,t,col,accent,reduced){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const flicker=reduced?0:Math.sin(t*0.08+x*0.03)*3;
 // Braised stone bowl
 ctx.fillStyle='#231210';ctx.strokeStyle='#ff6b3d';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.arc(0,10,22,0,Math.PI);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Burning flame tongues
 ctx.fillStyle=col;
 ctx.beginPath();
 ctx.moveTo(-16,10);
 ctx.quadraticCurveTo(-10,-15+flicker,0,-32+flicker*1.4);
 ctx.quadraticCurveTo(10,-15+flicker,16,10);
 ctx.closePath();ctx.fill();
 // Inner golden core
 ctx.fillStyle=accent;
 ctx.beginPath();
 ctx.moveTo(-9,10);
 ctx.quadraticCurveTo(-5,-6+flicker,0,-18+flicker);
 ctx.quadraticCurveTo(5,-6+flicker,9,10);
 ctx.closePath();ctx.fill();
 if(!reduced){
  ctx.fillStyle='rgba(255,200,80,0.35)';
  ctx.beginPath();ctx.arc(0,-12,18+Math.sin(t*0.15+x)*4,0,TAU);ctx.fill();
 }
 ctx.restore();
}

function dragonSanctuary(ctx,x,y,t,reduced){
 ctx.save();ctx.translate(x,y);
 // Shrine base arches in carved black stone
 ctx.fillStyle='#251310';ctx.strokeStyle='#ff7448';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(-120,0);ctx.lineTo(-85,-155);ctx.lineTo(85,-155);ctx.lineTo(120,0);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Inner fire chamber
 ctx.fillStyle='#140705';ctx.beginPath();
 ctx.arc(0,-70,50,Math.PI,0);ctx.lineTo(50,0);ctx.lineTo(-50,0);ctx.closePath();
 ctx.fill();ctx.strokeStyle='#ffae63';ctx.lineWidth=2;ctx.stroke();
 // Dragon wing crest on roof
 ctx.fillStyle='#ff5028';ctx.strokeStyle='#ffd866';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(-60,-155);ctx.quadraticCurveTo(-100,-215,-15,-205);
 ctx.lineTo(0,-175);
 ctx.lineTo(15,-205);ctx.quadraticCurveTo(100,-215,60,-155);
 ctx.closePath();ctx.fill();ctx.stroke();
 // Giant central brazier
 flameBeacon(ctx,0,-80,1.4,t,'#ff6428','#ffe97d',reduced);
 ctx.restore();
}

export function drawDragonCalderaBackdrop(ctx,cam,t=0,W=1600,H=1000,reduced=false){
 ctx.save();
 const ox=Number.isFinite(cam?.x)?cam.x:0,oy=Number.isFinite(cam?.y)?cam.y:0;
 t=Number(t)||0;

 // 1. Night dome: obsidian-indigo into plum into a low volcanic glow (cached)
 ctx.fillStyle=cachedGradient(ctx,'dragon-caldera-sky:'+H,()=>{
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,P.skyTop);g.addColorStop(.42,P.skyMid);g.addColorStop(.74,P.skyLow);g.addColorStop(1,P.horizon);return g;
 });
 ctx.fillRect(0,0,W,H);

 // 2. Twinkling star field (deterministic)
 for(let i=0;i<70;i++){
  const sx=wrap(hash(i)*W*1.3-ox*.015,W*1.3)-W*.15,sy=hash(i+100)*H*.55-oy*.01;
  const tw=reduced?.7:.45+.45*Math.sin(t*.07+i*2.7);
  ctx.globalAlpha=tw;ctx.fillStyle=P.star;ctx.beginPath();ctx.arc(sx,sy,.8+hash(i+200)*1.4,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;

 // 3. Eclipse moon: ember corona ring + dark disc
 const mX=wrap(W*.22-ox*.02,W+400)-200,mY=H*.17-oy*.02;
 ctx.fillStyle='rgba(255,140,70,0.12)';ctx.beginPath();ctx.arc(mX,mY,86,0,TAU);ctx.fill();
 ctx.fillStyle=P.moon;ctx.beginPath();ctx.arc(mX,mY,48,0,TAU);ctx.fill();
 ctx.fillStyle='#120718';ctx.beginPath();ctx.arc(mX+14,mY-6,44,0,TAU);ctx.fill();

 // 4. Celestial Dragon constellation, gently breathing
 const cX=wrap(W*.55-ox*.03,W+600)-300,cY=H*.2-oy*.02;
 const breathe=reduced?1:1+Math.sin(t*.04)*.25;
 ctx.strokeStyle='rgba(255,210,150,0.30)';ctx.lineWidth=1.4;ctx.beginPath();
 for(let i=0;i<10;i++){const sx=cX+DRAGON_STARS[i][0]*W,sy=cY+DRAGON_STARS[i][1]*H;i?ctx.lineTo(sx,sy):ctx.moveTo(sx,sy);}
 ctx.moveTo(cX+DRAGON_STARS[3][0]*W,cY+DRAGON_STARS[3][1]*H);ctx.lineTo(cX+DRAGON_STARS[10][0]*W,cY+DRAGON_STARS[10][1]*H);ctx.lineTo(cX+DRAGON_STARS[11][0]*W,cY+DRAGON_STARS[11][1]*H);
 ctx.moveTo(cX+DRAGON_STARS[4][0]*W,cY+DRAGON_STARS[4][1]*H);ctx.lineTo(cX+DRAGON_STARS[12][0]*W,cY+DRAGON_STARS[12][1]*H);
 ctx.stroke();
 for(let i=0;i<DRAGON_STARS.length;i++){
  const sx=cX+DRAGON_STARS[i][0]*W,sy=cY+DRAGON_STARS[i][1]*H,r=(i===0?3.6:2.3)*(reduced?1:1+Math.sin(t*.09+i)*.2);
  ctx.fillStyle='rgba(255,180,90,'+(0.18*breathe).toFixed(3)+')';ctx.beginPath();ctx.arc(sx,sy,r*3,0,TAU);ctx.fill();
  ctx.fillStyle='#ffe89c';ctx.beginPath();ctx.arc(sx,sy,r,0,TAU);ctx.fill();
 }

 // 5. Far erupting volcano (parallax .05): cone, crater glow, lava streams, ash plume
 const vX=wrap(W*.72-ox*.05,W+900)-450,vB=H*.66-oy*.03,vH=H*.34;
 ctx.fillStyle=P.volcano;ctx.beginPath();ctx.moveTo(vX-320,vB+40);ctx.lineTo(vX-60,vB-vH);ctx.lineTo(vX+55,vB-vH);ctx.lineTo(vX+330,vB+40);ctx.closePath();ctx.fill();
 const pulse=reduced?.6:.5+.3*Math.sin(t*.06);
 ctx.fillStyle='rgba(255,110,40,'+(0.35*pulse).toFixed(3)+')';ctx.beginPath();ctx.arc(vX,vB-vH,70,Math.PI,0);ctx.fill();
 ctx.fillStyle=P.lavaHot;ctx.beginPath();ctx.moveTo(vX-55,vB-vH);ctx.lineTo(vX+50,vB-vH);ctx.lineTo(vX+40,vB-vH+8);ctx.lineTo(vX-45,vB-vH+8);ctx.closePath();ctx.fill();
 ctx.strokeStyle=P.lava;ctx.lineCap='round';
 for(let k=0;k<4;k++){
  const sx=vX-40+k*26,len=vH*(.45+hash(k+30)*.4),drift=(k-1.5)*42;
  ctx.lineWidth=3.2-k*.4;ctx.beginPath();ctx.moveTo(sx,vB-vH+6);
  ctx.quadraticCurveTo(sx+drift*.4,vB-vH+len*.5,sx+drift,vB-vH+len);ctx.stroke();
  // glowing drop travelling down the stream
  const u=reduced?.5:wrap(t*.004+k*.27,1);
  ctx.fillStyle=P.lavaHot;ctx.beginPath();ctx.arc(sx+drift*(.8*u*(1-u)+u*u),vB-vH+6+(len-6)*u,2.6,0,TAU);ctx.fill();
 }
 // ash plume: puffs rising and spreading
 for(let k=0;k<9;k++){
  const life=reduced?k/9:wrap(t*.0025+k/9,1);
  const px=vX+Math.sin(k*1.9)*20*life+life*120,py=vB-vH-20-life*H*.32,r=18+life*60;
  ctx.globalAlpha=(1-life)*.55;ctx.fillStyle=P.ash;ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;
 // eruption bursts every ~9 s: arcs of sparks
 if(!reduced){
  const cyc=wrap(t,540)/540;
  if(cyc<.18){
   const k=cyc/.18;
   for(let i=0;i<14;i++){
    const a=-Math.PI/2+(hash(i+50)-.5)*1.6,sp=120+hash(i+70)*160;
    const px=vX+Math.cos(a)*sp*k,py=vB-vH+Math.sin(a)*sp*k+k*k*140;
    ctx.globalAlpha=1-k;ctx.fillStyle=i%3?P.lava:P.lavaHot;ctx.beginPath();ctx.arc(px,py,3,0,TAU);ctx.fill();
   }
   ctx.globalAlpha=1;
  }
 }

 // 6. Distant volcanic ridges (Parallax 0.08)
 ctx.fillStyle='#1c0814';
 ctx.beginPath();ctx.moveTo(0,H);
 for(let x=0;x<=W;x+=60){
  const wx=x+ox*0.08;
  const h=150+Math.sin(wx*0.0035)*70+Math.sin(wx*0.012)*35;
  ctx.lineTo(x,H*0.72-h-oy*0.04);
 }
 ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 // Magma veins on distant ridge
 ctx.strokeStyle='rgba(255,100,35,0.40)';ctx.lineWidth=2.5;
 ctx.beginPath();
 for(let x=0;x<=W;x+=80){
  const wx=x+ox*0.08;
  const y=H*0.72-(150+Math.sin(wx*0.0035)*70)-oy*0.04;
  ctx.moveTo(x,y);ctx.lineTo(x+15,y+28);
 }
 ctx.stroke();

 // 7. Wyverns circling the peaks
 for(let i=0;i<3;i++){
  const a=(reduced?i*2:t*.006+i*2.1),rx=wrap(W*(.3+i*.25)-ox*.07,W+300)-150;
  const flap=reduced?.4:Math.sin(t*.16+i*1.7);
  wyvern(ctx,rx+Math.cos(a)*90,H*.3+Math.sin(a)*30+i*18,.8-i*.15,flap);
 }

 // 8. Obsidian spire range with plum rims (Parallax 0.18)
 ctx.fillStyle=P.spire;ctx.beginPath();ctx.moveTo(0,H);
 const spireTops=[];
 for(let x=-40;x<=W+80;x+=40){
  const wx=x+ox*.18,n=Math.floor(wx/40);
  const tall=hash(n)>.72;
  const y=H*.8-(90+Math.sin(wx*.006+1.2)*50+(tall?120+hash(n+1)*80:hash(n+2)*30))-oy*.1;
  ctx.lineTo(x-(wx%40),y);if(tall)spireTops.push([x-(wx%40),y]);
 }
 ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 ctx.strokeStyle=P.spireRim;ctx.lineWidth=2;
 for(const [sx,sy] of spireTops){ctx.beginPath();ctx.moveTo(sx-14,sy+60);ctx.lineTo(sx,sy);ctx.lineTo(sx+6,sy+40);ctx.stroke();}

 // 9. Hanging ceiling crags (stalactites)
 for(let i=0;i<12;i++){
  const bx=wrap(i*170-ox*0.16,W+240)-120;
  const by=-oy*0.08;
  const sw=35+((i*17)%25),sh=85+((i*31)%75);
  basaltPillar(ctx,bx,by,sw,sh,'#140612','#a03a6a40');
 }

 // 10. Standing Pillars & Fire Beacons along the stage (Parallax 0.35)
 const beaconXs=[420,1150,1880,2650,3380];
 for(let i=0;i<beaconXs.length;i++){
  const worldX=beaconXs[i];
  const sx=worldX-ox*0.65;
  const sy=H*0.84-oy*0.35;
  if(visible(sx,W)){
   basaltPillar(ctx,sx,sy+30,46,120,'#1b0912','#ff6b35');
   flameBeacon(ctx,sx,sy-90,0.9,t,'#ff6428','#ffe97d',reduced);
  }
 }

 // 11. Dragon Sanctuary at the eastern summit
 const shrineSx=3780-ox;
 const shrineSy=1110-oy;
 if(visible(shrineSx,W,300)){
  dragonSanctuary(ctx,shrineSx,shrineSy,t,reduced);
 }

 // 12. Flowing lava river along the bottom
 const flow=reduced?0:t*.9;
 const riverY=H*.93;
 ctx.fillStyle=P.lava;ctx.beginPath();ctx.moveTo(0,H);
 for(let x=0;x<=W+40;x+=40)ctx.lineTo(x,riverY+Math.sin((x+ox*.5)*.02+flow*.05)*6);
 ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 ctx.strokeStyle=P.lavaHot;ctx.lineWidth=3;ctx.beginPath();
 for(let x=0;x<=W+40;x+=40){const y=riverY+Math.sin((x+ox*.5)*.02+flow*.05)*6;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
 ctx.stroke();
 // drifting crust plates
 ctx.fillStyle='#3a0d10';
 for(let i=0;i<10;i++){
  const px=wrap(i*173+flow*1.2-ox*.5,W+120)-60,py=riverY+14+hash(i+300)*(H-riverY-18);
  ctx.beginPath();ctx.moveTo(px-14,py);ctx.lineTo(px-4,py-5);ctx.lineTo(px+12,py-2);ctx.lineTo(px+8,py+4);ctx.closePath();ctx.fill();
 }

 // 13. Floating volcanic embers & ash flakes
 if(!reduced){
  ctx.save();
  for(let i=0;i<48;i++){
   const px=wrap(i*89-ox*0.45+Math.sin(t*0.03+i)*40,W+120)-60;
   const py=wrap(H*0.95-((t*1.2+i*55)%(H*1.1))-oy*0.4,H+80)-40;
   const pSize=1.5+((i*7)%3)*0.8;
   const pAlpha=0.35+Math.sin(t*0.06+i)*0.25;
   ctx.fillStyle=i%3===0?'#ffe57f':i%2===0?'#ff8038':'#ff4418';
   ctx.globalAlpha=Math.max(0.1,Math.min(0.85,pAlpha));
   ctx.beginPath();ctx.arc(px,py,pSize,0,TAU);ctx.fill();
  }
  ctx.fillStyle='#8a7488';
  for(let i=0;i<18;i++){
   const px=wrap(i*211+t*.6-ox*.3,W+80)-40,py=wrap(i*97+t*.5,H);
   ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+4,py+1);ctx.lineTo(px+1,py+3);ctx.closePath();ctx.fill();
  }
  ctx.restore();
 }

 // 14. Lower molten heat haze (cached)
 ctx.fillStyle=cachedGradient(ctx,'dragon-caldera-haze:'+H,()=>{
  const g=ctx.createLinearGradient(0,H-200,0,H);
  g.addColorStop(0,'rgba(255,80,20,0)');g.addColorStop(.5,'rgba(255,100,25,0.16)');g.addColorStop(1,'rgba(255,60,10,0.38)');return g;
 });
 ctx.fillRect(0,H-200,W,200);

 ctx.restore();
}
