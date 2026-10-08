import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { coopRetryDelay,remoteMotionSample } from "../systems/coop-resilience.js";
import {packSave,unpackSave,sanitizeDragonTrial} from "../systems/save.js";
test("V89 retry delay is bounded, increasing and no immediate retry storm",()=>{
 assert.equal(coopRetryDelay(1),200);
 assert.equal(coopRetryDelay(2),400);
 assert.ok(coopRetryDelay(6)<=3600);
 assert.ok(coopRetryDelay(Infinity)<=3600);
 const src=fs.readFileSync("systems/online-coop.js","utf8");
 assert.doesNotMatch(src,/queueMicrotask\(\(\) => this\.drainMutations/);
 assert.match(src,/performance\.now\(\) < this\.retryAfter/);
 assert.match(src,/this\.seenSignals\.clear\(\)/);
});
test("V89 remote target uses previous sample and teleports across distant rooms",()=>{
 const old={targetX:100,targetY:200,sampleAt:1000};
 const close=remoteMotionSample(old,150,210,1180,false);
 assert.equal(close.previousX,100);
 assert.equal(close.previousY,200);
 assert.equal(close.previousSampleAt,1000);
 assert.equal(close.teleport,false);
 const far=remoteMotionSample(old,1000,300,1180,false);
 assert.equal(far.previousX,1000);
 assert.equal(far.teleport,true);
 const room=remoteMotionSample(old,110,210,1180,true);
 assert.equal(room.teleport,true);
});
test("V89 saves only sanitized, completed embers; no partial AFK charge",()=>{
 assert.equal(sanitizeDragonTrial({lit:[true,false,true],charge:999}).count,2);
 assert.equal(sanitizeDragonTrial({lit:[true]}),null);
 const game={roomId:"volcano",visited:{hub:true,volcano:true},player:{id:"dragon",evo:4},dragonTrial:{lit:[true,true,false],charge:29}};
 const restored=unpackSave(packSave(game,{snapshot(){return null}}),"dragon");
 assert.deepEqual(restored.dragonTrial.lit,[true,true,false]);
 assert.equal(restored.dragonTrial.charge,0);
 assert.equal(restored.dragonTrial.completed,false);
});
test("V89 precaches resilience and deploys version increment",()=>{
 const sw=fs.readFileSync("sw.js","utf8"),html=fs.readFileSync("index.html","utf8");
 assert.match(sw,/const VERSION = "ohana-289"/);
 assert.match(sw,/systems\/coop-resilience\.js\?v=/);
 assert.match(html,/ohana-289/);
});
