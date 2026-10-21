// SANTUARIO LUNAR — Michicornio's solo campaign chapter inside the expanded Claro.
// Own interaction gates, astral bells, moving crystal rails, dream bounce pads,
// swirling mist gates, three acts of celestial awakening and the Astral Feline Spirit.
// All permanent rewards preserve the existing cat per-hero save.
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {MICHI_BOSS_ID} from './michi-boss.js';

const SAVE_KEY='michi-trail-v1';
const FRAGMENT_PREFIX='michi-essence-';

export const MICHI_BELLS=Object.freeze([
 Object.freeze({id:'michi-echo',x:440,y:1074,label:'ECO',need:0,line:'La campana de cuarzo vibra con los recuerdos de la noche.'}),
 Object.freeze({id:'michi-star',x:1720,y:1090,label:'ASTRAL',need:2,line:'Los puentes del firmamento se iluminan con luz de estrellas.'}),
 Object.freeze({id:'michi-eclipse',x:3080,y:1084,label:'ECLIPSE',need:4,line:'¡El Oráculo Medusaluna despierta en el santuario de la luna!'})
]);

export const MICHI_ESSENCES=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:820,y:830}),
 Object.freeze({id:'c',x:1480,y:1085}),
 Object.freeze({id:'d',x:2020,y:1080}),
 Object.freeze({id:'e',x:2520,y:1035}),
 Object.freeze({id:'f',x:2870,y:1075}),
 Object.freeze({id:'g',x:3350,y:1075}),
 Object.freeze({id:'h',x:3780,y:1075})
]);

export const MICHI_PADS=Object.freeze([
 Object.freeze({x:970,y:1134,force:15.8,color:'#f7c4ff'}),
 Object.freeze({x:2130,y:1134,force:17.0,color:'#e0b8ff'}),
 Object.freeze({x:2790,y:1134,force:16.5,color:'#f7c4ff'})
]);

export const MICHI_GATES=Object.freeze([
 Object.freeze({x:1500,y:1134,w:65,height:170,offset:0}),
 Object.freeze({x:2550,y:1134,w:65,height:170,offset:68}),
 Object.freeze({x:2830,y:1134,w:65,height:170,offset:136})
]);

export const MICHI_ACTS=Object.freeze([
 'LA CAVERNA DE LOS ECOS','LOS PUENTES DEL FIRMAMENTO','EL LABERINTO DE LOS SUEÑOS',
 'EL ORÁCULO MEDUSALUNA','LA LUNA SOÑADORA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterMichiTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='cat'||g.personalAdventureSolo===false){g.michiTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(MICHI_BOSS_ID);
 const index=complete?MICHI_BELLS.length:Math.max(0,MICHI_BELLS.findIndex(b=>!saved.has(b.id)));
 const lifts=[
  {axis:'x',x:1000,y:940,span:300,period:280},
  {axis:'y',x:1520,y:1080,span:300,period:320},
  {axis:'x',x:2250,y:920,span:340,period:300},
  {axis:'y',x:2800,y:1040,span:420,period:350}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.75;
  const platform={x:motion.x,y:motion.y,w:190,h:22,_campaignLift:true};
  g.platforms.push(platform);return {platform,motion};
 });
 g.michiTrail={
  index:index<0?3:index,complete,cleared,collected:saved,
  shards:MICHI_ESSENCES.filter(f=>saved.has(FRAGMENT_PREFIX+f.id)).length,
  lifts,padCooldown:0,gateCooldown:0,pulse:0,announcement:0,
  last:'',bossSummoned:false,gateStates:[],gateSilencedUntil:[0,0,0],
  abilityMarks:new Set(),signatureComplete:saved.has('michi-combo-v1'),castPulse:0,castSlot:-1,intro:180
 };
 if(cleared)g.michiTrail.complete=true;
}

export function michiTrailPrompt(g){
 const s=g.michiTrail,p=g.player;if(!s||!p||p.dead)return '';
 if(s.cleared&&inRange(p,3780,1134,115))return 'E · Despertar la Luna Soñadora';
 if(s.cleared)return 'SANTUARIO DE MICHICORNIO · capítulo completado';
 if(s.complete)return 'ENFRENTA AL ORÁCULO MEDUSALUNA · despierta a la bestia';
 const b=MICHI_BELLS[s.index];if(!b||!inRange(p,b.x,b.y,115))return '';
 const missing=Math.max(0,b.need-s.shards);
 return missing?'Recoge '+missing+' esencia'+(missing>1?'s':'')+' de luna para '+b.label:
  'E · sintonizar campana '+b.label.toLowerCase()+' ('+(s.index+1)+'/3)';
}

export function interactMichiTrail(g){
 const s=g.michiTrail,p=g.player;
 if(!s||!p||p.dead)return false;
 if(s.cleared&&inRange(p,3780,1134,115)){
  p._michiDanceT=120;p._michiDanceAge=0;
  g.fx?.emit?.(3780,1074,{color:'#e5c2ff',count:g.reduceMotion?8:32,size:4,star:true,life:45});
  g.nums?.add?.(3780,1050,'¡LUNA SOÑADORA!','#f5d2ff',true);
  return true;
 }
 if(s.complete)return false;
 const b=MICHI_BELLS[s.index];
 if(!b||!inRange(p,b.x,b.y,115))return false;
 if(s.shards<b.need){
  g.nums?.add?.(b.x,b.y-55,'NECESITAS '+(b.need-s.shards)+' ESENCIAS','#ffb6e4',true);
  return true;
 }
 s.index++;s.pulse=110;s.announcement=150;s.last=b.label;
 p._michiDanceT=75;p._michiDanceAge=0;
 const changed=persist(g,b.id);
 if(changed){g.score=(g.score||0)+175;p.xp=(p.xp||0)+10;g.save?.();}
 if(s.index===MICHI_BELLS.length){
  s.complete=true;s.last='ESPÍRITU ASTRAL';
  if(persist(g,SAVE_KEY)){g.score=(g.score||0)+600;p.xp=(p.xp||0)+30;g.save?.();}
 }
 g.nums?.add?.(b.x,b.y-63,s.complete?'¡ORÁCULO MEDUSALUNA DESPIERTO!':b.label+' · '+s.index+'/3','#f7d2ff',true);
 return true;
}

export function michiAbility(g,p,index){
 const s=g.michiTrail;if(!s||p?.id!=='cat'||!Number.isInteger(index)||index<0||index>2)return false;
 s.castPulse=40;s.castSlot=index;
 if(!s.signatureComplete){
  s.abilityMarks.add(index);
  if(s.abilityMarks.size===3){
   s.signatureComplete=true;
   if(persist(g,'michi-combo-v1')){
    g.score=(g.score||0)+250;p.xp=(p.xp||0)+35;g.save?.();
   }
   s.pulse=120;
   g.nums?.add?.(p.x,p.y-65,'¡TRINIDAD ASTRAL DE MICHICORNIO!','#ffd6fa',true);
  }
 }
 if(index===0||index===1){
  const i=MICHI_GATES.findIndex(gate=>Math.abs(p.x+p.w/2-(gate.x+gate.w/2))<250);
  if(i>=0){
   s.gateSilencedUntil[i]=(Number(g.t)||0)+150;
   g.nums?.add?.(MICHI_GATES[i].x,p.y-80,'¡NIEBLA DISIPADA!','#ffb6e4',true);
  }
 }
 return true;
}

export function updateMichiTrail(g,hurt){
 const s=g.michiTrail,p=g.player;if(!s||!p||p.dead)return;
 const tick=Number(g.t)||0;s.pulse=Math.max(0,s.pulse-1);s.announcement=Math.max(0,s.announcement-1);
 s.intro=Math.max(0,s.intro-1);s.castPulse=Math.max(0,s.castPulse-1);
 if(p._michiDanceT>0){p._michiDanceT--;p._michiDanceAge=(p._michiDanceAge||0)+1;}
 s.padCooldown=Math.max(0,s.padCooldown-1);s.gateCooldown=Math.max(0,s.gateCooldown-1);

 for(const lift of s.lifts)movePlatform(g,lift.platform,lift.motion);

 for(const shard of MICHI_ESSENCES){
  const key=FRAGMENT_PREFIX+shard.id;
  if(s.collected.has(key))continue;
  if(inRange(p,shard.x,shard.y,38)){
   s.collected.add(key);s.shards++;persist(g,key);
   p.xp=(p.xp||0)+4;g.score=(g.score||0)+35;s.pulse=35;
   g.fx?.emit?.(shard.x,shard.y,{color:'#ffb6e4',count:g.reduceMotion?4:12,size:3,star:true,life:25});
   g.nums?.add?.(shard.x,shard.y-25,'ESENCIA DE LUNA '+s.shards+'/8','#ffc8f0');
  }
 }

 for(const pad of MICHI_PADS){
  if(s.padCooldown<=0&&p.vy>=0&&p.x+p.w>pad.x-30&&p.x<pad.x+30&&Math.abs(p.y+p.h-pad.y)<22){
   p.vy=-pad.force;p.grounded=false;s.padCooldown=15;
   g.fx?.emit?.(pad.x,pad.y,{color:pad.color,count:g.reduceMotion?6:18,size:4,star:true,life:28});
   g.nums?.add?.(pad.x,pad.y-30,'¡IMPULSO ONÍRICO!','#f5c8ff');
  }
 }

 s.gateStates=MICHI_GATES.map((gate,i)=>{
  const silenced=tick<(s.gateSilencedUntil[i]||0);
  const active=!silenced&&((Math.floor((tick+gate.offset)/48)%3)!==0);
  if(active&&s.gateCooldown<=0&&inRange(p,gate.x,gate.y-gate.height/2,48)){
   s.gateCooldown=30;
   hurt?.(g,p,14,{knockX:Math.sign(p.x-gate.x||-1)*7,knockY:-3,color:'#e5c2ff'});
   g.nums?.add?.(gate.x,gate.y-gate.height/2,'¡NIEBLA ONÍRICA!','#ff8ad4',true);
  }
  return {active,silenced,x:gate.x,y:gate.y,height:gate.height};
 });

 if(s.complete&&!s.cleared&&!s.bossSummoned&&p.x>3150){
  s.bossSummoned=true;
  g.spawnMichiBoss?.();
 }

 if(!s.cleared&&(g.clearedEncounters?.hub||[]).includes(MICHI_BOSS_ID)){
  s.cleared=true;s.complete=true;
 }
}

export function drawMichiTrail(ctx,g,cam,t){
 const s=g.michiTrail;if(!s)return;
 const reduced=g.reduceMotion||false;

 for(const lift of s.lifts)drawPlatformRail(ctx,lift.platform,lift.motion,cam);

 for(const shard of MICHI_ESSENCES){
  if(s.collected.has(FRAGMENT_PREFIX+shard.id))continue;
  const x=shard.x-cam.x,y=shard.y-cam.y+(reduced?0:Math.sin(t*0.09+shard.x)*5);
  ctx.save();ctx.translate(x,y);
  // Floating lunar crescent orb
  ctx.fillStyle='#f0c4ff';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#27133b';ctx.beginPath();ctx.arc(3,-3,8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,10,Math.PI*0.2,Math.PI*1.5);ctx.stroke();
  // Dream glow aura
  if(!reduced){
   ctx.fillStyle='rgba(255,182,228,0.35)';ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }

 for(const pad of MICHI_PADS){
  const x=pad.x-cam.x,y=pad.y-cam.y;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#2a1738';ctx.fillRect(-28,-6,56,8);
  ctx.fillStyle=pad.color;ctx.fillRect(-24,-10,48,5);
  ctx.strokeStyle='#fff0fa';ctx.lineWidth=1.5;ctx.strokeRect(-24,-10,48,5);
  ctx.restore();
 }

 for(const gate of s.gateStates||[]){
  const x=gate.x-cam.x,baseY=gate.y-cam.y;
  ctx.save();
  ctx.strokeStyle=gate.silenced?'#534363':gate.active?'#e5a8ff':'#3e2a52';
  ctx.lineWidth=gate.active?3.5:1.5;
  ctx.beginPath();ctx.moveTo(x,baseY);ctx.lineTo(x,baseY-gate.height);ctx.stroke();
  if(gate.active&&!reduced){
   ctx.fillStyle='rgba(235,182,255,0.4)';
   for(let k=0;k<3;k++){
    const gy=baseY-gate.height*(0.2+k*0.3)+(Math.sin(t*0.25+k)*8);
    ctx.beginPath();ctx.arc(x,gy,8,0,Math.PI*2);ctx.fill();
   }
  }
  ctx.restore();
 }

 for(let i=0;i<MICHI_BELLS.length;i++){
  const b=MICHI_BELLS[i],x=b.x-cam.x,y=b.y-cam.y,active=i<=s.index;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle=active?'#e5b6ff':'#3d2850';
  ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-6,-42);ctx.lineTo(6,-42);ctx.lineTo(14,0);ctx.closePath();ctx.fill();
  ctx.fillStyle=active?'#fff0fc':'#241535';ctx.beginPath();ctx.arc(0,-46,7,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }

 // Altar of the Sleeping Moon (Luna Soñadora) at Sector 3
 const ax=3780-cam.x,ay=1134-cam.y;
 ctx.save();ctx.translate(ax,ay);
 ctx.fillStyle='#321b47';ctx.strokeStyle='#e5b6ff';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(-45,0);ctx.lineTo(-30,-50);ctx.lineTo(30,-50);ctx.lineTo(45,0);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=s.cleared?'#f5caff':'#644b7d';
 ctx.beginPath();ctx.arc(0,-65,16,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();
 if(s.cleared&&!reduced){
  ctx.strokeStyle='#f8d0ff';ctx.lineWidth=1.8;
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2+(t*0.07);
   ctx.beginPath();ctx.moveTo(0,-65);ctx.lineTo(Math.cos(a)*28,-65+Math.sin(a)*28);ctx.stroke();
  }
 }
 ctx.restore();
}

export function michiTrailSnapshot(g){
 const s=g.michiTrail;if(!s)return null;
 return {
  index:s.index,shards:s.shards,complete:s.complete,cleared:s.cleared,
  last:s.last,lifts:s.lifts.map(l=>({axis:l.motion.axis,x:l.platform.x,y:l.platform.y,w:l.platform.w,h:l.platform.h}))
 };
}
