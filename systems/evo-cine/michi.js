// OHANA V460 · Michicornio's living metamorphosis, four seconds, four acts.
// All 2D Canvas, deterministic, accessible; no images, RNG or new gameplay state.
// Phase: listening → horn gathers light → feline anatomy morphs → living reveal.
import {ROSTER} from '../../characters/roster.js';
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
export function michicornioEvoBeat(t=0,from=1,to=2,reducedMotion=false){
 const time=clip(t,0,EVO_CINE_DURATION),act=MICHI_EVO_ACTS.find(a=>time<a.end)||MICHI_EVO_ACTS.at(-1);
 const duration=act.end-act.start,progress=smooth((time-act.start)/duration);
 const begin=clip(from,1,5),end=clip(to,1,5);
 return Object.freeze({act:act.id,progress,from:begin,to:end,time,reducedMotion:!!reducedMotion,
   charge:smooth((time-.65)/1.2),arrival:smooth((time-2.15)/.85),
   face:time<1.75?'cast':time<2.8?'jump':'victory',
   tendrils:end>=3?end>=5?9:7:3,
   moon:smooth((time-.9)/1.4),
   glow:time<1.75?smooth((time-.4)/1.35):1-smooth((time-2.7)/1.4)*.28});
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
function lunarRibbon(ctx,cx,cy,i,count,t,size,alpha){
 const a=(i-(count-1)/2)*TAU/count*.94;
 const sway=Math.sin(t*4+i*.88)*size*.09,reach=size*(.5+(i%3)*.08);
 const tx=cx+Math.sin(a)*reach*1.5+sway,ty=cy+Math.cos(a)*reach*.77;
 ctx.save();ctx.globalAlpha=clip(alpha);ctx.lineCap='round';
 ctx.strokeStyle='#30254d';ctx.lineWidth=5*size/80;
 ctx.beginPath();ctx.moveTo(cx,cy);ctx.bezierCurveTo(cx+Math.sin(a)*size*.5,cy-size*.38,
  tx+Math.cos(a)*size*.18,ty-size*.32,tx,ty);ctx.stroke();
 ctx.strokeStyle=i%2?'#bfeeff':'#f7c3ed';ctx.lineWidth=3.4*size/80;ctx.stroke();
 diamond(ctx,tx,ty,size*.055,i%2?'#bfffff':'#ffe8c5');
 ctx.restore();
}
export function drawEvoCine(ctx,w,h,t,fromForm=1,toForm=2){
 const K=h/300,cx=w/2,cy=h*.73;
 const beat=michicornioEvoBeat(t,fromForm,toForm);
 const eclipse=beat.to===5,medusa=beat.to>=3,now=beat.time;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 // Stage is in the same blue-violet moon palette as Michicornio and the room.
 ctx.fillStyle=eclipse?'#0c1029':'#151c35';ctx.fillRect(0,0,w,h);
 ctx.save();ctx.globalAlpha=.18;
 for(let i=0;i<5;i++){const x=cx+(i-2)*71*K;
  oval(ctx,x,cy-155*K+(i%2)*15*K,24*K,12*K,'#9b86d2');}
 ctx.restore();
 const mr=(32+beat.moon*61)*K;
 ctx.save();ctx.globalAlpha=.45+.4*beat.moon;
 oval(ctx,cx,cy-76*K,mr,mr,eclipse?'#d8c0ff':'#e7edff');
 if(eclipse)oval(ctx,cx+mr*.32,cy-80*K,mr*.91,mr*.92,'#0c1029');
 ctx.restore();
 for(let i=0;i<27;i++){
  const x=(i*137.5+23)%Math.max(1,w),y=(i*101.3+17)%(h*.68);
  const twinkle=.3+.4*Math.abs(Math.sin(now*2.8+i*.74));
  ctx.save();ctx.globalAlpha=twinkle;diamond(ctx,x,y,(1.2+(i%3)*.5)*K,'#eae4ff');ctx.restore();
 }
 // Translucent ground ellipse anchors the actor's feet, not an imported sprite.
 ctx.save();ctx.globalAlpha=.26;oval(ctx,cx,cy+5*K,95*K,12*K,'#8a6eb8');ctx.restore();
 const rise=beat.reducedMotion?0:Math.sin(now*7)*2.3*K;
 const enterScale=1.78+beat.arrival*.56;
 if(beat.act==='listen'){
  drawEvolutionActor(ctx,'cat',cx,cy+rise,1.83*K,beat.from,now,{state:'idle'});
  orbit(ctx,cx,cy-65*K,51*K,now,.13+beat.progress*.18,3,'#c7b6e9');
 }else if(beat.act==='gather'){
  orbit(ctx,cx,cy-74*K,(58-beat.progress*12)*K,now,.35+beat.progress*.5,7,'#e3c4ff');
  drawEvolutionActor(ctx,'cat',cx,cy+rise,1.82*K,beat.from,now,
   {state:'cast',cast:.12+beat.progress*.8});
  for(let i=0;i<3;i++)lunarRibbon(ctx,cx,cy-90*K,i,3,now,66*K,beat.charge*.58);
 }else if(beat.act==='morph'){
  const oldAlpha=clip((1-beat.progress)*1.4),newAlpha=clip(beat.progress*1.5);
  ctx.save();ctx.globalAlpha=oldAlpha;
  drawEvolutionActor(ctx,'cat',cx-20*K*beat.progress,cy+rise,1.8*K*(1-beat.progress*.12),beat.from,now,
   {state:'cast',cast:.85});ctx.restore();
  ctx.save();ctx.globalAlpha=newAlpha;
  drawEvolutionActor(ctx,'cat',cx+14*K*(1-beat.progress),cy+rise,(1.84+beat.progress*.54)*K,beat.to,now,
   {state:'jump'});ctx.restore();
  const ribbons=medusa?beat.tendrils:4;
  for(let i=0;i<ribbons;i++)lunarRibbon(ctx,cx,cy-82*K,i,ribbons,now,80*K,beat.progress*.5);
  orbit(ctx,cx,cy-77*K,65*K,now,.47,9,'#f7c9ff');
 }else{
  // The form visibly celebrates. The previous version drew a STATIC reduced-motion idle pose here.
  drawEvolutionActor(ctx,'cat',cx,cy+rise,enterScale*K,beat.to,now,{state:'victory'});
  const ribbons=medusa?beat.tendrils:5;
  for(let i=0;i<ribbons;i++)lunarRibbon(ctx,cx,cy-85*K,i,ribbons,now,100*K,.12+.24*Math.sin(beat.progress*Math.PI));
  orbit(ctx,cx,cy-84*K,87*K,now,.55*(1-beat.progress*.4),9,'#efc9ff');
 }
 // Cinematic name remains readable even at narrow mobile resolution.
 if(now>=2.75){
  const show=smooth((now-2.75)/.38),name=FORM_NAMES[beat.to-1];
  ctx.save();ctx.globalAlpha=show;ctx.textAlign='center';
  ctx.font=`900 ${Math.max(15,Math.round(22*K))}px sans-serif`;
  ctx.lineWidth=5*K;ctx.strokeStyle='#13122e';ctx.strokeText(name,cx,h*.14);
  ctx.fillStyle='#f7edff';ctx.fillText(name,cx,h*.14);
  ctx.font=`700 ${Math.max(10,Math.round(12*K))}px sans-serif`;
  ctx.strokeText('Forma '+beat.from+' → '+beat.to,cx,h*.14+21*K);
  ctx.fillStyle='#e6c7ff';ctx.fillText('Forma '+beat.from+' → '+beat.to,cx,h*.14+21*K);
  ctx.restore();
 }
 // Visible progress provides continuity through the five possible transitions.
 for(let i=0;i<5;i++){
  const x=cx+(i-2)*24*K,y=h*.90;
  diamond(ctx,x,y,5*K,i<beat.to?'#e7ceff':'#54486a');
 }
 ctx.restore();
}
