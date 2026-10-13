// OHANA V350 · Kilo's musical welcome is a choreographed story, not pollen.
// Nothing in this module is a combat effect, an input, or a hitbox.
const TAU=Math.PI*2;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>{const v=clamp(n);return v*v*(3-2*v);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);
export const KILO_WELCOME_BEATS=Object.freeze({
 listen:Object.freeze([.12,.24,.40,.53]),
 strum:Object.freeze([.49,.64,.78,.91]),
 bloom:Object.freeze([.87,1.01,1.17,1.29]),
 surprise:Object.freeze([1.25,1.38,1.54,1.66]),
 finale:Object.freeze([1.62,1.77,1.98,2.16])
});
// V360 · Four family callbacks spread Kilo's own musical personality across
// the complete film, not just the opening 2.16 seconds. No actual J/K/L/U.
export const KILO_FAMILY_REACTIONS=Object.freeze({
 dragon:Object.freeze([3.35,3.52,3.83,4.10]),
 chase:Object.freeze([5.23,5.47,5.94,6.18]),
 yomi:Object.freeze([8.03,8.23,8.67,8.94]),
 dino:Object.freeze([11.78,12.01,12.40,12.69])
});
export function kiloWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const t=Math.round((((raw%14)+14)%14)*10000)/10000;
 const listen=pulse(t,...KILO_WELCOME_BEATS.listen);
 const strum=pulse(t,...KILO_WELCOME_BEATS.strum);
 const bloom=pulse(t,...KILO_WELCOME_BEATS.bloom);
 const surprise=pulse(t,...KILO_WELCOME_BEATS.surprise);
 const finale=pulse(t,...KILO_WELCOME_BEATS.finale);
 const breath=(1+Math.sin(t*TAU*4/14))*.5;
 const dragon=pulse(t,...KILO_FAMILY_REACTIONS.dragon);
 const chase=pulse(t,...KILO_FAMILY_REACTIONS.chase);
 const yomi=pulse(t,...KILO_FAMILY_REACTIONS.yomi);
 const dino=pulse(t,...KILO_FAMILY_REACTIONS.dino);
 if(reducedMotion)return Object.freeze({
  phase:"idle",listen:0,strum:0,bloom:0,surprise:0,finale:.2,
  breath:.5,dragon:0,chase:0,yomi:0,dino:0,petals:0,wing:0,glow:.12,reduced:true
 });
 const phase=bloom>.22?"bloom":surprise>.22?"surprise":strum>.22?"strum":
   listen>.22?"listen":finale>.22?"finale":"idle";
 return Object.freeze({
  phase,listen,strum,bloom,surprise,finale,breath,dragon,chase,yomi,dino,
  petals:clamp(strum*.30+bloom*.90+surprise*.33+finale*.25+chase*.07+yomi*.09),
  wing:clamp(strum*.16+bloom*.50+finale*.78+dragon*.14+dino*.22),
  glow:clamp(.12+listen*.08+strum*.23+bloom*.62+finale*.33+dragon*.11+yomi*.17+dino*.09),reduced:false
 });
}
export function drawKiloWelcomeFX(ctx,x,foot,height,seconds,beat,layer="back"){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;
 ctx.save();
 if(layer==="back"){
  const a=.10+beat.glow*.19;
  const pool=ctx.createRadialGradient(x,foot-h*.43,0,x,foot-h*.43,h*.65);
  pool.addColorStop(0,"rgba(255,226,141,"+a+")");
  pool.addColorStop(.58,"rgba(141,226,174,"+(a*.40)+")");
  pool.addColorStop(1,"rgba(141,226,174,0)");
  ctx.fillStyle=pool;ctx.beginPath();ctx.arc(x,foot-h*.43,h*.65,0,TAU);ctx.fill();
  ctx.globalAlpha=.18+beat.breath*.07;
  ctx.strokeStyle="#e4f6ca";ctx.lineWidth=1.6;
  ctx.beginPath();ctx.ellipse(x,foot+3,h*.25,h*.055,0,0,TAU);ctx.stroke();
 }else if(layer==="front"&&!beat.reduced){
  if(beat.listen>.05){
   ctx.globalAlpha=beat.listen*.45;ctx.strokeStyle="#fff5be";ctx.lineWidth=1.8;
   for(let i=0;i<2;i++){
    ctx.beginPath();ctx.arc(x+h*.15,foot-h*.79,h*(.068+i*.050),-1,.7);ctx.stroke();
   }
  }
  if(beat.strum>.05){
   ctx.globalAlpha=beat.strum*.68;ctx.strokeStyle="#fff7cc";ctx.lineWidth=2;
   // Three rhythmic notes grow from the REAL held ukulele hand.
   for(let i=0;i<3;i++){
    const px=x+h*(.13+i*.085),py=foot-h*(.54+.085*i);
    ctx.beginPath();ctx.ellipse(px,py,h*.017,h*.012,-.27,0,TAU);
    ctx.stroke();
    ctx.beginPath();ctx.moveTo(px+h*.014,py);
    ctx.lineTo(px+h*.014,py-h*.07);ctx.stroke();
   }
  }
  if(beat.bloom>.05){
   const k=beat.bloom,colors=["#f3b1d4","#e5eb9a","#adddbb","#c9b9f4","#fee2af"];
   // Flower orbit stays small enough to keep the ten-hero family readable.
   for(let i=0;i<5;i++){
    const a=i*TAU/5+k*.5;
    const px=x+Math.cos(a)*h*(.18+.13*k);
    const py=foot-h*.65+Math.sin(a)*h*(.13+.08*k);
    ctx.fillStyle=colors[i];ctx.globalAlpha=k*.72;
    ctx.beginPath();ctx.ellipse(px,py,h*.028,h*.014,a,0,TAU);ctx.fill();
   }
  }
  if(beat.surprise>.05){
   const k=beat.surprise;
   ctx.globalAlpha=k*.66;ctx.strokeStyle="#fff5d1";ctx.lineWidth=2;
   for(let i=-1;i<=1;i++){
    const px=x+h*(.12+i*.085),py=foot-h*.91;
    ctx.beginPath();ctx.moveTo(px,py);
    ctx.lineTo(px+i*h*.04,py-h*.055);ctx.stroke();
   }
  }
  if(beat.finale>.05){
   const k=beat.finale;
   ctx.globalAlpha=k*.69;ctx.strokeStyle="#fff0b8";ctx.lineWidth=2;ctx.lineCap="round";
   const px=x-h*.22,py=foot-h*.85;
   ctx.beginPath();ctx.moveTo(px-h*.034,py);ctx.lineTo(px+h*.034,py);
   ctx.moveTo(px,py-h*.034);ctx.lineTo(px,py+h*.034);ctx.stroke();
  }
 }
 ctx.restore();
}
