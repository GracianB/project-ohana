// Short-term tactical memory, owned by one player object and discarded on a
// fresh run. No network, no growing replay buffer, no hidden health scaling.
const memories=new WeakMap();
export function encounterMemory(player,tick){
 if(!player||typeof player!=='object')return {air:0,ranged:0};
 let m=memories.get(player);
 if(!m){m={air:0,ranged:0,last:-Infinity,lastCast:null};memories.set(player,m);}
 if(tick-m.last>=15||tick<m.last){
  m.last=tick;
  m.air=m.air*.94+(player.grounded===false?.06:0);
  const cast=player._cast;
  const shot=cast&&cast!==m.lastCast&&cast.slot===0;
  m.ranged=m.ranged*.96+(shot?.04:0);m.lastCast=cast;
 }
 return {air:m.air,ranged:m.ranged};
}
