import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {safeDirectPose,splitDirectDescription,createDirectAssembler,DirectPeerLink,REALTIME_POSE_MS} from "../systems/coop-v108-direct.js";

const frame=(seq=1)=>({t:"pose",seq,x:420,y:970,room:"hub",vx:3,vy:0,facing:1,evo:2,grounded:true,melee:0,dash:0});
test("V108: fast-lane pose accepts bounded human movement but never invalid remote state",()=>{
 assert.equal(REALTIME_POSE_MS,50);
 assert.equal(safeDirectPose(frame(1),0)?.x,420);
 assert.equal(safeDirectPose(frame(1),1),null,"duplicate packet cannot rewind");
 assert.equal(safeDirectPose({...frame(2),x:NaN},1),null);
 assert.equal(safeDirectPose({...frame(2),x:99999},1),null);
 assert.equal(safeDirectPose({...frame(2),room:"../../evil"},1),null);
 assert.equal(safeDirectPose({...frame(2),seq:1.4},1),null);
 assert.equal(safeDirectPose({...frame(2),vx:999,vy:-999},1)?.vx,45);
 assert.equal(safeDirectPose({...frame(2),vx:999,vy:-999},1)?.vy,-65);
 assert.equal(safeDirectPose({...frame(2),health:100000},1)?.health,undefined,"network poses cannot write authoritative HP");
});
test("V108: Netlify relay carries multi-part negotiated SDP without dropping or accepting tampered frames",()=>{
 const sid="ab1234d5",sdp="v=0\n"+"a=sctp-port:5000\n".repeat(820);
 const parts=splitDirectDescription("offer",sid,sdp);
 assert.ok(parts.length>=2);
 assert.ok(parts.every(p=>p.action==="rtc"&&JSON.stringify({...p,roomId:"hub"}).length<12400));
 const a=createDirectAssembler();
 assert.equal(a.accept(parts.at(-1)),null);
 for(const p of parts.slice(0,-1)){
   const last=a.accept(p);
   if(p===parts.at(-2))assert.deepEqual(last,{kind:"offer",sid,sdp});
   else assert.equal(last,null);
 }
 assert.deepEqual(splitDirectDescription("offer",sid,"".padEnd(50000,"x")),[]);
 assert.equal(a.accept({...parts[0],part:99}),null);
 assert.equal(a.accept({...parts[0],kind:"control"}),null);
 assert.equal(a.accept({...parts[0],sid:"fake<script>"}),null);
});
test("V108: direct pose delivery bypasses server heartbeat without changing room authority",()=>{
 let ms=1000,received=[],events=[],states=[];
 const link=new DirectPeerLink({initiator:true,RTC:class FakeRTC{},now:()=>ms,
  onPose:p=>received.push(p),onEvent:e=>events.push(e),onState:s=>states.push(s)});
 const makeChannel=label=>({label,readyState:"open",bufferedAmount:0,sent:[],
  send(data){this.sent.push(JSON.parse(data));},close(){this.readyState="closed";}});
 const pose=makeChannel("poses"),actions=makeChannel("events");
 link._attach(pose);link._attach(actions);
 assert.equal(link.active,true);
 assert.deepEqual(states,[true]);
 const game={roomId:"hub",player:{x:400,y:1000,vx:3,vy:0,facing:1,evo:1,grounded:true}};
 assert.equal(link.sendPose(game),true);
 assert.equal(link.sendPose(game),false);
 ms+=REALTIME_POSE_MS;
 assert.equal(link.sendPose(game),true);
 assert.equal(pose.sent.length,2);
 pose.onmessage({data:JSON.stringify(frame(2))});
 pose.onmessage({data:JSON.stringify(frame(1))});
 assert.deepEqual(received.map(x=>x.seq),[2],"out-of-order datagrams are dropped");
 assert.equal(link.sendEvent("action",{action:"attack"}),true);
 assert.equal(link.sendEvent("room",{roomId:"beach"}),true);
 actions.onmessage({data:JSON.stringify({t:"event",kind:"action",payload:{action:"attack"}})});
 assert.equal(events.length,1);
 link.close();
 assert.equal(link.active,false);
 assert.equal(link.sendPose(game),false);
});
test("V108: full app uses WebRTC with honest degraded Netlify fallback; keeps every original contract",()=>{
 const coop=fs.readFileSync("systems/online-coop.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const e2e=fs.readFileSync("tests/browser/multiplayer-e2e.mjs","utf8");
 assert.match(coop,/new DirectPeerLink/);
 assert.match(coop,/this\.direct\?\.sendPose\(game\)/);
 assert.match(coop,/this\.direct\?\.sendEvent/);
 assert.match(coop,/this\.direct\.signal\(event\.payload\)/);
 assert.match(coop,/freshDirect/);
 assert.match(coop,/dataset\.coopTransport=direct\?"direct":"server"/);
 assert.match(coop,/SERVIDOR \(CON RETRASO\)/);
 assert.match(coop,/const pacing=networkPacing/);
 assert.match(coop,/shouldUseSnapshot\(this\.snapshot,snapshot\)/);
 assert.match(coop,/this\.pendingMutations\.sort/);
 assert.match(coop,/ohana-coop-session/);
 assert.match(sw,/systems\/coop-v108-direct\.js\?v=/);
 assert.match(sw,/const VERSION = "ohana-315"/);
 assert.match(html,/ohana-315/);
 assert.match(e2e,/coopTransport/);
});

test("V116: closed RTC channels never crash the game loop or lose pose sequence",()=>{
 let ms=2000;
 const link=new DirectPeerLink({initiator:true,RTC:class FakeRTC{},now:()=>ms});
 const channel=label=>({label,readyState:"open",bufferedAmount:0,throws:true,
  send(){if(this.throws)throw new Error("channel closed mid-frame");},close(){this.readyState="closed";}});
 const pose=channel("poses"),events=channel("events");
 link._attach(pose);link._attach(events);
 const game={roomId:"hub",player:{x:420,y:970,vx:1,vy:0,facing:1,evo:2,grounded:true}};
 assert.equal(link.sendPose(game),false);
 assert.equal(link.nextSeq,0);
 assert.equal(link.lastPoseAt,0);
 assert.equal(link.sendEvent("action",{action:"attack"}),false);
 assert.equal(link.ping(),false);
 assert.equal(link.pendingPing,null);
 pose.throws=false;events.throws=false;
 assert.equal(link.sendPose(game),true);
 assert.equal(link.nextSeq,1);
 assert.equal(link.sendEvent("action",{action:"attack"}),true);
 ms+=1500;
 assert.equal(link.ping(),true);
});
