import test from "node:test";
import assert from "node:assert/strict";
import {DirectPeerLink,splitDirectDescription,safeIceCandidate,isRtcCandidateSignal,ICE_GATHER_WAIT_MS} from "../systems/coop-v108-direct.js";
import {onlineCoop} from "../systems/online-coop.js";
import {createRoomService} from "../netlify/lib/room-service.mjs";

const candidate=(n=1)=>({candidate:`candidate:${n} 1 udp 2113937151 192.0.2.${n} 5000 typ host`,sdpMid:"0",sdpMLineIndex:0});
const packet=(sid="session-0001",n=1)=>({action:"rtc",kind:"candidates",sid,candidates:[candidate(n)]});
class RTC {
 iceGatheringState="complete";connectionState="new";localDescription=null;remoteDescription=null;
 added=[];listeners=new Map();
 createOffer(){return Promise.resolve({type:"offer",sdp:"v=0\r\na=ice-options:trickle\r\n"});}
 createAnswer(){return Promise.resolve({type:"answer",sdp:"v=0\r\na=ice-options:trickle\r\n"});}
 setLocalDescription(d){this.localDescription=d;return Promise.resolve();}
 setRemoteDescription(d){this.remoteDescription=d;return Promise.resolve();}
 addIceCandidate(c){assert.ok(this.remoteDescription);this.added.push(c);return Promise.resolve();}
 createDataChannel(label){return {label,readyState:"connecting",close(){this.readyState="closed";}};}
 addEventListener(name,fn){this.listeners.set(name,fn);}
 removeEventListener(name){this.listeners.delete(name);}
 close(){this.connectionState="closed";}
}

test("late ICE candidates survive the bounded SDP wait and stay within authenticated signal limits",async t=>{
 t.mock.timers.enable({apis:["setTimeout"]});
 const sent=[],link=new DirectPeerLink({initiator:true,RTC,relay:m=>sent.push(m)});
 link._makeConnection();link.sessionId="session-0001";
 const pc=link.pc;pc.iceGatheringState="gathering";
 pc.localDescription=await pc.createOffer();
 const publish=link._publish("offer");
 t.mock.timers.tick(ICE_GATHER_WAIT_MS-1);await Promise.resolve();
 assert.equal(sent.length,0);
 t.mock.timers.tick(1);await publish;
 assert.equal(sent[0].kind,"offer");
 for(let n=1;n<=9;n++)pc.onicecandidate({candidate:{toJSON:()=>candidate(n)}});
 t.mock.timers.tick(120);
 const batches=sent.filter(m=>m.kind==="candidates");
 assert.equal(batches.flatMap(m=>m.candidates).length,9);
 assert.ok(batches.every(m=>isRtcCandidateSignal({...m,roomId:"volcano"})));
 pc.onicecandidate({candidate:candidate(1)});t.mock.timers.tick(120);
 assert.equal(sent.filter(m=>m.kind==="candidates").length,batches.length,"duplicate browser event adds no POST");
 link.close();
 assert.equal(pc.listeners.size,0);
});

test("complete gathering sends one SDP and avoids redundant candidate requests",async()=>{
 const sent=[],link=new DirectPeerLink({initiator:true,RTC,relay:m=>sent.push(m)});
 link._makeConnection();link.sessionId="session-0001";
 link.pc.onicecandidate({candidate:candidate()});
 link.pc.localDescription={type:"offer",sdp:`v=0\r\na=${candidate().candidate}\r\n`};
 await link._publish("offer");
 assert.equal(sent.length,1);assert.equal(sent[0].kind,"offer");
 link.close();
});

test("candidate arrival before SDP is buffered, deduplicated and applied after remote description",async()=>{
 const link=new DirectPeerLink({RTC});await link.start();
 assert.equal(await link.signal(packet()),true);
 assert.equal(await link.signal(packet()),true);
 assert.equal(link.pc.added.length,0);
 const offer=splitDirectDescription("offer","session-0001","v=0\r\n")[0];
 await link.signal(offer);
 assert.deepEqual(link.pc.added,[candidate()]);
 await link.signal(packet());assert.equal(link.pc.added.length,1);
 const old=link.pc;
 await link.signal(packet("session-0002"));
 await link.signal(splitDirectDescription("offer","session-0002","v=0\r\n")[0]);
 assert.notEqual(link.pc,old);
 assert.equal(await link.signal(packet()),false,"old session cannot add ICE to the replacement");
 assert.deepEqual(link.pc.added,[candidate()],"candidate deduplication belongs to its session, not the old connection");link.close();
});

test("a single poll containing offer and candidates cannot race asynchronous SDP installation",async()=>{
 let unblock,entered;
 const started=new Promise(resolve=>{entered=resolve;});
 class SlowRTC extends RTC {
  async setRemoteDescription(d){entered();await new Promise(resolve=>{unblock=resolve;});this.remoteDescription=d;}
 }
 const link=new DirectPeerLink({RTC:SlowRTC});await link.start();
 const offer=link.signal(splitDirectDescription("offer","session-0001","v=0\r\n")[0]);
 await started;
 const ice=link.signal(packet());
 assert.equal(link.pc.added.length,0);unblock();
 assert.equal(await offer,true);assert.equal(await ice,true);
 assert.equal(link.pc.added.length,1);link.close();
});

test("closing during ICE gathering cancels timers and cannot publish an obsolete offer",async()=>{
 const sent=[],link=new DirectPeerLink({initiator:true,RTC,relay:m=>sent.push(m)});
 link._makeConnection();link.sessionId="session-0001";
 const pc=link.pc;pc.iceGatheringState="gathering";pc.localDescription=await pc.createOffer();
 const publish=link._publish("offer");link.close();await publish;
 assert.deepEqual(sent,[]);assert.equal(pc.listeners.size,0);
 pc.onicecandidate({candidate:candidate()});assert.equal(link.localCandidates.length,0);
});

test("malformed candidate messages and unbounded unknown sessions cannot grow the queue",async()=>{
 assert.equal(safeIceCandidate({...candidate(),candidate:"candidate:x\r\na=ice-pwd:evil"}),null);
 assert.equal(safeIceCandidate({...candidate(),sdpMid:null,sdpMLineIndex:null}),null);
 assert.equal(safeIceCandidate({...candidate(),sdpMLineIndex:99}),null);
 assert.equal(isRtcCandidateSignal({...packet(),candidates:Array(5).fill(candidate())}),false);
 assert.equal(isRtcCandidateSignal({...packet(),sid:"<script>"}),false);
 assert.equal(safeIceCandidate({...candidate(),credential:"secret"}).credential,undefined);
 const link=new DirectPeerLink({RTC});await link.start();
 for(let n=1;n<=10;n++)await link.signal(packet("session-000"+n));
 assert.equal(link.remoteCandidates.size,4);
 for(let n=1;n<=90;n++)await link.signal(packet("session-0001",n));
 assert.ok(link.remoteCandidates.get("session-0001").length<=64);link.close();
});

test("stats report TURN only for a selected relay route and expose no network identifiers",async()=>{
 let now=1000,calls=0;const routes=[];
 const link=new DirectPeerLink({RTC,now:()=>now});link._makeConnection();
 link._attach({label:"poses",readyState:"open",close(){}});
 link._attach({label:"events",readyState:"open",close(){}});
 link.onRoute=r=>routes.push(r);
 link.pc.getStats=async()=>{calls++;return new Map([
  ["t",{type:"transport",selectedCandidatePairId:"selected"}],
  ["unused",{type:"candidate-pair",state:"succeeded",localCandidateId:"relay",remoteCandidateId:"remote"}],
  ["selected",{type:"candidate-pair",state:"succeeded",localCandidateId:"local",remoteCandidateId:"remote"}],
  ["local",{candidateType:"host",address:"192.0.2.1"}],
  ["remote",{candidateType:"relay",address:"192.0.2.2"}],
 ]);};
 await link.sampleRoute();assert.deepEqual(routes,["relay"]);
 await link.sampleRoute();assert.equal(calls,1);
 now+=5000;await link.sampleRoute();assert.equal(calls,2);
 assert.equal(JSON.stringify(routes).includes("192.0.2"),false);link.close();
});

test("an answerer never destroys its connection while waiting for the host recovery offer",()=>{
 const coop=new onlineCoop.constructor();let closed=0;
 coop.enabled=true;coop.remote={playerId:"peer"};
 coop.direct={available:true,initiator:false,active:false,close(){closed++;}};
 assert.equal(coop.repairDirect({},100000),false);assert.equal(closed,0);
});

test("peer replacement discards old direct state and queued signaling",()=>{
 const coop=new onlineCoop.constructor();let closed=0;
 coop.enabled=true;coop.remote={playerId:"old-peer"};coop.direct={close(){closed++;}};
 coop.directAttempted=true;coop.pendingMutations=[{payload:{action:"rtc"}},{action:"move"}];
 coop.updateRemote({players:[{playerId:"new-peer",connected:true,characterId:"cat",x:200,y:1000}]},{});
 assert.equal(closed,1);assert.equal(coop.direct,null);assert.equal(coop.directAttempted,false);
 assert.equal(coop.remote.playerId,"new-peer");assert.deepEqual(coop.pendingMutations,[{action:"move"}]);
});

class Store {
 entries=new Map();i=0;
 async getWithMetadata(key){const e=this.entries.get(key);return e?{data:structuredClone(e.data),etag:e.etag}:null;}
 async setJSON(key,data,options={}){
  const old=this.entries.get(key);
  if(options.onlyIfNew&&old||options.onlyIfMatch&&old?.etag!==options.onlyIfMatch)return {modified:false};
  const etag=String(++this.i);this.entries.set(key,{data:structuredClone(data),etag});return {modified:true,etag};
 }
}
test("real room service authenticates and relays late ICE while rejecting malformed RTC payloads",async()=>{
 const service=createRoomService(new Store());
 const host=await service.create(),guest=await service.join(host.roomId);
 await service.choose(host.roomId,host.identity,"kilo");await service.choose(host.roomId,guest.identity,"cat");
 await service.ready(host.roomId,host.identity);await service.ready(host.roomId,guest.identity);
 const body={sequence:1,actionId:"late-ice-1",signalKind:"action",payload:{...packet(),roomId:"hub"}};
 await service.signal(host.roomId,host.identity,body);
 const snapshot=await service.poll(host.roomId,guest.identity);
 assert.ok(snapshot.combat.events.some(e=>e.senderPlayerId===host.identity.playerId&&e.payload?.kind==="candidates"));
 await assert.rejects(service.signal(host.roomId,{...host.identity,token:"wrong"},{...body,sequence:2,actionId:"late-ice-2"}));
 for(const payload of [{...packet(),candidates:[{}]},{action:"rtc",kind:"unknown"},{...packet(),candidates:Array(5).fill(candidate())}]){
  await assert.rejects(service.signal(host.roomId,host.identity,{...body,sequence:2,actionId:"invalid-ice",payload}),e=>e.code==="INVALID_SIGNAL");
 }
});

test("TURN credential lookup has a short deadline without lowering normal game request timeout",async()=>{
 const {readFileSync}=await import("node:fs");
 const source=readFileSync(new URL("../systems/online-coop.js",import.meta.url),"utf8");
 assert.match(source,/async function post\(body,timeoutMs=10000\)/);
 assert.match(source,/setTimeout\(\(\)=>abort\.abort\(\), timeoutMs\)/);
 assert.match(source,/post\(\{action:"rtc-config",roomId,identity\},1800\)/);
});

test("routine HTTP polling yields to pending/in-flight mutations, but recovery polls remain allowed",async()=>{
 const coop=new onlineCoop.constructor();
 coop.enabled=true;coop.roomId="ABCDEF";coop.identity={playerId:"local",token:"secret"};
 coop.pendingMutations=[{action:"move"}];coop.mutationBusy=false;
 // Do not issue a network request or mutate lastPoll while a move is pending.
 const previousFetch=globalThis.fetch;
 globalThis.fetch=()=>{throw new Error("redundant poll")};
 try {
  await coop.poll({},false);
  assert.equal(coop.polling,false);
  assert.equal(coop.lastPoll,0);
  coop.pendingMutations=[];
  coop.mutationBusy=true;
  await coop.poll({},false);
  assert.equal(coop.polling,false);
  assert.equal(coop.lastPoll,0);
 }finally{globalThis.fetch=previousFetch;}
});
