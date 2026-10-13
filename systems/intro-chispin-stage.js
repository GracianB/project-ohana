// OHANA V352 · Chispin's mini-storm comedy inside the family welcome.
// Director is pure, local and ornamental: never fires a real J/K/L/U or hitbox.
const TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const smooth=x=>{const u=clamp(x);return u*u*(3-2*u);};
const rise=(t,a,b)=>smooth((t-a)/(b-a));
const pulse=(t,a,b,c,d)=>rise(t,a,b)*(1-rise(t,c,d));
export const CHISPIN_WELCOME_BEATS=Object.freeze({
 sniff:Object.freeze([.19,.32,.49,.61]),
 prank:Object.freeze([.58,.76,.98,1.12]),
 charge:Object.freeze([1.32,1.54,1.89,2.09]),
 hiccup:Object.freeze([2.07,2.22,2.44,2.62]),
 cloud:Object.freeze([2.60,2.80,3.09,3.30])
});
// V362 · Chispin participates beyond its opening joke; none of these cues
// summons a battle cloud, charged projectile, network hit or ability.
export const CHISPIN_FAMILY_REACTIONS=Object.freeze({
 dragon:Object.freeze([3.43,3.58,3.87,4.15]),
 chase:Object.freeze([5.32,5.53,5.96,6.22]),
 yomi:Object.freeze([8.08,8.28,8.66,8.96]),
 dino:Object.freeze([11.80,12.00,12.42,12.74])
});
export function chispinWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const t=Math.round((((raw%14)+14)%14)*10000)/10000;
 const breath=(1+Math.sin(t*TAU*4/14))*.5;
 if(reducedMotion)return Object.freeze({phase:"idle",sniff:0,prank:0,charge:0,hiccup:0,cloud:0,
  breath:.5,dragon:0,chase:0,yomi:0,dino:0,ear:0,coil:0,gills:0,halo:.12,reduced:true});
 const sniff=pulse(t,...CHISPIN_WELCOME_BEATS.sniff);
 const prank=pulse(t,...CHISPIN_WELCOME_BEATS.prank);
 const charge=pulse(t,...CHISPIN_WELCOME_BEATS.charge);
 const hiccup=pulse(t,...CHISPIN_WELCOME_BEATS.hiccup);
 const cloud=pulse(t,...CHISPIN_WELCOME_BEATS.cloud);
 const dragon=pulse(t,...CHISPIN_FAMILY_REACTIONS.dragon);
 const chase=pulse(t,...CHISPIN_FAMILY_REACTIONS.chase);
 const yomi=pulse(t,...CHISPIN_FAMILY_REACTIONS.yomi);
 const dino=pulse(t,...CHISPIN_FAMILY_REACTIONS.dino);
 const phase=cloud>.22?"cloud":hiccup>.22?"hiccup":charge>.22?"charge":
  prank>.22?"prank":sniff>.22?"sniff":"idle";
 return Object.freeze({phase,sniff,prank,charge,hiccup,cloud,breath,dragon,chase,yomi,dino,
  ear:clamp(.22*sniff+.46*prank+.64*charge+.89*hiccup+.36*cloud
    +dragon*.15+chase*.25+yomi*.13+dino*.28),
  coil:clamp(.22*sniff+.55*prank+.88*charge+.43*hiccup+.27*cloud
    +dragon*.30+chase*.38+yomi*.20+dino*.35),
  gills:clamp(.21*sniff+.48*prank+.78*charge+.9*hiccup+.46*cloud
    +dragon*.20+chase*.24+yomi*.15+dino*.29),
  halo:clamp(.12+.10*sniff+.17*prank+.53*charge+.18*hiccup+.5*cloud
    +dragon*.08+chase*.06+yomi*.09+dino*.06),
  reduced:false});
}
export function drawChispinWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;
 ctx.save();
 if(layer==="back"){
  const g=ctx.createRadialGradient(x,foot-h*.58,0,x,foot-h*.58,h*.51);
  g.addColorStop(0,"rgba(255,231,150,"+(.07+.12*beat.halo)+")");
  g.addColorStop(.53,"rgba(207,154,255,"+(.04+.12*beat.halo)+")");
  g.addColorStop(1,"rgba(207,154,255,0)");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,foot-h*.58,h*.51,0,TAU);ctx.fill();
  ctx.strokeStyle="#eed6ff";ctx.globalAlpha=.25;ctx.lineWidth=1.2;
  ctx.beginPath();ctx.ellipse(x,foot+2,h*.25,h*.046,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
  if(beat.sniff>.03){
   ctx.globalAlpha=.6*beat.sniff;ctx.strokeStyle="#fff5cb";ctx.lineWidth=1.6;
   for(let i=0;i<2;i++){
    ctx.beginPath();ctx.arc(x-h*.12,foot-h*.79,h*(.045+i*.036),Math.PI*.92,Math.PI*1.47);ctx.stroke();
   }
  }
  if(beat.prank>.03){
   ctx.globalAlpha=.57*beat.prank;ctx.strokeStyle="#d8a4ff";ctx.lineWidth=1.7;
   for(let i=0;i<3;i++){
    const px=x-h*(.13+i*.032),py=foot-h*(.43+i*.06);
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-h*.04,py-h*.015);ctx.stroke();
   }
  }
  if(beat.charge>.03){
   ctx.globalAlpha=.73*beat.charge;ctx.strokeStyle="#fff1a7";ctx.lineWidth=1.8;
   for(let i=0;i<3;i++){
    const a=i*TAU/3,px=x+Math.cos(a)*h*.27,py=foot-h*.58+Math.sin(a)*h*.14;
    ctx.beginPath();ctx.moveTo(px-h*.02,py-h*.034);ctx.lineTo(px+h*.013,py);
    ctx.lineTo(px-h*.01,py+h*.035);ctx.stroke();
   }
  }
  if(beat.hiccup>.03){
   ctx.globalAlpha=.72*beat.hiccup;ctx.strokeStyle="#fff8d0";ctx.lineWidth=2;
   for(let i=-1;i<=1;i++){
    const px=x-h*.17+i*h*.06,py=foot-h*.92;
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+i*h*.023,py-h*.05);ctx.stroke();
   }
  }
  if(beat.cloud>.03){
   const k=beat.cloud;ctx.globalAlpha=.64*k;ctx.lineWidth=1.5;ctx.strokeStyle="#f9eaff";
   // Five small cloud curls live above Chispin, never obscure Stitcho or another slot.
   for(let i=0;i<3;i++){
    const px=x+h*(-.12+i*.11),py=foot-h*(.96+Math.sin(i*1.7)*.03);
    ctx.beginPath();ctx.arc(px,py,h*(.046+i*.007),Math.PI*.95,Math.PI*1.92);ctx.stroke();
   }
  }
 }
 ctx.restore();
}