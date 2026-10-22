// OHANA V462 · Michicornio L projectiles: one luminous shot per tentacle, launched
// from the tentacle tips, with a TRANSPARENT wake instead of the old additive white
// ribbons. Pure Canvas 2D: layered alpha fills/strokes only, never gradients; no RNG.
import {MICHI_L_SHOTS,michiLaunchFrame} from '../characters/michi-anatomy.js';
import {michiGenome} from '../characters/michi-jelly.js';
import {CALIBRATED_HEIGHT} from '../characters/visual-size.js';
export {MICHI_L_SHOTS,michiLaunchFrame};
const TAU=Math.PI*2;
// Shot variant per form: kitten tail stars, fairy pixie stars, medusa moon-jellies,
// astral comet flames, eclipse jellies.
export const MICHI_SHOT_KIND=Object.freeze(['star','pixie','jelly','comet','jelly']);

// Tentacle-tip anchors in world space (relative to the hitbox foot), mirrored by facing.
export function michiShotAnchors(p,form){
 const f=Math.max(0,Math.min(4,form|0)),n=MICHI_L_SHOTS[f],H=CALIBRATED_HEIGHT[f]||80;
 const foot=p.y+p.h,cx=p.x+p.w/2,dir=p.facing<0?-1:1,out=[];
 for(let i=0;i<n;i++){
  const u=n>1?i/(n-1):.5;let ax,ay,ang;
  if(f===2){ax=(u-.5)*H*.5;ay=-H*.14;ang=-.55+u*1.1;}                 // seven bell tentacles
  else if(f===4){const a=Math.PI*(.84-i*.085);ax=-Math.cos(a)*H*.5;ay=-H*.42+Math.sin(a)*H*.36;ang=-1+u*2;} // nine guardian tails
  else if(f===3){ax=-H*.32+(u-.5)*H*.16;ay=-H*.86+(u-.5)*H*.1;ang=-.9+u*.9;} // astral tail fronds
  else if(f===1){const s=i%2?1:-1,top=i<2;ax=s*H*.34;ay=-H*(top?.78:.52);ang=(top?-.7:.15)*(s>0?1:.6);} // four wing tips
  else {ax=-H*.32+u*H*.1;ay=-H*.5-u*H*.12;ang=-.8+u*.8;}                // kitten tail tip
  out.push({x:cx+ax*dir,y:foot+ay,ang:dir>0?ang:Math.PI-ang});
 }
 return out;
}
export function michiShotPalette(seed){
 const pal=michiGenome(seed||0).palette;
 return [pal.glow,pal.gonad,pal.glow2,pal.bead];
}

// --- drawing -----------------------------------------------------------------
function wake(ctx,pts,hx,hy,width,color){
 const n=pts.length;if(n<2)return;
 const all=pts.concat([{x:hx,y:hy}]),L=[],R=[];
 for(let i=0;i<all.length;i++){
  const a=all[Math.max(0,i-1)],b=all[Math.min(all.length-1,i+1)];
  let nx=-(b.y-a.y),ny=b.x-a.x;const d=Math.hypot(nx,ny)||1;nx/=d;ny/=d;
  const k=i/(all.length-1),w=width*Math.pow(k,.85)*(.55+.45*k);
  L.push([all[i].x+nx*w,all[i].y+ny*w]);R.push([all[i].x-nx*w,all[i].y-ny*w]);
 }
 const poly=s=>{ctx.beginPath();ctx.moveTo(L[0][0],L[0][1]);
  for(let i=1;i<L.length;i++){const sx=all[i].x+(L[i][0]-all[i].x)*s,sy=all[i].y+(L[i][1]-all[i].y)*s;ctx.lineTo(sx,sy);}
  for(let i=R.length-1;i>=0;i--){const sx=all[i].x+(R[i][0]-all[i].x)*s,sy=all[i].y+(R[i][1]-all[i].y)*s;ctx.lineTo(sx,sy);}
  ctx.closePath();};
 ctx.fillStyle=color;
 ctx.globalAlpha=.12;poly(1);ctx.fill();      // soft outer wake: you see the level through it
 ctx.globalAlpha=.16;poly(.55);ctx.fill();
 ctx.fillStyle='#ffffff';ctx.globalAlpha=.18;poly(.18);ctx.fill();
 // Two drifting filaments make the wake read as water/plasma, not a solid tube.
 ctx.lineCap='round';ctx.lineWidth=1;ctx.strokeStyle=color;
 for(const side of [-1,1]){ctx.globalAlpha=.32;ctx.beginPath();
  for(let i=0;i<all.length;i++){const k=i/(all.length-1),q=side>0?L[i]:R[i],m=.62+.12*Math.sin(i*.9+side);
   const x=all[i].x+(q[0]-all[i].x)*m,y=all[i].y+(q[1]-all[i].y)*m;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
  ctx.stroke();}
}
function rings(ctx,x,y,r,color){ // flat halo: three concentric low-alpha discs
 ctx.fillStyle=color;
 for(const [k,a] of [[1,.07],[.68,.11],[.42,.18]]){ctx.globalAlpha=a;ctx.beginPath();ctx.arc(x,y,r*k,0,TAU);ctx.fill();}
}
function star(ctx,r,inner,points=5){ctx.beginPath();for(let k=0;k<points*2;k++){const a=k*Math.PI/points-Math.PI/2,rr=k%2?r*inner:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();}

export function drawMichiTailShot(ctx,f,cam,t){
 const x=f.x-cam.x,y=f.y-cam.y,kind=MICHI_SHOT_KIND[f.form|0]||'jelly',col=f.color||'#ffb6e4';
 const pts=(f.trail||[]).map(q=>({x:q.x-cam.x,y:q.y-cam.y}));
 ctx.save();ctx.lineJoin='round';
 if(f.delay>0){ // charging on the tentacle tip, before launch
  const k=1-Math.min(1,f.delay/Math.max(1,f.delay0||f.delay));
  rings(ctx,x,y,6+k*8,col);ctx.globalAlpha=.9;ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.arc(x,y,1.5+k*2.2,0,TAU);ctx.fill();
  ctx.restore();return;
 }
 wake(ctx,pts,x,y,kind==='comet'?9:kind==='jelly'?8:6.5,col);
 const ang=Math.atan2(f.vy||0,f.vx||1),age=f.age||0,pulse=.5+.5*Math.sin(age*.45+(f.idx||0));
 rings(ctx,x,y,kind==='jelly'?20:17,col);
 ctx.translate(x,y);ctx.rotate(ang);
 if(kind==='jelly'){
  // A tiny moon-jelly swimming head-first: translucent bell, rim light, four gonads,
  // trailing filaments that lag behind with the swim pulse.
  const bw=8+pulse*1.8,bl=10-pulse*1.8; // swim pulse: bell widens as it shortens
  ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.lineCap='round';
  for(let k=-2;k<=2;k++){ctx.globalAlpha=k%2?.4:.6;ctx.beginPath();ctx.moveTo(-1,k*bw*.32);
   ctx.quadraticCurveTo(-9,k*bw*.36+Math.sin(age*.5+k)*2.5,-16-pulse*4-Math.abs(k)*2,k*bw*.42+Math.sin(age*.33+k*2)*3.5);ctx.stroke();}
  // Dome facing the flight direction, scalloped skirt at the back.
  const dome=()=>{ctx.beginPath();ctx.ellipse(0,0,bl,bw,0,-Math.PI/2,Math.PI/2);
   for(let k=0;k<4;k++){const y0=bw-k*bw/2,y1=y0-bw/2;ctx.quadraticCurveTo(-3.2,(y0+y1)/2,0,y1);}ctx.closePath();};
  dome();ctx.globalAlpha=.42;ctx.fillStyle=col;ctx.fill();
  ctx.globalAlpha=.9;ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.stroke();
  ctx.globalAlpha=.55;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(bl*.45,-bw*.38,bl*.3,bw*.2,-.4,0,TAU);ctx.fill();
  // Four-leaf gonad ring (moon jelly) in the warm accent, plus a glowing nucleus.
  ctx.globalAlpha=.75;ctx.strokeStyle=f.accent||'#ffe6a8';ctx.lineWidth=1.1;
  for(let k=0;k<4;k++){const a=k*TAU/4+.4;ctx.beginPath();ctx.arc(bl*.32+Math.cos(a)*2.2,Math.sin(a)*2.2,1.5,0,TAU);ctx.stroke();}
  ctx.globalAlpha=.95;ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.arc(bl*.32,0,1.2,0,TAU);ctx.fill();
 }else if(kind==='comet'){
  // Astral comet: nested teardrop flames + white-hot nucleus.
  const L=16+pulse*4;
  for(const [s,a,c] of [[1,.45,col],[.68,.6,f.accent||'#ffd9a0'],[.38,.95,'#ffffff']]){
   ctx.globalAlpha=a;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(7*s,0);ctx.quadraticCurveTo(6*s,-7*s,-2*s,-6*s);ctx.quadraticCurveTo(-L*s*.7,-2*s,-L*s,0);ctx.quadraticCurveTo(-L*s*.7,2*s,-2*s,6*s);ctx.quadraticCurveTo(6*s,7*s,7*s,0);ctx.closePath();ctx.fill();}
 }else{
  // Stars (kitten tail / fairy pixie): a spinning faceted star with a white core.
  ctx.rotate(-ang+age*(kind==='pixie'?.22:.14));
  const r=kind==='pixie'?6.5:7.5;
  ctx.globalAlpha=.55;ctx.fillStyle=col;star(ctx,r*1.35,.45);ctx.fill();
  ctx.globalAlpha=1;ctx.fillStyle='#fff7d8';star(ctx,r,.42);ctx.fill();
  ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.stroke();
  if(kind==='pixie'){ctx.globalAlpha=.8;ctx.fillStyle=col;for(let k=0;k<3;k++){const a=k*TAU/3+age*.3;ctx.beginPath();ctx.arc(Math.cos(a)*11,Math.sin(a)*11,1.3,0,TAU);ctx.fill();}}
 }
 ctx.restore();
}
