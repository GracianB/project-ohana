// OHANA V345 · Dino's individual welcome performance.
// All poses and particles are art only: no terrain, hitboxes, damage or timers.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const n=clamp(v);return n*n*(3-2*n);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);
export const DINO_WELCOME_BEATS=Object.freeze({
  curious:Object.freeze([10.48,10.70,11.00,11.22]),
  brace:Object.freeze([11.15,11.34,11.48,11.65]),
  stomp:Object.freeze([11.61,11.75,11.83,12.02]),
  startled:Object.freeze([11.95,12.13,12.25,12.47]),
  delighted:Object.freeze([12.42,12.63,13.05,13.32])
});
// Three understated scenes tie Dino to the rest of Hoku even BEFORE its
// famous final stomp. Every signal is cosmetic; none affects the Colossus U.
export const DINO_FAMILY_REACTIONS=Object.freeze({
  melody:Object.freeze([.52,.74,1.02,1.31]),
  dragon:Object.freeze([3.36,3.50,3.78,4.08]),
  chase:Object.freeze([5.42,5.68,5.98,6.30])
});
export function dinoWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const time=Math.round((((raw%14)+14)%14)*10000)/10000;
 const curious=pulse(time,...DINO_WELCOME_BEATS.curious);
 const brace=pulse(time,...DINO_WELCOME_BEATS.brace);
 const stomp=pulse(time,...DINO_WELCOME_BEATS.stomp);
 const startled=pulse(time,...DINO_WELCOME_BEATS.startled);
 const delighted=pulse(time,...DINO_WELCOME_BEATS.delighted);
 const breath=(1+Math.sin(time*TAU*4/14))*.5;
 const melody=pulse(time,...DINO_FAMILY_REACTIONS.melody);
 const dragon=pulse(time,...DINO_FAMILY_REACTIONS.dragon);
 const chase=pulse(time,...DINO_FAMILY_REACTIONS.chase);
 if(reducedMotion)return Object.freeze({phase:"idle",curious:0,brace:0,
   stomp:0,startled:0,delighted:.20,breath:.5,melody:0,dragon:0,chase:0,tail:0,glow:.08,reduced:true});
 const phase=stomp>.18?"stomp":startled>.22?"startled":brace>.20?"brace":
   curious>.2?"curious":delighted>.2?"delighted":"idle";
 return Object.freeze({
   phase,curious,brace,stomp,startled,delighted,breath,melody,dragon,chase,
   tail:clamp(.22*Math.sin(time*TAU*5/14)+curious*.18-stomp*.35+delighted*.25+melody*.14-dragon*.25+chase*.24,-1,1),
   glow:clamp(.08+stomp*.36+delighted*.18+melody*.10+dragon*.10),reduced:false
 });
}
export function drawDinoWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;
 ctx.save();
 if(layer==="back"){
   // Small moss-colored pool under the real two feet, never a map-wide quake.
   const a=.09+beat.glow*.22;
   const halo=ctx.createRadialGradient(x,foot-h*.28,0,x,foot-h*.28,h*.63);
   halo.addColorStop(0,"rgba(201,240,122,"+a+")");
   halo.addColorStop(.55,"rgba(108,195,103,"+(a*.32)+")");
   halo.addColorStop(1,"rgba(108,195,103,0)");
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,foot-h*.28,h*.63,0,TAU);ctx.fill();
   ctx.strokeStyle="#d0ef98";ctx.lineWidth=1.5;
   ctx.globalAlpha=.13+beat.breath*.08+beat.brace*.25;
   ctx.beginPath();ctx.ellipse(x,foot+3,h*.3,h*.058,0,0,TAU);ctx.stroke();
 }else if(layer==="front" && !beat.reduced){
   if(beat.curious>.05){
     // One inquisitive glitter at eye level, not a global HUD icon.
     ctx.globalAlpha=beat.curious*.48;ctx.strokeStyle="#edffbd";
     ctx.lineWidth=2;ctx.lineCap="round";
     const xx=x+h*.30,yy=foot-h*.78;
     ctx.beginPath();ctx.moveTo(xx-h*.025,yy);ctx.lineTo(xx+h*.025,yy);
     ctx.moveTo(xx,yy-h*.025);ctx.lineTo(xx,yy+h*.025);ctx.stroke();
   }
   if(beat.brace>.05){
     // Fine grass bends toward both rooted feet during anticipation.
     ctx.strokeStyle="#bbdd8f";ctx.lineWidth=1.6;ctx.lineCap="round";
     ctx.globalAlpha=.15+beat.brace*.40;
     for(const side of [-1,1]){
       for(let i=0;i<3;i++){
         const px=x+side*h*(.20+i*.07),py=foot+1;
         ctx.beginPath();ctx.moveTo(px,py);
         ctx.quadraticCurveTo(px+side*h*.03,py-h*.05*beat.brace,
           px+side*h*(.06+.02*i)*beat.brace,py-h*(.075+i*.008)*beat.brace);
         ctx.stroke();
       }
     }
   }
   if(beat.stomp>.04){
     // A compact ellipse mirrors the feet touching the island; no damage,
     // no knockback and no misleading room-wide shockwave.
     ctx.globalAlpha=.17+beat.stomp*.48;
     ctx.strokeStyle="#d7eea5";ctx.lineWidth=2.1;
     for(let i=0;i<2;i++){
       const radius=h*(.20+i*.15+.08*beat.stomp);
       ctx.beginPath();ctx.ellipse(x,foot+3,radius,radius*.19,0,0,TAU);ctx.stroke();
     }
     const k=beat.stomp;
     ctx.fillStyle="#e6d49d";
     for(let i=0;i<5;i++){
       const side=i%2?-1:1;
       const xx=x+side*h*(.14+.055*i)*(.52+.48*k);
       const yy=foot-h*(.04+.12*k)*(1-(i%3)*.15);
       ctx.globalAlpha=k*(.42-(i%3)*.08);
       ctx.beginPath();ctx.ellipse(xx,yy,Math.max(1.1,h*.012*(1+i*.09)),
         Math.max(1,h*.008),-.3,0,TAU);ctx.fill();
     }
   }
   if(beat.startled>.06){
     // Three restrained surprise strokes behind the skull.
     const xx=x+h*.29,yy=foot-h*.91;
     ctx.globalAlpha=beat.startled*.6;ctx.lineWidth=2.1;ctx.strokeStyle="#fff0bb";
     ctx.lineCap="round";
     for(let i=-1;i<=1;i++){
       ctx.beginPath();ctx.moveTo(xx+i*h*.06,yy-h*.03);
       ctx.lineTo(xx+i*h*.10,yy-h*.10);ctx.stroke();
     }
   }
   if(beat.delighted>.05){
     // Shy two-stroke sparkle concludes Dino's gag, without a jump cut.
     ctx.strokeStyle="#f6ffcf";ctx.lineWidth=2;
     ctx.globalAlpha=beat.delighted*.55;ctx.lineCap="round";
     const xx=x-h*.25,yy=foot-h*.80;
     ctx.beginPath();ctx.moveTo(xx-h*.035,yy);ctx.lineTo(xx+h*.035,yy);
     ctx.moveTo(xx,yy-h*.035);ctx.lineTo(xx,yy+h*.035);ctx.stroke();
   }
 }
 ctx.restore();
}
