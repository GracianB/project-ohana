// OHANA V92 · Prismatic resonance. Swept K contact + visible K→L combo.
// Pure deterministic helpers; no damage, collision bodies or timers added here.
export const CUERNO_V92 = Object.freeze({
  maxSweep:180, maxEchoesPerCast:5, echoFrames:28, width:24,
});
const TAU=Math.PI*2;
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const bounded=(n,lo,hi)=>Math.max(lo,Math.min(hi,finite(n)?n:lo));
const distPointToSegment2=(p,a,b)=>{
 const dx=b.x-a.x,dy=b.y-a.y;
 const u=bounded(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
 const ex=a.x+u*dx-p.x,ey=a.y+u*dy-p.y;
 return ex*ex+ey*ey;
};
const crosses=(a,b,c,d)=>{
 // Zero-length movement is a point, not an intersecting line.
 const ab=(b.x-a.x)**2+(b.y-a.y)**2;
 const cd=(d.x-c.x)**2+(d.y-c.y)**2;
 if(ab<1e-8||cd<1e-8)return false;
 const cross=(u,v,w)=>(v.x-u.x)*(w.y-u.y)-(v.y-u.y)*(w.x-u.x);
 const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);
 return ab1*ab2<=0&&cd1*cd2<=0;
};
const distanceSegments2=(a,b,c,d)=>{
 if(crosses(a,b,c,d))return 0;
 return Math.min(
  distPointToSegment2(a,c,d),distPointToSegment2(b,c,d),
  distPointToSegment2(c,a,b),distPointToSegment2(d,a,b)
 );
};
// Detect an enemy crossing an old ribbon between simulation ticks, even if
// their *current* rectangle is outside. Extremely long teleports do not hit.
export function cuernoSweptRibbonTouches(points,enemy,previous,width=CUERNO_V92.width){
 if(!Array.isArray(points)||points.length===0||!enemy||!previous)return false;
 if(![enemy.x,enemy.y,enemy.w,enemy.h,previous.x,previous.y].every(finite))return false;
 if(enemy.w<0||enemy.h<0)return false;
 const a={x:previous.x+enemy.w/2,y:previous.y+enemy.h/2};
 const b={x:enemy.x+enemy.w/2,y:enemy.y+enemy.h/2};
 if(Math.hypot(b.x-a.x,b.y-a.y)>CUERNO_V92.maxSweep)return false;
 const radius=bounded(width,0,80)/2+Math.min(enemy.w,enemy.h)*.47;
 const r2=radius*radius;
 for(let i=0;i<points.length;i++){
   const c=points[i],d=points[Math.min(i+1,points.length-1)];
   if(!c||!d||![c.x,c.y,d.x,d.y].every(finite))continue;
   if(distanceSegments2(a,b,c,d)<=r2)return true;
 }
 return false;
}
export function rememberCuernoEnemyPositions(enemies){
 for(const e of enemies||[]){
   if(!e||!finite(e.x)||!finite(e.y))continue;
   e._cuernoFantasyPrevX=e.x;e._cuernoFantasyPrevY=e.y;
 }
}
// One elegant seven-petal bloom at each enchanted enemy hit by L.
// No additional damage and at most five echoes in any single L.
export function drawCuernoPrismEcho(ctx,f,cam,t,reduced=false){
 if(!f||!(f.life>0))return;
 const max=Math.max(1,finite(f.max)?f.max:CUERNO_V92.echoFrames);
 const progress=bounded(1-f.life/max,0,1);
 const alpha=bounded(f.life/12,0,1)*bounded(progress*9,0,1);
 if(alpha<=0)return;
 const x=(finite(f.x)?f.x:0)-(finite(cam?.x)?cam.x:0);
 const y=(finite(f.y)?f.y:0)-(finite(cam?.y)?cam.y:0);
 const radius=12+38*(1-(1-progress)**2);
 const hues=["#ffc3df","#ffe2a5","#fff4c3","#aff1d2","#ace9f7","#c8caff","#eac6f8"];
 ctx.save();ctx.globalAlpha=alpha*.85;ctx.lineCap="round";
 ctx.lineJoin="round";ctx.lineWidth=1.85;
 for(let i=0;i<7;i++){
   const a=-Math.PI/2+i*TAU/7+(reduced?0:progress*.12);
   const px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius*.73;
   ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);
   ctx.strokeStyle=hues[i];
   ctx.beginPath();ctx.moveTo(-4,3);
   ctx.bezierCurveTo(-6,-4,-1,-8,0,-14);
   ctx.bezierCurveTo(3,-7,7,-2,4,3);ctx.stroke();
   ctx.strokeStyle="#fffced";ctx.lineWidth=.9;
   ctx.beginPath();ctx.moveTo(-2,-1);ctx.quadraticCurveTo(0,-4,2,-1);ctx.stroke();
   ctx.restore();
 }
 ctx.globalAlpha=alpha*.44;ctx.strokeStyle="#fff7dc";ctx.lineWidth=1.6;
 ctx.beginPath();ctx.ellipse(x,y,radius*.80,radius*.35,0,0,TAU);ctx.stroke();
 ctx.restore();
}
