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
 const K=h/300,cx=w/2,cy=h*.74;
 let gentle=!!opts.reducedMotion;
 try{gentle=gentle||globalThis.localStorage?.getItem('ohana-gentle-motion')==='1'||
  !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;}catch{}
 const seed=Number(opts.seed)||0,g=michiGenome(seed),pal=g.palette;
 const beat=michicornioEvoBeat(t,fromForm,toForm,gentle,seed);
 const eclipse=beat.to===5,medusa=beat.to>=3,now=beat.time;
 const fxTime=gentle?0:now;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // Deep night stage in the Michicornio moon palette.
 ctx.fillStyle=eclipse?'#0b0e26':'#121a33';ctx.fillRect(0,0,w,h);
 ctx.fillStyle=eclipse?'#141235':'#18213f';ctx.fillRect(0,h*.62,w,h*.38);
 // Parallax cloud puffs.
 ctx.save();ctx.globalAlpha=.16;
 for(let i=0;i<6;i++){const x=((i*w/5+fxTime*12*K*(1+i%2))%(w+120*K))-60*K;
  oval(ctx,x,h*.2+(i%3)*22*K,34*K,10*K,'#9b86d2');oval(ctx,x+20*K,h*.2+(i%3)*22*K-5*K,22*K,9*K,'#9b86d2');}
 ctx.restore();
 // Stars.
 for(let i=0;i<34;i++){
  const x=hn(i,11)*w,y=hn(i,12)*h*.6;
  const twinkle=.25+.5*Math.abs(Math.sin(fxTime*2.8+i*.74));
  ctx.save();ctx.globalAlpha=twinkle;diamond(ctx,x,y,(1+hn(i,13)*1.6)*K,'#eae4ff');ctx.restore();
 }
 // Camera push-in + bloom shake (deterministic).
 const shake=gentle?0:beat.flash*4*K;
 ctx.save();ctx.translate(cx+Math.sin(now*61)*shake,cy+Math.cos(now*53)*shake);ctx.scale(beat.push,beat.push);ctx.translate(-cx,-cy);
 // Moon rises behind the actor; eclipse for the final form.
 const mr=(30+beat.moon*16)*K,my=cy-(156+beat.moon*14)*K;
 halo(ctx,cx,my,mr*1.5,mr*1.5,eclipse?'#cdb6ff':pal.glow,.6+beat.glow*.6);
 ctx.save();ctx.globalAlpha=.38+.34*beat.moon;oval(ctx,cx,my,mr,mr,eclipse?'#d8c0ff':'#eef1ff');
 ctx.globalAlpha*=.25;oval(ctx,cx-mr*.3,my-mr*.2,mr*.18,mr*.15,'#b8bde0');oval(ctx,cx+mr*.25,my+mr*.3,mr*.12,mr*.1,'#b8bde0');
 ctx.restore();
 if(eclipse){ctx.save();ctx.globalAlpha=.92*beat.moon;oval(ctx,cx+mr*.34,my-mr*.04,mr*.93,mr*.94,'#0b0e26');ctx.restore();}
 drawMotif(ctx,beat.motif,w,h,cx,cy,K,fxTime,beat.charge*(1-beat.bloom*.5)+beat.bloom*.4,pal,gentle);
 // Ground: reflective pool with ripple.
 ctx.save();ctx.globalAlpha=.3;oval(ctx,cx,cy+5*K,110*K,13*K,'#8a6eb8');ctx.globalAlpha=.18;oval(ctx,cx,cy+5*K,70*K,7*K,pal.glow);ctx.restore();
 const rise=gentle?0:Math.sin(now*7)*2.3*K;
 const S=2.25*K;
 if(beat.act==='listen'){
  drawEvolutionActor(ctx,'cat',cx,cy+rise,S,beat.from,now,{state:'idle',reducedMotion:gentle,seed});
  // Motes drift toward the horn: the dream is calling.
  for(let i=0;i<12;i++){const u=gentle?.5:clip(((now*.9+hn(i,21))%1));const a=hn(i,22)*TAU,r=(170-u*140)*K;
   ctx.save();ctx.globalAlpha=Math.sin(Math.PI*u)*.7*beat.progress+.1;diamond(ctx,cx+Math.cos(a)*r,cy-110*K+Math.sin(a)*r*.5,2.2*K,pal.bead);ctx.restore();}
  orbit(ctx,cx,cy-95*K,62*K,fxTime,.1+beat.progress*.2,3,pal.glow2);
 }else if(beat.act==='gather'){
  orbit(ctx,cx,cy-100*K,(70-beat.progress*14)*K,fxTime,.35+beat.progress*.5,7,pal.glow2);
  drawEvolutionActor(ctx,'cat',cx,cy+rise,S,beat.from,now,{state:'cast',cast:.12+beat.progress*.8,reducedMotion:gentle,seed});
  // Horn light gathers: a growing star above the head.
  const hy=cy-[118,150,165,190,200][beat.from-1]*K*.98;
  halo(ctx,cx,hy,(10+beat.progress*26)*K,(10+beat.progress*26)*K,'#fff3c0',1.5+beat.progress);
  ctx.save();ctx.globalAlpha=.6+.4*beat.progress;ctx.strokeStyle='#fff8dc';ctx.lineWidth=2*K;
  for(let j=0;j<4;j++){const a=j*Math.PI/2+fxTime*1.4,L=(8+beat.progress*22)*K;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*L*.2,hy+Math.sin(a)*L*.2);ctx.lineTo(cx+Math.cos(a)*L,hy+Math.sin(a)*L);ctx.stroke();}
  ctx.restore();
  for(let i=0;i<3;i++)lunarRibbon(ctx,cx,cy-120*K,i,3,fxTime,70*K,beat.charge*.5,pal);
 }else if(beat.act==='morph'){
  const pre=now<MICHI_BLOOM_AT,cocoon=beat.cocoon,bloom=beat.bloom;
  const ribbons=medusa?beat.tendrils:4;
  if(!pre)for(let i=0;i<ribbons;i++)lunarRibbon(ctx,cx,cy-70*K,i,ribbons,fxTime,95*K,(1-bloom)*.6+.15,pal);
  if(pre){
   // The old form curls up inside a translucent jelly cocoon.
   drawEvolutionActor(ctx,'cat',cx,cy+rise-cocoon*16*K,S*(1-cocoon*.25),beat.from,now,{state:'jump',reducedMotion:gentle,seed});
  }else{
   // The new form unfurls out of the bloom with an elastic overshoot.
   const grow=gentle?1:backOut(bloom);
   drawEvolutionActor(ctx,'cat',cx,cy+rise-(1-bloom)*18*K,S*(.55+.45*grow),beat.to,now,{state:'jump',reducedMotion:gentle,seed});
  }
  if(cocoon>0){const R=(150-cocoon*30)*K,bx=cx,by=cy-62*K;
   ctx.save();ctx.globalAlpha=.55*cocoon;ctx.fillStyle=pal.bell;ctx.beginPath();
   for(let s=0;s<=32;s++){const a=s/32*TAU,wob=gentle?0:Math.sin(a*3+now*8)*2.6*K+Math.sin(a*7-now*11)*1.2*K;const x=bx+Math.cos(a)*(R*.62+wob),y=by+Math.sin(a)*(R*.78+wob);s?ctx.lineTo(x,y):ctx.moveTo(x,y);}
   ctx.closePath();ctx.fill();ctx.globalAlpha=.9*cocoon;ctx.strokeStyle=pal.rim;ctx.lineWidth=2.4*K;ctx.stroke();
   ctx.globalAlpha=.7*cocoon;ctx.strokeStyle='#ffffff';ctx.lineWidth=3*K;ctx.beginPath();ctx.ellipse(bx-R*.2,by-R*.35,R*.32,R*.2,-.4,Math.PI*1.1,Math.PI*1.6);ctx.stroke();
   ctx.restore();}
  if(!pre&&!gentle){
   // Bubble bursts into droplets + shock rings.
   for(let i=0;i<18;i++){const a=i*TAU/18+hn(i,31)*.3,d=(60+bloom*170*(.6+hn(i,32)*.6))*K;
    ctx.save();ctx.globalAlpha=(1-bloom)*.9;oval(ctx,cx+Math.cos(a)*d,cy-95*K+Math.sin(a)*d*.8,(2.5+hn(i,33)*3)*K,(2.5+hn(i,33)*3)*K,i%2?pal.glow:pal.rim);ctx.restore();}
   for(let r=0;r<2;r++){const u=clip(bloom*1.3-r*.25);ctx.save();ctx.globalAlpha=(1-u)*.7;ctx.strokeStyle=r?pal.glow2:'#fff8e0';ctx.lineWidth=(4-r*1.5)*K;
    ctx.beginPath();ctx.ellipse(cx,cy-95*K,(30+u*260)*K,(24+u*180)*K,0,0,TAU);ctx.stroke();ctx.restore();}
  }
  orbit(ctx,cx,cy-100*K,78*K,fxTime,.4,9,pal.glow2);
 }else{
  // The new form celebrates; tendril crown + gentle sparkle rain.
  const settle=gentle?1:backOut(clip(beat.progress*1.6));
  const ribbons=medusa?beat.tendrils:5;
  for(let i=0;i<ribbons;i++)lunarRibbon(ctx,cx,cy-70*K,i,ribbons,fxTime,118*K,.1+.2*Math.sin(beat.progress*Math.PI),pal);
  drawEvolutionActor(ctx,'cat',cx,cy+rise,S*(.96+.04*settle),beat.to,now,{state:'victory',reducedMotion:gentle,seed});
  orbit(ctx,cx,cy-108*K,100*K,fxTime,.5*(1-beat.progress*.4),9,pal.glow2);
  for(let i=0;i<22;i++){const u=gentle?hn(i,41):((now*.5+hn(i,41))%1);ctx.save();ctx.globalAlpha=Math.sin(Math.PI*u)*.8;
   diamond(ctx,cx+(hn(i,42)-.5)*w*.7,h*.1+u*h*.6,(1.6+hn(i,43)*2)*K,i%3?pal.bead:pal.glow);ctx.restore();}
 }
 ctx.restore();
 // Cheap vignette: translucent frame bands, no gradient.
 ctx.save();ctx.strokeStyle='#05060f';ctx.globalAlpha=.06;for(let i=1;i<=10;i++){ctx.lineWidth=i*9*K;ctx.strokeRect(0,0,w,h);}ctx.restore();
 // Bloom flash (never in reduced motion): soft, not a strobe.
 if(beat.flash>0){ctx.save();ctx.globalAlpha=beat.flash*.7;ctx.fillStyle='#fbf3ff';ctx.fillRect(0,0,w,h);ctx.restore();}
 // Cinematic name card remains readable even at narrow mobile resolution.
 if(now>=2.75){
  const show=smooth((now-2.75)/.38),name=FORM_NAMES[beat.to-1];
  const line=evolutionMessage('cat',beat.from).line;
  const fs=Math.max(15,Math.round(24*K));
  ctx.save();ctx.globalAlpha=show;ctx.textAlign='center';
  ctx.translate(0,(1-show)*10*K);
  ctx.fillStyle='#0d0b24';ctx.globalAlpha=show*.55;ctx.fillRect(cx-Math.min(w*.46,190*K),h*.07,Math.min(w*.92,380*K),56*K);
  ctx.globalAlpha=show;ctx.strokeStyle=pal.glow;ctx.lineWidth=1.5*K;ctx.beginPath();ctx.moveTo(cx-90*K*show,h*.07+56*K);ctx.lineTo(cx+90*K*show,h*.07+56*K);ctx.stroke();
  ctx.font=`900 ${fs}px sans-serif`;
  ctx.lineWidth=5*K;ctx.strokeStyle='#13122e';ctx.strokeText(name,cx,h*.14);
  ctx.fillStyle='#f7edff';ctx.fillText(name,cx,h*.14);
  ctx.font=`700 ${Math.max(10,Math.round(12*K))}px sans-serif`;
  ctx.strokeText('Forma '+beat.from+' → '+beat.to,cx,h*.14+20*K);
  ctx.fillStyle=pal.glow;ctx.fillText('Forma '+beat.from+' → '+beat.to,cx,h*.14+20*K);
  if(now>=3.05&&line){ctx.globalAlpha=smooth((now-3.05)/.4);ctx.font=`600 ${Math.max(10,Math.round(11*K))}px sans-serif`;
   ctx.strokeText(line,cx,h*.84);ctx.fillStyle='#efe6ff';ctx.fillText(line,cx,h*.84);}
  ctx.restore();
 }
 // Visible progress provides continuity through the five possible transitions.
 for(let i=0;i<5;i++){
  const x=cx+(i-2)*24*K,y=h*.92,lit=i<beat.to,next=i===beat.to-1;
  if(next){ctx.save();ctx.globalAlpha=.4+.4*Math.abs(Math.sin(fxTime*4));diamond(ctx,x,y,8*K,pal.glow);ctx.restore();}
  diamond(ctx,x,y,5*K,lit?'#e7ceff':'#54486a');
 }
 ctx.restore();
}
