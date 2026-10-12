import {readMichiDuet,readMichiEffects} from './michi-duet.js';
import {readFamilyDuet,FAMILY_DUET_LENGTH} from './family-duets.js';
import {readChispinDuet,readChispinEffects} from './chispin-duet.js';
import {readStitchoDuet} from './stitcho-duet.js';
import {readKiloDuet} from './kilo-duet.js';
// V295: the same projectile/slash/lightning renderers, without remote damage.
const histories=new WeakMap();
const scalar=["x","y","w","h","vx","vy","life","max","facing","rot","x1","y1","x2","y2","r","angle","seed","idx","n"];
const word=v=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,30}$/.test(v);
const color=v=>typeof v==="string"&&/^#(?:[a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.test(v)?v:"#fff";
function effect(item,type){
 if(!item||!Number.isFinite(item.life)||item.life<=0)return null;
 const points=type==="bolts"?["x1","y1","x2","y2"]:["x","y"];
 if(!points.every(k=>Number.isFinite(item[k])&&Math.abs(item[k])<=20000))return null;
 const value={};
 for(const k of scalar)if(Number.isFinite(item[k]))value[k]=Math.round(Math.max(-20000,Math.min(20000,item[k]))*100)/100;
 value.life=Math.min(240,value.life);value.max=Math.max(1,Math.min(240,value.max||value.life));
 value.w=Math.max(1,Math.min(512,value.w||12));value.h=Math.max(1,Math.min(512,value.h||12));
 value.vx=Math.max(-60,Math.min(60,value.vx||0));value.vy=Math.max(-60,Math.min(60,value.vy||0));
 value.n=Math.max(1,Math.min(24,value.n||10));value.r=Math.max(1,Math.min(4096,value.r||12));
 value.facing=value.facing===-1?-1:1;value.color=color(item.color);
 for(const k of ["kind","shape"])if(word(item[k]))value[k]=item[k];
 for(const k of ["spin","trail"])value[k]=item[k]===true;
 value.owner="peer-visual";return value;
}
// V322: a duet START is a meaningful event, not a disposable pose.
// Send the same bounded/read-only snapshot through the ordered, reliable event
// channel on forced casts. Normal 200ms frames still use the low-latency pose
// channel only, and applyPeerEffects deduplicates matching scope/frameNo.
export function sendPeerEffectsWithReliableDuet(direct,frame,force=false){
 if(!direct?.active||!frame||frame.protocol!==2)return false;
 const quick=direct.sendLatest?.("effects",frame)===true;
 const hasDuet=!!(frame.familyDuet||frame.michiDuet||frame.chispinDuet||
  frame.stitchoDuet||frame.kiloDuet);
 const durable=!!force&&hasDuet&&direct.sendEvent?.("effects",frame)===true;
 return quick||durable;
}
export function capturePeerEffects(game,frameNo,scope){
 const frame={protocol:2,scope,frameNo,roomId:game.roomId,familyDuet:readFamilyDuet(game._familyDuet),michiDuet:readMichiDuet(game._michiDuet),michiFx:readMichiEffects(game.michiAbilityFx||[])||[],chispinDuet:readChispinDuet(game._chispinDuet),stitchoDuet:readStitchoDuet(game._stitchoDuet),kiloDuet:readKiloDuet(game._kiloDuet),
  chispinFx:readChispinEffects(game.chispinAbilityFx||[])||[],
  kiloFx:(game.kiloAbilityFx||[]).slice(0,12).map(f=>effect(f,"kiloFx")).filter(Boolean),
  projectiles:(game.projectiles||[]).filter(p=>p?.owner==="player").slice(0,12).map(p=>effect(p,"projectiles")).filter(Boolean),
  slashes:(game.slashes||[]).slice(-6).map(s=>effect(s,"slashes")).filter(Boolean),
  bolts:(game.bolts||[]).slice(-6).map(b=>effect(b,"bolts")).filter(Boolean)};
 while(JSON.stringify(frame).length>8500){
  const list=frame.michiFx.length?frame.michiFx:frame.projectiles.length?frame.projectiles:frame.slashes.length?frame.slashes:frame.bolts;
  if(!list.length)break;list.pop();
 }
 return frame;
}
export function applyPeerEffects(game,frame){
 if(!frame||frame.protocol!==2||frame.roomId!==game.roomId||typeof frame.scope!=="string"||
  !/^[a-zA-Z0-9_.:-]{1,96}$/.test(frame.scope)||!Number.isSafeInteger(frame.frameNo)||frame.frameNo<1||frame.frameNo>1e9)return false;
 try{if(JSON.stringify(frame).length>8500)return false;}catch{return false;}
 const history=histories.get(game);
 if(history?.retired.has(frame.scope)||history?.scope===frame.scope&&frame.frameNo<=history.frameNo)return false;
 const current=game.coopPeerEffects;
 if(current?.scope===frame.scope&&frame.frameNo<=current.frameNo)return false;
 const value={scope:frame.scope,frameNo:frame.frameNo,ticks:0,familyDuet:readFamilyDuet(frame.familyDuet),michiDuet:readMichiDuet(frame.michiDuet),michiFx:readMichiEffects(frame.michiFx||[]),chispinDuet:readChispinDuet(frame.chispinDuet),kiloDuet:readKiloDuet(frame.kiloDuet),stitchoDuet:readStitchoDuet(frame.stitchoDuet)};
 if(!value.michiFx||frame.michiDuet!=null&&!value.michiDuet)return false;
 if(frame.familyDuet!=null&&!value.familyDuet)return false;
 if(frame.chispinDuet!=null&&!value.chispinDuet)return false;
 value.chispinFx=readChispinEffects(frame.chispinFx||[]);if(!value.chispinFx)return false;
 if(frame.kiloDuet!=null&&!value.kiloDuet)return false;
 if(frame.stitchoDuet!=null&&!value.stitchoDuet)return false;
 if(frame.kiloFx!=null&&(!Array.isArray(frame.kiloFx)||frame.kiloFx.length>12||frame.kiloFx.some(f=>!["note","hula","ohana"].includes(f?.kind))))return false;
 value.kiloFx=(frame.kiloFx||[]).map(f=>effect(f,"kiloFx"));if(value.kiloFx.some(f=>!f))return false;
 for(const [type,limit] of [["projectiles",12],["slashes",6],["bolts",6]]){
  if(!Array.isArray(frame[type])||frame[type].length>limit)return false;
  value[type]=frame[type].map(item=>effect(item,type));
  if(value[type].some(item=>!item))return false;
 }
 const retired=history?.retired||new Set();
 if(history&&history.scope!==frame.scope)retired.add(history.scope);
 while(retired.size>16)retired.delete(retired.values().next().value);
 histories.set(game,{scope:frame.scope,frameNo:frame.frameNo,retired});
 game.coopPeerEffects=value;return true;
}
export function advancePeerEffects(game){
 const frame=game.coopPeerEffects;if(!frame)return;
 const move=frame.ticks++<12;
 if(frame.familyDuet&&++frame.familyDuet.age>=FAMILY_DUET_LENGTH)frame.familyDuet=null;
 if(frame.michiDuet){frame.michiDuet.stars=frame.michiDuet.stars.map(b=>({...b,age:b.age+1})).filter(b=>b.age<=30);if(++frame.michiDuet.age>=120)frame.michiDuet=null;}
 for(const f of frame.michiFx||[]){f.life--;if(move&&f.kind!=='purr'){f.x+=f.vx;f.y+=f.vy;}}frame.michiFx=(frame.michiFx||[]).filter(f=>f.life>0);
 for(const f of frame.chispinFx||[]){f.life--;if(f.kind==='storm')f.bolts=f.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);}frame.chispinFx=(frame.chispinFx||[]).filter(f=>f.life>0);
 if(frame.chispinDuet){frame.chispinDuet.tails=frame.chispinDuet.tails.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);frame.chispinDuet.bolts=frame.chispinDuet.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);if(++frame.chispinDuet.age>=120)frame.chispinDuet=null;}
 if(frame.stitchoDuet){
  frame.stitchoDuet.bolts=frame.stitchoDuet.bolts.map(b=>({...b,life:b.life-1})).filter(b=>b.life>0);
  if(++frame.stitchoDuet.age>=120)frame.stitchoDuet=null;
 }
 if(frame.kiloDuet&&++frame.kiloDuet.age>=120)frame.kiloDuet=null;
 for(const type of ["projectiles","slashes","bolts","kiloFx"]){
  for(const item of frame[type]){
   if(move&&(type==="projectiles"||type==="kiloFx")){item.x+=item.vx;item.y+=item.vy;}
   item.life=Math.max(0,item.life-1);
  }
  frame[type]=frame[type].filter(item=>item.life>0);
 }
}
