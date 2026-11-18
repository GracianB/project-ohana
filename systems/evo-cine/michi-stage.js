import {drawEvolutionActor} from './real-actor.js';
const TAU=Math.PI*2;
const clip=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const smooth=v=>{v=clip(v);return v*v*(3-2*v);};
const line=(c,color,w,fn)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();fn();c.stroke();};
const oval=(c,x,y,a,b,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill();};
function mote(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.6,y);c.lineTo(x,y+r);c.lineTo(x-r*.6,y);c.closePath();c.fill();}
export function drawMichiMetamorphosis(c,w,h,beat,names){
 const reduced=beat.reducedMotion,time=reduced?3.45:beat.time,k=h/300,foot=h*.76,cx=w*.5,to=beat.to,from=beat.from;
 const morph=smooth((time-1.72)/.74),reveal=smooth((time-2.42)/.8),a=reduced?1:morph;
 const col=['#a4d7ca','#c0accd','#b1bbc2','#c1b1df','#d9f5dc'][to-1];
 c.save();c.fillStyle='#14243a';c.fillRect(0,0,w,h);
 // Layered garden silhouettes remain flat vector geometry, even in the reveal.
 for(let layer=0;layer<3;layer++){
  c.globalAlpha=.10+layer*.035;c.fillStyle=['#96bab2','#b3a2bf','#d0b79b'][layer];c.beginPath();c.moveTo(0,foot);
  for(let j=0;j<=16;j++){const xx=j*w/16,yy=foot-(25+layer*19+Math.sin(j*.8+layer)*12)*k;c.lineTo(xx,yy);}c.lineTo(w,h);c.lineTo(0,h);c.fill();
 }c.globalAlpha=1;c.fillStyle='#34475a';c.fillRect(0,foot,w,h-foot);line(c,'#a4afa0',1.5*k,()=>{c.moveTo(0,foot);c.lineTo(w,foot);});
 const actorScale=2.25*k,shrink=to===3?.78:1,lift=to===2?Math.sin(clip((time-1.8)/2)*Math.PI)*34*k:to===5?reveal*24*k:0;
 // The old form and the new form cross only inside the short, readable metamorphosis.
 if(!reduced&&a<1){c.save();c.globalAlpha=1-a;drawEvolutionActor(c,'cat',cx-(1-a)*3*k,foot,actorScale,from,time,{state:time<.8?'idle':'cast',seed:beat.seed});c.restore();}
 if(a>0){c.save();c.globalAlpha=a;drawEvolutionActor(c,'cat',cx,foot-lift,actorScale*shrink,to,time,{state:reduced?'idle':time<2.8?(to===2?'glide':to===3?'run':to===4?'cast':'jump'):'victory',reducedMotion:reduced,seed:beat.seed});c.restore();}
 if(to===2){
  // Air streams separate into two wings, then carry the actor upward.
  for(const side of[-1,1])for(let j=0;j<3;j++)line(c,['#cbb2cf','#a6d8cb','#e7c6a0'][j],1.2*k,()=>{const x=cx+side*(35+j*18)*k;c.moveTo(x+side*30*k,foot-10*k);c.bezierCurveTo(x-side*40*k,foot-70*k,x+side*45*k,foot-120*k,x,foot-160*k);});
  for(let j=0;j<8;j++){const p=reduced?j/8:(time*.24+j/8)%1;mote(c,cx+Math.sin(j)*110*k,foot-p*150*k,1.8*k,col);}
 }else if(to===3){
  // A low camera and large dew grass make becoming small a real visual event.
  for(const side of[-1,1])for(let j=0;j<4;j++){
   const x=cx+side*(54+j*23)*k,height=(24+j*11)*k;
   line(c,j%2?'#6e9b94':'#9cbd9e',2*k,()=>{c.moveTo(x,foot);c.quadraticCurveTo(x-side*15*k,foot-height*.65,x+side*8*k,foot-height);});
   oval(c,x+side*7*k,foot-height,2*k,3*k,'#e1e3bf');
  }
 }else if(to===4){
  // A book releases folded leaves, not a generic wall of particles.
  for(const side of[-1,1]){
   c.fillStyle=side<0?'#d9d4bb':'#f0e6c6';c.beginPath();c.moveTo(cx+side*67*k,foot-30*k);c.lineTo(cx+side*112*k,foot-40*k);c.lineTo(cx+side*108*k,foot-69*k);c.lineTo(cx+side*67*k,foot-59*k);c.fill();
   for(let j=0;j<3;j++)line(c,'#8d7f9d',.8*k,()=>{c.moveTo(cx+side*75*k,foot-(38+j*7)*k);c.lineTo(cx+side*100*k,foot-(44+j*7)*k);});
  }
  for(let j=0;j<5;j++){const p=reduced?j/5:(time*.18+j/5)%1;const x=cx+Math.sin(j*2.4+p)*85*k,y=foot-(40+p*115)*k;c.save();c.translate(x,y);c.rotate(j*.4+p);c.fillStyle='#d3c0d0';c.fillRect(-3*k,-5*k,6*k,10*k);c.restore();}
 }else if(to===5){
  // Grounded pawprints dissolve into three tiny companions above the ghost.
  for(let j=0;j<5;j++){c.globalAlpha=(1-reveal*.6)*.6;oval(c,cx-(65-j*20)*k,foot+6*k,3*k,2*k,'#b9d3ca');}
  c.globalAlpha=1;for(let j=0;j<3;j++){const q=time*.45+j*TAU/3,x=cx+Math.cos(q)*68*k,y=foot-(90+Math.sin(q)*18)*k;mote(c,x,y,4*k,'#ddf2d9');line(c,'#9ecbd0',1*k,()=>{c.moveTo(x-4*k,y-4*k);c.lineTo(x-5*k,y-8*k);c.moveTo(x+4*k,y-4*k);c.lineTo(x+5*k,y-8*k);});}
 }
 const pulse=reduced?0:beat.flash*.12;if(pulse){c.globalAlpha=pulse;oval(c,cx,foot-60*k,92*k,110*k,'#f5e7cb');c.globalAlpha=1;}
 for(let j=0;j<14;j++){const ang=j*2.399+(reduced?0:time*.3),r=(48+reveal*24)*k;mote(c,cx+Math.cos(ang)*r,foot-58*k+Math.sin(ang)*r*.52,(j%4?1:2)*k,j%3?col:'#eed7b3');}
 c.textAlign='center';c.fillStyle='#f0e0c6';c.font='700 '+Math.max(12,Math.min(28,18*k))+'px sans-serif';c.fillText(names[to-1]||'Michi',cx,h*.13,w-24);
 c.fillStyle=col;c.font='600 '+Math.max(10,Math.min(17,11*k))+'px sans-serif';c.fillText(['','Una chispa entre las raíces','El aire también es un camino','Pequeño. Negro. Imparable.','La magia aprende a escuchar','Nada puede encerrar un recuerdo'][to]||'',cx,h*.21,w-24);
 c.fillStyle='#a8c9bf';c.font='600 '+Math.max(10,Math.min(15,10*k))+'px sans-serif';c.fillText('Forma '+from+' → '+to,cx,h*.91,w-24);c.restore();
}
