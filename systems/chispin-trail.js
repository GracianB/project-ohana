// ISLAS DEL RELÁMPAGO — Chispín's solo campaign chapter inside the expanded Claro.
// Own interaction gates, lightning coils, high-voltage rails, capacitor bounce pads,
// timed electrical arc gates, three story acts and the Titan of Thunder encounter.
// All permanent rewards use Chispín's existing per-hero save.
import {movePlatform,drawPlatformRail} from './moving-platforms.js';

const SAVE_KEY='chispin-trail-v1';
const FRAGMENT_PREFIX='chispin-fragment-';
export const CHISPIN_BOSS_ID='chispin-titan-v1';

export const CHISPIN_BEACONS=Object.freeze([
 Object.freeze({id:'chispin-spark',x:440,y:1074,label:'VOLTIO',need:0,line:'El transformador ruge con chispas de bienvenida.'}),
 Object.freeze({id:'chispin-pylon',x:1730,y:1090,label:'DINAMO',need:2,line:'Las líneas de alta tensión alimentan el santuario.'}),
 Object.freeze({id:'chispin-storm',x:3060,y:1084,label:'TORMENTA',need:4,line:'¡El Titán de Trueno se yergue en la cúspide!'})
]);

export const CHISPIN_FRAGMENTS=Object.freeze([
 Object.freeze({id:'a',x:530,y:1070}),
 Object.freeze({id:'b',x:840,y:826}),
 Object.freeze({id:'c',x:1490,y:1086}),
 Object.freeze({id:'d',x:2020,y:1084}),
 Object.freeze({id:'e',x:2550,y:1035}),
 Object.freeze({id:'f',x:2880,y:1080}),
 Object.freeze({id:'g',x:3360,y:1080}),
 Object.freeze({id:'h',x:3820,y:1075})
]);

export const CHISPIN_PADS=Object.freeze([
 Object.freeze({x:980,y:1134,force:15.5,color:'#ffe45a'}),
 Object.freeze({x:2140,y:1134,force:17.2,color:'#d59fff'}),
 Object.freeze({x:2780,y:1134,force:16.4,color:'#ffe45a'})
]);

export const CHISPIN_GATES=Object.freeze([
 Object.freeze({x:1520,y:1134,w:65,height:168,offset:0}),
 Object.freeze({x:2560,y:1134,w:65,height:168,offset:74}),
 Object.freeze({x:2840,y:1134,w:65,height:168,offset:143})
]);

export const CHISPIN_ACTS=Object.freeze([
 'EL GENERADOR DESPIERTA','LOS PILARES DE ARCO','EL CAÑÓN DE LA TORMENTA',
 'EL TITÁN DE TRUENO','EL SANTUARIO DORADO'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterChispinTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='chispin'||g.personalAdventureSolo===false){g.chispinTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(CHISPIN_BOSS_ID);
 const index=complete?CHISPIN_BEACONS.length:Math.max(0,CHISPIN_BEACONS.findIndex(b=>!saved.has(b.id)));
 const lifts=[
  {axis:'x',x:1020,y:934,span:300,period:280},
  {axis:'y',x:1550,y:1090,span:300,period:320},
  {axis:'x',x:2280,y:934,span:340,period:300},
  {axis:'y',x:2810,y:1054,span:420,period:350}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.75;
  const platform={x:motion.x,y:motion.y,w:190,h:22,_campaignLift:true};
  g.platforms.push(platform);return {platform,motion};
 });
 g.chispinTrail={
  index:index<0?3:index,complete,cleared,collected:saved,
  shards:CHISPIN_FRAGMENTS.filter(f=>saved.has(FRAGMENT_PREFIX+f.id)).length,
  lifts,padCooldown:0,gateCooldown:0,pulse:0,announcement:0,
  last:'',bossSummoned:false,gateStates:[],gateSilencedUntil:[0,0,0],
  abilityMarks:new Set(),signatureComplete:saved.has('chispin-combo-v1'),castPulse:0,castSlot:-1,intro:180
 };
 if(cleared)g.chispinTrail.complete=true;
}

export function chispinTrailPrompt(g){
 const s=g.chispinTrail,p=g.player;if(!s||!p||p.dead)return '';
 if(s.cleared&&inRange(p,3820,1134,115))return 'E · Sostener el Relámpago Dorado';
 if(s.cleared)return 'ISLAS DEL RELÁMPAGO · capítulo completado';
 if(s.complete)return 'ENFRENTA AL TITÁN DE TRUENO · derrota al coloso';
 const b=CHISPIN_BEACONS[s.index];if(!b||!inRange(p,b.x,b.y,115))return '';
 const missing=Math.max(0,b.need-s.shards);
 return missing?'Recoge '+missing+' bobina'+(missing>1?'s':'')+' para '+b.label:
  'E · sintonizar '+b.label.toLowerCase()+' ('+(s.index+1)+'/3)';
}

export function interactChispinTrail(g){
 const s=g.chispinTrail,p=g.player;
 if(!s||!p||p.dead)return false;
 if(s.cleared&&inRange(p,3820,1134,115)){
  p._chispinDanceT=120;p._chispinDanceAge=0;
  g.fx?.emit?.(3820,1074,{color:'#ffe45a',count:g.reduceMotion?8:32,size:4,star:true,life:45});
  g.nums?.add?.(3820,1050,'¡RELÁMPAGO DORADO!','#fff39e',true);
  return true;
 }
 if(s.complete)return false;
 const b=CHISPIN_BEACONS[s.index];
 if(!b||!inRange(p,b.x,b.y,115))return false;
 if(s.shards<b.need){
  g.nums?.add?.(b.x,b.y-55,'NECESITAS '+(b.need-s.shards)+' BOBINAS','#ffe45a',true);
  return true;
 }
 s.index++;s.pulse=110;s.announcement=150;s.last=b.label;
 p._chispinDanceT=75;p._chispinDanceAge=0;
 const changed=persist(g,b.id);
 if(changed){g.score=(g.score||0)+175;p.xp=(p.xp||0)+10;g.save?.();}
 if(s.index===CHISPIN_BEACONS.length){
  s.complete=true;s.last='TITÁN';
  if(persist(g,SAVE_KEY)){g.score=(g.score||0)+600;p.xp=(p.xp||0)+30;g.save?.();}
 }
 g.nums?.add?.(b.x,b.y-63,s.complete?'¡TITÁN DE TRUENO DESPIERTO!':b.label+' · '+s.index+'/3','#fff28a',true);
 return true;
}

export function chispinAbility(g,p,index){
 const s=g.chispinTrail;if(!s||p?.id!=='chispin'||!Number.isInteger(index)||index<0||index>2)return false;
 s.castPulse=40;s.castSlot=index;
 if(!s.signatureComplete){
  s.abilityMarks.add(index);
  if(s.abilityMarks.size===3){
   s.signatureComplete=true;
   if(persist(g,'chispin-combo-v1')){
    g.score=(g.score||0)+250;p.xp=(p.xp||0)+35;g.save?.();
   }
   s.pulse=120;
   g.nums?.add?.(p.x,p.y-65,'¡TRIPLE DESCARGA DE CHISPA!','#fff7b0',true);
  }
 }
 if(index===0){
  const i=CHISPIN_GATES.findIndex(gate=>Math.abs(p.x+p.w/2-(gate.x+gate.w/2))<250);
  if(i>=0){
   s.gateSilencedUntil[i]=(Number(g.t)||0)+150;
   g.nums?.add?.(CHISPIN_GATES[i].x,p.y-80,'¡ARCO CORTOCIRCUITADO!','#ffe45a',true);
  }
 }
 return true;
}

export function updateChispinTrail(g,hurt){
 const s=g.chispinTrail,p=g.player;if(!s||!p||p.dead)return;
 const tick=Number(g.t)||0;s.pulse=Math.max(0,s.pulse-1);s.announcement=Math.max(0,s.announcement-1);
 s.intro=Math.max(0,s.intro-1);s.castPulse=Math.max(0,s.castPulse-1);
 if(p._chispinDanceT>0){p._chispinDanceT--;p._chispinDanceAge=(p._chispinDanceAge||0)+1;}
 s.padCooldown=Math.max(0,s.padCooldown-1);s.gateCooldown=Math.max(0,s.gateCooldown-1);

 for(const lift of s.lifts)movePlatform(g,lift.platform,lift.motion);

 for(const shard of CHISPIN_FRAGMENTS){
  const key=FRAGMENT_PREFIX+shard.id;
  if(s.collected.has(key))continue;
  if(inRange(p,shard.x,shard.y,38)){
   s.collected.add(key);s.shards++;persist(g,key);
   p.xp=(p.xp||0)+4;g.score=(g.score||0)+35;s.pulse=35;
   g.fx?.emit?.(shard.x,shard.y,{color:'#ffe45a',count:g.reduceMotion?4:12,size:3,star:true,life:25});
   g.nums?.add?.(shard.x,shard.y-25,'BOBINA VOLTAICA '+s.shards+'/8','#fff291');
  }
 }

 for(const pad of CHISPIN_PADS){
  if(s.padCooldown<=0&&p.vy>=0&&p.x+p.w>pad.x-30&&p.x<pad.x+30&&Math.abs(p.y+p.h-pad.y)<22){
   p.vy=-pad.force;p.grounded=false;s.padCooldown=15;
   g.fx?.emit?.(pad.x,pad.y,{color:pad.color,count:g.reduceMotion?6:18,size:4,star:true,life:28});
   g.nums?.add?.(pad.x,pad.y-30,'¡IMPULSO DINAMO!','#fff494');
  }
 }

 s.gateStates=CHISPIN_GATES.map((gate,i)=>{
  const silenced=tick<(s.gateSilencedUntil[i]||0);
  const active=!silenced&&((Math.floor((tick+gate.offset)/48)%3)!==0);
  if(active&&s.gateCooldown<=0&&inRange(p,gate.x,gate.y-gate.height/2,48)){
   s.gateCooldown=30;
   hurt?.(g,p,14,{knockX:Math.sign(p.x-gate.x||-1)*7,knockY:-3,color:'#ffe45a'});
   g.nums?.add?.(gate.x,gate.y-gate.height/2,'¡DESCARGA DE ARCO!','#ff8a6a',true);
  }
  return {active,silenced,x:gate.x,y:gate.y,height:gate.height};
 });

 if(s.complete&&!s.cleared&&!s.bossSummoned&&p.x>3150){
  s.bossSummoned=true;
  g.spawnChispinBoss?.();
 }
}

export function drawChispinTrail(ctx,g,cam,t){
 const s=g.chispinTrail;if(!s)return;
 const reduced=g.reduceMotion||false;

 for(const lift of s.lifts)drawPlatformRail(ctx,lift.platform,lift.motion,cam);

 for(const shard of CHISPIN_FRAGMENTS){
  if(s.collected.has(FRAGMENT_PREFIX+shard.id))continue;
  const x=shard.x-cam.x,y=shard.y-cam.y+(reduced?0:Math.sin(t*0.09+shard.x)*5);
  ctx.save();ctx.translate(x,y);
  // Floating copper coil
  ctx.fillStyle='#d58a36';ctx.fillRect(-10,-8,20,16);
  ctx.strokeStyle='#ffe45a';ctx.lineWidth=2;
  for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*4,-8);ctx.lineTo(i*4,8);ctx.stroke();}
  // Spark aura
  if(!reduced){
   ctx.fillStyle='rgba(255,235,110,0.35)';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }

 for(const pad of CHISPIN_PADS){
  const x=pad.x-cam.x,y=pad.y-cam.y;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#362450';ctx.fillRect(-28,-6,56,8);
  ctx.fillStyle=pad.color;ctx.fillRect(-24,-10,48,5);
  ctx.strokeStyle='#fff8c0';ctx.lineWidth=1.5;ctx.strokeRect(-24,-10,48,5);
  ctx.restore();
 }

 for(const gate of s.gateStates||[]){
  const x=gate.x-cam.x,baseY=gate.y-cam.y;
  ctx.save();
  ctx.strokeStyle=gate.silenced?'#665478':gate.active?'#ffe45a':'#4b3b64';
  ctx.lineWidth=gate.active?3.5:1.5;
  ctx.beginPath();ctx.moveTo(x,baseY);ctx.lineTo(x,baseY-gate.height);ctx.stroke();
  if(gate.active&&!reduced){
   ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
   for(let k=0;k<3;k++){
    const gy=baseY-gate.height*(0.2+k*0.3)+(Math.sin(t*0.3+k)*6);
    ctx.beginPath();ctx.moveTo(x-14,gy);ctx.lineTo(x+14,gy);ctx.stroke();
   }
  }
  ctx.restore();
 }

 for(let i=0;i<CHISPIN_BEACONS.length;i++){
  const b=CHISPIN_BEACONS[i],x=b.x-cam.x,y=b.y-cam.y,active=i<=s.index;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle=active?'#ffe45a':'#45335e';
  ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-4,-44);ctx.lineTo(4,-44);ctx.lineTo(14,0);ctx.closePath();ctx.fill();
  ctx.fillStyle=active?'#fff9b8':'#26193b';ctx.beginPath();ctx.arc(0,-48,7,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }

 // Altar of the Golden Lightning at Sector 3 peak
 const ax=3820-cam.x,ay=1134-cam.y;
 ctx.save();ctx.translate(ax,ay);
 ctx.fillStyle='#3a2858';ctx.strokeStyle='#ffe45a';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.moveTo(-45,0);ctx.lineTo(-30,-50);ctx.lineTo(30,-50);ctx.lineTo(45,0);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=s.cleared?'#fff06a':'#6f5a8a';
 ctx.beginPath();ctx.arc(0,-65,16,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();
 if(s.cleared&&!reduced){
  ctx.strokeStyle='#ffe45a';ctx.lineWidth=1.8;
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2+(t*0.08);
   ctx.beginPath();ctx.moveTo(0,-65);ctx.lineTo(Math.cos(a)*28,-65+Math.sin(a)*28);ctx.stroke();
  }
 }
 ctx.restore();
}

export function chispinTrailSnapshot(g){
 const s=g.chispinTrail;if(!s)return null;
 return {
  index:s.index,shards:s.shards,complete:s.complete,cleared:s.cleared,
  last:s.last,lifts:s.lifts.map(l=>({axis:l.motion.axis,x:l.platform.x,y:l.platform.y,w:l.platform.w,h:l.platform.h}))
 };
}
