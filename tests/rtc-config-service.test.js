import test from "node:test";
import assert from "node:assert/strict";
import {createRoomService} from "../netlify/lib/room-service.mjs";
import {getRtcConfig,createRtcConfigHandler} from "../netlify/lib/rtc-config-service.mjs";
import {onlineCoop} from "../systems/online-coop.js";

class Store{
 entries=new Map();i=0;
 async getWithMetadata(key){const e=this.entries.get(key);return e?structuredClone(e):null;}
 async setJSON(key,data,options={}){
  const old=this.entries.get(key);
  if(options.onlyIfNew&&old||options.onlyIfMatch&&old?.etag!==options.onlyIfMatch)return {modified:false};
  const etag=String(++this.i);this.entries.set(key,{data:structuredClone(data),etag});return {modified:true,etag};
 }
}
const env={OHANA_CF_TURN_KEY_ID:"test-cloudflare-key-id",OHANA_CF_TURN_API_TOKEN:"server-secret-never-in-response"};
const credential={urls:["turns:turn.cloudflare.com:443?transport=tcp"],username:"temporary-user",credential:"temporary-credential"};
const provider=async()=>({ok:true,json:async()=>({iceServers:[credential]})});
async function room(){const service=createRoomService(new Store());const host=await service.create();return {service,body:{roomId:host.roomId,identity:host.identity}};}

test("HTTP credential endpoint authenticates before touching the provider and returns no-store",async()=>{
 const {service,body}=await room();let calls=0;
 const handler=createRtcConfigHandler({service,store:new Store(),env,fetchImpl:async()=>{calls++;return provider();}});
 const request=value=>new Request("https://ohana.test/.netlify/functions/rtc-config",{method:"POST",body:JSON.stringify(value)});
 const bad=await handler(request({...body,identity:{...body.identity,token:"wrong"}}));
 assert.equal(bad.status,401);assert.equal(calls,0);
 const good=await handler(request(body));assert.equal(good.status,200);
 assert.equal(good.headers.get("cache-control"),"no-store, max-age=0");
 const text=await good.text();assert.ok(!text.includes(env.OHANA_CF_TURN_API_TOKEN));
 assert.equal(JSON.parse(text).data.iceServers[0].urls,credential.urls[0]);assert.equal(calls,1);
 const snapshot=await service.poll(body.roomId,body.identity);
 assert.ok(!JSON.stringify(snapshot).includes("temporary-credential"));
});

test("credentials are reused across handler instances until near expiry",async()=>{
 const {service,body}=await room(),store=new Store();let at=1800000000000,calls=0;
 const options={service,body,store,env,now:()=>at,fetchImpl:async()=>{calls++;return provider();}};
 const first=await getRtcConfig(options),second=await getRtcConfig({...options});
 assert.deepEqual(second,first);assert.equal(calls,1);
 at=first.expiresAt-30000;await getRtcConfig(options);assert.equal(calls,2);
 assert.equal([...store.entries.keys()].filter(k=>k.startsWith("budget:")).length,1,"fixed slot is reused in a later window");
});

test("concurrent requests for one player issue credentials at most once",async()=>{
 const {service,body}=await room(),store=new Store();let calls=0;
 const results=await Promise.allSettled(Array.from({length:8},()=>getRtcConfig({service,body,store,env,fetchImpl:async()=>{calls++;return provider();}})));
 assert.equal(calls,1);assert.ok(results.some(r=>r.status==="fulfilled"));
 assert.ok(results.filter(r=>r.status==="rejected").every(r=>r.reason.status===429));
});

test("global provider budget is enforced across distinct players and function instances",async()=>{
 const store=new Store();let calls=0;
 const service={poll:async(roomId,identity)=>({roomId,players:[{isYou:true,connected:true}]})};
 for(let n=0;n<30;n++)await getRtcConfig({service,store,env,body:{roomId:"ABC234",identity:{playerId:"player-"+n}},now:()=>1800000000000,fetchImpl:async()=>{calls++;return provider();}});
 await assert.rejects(getRtcConfig({service,store,env,body:{roomId:"ABC234",identity:{playerId:"overflow"}},now:()=>1800000000000,fetchImpl:provider}),e=>e.code==="RTC_RATE_LIMIT");
 assert.equal(calls,30);assert.equal([...store.entries.keys()].filter(k=>k.startsWith("budget:")).length,30);
});

test("provider outage is cached briefly; unconfigured deployments make no provider requests",async()=>{
 const {service,body}=await room(),store=new Store();let calls=0;
 const options={service,body,store,env,fetchImpl:async()=>{calls++;throw Error("provider offline");}};
 assert.equal((await getRtcConfig(options)).status,"unavailable");
 assert.equal((await getRtcConfig(options)).status,"unavailable");assert.equal(calls,1);
 assert.equal((await getRtcConfig({...options,env:{}})).status,"not-configured");assert.equal(calls,1);
});

test("an offer arriving during TURN setup remains eligible for the next game tick",()=>{
 const coop=new onlineCoop.constructor(),received=[];
 coop.enabled=true;coop.identity={playerId:"you"};coop.remote={playerId:"peer"};
 const payload={action:"rtc",kind:"offer",sid:"session-0001"};
 coop.snapshot={combat:{events:[{id:"offer-1",kind:"online-signal",senderPlayerId:"peer",signalKind:"action",payload}]}};
 coop.consumeSignals({roomId:"hub"});assert.equal(coop.seenSignals.size,0);
 coop.direct={signal:p=>received.push(p)};
 coop.consumeSignals({roomId:"hub"});coop.consumeSignals({roomId:"hub"});
 assert.deepEqual(received,[payload]);
});
