import {WORLD1_ORDER} from './world1-rooms.js';
export const FAMILY_MEMORY_KEY='ohana-family-memory-v500';
export function readFamilyMemory(storage){
 try {const s=storage??globalThis.localStorage;const raw=JSON.parse(s?.getItem(FAMILY_MEMORY_KEY)||'null');
 if(raw?.v!==1||raw.world!==1||!WORLD1_ORDER.includes(raw.hero))return null;
 return {v:1,world:1,hero:raw.hero,lights:[...new Set((Array.isArray(raw.lights)?raw.lights:[]).filter(id=>WORLD1_ORDER.includes(id)))]};
 } catch{return null;}
}
export function rememberFamilyVictory(detail,storage){
 if(Number(detail?.world)!==1||!WORLD1_ORDER.includes(detail.id))return null;
 const previous=readFamilyMemory(storage);
 const record={v:1,world:1,hero:detail.id,lights:previous?.lights||[]};
 try{(storage??globalThis.localStorage)?.setItem(FAMILY_MEMORY_KEY,JSON.stringify(record));}catch{}
 return record;
}
export function rememberFamilyLight(id,memory,storage){
 if(!memory||!WORLD1_ORDER.includes(id))return memory;
 const record={...memory,lights:[...new Set([...(memory.lights||[]),id])]};
 try{(storage??globalThis.localStorage)?.setItem(FAMILY_MEMORY_KEY,JSON.stringify(record));}catch{}
 return record;
}

// Compatibility: an older completed campaign already earned this epilogue.
// Never infer victory from seals alone; leave the original save untouched.
export function migrateFamilyMemory(storage){
 const existing=readFamilyMemory(storage);if(existing)return existing;
 try{
  const s=storage??globalThis.localStorage;const save=JSON.parse(s?.getItem('ohana')||'null');
  if(![2,3].includes(save?.v)||save.world1Won!==true||save.roomId!=='w1-final'||!Array.isArray(save.world1Seals)||!WORLD1_ORDER.every(id=>save.world1Seals?.includes(id)))return null;
  return rememberFamilyVictory({world:1,id:save.id},s);
 }catch{return null;}
}
