import {ROSTER} from '../characters/roster.js';
// Only the guest reports a local ability impact; the host remains authoritative.
export function forwardCoopAbilityHit(game,coop,enemy,damage,options={}){
 const hero=game?.player?.id;
 if(!coop?.enabled||typeof coop.signal!=='function'||!ROSTER.some(r=>r.id===hero)||coop.currentPlayer?.(coop.snapshot)?.slot!==1||
 !enemy||!Number.isSafeInteger(enemy._coopSyncId)||enemy._coopSyncId<1||
 !Number.isSafeInteger(enemy._coopVisit)||enemy._coopVisit<0||
 !Number.isFinite(damage)||damage<=0||damage>1000||
 ![enemy.x,enemy.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=20000))return false;
 const dinoImpact={};
 if(hero==='dino')for(const [k,lo,hi] of [['stun',0,62],['kx',-16,16],['ky',-16,0]])if(Number.isFinite(options?.[k]))dinoImpact[k]=Math.max(lo,Math.min(hi,options[k]));
 void coop.signal(game,'hit',{targetSyncId:enemy._coopSyncId,targetVisit:enemy._coopVisit,
 targetId:enemy.id,kind:enemy.kind,x:enemy.x,y:enemy.y,damage,characterId:hero,...(Object.keys(dinoImpact).length?{dinoImpact}:{})});return true;
}
