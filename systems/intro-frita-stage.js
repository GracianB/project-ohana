// OHANA V346 · Frita, a mischievous chef starring in the family welcome.
// All motion is artistic. Condiments and crumbs never become hitboxes.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const q=clamp(v);return q*q*(3-2*q);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);
export const FRITA_WELCOME_BEATS=Object.freeze({
 ready:Object.freeze([4.28,4.45,4.68,4.85]),
 dash:Object.freeze([4.82,5.03,5.36,5.56]),
 reach:Object.freeze([5.48,5.67,5.87,6.05]),
 wobble:Object.freeze([6.00,6.14,6.31,6.51]),
 triumph:Object.freeze([6.46,6.63,6.86,7.06])
});
// Supporting comic moments during the long break after the potato chase.
// Each is tied to a real family member, not a global particle barrage.
export const FRITA_FAMILY_REACTIONS=Object.freeze({
  music:Object.freeze([.56,.76,1.05,1.34]),
  fire:Object.freeze([3.35,3.51,3.82,4.08]),
  spirit:Object.freeze([8.02,8.20,8.56,8.88])
});
export function fritaWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const time=Math.round((((raw%14)+14)%14)*10000)/10000;
 const ready=pulse(time,...FRITA_WELCOME_BEATS.ready);
 const dash=pulse(time,...FRITA_WELCOME_BEATS.dash);
 const reach=pulse(time,...FRITA_WELCOME_BEATS.reach);
 const wobble=pulse(time,...FRITA_WELCOME_BEATS.wobble);
 const triumph=pulse(time,...FRITA_WELCOME_BEATS.triumph);
 const breath=(1+Math.sin(time*TAU*5/14))*.5;
 const music=pulse(time,...FRITA_FAMILY_REACTIONS.music);
 const fire=pulse(time,...FRITA_FAMILY_REACTIONS.fire);
 const spirit=pulse(time,...FRITA_FAMILY_REACTIONS.spirit);
 if(reducedMotion)return Object.freeze({phase:"idle",ready:0,dash:0,reach:0,wobble:0,
   triumph:.20,breath:.5,music:0,fire:0,spirit:0,cape:0,glow:.10,reduced:true});
 const phase=reach>.2?"reach":wobble>.22?"wobble":ready>.2?"ready":
   dash>.20?"dash":triumph>.2?"triumph":"idle";
 return Object.freeze({
   phase,ready,dash,reach,wobble,triumph,breath,music,fire,spirit,
   cape:clamp(.12+.19*Math.sin(time*TAU*5/14)+dash*.48+reach*.24+wobble*.40+triumph*.30+fire*.25+spirit*.18),
   glow:clamp(.10+ready*.15+reach*.26+triumph*.38+music*.09+spirit*.16),reduced:false
 });
}
export function drawFritaWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;
 ctx.save();
 if(layer==="back"){
   // A subtle amber puddle anchors her thin limbs and golden fry silhouette.
   const a=.09+beat.glow*.21;
   const halo=ctx.createRadialGradient(x,foot-h*.37,0,x,foot-h*.37,h*.60);
   halo.addColorStop(0,"rgba(255,222,113,"+a+")");
   halo.addColorStop(.6,"rgba(254,163,57,"+(a*.27)+")");
   halo.addColorStop(1,"rgba(255,163,57,0)");
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,foot-h*.37,h*.60,0,TAU);ctx.fill();
   ctx.globalAlpha=.23+beat.breath*.10+beat.triumph*.13;
   ctx.strokeStyle="#f5c46d";ctx.lineWidth=1.7;
   ctx.beginPath();ctx.ellipse(x,foot+4,h*.23,h*.055,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
   if(beat.ready>.06){
     ctx.globalAlpha=beat.ready*.55;
     ctx.strokeStyle="#fff0ae";ctx.lineWidth=1.8;ctx.lineCap="round";
     for(let i=0;i<2;i++){
       const xx=x+h*(.23+i*.10),yy=foot-h*(.73+i*.09);
       ctx.beginPath();ctx.arc(xx,yy,h*.045,-1.1,1.1);ctx.stroke();
     }
   }
   if(beat.dash>.04||beat.wobble>.04){
     const k=Math.max(beat.dash,beat.wobble*.85);
     ctx.strokeStyle="#ffe3ac";ctx.lineWidth=2;ctx.lineCap="round";
     ctx.globalAlpha=k*.56;
     for(let i=0;i<3;i++){
       const yy=foot-h*(.11+i*.13),xx=x-h*(.20+i*.11);
       ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx-h*(.11+i*.025)*k,yy+h*.025);ctx.stroke();
     }
   }
   if(beat.reach>.06){
     // Condiment droplets are tied to the prop hand, not the mouse or HUD.
     const k=beat.reach;
     ctx.globalAlpha=.65*k;
     for(let i=0;i<4;i++){
       const px=x+h*(.25+i*.065*k);
       const py=foot-h*(.67+.09*Math.sin(i*1.6+k*TAU));
       ctx.fillStyle=i%2?"#fff1a6":"#e3432b";
       ctx.beginPath();ctx.ellipse(px,py,h*(.014+i*.001),h*.012,-.25,0,TAU);ctx.fill();
     }
   }
   if(beat.wobble>.06){
     // A few harmless crumbs make her slip readable without turning her
     // body into a disconnected stick figure or an actual slide ability.
     const k=beat.wobble;
     ctx.fillStyle="#f8da94";ctx.globalAlpha=k*.58;
     for(let i=0;i<4;i++){
       const px=x-h*(.11+i*.04),py=foot-h*(.02+.07*(i%2)*k);
       ctx.beginPath();ctx.ellipse(px,py,h*.012,h*.006,0,0,TAU);ctx.fill();
     }
   }
   if(beat.triumph>.05){
     // One clean star above the cape, not a full-screen firework.
     const k=beat.triumph,xx=x-h*.23,yy=foot-h*.88;
     ctx.globalAlpha=k*.72;ctx.strokeStyle="#fff8ba";ctx.lineWidth=2;
     ctx.beginPath();ctx.moveTo(xx-h*.035,yy);ctx.lineTo(xx+h*.035,yy);
     ctx.moveTo(xx,yy-h*.035);ctx.lineTo(xx,yy+h*.035);ctx.stroke();
   }
 }
 ctx.restore();
}
