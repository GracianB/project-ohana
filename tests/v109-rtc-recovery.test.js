import test from "node:test";
import assert from "node:assert/strict";
import {rtcFresh,rtcReconnectDelay,rtcCanRetry,RTC_STALE_MS} from "../systems/coop-v109-recovery.js";
import fs from "node:fs";

test("V109: RTC status reflects real incoming data, not just an OPEN socket",()=>{
 assert.equal(RTC_STALE_MS,4500);
 assert.equal(rtcFresh(true,1000,800,1100),true);
 assert.equal(rtcFresh(true,1000,800,5500),false);
 assert.equal(rtcFresh(true,0,1000,1200),true);
 assert.equal(rtcFresh(true,0,1000,5600),false);
 assert.equal(rtcFresh(false,2000,1000,2100),false);
});
test("V109: bounded reconnect avoids Netlify signaling storms",()=>{
 assert.equal(rtcReconnectDelay(0),16000);
 assert.equal(rtcReconnectDelay(1),27000);
 assert.equal(rtcReconnectDelay(2),45000);
 assert.equal(rtcReconnectDelay(200),45000);
 assert.equal(rtcCanRetry({now:19000,at:16000,peer:true}),true);
 assert.equal(rtcCanRetry({now:1000,at:16000,peer:true}),false);
 assert.equal(rtcCanRetry({now:19000,at:16000,peer:true,connected:true}),false);
 assert.equal(rtcCanRetry({now:19000,at:16000,peer:true,hidden:true}),false);
 assert.equal(rtcCanRetry({now:19000,at:16000,peer:true,lobby:true}),false);
});
test("V109: negotiation bypasses world filter and new authenticated SDP rebuilds the answerer",()=>{
 const coop=fs.readFileSync("systems/online-coop.js","utf8");
 const rtc=fs.readFileSync("systems/coop-v108-direct.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 assert.match(coop,/const rtc=event\.signalKind==="action"&&event\.payload\?\.action==="rtc"/);
 assert.match(coop,/if \(!rtc && event\.signalKind !== "room"/);
 assert.match(coop,/repairDirect\(game\)/);
 assert.match(coop,/this\.direct\?\.ping\(\)/);
 assert.match(coop,/coopRttDirect/);
 assert.match(rtc,/this\.sessionId!==assembled\.sid/);
 assert.match(rtc,/this\.priorOffers\.add\(this\.sessionId\)/);
 assert.match(rtc,/this\.pendingPing=\{id,sent:now\}/);
 assert.match(sw,/coop-v109-recovery\.js\?v=/);
 assert.match(sw,/const VERSION = "ohana-314"/);
 assert.match(html,/ohana-314/);
});

test("V109: guest rebuilds its prior RTCPeerConnection for an authenticated new offer",async()=>{
  const {DirectPeerLink}=await import("../systems/coop-v108-direct.js");
  const pcs=[];
  class RTC{
    iceGatheringState="complete";
    connectionState="new";
    localDescription=null;remoteDescription=null;
    constructor(){pcs.push(this);}
    createAnswer(){return Promise.resolve({type:"answer",sdp:"v=0\\nanswer"});}
    setRemoteDescription(d){this.remoteDescription=d;return Promise.resolve();}
    setLocalDescription(d){this.localDescription=d;return Promise.resolve();}
    close(){this.connectionState="closed";}
  }
  const sent=[];
  const link=new DirectPeerLink({initiator:false,RTC,relay:d=>sent.push(d)});
  assert.equal(await link.start(),true);
  const first=(await import("../systems/coop-v108-direct.js")).splitDirectDescription("offer","session-0001","v=0\\nfirst");
  for(const p of first)await link.signal(p);
  assert.equal(pcs.length,1);
  assert.equal(pcs[0].remoteDescription?.type,"offer");
  const second=(await import("../systems/coop-v108-direct.js")).splitDirectDescription("offer","session-0002","v=0\\nsecond");
  for(const p of second)await link.signal(p);
  assert.equal(pcs.length,2,"new offer must replace the old answerer, not call setRemoteDescription on it");
  assert.equal(pcs[0].connectionState,"closed");
  assert.equal(link.sessionId,"session-0002");
  assert.ok(sent.some(x=>x.kind==="answer"&&x.sid==="session-0002"));
  link.close();
});
test("V109: P2P latency is measured by round trip of ping/pong, not guessed from Netlify",async()=>{
  const {DirectPeerLink}=await import("../systems/coop-v108-direct.js");
  let now=2000;const samples=[];
  const link=new DirectPeerLink({now:()=>now,onState:()=>{},RTC:class Fake{},initiator:true});
  link.onMetrics=ms=>samples.push(ms);
  const channel=label=>({label,readyState:"open",bufferedAmount:0,sent:[],send(x){this.sent.push(JSON.parse(x));},close(){this.readyState="closed";}});
  const pose=channel("poses"),events=channel("events");
  link._attach(pose);link._attach(events);
  assert.equal(link.ping(),true);
  const id=events.sent.at(-1).id;
  assert.equal(events.sent.at(-1).t,"ping");
  now+=45;
  events.onmessage({data:JSON.stringify({t:"pong",id})});
  assert.equal(link.directRttMs,45);
  assert.deepEqual(samples,[45]);
  assert.equal(link.ping(),false,"must limit keepalive packets");
  now+=1550;
  assert.equal(link.ping(),true);
  events.onmessage({data:JSON.stringify({t:"ping",id:99})});
  assert.equal(events.sent.at(-1).t,"pong","incoming ping is answered on the reliable channel");
  link.close();
});
