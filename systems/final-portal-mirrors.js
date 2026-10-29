import {drawCharacter} from '../characters/draw.js';
import {createFamilyActor} from './family-actor.js';

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

export function drawPortalMirrors(ctx,portals,cam,t=0,player,reduced=false){
 const rendered=[];if(!portals?.length)return rendered;
 const camera={x:finite(cam?.x),y:finite(cam?.y)};
 const viewport=ctx.canvas?.width/Math.max(.01,Math.abs(ctx.getTransform?.().a||1));
 for(const p of portals){
  const rx=Math.max(1,finite(p.rx,108)),ry=Math.max(1,finite(p.ry,132));
  const x=finite(p.x)-camera.x,y=finite(p.y)-camera.y;
  if(Number.isFinite(viewport)&&(x+rx<0||x-rx>viewport))continue;
  const dx=player?player.x+player.w/2-p.x:0;
  const near=!!player&&Math.hypot(dx,player.y+player.h/2-p.y)<240;
  ctx.save();ctx.translate(x,y);
  // Dark, quiet glass separates the actual coat/face from the bright observatory.
  const glass=ctx.createLinearGradient(0,-ry,0,ry);
  glass.addColorStop(0,'#13283d');glass.addColorStop(.6,'#243b50');glass.addColorStop(1,'#304957');
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fillStyle=glass;ctx.fill();
  const portrait=drawMirrorPortrait(ctx,p.hero,rx-5,ry-5,t,{near,reduced,facing:near&&dx<0?-1:1});
  if(portrait)rendered.push(portrait);
  ctx.strokeStyle=near?'#fff1bf':'#c7d8df';ctx.lineWidth=near?4:2.5;
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.stroke();
  // Rim reflections stay at the edge, away from the face.
  ctx.strokeStyle='#e5f4ef99';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(-rx*.02,-ry*.02,rx*.91,ry*.91,0,Math.PI*1.08,Math.PI*1.46);ctx.stroke();
  ctx.restore();
 }
 return rendered;
}

// All glass rests above the named plinth, leaving its plaque unobstructed.
export const FINAL_PORTALS=Object.freeze([
 'kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi'
].map((hero,i)=>Object.freeze({hero,x:900+i*560,y:934,rx:108,ry:132})));
