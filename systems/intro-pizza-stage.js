// OHANA V347 · Pizza's independent five-beat welcome.
// Coordinates belong to the title stage. Never creates damage or collision.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const n=clamp(v);return n*n*(3-2*n);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);

export const PIZZA_WELCOME_BEATS=Object.freeze({
  sniff:Object.freeze([4.28,4.44,4.70,4.88]),
  spring:Object.freeze([4.84,5.05,5.35,5.55]),
  stretch:Object.freeze([5.51,5.70,5.91,6.10]),
  catch:Object.freeze([6.05,6.22,6.36,6.52]),
  flourish:Object.freeze([6.48,6.68,6.88,7.08])
});
// V357 · When the spotlight belongs to someone else, Pizza still has a pulse:
 // listens to Kilo, ducks Dragon's sneeze and notices Yomi's lantern.
 // The signals never create fire damage, extra toppings or weapon casts.
export const PIZZA_FAMILY_REACTIONS=Object.freeze({
  melody:Object.freeze([.72,.88,1.19,1.44]),
  dragon:Object.freeze([3.39,3.54,3.85,4.11]),
  yomi:Object.freeze([8.12,8.30,8.59,8.90])
});
export function pizzaWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const time=Math.round((((raw%14)+14)%14)*10000)/10000;
 const sniff=pulse(time,...PIZZA_WELCOME_BEATS.sniff);
 const spring=pulse(time,...PIZZA_WELCOME_BEATS.spring);
 const stretch=pulse(time,...PIZZA_WELCOME_BEATS.stretch);
 const caught=pulse(time,...PIZZA_WELCOME_BEATS.catch);
 const flourish=pulse(time,...PIZZA_WELCOME_BEATS.flourish);
 const breath=(1+Math.sin(time*TAU*4/14))*.5;
 const melody=pulse(time,...PIZZA_FAMILY_REACTIONS.melody);
 const dragon=pulse(time,...PIZZA_FAMILY_REACTIONS.dragon);
 const yomi=pulse(time,...PIZZA_FAMILY_REACTIONS.yomi);
 if(reducedMotion)return Object.freeze({
  phase:'idle',sniff:0,spring:0,stretch:0,catch:0,flourish:.2,
  breath:.5,melody:0,dragon:0,yomi:0,cheese:0,crust:0,glow:.11,reduced:true
 });
 const phase=stretch>.22?'stretch':caught>.22?'catch':spring>.22?'spring':
   sniff>.22?'sniff':flourish>.22?'flourish':'idle';
 return Object.freeze({
  phase,sniff,spring,stretch,catch:caught,flourish,breath,melody,dragon,yomi,
  cheese:clamp(.14+stretch*.76+spring*.3+caught*.27+melody*.10+dragon*.16+yomi*.13),
  crust:clamp(.22*Math.sin(time*TAU*5/14)+sniff*.28-spring*.26+caught*.35+melody*.12-dragon*.27+yomi*.16,-1,1),
  glow:clamp(.11+spring*.14+stretch*.18+flourish*.33+melody*.06+dragon*.09+yomi*.10),reduced:false
 });
}

export function drawPizzaWelcomeFX(ctx,x,foot,height,seconds,beat,layer='back'){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;
 ctx.save();
 if(layer==='back'){
   // Warm oven light makes the triangular silhouette readable, even when
   // Frita runs in front. The floor glow stays behind Pizza's feet.
   const alpha=.09+beat.glow*.19;
   const halo=ctx.createRadialGradient(x,foot-h*.43,0,x,foot-h*.43,h*.68);
   halo.addColorStop(0,'rgba(255,221,129,'+alpha+')');
   halo.addColorStop(.55,'rgba(243,127,46,'+(alpha*.34)+')');
   halo.addColorStop(1,'rgba(243,127,46,0)');
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,foot-h*.43,h*.68,0,TAU);ctx.fill();
   ctx.globalAlpha=.18+beat.breath*.08;
   ctx.strokeStyle='#ffd588';ctx.lineWidth=1.6;
   ctx.beginPath();ctx.ellipse(x,foot+3,h*.32,h*.055,0,0,TAU);ctx.stroke();
 }else if(layer==='front'&&!beat.reduced){
   if(beat.sniff>.06){
     const k=beat.sniff;
     ctx.globalAlpha=k*.52;ctx.strokeStyle='#fff3c8';ctx.lineWidth=1.8;
     for(let i=0;i<2;i++){
       const xx=x+h*(.19+i*.085), yy=foot-h*(.60+i*.13);
       ctx.beginPath();ctx.arc(xx,yy,h*.045,-.9,1.05);ctx.stroke();
     }
   }
   if(beat.spring>.04){
     const k=beat.spring;
     ctx.globalAlpha=k*.54;ctx.strokeStyle='#fff1ae';ctx.lineWidth=2;
     for(const side of [-1,1]){
       const xx=x+side*h*.20;
       ctx.beginPath();ctx.moveTo(xx,foot+2);
       ctx.quadraticCurveTo(xx+side*h*.09,foot-h*.025*k,
          xx+side*h*(.15+.05*k),foot-h*.04*k);ctx.stroke();
     }
   }
   if(beat.stretch>.05){
     // Melted-cheese ribbons react visually to Pizza's arm movement. They
     // are only a frame ornament, never the combat cheese-lasso hitbox.
     const k=beat.stretch;
     ctx.globalAlpha=k*.66;ctx.lineCap='round';
     for(let i=0;i<3;i++){
       const sx=x+h*(.20+i*.06),sy=foot-h*(.54+i*.07);
       const ex=sx+h*(.16+.07*k),ey=sy-h*(.10+.07*i)*k;
       ctx.strokeStyle='#70412b';ctx.lineWidth=4.2;
       ctx.beginPath();ctx.moveTo(sx,sy);
       ctx.quadraticCurveTo(sx+h*.07,sy+h*.07*k,ex,ey);ctx.stroke();
       ctx.strokeStyle='#ffe59b';ctx.lineWidth=2.8;
       ctx.beginPath();ctx.moveTo(sx,sy);
       ctx.quadraticCurveTo(sx+h*.07,sy+h*.07*k,ex,ey);ctx.stroke();
     }
   }
   if(beat.catch>.05){
     // A visible single pepperoni with a very short arc, caught by the
     // character's existing reaching arm at the final beat.
     const k=beat.catch,px=x+h*(.24+.09*k),py=foot-h*(.80+.13*Math.sin(k*Math.PI));
     ctx.globalAlpha=k*.86;ctx.fillStyle='#b93028';ctx.strokeStyle='#ffe3aa';
     ctx.lineWidth=1.8;
     ctx.beginPath();ctx.ellipse(px,py,h*.055,h*.050,.4,0,TAU);ctx.fill();ctx.stroke();
     ctx.fillStyle='#ffe09a';ctx.globalAlpha=k*.6;
     ctx.beginPath();ctx.arc(px-h*.016,py-h*.015,h*.008,0,TAU);ctx.fill();
   }
   if(beat.flourish>.05){
     const k=beat.flourish;
     const xx=x-h*.19,yy=foot-h*.90;
     ctx.globalAlpha=k*.67;ctx.strokeStyle='#fff6ce';
     ctx.lineWidth=2;ctx.lineCap='round';
     ctx.beginPath();ctx.moveTo(xx-h*.046,yy);ctx.lineTo(xx+h*.046,yy);
     ctx.moveTo(xx,yy-h*.046);ctx.lineTo(xx,yy+h*.046);ctx.stroke();
   }
 }
 ctx.restore();
}
