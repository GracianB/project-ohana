// Cuerno's shared visual language. Pure Canvas, bounded geometry, no gradients.
export const CUERNO_RAINBOW = Object.freeze(["#ff9fc4", "#ffc791", "#fff1ad", "#b2e9c3", "#a8ddfa", "#c7b1f1"]);
const TAU = Math.PI * 2;
const clamp = n => Math.max(0, Math.min(1, Number(n) || 0));
function ellipse(ctx,x,y,rx,ry,color) {
  ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);ctx.fillStyle=color;ctx.fill();
}
export function cuernoPuffPose(progress, form=1, reduced=false) {
  const k=clamp(progress),f=Math.max(1,Math.min(5,form|0));
  return {radius:(9+f*2)*(reduced?1:.55+Math.sin(Math.PI*k)*.8),
    drift:(reduced?0:k)*(18+f*4),lift:reduced?0:k*10,
    alpha:Math.min(1,k*8,(1-k)*3),petals:reduced?3:6};
}
/** A comic, flower-shaped rainbow cloud expelled behind the hindquarters. */
export function drawRainbowPuff(ctx,x,y,progress,{form=1,facing=1,reduced=false}={}) {
  const p=cuernoPuffPose(progress,form,reduced),r=p.radius;
  ctx.save();ctx.translate(x-(facing<0?-1:1)*p.drift,y-p.lift);ctx.globalAlpha*=p.alpha;
  ctx.lineWidth=1.1;ctx.strokeStyle="#fff6ff";
  for(let i=0;i<p.petals;i++) {
    const a=i*TAU/p.petals,px=Math.cos(a)*r*.44,py=Math.sin(a)*r*.32;
    ellipse(ctx,px,py,r*.63,r*.54,CUERNO_RAINBOW[i* (reduced?2:1)]);ctx.stroke();
  }
  ellipse(ctx,-r*.1,-r*.08,r*.35,r*.28,"#fff4fa");
  ctx.restore();
}
function sparkle(ctx,x,y,r,color) {
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x+r*.2,y-r*.2,x+r,y);
  ctx.quadraticCurveTo(x+r*.2,y+r*.2,x,y+r);ctx.quadraticCurveTo(x-r*.2,y+r*.2,x-r,y);
  ctx.quadraticCurveTo(x-r*.2,y-r*.2,x,y-r);ctx.fill();
}
export function cuernoDreamStage(progress) {
  const k=clamp(progress);
  return k<.2?"susurro":k<.5?"aurora":k<.82?"abrazo":"despedida";
}
/** Low-opacity canopy, star garland and a heart: leaves the arena readable. */
export function drawCuernoDream(ctx,x,y,r,progress,{form=1,reduced=false}={}) {
  const k=clamp(progress),fade=Math.min(1,k*8,(1-k)*6),growth=Math.min(1,k*4);
  const pulse=reduced?0:Math.sin(k*TAU)*r*.018;
  ctx.save();ctx.lineCap="round";
  ctx.globalAlpha*=fade*.17;
  ellipse(ctx,x,y-r*.1,r*growth,r*.7*growth,form===5?"#bda9df":"#e7d3ff");
  ctx.globalAlpha=fade*.7;ctx.lineWidth=Math.max(1.4,r*.025);
  for(let i=0;i<6;i++) {
    ctx.strokeStyle=CUERNO_RAINBOW[i];ctx.beginPath();
    ctx.ellipse(x,y+r*.3,(r*(1-i*.035)+pulse)*growth,r*(.84-i*.033)*growth,0,Math.PI,TAU);ctx.stroke();
  }
  const count=reduced?5:9;
  for(let i=0;i<count;i++) {
    const a=Math.PI+i*Math.PI/(count-1),px=x+Math.cos(a)*r*.94,py=y+r*.3+Math.sin(a)*r*.78;
    sparkle(ctx,px,py,2.5+(i%3),i%2?"#fff1ad":"#f8e5ff");
  }
  if(k>=.45) {
    const size=r*.085,cx=x,cy=y-r*.56;
    ctx.fillStyle="#ffc2de";ctx.beginPath();ctx.moveTo(cx,cy+size*.8);
    ctx.bezierCurveTo(cx-size*1.4,cy-size*.1,cx-size*.7,cy-size*1.3,cx,cy-size*.35);
    ctx.bezierCurveTo(cx+size*.7,cy-size*1.3,cx+size*1.4,cy-size*.1,cx,cy+size*.8);ctx.fill();
  }
  ctx.restore();
}
