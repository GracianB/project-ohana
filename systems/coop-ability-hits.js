import {ROSTER} from '../characters/roster.js';
// Only the guest reports a local ability impact; the host remains authoritative.
// V379: Dino sends movement metadata separately from damage. Whitelist only
// the three real hit options; remote callers never control boss mechanics.
const bound=(v,min,max)=>Math.min(max,Math.max(min,v));
export function readDinoImpact(options){
 if(!options||typeof options!=="object"||Array.isArray(options))return null;
 const {stun,kx,ky}=options;
 if(!Number.isFinite(stun)||!Number.isFinite(kx)||!Number.isFinite(ky))return null;
 return Object.freeze({
   stun:bound(Math.round(stun),0,62),
   kx:bound(kx,-16,16),
   ky:bound(ky,-16,0)
 });
}
export function applyDinoImpact(target,options){
 const hit=readDinoImpact(options);
 if(!target||!hit)return false;
 if(target.boss){
   target.stun=Math.max(Number(target.stun)||0,Math.min(6,hit.stun));
   target.vx=(Number(target.vx)||0)+bound(hit.kx,-8,8)*.08;
 }else{
   target.stun=Math.max(Number(target.stun)||0,Math.max(8,hit.stun));
   target.vx=hit.kx;
   target.vy=Math.min(Number(target.vy)||0,hit.ky);
 }
 return true;
}
export function forwardCoopAbilityHit(game,coop,enemy,damage,options){
 const hero=game?.player?.id;
 if(!coop?.enabled||typeof coop.signal!=='function'||!ROSTER.some(r=>r.id===hero)||coop.currentPlayer?.(coop.snapshot)?.slot!==1||
 !enemy||!Number.isSafeInteger(enemy._coopSyncId)||enemy._coopSyncId<1||
 !Number.isSafeInteger(enemy._coopVisit)||enemy._coopVisit<0||
 !Number.isFinite(damage)||damage<=0||damage>1000||
 ![enemy.x,enemy.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=20000))return false;
 const dinoImpact=hero==="dino"?readDinoImpact(options):null;
 void coop.signal(game,'hit',{targetSyncId:enemy._coopSyncId,targetVisit:enemy._coopVisit,
 targetId:enemy.id,kind:enemy.kind,x:enemy.x,y:enemy.y,damage,characterId:hero,
 ...(dinoImpact?{dinoImpact}:{})});return true;
}
