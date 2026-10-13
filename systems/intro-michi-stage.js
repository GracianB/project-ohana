// OHANA V353 · Michi: the small cat who thinks she is directing the family.
// Five theatrical acts, one deterministic 14-second welcome. No powers or collisions.
const TAU=Math.PI*2;
const clip=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>{const t=clip(v);return t*t*(3-2*t);};
const pulse=(t,a,b,c,d)=>ease((t-a)/(b-a))*(1-ease((t-c)/(d-c)));
export const MICHI_WELCOME_BEATS=Object.freeze({
 inspect:Object.freeze([3.09,3.22,3.42,3.54]),
 sideeye:Object.freeze([3.53,3.67,3.86,3.98]),
 groom:Object.freeze([3.96,4.10,4.28,4.42]),
 flick:Object.freeze([4.40,4.54,4.76,4.89]),
 purr:Object.freeze([4.86,5.02,5.25,5.43])
});
// V363 · Michi judges the other nine even outside her own theatrical slot.
// Body-only cat reactions: never yarn casts, damage, U or duplicate tails.
export const MICHI_FAMILY_REACTIONS=Object.freeze({
 melody:Object.freeze([.62,.82,1.12,1.40]),
 spark:Object.freeze([1.73,1.92,2.25,2.55]),
 chase:Object.freeze([5.64,5.83,6.13,6.42]),
 yomi:Object.freeze([8.06,8.25,8.62,8.93]),
 dino:Object.freeze([11.83,12.03,12.39,12.72])
});
export function michiWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const t=Math.round((((raw%14)+14)%14)*10000)/10000;
 const breath=(1+Math.sin(t*TAU*5/14))*.5;
 if(reducedMotion)return Object.freeze({phase:"idle",inspect:0,sideeye:0,groom:0,flick:0,purr:0,
  breath:.5,melody:0,spark:0,chase:0,yomi:0,dino:0,ear:0,tail:0,wing:0,halo:.1,reduced:true});
 const inspect=pulse(t,...MICHI_WELCOME_BEATS.inspect);
 const sideeye=pulse(t,...MICHI_WELCOME_BEATS.sideeye);
 const groom=pulse(t,...MICHI_WELCOME_BEATS.groom);
 const flick=pulse(t,...MICHI_WELCOME_BEATS.flick);
 const purr=pulse(t,...MICHI_WELCOME_BEATS.purr);
 const melody=pulse(t,...MICHI_FAMILY_REACTIONS.melody);
 const spark=pulse(t,...MICHI_FAMILY_REACTIONS.spark);
 const chase=pulse(t,...MICHI_FAMILY_REACTIONS.chase);
 const yomi=pulse(t,...MICHI_FAMILY_REACTIONS.yomi);
 const dino=pulse(t,...MICHI_FAMILY_REACTIONS.dino);
 const phase=purr>.22?"purr":flick>.22?"flick":groom>.22?"groom":
   sideeye>.22?"sideeye":inspect>.22?"inspect":"idle";
 return Object.freeze({phase,inspect,sideeye,groom,flick,purr,
  breath,melody,spark,chase,yomi,dino,
  ear:clip(.3*inspect+.58*sideeye+.12*groom+.92*flick+.32*purr
    +melody*.16+spark*.30+chase*.26+yomi*.17+dino*.28),
  tail:clip(.1*inspect+.28*sideeye+.36*groom+.98*flick+.44*purr
    +melody*.12+spark*.27+chase*.43+yomi*.22+dino*.34),
  wing:clip(.08*inspect+.16*sideeye+.28*groom+.45*flick+.74*purr
    +melody*.09+spark*.14+yomi*.16+dino*.27),
  halo:clip(.1+.12*inspect+.09*sideeye+.16*groom+.27*flick+.43*purr
    +melody*.04+spark*.07+chase*.06+yomi*.10+dino*.09),
  reduced:false});
}
export function drawMichiWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;ctx.save();
 if(layer==="back"){
  const g=ctx.createRadialGradient(x,foot-h*.54,0,x,foot-h*.54,h*.49);
  g.addColorStop(0,"rgba(255,191,226,"+(.06+.14*beat.halo)+")");
  g.addColorStop(.58,"rgba(200,173,255,"+(.06+.09*beat.halo)+")");
  g.addColorStop(1,"rgba(255,191,226,0)");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,foot-h*.54,h*.49,0,TAU);ctx.fill();
  ctx.globalAlpha=.22;ctx.lineWidth=1.4;ctx.strokeStyle="#ffc1db";
  ctx.beginPath();ctx.ellipse(x,foot+2,h*.23,h*.045,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
  if(beat.inspect>.03){
   ctx.globalAlpha=.54*beat.inspect;ctx.strokeStyle="#ffe7fb";ctx.lineWidth=1.4;
   for(let i=0;i<2;i++){
    ctx.beginPath();ctx.arc(x-h*.20,foot-h*.83,h*(.043+.027*i),Math.PI*.98,Math.PI*1.53);ctx.stroke();
   }
  }
  if(beat.sideeye>.03){
   ctx.globalAlpha=.65*beat.sideeye;ctx.strokeStyle="#ffe2f6";ctx.lineWidth=1.7;
   for(let i=0;i<2;i++){
    const px=x+h*(.13+i*.038),py=foot-h*(.83+i*.024);
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+h*.045,py+h*.009);ctx.stroke();
   }
  }
  if(beat.groom>.03){
   ctx.globalAlpha=.45*beat.groom;ctx.strokeStyle="#f8dfec";ctx.lineWidth=1.7;
   for(let i=0;i<2;i++){
    const px=x-h*.16+i*h*.06,py=foot-h*.40;
    ctx.beginPath();ctx.arc(px,py,h*.055,Math.PI*.96,Math.PI*1.93);ctx.stroke();
   }
  }
  if(beat.flick>.03){
   ctx.globalAlpha=.63*beat.flick;ctx.strokeStyle="#e5c9ff";ctx.lineWidth=1.9;
   ctx.beginPath();ctx.arc(x-h*.16,foot-h*.42,h*.19,Math.PI*.85,Math.PI*1.46);ctx.stroke();
  }
  if(beat.purr>.03){
   ctx.globalAlpha=.62*beat.purr;ctx.strokeStyle="#fff3cf";ctx.lineWidth=1.7;
   for(let i=0;i<3;i++){
    const xx=x+h*(-.2+i*.17),yy=foot-h*(.95+(i%2)*.06);
    ctx.beginPath();ctx.moveTo(xx-h*.022,yy);ctx.lineTo(xx+h*.022,yy);
    ctx.moveTo(xx,yy-h*.022);ctx.lineTo(xx,yy+h*.022);ctx.stroke();
   }
  }
 }
 ctx.restore();
}