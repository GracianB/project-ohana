import {ABILITY_DEFS} from '../ability-catalog.js';
import {extraAbility,drawPowerEmblem} from '../evolution-attacks.js';
import {drawCharacter} from '../../characters/draw.js';
import {ROSTER} from '../../characters/roster.js';
import {CALIBRATED_HEIGHT} from '../../characters/visual-size.js';
import {EVOLUTION_CINEMA_PROFILES,evolutionMessage} from '../../characters/evolution.js';
import {cachedGradient} from '../canvas-gradient-cache.js';
import * as dinoCine from './dino.js';
import * as dragonCine from './dragon.js';
import * as pizzaCine from './pizza.js';
import * as fritaCine from './frita.js';
import {FAMILY_OWN_CINE} from './family-own.js';
import * as yomiCine from './yomi.js';

// Dino & Dragón, Pizza & Frita: these heroes play their OWN four-act metamorphosis in the real
// game (not only in a preview): the in-game evolution stage calls this shared
// entry point, so routing here reaches every caller without touching the
// stage director. Text/unlock overlay below stays shared and readable.
// V463: Kilo, Stitcho, Chispín y Cuerno también tienen su metamorfosis propia (family-own.js).
export const OWN_EVOLUTION_CINE=Object.freeze({dino:dinoCine,dragon:dragonCine,pizza:pizzaCine,frita:fritaCine,yomi:yomiCine,...FAMILY_OWN_CINE});
// Yomi IA (V464): su metamorfosis de cuatro actos (pregunta · lectura · compilación · despertar).

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
  _introForceCanvas:true,reduceMotion:reduced,
  _powerPerformance:t>=2.2?{index:form===4?5:4,start:132}:null};
 ctx.save();ctx.globalAlpha*=alpha;drawCharacter(ctx,p,{x:0,y:0},reduced?40:t*60,{reduceMotion:reduced});ctx.restore();
}

function textLines(ctx,text,x,y,width,lineHeight){
 const words=String(text||'').split(' ');let line='',row=0;
 for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){ctx.fillText(line,x,y+row++*lineHeight);line=word;}else line=next;}
 if(line)ctx.fillText(line,x,y+row*lineHeight);
}

// Reduced motion shows ONE calm frame. It is painted once into an offscreen
// canvas and blitted, so the browser rasterizer can never make it shimmer.
const REDUCED_STILLS=new Map();
function reducedStill(ctx,id,form,width,height,paint){
 const make=(w,h)=>typeof OffscreenCanvas==='function'?new OffscreenCanvas(w,h):(typeof document!=='undefined'?Object.assign(document.createElement('canvas'),{width:w,height:h}):null);
 const m=typeof ctx.getTransform==='function'?ctx.getTransform():null;
 const sc=m?Math.max(1,Math.min(3,Math.hypot(m.a,m.b)||1)):1;
 const key=id+':'+form+':'+width+'x'+height+'@'+sc.toFixed(2);
 if(REDUCED_STILLS.has(key))return REDUCED_STILLS.get(key);
 const c=make(Math.max(1,Math.round(width*sc)),Math.max(1,Math.round(height*sc)));
 const g=c&&c.getContext('2d');if(!g)return null;
 g.scale(sc,sc);paint(g);
 if(REDUCED_STILLS.size>=8)REDUCED_STILLS.delete(REDUCED_STILLS.keys().next().value);
 REDUCED_STILLS.set(key,c);return c;
}

function drawUnlockCard(ctx,def,s,width,height,alpha){
 const unlock=s.form<3?ABILITY_DEFS[def.abilities[s.form]]:extraAbility(s.id,s.form+1);
 if(!unlock||alpha<=0)return;
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.globalAlpha=alpha;ctx.fillStyle='#071e2c';const cw=Math.min(430,width-32),cy=height*.89;
 ctx.fillRect(s.cx-cw/2,cy-20,cw,40);ctx.strokeStyle=s.accent;ctx.lineWidth=1;ctx.strokeRect(s.cx-cw/2,cy-20,cw,40);
 ctx.fillStyle=s.accent;ctx.font='700 '+Math.min(15,width*.034)+'px Outfit, sans-serif';ctx.fillText('NUEVO PODER · '+unlock.key+' · '+unlock.name,s.cx,cy);
 ctx.restore();
}

export function drawEvolutionPresentation(ctx,width,height,id,evo,time,reduced=false){
 const s=evolutionPresentation(id,evo,width,height,reduced?3.5:time,reduced),def=ROSTER.find(r=>r.id===s.id);
 const profile=EVOLUTION_CINEMA_PROFILES[s.id];
 const own=OWN_EVOLUTION_CINE[s.id];
 if(own){
  const raw=reduced?own.EVO_CINE_DURATION:Math.max(0,Math.min(own.EVO_CINE_DURATION,Number(time)||0));
  const paint=c=>{
   c.save();c.beginPath();
   try{
    own.drawEvoCine(c,width,height,raw,s.form,s.form+1,{reducedMotion:reduced});
    drawUnlockCard(c,def,s,width,height,reduced?1:Math.max(0,Math.min(1,(raw-3.4)/.4)));
   }finally{c.restore();}
  };
  const still=reduced&&reducedStill(ctx,s.id,s.form,width,height,paint);
  // The still is not opaque for every hero (Chispín/Cuerno skies use alpha):
  // clear first so the reduced frame never composites over the previous one.
  if(still){ctx.clearRect(0,0,width,height);ctx.drawImage(still,0,0,width,height);}else paint(ctx);
  return {...s,cinematic:s.id,act:own.evoCinePhase?own.evoCinePhase(raw):''};
 }
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
  // Light opens behind the changing silhouette, never over its face.
  ctx.save();ctx.translate(s.cx,s.foot-s.target*.45);ctx.globalAlpha=.08+s.reveal*.12;ctx.fillStyle=s.accent;
  for(let i=0;i<12;i++){const a=i*TAU/12+(reduced?0:s.t*.08);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*width,Math.sin(a)*height);ctx.lineTo(Math.cos(a+.07)*width,Math.sin(a+.07)*height);ctx.fill();}ctx.restore();
  ctx.globalAlpha=.12+s.reveal*.13;
  motif(ctx,s.id,s.cx,s.foot-s.target*.5,s.target*.77,reduced?0:s.t,s.accent,reduced);
  ctx.globalAlpha=1;
  ctx.fillStyle='#06192366';ctx.beginPath();ctx.ellipse(s.cx,s.foot+8,s.target*.44,s.target*.055,0,0,TAU);ctx.fill();
  const oldHeight=s.target*CALIBRATED_HEIGHT[s.form-1]/CALIBRATED_HEIGHT[s.form];
  actor(ctx,def,s.form-1,s.cx,s.foot-s.lift,oldHeight,s.oldAlpha,s.pose,s.t,reduced);
  actor(ctx,def,s.form,s.cx,s.foot-s.lift,s.target,s.newAlpha,s.pose,s.t,reduced);
  if(s.t>2.2&&s.reveal>.8){
   const age=s.t-2.2,reach=Math.min(width*.32,s.target*.85),strength=Math.sin(Math.PI*Math.min(1,age/1.8));
   ctx.save();ctx.globalAlpha=.7*strength;
   for(let side=-1;side<=1;side+=2)for(let i=0;i<3+s.form;i++){
    const phase=(age*.65+i*.16)%1,px=s.cx+side*(s.target*.3+phase*reach),py=s.foot-s.target*.4-Math.sin(phase*Math.PI)*s.target*.15;
    if(reduced)drawPowerEmblem(ctx,s.id,s.cx+side*(s.target*.6+i*9),s.foot-s.target*.4,5,0);
    else drawPowerEmblem(ctx,s.id,px,py,6+s.form,age*60+i*5);
   }ctx.restore();
  }
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
  const unlock=s.form<3?ABILITY_DEFS[def.abilities[s.form]]:extraAbility(s.id,s.form+1);
  if(unlock&&s.reveal>.5){
   ctx.globalAlpha=s.reveal;ctx.fillStyle='#071e2c';const cw=Math.min(430,width-32),cy=height*.89;
   ctx.fillRect(s.cx-cw/2,cy-20,cw,40);ctx.strokeStyle=s.accent;ctx.lineWidth=1;ctx.strokeRect(s.cx-cw/2,cy-20,cw,40);
   ctx.fillStyle=s.accent;ctx.font='700 '+Math.min(15,width*.034)+'px Outfit, sans-serif';ctx.fillText('NUEVO PODER · '+unlock.key+' · '+unlock.name,s.cx,cy);
  }
 }finally{ctx.restore();}
 return s;
}
