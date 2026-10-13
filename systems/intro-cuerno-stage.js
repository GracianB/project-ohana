// V349: Cuerno's five original silhouettes stay intact: the baby is a living
// horn, then a floating face, then an articulated foal and two winged adults.
// These five stage beats are decorative only, never a magic-slot cast.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const k=clamp(v);return k*k*(3-2*k);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);
export const CUERNO_WELCOME_BEATS=Object.freeze({
  wonder:Object.freeze([9.22,9.36,9.52,9.66]),
  tiptoe:Object.freeze([9.61,9.73,9.89,10.01]),
  aurora:Object.freeze([9.95,10.06,10.20,10.33]),
  surprise:Object.freeze([10.28,10.40,10.53,10.65]),
  bow:Object.freeze([10.61,10.74,10.93,11.08])
});
export function cuernoWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const t=Math.round((((raw%14)+14)%14)*10000)/10000;
 const wonder=pulse(t,...CUERNO_WELCOME_BEATS.wonder);
 const tiptoe=pulse(t,...CUERNO_WELCOME_BEATS.tiptoe);
 const aurora=pulse(t,...CUERNO_WELCOME_BEATS.aurora);
 const surprise=pulse(t,...CUERNO_WELCOME_BEATS.surprise);
 const bow=pulse(t,...CUERNO_WELCOME_BEATS.bow);
 const breath=(1+Math.sin(t*TAU*4/14))*.5;
 if(reducedMotion)return Object.freeze({phase:"idle",wonder:0,tiptoe:0,
   aurora:0,surprise:0,bow:.2,breath:.5,mane:0,wing:0,tail:0,glow:.12,reduced:true});
 const phase=aurora>.2?"aurora":surprise>.2?"surprise":tiptoe>.2?"tiptoe":
   wonder>.2?"wonder":bow>.2?"bow":"idle";
 return Object.freeze({phase,wonder,tiptoe,aurora,surprise,bow,breath,
  mane:clamp(.19*Math.sin(t*TAU*5/14)+aurora*.48+surprise*.21-bow*.18,-1,1),
  wing:clamp(tiptoe*.16+aurora*.78+surprise*.27+bow*.18),
  tail:clamp(.20*Math.sin(t*TAU*3/14)+aurora*.51+surprise*.27-bow*.16,-1,1),
  glow:clamp(.12+wonder*.10+aurora*.74+bow*.17),reduced:false});
}
export function drawCuernoWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;ctx.save();
 if(layer==="back"){
   const k=.10+beat.glow*.18;
   const halo=ctx.createRadialGradient(x,foot-h*.52,0,x,foot-h*.52,h*.68);
   halo.addColorStop(0,"rgba(245,205,255,"+k+")");
   halo.addColorStop(.54,"rgba(160,209,255,"+(k*.43)+")");
   halo.addColorStop(1,"rgba(160,209,255,0)");
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,foot-h*.52,h*.68,0,TAU);ctx.fill();
   ctx.strokeStyle="#f5d4fb";ctx.lineWidth=1.5;
   ctx.globalAlpha=.17+beat.breath*.08;
   ctx.beginPath();ctx.ellipse(x,foot+3,h*.23,h*.05,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
   if(beat.wonder>.05){
     const k=beat.wonder;ctx.globalAlpha=k*.49;ctx.strokeStyle="#f9e1ff";
     ctx.lineWidth=1.8;ctx.beginPath();
     ctx.arc(x+h*.24,foot-h*.82,h*.067,-.8,1.1);ctx.stroke();
   }
   if(beat.tiptoe>.05){
     const k=beat.tiptoe;ctx.globalAlpha=k*.52;ctx.strokeStyle="#efdfef";
     ctx.lineWidth=1.8;
     for(const side of [-1,1]){
       ctx.beginPath();ctx.ellipse(x+side*h*.17,foot+2,h*(.05+.03*k),h*.015,0,0,TAU);ctx.stroke();
     }
   }
   if(beat.aurora>.05){
     // A tiny seven-stripe iris growing from the REAL horn. No fake sky-sized
     // U, no hits, no global bloom or detached wings on the newborn form.
     const k=beat.aurora,colors=["#ffb5c8","#ffd89b","#fff0bd","#bbefd0","#bce7fb","#d1c4ff","#ffc9eb"];
     for(let i=0;i<7;i++){
       ctx.globalAlpha=k*(.35+(i%3)*.04);
       ctx.strokeStyle=colors[i];ctx.lineWidth=1.7;ctx.lineCap="round";
       ctx.beginPath();ctx.arc(x+h*.14,foot-h*.89,
         h*(.13+i*.035+.025*k),Math.PI*1.10,Math.PI*1.91);ctx.stroke();
     }
     ctx.globalAlpha=k*.75;ctx.fillStyle="#fff4d3";
     ctx.beginPath();ctx.arc(x+h*.14,foot-h*.89,h*.028,0,TAU);ctx.fill();
   }
   if(beat.surprise>.05){
     const k=beat.surprise;ctx.globalAlpha=k*.58;
     ctx.strokeStyle="#fff0d6";ctx.lineWidth=1.8;
     for(let i=-1;i<=1;i++){
       const px=x+h*(.12+i*.07),py=foot-h*.97;
       ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+i*h*.025,py-h*.06);ctx.stroke();
     }
   }
   if(beat.bow>.05){
     const k=beat.bow;ctx.globalAlpha=k*.63;ctx.strokeStyle="#e5d6fb";
     ctx.lineWidth=2;ctx.lineCap="round";
     const sx=x-h*.19,sy=foot-h*.84;
     ctx.beginPath();ctx.moveTo(sx-h*.036,sy);ctx.lineTo(sx+h*.036,sy);
     ctx.moveTo(sx,sy-h*.036);ctx.lineTo(sx,sy+h*.036);ctx.stroke();
   }
 }
 ctx.restore();
}
