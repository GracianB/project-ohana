// Shared by terrain, WebRTC validation and the authenticated HTTP fallback.
export const WORLD_BOUNDS=Object.freeze(Object.fromEntries(
 ['hub','beach','jungle','cave','lab','ridge','space','reef','volcano','boss'].map(id=>
  [id,Object.freeze({width:id==='hub'?4200:id==='boss'?3360:7200,height:1260})])
));
export function worldBounds(id){return typeof id==="string"&&Object.hasOwn(WORLD_BOUNDS,id)?WORLD_BOUNDS[id]:null;}
