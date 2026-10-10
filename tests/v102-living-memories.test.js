import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { LIVING_MEMORIES, MEMORY_TICKS, memoryMoment, livingMemoryCount, LivingMemoryDirector } from "../systems/v102-living-memories.js";
import { FESTIVAL_CATALOG, FESTIVAL_ROOMS } from "../systems/v1002-festival.js";
import { createRoomService } from "../netlify/lib/room-service.mjs";

class MemoryStore {
  entries=new Map(); counter=0;
  async getWithMetadata(key){const v=this.entries.get(key);return v?{data:structuredClone(v.data),etag:v.etag}:null;}
  async setJSON(key,data,options={}) {
    const previous=this.entries.get(key);
    if(options.onlyIfNew&&previous||options.onlyIfMatch&&(!previous||previous.etag!==options.onlyIfMatch))return {modified:false};
    const etag='"'+(++this.counter)+'"';
    this.entries.set(key,{data:structuredClone(data),etag});
    return {modified:true,etag};
  }
}
function fakeCanvas(){
  const ops=[];
  const context=new Proxy({save(){ops.push("save");},restore(){ops.push("restore");}},{
    get(target,prop){if(prop in target)return target[prop];if(prop==="ops")return ops;return (...args)=>{ops.push(String(prop));};},
    set(target,prop,value){target[prop]=value;return true;}
  });
  return context;
}
test("V102: exact twenty original moments, five kinds of memories remain unaffected",()=>{
  assert.equal(LIVING_MEMORIES.length,20);
  assert.equal(new Set(LIVING_MEMORIES.map(m=>m.id)).size,20);
  assert.equal(new Set(LIVING_MEMORIES.map(m=>m.kind)).size,20);
  assert.equal(new Set(LIVING_MEMORIES.map(m=>m.story)).size,20);
  for(const m of LIVING_MEMORIES){
    assert.ok(FESTIVAL_CATALOG.some(it=>it.id===m.id));
    assert.ok(["hub","beach"].includes(m.room));
    assert.equal(memoryMoment(m.id),m);
  }
  assert.equal(FESTIVAL_CATALOG.length,100);
  assert.equal(FESTIVAL_ROOMS.length,10);
  assert.equal(livingMemoryCount(LIVING_MEMORIES.map(x=>x.id).concat(["hub-0","volcano-1"])),20);
  assert.equal(memoryMoment("jungle-0"),null);
});
test("V102: drawing twenty different moments is bounded, world-scoped and reduced-motion safe",()=>{
  const director=new LivingMemoryDirector();
  const ctx=fakeCanvas();
  for(let i=0;i<10;i++)director.collect({id:"hub-"+i,x:200+i*10,y:290},i*5);
  assert.equal(director.totalTriggered,10);
  assert.ok(director.events.length<=3);
  director.draw(ctx,{x:100,y:0},70,{room:"hub",reduceMotion:false,w:1200,h:720});
  assert.ok(ctx.ops.includes("stroke"));
  assert.ok(ctx.ops.includes("restore"));
  assert.ok(director.snapshot(70).active.length<=3);
  const small=fakeCanvas();
  director.draw(small,{x:100,y:0},70,{room:"hub",reduceMotion:true,w:300,h:190});
  assert.equal(director.collect({id:"beach-3",x:140,y:330},100)?.kind,"cangrejo");
  assert.deepEqual(director.events.map(x=>x.id),["beach-3"]);
  director.draw(fakeCanvas(),{x:0,y:0},100+MEMORY_TICKS+1,{room:"beach"});
  assert.equal(director.snapshot(100+MEMORY_TICKS+1).active.length,0);
  assert.equal(director.collect({id:"volcano-7",x:200,y:200},100),null);
});
test("V102: reconnect to original online engine preserves both players, room and identity epoch",async()=>{
  const store=new MemoryStore();
  let now=1_800_000_000_000;
  let seq=0;
  const svc=createRoomService(store,{now:()=>now,makeCode:()=> "MVES22",makeCredential:()=> "secure-"+(++seq)});
  const host=await svc.create();
  const guest=await svc.join(host.roomId);
  await svc.choose(host.roomId,host.identity,"kilo");
  await svc.choose(host.roomId,guest.identity,"cat");
  await svc.ready(host.roomId,host.identity);
  await svc.ready(host.roomId,guest.identity);
  const engineMove=(identity,sequence,positionX,room)=>svc.move(host.roomId,identity,{
    actionId:identity.playerId+":engine:"+sequence,sequence,mode:"engine",
    positionX,positionY:1070,worldRoomId:room,evolution:2,experience:99,
    health:71,maxHealth:100,velocityX:0,velocityY:0,grounded:true
  });
  await engineMove(host.identity,1,720,"beach");
  await engineMove(guest.identity,1,800,"beach");
  const before=await svc.poll(host.roomId,host.identity);
  assert.equal(before.engineMode,true);
  await svc.disconnect(host.roomId,guest.identity);
  now+=2000;
  const rejoined=await svc.join(host.roomId,guest.identity);
  assert.equal(rejoined.phase,"playing");
  assert.ok(rejoined.identity.connectionEpoch>guest.identity.connectionEpoch);
  for(const slot of [0,1]){
    const oldP=before.players.find(p=>p.slot===slot),newP=rejoined.players.find(p=>p.slot===slot);
    assert.equal(newP.x,oldP.x,"player "+slot+" should not be sent back to spawn");
    assert.equal(newP.worldRoomId,oldP.worldRoomId);
    assert.equal(newP.evolution,oldP.evolution);
    assert.equal(newP.experience,oldP.experience);
  }
  await assert.rejects(svc.poll(host.roomId,guest.identity),{code:"STALE_SESSION"});
  assert.equal((await svc.poll(host.roomId,rejoined.identity)).phase,"playing");
});
test("V102: integration has request timeout, recoverable identity and 305 cache",()=>{
  const js=fs.readFileSync("systems/v1002-festival.js","utf8");
  const coop=fs.readFileSync("systems/online-coop.js","utf8");
  const sw=fs.readFileSync("sw.js","utf8");
  const html=fs.readFileSync("index.html","utf8");
  assert.match(js,/LivingMemories\.collect\(item,this\.tickN\)/);
  assert.match(js,/LivingMemories\.draw\(ctx,cam,t/);
  assert.match(coop,/async resumeSession\(\)/);
  assert.match(coop,/action:"join",roomId:this\.roomId,identity:this\.identity/);
  assert.match(coop,/ONLINE · ESPERANDO COMPAÑERO/);
  assert.match(coop,/NETWORK_TIMEOUT/);
  assert.match(coop,/identity:this\.identity,sequence,actionId:makeActionId/);
  assert.match(sw,/systems\/v102-living-memories\.js\?v=/);
  assert.match(sw,/const VERSION = "ohana-315"/);
  assert.match(html,/ohana-315/);
  assert.match(js,/ohana-festival-v1002/);
});
