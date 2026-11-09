import {drawCharacter} from '../characters/draw.js';
import {createFamilyActor} from './family-actor.js';
import {drawRitualCore} from './final-ritual-art.js';

// One live family portrait inside each glass. Bounds come from the same actor
// renderer used in play, rather than physical hitboxes or substitute sculptures.
const TAU=Math.PI*2,SIZE=512,FOOT=400,portraits=new Map();
let measuring=null;
const finite=(n,d=0)=>Number.isFinite(n)?n:d;

function mirrorActor(hero,state='idle',facing=1){
 return createFamilyActor(hero,{form:1,pose:state,facing});
}
function portraitBounds(ctx,hero){
 if(portraits.has(hero))return portraits.get(hero);
 const doc=ctx.canvas?.ownerDocument||globalThis.document;
 if(!doc?.createElement)return {left:-60,top:-120,right:60,bottom:8};
 if(!measuring){const canvas=doc.createElement('canvas');canvas.width=canvas.height=SIZE;measuring=canvas.getContext('2d',{willReadFrequently:true});}
 let left=SIZE,top=SIZE,right=0,bottom=0;
 for(const state of['idle','victory'])for(const time of[0,45,90,135]){
  measuring.setTransform(1,0,0,1,0,0);measuring.clearRect(0,0,SIZE,SIZE);
  measuring.save();measuring.translate(SIZE/2,FOOT);
  drawCharacter(measuring,mirrorActor(hero,state),{x:0,y:0},time);measuring.restore();
  const data=measuring.getImageData(0,0,SIZE,SIZE).data;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(data[(y*SIZE+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 }
 const pad=6,bounds={left:left-SIZE/2-pad,top:top-FOOT-pad,right:right-SIZE/2+pad,bottom:bottom-FOOT+pad};
 portraits.set(hero,bounds);return bounds;
}

// Fit the complete animated silhouette into a rectangle inscribed in the oval.
// This keeps ears, horns, wings and paws inside the glass in either direction.
export function mirrorPortraitLayout(bounds,rx=108,ry=132){
 rx=Math.max(1,finite(rx,108));ry=Math.max(1,finite(ry,132));
 const left=finite(bounds?.left,-60),top=finite(bounds?.top,-120);
 const right=Math.max(left+1,finite(bounds?.right,60)),bottom=Math.max(top+1,finite(bounds?.bottom,8));
 const scale=Math.min(rx*1.36/(right-left),ry*1.36/(bottom-top));
 const x=-(left+right)*.5*scale,y=ry*.025-(top+bottom)*.5*scale;
 return {scale,x,y,painted:{x:left*scale+x,y:top*scale+y,w:(right-left)*scale,h:(bottom-top)*scale}};
}

export function drawMirrorPortrait(ctx,hero,rx,ry,t=0,{near=false,reduced=false,facing=1}={}){
 const actor=mirrorActor(hero,near?'victory':'idle',facing);if(!actor)return null;
 const bounds=portraitBounds(ctx,hero),fit=mirrorPortraitLayout(bounds,rx,ry);
 ctx.save();ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.clip();
 ctx.shadowBlur=0;ctx.filter='none';ctx.globalAlpha=1;
 ctx.translate(fit.x*facing,fit.y);ctx.scale(fit.scale,fit.scale);
 drawCharacter(ctx,actor,{x:0,y:0},reduced?0:finite(t),{reduceMotion:reduced});
 ctx.restore();return {hero,form:1,bounds,fit};
}

export function drawPortalMirrors(ctx,portals,cam,t=0,player,reduced=false,ritual=null){
 const rendered=[];if(!portals?.length)return rendered;
 const camera={x:finite(cam?.x),y:finite(cam?.y)};
 const viewport=ctx.canvas?.width/Math.max(.01,Math.abs(ctx.getTransform?.().a||1));
 const time=reduced?0:t;
 for(const p of portals){
  const rx=Math.max(1,finite(p.rx,108)),ry=Math.max(1,finite(p.ry,132));
  const x=finite(p.x)-camera.x,y=finite(p.y)-camera.y;
  if(Number.isFinite(viewport)&&(x+rx<0||x-rx>viewport))continue;
  const dx=player?player.x+player.w/2-p.x:0;
  const dist=Math.hypot(dx,player?player.y+player.h/2-p.y:9999);
  const near=!!player&&dist<240;
  const proximity=Math.max(0,Math.min(1,(240-dist)/240));

  ctx.save();ctx.translate(x,y);
  ctx.lineCap='round';ctx.lineJoin='round';

  // 1. Celestial background aura & astral constellation field
  if(near||proximity>0.1){
   ctx.save();
   ctx.globalAlpha=(0.2+proximity*0.35);
   ctx.fillStyle=near?'#ffd966':'#7ee7ff';
   ctx.beginPath();
   ctx.ellipse(0,0,rx*1.18,ry*1.18,0,0,TAU);
   ctx.fill();
   ctx.restore();
  }

  // 2. Outer engraved astrological ring with 8 constellation notches
  ctx.save();
  ctx.strokeStyle=near?'#ffe082':'#748ea3';
  ctx.lineWidth=near?3.5:2;
  ctx.beginPath();
  ctx.ellipse(0,0,rx*1.08,ry*1.08,0,0,TAU);
  ctx.stroke();
  const starCount=8;
  const starRot=reduced?0:time*0.015;
  for(let i=0;i<starCount;i++){
   const a=(i/starCount)*TAU+starRot;
   const sx=Math.cos(a)*rx*1.08,sy=Math.sin(a)*ry*1.08;
   ctx.fillStyle=near?'#fffdf0':'#c6e2ff';
   ctx.beginPath();ctx.arc(sx,sy,near?3.2:2.2,0,TAU);ctx.fill();
  }
  ctx.restore();

  // 3. Ornate Polynesian / Celestial Gilded Frame Molding (outer bevel, gold leaf, inner obsidian)
  const frameGold=ctx.createLinearGradient(-rx,-ry,rx,ry);
  frameGold.addColorStop(0,near?'#fff5be':'#d4af37');
  frameGold.addColorStop(0.35,near?'#ffd700':'#aa8222');
  frameGold.addColorStop(0.7,near?'#e0a828':'#7a5812');
  frameGold.addColorStop(1,near?'#fff0a8':'#caa134');
  ctx.strokeStyle=frameGold;
  ctx.lineWidth=near?7.5:5.5;
  ctx.beginPath();ctx.ellipse(0,0,rx*1.03,ry*1.03,0,0,TAU);ctx.stroke();

  // Dark obsidian bevel inlay
  ctx.strokeStyle='#0b131e';
  ctx.lineWidth=2.2;
  ctx.beginPath();ctx.ellipse(0,0,rx*0.985,ry*0.985,0,0,TAU);ctx.stroke();

  // 4. Deep cosmic glass interior
  const glass=ctx.createLinearGradient(0,-ry,0,ry);
  glass.addColorStop(0,'#09121f');
  glass.addColorStop(0.45,'#122336');
  glass.addColorStop(0.85,'#19324a');
  glass.addColorStop(1,'#22435f');
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fillStyle=glass;ctx.fill();

  // Subtle deterministic background stardust inside the mirror glass
  ctx.save();
  ctx.beginPath();ctx.ellipse(0,0,rx-2,ry-2,0,0,TAU);ctx.clip();
  for(let s=0;s<12;s++){
   const px=(((s*47+13)%199)/199-0.5)*rx*1.7;
   const py=(((s*61+29)%197)/197-0.5)*ry*1.7;
   const tw=(Math.sin((reduced?0:time*0.06)+s*1.7)+1)*0.5;
   ctx.fillStyle='#ffffff';
   ctx.globalAlpha=0.25+tw*0.55;
   ctx.beginPath();ctx.arc(px,py,1+tw*0.8,0,TAU);ctx.fill();
  }
  ctx.restore();

  // 5. Render character portrait
  const portrait=ritual?.finalRitualEnabled
   ? drawRitualCore(ctx,{...p,rx,ry},ritual,t,reduced)
   : drawMirrorPortrait(ctx,p.hero,rx-5,ry-5,t,{near,reduced,facing:near&&dx<0?-1:1});
  if(portrait)rendered.push(portrait);

  // 6. Prismatic crystalline bevel reflections & specular caustics
  // Primary top-left sweeping glass reflection
  ctx.strokeStyle='rgba(255, 255, 255, 0.75)';
  ctx.lineWidth=2.8;
  ctx.beginPath();
  ctx.ellipse(-rx*0.02,-ry*0.02,rx*0.93,ry*0.93,0,Math.PI*1.06,Math.PI*1.48);
  ctx.stroke();

  // Delicate secondary rim reflection
  ctx.strokeStyle='rgba(168, 230, 255, 0.45)';
  ctx.lineWidth=1.8;
  ctx.beginPath();
  ctx.ellipse(0,0,rx*0.94,ry*0.94,0,Math.PI*0.12,Math.PI*0.42);
  ctx.stroke();

  // Four ornate astrological quadrant clasps (Top, Bottom, Left, Right)
  const clasps=[[0,-ry*1.04],[0,ry*1.04],[-rx*1.04,0],[rx*1.04,0]];
  for(let c=0;c<4;c++){
   const [cxP,cyP]=clasps[c];
   ctx.fillStyle=near?'#fff2b8':'#e6b83b';
   ctx.strokeStyle='#4a3608';
   ctx.lineWidth=1.2;
   ctx.beginPath();
   ctx.arc(cxP,cyP,c===0?5.5:4.2,0,TAU);
   ctx.fill();ctx.stroke();
   ctx.fillStyle='#ffffff';
   ctx.beginPath();ctx.arc(cxP-1,cyP-1,1.2,0,TAU);ctx.fill();
  }

  // Brilliant 4-point starlight lens flare on top crest when near
  if(near){
   const flareY=-ry*1.04;
   ctx.fillStyle='#ffffff';
   ctx.beginPath();
   ctx.moveTo(0,flareY-9);ctx.lineTo(3,flareY);
   ctx.lineTo(0,flareY+9);ctx.lineTo(-3,flareY);
   ctx.closePath();ctx.fill();
   ctx.beginPath();
   ctx.moveTo(-9,flareY);ctx.lineTo(0,flareY-3);
   ctx.lineTo(9,flareY);ctx.lineTo(0,flareY+3);
   ctx.closePath();ctx.fill();
  }

  // Bottom pedestal mount bracket with Polynesian spiral glyph
  ctx.fillStyle=near?'#ffd54f':'#b38b2d';
  ctx.strokeStyle='#3b2706';
  ctx.lineWidth=1.4;
  ctx.beginPath();
  ctx.moveTo(-22,ry*0.97);
  ctx.quadraticCurveTo(-14,ry*1.07,0,ry*1.08);
  ctx.quadraticCurveTo(14,ry*1.07,22,ry*0.97);
  ctx.lineTo(16,ry*1.03);
  ctx.lineTo(-16,ry*1.03);
  ctx.closePath();
  ctx.fill();ctx.stroke();

  ctx.restore();
 }
 return rendered;
}

// All glass rests above the named plinth, leaving its plaque unobstructed.
export const FINAL_PORTALS=Object.freeze([
 'kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi'
].map((hero,i)=>Object.freeze({hero,x:900+i*560,y:934,rx:108,ry:132})));
