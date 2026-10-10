import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { V105_MOMENTS, V105MemoryDirector, V105Memories, V105_TICKS, v105Moment } from "../systems/v105-living-stories.js";
import { FESTIVAL_CATALOG,FESTIVAL_ROOMS,FESTIVAL_KEY } from "../systems/v1002-festival.js";
import { LIVING_MEMORIES } from "../systems/v102-living-memories.js";
import { V103_LIVING_MOMENTS } from "../systems/v103-living-stories.js";
import { V104_MOMENTS } from "../systems/v104-living-stories.js";
const canvas=()=>new Proxy({ops:[],save(){this.ops.push("save");},restore(){this.ops.push("restore");}},{
 get(o,k){return k in o?o[k]:()=>{o.ops.push(String(k));};},
 set(o,k,v){o[k]=v;return true;}
});
test("V105 · 20 unique Orbit and Reef scenes extend 60 existing stories, never pickups",()=>{
 const authored=[...LIVING_MEMORIES,...V103_LIVING_MOMENTS,...V104_MOMENTS,...V105_MOMENTS];
 assert.equal(authored.length,80);
 assert.equal(new Set(authored.map(x=>x.id)).size,80);
 assert.equal(V105_MOMENTS.length,20);
 assert.deepEqual([...new Set(V105_MOMENTS.map(x=>x.room))],["space","reef"]);
 assert.equal(new Set(V105_MOMENTS.map(x=>x.kind)).size,20);
 assert.equal(new Set(V105_MOMENTS.map(x=>x.story)).size,20);
 assert.ok(V105_MOMENTS.every(x=>FESTIVAL_CATALOG.some(item=>item.id===x.id)));
 assert.equal(FESTIVAL_CATALOG.length,100);
 assert.equal(FESTIVAL_ROOMS.length,10);
 assert.equal(FESTIVAL_KEY,"ohana-festival-v1002");
 assert.equal(v105Moment("volcano-0"),null);
});
test("V105 · all motifs draw; events have two-slot cap and honor reduced motion",()=>{
 const director=new V105MemoryDirector(),ctx=canvas();
 for(const moment of V105_MOMENTS){
  assert.equal(director.collect({id:moment.id,x:400,y:200},20)?.id,moment.id);
  director.draw(ctx,{x:0,y:0},40,{room:moment.room,w:900,h:600});
  director.draw(ctx,{x:0,y:0},40,{room:moment.room,w:320,h:300,reduceMotion:true});
  assert.ok(director.events.length<=2);
 }
 assert.equal(director.triggered,20);
 assert.ok(ctx.ops.includes("stroke")&&ctx.ops.includes("restore"));
 assert.deepEqual(director.events.map(e=>e.id),["reef-8","reef-9"]);
 director.draw(ctx,{x:0,y:0},20+V105_TICKS+1,{room:"reef"});
 assert.deepEqual(director.snapshot(20+V105_TICKS+1).active,[]);
 director.clear();assert.deepEqual(director.events,[]);
 assert.equal(director.collect({id:"lab-0",x:0,y:0},100),null);
 assert.equal(director.collect({id:"space-0",x:NaN,y:0},100),null);
 V105Memories.clear();
});
test("V105 · off-screen effects do not draw and room changes reset scenes",()=>{
 const d=new V105MemoryDirector(),ctx=canvas();
 for(let i=0;i<10;i++)d.collect({id:"space-"+i,x:500+i,y:300},40+i);
 assert.equal(d.events.length,2);
 d.draw(ctx,{x:2000,y:0},60,{room:"space",w:320,h:240});
 assert.equal(ctx.ops.includes("save"),false);
 assert.equal(d.collect({id:"reef-0",x:90,y:90},70)?.id,"reef-0");
 assert.deepEqual(d.snapshot(70).active,["reef-0"]);
 d.onRoom("boss");assert.deepEqual(d.events,[]);
});
test("V105 · offline, browser and gameplay integration share a single cache",()=>{
 const js=fs.readFileSync("systems/v1002-festival.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const e2e=fs.readFileSync("tests/browser/e2e.mjs","utf8");
 assert.match(js,/V105Memories\.collect\(item,this\.tickN\)/);
 assert.match(js,/V105Memories\.draw\(ctx,cam,t/);
 assert.match(js,/V105Memories\.onRoom\(game\.roomId\)/);
 assert.match(js,/V105Memories\.clear\(\)/);
 assert.match(js,/ohana-festival-v1002/);
 assert.match(sw,/systems\/v105-living-stories\.js\?v=/);
 assert.match(sw,/const VERSION = "ohana-314"/);
 assert.match(html,/ohana-314/);
 assert.match(e2e,/v105Probe/);
});
