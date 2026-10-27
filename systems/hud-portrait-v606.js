// A live miniature of the actual Canvas actor. Its own envelope is measured
// once per form; collision boxes and generic evolution sizes never frame art.
import {drawCharacter} from '../characters/draw.js';
import {ROSTER} from '../characters/roster.js';
const actors=new WeakMap(),bounds=new Map(),SIZE=512,FOOT=424;
const roster=new Map(ROSTER.map(r=>[r.id,r]));
function actorFor(p){
 const evo=Math.max(0,Math.min(4,Number(p.evo)||0)),def=roster.get(p.id),form=p.forms?.[evo]||def?.forms?.[evo]||{};
 const w=form.w||28,h=form.h||32;
 return {id:p.id,evo,color:p.color||form.color,x:SIZE/2-w/2,y:FOOT-h,w,h,facing:1,
 grounded:true,vx:0,vy:0,melee:0,invuln:0,visualScale:1.5,
 _introForceCanvas:true,_duetActor:true,_theatreHQ:true,michiSeed:p.michiSeed};
}
function envelope(ctx){
 const pixels=ctx.getImageData(0,0,SIZE,SIZE).data;let left=SIZE,top=SIZE,right=0,bottom=0;
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(pixels[(y*SIZE+x)*4+3]>22){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<=left||bottom<=top)return {x:128,y:160,w:256,h:280};
 // Room for breathing, antennae, ears and Kilo's idle arm movement. This
 // envelope remains fixed while animating so the portrait never zooms/pumps.
 const width=right-left,height=bottom-top,pad=Math.max(10,Math.max(width,height)*.11);
 return {x:Math.max(0,left-pad),y:Math.max(0,top-pad),w:Math.min(SIZE,width+2*pad),h:Math.min(SIZE,height+2*pad)};
}
export function drawHudPortrait(canvas,p,t=0,{reduceMotion=false}={}){
 if(!canvas||!p)return;
 let state=actors.get(canvas);
 if(!state){const stage=canvas.ownerDocument.createElement('canvas');stage.width=stage.height=SIZE;state={stage,ctx:stage.getContext('2d',{willReadFrequently:true})};actors.set(canvas,state);}
 if(canvas.width!==144||canvas.height!==144){canvas.width=canvas.height=144;}
 const c=canvas.getContext('2d'),a=actorFor(p),key=p.id+':'+a.evo;
 if(!bounds.has(key)){
  const boxes=[];
  // Three ordinary idle phases bound the real silhouette, including wings.
  for(const time of [0,72,144]){state.ctx.clearRect(0,0,SIZE,SIZE);drawCharacter(state.ctx,actorFor(p),{x:0,y:0},time,{reduceMotion:false});boxes.push(envelope(state.ctx));}
  const x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));
  bounds.set(key,{x,y,w:Math.max(...boxes.map(b=>b.x+b.w))-x,h:Math.max(...boxes.map(b=>b.y+b.h))-y});
 }
 state.ctx.clearRect(0,0,SIZE,SIZE);drawCharacter(state.ctx,a,{x:0,y:0},reduceMotion?0:t,{reduceMotion});
 const b=bounds.get(key),W=144,H=144;
 c.clearRect(0,0,W,H);
 const glow=c.createRadialGradient(69,64,5,72,72,100);glow.addColorStop(0,'#507b75');glow.addColorStop(.55,'#244953');glow.addColorStop(1,'#0c2537');c.fillStyle=glow;c.fillRect(0,0,W,H);
 c.strokeStyle='#cce5c718';c.lineWidth=1;
 for(let i=0;i<4;i++){c.beginPath();c.moveTo(-10,114+i*10);c.bezierCurveTo(35,91+i*10,90,145-i*6,155,105+i*10);c.stroke();}
 for(const [x,y,r] of [[17,24,2],[116,31,1.5],[123,94,2],[29,99,1]]){c.fillStyle='#e4e2ac80';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 const scale=Math.min(128/b.w,128/b.h),w=b.w*scale,h=b.h*scale;
 c.drawImage(state.stage,b.x,b.y,b.w,b.h,(W-w)/2,(H-h)/2,w,h);
 // Fine, inset edge keeps the miniature separate from bright backgrounds.
 c.strokeStyle='#f6e3b52b';c.lineWidth=2;c.strokeRect(1,1,W-2,H-2);
}
