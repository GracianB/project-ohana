// ISLAS DEL RELÁMPAGO · independent, persistent Chispín solo chapter.
// The same Hoku combat and movement engine powers the authored challenges.
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {CHISPIN_BOSS_ID} from './chispin-boss.js';
const ALL='hub-chispin-storm-v1',SKILL='hub-chispin-constellation-v1';
export const CHISPIN_RELAYS=Object.freeze([
 Object.freeze({id:'hub-chispin-relay-0',x:440,y:1075,name:'CHISPA',need:0}),
 Object.freeze({id:'hub-chispin-relay-1',x:1760,y:1083,name:'IMPULSO',need:2}),
 Object.freeze({id:'hub-chispin-relay-2',x:3075,y:1080,name:'TEMPESTAD',need:5})
]);
export const CHISPIN_SHARDS=Object.freeze([
 {id:'a',x:590,y:1055},{id:'b',x:810,y:785},{id:'c',x:1320,y:1080},
 {id:'d',x:1720,y:845},{id:'e',x:2110,y:930},{id:'f',x:2500,y:660},
 {id:'g',x:2870,y:810},{id:'h',x:3650,y:855}
]);
export const CHISPIN_GATES=Object.freeze([
 {x:1280,y:1134,w:58,h:185,offset:0},
 {x:2330,y:1134,w:58,h:200,offset:62},
 {x:2810,y:1134,w:58,h:240,offset:127}
]);
export const CHISPIN_SPRINGS=Object.freeze([
 {x:1070,y:1134,power:16.1},{x:2185,y:1134,power:18.0},{x:2910,y:1134,power:17.2}
]);
export const CHISPIN_CHAPTERS=Object.freeze([
 'EL PRIMER LATIDO','LOS PUENTES DEL TRUENO',
 'LAS NUBES IMPOSIBLES','EL OJO DE LA TORMENTA','LA CORONA DE LAS ISLAS'
]);
const shardKey=id=>'hub-chispin-shard-'+id;
const close=(p,x,y,d)=>!!p&&Math.hypot(p.x+p.w*.5-x,p.y+p.h*.5-y)<d;
function persist(g,key){
 g.secrets||={};g.secrets.hub||=[];
 if(g.secrets.hub.includes(key))return false;
 g.secrets.hub.push(key);g.save?.();return true;
}
export function enterChispinStorm(g){
 if(g.player?.id!=='chispin'||g.roomId!=='hub'||g.personalAdventureSolo===false){
  g.chispinStorm=null;return;
 }
 const saved=new Set(g.secrets?.hub||[]);
 const defeated=(g.clearedEncounters?.hub||[]).includes(CHISPIN_BOSS_ID);
 const complete=saved.has(ALL);
 let index=complete?3:CHISPIN_RELAYS.findIndex(relay=>!saved.has(relay.id));
 if(index<0)index=3;
 const lifts=[
  {axis:'x',x:1050,y:920,span:255,period:265},
  {axis:'y',x:1530,y:1050,span:305,period:270},
  {axis:'x',x:2260,y:900,span:275,period:285},
  {axis:'y',x:2800,y:1080,span:350,period:310},
  {axis:'x',x:3370,y:890,span:285,period:325}
 ].map((motion,i)=>{
  motion.start=g.t||0;motion.phase=i*.7;
  const platform={x:motion.x,y:motion.y,w:180,h:24,_chispinRail:true};
  g.platforms.push(platform);return {platform,motion};
 });
 g.chispinStorm={
  index,complete:complete||defeated,defeated,
  saved,shards:CHISPIN_SHARDS.filter(x=>saved.has(shardKey(x.id))).length,
  lifts,pulse:0,springCd:0,gateCd:0,gateStates:[],gateSilencedUntil:[0,0,0],
  abilityMarks:new Set(),signatureComplete:saved.has(SKILL),bossSummoned:false,notice:''
 };
}
export function chispinStormPrompt(g){
 const s=g.chispinStorm,p=g.player;if(!s||!p||p.dead)return '';
 if(s.defeated)return 'ISLAS DEL RELÁMPAGO · VICTORIA';
 if(s.complete)return 'DERROTA AL OJO DE LA TORMENTA';
 const relay=CHISPIN_RELAYS[s.index];
 if(!relay||!close(p,relay.x,relay.y,105))return '';
 const lacking=Math.max(0,relay.need-s.shards);
 return lacking?'Necesitas '+lacking+' fragmentos para '+relay.name:
  'E · activar '+relay.name.toLowerCase()+' ('+(s.index+1)+'/3)';
}
export function interactChispinStorm(g){
 const s=g.chispinStorm,p=g.player;if(!s||s.complete||!p||p.dead)return false;
 const relay=CHISPIN_RELAYS[s.index];
 if(!relay||!close(p,relay.x,relay.y,105))return false;
 const missing=relay.need-s.shards;
 if(missing>0){g.nums?.add?.(relay.x,relay.y-60,missing+' FRAGMENTOS NECESARIOS','#ffe59e',true);return true;}
 if(persist(g,relay.id)){g.score=(g.score||0)+175;p.xp=(p.xp||0)+15;g.save?.();}
 s.index++;s.pulse=120;s.notice=relay.name;
 if(s.index===3){
  s.complete=true;
  if(persist(g,ALL)){g.score=(g.score||0)+600;p.xp=(p.xp||0)+45;g.save?.();}
 }
 g.nums?.add?.(relay.x,relay.y-60,s.complete?'¡OJO DE LA TORMENTA DESBLOQUEADO!':relay.name+' '+s.index+'/3','#ffec98',true);
 return true;
}
export function chispinStormAbility(g,p,index){
 const s=g.chispinStorm;
 if(!s||p?.id!=='chispin'||!Number.isInteger(index)||index<0||index>2)return false;
 if(!s.signatureComplete){
  s.abilityMarks.add(index);
  if(s.abilityMarks.size===3){
   s.signatureComplete=true;
   if(persist(g,SKILL)){g.score=(g.score||0)+275;p.xp=(p.xp||0)+35;g.save?.();}
   g.nums?.add?.(p.x,p.y-54,'¡TRIPLE CHISPA!','#fff9ad',true);
  }
 }
 if(index===0){
  const i=CHISPIN_GATES.findIndex(k=>Math.abs(p.x+p.w*.5-(k.x+k.w*.5))<245);
  if(i>=0){s.gateSilencedUntil[i]=(g.t||0)+175;g.nums?.add?.(CHISPIN_GATES[i].x,p.y-65,'¡RELÁMPAGO ABSORBIDO!','#a6ffdd',true);}
 }
 return true;
}
export function updateChispinStorm(g,hurt){
 const s=g.chispinStorm,p=g.player;if(!s||!p||p.dead)return;
 const t=g.t||0;s.pulse=Math.max(0,s.pulse-1);s.springCd=Math.max(0,s.springCd-1);
 s.gateCd=Math.max(0,s.gateCd-1);
 for(const lift of s.lifts)movePlatform(g,lift.platform,lift.motion);
 for(const shard of CHISPIN_SHARDS){
  const key=shardKey(shard.id);
  if(s.saved.has(key)||!close(p,shard.x,shard.y,70))continue;
  s.saved.add(key);s.shards++;
  g.score=(g.score||0)+65;p.xp=(p.xp||0)+6;
  g.fx?.emit?.(shard.x,shard.y,{color:'#fff1a0',count:g.reduceMotion?4:14,size:3,life:25});
  g.nums?.add?.(shard.x,shard.y-32,'FRAGMENTO '+s.shards+'/8','#ffeca3',true);
  persist(g,key);
 }
 for(const spring of CHISPIN_SPRINGS){
  if(s.springCd||!p.grounded||Math.abs(p.x+p.w*.5-spring.x)>=42||
     Math.abs(p.y+p.h-spring.y)>=25)continue;
  p.vy=-spring.power;p.grounded=false;s.springCd=42;
  g.fx?.emit?.(spring.x,spring.y-15,{color:'#f5e38d',count:g.reduceMotion?3:12,size:4,life:22});
 }
 s.gateStates=CHISPIN_GATES.map((gate,i)=>{
  const phase=((t+gate.offset)%210+210)%210;
  const state=t<s.gateSilencedUntil[i]?'safe':phase<75?'safe':phase<112?'warn':'active';
  if(s.index>0&&state==='active'&&!s.gateCd&&!(p.invuln>0)&&
    p.x+p.w>gate.x&&p.x<gate.x+gate.w&&p.y+p.h>gate.y-gate.h&&p.y<gate.y){
   hurt?.(12,'CAMPO DE VOLTAJE');s.gateCd=75;
  }
  return state;
 });
 if(s.complete&&!s.defeated&&!s.bossSummoned&&typeof g.spawnChispinBoss==='function')
  s.bossSummoned=!!g.spawnChispinBoss();
 if(!s.defeated&&(g.clearedEncounters?.hub||[]).includes(CHISPIN_BOSS_ID)){
  s.defeated=true;s.pulse=180;s.notice='VICTORIA';
 }
}
export function drawChispinStorm(ctx,g,cam,t){
 const s=g.chispinStorm;if(!s)return;
 const reduced=!!g.reduceMotion;
 ctx.save();
 for(const lift of s.lifts)drawPlatformRail(ctx,lift.platform,lift.motion,cam);
 for(let i=0;i<CHISPIN_GATES.length;i++){
  const gate=CHISPIN_GATES[i],x=gate.x-cam.x,y=gate.y-cam.y;
  if(x<-80||x>1700)continue;
  const state=s.gateStates[i]||'safe';ctx.lineWidth=4;
  ctx.strokeStyle=state==='active'?'#fcabf7':state==='warn'?'#ffe09a':'#80ecd9';
  ctx.globalAlpha=s.index?1:.35;ctx.beginPath();
  ctx.moveTo(x,y);ctx.lineTo(x,y-gate.h);ctx.moveTo(x+gate.w,y);ctx.lineTo(x+gate.w,y-gate.h);ctx.stroke();
  if(state!=='safe'){ctx.setLineDash([6,8]);ctx.beginPath();
   ctx.moveTo(x,y-gate.h*.55);ctx.lineTo(x+gate.w,y-gate.h*.55);ctx.stroke();ctx.setLineDash([]);}
  ctx.globalAlpha=1;
 }
 for(const spring of CHISPIN_SPRINGS){
  const x=spring.x-cam.x,y=spring.y-cam.y;if(x<-80||x>1700)continue;
  ctx.fillStyle='#234c69';ctx.fillRect(x-38,y-14,76,14);
  ctx.strokeStyle='#ffe7aa';ctx.lineWidth=4;ctx.beginPath();
  ctx.moveTo(x-34,y-17);ctx.lineTo(x-14,y-28);ctx.lineTo(x,y-17);ctx.lineTo(x+14,y-28);ctx.lineTo(x+34,y-17);ctx.stroke();
 }
 for(const shard of CHISPIN_SHARDS){
  if(s.saved.has(shardKey(shard.id)))continue;
  const x=shard.x-cam.x,y=shard.y-cam.y+(reduced?0:Math.sin(t*.065+shard.x)*6);
  if(x<-40||x>1700)continue;
  ctx.fillStyle='#ffe6a2';ctx.strokeStyle='#fff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+3,y-17);ctx.lineTo(x,y-3);
  ctx.lineTo(x+12,y-3);ctx.lineTo(x-3,y+17);ctx.lineTo(x,y+4);ctx.closePath();ctx.fill();ctx.stroke();
 }
 for(let i=0;i<CHISPIN_RELAYS.length;i++){
  const relay=CHISPIN_RELAYS[i],x=relay.x-cam.x,y=relay.y-cam.y;
  if(x<-100||x>1700)continue;
  const used=i<s.index,active=i===s.index&&!s.complete;
  ctx.globalAlpha=used?.65:active?1:.28;
  ctx.fillStyle=used?'#a5ffca':'#fff1b0';ctx.strokeStyle='#fef9e5';ctx.lineWidth=3;
  const bob=reduced?0:Math.sin(t*.05+i)*5;
  ctx.beginPath();ctx.moveTo(x,y-95+bob);ctx.lineTo(x+26,y-58+bob);
  ctx.lineTo(x,y-20+bob);ctx.lineTo(x-26,y-58+bob);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.textAlign='center';ctx.font='bold 12px sans-serif';ctx.fillText(relay.name,x,y-109+bob);ctx.globalAlpha=1;
 }
 ctx.fillStyle='rgba(5,26,55,.8)';ctx.fillRect(22,143,270,57);
 ctx.fillStyle='#fff2ac';ctx.textAlign='left';ctx.font='bold 12px sans-serif';
 const chapter=s.defeated?4:s.complete?3:Math.min(s.index,2);
 ctx.fillText('CHISPÍN · '+CHISPIN_CHAPTERS[chapter],32,163);
 ctx.font='11px sans-serif';ctx.fillText('PARARRAYOS '+s.index+'/3 · FRAGMENTOS '+s.shards+'/8',32,184);
 ctx.restore();
}
export function chispinStormSnapshot(g){
 const s=g.chispinStorm;
 return s?{index:s.index,complete:s.complete,defeated:s.defeated,shards:s.shards,
  rails:s.lifts.length,gates:s.gateStates.slice(),signature:s.signatureComplete}:null;
}
