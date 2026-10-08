// OHANA V91: seven-color fantasy readable at gameplay scale.
// No particles, random values, game mutations or new hitboxes.
export const V91_PALETTE=Object.freeze(["#ffafd8","#ffd4a3","#fff0b4","#baf2d0","#afeafd","#c5c6ff","#ecc2fa"]);
const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Number(x)||0));
export function cuernoEnchantRemaining(until,now,duration=90){
 return clamp(((Number(until)||0)-(Number(now)||0))/Math.max(1,duration),0,1);
}
// Four-to-seven small paired hoofmarks; not a continuous particle flood.
export function drawCuernoHoofprints(ctx,points,cam,life,reduce=false){
 if(!Array.isArray(points)||points.length<2)return;
 const alpha=clamp((Number(life)||0)/80,0,.76);
 const spacing=6,offset=reduce?2:0,limit=7;
 let painted=0;
 ctx.save();ctx.lineCap="round";
 for(let i=2+offset;i<points.length&&painted<limit;i+=spacing){
  const p=points[i],last=points[i-1];if(!p||!last)continue;
  const dx=p.x-last.x,dy=p.y-last.y,angle=Math.atan2(dy,dx);
  const x=p.x-(cam?.x||0),y=p.y-(cam?.y||0),side=painted%2?-1:1;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.translate(0,side*9);
  ctx.globalAlpha=alpha*(.5+(painted%3)*.11);
  ctx.strokeStyle=V91_PALETTE[painted%7];ctx.lineWidth=1.7;
  for(const ox of [-4.5,4.5]){
    ctx.beginPath();ctx.ellipse(ox,0,4.1,6.2,0,0,TAU);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(-5,7);ctx.quadraticCurveTo(0,11,5,7);ctx.stroke();
  ctx.restore();painted++;
 }
 ctx.restore();
}
// A visible remaining-time crescent around the three status stars.
export function drawCuernoEnchantClock(ctx,e,cam,now,reduce=false){
 const remaining=cuernoEnchantRemaining(e?._cuernoFantasyUntil,now);
 if(!e||remaining<=0)return;
 const x=(Number(e.x)||0)+(Number(e.w)||0)*.5-(cam?.x||0);
 const y=(Number(e.y)||0)-8-(cam?.y||0);
 ctx.save();ctx.globalAlpha=.38+.45*remaining;
 ctx.lineWidth=2.1;ctx.lineCap="round";ctx.strokeStyle="#fff4d8";
 ctx.beginPath();ctx.arc(x,y,17,-Math.PI/2,-Math.PI/2+TAU*remaining);ctx.stroke();
 if(!reduce){
  ctx.globalAlpha=.28*remaining;ctx.fillStyle="#efc3ff";
  ctx.beginPath();ctx.ellipse(x,y+2,14,4,0,0,TAU);ctx.fill();
 }
 ctx.restore();
}
// Seven curved miniature horns ride the *real* L hit-ring (no extra hitboxes).
export function drawCuernoSevenHornCrest(ctx,fx,cam,t,reduce=false){
 const radius=clamp(fx?.radius,0,3000),alpha=clamp(fx?.alpha,0,1);
 if(radius<50||alpha<=0)return;
 const cx=(Number(fx.x)||0)-(cam?.x||0),cy=(Number(fx.y)||0)-(cam?.y||0);
 ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
 for(let i=0;i<7;i++){
  const a=i*TAU/7-Math.PI/2,phase=reduce?0:Math.sin((Number(t)||0)*.07+i)*2;
  const x=cx+Math.cos(a)*radius,y=cy+Math.sin(a)*radius;
  ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);
  ctx.globalAlpha=alpha*.69;ctx.strokeStyle=V91_PALETTE[i];ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(-6,6);
  ctx.bezierCurveTo(-10,-1,-4,-13-phase,0,-22-phase);
  ctx.bezierCurveTo(4,-9,10,1,6,6);ctx.stroke();
  ctx.strokeStyle="#fff9dd";ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(-4,2);ctx.quadraticCurveTo(0,-1,4,1);ctx.stroke();
  ctx.restore();
 }
 ctx.restore();
}
