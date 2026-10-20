// ARCHIPIÉLAGO DEL CAOS — Stitcho's solo campaign chapter inside the expanded Claro.
// Own interaction gates, energy shards, transport rails, spring mechanics,
// timed electrical hazards, three story acts and a distinct final encounter.
// All permanent rewards use Stitcho's existing per-hero save, never Kilo's.
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {STITCHO_BOSS_ID} from './stitcho-boss.js';

const SAVE_KEY='stitcho-trail-v1';
const FRAGMENT_PREFIX='stitcho-fragment-';

export const STITCHO_BEACONS=Object.freeze([
 Object.freeze({id:'stitcho-spark',x:430,y:1074,label:'CHISPA',need:0,line:'El motor alienígena vuelve a latir.'}),
 Object.freeze({id:'stitcho-echo',x:1720,y:1090,label:'ECO',need:2,line:'Los puentes responden a tu energía.'}),
 Object.freeze({id:'stitcho-star',x:3050,y:1084,label:'ESTRELLA',need:4,line:'¡El Núcleo Glitch ha despertado!'})
]);

export const STITCHO_FRAGMENTS=Object.freeze([
 Object.freeze({id:'a',x:540,y:1070}),
 Object.freeze({id:'b',x:830,y:836}),
 Object.freeze({id:'c',x:1480,y:1086}),
 Object.freeze({id:'d',x:2000,y:1084}),
 Object.freeze({id:'e',x:2540,y:1035}),
 Object.freeze({id:'f',x:2870,y:1080}),
 Object.freeze({id:'g',x:3350,y:1080}),
 Object.freeze({id:'h',x:3800,y:1075})
]);

export const STITCHO_PADS=Object.freeze([
 Object.freeze({x:990,y:1134,force:15.2,color:'#8defff'}),
 Object.freeze({x:2150,y:1134,force:17,color:'#b8a5ff'}),
 Object.freeze({x:2790,y:1134,force:16.1,color:'#8defff'})
]);

export const STITCHO_GATES=Object.freeze([
 Object.freeze({x:1530,y:1134,w:65,height:168,offset:0}),
 Object.freeze({x:2570,y:1134,w:65,height:168,offset:74}),
 Object.freeze({x:2850,y:1134,w:65,height:168,offset:143})
]);

export const STITCHO_ACTS=Object.freeze([
 'EL MOTOR DESPIERTA','LAS AGUAS IMPOSIBLES','EL CORREDOR ELÉCTRICO',
 'EL NÚCLEO GLITCH','LA ISLA RECOBRADA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read=(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterStitchoTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='stitcho'||g.personalAdventureSolo===false){g.stitchoTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(STITCHO_BOSS_ID);
 const index=complete?STITCHO_BEACONS.length:Math.max(0,STITCHO_BEACONS.findIndex(b=>!saved.has(b.id)));
 const lifts=[
  {axis:'x',x:1030,y:934,span:300,period:280},
  {axis:'y',x:1560,y:1090,span:305,period:330},
  {axis:'x',x:2290,y:934,span:340,period:300},
  {axis:'y',x:2820,y:1054,span:430,period:350}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.75;
  const platform={x:motion.x,y:motion.y,w:190,h:22,_campaignLift:true};
  g.platforms.push(platform);return {platform,motion};
 });
 g.stitchoTrail={
  index:index<0?3:index,complete,cleared,collected:saved,
  shards:STITCHO_FRAGMENTS.filter(f=>saved.has(FRAGMENT_PREFIX+f.id)).length,
  lifts,padCooldown:0,gateCooldown:0,pulse:0,announcement:0,
  last:'',bossSummoned:false,gateStates:[],gateSilencedUntil:[0,0,0],
  abilityMarks:new Set(),signatureComplete:saved.has('stitcho-combo-v1'),castPulse:0,castSlot:-1,intro:180
 };
 if(cleared)g.stitchoTrail.complete=true;
}

export function stitchoTrailPrompt(g){
 const s=g.stitchoTrail,p=g.player;if(!s||!p||p.dead)return '';
 if(s.cleared&&inRange(p,3750,1134,115))return 'E · Sostener el Corazón Galáctico';
 if(s.cleared)return 'ARCHIPIÉLAGO DEL CAOS · capítulo completado';
 if(s.complete)return 'ENFRENTA AL NÚCLEO GLITCH · derrota al guardián';
 const b=STITCHO_BEACONS[s.index];if(!b||!inRange(p,b.x,b.y,115))return '';
 const missing=Math.max(0,b.need-s.shards);
 return missing?'Recoge '+missing+' fragmento'+(missing>1?'s':'')+' para '+b.label:
  'E · activar '+b.label.toLowerCase()+' ('+(s.index+1)+'/3)';
}

export function interactStitchoTrail(g){
 const s=g.stitchoTrail,p=g.player;
 if(!s||!p||p.dead)return false;
 if(s.cleared&&inRange(p,3750,1134,115)){
  p._stitchoDanceT=120;p._stitchoDanceAge=0;
  g.fx?.emit?.(3750,1074,{color:'#85eeff',count:g.reduceMotion?8:32,size:4,star:true,life:45});
  g.nums?.add?.(3750,1050,'¡CORAZÓN GALÁCTICO!','#aef5ff',true);
  return true;
 }
 if(s.complete)return false;
 const b=STITCHO_BEACONS[s.index];
 if(!b||!inRange(p,b.x,b.y,115))return false;
 if(s.shards<b.need){
  g.nums?.add?.(b.x,b.y-55,'NECESITAS '+(b.need-s.shards)+' FRAGMENTOS','#ffe6ab',true);
  return true; // consume E; don't accidentally evolve.
 }
 s.index++;s.pulse=110;s.announcement=150;s.last=b.label;
 p._stitchoDanceT=75;p._stitchoDanceAge=0;
 const changed=persist(g,b.id);
 if(changed){g.score=(g.score||0)+175;p.xp=(p.xp||0)+10;g.save?.();}
 if(s.index===STITCHO_BEACONS.length){
  s.complete=true;s.last='NÚCLEO';
  if(persist(g,SAVE_KEY)){g.score=(g.score||0)+600;p.xp=(p.xp||0)+30;g.save?.();}
 }
 g.nums?.add?.(b.x,b.y-63,s.complete?'¡NÚCLEO GLITCH DESBLOQUEADO!':b.label+' · '+s.index+'/3','#aee9ff',true);
 return true;
}

// Casting three different native powers completes a unique Stitcho challenge.
// J can short-circuit a nearby electric gate temporarily; the others retain
// their real combat behavior. This NEVER grants an ability that is still locked.
export function stitchoAbility(g,p,index){
 const s=g.stitchoTrail;if(!s||p?.id!=='stitcho'||!Number.isInteger(index)||index<0||index>2)return false;
 s.castPulse=40;s.castSlot=index;
 if(!s.signatureComplete){
  s.abilityMarks.add(index);
  if(s.abilityMarks.size===3){
   s.signatureComplete=true;
   if(persist(g,'stitcho-combo-v1')){
    g.score=(g.score||0)+250;p.xp=(p.xp||0)+35;g.save?.();
   }
   s.pulse=120;
   g.nums?.add?.(p.x,p.y-65,'¡TRIPLE IMPULSO ALIENÍGENA!','#b4ffdc',true);
  }
 }
 if(index===0){
  const i=STITCHO_GATES.findIndex(gate=>Math.abs(p.x+p.w/2-(gate.x+gate.w/2))<240);
  if(i>=0){
   s.gateSilencedUntil[i]=(Number(g.t)||0)+145;
   g.nums?.add?.(STITCHO_GATES[i].x,p.y-80,'¡CIRCUITO DESACTIVADO!','#b3ffdf',true);
  }
 }
 return true;
}

export function updateStitchoTrail(g,hurt){
 const s=g.stitchoTrail,p=g.player;if(!s||!p||p.dead)return;
 const tick=Number(g.t)||0;s.pulse=Math.max(0,s.pulse-1);s.announcement=Math.max(0,s.announcement-1);
 s.intro=Math.max(0,s.intro-1);s.castPulse=Math.max(0,s.castPulse-1);
 if(p._stitchoDanceT>0){p._stitchoDanceT--;p._stitchoDanceAge=(p._stitchoDanceAge||0)+1;}
 s.padCooldown=Math.max(0,s.padCooldown-1);s.gateCooldown=Math.max(0,s.gateCooldown-1);
 // Four authored mobile rails. movePlatform carries standing players instead
 // of teleporting them, and the Kilo mechanics remain unchanged.
 for(const lift of s.lifts)movePlatform(g,lift.platform,lift.motion);
 // Eight optional fragments, four required. Picking one up is immediate and
 // persistent, so dying on the way to the next checkpoint never erases it.
 for(const shard of STITCHO_FRAGMENTS){
  const key=FRAGMENT_PREFIX+shard.id;
  if(s.collected.has(key)||!inRange(p,shard.x,shard.y,76))continue;
  s.collected.add(key);s.shards++;
  g.score=(g.score||0)+70;p.xp=(p.xp||0)+5;
  g.fx?.emit?.(shard.x,shard.y,{color:'#9cecff',count:g.reduceMotion?4:16,size:3,life:22});
  g.nums?.add?.(shard.x,shard.y-30,'FRAGMENTO '+s.shards+'/8','#b2f7ff',true);
  persist(g,key);
 }
 // Character-exclusive spring pads reward creative traversal of Hoku's gaps.
 for(const pad of STITCHO_PADS){
  if(!s.padCooldown&&p.grounded&&!p._dropWasHeld&&
    Math.abs(p.x+p.w/2-pad.x)<48&&Math.abs(p.y+p.h-pad.y)<25){
   p.vy=-pad.force;p.grounded=false;p._pmove='spring';
   s.padCooldown=40;
   g.fx?.emit?.(pad.x,pad.y-12,{color:pad.color,count:g.reduceMotion?4:14,size:4,up:2,life:24});
  }
 }
 // Warning / active / recovery: predictable 180-tick electrical cycle.
 s.gateStates=STITCHO_GATES.map((gate,i)=>{
  const phase=((tick+gate.offset)%180+180)%180;
  const state=tick<s.gateSilencedUntil[i]?'safe':phase<65?'safe':phase<105?'warn':'active';
  if(s.index>0&&state==='active'&&!s.gateCooldown&&p.invuln<=0&&
    p.x+p.w>gate.x&&p.x<gate.x+gate.w&&p.y+p.h>gate.y-gate.height&&p.y<gate.y){
   hurt?.(11,'ARCO ELÉCTRICO');s.gateCooldown=85;
  }
  return {id:i,state};
 });
 if(s.complete&&!s.cleared&&!s.bossSummoned&&typeof g.spawnStitchoBoss==='function'){
  s.bossSummoned=!!g.spawnStitchoBoss();
 }
 if(!s.cleared&&(g.clearedEncounters?.hub||[]).includes(STITCHO_BOSS_ID)){
  s.cleared=true;s.announcement=240;
 }
}

export function drawStitchoTrail(ctx,g,cam,t){
 const s=g.stitchoTrail;if(!s)return;
 const reduced=!!g.reduceMotion;
 ctx.save();
 // Separate atmospheric identity: crashed craft, antennae, circuit palms and
 // aurora light in three traversable districts, no expensive blur/canvas layers.
 for(let i=0;i<6;i++){
  const xx=[190,750,1410,2060,2850,3760][i]-cam.x,yy=1134-cam.y;
  if(xx<-220||xx>1750)continue;
  ctx.strokeStyle='#527d9c';ctx.lineWidth=7;ctx.beginPath();
  ctx.moveTo(xx,yy);ctx.lineTo(xx+Math.sin(i*2)*30,yy-120);ctx.stroke();
  ctx.fillStyle=i%2?'#a0b4fd':'#7de9f6';ctx.beginPath();
  ctx.ellipse(xx+Math.sin(i*2)*30,yy-135,48,20,i*.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f0ebc4';ctx.beginPath();ctx.arc(xx+32,yy-142,8,0,Math.PI*2);ctx.fill();
 }
 for(let i=0;i<8;i++){
  const x=390+i*476-cam.x,y=890+(i%3)*58-cam.y;
  if(x<-100||x>1700)continue;
  ctx.strokeStyle='#8de9ff55';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(x,y);ctx.lineTo(x+40,y-50);ctx.lineTo(x+75,y);ctx.stroke();
  if(!reduced){ctx.fillStyle='#c5efff';ctx.globalAlpha=.4+.2*Math.sin(t*.06+i);ctx.fillRect(x+35,y-59,8,8);ctx.globalAlpha=1;}
 }
 for(const lift of s.lifts)drawPlatformRail(ctx,lift.platform,lift.motion,cam);
 for(const pad of STITCHO_PADS){
  const x=pad.x-cam.x,y=pad.y-cam.y;if(x<-90||x>1700)continue;
  ctx.fillStyle='#203d56';ctx.fillRect(x-48,y-15,96,15);
  ctx.strokeStyle=pad.color;ctx.lineWidth=4;ctx.beginPath();
  ctx.moveTo(x-43,y-16);ctx.lineTo(x-22,y-27);ctx.lineTo(x,y-16);ctx.lineTo(x+22,y-27);ctx.lineTo(x+43,y-16);ctx.stroke();
 }
 for(let i=0;i<STITCHO_GATES.length;i++){
  const gate=STITCHO_GATES[i],x=gate.x-cam.x,y=gate.y-cam.y;
  if(x<-110||x>1700)continue;
  const state=s.gateStates[i]?.state||'safe';
  ctx.globalAlpha=s.index>0?1:.35;ctx.strokeStyle=state==='active'?'#fb7cba':state==='warn'?'#ffd688':'#7de9f6';
  ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-gate.height);ctx.moveTo(x+gate.w,y);ctx.lineTo(x+gate.w,y-gate.height);ctx.stroke();
  if(state!=='safe'){ctx.setLineDash([7,9]);ctx.beginPath();ctx.moveTo(x,y-gate.height*.53);ctx.lineTo(x+gate.w,y-gate.height*.53);ctx.stroke();ctx.setLineDash([]);}
  ctx.globalAlpha=1;
 }
 for(const shard of STITCHO_FRAGMENTS){
  if(s.collected.has(FRAGMENT_PREFIX+shard.id))continue;
  const x=shard.x-cam.x,y=shard.y-cam.y+(reduced?0:Math.sin(t*.06+shard.x)*7);
  if(x<-80||x>1700)continue;ctx.save();
  ctx.fillStyle='#a9faff';ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(x,y-13);ctx.lineTo(x+11,y);ctx.lineTo(x,y+13);ctx.lineTo(x-11,y);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 }
 for(let i=0;i<STITCHO_BEACONS.length;i++){
  const b=STITCHO_BEACONS[i],x=b.x-cam.x,y=b.y-cam.y;
  if(x<-100||x>1700)continue;
  const active=i===s.index&&!s.complete,done=i<s.index;
  ctx.globalAlpha=done?.65:active?1:.3;ctx.strokeStyle=done?'#8fffc3':'#9de8ff';ctx.lineWidth=4;
  const bob=reduced?0:Math.sin(t*.05+i)*6;ctx.beginPath();
  ctx.moveTo(x,y-85+bob);ctx.lineTo(x+28,y-48+bob);ctx.lineTo(x,y-11+bob);ctx.lineTo(x-28,y-48+bob);ctx.closePath();ctx.stroke();
  ctx.fillStyle=done?'#7feccb':'#dff8ff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';
  ctx.fillText(b.label,x,y-98+bob);ctx.globalAlpha=1;
 }

 // Relic pedestal for Corazón Galáctico
 if(s.cleared||s.complete){
  const rx=3750-cam.x,ry=1134-cam.y;
  if(rx>-100&&rx<1800){
   ctx.save();
   ctx.fillStyle='#132a45';ctx.strokeStyle='#7fe6fd';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(rx-28,ry);ctx.lineTo(rx-18,ry-35);ctx.lineTo(rx+18,ry-35);ctx.lineTo(rx+28,ry);ctx.closePath();ctx.fill();ctx.stroke();
   const bob=reduced?0:Math.sin(t*.08)*6;
   const relicY=ry-62+bob;
   ctx.fillStyle='rgba(128,240,255,0.25)';ctx.beginPath();ctx.arc(rx,relicY,22,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#85eeff';ctx.strokeStyle='#ffffff';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(rx,relicY+14);ctx.lineTo(rx-14,relicY);ctx.lineTo(rx-10,relicY-14);ctx.lineTo(rx,relicY-8);ctx.lineTo(rx+10,relicY-14);ctx.lineTo(rx+14,relicY);ctx.closePath();ctx.fill();ctx.stroke();
   if(!reduced){
    ctx.strokeStyle='#d5b0ff';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(rx,relicY,22,7,t*.04,0,Math.PI*2);ctx.stroke();
   }
   ctx.fillStyle='#d5f7ff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
   ctx.fillText('CORAZÓN GALÁCTICO',rx,relicY-24);
   ctx.restore();
  }
 }

 // Native Stitcho arm/antenna/tail dance is driven by _stitchoDanceT in
 // characters/draw.js. These extra rings explain *which* ability was cast.
 if(s.castPulse>0){
  const p=g.player,cx=p.x+p.w/2-cam.x,cy=p.y+p.h/2-cam.y;
  const fraction=s.castPulse/40,radius=26+(1-fraction)*62;
  ctx.save();ctx.globalAlpha=fraction*.7;
  ctx.strokeStyle=['#9af6ff','#cca9ff','#ffdba1'][s.castSlot]||'#9af6ff';
  ctx.lineWidth=2.5;
  for(let i=0;i<3;i++){
   const a=(reduced?0:t*.06)+i*Math.PI*2/3;
   ctx.beginPath();ctx.arc(cx,cy,radius+i*7,a,a+Math.PI*.62);ctx.stroke();
  }
  ctx.restore();
 }
 // Jet wakes respond to real velocity, and the feet compress during landing;
 // low-motion users get a calm stationary signal instead.
 if(!reduced){
  const p=g.player,speed=Math.abs(p.vx||0),cx=p.x+p.w/2-cam.x,feet=p.y+p.h-cam.y;
  if(speed>4||p._pmove==='spring'){
   ctx.save();ctx.globalAlpha=Math.min(.68,.12+speed*.045);
   ctx.strokeStyle='#8df0ff';ctx.lineWidth=2;
   for(let i=0;i<4;i++){
    const offset=(t*2.7+i*19)%70,side=Math.sign(p.vx||p.facing||1);
    ctx.beginPath();ctx.moveTo(cx-side*(15+offset),feet-7-i*9);
    ctx.lineTo(cx-side*(30+offset),feet-10-i*9);ctx.stroke();
   }
   ctx.restore();
  }
 }
 // Compact chapter tracker in screen-space: no full-screen interrupt.
 ctx.fillStyle='rgba(7,28,49,.78)';ctx.fillRect(22,143,226,58);
 ctx.fillStyle='#d8f8ff';ctx.font='bold 12px sans-serif';ctx.textAlign='left';
 ctx.fillText('STITCHO · '+STITCHO_ACTS[s.cleared?4:s.complete?3:Math.min(s.index,2)],32,163);
 ctx.font='11px sans-serif';
 ctx.fillText('SEÑALES '+s.index+'/3  ·  FRAGMENTOS '+s.shards+'/8',32,184);
 ctx.restore();
}

export function stitchoTrailSnapshot(g){
 const s=g.stitchoTrail;return s?{
  index:s.index,complete:s.complete,cleared:s.cleared,shards:s.shards,
  last:s.last,lifts:s.lifts.map(l=>({axis:l.motion.axis,x:l.platform.x,y:l.platform.y})),
  gates:s.gateStates.map(g=>g.state)
 }:null;
}
