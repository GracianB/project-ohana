import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { V106_MOMENTS,V106MemoryDirector,V106_LIFE,v106Moment } from "../systems/v106-final-memories.js";
import { MEMORY_MUSEUM_ROOMS,canRevisitMemory,paintMemoryPortrait,memoryAtlasData,authoredMemoryStory } from "../systems/v106-memory-gallery.js";
import { FESTIVAL_CATALOG,FESTIVAL_ROOMS,FESTIVAL_KEY } from "../systems/v1002-festival.js";
import { LIVING_MEMORIES } from "../systems/v102-living-memories.js";
import { V103_LIVING_MOMENTS } from "../systems/v103-living-stories.js";
import { V104_MOMENTS } from "../systems/v104-living-stories.js";
import { V105_MOMENTS } from "../systems/v105-living-stories.js";
function mockCanvas(){
 const ctx=new Proxy({ops:[],save(){this.ops.push("save");},restore(){this.ops.push("restore");}},{get(o,k){return k in o?o[k]:()=>{o.ops.push(String(k));};},set(o,k,v){o[k]=v;return true;}});
 return ctx;
}
test("V106 · all one hundred discoveries have 100 unique authored scenes, same original album",()=>{
 const all=[...LIVING_MEMORIES,...V103_LIVING_MOMENTS,...V104_MOMENTS,...V105_MOMENTS,...V106_MOMENTS];
 assert.equal(all.length,100);
 assert.equal(FESTIVAL_CATALOG.length,100);
 assert.equal(new Set(all.map(m=>m.id)).size,100);
 assert.ok(all.every(m=>FESTIVAL_CATALOG.some(it=>it.id===m.id)));
 assert.deepEqual([...new Set(V106_MOMENTS.map(x=>x.room))],["volcano","boss"]);
 assert.equal(V106_MOMENTS.length,20);
 assert.equal(new Set(V106_MOMENTS.map(m=>m.kind)).size,20);
 assert.equal(new Set(V106_MOMENTS.map(m=>m.story)).size,20);
 assert.equal(FESTIVAL_ROOMS.length,10);
 assert.equal(FESTIVAL_KEY,"ohana-festival-v1002");
 assert.match(v106Moment("boss-9").story,/Cien recuerdos/);
 assert.equal(v106Moment("reef-0"),null);
});
test("V106 · all twenty Caldera/Nest motifs render and respect reduced motion",()=>{
 const d=new V106MemoryDirector(),ctx=mockCanvas();
 for(const m of V106_MOMENTS){
  assert.equal(d.collect({id:m.id,x:210,y:160},20)?.id,m.id);
  d.draw(ctx,{x:0,y:0},44,{room:m.room,reduceMotion:false,w:400,h:400});
  d.draw(ctx,{x:0,y:0},44,{room:m.room,reduceMotion:true,w:400,h:400});
  assert.ok(d.events.length<=2);
 }
 assert.equal(d.triggered,20);
 assert.ok(ctx.ops.includes("stroke"));
 assert.ok(ctx.ops.includes("restore"));
 assert.deepEqual(d.events.map(e=>e.id),["boss-8","boss-9"]);
 d.draw(ctx,{x:0,y:0},20+V106_LIFE+1,{room:"boss"});
 assert.deepEqual(d.snapshot(20+V106_LIFE+1).active,[]);
 d.clear();assert.deepEqual(d.events,[]);
 assert.equal(d.collect({id:"reef-0",x:0,y:0}),null);
 assert.equal(d.collect({id:"volcano-0",x:NaN,y:0}),null);
});
test("V106 · museum never exposes undiscovered memories, keeps every collection intact",()=>{
 const claimed=new Set(["hub-0","volcano-1","boss-9"]);
 assert.deepEqual(MEMORY_MUSEUM_ROOMS,["hub","beach","jungle","cave","lab","ridge","space","reef","volcano","boss"]);
 assert.equal(canRevisitMemory("hub-0",claimed),true);
 assert.match(authoredMemoryStory("hub-0"),/abrazo/);
 assert.match(authoredMemoryStory("boss-9"),/Cien recuerdos/);
 assert.equal(authoredMemoryStory("unwritten-2"),null);
 assert.equal(canRevisitMemory("boss-9",claimed),true);
 assert.equal(canRevisitMemory("boss-8",claimed),false);
 assert.equal(canRevisitMemory("boss-9-malformed",claimed),false);
 assert.equal(canRevisitMemory("evil-0",new Set(["evil-0"])),false);
 assert.equal(canRevisitMemory(null,claimed),false);
 const atlas=memoryAtlasData(FESTIVAL_CATALOG,claimed);
 assert.deepEqual(atlas.map(x=>x.id),["hub-0","volcano-1","boss-9"]);
 assert.equal(claimed.size,3,"visiting must never mutate earned pieces");
 assert.equal(memoryAtlasData(FESTIVAL_CATALOG,new Set(FESTIVAL_CATALOG.map(x=>x.id))).length,100);
});
test("V106 · all one hundred museum portraits render without changing game runtime",()=>{
 const c=mockCanvas();
 for(const item of FESTIVAL_CATALOG) {
  assert.equal(paintMemoryPortrait(c,item.id,{width:220,height:220}),true,"museum portrait missing: "+item.id);
 }
 assert.ok(c.ops.includes("clearRect"));
 assert.ok(c.ops.includes("restore"));
 assert.equal(paintMemoryPortrait(c,"unknown-0"),false);
});
test("V106 · museum, atlas, final reward, browser and cache contracts",()=>{
 const festival=fs.readFileSync("systems/v1002-festival.js","utf8");
 const css=fs.readFileSync("v106-memory-museum.css","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const index=fs.readFileSync("index.html","utf8");
 const browser=fs.readFileSync("tests/browser/e2e.mjs","utf8");
 assert.match(festival,/V106Memories\.collect\(item,this\.tickN\)/);
 assert.match(festival,/V106Memories\.draw\(ctx,cam,t/);
 assert.match(festival,/V106Memories\.onRoom\(game\.roomId\)/);
 assert.match(festival,/V106Memories\.clear\(\)/);
 assert.match(festival,/canRevisitMemory\(id,this\.claimed\)/);
 assert.match(festival,/festival-grand-atlas/);
 assert.match(festival,/data-festival-memory/);
 assert.match(festival,/data-festival-finale/);
 assert.match(css,/festival-memory-preview/);
 assert.match(sw,/v106-final-memories\.js\?v=/);
 assert.match(sw,/v106-memory-gallery\.js\?v=/);
 assert.match(sw,/v106-memory-museum\.css\?v=/);
 assert.match(sw,/const VERSION = "ohana-313"/);
 assert.match(index,/ohana-313/);
 assert.match(browser,/portraitPixels/);
 assert.match(festival,/ohana-festival-v1002/);
});
