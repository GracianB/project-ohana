// OHANA cooperative challenge: explicit, bounded scaling. Never applied offline.
export const COOP_CHALLENGE=Object.freeze({foeHp:1.75,bossHp:1.9});
export function applyCoopChallenge(enemy,online){
 if(!online||!enemy||enemy._coopChallengeApplied)return enemy;
 const factor=enemy.boss?COOP_CHALLENGE.bossHp:COOP_CHALLENGE.foeHp;
 const hp=Number(enemy.hp),max=Number(enemy.max);
 if(!Number.isFinite(hp)||!Number.isFinite(max)||max<=0)return enemy;
 enemy.max=Math.max(1,Math.ceil(max*factor));
 enemy.hp=Math.max(0,Math.min(enemy.max,Math.ceil(hp*factor)));
 enemy._coopChallengeApplied=true;
 return enemy;
}
