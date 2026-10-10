import test from "node:test";
import assert from "node:assert/strict";
import {splitDirectDescription,createDirectAssembler} from "../systems/coop-v108-direct.js";
import {createRoomService} from "../netlify/lib/room-service.mjs";

class Store {
  entries=new Map();i=0;
  async getWithMetadata(key){const e=this.entries.get(key);return e?{data:structuredClone(e.data),etag:e.etag}:null;}
  async setJSON(key,data,opts={}){
    const old=this.entries.get(key);
    if((opts.onlyIfNew&&old)||(opts.onlyIfMatch&&(!old||old.etag!==opts.onlyIfMatch)))return {modified:false};
    const etag=String(++this.i);this.entries.set(key,{data:structuredClone(data),etag});
    return {modified:true,etag};
  }
}
test("V110: an ordinary SDP offer crosses Netlify in ONE authenticated event",async()=>{
 const sdp="v=0\n"+"a=candidate:1 1 UDP 2113937151 192.0.2.1 5555 typ host\n".repeat(155);
 const parts=splitDirectDescription("offer","rtc-session-v110",sdp);
 assert.equal(parts.length,1,"SDP under 12 KB should need only one mutation");
 assert.ok(JSON.stringify({...parts[0],roomId:"hub"}).length<12400);
 const assembler=createDirectAssembler();
 assert.deepEqual(assembler.accept(parts[0]),{kind:"offer",sid:"rtc-session-v110",sdp});
 let n=0;
 const service=createRoomService(new Store(),{makeCode:()=>"HKU225",makeCredential:()=>"secret-"+(++n)});
 const host=await service.create(),guest=await service.join(host.roomId);
 await service.choose(host.roomId,host.identity,"kilo");
 await service.choose(host.roomId,guest.identity,"cat");
 await service.ready(host.roomId,host.identity);
 await service.ready(host.roomId,guest.identity);
 const packet={...parts[0],roomId:"hub"};
 await service.signal(host.roomId,host.identity,{sequence:1,actionId:"v110:offer:1",signalKind:"action",payload:packet});
 const received=await service.poll(host.roomId,guest.identity);
 const event=received.combat?.events?.find(e=>e.kind==="online-signal"&&e.payload?.sid==="rtc-session-v110");
 assert.ok(event,"remote player must see authentic RTC offer");
 assert.deepEqual(createDirectAssembler().accept(event.payload),{kind:"offer",sid:"rtc-session-v110",sdp});
 await assert.rejects(service.signal(host.roomId,host.identity,{
   sequence:2,actionId:"v110:oversized-action",signalKind:"action",
   payload:{action:"attack",roomId:"hub",data:"x".repeat(6000)}
 }),e=>e.code==="INVALID_SIGNAL","non-RTC actions must retain the old limit");
 await assert.rejects(service.signal(host.roomId,host.identity,{
   sequence:3,actionId:"v110:oversized-rtc",signalKind:"action",
   payload:{...packet,data:"v=0\n"+"x".repeat(12001)}
 }),e=>e.code==="INVALID_SIGNAL","no RTC frame can exceed its cap");
});
test("V110: large gathered SDP remains segmented, bounded, and reorderable",()=>{
 const sdp="v=0\n"+"a=ice-ufrag:example\n".repeat(1300);
 const parts=splitDirectDescription("answer","rtc-large-v110",sdp);
 assert.ok(parts.length>1&&parts.length<=4);
 const assembler=createDirectAssembler();
 assert.equal(assembler.accept(parts.at(-1)),null);
 for(const part of parts.slice(0,-1)){
   const complete=assembler.accept(part);
   if(part===parts.at(-2))assert.deepEqual(complete,{kind:"answer",sid:"rtc-large-v110",sdp});
   else assert.equal(complete,null);
 }
 assert.deepEqual(splitDirectDescription("answer","rtc-large-v110","v=0"+"x".repeat(50000)),[]);
});
