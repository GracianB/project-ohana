// Shared by terrain, WebRTC validation and the authenticated HTTP fallback.
export const WORLD_BOUNDS=Object.freeze(Object.fromEntries(
 ['hub','beach','jungle','cave','lab','ridge','space','reef','volcano','boss'].map(id=>
  [id,Object.freeze({width:id==='hub'?4200:id==='boss'?3360:7200,height:1260})])
));
// The Hero World extends to 14,400 physical units (not the old 7,200 cap).
const WORLD1_BOUNDS=Object.freeze({width:14400,height:1260});
const WORLD1_FINALE_BOUNDS=Object.freeze({width:12000,height:1260});
const W1=new Set(['w1-kilo','w1-stitcho','w1-chispin','w1-cat','w1-cuerno','w1-dragon','w1-dino','w1-frita','w1-pizza','w1-yomi']);
export function worldBounds(id){
 if(typeof id!=='string')return null;
 if(Object.hasOwn(WORLD_BOUNDS,id))return WORLD_BOUNDS[id];
 if(W1.has(id))return WORLD1_BOUNDS;
 if(id==='w1-final')return WORLD1_FINALE_BOUNDS;
 return null;
}
