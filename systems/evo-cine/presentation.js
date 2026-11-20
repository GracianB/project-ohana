import {ABILITY_DEFS} from '../ability-catalog.js';
import {extraAbility,drawPowerEmblem} from '../evolution-attacks.js';
import {drawCharacter} from '../../characters/draw.js';
import {NACAR_NEON} from '../../characters/art/nacar.js';
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
// La guardiana Yomi tiene su propio rito. IA toma forma en el escenario digital.

const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{const k=clamp(x);return k*k*(3-2*k);};
const TAU=Math.PI*2;
const POSES={kilo:'victory',stitcho:'attack',chispin:'attack',cat:'victory',dragon:'glide',dino:'attack',frita:'jump',pizza:'jump',yomi:'attack',cuerno:'victory',nacar:'glide',ia:'victory'};

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

const NACAR_REVEAL_WATER=[
 ['#113c55','#176f74'],
 ['#122d47','#177187'],
 ['#143c47','#426e63'],
 ['#2e285e','#74538d'],
 ['#151d40','#344b77'],
];

function drawNacarRevealWater(c,w,h,s,reduced){
 const t=reduced?0:s.t;
 c.save();
 for(let i=0;i<6;i++){
  const x=w*(.1+i*.159)+Math.sin(t*.95+i)*w*.035;
  c.fillStyle=i%2?'#baf5e813':'#f4d4ed0e';
  c.beginPath();c.moveTo(x-12,0);c.lineTo(x+22,0);
  c.lineTo(x+w*.27,h);c.lineTo(x+w*.13,h);c.fill();
 }
 for(let i=0;i<16;i++){
  const phase=((i*.17+(reduced?0:t*.22))%1);
  const x=w*(.1+(i*137%83)/100)+Math.sin(phase*TAU)*w*.017;
  c.strokeStyle=i%3?'#c0f2df50':'#ffe2b87a';c.lineWidth=1.2;
  c.beginPath();c.arc(x,h*(.79-phase*.51),2+i%5,0,TAU);c.stroke();
 }
 const [ink,highlight]=NACAR_NEON[s.reveal<.5?s.form-1:s.form];
 const base=Math.min(w,h);
 // The shore edge, reef branches, aurora weeds and abyssal spires follow the reveal's depth.
 for(const side of [-1,1]){
  for(let i=0;i<5;i++){
   const x=w*.5+side*w*(.27+i*.046),y=h*.93+i*base*.017;
   const len=(.12+((i*3)%5)*.031+s.form*.013)*base;
   const lean=side*(i*.03+.02)*base+Math.sin(t*.85+i)*base*.014;
   c.strokeStyle=i%2?ink:highlight;c.globalAlpha=.12+i*.012;c.lineWidth=Math.max(1.5,base*(.006+i*.001));
   c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+lean*.2,y-len*.52,x+lean,y-len);c.stroke();
   if(s.form>=2)for(let j=0;j<3;j++){
    const sy=y-len*(.36+j*.17),sx=x+lean*(.25+j*.21),sign=j%2?side:-side;
    c.lineWidth=Math.max(1.2,base*.004);
    c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx+sign*base*.037,sy-base*.012,sx+sign*base*.052,sy-base*.05);c.stroke();
   }
  }
 }
 c.globalAlpha=.14+s.reveal*.13;
 for(let i=0;i<3;i++){
  const spread=reduced?(i+1)*.35:((t*.42+i*.32)%1);
  c.strokeStyle=i%2?highlight:ink;c.lineWidth=1.5;
  c.beginPath();c.ellipse(s.cx,s.foot-s.target*.18+spread*s.target*.35,
   s.target*(.48+spread*.65),s.target*(.11+spread*.14),0,0,TAU);c.stroke();
 }

 c.restore();
}

function drawNacarRevealSpark(c,x,y,r,form,phase){
 const [ink,light]=NACAR_NEON[form];
 c.strokeStyle=light;c.lineWidth=1.1;
 if(form<3){
  c.beginPath();c.arc(x,y,r*.55,0,TAU);c.stroke();
  c.fillStyle=ink;c.beginPath();c.arc(x-r*.18,y-r*.18,r*.13,0,TAU);c.fill();
  return;
 }
 c.save();c.translate(x,y);c.rotate(phase);
 c.fillStyle=ink;c.beginPath();
 for(let i=0;i<8;i++){
  const a=i*TAU/8,reach=r*(i%2?.29:.84);
  c.lineTo(Math.cos(a)*reach,Math.sin(a)*reach);
 }
 c.closePath();c.fill();c.restore();
}

const IA_CINE_NODES=[[0,-.78],[.72,-.48],[.95,.12],[.57,.68],[-.57,.68],[-.95,.12],[-.72,-.48]];
const IA_LINKS=[[0,1],[0,6],[1,2],[1,3],[2,3],[3,4],[4,5],[4,6],[5,6]];
const IA_STARS=['#fda68d','#8bd7fd','#ffe291','#d4b4ff','#ffae76','#9ae2a8','#fcd29a','#fb9391','#f1bce5','#76ffe0'];

function drawIAReveal(c,w,h,s,reduced){
 const t=reduced?0:s.t;
 const scale=Math.min(w,h)*.35, cy=s.foot-s.target*.54;
 const live=reduced?1:ease(s.t/1.65);
 c.save();c.translate(w*.5,cy);
 c.lineWidth=1.3;
 if(s.form===1){
  // Eco: a pulse leaves either side and returns across the same receiver.
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const phase=reduced?(i+1)/5:(t*.48+i*.25)%1;
   const r=(.21+phase*.68)*scale,a=side===1?0:Math.PI;
   c.strokeStyle=i%2?'#ec9c7e':'#ffd787';c.globalAlpha=(1-phase)*.58;
   c.beginPath();c.arc(side*scale*.56,0,r,a-.64,a+.64);c.stroke();
  }
 }else if(s.form===2){
  const points=IA_CINE_NODES.map(([x,y])=>[x*scale,y*scale*.58]);
  for(const [a,b] of IA_LINKS){
   const [x,y]=points[a],[xx,yy]=points[b],phase=reduced?.52:(t*.39+a*.12+b*.08)%1;
   c.strokeStyle='#9ffaff';c.globalAlpha=live*.53;
   c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();
   c.fillStyle='#ddffed';c.fillRect(x+(xx-x)*phase-2,y+(yy-y)*phase-2,4,4);
  }
  for(const [x,y] of points){
   c.globalAlpha=live*.83;c.fillStyle='#b4fff1';
   c.beginPath();c.arc(x,y,3.4,0,TAU);c.fill();
  }
 }else if(s.form===3){
  // Oráculo: a lens opens with a visible iris and an off-axis sightline.
  c.strokeStyle='#e2b3fc';c.globalAlpha=live*.52;c.beginPath();c.ellipse(0,0,scale,scale*.52,-.17,0,TAU);c.stroke();
  c.save();c.rotate(-.24+Math.sin(t*.9)*.27);
  c.strokeStyle='#acf1fd';c.beginPath();c.ellipse(0,0,scale*.37,scale*.66,0,0,TAU);c.stroke();
  for(let i=0;i<12;i++){
   const a=i*TAU/12;
   c.beginPath();c.moveTo(Math.cos(a)*scale*.78,Math.sin(a)*scale*.54);
   c.lineTo(Math.cos(a)*scale*.85,Math.sin(a)*scale*.59);c.stroke();
  }
  c.restore();
 }else{
  const points=IA_STARS.map((_,i)=>{
   const a=t*.09+(i+.5)*TAU/10;
   const r=scale*(i%2?.88:.98);
   return [Math.cos(a)*r,Math.sin(a)*r*.53];
  });
  c.strokeStyle='#dcbd9a';c.globalAlpha=live*.43;
  c.beginPath();for(const [x,y] of points)c.lineTo(x,y);c.closePath();c.stroke();
  points.forEach(([x,y],i)=>{
   c.globalAlpha=live*.88;c.fillStyle=IA_STARS[i];
   c.beginPath();c.moveTo(x-5,y);c.lineTo(x,y-5);c.lineTo(x+5,y);c.lineTo(x,y+5);c.closePath();c.fill();
  });
 }
 c.restore();
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
  const ocean=s.id==='nacar'?NACAR_REVEAL_WATER[s.form]:null;
  const bg=cachedGradient(ctx,`evolution-stage:${s.id}:${ocean?s.form:0}:${height}`,()=>{
   const g=ctx.createLinearGradient(0,0,0,height);g.addColorStop(0,ocean?.[0]||profile.bg);g.addColorStop(.65,ocean?.[1]||(s.id==='ia'?'#26264f':'#16373d'));g.addColorStop(1,'#091d28');return g;
  });ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  if(ocean)drawNacarRevealWater(ctx,width,height,s,reduced);
  if(s.id==='ia')drawIAReveal(ctx,width,height,s,reduced);
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
  if(s.id!=='ia')motif(ctx,s.id,s.cx,s.foot-s.target*.5,s.target*.77,reduced?0:s.t,s.accent,reduced);
  ctx.globalAlpha=1;
  ctx.fillStyle='#06192366';ctx.beginPath();ctx.ellipse(s.cx,s.foot+8,s.target*.44,s.target*.055,0,0,TAU);ctx.fill();
  const oldHeight=s.target*CALIBRATED_HEIGHT[s.form-1]/CALIBRATED_HEIGHT[s.form];
  actor(ctx,def,s.form-1,s.cx,s.foot-s.lift,oldHeight,s.oldAlpha,s.pose,s.t,reduced);
  actor(ctx,def,s.form,s.cx,s.foot-s.lift,s.target,s.newAlpha,s.pose,s.t,reduced);
  if(s.id!=='ia'&&s.t>2.2&&s.reveal>.8){
   const age=s.t-2.2,reach=Math.min(width*.32,s.target*.85),strength=Math.sin(Math.PI*Math.min(1,age/1.8));
   ctx.save();ctx.globalAlpha=.7*strength;
   for(let side=-1;side<=1;side+=2)for(let i=0;i<3+s.form;i++){
    const phase=(age*.65+i*.16)%1,px=s.cx+side*(s.target*.3+phase*reach),py=s.foot-s.target*.4-Math.sin(phase*Math.PI)*s.target*.15;
    if(ocean){
     const xx=reduced?s.cx+side*(s.target*.6+i*9):px;
     drawNacarRevealSpark(ctx,xx,reduced?s.foot-s.target*.4:py,6+s.form,s.form,reduced?0:phase);
    }else if(reduced)drawPowerEmblem(ctx,s.id,s.cx+side*(s.target*.6+i*9),s.foot-s.target*.4,5,0);
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
