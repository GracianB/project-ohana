import {drawCharacter} from '../../characters/draw.js';
import {ROSTER} from '../../characters/roster.js';
import {CALIBRATED_HEIGHT} from '../../characters/visual-size.js';
import {EVOLUTION_CINEMA_PROFILES,evolutionMessage} from '../../characters/evolution.js';
import {cachedGradient} from '../canvas-gradient-cache.js';
import {drawChispaEvolution} from './chispa-presentation.js';

const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{const k=clamp(x);return k*k*(3-2*k);};
const TAU=Math.PI*2;
const POSES={kilo:'victory',stitcho:'attack',chispin:'attack',cat:'victory',dragon:'glide',dino:'attack',frita:'jump',pizza:'jump',yomi:'attack',cuerno:'victory'};

export function evolutionPresentation(id,evo,width,height,time,reduced=false){
 const def=ROSTER.find(r=>r.id===id)||ROSTER[0];
 const form=Math.max(1,Math.min(4,Math.floor(Number(evo)||1)));
 const t=Math.max(0,Math.min(4,Number(time)||0));
 const reveal=ease((t-1.25)/.8),arrival=ease((t-2.05)/.6);
 const target=Math.min(height*.33,width*.48,290);
 return {id:def.id,form,t,reveal,arrival,target,cx:width/2,foot:height*.63,
  pose:reduced?'idle':t<1.25?'curious':t<2.05?'jump':t<3.1?POSES[def.id]:'victory',
  oldAlpha:1-reveal,newAlpha:reveal,
  lift:reduced?0:Math.sin(Math.PI*clamp((t-1.25)/1.15))*target*.12,
  title:def.forms[form].name,previous:def.forms[form-1].name,
  message:evolutionMessage(def.id,form).line,accent:EVOLUTION_CINEMA_PROFILES[def.id].accent,
  phase:t<1.25?'anticipation':t<2.05?'transformation':'reveal'};
}

function motif(ctx,id,x,y,r,t,accent,reduced){
 ctx.save();ctx.translate(x,y);ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=2;
 const motion=reduced?0:t*.12;
 for(let i=0;i<7;i++){
  const a=i*TAU/7+motion;ctx.save();ctx.rotate(a);ctx.translate(r,0);
  ctx.beginPath();
  if(id==='chispin'||id==='stitcho'){ctx.moveTo(-9,-11);ctx.lineTo(3,-2);ctx.lineTo(-2,3);ctx.lineTo(9,11);}
  else if(id==='dino'){ctx.moveTo(0,-12);ctx.lineTo(7,0);ctx.lineTo(0,12);ctx.lineTo(-7,0);ctx.closePath();}
  else if(id==='dragon'||id==='frita'){ctx.moveTo(-5,10);ctx.quadraticCurveTo(-10,-2,0,-14);ctx.quadraticCurveTo(13,4,5,10);}
  else if(id==='cat'||id==='yomi'){ctx.arc(0,0,9,-Math.PI*.65,Math.PI*.65);}
  else if(id==='pizza'){ctx.moveTo(-8,-8);ctx.lineTo(10,0);ctx.lineTo(-8,8);ctx.closePath();}
  else if(id==='cuerno'){ctx.arc(0,0,12,Math.PI,TAU);}
  else ctx.ellipse(0,0,5,12,0,0,TAU);
  ctx.stroke();ctx.restore();
 }ctx.restore();
}

function actor(ctx,def,form,cx,foot,height,alpha,pose,t,reduced){
 if(alpha<=0)return;
 const f=def.forms[form],scale=height/CALIBRATED_HEIGHT[form];
 const p={...f,id:def.id,evo:form,w:f.w,h:f.h,x:cx-f.w/2,y:foot-f.h,
  color:f.color,grounded:pose!=='jump'&&pose!=='glide',facing:1,vx:0,vy:0,
  melee:pose==='attack'?6:0,invuln:0,visualScale:scale,_poseOverride:pose,
  _introForceCanvas:true,reduceMotion:reduced};
 ctx.save();ctx.globalAlpha*=alpha;drawCharacter(ctx,p,{x:0,y:0},reduced?40:t*60,{reduceMotion:reduced});ctx.restore();
}

function textLines(ctx,text,x,y,width,lineHeight){
 const words=String(text||'').split(' ');let line='',row=0;
 for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){ctx.fillText(line,x,y+row++*lineHeight);line=word;}else line=next;}
 if(line)ctx.fillText(line,x,y+row*lineHeight);
}

export function drawEvolutionPresentation(ctx,width,height,id,evo,time,reduced=false){
 const s=evolutionPresentation(id,evo,width,height,time,reduced),def=ROSTER.find(r=>r.id===s.id);
 if(s.id==='chispin')return drawChispaEvolution(ctx,width,height,s,reduced);
 const profile=EVOLUTION_CINEMA_PROFILES[s.id];
 ctx.save();
 try{
  const bg=cachedGradient(ctx,`evolution-stage:${s.id}:${height}`,()=>{
   const g=ctx.createLinearGradient(0,0,0,height);g.addColorStop(0,profile.bg);g.addColorStop(.65,'#16373d');g.addColorStop(1,'#091d28');return g;
  });ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  // Three quiet scenic planes leave the silhouette and text unobstructed.
  for(let layer=0;layer<3;layer++){
   ctx.fillStyle=['#7dbaab0b','#a7d8bd0b','#071d2944'][layer];ctx.beginPath();ctx.moveTo(0,height);
   for(let i=0;i<=8;i++){const x=width*i/8,y=height*(.58+layer*.09)+Math.sin(i*1.3+layer)*height*.035;ctx.lineTo(x,y);}
   ctx.lineTo(width,height);ctx.closePath();ctx.fill();
  }
  ctx.globalAlpha=.12+s.reveal*.13;
  motif(ctx,s.id,s.cx,s.foot-s.target*.5,s.target*.77,reduced?0:s.t,s.accent,reduced);
  ctx.globalAlpha=1;
  ctx.fillStyle='#06192366';ctx.beginPath();ctx.ellipse(s.cx,s.foot+8,s.target*.44,s.target*.055,0,0,TAU);ctx.fill();
  const oldHeight=s.target*CALIBRATED_HEIGHT[s.form-1]/CALIBRATED_HEIGHT[s.form];
  actor(ctx,def,s.form-1,s.cx,s.foot-s.lift,oldHeight,s.oldAlpha,s.pose,s.t,reduced);
  actor(ctx,def,s.form,s.cx,s.foot-s.lift,s.target,s.newAlpha,s.pose,s.t,reduced);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#b5d3bd';
  ctx.font='600 11px Outfit, sans-serif';ctx.fillText(s.form===4?'LA FAMILIA CRECE · FORMA FINAL':'LA FAMILIA CRECE',s.cx,height*.15);
  ctx.fillStyle='#fff1d0';ctx.font=`600 ${Math.min(38,width*.072)}px Fredoka, sans-serif`;
  textLines(ctx,s.reveal>.5?s.title:s.previous,s.cx,height*.21,width-40,Math.min(42,width*.08));
  ctx.font='500 12px Outfit, sans-serif';ctx.fillStyle=s.accent;
  ctx.fillText(`Forma ${s.form}  →  ${s.form+1} de 5`,s.cx,height*.29);
  // A persistent five-stop timeline makes the growth understandable.
  const gap=Math.min(44,(width-80)/5),start=s.cx-gap*2;
  ctx.strokeStyle='#d8e7c333';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(start,height*.7);ctx.lineTo(start+gap*4,height*.7);ctx.stroke();
  for(let i=0;i<5;i++){ctx.fillStyle=i<=s.form?s.accent:'#264b4d';ctx.beginPath();ctx.arc(start+i*gap,height*.7,i===s.form?6:4,0,TAU);ctx.fill();}
  ctx.font=`500 ${Math.min(16,width*.04)}px Outfit, sans-serif`;ctx.fillStyle='#dce5cd';
  textLines(ctx,s.reveal>.5?s.message:'Una nueva fuerza está despertando…',s.cx,height*.77,Math.min(520,width-48),23);
 }finally{ctx.restore();}
 return s;
}
