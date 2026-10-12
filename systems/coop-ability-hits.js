import {ROSTER} from '../characters/roster.js';
// Only the guest reports a local ability impact; the host remains authoritative.
export function forwardCoopAbilityHit(game,coop,enemy,damage){
 const hero=game?.player?.id;
 if(!coop?.enabled||typeof coop.signal!=='function'||!ROSTER.some(r=>r.id===hero)||coop.currentPlayer?.(coop.snapshot)?.slot!==1||
 !enemy||!Number.isSafeInteger(enemy._coopSyncId)||enemy._coopSyncId<1||
 !Number.isSafeInteger(enemy._coopVisit)||enemy._coopVisit<0||
 !Number.isFinite(damage)||damage<=0||damage>1000||
 ![enemy.x,enemy.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=20000))return false;
 void coop.signal(game,'hit',{targetSyncId:enemy._coopSyncId,targetVisit:enemy._coopVisit,
 targetId:enemy.id,kind:enemy.kind,x:enemy.x,y:enemy.y,damage,characterId:hero});return true;
}
