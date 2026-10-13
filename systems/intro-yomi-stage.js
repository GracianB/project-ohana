// OHANA V348 · Yomi's lantern-theatre welcome. Purely cosmetic.
// Five authored acting beats, no collision, damage or boss execution.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const n=clamp(v);return n*n*(3-2*n);};
const rise=(t,a,b)=>ease((t-a)/(b-a));
const fall=(t,a,b)=>1-rise(t,a,b);
const pulse=(t,a,b,c,d)=>rise(t,a,b)*fall(t,c,d);
export const YOMI_WELCOME_BEATS=Object.freeze({
 listen:Object.freeze([7.28,7.40,7.57,7.69]),
 gather:Object.freeze([7.65,7.77,7.93,8.05]),
 reveal:Object.freeze([8.01,8.14,8.33,8.46]),
 startle:Object.freeze([8.42,8.55,8.69,8.82]),
 bow:Object.freeze([8.78,8.94,9.17,9.38])
});
export function yomiWelcomeBeat(seconds,reducedMotion=false){
 const raw=Number.isFinite(seconds)?seconds:0;
 const time=Math.round((((raw%14)+14)%14)*10000)/10000;
 const listen=pulse(time,...YOMI_WELCOME_BEATS.listen);
 const gather=pulse(time,...YOMI_WELCOME_BEATS.gather);
 const reveal=pulse(time,...YOMI_WELCOME_BEATS.reveal);
 const startle=pulse(time,...YOMI_WELCOME_BEATS.startle);
 const bow=pulse(time,...YOMI_WELCOME_BEATS.bow);
 const breath=(1+Math.sin(time*TAU*4/14))*.5;
 if(reducedMotion)return Object.freeze({phase:'idle',listen:0,gather:0,
  reveal:0,startle:0,bow:.20,breath:.5,ribbon:0,halo:.12,reduced:true});
 const phase=reveal>.2?'reveal':startle>.2?'startle':gather>.2?'gather':
  listen>.2?'listen':bow>.2?'bow':'idle';
 return Object.freeze({phase,listen,gather,reveal,startle,bow,breath,
  ribbon:clamp(.18*Math.sin(time*TAU*5/14)+gather*.40-reveal*.30+startle*.44-bow*.18,-1,1),
  halo:clamp(.12+gather*.22+reveal*.75+startle*.27+bow*.2),reduced:false});
}
export function drawYomiWelcomeFX(ctx,x,foot,height,seconds,beat,layer='back'){
 if(!ctx||!beat||![x,foot,height,seconds].every(Number.isFinite)||height<=0)return;
 const h=height;
 ctx.save();
 if(layer==='back'){
   // Warm paper-lantern silhouette behind Yomi. No black hole that swallows
   // the actual character, and no camera-wide bloom.
   const light=.09+beat.halo*.22;
   const glow=ctx.createRadialGradient(x,foot-h*.50,0,x,foot-h*.50,h*.66);
   glow.addColorStop(0,'rgba(255,219,154,'+light+')');
   glow.addColorStop(.53,'rgba(240,133,141,'+(light*.44)+')');
   glow.addColorStop(1,'rgba(141,76,125,0)');
   ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,foot-h*.50,h*.66,0,TAU);ctx.fill();
   ctx.strokeStyle='#e6b5b4';ctx.lineWidth=1.7;
   ctx.globalAlpha=.19+beat.breath*.09;
   ctx.beginPath();ctx.ellipse(x,foot+4,h*.25,h*.06,0,0,TAU);ctx.stroke();
   if(!beat.reduced&&beat.gather>.06){
     // Delicate curtain of shadow stays INSIDE this actor's slot.
     ctx.globalAlpha=beat.gather*.38;ctx.fillStyle='#8c648c';
     ctx.beginPath();ctx.ellipse(x,foot+1,h*(.16+.13*beat.gather),
      h*(.024+.01*beat.gather),0,0,TAU);ctx.fill();
   }
 }else if(layer==='front'&&!beat.reduced){
   if(beat.listen>.05){
     const k=beat.listen;ctx.globalAlpha=k*.46;
     ctx.strokeStyle='#ffe6a7';ctx.lineWidth=1.8;
     for(let i=0;i<2;i++){
       ctx.beginPath();ctx.arc(x+h*.15,foot-h*.73,
        h*(.09+i*.065),-.95,.55);ctx.stroke();
     }
   }
   if(beat.gather>.05){
     // Paper motes orbit the original joined cape and lantern ribs.
     ctx.globalAlpha=beat.gather*.55;
     for(let i=0;i<5;i++){
       const a=i*TAU/5+beat.gather*.8;
       const px=x+Math.cos(a)*h*.27;
       const py=foot-h*.47+Math.sin(a)*h*.20;
       ctx.fillStyle=i%2?'#ffdea6':'#efd1bf';
       ctx.beginPath();ctx.ellipse(px,py,h*.014,h*.022,a,0,TAU);ctx.fill();
     }
   }
   if(beat.reveal>.05){
     const k=beat.reveal;
     ctx.globalAlpha=k*.65;
     ctx.strokeStyle='#ffecb5';ctx.lineWidth=2;ctx.lineCap='round';
     // A little paper crescent above the real lantern, never a detached
     // monster face or an invisible combat burst.
     ctx.beginPath();ctx.arc(x,foot-h*.90,h*(.10+.08*k),-2.7,-.25);ctx.stroke();
     for(const side of [-1,1]){
       ctx.beginPath();ctx.moveTo(x+side*h*.20,foot-h*.57);
       ctx.quadraticCurveTo(x+side*h*.29,foot-h*.70,
         x+side*h*.22,foot-h*.80);ctx.stroke();
     }
   }
   if(beat.startle>.04){
     const k=beat.startle;
     ctx.globalAlpha=k*.62;ctx.strokeStyle='#fff2d0';ctx.lineWidth=2;
     for(let i=-1;i<=1;i++){
       const xx=x+h*(.13+i*.09),yy=foot-h*.97;
       ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+i*h*.045,yy-h*.06);ctx.stroke();
     }
   }
   if(beat.bow>.05){
     const k=beat.bow;
     ctx.globalAlpha=k*.57;ctx.strokeStyle='#ffddb7';ctx.lineWidth=1.8;
     const xx=x-h*.20,yy=foot-h*.85;
     ctx.beginPath();ctx.moveTo(xx-h*.035,yy);ctx.lineTo(xx+h*.035,yy);
     ctx.moveTo(xx,yy-h*.035);ctx.lineTo(xx,yy+h*.035);ctx.stroke();
   }
 }
 ctx.restore();
}
