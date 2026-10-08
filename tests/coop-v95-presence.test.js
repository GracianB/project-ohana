import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { V95_PRESENCE, remotePresenceCorrection } from "../systems/coop-v95-presence.js";
import { remoteMotionSample } from "../systems/coop-resilience.js";

test("V95 interpolation leads only while incoming packets are recent",()=>{
 const old={targetX:50,targetY:100,sampleAt:820};
 const update=remoteMotionSample(old,140,118,1000,false);
 const remote={...update,x:50,y:100};
 const live=remotePresenceCorrection(remote,1000);
 assert.ok(live.x>140&&live.x<=140+V95_PRESENCE.maxLeadPx);
 assert.ok(live.y>118);
 assert.equal(live.opacity,1);
 assert.equal(live.stale,false);
 assert.ok(live.blend>=.16&&live.blend<=.36);
 const end=remotePresenceCorrection(remote,1800);
 assert.equal(end.x,140,"Old packets should not extrapolate endlessly");
 assert.equal(end.y,118);
});
test("V95 packet gaps become a delayed-signal indicator, not a false disconnect",()=>{
 const r={targetX:140,targetY:120,previousX:30,previousY:60,
  sampleAt:1000,previousSampleAt:820,x:140,y:120};
 const late=remotePresenceCorrection(r,2000);
 assert.equal(late.stale,true);
 assert.ok(late.opacity<1);
 assert.ok(late.opacity>=V95_PRESENCE.minAlpha);
 const fading=remotePresenceCorrection(r,3600);
 assert.equal(fading.opacity,V95_PRESENCE.minAlpha);
 assert.equal(fading.x,140);
 assert.equal(fading.y,120);
 assert.equal(remotePresenceCorrection({...r,sampleAt:3600},3600).stale,false,
  "New packets must restore presence immediately");
});
test("V95 teleports, invalid timestamps and network jitter never produce NaN",()=>{
 const r=remoteMotionSample({targetX:1,targetY:2,sampleAt:900},1000,2000,1000,true);
 const correction=remotePresenceCorrection({...r,x:1000,y:2000},1100);
 assert.equal(correction.x,1000);
 assert.equal(correction.y,2000);
 for(const values of [
  {x:0,y:0,targetX:Infinity,targetY:NaN,sampleAt:Infinity,previousSampleAt:NaN},
  {x:5,y:8,targetX:5,targetY:8,previousX:-99999,previousY:99999,sampleAt:1000,previousSampleAt:999},
  null,
 ]){
  const c=remotePresenceCorrection(values,1000);
  for(const n of [c.x,c.y,c.opacity,c.blend,c.age,c.sampleDt])
   assert.ok(Number.isFinite(n));
  assert.ok(c.blend<=.36);
  assert.ok(c.opacity>=V95_PRESENCE.minAlpha);
 }
});
test("V95 protocol, physics and character data remain unchanged",()=>{
 const online=fs.readFileSync("systems/online-coop.js","utf8");
 assert.match(online,/remotePresenceCorrection\(this.remote, now\)/);
 assert.match(online,/SEÑAL RETRASADA/);
 assert.match(online,/this\.remote\.signalWeak/);
 assert.match(online,/coopRetryDelay/);
 assert.match(online,/this\.seenSignals\.clear\(\)/);
 assert.doesNotMatch(fs.readFileSync("systems/coop-v95-presence.js","utf8"),
  /Math\.random|setInterval|fetch\(|requestAnimationFrame|localStorage/);
});
test("V95 release is completely cached without losing V93 V94 and V90",()=>{
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(sw,/const VERSION = "ohana-295"/);
 assert.match(html,/ohana-295/);
 for(const path of ["coop-v95-presence","boss-v94-readability",
  "cuerno-v93-metamorphosis","cuerno-v92-resonance","dino-stagecraft"]){
  assert.ok(sw.includes(path+".js?v="),path+" missing from offline cache");
 }
});
