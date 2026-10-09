// OHANA V106 · The Memory Museum
// A still portrait of each *earned* discovery, never another reward or unlock.
// Drawing uses isolated temporary directors: the live game events remain intact.
import { LivingMemoryDirector,memoryMoment } from "./v102-living-memories.js";
import { V103MemoryDirector,v103Moment } from "./v103-living-stories.js";
import { V104MemoryDirector,v104Moment } from "./v104-living-stories.js";
import { V105MemoryDirector,v105Moment } from "./v105-living-stories.js";
import { V106MemoryDirector,v106Moment } from "./v106-final-memories.js";
const ENGINES=Object.freeze({
 hub:LivingMemoryDirector,beach:LivingMemoryDirector,
 jungle:V103MemoryDirector,cave:V103MemoryDirector,
 lab:V104MemoryDirector,ridge:V104MemoryDirector,
 space:V105MemoryDirector,reef:V105MemoryDirector,
 volcano:V106MemoryDirector,boss:V106MemoryDirector
});
export const MEMORY_MUSEUM_ROOMS=Object.freeze(Object.keys(ENGINES));
export function authoredMemoryStory(id){
 return memoryMoment(id)?.story||v103Moment(id)?.story||v104Moment(id)?.story||v105Moment(id)?.story||v106Moment(id)?.story||null;
}
export function canRevisitMemory(id,earnedIds){
 if(typeof id!=="string"||!earnedIds||typeof earnedIds.has!=="function"||!earnedIds.has(id))return false;
 const [room,slot,extra]=id.split("-");
 return !extra&&Object.hasOwn(ENGINES,room)&&/^(?:[0-9])$/.test(slot);
}
export function paintMemoryPortrait(ctx,id,{width=220,height=220}={}){
 if(!ctx||!Object.hasOwn(ENGINES,String(id).split("-")[0]))return false;
 const [room]=id.split("-");
 const type=ENGINES[room],director=new type(),x=width/2,y=height/2+37;
 if(!director.collect({id,x,y},0))return false;
 // No animation loop in the museum. Still frames are accessible and inexpensive.
 ctx.clearRect(0,0,width,height);
 director.draw(ctx,{x:0,y:0},35,{room,reduceMotion:true,w:width,h:height});
 director.clear();
 return true;
}
export function memoryAtlasData(catalog,claimed){
 const items=Array.isArray(catalog)?catalog:[];
 const set=claimed&&typeof claimed.has==="function"?claimed:new Set();
 return items.filter(x=>x&&canRevisitMemory(x.id,set)).map(x=>({id:x.id,room:x.room,title:x.title,description:x.description,color:x.color}));
}
