import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { V104_MOMENTS,V104Memories,V104MemoryDirector,V104_LIFETIME,v104Moment } from "../systems/v104-living-stories.js";
import { FESTIVAL_CATALOG,FESTIVAL_ROOMS,FESTIVAL_KEY,FESTIVAL_TOTAL } from "../systems/v1002-festival.js";
import { LIVING_MEMORIES } from "../systems/v102-living-memories.js";
import { V103_LIVING_MOMENTS } from "../systems/v103-living-stories.js";
const canvas=()=>new Proxy({save(){},restore(){}},{get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>{o[k]=v;return true;}});
test("V104: authored 41–60 are unique Lab/Ridge memories, not extra collectibles",()=>{
 assert.equal(V104_MOMENTS.length,20);
 assert.deepEqual([...new Set(V104_MOMENTS.map(m=>m.room))],["lab","ridge"]);
 assert.equal(new Set(V104_MOMENTS.map(m=>m.id)).size,20);
 assert.equal(new Set(V104_MOMENTS.map(m=>m.kind)).size,20);
 assert.equal(new Set(V104_MOMENTS.map(m=>m.story)).size,20);
 assert.ok(V104_MOMENTS.every(m=>FESTIVAL_CATALOG.some(it=>it.id===m.id)));
 assert.equal(FESTIVAL_TOTAL,100);
 assert.equal(FESTIVAL_CATALOG.length,100);
 assert.equal(FESTIVAL_ROOMS.length,10);
 assert.equal(FESTIVAL_KEY,"ohana-festival-v1002");
 const already=[...LIVING_MEMORIES,...V103_LIVING_MOMENTS,...V104_MOMENTS];
 assert.equal(already.length,60);
 assert.equal(new Set(already.map(m=>m.id)).size,60);
 assert.equal(v104Moment("jungle-3"),null);
});
test("V104: 20 visual motifs draw safely, never allocate unlimited events",()=>{
 const director=new V104MemoryDirector(),fake=canvas();
 for(const moment of V104_MOMENTS) {
   assert.ok(director.collect({id:moment.id,x:400,y:200},12));
   director.draw(fake,{x:0,y:0},12,{room:moment.room,w:800,h:500});
   director.draw(fake,{x:0,y:0},13,{room:moment.room,w:320,h:260,reduceMotion:true});
   assert.ok(director.events.length<=2);
 }
 assert.equal(director.triggered,20);
 assert.deepEqual(director.events.map(e=>e.id),["ridge-8","ridge-9"]);
 director.draw(fake,{x:0,y:0},12+V104_LIFETIME+2,{room:"ridge"});
 assert.deepEqual(director.snapshot(12+V104_LIFETIME+2).active,[]);
 director.clear();
 assert.deepEqual(director.events,[]);
 assert.equal(director.collect({id:"reef-0",x:0,y:0},100),null);
 assert.equal(director.collect({id:"lab-0",x:NaN,y:0},100),null);
 V104Memories.clear();
});
test("V104: gameplay, E2E, offline precache and cache versions stay in sync",()=>{
 const game=fs.readFileSync("systems/v1002-festival.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const e2e=fs.readFileSync("tests/browser/e2e.mjs","utf8");
 assert.match(game,/V104Memories\.collect\(item,this\.tickN\)/);
 assert.match(game,/V104Memories\.draw\(ctx,cam,t/);
 assert.match(game,/V104Memories\.onRoom\(game\.roomId\)/);
 assert.match(game,/V104Memories\.clear\(\)/);
 assert.match(sw,/v104-living-stories\.js\?v=/);
 assert.match(sw,/const VERSION = "ohana-310"/);
 assert.match(html,/ohana-310/);
 assert.match(e2e,/V104_MOMENTS/);
 assert.match(game,/ohana-festival-v1002/);
});
