import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { networkPacing,shouldSendPosition,roundtripEWMA,COOP_BUDGET } from "../systems/coop-v103-pacing.js";
import { V103_LIVING_MOMENTS,V103Memories,v103Moment } from "../systems/v103-living-stories.js";
import { FESTIVAL_CATALOG } from "../systems/v1002-festival.js";
import { createRoomService } from "../netlify/lib/room-service.mjs";

class CountedStore {
  entries=new Map();reads=0;writes=0;
  async getWithMetadata(key){this.reads++;const e=this.entries.get(key);return e?{data:structuredClone(e.data),etag:e.etag}:null;}
  async setJSON(key,value,options={}){
    const current=this.entries.get(key);
    if(options.onlyIfNew&&current||options.onlyIfMatch&&(!current||current.etag!==options.onlyIfMatch))return {modified:false};
    this.writes++;
    this.entries.set(key,{data:structuredClone(value),etag:'"'+this.writes+'"'});
    return {modified:true,etag:'"'+this.writes+'"'};
  }
}
const ctx=()=>new Proxy({save(){},restore(){}},{get:(o,key)=>o[key]||(()=>{}),set:(o,key,v)=>{o[key]=v;return true;}});
test("V103: rate budget lowers function load without slowing local controls",()=>{
 const fast=networkPacing(60,0),slow=networkPacing(900,2),waiting=networkPacing(300,0,true);
 assert.ok(fast.moveMs>=250&&fast.moveMs<=400);
 assert.ok(fast.pollMs>=650);
 assert.ok(slow.moveMs>fast.moveMs);
 assert.ok(slow.pollMs>fast.pollMs);
 assert.ok(waiting.pollMs>fast.pollMs);
 assert.ok(slow.moveMs<=COOP_BUDGET.maxMoveMs);
 assert.ok(slow.pollMs<=COOP_BUDGET.maxPollMs);
 const pose={positionX:420,positionY:1070,facing:1,evolution:2,experience:30,health:71,maxHealth:90,grounded:true,melee:0,dash:0,worldRoomId:"hub"};
 assert.equal(shouldSendPosition(pose,{...pose},90,fast),false);
 assert.equal(shouldSendPosition(pose,{...pose},500,fast),false,"idle movement must not POST");
 assert.equal(shouldSendPosition(pose,{...pose},2800,fast),true,"idle heartbeat prevents stale expiry");
 assert.equal(shouldSendPosition(pose,{...pose,positionX:440},fast.moveMs,fast),true);
 assert.equal(shouldSendPosition(pose,{...pose,health:30},fast.moveMs,fast),true);
 assert.equal(shouldSendPosition(pose,{...pose,worldRoomId:"jungle"},fast.moveMs,fast),true);
 assert.equal(shouldSendPosition(pose,pose,0,fast,true),true,"first engine sync");
 assert.equal(roundtripEWMA(0,170),170);
 assert.ok(roundtripEWMA(170,600)>170&&roundtripEWMA(170,600)<600);
});
test("V103: exactly twenty original Jungle and Cave moments, bounded and no new collectibles",()=>{
 assert.equal(V103_LIVING_MOMENTS.length,20);
 assert.equal(new Set(V103_LIVING_MOMENTS.map(x=>x.id)).size,20);
 assert.equal(new Set(V103_LIVING_MOMENTS.map(x=>x.kind)).size,20);
 assert.equal(new Set(V103_LIVING_MOMENTS.map(x=>x.story)).size,20);
 assert.ok(V103_LIVING_MOMENTS.every(x=>["jungle","cave"].includes(x.room)));
 assert.ok(V103_LIVING_MOMENTS.every(x=>FESTIVAL_CATALOG.some(it=>it.id===x.id)));
 assert.equal(FESTIVAL_CATALOG.length,100);
 V103Memories.clear();
 const jungle=V103_LIVING_MOMENTS.filter(x=>x.room==="jungle");
 for(let i=0;i<jungle.length;i++)V103Memories.collect({id:jungle[i].id,x:420+i*6,y:800},i*5);
 assert.equal(V103Memories.triggered>=10,true);
 assert.ok(V103Memories.events.length<=2,"capped memory effects");
 V103Memories.draw(ctx(),{x:100,y:450},55,{room:"jungle",w:1200,h:700});
 V103Memories.draw(ctx(),{x:100,y:450},55,{room:"jungle",reduceMotion:true,w:320,h:250});
 V103Memories.collect({id:"cave-0",x:300,y:800},100);
 assert.deepEqual(V103Memories.events.map(x=>x.id),["cave-0"]);
 assert.equal(v103Moment("beach-0"),null);
 V103Memories.clear();
});
test("V103: engine poll is read-only until heartbeat or stale-peer check",async()=>{
 let now=1_800_000_000_000;
 const store=new CountedStore();
 const service=createRoomService(store,{now:()=>now,makeCode:()=> "QWERTY",makeCredential:()=> "secret"});
 const host=await service.create(),guest=await service.join(host.roomId);
 await service.choose(host.roomId,host.identity,"kilo");
 await service.choose(host.roomId,guest.identity,"cat");
 await service.ready(host.roomId,host.identity);
 await service.ready(host.roomId,guest.identity);
 await service.move(host.roomId,host.identity,{mode:"engine",sequence:1,actionId:"engine:host:1",positionX:510,positionY:1070,worldRoomId:"hub"});
 const before=store.writes;
 for(let i=0;i<7;i++){
  now+=200;
  const snapshot=await service.poll(host.roomId,host.identity);
  assert.equal(snapshot.engineMode,true);
  assert.equal(snapshot.players.length,2);
 }
 assert.equal(store.writes,before,"unchanged poll must not write Blobs");
 now+=4800;
 await service.poll(host.roomId,host.identity);
 assert.ok(store.writes>before,"heartbeat still persists connection");
});
test("V103: complete service worker and release bundles include gameplay changes",()=>{
 const html=fs.readFileSync("index.html","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const online=fs.readFileSync("systems/online-coop.js","utf8");
 const festival=fs.readFileSync("systems/v1002-festival.js","utf8");
 assert.match(html,/ohana-309/);
 assert.match(sw,/const VERSION = "ohana-309"/);
 assert.match(sw,/systems\/v103-living-stories\.js\?v=/);
 assert.match(sw,/systems\/coop-v103-pacing\.js\?v=/);
 assert.match(online,/shouldSendPosition\(/);
 assert.match(online,/this\.lastSnapshotAt/);
 assert.match(online,/recordNetworkReply\(/);
 assert.match(online,/if\(vx < -240/);
 assert.match(festival,/V103Memories\.collect\(item,this\.tickN\)/);
 assert.match(festival,/V103Memories\.draw\(ctx,cam,t/);
 assert.match(festival,/ohana-festival-v1002/);
});
