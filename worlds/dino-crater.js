// VALLE DE LOS GIGANTES — Dino's dedicated procedural stage backdrop.
// 100% vector Canvas pipeline: zero external image assets.
// Identity: EARTH. A lush, humid prehistoric valley in jade / teal / moss / bone
// (no orange: that belongs to Dragón's caldera). Parallax layers, far → near:
// misty sky + pale sun, Guardian constellation, table-top mesas with waterfalls,
// mist band, a walking sauropod herd, a pterosaur flock, jungle canopy,
// fossil cliff (strata, ammonites, a giant T-rex skull with geode eyes),
// swaying cycads/tree ferns, fireflies and ground mist.
// Rules: gradients are built once per context via cachedGradient (never per
// frame) and every "random" value is a deterministic hash of an index.
import {cachedGradient} from '../systems/canvas-gradient-cache.js';
const TAU=Math.PI*2;
const wrap=(v,lim)=>((v%lim)+lim)%lim;
const hash=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453;return s-Math.floor(s);};

export const DINO_VALLEY_PALETTE=Object.freeze({
 skyTop:'#0e3640',skyMid:'#1d6762',skyLow:'#9fd4a6',sun:'#f4ffd8',
 mesa:'#2b6160',mesaRim:'#5f9c8c',mist:'#d8f5e2',herd:'#1f5450',
 canopy:'#164238',cliff:'#3d5a48',strata:'#54755c',bone:'#e4dcbc',geode:'#5ff0d0',
 fern:'#0c2b24',firefly:'#d9ff9e'
});
const P=DINO_VALLEY_PALETTE;

function _mesa(ctx,x,base,w,h){
 ctx.fillStyle=P.mesa;
 ctx.beginPath();ctx.moveTo(x-w*.62,base);ctx.lineTo(x-w*.5,base-h*.82);ctx.lineTo(x-w*.42,base-h);
 ctx.lineTo(x+w*.4,base-h);ctx.lineTo(x+w*.5,base-h*.78);ctx.lineTo(x+w*.64,base);ctx.closePath();ctx.fill();
 ctx.strokeStyle=P.mesaRim;ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(x-w*.42,base-h);ctx.lineTo(x+w*.4,base-h);ctx.stroke();
 // jungle cap on top of the mesa
 ctx.fillStyle=P.canopy;
 for(let k=-2;k<=2;k++){ctx.beginPath();ctx.arc(x+k*w*.17,base-h,w*.11,Math.PI,0);ctx.fill();}
}

function _waterfall(ctx,x,top,len,t,reduced){
 ctx.fillStyle='rgba(216,245,226,0.55)';ctx.fillRect(x-5,top,10,len);
 ctx.fillStyle='rgba(255,255,255,0.75)';
 const flow=reduced?0:t*2.2;
 for(let k=0;k<6;k++){const y=top+wrap(k*len/6+flow,len);ctx.fillRect(x-3,y,6,Math.min(12,top+len-y));}
 // spray puffs at the foot
 ctx.fillStyle='rgba(216,245,226,0.4)';
 for(let k=0;k<3;k++){const r=8+k*5+(reduced?0:Math.sin(t*.12+k)*2);ctx.beginPath();ctx.arc(x+(k-1)*9,top+len,r,Math.PI,0);ctx.fill();}
}

function _sauropod(ctx,x,y,s,t,phase,reduced){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=P.herd;ctx.strokeStyle=P.herd;ctx.lineCap='round';
 const step=reduced?0:Math.sin(t*.05+phase);
 const neck=reduced?0:Math.sin(t*.02+phase)*6;
 ctx.beginPath();ctx.moveTo(-70,-30);ctx.quadraticCurveTo(-20,-78,40,-52);ctx.quadraticCurveTo(64,-40,58,-18);
 ctx.quadraticCurveTo(0,-6,-70,-30);ctx.closePath();ctx.fill();
 // long neck + small head
 ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(42,-50);ctx.quadraticCurveTo(78,-90,92+neck,-130);ctx.stroke();
 ctx.beginPath();ctx.arc(98+neck,-132,9,0,TAU);ctx.fill();
 // whip tail
 ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-64,-30);ctx.quadraticCurveTo(-110,-24,-150,-4+step*3);ctx.stroke();
 // four pillar legs, walking
 ctx.lineWidth=14;
 for(const [lx,ph] of [[-44,1],[-26,-1],[28,-1],[44,1]]){
  ctx.beginPath();ctx.moveTo(lx,-22);ctx.lineTo(lx+step*ph*6,12);ctx.stroke();
 }
 ctx.restore();
}

function _pterosaur(ctx,x,y,s,flap){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#173f3d';
 ctx.beginPath();ctx.moveTo(-22,flap*8);ctx.quadraticCurveTo(-10,-4-flap*4,0,0);ctx.quadraticCurveTo(10,-4-flap*4,22,flap*8);
 ctx.quadraticCurveTo(8,4,0,4);ctx.quadraticCurveTo(-8,4,-22,flap*8);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(9,-3);ctx.lineTo(1,-5);ctx.closePath();ctx.fill();
 ctx.restore();
}

function _ammonite(ctx,x,y,r){
 ctx.strokeStyle=P.bone;ctx.lineWidth=2;ctx.beginPath();
 for(let k=0;k<=28;k++){const a=k*.42,rr=r*(1-k/34);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;k?ctx.lineTo(px,py):ctx.moveTo(px,py);}
 ctx.stroke();
}

function _fossilSkull(ctx,x,y,s,t,reduced){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 ctx.fillStyle=P.bone;ctx.strokeStyle='#8f8a6c';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-70,0);ctx.quadraticCurveTo(-76,-46,-30,-58);ctx.quadraticCurveTo(30,-66,76,-30);
 ctx.lineTo(80,-6);ctx.lineTo(-70,0);ctx.closePath();ctx.fill();ctx.stroke();
 // jaw
 ctx.beginPath();ctx.moveTo(-60,4);ctx.lineTo(72,2);ctx.quadraticCurveTo(40,26,-50,20);ctx.closePath();ctx.fill();ctx.stroke();
 // teeth
 ctx.fillStyle='#fffbe8';
 for(let k=0;k<7;k++){const tx=-34+k*15;ctx.beginPath();ctx.moveTo(tx,0);ctx.lineTo(tx+5,9);ctx.lineTo(tx+10,0);ctx.closePath();ctx.fill();}
 // fenestrae + geode eye that slowly breathes
 ctx.fillStyle='#24382e';ctx.beginPath();ctx.arc(-8,-30,13,0,TAU);ctx.fill();
 ctx.beginPath();ctx.arc(34,-28,9,0,TAU);ctx.fill();
 const glow=reduced?.7:.55+Math.sin(t*.05)*.3;
 ctx.globalAlpha=glow;ctx.fillStyle=P.geode;ctx.beginPath();ctx.arc(-8,-30,6,0,TAU);ctx.fill();
 ctx.globalAlpha=glow*.35;ctx.beginPath();ctx.arc(-8,-30,16,0,TAU);ctx.fill();
 ctx.globalAlpha=1;ctx.restore();
}

function _cycad(ctx,cx,cy,h,sway){
 ctx.strokeStyle=P.fern;ctx.fillStyle=P.fern;ctx.lineCap='round';
 ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(cx+sway*.3,cy-h*.5,cx+sway,cy-h);ctx.stroke();
 // trunk scales
 ctx.lineWidth=2;ctx.strokeStyle='#1b4a3c';
 for(let k=1;k<6;k++){const yy=cy-h*k/6,xx=cx+sway*(k/6)*(k/6);ctx.beginPath();ctx.moveTo(xx-6,yy);ctx.lineTo(xx+6,yy-4);ctx.stroke();}
 ctx.strokeStyle=P.fern;ctx.lineWidth=4;
 for(let f=-4;f<=4;f++){
  const fx=cx+sway+f*30+sway*.4,fy=cy-h+Math.abs(f)*15;
  ctx.beginPath();ctx.moveTo(cx+sway,cy-h);ctx.quadraticCurveTo((cx+sway+fx)*.5,fy-26,fx,fy);ctx.stroke();
 }
}

function _treeFern(ctx,x,base,h,sway){
 ctx.fillStyle=P.canopy;ctx.strokeStyle=P.canopy;ctx.lineCap='round';ctx.lineWidth=7;
 ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x+sway*.5,base-h);ctx.stroke();
 for(let k=0;k<7;k++){
  const a=-Math.PI+k*Math.PI/6+sway*.01;ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(x+sway*.5,base-h);
  ctx.quadraticCurveTo(x+sway*.5+Math.cos(a)*30,base-h+Math.sin(a)*30-12,x+sway*.5+Math.cos(a)*54,base-h+Math.sin(a)*44+18);ctx.stroke();
 }
}

const GUARDIAN_STARS=[
 {x:.10,y:.10},{x:.17,y:.06},{x:.24,y:.09},{x:.30,y:.16},
 {x:.25,y:.22},{x:.18,y:.25},{x:.12,y:.19},{x:.35,y:.13},{x:.42,y:.08}
];

export function drawDinoCraterBackdrop(ctx,cam,t,viewportW,viewportH,reduceMotion=false){
 const w=viewportW||1100,h=viewportH||700,reduced=!!reduceMotion;
 const cx=Number.isFinite(cam?.x)?cam.x:0;
 t=Number(t)||0;
 ctx.save();

 // ── Layer 0: humid jade sky (cached per context + height) ──
 ctx.fillStyle=cachedGradient(ctx,'dino-valley-sky:'+h,()=>{
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,P.skyTop);g.addColorStop(.48,P.skyMid);g.addColorStop(.8,P.skyLow);g.addColorStop(1,'#c8ead0');return g;
 });
 ctx.fillRect(0,0,w,h);

 // ── Layer 1: pale misty sun with flat halo rings ──
 const sunX=wrap(w*.74-cx*.012,w*1.6)-w*.2,sunY=h*.2;
 ctx.fillStyle='rgba(244,255,216,0.10)';ctx.beginPath();ctx.arc(sunX,sunY,120,0,TAU);ctx.fill();
 ctx.fillStyle='rgba(244,255,216,0.16)';ctx.beginPath();ctx.arc(sunX,sunY,80,0,TAU);ctx.fill();
 ctx.fillStyle=P.sun;ctx.beginPath();ctx.arc(sunX,sunY,44,0,TAU);ctx.fill();

 // ── Layer 2: GUARDIÁN ANTIGUO constellation, faint in the daylight ──
 ctx.strokeStyle='rgba(230,255,240,0.22)';ctx.lineWidth=1.2;ctx.beginPath();
 for(let i=0;i<GUARDIAN_STARS.length;i++){
  const sx=wrap(GUARDIAN_STARS[i].x*w*1.4-cx*.018,w*1.3),sy=GUARDIAN_STARS[i].y*h;
  i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
 }
 ctx.stroke();
 for(const st of GUARDIAN_STARS){
  const sx=wrap(st.x*w*1.4-cx*.018,w*1.3),sy=st.y*h;
  const pulse=reduced?1:(1+Math.sin(t*.09+st.x*18)*.3);
  ctx.fillStyle='#f2fff6';ctx.beginPath();ctx.arc(sx,sy,2.2*pulse,0,TAU);ctx.fill();
 }

 // ── Layer 3: table-top mesas with waterfalls (far parallax .04) ──
 const mesaSpan=w+900,mesaOff=wrap(-cx*.04,mesaSpan);
 for(let i=0;i<4;i++){
  const mx=wrap(i*mesaSpan/4+mesaOff,mesaSpan)-300;
  const mw=210+hash(i)*120,mh=h*(.26+hash(i+9)*.12),base=h*.7;
  _mesa(ctx,mx,base,mw,mh);
  if(i%2===0)_waterfall(ctx,mx+mw*.12,base-mh+4,mh-10,t+i*20,reduced);
 }

 // ── Layer 4: drifting mist band ──
 const mistOff=reduced?0:t*.25;
 for(let i=0;i<7;i++){
  const mx=wrap(i*230+mistOff-cx*.06,w+460)-230;
  ctx.fillStyle='rgba(216,245,226,0.20)';ctx.beginPath();ctx.arc(mx,h*.7,110+hash(i)*50,Math.PI,0);ctx.fill();
 }

 // ── Layer 5: sauropod herd strolling across the valley (parallax .09) ──
 const herdSpan=w+1400,walk=reduced?0:t*.18;
 for(let i=0;i<3;i++){
  const hx=wrap(i*470+walk-cx*.09,herdSpan)-500;
  _sauropod(ctx,hx,h*.74,.55+hash(i+3)*.25,t,i*2.1,reduced);
 }

 // ── Layer 6: pterosaur flock gliding high ──
 const flockX=wrap((reduced?0:t*1.1)-cx*.05,w+500)-250;
 for(let i=0;i<5;i++){
  const flap=reduced?.3:Math.sin(t*.22+i*1.3);
  _pterosaur(ctx,flockX+i*34-(i%2)*14,h*.14+i*(i%2?9:-4)+Math.abs(i-2)*10,.9-i*.06,flap);
 }

 // ── Layer 7: jungle canopy hills + tree ferns (parallax .18) ──
 ctx.fillStyle=P.canopy;ctx.beginPath();ctx.moveTo(0,h);
 for(let x=0;x<=w+60;x+=60){const wx=x+cx*.18;ctx.lineTo(x,h*.76-(34+Math.sin(wx*.006)*26+Math.sin(wx*.017)*14));}
 ctx.lineTo(w,h);ctx.closePath();ctx.fill();
 const tfOff=wrap(-cx*.18,w+300),sway=reduced?0:Math.sin(t*.035)*6;
 for(let i=0;i<7;i++){const tx=wrap(i*190+tfOff,w+300)-150;_treeFern(ctx,tx,h*.74,70+hash(i+20)*60,sway+i);}

 // ── Layer 8: fossil cliff — strata, ammonites, giant T-rex skull (parallax .26) ──
 const cliffSpan=w+1200,cliffX=wrap(w*.3-cx*.26,cliffSpan)-400;
 ctx.fillStyle=P.cliff;ctx.beginPath();
 ctx.moveTo(cliffX-260,h);ctx.lineTo(cliffX-220,h*.64);ctx.lineTo(cliffX-90,h*.58);ctx.lineTo(cliffX+120,h*.6);
 ctx.lineTo(cliffX+260,h*.68);ctx.lineTo(cliffX+300,h);ctx.closePath();ctx.fill();
 ctx.strokeStyle=P.strata;ctx.lineWidth=3;
 for(let k=1;k<5;k++){const yy=h*.6+k*h*.06;ctx.beginPath();ctx.moveTo(cliffX-240,yy);ctx.quadraticCurveTo(cliffX,yy-10,cliffX+280,yy+4);ctx.stroke();}
 _ammonite(ctx,cliffX-170,h*.78,16);_ammonite(ctx,cliffX+200,h*.84,12);
 _fossilSkull(ctx,cliffX+10,h*.7,.85,t,reduced);

 // ── Layer 9: swaying cycads (near parallax .34) ──
 const fernOff=wrap(-cx*.34,w+500),windSway=reduced?0:Math.sin(t*.04)*8;
 for(let i=0;i<5;i++){const fx=wrap(i*260+fernOff,w+500)-100;_cycad(ctx,fx,h*.9+10,90+hash(i+40)*50,windSway+i*3);}

 // ── Layer 10: fireflies / pollen (deterministic orbits) ──
 if(!reduced){
  for(let i=0;i<30;i++){
   const px=wrap(i*137.5+Math.sin(t*.02+i)*40-cx*.3,w+120)-60;
   const py=h*.35+hash(i+60)*h*.5+Math.sin(t*.05+i*1.7)*18;
   const a=.35+.35*Math.max(0,Math.sin(t*.08+i*2.3));
   ctx.fillStyle='rgba(217,255,158,'+(a*.35).toFixed(3)+')';ctx.beginPath();ctx.arc(px,py,5,0,TAU);ctx.fill();
   ctx.fillStyle='rgba(217,255,158,'+a.toFixed(3)+')';ctx.beginPath();ctx.arc(px,py,1.8,0,TAU);ctx.fill();
  }
 }

 // ── Layer 11: ground mist (cached) ──
 ctx.fillStyle=cachedGradient(ctx,'dino-valley-mist:'+h,()=>{
  const g=ctx.createLinearGradient(0,h-170,0,h);
  g.addColorStop(0,'rgba(216,245,226,0)');g.addColorStop(1,'rgba(216,245,226,0.32)');return g;
 });
 ctx.fillRect(0,h-170,w,170);

 ctx.restore();
}
