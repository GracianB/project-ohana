// V2 · Character-aware combat without per-enemy generative models.
// Pure, bounded decisions. No future input reading, no hidden damage/HP
// changes, no persistent profiling and no expensive nearest-neighbour scans.
const role=(name,allowed)=>allowed.includes(name);
const liveCast=(player,tick)=>player?._cast?.slot===0 &&
  Number.isFinite(Number(player._cast.t))&&tick>=player._cast.t&&tick-player._cast.t<85;
const choice=(intent,read)=>Object.freeze({intent,read});
export function heroCounterplay(enemy,player,{role:enemyRole='',distance=Infinity,pack=0,tick=0,committed=false}={}){
 if(!enemy||!player||committed||player.dead||!(distance<540))return null;
 const id=player.id||'',vx=Math.abs(Number(player.vx)||0),vy=Number(player.vy)||0;
 // A heavy landing has an actual lead-in. Nearby ground fighters dodge to
 // the flank instead of standing under the impact; snipers fall back.
 if(id==='dino'&&player.grounded===false&&vy>=3&&distance<260){
  if(role(enemyRole,['BRUISER','SWARM']))return choice('FLANK','DINO_LANDING');
  if(enemyRole==='ARTILLERY')return choice('RETREAT','DINO_LANDING');
 }
 // Pizza is dangerous when rolling into the opponent's personal space.
 if(id==='pizza'&&vx>4&&distance<185&&enemyRole==='ARTILLERY')
  return choice('RETREAT','PIZZA_BOUNCE');
 // Agile heroes force hunters to intercept their path rather than chase
 // their old position. The attack coordinator still caps simultaneity.
 if(['cuerno','chispin','stitcho','frita'].includes(id)&&vx>=5&&distance<460&&
    role(enemyRole,['SKIRMISHER','AMBUSHER']))
  return choice('FLANK','FAST_HERO');
 // Chispín's chain lightning teaches clustered ranged foes to spread.
 if(id==='chispin'&&pack>=1&&liveCast(player,tick)&&enemyRole==='ARTILLERY')
  return choice('RETREAT','CHAIN_SPREAD');
 // Air specialists change the engagement distance of ground marksmen.
 if(['dragon','cat','kilo'].includes(id)&&player.grounded===false&&distance<460&&
    role(enemyRole,['ARTILLERY','SKIRMISHER']))
  return choice('PRESS','AIR_TARGET');
 // Yomi reads opponents; enemies can visibly learn to reposition after ping,
 // but their health and attack budget are never strengthened.
 if(id==='yomi'&&liveCast(player,tick)&&distance<420&&enemyRole==='ARTILLERY')
  return choice('RETREAT','YOMI_PING');
 return null;
}
