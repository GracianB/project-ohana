// OHANA V351 · Stitcho's five-act alien comedy in the real ten-character welcome.
// Stage signals only: no combat projectile, timer, collision, network or save writes.
const TAU=Math.PI*2;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>{const v=clamp(n);return v*v*(3-2*v);};
const up=(t,a,b)=>ease((t-a)/(b-a));
const pulse=(t,a,b,c,d)=>up(t,a,b)*(1-up(t,c,d));
export const STITCHO_WELCOME_BEATS=Object.freeze({
 scout:Object.freeze([.18,.32,.50,.64]),
 taunt:Object.freeze([.63,.78,.94,1.07]),
 curl:Object.freeze([1.04,1.17,1.36,1.56]),
 shock:Object.freeze([1.69,1.84,2.10,2.30]),
 swagger:Object.freeze([2.32,2.52,2.86,3.13])
});
export function stitchoWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const t=Math.round((((raw%14)+14)%14)*10000)/10000;
 if(reducedMotion)return Object.freeze({
  phase:"idle",scout:0,taunt:0,curl:0,shock:0,swagger:0,
  antenna:0,tail:0,glow:.16,reduced:true
 });
 const scout=pulse(t,...STITCHO_WELCOME_BEATS.scout);
 const taunt=pulse(t,...STITCHO_WELCOME_BEATS.taunt);
 const curl=pulse(t,...STITCHO_WELCOME_BEATS.curl);
 const shock=pulse(t,...STITCHO_WELCOME_BEATS.shock);
 const swagger=pulse(t,...STITCHO_WELCOME_BEATS.swagger);
 const phase=shock>.22?"shock":swagger>.22?"swagger":curl>.22?"curl":
   taunt>.22?"taunt":scout>.22?"scout":"idle";
 return Object.freeze({phase,scout,taunt,curl,shock,swagger,
  antenna:clamp(.32*scout+.65*taunt+.24*curl+.92*shock+.48*swagger),
  tail:clamp(.2*scout+.54*taunt+.2*curl+.85*shock+.74*swagger),
  glow:clamp(.16+.18*scout+.28*taunt+.12*curl+.42*shock+.37*swagger),
  reduced:false});
}
export function drawStitchoWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 ctx.save();
 const h=height;
 if(layer==="back"){
  const glow=ctx.createRadialGradient(x,foot-h*.53,1,x,foot-h*.53,h*.47);
  glow.addColorStop(0,"rgba(119,227,255,"+(.08+.16*beat.glow)+")");
  glow.addColorStop(.62,"rgba(177,131,255,"+(.04+.09*beat.glow)+")");
  glow.addColorStop(1,"rgba(119,227,255,0)");
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,foot-h*.53,h*.47,0,TAU);ctx.fill();
  ctx.globalAlpha=.24;ctx.strokeStyle="#8adbf5";ctx.lineWidth=1.3;
  ctx.beginPath();ctx.ellipse(x,foot+2,h*.21,h*.044,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
  if(beat.scout>.02){
   ctx.globalAlpha=beat.scout*.57;ctx.strokeStyle="#d9faff";ctx.lineWidth=1.6;
   for(let i=0;i<2;i++){
    ctx.beginPath();ctx.arc(x+h*.2,foot-h*.76,h*(.05+i*.045),-1.3,.25);ctx.stroke();
   }
  }
  if(beat.taunt>.02){
   ctx.globalAlpha=beat.taunt*.65;ctx.strokeStyle="#ffd5fb";ctx.lineWidth=1.7;
   for(let i=0;i<3;i++){
    const a=-.65+i*.4,px=x+h*.2+Math.cos(a)*h*.12,py=foot-h*.49+Math.sin(a)*h*.12;
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+h*.025,py-h*.02);ctx.stroke();
   }
  }
  if(beat.curl>.02){
   ctx.globalAlpha=beat.curl*.57;ctx.strokeStyle="#cbb6ff";ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(x,foot-h*.37,h*.22,Math.PI*.2,Math.PI*1.20);ctx.stroke();
  }
  if(beat.shock>.02){
   ctx.globalAlpha=beat.shock*.69;ctx.strokeStyle="#e7faff";ctx.lineWidth=2;
   // Three surprised marks remain on Stitcho's side of the shared spark.
   for(let i=-1;i<=1;i++){
    const px=x-h*.18+i*h*.055,py=foot-h*.83;
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+i*h*.026,py-h*.053);ctx.stroke();
   }
  }
  if(beat.swagger>.02){
   ctx.globalAlpha=beat.swagger*.64;ctx.strokeStyle="#f5d3ff";ctx.lineWidth=1.8;
   for(let i=0;i<3;i++){
    const a=i*TAU/3,px=x+Math.cos(a)*h*.24,py=foot-h*.56+Math.sin(a)*h*.16;
    ctx.beginPath();ctx.moveTo(px-h*.027,py);ctx.lineTo(px+h*.027,py);
    ctx.moveTo(px,py-h*.027);ctx.lineTo(px,py+h*.027);ctx.stroke();
   }
  }
 }
 ctx.restore();
}
