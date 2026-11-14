// OHANA V461 · Michicornio's living metamorphosis, four seconds, four acts.
// All 2D Canvas, deterministic per seed, accessible; no images, gradients or RNG.
// Phase: listening → horn gathers light → jelly cocoon + bloom → living reveal.
// The run seed picks one of four curated staging motifs (marea, capullo,
// constelación, aurora) and the dream palette shared with the character art.
import {ROSTER} from '../../characters/roster.js';
import {evolutionMessage} from '../../characters/evolution.js';
import {michiGenome,MICHI_CINE_MOTIFS,halo,drawTentacle} from '../../characters/michi-jelly.js';
import {drawEvolutionActor} from './real-actor.js';
export const EVO_CINE_DURATION=4.0;
export const MICHI_EVO_ACTS=Object.freeze([
 Object.freeze({id:'listen',start:0,end:.9}),
 Object.freeze({id:'gather',start:.9,end:1.75}),
 Object.freeze({id:'morph',start:1.75,end:2.9}),
 Object.freeze({id:'reveal',start:2.9,end:4})
]);
const TAU=Math.PI*2;
const FORM_NAMES=ROSTER.find(r=>r.id==='cat').forms.map(f=>f.name);
const clip=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const smooth=v=>{const k=clip(v);return k*k*(3-2*k);};
const backOut=v=>{const k=clip(v),s=1.6;return 1+(s+1)*(k-1)**3+s*(k-1)**2;};
// Deterministic hash noise for particle layouts (seeded, never live RNG).
const hn=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
export const MICHI_BLOOM_AT=2.28;
export function michicornioEvoBeat(t=0,from=1,to=2,reducedMotion=false,seed=0){
 const time=clip(t,0,EVO_CINE_DURATION),act=MICHI_EVO_ACTS.find(a=>time<a.end)||MICHI_EVO_ACTS.at(-1);
 const duration=act.end-act.start,progress=smooth((time-act.start)/duration);
 const begin=clip(from,1,5),end=clip(to,1,5),genome=michiGenome(seed);
 return Object.freeze({act:act.id,progress,from:begin,to:end,time,reducedMotion:!!reducedMotion,
   charge:smooth((time-.65)/1.2),arrival:smooth((time-2.15)/.85),
   face:time<1.75?'cast':time<2.8?'jump':'victory',
   tendrils:end>=3?end>=5?9:7:3,
   moon:smooth((time-.9)/1.4),
   glow:time<1.75?smooth((time-.4)/1.35):1-smooth((time-2.7)/1.4)*.28,
   cocoon:smooth((time-1.75)/.42)*(1-smooth((time-MICHI_BLOOM_AT)/.22)),
   flash:reducedMotion?0:Math.max(0,1-Math.abs(time-MICHI_BLOOM_AT)/.2),
   bloom:smooth((time-MICHI_BLOOM_AT)/.55),
   push:1+smooth(time/2.2)*.08-smooth((time-2.3)/.8)*.05,
   motif:MICHI_CINE_MOTIFS[genome.motif],palette:genome.palette.id,seed:genome.seed});
}
const oval=(ctx,x,y,rx,ry,color)=>{
 ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=color;ctx.fill();
};
const diamond=(ctx,x,y,r,color)=>{
 ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y);
 ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y);ctx.closePath();ctx.fillStyle=color;ctx.fill();
};
function orbit(ctx,cx,cy,r,time,alpha,count,color){
 ctx.save();ctx.globalAlpha=clip(alpha);ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,r*.019);
 ctx.beginPath();ctx.ellipse(cx,cy,r,r*.42,0,0,TAU);ctx.stroke();
 for(let j=0;j<count;j++){
  const a=j*TAU/count+time*.8;
  diamond(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.42,r*.065,'#fff4c6');
 }
 ctx.restore();
}
function lunarRibbon(ctx,cx,cy,i,count,t,size,alpha,pal){
 const a=(i-(count-1)/2)*TAU/count*.94;
 drawTentacle(ctx,{x:cx,y:cy,len:size*(.62+(i%3)*.08),dir:Math.PI/2+a*.9,phase:i*.88,t:t*60,amp:size*.07,
  width:Math.max(2,size*.07),alpha:clip(alpha),fill:i%2?pal.glow:pal.arm,edge:'#30254d',edgeWidth:Math.max(.8,size*.012),core:'#ffffff',beads:pal.bead});
}
// Background staging per motif. Cheap: strokes/ellipses only.
function drawMotif(ctx,motif,w,h,cx,cy,K,t,k,pal,gentle){
 ctx.save();ctx.lineCap='round';
 if(motif==='marea'){ // tide rings + rising bubbles
  for(let i=0;i<4;i++){const u=gentle?i/4:((t*.45+i/4)%1);ctx.globalAlpha=(1-u)*.35*k;ctx.strokeStyle=pal.glow;ctx.lineWidth=2*K;
   ctx.beginPath();ctx.ellipse(cx,cy+4*K,(40+u*190)*K,(7+u*30)*K,0,0,TAU);ctx.stroke();}
  for(let i=0;i<16;i++){const u=gentle?hn(i,3):((t*.22*(.6+hn(i,1))+hn(i,2))%1);ctx.globalAlpha=Math.sin(Math.PI*u)*.5*k;ctx.strokeStyle=pal.rim;ctx.lineWidth=1.2*K;
   ctx.beginPath();ctx.arc(cx+(hn(i,4)-.5)*w*.7,cy-u*h*.75,(2+hn(i,5)*4)*K,0,TAU);ctx.stroke();}
 }else if(motif==='capullo'){ // silk threads spiral in
  for(let i=0;i<7;i++){ctx.globalAlpha=.32*k;ctx.strokeStyle=i%2?pal.glow:pal.gonad;ctx.lineWidth=1.6*K;ctx.beginPath();
   for(let s=0;s<=24;s++){const u=s/24,a=i*TAU/7+u*4.2+(gentle?0:t*.9),r=(210-u*150)*K;const x=cx+Math.cos(a)*r,y=cy-90*K+Math.sin(a)*r*.45;s?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
 }else if(motif==='constelacion'){ // a constellation of the next form draws itself
  const n=9,pts=[];for(let i=0;i<n;i++){const a=i*TAU/n+hn(i,7)*.5,r=(120+hn(i,8)*60)*K;pts.push([cx+Math.cos(a)*r,cy-95*K+Math.sin(a)*r*.55]);}
  ctx.strokeStyle=pal.glow;ctx.lineWidth=1.2*K;
  for(let i=0;i<n;i++){const show=clip(k*n-i);if(show<=0)continue;const a=pts[i],b=pts[(i+2)%n];ctx.globalAlpha=.45*show;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0]+(b[0]-a[0])*show,a[1]+(b[1]-a[1])*show);ctx.stroke();ctx.globalAlpha=.9*show;diamond(ctx,a[0],a[1],3.2*K,pal.bead);}
 }else{ // aurora curtains
  for(let b=0;b<5;b++){ctx.globalAlpha=.075*k;ctx.fillStyle=[pal.glow,pal.glow2,pal.gonad,pal.glow,pal.glow2][b];ctx.beginPath();
   for(let s=0;s<=20;s++){const x=w*s/20,y=h*(.14+b*.05)+Math.sin(s*.7+b*1.3+(gentle?0:t*1.4))*h*.05;s?ctx.lineTo(x,y):ctx.moveTo(x,y);}
   for(let s=20;s>=0;s--){const x=w*s/20,y=h*(.3+b*.05)+Math.sin(s*.5+b*1.7+(gentle?0:t*1.1))*h*.06;ctx.lineTo(x,y);}ctx.closePath();ctx.fill();}
 }
 ctx.restore();
}
export function drawEvoCine(ctx,w,h,t,fromForm=1,toForm=2,opts={}){
 const reduced=!!opts.reducedMotion,beat=michicornioEvoBeat(t,fromForm,toForm,reduced,opts.seed),now=beat.time,k=reduced?.65:clip(now/4),cx=w/2,foot=h*.76,K=h/300;
 ctx.save();ctx.fillStyle='#102c38';ctx.fillRect(0,0,w,h);ctx.fillStyle='#24434b';ctx.fillRect(0,foot,w,h-foot);ctx.fillStyle='#73978b';ctx.fillRect(0,foot,w,3*K);
 for(let i=0;i<5;i++){const x=w*(.16+i*.17);ctx.strokeStyle='#34525a';ctx.lineWidth=3*K;ctx.beginPath();ctx.moveTo(x,foot);ctx.lineTo(x,h*.34);ctx.quadraticCurveTo(x-16*K,h*.23,x+12*K,h*.19);ctx.stroke();ctx.fillStyle=i<toForm?'#e9dfbc':'#45636b';ctx.fillRect(x-6*K,h*.31,12*K,18*K);}
 const morph=now>=1.95,form=morph?toForm:fromForm,state=reduced?'idle':now<.9?'idle':now<1.95?'cast':now<2.9?(toForm===2?'glide':toForm===3?'run':'jump'):'victory';
 const lift=reduced?0:toForm===2&&morph?Math.sin(clip((now-1.95)/2)*Math.PI)*28*K:toForm===5&&morph?12*K:0;
 drawEvolutionActor(ctx,'cat',cx,foot-lift,2.25*K,form,now,{state,reducedMotion:reduced,seed:opts.seed});
 // Transformation is a small trail of released fireflies, rather than another eclipse.
 for(let i=0;i<22;i++){const a=i*2.399,r=(reduced?60:30+beat.charge*70+beat.bloom*45)*K;ctx.globalAlpha=.25+beat.charge*.35;const x=cx+Math.cos(a+(!reduced?now*.5:0))*r,y=foot-50*K+Math.sin(a)*r*.55;diamond(ctx,x,y,(i%3?1.5:2.4)*K,i%3?'#8dd7c6':'#e7a394');}
 ctx.globalAlpha=1;ctx.textAlign='center';ctx.fillStyle='#e9dfbc';ctx.font='700 '+Math.max(12,18*K)+'px sans-serif';ctx.fillText(FORM_NAMES[toForm-1]||'Michi',cx,h*.13,w-24);ctx.fillStyle='#8dd7c6';ctx.font='600 '+Math.max(10,11*K)+'px sans-serif';ctx.fillText(['','Una chispa entre las raíces','El aire también es un camino','Pequeño. Negro. Imparable.','La magia aprende a escuchar','Nada puede encerrar un recuerdo'][toForm]||'',cx,h*.21,w-24);
 ctx.fillStyle='#a8c9bf';ctx.font='600 '+Math.max(10,10*K)+'px sans-serif';ctx.fillText('Forma '+fromForm+' → '+toForm,cx,h*.28,w-24);
 for(let i=0;i<5;i++)diamond(ctx,cx+(i-2)*20*K,h*.91,(i===toForm-1?5:3)*K,i<toForm?'#8dd7c6':'#45636b');ctx.restore();
}
