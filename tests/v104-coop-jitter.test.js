import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { remoteMotionSample } from "../systems/coop-resilience.js";
import { remotePresenceCorrection, V95_PRESENCE } from "../systems/coop-v95-presence.js";
import { shouldUseSnapshot, snapshotStaleness, peerNetworkHealth } from "../systems/coop-v104-sync.js";
import { createRoomService } from "../netlify/lib/room-service.mjs";

test("V104 · real slow network samples use true elapsed time without extrapolation into nowhere",()=>{
 const prev={targetX:100,targetY:300,sampleAt:1000};
 const sample=remoteMotionSample(prev,180,316,1600,false);
 assert.equal(sample.previousSampleAt,1000);
 assert.equal(sample.sampleAt,1600);
 assert.equal(sample.teleport,false);
 const peer={...sample,x:100,y:300};
 const correction=remotePresenceCorrection(peer,1600);
 assert.ok(correction.x>=180);
 assert.ok(correction.x<=180+V95_PRESENCE.maxLeadPx);
 assert.ok(correction.sampleDt>=590);
 assert.ok(correction.opacity<=1&&correction.opacity>=V95_PRESENCE.minAlpha);
 const later=remotePresenceCorrection(peer,4000);
 assert.equal(later.x,180);
 assert.equal(later.y,316);
 assert.equal(later.stale,true);
 const teleport=remoteMotionSample(prev,2000,1200,1600,true);
 assert.equal(teleport.teleport,true);
 const stable=remotePresenceCorrection({...teleport,x:2000,y:1200},1800);
 assert.equal(stable.x,2000);
 assert.equal(stable.y,1200);
});

test("V104 · a late poll must never roll an online position back over a newer move reply",()=>{
 const current={roomId:"HOKU22",revision:28,players:[{x:810}]};
 assert.equal(shouldUseSnapshot(current,{roomId:"HOKU22",revision:27}),false);
 assert.equal(shouldUseSnapshot(current,{roomId:"HOKU22",revision:28}),true);
 assert.equal(shouldUseSnapshot(current,{roomId:"HOKU22",revision:29}),true);
 assert.equal(shouldUseSnapshot(current,{roomId:"OTHER",revision:30}),false);
 assert.equal(shouldUseSnapshot(null,current),true);
 assert.equal(shouldUseSnapshot(current,null),false);
 assert.equal(snapshotStaleness(current,{revision:22}),6);
 assert.equal(peerNetworkHealth(95,0).quality,"good");
 assert.equal(peerNetworkHealth(850,0).quality,"slow");
 assert.equal(peerNetworkHealth(80,1700).quality,"late");
 assert.equal(peerNetworkHealth(80,5000).quality,"lost");
});

class Store {
 entries=new Map();seq=0;
 async getWithMetadata(key){const x=this.entries.get(key);return x?{data:structuredClone(x.data),etag:x.etag}:null;}
 async setJSON(key,data,options={}){
  const old=this.entries.get(key);
  if(options.onlyIfNew&&old||options.onlyIfMatch&&(!old||old.etag!==options.onlyIfMatch))return {modified:false};
  const etag=String(++this.seq);this.entries.set(key,{data:structuredClone(data),etag});return {modified:true,etag};
 }
}
test("V104 · large or invented signals do not flood Netlify room storage",async()=>{
 const service=createRoomService(new Store(),{makeCode:()=>"QWERTY",makeCredential:()=>"secret"});
 const host=await service.create(),guest=await service.join(host.roomId);
 await service.choose(host.roomId,host.identity,"kilo");
 await service.choose(host.roomId,guest.identity,"cat");
 await service.ready(host.roomId,host.identity);
 await service.ready(host.roomId,guest.identity);
 await assert.rejects(service.signal(host.roomId,host.identity,{
   sequence:1,actionId:"invalid-kind",signalKind:"invented",payload:{roomId:"hub"}
 }),{code:"INVALID_SIGNAL"});
 await assert.rejects(service.signal(host.roomId,host.identity,{
   sequence:1,actionId:"overlarge",signalKind:"hit",payload:{roomId:"hub",body:"a".repeat(3000)}
 }),{code:"INVALID_SIGNAL"});
 const ok=await service.signal(host.roomId,host.identity,{
  sequence:1,actionId:"legal-action",signalKind:"action",payload:{action:"attack",roomId:"hub"}
 });
 assert.ok(ok.combat.events.some(e=>e.signalKind==="action"));
});
test("V104 · offline bundle and feature parity ready for automated CI",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const online=fs.readFileSync("systems/online-coop.js","utf8");
 const festival=fs.readFileSync("systems/v1002-festival.js","utf8");
 assert.match(sw,/const VERSION = "ohana-311"/);
 assert.match(html,/ohana-311/);
 assert.match(sw,/systems\/v104-living-stories\.js\?v=/);
 assert.match(sw,/systems\/coop-v104-sync\.js\?v=/);
 assert.match(online,/shouldUseSnapshot\(this\.snapshot,snapshot\)/);
 assert.match(online,/shouldUseSnapshot\(this\.snapshot,data\)/);
 assert.match(online,/dataset\.coopOutOfOrder/);
 assert.match(festival,/V104Memories\.collect\(item,this\.tickN\)/);
 assert.match(festival,/V104Memories\.draw\(ctx,cam,t/);
 assert.match(festival,/ohana-festival-v1002/);
});
