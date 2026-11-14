// Physical Michi chapter pilot routing. Pure planning over authored passage IDs.
// The caller must walk to the selected arch and press the REAL E key.
// Never writes to a game object, grants a farol or teleports the actor.
export const MICHI_FAROL_ZONES=Object.freeze(['court','crypt','maze','canopy','gallery']);
const zoneAt=(zones,x,floor)=>zones.find(z=>x>=z.x&&x<z.x+z.w&&Math.abs(z.floor-floor)<6)?.id||null;
export function michiNextPassage(room,source,target,lit=0,sealed=false,echoes=0){
 const r=room?.michiSanctuary;
 if(!r||!source||!target||source===target)return null;
 const q=[{zone:source,first:null}],visited=new Set();
 while(q.length){
  const node=q.shift();if(visited.has(node.zone))continue;visited.add(node.zone);
  if(node.zone===target)return node.first;
  for(const a of r.passages){
   if(a.need>lit||a.exit&&(!sealed||echoes<3))continue;
   if(zoneAt(r.zones,a.x,a.floor)!==node.zone)continue;
   const dest=zoneAt(r.zones,a.toX,a.toFloor);
   if(dest&&!visited.has(dest))q.push({zone:dest,first:node.first||a});
  }
 }
 return null;
}
export function michiZoneAtArrival(room,passage){
 return zoneAt(room.michiSanctuary.zones,passage.toX,passage.toFloor);
}


export function michiShouldDescendToArch(player,passage){
 if(!player||!passage||!player.grounded)return false;
 const center=player.x+player.w/2,foot=player.y+player.h;
 // A real DOWN keypress drops through the current thin ledge, never the solid floor.
 return Math.abs(center-passage.x)<80&&foot<passage.floor-95;
}
