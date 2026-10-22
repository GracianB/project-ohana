// OHANA V460 · Michicornio: lunar spotlight and ten connected acting beats in the family.
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
  breath:.5,melody:0,spark:0,chase:0,yomi:0,dino:0,ear:0,tail:0,wing:0,halo:.1,
  moonCrown:0,headFocus:0,tailCascade:0,shimmer:0,reduced:true});
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
  halo:clip(.17+.19*inspect+.16*sideeye+.22*groom+.40*flick+.62*purr
    +melody*.09+spark*.12+chase*.11+yomi*.13+dino*.14),
  moonCrown:clip(.13+inspect*.32+sideeye*.18+groom*.26+flick*.54+purr*.90),
  headFocus:clip(sideeye*.75+inspect*.42+spark*.26+yomi*.18),
  tailCascade:clip(groom*.34+flick*.90+purr*.6+chase*.28),
  shimmer:clip(.11+purr*.65+flick*.35+melody*.2+spark*.3),
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
  // A private moon iris, behind Michicornio and not behind every cast member.
  // The centre remains translucent so the five-form silhouette stays readable.
  ctx.globalAlpha=.18+.20*(beat.moonCrown||0);
  ctx.strokeStyle="#d3bdff";ctx.lineWidth=Math.max(1.2,h*.018);
  ctx.beginPath();ctx.arc(x,foot-h*.58,h*.37,Math.PI*.70,Math.PI*2.3);ctx.stroke();
  ctx.globalAlpha=.15+.18*(beat.halo||0);
  ctx.strokeStyle="#ffedd0";ctx.lineWidth=Math.max(1,h*.012);
  ctx.beginPath();ctx.arc(x-h*.025,foot-h*.66,h*.31,Math.PI*.38,Math.PI*1.42);ctx.stroke();
  ctx.globalAlpha=.28;ctx.strokeStyle="#ffc1db";ctx.lineWidth=1.4;
  ctx.beginPath();ctx.ellipse(x,foot+2,h*.24,h*.047,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
  // Silhouette-attached stars, horn glints and a distinct 5-beat reveal.
  // All amplitudes are bounded to the existing intro stage slot.
  const crown=beat.moonCrown||0,shimmer=beat.shimmer||0;
  if(crown>.08){
   ctx.globalAlpha=.38*crown;ctx.strokeStyle="#fff4d6";ctx.lineWidth=Math.max(1,h*.013);
   ctx.beginPath();ctx.arc(x,foot-h*.97,h*.13,-Math.PI*.90,-Math.PI*.10);ctx.stroke();
   for(let i=0;i<3;i++){
    const a=i*TAU/3+seconds*.8;
    const px=x+Math.cos(a)*h*.21,py=foot-h*.97+Math.sin(a)*h*.09;
    ctx.fillStyle=i%2?"#c9f9ff":"#ffe6ae";
    ctx.beginPath();ctx.moveTo(px,py-h*.025);ctx.lineTo(px+h*.015,py);
    ctx.lineTo(px,py+h*.025);ctx.lineTo(px-h*.015,py);ctx.closePath();ctx.fill();
   }
  }
  if(shimmer>.05){
   ctx.globalAlpha=.25*shimmer;ctx.strokeStyle="#c8b2f7";ctx.lineWidth=Math.max(1,h*.009);
   for(let i=0;i<5;i++){
    const k=i/5,a=Math.PI*(1.1+k*.8)+seconds*.24;
    const radius=h*(.24+.035*Math.sin(seconds*1.4+i));
    ctx.beginPath();ctx.moveTo(x+Math.cos(a)*radius,foot-h*.52+Math.sin(a)*radius*.4);
    ctx.lineTo(x+Math.cos(a)*radius*1.16,foot-h*.52+Math.sin(a)*radius*.45);ctx.stroke();
   }
  }
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