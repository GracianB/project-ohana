import {worldBounds} from './world-bounds.js';
// V290–V294: atomic host snapshots, stable identities and bounded prediction.
export const COMBAT_PROTOCOL=2;
export const COMBAT_LIMITS=Object.freeze({enemies:24,bullets:16,bytes:11200,predictionTicks:12,staleMs:750});
const captures=new WeakMap();
const finite=(x,f=0)=>Number.isFinite(x)?x:f;
const num=(x,lo,hi)=>Math.round(Math.min(hi,Math.max(lo,finite(x)))*100)/100;
const coordinate=x=>Number.isFinite(x)&&x>=-4096&&x<=20000;
const word=x=>typeof x==="string"&&/^[a-zA-Z0-9_-]{1,30}$/.test(x);
const color=x=>typeof x==="string"&&/^#(?:[a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.test(x)?x:"#ffd36a";
const numbers=["wind","hopWind","clawWind","phase","flash","stun","dying","attackT","charge","invuln","contactDmg","evo","_hitT","_hitMax","alertPing","poseT","teleT","teleMax","teleRange","aimDx","aimDy"];
const bools=["telegraph","fell","elite","baby","up","airborne","diving","charging","darting","lunging"];
const strings=["mode","teleKind","aiRole","aiIntent","aiFormation","campaignRole"];
const flags=[...numbers,...bools,...strings];
function stateFor(game){
 if(!captures.has(game))captures.set(game,{ids:new WeakMap(),next:0,bullets:new WeakMap(),nextBullet:0});
 return captures.get(game);
}
function projectile(p,id=0){
 return {id,x:num(p.x,-4096,20000),y:num(p.y,-4096,20000),w:num(p.w,1,256),h:num(p.h,1,256),
 vx:num(p.vx,-60,60),vy:num(p.vy,-60,60),life:num(p.life,0,240),dmg:num(p.dmg,0,1000),color:color(p.color),
 shape:word(p.shape)?p.shape:"orb",trail:!!p.trail,owner:"enemy"};
}
export function captureCombatFrame(game,frameNo,scope="local"){
 const state=stateFor(game),source=(game.enemies||[]).filter(e=>e&&coordinate(e.x)&&coordinate(e.y));
 const bullets=(game.projectiles||[]).filter(p=>p&&p.owner==="enemy"&&p.life>0&&coordinate(p.x)&&coordinate(p.y));
 // Long authored chapters exceed the packet budget. Keep guardians and enemies
 // nearest either teammate, preserving their original spawn identity.
 const originalIndex=new Map(source.map((e,i)=>[e,i]));
 const peers=[game.player,game.coopRemote].filter(p=>p&&coordinate(p.x)&&coordinate(p.y));
 const priority=e=>(e.boss||e.miniBoss)?-1:peers.length?Math.min(...peers.map(p=>Math.hypot(e.x-p.x,e.y-p.y))):originalIndex.get(e);
 if(source.length>24)source.sort((a,b)=>priority(a)-priority(b));
 const frame={protocol:2,scope,visit:Math.floor(finite(game.coopRoomVisit)),roomId:String(game.roomId||""),
 frameNo:Math.floor(num(frameNo,0,1e9)),full:source.length<=24,
 enemies:source.slice(0,24).map((e,i)=>{
  if(!state.ids.has(e))state.ids.set(e,++state.next);
  e._coopSyncId=state.ids.get(e);e._coopVisit=Math.floor(finite(game.coopRoomVisit));
  return {id:e._coopSyncId,index:Number.isInteger(e.spawnIndex)?e.spawnIndex:e.boss?-2:originalIndex.get(e),kind:String(e.kind||"").slice(0,30),boss:!!e.boss,
   x:num(e.x,-4096,20000),y:num(e.y,-4096,20000),w:num(e.w,1,1024),h:num(e.h,1,1024),vx:num(e.vx,-40,40),vy:num(e.vy,-40,40),
   hp:num(e.hp,0,100000),max:num(e.max??e.hp,1,100000),color:color(e.color),
   flags:Object.fromEntries(flags.filter(k=>Object.hasOwn(e,k)).map(k=>[k,numbers.includes(k)?num(e[k],-1000,1000):bools.includes(k)?!!e[k]:word(e[k])?e[k]:"idle"]))};
 }),
 bullets:bullets.slice(0,16).map(p=>{
  if(!state.bullets.has(p))state.bullets.set(p,++state.nextBullet);
  return projectile(p,state.bullets.get(p));
 })};
 while(JSON.stringify(frame).length>11200){
  if(frame.bullets.length)frame.bullets.pop();
  else if(frame.enemies.length){frame.enemies.pop();frame.full=false;}
  else break;
 }
 return frame;
}
export function validCombatFrame(frame){
 if(!frame||!Array.isArray(frame.enemies)||frame.enemies.length>24||!Array.isArray(frame.bullets)||frame.bullets.length>16)return false;
 try{if(JSON.stringify(frame).length>11200)return false;}catch{return false;}
 const modern=frame.protocol===2;
 if(frame.protocol!=null&&!modern)return false;
 if(modern&&(!Number.isSafeInteger(frame.frameNo)||frame.frameNo<1||frame.frameNo>1e9||
  typeof frame.scope!=="string"||! /^[a-zA-Z0-9_.:-]{1,96}$/.test(frame.scope)||
  !Number.isSafeInteger(frame.visit)||frame.visit<0||typeof frame.full!=="boolean"))return false;
 if(typeof frame.roomId!=="string"||!worldBounds(frame.roomId))return false;
 const ids=new Set();
 for(const e of frame.enemies){
  if(!e||!word(e.kind)||!coordinate(e.x)||!coordinate(e.y)||!Number.isFinite(e.hp)||e.hp<0||e.hp>100000)return false;
  if(modern){
   if(!Number.isSafeInteger(e.id)||e.id<1||ids.has(e.id)||typeof e.boss!=="boolean"||
    ![e.w,e.h,e.max].every(v=>Number.isFinite(v)&&v>0)||e.w>1024||e.h>1024||e.max>100000||e.hp>e.max||
    ![e.vx,e.vy].every(v=>Number.isFinite(v)&&Math.abs(v)<=40))return false;
   ids.add(e.id);
  }
  for(const k of numbers)if(Object.hasOwn(e.flags||{},k)&&(!Number.isFinite(e.flags[k])||Math.abs(e.flags[k])>1000))return false;
  for(const k of bools)if(Object.hasOwn(e.flags||{},k)&&typeof e.flags[k]!=="boolean")return false;
  for(const k of strings)if(Object.hasOwn(e.flags||{},k)&&!word(e.flags[k]))return false;
 }
 const bulletIds=new Set();
 for(const p of frame.bullets){
  if(!p||!coordinate(p.x)||!coordinate(p.y)||!["w","h","vx","vy","life","dmg"].every(k=>Number.isFinite(p[k]))||
   p.w<=0||p.h<=0||p.w>256||p.h>256||Math.abs(p.vx)>60||Math.abs(p.vy)>60||p.life<0||p.life>240||p.dmg<0||p.dmg>1000)return false;
  if(modern&&(!Number.isSafeInteger(p.id)||p.id<1||bulletIds.has(p.id)))return false;
  bulletIds.add(p.id);
 }
 return true;
}
export function resetCombatMirror(game){game._coopMirror=null;game.coopRemoteEnemyBullets=[];}
export function applyCombatFrame(game,frame){
 if(frame?.roomId!==game?.roomId||!validCombatFrame(frame))return false;
 const modern=frame.protocol===2,previous=game._coopMirror;
 if(modern&&previous?.scope===frame.scope&&(frame.visit<previous.visit||frame.frameNo<=previous.frameNo))return false;
 const same=previous?.scope===frame.scope&&previous?.visit===frame.visit;
 const targets=Array.isArray(game.enemies)?game.enemies:[],accepted=[];
 for(const item of frame.enemies){
  let target=modern&&same?targets.find(e=>e._coopSyncId===item.id):null;
  if(!target&&(!modern||!same))target=targets.find((e,i)=>!accepted.includes(e)&&(Number.isInteger(e.spawnIndex)?e.spawnIndex:e.boss?-2:i)===item.index&&e.kind===item.kind&&!!e.boss===item.boss);
  if(target&&target.kind!==item.kind)target=null;
  if(!target&&modern&&typeof game.createCoopEnemy==="function")target=game.createCoopEnemy(item);
  if(!target)continue;
  const created=!targets.includes(target),delta=Math.hypot(item.x-target.x,item.y-target.y);
  const factor=created||!same||delta>250?1:.6;
  // Legacy callers keep their interpolation contract; production uses v2.
  const blend=!modern&&delta<=250?.6:factor;
  target.x+=(item.x-target.x)*blend;target.y+=(item.y-target.y)*blend;
  target.vx=num(item.vx,-40,40);target.vy=num(item.vy,-40,40);
  if(modern){target.w=item.w;target.h=item.h;target.max=item.max;target._coopSyncId=item.id;target._coopVisit=frame.visit;}
  target.hp=num(item.hp,0,Math.max(1,finite(target.max,100000)));
  for(const k of flags){
   if(Object.hasOwn(item.flags||{},k))target[k]=item.flags[k];
   else if(Object.hasOwn(target,k)&&!strings.includes(k))target[k]=bools.includes(k)?false:0;
  }
  accepted.push(target);
 }
 if(modern){
  game.enemies=frame.full&&typeof game.createCoopEnemy==="function"?accepted:[...new Set([...targets,...accepted])];
  game.boss=game.enemies.find(e=>e.boss)||null;
  game.projectiles=(game.projectiles||[]).filter(p=>p?.owner==="player");
  const consumed=same?previous.consumed:new Set();
  while(consumed.size>512)consumed.delete(consumed.values().next().value);
  game._coopMirror={scope:frame.scope,visit:frame.visit,frameNo:frame.frameNo,predicted:0,consumed};
 }
 game.coopRemoteEnemyBullets=frame.bullets.filter(p=>!game._coopMirror?.consumed.has(p.id)).map(p=>projectile(p,p.id));
 return true;
}
export function advanceMirroredEnemies(game,frameAgeMs){
 if(!Array.isArray(game?.enemies)||!Number.isFinite(frameAgeMs)||frameAgeMs<0||frameAgeMs>=750)return false;
 const mirror=game._coopMirror;
 if(mirror&&mirror.predicted++>=12)return true;
 const speed=frameAgeMs<=220?1:frameAgeMs<=440?.6:.2;
 for(const e of game.enemies){
  if(!e||e.hp<=0||e.dying||e.fell)continue;
  e.x=num(e.x+finite(e.vx)*speed,-4096,20000);e.y=num(e.y+finite(e.vy)*speed,-4096,20000);
  for(const k of ["flash","_hitT"])if(e[k]>0)e[k]=Math.max(0,e[k]-1);
 }
 for(const p of game.coopRemoteEnemyBullets||[]){p.x+=p.vx*speed;p.y+=p.vy*speed;p.life=Math.max(0,p.life-1);}
 game.coopRemoteEnemyBullets=(game.coopRemoteEnemyBullets||[]).filter(p=>p.life>0);
 return true;
}
export function mirroredProjectileHits(game,onHit){
 const player=game.player;if(!player||player.dead||player.invuln>0||typeof onHit!=="function")return 0;
 let hits=0;
 for(const p of game.coopRemoteEnemyBullets||[]){
  if(p.life>0&&p.x<player.x+player.w&&p.x+p.w>player.x&&p.y<player.y+player.h&&p.y+p.h>player.y){
   p.life=0;game._coopMirror?.consumed.add(p.id);onHit(p.dmg);hits++;
   if(player.dead||player.invuln>0)break;
  }
 }
 return hits;
}
export function sharedEnemyTarget(enemy,local,peer){
 if(!peer||peer.dead||!coordinate(peer.x)||!coordinate(peer.y))return local;
 if(!local||local.dead)return peer;
 const distance=p=>Math.hypot(p.x+finite(p.w)/2-enemy.x,p.y+finite(p.h)/2-enemy.y);
 return distance(peer)<distance(local)?peer:local;
}
