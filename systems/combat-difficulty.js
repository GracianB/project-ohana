// One selection controls both encounter decisions and combat numbers.
export const COMBAT_DIFFICULTIES=Object.freeze({
 easy:Object.freeze({health:.7,damage:.55,budget:1,windup:1.3,cooldown:1.35,pace:.8,lead:7}),
 normal:Object.freeze({health:1,damage:1,budget:2,windup:.85,cooldown:.85,pace:1,lead:15}),
 hard:Object.freeze({health:1.45,damage:1.4,budget:3,windup:.8,cooldown:.65,pace:1.15,lead:19})
});
export function combatDifficulty(value){return COMBAT_DIFFICULTIES[value]||COMBAT_DIFFICULTIES.normal;}
export function readCombatDifficulty(){try{return combatDifficulty(globalThis.localStorage?.getItem('ohana-difficulty'));}catch{return COMBAT_DIFFICULTIES.normal;}}
export function scaleCombatHealth(enemy,profile=readCombatDifficulty()){
 if(!enemy)return enemy;
 enemy.max=Math.max(1,Math.ceil((enemy.max||enemy.hp||1)*profile.health));enemy.hp=enemy.max;enemy._combatHealthScaled=true;return enemy;
}
